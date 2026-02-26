from src.data_processing.audio_processor import preprocess_urbansound

if __name__ == "__main__":
    # Промени пътищата, ако суровите данни на новия компютър са другаде
    preprocess_urbansound(
        csv_path="data/raw/Urban8k/UrbanSound8K.csv",               # Път до оригиналния CSV файл
        source_dir="data/raw/Urban8k",                              # Път до папката, съдържаща fold1, fold2 и т.н.
        output_dir="data/processed_audio",                          # Къде искаш да се запазят? (папката се създава автоматично)
        output_csv_path="data/processed_audio_metadata.csv"         # Къде да запази новия CSV
    )
