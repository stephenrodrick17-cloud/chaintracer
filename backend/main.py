
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from modules.dataset_loader import load_dataset
from modules.model_service import load_models
from routers import predict_routes, trace_routes, graph_routes, dataset_routes, report_routes, multi_agent_routes, explain_routes
from database.db import create_tables

app = FastAPI(title='Multi-Agent Fraud Detection System', version='2.0')

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health_check():
    return {"status": "ok"}

@app.on_event('startup')
async def startup():
    create_tables()     # Init SQLite tables
    print('Database tables initialized')
    load_dataset()      # Load all 3 CSVs into memory
    load_models()       # Load RF + XGBoost + scaler
    print('All modules ready - Multi-Agent Fraud Detection System active')

app.include_router(predict_routes.router, prefix='/api/predict', tags=['Prediction'])
app.include_router(trace_routes.router,   prefix='/api/trace', tags=['Trace'])
app.include_router(graph_routes.router,   prefix='/api/graph', tags=['Graph'])
app.include_router(dataset_routes.router, prefix='/api/dataset', tags=['Dataset'])
app.include_router(report_routes.router,  prefix='/api/report', tags=['Report'])
app.include_router(multi_agent_routes.router, prefix='/api/multi-agent', tags=['Multi-Agent System'])
app.include_router(explain_routes.router, prefix='/api/explain', tags=['Explain'])
