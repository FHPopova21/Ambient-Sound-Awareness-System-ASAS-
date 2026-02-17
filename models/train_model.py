import torch
import numpy as np
import pandas as pd
import torch.nn as nn
import torch.nn.functional as F 
from torch.utils.data import Dataset, DataLoader
from sklearn.metrics import accuracy_score, precision_recall_fscore_support
from sklearn.preprocessing import LabelEncoder
from src.splitting import split_data_by_sourcefile

class AudioDataset(Dataset):
    def __init__(self, X, Y):
        self.X = X
        self.Y = Y

    def __len__(self):
        return len(self.X)

    def __getitem__(self, idx):
        return self.X[idx], self.Y[idx]

class AudioCNN(nn.Module):
    def __init__(self, n_classes = 5):
        super().__init__()

        self.conv1 = nn.Conv2d(1, 32, kernel = 3, padding = 1)
        self.pool1 = nn.MaxPool2d(2, 2)

        self.conv2 = nn.Conv2d(32, 64, kernel = 3, padding = 1)
        self.pool2 = nn.MaxPool2d(2, 2)

        self.conv3 = nn.Conv2d(64, 128, kernel = 3, padding = 1)
        self.gap = nn.AdaptiveAvgPool2d(2)
        self.fc1 = nn.Linear(128, 64)
        self.fc2 = nn.Linear(64, n_classes)
    def forward     


