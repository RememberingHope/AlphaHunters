// Local Multiplayer Manager - Works between browser tabs on same computer (no server needed!)

class LocalMultiplayerManager {
    constructor(game) {
        this.game = game;
        this.isHost = false;
        this.connected = false;
        this.roomCode = null;
        this.playerId = this.generatePlayerId();
        this.players = new Map();
        
        // Use BroadcastChannel for tab-to-tab communication
        this.channel = null;
        this.channelName = 'alphahunter_multiplayer';
        
        // Room state (stored in localStorage for persistence)
        this.roomKey = 'alphahunter_room_';
        
        // Update intervals
        this.syncInterval = 50; // 20Hz
        this.lastSyncTime = 0;
        
        // Callbacks
        this.onRoomCreated = null;
        this.onRoomJoined = null;
        this.onPlayerJoined = null;
        this.onPlayerLeft = null;
        this.onGameEnded = null;
        this.onError = null;
    }
    
    generatePlayerId() {
        return 'player_' + Math.random().toString(36).substr(2, 9);
    }
    
    // Generate simple room code for kids
    generateRoomCode() {
        // Use 3 animal emojis for easy memory
        const animals = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', 
                        '🦁', '🐮', '🐷', '🐸', '🐵', '🐔', '🐧', '🐦', '🐤', '🦆'];
        
