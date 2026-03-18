import eel
import os
import time
import numpy as np
import sounddevice as sd
import threading
from config import (
    LABELS, LABEL_MAPPING, COOLDOWN_SECONDS, SAMPLE_RATE, 
    WINDOW_DURATION, DEFAULT_SETTINGS, WEB_DIR
)
from model_engine import ModelEngine
from audio_handler import AudioHandler
from utils import get_device_info as fetch_device_info

# Глобални променливи за управление на анализа
is_analyzing = False
analysis_thread = None
app_settings = DEFAULT_SETTINGS.copy()
last_prediction_time = 0

# Инициализация на модулите
engine = ModelEngine()
audio = AudioHandler(engine.device)

def analysis_loop():
    global is_analyzing, last_prediction_time
    print("🔄 Започвам непрекъснат анализ (Без прекъсвания + iOS обработка)...")
    
    window_samples = int(WINDOW_DURATION * SAMPLE_RATE)
    audio_buffer = np.zeros(window_samples)
    
    with sd.InputStream(samplerate=SAMPLE_RATE, channels=1, callback=audio.audio_callback):
        while is_analyzing:
            try:
                # Взимаме новите данни от опашката
                while not audio.audio_q.empty():
                    chunk = audio.audio_q.get().flatten()
                    audio_buffer = np.roll(audio_buffer, -len(chunk))
                    audio_buffer[-len(chunk):] = chunk
                
                # Ако сме в режим на пауза според настройките, само събираме аудио но не смятаме
                if not app_settings["sound_recognition"]:
                    time.sleep(0.1)
                    continue

                # Проверка за период на изчакване (5 сек)
                current_time = time.time()
                if current_time - last_prediction_time < COOLDOWN_SECONDS:
                    time.sleep(0.1)
                    continue

                # Предварителна обработка и предсказание
                processed_audio = audio.preprocess_audio(audio_buffer)
                predicted_idx, confidence = engine.predict(processed_audio)
                
                class_name = LABELS[predicted_idx]
                conf_value = int(confidence * 100)
                
                result = LABEL_MAPPING[class_name]
                threshold_pct = result["threshold"] * 100

                # Филтриране на Фонов шум
                if class_name == "Background":
                    if conf_value > 50:
                        eel.update_ui_result({"status": "quiet"})
                    continue
                
                # Проверка дали звукът е активиран в настройките
                sound_id = result["id"]
                if not app_settings["enabled_sounds"].get(sound_id, True):
                    continue

                # Праг за конкретния клас
                if conf_value < threshold_pct:
                    continue
                
                print(f"📡 Засечено: {result['label']} ({conf_value}%)")
                last_prediction_time = current_time 
                
                eel.update_ui_result({
                    "status": result["type"],
                    "sound_type": result["label"],
                    "confidence": conf_value
                })
                
                time.sleep(0.5)
                
            except Exception as e:
                print(f"Грешка в цикъла: {e}")
                break

@eel.expose
def toggle_continuous_analysis(should_start):
    global is_analyzing, analysis_thread
    
    if should_start and not is_analyzing:
        is_analyzing = True
        analysis_thread = threading.Thread(target=analysis_loop, daemon=True)
        analysis_thread.start()
        print("✅ Анализът е стартиран.")
        return "Started"
    elif not should_start:
        is_analyzing = False
        print("✅ Анализът е спрян.")
        return "Stopped"
    return "No change"

@eel.expose
def get_device_info():
    return fetch_device_info()

@eel.expose
def update_settings(new_settings):
    global app_settings
    app_settings.update(new_settings)
    print(f"⚙️ Настройките бяха обновени: {app_settings}")

# Инициализация на Eel
eel.init(WEB_DIR)

print("🚀 SONAR Windows е зареден и готов!")
try:
    eel.start('index.html', size=(400, 800))
except (SystemExit, MemoryError, KeyboardInterrupt):
    is_analyzing = False
