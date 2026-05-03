import asyncio
import os
import sys

# Add backend to path
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from graph.builder import graph
from langchain_core.messages import HumanMessage

async def test_chatbot():
    print("--- Testing Chatbot Logic (No API Keys Mode) ---")
    
    test_queries = [
        {"q": "How do I vote?", "expected": "voting"},
        {"q": "What ID do I need?", "expected": "voting"},
        {"q": "Election dates", "expected": "eci"},
        {"q": "namaste", "expected": "general"}
    ]
    
    for query in test_queries:
        print(f"\nUser: {query['q']}")
        state = {
            "messages": [HumanMessage(content=query['q'])],
            "session_id": "test_session",
            "language": "en",
            "intent": "general",
            "response_text": "",
        }
        
        result = await graph.ainvoke(state)
        print(f"Detected Intent: {result.get('intent')}")
        print(f"Response Snippet: {result.get('response_text')[:100]}...")

if __name__ == "__main__":
    asyncio.run(test_chatbot())
