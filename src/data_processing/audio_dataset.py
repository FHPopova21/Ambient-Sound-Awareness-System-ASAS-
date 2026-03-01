import os
import torch
import numpy as np
import glob
from torch.utils.data import Dataset
from src.data_processing.extract_mel import extract_mel_spectrogram
from src.data_processing.format_for_mel import format_for_mel

class AudioFolderDataset(Dataset):
    def __init__(self, root_dir, augment=False, transform=None):
        """
        Зарежда аудио файлове директно от подпапки, където името на папката е класът.
        Args:
            root_dir (str): Път до главната папка (напр. data/Dataset_Final)
            augment (bool): Дали да се прилага data augmentation (time_shift, noise)
            transform (callable, optional): Допълнителни трансформации.
        """
        self.root_dir = root_dir
        self.augment = augment
        self.transform = transform
        
        # Динамично създаване на класовете от папките
        self.classes = sorted([d for d in os.listdir(root_dir) if os.path.isdir(os.path.join(root_dir, d))])
        self.class_to_idx = {cls_name: i for i, cls_name in enumerate(self.classes)}
        
        self.filepaths = []
        self.labels = []
        
        for cls_name in self.classes:
            cls_dir = os.path.join(root_dir, cls_name)
            for file in glob.glob(os.path.join(cls_dir, "*.wav")):
                self.filepaths.append(file)
                self.labels.append(self.class_to_idx[cls_name])

    def __len__(self):
        return len(self.filepaths)

    def __getitem__(self, idx):
        if torch.is_tensor(idx):
            idx = idx.tolist()
            
        audio_path = self.filepaths[idx]
        label = self.labels[idx]
        
        # Извличане на мел-спектрограма (подаваме флага за аугментация)
        mel_spec = extract_mel_spectrogram(audio_path, augment=self.augment)
        
        # Форматиране (нормализация и добавяне на канал)
        mel_tensor_np = format_for_mel(mel_spec)
        
        # Преобразуване към PyTorch Tensor (float32)
        mel_tensor = torch.tensor(mel_tensor_np, dtype=torch.float32)
        
        if self.transform:
            mel_tensor = self.transform(mel_tensor)

        return mel_tensor, label
