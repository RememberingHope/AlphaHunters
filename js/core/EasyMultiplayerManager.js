// Easy Multiplayer Manager - Uses PeerJS for simple peer-to-peer multiplayer (no server needed!)

class EasyMultiplayerManager {
    constructor(game) {
        this.game = game;
        this.peer = null;
        this.connections = new Map(); // peerId -> connection
        this.players = new Map();
        
        this.isHost = false;
        this.connected = false;
        this.roomCode = null;
        this.myPeerId = null;
        
        // Update tracking
        this.syncInterval = 50; // 20Hz
        this.lastSyncTime = 0;
        
        // Callbacks
        this.onRoomCreated = null;
        this.onRoomJoined = null;
        this.onPlayerJoined = null;
        this.onPlayerLeft = null;
        this.onError = null;
        
        // Initialize PeerJS when needed
        this.peerInitialized = false;
    }
    
    // Initialize PeerJS connection
    async initializePeer() {
        if (this.peerInitialized) return;
        
        return new Promise((resolve, reject) => {
            try {
                // Use PeerJS cloud service (free, no setup needed)
                this.peer = new Peer({
                    debug: 2,
                    config: {
                        'iceServers': [
                            { urls: 'stun:stun.l.google.com:19302' },
                            { urls: 'stun:stun1.l.google.com:19302' }
                        ]
                    }
                });
                
                this.peer.on('open', (id) => {
                    console.log('Connected to PeerJS with ID:', id);
                    this.myPeerId = id;
                    this.peerInitialized = true;
                    this.connected = true;
                    resolve();
                });
                
                this.peer.on('error', (err) => {
                    console.error('PeerJS error:', err);
                    if (err.type === 'network' || err.type === 'server-error') {
                        reject(new Error('Could not connect to multiplayer service. Please check your internet connection.'));
                    } else {
                        reject(err);
                    }
                });
                
                this.peer.on('connection', (conn) => {
                    this.handleIncomingConnection(conn);
                });
                
                // Timeout after 10 seconds
                setTimeout(() => {
                    if (!this.peerInitialized) {
                        reject(new Error('Connection timeout. Please check your internet connection.'));
                    }
                }, 10000);
                
            } catch (error) {
                reject(error);
            }
        });
    }
    
    // Generate simple room code (4 digits for kids)
    generateRoomCode() {
        return Math.floor(1000 + Math.random() * 9000).toString();
    }
    
