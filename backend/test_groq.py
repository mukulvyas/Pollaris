import os
from dotenv import load_dotenv
from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage

load_dotenv()

def test_groq():
    key = os.getenv("GROQ_API_KEY")
    print(f"Key exists: {bool(key)}")
    if not key:
        return
    
    try:
        llm = ChatGroq(model="llama-3.3-70b-versatile", api_key=key)
        res = llm.invoke([HumanMessage(content="Hi")])
        print("Response:", res.content)
    except Exception as e:
        print("Error:", e)

if __name__ == "__main__":
    test_groq()
