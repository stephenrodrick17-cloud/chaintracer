from .base_agent import BaseAgent
from typing import Dict, Any
import numpy as np
import joblib
import os
from ..model_service import load_models


class AnalysisAgent(BaseAgent):
    """
    Agent responsible for analyzing collected data using ML models
    Detects:
    - Phishing
    - UPI Scams
    - Online Marketplace Fraud
    - Generic Illicit Activity
    """

    FRAUD_TYPES = [
        "phishing",
        "upi scam",
        "marketplace fraud",
        "illicit activity"
    ]

    def __init__(self):
        super().__init__("analysis_agent")
        self.models = {}
        self.scaler = None
        self.feature_medians = None

    async def process(self, data: Dict[str, Any]) -> Dict[str, Any]:
        self.update_status("analyzing")
        results = {
            "source": "analysis_agent",
            "analysis": {},
            "risk_score": 0.0,
            "fraud_types": [],
            "status": "success"
        }

        try:
            collected_data = data.get("collected_data", {})
            feature_vector = self._extract_features(collected_data)

            # Analyze for each fraud type
            fraud_analysis = {}
            all_scores = []
            for fraud_type in self.FRAUD_TYPES:
                score = self._analyze_fraud_type(feature_vector, fraud_type, collected_data)
                all_scores.append(score)
                fraud_analysis[fraud_type] = {
                    "probability": score,
                    "detected": score > 0.5
                }
                if score > 0.5:
                    results["fraud_types"].append(fraud_type)

            results["analysis"] = fraud_analysis
            results["risk_score"] = max(all_scores) if all_scores else 0.0

        except Exception as e:
            results["status"] = "error"
            results["error"] = str(e)

        self.update_status("idle")
        return results

    def _extract_features(self, collected_data: Dict[str, Any]) -> np.ndarray:
        """
        Extract features from collected data for ML
        """
        blockchain = collected_data.get("blockchain", {})
        abuse = collected_data.get("abuse", {})

        # Extract basic features
        n_tx = blockchain.get("n_tx", 0)
        total_received = blockchain.get("total_received", 0)
        total_sent = blockchain.get("total_sent", 0)
        final_balance = blockchain.get("final_balance", 0)
        abuse_count = abuse.get("count", 0)

        # Calculate additional features
        avg_tx_value = (total_received / n_tx) if n_tx > 0 else 0
        tx_frequency = n_tx  # Simple frequency metric

        return np.array([
            n_tx,
            total_received,
            total_sent,
            final_balance,
            abuse_count,
            avg_tx_value,
            tx_frequency
        ]).reshape(1, -1)

    def _analyze_fraud_type(self, feature_vector: np.ndarray, fraud_type: str, collected_data: Dict[str, Any]) -> float:
        """
        Analyze for a specific fraud type using rule-based + ML approach
        """
        base_score = 0.0
        abuse = collected_data.get("abuse", {})
        blockchain = collected_data.get("blockchain", {})
        n_tx = blockchain.get("n_tx", 0)
        final_balance = blockchain.get("final_balance", 0)
        total_received = blockchain.get("total_received", 0)

        # Rule-based analysis per fraud type
        if fraud_type == "phishing":
            if abuse.get("count", 0) > 0:
                base_score += 0.6
            if n_tx > 20 and final_balance < 100000:  # Many small txs, low balance
                base_score += 0.3

        elif fraud_type == "upi scam":
            if n_tx > 10 and total_received < 50000000:  # Quick, small transactions
                base_score += 0.4
            if abuse.get("count", 0) > 2:
                base_score += 0.4

        elif fraud_type == "marketplace fraud":
            if n_tx > 30:
                base_score += 0.3
            if final_balance < 500000:
                base_score += 0.2

        elif fraud_type == "illicit activity":
            if abuse.get("count", 0) > 0:
                base_score += 0.5
            if n_tx > 50:
                base_score += 0.3
            # Check if there are reports with abuse types
            reports = abuse.get("reports", [])
            if reports:
                base_score += 0.2

        return min(1.0, base_score)
