@echo off

echo.
echo ==========================================
echo   Running Frontend Unit Tests...
echo ==========================================
echo.
npm test -- --coverage --watchAll=false

IF %ERRORLEVEL% NEQ 0 (
    echo.
    echo ❌ Frontend tests failed. Fix errors before running the dev server.
    pause
    exit /b 1
)

echo.
echo ✅ Frontend tests passed. Starting dev server...
echo.
npm run dev