
import os
import aiohttp
from dotenv import load_dotenv

load_dotenv()

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1"

async def call_openrouter(system_prompt: str, user_prompt: str, model: str = "meta-llama/llama-3.2-1b-instruct:free") -> str:
    """
    Call OpenRouter API with the given prompts.
    """
    if not OPENROUTER_API_KEY:
        raise ValueError("OPENROUTER_API_KEY not set")
    
    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
        "HTTP-Referer": "https://github.com/stephenrodrick17-cloud/chaintracer",
        "X-Title": "ChainTracer AI"
    }
    
    payload = {
        "model": model,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ]
    }
    
    # Add timeout and error handling
    timeout = aiohttp.ClientTimeout(total=30)
    async with aiohttp.ClientSession(timeout=timeout) as session:
        async with session.post(f"{OPENROUTER_BASE_URL}/chat/completions", headers=headers, json=payload) as response:
            if response.status != 200:
                error_text = await response.text()
                raise Exception(f"OpenRouter API error: {response.status} - {error_text}")
            
            result = await response.json()
            return result["choices"][0]["message"]["content"]

