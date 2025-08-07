# Multiplayer Testing Guide

## Quick Test Steps

### Option 1: Test Within the Game (Recommended)
1. Open `index.html` in two different browser windows/tabs
2. **Window 1:**
   - Click the purple "Play Together!" button (bottom right)
   - Click "Create Room"
   - Note the 4-digit room code that appears
   - Click "Start Game!" when ready

3. **Window 2:**
   - Click the purple "Play Together!" button
   - Click "Join Room"
   - Enter the 4-digit code
   - Click "Join!"

### Option 2: Using the Test File
1. Open `test-multiplayer.html` in a browser
2. Click "Create Test Room" and note the code
3. Open `index.html` in another window
4. Use the code to join from the game

## Troubleshooting

### "Peer is not defined" Error
- Hard refresh the page (Ctrl+F5 or Cmd+Shift+R)
- Check that PeerJS loaded in Network tab
- Try opening in an incognito/private window

### Connection Issues
- Both windows must be open (host must stay connected)
- Room codes expire when the host leaves
- Try using the same browser for both windows
- Check browser console for detailed error messages

### Browser Compatibility
- **Best:** Chrome, Edge, Brave
- **Good:** Firefox, Safari (recent versions)
- **Issues:** Older browsers, some mobile browsers

### Network Requirements
- Requires internet connection (uses PeerJS cloud)
- May not work on restrictive networks (schools, corporate)
- Both players need stable internet

## Console Commands for Debugging

Open browser console (F12) and check:

```javascript
// Check if PeerJS loaded
console.log(typeof Peer);  // Should output "function"

// Check multiplayer manager
console.log(game.multiplayerManager);

// Check connection status
console.log(game.multiplayerManager?.isConnected());
```

## Common Issues and Fixes

1. **Multiple peer connections:** Close all game tabs and start fresh
2. **Room not found:** Host must create room first and stay connected
3. **Players invisible:** Check that both players selected a character
4. **Lag/Delays:** Normal for internet connections, especially on WiFi

## Testing Checklist

- [ ] Host can create room
- [ ] Room code displays clearly
- [ ] Joiner can connect with code
- [ ] Both players see each other
- [ ] Movement is synchronized
- [ ] Letterlings appear for both players
- [ ] Scores update for both players
- [ ] Players can collect letterlings

## Notes

- The test file (`test-multiplayer.html`) is useful for verifying PeerJS connectivity
- Room codes are randomly generated 4-digit numbers
- Maximum recommended players: 4 (for performance)
- Host has authority over letterling spawning