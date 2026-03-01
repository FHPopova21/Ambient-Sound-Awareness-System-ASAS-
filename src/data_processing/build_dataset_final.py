import os
import shutil
import pandas as pd
from tqdm import tqdm
import glob
import random
import librosa
import numpy as np
import soundfile as sf

# Дефинираме път към конфигурациите
URBAN_CSV = "data/raw/Urban8K/UrbanSound8K.csv"
URBAN_AUDIO_DIR = "data/raw/Urban8K/"

ESC50_CSV = "data/raw/ESC50/esc50.csv"
ESC50_AUDIO_DIR = "data/raw/ESC50/"

FINAL_DATASET_DIR = "data/Dataset_Final"

# Целеви брой файлове за балансиране
TARGET_COUNTS = {
    "Background": 700,
    "Construction": 700,
    "Dog_Bark": 700,
    "Siren_Alarm": 700
}

# Класове за Аугментация (х10)
AUGMENT_CLASSES = ["Baby_Cry", "Door_Signal", "Glass_Break"]

# Класове за UrbanSound8K -> ClassID
URBAN_MAP = {
    0: "Background",
    1: "Car_Horn",
    3: "Dog_Bark",
    4: "Construction",
    5: "Background",
    7: "Construction",
    8: "Siren_Alarm"
}

# Класове за ESC-50 -> ClassID
ESC50_MAP = {
    10: "Background",
    11: "Background",
    12: "Background",
    13: "Background",
    14: "Background",
    15: "Background",
    16: "Background",
    20: "Baby_Cry",
    30: "Door_Signal",
    39: "Glass_Break",
    42: "Siren_Alarm"
}

def create_folders():
    classes = [
        "Baby_Cry", "Background", "Car_Horn", 
        "Construction", "Dog_Bark", "Door_Signal", 
        "Glass_Break", "Siren_Alarm"
    ]
    if os.path.exists(FINAL_DATASET_DIR):
        print(f"Изтриване на съществуващ датасет в {FINAL_DATASET_DIR}...")
        shutil.rmtree(FINAL_DATASET_DIR)
        
    os.makedirs(FINAL_DATASET_DIR)
    for cls in classes:
        os.makedirs(os.path.join(FINAL_DATASET_DIR, cls), exist_ok=True)
    return classes

def get_filtered_data():
    urban_df = pd.read_csv(URBAN_CSV)
    urban_df['target_class'] = urban_df['classID'].map(URBAN_MAP)
    urban_df = urban_df[urban_df['target_class'].notna()].copy()
    
    esc_df = pd.read_csv(ESC50_CSV)
    esc_df['target_class'] = esc_df['target'].map(ESC50_MAP)
    esc_df = esc_df[esc_df['target_class'].notna()].copy()
    
    return urban_df, esc_df

def augment_audio(y, sr, index):
    """Прилага една от 3 техники за аугментация."""
    aug_type = index % 3
    if aug_type == 0: # Time Shift
        shift = int(sr * 0.5 * random.uniform(-1, 1))
        return np.roll(y, shift)
    elif aug_type == 1: # Pitch Shift
        n_steps = random.uniform(-2, 2)
        return librosa.effects.pitch_shift(y, sr=sr, n_steps=n_steps)
    else: # Noise Injection
        noise_amp = 0.005 * np.random.uniform() * np.amax(y)
        return y + noise_amp * np.random.normal(size=y.shape[0])

def balance_and_augment():
    urban_df, esc_df = get_filtered_data()
    print("\n--- Балансиране и Аугментация ---")
    
    combined_data = []
    for _, row in urban_df.iterrows():
        src = os.path.join(URBAN_AUDIO_DIR, f"fold{row['fold']}", row['slice_file_name'])
        combined_data.append({'src': src, 'class': row['target_class'], 'name': f"us8k_{row['slice_file_name']}"})
        
    for _, row in esc_df.iterrows():
        src = os.path.join(ESC50_AUDIO_DIR, row['filename'])
        combined_data.append({'src': src, 'class': row['target_class'], 'name': f"esc50_{row['filename']}"})
        
    df = pd.DataFrame(combined_data)
    
    for cls in df['class'].unique():
        cls_items = df[df['class'] == cls]
        dest_folder = os.path.join(FINAL_DATASET_DIR, cls)
        
        # 1. Under-sampling
        if cls in TARGET_COUNTS:
            target = TARGET_COUNTS[cls]
            if len(cls_items) > target:
                print(f"Under-sampling за {cls}: от {len(cls_items)} на {target}")
                cls_items = cls_items.sample(n=target, random_state=42)
        
        # 2. Копиране на оригиналите
        print(f"Копиране на {cls}...")
        for _, item in tqdm(cls_items.iterrows(), total=len(cls_items), leave=False):
            if os.path.exists(item['src']):
                shutil.copy2(item['src'], os.path.join(dest_folder, item['name']))
        
        # 3. Offline Augmentation (за малките класове)
        if cls in AUGMENT_CLASSES:
            print(f"Аугментация за {cls} (х10)...")
            for _, item in tqdm(cls_items.iterrows(), total=len(cls_items), leave=False):
                if os.path.exists(item['src']):
                    y, sr = librosa.load(item['src'], sr=22050)
                    for i in range(9): # Генерираме още 9 версии (общо стават 10)
                        y_aug = augment_audio(y, sr, i)
                        aug_name = f"aug_{i}_{item['name']}"
                        sf.write(os.path.join(dest_folder, aug_name), y_aug, sr)

def verify_dataset(classes):
    print("\n--- Финално разпределение ---")
    total = 0
    for cls in classes:
        folder_path = os.path.join(FINAL_DATASET_DIR, cls)
        count = len(glob.glob(os.path.join(folder_path, "*.wav")))
        print(f"{cls}: {count} файла")
        total += count
    print(f"Общо в Dataset_Final: {total}")

def run_full_build_pipeline():
    """
    Изпълнява целия процес: създаване на папки, филтриране, балансиране и аугментация.
    """
    random.seed(42)
    classes = create_folders()
    urban_df, esc_df = get_filtered_data()
    balance_and_augment()
    verify_dataset(classes)

if __name__ == "__main__":
    run_full_build_pipeline()
