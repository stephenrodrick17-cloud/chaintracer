
import networkx as nx
from .dataset_loader import get_dataset

# Global cache for the dataset graph and class map
_G_dataset = None
_class_map = None

def get_subgraph(txid: str, hops: int = 2):
    """
    Extracts a subgraph around a txid from the Elliptic edgelist.
    """
    global _G_dataset
    _, _, df_edges = get_dataset()
    
    if _G_dataset is None:
        print("Building global dataset graph for the first time...")
        _G_dataset = nx.from_pandas_edgelist(df_edges, source='src', target='dst', create_using=nx.DiGraph())
        print(f"Dataset graph built with {len(_G_dataset.nodes())} nodes and {len(_G_dataset.edges())} edges.")
    
    txid_int = int(txid) if str(txid).isdigit() else txid
    print(f"Searching for txid_int: {txid_int} (type: {type(txid_int)})")
    if txid_int not in _G_dataset:
        print(f"TXID {txid_int} not found in _G_dataset.")
        return nx.DiGraph()

    # Get nodes within N hops
    nodes = {txid_int}
    for _ in range(hops):
        new_nodes = set()
        for node in nodes:
            new_nodes.update(_G_dataset.successors(node))
            new_nodes.update(_G_dataset.predecessors(node))
        nodes.update(new_nodes)
    
    return _G_dataset.subgraph(nodes)

def to_cytoscape_json(G):
    """
    Converts a NetworkX graph to Cytoscape JSON format.
    """
    global _class_map
    # Try to load dataset only if it exists/is needed
    if _class_map is None:
        try:
            from .dataset_loader import get_dataset
            _, df_class, _ = get_dataset()
            if df_class is not None:
                print("Building global class map...")
                _class_map = dict(zip(df_class['txid'], df_class['class_label']))
            else:
                _class_map = {}
        except Exception as e:
            print(f"Error loading class map: {e}")
            _class_map = {}
    
    elements = []
    for node in G.nodes():
        node_data = G.nodes[node]
        # Try to get label from class map (for dataset nodes) or node data (for real-world nodes)
        try:
            node_id_int = int(node) if str(node).isdigit() else None
            label = _class_map.get(node_id_int, node_data.get('type', 'unknown')) if node_id_int is not None else node_data.get('type', 'unknown')
        except:
            label = node_data.get('type', 'unknown')
        
        # Determine color type
        color_type = 'unknown'
        if label == '1' or label == 'illicit': color_type = 'illicit'
        elif label == '2' or label == 'licit': color_type = 'licit'
        elif label == 'suspicious': color_type = 'suspicious'

        elements.append({
            'data': {
                'id': str(node),
                'label': str(node)[:8] if not node_data.get('is_address') else f"{str(node)[:6]}...",
                'type': color_type,
                'is_address': node_data.get('is_address', False)
            }
        })
    
    for u, v in G.edges():
        elements.append({
            'data': {
                'source': str(u),
                'target': str(v)
            }
        })
    
    return elements

async def build_realworld_graph(address: str, hops: int = 1, max_nodes: int = 50):
    """
    Builds a multi-hop graph for a real-world address.
    Limited to prevent API rate limiting and timeouts.
    """
    from . import blockchain_api
    G = nx.DiGraph()
    G.add_node(address, is_address=True, type='licit')
    
    # Track nodes to process for multi-hop
    to_process = [(address, 0)]
    processed = set()
    total_nodes = 1
    
    while to_process and total_nodes < max_nodes:
        curr_addr, depth = to_process.pop(0)
        if curr_addr in processed or depth >= hops:
            continue
        processed.add(curr_addr)
        
        print(f"Fetching summary for {curr_addr} at depth {depth}...")
        summary = await blockchain_api.get_address_summary(curr_addr)
        if "error" in summary:
            print(f"Error fetching {curr_addr}: {summary['error']}")
            continue

        # Limit transactions processed per address to avoid explosion
        txs = summary.get('txs', [])[:10] 
        for tx in txs:
            if total_nodes >= max_nodes: break
            
            tx_hash = tx['hash']
            if tx_hash not in G:
                G.add_node(tx_hash, is_address=False, type='unknown')
                total_nodes += 1
            
            # Link inputs to TX
            for inp in tx.get('inputs', [])[:5]: # Limit inputs
                if total_nodes >= max_nodes: break
                prev_out = inp.get('prev_out', {})
                addr = prev_out.get('addr')
                if addr:
                    if addr not in G:
                        G.add_node(addr, is_address=True, type='unknown')
                        total_nodes += 1
                    G.add_edge(addr, tx_hash)
                    if depth + 1 < hops:
                        to_process.append((addr, depth + 1))
            
            # Link TX to outputs
            for out in tx.get('out', [])[:5]: # Limit outputs
                if total_nodes >= max_nodes: break
                addr = out.get('addr')
                if addr:
                    if addr not in G:
                        G.add_node(addr, is_address=True, type='unknown')
                        total_nodes += 1
                    G.add_edge(tx_hash, addr)
                    if depth + 1 < hops:
                        to_process.append((addr, depth + 1))

    return to_cytoscape_json(G)

def detect_peeling_chain(G, start_node, length_threshold=2):
    """
    Identifies if a node is part of a peeling chain.
    In our graph: Address -> Transaction -> Address
    """
    if start_node not in G:
        return False, 0
        
    chain_length = 0
    curr = start_node
    
    while True:
        # If curr is an Address, it should have 1 outgoing edge to a Transaction
        successors = list(G.successors(curr))
        if len(successors) != 1:
            break
            
        tx_node = successors[0]
        # If tx_node is a Transaction, it should have exactly 2 outputs for a peeling chain
        tx_successors = list(G.successors(tx_node))
        if len(tx_successors) != 2:
            break
            
        # One of these outputs must be the next hop address
        # We'll pick the one that is not the payment (heuristically, the one that continues the chain)
        next_addr = None
        for s in tx_successors:
            # If this successor address itself has a transaction, it's the chain continuation
            if len(list(G.successors(s))) > 0:
                next_addr = s
                break
        
        if next_addr:
            curr = next_addr
            chain_length += 1
        else:
            break
            
    return chain_length >= length_threshold, chain_length

def detect_fan_in_out(G, node):
    """
    Detects fan-in (many inputs to one) and fan-out (one input to many) patterns.
    High fan-in/out ratios are common in mixing services.
    """
    if node not in G:
        return {"fan_in": 0, "fan_out": 0, "is_suspicious": False}
        
    fan_in = len(list(G.predecessors(node)))
    fan_out = len(list(G.successors(node)))
    
    # Suspicious thresholds (common in mixers)
    is_suspicious = fan_in > 10 or fan_out > 10
    
    return {
        "fan_in": fan_in,
        "fan_out": fan_out,
        "is_suspicious": is_suspicious
    }
