// Combined Panel UI - Consolidates Leaderboard and Multiplayer UI
class CombinedPanel {
    constructor(game) {
        this.game = game;
        this.currentTab = 'leaderboard';
        this.isVisible = false;
        this.element = null;
        
        this.init();
    }
    
    init() {
        this.createElement();
        this.bindEvents();
    }
    
    createElement() {
        // Create main panel container
        this.element = document.createElement('div');
        this.element.className = 'combined-panel';
        this.element.style.display = 'none';
        
        // No tabs needed - just show friends/multiplayer
        const tabsHTML = '';
        
        // Create content containers - only multiplayer/friends content
        const contentHTML = `
            <div class="panel-content">
                <h3 style="text-align: center; margin-bottom: 4px; font-size: 14px; padding: 2px 0;">
                    👫 Friends
                </h3>
                
                <div id="multiplayerContent" class="tab-content">
                    <div class="multiplayer-status" id="multiplayerStatus" style="display: flex; gap: var(--space-xs);">
                        <button id="quickHostBtn" class="quick-action-btn" style="flex: 1;">
                            🏠 Host
                        </button>
                        <button id="quickJoinBtn" class="quick-action-btn" style="flex: 1;">
                            🔗 Join
                        </button>
                    </div>
                    
                    <div id="roomInfo" style="display: none;">
                        <div class="room-code-display">
                            <span style="font-size: var(--ui-scale-small);">Room:</span>
                            <span id="miniRoomCode" class="room-code-mini"></span>
                        </div>
                        <div id="playerList" class="player-list">
                            <!-- Player entries will be added here -->
                        </div>
                        <button id="leaveRoomBtn" class="quick-action-btn danger">
                            ❌ Leave
                        </button>
                    </div>
                    
                    <div id="joinDialog" style="display: none;">
                        <input type="text" id="quickRoomCode" placeholder="Code" maxlength="4" />
                        <div class="dialog-buttons">
                            <button id="confirmJoinBtn" class="quick-action-btn">✅</button>
                            <button id="cancelJoinBtn" class="quick-action-btn">❌</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        this.element.innerHTML = tabsHTML + contentHTML;
        
        // Add custom styles for the combined panel
        this.addStyles();
        
        // Add to document
        document.body.appendChild(this.element);
    }
    
    addStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .quick-action-btn {
                width: 100%;
                padding: var(--space-xs) var(--space-sm);
                margin: var(--space-xs) 0;
                background: linear-gradient(135deg, #4CAF50, #45a049);
                border: 2px solid #fff;
                border-radius: var(--radius-sm);
                color: white;
                font-size: var(--ui-scale-small);
                font-weight: bold;
                cursor: pointer;
                transition: all 0.2s;
                font-family: 'Comic Sans MS', cursive;
            }
            
            .quick-action-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
            }
            
            .quick-action-btn.danger {
                background: linear-gradient(135deg, #f44336, #d32f2f);
            }
            
            .room-code-display {
                text-align: center;
                padding: var(--space-sm);
                background: rgba(0, 0, 0, 0.1);
                border-radius: var(--radius-sm);
                margin-bottom: var(--space-sm);
            }
            
            .room-code-mini {
                font-size: var(--ui-scale-medium);
                font-weight: bold;
                letter-spacing: 0.1em;
                color: #4CAF50;
            }
            
            #quickRoomCode {
                width: 100%;
                padding: var(--space-xs);
                font-size: var(--ui-scale-medium);
                text-align: center;
                border: 2px solid #333;
                border-radius: var(--radius-sm);
                margin-bottom: var(--space-xs);
            }
            
            .dialog-buttons {
                display: flex;
                gap: var(--space-sm);
            }
            
            .dialog-buttons button {
                flex: 1;
            }
            
            .player-list {
                max-height: 150px;
                overflow-y: auto;
                margin: var(--space-xs) 0;
            }
            
            .player-entry {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: var(--space-xs);
                background: rgba(0, 0, 0, 0.05);
                border-radius: var(--radius-sm);
                margin-bottom: 2px;
                font-size: var(--ui-scale-small);
            }
            
            .player-entry.self {
                background: rgba(76, 175, 80, 0.2);
                border: 2px solid #4CAF50;
            }
            
            .tab-content {
                min-height: 200px;
            }
        `;
        document.head.appendChild(style);
    }
    