        let code = '';
        for (let i = 0; i < 3; i++) {
            code += animals[Math.floor(Math.random() * animals.length)];
        }
        return code;
    }
    
    // Initialize broadcast channel
    initChannel(roomCode) {
        // Close existing channel
        if (this.channel) {
            this.channel.close();
        }
        
        // Create new channel for this room
        this.channel = new BroadcastChannel(this.channelName + '_' + roomCode);
        
        // Handle incoming messages
        this.channel.onmessage = (event) => {
            this.handleMessage(event.data);
        };
        
        // Handle errors
        this.channel.onerror = (error) => {
            console.error('BroadcastChannel error:', error);
            if (this.onError) {
                this.onError({ message: 'Connection error' });
            }
        };
    }
    
    // Host a game
    async hostGame(levelId) {
        try {
            this.roomCode = this.generateRoomCode();
            this.isHost = true;
            this.connected = true;
            
            // Initialize channel
            this.initChannel(this.roomCode);
            
            // Create room data
            const character = this.game.dataManager?.getCurrentCharacter();
            const roomData = {
                roomCode: this.roomCode,
                hostId: this.playerId,
                levelId: levelId,
                players: [{
                    id: this.playerId,
                    name: character?.identity.name || 'Player',
                    emoji: character?.customization.activeSkin || '😊',
                    isHost: true,
                    x: 0,
                    y: 0,
                    score: 0
                }],
                gameState: 'waiting',
                created: Date.now()
            };
            
            // Store room data
            localStorage.setItem(this.roomKey + this.roomCode, JSON.stringify(roomData));
            
            // Start presence broadcast
            this.startPresenceBroadcast();
            
            console.log(`Created room: ${this.roomCode}`);
            
            if (this.onRoomCreated) {
                this.onRoomCreated({
                    roomCode: this.roomCode,
                    isHost: true
                });
            }
            
            return { roomCode: this.roomCode };
            
        } catch (error) {
            console.error('Failed to host game:', error);
            if (this.onError) {
                this.onError({ message: 'Failed to create room' });
            }
            throw error;
        }
    }
    
    // Join a game
    async joinRoom(roomCode, playerName, playerEmoji) {
        try {
            // Check if room exists
            const roomData = localStorage.getItem(this.roomKey + roomCode);
            if (!roomData) {
                throw new Error('Room not found');
            }
            
            const room = JSON.parse(roomData);
            
            // Check if room is full (max 4 players)
            if (room.players.length >= 4) {
                throw new Error('Room is full');
            }
            
            this.roomCode = roomCode;
            this.isHost = false;
            this.connected = true;
            
            // Initialize channel
            this.initChannel(roomCode);
            
            // Add self to room
            const newPlayer = {
                id: this.playerId,
                name: playerName || 'Player',
                emoji: playerEmoji || '😊',
                isHost: false,
                x: 0,
                y: 0,
                score: 0
            };
            
            room.players.push(newPlayer);
            localStorage.setItem(this.roomKey + roomCode, JSON.stringify(room));
            
            // Load existing players
            room.players.forEach(player => {
                if (player.id !== this.playerId) {
                    this.players.set(player.id, player);
                    
                    // Create OtherPlayer instance
                    if (this.game.otherPlayers) {
                        const otherPlayer = new OtherPlayer(
                            player.id,
                            player.name,
                            player.emoji,
                            0, 0
                        );
                        this.game.otherPlayers.set(player.id, otherPlayer);
                    }
                }
            });
            
            // Announce join
            this.broadcast({
                type: 'player_joined',
                player: newPlayer
            });
            
            // Start presence broadcast
            this.startPresenceBroadcast();
            
            console.log(`Joined room: ${roomCode}`);
            
            if (this.onRoomJoined) {
                this.onRoomJoined({
                    roomCode: roomCode,
                    levelId: room.levelId,
                    players: room.players
                });
            }
            
            return { 
                roomCode: roomCode,
                levelId: room.levelId 
            };
            
        } catch (error) {
            console.error('Failed to join room:', error);
            if (this.onError) {
                this.onError({ message: error.message });
            }
            throw error;
        }
    }
    
    // Handle incoming messages
    handleMessage(message) {
        // Ignore own messages
        if (message.senderId === this.playerId) return;
        
        switch (message.type) {
            case 'player_joined':
                this.handlePlayerJoined(message);
                break;
                
            case 'player_left':
                this.handlePlayerLeft(message);
                break;
                
            case 'player_update':
                this.handlePlayerUpdate(message);
                break;
                
            case 'letterling_collected':
                this.handleLetterlingCollected(message);
                break;
                
            case 'game_state':
                this.handleGameState(message);
                break;
                
            case 'presence':
                this.handlePresence(message);
                break;
        }
    }
    
    // Handle player joined
    handlePlayerJoined(message) {
        const player = message.player;
        this.players.set(player.id, player);
        
        // Create OtherPlayer instance
        if (this.game.otherPlayers) {
            const otherPlayer = new OtherPlayer(
                player.id,
                player.name,
                player.emoji,
                0, 0
            );
            this.game.otherPlayers.set(player.id, otherPlayer);
        }
        
        console.log(`${player.name} joined the room`);
        
        if (this.onPlayerJoined) {
            this.onPlayerJoined(player);
        }
    }
    
    // Handle player left
    handlePlayerLeft(message) {
        const playerId = message.playerId;
        const player = this.players.get(playerId);
        
        if (player) {
            this.players.delete(playerId);
            
            // Remove OtherPlayer instance
            if (this.game.otherPlayers) {
                this.game.otherPlayers.delete(playerId);
            }
            
            console.log(`${player.name} left the room`);
            
            if (this.onPlayerLeft) {
                this.onPlayerLeft(player);
            }
        }
    }
    
    // Handle player update
    handlePlayerUpdate(message) {
        const player = this.players.get(message.playerId);
        if (player) {
            player.x = message.position.x;
            player.y = message.position.y;
            player.score = message.score;
            
            // Update OtherPlayer instance
            const otherPlayer = this.game.otherPlayers?.get(message.playerId);
            if (otherPlayer) {
                otherPlayer.updatePosition(
                    message.position.x,
                    message.position.y,
                    message.velocity.x,
                    message.velocity.y
                );
                otherPlayer.setScore(message.score);
            }
        }
    }
    
    // Handle letterling collected
    handleLetterlingCollected(message) {
        // Remove letterling from world
        if (this.game.worldManager) {
            this.game.worldManager.removeLetterling(message.letterlingId);
        }
        
        // Update player score
        const player = this.players.get(message.playerId);
        if (player) {
            player.score += message.points;
            
            // Show collection effect
            const otherPlayer = this.game.otherPlayers?.get(message.playerId);
            if (otherPlayer) {
                otherPlayer.triggerCollectEffect();
            }
        }
    }
    
    // Handle game state changes
    handleGameState(message) {
        if (message.state === 'started' && !this.isHost) {
            // Non-hosts start the level
            this.game.levelManager?.startLevel(message.levelId, true);
        }
    }
    
    // Handle presence updates
    handlePresence(message) {
        // Update last seen time for player
        const player = this.players.get(message.playerId);
        if (player) {
            player.lastSeen = Date.now();
        }
    }
    
    // Broadcast message to all players
    broadcast(data) {
        if (!this.channel) return;
        
        // Add sender ID and timestamp
        data.senderId = this.playerId;
        data.timestamp = Date.now();
        
        this.channel.postMessage(data);
    }
    
    // Send player position update
    sendPlayerUpdate() {
        if (!this.connected || !this.roomCode) return;
        
        const now = Date.now();
        if (now - this.lastSyncTime < this.syncInterval) return;
        
        this.lastSyncTime = now;
        
        const player = this.game.player;
        this.broadcast({
            type: 'player_update',
            playerId: this.playerId,
            position: { x: player.x, y: player.y },
            velocity: { x: player.vx || 0, y: player.vy || 0 },
            score: this.game.levelManager?.currentLevelScore || 0
        });
    }
    
    // Send letterling collected
    sendLetterlingCollected(letterlingId, letter, points) {
        if (!this.connected) return;
        
        this.broadcast({
            type: 'letterling_collected',
            playerId: this.playerId,
            letterlingId: letterlingId,
            letter: letter,
            points: points
        });
    }
    
    // Start presence broadcast
    startPresenceBroadcast() {
        // Send presence every 2 seconds
        this.presenceInterval = setInterval(() => {
            this.broadcast({
                type: 'presence',
                playerId: this.playerId
            });
            
            // Check for disconnected players
            this.checkDisconnectedPlayers();
        }, 2000);
    }
    
    // Check for disconnected players
    checkDisconnectedPlayers() {
        const timeout = 5000; // 5 seconds
        const now = Date.now();
        
        this.players.forEach((player, playerId) => {
            if (player.lastSeen && now - player.lastSeen > timeout) {
                // Player disconnected
                this.handlePlayerLeft({ playerId: playerId });
            }
        });
    }
    
    // Leave room
    leaveRoom() {
        if (!this.connected || !this.roomCode) return;
        
        // Announce departure
        this.broadcast({
            type: 'player_left',
            playerId: this.playerId
        });
        
        // Update room data
        const roomData = localStorage.getItem(this.roomKey + this.roomCode);
        if (roomData) {
            const room = JSON.parse(roomData);
            room.players = room.players.filter(p => p.id !== this.playerId);
            
            if (room.players.length === 0 || (this.isHost && room.players.length > 0)) {
                // Delete empty room or if host left
                localStorage.removeItem(this.roomKey + this.roomCode);
            } else {
                localStorage.setItem(this.roomKey + this.roomCode, JSON.stringify(room));
            }
        }
        
        this.disconnect();
    }
    
    // Disconnect and cleanup
    disconnect() {
        // Stop presence broadcast
        if (this.presenceInterval) {
            clearInterval(this.presenceInterval);
            this.presenceInterval = null;
        }
        
        // Close channel
        if (this.channel) {
            this.channel.close();
            this.channel = null;
        }
        
        // Clear state
        this.connected = false;
        this.roomCode = null;
        this.isHost = false;
        this.players.clear();
        
        // Clear OtherPlayer instances
        if (this.game.otherPlayers) {
            this.game.otherPlayers.clear();
        }
    }
    
    // Utility methods
    isMultiplayer() {
        return this.connected;
    }
    
    isGameHost() {
        return this.isHost;
    }
    
    getAllPlayers() {
        const allPlayers = new Map(this.players);
        
        // Add self
        const character = this.game.dataManager?.getCurrentCharacter();
        allPlayers.set(this.playerId, {
            id: this.playerId,
            name: character?.identity.name || 'Player',
            emoji: character?.customization.activeSkin || '😊',
            isHost: this.isHost,
            x: this.game.player.x,
            y: this.game.player.y,
            score: this.game.levelManager?.currentLevelScore || 0,
            isSelf: true
        });
        
        return allPlayers;
    }
    
    // Get available rooms (for room browser)
    static getAvailableRooms() {
        const rooms = [];
        const prefix = 'alphahunter_room_';
        
        // Check localStorage for rooms
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith(prefix)) {
                try {
                    const roomData = JSON.parse(localStorage.getItem(key));
                    // Only show rooms created in last 30 minutes
                    if (Date.now() - roomData.created < 30 * 60 * 1000) {
                        rooms.push({
                            roomCode: roomData.roomCode,
                            playerCount: roomData.players.length,
                            hostName: roomData.players[0]?.name || 'Unknown'
                        });
                    }
                } catch (e) {
                    // Invalid room data
                }
            }
        }
        
        return rooms;
    }
    
    // Clean up old rooms
    static cleanupOldRooms() {
        const prefix = 'alphahunter_room_';
        const maxAge = 2 * 60 * 60 * 1000; // 2 hours
        
        for (let i = localStorage.length - 1; i >= 0; i--) {
            const key = localStorage.key(i);
            if (key && key.startsWith(prefix)) {
                try {
                    const roomData = JSON.parse(localStorage.getItem(key));
                    if (Date.now() - roomData.created > maxAge) {
                        localStorage.removeItem(key);
                    }
                } catch (e) {
                    // Remove invalid data
                    localStorage.removeItem(key);
                }
            }
        }
    }
}