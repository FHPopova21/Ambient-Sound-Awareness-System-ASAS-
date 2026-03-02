import os
import pandas as pd
import glob
import re
from sklearn.model_selection import train_test_split

def get_source_identity(filepath):
    """
    Извлича оригиналната идентичност на файла, премахвайки аугментационните префикси.
    Пример: 'aug_0_us8k_123.wav' -> 'us8k_123.wav'
    """
    filename = os.path.basename(filepath)
    if filename.startswith("aug_"):
        # Премахваме 'aug_N_' (където N е цифра)
        return re.sub(r'^aug_\d+_', '', filename)
    return filename

def split_dataset_final(root_dir="data/Dataset_Final", output_dir="data/"):
    """
    Разделя Dataset_Final на Train (80%), Val (10%) и Test (10%) чрез случайно стратифицирано разделяне.
    Включва логика за предотвратяване на Data Leakage, като групира аугментираните файлове.
    """
    filepaths = []
    labels = []
    identities = []
    
    # Списък с класовете (имената на папките)
    if not os.path.exists(root_dir):
        print(f"Грешка: Директорията {root_dir} не съществува.")
        return None, None, None
        
    classes = sorted([d for d in os.listdir(root_dir) if os.path.isdir(os.path.join(root_dir, d))])
    class_to_idx = {cls_name: i for i, cls_name in enumerate(classes)}
    
    print(f"Открити класове: {classes}")
    
    for cls_name in classes:
        cls_dir = os.path.join(root_dir, cls_name)
        files = glob.glob(os.path.join(cls_dir, "*.wav"))
        for f in files:
            filepaths.append(f)
            labels.append(class_to_idx[cls_name])
            identities.append(get_source_identity(f))
            
    # Създаваме DataFrame с идентичности
    df = pd.DataFrame({
        'file_path': filepaths,
        'label': labels,
        'identity': identities
    })
    
    if len(df) == 0:
        print("Грешка: Не са намерени аудио файлове.")
        return None, None, None

    # ПРЕДОТВРАТЯВАНЕ НА LEAKAGE:
    # Работим с уникалните идентичности, за да не делим копия на един и същ звук
    unique_df = df.drop_duplicates(subset=['identity']).copy()
    
    # ПРОВЕРКА ЗА МАЛКИ КЛАСОВЕ (за предотвратяване на грешки в train_test_split)
    class_counts = unique_df['label'].value_counts()
    problematic_classes = class_counts[class_counts < 2].index.tolist()
    
    train_identities = []
    val_identities = []
    test_identities = []
    
    if problematic_classes:
        class_names = [classes[c] for c in problematic_classes]
        print(f"Предупреждение: Клaсовете {class_names} имат само 1 уникален запис. Те ще бъдат добавени само в Train.")
        
        # Записите за малките класове се отделят за Train
        train_identities.extend(unique_df[unique_df['label'].isin(problematic_classes)]['identity'].tolist())
        # Оставащите се делят нормално
        unique_df = unique_df[~unique_df['label'].isin(problematic_classes)]

    if not unique_df.empty:
        # 1. Разделяме останалите уникални записи на Train (80%) и Temp (20%)
        t_ident, temp_ident = train_test_split(
            unique_df['identity'], 
            test_size=0.2, 
            random_state=42, 
            stratify=unique_df['label']
        )
        train_identities.extend(t_ident)
        
        # 2. Разделяме Temp на Val (50%) и Test (50%) -> общо по 10%
        v_df = unique_df[unique_df['identity'].isin(temp_ident)]
        
        # ПРОВЕРКА ЗА МАЛКИ КЛАСОВЕ В ТЕМП СЕТА
        temp_class_counts = v_df['label'].value_counts()
        temp_prob_classes = temp_class_counts[temp_class_counts < 2].index.tolist()
        
        if temp_prob_classes:
            print(f"Предупреждение: Класовете {temp_prob_classes} имат < 2 записа в Temp сета. Те отиват директно в Val.")
            val_identities.extend(v_df[v_df['label'].isin(temp_prob_classes)]['identity'].tolist())
            v_df = v_df[~v_df['label'].isin(temp_prob_classes)]
            
        if not v_df.empty:
            v_ident, te_ident = train_test_split(
                v_df['identity'], 
                test_size=0.5, 
                random_state=42, 
                stratify=v_df['label']
            )
            val_identities.extend(v_ident)
            test_identities.extend(te_ident)
    
    # 3. Филтрираме оригиналния DataFrame (включващ всички аугментации)
    train_df = df[df['identity'].isin(train_identities)]
    val_df = df[df['identity'].isin(val_identities)]
    test_df = df[df['identity'].isin(test_identities)]
    
    # Запазваме новите CSV файлове
    train_df.to_csv(os.path.join(output_dir, 'train_split.csv'), index=False)
    val_df.to_csv(os.path.join(output_dir, 'val_split.csv'), index=False)
    test_df.to_csv(os.path.join(output_dir, 'test_split.csv'), index=False)
    
    print(f"\nРазделянето завърши успешно (Leakage-free)!")
    print(f"Train: {len(train_df)} записа ({len(train_identities)} уникални)")
    print(f"Val: {len(val_df)} записа ({len(val_identities)} уникални)")
    print(f"Test: {len(test_df)} записа ({len(test_identities)} уникални)")
    
    return train_df, val_df, test_df

