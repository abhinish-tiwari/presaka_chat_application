@echo off
REM Reset database - drop and recreate with schema

echo.
echo =============================
echo Presaka Database Reset
echo =============================
echo.
echo WARNING: This will DELETE ALL DATA in the database!
echo.
set /p CONFIRM="Are you sure you want to continue? (y/n): "

if /i not "%CONFIRM%"=="y" (
    echo Cancelled.
    pause
    exit /b 0
)

echo.
set /p DB_NAME="Enter database name (default: presaka): "
if "%DB_NAME%"=="" set DB_NAME=presaka

echo.
echo Dropping database '%DB_NAME%'...
dropdb %DB_NAME% 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [WARNING] Database may not exist or already dropped
)

echo Creating database '%DB_NAME%'...
createdb %DB_NAME%
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to create database
    pause
    exit /b 1
)
echo [OK] Database created

echo.
echo Running database schema...
psql -d %DB_NAME% -f backend\src\database\schema.sql
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to run schema
    pause
    exit /b 1
)
echo [OK] Schema created

echo.
echo =============================
echo Database Reset Complete!
echo =============================
echo.
echo Database '%DB_NAME%' has been reset with fresh schema.
echo.
pause

