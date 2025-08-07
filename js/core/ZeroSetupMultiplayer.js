// Zero Setup Multiplayer - Uses WebRTC with public signaling (no server needed!)

class ZeroSetupMultiplayer {
    constructor(game) {
        this.game = game;
        this.peer = null;
        this.connections = new Map(); // peerId -> connection
        this.players = new Map();
        
        this.isHost = false;
        this.connected = false;
        this.roomCode = null;
        this.myPeerId = null;
        
        // Simple 4-digit room codes for kids
        this.roomCodeLength = 4;
        
        // Update tracking
        this.syncInterval = 50; // 20Hz
        this.lastSyncTime = 0;
        
        // Teacher monitoring support
        this.isTeacher = false;
        this.teacherPermissions = [];
        this.monitoringData = {
            includeTraceData: false,
            includeDetailedStats: false
        };
        
        // Callbacks
        this.onRoomCreated = null;
        this.onRoomJoined = null;
        this.onPlayerJoined = null;
        this.onPlayerLeft = null;
        this.onError = null;
        
        // Use PeerJS public cloud (no setup required!)
        this.peerConfig = {
            // Using default PeerJS cloud
            debug: 2,  // Increased debug level
            config: {
                'iceServers': [
                    { urls: 'stun:stun.l.google.com:19302' },
                    { urls: 'stun:stun1.l.google.com:19302' },
                    { urls: 'stun:stun.stunprotocol.org:3478' }
                ]
            }
        };
    }
    
    // Generate simple 4-digit room code
    generateRoomCode() {
        return Math.floor(1000 + Math.random() * 9000).toString();
    }
    
    // Host a game - one click!
    async hostGame(levelId) {
        try {
            console.log('Starting to host game...');
            
            // Store level info
            this.levelId = levelId;
            this.isHost = true;
            
            // Try to create room with retries
            let attempts = 0;
            const maxAttempts = 5;
            
            while (attempts < maxAttempts) {
                attempts++;
                this.roomCode = this.generateRoomCode();
                console.log(`Attempt ${attempts}: Trying room code ${this.roomCode}`);
                
                try {
                    await this.createPeerWithId('alphahunter_' + this.roomCode);
                    console.log(`Room created successfully! Code: ${this.roomCode}`);
                    
                    // Add self to players
                    const character = this.game.dataManager?.getCurrentCharacter();
                    this.players.set('host', {
                        id: 'host',
                        name: character?.identity.name || 'Host',
                        emoji: character?.customization.activeSkin || '😊',
                        isHost: true,
                        x: 0,
                        y: 0,
                        score: 0
                    });
                    
                    if (this.onRoomCreated) {
                        this.onRoomCreated({
                            roomCode: this.roomCode,
                            isHost: true
                        });
                    }
                    
                    return { roomCode: this.roomCode };
                    
                } catch (err) {
                    if (err.type === 'unavailable-id') {
                        console.log('Room code taken, trying another...');
                        if (this.peer) {
                            this.peer.destroy();
                            this.peer = null;
                        }
                        continue;
                    }
                    throw err;
                }
            }
            
            throw new Error('Could not find available room code after ' + maxAttempts + ' attempts');
            
        } catch (error) {
            console.error('Failed to host game:', error);
            if (this.onError) {
                this.onError({ message: error.message });
            }
            throw error;
        }
    }
    
    // Create peer with specific ID
    async createPeerWithId(peerId) {
        return new Promise((resolve, reject) => {
            this.peer = new Peer(peerId, this.peerConfig);
            
            const timeout = setTimeout(() => {
                reject(new Error('Connection timeout'));
            }, 10000);
            
            this.peer.on('open', (id) => {
                clearTimeout(timeout);
                console.log('Peer opened with ID:', id);
                this.myPeerId = id;
                this.connected = true;
                resolve(id);
            });
            
            this.peer.on('error', (err) => {
                clearTimeout(timeout);
                console.error('Peer error:', err);
                reject(err);
            });
            
            this.peer.on('connection', (conn) => {
                console.log('Incoming connection from:', conn.peer);
                this.handleIncomingConnection(conn);
            });
        });
    }
    
