from datetime import datetime
from fastapi import HTTPException
from app.models import Session, Interruption
from fastapi.responses import FileResponse
import csv


# 🔹 CREATE SESSION
def create_session(db, session_data):
    new_session = Session(
        title=session_data.title,
        goal=session_data.goal,
        scheduled_duration=session_data.scheduled_duration,
        status="scheduled"
    )

    db.add(new_session)
    db.commit()
    db.refresh(new_session)

    return new_session


# 🔹 START SESSION
def start_session(db, session_id: int):
    session = db.query(Session).filter(Session.id == session_id).first()

    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    if session.status != "scheduled":
        raise HTTPException(status_code=400, detail="Session already started")

    session.status = "active"
    session.start_time = datetime.utcnow()

    db.commit()
    db.refresh(session)

    return session


# 🔹 PAUSE SESSION
def pause_session(db, session_id: int, reason: str):
    session = db.query(Session).filter(Session.id == session_id).first()

    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    if session.status != "active":
        raise HTTPException(status_code=400, detail="Session is not active")

    interruption = Interruption(
        session_id=session.id,
        reason=reason
    )

    db.add(interruption)
    db.commit()

    pause_count = db.query(Interruption).filter(
        Interruption.session_id == session.id
    ).count()

    if pause_count >= 4:
        session.status = "interrupted"
    else:
        session.status = "paused"

    db.commit()
    db.refresh(session)

    return session


# 🔹 RESUME SESSION
def resume_session(db, session_id: int):
    session = db.query(Session).filter(Session.id == session_id).first()

    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    if session.status != "paused":
        raise HTTPException(status_code=400, detail="Session is not paused")

    session.status = "active"

    db.commit()
    db.refresh(session)

    return session


# 🔹 COMPLETE SESSION
def complete_session(db, session_id: int):
    session = db.query(Session).filter(Session.id == session_id).first()

    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    if session.status not in ["active", "paused"]:
        raise HTTPException(status_code=400, detail="Cannot complete session")

    if not session.start_time:
        raise HTTPException(status_code=400, detail="Session was never started")

    session.end_time = datetime.utcnow()

    actual_minutes = (
        session.end_time - session.start_time
    ).total_seconds() / 60

    actual_minutes = round(actual_minutes, 2)

    if actual_minutes > session.scheduled_duration * 1.1:
        session.status = "overdue"
    else:
        session.status = "completed"

    db.commit()
    db.refresh(session)

    return session


# 🔹 SESSION HISTORY (🔥 FIXED TIMER ISSUE HERE)
def get_session_history(db):
    sessions = db.query(Session).all()
    history = []

    for session in sessions:

        pause_count = db.query(Interruption).filter(
            Interruption.session_id == session.id
        ).count()

        actual_duration = None
        completion_ratio = None
        focus_score = None

        if session.start_time and session.end_time:
            actual_duration = (
                session.end_time - session.start_time
            ).total_seconds() / 60

            actual_duration = round(actual_duration, 2)

            completion_ratio = round(
                actual_duration / session.scheduled_duration, 2
            )

        if session.scheduled_duration > 0:
            focus_score = round(
                (1 - (pause_count / session.scheduled_duration)) * 100,
                2
            )

        history.append({
            "id": session.id,
            "title": session.title,
            "scheduled_duration": session.scheduled_duration,
            "actual_duration": actual_duration,
            "pause_count": pause_count,
            "status": session.status,
            "completion_ratio": completion_ratio,
            "focus_score": focus_score,
            "start_time": session.start_time.isoformat() if session.start_time else None
        })

    return history


# 🔹 WEEKLY REPORT
def get_weekly_report(db):
    current_year = datetime.utcnow().year
    current_week = datetime.utcnow().isocalendar()[1]

    sessions = db.query(Session).all()

    total_sessions = 0
    completed_sessions = 0

    for session in sessions:
        if session.created_at:
            year = session.created_at.isocalendar()[0]
            week = session.created_at.isocalendar()[1]

            if year == current_year and week == current_week:
                total_sessions += 1

                if session.status == "completed":
                    completed_sessions += 1

    return [{
        "week": f"{current_year}-W{current_week:02d}",
        "total_sessions": total_sessions,
        "completed_sessions": completed_sessions
    }]


# 🔹 EXPORT CSV
def export_sessions_csv(db):
    sessions = db.query(Session).all()
    file_path = "sessions_export.csv"

    with open(file_path, mode="w", newline="") as file:
        writer = csv.writer(file)
        writer.writerow([
            "ID", "Title", "Scheduled Duration",
            "Status", "Start Time", "End Time"
        ])

        for s in sessions:
            writer.writerow([
                s.id,
                s.title,
                s.scheduled_duration,
                s.status,
                s.start_time,
                s.end_time
            ])

    return file_path
