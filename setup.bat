@echo off
setlocal EnableDelayedExpansion
title SupportNova - Automated Setup Wizard

echo =======================================================================
echo           SupportNova - Automated Installation ^& Setup Wizard
echo =======================================================================
echo.

cd /d "%~dp0"

:: 1. Check Python
echo [1/6] Checking Python installation...
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python is not installed or not in your system PATH!
    echo Please download Python 3.11+ from https://www.python.org/
    echo IMPORTANT: Make sure to check "Add Python to PATH" during installation.
    pause
    exit /b 1
)
python --version

:: 2. Check Node.js and npm
echo.
echo [2/6] Checking Node.js and npm...
node -v >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js is not installed or not in your system PATH!
    echo Please download Node.js LTS (v18+) from https://nodejs.org/
    pause
    exit /b 1
)
npm -v >nul 2>&1
if errorlevel 1 (
    echo [ERROR] npm is not found in your system PATH!
    pause
    exit /b 1
)
echo Node: 
node -v
echo npm:
call npm -v

:: 3. Setup Python Virtual Environment
echo.
echo [3/6] Setting up Python virtual environment...
if not exist "venv" (
    echo Creating virtual environment in .\venv ...
    python -m venv venv
    if errorlevel 1 (
        echo [ERROR] Failed to create virtual environment!
        pause
        exit /b 1
    )
)
echo Activating virtual environment...
call venv\Scripts\activate.bat

echo Upgrading pip and installing Python dependencies...
python -m pip install --upgrade pip
pip install -r requirements.txt
if errorlevel 1 (
    echo [ERROR] Failed to install Python dependencies!
    pause
    exit /b 1
)

:: 4. Environment File Setup
echo.
echo [4/6] Checking environment configuration (.env)...
if not exist ".env" (
    echo .env file not found. Copying .env.example to .env ...
    copy .env.example .env >nul
    echo [OK] Created .env from .env.example
) else (
    echo [OK] .env file already exists.
)

:: 5. Seed Database & Generate Test Assets
echo.
echo [5/6] Initializing database and generating test assets...
cd backend
python -m app.seeds.seed_data
if errorlevel 1 (
    echo [WARNING] Database seed encountered an issue, continuing...
)
cd ..

echo Generating ReportLab test PDFs...
python generate_test_pdfs.py

:: 6. Setup Frontend Dependencies
echo.
echo [6/6] Installing frontend npm packages...
cd frontend
call npm install
if errorlevel 1 (
    echo [ERROR] npm install failed in frontend!
    cd ..
    pause
    exit /b 1
)
cd ..

echo.
echo =======================================================================
echo               [SUCCESS] Setup Completed Successfully!
echo =======================================================================
echo.
echo To launch SupportNova, simply double-click or run:
echo    start.bat
echo.
echo Or run the automated test suite with:
echo    venv\Scripts\activate.bat ^&^& pytest backend/tests/ -v
echo.
pause
