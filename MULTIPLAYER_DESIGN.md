# AlphaHunter Multiplayer System Design

## Overview

AlphaHunter implements a **client-hosted server model** for multiplayer gameplay, similar to Minecraft's LAN multiplayer. One player hosts a game session on their device, and other players on the same network can join using a unique 3-emoji room code.

## Core Architecture

### 1. Client-Hosted Server Model

**How It Works:**
- The host player runs both the game client AND a lightweight WebSocket server (Node.js)
- Other players connect as clients to the host's WebSocket server
- All game state synchronization flows through the host player
- The host has authoritative control over game rules, spawning, and scoring

**Benefits:**
- No central server infrastructure needed
- Works on LAN without internet connection
- Zero hosting costs for developers
- Simple setup for classroom environments
- Host can moderate their own game

### 2. Emoji Room Code System

**Room Code Generation:**
When a player hosts a game, the system generates a unique 3-emoji code:

```javascript
// Example room codes:
🦊🍕⚽ (Fox-Pizza-Soccer)
🌟🎮🦄 (Star-Game-Unicorn)
🐸🎯🌈 (Frog-Target-Rainbow)
```

**Why Emojis?**
- **Visual Memory**: Children remember pictures better than alphanumeric codes
- **Cross-Language**: No translation needed - emojis are universal
- **Fun Factor**: Kids enjoy sharing "pizza-unicorn-star" rooms with friends
- **Voice Friendly**: Easy to communicate verbally ("Join the fox-pizza-soccer room!")
- **Unique Combinations**: With ~100 curated emojis, we have 1,000,000 possible codes

**Emoji Categories:**
- Animals: 🐶🐱🐭🐹🐰🦊🐻🐼🐨🦁
- Food: 🍎🍕🍔🌮🍰🍪🍩🍉🍓🥕
- Objects: ⚽🏀🎮🎯🎨🎭🎪🎸🎹🎲
- Nature: 🌟⭐🌙☀️🌈🌺🌸🌲🌊🏔️

### 3. Connection Flow

#### Host Flow:
1. Player clicks "Host Game" in multiplayer menu
2. Selects level to play
3. System attempts to start local WebSocket server (port 3001)
4. If successful, generates 3-emoji room code
5. Room code displayed prominently with copy button
6. Host waits for players or can start alone

#### Join Flow:
1. Player clicks "Join Game" in multiplayer menu
2. Enters 3 emojis using emoji input fields
3. Client attempts to connect to hosts on LAN
4. If room found, joins and syncs game state
5. Shows same room code and player list
6. Game starts when host begins

### 4. Network Discovery (Planned)

**LAN Broadcasting:**
```javascript
// Host broadcasts presence every second
{
    type: 'alphahunter-host',
    roomCode: '🦊🍕⚽',
    hostName: 'Alex',
    levelName: 'Ocean Waves',
    playerCount: 2,
    maxPlayers: 4
}
```

**Fallback Methods:**
- Manual IP entry: `192.168.1.100:🦊🍕⚽`
- QR code generation for room info
- Bluetooth discovery for close proximity

## Game Synchronization

### 1. Host-Authoritative Model

The host controls all important game state:

```
HOST (Server)                    CLIENTS
├─ Spawns all letterlings   →    Receive spawn events
├─ Validates collections    ←    Send collection attempts
├─ Tracks all scores       →    Receive score updates
├─ Controls game timer     →    Display synced timer
└─ Ends game              →    Show final results
```

### 2. Message Protocol

**Position Updates (20Hz):**
```javascript
// Client → Host
{
    type: 'player_update',
    position: { x: 150, y: 300 },
    velocity: { x: 5, y: -3 }
}

// Host → All Clients
{
    type: 'player_update',
    playerId: 'player_abc',
    position: { x: 150, y: 300 },
    velocity: { x: 5, y: -3 },
    score: 450
}
```

**Letterling Spawning (Host Only):**
```javascript
{
    type: 'letterling_spawn',
    id: 'lett_123',
    letter: 'A',
    position: { x: 300, y: 200 },
    velocity: { x: 2, y: 0 },
    spawnTime: 1234567890
}
```

