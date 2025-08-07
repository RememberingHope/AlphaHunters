// Multiplayer UI Components

class MultiplayerUI {
    constructor(game) {
        this.game = game;
        this.multiplayerManager = game.multiplayerManager;
        this.isVisible = false;
        
        this.init();
    }
    
    init() {
        this.createMultiplayerMenu();
        this.createRoomCodeDisplay();
        this.createPlayerList();
        this.bindEvents();
        
        // MultiplayerUI ready
    }
    
    createMultiplayerMenu() {
        // Main multiplayer menu
        const menuOverlay = document.createElement('div');
        menuOverlay.id = 'multiplayerMenuOverlay';
        menuOverlay.style.cssText = `
            position: fixed;
            top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0, 0, 0, 0.9);
            display: none;
            justify-content: center;
            align-items: center;
            z-index: 2000;
            font-family: 'Comic Sans MS', cursive;
        `;
        
        menuOverlay.innerHTML = `
            <div id="multiplayerMenu" style="
                background: linear-gradient(135deg, #00BCD4, #00838F);
                border: 4px solid #fff;
                border-radius: 20px;
                padding: 40px;
                color: white;
                text-align: center;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
                max-width: 500px;
                width: 90%;
            ">
                <h1 style="margin: 0 0 30px 0; font-size: 36px;">🎮 Multiplayer Mode</h1>
                
                <div id="multiplayerOptions" style="display: flex; flex-direction: column; gap: 20px;">
                    <button id="hostGameBtn" style="
                        background: linear-gradient(135deg, #4CAF50, #45a049);
                        border: none; color: white; padding: 20px 30px;
                        border-radius: 15px; font-size: 20px; font-weight: bold;
                        cursor: pointer; transition: all 0.3s;
                    ">🏠 Host a Game</button>
                    
                    <button id="joinGameBtn" style="
                        background: linear-gradient(135deg, #2196F3, #1976D2);
                        border: none; color: white; padding: 20px 30px;
                        border-radius: 15px; font-size: 20px; font-weight: bold;
                        cursor: pointer; transition: all 0.3s;
                    ">🔗 Join a Game</button>
                    
                    <button id="backToMenuBtn" style="
                        background: linear-gradient(135deg, #757575, #424242);
                        border: none; color: white; padding: 15px 25px;
                        border-radius: 10px; font-size: 16px; font-weight: bold;
                        cursor: pointer; transition: all 0.3s;
                        margin-top: 20px;
                    ">⬅️ Back</button>
                </div>
                
                <div id="connectionStatus" style="
                    margin-top: 20px;
                    font-size: 14px;
                    color: #B2DFDB;
                "></div>
            </div>
        `;
        
        document.body.appendChild(menuOverlay);
        
        // Host game dialog
        this.createHostGameDialog();
        
        // Join game dialog
        this.createJoinGameDialog();
    }
    
