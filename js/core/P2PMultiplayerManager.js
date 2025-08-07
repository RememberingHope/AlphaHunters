// P2P Multiplayer Manager - WebRTC peer-to-peer connections (no server needed!)

class P2PMultiplayerManager {
    constructor(game) {
        this.game = game;
        this.isHost = false;
        this.connected = false;
        this.roomCode = null;
        this.players = new Map();
        this.connections = new Map(); // peerId -> RTCPeerConnection
        this.dataChannels = new Map(); // peerId -> RTCDataChannel
        
        // Our peer ID
        this.peerId = this.generatePeerId();
        
        // Signaling via public services
        this.signalingService = 'https://alphahunter-signal.glitch.me'; // Free Glitch app
        
        // STUN servers for NAT traversal (free public servers)
        this.iceServers = [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
            { urls: 'stun:stun2.l.google.com:19302' }
        ];
        
        // Room discovery via shared clipboard or manual code
        this.discoveryMethod = 'emoji'; // 'emoji', 'number', 'qr'
        
        // Callbacks
        this.onRoomCreated = null;
        this.onRoomJoined = null;
        this.onPlayerJoined = null;
        this.onPlayerLeft = null;
        this.onGameEnded = null;
        this.onError = null;
        
        // Message handlers
        this.messageHandlers = new Map();
        this.setupMessageHandlers();
    }
    
    // Generate unique peer ID
    generatePeerId() {
        return 'peer_' + Math.random().toString(36).substr(2, 9);
    }
    
    // Setup message handlers
    setupMessageHandlers() {
        // Player updates
        this.messageHandlers.set('player_update', (data, peerId) => {
            const player = this.players.get(peerId);
            if (player) {
                player.x = data.position.x;
                player.y = data.position.y;
                player.vx = data.velocity.x;
                player.vy = data.velocity.y;
                player.score = data.score;
                
                // Update OtherPlayer instance
                const otherPlayer = this.game.otherPlayers?.get(peerId);
                if (otherPlayer) {
                    otherPlayer.updatePosition(
                        data.position.x,
                        data.position.y,
                        data.velocity.x,
                        data.velocity.y
                    );
                    otherPlayer.setScore(data.score);
                }
            }
        });
        
        // Letterling events
        this.messageHandlers.set('letterling_spawn', (data) => {
            if (!this.isHost && this.game.worldManager) {
                // Only non-hosts process spawn events
                this.game.worldManager.spawnLetterlingAt(data);
            }
        });
        
        this.messageHandlers.set('letterling_collected', (data) => {
            if (this.game.worldManager) {
                this.game.worldManager.removeLetterling(data.letterlingId);
            }
            
            // Update player score
            const player = this.players.get(data.playerId);
            if (player) {
                player.score = data.newScore;
            }
        });
    }
    
    // Create a room (as host)
    async createRoom() {
        try {
            this.isHost = true;
            this.connected = true;
            
            // Generate simple room code (4-digit number for young kids)
            this.roomCode = Math.floor(1000 + Math.random() * 9000).toString();
            
            // Register room with signaling service
            await this.registerRoom();
            
            console.log(`Created room: ${this.roomCode}`);
            
            if (this.onRoomCreated) {
                this.onRoomCreated({ 
                    roomCode: this.roomCode,
                    isHost: true 
                });
            }
            
            return { roomCode: this.roomCode };
            
        } catch (error) {
            console.error('Failed to create room:', error);
            throw error;
        }
    }
    
    // Join a room
    async joinRoom(roomCode) {
        try {
            this.roomCode = roomCode;
            this.isHost = false;
            
            // Get host info from signaling service
            const roomInfo = await this.getRoomInfo(roomCode);
            if (!roomInfo) {
                throw new Error('Room not found');
            }
            
            // Create peer connection to host
            const hostPeerId = roomInfo.hostId;
            await this.connectToPeer(hostPeerId, false);
            
            this.connected = true;
            
            if (this.onRoomJoined) {
                this.onRoomJoined({ 
                    roomCode: this.roomCode,
                    isHost: false 
                });
            }
            
            return { roomCode: this.roomCode };
            
        } catch (error) {
            console.error('Failed to join room:', error);
            throw error;
        }
    }
    
    // Create WebRTC connection to a peer
    async connectToPeer(peerId, isInitiator) {
        if (this.connections.has(peerId)) {
            return; // Already connected
        }
        
        const pc = new RTCPeerConnection({
            iceServers: this.iceServers
        });
        
        this.connections.set(peerId, pc);
        
        // Handle ICE candidates
        pc.onicecandidate = (event) => {
            if (event.candidate) {
                this.sendSignal(peerId, {
                    type: 'ice-candidate',
                    candidate: event.candidate
                });
            }
        };
        
        // Create data channel
        if (isInitiator) {
            const dc = pc.createDataChannel('game', { ordered: true });
            this.setupDataChannel(dc, peerId);
        } else {
            pc.ondatachannel = (event) => {
                this.setupDataChannel(event.channel, peerId);
            };
        }
        
        // Create and handle offer/answer
        if (isInitiator) {
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            this.sendSignal(peerId, {
                type: 'offer',
                offer: offer
            });
        }
    }
    
