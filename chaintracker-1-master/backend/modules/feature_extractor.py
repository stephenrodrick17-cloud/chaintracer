
import numpy as np

def extract_features_from_tx(tx, addr_summary):
    inputs = tx.get('inputs', [])
    outputs = tx.get('out', [])
    in_vals = [i.get('prev_out', {}).get('value', 0) for i in inputs]
    out_vals = [o.get('value', 0) for o in outputs]
    total_in = sum(in_vals)
    total_out = sum(out_vals)
    fee = total_in - total_out
    n_in = max(tx.get('vin_sz', 1), 1)
    n_out = max(tx.get('vout_sz', 1), 1)
    return {
        'n_inputs': n_in,
        'n_outputs': n_out,
        'total_input': total_in,
        'total_output': total_out,
        'fee': fee,
        'fee_ratio': fee / total_in if total_in > 0 else 0,
        'output_ratio': n_out / n_in,
        'avg_out_val': total_out / n_out,
        'max_out_val': max(out_vals) if out_vals else 0,
        'min_out_val': min(out_vals) if out_vals else 0,
        'tx_size': tx.get('size', 0),
        'block_height': tx.get('block_height', 0),
        'n_tx_total': addr_summary.get('n_tx', 0),
        'total_received': addr_summary.get('total_received', 0),
        'total_sent': addr_summary.get('total_sent', 0),
        'balance_ratio': addr_summary.get('final_balance', 0) /
                         max(addr_summary.get('total_received', 1), 1)
    }

def build_feature_vector(extracted_dict, feature_medians, real_feature_indices):
    vec = feature_medians.copy()
    vals = list(extracted_dict.values())
    for i, idx in enumerate(real_feature_indices):
        if i < len(vals) and idx < len(vec):
            vec[idx] = vals[i]
    return vec.reshape(1, -1)
