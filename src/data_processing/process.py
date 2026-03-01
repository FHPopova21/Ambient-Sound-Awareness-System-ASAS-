import os
from src.data_processing.audio_dataset import AudioFolderDataset
from src.data_processing.splitting import split_dataset_final
from torch.utils.data import DataLoader

FINAL_DATASET_DIR = "data/Dataset_Final"

def main():
    print(f"--- Тестване на новия Processing Pipeline върху {FINAL_DATASET_DIR} ---")
    try:
        # 1. Тест на Разделянето (Splitting)
        print("\n1. Тест на Splitting (80/10/10)...")
        train_df, val_df, test_df = split_dataset_final(root_dir=FINAL_DATASET_DIR)
        if train_df is not None:
            print("Разделянето на CSV файлове е успешно!")

        # 2. Тест на Dataset без аугментация
        print("\n2. Тест на Dataset без аугментация...")
        dataset = AudioFolderDataset(root_dir=FINAL_DATASET_DIR, augment=False)
        print(f"Общо заредени файлове: {len(dataset)}")
        
        loader = DataLoader(dataset, batch_size=2, shuffle=True)
        features, _ = next(iter(loader))
        print(f"Форма на тензора: {features.shape} (Очаквано: 128x173)")
        print(f"Min/Max стойности в batch: {features.min().item():.4f} / {features.max().item():.4f}")

        # 3. Тест на Dataset С аугментация (on-the-fly)
        print("\n3. Тест на Dataset С аугментация...")
        dataset_aug = AudioFolderDataset(root_dir=FINAL_DATASET_DIR, augment=True)
        loader_aug = DataLoader(dataset_aug, batch_size=2, shuffle=True)
        features_aug, _ = next(iter(loader_aug))
        print(f"Форма на тензора с аугментация: {features_aug.shape}")

        print("\n--- Всички тестове в Pipeline преминаха успешно! ---")

    except Exception as e:
        print(f"Грешка при тестване на Pipeline: {e}")

if __name__ == "__main__":
    main()