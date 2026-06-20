"""
Google Cloud Function entry point for fraud detection
"""
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from mangum import Mangum
from modules.dataset_loader import load_dataset
from modules.model_service import load_models
from routers import predict_routes, trace_routes, graph_routes, dataset_routes, report_routes, multi_agent_routes
from database.db import create_tables

# Initialize once
create_tables()
try:
    load_dataset()
    load_models()
except Exception:
    pass

app = FastAPI(title='Multi-Agent Fraud Detection System (Cloud Function)', version='2.0')
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(predict_routes.router, prefix='/api/predict', tags=['Prediction'])
app.include_router(trace_routes.router,   prefix='/api/trace', tags=['Trace'])
app.include_router(graph_routes.router,   prefix='/api/graph', tags=['Graph'])
app.include_router(dataset_routes.router, prefix='/api/dataset', tags=['Dataset'])
app.include_router(report_routes.router,  prefix='/api/report', tags=['Report'])
app.include_router(multi_agent_routes.router, prefix='/api/multi-agent', tags=['Multi-Agent System'])

# Mangum handler for Cloud Functions
handler = Mangum(app)
