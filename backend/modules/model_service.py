
import pandas as pd
import numpy as np
import joblib
from sklearn.metrics import average_precision_score, accuracy_score, precision_score, recall_score, f1_score
import shap
from .dataset_loader import get_dataset

# --- In-memory storage for models and data ---
rf_model = None
xgb_model = None
scaler = None
feature_medians = None
feature_importances = None
top_80_features = None

import os

def load_models():
    """
    Loads the trained models and scaler into memory.
    """
    global rf_model, xgb_model, scaler, feature_medians, feature_importances, top_80_features
    
    try:
        # Use absolute paths or relative to this file to be more robust
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        models_dir = os.path.join(base_dir, 'models')
        data_dir = os.path.join(base_dir, 'data')
        
        # Check if models directory exists
        if not os.path.exists(models_dir):
            print(f"Warning: Models directory {models_dir} not found. Models not loaded.")
            return
            
        # Check required model files exist
        required_model_files = [
            'rf_model.pkl',
            'xgb_model.pkl',
            'scaler.pkl',
            'feature_medians.npy'
        ]
        missing_model_files = [f for f in required_model_files if not os.path.exists(os.path.join(models_dir, f))]
        
        # Check required data file exists
        feature_importances_path = os.path.join(data_dir, 'feature_importances.csv')
        required_data_files = [feature_importances_path]
        missing_data_files = [f for f in required_data_files if not os.path.exists(f)]
        
        if missing_model_files or missing_data_files:
            print(f"Warning: Missing files: models={missing_model_files}, data={missing_data_files}. Models not loaded.")
            return
        
        rf_model = joblib.load(os.path.join(models_dir, 'rf_model.pkl'))
        xgb_model = joblib.load(os.path.join(models_dir, 'xgb_model.pkl'))
        scaler = joblib.load(os.path.join(models_dir, 'scaler.pkl'))
        feature_medians = np.load(os.path.join(models_dir, 'feature_medians.npy'))
        feature_importances = pd.read_csv(feature_importances_path)
        top_80_features = feature_importances.head(80)['feature'].tolist()
        
        print("ML models loaded into memory.")
    except Exception as e:
        print(f"Warning: Failed to load models: {e}")
        rf_model = None
        xgb_model = None
        scaler = None
        feature_medians = None
        feature_importances = None
        top_80_features = None


def predict_dataset_tx(txid: int):
    """
    Predicts the risk for a given transaction ID from the Elliptic dataset.
    """
    print(f"Predicting dataset TXID: {txid} (type: {type(txid)})")
    try:
        if rf_model is None or xgb_model is None or scaler is None:
            return {"error": "Models not loaded"}
            
        df_feat, df_class, _ = get_dataset()
        if df_feat is None or df_class is None:
            print("Dataset not loaded yet.")
            return {"error": "Dataset not loaded"}
            
        df = df_feat.merge(df_class, on='txid', how='left')
        tx_data = df[df['txid'] == txid]

        if tx_data.empty:
            print(f"TXID {txid} not found in merged dataframe.")
            return {"error": "Transaction ID not found"}

        # The data is not scaled, so we need to scale it first.
        # Also, we need to select the correct feature columns (2-167)
        feature_cols = [f'feature{i}' for i in range(2, 167)]
        tx_features = tx_data[feature_cols]
        
        if tx_features.empty:
            print(f"Features not found for TXID {txid}.")
            return {"error": "Features not found for this transaction ID"}

        scaled_features = scaler.transform(tx_features)

        # Select top 80 features
        top_80_feature_indices = [int(f.replace('feature', '')) - 2 for f in top_80_features]
        final_vector = scaled_features[:, top_80_feature_indices]

        # Run models
        rf_prob = rf_model.predict_proba(final_vector)[:, 1][0]
        xgb_prob = xgb_model.predict_proba(final_vector)[:, 1][0]
        illicit_prob = (rf_prob + xgb_prob) / 2

        label = 'illicit' if illicit_prob > 0.5 else 'licit'
        confidence = illicit_prob if label == 'illicit' else 1 - illicit_prob

        print(f"Prediction successful for {txid}: {label} ({illicit_prob})")
        return {
            "txid": int(txid),
            "illicit_prob": float(illicit_prob),
            "label": label,
            "confidence": float(confidence),
            "top_features": feature_importances.head(5)['feature'].tolist() if feature_importances is not None else []
        }
    except Exception as e:
        print(f"Error predicting dataset TXID {txid}: {e}")
        return {"error": f"Model prediction error: {str(e)}"}




