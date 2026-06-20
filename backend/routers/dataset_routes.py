
from fastapi import APIRouter
from ..modules import dataset_loader

router = APIRouter()

@router.get("/stats")
async def get_dataset_stats():
    df_feat, df_class, df_edges = dataset_loader.get_dataset()
    
    # Get class counts
    class_counts = df_class['class_label'].value_counts()
    
    return {
        "n_transactions": len(df_feat),
        "n_classes": len(df_class),
        "n_edges": len(df_edges),
        "n_classes_illicit": int(class_counts.get('1', 0)),
        "n_classes_licit": int(class_counts.get('2', 0)),
        "n_classes_unknown": int(class_counts.get('unknown', 0))
    }

@router.get("/timeline")
async def get_dataset_timeline():
    return dataset_loader.get_timeline_data()
