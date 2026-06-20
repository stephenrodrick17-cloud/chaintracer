
import httpx
import asyncio
import time
from functools import lru_cache

BASE = 'https://blockchain.info'
_cache = {}

# Deterministic mock data for when API is rate-limited (429)
def get_mock_data(address: str):
    """
    Generates deterministic unique mock data for a given address 
    to ensure varied results even when rate-limited.
    """
    # Use a simple hash of the address to seed variety
    h = hash(address)
    
    # Generate varied numbers based on hash
    received = 1000000 + (h % 5000000) # 1M to 6M satoshis
    sent = (h % received) # Up to total received
    balance = received - sent
    n_tx = 1 + (h % 15) # 1 to 15 transactions
    
    # Generate a few mock transactions
    txs = []
    for i in range(min(n_tx, 3)): # Just generate 1-3 for demo efficiency
        tx_h = abs(hash(f"{address}_{i}")) % 1000000
        tx_time = int(time.time()) - (i * 3600 * 24) # Daily intervals
        
        txs.append({
            "hash": f"mock_tx_{tx_h}",
            "time": tx_time,
            "block_height": 834000 + (h % 5000),
            "size": 200 + (h % 300),
            "vin_sz": 1 + (h % 3),
            "vout_sz": 1 + (h % 4),
            "inputs": [{"prev_out": {"addr": f"source_addr_{h % 100}", "value": received // n_tx}}],
            "out": [
                {"addr": address, "value": sent // n_tx},
                {"addr": f"change_addr_{h % 200}", "value": (received - sent) // n_tx}
            ]
        })

    return {
        "address": address,
        "total_received": received,
        "total_sent": sent,
        "final_balance": balance,
        "n_tx": n_tx,
        "txs": txs
    }

async def get_address_summary(address: str):
    if address in _cache:
        return _cache[address]
        
    retries = 3
    delay = 1  # Starting delay in seconds
    
    async with httpx.AsyncClient(timeout=15) as client:
        for i in range(retries):
            try:
                r = await client.get(f'{BASE}/rawaddr/{address}?limit=50')
                if r.status_code == 429:
                    print(f"Rate limited (429) for address {address}. Retrying in {delay}s...")
                    await asyncio.sleep(delay)
                    delay *= 2  # Exponential backoff
                    continue
                
                # If we get a 404, it might be a TXID instead of an address
                if r.status_code == 404:
                    print(f"Address {address} not found. Checking if it's a transaction...")
                    # Try to fetch as a transaction
                    tx_r = await client.get(f'{BASE}/rawtx/{address}')
                    if tx_r.status_code == 200:
                        tx_data = tx_r.json()
                        # Wrap tx data in a summary-like structure
                        return {
                            "address": f"TXID: {address}",
                            "is_transaction": True,
                            "total_received": sum(o.get('value', 0) for o in tx_data.get('out', [])),
                            "total_sent": sum(i.get('prev_out', {}).get('value', 0) for i in tx_data.get('inputs', [])),
                            "final_balance": 0,
                            "n_tx": 1,
                            "txs": [tx_data]
                        }
                    return {"error": f"Target {address} not found as address or transaction."}

                r.raise_for_status()
                data = r.json()
                _cache[address] = data
                return data
                
            except httpx.HTTPStatusError as e:
                if e.response.status_code == 429 and i < retries - 1:
                    continue
                if e.response.status_code == 429:
                    print(f"API still rate-limited. Falling back to dynamic mock data for demo.")
                    # Add a flag to indicate this is mock data
                    mock_data = get_mock_data(address)
                    mock_data["is_mock"] = True
                    return mock_data
                return {"error": f"HTTP error occurred: {e.response.status_code}"}
            except httpx.RequestError as e:
                return {"error": f"An error occurred while requesting {e.request.url!r}."}
        
    # If we fall out of the loop due to rate limits
    mock_data = get_mock_data(address)
    mock_data["is_mock"] = True
    return mock_data
