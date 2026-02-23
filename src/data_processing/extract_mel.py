import os
import glob
import librosa
import librosa.display
import numpy as np 

def extract_mel_spectrogram(y, sr, n_mels = 128, fmax = 8000, n_fft = 2048, hop_length = 512):
    # Convert to mel spectrogram
    mel_spectrogram = librosa.feature.melspectrogram(y=y, sr=sr, n_mels=n_mels, fmax=fmax, n_fft=n_fft, hop_length=hop_length)
    
    # Convert to decibels
    mel_spectrogram_db = librosa.power_to_db(mel_spectrogram, ref=np.max)
    
    return mel_spectrogram_db