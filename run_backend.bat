@echo off
echo ==========================================
echo   Starting Backend Server
echo ==========================================

call env\Scripts\activate

set PYTHONPATH=%cd%

echo Running backend tests...

pytest

if %errorlevel% neq 0 (
    echo Backend tests failed.
    pause
    exit /b
)

echo Starting FastAPI server...

uvicorn app.main:app --reload --port 8000

pause