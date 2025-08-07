# AlphaHunter Multiplayer Setup Guide

## Quick Start

### For Windows Users:

1. **First Time Setup:**
   - Make sure Node.js is installed on your computer
   - Download from https://nodejs.org if needed

2. **Start the Multiplayer Server:**
   
   **Option A - Using Batch File (Easiest):**
   - Double-click `start-multiplayer-server.bat`
   - A command window will open showing the server starting
   - Keep this window open while playing multiplayer
   
   **Option B - Using PowerShell:**
   - Right-click `start-multiplayer-server.ps1`
   - Select "Run with PowerShell"
   - If prompted about execution policy, type `Y` and press Enter
   
   **Option C - Manual Start:**
   - Open Command Prompt or Terminal
   - Navigate to the AlphaHunter folder
   - Run these commands:
     ```
     cd server
     npm install
     npm start
     ```

3. **Start the Game:**
   - Open `index.html` in your web browser
   - Or use a local web server for best results

4. **Host or Join a Game:**
   - Click "Multiplayer" in the character menu
   - Choose "Host Game" to create a room
   - Share the 3-emoji room code with friends
   - Friends can "Join Game" using the code

### For Mac/Linux Users:

1. **Install Node.js** if not already installed

2. **Start the Server:**
   ```bash
   cd AlphaHunter/server
   npm install
   npm start
   ```

3. **Start the Game** in another terminal:
   ```bash
   cd AlphaHunter
   python -m http.server 8000
   # Or use any other local web server
   ```

4. **Open the Game:**
   - Navigate to http://localhost:8000 in your browser

## Troubleshooting

### "Connection Refused" Error:
- Make sure the server is running (step 2)
- Check that no firewall is blocking port 3001
- Try disabling Windows Defender temporarily

### "Invalid WebSocket URL" Error:
- This happens when opening the HTML file directly
- Use a local web server instead (see below)

### Players Can't Join:
- Ensure all players are on the same network
- Check firewall settings
- Make sure the host's IP is accessible
- Try using the host's IP address directly

## Running a Local Web Server

### Option 1 - Python (if installed):
```bash
python -m http.server 8000
```

### Option 2 - Node.js (if installed):
```bash
npx http-server -p 8000
```

### Option 3 - VS Code:
- Install "Live Server" extension
- Right-click index.html
- Select "Open with Live Server"

## Network Requirements

- All players must be on the same local network (LAN/WiFi)
- Port 3001 must be accessible (not blocked by firewall)
- Works best with 2-4 players
- Recommended: Less than 50ms ping between players

## For Teachers/Classrooms

1. **One-Time Setup:**
   - Install Node.js on the host computer
   - Run `npm install` in the server folder once

2. **Each Session:**
   - Start the multiplayer server
   - Have one student host the game
   - Other students join using the emoji code
   - All players must be on same network

3. **Tips:**
   - Use a dedicated host computer for stability
   - Write the emoji code on the board
   - Test the setup before class
   - Have a backup plan for solo play

## Security Notes

- The multiplayer server only works on local networks
- No data is sent over the internet
- Room codes expire after 2 hours
- Only gameplay data is shared (positions, scores)

## Advanced Configuration

### Change Server Port:
Edit `server/server.js` line 9:
```javascript
const PORT = process.env.PORT || 3001;
```

### Allow External Connections:
The server binds to all network interfaces by default.
Make sure your firewall allows incoming connections on port 3001.

### Debug Mode:
Set environment variable:
```bash
DEBUG=true npm start
```

## Need Help?

1. Check the browser console (F12) for errors
2. Check the server console for connection logs
3. Ensure all players see "Connected to server" message
4. Try with just 2 players first to test