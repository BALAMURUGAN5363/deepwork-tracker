@echo off
echo ==========================================
echo   Deep Work Tracker - Frontend Setup
echo ==========================================

REM Check if Node.js exists
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo.
    echo Node.js is not installed.
    echo Install from https://nodejs.org
    pause
    exit /b
)

echo Node.js detected!

echo Installing frontend dependencies...
npm install

echo.
echo Frontend setup completed successfully!
pause