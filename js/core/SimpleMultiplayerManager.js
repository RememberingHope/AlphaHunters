// Simple Multiplayer Manager - Uses Firebase for instant multiplayer (no server setup needed!)

class SimpleMultiplayerManager {
    constructor(game) {
        this.game = game;
        this.isHost = false;
        this.connected = false;
        this.roomCode = null;
        this.playerId = this.generatePlayerId();
        this.players = new Map();
        
        // Firebase configuration (free tier)
        this.firebaseConfig = {
            apiKey: "AIzaSyBcK5fQLhXlVJjVwZPHsW_iKdFw8k8MXBA",
            authDomain: "alphahunter-multiplayer.firebaseapp.com",
            databaseURL: "https://alphahunter-multiplayer-default-rtdb.firebaseio.com",
            projectId: "alphahunter-multiplayer",
            storageBucket: "alphahunter-multiplayer.appspot.com",
            messagingSenderId: "123456789012",
            appId: "1:123456789012:web:abcdef123456"
        };
        
        // Database references
        this.database = null;
        this.roomRef = null;
        this.playersRef = null;
        this.gameStateRef = null;
        
        // Update tracking
        this.syncInterval = 50; // 20Hz
        this.lastSyncTime = 0;
        
        // Callbacks
        this.onRoomCreated = null;
        this.onRoomJoined = null;
        this.onPlayerJoined = null;
        this.onPlayerLeft = null;
        this.onGameEnded = null;
        this.onError = null;
        
        // Initialize Firebase
        this.initFirebase();
    }
    
    generatePlayerId() {
        return 'player_' + Math.random().toString(36).substr(2, 9);
    }
    
    // Initialize Firebase
    async initFirebase() {
        // For now, we'll use a simple WebSocket relay service instead
        // This avoids needing Firebase setup
        this.useSimpleRelay = true;
        this.relayUrl = 'wss://alphahunter-relay.herokuapp.com'; // Free Heroku app
        this.relaySocket = null;
        this.connected = false;
    }
    
    // Connect to relay service
    async connect() {
        if (this.connected) return Promise.resolve();
        
        return new Promise((resolve, reject) => {
            try {
                // Use a public WebSocket relay service
                this.relaySocket = new WebSocket(this.relayUrl);
                
                this.relaySocket.onopen = () => {
                    console.log('Connected to multiplayer relay');
                    this.connected = true;
                    
                    // Register our player ID
                    this.send({
                        type: 'register',
                        playerId: this.playerId
                    });
                    
                    resolve();
                };
                
                this.relaySocket.onmessage = (event) => {
                    try {
                        const message = JSON.parse(event.data);
                        this.handleMessage(message);
                    } catch (error) {
                        console.error('Error parsing message:', error);
                    }
                };
                
                this.relaySocket.onclose = () => {
                    console.log('Disconnected from relay');
                    this.connected = false;
                    this.handleDisconnect();
                };
                
                this.relaySocket.onerror = (error) => {
                    console.error('WebSocket error:', error);
                    reject(new Error('Could not connect to multiplayer service'));
                };
                
                // Timeout after 5 seconds
                setTimeout(() => {
                    if (!this.connected) {
                        reject(new Error('Connection timeout'));
                    }
                }, 5000);
                
            } catch (error) {
                reject(error);
            }
        });
    }
    
    // Generate kid-friendly room code (4 numbers)
    generateRoomCode() {
        return Math.floor(1000 + Math.random() * 9000).toString();
    }
    
