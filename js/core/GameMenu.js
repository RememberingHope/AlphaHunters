// Game Menu System for handling new games, saves, and navigation

class GameMenu {
    constructor(game) {
        this.game = game;
        this.isVisible = false;
        this.activeDialog = null;
        
        this.init();
    }
    
    init() {
        this.createMenuUI();
        this.bindEvents();
        // GameMenu ready
    }
    
    createMenuUI() {
        // Main menu overlay
        const menuOverlay = document.createElement('div');
        menuOverlay.id = 'gameMenuOverlay';
        menuOverlay.style.cssText = `
            position: fixed;
            top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0, 0, 0, 0.8);
            display: none;
            justify-content: center;
            align-items: center;
            z-index: 1000;
            font-family: 'Comic Sans MS', cursive;
        `;
        
        menuOverlay.innerHTML = `
            <div id="gameMenu" style="
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border: 4px solid #fff;
                border-radius: 20px;
                padding: 30px;
                color: white;
                text-align: center;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
                min-width: 400px;
            ">
                <h1 style="margin: 0 0 30px 0; font-size: 48px;">AlphaHunters</h1>
                
                <div id="menuButtons" style="display: flex; flex-direction: column; gap: 15px;">
                    <button id="newGameBtn" class="menu-btn" style="
                        background: linear-gradient(135deg, #4CAF50, #45a049);
                        border: none; color: white; padding: 15px 30px;
                        border-radius: 10px; font-size: 18px; font-weight: bold;
                        cursor: pointer; transition: transform 0.2s;
                    ">🎮 New Game</button>
                    
                    <button id="loadGameBtn" class="menu-btn" style="
                        background: linear-gradient(135deg, #2196F3, #1976D2);
                        border: none; color: white; padding: 15px 30px;
                        border-radius: 10px; font-size: 18px; font-weight: bold;
                        cursor: pointer; transition: transform 0.2s;
                    ">📁 Load Game</button>
                    
                    <button id="continueGameBtn" class="menu-btn" style="
                        background: linear-gradient(135deg, #FF9800, #F57C00);
                        border: none; color: white; padding: 15px 30px;
                        border-radius: 10px; font-size: 18px; font-weight: bold;
                        cursor: pointer; transition: transform 0.2s;
                    ">▶️ Continue</button>
                    
                    <button id="settingsBtn" class="menu-btn" style="
                        background: linear-gradient(135deg, #9C27B0, #7B1FA2);
                        border: none; color: white; padding: 15px 30px;
                        border-radius: 10px; font-size: 18px; font-weight: bold;
                        cursor: pointer; transition: transform 0.2s;
                    ">⚙️ Settings</button>
                    
                    <button id="closeMenuBtn" class="menu-btn" style="
                        background: linear-gradient(135deg, #757575, #424242);
                        border: none; color: white; padding: 10px 20px;
                        border-radius: 10px; font-size: 14px; font-weight: bold;
                        cursor: pointer; transition: transform 0.2s;
                        margin-top: 20px;
                    ">❌ Close</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(menuOverlay);
        
        // Add hover effects
        const style = document.createElement('style');
        style.textContent = `
            .menu-btn:hover {
                transform: scale(1.05);
                filter: brightness(1.1);
            }
        `;
        document.head.appendChild(style);
        
        // Player name dialog
        this.createPlayerNameDialog();
        
        // Load game dialog
        this.createLoadGameDialog();
        
        // Manage saves dialog
        this.createManageSavesDialog();
    }
    
    createPlayerNameDialog() {
        const dialog = document.createElement('div');
        dialog.id = 'playerNameDialog';
        dialog.style.cssText = `
            position: fixed;
            top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0, 0, 0, 0.9);
            display: none;
            justify-content: center;
            align-items: center;
            z-index: 1001;
            font-family: 'Comic Sans MS', cursive;
        `;
        
        dialog.innerHTML = `
            <div style="
                background: linear-gradient(135deg, #FF6B6B, #4ECDC4);
                border: 4px solid #fff;
                border-radius: 20px;
                padding: 40px;
                color: white;
                text-align: center;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
                max-width: 500px;
            ">
                <h2 style="margin: 0 0 20px 0; font-size: 36px;">🌟 Welcome to AlphaHunters!</h2>
                <p style="font-size: 18px; margin-bottom: 30px;">What's your name, brave letter hunter?</p>
                
                <input type="text" id="playerNameInput" placeholder="Enter your name..." style="
                    width: 100%; max-width: 300px; padding: 15px;
                    border: none; border-radius: 10px;
                    font-size: 18px; text-align: center;
                    margin-bottom: 30px; box-sizing: border-box;
                " maxlength="20">
                
                <div style="display: flex; gap: 15px; justify-content: center;">
                    <button id="startGameBtn" style="
                        background: linear-gradient(135deg, #4CAF50, #45a049);
                        border: none; color: white; padding: 15px 25px;
                        border-radius: 10px; font-size: 16px; font-weight: bold;
                        cursor: pointer;
                    ">🚀 Start Adventure!</button>
                    
                    <button id="cancelNameBtn" style="
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
    
    createLoadGameDialog() {
        const dialog = document.createElement('div');
        dialog.id = 'loadGameDialog';
        dialog.style.cssText = `
            position: fixed;
            top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0, 0, 0, 0.9);
            display: none;
            justify-content: center;
            align-items: center;
            z-index: 1001;
            font-family: 'Comic Sans MS', cursive;
        `;
        
        dialog.innerHTML = `
            <div style="
                background: linear-gradient(135deg, #2196F3, #1976D2);
                border: 4px solid #fff;
                border-radius: 20px;
                padding: 30px;
                color: white;
                text-align: center;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
                max-width: 600px;
                width: 90%;
            ">
                <h2 style="margin: 0 0 20px 0; font-size: 36px;">📁 Load Game</h2>
                
                <div id="savesList" style="
                    max-height: 400px; overflow-y: auto;
                    margin: 20px 0; text-align: left;
                ">
                    <!-- Saves will be populated here -->
                </div>
                
                <div style="display: flex; gap: 15px; justify-content: center; margin-top: 20px;">
                    <button id="manageSavesBtn" style="
                        background: linear-gradient(135deg, #9C27B0, #7B1FA2);
                        border: none; color: white; padding: 12px 20px;
                        border-radius: 10px; font-size: 14px; font-weight: bold;
                        cursor: pointer;
                    ">🗂️ Manage Saves</button>
                    
                    <button id="cancelLoadBtn" style="
                        background: linear-gradient(135deg, #757575, #424242);
                        border: none; color: white; padding: 12px 20px;
                        border-radius: 10px; font-size: 14px; font-weight: bold;
                        cursor: pointer;
                    ">❌ Cancel</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(dialog);
    }
    
    createManageSavesDialog() {
        const dialog = document.createElement('div');
        dialog.id = 'manageSavesDialog';
        dialog.style.cssText = `
            position: fixed;
            top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0, 0, 0, 0.9);
            display: none;
            justify-content: center;
            align-items: center;
            z-index: 1002;
            font-family: 'Comic Sans MS', cursive;
        `;
        
        dialog.innerHTML = `
            <div style="
                background: linear-gradient(135deg, #9C27B0, #7B1FA2);
                border: 4px solid #fff;
                border-radius: 20px;
                padding: 30px;
                color: white;
                text-align: center;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
                max-width: 600px;
                width: 90%;
            ">
                <h2 style="margin: 0 0 20px 0; font-size: 36px;">🗂️ Manage Saves</h2>
                
                <div id="manageSavesList" style="
                    max-height: 400px; overflow-y: auto;
                    margin: 20px 0; text-align: left;
                ">
                    <!-- Saves will be populated here -->
                </div>
                
                <button id="closeMamageSavesBtn" style="
                    background: linear-gradient(135deg, #757575, #424242);
                    border: none; color: white; padding: 12px 20px;
                    border-radius: 10px; font-size: 14px; font-weight: bold;
                    cursor: pointer;
                ">❌ Close</button>
            </div>
        `;
        
        document.body.appendChild(dialog);
    }
    
    bindEvents() {
        // Main menu buttons
        document.getElementById('newGameBtn').addEventListener('click', () => this.showNewGameDialog());
        document.getElementById('loadGameBtn').addEventListener('click', () => this.showLoadGameDialog());
        document.getElementById('continueGameBtn').addEventListener('click', () => this.continueGame());
        document.getElementById('settingsBtn').addEventListener('click', () => this.showSettings());
        document.getElementById('closeMenuBtn').addEventListener('click', () => this.hide());
        
        // Player name dialog
        document.getElementById('startGameBtn').addEventListener('click', () => this.startNewGame());
        document.getElementById('cancelNameBtn').addEventListener('click', () => this.hidePlayerNameDialog());
        document.getElementById('playerNameInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.startNewGame();
        });
        
        // Load game dialog
        document.getElementById('manageSavesBtn').addEventListener('click', () => this.showManageSavesDialog());
        document.getElementById('cancelLoadBtn').addEventListener('click', () => this.hideLoadGameDialog());
        
        // Manage saves dialog
        document.getElementById('closeMamageSavesBtn').addEventListener('click', () => this.hideManageSavesDialog());
        
        // Close dialogs when clicking outside
        document.getElementById('gameMenuOverlay').addEventListener('click', (e) => {
            if (e.target.id === 'gameMenuOverlay') this.hide();
        });
    }
    
    show() {
        document.getElementById('gameMenuOverlay').style.display = 'flex';
        this.isVisible = true;
        
        // Update continue button based on current save
        const continueBtn = document.getElementById('continueGameBtn');
        const currentCharacter = this.game.dataManager?.getCurrentCharacter();
        if (currentCharacter) {
            continueBtn.innerHTML = `▶️ Continue (${currentCharacter.identity.name})`;
            continueBtn.style.display = 'block';
        } else {
            continueBtn.style.display = 'none';
        }
    }
    
    hide() {
        document.getElementById('gameMenuOverlay').style.display = 'none';
        this.hideAllDialogs();
        this.isVisible = false;
    }
    
    hideAllDialogs() {
        document.getElementById('playerNameDialog').style.display = 'none';
        document.getElementById('loadGameDialog').style.display = 'none';
        document.getElementById('manageSavesDialog').style.display = 'none';
        this.activeDialog = null;
    }
    
    showNewGameDialog() {
        this.hideAllDialogs();
        document.getElementById('playerNameDialog').style.display = 'flex';
        this.activeDialog = 'playerName';
        
        // Focus the input and clear it
        const input = document.getElementById('playerNameInput');
        input.value = '';
        setTimeout(() => input.focus(), 100);
    }
    
    hidePlayerNameDialog() {
        document.getElementById('playerNameDialog').style.display = 'none';
        this.activeDialog = null;
    }
    
    startNewGame() {
        const playerName = document.getElementById('playerNameInput').value.trim();
        
        if (!playerName) {
            alert('Please enter your name!');
            return;
        }
        
        // Create new character with player name
        const success = this.game.dataManager?.createNewCharacter(playerName);
        
        if (success) {
            console.log(`Started new game for player: ${playerName}`);
            this.hide();
            
            // Initialize game with new save
            if (this.game.onNewGameCreated) {
                this.game.onNewGameCreated();
            }
        } else {
            alert('Failed to create new game. Please try again.');
        }
    }
    
    showLoadGameDialog() {
        this.hideAllDialogs();
        this.populateSavesList();
        document.getElementById('loadGameDialog').style.display = 'flex';
        this.activeDialog = 'loadGame';
    }
    
    hideLoadGameDialog() {
        document.getElementById('loadGameDialog').style.display = 'none';
        this.activeDialog = null;
    }
    
    populateSavesList() {
        const savesList = document.getElementById('savesList');
        const characters = this.game.dataManager?.getAllCharacters() || [];
        
        if (characters.length === 0) {
            savesList.innerHTML = '<p style="text-align: center; color: #ccc;">No saved games found.</p>';
            return;
        }
        
        savesList.innerHTML = '';
        
        // Sort characters by last played (newest first)
        const sortedCharacters = characters.sort((a, b) => (b.progression.lastPlayed || 0) - (a.progression.lastPlayed || 0));
        
        sortedCharacters.forEach((character) => {
            const saveItem = document.createElement('div');
            saveItem.style.cssText = `
                background: rgba(255, 255, 255, 0.1);
                border: 2px solid rgba(255, 255, 255, 0.2);
                border-radius: 10px;
                padding: 15px;
                margin: 10px 0;
                cursor: pointer;
                transition: background 0.2s;
            `;
            
            const date = new Date(character.progression.lastPlayed || character.identity.createdDate).toLocaleDateString();
            const playTimeHours = Math.floor((character.statistics.totalPlayTime || 0) / 3600000);
            const playTimeMinutes = Math.floor(((character.statistics.totalPlayTime || 0) % 3600000) / 60000);
            
            saveItem.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <h4 style="margin: 0; font-size: 18px;">${character.identity.name}</h4>
                        <p style="margin: 5px 0; font-size: 14px; color: #ccc;">
                            Level ${character.progression.level} • ${character.progression.xp} XP • ${date}
                        </p>
                        <p style="margin: 0; font-size: 12px; color: #bbb;">
                            Play time: ${playTimeHours}h ${playTimeMinutes}m
                        </p>
                    </div>
                    <div style="font-size: 24px;">🎮</div>
                </div>
            `;
            
            saveItem.addEventListener('mouseenter', () => {
                saveItem.style.background = 'rgba(255, 255, 255, 0.2)';
            });
            
            saveItem.addEventListener('mouseleave', () => {
                saveItem.style.background = 'rgba(255, 255, 255, 0.1)';
            });
            
            saveItem.addEventListener('click', () => {
                this.loadGame(character.identity.id);
            });
            
            savesList.appendChild(saveItem);
        });
    }
    
    loadGame(characterId) {
        const success = this.game.dataManager?.switchCharacter(characterId);
        
        if (success) {
            console.log(`Loaded game: ${saveName}`);
            this.hide();
            
            // Reload game with loaded save
            if (this.game.onGameLoaded) {
                this.game.onGameLoaded();
            }
        } else {
            alert(`Failed to load game: ${saveName}`);
        }
    }
    
    continueGame() {
        this.hide();
        // Game continues with current save
    }
    
    showSettings() {
        // This will integrate with existing settings system
        this.hide();
        // TODO: Show settings panel
        console.log('Settings panel not yet implemented');
    }
    
    showManageSavesDialog() {
        this.hideAllDialogs();
        this.populateManageSavesList();
        document.getElementById('manageSavesDialog').style.display = 'flex';
        this.activeDialog = 'manageSaves';
    }
    
    hideManageSavesDialog() {
        document.getElementById('manageSavesDialog').style.display = 'none';
        this.activeDialog = null;
    }
    
    populateManageSavesList() {
        const savesList = document.getElementById('manageSavesList');
        const characters = this.game.dataManager?.getAllCharacters() || [];
        
        if (characters.length === 0) {
            savesList.innerHTML = '<p style="text-align: center; color: #ccc;">No saved games found.</p>';
            return;
        }
        
        savesList.innerHTML = '';
        
        // Sort characters by last played (newest first)
        const sortedCharacters = characters.sort((a, b) => (b.progression.lastPlayed || 0) - (a.progression.lastPlayed || 0));
        
        sortedCharacters.forEach((character) => {
            const saveItem = document.createElement('div');
            saveItem.style.cssText = `
                background: rgba(255, 255, 255, 0.1);
                border: 2px solid rgba(255, 255, 255, 0.2);
                border-radius: 10px;
                padding: 15px;
                margin: 10px 0;
            `;
            
            const date = new Date(character.progression.lastPlayed || character.identity.createdDate).toLocaleDateString();
            
            saveItem.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <h4 style="margin: 0; font-size: 18px;">${character.identity.name}</h4>
                        <p style="margin: 5px 0; font-size: 14px; color: #ccc;">
                            Level ${character.progression.level} • ${character.progression.xp} XP • ${date}
                        </p>
                    </div>
                    <button onclick="game.gameMenu.deleteCharacter('${character.identity.id}')" style="
                        background: linear-gradient(135deg, #f44336, #d32f2f);
                        border: none; color: white; padding: 8px 12px;
                        border-radius: 5px; font-size: 12px; font-weight: bold;
                        cursor: pointer;
                    ">🗑️ Delete</button>
                </div>
            `;
            
            savesList.appendChild(saveItem);
        });
    }
    
    deleteCharacter(characterId) {
        const character = this.game.dataManager?.getAllCharacters().find(c => c.identity.id === characterId);
        const characterName = character?.identity.name || 'this character';
        if (confirm(`Are you sure you want to delete ${characterName}? This cannot be undone.`)) {
            const success = this.game.dataManager?.deleteCharacter(characterId);
            
            if (success) {
                console.log(`Deleted character: ${characterName}`);
                this.populateManageSavesList(); // Refresh the list
            } else {
                alert(`Failed to delete character: ${characterName}`);
            }
        }
    }
}