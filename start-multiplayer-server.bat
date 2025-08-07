@echo off
echo Starting AlphaHunter Multiplayer Server...
echo.

cd server

:: Check if node_modules exists
if not exist "node_modules" (
    echo Installing server dependencies...
    npm install
    echo.
)

:: Start the server
echo Starting server on port 3001...
echo Press Ctrl+C to stop the server
echo.
npm start

pause