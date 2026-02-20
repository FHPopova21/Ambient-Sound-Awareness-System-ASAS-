import os
import numpy as np 
import librosa 
import librosa.display 

def load_and_clean_audio(file_path, sr = 22050, top_db = 20):
    """
    Load an audio file and remove background noise using spectral gating.

    Args:
        file_path (str): Path to the audio file.
        sr (int): Target sampling rate. Default is 22050.
        top_db (int): Threshold in dB to consider as background noise. Default is 20.

    Returns:
        np.ndarray: Cleaned audio time series.
        int: Sample rate.
    """
    y, sr = librosa.load(file_path, sr=sr)
    y_clean = librosa.effects.trim(y, top_db=top_db)[0]
    return y_clean, sr

def save_audio(audio, sr, output_path):
    """
    Save an audio file.

    Args:
        audio (np.ndarray): Audio time series.
        sr (int): Sample rate.
        output_path (str): Path to save the audio file.
    """
    librosa.output.write_wav(output_path, audio, sr)

def main():
    """
    Main function to clean audio files.
    """
    input_dir = "/Users/filipapopova/source/repos/Ambient-Sound-Awareness-System-ASAS-/data/raw/audio"
    output_dir = "/Users/filipapopova/source/repos/Ambient-Sound-Awareness-System-ASAS-/data/processed/audio"
    
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
    
    for filename in os.listdir(input_dir):
        if filename.endswith(".wav"):
            file_path = os.path.join(input_dir, filename)
            output_path = os.path.join(output_dir, filename)
            
            audio, sr = load_and_clean_audio(file_path)
            save_audio(audio, sr, output_path)
            
            print(f"Cleaned {filename}")

if __name__ == "__main__":
    main()