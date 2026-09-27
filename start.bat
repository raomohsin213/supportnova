@echo off
setlocal
title SupportNova - Application Launcher

echo =======================================================================
echo               SupportNova - Launching Application Services
echo =======================================================================
echo.

cd /d "%~dp0"

:: Check if virtual environment exists
set PYTHON_EXE=python
if exist "venv\Scripts\python.exe" (
    set PYTHON_EXE="%~dp0venv\Scripts\python.exe"
)

:: 1. Launch Backend API Server (Port 8000)
echo [1/2] Launching Backend FastAPI Server on http://127.0.0.1:8000 ...
start "SupportNova Backend (Port 8000)" cmd /c "cd /d "%~dp0backend" && %PYTHON_EXE% -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"

:: Brief pause to let backend bind port
timeout /t 3 /nobreak >nul

:: 2. Launch Frontend Dev Server (Port 5173)
echo [2/2] Launching Frontend Vite Dev Server on http://localhost:5173 ...
start "SupportNova Frontend (Port 5173)" cmd /c "cd /d "%~dp0frontend" && npm run dev"

:: Wait for Vite to spin up
timeout /t 4 /nobreak >nul

:: Open browser automatically
echo.
echo Opening SupportNova in your default web browser...
start http://localhost:5173

echo.
echo =======================================================================
echo SupportNova is now running!
echo.
echo   * Web Application:  http://localhost:5173
echo   * Backend REST API: http://127.0.0.1:8000/api
echo   * Swagger API Docs: http://127.0.0.1:8000/docs
echo   * Health Endpoint:  http://127.0.0.1:8000/api/health
echo.
echo Demo Accounts:
echo   - System Admin:     admin@supportnova.io   / Admin123!
echo   - Support Manager:  manager@supportnova.io / Manager123!
echo   - Reviewer / QA:    reviewer@supportnova.io / Reviewer123!
echo   - Support Agent:    agent@supportnova.io   / Agent123!
echo   - Customer:         customer@supportnova.io / Customer123!
echo.
echo (Keep the two launched service windows open while using SupportNova)
echo =======================================================================
echo.
