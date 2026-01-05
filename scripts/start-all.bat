@echo off
REM Start both backend and frontend servers in separate windows

echo.
echo =============================
echo Starting Presaka Application
echo =============================
echo.

echo Starting backend server in new window...
start "Presaka Backend" cmd /k "cd backend && npm run dev"

timeout /t 3 /nobreak >nul

echo Starting frontend server in new window...
start "Presaka Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo =============================
echo Both servers are starting!
echo =============================
echo.
echo Backend: http://localhost:5000
echo Frontend: http://localhost:5173
echo.
echo Press any key to exit this window...
pause >nul

