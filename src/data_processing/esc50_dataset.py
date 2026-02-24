import os
import torch
import numpy as np
import pandas as pd
import librosa
from torch.utils.data import Dataset
from sklearn.preprocessing import LabelEncoder

# Импортираме САМО екстракцията и форматирането (без clean_audio и standardize)
from src.data_processing.extract_mel import extract_mel_spectrogram
from src.data_processing.format_for_mel import format_for_mel

class ESC50Dataset(Dataset):
    def __init__(self, dataframe, audio_dir, label_encoder=None):
        self.dataframe = dataframe.reset_index(drop=True)
        self.audio_dir = audio_dir
        
        if label_encoder is None:
            self.label_encoder = LabelEncoder()
            self.labels = self.label_encoder.fit_transform(self.dataframe['category'])
        else:
            self.label_encoder = label_encoder
            self.labels = self.label_encoder.transform(self.dataframe['category'])

    def __len__(self):
        return len(self.dataframe)

    def __getitem__(self, idx):
        row = self.dataframe.iloc[idx]
        filename = row['filename']
        label = self.labels[idx]
        file_path = os.path.join(self.audio_dir, filename)
        
        # 1. Зареждаме вече перфектно нарязания 2-секунден файл
        y, sr = librosa.load(file_path, sr=22050)
        
        # 2. Директно вадим Мел-спектрограма (y вече е 100% numpy.ndarray)
        mel_db = extract_mel_spectrogram(y, sr, n_mels=128, fmax=8000)
        
        # 3. Форматираме и нормализираме
        mel_tensor_np = format_for_mel(mel_db)
        
        # 4. Превръщаме в PyTorch тензори
        x_tensor = torch.tensor(mel_tensor_np, dtype=torch.float32)
        y_tensor = torch.tensor(label, dtype=torch.long)
        
        return x_tensor, y_tensor