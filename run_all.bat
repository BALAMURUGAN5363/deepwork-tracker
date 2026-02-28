@echo off
title Deep Work Tracker - Launch All

echo ==========================================
echo   🚀 Launching Deep Work Tracker
echo ==========================================
echo.

echo Starting Backend Server...
start "Deep Work - Backend" cmd /k run_backend.bat

echo Starting Frontend Server...
cd frontend
start "Deep Work - Frontend" cmd /k run_frontend.bat
cd ..

echo.
echo ==========================================
echo ✅ Both servers are launching!
echo.
echo Backend: http://127.0.0.1:8000/docs
echo Frontend: http://localhost:5173
echo ==========================================
echo.
pause