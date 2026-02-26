from pydantic import BaseModel
from datetime import datetime
from typing import Optional


# 🔹 Create Session Request
class SessionCreate(BaseModel):
    title: str
    goal: Optional[str] = None
    scheduled_duration: int


# 🔹 Pause Request
class PauseRequest(BaseModel):
    reason: str


# 🔹 Session Response
class SessionResponse(BaseModel):
    id: int
    title: str
    goal: Optional[str] = None
    scheduled_duration: int
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    status: str
    created_at: datetime

    class Config:
        from_attributes = True  # ✅ Pydantic v2


# 🔹 Interruption Response
class InterruptionResponse(BaseModel):
    id: int
    session_id: int
    reason: str
    pause_time: datetime

    class Config:
        from_attributes = True  # ✅ Pydantic v2


# 🔹 Session History Response
class SessionHistory(BaseModel):
    id: int
    title: str
    scheduled_duration: int
    actual_duration: Optional[float] = None
    pause_count: int
    status: str
    completion_ratio: Optional[float] = None
    focus_score: Optional[float] = None