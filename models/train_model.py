import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

import torch
import numpy as np
import pandas as pd
import torch.nn as nn
import torch.nn.functional as F 
from torch.utils.data import Dataset, DataLoader
from src.splitting import split_data_by_sourcefile
from src.model import AudioCNN, AudioDataset

# 1. Load Data
X = np.load("/Users/filipapopova/source/repos/Ambient-Sound-Awareness-System-ASAS-/data/processed/X.npy")
Y = np.load("/Users/filipapopova/source/repos/Ambient-Sound-Awareness-System-ASAS-/data/processed/y.npy")

df = pd.read_csv("/Users/filipapopova/source/repos/Ambient-Sound-Awareness-System-ASAS-/data/processed/master_metadata.csv")

x_train, x_val, x_test, y_train, y_val, y_test = split_data_by_sourcefile(X, Y, df, test_size=0.15, val_size=0.15)

train_dataset = AudioDataset(x_train, y_train)
val_dataset = AudioDataset(x_val, y_val)
test_dataset = AudioDataset(x_test, y_test)

train_loader = DataLoader(train_dataset, batch_size=32, shuffle=True)
val_loader = DataLoader(val_dataset, batch_size=32)
test_loader = DataLoader(test_dataset, batch_size=32)


# 5. Training Setup
print(f"Device: {'cuda' if torch.cuda.is_available() else 'cpu'}")
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# Determine number of classes dynamically
n_classes = len(np.unique(Y))
print(f"Initializing model for {n_classes} classes...")

model = AudioCNN(n_classes=n_classes).to(device)

criterion = nn.CrossEntropyLoss()
optimizer = torch.optim.Adam(model.parameters(), lr = 1e-3)


# 6. Training Loop
EPOCHS = 20
print("Starting training...")

for epoch in range(EPOCHS):
    model.train()
    train_loss = 0
    correct = 0
    total = 0

    for x_batch, y_batch in train_loader:
        x_batch, y_batch = x_batch.to(device), y_batch.to(device)
        optimizer.zero_grad()
        outputs = model(x_batch)

        loss = criterion(outputs, y_batch)
        loss.backward()
        optimizer.step()

        train_loss += loss.item() * x_batch.size(0)
        _, predicted = outputs.max(1)
        total += y_batch.size(0)
        correct += predicted.eq(y_batch).sum().item()

    train_loss /= len(train_loader.dataset)
    train_acc = correct / total
    
    model.eval()
    val_loss = 0
    correct = 0
    total = 0

    with torch.no_grad():
        for x_batch, y_batch in val_loader:
            x_batch, y_batch = x_batch.to(device), y_batch.to(device)
            outputs = model(x_batch)
            loss = criterion(outputs, y_batch)
            val_loss += loss.item() * x_batch.size(0)
            _, predicted = outputs.max(1)
            total += y_batch.size(0)
            correct += predicted.eq(y_batch).sum().item()


    val_loss /= len(val_loader.dataset)
    val_acc = correct / total

    print(f"Epoch {epoch+1}/{EPOCHS} | "
          f"Train Loss: {train_loss:.4f}, Train Acc: {train_acc:.3f} | "
          f"Val Loss: {val_loss:.4f}, Val Acc: {val_acc:.3f}")

np.save("/Users/filipapopova/source/repos/Ambient-Sound-Awareness-System-ASAS-/data/processed/x_test.npy", x_test)
np.save("/Users/filipapopova/source/repos/Ambient-Sound-Awareness-System-ASAS-/data/processed/y_test.npy", y_test)

torch.save(model.state_dict(), "model1.pth")
print("Model saved successfully.")