from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import httpx
import os

router = APIRouter()

OPENROUTER_KEY = os.getenv("OPENROUTER_API_KEY", "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")

class ExplainRequest(BaseModel):
    prompt: str

@router.post("")
async def explain(request: ExplainRequest):
    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                "https://openrouter.ai/api/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {OPENROUTER_KEY}",
                    "Content-Type": "application/json",
                    "HTTP-Referer": "http://localhost:5173",
                    "X-Title": "ChainTrace"
                },
                json={
                    "model": "mistralai/mistral-7b-instruct:free",
                    "messages": [
                        {"role": "user", "content": request.prompt}
                    ],
                },
            )

            print("OpenRouter response status:", response.status_code)
            print("OpenRouter response:", response.text)

            if response.status_code != 200:
                raise HTTPException(status_code=response.status_code, detail=response.text)

            data = response.json()
            return {"explanation": data["choices"][0]["message"]["content"]}

    except Exception as e:
        print("Error in explain:", str(e))
        return {"explanation": "I'm sorry, I couldn't process that request right now. Let's try again later!"}
