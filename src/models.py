import torch
import torch.nn as nn
import torch.nn.functional as F

class AudioCNN(nn.Module):
    """
    A custom Convolutional Neural Network (CNN) for audio classification.
    
    Structure:
    - Input: (Batch, 1, 128, 87) -> Mel-Spectrogram
    - Layer 1: Conv2d(32 filters) -> ReLU -> MaxPool
    - Layer 2: Conv2d(64 filters) -> ReLU -> MaxPool
    - Layer 3: Conv2d(128 filters) -> ReLU -> AdaptiveAvgPool (Global Buffer)
    - Head: Linear(128 -> 64) -> ReLU -> Linear(64 -> n_classes)
    """
    def __init__(self, n_classes=5):
        super().__init__()
        
        # 1. Convolutional Block 1
        # nn.Conv2d(in_channels, out_channels, kernel_size, padding)
        # in_channels=1: Input is a mono audio spectrogram (like a grayscale image).
        # out_channels=32: We learn 32 different feature maps (filters).
        # kernel_size=3: 3x3 sliding window.
        # padding=1: Keeps spatial dimensions same before pooling.
        self.conv1 = nn.Conv2d(1, 32, 3, padding=1)
        
        # Pooling Block 1
        # nn.MaxPool2d(kernel_size, stride): Reduces dimensions by half.
        # (128, 87) -> becomes approx (64, 43)
        self.pool1 = nn.MaxPool2d(2, 2)
        
        # 2. Convolutional Block 2
        # Input: 32 channels (from conv1). Output: 64 new feature maps.
        self.conv2 = nn.Conv2d(32, 64, 3, padding=1)
        # Pooling: Reduces from (64, 43) -> approx (32, 21)
        self.pool2 = nn.MaxPool2d(2, 2)
        
        # 3. Convolutional Block 3
        # Input: 64 channels. Output: 128 feature maps.
        self.conv3 = nn.Conv2d(64, 128, 3, padding=1)
        
        # Global Average Pooling (GAP)
        # This is a modern replacement for Flattening huge tensors.
        # It takes the average of each 128 feature map, resulting in a vector of size 128.
        # Regardless of input time dimension, output is always (Batch, 128, 1, 1).
        self.gap = nn.AdaptiveAvgPool2d(1)
        
        # 4. Fully Connected Layers (Classifier Head)
        # First dense layer: projects 128 audio features to 64.
        self.fc1 = nn.Linear(128, 64)
        
        # Output layer: projects 64 features to n_classes (5).
        # These are "logits" (raw scores).
        self.fc2 = nn.Linear(64, n_classes)
        
    def forward(self, x):
        # x shape: (Batch, 1, 128, 87)
        
        # Block 1
        x = self.conv1(x)       # Convolution
        x = F.relu(x)           # Activation (adds non-linearity)
        x = self.pool1(x)       # Downsampling
        
        # Block 2
        x = self.conv2(x)
        x = F.relu(x)
        x = self.pool2(x)
        
        # Block 3
        x = self.conv3(x)
        x = F.relu(x)
        
        # Global Pooling
        x = self.gap(x)         # Shape: (Batch, 128, 1, 1)
        
        # Flatten
        # x.size(0) is Batch Size. -1 autofills the rest.
        # Flattens (Batch, 128, 1, 1) -> (Batch, 128)
        x = x.view(x.size(0), -1)
        
        # Classifier
        x = self.fc1(x)
        x = F.relu(x)
        
        x = self.fc2(x)         # Final Logits (Batch, n_classes)
        
        return x
