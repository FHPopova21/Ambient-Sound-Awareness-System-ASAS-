import torch
import torch.nn as nn
import torch.nn.functional as F

class AudioCNN(nn.Module):
    """
    A custom Convolutional Neural Network (CNN) for audio classification.
    
    Structure:
    - Input: (Batch, 1, 128, 87) -> Mel-Spectrogram with 1 channel.
    - Conv1 + ReLU + MaxPool
    - Conv2 + ReLU + MaxPool
    - Conv3 + ReLU
    - Global Average Pooling (GAP)
    - FC1 + ReLU
    - FC2 (Output Logits)
    """
    def __init__(self, n_classes=5):
        super().__init__()
        
        # 1. First Convolutional Block
        # Input channels: 1 (grayscale spectrogram)
        # Output channels: 32 (number of filters)
        # Kernel size: 3x3 (filter size)
        # Padding: 1 (to keep spatial dimensions consistent before pooling)
        self.conv1 = nn.Conv2d(1, 32, kernel_size=3, padding=1)
        
        # Max Pooling: Reduces spatial dimensions by half (H/2, W/2)
        self.pool1 = nn.MaxPool2d(2, 2)
        
        # 2. Second Convolutional Block
        # Input: 32 (from previous layer) -> Output: 64 filters
        self.conv2 = nn.Conv2d(32, 64, kernel_size=3, padding=1)
        self.pool2 = nn.MaxPool2d(2, 2)
        
        # 3. Third Convolutional Block
        # Input: 64 -> Output: 128 filters
        # Note: No pooling after this layer in the original architecture request, 
        # but we use AdaptiveAvgPool right after.
        self.conv3 = nn.Conv2d(64, 128, kernel_size=3, padding=1)
        
        # 4. Global Average Pooling (GAP)
        # Transforms (Batch, 128, Height, Width) -> (Batch, 128, 1, 1)
        # This allows the model to handle variable input sizes if needed (though we fix ours)
        # and drastically reduces parameters before the fully connected layers.
        self.gap = nn.AdaptiveAvgPool2d(1)
        
        # 5. Fully Connected Layers (Classifier Head)
        # Flattened input: 128 features (from GAP)
        self.fc1 = nn.Linear(128, 64)
        
        # Output layer: 64 input -> n_classes output (logits)
        self.fc2 = nn.Linear(64, n_classes)

    def forward(self, x):
        """
        Forward pass of the network.
        x: Input tensor of shape (Batch, 1, Freq_Bins, Time_Frames)
        """
        # Block 1: Conv -> ReLU -> Pool
        x = F.relu(self.conv1(x))
        x = self.pool1(x)
        
        # Block 2: Conv -> ReLU -> Pool
        x = F.relu(self.conv2(x))
        x = self.pool2(x)
        
        # Block 3: Conv -> ReLU
        x = F.relu(self.conv3(x))
        
        # Global Average Pooling
        x = self.gap(x)
        
        # Flatten: (Batch, 128, 1, 1) -> (Batch, 128)
        x = x.view(x.size(0), -1)
        
        # Classifier: FC1 -> ReLU -> FC2
        x = F.relu(self.fc1(x))
        x = self.fc2(x)
        
        return x
