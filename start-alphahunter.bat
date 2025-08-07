@echo off
echo Starting AlphaHunter with Multiplayer Support...
echo.

:: Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

:: Start the multiplayer server in a new window
echo Starting multiplayer server...
start "AlphaHunter Server" cmd /k "cd server && npm install && npm start"

:: Wait a moment for server to start
timeout /t 3 /nobreak >nul

:: Open the game in default browser
echo Opening AlphaHunter in your browser...
start "" "index.html"

echo.
echo ========================================
echo AlphaHunter is now running!
echo.
echo To play multiplayer:
echo 1. One player clicks "Host" to create a game
echo 2. Other players click "Join" and enter the emoji code
echo.
echo Keep this window open for multiplayer support.
echo ========================================
pause