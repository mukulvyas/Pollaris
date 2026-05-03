from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import Optional, List
from contextlib import asynccontextmanager
import os
import uuid
from dotenv import load_dotenv

load_dotenv()

from db.database import init_db, get_db, AsyncSessionLocal
from graph.builder import graph
from graph.state import PollarisState
from langchain_core.messages import HumanMessage
from models.models import ConversationHistory, Complaint, SavedBooth, User
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select


# ── Lifespan ──────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield


app = FastAPI(
    title="Pollaris API",
    description="AI-powered Indian Election Education Assistant",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Schemas ───────────────────────────────────────────────
from pydantic import BaseModel, Field, field_validator

class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=1000)
    session_id: Optional[str] = Field(None, max_length=64)
    language: Optional[str] = Field("en", pattern=r"^[a-z]{2}$")
    user_lat: Optional[float] = Field(None, ge=-90, le=90)
    user_lng: Optional[float] = Field(None, ge=-180, le=180)
    state_name: Optional[str] = Field(None, max_length=100)
    district: Optional[str] = Field(None, max_length=100)
    constituency: Optional[str] = Field(None, max_length=100)

    @field_validator('language')
    @classmethod
    def validate_language(cls, v):
        allowed = {"en", "hi", "ta", "te", "bn", "mr", "gu", "pa", "kn", "ml", "or", "ur"}
        if v not in allowed:
            return "en"
        return v


class ChatResponse(BaseModel):
    reply: str
    session_id: str
    intent: str
    language: str
    booth_result: Optional[dict] = None
    candidate_result: Optional[List[dict]] = None
    eci_result: Optional[dict] = None


class BoothRequest(BaseModel):
    lat: float
    lng: float
    session_id: Optional[str] = None


class ComplaintRequest(BaseModel):
    session_id: str
    category: str
    description: str
    lat: Optional[float] = None
    lng: Optional[float] = None


class UserSetupRequest(BaseModel):
    session_id: Optional[str] = None
    language: str = "en"
    state_name: Optional[str] = None
    district: Optional[str] = None
    constituency: Optional[str] = None
    is_first_time_voter: bool = False


# ── Routes ────────────────────────────────────────────────

@app.get("/api/health")
async def health():
    return {"status": "ok", "service": "Pollaris API", "version": "1.0.0"}


@app.post("/api/chat", response_model=ChatResponse)
async def chat(req: ChatRequest, db: AsyncSession = Depends(get_db)):
    session_id = req.session_id or str(uuid.uuid4())

    # Build initial state
    state: PollarisState = {
        "messages": [HumanMessage(content=req.message)],
        "session_id": session_id,
        "language": req.language or "en",
        "intent": "general",
        "user_lat": req.user_lat,
        "user_lng": req.user_lng,
        "state_name": req.state_name,
        "district": req.district,
        "constituency": req.constituency,
        "booth_result": None,
        "candidate_result": None,
        "eci_result": None,
        "response_text": "",
        "error": None,
    }

    # Run the LangGraph agent
    try:
        result = await graph.ainvoke(state)
    except Exception as e:
        import logging
        logging.error(f"Graph execution failed: {e}")
        # Fallback to rule-based engine if graph fails
        from graph.nodes.response import _rule_based_answer
        reply = _rule_based_answer(req.message, req.language or "en", "general")
        if not reply:
            reply = "Kuch gadbad ho gayi. Please try again."
        result = {"response_text": reply}

    reply = result.get("response_text", "Kuch gadbad ho gayi. Please try again.")

    # Persist conversation
    try:
        db.add(ConversationHistory(
            session_id=session_id,
            role="user",
            content=req.message,
            language=result.get("language", "en"),
        ))
        db.add(ConversationHistory(
            session_id=session_id,
            role="assistant",
            content=reply,
            language=result.get("language", "en"),
        ))
        await db.commit()
    except Exception:
        pass

    return ChatResponse(
        reply=reply,
        session_id=session_id,
        intent=result.get("intent", "general"),
        language=result.get("language", "en"),
        booth_result=result.get("booth_result"),
        candidate_result=result.get("candidate_result"),
        eci_result=result.get("eci_result"),
    )


