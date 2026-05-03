from sqlalchemy import Column, String, Boolean, DateTime, Float, Text, Integer
from sqlalchemy.orm import DeclarativeBase
from datetime import datetime
import uuid


class Base(DeclarativeBase):
    pass


class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    session_id = Column(String, unique=True, index=True)
    language = Column(String, default="en")
    state_name = Column(String, nullable=True)
    district = Column(String, nullable=True)
    constituency = Column(String, nullable=True)
    is_first_time_voter = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class SavedBooth(Base):
    __tablename__ = "saved_booths"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    session_id = Column(String, index=True)
    booth_name = Column(String)
    booth_address = Column(String)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    distance_meters = Column(Integer, nullable=True)
    saved_at = Column(DateTime, default=datetime.utcnow)


class Complaint(Base):
    __tablename__ = "complaints"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    session_id = Column(String, index=True)
    category = Column(String)
    description = Column(Text)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    evidence_image = Column(Text, nullable=True) # Base64 or URL
    status = Column(String, default="submitted")
    created_at = Column(DateTime, default=datetime.utcnow)


class ConversationHistory(Base):
    __tablename__ = "conversation_history"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    session_id = Column(String, index=True)
    role = Column(String)  # user | assistant
    content = Column(Text)
    language = Column(String, default="en")
    created_at = Column(DateTime, default=datetime.utcnow)
