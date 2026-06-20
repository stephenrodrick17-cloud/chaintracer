
from fastapi import APIRouter
from ..modules import model_service

router = APIRouter()

@router.get("/dataset/{txid}")
async def predict_dataset_transaction(txid: str):
    try:
        txid_int = int(txid)
        return model_service.predict_dataset_tx(txid_int)
    except ValueError:
        return {"error": "Invalid Transaction ID format. Must be an integer."}

@router.post("/batch")
async def predict_batch_transactions(txid_list: list[int]):
    return model_service.predict_batch(txid_list)

@router.get("/model/stats")
async def get_model_statistics():
    return model_service.get_model_stats()

@router.get("/model/features")
async def get_feature_importances():
    return model_service.get_feature_importance()

@router.get("/unknown")
async def get_unknown_predictions(page: int = 1, limit: int = 50, min_prob: float = 0.0):
    return model_service.get_unknown_predictions(page, limit, min_prob)