    // Join a game - just enter room code!
    async joinRoom(roomCode, playerName, playerEmoji) {
        try {
            console.log('Trying to join room:', roomCode);
            
            this.roomCode = roomCode;
            this.isHost = false;
            
            // Create peer with unique ID
            const joinerId = 'player_' + Math.random().toString(36).substr(2, 9);
            this.peer = new Peer(joinerId, this.peerConfig);
            
            return new Promise((resolve, reject) => {
                const timeout = setTimeout(() => {
                    reject(new Error('Could not connect. Please check your internet.'));
                }, 15000);
                
                this.peer.on('open', (id) => {
                    console.log('Joiner peer created with ID:', id);
                    this.myPeerId = id;
                    
                    // Connect to host
                    const hostId = 'alphahunter_' + roomCode;
                    console.log('Connecting to host:', hostId);
                    
                    const conn = this.peer.connect(hostId, {
                        reliable: true,
                        metadata: {
                            name: playerName || 'Player',
                            emoji: playerEmoji || '😊'
                        }
                    });
                    
                    const connTimeout = setTimeout(() => {
                        clearTimeout(timeout);
                        reject(new Error('Room not found. Please check the code.'));
                    }, 10000);
                    
                    conn.on('open', () => {
                        clearTimeout(timeout);
                        clearTimeout(connTimeout);
                        console.log('Connected to host!');
                        
                        this.connected = true;
                        this.connections.set('host', conn);
                        this.setupConnectionHandlers(conn, 'host');
                        
                        // Request room info
                        console.log('Sending join request to host...');
                        conn.send({
                            type: 'join_request',
                            player: {
                                name: playerName || 'Player',
                                emoji: playerEmoji || '😊'
                            },
                            isTeacher: this.isTeacher || false
                        });
                    });
                    
                    conn.on('error', (err) => {
                        clearTimeout(timeout);
                        clearTimeout(connTimeout);
                        console.error('Connection error:', err);
                        reject(new Error('Could not join room. Please check the code.'));
                    });
                    
                    // Set up handler for room info
                    this.onceRoomInfo = (data) => {
                        this.levelId = data.levelId;
                        
                        resolve({
                            roomCode: roomCode,
                            levelId: data.levelId
                        });
                        
                        if (this.onRoomJoined) {
                            this.onRoomJoined({
                                roomCode: roomCode,
                                levelId: data.levelId,
                                players: data.players
                            });
                        }
                    };
                });
                
                this.peer.on('error', (err) => {
                    clearTimeout(timeout);
                    console.error('Peer error:', err);
                    reject(new Error('Could not connect. Please try again.'));
                });
            });
            
        } catch (error) {
            console.error('Failed to join room:', error);
            if (this.onError) {
                this.onError({ message: error.message });
            }
            throw error;
        }
    }
    
    // Handle incoming connection (host only)
    handleIncomingConnection(conn) {
        console.log('New connection from:', conn.peer);
        
        conn.on('open', () => {
            console.log('Connection opened with:', conn.peer);
            
            // Add to connections
            this.connections.set(conn.peer, conn);
            this.setupConnectionHandlers(conn, conn.peer);
        });
    }
    
    // Setup connection handlers
    setupConnectionHandlers(conn, peerId) {
        conn.on('data', (data) => {
            this.handleMessage(data, peerId, conn);
        });
        
        conn.on('close', () => {
            console.log('Connection closed with:', peerId);
            this.handlePlayerDisconnect(peerId);
        });
        
        conn.on('error', (err) => {
            console.error('Connection error with', peerId, err);
        });
    }
    