    createHostGameDialog() {
        const dialog = document.createElement('div');
        dialog.id = 'hostGameDialog';
        dialog.style.cssText = `
            position: fixed;
            top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0, 0, 0, 0.9);
            display: none;
            justify-content: center;
            align-items: center;
            z-index: 2001;
            font-family: 'Comic Sans MS', cursive;
        `;
        
        dialog.innerHTML = `
            <div style="
                background: linear-gradient(135deg, #4CAF50, #388E3C);
                border: 4px solid #fff;
                border-radius: 20px;
                padding: 40px;
                color: white;
                text-align: center;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
                max-width: 600px;
                width: 90%;
            ">
                <h2 style="margin: 0 0 25px 0; font-size: 32px;">🏠 Host a Game</h2>
                
                <div id="levelSelection" style="margin-bottom: 30px;">
                    <h3 style="margin: 0 0 15px 0; font-size: 20px;">Select a Level:</h3>
                    <div id="levelGrid" style="
                        display: grid;
                        grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
                        gap: 15px;
                        margin-bottom: 20px;
                    "></div>
                </div>
                
                <div style="display: flex; gap: 15px; justify-content: center;">
                    <button id="startHostingBtn" style="
                        background: linear-gradient(135deg, #FF9800, #F57C00);
                        border: none; color: white; padding: 15px 25px;
                        border-radius: 10px; font-size: 16px; font-weight: bold;
                        cursor: pointer; opacity: 0.5;
                    " disabled>🚀 Start Hosting</button>
                    
                    <button id="cancelHostBtn" style="
                        background: linear-gradient(135deg, #757575, #424242);
                        border: none; color: white; padding: 15px 25px;
                        border-radius: 10px; font-size: 16px; font-weight: bold;
                        cursor: pointer;
                    ">❌ Cancel</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(dialog);
    }
    
    createJoinGameDialog() {
        const dialog = document.createElement('div');
        dialog.id = 'joinGameDialog';
        dialog.style.cssText = `
            position: fixed;
            top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0, 0, 0, 0.9);
            display: none;
            justify-content: center;
            align-items: center;
            z-index: 2001;
            font-family: 'Comic Sans MS', cursive;
        `;
        
        dialog.innerHTML = `
            <div style="
                background: linear-gradient(135deg, #2196F3, #1565C0);
                border: 4px solid #fff;
                border-radius: 20px;
                padding: 40px;
                color: white;
                text-align: center;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
                max-width: 500px;
                width: 90%;
            ">
                <h2 style="margin: 0 0 25px 0; font-size: 32px;">🔗 Join a Game</h2>
                
                <p style="font-size: 18px; margin-bottom: 25px;">
                    Enter the 3-emoji room code:
                </p>
                
                <div id="emojiCodeInput" style="
                    display: flex;
                    gap: 15px;
                    justify-content: center;
                    margin-bottom: 30px;
                ">
                    <input type="text" id="emoji1" maxlength="2" style="
                        width: 80px; height: 80px;
                        font-size: 48px; text-align: center;
                        border: 3px solid #fff;
                        border-radius: 15px;
                        background: rgba(255,255,255,0.2);
                        color: white;
                    " placeholder="🔤">
                    <input type="text" id="emoji2" maxlength="2" style="
                        width: 80px; height: 80px;
                        font-size: 48px; text-align: center;
                        border: 3px solid #fff;
                        border-radius: 15px;
                        background: rgba(255,255,255,0.2);
                        color: white;
                    " placeholder="🔤">
                    <input type="text" id="emoji3" maxlength="2" style="
                        width: 80px; height: 80px;
                        font-size: 48px; text-align: center;
                        border: 3px solid #fff;
                        border-radius: 15px;
                        background: rgba(255,255,255,0.2);
                        color: white;
                    " placeholder="🔤">
                </div>
                
                <div style="display: flex; gap: 15px; justify-content: center;">
                    <button id="joinRoomBtn" style="
                        background: linear-gradient(135deg, #4CAF50, #45a049);
                        border: none; color: white; padding: 15px 25px;
                        border-radius: 10px; font-size: 16px; font-weight: bold;
                        cursor: pointer;
                    ">✅ Join Room</button>
                    
                    <button id="cancelJoinBtn" style="
                        background: linear-gradient(135deg, #757575, #424242);
                        border: none; color: white; padding: 15px 25px;
                        border-radius: 10px; font-size: 16px; font-weight: bold;
                        cursor: pointer;
                    ">❌ Cancel</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(dialog);
    }
    
    createRoomCodeDisplay() {
        // Room code display (shown when hosting)
        const display = document.createElement('div');
        display.id = 'roomCodeDisplay';
        display.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: linear-gradient(135deg, #4CAF50, #388E3C);
            border: 3px solid #fff;
            border-radius: 20px;
            padding: 15px 25px;
            color: white;
            font-family: 'Comic Sans MS', cursive;
            display: none;
            z-index: 1000;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
        `;
        
        display.innerHTML = `
            <div style="text-align: center;">
                <div style="font-size: 14px; margin-bottom: 10px; opacity: 0.9;">Room Code:</div>
                <div style="display: flex; align-items: center; gap: 15px; justify-content: center;">
                    <div id="roomCodeEmojis" style="font-size: 48px; letter-spacing: 10px;"></div>
                    <button id="copyRoomCodeBtn" style="
                        background: rgba(255, 255, 255, 0.2);
                        border: 2px solid rgba(255, 255, 255, 0.5);
                        border-radius: 10px;
                        padding: 10px 15px;
                        color: white;
                        font-size: 20px;
                        cursor: pointer;
                        transition: all 0.3s;
                    " title="Copy Room Code">📋</button>
                </div>
                <div id="roomCodeMessage" style="font-size: 12px; margin-top: 10px; opacity: 0.8;">Share this code with friends!</div>
            </div>
        `;
        
        document.body.appendChild(display);
    }
    
    createPlayerList() {
        // Player list display (shown during multiplayer)
        const list = document.createElement('div');
        list.id = 'multiplayerPlayerList';
        list.style.cssText = `
            position: fixed;
            right: 20px;
            top: 100px;
            background: rgba(0, 0, 0, 0.7);
            border: 2px solid rgba(255, 255, 255, 0.3);
            border-radius: 15px;
            padding: 15px;
            color: white;
            font-family: 'Comic Sans MS', cursive;
            display: none;
            z-index: 100;
            min-width: 200px;
        `;
        
        list.innerHTML = `
            <h3 style="margin: 0 0 10px 0; font-size: 16px; text-align: center;">
                👥 Players
            </h3>
            <div id="playerListContent">
                <!-- Players will be added here -->
            </div>
        `;
        
        document.body.appendChild(list);
    }
    
    bindEvents() {
        // Main menu buttons
        document.getElementById('hostGameBtn').addEventListener('click', () => this.showHostGameDialog());
        document.getElementById('joinGameBtn').addEventListener('click', () => this.showJoinGameDialog());
        document.getElementById('backToMenuBtn').addEventListener('click', () => this.hide());
        
        // Host dialog
        document.getElementById('startHostingBtn').addEventListener('click', () => this.startHosting());
        document.getElementById('cancelHostBtn').addEventListener('click', () => this.hideHostDialog());
        
        // Join dialog
        document.getElementById('joinRoomBtn').addEventListener('click', () => this.joinRoom());
        document.getElementById('cancelJoinBtn').addEventListener('click', () => this.hideJoinDialog());
        
        // Emoji inputs - auto-advance
        const emojiInputs = ['emoji1', 'emoji2', 'emoji3'];
        emojiInputs.forEach((id, index) => {
            const input = document.getElementById(id);
            input.addEventListener('input', (e) => {
                if (e.target.value.length >= 1 && index < emojiInputs.length - 1) {
                    document.getElementById(emojiInputs[index + 1]).focus();
                }
            });
        });
    }
    
    show() {
        document.getElementById('multiplayerMenuOverlay').style.display = 'flex';
        this.isVisible = true;
        
        // Connect to server
        this.connectToServer();
    }
    
    hide() {
        document.getElementById('multiplayerMenuOverlay').style.display = 'none';
        this.hideHostDialog();
        this.hideJoinDialog();
        this.isVisible = false;
    }
    
    showHostGameDialog() {
        // Check if connected first
        if (!this.multiplayerManager.connected) {
            alert('Please wait for server connection or start the multiplayer server first.');
            return;
        }
        
        // Populate level selection
        this.populateLevelSelection();
        
        document.getElementById('hostGameDialog').style.display = 'flex';
        this.selectedLevel = null;
    }
    
    hideHostDialog() {
        document.getElementById('hostGameDialog').style.display = 'none';
    }
    
    showJoinGameDialog() {
        // Check if connected first
        if (!this.multiplayerManager.connected) {
            alert('Please wait for server connection or start the multiplayer server first.');
            return;
        }
        
        document.getElementById('joinGameDialog').style.display = 'flex';
        
        // Clear inputs
        document.getElementById('emoji1').value = '';
        document.getElementById('emoji2').value = '';
        document.getElementById('emoji3').value = '';
        document.getElementById('emoji1').focus();
    }
    
    hideJoinDialog() {
        document.getElementById('joinGameDialog').style.display = 'none';
    }
    
    populateLevelSelection() {
        const levelGrid = document.getElementById('levelGrid');
        levelGrid.innerHTML = '';
        
        // Get available levels
        const levels = this.game.levelManager?.getAllLevels() || [];
        
        levels.forEach(level => {
            const levelCard = document.createElement('div');
            levelCard.style.cssText = `
                border: 3px solid rgba(255, 255, 255, 0.5);
                border-radius: 15px;
                padding: 15px;
                background: rgba(255, 255, 255, 0.1);
                cursor: pointer;
                transition: all 0.3s;
                text-align: center;
            `;
            
            levelCard.innerHTML = `
                <div style="font-size: 24px; margin-bottom: 5px;">${level.icon}</div>
                <div style="font-size: 14px; font-weight: bold;">${level.name}</div>
            `;
            
            levelCard.addEventListener('click', () => {
                // Deselect all
                levelGrid.querySelectorAll('div').forEach(card => {
                    card.style.border = '3px solid rgba(255, 255, 255, 0.5)';
                    card.style.background = 'rgba(255, 255, 255, 0.1)';
                });
                
                // Select this level
                levelCard.style.border = '3px solid #FFD700';
                levelCard.style.background = 'rgba(255, 215, 0, 0.2)';
                this.selectedLevel = level.id;
                
                // Enable start button
                const startBtn = document.getElementById('startHostingBtn');
                startBtn.disabled = false;
                startBtn.style.opacity = '1';
            });
            
            levelGrid.appendChild(levelCard);
        });
    }
    
    async connectToServer() {
        const statusDiv = document.getElementById('connectionStatus');
        statusDiv.innerHTML = 'Connecting to server...';
        
        try {
            await this.multiplayerManager.connect();
            statusDiv.innerHTML = '✅ Connected to server';
            statusDiv.style.color = '#4CAF50';
        } catch (error) {
            statusDiv.innerHTML = `
                <div style="color: #f44336;">❌ Server not running</div>
                <div style="font-size: 12px; margin-top: 10px; line-height: 1.5;">
                    To start multiplayer:<br>
                    1. Run <code style="background: rgba(255,255,255,0.2); padding: 2px 5px; border-radius: 3px;">start-multiplayer-server.bat</code><br>
                    2. Keep the server window open<br>
                    3. Try again
                </div>
            `;
            statusDiv.style.color = '#f44336';
            console.error('Connection error:', error);
            
            // Disable multiplayer buttons
            document.getElementById('hostGameBtn').style.opacity = '0.5';
            document.getElementById('joinGameBtn').style.opacity = '0.5';
        }
    }
    
    async startHosting() {
        if (!this.selectedLevel) return;
        
        // Show loading state
        const startBtn = document.getElementById('startHostingBtn');
        const originalText = startBtn.innerHTML;
        startBtn.innerHTML = '⏳ Starting server...';
        startBtn.disabled = true;
        
        try {
            // First, try to start the server
            const serverResult = await serverManager.startServer();
            
            if (!serverResult.success && !serverManager.isServerRunning) {
                // Server couldn't start automatically
                if (serverResult.instructions) {
                    this.showServerInstructions(serverResult.instructions);
                    return;
                } else {
                    throw new Error(serverResult.message);
                }
            }
            
            // Give server a moment to fully initialize
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Now connect and host game
            await this.multiplayerManager.connect();
            const result = await this.multiplayerManager.hostGame(this.selectedLevel);
            
            // Hide dialogs
            this.hideHostDialog();
            this.hide();
            
            // Show room code
            this.showRoomCode(result.roomCode);
            
            // Start the level
            this.game.levelManager.startLevel(this.selectedLevel, true); // true = multiplayer mode
            
        } catch (error) {
            alert('Failed to create room: ' + error.message);
            startBtn.innerHTML = originalText;
            startBtn.disabled = false;
        }
    }
    
    async joinRoom() {
        const emoji1 = document.getElementById('emoji1').value;
        const emoji2 = document.getElementById('emoji2').value;
        const emoji3 = document.getElementById('emoji3').value;
        
        if (!emoji1 || !emoji2 || !emoji3) {
            alert('Please enter all 3 emojis');
            return;
        }
        
        const roomCode = emoji1 + emoji2 + emoji3;
        const character = this.game.dataManager?.getCurrentCharacter();
        
        try {
            const result = await this.multiplayerManager.joinRoom(
                roomCode,
                character?.identity.name || 'Player',
                character?.customization.activeSkin || '😊'
            );
            
            // Hide dialogs
            this.hideJoinDialog();
            this.hide();
            
            // Show room code and player list
            this.showRoomCode(roomCode);
            this.showPlayerList();
            
            // Start the level
            this.game.levelManager.startLevel(result.levelId, true); // true = multiplayer mode
            
        } catch (error) {
            alert('Failed to join room: ' + error.message);
        }
    }
    
    showServerInstructions(instructions) {
        // Reset button state
        const startBtn = document.getElementById('startHostingBtn');
        startBtn.innerHTML = '🚀 Start Hosting';
        startBtn.disabled = false;
        
        // Create instruction overlay
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0, 0, 0, 0.9);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 2002;
            font-family: 'Comic Sans MS', cursive;
        `;
        
        overlay.innerHTML = `
            <div style="
                background: linear-gradient(135deg, #FF9800, #F57C00);
                border: 4px solid #fff;
                border-radius: 20px;
                padding: 40px;
                color: white;
                text-align: center;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
                max-width: 600px;
                width: 90%;
            ">
                <h2 style="margin: 0 0 25px 0; font-size: 32px;">🖥️ Manual Server Start Required</h2>
                
                <div style="text-align: left; background: rgba(0,0,0,0.2); padding: 20px; border-radius: 10px; margin-bottom: 25px;">
                    ${instructions.map((step, i) => `
                        <div style="margin-bottom: 10px; font-size: 16px;">
                            ${step}
                        </div>
                    `).join('')}
                </div>
                
                <p style="font-size: 14px; opacity: 0.9; margin-bottom: 20px;">
                    Once the server is running, click "Try Again" to host your game.
                </p>
                
                <div style="display: flex; gap: 15px; justify-content: center;">
                    <button onclick="location.reload()" style="
                        background: linear-gradient(135deg, #4CAF50, #45a049);
                        border: none; color: white; padding: 15px 25px;
                        border-radius: 10px; font-size: 16px; font-weight: bold;
                        cursor: pointer;
                    ">🔄 Try Again</button>
                    
                    <button onclick="this.parentElement.parentElement.parentElement.remove()" style="
                        background: linear-gradient(135deg, #757575, #424242);
                        border: none; color: white; padding: 15px 25px;
                        border-radius: 10px; font-size: 16px; font-weight: bold;
                        cursor: pointer;
                    ">❌ Close</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(overlay);
    }
    
    showRoomCode(roomCode) {
        const display = document.getElementById('roomCodeDisplay');
        const emojiDiv = document.getElementById('roomCodeEmojis');
        
        // Store room code for copy function
        this.currentRoomCode = roomCode;
        
        // Display the emojis with spaces
        const emojis = roomCode.match(/(\p{Emoji_Presentation}|\p{Emoji}\uFE0F)/gu);
        emojiDiv.textContent = emojis ? emojis.join(' ') : roomCode;
        
        display.style.display = 'block';
        this.showPlayerList();
        
        // Add copy button handler
        const copyBtn = document.getElementById('copyRoomCodeBtn');
        if (copyBtn) {
            copyBtn.onclick = () => this.copyRoomCode();
        }
    }
    
    hideRoomCode() {
        document.getElementById('roomCodeDisplay').style.display = 'none';
    }
    
    copyRoomCode() {
        if (!this.currentRoomCode) return;
        
        // Copy to clipboard
        navigator.clipboard.writeText(this.currentRoomCode).then(() => {
            // Show success message
            const messageDiv = document.getElementById('roomCodeMessage');
            const originalText = messageDiv.textContent;
            messageDiv.textContent = '✅ Room code copied!';
            messageDiv.style.color = '#4CAF50';
            
            // Reset after 2 seconds
            setTimeout(() => {
                messageDiv.textContent = originalText;
                messageDiv.style.color = '';
            }, 2000);
        }).catch(err => {
            console.error('Failed to copy:', err);
            // Fallback: select text
            const emojiDiv = document.getElementById('roomCodeEmojis');
            const range = document.createRange();
            range.selectNode(emojiDiv);
            window.getSelection().removeAllRanges();
            window.getSelection().addRange(range);
        });
    }
    
    showPlayerList() {
        document.getElementById('multiplayerPlayerList').style.display = 'block';
        this.updatePlayerList();
        
        // Start periodic updates
        if (this.playerListInterval) {
            clearInterval(this.playerListInterval);
        }
        
        this.playerListInterval = setInterval(() => {
            if (this.multiplayerManager.isMultiplayer()) {
                this.updatePlayerList();
            } else {
                clearInterval(this.playerListInterval);
            }
        }, 500); // Update every 500ms
    }
    
    hidePlayerList() {
        document.getElementById('multiplayerPlayerList').style.display = 'none';
        
        // Stop periodic updates
        if (this.playerListInterval) {
            clearInterval(this.playerListInterval);
            this.playerListInterval = null;
        }
    }
    
    updatePlayerList() {
        const content = document.getElementById('playerListContent');
        const players = this.multiplayerManager.getAllPlayers();
        
        // Sort players by score (highest first)
        const sortedPlayers = Array.from(players.values()).sort((a, b) => (b.score || 0) - (a.score || 0));
        
        content.innerHTML = '';
        
        sortedPlayers.forEach((player, index) => {
            const playerDiv = document.createElement('div');
            const isLeader = index === 0 && (player.score || 0) > 0;
            
            playerDiv.style.cssText = `
                display: flex;
                align-items: center;
                gap: 10px;
                padding: 10px;
                margin-bottom: 5px;
                background: ${player.isSelf ? 'rgba(76, 175, 80, 0.3)' : 'rgba(255, 255, 255, 0.1)'};
                border: 2px solid ${isLeader ? '#FFD700' : 'transparent'};
                border-radius: 10px;
                transition: all 0.3s;
            `;
            
            // Rank indicator
            let rankEmoji = '';
            if (index === 0) rankEmoji = '🥇';
            else if (index === 1) rankEmoji = '🥈';
            else if (index === 2) rankEmoji = '🥉';
            
            playerDiv.innerHTML = `
                <span style="font-size: 20px; width: 25px; text-align: center;">${rankEmoji}</span>
                <span style="font-size: 24px;">${player.emoji}</span>
                <div style="flex: 1;">
                    <div style="font-size: 14px; font-weight: bold;">
                        ${player.name}${player.isHost ? ' 👑' : ''}${player.isSelf ? ' (You)' : ''}
                    </div>
                    <div style="font-size: 16px; color: #FFD700; font-weight: bold;">
                        ${player.score || 0} pts
                    </div>
                </div>
                ${isLeader ? '<span style="font-size: 20px;">🏆</span>' : ''}
            `;
            
            content.appendChild(playerDiv);
        });
    }
    
    // Called when multiplayer game ends
    onMultiplayerGameEnd() {
        this.hideRoomCode();
        this.hidePlayerList();
    }
}