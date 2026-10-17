@echo off
title NexaAI Lab Fullstack Servers Launcher
echo ========================================================
echo   Launching NexaAI Lab Fullstack Environment
echo   - Backend API:       http://localhost:5000
echo   - Frontend Website:  http://localhost:5173
echo   - Admin Portal:      http://localhost:5174
echo ========================================================
echo.

start "NexaAI Backend (Port 5000)" cmd /k "cd /d "%~dp0backend" && node src/server.js"
timeout /t 3 /nobreak >nul
start "NexaAI Frontend (Port 5173)" cmd /k "cd /d "%~dp0frontend" && npm run dev"
timeout /t 2 /nobreak >nul
start "NexaAI Admin (Port 5174)" cmd /k "cd /d "%~dp0admin" && npm run dev"

echo.
echo All 3 servers launched successfully!
echo Public Website: http://localhost:5173
echo Admin Console:  http://localhost:5174
echo Backend API:    http://localhost:5000
echo.
