import torch
import os
import sys
from config import REPO_ROOT, WEIGHTS_PATH, LABELS

if REPO_ROOT not in sys.path:
    sys.path.append(REPO_ROOT)

from src.models.mobilenet_model import AudioMobileNetV2

class ModelEngine:
    def __init__(self):
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.model = AudioMobileNetV2(n_classes=len(LABELS), pretrained=False)
        self.load_weights()
        self.model.to(self.device).eval()

    def load_weights(self):
        if os.path.exists(WEIGHTS_PATH):
            print(f"Зареждане на тегла от: {WEIGHTS_PATH}")
            self.model.load_state_dict(torch.load(WEIGHTS_PATH, map_location=self.device))
        else:
            print(f"ВНИМАНИЕ: Файлът с тегла не е намерен на {WEIGHTS_PATH}")

    def predict(self, tensor):
        with torch.no_grad():
            outputs = self.model(tensor)
            probabilities = torch.nn.functional.softmax(outputs, dim=1)
            confidence, predicted_idx = torch.max(probabilities, 1)
            
        return predicted_idx.item(), confidence.item()
