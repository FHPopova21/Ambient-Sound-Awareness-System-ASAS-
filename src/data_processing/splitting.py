import pandas as pd

def split_data(csv_path):
    """
    Split ESC-50 dataset into Train, Validation, and Test sets
    based on the predefined folds.
    """
    df = pd.read_csv(csv_path)
    
    # Train: Folds 1, 2, 3 (60%)
    train_df = df[df['fold'].isin([1, 2, 3])].copy()
    
    # Validation: Fold 4 (20%)
    val_df = df[df['fold'] == 4].copy()
    
    # Test: Fold 5 (20%)
    test_df = df[df['fold'] == 5].copy()
    
    return train_df, val_df, test_df