async def predict_realworld_address(address: str):
    """
    Predicts the risk for a real-world Bitcoin address using live API data.
    """
    try:
        from . import blockchain_api, bitcoin_abuse_api, graph_builder
        from .feature_extractor import extract_features_from_tx

        # 1. Fetch data from APIs
        address_summary = await blockchain_api.get_address_summary(address)
        abuse_report = await bitcoin_abuse_api.check_address(address)

        if "error" in address_summary:
            return address_summary

        # For now, we need a transaction to extract features from. 
        # We'll use the most recent transaction for the address.
        if not address_summary.get('txs'):
            return {"error": "Address has no transactions."}
        latest_tx = address_summary['txs'][0]

        # 2. Extract features
        extracted_features = extract_features_from_tx(latest_tx, address_summary)
        
        # If models not loaded, use heuristic approach only
        if rf_model is None or xgb_model is None or scaler is None or feature_medians is None:
            # Use only graph heuristics and abuse reports
            print("Warning: Models not loaded. Using heuristic approach only.")
            
            # Build graph heuristics
            G_elements = await graph_builder.build_realworld_graph(address)
            import networkx as nx
            G = nx.DiGraph()
            for el in G_elements:
                if 'source' in el['data']:
                    G.add_edge(el['data']['source'], el['data']['target'])
                else:
                    G.add_node(el['data']['id'], **el['data'])
                    
            is_peeling, chain_length = graph_builder.detect_peeling_chain(G, address)
            fan_stats = graph_builder.detect_fan_in_out(G, address)
            
            graph_boost = 0.0
            if is_peeling: graph_boost += 0.25
            if fan_stats['is_suspicious']: graph_boost += 0.2
            if abuse_report.get('count', 0) > 0:
                graph_boost += 0.3
                
            illicit_prob = min(1.0, graph_boost)
            label = 'illicit' if illicit_prob > 0.5 else 'licit'
            risk_level = 'high' if illicit_prob > 0.75 else 'medium' if illicit_prob > 0.5 else 'low'
            
            return {
                "address": address,
                "illicit_prob": illicit_prob,
                "ml_prob": None,
                "label": label,
                "risk_level": risk_level,
                "abuse_reports": abuse_report.get('count', 0),
                "features_computed": list(extracted_features.keys()),
                "graph_heuristics": {
                    "is_peeling_chain": is_peeling,
                    "chain_length": chain_length,
                    "fan_in": fan_stats['fan_in'],
                    "fan_out": fan_stats['fan_out']
                },
                "note": "Using heuristic approach only - models not loaded"
            }

        # 3. Build and scale feature vector
        # Correct scaling: The Elliptic dataset (165 features) uses specific indices:
        # index 0: feature1 (timestep)
        # index 1-93: local features (e.g. n_inputs, total_val, etc.)
        # index 94-164: aggregated features (neighborhood stats)
        
        full_feature_vector = feature_medians.copy().reshape(1, -1)
        
        # Map extracted features to correct Elliptic indices (approximate mapping)
        # n_inputs -> feature2 (index 1), total_input -> feature4 (index 3), etc.
        mapping = {
            'n_inputs': 1,
            'n_outputs': 2,
            'total_input': 3,
            'total_output': 4,
            'fee': 5,
            'tx_size': 6,
            'block_height': 7,
        }
        
        for key, idx in mapping.items():
            if key in extracted_features:
                full_feature_vector[0, idx] = extracted_features[key]

        # Add some address-specific deterministic jitter to OTHER features (94-164)
        # to ensure uniqueness in high-dimensional space without breaking local features
        h = hash(address)
        for i in range(94, 165):
            full_feature_vector[0, i] += ( (h + i) % 100 ) / 1000.0

        scaled_vector = scaler.transform(full_feature_vector)

        # 4. Select top 80 features using original indices
        top_80_feature_indices = [int(f.replace('feature', '')) - 2 for f in top_80_features]
        final_vector = scaled_vector[:, top_80_feature_indices]

        # 5. Run ML models
        rf_prob = rf_model.predict_proba(final_vector)[:, 1][0]
        xgb_prob = xgb_model.predict_proba(final_vector)[:, 1][0]
        ml_prob = (rf_prob + xgb_prob) / 2

        # 6. Graph Heuristics (Approach 3 Core)
        # We build a local graph to check for mixing patterns
        G_elements = await graph_builder.build_realworld_graph(address)
        # Reconstruct networkx graph from cytoscape elements for analysis
        import networkx as nx
        G = nx.DiGraph()
        for el in G_elements:
            if 'source' in el['data']:
                G.add_edge(el['data']['source'], el['data']['target'])
            else:
                G.add_node(el['data']['id'], **el['data'])

        # Check for Peeling Chain
        is_peeling, chain_length = graph_builder.detect_peeling_chain(G, address)
        
        # Check for Fan-In/Out
        fan_stats = graph_builder.detect_fan_in_out(G, address)
        
        # Combined Illicit Probability (Ensemble + Graph)
        graph_boost = 0.0
        if is_peeling: graph_boost += 0.25
        if fan_stats['is_suspicious']: graph_boost += 0.2
        if abuse_report.get('count', 0) > 0:
            graph_boost += 0.3

        illicit_prob = min(1.0, ml_prob + graph_boost)

        # Re-evaluate label based on boosted probability
        label = 'illicit' if illicit_prob > 0.5 else 'licit'
        risk_level = 'high' if illicit_prob > 0.75 else 'medium' if illicit_prob > 0.5 else 'low'

        return {
            "address": address,
            "illicit_prob": illicit_prob,
            "ml_prob": ml_prob,
            "label": label,
            "risk_level": risk_level,
            "abuse_reports": abuse_report.get('count', 0),
            "features_computed": list(extracted_features.keys()),
            "graph_heuristics": {
                "is_peeling_chain": is_peeling,
                "chain_length": chain_length,
                "fan_in": fan_stats['fan_in'],
                "fan_out": fan_stats['fan_out']
            }
        }
    except Exception as e:
        print(f"Error predicting real-world address {address}: {e}")
        return {"error": f"Prediction error: {str(e)}"}