    // Handle incoming messages
    handleMessage(message, peerId, conn) {
        console.log('Received message:', message.type, 'from:', peerId);
        switch (message.type) {
            case 'join_request':
                // Host handles join request
                if (this.isHost) {
                    const playerId = 'player_' + Date.now();
                    
                    // Add player
                    const playerInfo = {
                        id: playerId,
                        name: message.player.name,
                        emoji: message.player.emoji,
                        isHost: false,
                        isTeacher: message.isTeacher || false,
                        x: 0,
                        y: 0,
                        score: 0
                    };
                    
                    this.players.set(peerId, playerInfo);
                    
                    // Create OtherPlayer instance
                    if (this.game.otherPlayers) {
                        const otherPlayer = new OtherPlayer(
                            playerId,
                            playerInfo.name,
                            playerInfo.emoji,
                            0, 0
                        );
                        this.game.otherPlayers.set(peerId, otherPlayer);
                    }
                    
                    // Send room info to new player
                    console.log('Host sending room info with levelId:', this.levelId);
                    conn.send({
                        type: 'room_info',
                        levelId: this.levelId,
                        players: Array.from(this.players.values())
                    });
                    
                    // Notify all other players
                    this.broadcast({
                        type: 'player_joined',
                        player: playerInfo
                    }, peerId);
                    
                    // Send current game state
                    conn.send({
                        type: 'game_state',
                        players: Array.from(this.players.values())
                    });
                    
                    console.log(`${playerInfo.name} joined the room`);
                    
                    if (this.onPlayerJoined) {
                        this.onPlayerJoined(playerInfo);
                    }
                }
                break;
                
            case 'room_info':
                // Client receives room info
                console.log('Client received room info:', message);
                if (!this.isHost && this.onceRoomInfo) {
                    console.log('Calling onceRoomInfo handler...');
                    this.onceRoomInfo(message);
                    this.onceRoomInfo = null;
                } else {
                    console.log('Skipping room_info:', 'isHost:', this.isHost, 'has handler:', !!this.onceRoomInfo);
                }
                break;
                
            case 'game_state':
                // Load existing players
                if (!this.isHost) {
                    message.players.forEach(player => {
                        if (!player.isHost) {
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
                }
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
                
            // Teacher messages
            default:
                if (message.type.startsWith('teacher_')) {
                    this.handleTeacherMessage(message);
                }
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
            if (this.isHost) {
                this.broadcast({
                    type: 'player_left',
                    playerId: peerId
                });
            }
            
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
            
            // Store extended data if available
            if (message.extendedData) {
                player.extendedData = message.extendedData;
                
                // If we're a teacher monitoring, update display
                if (this.isTeacher && this.game.teacherMultiplayer) {
                    this.game.teacherMultiplayer.updateStudentData(message.playerId, {
                        ...player,
                        extendedData: message.extendedData
                    });
                }
            }
            
            // Update OtherPlayer instance (don't create visual for teachers)
            if (!player.isTeacher) {
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
            playerId: this.isHost ? 'host' : this.myPeerId,
            position: { x: player.x, y: player.y },
            velocity: { x: player.vx || 0, y: player.vy || 0 },
            score: this.game.levelManager?.currentLevelScore || 0
        };
        
        // Add extended monitoring data if teacher is connected
        if (this.hasTeacherConnected()) {
            update.extendedData = this.gatherExtendedPlayerData();
        }
        
        if (this.isHost) {
            this.broadcast(update);
        } else {
            // Send to host
            const hostConn = this.connections.get('host');
            if (hostConn && hostConn.open) {
                hostConn.send(update);
            }
        }
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
        
        const message = {
            type: 'letterling_collected',
            playerId: this.isHost ? 'host' : this.myPeerId,
            letterlingId: letterlingId,
            letter: letter,
            points: points,
            newScore: newScore
        };
        
        if (this.isHost) {
            this.broadcast(message);
        } else {
            // Send to host
            const hostConn = this.connections.get('host');
            if (hostConn && hostConn.open) {
                hostConn.send(message);
            }
        }
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
        
        // Destroy peer connection
        if (this.peer) {
            this.peer.destroy();
            this.peer = null;
        }
        
        this.connected = false;
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
        const myId = this.isHost ? 'host' : this.myPeerId;
        
        allPlayers.set(myId, {
            id: myId,
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
    
    // Teacher monitoring support methods
    hasTeacherConnected() {
        // Check if any connected peer is a teacher
        for (const [peerId, player] of this.players) {
            if (player.isTeacher) return true;
        }
        return false;
    }
    
    gatherExtendedPlayerData() {
        const game = this.game;
        const data = {
            currentScreen: this.getCurrentScreen(),
            currentLevel: game.levelManager?.currentLevel || null,
            levelProgress: {
                lettersCollected: game.letterlings?.filter(l => !l.isActive).length || 0,
                timeElapsed: game.levelManager?.getLevelTime() || 0,
                currentStreak: game.player?.streak || 0
            },
            traceActivity: {
                isTracing: game.tracePanel?.isActive || false,
                currentLetter: game.tracePanel?.currentLetter || null,
                attemptCount: game.player?.traceAttempts || 0,
                averageScore: game.player?.averageTraceScore || 0
            },
            playerStats: {
                level: game.progression?.playerLevel || 1,
                totalXP: game.progression?.totalXP || 0,
                coins: game.economy?.coins || 0,
                achievements: game.achievementTracker?.unlockedAchievements || []
            }
        };
        return data;
    }
    
    getCurrentScreen() {
        const game = this.game;
        if (game.isPaused) return 'pause';
        if (game.tracePanel?.isActive) return 'trace';
        if (document.querySelector('#upgradeMenu:not(.hidden)')) return 'upgrade';
        if (game.menuManager?.currentMenu) return 'menu';
        return 'game';
    }
    
    // Teacher connection methods
    connectAsTeacher(roomCode, teacherPin) {
        this.isTeacher = true;
        this.teacherPin = teacherPin;
        // Join with teacher indicator
        return this.joinRoom(roomCode, '👩‍🏫 Teacher', '👩‍🏫');
    }
    
    sendTeacherMessage(type, data) {
        if (!this.isTeacher) return;
        
        const message = {
            type: `teacher_${type}`,
            data: data,
            teacherPin: this.teacherPin
        };
        
        this.broadcast(message);
    }
    
    // Handle incoming teacher messages
    handleTeacherMessage(message) {
        // Verify teacher PIN
        if (!this.verifyTeacherPin(message.teacherPin)) {
            console.error('Invalid teacher PIN');
            return;
        }
        
        const type = message.type.replace('teacher_', '');
        const data = message.data;
        
        // Check if this message is for us or broadcast
        if (data.targetStudent && data.targetStudent !== (this.isHost ? 'host' : this.myPeerId)) {
            return; // Message is for another student
        }
        
        switch (type) {
            case 'hint':
                this.showTeacherHint(data.message);
                break;
                
            case 'encouragement':
                this.showTeacherEncouragement(data.message);
                break;
                
            case 'challenge':
                this.startTeacherChallenge(data);
                break;
                
            case 'pause':
                this.game.pause();
                this.showTeacherNotification('Teacher paused the game');
                break;
                
            case 'resume':
                this.game.resume();
                break;
        }
    }
    
    verifyTeacherPin(pin) {
        // Check against stored teacher PIN
        const storedPin = this.game.teacherAuth?.config?.pin || '1234';
        return pin === storedPin;
    }
    
    showTeacherHint(message) {
        this.showTeacherNotification(message, 'hint', 5000);
    }
    
    showTeacherEncouragement(message) {
        this.showTeacherNotification(message, 'encouragement', 3000);
    }
    
    showTeacherNotification(message, type = 'info', duration = 3000) {
        const notification = document.createElement('div');
        notification.className = 'teacher-notification';
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: ${type === 'hint' ? '#2196F3' : '#4CAF50'};
            color: white;
            padding: 15px 25px;
            border-radius: 10px;
            font-size: 18px;
            font-weight: bold;
            z-index: 10000;
            animation: slideDown 0.3s ease-out;
            box-shadow: 0 4px 8px rgba(0,0,0,0.3);
        `;
        
        notification.innerHTML = `
            <span style="margin-right: 10px;">👩‍🏫</span>
            ${message}
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideUp 0.3s ease-out';
            setTimeout(() => notification.remove(), 300);
        }, duration);
    }
    
    startTeacherChallenge(challengeData) {
        if (challengeData.type === 'letter_trace') {
            // Create a special letterling for the challenge
            const challengeLetterling = {
                letter: challengeData.letter,
                x: this.game.player.x,
                y: this.game.player.y,
                isChallenge: true,
                reward: challengeData.reward || 50
            };
            
            // Show challenge notification
            this.showTeacherNotification(
                `Teacher Challenge: Trace the letter "${challengeData.letter.toUpperCase()}"! 🎯`,
                'challenge',
                5000
            );
            
            // Start trace encounter
            setTimeout(() => {
                this.game.tracePanel.startEncounter(challengeLetterling);
            }, 1000);
        }
    }
}