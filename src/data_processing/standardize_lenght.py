import os
import glob
import librosa
import numpy as np 
import librosa.display
from sklearn.preprocessing import LabelEncoder

def standardize_lenght(y, sr, target_duration = 2.0 ):
    """
    Standardize the length of an audio file.

    Args:
        y (np.ndarray): Audio time series.
        sr (int): Sample rate.
        targer_duration (float): Target duration in seconds. Default is 2.0.

    Returns:
        np.ndarray: Standardized audio time series.
        int: Sample rate.
    """
    
    target_lenght = int(target_duration * sr)
    current_lenght = len(y)

    if current_lenght < target_lenght:
        # Zero-Padding (Допълване с нули равномерно от двете страни)

        padding_lenght = target_lenght - current_lenght
        padding_left = padding_lenght // 2
        padding_right = padding_lenght - padding_left

        y_standardized = np.pad(y, (padding_left, padding_right), mode = "constant")

    elif current_lenght > target_lenght:
        start = (current_lenght - target_lenght) // 2
        y_standardized = y[start:start + target_lenght]
    else:
        y_standardized = y

    return y_standardized
    