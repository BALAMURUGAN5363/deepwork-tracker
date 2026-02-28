@echo off
title Deep Work Tracker - Full Setup

echo ==========================================
echo   🚀 Deep Work Tracker - Full Setup
echo ==========================================
echo.

echo [1/2] Setting up Backend...
call setup_backend.bat

echo.
echo [2/2] Setting up Frontend...
cd frontend
call setup_frontend.bat
cd ..

echo.
echo ==========================================
echo ✅ Full Setup Completed Successfully!
echo ==========================================
echo.
echo You can now run the project using: run_all.bat
echo.
pause
