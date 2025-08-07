// Multiplayer Manager for handling WebSocket connections and game sync

class MultiplayerManager {
    constructor(game) {
        this.game = game;
        this.ws = null;
        this.connected = false;
        this.roomCode = null;
        this.playerId = null;
        this.isHost = false;
        this.players = new Map(); // Other players in the room
        
        // Connection settings
        this.serverUrl = this.getServerUrl();
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 1000; // Start with 1 second
        
        // Sync settings
        this.syncInterval = 50; // Send updates every 50ms (20 Hz)
        this.lastSyncTime = 0;
        
        // Event callbacks
        this.onRoomCreated = null;
        this.onRoomJoined = null;
        this.onPlayerJoined = null;
        this.onPlayerLeft = null;
        this.onGameEnded = null;
        this.onError = null;
        
        // MultiplayerManager ready
    }
    
    getServerUrl() {
        // Check if we're in development or production
        const hostname = window.location.hostname;
        
        // If hostname is empty (file:// protocol), default to localhost
        if (!hostname || hostname === '') {
            console.log('No hostname detected (file:// protocol), using localhost');
            return 'ws://localhost:3001';
        }
        
        // If we're on localhost, use localhost server
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
            return 'ws://localhost:3001';
        }
        
        // Otherwise, try to connect to server on same host
        // In LAN, this would be the host machine's IP
        return `ws://${hostname}:3001`;
    }
    
    connect() {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            console.log('Already connected to multiplayer server');
            return Promise.resolve();
        }
        
        return new Promise((resolve, reject) => {
            console.log(`Connecting to multiplayer server at ${this.serverUrl}...`);
            
            try {
                this.ws = new WebSocket(this.serverUrl);
                
                this.ws.onopen = () => {
                    console.log('Connected to multiplayer server');
                    this.connected = true;
                    this.reconnectAttempts = 0;
                    this.reconnectDelay = 1000;
                    resolve();
                };
                
                this.ws.onmessage = (event) => {
                    this.handleMessage(event.data);
                };
                
                this.ws.onclose = () => {
                    console.log('Disconnected from multiplayer server');
                    this.connected = false;
                    this.handleDisconnect();
                };
                
                this.ws.onerror = (error) => {
                    console.error('WebSocket error:', error);
                    this.connected = false;
                    reject(error);
                };
                
            } catch (error) {
                console.error('Failed to create WebSocket:', error);
                reject(error);
            }
        });
    }
    
    disconnect() {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
        this.connected = false;
        this.roomCode = null;
        this.playerId = null;
        this.isHost = false;
        this.players.clear();
        
        // Clear OtherPlayer instances
        if (this.game.otherPlayers) {
            this.game.otherPlayers.clear();
        }
    }
    
    handleMessage(data) {
        try {
            const message = JSON.parse(data);
            console.log('Received:', message.type);
            
            switch (message.type) {
                case 'welcome':
                    this.playerId = message.playerId;
                    break;
                    
                case 'room_created':
                    this.handleRoomCreated(message);
                    break;
                    
                case 'joined_room':
                    this.handleJoinedRoom(message);
                    break;
                    
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
                    
                case 'game_ended':
                    this.handleGameEnded(message);
                    break;
                    
                case 'room_closed':
                    this.handleRoomClosed(message);
                    break;
                    
                case 'error':
                    this.handleError(message);
                    break;
            }
        } catch (error) {
            console.error('Error parsing message:', error);
        }
    }
    
    handleDisconnect() {
        // Try to reconnect if we were in a room
        if (this.roomCode && this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
            
            setTimeout(() => {
                this.connect().then(() => {
                    // Try to rejoin the room
                    if (this.roomCode) {
                        const character = this.game.dataManager?.getCurrentCharacter();
                        this.joinRoom(this.roomCode, character?.identity.name || 'Player', character?.customization.activeSkin || '😊');
                    }
                }).catch(() => {
                    this.handleDisconnect(); // Try again
                });
            }, this.reconnectDelay);
            
            // Exponential backoff
            this.reconnectDelay = Math.min(this.reconnectDelay * 2, 30000); // Max 30 seconds
        } else {
            // Give up and notify user
            if (this.onError) {
                this.onError({ message: 'Lost connection to multiplayer server' });
            }
        }
    }
    
    // Host a new game
    hostGame(levelId) {
        if (!this.connected) {
            return Promise.reject(new Error('Not connected to server'));
        }
        
        const character = this.game.dataManager?.getCurrentCharacter();
        const playerName = character?.identity.name || 'Player';
        const playerEmoji = character?.customization.activeSkin || '😊';
        
        this.send({
            type: 'host',
            levelId,
            playerName,
            playerEmoji
        });
        
        return new Promise((resolve, reject) => {
            this.onRoomCreated = (data) => {
                resolve(data);
            };
            
            this.onError = (error) => {
                reject(error);
            };
            
            // Timeout after 5 seconds
            setTimeout(() => {
                reject(new Error('Timeout creating room'));
            }, 5000);
        });
    }
    
    // Join an existing game
    joinRoom(roomCode, playerName, playerEmoji) {
        if (!this.connected) {
            return Promise.reject(new Error('Not connected to server'));
        }
        
        this.send({
            type: 'join',
            roomCode,
            playerName: playerName || 'Player',
            playerEmoji: playerEmoji || '😊'
        });
        
        return new Promise((resolve, reject) => {
            this.onRoomJoined = (data) => {
                resolve(data);
            };
            
            this.onError = (error) => {
                reject(error);
            };
            
            // Timeout after 5 seconds
            setTimeout(() => {
                reject(new Error('Timeout joining room'));
            }, 5000);
        });
    }
    
    // Leave current room
    leaveRoom() {
        if (!this.connected || !this.roomCode) return;
        
        this.send({ type: 'leave' });
        this.roomCode = null;
        this.isHost = false;
        this.players.clear();
        
        // Clear OtherPlayer instances
        if (this.game.otherPlayers) {
            this.game.otherPlayers.clear();
        }
    }
    
    // Send player update
    sendPlayerUpdate() {
        if (!this.connected || !this.roomCode) return;
        
        const now = Date.now();
        if (now - this.lastSyncTime < this.syncInterval) return;
        
        this.lastSyncTime = now;
        
        const player = this.game.player;
        this.send({
            type: 'player_update',
            position: { x: player.x, y: player.y },
            velocity: { x: player.vx || 0, y: player.vy || 0 },
            score: this.game.levelManager?.currentLevelScore || 0
        });
    }
    
    // Send letterling collected event
    sendLetterlingCollected(letterlingId, letter, points) {
        if (!this.connected || !this.roomCode) return;
        
        this.send({
            type: 'letterling_collected',
            letterlingId,
            letter,
            points
        });
    }
    
    // Send level complete
    sendLevelComplete(score, time, lettersCollected) {
        if (!this.connected || !this.roomCode) return;
        
        this.send({
            type: 'level_complete',
            score,
            time,
            lettersCollected
        });
    }
    
    // Handle room created
    handleRoomCreated(message) {
        this.roomCode = message.roomCode;
        this.isHost = true;
        
        console.log(`Room created with code: ${message.roomCode}`);
        
        if (this.onRoomCreated) {
            this.onRoomCreated(message);
        }
    }
    
    // Handle joined room
    handleJoinedRoom(message) {
        this.roomCode = message.roomCode;
        this.isHost = false;
        
        // Add existing players
        message.players.forEach(player => {
            if (player.id !== this.playerId) {
                this.players.set(player.id, {
                    id: player.id,
                    name: player.name,
                    emoji: player.emoji,
                    isHost: player.isHost,
                    x: 0,
                    y: 0,
                    score: 0
                });
                
                // Create OtherPlayer instance
                if (this.game.otherPlayers) {
                    const otherPlayer = new OtherPlayer(
                        player.id,
                        player.name,
                        player.emoji,
                        0, // Initial x
                        0  // Initial y
                    );
                    this.game.otherPlayers.set(player.id, otherPlayer);
                }
            }
        });
        
        console.log(`Joined room ${message.roomCode} with ${message.players.length} players`);
        
        if (this.onRoomJoined) {
            this.onRoomJoined(message);
        }
    }
    
    // Handle player joined
    handlePlayerJoined(message) {
        const player = message.player;
        this.players.set(player.id, {
            id: player.id,
            name: player.name,
            emoji: player.emoji,
            isHost: false,
            x: 0,
            y: 0,
            score: 0
        });
        
        // Create OtherPlayer instance in the game
        if (this.game.otherPlayers) {
            const otherPlayer = new OtherPlayer(
                player.id,
                player.name,
                player.emoji,
                0, // Initial x
                0  // Initial y
            );
            this.game.otherPlayers.set(player.id, otherPlayer);
        }
        
        console.log(`Player ${player.name} joined the room`);
        
        if (this.onPlayerJoined) {
            this.onPlayerJoined(player);
        }
    }
    
    // Handle player left
    handlePlayerLeft(message) {
        const player = this.players.get(message.playerId);
        if (player) {
            this.players.delete(message.playerId);
            
            // Remove OtherPlayer instance from the game
            if (this.game.otherPlayers) {
                this.game.otherPlayers.delete(message.playerId);
            }
            
            console.log(`Player ${player.name} left the room`);
            
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
            player.vx = message.velocity.x;
            player.vy = message.velocity.y;
            player.score = message.score;
            player.lastUpdate = message.timestamp;
            
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
    
    // Handle letterling collected by another player
    handleLetterlingCollected(message) {
        // Remove the letterling from the game world
        if (this.game.worldManager) {
            this.game.worldManager.removeLetterling(message.letterlingId);
        }
        
        // Update player score
        const player = this.players.get(message.playerId);
        if (player) {
            player.score += message.points;
        }
    }
    
    // Handle game ended
    handleGameEnded(message) {
        console.log('Game ended, results:', message.results);
        
        if (this.onGameEnded) {
            this.onGameEnded(message.results);
        }
    }
    
    // Handle room closed
    handleRoomClosed(message) {
        console.log('Room closed:', message.reason);
        this.roomCode = null;
        this.isHost = false;
        this.players.clear();
        
        if (this.onError) {
            this.onError({ message: `Room closed: ${message.reason}` });
        }
    }
    
    // Handle error
    handleError(message) {
        console.error('Multiplayer error:', message.message);
        
        if (this.onError) {
            this.onError(message);
        }
    }
    
    // Send message to server
    send(data) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(data));
        }
    }
    
    // Get all players (including self)
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
            score: this.game.levelManager?.currentScore || 0,
            isSelf: true
        });
        
        return allPlayers;
    }
    
    // Check if in multiplayer mode
    isMultiplayer() {
        return this.connected && this.roomCode !== null;
    }
    
    // Check if player is host
    isGameHost() {
        return this.isHost;
    }
}