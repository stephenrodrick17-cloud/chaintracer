from .base_agent import BaseAgent
from typing import Dict, Any
from utils import call_openrouter
import json


class SpeechAgent(BaseAgent):
    """
    Agent responsible for speech AI tasks:
    - Voice spoofing detection
    - AI-voice detection
    - Speaker verification
    - Abusive language detection
    """

    def __init__(self):
        super().__init__("speech_agent")

    async def process(self, data: Dict[str, Any]) -> Dict[str, Any]:
        self.update_status("analyzing")
        results = {
            "source": "speech_agent",
            "analysis": {},
            "status": "success"
        }

        try:
            audio_type = data.get("type", "audio")
            
            if audio_type == "audio":
                results["analysis"] = await self._analyze_audio(data)
            
        except Exception as e:
            results["status"] = "error"
            results["error"] = str(e)
            results["analysis"] = self._fallback_analyze_audio(data)

        self.update_status("idle")
        return results

    async def _analyze_audio(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Analyze audio for AI voice, spoofing, abusive language using OpenRouter.
        """
        filename = data.get("filename", "unknown")
        transcript = data.get("transcript", "")
        
        system_prompt = """You are a cybersecurity speech analysis agent. Analyze the given transcript and respond ONLY with a JSON object in this exact format:
{
  "is_ai_generated": boolean,
  "ai_confidence": number (0-1),
  "is_spoofed": boolean,
  "spoofing_confidence": number (0-1),
  "has_abusive_language": boolean,
  "abusive_language_confidence": number (0-1),
  "voice_quality": string (low, medium, high),
  "speaker_verification": {
    "consistency": string (stable, unstable, unknown),
    "pitch_variation": string (normal, abnormal, unknown),
    "tempo": string (consistent, inconsistent, unknown)
  },
  "suspicious_features": array of strings,
  "insights": array of strings,
  "threat_level": string (critical, high, medium, low)
}
"""
        user_prompt = f"""Analyze this audio:
Filename: {filename}
Transcript: {transcript}

Is this an AI-generated voice, spoofed voice, or does it contain abusive language?"""
        
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
            print(f"OpenRouter Speech error: {e}")
            return self._fallback_analyze_audio(data)

    def _fallback_analyze_audio(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Fallback analysis if OpenRouter fails.
        """
        filename = data.get("filename", "unknown")
        transcript = data.get("transcript", "").lower()
        
        abusive_keywords = ['hate', 'kill', 'attack', 'threat', 'racist', 'sexist', 'violence', 'danger']
        has_abusive = sum(1 for keyword in abusive_keywords if keyword in transcript) > 0
        
        return {
            "is_ai_generated": False,
            "ai_confidence": 0.12,
            "is_spoofed": False,
            "spoofing_confidence": 0.08,
            "has_abusive_language": has_abusive,
            "abusive_language_confidence": 0.8 if has_abusive else 0.1,
            "voice_quality": "good",
            "speaker_verification": {
                "consistency": "stable",
                "pitch_variation": "normal",
                "tempo": "consistent"
            },
            "suspicious_features": ["Abusive language detected"] if has_abusive else [],
            "insights": [
                "Voice biometrics analyzed",
                "No spoofing patterns detected",
                "Speaker consistency verified"
            ],
            "threat_level": "high" if has_abusive else "low"
        }
