# Data Splitting Report

**Date**: February 17, 2026
**Script**: `src/splitting.py`
**Method**: Group-based Stratified Split

---

## 1. Methodology
We implemented a strict splitting strategy to prevent **Data Leakage** caused by augmentation.
- **Problem**: Random splitting would place an original file in *Train* and its augmented version in *Test*, leading to inflated performance metrics.
- **Solution**: We used `GroupShuffleSplit` on the `source_file` column. This ensures that **all** variations of a single recording (original + speed/pitch/noise augmentations) are assigned to the **same** split.

## 2. Execution Results
The dataset was split into Train (70%), Validation (15%), and Test (15%) sets.

| Split | Samples | Source Files | Percentage |
| :--- | :--- | :--- | :--- |
| **Train** | **650** | 476 | ~70.6% |
| **Validation** | **138** | 108 | ~15.0% |
| **Test** | **132** | 102 | ~14.4% |
| **Total** | **920** | **686** | 100% |

### Key Observations
- The **Test Set** contains **102 unique source files** that the model will essentially "never see" during training.
- The **Validation Set** contains **108 unique source files** for unbiased hyperparameter tuning.

## 3. Leakage Verification
- **Confirmed**: No `source_file` ID overlaps between Train, Validation, and Test sets.
- **Confirmed**: Augmented files always follow their original source.

## 4. Conclusion
The data splitting process is **robust and leakage-free**. The resulting `Train`, `Val`, and `Test` sets are ready for valid model training and evaluation.
