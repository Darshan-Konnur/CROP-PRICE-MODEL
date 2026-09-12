@echo off
echo Starting FastAPI ML Backend on http://localhost:8000 ...
cd /d %~dp0
.\venv\Scripts\python.exe -m uvicorn app:app --port 8000 --reload
pause
