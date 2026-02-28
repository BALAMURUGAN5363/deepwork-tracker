import pytest
import os
from datetime import datetime, timedelta
from fastapi import HTTPException
from app.models import Session, Interruption
from app.services.session_services import (
    create_session,
    start_session,
    pause_session,
    resume_session,
    complete_session,
    get_session_history,
    get_weekly_report,
    export_sessions_csv,
    to_ist
)

class MockSessionData:
    def __init__(self, title, goal, scheduled_duration):
        self.title = title
        self.goal = goal
        self.scheduled_duration = scheduled_duration

# --- Basic Service Tests ---

def test_create_session(db_session):
    data = MockSessionData("Test Session", "Test Goal", 30)
    session = create_session(db_session, data)
    assert session.id is not None
    assert session.title == "Test Session"
    assert session.status == "scheduled"

def test_start_session_success(db_session):
    session = Session(title="S1", scheduled_duration=30, status="scheduled")
    db_session.add(session)
    db_session.commit()
    
    started = start_session(db_session, session.id)
    assert started.status == "active"
    assert started.start_time is not None

def test_start_session_not_found(db_session):
    with pytest.raises(HTTPException) as exc:
        start_session(db_session, 999)
    assert exc.value.status_code == 404

def test_start_session_already_started(db_session):
    session = Session(title="S1", scheduled_duration=30, status="active")
    db_session.add(session)
    db_session.commit()
    
    with pytest.raises(HTTPException) as exc:
        start_session(db_session, session.id)
    assert exc.value.status_code == 400

def test_pause_session_success(db_session):
    session = Session(title="S1", scheduled_duration=30, status="active")
    db_session.add(session)
    db_session.commit()
    
    paused = pause_session(db_session, session.id, "Coffee")
    assert paused.status == "paused"
    
    # Check interruption record
    interruption = db_session.query(Interruption).filter_by(session_id=session.id).first()
    assert interruption.reason == "Coffee"

def test_pause_session_interrupted_status(db_session):
    session = Session(title="S1", scheduled_duration=10, status="active")
    db_session.add(session)
    db_session.commit()
    
    # 4 pauses triggers "interrupted"
    for i in range(4):
        session.status = "active" # reset for test loop
        db_session.commit()
        paused = pause_session(db_session, session.id, f"Pause {i}")
    
    assert paused.status == "interrupted"

def test_pause_session_errors(db_session):
    # Not found
    with pytest.raises(HTTPException) as exc:
        pause_session(db_session, 999, "Reason")
    assert exc.value.status_code == 404
    
    # Not active
    session = Session(title="S1", scheduled_duration=30, status="scheduled")
    db_session.add(session)
    db_session.commit()
    with pytest.raises(HTTPException) as exc:
        pause_session(db_session, session.id, "Reason")
    assert exc.value.status_code == 400

def test_resume_session_success(db_session):
    session = Session(title="S1", scheduled_duration=30, status="paused")
    db_session.add(session)
    db_session.commit()
    
    resumed = resume_session(db_session, session.id)
    assert resumed.status == "active"

def test_resume_session_errors(db_session):
    # Not found
    with pytest.raises(HTTPException) as exc:
        resume_session(db_session, 999)
    assert exc.value.status_code == 404
    
    # Not paused
    session = Session(title="S1", scheduled_duration=30, status="active")
    db_session.add(session)
    db_session.commit()
    with pytest.raises(HTTPException) as exc:
        resume_session(db_session, session.id)
    assert exc.value.status_code == 400

def test_complete_session_success(db_session):
    session = Session(
        title="S1", 
        scheduled_duration=30, 
        status="active",
        start_time=datetime.utcnow() - timedelta(minutes=20)
    )
    db_session.add(session)
    db_session.commit()
    
    completed = complete_session(db_session, session.id)
    assert completed.status == "completed"
    assert completed.end_time is not None

def test_complete_session_overdue(db_session):
    session = Session(
        title="S1", 
        scheduled_duration=10, 
        status="active",
        start_time=datetime.utcnow() - timedelta(minutes=15)
    )
    db_session.add(session)
    db_session.commit()
    
    completed = complete_session(db_session, session.id)
    assert completed.status == "overdue"

def test_complete_session_errors(db_session):
    # Not found
    with pytest.raises(HTTPException) as exc:
        complete_session(db_session, 999)
    assert exc.value.status_code == 404
    
    # Cannot complete (scheduled)
    session = Session(title="S1", scheduled_duration=30, status="scheduled")
    db_session.add(session)
    db_session.commit()
    with pytest.raises(HTTPException) as exc:
        complete_session(db_session, session.id)
    assert exc.value.status_code == 400
    
    # Never started
    session.status = "active"
    session.start_time = None
    db_session.commit()
    with pytest.raises(HTTPException) as exc:
        complete_session(db_session, session.id)
    assert exc.value.status_code == 400

def test_get_session_history(db_session):
    # Create a complex session
    session = Session(
        title="History Test",
        goal="Goal",
        scheduled_duration=30,
        status="completed",
        start_time=datetime.utcnow() - timedelta(minutes=40),
        end_time=datetime.utcnow() - timedelta(minutes=10)
    )
    db_session.add(session)
    db_session.commit()
    
    # Add a pause
    db_session.add(Interruption(session_id=session.id, reason="R1"))
    db_session.commit()
    
    history = get_session_history(db_session)
    assert len(history) >= 1
    item = next(h for h in history if h["id"] == session.id)
    assert item["title"] == "History Test"
    assert item["pause_count"] == 1
    assert item["actual_duration"] == 30.0
    assert item["completion_ratio"] == 1.0
    assert item["focus_score"] is not None

def test_weekly_report(db_session):
    # Clear and add sessions for current week
    db_session.query(Session).delete()
    now = datetime.utcnow()
    db_session.add(Session(title="S1", status="completed", created_at=now, scheduled_duration=10))
    db_session.add(Session(title="S2", status="overdue", created_at=now, scheduled_duration=10))
    db_session.add(Session(title="S3", status="interrupted", created_at=now, scheduled_duration=10))
    db_session.commit()
    
    report = get_weekly_report(db_session)
    assert len(report) == 1
    assert report[0]["total_sessions"] == 3
    assert report[0]["completed_sessions"] == 1
    assert report[0]["overdue_sessions"] == 1
    assert report[0]["interrupted_sessions"] == 1

def test_export_csv(db_session):
    # Ensure there is at least one session
    db_session.add(Session(title="CSV Test", scheduled_duration=30, status="completed", start_time=datetime.utcnow()))
    db_session.commit()
    
    file_path = export_sessions_csv(db_session)
    assert os.path.exists(file_path)
    assert file_path == "sessions_export.csv"
    
    # Clean up
    if os.path.exists(file_path):
        os.remove(file_path)

def test_to_ist_edge_cases():
    assert to_ist(None) is None
    dt = datetime(2026, 1, 1, 12, 0)
    ist = to_ist(dt)
    assert ist == dt + timedelta(hours=5, minutes=30)
