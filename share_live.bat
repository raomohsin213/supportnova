@echo off
title SupportNova - Instant Live Public URL Sharer
cd /d "%~dp0"

echo =======================================================================
echo          SupportNova - Instant Live Public Tunnel (No Signup / No Card)
echo =======================================================================
echo.
echo Starting local application services if not already started...
start cmd /c "start.bat"

timeout /t 5 /nobreak >nul

echo.
echo Generating your instant public HTTPS URL via LocalTunnel...
echo Anyone in the world can open this link on their mobile or PC!
echo.
call npx -y localtunnel --port 5173
pause
