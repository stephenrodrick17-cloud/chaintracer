
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter()

class ExplainRequest(BaseModel):
    prompt: str

def generate_simple_explanation(prompt: str) -> str:
    """Generate a simple, predefined explanation based on the prompt."""
    # Check for key phrases in the prompt
    prompt_lower = prompt.lower()
    
    if "risk" in prompt_lower or "illicit" in prompt_lower or "fraud" in prompt_lower:
        return """Here's what I know about this transaction's risk assessment:
- The risk score is calculated based on:
  1. Transaction patterns (how many inputs/outputs there are)
  2. Connection to known suspicious addresses
  3. Historical behavior of similar transactions
- If the risk score is over 50%, it means there's a higher chance of illicit activity!
- For this transaction, we found [some relevant info from your prompt]!"""
    
    if "transaction" in prompt_lower:
        return """Let's break down how blockchain transactions work:
- Transactions have inputs (where Bitcoin is coming from) and outputs (where it's going to)
- We analyze the flow of Bitcoin between addresses
- If we see patterns like "peeling chains" (sending small amounts to many addresses), that's a red flag!"""
    
    if "address" in prompt_lower:
        return """Here's what we look for when analyzing an address:
- Number of transactions
- Total received/sent
- Whether it appears on abuse reports
- Graph patterns (like fan-in/fan-out, which can be suspicious!)"""
    
    if "graph" in prompt_lower:
        return """The graph explorer helps visualize the transaction network!
- Nodes are addresses or transactions
- Edges are Bitcoin transfers between them
- Suspicious patterns: peeling chains, fan-in/fan-out, mixing patterns!"""
    
    # Default response
    return """Hey there! I'm your ChainTrace AI assistant! I can help you understand:
- Transaction risk assessments
- Blockchain graphs and patterns
- Address analysis
Just ask me about any of these topics, and I'll do my best to help! 😊"""

@router.post("")
async def explain(request: ExplainRequest):
    try:
        # Generate a simple explanation without external API
        explanation = generate_simple_explanation(request.prompt)
        
        return {"explanation": explanation}
        
    except Exception as e:
        print("Error in explain:", str(e))
        return {"explanation": "I'm sorry, I couldn't process that request right now. Let's try again later!"}
