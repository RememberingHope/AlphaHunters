// Simple Multiplayer UI - Designed for 4-7 year olds

class SimpleMultiplayerUI {
    constructor(game) {
        this.game = game;
        this.multiplayerManager = null; // Will be set to ZeroSetupMultiplayer
        this.isVisible = false;
        
        this.init();
    }
    
    init() {
        this.createMultiplayerButton();
        this.createMultiplayerMenu();
        this.createRoomCodeDisplay();
        this.createPlayerList();
        this.bindEvents();
    }
    
    createMultiplayerButton() {
        // Big friendly button on main menu
        const button = document.createElement('button');
        button.id = 'multiplayerMainBtn';
        button.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: linear-gradient(135deg, #9C27B0, #7B1FA2);
            border: 4px solid #fff;
            border-radius: 25px;
            padding: 20px 30px;
            color: white;
            font-family: 'Comic Sans MS', cursive;
            font-size: 24px;
            font-weight: bold;
            cursor: pointer;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
            transition: all 0.3s;
            z-index: 1000;
            display: none; /* Hidden by default since we're using combined panel */
        `;
        
        button.innerHTML = '👫 Play Together!';
        
        button.addEventListener('click', () => this.show());
        button.addEventListener('mouseenter', () => {
            button.style.transform = 'scale(1.1)';
        });
        button.addEventListener('mouseleave', () => {
            button.style.transform = 'scale(1)';
        });
        
        document.body.appendChild(button);
    }
    
    createMultiplayerMenu() {
        // Super simple menu
        const menuOverlay = document.createElement('div');
        menuOverlay.id = 'simpleMultiplayerMenu';
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
            <div style="
                background: linear-gradient(135deg, #00BCD4, #00838F);
                border: 6px solid #fff;
                border-radius: 30px;
                padding: 50px;
                color: white;
                text-align: center;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
                max-width: 600px;
                width: 90%;
            ">
                <h1 style="margin: 0 0 40px 0; font-size: 48px;">
                    🎮 Play Together! 🎮
                </h1>
                
                <div id="menuOptions" style="display: flex; flex-direction: column; gap: 25px;">
                    <button id="createRoomBtn" style="
                        background: linear-gradient(135deg, #4CAF50, #45a049);
                        border: 4px solid #fff;
                        color: white;
                        padding: 30px 40px;
                        border-radius: 20px;
                        font-size: 32px;
                        font-weight: bold;
                        cursor: pointer;
                        transition: all 0.3s;
                        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
                    ">
                        🏠 Create Room
                    </button>
                    
                    <button id="joinRoomBtn" style="
                        background: linear-gradient(135deg, #FF9800, #F57C00);
                        border: 4px solid #fff;
                        color: white;
                        padding: 30px 40px;
                        border-radius: 20px;
                        font-size: 32px;
                        font-weight: bold;
                        cursor: pointer;
                        transition: all 0.3s;
                        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
                    ">
                        🔗 Join Room
                    </button>
                    
                    <button id="backBtn" style="
                        background: linear-gradient(135deg, #9E9E9E, #616161);
                        border: 3px solid #fff;
                        color: white;
                        padding: 20px 30px;
                        border-radius: 15px;
                        font-size: 24px;
                        font-weight: bold;
                        cursor: pointer;
                        transition: all 0.3s;
                        margin-top: 20px;
                    ">
                        ⬅️ Back
                    </button>
                </div>
                
                <div id="roomCodeEntry" style="display: none;">
                    <h2 style="margin: 0 0 30px 0; font-size: 36px;">
                        Enter Room Code:
                    </h2>
                    
                    <div style="display: flex; gap: 20px; justify-content: center; margin-bottom: 40px;">
                        <input type="text" id="digit1" maxlength="1" style="
                            width: 80px; height: 80px;
                            font-size: 48px;
                            text-align: center;
                            border: 4px solid #fff;
                            border-radius: 15px;
                            background: rgba(255,255,255,0.9);
                            color: #333;
                            font-weight: bold;
                        " placeholder="0">
                        <input type="text" id="digit2" maxlength="1" style="
                            width: 80px; height: 80px;
                            font-size: 48px;
                            text-align: center;
                            border: 4px solid #fff;
                            border-radius: 15px;
                            background: rgba(255,255,255,0.9);
                            color: #333;
                            font-weight: bold;
                        " placeholder="0">
                        <input type="text" id="digit3" maxlength="1" style="
                            width: 80px; height: 80px;
                            font-size: 48px;
                            text-align: center;
                            border: 4px solid #fff;
                            border-radius: 15px;
                            background: rgba(255,255,255,0.9);
                            color: #333;
                            font-weight: bold;
                        " placeholder="0">
                        <input type="text" id="digit4" maxlength="1" style="
                            width: 80px; height: 80px;
                            font-size: 48px;
                            text-align: center;
                            border: 4px solid #fff;
                            border-radius: 15px;
                            background: rgba(255,255,255,0.9);
                            color: #333;
                            font-weight: bold;
                        " placeholder="0">
                    </div>
                    
                    <div style="display: flex; gap: 20px; justify-content: center;">
                        <button id="goJoinBtn" style="
                            background: linear-gradient(135deg, #4CAF50, #45a049);
                            border: 4px solid #fff;
                            color: white;
                            padding: 25px 35px;
                            border-radius: 15px;
                            font-size: 28px;
                            font-weight: bold;
                            cursor: pointer;
                        ">
                            ✅ Join!
                        </button>
                        
                        <button id="cancelJoinBtn" style="
                            background: linear-gradient(135deg, #f44336, #d32f2f);
                            border: 4px solid #fff;
                            color: white;
                            padding: 25px 35px;
                            border-radius: 15px;
                            font-size: 28px;
                            font-weight: bold;
                            cursor: pointer;
                        ">
                            ❌ Cancel
                        </button>
                    </div>
                </div>
                
                <div id="statusMessage" style="
                    margin-top: 30px;
                    font-size: 20px;
                    min-height: 30px;
                "></div>
            </div>
        `;
        
        document.body.appendChild(menuOverlay);
    }
    
    createRoomCodeDisplay() {
        // Big, friendly room code display
        const display = document.createElement('div');
        display.id = 'roomCodeBig';
        display.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(135deg, #4CAF50, #388E3C);
            border: 6px solid #fff;
            border-radius: 30px;
            padding: 40px 60px;
            color: white;
            font-family: 'Comic Sans MS', cursive;
            display: none;
            z-index: 2001;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
            text-align: center;
        `;
        
        display.innerHTML = `
            <h2 style="margin: 0 0 20px 0; font-size: 36px;">Room Code:</h2>
            <div id="bigRoomCode" style="
                font-size: 120px;
                font-weight: bold;
                letter-spacing: 20px;
                margin: 20px 0;
                text-shadow: 3px 3px 6px rgba(0, 0, 0, 0.3);
            "></div>
            <p style="font-size: 24px; margin: 20px 0;">Tell your friends this number!</p>
            <button id="startGameBtn" style="
                background: linear-gradient(135deg, #FF9800, #F57C00);
                border: 4px solid #fff;
                color: white;
                padding: 25px 40px;
                border-radius: 20px;
                font-size: 32px;
                font-weight: bold;
                cursor: pointer;
                margin-top: 20px;
                display: none;
            ">
                🚀 Start Game!
            </button>
            <div id="waitingForPlayers" style="
                font-size: 24px;
                margin-top: 30px;
            ">
                Waiting for friends to join...
            </div>
        `;
        
        document.body.appendChild(display);
    }
    
    createPlayerList() {
        // Fun player list
        const list = document.createElement('div');
        list.id = 'funPlayerList';
        list.style.cssText = `
            position: fixed;
            right: 20px;
            top: 80px;
            background: linear-gradient(135deg, #673AB7, #512DA8);
            border: 4px solid #fff;
            border-radius: 20px;
            padding: 20px;
            color: white;
            font-family: 'Comic Sans MS', cursive;
            display: none;
            z-index: 100;
            min-width: 250px;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
        `;
        
        list.innerHTML = `
            <h3 style="
                margin: 0 0 15px 0;
                font-size: 24px;
                text-align: center;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 10px;
            ">
                <span>👫</span>
                <span>Friends</span>
                <span>👫</span>
            </h3>
            <div id="playerCards">
                <!-- Players will be added here -->
            </div>
        `;
        
        document.body.appendChild(list);
    }
    
    bindEvents() {
        // Menu buttons
        document.getElementById('createRoomBtn').addEventListener('click', () => this.createRoom());
        document.getElementById('joinRoomBtn').addEventListener('click', () => this.showJoinUI());
        document.getElementById('backBtn').addEventListener('click', () => this.hide());
        
        // Join room
        document.getElementById('goJoinBtn').addEventListener('click', () => this.joinRoom());
        document.getElementById('cancelJoinBtn').addEventListener('click', () => this.showMainMenu());
        
        // Start game button
        document.getElementById('startGameBtn').addEventListener('click', () => this.startGame());
        
        // Auto-advance digit inputs
        const digitInputs = ['digit1', 'digit2', 'digit3', 'digit4'];
        digitInputs.forEach((id, index) => {
            const input = document.getElementById(id);
            
            // Only allow numbers
            input.addEventListener('input', (e) => {
                e.target.value = e.target.value.replace(/[^0-9]/g, '');
                
                if (e.target.value.length === 1 && index < digitInputs.length - 1) {
                    document.getElementById(digitInputs[index + 1]).focus();
                }
            });
            
            // Handle backspace
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Backspace' && e.target.value === '' && index > 0) {
                    document.getElementById(digitInputs[index - 1]).focus();
                }
            });
        });
    }
    
    show() {
        // Initialize multiplayer manager
        if (!this.multiplayerManager) {
            this.multiplayerManager = new ZeroSetupMultiplayer(this.game);
            
            // Set up callbacks
            this.multiplayerManager.onRoomCreated = (data) => this.onRoomCreated(data);
            this.multiplayerManager.onRoomJoined = (data) => this.onRoomJoined(data);
            this.multiplayerManager.onPlayerJoined = (player) => this.onPlayerJoined(player);
            this.multiplayerManager.onPlayerLeft = (player) => this.onPlayerLeft(player);
            this.multiplayerManager.onError = (error) => this.onError(error);
            
            // Update game's multiplayer manager reference
            this.game.multiplayerManager = this.multiplayerManager;
        }
        
        document.getElementById('simpleMultiplayerMenu').style.display = 'flex';
        this.showMainMenu();
        this.isVisible = true;
    }
    
    hide() {
        console.log('Hiding multiplayer UI...');
        document.getElementById('simpleMultiplayerMenu').style.display = 'none';
        document.getElementById('roomCodeBig').style.display = 'none';
        this.isVisible = false;
        
        // Also ensure the join dialog is hidden
        document.getElementById('roomCodeEntry').style.display = 'none';
        document.getElementById('menuOptions').style.display = 'flex';
    }
    
    showMainMenu() {
        document.getElementById('menuOptions').style.display = 'flex';
        document.getElementById('roomCodeEntry').style.display = 'none';
        document.getElementById('statusMessage').textContent = '';
    }
    
    showJoinUI() {
        document.getElementById('menuOptions').style.display = 'none';
        document.getElementById('roomCodeEntry').style.display = 'block';
        
        // Clear inputs
        ['digit1', 'digit2', 'digit3', 'digit4'].forEach(id => {
            document.getElementById(id).value = '';
        });
        document.getElementById('digit1').focus();
    }
    
    async createRoom() {
        this.showStatus('Creating room...');
        
        try {
            // Use first level by default
            const levels = this.game.levelManager?.getAllLevels() || [];
            const firstLevel = levels[0]?.id || 'intro';
            
            const result = await this.multiplayerManager.hostGame(firstLevel);
            
            // Success - room created!
            this.hide();
            this.showBigRoomCode(result.roomCode);
            
        } catch (error) {
            this.showStatus('Could not create room. Please try again!', true);
            console.error('Create room error:', error);
        }
    }
    
    async joinRoom() {
        // Get room code from inputs
        const code = ['digit1', 'digit2', 'digit3', 'digit4']
            .map(id => document.getElementById(id).value)
            .join('');
        
        if (code.length !== 4) {
            this.showStatus('Please enter all 4 numbers!', true);
            return;
        }
        
        this.showStatus('Joining room...');
        
        const character = this.game.dataManager?.getCurrentCharacter();
        
        try {
            const result = await this.multiplayerManager.joinRoom(
                code,
                character?.identity.name || 'Player',
                character?.customization.activeSkin || '😊'
            );
            
            // Success - joined room!
            console.log('Join successful! Result:', result);
            
            // Force hide all UI elements
            this.hide();
            this.showPlayerList();
            
            // Ensure we're in the right game state
            if (this.game.state !== 'playing') {
                this.game.state = 'playing';
            }
            
            // Make sure HUD is visible
            const hudOverlay = document.getElementById('hudOverlay');
            if (hudOverlay) {
                hudOverlay.classList.remove('hidden');
            }
            
            // Start the level with a small delay to ensure everything is ready
            setTimeout(() => {
                console.log('Starting level:', result.levelId);
                if (this.game.levelManager) {
                    this.game.levelManager.startLevel(result.levelId || 'intro', true);
                } else {
                    console.error('No levelManager found!');
                    // Fallback: just start playing
                    this.game.startGameplay();
                }
            }, 100);
            
        } catch (error) {
            this.showStatus('Could not find room. Check the code!', true);
            console.error('Join room error:', error);
        }
    }
    
    showBigRoomCode(roomCode) {
        const display = document.getElementById('roomCodeBig');
        const codeDiv = document.getElementById('bigRoomCode');
        
        codeDiv.textContent = roomCode;
        display.style.display = 'block';
        
        // Show start button for host after first player joins
        this.waitingForFirstPlayer = true;
    }
    
    startGame() {
        console.log('Host starting game...');
        
        // Hide room code display
        document.getElementById('roomCodeBig').style.display = 'none';
        
        // Show player list
        this.showPlayerList();
        
        // Ensure we're in the right game state
        if (this.game.state !== 'playing') {
            this.game.state = 'playing';
        }
        
        // Make sure HUD is visible
        const hudOverlay = document.getElementById('hudOverlay');
        if (hudOverlay) {
            hudOverlay.classList.remove('hidden');
        }
        
        // Start the level
        const levels = this.game.levelManager?.getAllLevels() || [];
        const firstLevel = levels[0]?.id || 'intro';
        
        console.log('Starting level:', firstLevel);
        if (this.game.levelManager) {
            this.game.levelManager.startLevel(firstLevel, true);
        } else {
            // Fallback
            this.game.startGameplay();
        }
    }
    
    showPlayerList() {
        document.getElementById('funPlayerList').style.display = 'block';
        this.updatePlayerList();
        
        // Start periodic updates
        if (this.playerListInterval) {
            clearInterval(this.playerListInterval);
        }
        
        this.playerListInterval = setInterval(() => {
            if (this.multiplayerManager?.isMultiplayer()) {
                this.updatePlayerList();
            } else {
                clearInterval(this.playerListInterval);
            }
        }, 500);
    }
    
    hidePlayerList() {
        document.getElementById('funPlayerList').style.display = 'none';
        
        if (this.playerListInterval) {
            clearInterval(this.playerListInterval);
            this.playerListInterval = null;
        }
    }
    
    updatePlayerList() {
        const container = document.getElementById('playerCards');
        const players = this.multiplayerManager?.getAllPlayers() || new Map();
        
        // Sort by score
        const sortedPlayers = Array.from(players.values()).sort((a, b) => (b.score || 0) - (a.score || 0));
        
        container.innerHTML = '';
        
        sortedPlayers.forEach((player, index) => {
            const card = document.createElement('div');
            card.style.cssText = `
                display: flex;
                align-items: center;
                gap: 15px;
                padding: 15px;
                margin-bottom: 10px;
                background: ${player.isSelf ? 'rgba(76, 175, 80, 0.4)' : 'rgba(255, 255, 255, 0.2)'};\n                border: 3px solid ${index === 0 && player.score > 0 ? '#FFD700' : 'rgba(255, 255, 255, 0.3)'};
                border-radius: 15px;
                transition: all 0.3s;
            `;
            
            // Medal for top 3
            let medal = '';
            if (index === 0 && player.score > 0) medal = '🥇';
            else if (index === 1 && player.score > 0) medal = '🥈';
            else if (index === 2 && player.score > 0) medal = '🥉';
            
            card.innerHTML = `
                <span style="font-size: 32px;">${player.emoji}</span>
                <div style="flex: 1;">
                    <div style="font-size: 18px; font-weight: bold;">
                        ${player.name}${player.isSelf ? ' (You)' : ''}
                    </div>
                    <div style="font-size: 20px; color: #FFD700;">
                        ${player.score || 0} ⭐
                    </div>
                </div>
                ${medal ? `<span style="font-size: 28px;">${medal}</span>` : ''}
            `;
            
            container.appendChild(card);
        });
    }
    
    showStatus(message, isError = false) {
        const statusDiv = document.getElementById('statusMessage');
        statusDiv.textContent = message;
        statusDiv.style.color = isError ? '#ffcdd2' : '#fff';
    }
    
    // Callbacks
    onRoomCreated(data) {
        console.log('Room created:', data);
    }
    
    onRoomJoined(data) {
        console.log('Joined room:', data);
    }
    
    onPlayerJoined(player) {
        console.log('Player joined:', player);
        
        // Show start button after first player joins
        if (this.multiplayerManager.isHost && this.waitingForFirstPlayer) {
            document.getElementById('startGameBtn').style.display = 'inline-block';
            document.getElementById('waitingForPlayers').textContent = `${player.name} joined! More can join with code.`;
            this.waitingForFirstPlayer = false;
        }
    }
    
    onPlayerLeft(player) {
        console.log('Player left:', player);
    }
    
    onError(error) {
        this.showStatus(error.message, true);
    }
    
    // Called when multiplayer game ends
    onMultiplayerGameEnd() {
        this.hidePlayerList();
        
        if (this.multiplayerManager) {
            this.multiplayerManager.disconnect();
        }
    }
}