import os
import glob
import librosa
import numpy as np 
import random

def extract_mel_spectrogram(file_path, augment=False):
    # 1. Зареждаме аудиото твърдо на 22050 Hz (Моно)
    y, sr = librosa.load(file_path, sr=22050)
    
    # --- ВАЖНО: АУГМЕНТАЦИЯ ---
    # Ако augment=True, вкарваме лек времеви шифт или бял шум "on-the-fly"
    if augment:
        # 1.1 Time Shift (Случайно изместване напред или назад до 0.5 sec)
        if random.random() < 0.5: # 50% шанс за shift
            shift_max = int(sr * 0.5)
            shift = np.random.randint(-shift_max, shift_max)
            y = np.roll(y, shift)
            
        # 1.2 White Noise (Слаб бял шум за объркване на модела)
        if random.random() < 0.2: # 20% шанс за бял шум
            noise_amp = 0.005 * np.random.uniform() * np.amax(y)
            y = y + noise_amp * np.random.normal(size=y.shape[0])
            
    # 2. Duration Fix: Изрязваме или допълваме с нули до ТОЧНО 4 секунди (88200 семпъла)
    target_samples = int(4.0 * sr) # 4 * 22050 = 88200
    if len(y) > target_samples:
        y = y[:target_samples]
    else:
        y = np.pad(y, (0, target_samples - len(y)), mode='constant')
        
    # 3. Normalization (RMS уеднаквяване на силата на звука)
    rms = np.sqrt(np.mean(y**2))
    if rms > 0.0:
        target_rms = 0.05 # Експериментална фиксирана сила
        y = y * (target_rms / rms)
        
    # 4. МАГИЯТА: Генерираме Мел-спектрограмата (точно както в Swift)
    S = librosa.feature.melspectrogram(
        y=y, 
        sr=sr, 
        n_fft=2048, 
        hop_length=512, 
        n_mels=128,       
        fmin=0.0, 
        fmax=8000.0,      
        center=True       # Добавя падинга, нужен за съвпадение!
    )
    
    # 5. Преобразуване в Децибели (С фиксиран референс за Swift: ref=1.0)
    S_db = librosa.power_to_db(S, ref=1.0)
    
    return S_db