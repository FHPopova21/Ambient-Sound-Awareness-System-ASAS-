import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

import torch
import numpy as np
from torch.utils.data import DataLoader
from sklearn.metrics import accuracy_score, precision_recall_fscore_support, confusion_matrix
from src.model import AudioCNN, AudioDataset
from src.splitting import split_data_by_sourcefile
import pandas as pd

# Device
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# Load full dataset
X = np.load("data/processed/X.npy")
Y = np.load("data/processed/y.npy")
df = pd.read_csv("data/processed/master_metadata.csv")

# Recreate same split
_, _, x_test, _, _, y_test = split_data_by_sourcefile(
    X, Y, df, test_size=0.15, val_size=0.15
)

# Dataset
test_dataset = AudioDataset(x_test, y_test)
test_loader = DataLoader(test_dataset, batch_size=32)

# Load model
n_classes = len(np.unique(Y))
model = AudioCNN(n_classes=n_classes)
model.load_state_dict(torch.load("model1.pth", map_location=device))
model.to(device)
model.eval()

print("Model loaded successfully.")

# Evaluation
all_preds = []
all_labels = []

with torch.no_grad():
    for x_batch, y_batch in test_loader:
        x_batch = x_batch.to(device)
        outputs = model(x_batch)
        _, preds = torch.max(outputs, 1)

        all_preds.extend(preds.cpu().numpy())
        all_labels.extend(y_batch.numpy())

# Metrics
acc = accuracy_score(all_labels, all_preds)
prec, rec, f1, _ = precision_recall_fscore_support(
    all_labels, all_preds, average="weighted"
)
cm = confusion_matrix(all_labels, all_preds)

print(f"\nTest Accuracy: {acc:.3f}")
print(f"Precision (Weighted): {prec:.3f}")
print(f"Recall (Weighted): {rec:.3f}")
print(f"F1-Score (Weighted): {f1:.3f}")
print("\nConfusion Matrix:")
print(cm)