@app.get("/api/booth")
async def find_booth(lat: float, lng: float, radius: int = 3000):
    state: PollarisState = {
        "messages": [HumanMessage(content=f"Find polling booths within {radius}m of {lat}, {lng}")],
        "session_id": str(uuid.uuid4()),
        "language": "en",
        "intent": "booth",
        "user_lat": lat,
        "user_lng": lng,
        "state_name": None,
        "district": None,
        "constituency": None,
        "booth_result": None,
        "candidate_result": None,
        "eci_result": None,
        "response_text": "",
        "error": None,
    }
    result = await graph.ainvoke(state)
    
    # Return the full list of booths
    booths = result.get("booth_result")
    if not booths:
        booths = []
    elif not isinstance(booths, list):
        booths = [booths]
    
    return {
        "booths": booths,
        "total": len(booths),
        "searched_area": result.get("constituency", "Current Location"),
        "message": result.get("response_text"),
    }


@app.get("/api/candidates")
async def get_candidates(constituency: Optional[str] = None, state: Optional[str] = None):
    from graph.nodes.candidate import MOCK_CANDIDATES
    return {"candidates": MOCK_CANDIDATES, "source": "myneta.info"}


@app.get("/api/elections")
async def get_elections():
    from graph.nodes.eci import ECI_DATA
    return ECI_DATA


@app.post("/api/report")
async def submit_complaint(req: ComplaintRequest, db: AsyncSession = Depends(get_db)):
    complaint = Complaint(
        session_id=req.session_id,
        category=req.category,
        description=req.description,
        latitude=req.lat,
        longitude=req.lng,
        evidence_image=req.image
    )
    db.add(complaint)
    await db.commit()
    return {
        "status": "submitted",
        "complaint_id": complaint.id,
        "message": "Aapki complaint submit ho gayi. Reference number note kar lein.",
        "helpline": "1950",
    }


@app.post("/api/user/setup")
async def setup_user(req: UserSetupRequest, db: AsyncSession = Depends(get_db)):
    session_id = req.session_id or str(uuid.uuid4())

    # Upsert user
    result = await db.execute(select(User).where(User.session_id == session_id))
    user = result.scalar_one_or_none()

    if not user:
        user = User(
            session_id=session_id,
            language=req.language,
            state_name=req.state_name,
            district=req.district,
            constituency=req.constituency,
            is_first_time_voter=req.is_first_time_voter,
        )
        db.add(user)
    else:
        user.language = req.language
        user.state_name = req.state_name
        user.district = req.district
        user.constituency = req.constituency
        user.is_first_time_voter = req.is_first_time_voter

    await db.commit()
    return {"session_id": session_id, "status": "ok"}


@app.get("/api/history/{session_id}")
async def get_history(session_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(ConversationHistory)
        .where(ConversationHistory.session_id == session_id)
        .order_by(ConversationHistory.created_at)
    )
    messages = result.scalars().all()
    return {
        "session_id": session_id,
        "messages": [
            {"role": m.role, "content": m.content, "language": m.language}
            for m in messages
        ],
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)


# ── Serve React frontend (must be LAST) ────────────────────
# In Docker: api/main.py is at /app/api/main.py
# Static files are at /app/static
# So we go ONE directory up from api/ to reach /app, then into /static
_STATIC_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "static")
_STATIC_DIR = os.path.abspath(_STATIC_DIR)

if os.path.isdir(_STATIC_DIR):
    # Serve all static files (JS, CSS, images, etc.)
    app.mount("/assets", StaticFiles(directory=os.path.join(_STATIC_DIR, "assets")), name="static-assets")

    # Catch-all: serve index.html for ANY non-API route (SPA routing)
    @app.get("/{full_path:path}")
    async def serve_react_app(full_path: str):
        # First check if the exact file exists (e.g., favicon.ico, manifest.json)
        file_path = os.path.join(_STATIC_DIR, full_path)
        if full_path and os.path.isfile(file_path):
            return FileResponse(file_path)
        # Otherwise serve index.html for client-side routing
        index = os.path.join(_STATIC_DIR, "index.html")
        if os.path.exists(index):
            return FileResponse(index, media_type="text/html")
        return {"error": "Frontend not built"}

