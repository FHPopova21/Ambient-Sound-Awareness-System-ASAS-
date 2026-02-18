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

    def forward(self, x):
        x = F.relu(self.conv1(x)
        x = self.pool1(x)
        x = F.relu(self.conv2(x))
        x = self.pool2(x)
        x = F.relu(self.conv3(x))
        x = self.gap(x)    
        x = x.view(x.size(0), -1)
        x = F.relu(self.fc1(x))
        x = self.fc2(x)
        return x
    )

X = np.load("/Users/filipapopova/source/repos/Ambient-Sound-Awareness-System-ASAS-/data/processed/X.npy")
Y = np.load("/Users/filipapopova/source/repos/Ambient-Sound-Awareness-System-ASAS-/data/processed/y.npy")


x_train, x_test, x_val, y_train,y_test, y_val = split_data_by_sourcefile(X, Y, df, test_size=0.15, val_size=0.15)

train_dataset = AudioDataset(x_train, y_train)
val_dataset = AudioDataset(x_val, y_val)
test_dataset = AudioDataset(x_test, y_test)

train_loader = DataLoader(train_dataset, batch_size=32, shuffle=True)
val_loader = DataLoader(val_dataset, batch_size=32)
test_loader = DataLoader(test_dataset, batch_size=32)




