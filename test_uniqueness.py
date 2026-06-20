import asyncio
from backend.modules import model_service

async def test_uniqueness():
    addresses = [
        "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
        "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
        "3E8ociqSstY3XQ7fXqC6K29B35sW49D5N5"
    ]
    
    # Need to load models first
    model_service.load_models()
    
    results = []
    for addr in addresses:
        print(f"Tracing {addr}...")
        res = await model_service.predict_realworld_address(addr)
        results.append(res)
        print(f"Result: {res['risk_level']} (Prob: {res['illicit_prob']:.4f})")
    
    # Check for uniqueness
    probs = [r['illicit_prob'] for r in results]
    if len(set(probs)) == len(probs):
        print("\nSUCCESS: All addresses returned unique illicit probabilities.")
    else:
        print("\nFAILURE: Some addresses returned the same illicit probabilities.")
        for i, p in enumerate(probs):
            print(f"Address {i}: {p}")

if __name__ == "__main__":
    asyncio.run(test_uniqueness())
