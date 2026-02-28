from fastapi import FastAPI
from app.database import engine, Base
from app.routers import sessions


app = FastAPI(
    title="🚀 Deep Work Tracker API",
    description="""
A comprehensive full-stack productivity tracking system for managing deep work sessions.

### 🎯 Key Features
* **✅ Session Lifecycle**: Create, Start, Pause, Resume, and Complete sessions.
* **📊 Analytics**: Real-time Focus Score calculation and Weekly productivity reports.
* **📤 Data Export**: Export your session history to CSV with IST timestamps.
* **⏱️ Precision**: Per-second tracking with automatic overdue and interruption detection.

### 🧠 Session States
* `scheduled` ➔ `active` ➔ `paused` ➔ `active` ➔ `completed`
* `active` ➔ `overdue` (if > 110% duration)
* `paused` ➔ `interrupted` (if > 3 pauses)
    """,
    version="1.0.0",
    contact={
        "name": "Deep Work Team",
        "url": "http://127.0.0.1:8000",
    },
    license_info={
        "name": "MIT License",
    }
)
app.include_router(sessions.router)
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