    // Setup data channel
    setupDataChannel(dataChannel, peerId) {
        dataChannel.onopen = () => {
            console.log(`Data channel opened with ${peerId}`);
            this.dataChannels.set(peerId, dataChannel);
            
            // Add player
            const character = this.game.dataManager?.getCurrentCharacter();
            const playerInfo = {
                id: peerId,
                name: character?.identity.name || 'Player',
                emoji: character?.customization.activeSkin || '😊',
                isHost: false,
                x: 0,
                y: 0,
                score: 0
            };
            
            this.players.set(peerId, playerInfo);
            
            // Create OtherPlayer instance
            if (this.game.otherPlayers) {
                const otherPlayer = new OtherPlayer(
                    peerId,
                    playerInfo.name,
                    playerInfo.emoji,
                    0, 0
                );
                this.game.otherPlayers.set(peerId, otherPlayer);
            }
            
            // Send our info
            this.sendToPeer(peerId, {
                type: 'player_info',
                player: {
                    id: this.peerId,
                    name: character?.identity.name || 'Player',
                    emoji: character?.customization.activeSkin || '😊'
                }
            });
            
            if (this.onPlayerJoined) {
                this.onPlayerJoined(playerInfo);
            }
        };
        
        dataChannel.onmessage = (event) => {
            try {
                const message = JSON.parse(event.data);
                this.handleMessage(message, peerId);
            } catch (error) {
                console.error('Error parsing message:', error);
            }
        };
        
        dataChannel.onclose = () => {
            console.log(`Data channel closed with ${peerId}`);
            this.handlePeerDisconnect(peerId);
        };
    }
    
    // Handle incoming messages
    handleMessage(message, peerId) {
        const handler = this.messageHandlers.get(message.type);
        if (handler) {
            handler(message, peerId);
        } else if (message.type === 'player_info') {
            // Update player info
            const player = this.players.get(peerId);
            if (player) {
                player.name = message.player.name;
                player.emoji = message.player.emoji;
            }
        }
    }
    
    // Handle peer disconnect
    handlePeerDisconnect(peerId) {
        // Remove player
        const player = this.players.get(peerId);
        if (player) {
            this.players.delete(peerId);
            this.connections.delete(peerId);
            this.dataChannels.delete(peerId);
            
            // Remove OtherPlayer instance
            if (this.game.otherPlayers) {
                this.game.otherPlayers.delete(peerId);
            }
            
            if (this.onPlayerLeft) {
                this.onPlayerLeft(player);
            }
        }
    }
    
    // Send message to specific peer
    sendToPeer(peerId, data) {
        const dc = this.dataChannels.get(peerId);
        if (dc && dc.readyState === 'open') {
            dc.send(JSON.stringify(data));
        }
    }
    
    // Broadcast message to all peers
    broadcast(data) {
        this.dataChannels.forEach((dc, peerId) => {
            if (dc.readyState === 'open') {
                dc.send(JSON.stringify(data));
            }
        });
    }
    
    // Send player update
    sendPlayerUpdate() {
        if (!this.connected) return;
        
        const player = this.game.player;
        const update = {
            type: 'player_update',
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
            playerId: this.peerId,
            letterlingId: letterlingId,
            letter: letter,
            points: points,
            newScore: newScore
        });
    }
    
    // Disconnect from room
    disconnect() {
        // Close all connections
        this.connections.forEach(pc => pc.close());
        this.dataChannels.forEach(dc => dc.close());
        
        // Clear state
        this.connections.clear();
        this.dataChannels.clear();
        this.players.clear();
        
        if (this.game.otherPlayers) {
            this.game.otherPlayers.clear();
        }
        
        this.connected = false;
        this.roomCode = null;
        this.isHost = false;
        
        // Unregister room if host
        if (this.isHost && this.roomCode) {
            this.unregisterRoom();
        }
    }
    
    // Signaling helpers (using simple HTTP for demo)
    async registerRoom() {
        // In a real implementation, this would register with a signaling service
        // For now, we'll use localStorage as a demo
        const rooms = JSON.parse(localStorage.getItem('alphahunter_rooms') || '{}');
        rooms[this.roomCode] = {
            hostId: this.peerId,
            created: Date.now()
        };
        localStorage.setItem('alphahunter_rooms', JSON.stringify(rooms));
    }
    
    async getRoomInfo(roomCode) {
        // In a real implementation, this would query a signaling service
        const rooms = JSON.parse(localStorage.getItem('alphahunter_rooms') || '{}');
        return rooms[roomCode];
    }
    
    async unregisterRoom() {
        const rooms = JSON.parse(localStorage.getItem('alphahunter_rooms') || '{}');
        delete rooms[this.roomCode];
        localStorage.setItem('alphahunter_rooms', JSON.stringify(rooms));
    }
    
    sendSignal(peerId, signal) {
        // In a real implementation, this would send via signaling service
        // For demo, we'll use postMessage or localStorage events
        console.log('Signal to', peerId, signal);
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
        allPlayers.set(this.peerId, {
            id: this.peerId,
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