**Collection Events:**
```javascript
// Client → Host (Attempt)
{
    type: 'collect_attempt',
    letterlingId: 'lett_123',
    timestamp: 1234567890
}

// Host → All (Result)
{
    type: 'letterling_collected',
    playerId: 'player_abc',
    letterlingId: 'lett_123',
    points: 100,
    newScore: 550
}
```

### 3. Player Rendering

**OtherPlayer Class Features:**
- Smooth position interpolation between updates
- Predictive movement using velocity
- Visual connection quality indicators
- Name tags with player names
- Emoji avatars from player profile
- Score display with animations
- Collection effects when scoring
- Trail effects for movement

**Performance Optimizations:**
- Only render players within screen bounds
- Batch position updates to reduce network traffic
- Use interpolation to handle network jitter
- Client-side prediction for responsive feel

## User Interface

### 1. Room Code Display
- Persistent overlay during gameplay
- Shows 3 emojis with spacing
- Copy button for easy sharing
- Success feedback when copied

### 2. Player List/Scoreboard
- Live updating every 500ms
- Sorted by score (highest first)
- Rank indicators (🥇🥈🥉)
- Visual distinction for self
- Host crown indicator 👑
- Leader trophy animation 🏆

### 3. Connection Status
- Green: Good connection
- Orange: Poor connection (1s+ lag)
- Red: Lost connection (3s+ no response)
- WiFi indicator on player avatars

## Technical Implementation

### 1. Server Technology
- **Node.js** with Express for HTTP endpoints
- **WebSocket (ws)** for real-time communication
- **CORS enabled** for cross-origin support
- **Heartbeat system** for connection monitoring

### 2. Client Integration
- **MultiplayerManager**: Handles WebSocket connection
- **OtherPlayer**: Renders remote players
- **MultiplayerUI**: Manages UI components
- **ServerManager**: Auto-starts local server

### 3. Data Flow
```
Game Loop (60 FPS)
    ↓
Update OtherPlayers (interpolation)
    ↓
Send Position Update (20 Hz throttled)
    ↓
Render All Players
    ↓
Update UI (scores, connection status)
```

## Classroom Benefits

1. **Easy Setup**: Teacher or student can host without IT involvement
2. **No Internet Required**: Works on school LAN/WiFi
3. **Safe Environment**: Only local network access
4. **Inclusive**: Up to 4 players per game
5. **Educational**: Promotes collaboration and friendly competition

## Future Enhancements

### Phase 1 (Current):
- ✅ Basic multiplayer connection
- ✅ Player rendering and interpolation
- ✅ Emoji room codes
- ✅ Live scoreboard
- ⬜ Host-authoritative letterlings
- ⬜ Synchronized collection

### Phase 2 (Planned):
- ⬜ Auto-reconnection on disconnect
- ⬜ LAN discovery broadcasting
- ⬜ Host migration if host leaves
- ⬜ Spectator mode
- ⬜ Team modes

### Phase 3 (Future):
- ⬜ Custom multiplayer levels
- ⬜ Tournament brackets
- ⬜ Multiplayer achievements
- ⬜ Voice chat integration
- ⬜ Cross-platform play

## Security Considerations

1. **Local Network Only**: No internet exposure
2. **Room Code Expiry**: Codes expire after 2 hours
3. **Host Control**: Host can kick disruptive players
4. **No Personal Data**: Only names and scores transmitted
5. **Encrypted WebSocket**: WSS support ready

## Performance Targets

- **Latency**: < 50ms on LAN
- **Players**: Support 4 concurrent players
- **Updates**: 20Hz position updates
- **Bandwidth**: < 10KB/s per player
- **CPU Usage**: < 5% for networking

## Testing Checklist

- [x] Single machine testing (multiple tabs)
- [x] LAN testing with 2 devices
- [ ] 4-player stress test
- [x] Connection loss handling
- [x] Score synchronization
- [ ] Letterling collection races
- [ ] Host disconnection scenarios
- [ ] Slow network simulation