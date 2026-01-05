@echo off
REM Preṣaka Setup Script for Windows
REM This script automates the initial setup process

echo.
echo =============================
echo Presaka Setup Script
echo =============================
echo.

REM Check Node.js
echo Checking prerequisites...
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo [OK] Node.js found
node -v

echo.

REM Install backend dependencies
echo Installing backend dependencies...
cd backend
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to install backend dependencies
    pause
    exit /b 1
)
echo [OK] Backend dependencies installed
echo.

REM Install frontend dependencies
echo Installing frontend dependencies...
cd ..\frontend
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to install frontend dependencies
    pause
    exit /b 1
)
echo [OK] Frontend dependencies installed
echo.

REM Setup environment files
cd ..
echo Setting up environment files...

if not exist "backend\.env" (
    copy "backend\.env.example" "backend\.env"
    echo [OK] Created backend\.env
    echo [WARNING] Please edit backend\.env with your configuration
) else (
    echo [WARNING] backend\.env already exists, skipping
)

if not exist "frontend\.env" (
    copy "frontend\.env.example" "frontend\.env"
    echo [OK] Created frontend\.env
) else (
    echo [WARNING] frontend\.env already exists, skipping
)

echo.
echo =============================
echo Setup Complete!
echo =============================
echo.
echo Next steps:
echo 1. Edit backend\.env with your configuration
echo 2. Ensure PostgreSQL is running
echo 3. Ensure Redis is running
echo 4. Create database: createdb presaka
echo 5. Run schema: psql -d presaka -f backend\src\database\schema.sql
echo 6. Start backend: cd backend ^&^& npm run dev
echo 7. Start frontend: cd frontend ^&^& npm run dev
echo.
echo For detailed instructions, see SETUP_GUIDE.md
echo.
echo Happy coding!
echo.
pause

