@echo off
echo ==========================================
echo   Deep Work Tracker - Backend Setup
echo ==========================================

REM Activate virtual environment
call env\Scripts\activate

REM Set Python path to project root
set PYTHONPATH=%cd%

echo Installing backend dependencies...

python -m pip install --upgrade pip

pip install fastapi uvicorn sqlalchemy pytest pytest-cov httpx anyio pydantic

echo.
echo Running backend tests...

pytest

echo.
echo Backend setup completed!
pause