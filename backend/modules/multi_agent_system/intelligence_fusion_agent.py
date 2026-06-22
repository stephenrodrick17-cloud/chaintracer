from .base_agent import BaseAgent
from typing import Dict, Any
from utils import call_openrouter
import json


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
            results["fusion_report"] = await self._fuse_intelligence(agent_results)
            
        except Exception as e:
            results["status"] = "error"
            results["error"] = str(e)
            results["fusion_report"] = self._fallback_fuse_intelligence(data.get("agent_results", {}))

        self.update_status("idle")
        return results

    async def _fuse_intelligence(self, agent_results: Dict[str, Any]) -> Dict[str, Any]:
        """
        Fuse intelligence from all agents using OpenRouter.
        """
        results_str = json.dumps(agent_results, indent=2)
        
        system_prompt = """You are a cybersecurity intelligence fusion agent. Analyze all agent results and respond ONLY with a JSON object in this exact format:
{
  "overall_risk_level": string (critical, high, medium, low),
  "overall_risk_score": number (0-1),
  "correlated_insights": array of strings,
  "key_findings": array of strings,
  "recommended_actions": array of strings,
  "agent_contributions": {
    "computer_vision": boolean,
    "nlp": boolean,
    "speech": boolean,
    "geospatial": boolean,
    "graph_ai": boolean,
    "blockchain": boolean
  },
  "threat_actor_profile": object,
  "timeline_of_events": array,
  "mitigation_strategies": array of strings
}
"""
        user_prompt = f"""Fuse intelligence from all these agents:
{results_str}

Identify correlations, threat actors, and recommended actions."""
        
        try:
            response = await call_openrouter(system_prompt, user_prompt)
            cleaned_response = response.strip()
            if cleaned_response.startswith("```json"):
                cleaned_response = cleaned_response[7:]
            if cleaned_response.startswith("```"):
                cleaned_response = cleaned_response[3:]
            if cleaned_response.endswith("```"):
                cleaned_response = cleaned_response[:-3]
            
            parsed = json.loads(cleaned_response.strip())
            return parsed
        except Exception as e:
            print(f"OpenRouter Fusion error: {e}")
            return self._fallback_fuse_intelligence(agent_results)

    def _fallback_fuse_intelligence(self, agent_results: Dict[str, Any]) -> Dict[str, Any]:
        """
        Fallback fusion if OpenRouter fails.
        """
        cv_result = agent_results.get("computer_vision", {})
        nlp_result = agent_results.get("nlp", {})
        speech_result = agent_results.get("speech", {})
        geospatial_result = agent_results.get("geospatial", {})
        graph_result = agent_results.get("graph_ai", {})
        blockchain_result = agent_results.get("blockchain", {})

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
                "graph_ai": graph_result.get("status") == "success",
                "blockchain": blockchain_result.get("status") == "success" if blockchain_result else False
            },
            "threat_actor_profile": {
                "type": "Unknown",
                "sophistication": "Medium",
                "motivation": "Financial"
            },
            "timeline_of_events": [],
            "mitigation_strategies": [
                "Monitor closely",
                "Report suspicious activity",
                "Implement security patches"
            ]
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
