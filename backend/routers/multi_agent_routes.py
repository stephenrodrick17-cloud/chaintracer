from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from ..modules.multi_agent_system import orchestrator

router = APIRouter()


class FraudCheckRequest(BaseModel):
    address: str | None = None
    tx_hash: str | None = None


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
        "reporting_agent": orchestrator.reporting_agent.status
    }