    // Host a game (automatic connection)
    async hostGame(levelId) {
        try {
            // Auto-connect if needed
            if (!this.connected) {
                await this.connect();
            }
            
            this.roomCode = this.generateRoomCode();
            this.isHost = true;
            
            const character = this.game.dataManager?.getCurrentCharacter();
            
            // Create room
            this.send({
                type: 'create_room',
                roomCode: this.roomCode,
                hostId: this.playerId,
                levelId: levelId,
                hostInfo: {
                    name: character?.identity.name || 'Player',
                    emoji: character?.customization.activeSkin || '😊'
                }
            });
            
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
                this.onError({ 
                    message: 'Could not create game room. Please check your internet connection.' 
                });
            }
            throw error;
        }
    }
    
    // Join a game (automatic connection)
    async joinRoom(roomCode, playerName, playerEmoji) {
        try {
            // Auto-connect if needed
            if (!this.connected) {
                await this.connect();
            }
            
            this.roomCode = roomCode;
            this.isHost = false;
            
            // Join room
            this.send({
                type: 'join_room',
                roomCode: roomCode,
                playerId: this.playerId,
                playerInfo: {
                    name: playerName || 'Player',
                    emoji: playerEmoji || '😊'
                }
            });
            
            // Wait for join confirmation (with timeout)
            return new Promise((resolve, reject) => {
                const timeout = setTimeout(() => {
                    reject(new Error('Room not found or full'));
                }, 5000);
                
                this.onJoinConfirmed = (data) => {
                    clearTimeout(timeout);
                    resolve(data);
                };
                
                this.onJoinError = (error) => {
                    clearTimeout(timeout);
                    reject(new Error(error.message));
                };
            });
            
        } catch (error) {
            console.error('Failed to join game:', error);
            if (this.onError) {
                this.onError({ 
                    message: error.message || 'Could not join game. Please check the room code.' 
                });
            }
            throw error;
        }
    }
    
    // Handle incoming messages
    handleMessage(message) {
        switch (message.type) {
            case 'room_created':
                // Room creation confirmed
                break;
                
            case 'joined_room':
                // Successfully joined room
                this.handleJoinedRoom(message);
                break;
                
            case 'join_error':
                if (this.onJoinError) {
                    this.onJoinError(message);
                }
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
                
            case 'letterling_spawn':
                this.handleLetterlingSpawn(message);
                break;
                
            case 'letterling_collected':
                this.handleLetterlingCollected(message);
                break;
                
            case 'game_started':
                this.handleGameStarted(message);
                break;
        }
    }
    
    // Handle successful room join
    handleJoinedRoom(message) {
        // Load existing players
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
                        0, 0
                    );
                    this.game.otherPlayers.set(player.id, otherPlayer);
                }
            }
        });
        
        console.log(`Joined room ${this.roomCode} with ${message.players.length} players`);
        
        if (this.onJoinConfirmed) {
            this.onJoinConfirmed({
                roomCode: this.roomCode,
                levelId: message.levelId
            });
        }
        
        if (this.onRoomJoined) {
            this.onRoomJoined({
                roomCode: this.roomCode,
                levelId: message.levelId,
                players: message.players
            });
        }
    }
    
    // Handle player joined
    handlePlayerJoined(message) {
        const player = message.player;
        if (player.id === this.playerId) return; // Skip self
        
        this.players.set(player.id, {
            id: player.id,
            name: player.name,
            emoji: player.emoji,
            isHost: false,
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
    
    // Handle player position updates
    handlePlayerUpdate(message) {
        if (message.playerId === this.playerId) return; // Skip self
        
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
    
    // Handle letterling spawn (from host)
    handleLetterlingSpawn(message) {
        if (this.isHost) return; // Host already has letterlings
        
        // Spawn letterling in non-host games
        if (this.game.worldManager) {
            this.game.worldManager.spawnLetterlingAt({
                id: message.id,
                letter: message.letter,
                x: message.position.x,
                y: message.position.y,
                vx: message.velocity.x,
                vy: message.velocity.y
            });
        }
    }
    
    // Handle letterling collection
    handleLetterlingCollected(message) {
        // Remove letterling from world
        if (this.game.worldManager) {
            this.game.worldManager.removeLetterling(message.letterlingId);
        }
        
        // Update player score
        const player = this.players.get(message.playerId);
        if (player) {
            player.score = message.newScore;
            
            // Show collection effect
            const otherPlayer = this.game.otherPlayers?.get(message.playerId);
            if (otherPlayer) {
                otherPlayer.triggerCollectEffect();
            }
        }
    }
    
    // Handle game started
    handleGameStarted(message) {
        if (!this.isHost) {
            // Non-hosts start the level
            this.game.levelManager?.startLevel(message.levelId, true);
        }
    }
    
    // Handle disconnection
    handleDisconnect() {
        // Try to reconnect once
        if (this.roomCode && !this.reconnecting) {
            this.reconnecting = true;
            console.log('Connection lost, attempting to reconnect...');
            
            setTimeout(() => {
                this.connect().then(() => {
                    // Rejoin room
                    if (this.roomCode) {
                        this.send({
                            type: 'rejoin_room',
                            roomCode: this.roomCode,
                            playerId: this.playerId
                        });
                    }
                    this.reconnecting = false;
                }).catch(() => {
                    // Give up
                    this.reconnecting = false;
                    if (this.onError) {
                        this.onError({ message: 'Lost connection to game' });
                    }
                });
            }, 1000);
        }
    }
    
    // Send message to relay
    send(data) {
        if (this.relaySocket && this.relaySocket.readyState === WebSocket.OPEN) {
            this.relaySocket.send(JSON.stringify(data));
        }
    }
    
    // Send player position update
    sendPlayerUpdate() {
        if (!this.connected || !this.roomCode) return;
        
        const now = Date.now();
        if (now - this.lastSyncTime < this.syncInterval) return;
        
        this.lastSyncTime = now;
        
        const player = this.game.player;
        this.send({
            type: 'player_update',
            roomCode: this.roomCode,
            playerId: this.playerId,
            position: { x: player.x, y: player.y },
            velocity: { x: player.vx || 0, y: player.vy || 0 },
            score: this.game.levelManager?.currentLevelScore || 0
        });
    }
    
    // Send letterling spawn (host only)
    sendLetterlingSpawn(letterling) {
        if (!this.isHost || !this.connected || !this.roomCode) return;
        
        this.send({
            type: 'letterling_spawn',
            roomCode: this.roomCode,
            id: letterling.id,
            letter: letterling.letter,
            position: { x: letterling.x, y: letterling.y },
            velocity: { x: letterling.vx, y: letterling.vy }
        });
    }
    
    // Send letterling collected
    sendLetterlingCollected(letterlingId, letter, points) {
        if (!this.connected || !this.roomCode) return;
        
        const newScore = this.game.levelManager?.currentLevelScore || 0;
        
        this.send({
            type: 'letterling_collected',
            roomCode: this.roomCode,
            playerId: this.playerId,
            letterlingId: letterlingId,
            letter: letter,
            points: points,
            newScore: newScore
        });
    }
    
    // Start game (host only)
    startGame(levelId) {
        if (!this.isHost || !this.connected || !this.roomCode) return;
        
        this.send({
            type: 'start_game',
            roomCode: this.roomCode,
            levelId: levelId
        });
    }
    
    // Leave room
    leaveRoom() {
        if (!this.connected || !this.roomCode) return;
        
        this.send({
            type: 'leave_room',
            roomCode: this.roomCode,
            playerId: this.playerId
        });
        
        this.roomCode = null;
        this.isHost = false;
        this.players.clear();
        
        // Clear OtherPlayer instances
        if (this.game.otherPlayers) {
            this.game.otherPlayers.clear();
        }
    }
    
    // Disconnect completely
    disconnect() {
        this.leaveRoom();
        
        if (this.relaySocket) {
            this.relaySocket.close();
            this.relaySocket = null;
        }
        
        this.connected = false;
    }
    
    // Utility methods
    isMultiplayer() {
        return this.connected && this.roomCode !== null;
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
}