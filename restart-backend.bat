@echo off
echo ========================================
echo  Restarting HR System Backend
echo ========================================
echo.

echo Step 1: Stopping any running Node processes...
taskkill /F /IM node.exe 2>nul
if %ERRORLEVEL% == 0 (
    echo ✓ Node processes stopped
) else (
    echo ℹ No Node processes were running
)
echo.

echo Step 2: Navigating to backend directory...
cd /d D:\hr-system\backend
echo ✓ In directory: %CD%
echo.

echo Step 3: Checking if pdfkit is installed...
call npm list pdfkit >nul 2>&1
if %ERRORLEVEL% == 0 (
    echo ✓ pdfkit is installed
) else (
    echo ⚠ pdfkit not found, installing...
    call npm install pdfkit
    echo ✓ pdfkit installed
)
echo.

echo Step 4: Starting backend server...
echo ----------------------------------------
echo Server will start below...
echo Press Ctrl+C to stop the server
echo ----------------------------------------
echo.

call npm start

pause
