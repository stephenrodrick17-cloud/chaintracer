
import pandas as pd
import os

# In-memory storage for the dataframes
df_feat = None
df_class = None
df_edges = None

def load_dataset():
    """
    Loads the Elliptic dataset into memory.
    """
    global df_feat, df_class, df_edges
    
    # Get absolute path to data directory
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    data_dir = os.path.join(base_dir, "data")
    
    feat_cols = ['txid'] + [f'feature{i}' for i in range(1, 167)]
    df_feat = pd.read_csv(os.path.join(data_dir, 'elliptic_txs_features.csv'), header=None, names=feat_cols)
    
    df_class = pd.read_csv(os.path.join(data_dir, 'elliptic_txs_classes.csv'))
    df_class.columns = ['txid', 'class_label']
    
    df_edges = pd.read_csv(os.path.join(data_dir, 'elliptic_txs_edgelist.csv'), header=None, names=['src', 'dst'])
    # Ensure src and dst are integers to match features and classes
    df_edges['src'] = pd.to_numeric(df_edges['src'], errors='coerce')
    df_edges['dst'] = pd.to_numeric(df_edges['dst'], errors='coerce')
    df_edges = df_edges.dropna()
    df_edges = df_edges.astype(int)
    
    print("Elliptic dataset loaded into memory.")

def get_dataset():
    """
    Returns the loaded dataset.
    """
    return df_feat, df_class, df_edges

def get_timeline_data():
    """
    Aggregates transaction counts by time step and class.
    """
    # Join features (which has the timestep in feature1) and classes
    df = df_feat[['txid', 'feature1']].merge(df_class, on='txid')
    
    # Group by timestep and class_label
    timeline = df.groupby(['feature1', 'class_label']).size().unstack(fill_value=0)
    
    # Rename columns for clarity (1=illicit, 2=licit, unknown=unknown)
    # The actual class labels in the dataset are strings '1', '2', 'unknown'
    result = []
    for timestep, row in timeline.iterrows():
        result.append({
            "timestep": int(timestep),
            "illicit": int(row.get('1', 0)),
            "licit": int(row.get('2', 0)),
            "unknown": int(row.get('unknown', 0))
        })
    return result
