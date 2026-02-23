import numpy as np
from src.data_processing.extract_mel import extract_mel_spectrogram


def format_for_mel(mel_spectrogram_db):
    mel_min = np.min(mel_spectrogram_db)
    mel_max = np.max(mel_spectrogram_db)
    
    if mel_max - mel_min > 0:
        mel_normalized = (mel_spectrogram_db - mel_min) / (mel_max - mel_min)
    else:
        mel_normalized = mel_spectrogram_db - mel_min

    mel_tensor = mel_normalized[np.newaxis, ...]
    
    return mel_tensor
