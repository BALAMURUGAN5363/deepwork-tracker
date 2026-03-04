@echo off
echo ==========================================
echo   Starting Frontend Server
echo ==========================================

echo Running frontend tests...

npm test

if %errorlevel% neq 0 (
    echo.
    echo Frontend tests failed.
    pause
    exit /b
)

echo Starting frontend dev server...

npm run dev

pause