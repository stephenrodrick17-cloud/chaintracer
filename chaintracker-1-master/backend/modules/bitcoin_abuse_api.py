
import httpx
import os
from dotenv import load_dotenv

load_dotenv()

BITCOIN_ABUSE_KEY = os.getenv("BITCOIN_ABUSE_KEY")
ABUSE_BASE = 'https://www.bitcoinabuse.com/api'

async def check_address(address: str):
    if not BITCOIN_ABUSE_KEY or BITCOIN_ABUSE_KEY == 'YOUR_KEY_HERE':
        # Return a neutral result if no key is present, instead of an error that stops the trace
        return {"count": 0, "status": "No API key configured"}
        
    async with httpx.AsyncClient(timeout=10) as client:
        try:
            r = await client.get(f'{ABUSE_BASE}/reports/check',
                params={'address': address, 'api_token': BITCOIN_ABUSE_KEY})
            r.raise_for_status()
            return r.json()
        except httpx.HTTPStatusError as e:
            if e.response.status_code == 404:
                return {"count": 0}
            if e.response.status_code == 429:
                return {"count": 0, "status": "Rate limited"}
            return {"error": f"HTTP error occurred: {e.response.status_code}"}
        except httpx.RequestError as e:
            return {"error": f"An error occurred while requesting {e.request.url!r}."}
