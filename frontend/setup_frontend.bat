@echo off
title Deep Work Tracker - Frontend Setup

echo.
echo ==========================================
echo   Deep Work Tracker - Frontend Setup
echo ==========================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
IF %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js is not installed.
    echo.
    echo Please install Node.js from:
    echo https://nodejs.org/
    echo.
    pause
    exit /b 1
)

echo ✅ Node.js detected:
node -v
echo.

REM Check if frontend folder exists
IF NOT EXIST frontend (
    echo ❌ Frontend folder not found.
    echo Make sure you are running this from project root.
    pause
    exit /b 1
)

echo Moving to frontend folder...
cd frontend

echo.
echo Installing frontend dependencies...
echo.

npm install

IF %ERRORLEVEL% NEQ 0 (
    echo.
    echo ❌ Installation failed.
    pause
    exit /b 1
)

echo.
echo ==========================================
echo ✅ Frontend setup completed successfully!
echo ==========================================
echo.
echo To start the frontend server:
echo.
echo    cd frontend
echo    npm run dev
echo.
echo Then open:
echo    http://localhost:5173
echo.
pause
