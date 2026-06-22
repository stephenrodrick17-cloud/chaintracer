from .base_agent import BaseAgent
from typing import Dict, Any


class NLPAgent(BaseAgent):
    """
    Agent responsible for NLP/LLM tasks:
    - Scam script classification
    - Voice pattern classification
    - Natural language understanding
    """

    def __init__(self):
        super().__init__("nlp_agent")

    async def process(self, data: Dict[str, Any]) -> Dict[str, Any]:
        self.update_status("analyzing")
        results = {
            "source": "nlp_agent",
            "analysis": {},
            "status": "success"
        }

        try:
            text_data = data.get("text", "")
            results["analysis"] = self._classify_text(text_data)
            
        except Exception as e:
            results["status"] = "error"
            results["error"] = str(e)

        self.update_status("idle")
        return results

    def _classify_text(self, text: str) -> Dict[str, Any]:
        """
        Classify text for scam patterns, etc.
        """
        if not text:
            return {"error": "No text provided"}

        # Simulated NLP classification
        scam_keywords = ['urgent', 'payment', 'free', 'prize', 'login', 'password', 'bitcoin', 'investment']
        scam_score = sum(1 for keyword in scam_keywords if keyword.lower() in text.lower())
        
        is_scam = scam_score > 1
        confidence = min(0.95, 0.3 + (scam_score * 0.15))

        return {
            "is_scam": is_scam,
            "scam_confidence": confidence,
            "scam_type": self._determine_scam_type(text, scam_score),
            "sentiment": "negative" if is_scam else "neutral",
            "key_entities": self._extract_key_entities(text),
            "risk_level": "high" if confidence > 0.7 else "medium" if confidence > 0.4 else "low",
            "insights": [
                "Text analyzed for scam patterns",
                "Key entities extracted",
                "Risk level assigned"
            ]
        }

    def _determine_scam_type(self, text: str, score: int) -> str:
        if 'password' in text.lower() or 'login' in text.lower():
            return "phishing"
        elif 'bitcoin' in text.lower() or 'investment' in text.lower():
            return "financial_fraud"
        elif 'prize' in text.lower() or 'free' in text.lower():
            return "prize_scam"
        return "unknown"

    def _extract_key_entities(self, text: str) -> list:
        # Simple entity extraction simulation
        words = text.split()
        entities = [word for word in words if word.istitle()]
        return entities[:5] if entities else []