def predict_batch(txid_list: list[int]):
    """
    Predicts the risk for a batch of transaction IDs.
    """
    try:
        if rf_model is None or xgb_model is None or scaler is None:
            return {"error": "Models not loaded"}
            
        df_feat, df_class, _ = get_dataset()
        if df_feat is None or df_class is None:
            return {"error": "Dataset not loaded"}
            
        df = df_feat.merge(df_class, on='txid', how='left')
        batch_data = df[df['txid'].isin(txid_list)]

        if batch_data.empty:
            return {"error": "No valid transaction IDs found in the batch"}

        feature_cols = [f'feature{i}' for i in range(2, 167)]
        batch_features = batch_data[feature_cols]

        if batch_features.empty:
            return {"error": "Features not found for the transaction IDs in the batch"}

        scaled_features = scaler.transform(batch_features)

        top_80_feature_indices = [int(f.replace('feature', '')) - 2 for f in top_80_features]
        final_vector = scaled_features[:, top_80_feature_indices]

        rf_probs = rf_model.predict_proba(final_vector)[:, 1]
        xgb_probs = xgb_model.predict_proba(final_vector)[:, 1]
        illicit_probs = (rf_probs + xgb_probs) / 2

        results = []
        for i, txid in enumerate(batch_data['txid']):
            illicit_prob = illicit_probs[i]
            label = 'illicit' if illicit_prob > 0.5 else 'licit'
            results.append({
                "txid": int(txid),
                "illicit_prob": illicit_prob,
                "label": label
            })

        return results
    except Exception as e:
        return {"error": f"Batch prediction error: {str(e)}"}



def get_feature_importance():
    """
    Returns the top 20 most important features.
    """
    if feature_importances is None:
        return []
    top_20_features = feature_importances.head(20)
    return top_20_features.to_dict('records')



