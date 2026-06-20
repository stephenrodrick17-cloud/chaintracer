
from fastapi import APIRouter
from ..modules import graph_builder

router = APIRouter()

@router.get("/dataset/{txid}")
async def get_dataset_graph(txid: str, hops: int = 2):
    G = graph_builder.get_subgraph(txid, hops)
    return graph_builder.to_cytoscape_json(G)
