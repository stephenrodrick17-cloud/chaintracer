from .base_agent import BaseAgent
from typing import Dict, Any
from datetime import datetime
import json


class ReportingAgent(BaseAgent):
    """
    Agent responsible for generating and distributing fraud reports
    - Detailed reports
    - Alert notifications
    - Audit logs
    """

    def __init__(self):
        super().__init__("reporting_agent")

    async def process(self, data: Dict[str, Any]) -> Dict[str, Any]:
        self.update_status("reporting")
        results = {
            "source": "reporting_agent",
            "report": {},
            "status": "success"
        }

        try:
            analysis = data.get("analysis", {})
            verification = data.get("verification", {})
            collected_data = data.get("collected_data", {})

            # Generate report
            report = self._generate_report(collected_data, analysis, verification)
            results["report"] = report

            # Save to database (mock)
            self._save_report_to_db(report)

        except Exception as e:
            results["status"] = "error"
            results["error"] = str(e)

        self.update_status("idle")
        return results

    def _generate_report(self, collected_data: Dict[str, Any], analysis: Dict[str, Any], verification: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate a comprehensive fraud report
        """
        return {
            "report_id": f"REP-{datetime.now().strftime('%Y%m%d%H%M%S')}",
            "timestamp": datetime.now().isoformat(),
            "target": collected_data.get("address", collected_data.get("tx_hash", "unknown")),
            "risk_summary": {
                "overall_risk": analysis.get("risk_score", 0),
                "detected_fraud_types": analysis.get("fraud_types", []),
                "verification_confidence": verification.get("confidence", 0)
            },
            "analysis_details": analysis.get("analysis", {}),
            "verification_details": verification.get("verification", {}),
            "recommendations": self._generate_recommendations(analysis, verification)
        }

    def _save_report_to_db(self, report: Dict[str, Any]) -> None:
        """
        Save report to database (mock implementation)
        """
        import sys
        import os
        sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
        from database.db import get_db_connection
        try:
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS fraud_reports (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    report_id TEXT UNIQUE,
                    timestamp TEXT,
                    target TEXT,
                    report_data TEXT
                )
            """)
            cursor.execute(
                "INSERT INTO fraud_reports (report_id, timestamp, target, report_data) VALUES (?, ?, ?, ?)",
                (report["report_id"], report["timestamp"], report["target"], json.dumps(report))
            )
            conn.commit()
            conn.close()
        except Exception as e:
            print(f"Error saving report: {e}")

    def _generate_recommendations(self, analysis: Dict[str, Any], verification: Dict[str, Any]) -> list:
        """
        Generate actionable recommendations based on analysis
        """
        recommendations = []
        risk_score = analysis.get("risk_score", 0)

        if risk_score > 0.8:
            recommendations.append("IMMEDIATE: Block address/transaction")
            recommendations.append("IMMEDIATE: Report to authorities")
        elif risk_score > 0.5:
            recommendations.append("HIGH: Monitor closely")
            recommendations.append("HIGH: Flag for manual review")
        elif risk_score > 0.3:
            recommendations.append("MEDIUM: Keep on watchlist")

        if verification.get("confidence", 0) > 0.7:
            recommendations.append("Confidence in findings is high")

        return recommendations
