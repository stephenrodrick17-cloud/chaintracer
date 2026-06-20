
from fastapi import APIRouter
from ..modules import cluster_analyzer

router = APIRouter()

@router.get("/clusters")
async def get_all_clusters():
    return cluster_analyzer.get_clusters()

@router.get("/cluster/{id}")
async def get_cluster_report(id: str):
    return cluster_analyzer.get_cluster_detail(id)
