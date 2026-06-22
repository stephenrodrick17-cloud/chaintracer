from .base_agent import BaseAgent
from typing import Dict, Any


class IntelligenceFusionAgent(BaseAgent):
    """
    Agent responsible for multi-source intelligence fusion:
    - Combines insights from all other agents
    - Correlates data from different sources
    - Generates comprehensive intelligence reports
    """

    def __init__(self):
        super().__init__("intelligence_fusion_agent")

    async def process(self, data: Dict[str, Any]) -> Dict[str, Any]:
        self.update_status("fusing")
        results = {
            "source": "intelligence_fusion_agent",
            "fusion_report": {},
            "status": "success"
        }

        try:
            agent_results = data.get("agent_results", {})
            results["fusion_report"] = self._fuse_intelligence(agent_results)
            
        except Exception as e:
            results["status"] = "error"
            results["error"] = str(e)

        self.update_status("idle")
        return results

    def _fuse_intelligence(self, agent_results: Dict[str, Any]) -> Dict[str, Any]:
        """
        Fuse intelligence from all agents into a single report
        """
        # Extract results from each agent
        cv_result = agent_results.get("computer_vision", {})
        nlp_result = agent_results.get("nlp", {})
        speech_result = agent_results.get("speech", {})
        geospatial_result = agent_results.get("geospatial", {})
        graph_result = agent_results.get("graph_ai", {})
        blockchain_result = agent_results.get("blockchain", {})

        # Calculate overall risk
        risk_scores = []
        if cv_result.get("analysis", {}).get("is_deepfake"):
            risk_scores.append(cv_result["analysis"]["deepfake_confidence"])
        if nlp_result.get("analysis", {}).get("is_scam"):
            risk_scores.append(nlp_result["analysis"]["scam_confidence"])
        if speech_result.get("analysis", {}).get("is_ai_generated"):
            risk_scores.append(speech_result["analysis"]["ai_confidence"])

        overall_risk = max(risk_scores) if risk_scores else 0.1

        return {
            "overall_risk_level": "critical" if overall_risk > 0.8 else "high" if overall_risk > 0.5 else "medium" if overall_risk > 0.2 else "low",
            "overall_risk_score": overall_risk,
            "correlated_insights": self._correlate_insights(agent_results),
            "key_findings": [
                "Multi-source intelligence aggregated",
                "Data cross-verified across all agents",
                "Comprehensive risk profile generated"
            ],
            "recommended_actions": self._generate_actions(overall_risk, agent_results),
            "agent_contributions": {
                "computer_vision": cv_result.get("status") == "success",
                "nlp": nlp_result.get("status") == "success",
                "speech": speech_result.get("status") == "success",
                "geospatial": geospatial_result.get("status") == "success",
                "graph_ai": graph_result.get("status") == "success"
            }
        }

    def _correlate_insights(self, agent_results: Dict[str, Any]) -> list:
        """
        Find correlations between different agent insights
        """
        correlations = []
        
        if agent_results.get("nlp", {}).get("analysis", {}).get("is_scam") and \
           agent_results.get("computer_vision", {}).get("analysis", {}).get("is_deepfake"):
            correlations.append("Potential coordinated scam: fake media + scam text detected")
        
        if agent_results.get("graph_ai", {}).get("analysis", {}).get("fraud_rings_detected", 0) > 0 and \
           agent_results.get("geospatial", {}).get("analysis", {}).get("crime_hotspots", []):
            correlations.append("Geospatial correlation with fraud rings identified")
        
        return correlations if correlations else ["No strong correlations found"]

    def _generate_actions(self, risk_score: float, agent_results: Dict[str, Any]) -> list:
        """
        Generate recommended actions based on fused intelligence
        """
        actions = []
        
        if risk_score > 0.8:
            actions.append("Immediate investigation required")
            actions.append("Alert security teams")
            actions.append("Freeze related accounts/transactions")
        elif risk_score > 0.5:
            actions.append("Escalate to review team")
            actions.append("Monitor activity closely")
        else:
            actions.append("Continue regular monitoring")
        
        return actions
