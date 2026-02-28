from app.schemas import SessionCreate, PauseRequest, SessionResponse, InterruptionResponse, SessionHistory
from datetime import datetime

def test_session_create_schema():
    schema = SessionCreate(title="Test", goal="Goal", scheduled_duration=30)
    assert schema.title == "Test"
    assert schema.goal == "Goal"
    assert schema.scheduled_duration == 30

def test_pause_request_schema():
    schema = PauseRequest(reason="Coffee")
    assert schema.reason == "Coffee"

def test_session_response_schema():
    schema = SessionResponse(
        id=1,
        title="Test",
        goal="Goal",
        scheduled_duration=30,
        status="scheduled",
        created_at=datetime.utcnow()
    )
    assert schema.id == 1
    assert schema.status == "scheduled"

def test_interruption_response_schema():
    schema = InterruptionResponse(
        id=1,
        session_id=1,
        reason="Coffee",
        pause_time=datetime.utcnow()
    )
    assert schema.id == 1
    assert schema.reason == "Coffee"

def test_session_history_schema():
    schema = SessionHistory(
        id=1,
        title="Test",
        goal="Goal",
        scheduled_duration=30,
        actual_duration=30.0,
        pause_count=1,
        status="completed",
        completion_ratio=1.0,
        focus_score=90.0,
        start_time=datetime.utcnow(),
        end_time=datetime.utcnow()
    )
    assert schema.id == 1
    assert schema.status == "completed"
