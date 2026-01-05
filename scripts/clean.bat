@echo off
REM Clean all node_modules and reinstall dependencies

echo.
echo =============================
echo Presaka Clean Script
echo =============================
echo.
echo This will remove all node_modules and package-lock.json files
echo and reinstall all dependencies.
echo.
echo WARNING: This may take several minutes!
echo.
set /p CONFIRM="Are you sure you want to continue? (y/n): "

if /i not "%CONFIRM%"=="y" (
    echo Cancelled.
    pause
    exit /b 0
)

echo.
echo Cleaning backend...
cd backend
if exist node_modules (
    echo Removing backend/node_modules...
    rmdir /s /q node_modules
)
if exist package-lock.json (
    echo Removing backend/package-lock.json...
    del package-lock.json
)
echo [OK] Backend cleaned
echo.

echo Cleaning frontend...
cd ..\frontend
if exist node_modules (
    echo Removing frontend/node_modules...
    rmdir /s /q node_modules
)
if exist package-lock.json (
    echo Removing frontend/package-lock.json...
    del package-lock.json
)
echo [OK] Frontend cleaned
echo.

cd ..

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

cd ..

echo.
echo =============================
echo Clean Complete!
echo =============================
echo.
echo All dependencies have been reinstalled.
echo You can now start the application.
echo.
pause

