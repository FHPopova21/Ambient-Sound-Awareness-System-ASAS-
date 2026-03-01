import os
import sys

# Добавяме главната директория на проекта към пътя, за да работи относителния импорт (src.models...)
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "../.."))
if project_root not in sys.path:
    sys.path.append(project_root)

import json
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader
from tqdm import tqdm

# Fix for Windows console encoding
sys.stdout.reconfigure(encoding='utf-8')

from src.models.mobilenet_model import AudioMobileNetV2
from src.data_processing.Dataset import UrbanSoundDataset
from src.data_processing.augmentation import SpecAugment

def train_mobilenet(
    csv_file="data/train_split.csv",
    audio_dir="data/processed_audio",
    val_csv="data/val_split.csv",
    batch_size=32,
    epochs=30,
    lr=0.0001, # По-нисък LR за Transfer Learning
    device="cuda" if torch.cuda.is_available() else "cpu"
):
    print(f"Training MobileNetV2 on device: {device}")

    train_transform = SpecAugment(freq_mask_param=20, time_mask_param=40)
    
    train_dataset = UrbanSoundDataset(csv_file=csv_file,
                audio_dir=audio_dir,
                transform=train_transform)
    
    val_dataset = UrbanSoundDataset(csv_file=val_csv,
                audio_dir=audio_dir,
                transform=None)
    
    train_loader = DataLoader(train_dataset, batch_size=batch_size, shuffle=True, num_workers=2)
    val_loader = DataLoader(val_dataset, batch_size=batch_size, shuffle=False, num_workers=2)
    
    model = AudioMobileNetV2(n_classes=10).to(device)
    
    # Дефиниране на тежести за класовете:
    # Увеличаваме тежестта за класове като air_conditioner (0) и drilling (4)
    class_weights = torch.ones(10).to(device)
    class_weights[0] = 2.0  # air_conditioner
    class_weights[4] = 2.0  # drilling
    
    criterion = nn.CrossEntropyLoss(weight=class_weights)
    optimizer = optim.Adam(model.parameters(), lr=lr, weight_decay=1e-3) # Увеличен Weight Decay
    scheduler = optim.lr_scheduler.ReduceLROnPlateau(optimizer, mode='min', factor=0.5, patience=3)

    history = {
        'train_loss': [], 'train_acc': [],
        'val_loss': [], 'val_acc': []
    }
    
    best_val_loss = float('inf')
    early_stopping_patience = 5
    patience_counter = 0
    
    for epoch in range(epochs):
        model.train()
        running_loss = 0.0
        correct = 0
        total = 0
        
        for inputs, labels in tqdm(train_loader, desc=f"Epoch {epoch+1}/{epochs} [Train]"):
            inputs, labels = inputs.to(device), labels.to(device)
            
            optimizer.zero_grad()
            outputs = model(inputs)
            loss = criterion(outputs, labels)
            
            loss.backward()
            optimizer.step()
            
            running_loss += loss.item()
            _, predicted = torch.max(outputs.data, 1)
            total += labels.size(0)
            correct += (predicted == labels).sum().item()
            
        train_loss = running_loss / len(train_loader)
        train_acc = 100 * correct / total
        
        model.eval()
        val_loss = 0.0
        val_correct = 0
        val_total = 0
        
        with torch.no_grad():
            for inputs, labels in tqdm(val_loader, desc=f"Epoch {epoch+1}/{epochs} [Val]"):
                inputs, labels = inputs.to(device), labels.to(device)
                outputs = model(inputs)
                loss = criterion(outputs, labels)
                
                val_loss += loss.item()
                _, predicted = torch.max(outputs.data, 1)
                val_total += labels.size(0)
                val_correct += (predicted == labels).sum().item()
                
        val_loss = val_loss / len(val_loader)
        val_acc = 100 * val_correct / val_total
        
        scheduler.step(val_loss)
        
        print(f"Epoch [{epoch+1}/{epochs}] | Train Loss: {train_loss:.4f} Acc: {train_acc:.2f}% | Val Loss: {val_loss:.4f} Acc: {val_acc:.2f}%")
        
        history['train_loss'].append(train_loss)
        history['train_acc'].append(train_acc)
        history['val_loss'].append(val_loss)
        history['val_acc'].append(val_acc)
        
        if val_loss < best_val_loss:
            best_val_loss = val_loss
            patience_counter = 0 # Нулираме брояча при подобрение
            os.makedirs("models", exist_ok=True)
            torch.save(model.state_dict(), "models/3_mobilenet.pth")
            print(">> Най-добрият модел (Best Val Loss) е запазен!")
        else:
            patience_counter += 1
            print(f">> Няма подобрение {patience_counter}/{early_stopping_patience} епохи.")
            if patience_counter >= early_stopping_patience:
                print(f"Early stopping trigger! Спираме тренирането след {epoch+1} епохи.")
                break
                
    with open("models/mobilenet_history.json", "w") as f:
        json.dump(history, f, indent=4)
        
    print("Тренирането завърши! Метриките са запазени в models/mobilenet_history.json")

if __name__ == "__main__":
    train_mobilenet()
