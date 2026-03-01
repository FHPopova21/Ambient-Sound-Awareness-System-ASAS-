import os
import pandas as pd
import glob
from sklearn.model_selection import train_test_split

def split_dataset_final(root_dir="data/Dataset_Final", output_dir="data/"):
    """
    Разделя Dataset_Final на Train (80%), Val (10%) и Test (10%) чрез случайно стратифицирано разделяне.
    """
    filepaths = []
    labels = []
    
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
            
    # Създаваме базов DataFrame
    df = pd.DataFrame({
        'file_path': filepaths,
        'label': labels
    })
    
    if len(df) == 0:
        print("Грешка: Не са намерени аудио файлове.")
        return None, None, None

    # 1. Първо разделяме на Train (80%) и Temp (20%)
    train_df, temp_df = train_test_split(
        df, test_size=0.2, random_state=42, stratify=df['label']
    )
    
    # 2. Продължаваме като разделяме Temp на Val (50%) и Test (50%) -> общо по 10% от целия сет
    val_df, test_df = train_test_split(
        temp_df, test_size=0.5, random_state=42, stratify=temp_df['label']
    )
    
    # Запазваме новите CSV файлове
    train_df.to_csv(os.path.join(output_dir, 'train_split.csv'), index=False)
    val_df.to_csv(os.path.join(output_dir, 'val_split.csv'), index=False)
    test_df.to_csv(os.path.join(output_dir, 'test_split.csv'), index=False)
    
    print(f"\nРазделянето завърши успешно!")
    print(f"Train: {len(train_df)} записа")
    print(f"Val: {len(val_df)} записа")
    print(f"Test: {len(test_df)} записа")
    
    return train_df, val_df, test_df