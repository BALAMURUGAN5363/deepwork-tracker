from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from fastapi.responses import FileResponse

from app.database import SessionLocal
from app.schemas import (
    SessionCreate,
    SessionResponse,
    PauseRequest,
    SessionHistory,
)
from app.services.session_services import (
    create_session,
    start_session,
    pause_session,
    resume_session,
    complete_session,
    get_session_history,
    get_weekly_report,
    export_sessions_csv,
)

router = APIRouter(prefix="/sessions", tags=["Sessions"])


# 🔹 DB Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# 🔹 Create Session
@router.post("/", response_model=SessionResponse)
def create(session: SessionCreate, db: Session = Depends(get_db)):
    return create_session(db, session)


# 🔹 Start Session
@router.patch("/{session_id}/start", response_model=SessionResponse)
def start(session_id: int, db: Session = Depends(get_db)):
    return start_session(db, session_id)


# 🔹 Pause Session
@router.patch("/{session_id}/pause", response_model=SessionResponse)
def pause(session_id: int, request: PauseRequest, db: Session = Depends(get_db)):
    return pause_session(db, session_id, request.reason)


# 🔹 Resume Session
@router.patch("/{session_id}/resume", response_model=SessionResponse)
def resume(session_id: int, db: Session = Depends(get_db)):
    return resume_session(db, session_id)


# 🔹 Complete Session
@router.patch("/{session_id}/complete", response_model=SessionResponse)
def complete(session_id: int, db: Session = Depends(get_db)):
    return complete_session(db, session_id)


# 🔹 Session History
@router.get("/history", response_model=list[SessionHistory])
def history(db: Session = Depends(get_db)):
    return get_session_history(db)


# 🔹 Weekly Report
@router.get("/weekly-report")
def weekly_report(db: Session = Depends(get_db)):
    return get_weekly_report(db)


# 🔹 Export CSV
@router.get("/export")
def export(db: Session = Depends(get_db)):
    file_path = export_sessions_csv(db)
    return FileResponse(
        file_path,
        media_type="text/csv",
        filename="sessions.csv"
    )