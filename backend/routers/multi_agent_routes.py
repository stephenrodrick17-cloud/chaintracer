from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
from ..modules.multi_agent_system import (
    orchestrator,
    ComputerVisionAgent,
    NLPAgent,
    SpeechAgent,
    GeospatialAgent,
    GraphAIAgent,
    IntelligenceFusionAgent
)

router = APIRouter()

# Initialize new agents
cv_agent = ComputerVisionAgent()
nlp_agent = NLPAgent()
speech_agent = SpeechAgent()
geospatial_agent = GeospatialAgent()
graph_ai_agent = GraphAIAgent()
fusion_agent = IntelligenceFusionAgent()


class FraudCheckRequest(BaseModel):
    address: str | None = None
    tx_hash: str | None = None


class CVAnalysisRequest(BaseModel):
    type: str = "image"
    filename: Optional[str] = None


class NLPAnalysisRequest(BaseModel):
    text: str


class SpeechAnalysisRequest(BaseModel):
    type: str = "audio"
    filename: Optional[str] = None


class GeospatialAnalysisRequest(BaseModel):
    locations: Optional[List[Dict[str, Any]]] = None


class GraphAnalysisRequest(BaseModel):
    graph: Optional[Dict[str, Any]] = None


class FusionRequest(BaseModel):
    agent_results: Dict[str, Any]


@router.post("/check")
async def run_fraud_check(request: FraudCheckRequest):
    if not request.address and not request.tx_hash:
        raise HTTPException(status_code=400, detail="Either address or tx_hash must be provided")

    result = await orchestrator.run_pipeline({
        "address": request.address,
        "tx_hash": request.tx_hash
    })

    return result


@router.get("/status")
async def get_agent_status():
    return {
        "collection_agent": orchestrator.collection_agent.status,
        "analysis_agent": orchestrator.analysis_agent.status,
        "verification_agent": orchestrator.verification_agent.status,
        "reporting_agent": orchestrator.reporting_agent.status,
        "computer_vision_agent": cv_agent.status,
        "nlp_agent": nlp_agent.status,
        "speech_agent": speech_agent.status,
        "geospatial_agent": geospatial_agent.status,
        "graph_ai_agent": graph_ai_agent.status,
        "intelligence_fusion_agent": fusion_agent.status
    }


@router.post("/computer-vision")
async def analyze_computer_vision(request: CVAnalysisRequest):
    result = await cv_agent.process(request.dict())
    return result


@router.post("/nlp")
async def analyze_nlp(request: NLPAnalysisRequest):
    result = await nlp_agent.process(request.dict())
    return result


@router.post("/speech")
async def analyze_speech(request: SpeechAnalysisRequest):
    result = await speech_agent.process(request.dict())
    return result


@router.post("/geospatial")
async def analyze_geospatial(request: GeospatialAnalysisRequest):
    result = await geospatial_agent.process(request.dict())
    return result


@router.post("/graph-ai")
async def analyze_graph(request: GraphAnalysisRequest):
    result = await graph_ai_agent.process(request.dict())
    return result


@router.post("/intelligence-fusion")
async def fuse_intelligence(request: FusionRequest):
    result = await fusion_agent.process(request.dict())
    return result
