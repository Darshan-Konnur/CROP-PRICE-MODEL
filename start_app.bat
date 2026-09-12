@echo off
echo ====================================================
echo Starting KrishiPrice AI (FastAPI Backend + React UI)
echo ====================================================

start "KrishiPrice API Backend" cmd /k "cd /d %~dp0 && .\venv\Scripts\python.exe -m uvicorn app:app --port 8000 --reload"

timeout /t 2 /nobreak >nul

start "KrishiPrice Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

timeout /t 3 /nobreak >nul

start http://localhost:5175

echo.
echo Both servers are launching!
echo Backend:  http://localhost:8000
echo Frontend: http://localhost:5175
echo.
