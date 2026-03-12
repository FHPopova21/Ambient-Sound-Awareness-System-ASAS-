import eel
import os
import sys
import time
import numpy as np
import sounddevice as sd
import torch
import librosa

# Добавяме основната папка на проекта към sys.path, за да можем да импортираме от 'src'
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
if project_root not in sys.path:
    sys.path.append(project_root)

from src.models.mobilenet_model import AudioMobileNetV2

# 1. Зареждане на модела и теглата
# Класовете в реда, в който са били обучени (спрямо build_dataset_final.py)
LABELS = [
    "Baby_Cry", "Background", "Car_Horn", 
    "Construction", "Dog_Bark", "Door_Signal", 
    "Glass_Break", "Siren_Alarm"
]

# Картиране за React UI (id -> label, type, threshold)
LABEL_MAPPING = {
    "Baby_Cry": {"id": "baby_cry", "label": "Плачещо бебе", "type": "warning", "threshold": 0.40},
    "Background": {"id": "background", "label": "Фонов шум", "type": "info", "threshold": 1.00},
    "Car_Horn": {"id": "car_horn", "label": "Клаксон", "type": "danger", "threshold": 0.60},
    "Construction": {"id": "construction", "label": "Ремонтни дейности", "type": "warning", "threshold": 0.85},
    "Dog_Bark": {"id": "dog_bark", "label": "Кучешки лай", "type": "warning", "threshold": 0.85},
    "Door_Signal": {"id": "door_signal", "label": "Звънец / Чукане", "type": "info", "threshold": 0.45},
    "Glass_Break": {"id": "glass_break", "label": "Счупено стъкло", "type": "danger", "threshold": 0.45},
    "Siren_Alarm": {"id": "siren_alarm", "label": "Сирена / Аларма", "type": "danger", "threshold": 0.60}
}

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model = AudioMobileNetV2(n_classes=len(LABELS), pretrained=False)

weights_path = os.path.join(project_root, 'models', 'best_mobilenet.pth')
if os.path.exists(weights_path):
    print(f"Зареждане на тегла от: {weights_path}")
    model.load_state_dict(torch.load(weights_path, map_location=device))
else:
    print(f"ВНИМАНИЕ: Файлът с тегла не е намерен на {weights_path}!")

model.to(device)
model.eval()

def preprocess_audio(y, sr=22050):
    # 1. Duration Fix: 4 секунди
    target_samples = int(4.0 * sr)
    if len(y) > target_samples:
        y = y[:target_samples]
    else:
        y = np.pad(y, (0, target_samples - len(y)), mode='constant')
        
    # 2. Normalization
    rms = np.sqrt(np.mean(y**2))
    if rms > 0.0:
        target_rms = 0.05
        y = y * (target_rms / rms)
        
    # 3. Mel-spectrogram
    S = librosa.feature.melspectrogram(
        y=y, sr=sr, n_fft=2048, hop_length=512, n_mels=128, fmin=0.0, fmax=8000.0
    )
    S_db = librosa.power_to_db(S, ref=1.0)
    
    # 4. Форматиране за модела (Batch, Channel, H, W)
    # MobileNetV2 очаква [B, 1, 128, 173] спрямо hop_length/sr
    tensor = torch.from_numpy(S_db).float()
    tensor = tensor.unsqueeze(0).unsqueeze(0) # [1, 1, 128, 173]
    return tensor.to(device)

import threading

import queue

# Опашка за входящото аудио
audio_q = queue.Queue()

is_analyzing = False
analysis_thread = None

def audio_callback(indata, frames, time, status):
    if status:
        print(f"Грешка в аудио потока: {status}")
    audio_q.put(indata.copy())

def analysis_loop():
    global is_analyzing
    print("🔄 Започвам непрекъснат (gapless) анализ...")
    
    sample_rate = 22050
    window_duration = 4.0 # Анализираме последните 4 секунди
    window_samples = int(window_duration * sample_rate)
    
    # Пълен буфер за анализ
    audio_buffer = np.zeros(window_samples)
    
    # Отваряме InputStream за гаплес запис
    with sd.InputStream(samplerate=sample_rate, channels=1, callback=audio_callback):
        while is_analyzing:
            try:
                # Взимаме всички налични парчета от опашката
                while not audio_q.empty():
                    chunk = audio_q.get()
                    chunk = chunk.flatten()
                    
                    # Плъзгаме прозореца
                    audio_buffer = np.roll(audio_buffer, -len(chunk))
                    audio_buffer[-len(chunk):] = chunk
                
                # Тъй като InputStream е много бърз, анализираме на интервали (напр. 2 пъти в секунда)
                processed_audio = preprocess_audio(audio_buffer, sr=sample_rate)
                
                with torch.no_grad():
                    outputs = model(processed_audio)
                    probabilities = torch.nn.functional.softmax(outputs, dim=1)
                    confidence, predicted_idx = torch.max(probabilities, 1)
                    
                class_name = LABELS[predicted_idx.item()]
                conf_value = int(confidence.item() * 100)
                
                # --- ЛОГИКА ЗА ФИЛТРИРАНЕ ---
                result = LABEL_MAPPING[class_name]
                threshold_pct = result["threshold"] * 100

                # 1. Спираме "Background", за да не спамим UI
                if class_name == "Background":
                    if conf_value > 50: # Сигурни сме, че е тихо
                        eel.update_ui_result({"status": "quiet"})
                    continue
                
                # 2. Праг на конфиденциалност (вече е специфичен за всеки клас!)
                if conf_value < threshold_pct:
                    continue
                
                print(f"📡 Засечено: {result['label']} ({conf_value}%)")
                
                eel.update_ui_result({
                    "status": result["type"],
                    "sound_type": result["label"],
                    "confidence": conf_value
                })
                
                # Изчакваме малко преди следващия анализ, за да не товарим процесора
                time.sleep(0.5)
                
            except Exception as e:
                print(f"Грешка в цикъла на анализ: {e}")
                break

    print("🛑 Анализът спря.")

@eel.expose
def toggle_continuous_analysis(should_start):
    global is_analyzing, analysis_thread
    
    if should_start and not is_analyzing:
        is_analyzing = True
        analysis_thread = threading.Thread(target=analysis_loop, daemon=True)
        analysis_thread.start()
        return "Started"
    elif not should_start:
        is_analyzing = False
        return "Stopped"
    return "No change"

# Намираме React папката
web_dir = os.path.join(os.path.dirname(__file__), '..', 'frontend', 'dist')
eel.init(web_dir)

print("🚀 SONAR е стартиран с MobileNetV2 (Continuous Mode Ready)!")
try:
    # Важно: Задаваме block=False, ако искаме да правим нещо друго, 
    # но в случая eel.start ще блокира, което е OK.
    eel.start('index.html', size=(400, 800))
except (SystemExit, MemoryError, KeyboardInterrupt):
    is_analyzing = False
    print("Програмата е затворена.")
