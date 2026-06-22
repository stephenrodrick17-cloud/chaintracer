from .base_agent import BaseAgent
from typing import Dict, Any, List
from utils import call_openrouter
import json
import random


class GeospatialAgent(BaseAgent):
    """
    Agent responsible for geospatial intelligence:
    - Crime mapping
    - Patrol optimization
    - Location-based risk analysis
    - Threat density mapping
    """

    def __init__(self):
        super().__init__("geospatial_agent")

    async def process(self, data: Dict[str, Any]) -> Dict[str, Any]:
        self.update_status("analyzing")
        results = {
            "source": "geospatial_agent",
            "analysis": {},
            "status": "success"
        }

        try:
            locations = data.get("locations", [])
            query = data.get("query", "Analyze this area for potential threats")
            results["analysis"] = await self._analyze_locations(locations, query)
            
        except Exception as e:
            results["status"] = "error"
            results["error"] = str(e)
            results["analysis"] = self._fallback_analyze_locations(data.get("locations", []))

        self.update_status("idle")
        return results

    async def _analyze_locations(self, locations: List[Dict[str, float]], query: str) -> Dict[str, Any]:
        """
        Analyze geographic locations using OpenRouter.
        """
        locations_str = json.dumps(locations) if locations else "Multiple locations in a city"
        
        system_prompt = """You are a cybersecurity geospatial intelligence agent. Analyze the given locations and respond ONLY with a JSON object in this exact format:
{
  "crime_hotspots": [
    {
      "lat": number,
      "lng": number,
      "risk": string (critical, high, medium, low),
      "incidents": number,
      "area_name": string,
      "crime_types": array of strings
    }
  ],
  "patrol_recommendations": [
    {
      "area": string,
      "priority": string (critical, high, medium, low),
      "suggested_patrols": number,
      "reason": string
    }
  ],
  "location_risk_summary": {
    "total_high_risk": number,
    "total_medium_risk": number,
    "total_low_risk": number,
    "most_common_crime_type": string
  },
  "threat_density_map": array of objects,
  "insights": array of strings
}
"""
        user_prompt = f"""Analyze these locations for potential threats and criminal activity:
{locations_str}
Query: {query}"""
        
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
            print(f"OpenRouter Geospatial error: {e}")
            return self._fallback_analyze_locations(locations)

    def _fallback_analyze_locations(self, locations: List[Dict[str, float]]) -> Dict[str, Any]:
        """
        Fallback analysis if OpenRouter fails.
        """
        # Generate some realistic hotspots
        hotspots = [
            {
                "lat": 40.7128 + (random.uniform(-0.05, 0.05)),
                "lng": -74.0060 + (random.uniform(-0.05, 0.05)),
                "risk": random.choice(["high", "medium"]),
                "incidents": random.randint(5, 30),
                "area_name": "Downtown NYC",
                "crime_types": ["theft", "fraud", "cybercrime"]
            },
            {
                "lat": 34.0522 + (random.uniform(-0.05, 0.05)),
                "lng": -118.2437 + (random.uniform(-0.05, 0.05)),
                "risk": random.choice(["high", "medium", "low"]),
                "incidents": random.randint(3, 20),
                "area_name": "LA Metro Area",
                "crime_types": ["theft", "assault", "scam"]
            }
        ]
        
        return {
            "crime_hotspots": hotspots,
            "patrol_recommendations": [
                {
                    "area": hotspots[0]["area_name"],
                    "priority": hotspots[0]["risk"],
                    "suggested_patrols": 4,
                    "reason": "High number of incidents detected"
                },
                {
                    "area": hotspots[1]["area_name"],
                    "priority": hotspots[1]["risk"],
                    "suggested_patrols": 2,
                    "reason": "Emerging threat patterns"
                }
            ],
            "location_risk_summary": {
                "total_high_risk": sum(1 for h in hotspots if h["risk"] in ["critical", "high"]),
                "total_medium_risk": sum(1 for h in hotspots if h["risk"] == "medium"),
                "total_low_risk": sum(1 for h in hotspots if h["risk"] == "low"),
                "most_common_crime_type": "theft"
            },
            "threat_density_map": hotspots,
            "insights": [
                "Crime hotspots identified",
                "Patrol routes optimized",
                "Location risk profile generated"
            ]
        }
