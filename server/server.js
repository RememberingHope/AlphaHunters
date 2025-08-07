const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');
const { RoomManager } = require('./roomManager');
const { generateRoomCode } = require('./utils');

// Server configuration
const PORT = process.env.PORT || 3001;
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Create HTTP server
const server = http.createServer(app);

// Create WebSocket server
const wss = new WebSocket.Server({ server });

// Room manager
const roomManager = new RoomManager();

// REST endpoints
app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        rooms: roomManager.getRoomCount(),
        players: roomManager.getPlayerCount()
    });
});

// WebSocket connection handling
wss.on('connection', (ws, req) => {
    console.log('New client connected');
    
    // Initialize client state
    ws.playerId = generatePlayerId();
    ws.isAlive = true;
    ws.roomCode = null;
    
    // Send welcome message
    ws.send(JSON.stringify({
        type: 'welcome',
        playerId: ws.playerId
    }));
    
    // Heartbeat for connection monitoring
    ws.on('pong', () => {
        ws.isAlive = true;
    });
    
    // Handle incoming messages
    ws.on('message', (data) => {
        try {
            const message = JSON.parse(data);
            handleMessage(ws, message);
        } catch (error) {
            console.error('Error parsing message:', error);
            ws.send(JSON.stringify({
                type: 'error',
                message: 'Invalid message format'
            }));
        }
    });
    
    // Handle disconnection
    ws.on('close', () => {
        console.log('Client disconnected:', ws.playerId);
        handleDisconnect(ws);
    });
    
    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
    });
});

// Handle incoming messages
function handleMessage(ws, message) {
    console.log('Received message:', message.type, 'from', ws.playerId);
    
    switch (message.type) {
        case 'host':
            handleHostGame(ws, message);
            break;
            
        case 'join':
            handleJoinGame(ws, message);
            break;
            
        case 'leave':
            handleLeaveGame(ws);
            break;
            
        case 'game_state':
            handleGameState(ws, message);
            break;
            
        case 'player_update':
            handlePlayerUpdate(ws, message);
            break;
            
        case 'letterling_collected':
            handleLetterlingCollected(ws, message);
            break;
            
        case 'level_complete':
            handleLevelComplete(ws, message);
            break;
            
        default:
            ws.send(JSON.stringify({
                type: 'error',
                message: 'Unknown message type'
            }));
    }
}

// Handle host game request
function handleHostGame(ws, message) {
    const { levelId, playerName, playerEmoji } = message;
    
    // Generate room code with 3 emojis
    const roomCode = generateRoomCode();
    
    // Create room
    const room = roomManager.createRoom(roomCode, {
        hostId: ws.playerId,
        levelId,
        maxPlayers: 4
    });
    
    if (!room) {
        ws.send(JSON.stringify({
            type: 'error',
            message: 'Failed to create room'
        }));
        return;
    }
    
    // Add host to room
    const success = roomManager.addPlayerToRoom(roomCode, {
        id: ws.playerId,
        name: playerName,
        emoji: playerEmoji,
        isHost: true,
        ws
    });
    
    if (success) {
        ws.roomCode = roomCode;
        ws.send(JSON.stringify({
            type: 'room_created',
            roomCode,
            playerId: ws.playerId,
            isHost: true
        }));
    }
}

// Handle join game request
function handleJoinGame(ws, message) {
    const { roomCode, playerName, playerEmoji } = message;
    
    const room = roomManager.getRoom(roomCode);
    if (!room) {
        ws.send(JSON.stringify({
            type: 'error',
            message: 'Room not found'
        }));
        return;
    }
    
    // Add player to room
    const success = roomManager.addPlayerToRoom(roomCode, {
        id: ws.playerId,
        name: playerName,
        emoji: playerEmoji,
        isHost: false,
        ws
    });
    
    if (success) {
        ws.roomCode = roomCode;
        
        // Send join confirmation
        ws.send(JSON.stringify({
            type: 'joined_room',
            roomCode,
            playerId: ws.playerId,
            levelId: room.levelId,
            players: room.players.map(p => ({
                id: p.id,
                name: p.name,
                emoji: p.emoji,
                isHost: p.isHost
            }))
        }));
        
        // Notify other players
        broadcastToRoom(roomCode, {
            type: 'player_joined',
            player: {
                id: ws.playerId,
                name: playerName,
                emoji: playerEmoji
            }
        }, ws.playerId);
    } else {
        ws.send(JSON.stringify({
            type: 'error',
            message: 'Failed to join room'
        }));
    }
}

