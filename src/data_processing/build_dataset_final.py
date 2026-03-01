import os
import shutil
import pandas as pd
from tqdm import tqdm
import glob

# Дефинираме път към конфигурациите
URBAN_CSV = "data/raw/Urban8K/UrbanSound8K.csv"
URBAN_AUDIO_DIR = "data/raw/Urban8K/"

ESC50_CSV = "data/raw/ESC50/esc50.csv"
ESC50_AUDIO_DIR = "data/raw/ESC50/"

FINAL_DATASET_DIR = "data/Dataset_Final"

# Класове за UrbanSound8K -> ClassID
# 0 = air_conditioner -> Background
# 1 = car_horn -> Car_Horn
# 3 = dog_bark -> Dog_Bark
# 4 = drilling -> Construction
# 5 = engine_idling -> Background
# 7 = jackhammer -> Construction
# 8 = siren -> Siren_Alarm

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
# 10 = rain          -> Background
# 11 = sea_waves     -> Background
# 12 = crackling_fire-> Background
# 13 = crickets      -> Background
# 14 = chirping_birds-> Background
# 15 = water_drops   -> Background
# 16 = wind          -> Background
# 20 = crying_baby   -> Baby_Cry
# 30 = door_wood_knock -> Door_Signal
# 39 = glass_breaking  -> Glass_Break
# 42 = siren           -> Siren_Alarm

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
    if not os.path.exists(FINAL_DATASET_DIR):
        os.makedirs(FINAL_DATASET_DIR)
        
    for cls in classes:
        os.makedirs(os.path.join(FINAL_DATASET_DIR, cls), exist_ok=True)
    return classes

def copy_urban_data():
    if not os.path.exists(URBAN_CSV):
        print(f"Грешка: Не е намерен UrbanSound CSV на {URBAN_CSV}")
        return
        
    df = pd.read_csv(URBAN_CSV)
    print("\n--- Започва обработка на UrbanSound8K ---")
    
    # Филтрираме само класовете, които ни интересуват
    df_filtered = df[df['classID'].isin(URBAN_MAP.keys())]
    
    copied = 0
    for idx, row in tqdm(df_filtered.iterrows(), total=len(df_filtered)):
        filename = row['slice_file_name']
        fold = row['fold']
        class_id = row['classID']
        
        target_folder = URBAN_MAP[class_id]
        src_path = os.path.join(URBAN_AUDIO_DIR, f"fold{fold}", filename)
        dest_path = os.path.join(FINAL_DATASET_DIR, target_folder, f"us8k_{filename}")
        
        if os.path.exists(src_path):
            shutil.copy2(src_path, dest_path)
            copied += 1
        else:
            print(f"Внимание: Не е намерен файл {src_path}")
            
    print(f"Копирани {copied} файла от UrbanSound8K.")

def copy_esc50_data():
    if not os.path.exists(ESC50_CSV):
        print(f"Грешка: Не е намерен ESC-50 CSV на {ESC50_CSV}")
        return
        
    df = pd.read_csv(ESC50_CSV)
    print("\n--- Започва обработка на ESC-50 ---")
    
    # Филтрираме само класовете, които ни интересуват
    df_filtered = df[df['target'].isin(ESC50_MAP.keys())]
    
    copied = 0
    for idx, row in tqdm(df_filtered.iterrows(), total=len(df_filtered)):
        filename = row['filename']
        class_id = row['target']
        
        target_folder = ESC50_MAP[class_id]
        src_path = os.path.join(ESC50_AUDIO_DIR, filename)
        dest_path = os.path.join(FINAL_DATASET_DIR, target_folder, f"esc50_{filename}")
        
        if os.path.exists(src_path):
            shutil.copy2(src_path, dest_path)
            copied += 1
        else:
            print(f"Внимание: Не е намерен файл {src_path}")
            
    print(f"Копирани {copied} файла от ESC-50.")

def verify_dataset(classes):
    print("\n--- Резултати: Брой файлове във всеки клас ---")
    total = 0
    for cls in classes:
        folder_path = os.path.join(FINAL_DATASET_DIR, cls)
        count = len(glob.glob(os.path.join(folder_path, "*.wav")))
        print(f"{cls}: {count} файла")
        total += count
    print(f"Общо събрани файлове: {total}")

if __name__ == "__main__":
    classes = create_folders()
    copy_urban_data()
    copy_esc50_data()
    verify_dataset(classes)
