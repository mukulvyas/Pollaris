# 🗳️ Pollaris — Aapka Chunav Dost

> **An agentic AI election assistant for 970 million Indian voters.**  
> Built for the **#BuildwithAI** Hackathon — Challenge: *Election Process Education*

[![Python](https://img.shields.io/badge/Python-3.11-blue?logo=python)](https://python.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.111-009688?logo=fastapi)](https://fastapi.tiangolo.com)
[![LangGraph](https://img.shields.io/badge/LangGraph-0.2-orange)](https://langchain-ai.github.io/langgraph/)
[![Tests](https://img.shields.io/badge/Tests-54%20passing-brightgreen)](#-testing)
[![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)

---

## 📖 What is Pollaris?

**Pollaris** (Pole + Polaris — the guiding star) is a multilingual, voice-enabled AI assistant that helps every Indian voter understand:

- 🗳️ **How to vote** — step-by-step, in their own language
- 📅 **Election timelines** — registration deadlines, voting day, counting day
- 📍 **Where to vote** — interactive polling booth finder with GPS
- 👤 **Who is contesting** — candidate background, assets, criminal records
- 📝 **How to register** — voter registration process and documents
- 🚨 **How to report violations** — cVIGIL, helpline 1950 integration
- 🧠 **Election quiz** — test your knowledge in 5 questions

Supports **12 Indian languages**: Hindi, Tamil, Telugu, Bengali, Marathi, Gujarati, Punjabi, Kannada, Malayalam, Odia, Urdu, and English.


---

## ✨ Features

| Feature | Description |
|---|---|
| 🤖 **AI Chat** | Conversational assistant powered by LangGraph + Claude/Gemini |
| 🌐 **12 Languages** | Auto-detects language from user script; manual picker available |
| 📍 **Google Maps** | Official **Google Maps JS API** with Places Autocomplete & GPS |
| 👤 **Candidate Info** | Assets, criminal cases, education from verified sources |
| 📅 **Election Timeline** | Visual 6-step timeline with status indicators |
| ✅ **Voting Checklist** | Interactive pre-vote checklist with progress bar |
| 🧠 **Election Quiz** | 5-question knowledge check on Indian election process |
| 🚨 **Violation Reporting** | Secure report submission with image evidence & GPS |
| 🛡️ **Advanced Security** | CSP headers, HSTS, and rate-limiting middleware |
| ⚡ **Efficiency** | **PWA (Service Worker)** + Code Splitting + React.memo + useMemo |

---

## 🛠️ Tech Stack

### Frontend
| Library | Purpose |
|---|---|
| React 19 + Vite | UI framework + build tool |
| **Google Maps API** | High-accuracy polling booth locator |
| **Firebase SDK** | Google Analytics, Firestore & Auth integration |
| **PWA / Service Worker** | Offline caching and installable app support |
| Zustand | Lightweight global state |
| Framer Motion | Smooth page/card animations |
| Tailwind CSS | Utility-first styling |
| Lucide React | Consistent icon set |

### Backend
| Library | Purpose |
|---|---|
| FastAPI | High-performance async API |
| LangGraph | Stateful agentic pipeline |
| LangChain Anthropic | Claude Sonnet (primary AI) |
| LangChain Google GenAI | Gemini 2.0 Flash (fallback AI) |
| SQLAlchemy + aiosqlite | Async SQLite for history/reports |
| Pydantic v2 | Request validation with strict schemas |
| Uvicorn | ASGI server |

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** ≥ 18
- **Python** ≥ 3.11


---

### 1. Clone the repository

```bash
git clone https://github.com/your-username/pollaris.git
cd pollaris
```

---

### 2. Backend Setup

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS/Linux

# Install dependencies
pip install -r requirements.txt



```bash
# Start the backend
uvicorn api.main:app --reload --port 8000
```

Backend will be available at: `http://localhost:8000`  
API docs (Swagger): `http://localhost:8000/docs`

---

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

Frontend will be available at: `http://localhost:5173`

> The Vite dev server proxies all `/api` requests to `http://localhost:8000` automatically.

---

### 4. Docker (Full Stack)

```bash
# From the project root (where Dockerfile lives)
docker build -t pollaris .

docker run -p 8080:8080 \
  -e ANTHROPIC_API_KEY=your_key \
  -e GOOGLE_API_KEY=your_key \
  pollaris
```

Visit `http://localhost:8080`

---

## 🧪 Testing

### Backend — Pytest (43 tests)

```bash
cd backend
# Activate your virtual environment first

$env:PYTHONPATH="."; pytest tests/ -v    # Windows PowerShell
# PYTHONPATH=. pytest tests/ -v         # macOS/Linux
```

| Test File | Tests | Coverage |
|---|---|---|
| `test_router.py` | 3 | Intent routing (all 5 intents) |
| `test_intake.py` | 16 | Language detection + intent classification |
| `test_voting_kb.py` | 12 | Election knowledge base factual accuracy |
| `test_api_validation.py` | 12 | Pydantic schema guards (empty msg, bad coords, etc.) |
| **Total** | **43** | **✅ 100% pass rate** |

### Frontend — Vitest (11 tests)

```bash
cd frontend
npm test
```

| Test File | Tests | Coverage |
|---|---|---|
| `Header.test.jsx` | 2 | Logo, title rendering |
| `Components.test.jsx` | 9 | BottomNav, MicButton (ARIA), SpeakerButton, TimelineItem |
| **Total** | **11** | **✅ 100% pass rate** |

---

## 📁 Project Structure

```
pollaris/
├── Dockerfile                    # Multi-stage Docker build
├── backend/
│   ├── api/
│   │   └── main.py               # FastAPI app, all routes, Pydantic schemas
│   ├── graph/
│   │   ├── builder.py            # LangGraph pipeline assembly
│   │   ├── state.py              # PollarisState TypedDict
│   │   ├── nodes/
│   │   │   ├── intake.py         # Language & intent detection
│   │   │   ├── router.py         # Intent → node routing
│   │   │   ├── voting.py         # Election education KB (13 topics)
│   │   │   ├── booth.py          # Polling booth lookup
│   │   │   ├── candidate.py      # Candidate affidavit data
│   │   │   ├── eci.py            # ECI dates & schedule
│   │   │   ├── report.py         # Violation reporting
│   │   │   └── response.py       # Claude/Gemini response generation
│   │   └── edges/
│   ├── models/                   # SQLAlchemy ORM models
│   ├── prompts/                  # System prompts
│   ├── tests/                    # Pytest test suite (43 tests)
│   ├── requirements.txt
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── App.jsx               # Router, lazy loading, error boundary
    │   ├── pages/
    │   │   ├── Home.jsx          # AI chat interface + voice I/O
    │   │   ├── Map.jsx           # Leaflet polling booth finder
    │   │   ├── Candidates.jsx    # Candidate comparison
    │   │   ├── Guide.jsx         # Election timeline + quiz
    │   │   ├── Checklist.jsx     # Voting day checklist
    │   │   └── Report.jsx        # Violation reporting
    │   ├── components/
    │   │   ├── Header.jsx        # App header with back button
    │   │   ├── BottomNav.jsx     # Accessible tab navigation
    │   │   ├── MicButton.jsx     # Voice input toggle
    │   │   ├── SpeakerButton.jsx # Text-to-speech toggle
    │   │   ├── TimelineItem.jsx  # Election timeline step
    │   │   ├── CandidateCard.jsx # Candidate info card
    │   │   └── BoothCard.jsx     # Polling booth card
    │   ├── store/
    │   │   └── userStore.js      # Zustand state (language, session, messages)
    │   ├── utils/
    │   │   └── api.js            # Axios client (chatService, boothService)
    │   └── test/                 # Vitest test suite (11 tests)
    ├── index.html                # Google Analytics + Google Fonts
    ├── vite.config.js            # Vite + Vitest config
    └── package.json
```

---

## 🌐 API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Health check |
| `POST` | `/api/chat` | Main AI chat endpoint |
| `GET` | `/api/booth?lat=&lng=` | Find nearby polling booths |
| `GET` | `/api/candidates?constituency=` | Get candidate list |
| `GET` | `/api/elections` | Get election dates |
| `POST` | `/api/report` | Submit a violation report |
| `POST` | `/api/user/setup` | Register user preferences |
| `GET` | `/api/history/{session_id}` | Get conversation history |

### Chat Request Schema
```json
{
  "message": "How do I vote?",
  "session_id": "550e8400-e29b-41d4-a716-446655440000",
  "language": "en",
  "user_lat": 28.6139,
  "user_lng": 77.2090,
  "state_name": "Delhi",
  "district": "Central Delhi",
  "constituency": "New Delhi"
}
```

---

## ♿ Accessibility

Pollaris is built with accessibility as a core value — not an afterthought:

- ✅ All interactive elements have explicit `aria-label` attributes
- ✅ Semantic HTML: `<header>`, `<main>`, `<nav>`, `<h1>` hierarchy
- ✅ Skip-to-content link (`Tab` key reveals it)
- ✅ Focus-visible ring: `3px solid #F5831F` on all focusable elements
- ✅ Voice input (SpeechRecognition) for low-literacy users
- ✅ Text-to-speech (SpeechSynthesis) reads responses aloud
- ✅ 12 Indian languages — matches user's native script automatically


---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

