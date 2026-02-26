from sqlalchemy import Column, Integer, String, Text, ForeignKey, TIMESTAMP
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from .database import Base
from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime

created_at = Column(DateTime, default=datetime.utcnow)

class Session(Base):
    __tablename__ = "sessions"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    goal = Column(Text)
    scheduled_duration = Column(Integer, nullable=False)
    start_time = Column(TIMESTAMP)
    end_time = Column(TIMESTAMP)
    status = Column(String, default="scheduled")
    created_at = Column(TIMESTAMP, server_default=func.now())

    interruptions = relationship("Interruption", back_populates="session", cascade="all, delete")


class Interruption(Base):
    __tablename__ = "interruptions"

    id = Column(Integer, primary_key=True)
    session_id = Column(Integer, ForeignKey("sessions.id"))
    reason = Column(Text, nullable=False)
    pause_time = Column(TIMESTAMP, server_default=func.now())

    session = relationship("Session", back_populates="interruptions")