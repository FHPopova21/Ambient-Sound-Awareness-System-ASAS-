import numpy as np

def segment_audio(y, sr, segment_duration=2.0, overlap=0.5):
    """
    Разделя аудио сигнал на припокриващи се сегменти (Sliding Window).
    
    Args:
        y (np.ndarray): Суров аудио сигнал.
        sr (int): Честота на дискретизация (Sample rate).
        segment_duration (float): Дължина на всеки сегмент в секунди.
        overlap (float): Процент на застъпване (между 0.0 и 1.0).
        
    Returns:
        list: Списък от аудио сегменти (np.ndarray), всеки с точна дължина.
    """
    segment_length = int(segment_duration * sr)
    step = int(segment_length * (1 - overlap)) # При 50% застъпване, стъпката е 1 секунда
    
    segments = []
    current_length = len(y)
    
    # 1. Ако аудиото е по-късо от 2 секунди - просто го допълваме (Zero-Padding)
    if current_length < segment_length:
        pad_length = segment_length - current_length
        pad_left = pad_length // 2
        pad_right = pad_length - pad_left
        y_padded = np.pad(y, (pad_left, pad_right), mode="constant")
        return [y_padded]
        
    # 2. Плъзгащ се прозорец (Sliding Window)
    start = 0
    while start + segment_length <= current_length:
        segment = y[start:start + segment_length]
        segments.append(segment)
        start += step
        
    return segments