    // Host a game
    async hostGame(levelId) {
        try {
            // Initialize peer if needed
            if (!this.peerInitialized) {
                await this.initializePeer();
            }
            
            this.isHost = true;
            this.roomCode = this.generateRoomCode();
            
            // Store room info for joiners
            this.roomInfo = {
                hostId: this.myPeerId,
                roomCode: this.roomCode,
                levelId: levelId,
                players: []
            };
            
            // Add self to players
            const character = this.game.dataManager?.getCurrentCharacter();
            this.roomInfo.players.push({
                id: this.myPeerId,
                name: character?.identity.name || 'Player',
                emoji: character?.customization.activeSkin || '😊',
                isHost: true
            });
            
            console.log(`Created room ${this.roomCode} with host ID ${this.myPeerId}`);
            
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
                this.onError({ message: error.message });
            }
            throw error;
        }
    }
    
    // Join a game
    async joinRoom(roomCode, playerName, playerEmoji) {
        try {
            // Initialize peer if needed
            if (!this.peerInitialized) {
                await this.initializePeer();
            }
            
            this.isHost = false;
            this.roomCode = roomCode;
            
            // Try to connect to host
            // For demo, we'll use room code as part of peer ID
            // In production, you'd use a simple mapping service
            const hostPeerId = await this.resolveHostPeerId(roomCode);
            
            if (!hostPeerId) {
                throw new Error('Room not found. Please check the room code.');
            }
            
            // Connect to host
            const conn = this.peer.connect(hostPeerId, {
                reliable: true,
                metadata: {
                    roomCode: roomCode,
                    playerName: playerName || 'Player',
                    playerEmoji: playerEmoji || '😊'
                }
            });
            
            return new Promise((resolve, reject) => {
                const timeout = setTimeout(() => {
                    reject(new Error('Could not connect to host. Please check the room code.'));
                }, 10000);
                
                conn.on('open', () => {
                    clearTimeout(timeout);
                    console.log('Connected to host');
                    
                    this.connections.set(hostPeerId, conn);
                    this.setupConnectionHandlers(conn, hostPeerId);
                    
                    // Request room info
                    conn.send({
                        type: 'request_room_info'
                    });
                });
                
                conn.on('error', (err) => {
                    clearTimeout(timeout);
                    reject(new Error('Failed to connect to room'));
                });
                
                // Set up one-time handler for room info
                this.onceRoomInfo = (roomInfo) => {
                    resolve({
                        roomCode: roomCode,
                        levelId: roomInfo.levelId
                    });
                    
                    if (this.onRoomJoined) {
                        this.onRoomJoined({
                            roomCode: roomCode,
                            levelId: roomInfo.levelId,
                            players: roomInfo.players
                        });
                    }
                };
            });
            
        } catch (error) {
            console.error('Failed to join room:', error);
            if (this.onError) {
                this.onError({ message: error.message });
            }
            throw error;
        }
    }
    
    // Resolve host peer ID from room code
    async resolveHostPeerId(roomCode) {
        // For demo purposes, we'll use localStorage to simulate a simple registry
        // In production, you'd use a lightweight HTTP service or WebRTC signaling
        const roomRegistry = JSON.parse(localStorage.getItem('alphahunter_room_registry') || '{}');
        
        // Clean old entries (older than 1 hour)
        const now = Date.now();
        Object.keys(roomRegistry).forEach(code => {
            if (now - roomRegistry[code].created > 3600000) {
                delete roomRegistry[code];
            }
        });
        localStorage.setItem('alphahunter_room_registry', JSON.stringify(roomRegistry));
        
        return roomRegistry[roomCode]?.hostId;
    }
    
    // Register room (host only)
    registerRoom() {
        if (!this.isHost) return;
        
        const roomRegistry = JSON.parse(localStorage.getItem('alphahunter_room_registry') || '{}');
        roomRegistry[this.roomCode] = {
            hostId: this.myPeerId,
            created: Date.now()
        };
        localStorage.setItem('alphahunter_room_registry', JSON.stringify(roomRegistry));
    }
    
    // Handle incoming connection
    handleIncomingConnection(conn) {
        console.log('Incoming connection from', conn.peer);
        
        conn.on('open', () => {
            const metadata = conn.metadata;
            
            // Verify room code
            if (metadata.roomCode !== this.roomCode) {
                conn.close();
                return;
            }
            
            // Add to connections
            this.connections.set(conn.peer, conn);
            this.setupConnectionHandlers(conn, conn.peer);
            
            // Add player
            const playerInfo = {
                id: conn.peer,
                name: metadata.playerName,
                emoji: metadata.playerEmoji,
                isHost: false,
                x: 0,
                y: 0,
                score: 0
            };
            
            this.players.set(conn.peer, playerInfo);
            this.roomInfo.players.push(playerInfo);
            
            // Create OtherPlayer instance
            if (this.game.otherPlayers) {
                const otherPlayer = new OtherPlayer(
                    conn.peer,
                    playerInfo.name,
                    playerInfo.emoji,
                    0, 0
                );
                this.game.otherPlayers.set(conn.peer, otherPlayer);
            }
            
            // Notify other players
            this.broadcast({
                type: 'player_joined',
                player: playerInfo
            }, conn.peer);
            
            if (this.onPlayerJoined) {
                this.onPlayerJoined(playerInfo);
            }
        });
    }
    
    // Setup connection handlers
    setupConnectionHandlers(conn, peerId) {
        conn.on('data', (data) => {
            this.handleMessage(data, peerId);
        });
        
        conn.on('close', () => {
            this.handlePlayerDisconnect(peerId);
        });
        
        conn.on('error', (err) => {
            console.error('Connection error with', peerId, err);
        });
    }
    
    // Handle incoming messages
    handleMessage(message, peerId) {
        switch (message.type) {
            case 'request_room_info':
                // Host sends room info to new player
                if (this.isHost) {
                    const conn = this.connections.get(peerId);
                    if (conn) {
                        conn.send({
                            type: 'room_info',
                            roomInfo: this.roomInfo
                        });
                        
                        // Send current game state
                        conn.send({
                            type: 'game_state',
                            players: Array.from(this.players.values())
                        });
                    }
                }
                break;
                
            case 'room_info':
                // Client receives room info
                if (this.onceRoomInfo) {
                    this.onceRoomInfo(message.roomInfo);
                    this.onceRoomInfo = null;
                }
                break;
                
            case 'game_state':
                // Load existing players
                message.players.forEach(player => {
                    if (player.id !== this.myPeerId) {
                        this.players.set(player.id, player);
                        
                        // Create OtherPlayer instance
                        if (this.game.otherPlayers) {
                            const otherPlayer = new OtherPlayer(
                                player.id,
                                player.name,
                                player.emoji,
                                player.x || 0,
                                player.y || 0
                            );
                            this.game.otherPlayers.set(player.id, otherPlayer);
                        }
                    }
                });
                break;
                
            case 'player_joined':
                this.handlePlayerJoined(message);
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
        }
    }
    
    // Handle player joined
    handlePlayerJoined(message) {
        const player = message.player;
        if (player.id === this.myPeerId) return;
        
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
    
    // Handle player disconnect
    handlePlayerDisconnect(peerId) {
        const player = this.players.get(peerId);
        if (player) {
            this.players.delete(peerId);
            this.connections.delete(peerId);
            
            // Remove OtherPlayer instance
            if (this.game.otherPlayers) {
                this.game.otherPlayers.delete(peerId);
            }
            
            console.log(`${player.name} left the room`);
            
            // Notify others
            this.broadcast({
                type: 'player_left',
                playerId: peerId
            });
            
            if (this.onPlayerLeft) {
                this.onPlayerLeft(player);
            }
        }
    }
    
    // Handle player updates
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
    
    // Handle letterling spawn
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
    
    // Broadcast message to all connected players
    broadcast(data, excludePeerId = null) {
        this.connections.forEach((conn, peerId) => {
            if (peerId !== excludePeerId && conn.open) {
                conn.send(data);
            }
        });
    }
    
    // Send player update
    sendPlayerUpdate() {
        if (!this.connected || !this.roomCode) return;
        
        const now = Date.now();
        if (now - this.lastSyncTime < this.syncInterval) return;
        
        this.lastSyncTime = now;
        
        const player = this.game.player;
        const update = {
            type: 'player_update',
            playerId: this.myPeerId,
            position: { x: player.x, y: player.y },
            velocity: { x: player.vx || 0, y: player.vy || 0 },
            score: this.game.levelManager?.currentLevelScore || 0
        };
        
        this.broadcast(update);
    }
    
    // Send letterling spawn (host only)
    sendLetterlingSpawn(letterling) {
        if (!this.isHost || !this.connected) return;
        
        this.broadcast({
            type: 'letterling_spawn',
            id: letterling.id,
            letter: letterling.letter,
            position: { x: letterling.x, y: letterling.y },
            velocity: { x: letterling.vx, y: letterling.vy }
        });
    }
    
    // Send letterling collected
    sendLetterlingCollected(letterlingId, letter, points) {
        if (!this.connected) return;
        
        const newScore = this.game.levelManager?.currentLevelScore || 0;
        
        this.broadcast({
            type: 'letterling_collected',
            playerId: this.myPeerId,
            letterlingId: letterlingId,
            letter: letter,
            points: points,
            newScore: newScore
        });
    }
    
    // Disconnect and cleanup
    disconnect() {
        // Close all connections
        this.connections.forEach(conn => conn.close());
        this.connections.clear();
        this.players.clear();
        
        // Clear OtherPlayer instances
        if (this.game.otherPlayers) {
            this.game.otherPlayers.clear();
        }
        
        // Unregister room if host
        if (this.isHost && this.roomCode) {
            const roomRegistry = JSON.parse(localStorage.getItem('alphahunter_room_registry') || '{}');
            delete roomRegistry[this.roomCode];
            localStorage.setItem('alphahunter_room_registry', JSON.stringify(roomRegistry));
        }
        
        // Destroy peer connection
        if (this.peer) {
            this.peer.destroy();
            this.peer = null;
        }
        
        this.connected = false;
        this.peerInitialized = false;
        this.roomCode = null;
        this.isHost = false;
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
        allPlayers.set(this.myPeerId, {
            id: this.myPeerId,
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
    
    // Check if connected
    isConnected() {
        return this.connected && this.peer && !this.peer.destroyed;
    }
}