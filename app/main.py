from fastapi import FastAPI
from app.database import engine, Base
from app.routers import sessions


app = FastAPI(
    title="Deep Work Tracker API",
    description="Backend API for tracking deep work sessions, managing interruptions, and generating weekly reports.",
    version="1.0.0",
    contact={
        "name": "Deep Work Team",
        "url": "http://127.0.0.1:8000",
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