// Handle leave game
function handleLeaveGame(ws) {
    if (!ws.roomCode) return;
    
    const room = roomManager.removePlayerFromRoom(ws.roomCode, ws.playerId);
    
    if (room) {
        // Notify other players
        broadcastToRoom(ws.roomCode, {
            type: 'player_left',
            playerId: ws.playerId
        });
        
        // If host left, close the room
        if (room.hostId === ws.playerId) {
            broadcastToRoom(ws.roomCode, {
                type: 'room_closed',
                reason: 'Host disconnected'
            });
            roomManager.closeRoom(ws.roomCode);
        }
    }
    
    ws.roomCode = null;
}

// Handle game state updates
function handleGameState(ws, message) {
    if (!ws.roomCode) return;
    
    // Broadcast game state to all players in room
    broadcastToRoom(ws.roomCode, {
        type: 'game_state',
        state: message.state,
        timestamp: Date.now()
    }, ws.playerId);
}

// Handle player position/state updates
function handlePlayerUpdate(ws, message) {
    if (!ws.roomCode) return;
    
    // Broadcast player update to other players
    broadcastToRoom(ws.roomCode, {
        type: 'player_update',
        playerId: ws.playerId,
        position: message.position,
        velocity: message.velocity,
        score: message.score,
        timestamp: Date.now()
    }, ws.playerId);
}

// Handle letterling collection
function handleLetterlingCollected(ws, message) {
    if (!ws.roomCode) return;
    
    // Broadcast collection event
    broadcastToRoom(ws.roomCode, {
        type: 'letterling_collected',
        playerId: ws.playerId,
        letterlingId: message.letterlingId,
        letter: message.letter,
        points: message.points
    });
}

// Handle level completion
function handleLevelComplete(ws, message) {
    if (!ws.roomCode) return;
    
    // Update room state
    const room = roomManager.getRoom(ws.roomCode);
    if (room) {
        room.levelComplete = true;
        room.results = room.results || {};
        room.results[ws.playerId] = {
            score: message.score,
            time: message.time,
            lettersCollected: message.lettersCollected
        };
        
        // Check if all players completed
        const allComplete = room.players.every(p => room.results[p.id]);
        
        if (allComplete) {
            // Send final results to all players
            broadcastToRoom(ws.roomCode, {
                type: 'game_ended',
                results: room.results
            });
            
            // Close room after delay
            setTimeout(() => {
                roomManager.closeRoom(ws.roomCode);
            }, 30000); // 30 seconds to view results
        }
    }
}

// Handle client disconnect
function handleDisconnect(ws) {
    handleLeaveGame(ws);
}

// Broadcast message to all players in a room
function broadcastToRoom(roomCode, message, excludePlayerId = null) {
    const room = roomManager.getRoom(roomCode);
    if (!room) return;
    
    room.players.forEach(player => {
        if (player.id !== excludePlayerId && player.ws && player.ws.readyState === WebSocket.OPEN) {
            player.ws.send(JSON.stringify(message));
        }
    });
}

// Generate unique player ID
function generatePlayerId() {
    return 'player_' + Math.random().toString(36).substr(2, 9);
}

// Heartbeat interval to check connection health
const heartbeatInterval = setInterval(() => {
    wss.clients.forEach((ws) => {
        if (!ws.isAlive) {
            ws.terminate();
            handleDisconnect(ws);
            return;
        }
        
        ws.isAlive = false;
        ws.ping();
    });
}, 30000); // 30 seconds

// Cleanup on server shutdown
process.on('SIGTERM', () => {
    clearInterval(heartbeatInterval);
    wss.clients.forEach((ws) => {
        ws.close();
    });
    server.close(() => {
        console.log('Server shut down gracefully');
        process.exit(0);
    });
});

// Start server
server.listen(PORT, () => {
    console.log(`AlphaHunter Multiplayer Server running on port ${PORT}`);
    console.log(`WebSocket endpoint: ws://localhost:${PORT}`);
});