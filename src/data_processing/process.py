import os
from src.data_processing.audio_dataset import AudioFolderDataset
from torch.utils.data import DataLoader

FINAL_DATASET_DIR = "data/Dataset_Final"

def main():
    print(f"--- Тестване на AudioFolderDataset върху {FINAL_DATASET_DIR} ---")
    try:
        # Проверка дали папката съществува
        if not os.path.exists(FINAL_DATASET_DIR):
            print(f"Грешка: Папката {FINAL_DATASET_DIR} не съществува. Моля стартирайте build_dataset_final.py първо.")
            return

        dataset = AudioFolderDataset(root_dir=FINAL_DATASET_DIR)
        print(f"Общо заредени файлове: {len(dataset)}")
        print(f"Класове: {dataset.classes}")
        print(f"Индекси: {dataset.class_to_idx}")

        # Създаваме прост DataLoader, за да видим дали вади тензори
        loader = DataLoader(dataset, batch_size=4, shuffle=True)

        # Вземаме една мостра
        features, labels = next(iter(loader))

        print(f"\nУспешно зареден batch!")
        print(f"Форма на тензора (Batch, Channel, Mels, Time): {features.shape}")
        print(f"Етикети: {labels}")

    except Exception as e:
        print(f"Грешка при тестване на Dataset: {e}")

if __name__ == "__main__":
    main()