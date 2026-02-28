@echo off
call env\Scripts\activate

echo.
echo ==========================================
echo   Running Backend Unit Tests...
echo ==========================================
set PYTHONPATH=.
pytest --cov=app tests/

IF %ERRORLEVEL% NEQ 0 (
    echo.
    echo ❌ Backend tests failed. Fix errors before running the server.
    pause
    exit /b 1
)

echo.
echo ✅ Backend tests passed. Starting server...
echo.
uvicorn app.main:app --reload