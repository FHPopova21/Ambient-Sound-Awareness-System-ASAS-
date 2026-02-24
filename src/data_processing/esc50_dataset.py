import os
import torch 
import pandas as pd 
import numpy as np 
from torch.utils.data import Dataset 
from sklearn.preprocessing import LabelEncoder 

from src.data_processing.clean_audio import load_and_clean_audio
from src.data_processing.standardize_lenght import standardize_lenght 
from src.data_processing.extract_mel import extract_mel_spectrogram
from src.data_processing.format_for_mel import format_for_mel


class ESC50Dataset(Dataset):
    def __init__(self, dataframe, audio_dir, label_encoder=None):
        self.dataframe = dataframe.reset_index(drop=True)
        self.audio_dir = audio_dir

        if label_encoder is None:
            self.label_encoder = LabelEncoder()
            self.labels = self.label_encoder.fit_transform(self.dataframe["category"])
        else:
            self.label_encoder = label_encoder
            self.labels = self.label_encoder.transform(self.dataframe["category"])
    
    def __len__(self):
        return len(self.dataframe)

    def __getitem__(self, idx):
        row = self.dataframe.iloc[idx]
        filename = row["filename"]
        label = self.labels[idx]

        audio_path = os.path.join(self.audio_dir, filename)

        y, sr = load_and_clean_audio(audio_path, sr = 22050, top_db = 20)
        y_standardized = standardize_lenght(y, sr, target_duration=2.0)
        mel_spectogram = extract_mel_spectrogram(y_standardized, sr, n_mels = 128, fmax = 8000)
        mel_tensor = format_for_mel(mel_spectogram)

        x_tensor = torch.tensor(mel_tensor, dtype=torch.float32)
        y_tensor = torch.tensor(label, dtype = torch.long)

        return x_tensor, y_tensor


        

