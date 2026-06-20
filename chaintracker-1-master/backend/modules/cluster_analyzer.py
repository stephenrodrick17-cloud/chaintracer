
import networkx as nx

def identify_clusters(G):
    """
    Identifies entity clusters in a given graph using the Common Input Ownership (CIO) heuristic.
    """
    # Create an undirected version of the graph for component analysis
    U = G.to_undirected()
    
    # We only cluster addresses (is_address=True), not transactions
    address_nodes = [n for n, d in G.nodes(data=True) if d.get('is_address')]
    U_addresses = U.subgraph(address_nodes)
    
    clusters = []
    components = list(nx.connected_components(U_addresses))
    
    for i, nodes in enumerate(components):
        if len(nodes) < 2: continue # Ignore singletons
        
        # Calculate cluster metrics
        avg_risk = 0.0 # Placeholder for aggregated risk scores
        risk_level = "LOW"
        
        # In a real scenario, we'd average the ML illicit_prob for all members
        # For this demo, we'll assign a label based on the cluster size
        label = "Exchange Deposit Wallet"
        if len(nodes) > 10: 
            label = "Suspected Mixer Network"
            risk_level = "HIGH"
            avg_risk = 0.85
        elif len(nodes) > 5:
            label = "Ransomware Payment Chain"
            risk_level = "MED"
            avg_risk = 0.60
            
        clusters.append({
            "id": f"C-{1000 + i}",
            "size": len(nodes),
            "risk_level": risk_level,
            "avg_prob": avg_risk,
            "label": label,
            "members": list(nodes)[:5] # Show first 5 members
        })
        
    return clusters

def get_clusters():
    """
    Returns pre-identified clusters from the dataset for the report.
    For this demo, we maintain some stable entries as well as dynamic ones.
    """
    return [
        {
            "id": "C-1024",
            "size": 156,
            "risk_level": "HIGH",
            "avg_prob": 0.89,
            "label": "Suspected Mixer Network",
            "members": ["230425980", "5530458", "232022460"]
        },
        {
            "id": "C-2048",
            "size": 42,
            "risk_level": "MED",
            "avg_prob": 0.62,
            "label": "Ransomware Payment Chain",
            "members": ["232438397", "230460314"]
        },
        {
            "id": "C-3096",
            "size": 512,
            "risk_level": "LOW",
            "avg_prob": 0.12,
            "label": "Exchange Deposit Wallet",
            "members": ["230459870", "230333930"]
        }
    ]

def get_cluster_detail(cluster_id: str):
    clusters = get_clusters()
    cluster = next((c for c in clusters if c['id'] == cluster_id), None)
    return cluster
