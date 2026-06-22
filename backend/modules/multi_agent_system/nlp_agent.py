from .base_agent import BaseAgent
from typing import Dict, Any
from utils import call_openrouter
import json


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
            results["analysis"] = await self._classify_text(text_data)
            
        except Exception as e:
            results["status"] = "error"
            results["error"] = str(e)
            results["analysis"] = self._fallback_classify_text(data.get("text", ""))

        self.update_status("idle")
        return results

    async def _classify_text(self, text: str) -> Dict[str, Any]:
        """
        Classify text for scam patterns using OpenRouter.
        """
        if not text:
            return {"error": "No text provided"}

        system_prompt = """You are a cybersecurity NLP agent. Analyze the given text and respond ONLY with a JSON object in this exact format:
{
  "is_scam": boolean,
  "scam_confidence": number (0-1),
  "scam_type": string (one of: phishing, financial_fraud, prize_scam, romance_scam, tech_support_scam, ransomware, unknown),
  "sentiment": string (positive, negative, neutral),
  "key_entities": array of strings,
  "risk_level": string (critical, high, medium, low),
  "insights": array of strings,
  "threat_details": string
}
"""
        user_prompt = f"Analyze this text for suspicious or scam content:\n\n{text}"
        
        try:
            response = await call_openrouter(system_prompt, user_prompt)
            # Try to parse JSON from response
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
            print(f"OpenRouter NLP error: {e}")
            return self._fallback_classify_text(text)

    def _fallback_classify_text(self, text: str) -> Dict[str, Any]:
        """
        Fallback classification if OpenRouter fails.
        """
        if not text:
            return {"error": "No text provided"}

        # Simulated NLP classification
        scam_keywords = ['urgent', 'payment', 'free', 'prize', 'login', 'password', 'bitcoin', 'investment', 'crypto', 'wallet', 'verify', 'account']
        scam_score = sum(1 for keyword in scam_keywords if keyword.lower() in text.lower())
        
        is_scam = scam_score > 1
        confidence = min(0.95, 0.2 + (scam_score * 0.12))

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
            ],
            "threat_details": "Suspicious keywords detected" if is_scam else "No suspicious activity"
        }

    def _determine_scam_type(self, text: str, score: int) -> str:
        if "password" in text.lower() or "login" in text.lower() or "verify" in text.lower():
            return "phishing"
        elif "bitcoin" in text.lower() or "investment" in text.lower() or "crypto" in text.lower() or "wallet" in text.lower():
            return "financial_fraud"
        elif "prize" in text.lower() or "free" in text.lower() or "winner" in text.lower():
            return "prize_scam"
        return "unknown"

    def _extract_key_entities(self, text: str) -> list:
        # Simple entity extraction simulation
        words = text.split()
        entities = [word for word in words if word.istitle()]
        return entities[:8] if entities else []
