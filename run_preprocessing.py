import os
import sys

# Добавяме текущата директория към пътя, за да може Python да види пакета 'src'
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '.')))

from src.data_processing.build_dataset_final import run_full_build_pipeline
from src.data_processing.splitting import split_dataset_final

def main():
    print("--- СТАРТИРАНЕ НА ПЪЛЕН PRE-PROCESSING ПАЙПЛАЙН ---")
    
    # 1. Събиране, Балансиране и Offline Аугментация
    # Това създава папката data/Dataset_Final
    print("\n[1/2] Изграждане на балансиран Dataset_Final (Balancing + Augmentation)...")
    run_full_build_pipeline()

    # 2. Разделяне на данните на Train, Val и Test (80/10/10)
    # Това създава трите CSV файла в data/
    print("\n[2/2] Генериране на стратифицирани split-ове (80/10/10)...")
    split_dataset_final(
        root_dir="data/Dataset_Final",
        output_dir="data"
    )

    print("\n--- Всички данни са подготвени и балансирани успешно! ---")
    print("Можете да започнете обучението на моделите.")

if __name__ == "__main__":
    main()