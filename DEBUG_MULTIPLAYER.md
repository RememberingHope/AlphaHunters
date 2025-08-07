# Multiplayer Debug Commands

Open the browser console (F12) and use these commands to debug multiplayer issues:

## Check Game State
```javascript
// Check current game state
console.log('Game state:', game.state);
console.log('Multiplayer manager:', game.multiplayerManager);
console.log('Is multiplayer:', game.multiplayerManager?.isMultiplayer());
console.log('Is host:', game.multiplayerManager?.isGameHost());
console.log('Room code:', game.multiplayerManager?.roomCode);

// Check UI visibility
console.log('Menu visible:', document.getElementById('simpleMultiplayerMenu').style.display);
console.log('HUD visible:', !document.getElementById('hudOverlay').classList.contains('hidden'));

// Force start gameplay
game.state = 'playing';
document.getElementById('hudOverlay').classList.remove('hidden');
document.getElementById('simpleMultiplayerMenu').style.display = 'none';
document.getElementById('roomCodeBig').style.display = 'none';

// Check level manager
console.log('Level manager:', game.levelManager);
console.log('Current level:', game.levelManager?.currentLevel);

// Force start a level
game.levelManager?.startLevel('intro', true);
```

## Connection Diagnostics
```javascript
// Check peer connection
const mp = game.multiplayerManager;
console.log('Peer ID:', mp?.myPeerId);
console.log('Connected:', mp?.connected);
console.log('Connections:', mp?.connections.size);
console.log('Players:', mp?.players.size);

// List all players
mp?.getAllPlayers().forEach((player, id) => {
    console.log(`Player ${id}:`, player);
});
```

## Common Fixes

### UI Stuck on Join Screen
```javascript
// Force hide multiplayer UI
game.multiplayerUI.hide();
// Start gameplay
game.state = 'playing';
document.getElementById('hudOverlay').classList.remove('hidden');
```

### Game Not Starting
```javascript
// Check if level manager exists
if (!game.levelManager) {
    console.error('No level manager!');
} else {
    // Force start intro level
    game.levelManager.startLevel('intro', true);
}
```

### Players Not Visible
```javascript
// Check other players
console.log('Other players map:', game.otherPlayers);
console.log('Other players count:', game.otherPlayers.size);

// Check if updates are being sent
console.log('Last sync time:', game.multiplayerManager?.lastSyncTime);
```

## Manual Testing Steps

1. **Host Side:**
   - Create room
   - Check console for "Room created" message
   - Wait for "Start Game" button
   - Click it when player joins

2. **Join Side:**
   - Enter room code
   - Check console for "Join successful" message
   - Check for "Starting level" message
   - UI should disappear and game should start

## Expected Console Output

### Successful Host:
```
Starting to host game...
Host peer created with ID: alphahunter_1234
Room created! Code: 1234
```

### Successful Join:
```
Trying to join room: 1234
Connected to host!
Sending join request to host...
Client received room info: {levelId: "intro", players: [...]}
Join successful! Result: {roomCode: "1234", levelId: "intro"}
Starting level: intro
```

If you see these messages but the UI doesn't hide, use the force commands above.