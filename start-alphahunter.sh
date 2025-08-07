#!/bin/bash

echo "Starting AlphaHunter with Multiplayer Support..."
echo

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

# Start the multiplayer server in background
echo "Starting multiplayer server..."
cd server
npm install
npm start &
SERVER_PID=$!
cd ..

# Wait for server to start
sleep 3

# Open the game in default browser
echo "Opening AlphaHunter in your browser..."
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    open index.html
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux
    xdg-open index.html 2>/dev/null || sensible-browser index.html
fi

echo
echo "========================================"
echo "AlphaHunter is now running!"
echo
echo "To play multiplayer:"
echo "1. One player clicks 'Host' to create a game"
echo "2. Other players click 'Join' and enter the emoji code"
echo
echo "Press Ctrl+C to stop the server and exit"
echo "========================================"

# Wait for user to press Ctrl+C
trap "kill $SERVER_PID 2>/dev/null; exit" INT
wait