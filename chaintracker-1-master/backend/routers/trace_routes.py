
from fastapi import APIRouter
from ..modules import model_service, graph_builder

router = APIRouter()

@router.post("/address")
async def trace_address(address: str):
    return await model_service.predict_realworld_address(address)

@router.get("/{address}/graph")
async def get_address_graph(address: str):
    return await graph_builder.build_realworld_graph(address)

@router.get("/history")
async def get_trace_history():
    # Temporary fix: return empty list for now
    return []
