import os
import pandas as pd
import librosa
import soundfile as sf
import numpy as np
import glob
from tqdm import tqdm

# Дефинираме мапване на класовете за да са последователни от 0 до 8 (общо 9 класа)
CLASS_MAPPING = {
    0: (0, 'air_conditioner'),
    1: (1, 'car_horn'),
    2: (2, 'children_playing'),
    3: (3, 'dog_bark'),
    4: (4, 'construction_noise'),  # обединено (преди drilling)
    5: (5, 'engine_idling'),
    # 6: gun_shot -> ТОЗИ КЛАС СЕ ПРЕМАХВА, използваме 6 за Silence!
    7: (4, 'construction_noise'),  # обединено (преди jackhammer)
    8: (7, 'siren'),               # номерът се премества надолу
    9: (8, 'street_music')         # номерът се премества надолу
}
SILENCE_CLASS_ID = 6
SILENCE_CLASS_NAME = 'silence_background'

def preprocess_urbansound(csv_path, source_dir, output_dir, output_csv_path, background_dir=None, target_sr=22050, target_duration=4.0):
    os.makedirs(output_dir, exist_ok=True)
    df = pd.read_csv(csv_path)
    target_samples = int(target_sr * target_duration)
    
    processed_records = []
    print("Започва обработка на аудио файловете от UrbanSound8K...")
    
    for index, row in tqdm(df.iterrows(), total=len(df)):
        file_name = row['slice_file_name']
        fold = row['fold']
        class_id = row['classID']
        
        # 1. МАХАМЕ gun_shot (classID 6)
        if class_id == 6:
            continue
            
        # 2. Обединяване на drilling/jackhammer и преномериране на класовете
        if class_id in CLASS_MAPPING:
            new_id, new_name = CLASS_MAPPING[class_id]
        else:
            continue  # Пропускаме, ако има неясен клас
            
        source_path = os.path.join(source_dir, f"fold{fold}", file_name)
        if not os.path.exists(source_path):
            continue
            
        try:
            audio, sr = librosa.load(source_path, sr=target_sr)
            
            if len(audio) > target_samples:
                audio = audio[:target_samples]
            elif len(audio) < target_samples:
                padding = target_samples - len(audio)
                audio = np.pad(audio, (0, padding), mode='constant')
                
            output_file_path = os.path.join(output_dir, file_name)
            sf.write(output_file_path, audio, target_sr)
            
            processed_records.append({
                'slice_file_name': file_name,
                'classID': new_id,
                'class': new_name,
                'fold': fold,
                'processed_path': output_file_path
            })
            
        except Exception as e:
            print(f"Грешка при обработка на {file_name}: {e}")
            
    # 3. ДОБАВЯНЕ НА SILENCE / BACKGROUND NOISE
    if background_dir and os.path.exists(background_dir):
        print(f"\nЗапочва обработка на фонов шум от папка {background_dir}...")
        bg_files = glob.glob(os.path.join(background_dir, '*.wav')) + glob.glob(os.path.join(background_dir, '*.mp3'))
        
        for i, bg_path in enumerate(tqdm(bg_files)):
            try:
                bg_name = os.path.basename(bg_path)
                audio, sr = librosa.load(bg_path, sr=target_sr)
                
                # Нарязваме дългите файлове на парчета по 4 секунди
                num_chunks = max(1, len(audio) // target_samples)
                
                # Присвояваме ги балансирано по fold-ове (от 1 до 10)
                assigned_fold = (i % 10) + 1 
                
                for chunk_idx in range(num_chunks):
                    start_sample = chunk_idx * target_samples
                    end_sample = start_sample + target_samples
                    chunk_audio = audio[start_sample:end_sample]
                    
                    if len(chunk_audio) < target_samples:
                        padding = target_samples - len(chunk_audio)
                        chunk_audio = np.pad(chunk_audio, (0, padding), mode='constant')
                        
                    out_filename = f"bg_{i}_chunk{chunk_idx}.wav"
                    out_filepath = os.path.join(output_dir, out_filename)
                    sf.write(out_filepath, chunk_audio, target_sr)
                    
                    processed_records.append({
                        'slice_file_name': out_filename,
                        'classID': SILENCE_CLASS_ID,
                        'class': SILENCE_CLASS_NAME,
                        'fold': assigned_fold,
                        'processed_path': out_filepath
                    })
                    
            except Exception as e:
                print(f"Грешка при фонов файл {bg_path}: {e}")
    else:
        print("\nВНИМАНИЕ: Не е подадена директория за 'Background Noise' (или не съществува).")
        print("Съществено е да добавите такава, за да има данни за 'Нищо/Тишина'.")

    new_df = pd.DataFrame(processed_records)
    new_df.to_csv(output_csv_path, index=False)
    print(f"\nОбработката завърши! Новият CSV е запазен в: {output_csv_path}")
    print(f"\nРазпределение на обновените класовете:\n{new_df['class'].value_counts()}")