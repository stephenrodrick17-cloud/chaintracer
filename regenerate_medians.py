
import pandas as pd
import numpy as np

# Load the training data
df_train = pd.read_csv('backend/data/train_df.csv')

# Get all feature columns
feature_cols = [f'feature{i}' for i in range(2, 167)]

# Calculate medians for all 165 features
feature_medians = df_train[feature_cols].median().values

# Save the new medians
np.save('backend/models/feature_medians.npy', feature_medians)

print("New feature_medians.npy created with shape:", feature_medians.shape)
