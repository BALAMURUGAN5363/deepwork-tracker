import pytest
from datetime import datetime, timedelta

from app.services.session_services import (
    pause_session,
    start_session,
    resume_session,
    complete_session
)
from app.models import Session


def test_cannot_pause_before_start(db_session):
    session = Session(title="Test", scheduled_duration=30, status="scheduled")
    db_session.add(session)
    db_session.commit()

    with pytest.raises(Exception):
        pause_session(db_session, session.id, "Test")


def test_cannot_resume_if_not_paused(db_session):
    session = Session(title="Test", scheduled_duration=30, status="active")
    db_session.add(session)
    db_session.commit()

    with pytest.raises(Exception):
        resume_session(db_session, session.id)


def test_pause_more_than_3_interrupts(db_session):
    session = Session(title="Test", scheduled_duration=30, status="active")
    db_session.add(session)
    db_session.commit()

    # Simulate 4 pauses
    for _ in range(4):
        pause_session(db_session, session.id, "Test")
        session = db_session.get(Session, session.id)

        # Only reactivate if not yet interrupted
        if session.status != "interrupted":
            session.status = "active"
            db_session.commit()

    session = db_session.get(Session, session.id)
    assert session.status == "interrupted"


def test_overdue_logic(db_session):
    session = Session(
        title="Test",
        scheduled_duration=10,
        status="active",
        start_time=datetime.utcnow() - timedelta(minutes=15)
    )

    db_session.add(session)
    db_session.commit()

    result = complete_session(db_session, session.id)
    assert result.status == "overdue"