    bindEvents() {
        // Multiplayer actions
        const quickHost = this.element.querySelector('#quickHostBtn');
        const quickJoin = this.element.querySelector('#quickJoinBtn');
        const confirmJoin = this.element.querySelector('#confirmJoinBtn');
        const cancelJoin = this.element.querySelector('#cancelJoinBtn');
        const leaveRoom = this.element.querySelector('#leaveRoomBtn');
        
        if (quickHost) quickHost.addEventListener('click', () => this.quickHost());
        if (quickJoin) quickJoin.addEventListener('click', () => this.showJoinDialog());
        if (confirmJoin) confirmJoin.addEventListener('click', () => this.quickJoin());
        if (cancelJoin) cancelJoin.addEventListener('click', () => this.hideJoinDialog());
        if (leaveRoom) leaveRoom.addEventListener('click', () => this.leaveRoom());
        
        // Room code input
        const codeInput = this.element.querySelector('#quickRoomCode');
        if (codeInput) {
            codeInput.addEventListener('input', (e) => {
                e.target.value = e.target.value.replace(/[^0-9]/g, '');
            });
            
            codeInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.quickJoin();
            });
        }
    }
    
    show() {
        this.element.style.display = 'block';
        this.isVisible = true;
        this.updateContent();
    }
    
    hide() {
        this.element.style.display = 'none';
        this.isVisible = false;
    }
    
    toggle() {
        if (this.isVisible) {
            this.hide();
        } else {
            this.show();
        }
    }
    
    updateContent() {
        this.updateMultiplayerStatus();
    }
    
    updateLeaderboard() {
        const list = this.element.querySelector('#combinedLeaderboardList');
        if (!list) return;
        
        // Get scores from level manager or data manager
        const scores = this.getLeaderboardData();
        
        list.innerHTML = '';
        
        scores.forEach((entry, index) => {
            const div = document.createElement('div');
            div.className = 'leaderboard-entry';
            if (entry.isPlayer) div.classList.add('player');
            
            const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '';
            
            div.innerHTML = `
                <span class="leaderboard-rank">${medal || (index + 1)}</span>
                <span class="leaderboard-name">${entry.name}</span>
                <span class="leaderboard-score">${entry.score} ⭐</span>
            `;
            
            list.appendChild(div);
        });
    }
    
    updateMultiplayerStatus() {
        const mp = this.game.multiplayerManager;
        const statusDiv = this.element.querySelector('#multiplayerStatus');
        const roomInfo = this.element.querySelector('#roomInfo');
        const joinDialog = this.element.querySelector('#joinDialog');
        
        if (!mp || !mp.isConnected()) {
            // Not in multiplayer
            statusDiv.style.display = 'block';
            roomInfo.style.display = 'none';
            joinDialog.style.display = 'none';
        } else {
            // In multiplayer
            statusDiv.style.display = 'none';
            roomInfo.style.display = 'block';
            joinDialog.style.display = 'none';
            
            // Update room code
            const codeSpan = this.element.querySelector('#miniRoomCode');
            if (codeSpan) codeSpan.textContent = mp.roomCode || '????';
            
            // Update player list
            this.updatePlayerList();
        }
    }
    
    updatePlayerList() {
        const mp = this.game.multiplayerManager;
        if (!mp) return;
        
        const playerList = this.element.querySelector('#playerList');
        if (!playerList) return;
        
        const players = mp.getAllPlayers();
        playerList.innerHTML = '';
        
        // Sort by score
        const sorted = Array.from(players.values()).sort((a, b) => (b.score || 0) - (a.score || 0));
        
        sorted.forEach(player => {
            const div = document.createElement('div');
            div.className = 'player-entry';
            if (player.isSelf) div.classList.add('self');
            
            div.innerHTML = `
                <span>${player.emoji} ${player.name}</span>
                <span>${player.score || 0} ⭐</span>
            `;
            
            playerList.appendChild(div);
        });
    }
    
    async quickHost() {
        try {
            // Initialize multiplayer if needed
            if (!this.game.multiplayerManager) {
                this.game.multiplayerManager = new ZeroSetupMultiplayer(this.game);
                this.setupMultiplayerCallbacks();
            }
            
            // Get current level
            const levels = this.game.levelManager?.getAllLevels() || [];
            const currentLevel = this.game.levelManager?.currentLevel || levels[0]?.id || 'intro';
            
            // Host game
            const result = await this.game.multiplayerManager.hostGame(currentLevel);
            
            // Update UI
            this.updateMultiplayerStatus();
            
            // Show room code briefly
            this.showNotification(`Room created! Code: ${result.roomCode}`);
            
        } catch (error) {
            console.error('Failed to host:', error);
            this.showNotification('Failed to create room', true);
        }
    }
    
    showJoinDialog() {
        const statusDiv = this.element.querySelector('#multiplayerStatus');
        const joinDialog = this.element.querySelector('#joinDialog');
        
        statusDiv.style.display = 'none';
        joinDialog.style.display = 'block';
        
        const input = this.element.querySelector('#quickRoomCode');
        if (input) {
            input.value = '';
            input.focus();
        }
    }
    
    hideJoinDialog() {
        const statusDiv = this.element.querySelector('#multiplayerStatus');
        const joinDialog = this.element.querySelector('#joinDialog');
        
        statusDiv.style.display = 'block';
        joinDialog.style.display = 'none';
    }
    
    async quickJoin() {
        const input = this.element.querySelector('#quickRoomCode');
        const code = input?.value;
        
        if (!code || code.length !== 4) {
            this.showNotification('Enter 4-digit code', true);
            return;
        }
        
        try {
            // Initialize multiplayer if needed
            if (!this.game.multiplayerManager) {
                this.game.multiplayerManager = new ZeroSetupMultiplayer(this.game);
                this.setupMultiplayerCallbacks();
            }
            
            // Get character info
            const character = this.game.dataManager?.getCurrentCharacter();
            
            // Join room
            const result = await this.game.multiplayerManager.joinRoom(
                code,
                character?.identity.name || 'Player',
                character?.customization.activeSkin || '😊'
            );
            
            // Update UI
            this.hideJoinDialog();
            this.updateMultiplayerStatus();
            
            // Start level if needed
            if (this.game.state !== 'playing') {
                this.game.state = 'playing';
                if (this.game.levelManager) {
                    this.game.levelManager.startLevel(result.levelId || 'intro', true);
                }
            }
            
            this.showNotification('Joined room!');
            
        } catch (error) {
            console.error('Failed to join:', error);
            this.showNotification('Failed to join room', true);
        }
    }
    
    leaveRoom() {
        if (this.game.multiplayerManager) {
            this.game.multiplayerManager.disconnect();
            this.updateMultiplayerStatus();
            this.showNotification('Left room');
        }
    }
    
    setupMultiplayerCallbacks() {
        const mp = this.game.multiplayerManager;
        if (!mp) return;
        
        mp.onPlayerJoined = (player) => {
            this.updatePlayerList();
            this.showNotification(`${player.name} joined!`);
        };
        
        mp.onPlayerLeft = (player) => {
            this.updatePlayerList();
            this.showNotification(`${player.name} left`);
        };
        
        mp.onError = (error) => {
            this.showNotification(error.message, true);
        };
    }
    
    showNotification(message, isError = false) {
        // Create temporary notification
        const notif = document.createElement('div');
        notif.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: ${isError ? 'rgba(244, 67, 54, 0.9)' : 'rgba(76, 175, 80, 0.9)'};
            color: white;
            padding: var(--space-md) var(--space-lg);
            border-radius: var(--radius-md);
            font-size: var(--ui-scale-medium);
            font-weight: bold;
            z-index: 10000;
            animation: notificationPop 0.3s ease-out;
        `;
        notif.textContent = message;
        
        document.body.appendChild(notif);
        
        setTimeout(() => {
            notif.style.opacity = '0';
            notif.style.transition = 'opacity 0.3s';
            setTimeout(() => notif.remove(), 300);
        }, 2000);
    }
    
    getLeaderboardData() {
        // Get multiplayer players if in multiplayer
        if (this.game.multiplayerManager?.isConnected()) {
            const players = this.game.multiplayerManager.getAllPlayers();
            return Array.from(players.values())
                .sort((a, b) => (b.score || 0) - (a.score || 0))
                .map(p => ({
                    name: p.name,
                    score: p.score || 0,
                    isPlayer: p.isSelf
                }));
        }
        
        // Otherwise get stored scores
        const scores = [];
        const currentScore = this.game.levelManager?.currentLevelScore || 0;
        const playerName = this.game.dataManager?.getCurrentCharacter()?.identity.name || 'You';
        
        // Add current player
        scores.push({
            name: playerName,
            score: currentScore,
            isPlayer: true
        });
        
        // Add AI scores (example)
        const aiNames = ['Alex', 'Sam', 'Max', 'Luna', 'Sky'];
        aiNames.forEach(name => {
            scores.push({
                name: name,
                score: Math.floor(Math.random() * currentScore * 0.8),
                isPlayer: false
            });
        });
        
        return scores.sort((a, b) => b.score - a.score).slice(0, 10);
    }
}

// Add notification animation
const style = document.createElement('style');
style.textContent = `
    @keyframes notificationPop {
        0% {
            transform: translate(-50%, -50%) scale(0.8);
            opacity: 0;
        }
        100% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 1;
        }
    }
`;
document.head.appendChild(style);