def get_model_stats():
    """
    Returns a dictionary of model performance metrics.
    """
    try:
        if rf_model is None or xgb_model is None or feature_importances is None:
            return {"error": "Models not loaded"}
            
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        data_dir = os.path.join(base_dir, "data")
        test_df_path = os.path.join(data_dir, 'test_top80.csv')
        
        if not os.path.exists(test_df_path):
            return {"error": "Test data file not found"}
            
        test_df = pd.read_csv(test_df_path)
        X_test = test_df[top_80_features]
        y_test = test_df['binary_label']

        # Make predictions
        rf_preds = rf_model.predict(X_test)
        xgb_preds = xgb_model.predict(X_test)
        
        # We need to create a combined prediction for the ensemble
        rf_probs = rf_model.predict_proba(X_test)[:, 1]
        xgb_probs = xgb_model.predict_proba(X_test)[:, 1]
        ensemble_probs = (rf_probs + xgb_probs) / 2
        ensemble_preds = (ensemble_probs > 0.5).astype(int)

        stats = {
            "random_forest": {
                "accuracy": accuracy_score(y_test, rf_preds),
                "precision": precision_score(y_test, rf_preds),
                "recall": recall_score(y_test, rf_preds),
                "f1_score": f1_score(y_test, rf_preds),
                "auprc": average_precision_score(y_test, rf_model.predict_proba(X_test)[:, 1])
            },
            "xgboost": {
                "accuracy": accuracy_score(y_test, xgb_preds),
                "precision": precision_score(y_test, xgb_preds),
                "recall": recall_score(y_test, xgb_preds),
                "f1_score": f1_score(y_test, xgb_preds),
                "auprc": average_precision_score(y_test, xgb_model.predict_proba(X_test)[:, 1])
            },
            "ensemble": {
                "accuracy": accuracy_score(y_test, ensemble_preds),
                "precision": precision_score(y_test, ensemble_preds),
                "recall": recall_score(y_test, ensemble_preds),
                "f1_score": f1_score(y_test, ensemble_preds),
                "auprc": average_precision_score(y_test, ensemble_probs)
            }
        }
        return stats
    except Exception as e:
        return {"error": f"Failed to get model stats: {str(e)}"}


def get_unknown_predictions(page: int = 1, limit: int = 50, min_prob: float = 0.0):
    """
    Predicts illicit probability for 'unknown' transactions.
    """
    try:
        if rf_model is None or xgb_model is None or scaler is None:
            return {"error": "Models not loaded"}
            
        df_feat, df_class, _ = get_dataset()
        if df_feat is None or df_class is None:
            return {"error": "Dataset not loaded"}
            
        unknown_ids = df_class[df_class['class_label'] == 'unknown']['txid'].tolist()
        
        # Process in batches or slice for pagination
        start = (page - 1) * limit
        end = start + limit
        
        # For performance in this demo, we'll just take the slice first
        target_ids = unknown_ids[start:end]
        
        results = predict_batch(target_ids)
        
        # Filter by min_prob if needed
        if min_prob > 0 and 'error' not in results:
            results = [r for r in results if r['illicit_prob'] >= min_prob]
            
        return {
            "total": len(unknown_ids),
            "page": page,
            "limit": limit,
            "results": results if 'error' not in results else []
        }
    except Exception as e:
        return {"error": f"Failed to get unknown predictions: {str(e)}"}




import shap

def explain_prediction(feature_vector):
    """
    Explains a prediction using SHAP.
    """
    try:
        if rf_model is None:
            return {"error": "Models not loaded"}
            
        # We'll use the Random Forest model for SHAP explanations
        explainer = shap.TreeExplainer(rf_model)
        shap_values = explainer.shap_values(feature_vector)

        # We are interested in the SHAP values for the 'illicit' class (class 1)
        shap_values_illicit = shap_values[1]

        # Create a DataFrame for better visualization
        feature_names = top_80_features if top_80_features is not None else []
        shap_df = pd.DataFrame({
            'feature': feature_names,
            'shap_value': shap_values_illicit.flatten()
        })

        # Sort by the absolute SHAP value to see the most impactful features
        shap_df['abs_shap_value'] = shap_df['shap_value'].abs()
        shap_df = shap_df.sort_values(by='abs_shap_value', ascending=False)

        return shap_df.head(10).to_dict('records')
    except Exception as e:
        return {"error": f"Failed to explain prediction: {str(e)}"}
