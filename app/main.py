from fastapi import FastAPI
from app.database import engine, Base
from app.routers import sessions


app = FastAPI()
app.include_router(sessions.router)
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)