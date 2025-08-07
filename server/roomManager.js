class RoomManager {
    constructor() {
        this.rooms = new Map();
        this.playerRoomMap = new Map(); // Track which room each player is in
    }
    
    createRoom(roomCode, options) {
        if (this.rooms.has(roomCode)) {
            return null; // Room already exists
        }
        
        const room = {
            code: roomCode,
            hostId: options.hostId,
            levelId: options.levelId,
            maxPlayers: options.maxPlayers || 4,
            players: [],
            gameState: 'waiting', // waiting, playing, completed
            createdAt: Date.now(),
            levelComplete: false,
            results: {}
        };
        
        this.rooms.set(roomCode, room);
        return room;
    }
    
    getRoom(roomCode) {
        return this.rooms.get(roomCode);
    }
    
    getRoomByPlayerId(playerId) {
        const roomCode = this.playerRoomMap.get(playerId);
        return roomCode ? this.rooms.get(roomCode) : null;
    }
    
    addPlayerToRoom(roomCode, player) {
        const room = this.rooms.get(roomCode);
        if (!room) return false;
        
        // Check if room is full
        if (room.players.length >= room.maxPlayers) {
            return false;
        }
        
        // Check if player is already in a room
        if (this.playerRoomMap.has(player.id)) {
            return false;
        }
        
        // Add player to room
        room.players.push(player);
        this.playerRoomMap.set(player.id, roomCode);
        
        // Start game if all slots filled (optional)
        if (room.players.length === room.maxPlayers) {
            room.gameState = 'playing';
        }
        
        return true;
    }
    
    removePlayerFromRoom(roomCode, playerId) {
        const room = this.rooms.get(roomCode);
        if (!room) return null;
        
        // Remove player from room
        room.players = room.players.filter(p => p.id !== playerId);
        this.playerRoomMap.delete(playerId);
        
        // If room is empty, close it
        if (room.players.length === 0) {
            this.closeRoom(roomCode);
            return null;
        }
        
        return room;
    }
    
    closeRoom(roomCode) {
        const room = this.rooms.get(roomCode);
        if (!room) return;
        
        // Remove all players from tracking
        room.players.forEach(player => {
            this.playerRoomMap.delete(player.id);
        });
        
        // Delete room
        this.rooms.delete(roomCode);
    }
    
    getRoomCount() {
        return this.rooms.size;
    }
    
    getPlayerCount() {
        return this.playerRoomMap.size;
    }
    
    // Clean up old rooms (call periodically)
    cleanupOldRooms() {
        const now = Date.now();
        const maxAge = 2 * 60 * 60 * 1000; // 2 hours
        
        for (const [roomCode, room] of this.rooms.entries()) {
            if (now - room.createdAt > maxAge) {
                console.log(`Cleaning up old room: ${roomCode}`);
                this.closeRoom(roomCode);
            }
        }
    }
    
    // Get room statistics
    getRoomStats() {
        const stats = {
            totalRooms: this.rooms.size,
            totalPlayers: this.playerRoomMap.size,
            roomsByState: {
                waiting: 0,
                playing: 0,
                completed: 0
            },
            roomsByPlayerCount: {}
        };
        
        for (const room of this.rooms.values()) {
            stats.roomsByState[room.gameState]++;
            
            const playerCount = room.players.length;
            if (!stats.roomsByPlayerCount[playerCount]) {
                stats.roomsByPlayerCount[playerCount] = 0;
            }
            stats.roomsByPlayerCount[playerCount]++;
        }
        
        return stats;
    }
}

module.exports = { RoomManager };