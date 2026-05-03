from typing import TypedDict, Annotated, List, Optional, Dict, Any
from langchain_core.messages import BaseMessage
import operator


class PollarisState(TypedDict):
    # Conversation
    messages: Annotated[List[BaseMessage], operator.add]
    session_id: str

    # User context
    language: str          # e.g. "hi", "en", "ta"
    intent: str            # booth | candidate | eci | report | general

    # Location
    user_lat: Optional[float]
    user_lng: Optional[float]
    state_name: Optional[str]
    district: Optional[str]
    constituency: Optional[str]

    # Results
    booth_result: Optional[List[Dict[str, Any]]]
    candidate_result: Optional[List[Dict[str, Any]]]
    eci_result: Optional[Dict[str, Any]]

    # Final response
    response_text: str
    error: Optional[str]
