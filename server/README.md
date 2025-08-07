# AlphaHunter Multiplayer Server

Simple LAN multiplayer server for the AlphaHunter game using WebSockets.

## Features

- 🎮 Real-time multiplayer gameplay over LAN
- 🎯 Room-based sessions with emoji room codes
- 👥 Support for up to 4 players per room
- 🔄 Automatic synchronization of game state
- 💝 Simple and lightweight - perfect for home networks

## Installation

```bash
cd server
npm install
```

## Running the Server

### Development Mode (with auto-restart)
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will start on port 3001 by default. You can change this by setting the PORT environment variable:

```bash
PORT=8080 npm start
```

## How It Works

1. **Host creates a room**: A player hosts a game and receives a 3-emoji room code (e.g., 🐶🍕⚽)
2. **Players join**: Other players on the same network enter the emoji code to join
3. **Real-time sync**: Player positions, scores, and game events are synchronized
4. **Automatic cleanup**: Rooms are automatically closed when empty or after 2 hours

## Room Codes

Room codes use fun emoji combinations that are easy to remember and share:
- Animals: 🐶🐱🐭
- Food: 🍕🍔🌮
- Objects: ⚽🎮🎨
- Nature: 🌳🌸🌈
- Symbols: ❤️⭐💎

## API Endpoints

### REST
- `GET /health` - Server health check and statistics

### WebSocket Events

#### Client → Server
- `host` - Create a new room
- `join` - Join an existing room
- `leave` - Leave current room
- `player_update` - Send player position/state
- `letterling_collected` - Notify letter collection
- `level_complete` - Mark level as complete

#### Server → Client
- `welcome` - Initial connection confirmation
- `room_created` - Room successfully created
- `joined_room` - Successfully joined a room
- `player_joined` - Another player joined
- `player_left` - A player left the room
- `player_update` - Another player's position/state
- `letterling_collected` - Letter collected by any player
- `game_ended` - Level completed by all players
- `error` - Error message

## Network Requirements

- Server and all clients must be on the same local network
- Port 3001 (or custom PORT) must be accessible
- WebSocket support required (all modern browsers)

## Security Note

This server is designed for LAN play only and does not include authentication or encryption. Do not expose it to the public internet.

## Troubleshooting

### Players can't connect
1. Check that the server is running
2. Verify all devices are on the same network
3. Check firewall settings for port 3001
4. Try using the server's IP address instead of hostname

### Connection drops frequently
1. Check network stability
2. Ensure devices aren't going to sleep
3. Check for firewall/antivirus interference

### Room codes not working
1. Ensure players enter the exact emoji sequence
2. Check that the room hasn't expired
3. Verify the host hasn't left the game