import numpy as np

def format_for_mel(mel_spectrogram_db):
    """
    Нормализира Мел-спектрограмата и добавя канален размер (1, H, W).
    Използваме ФИКСИРАНИ граници (-100 до 20 dB), за да запазим относителната сила.
    """
    min_db = -100.0
    max_db = 20.0
    
    # Клипваме стойностите, за да няма крайности
    mel_clipped = np.clip(mel_spectrogram_db, min_db, max_db)
    
    # Мащабираме до 0.0 - 1.0
    mel_normalized = (mel_clipped - min_db) / (max_db - min_db)
    
    # Добавяме канална дименсия за CNN (Channels=1)
    mel_tensor = mel_normalized[np.newaxis, ...]
    
    return mel_tensor
