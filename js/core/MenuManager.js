// Menu Manager - Central navigation controller for AlphaHunters

class MenuManager {
    constructor(game) {
        this.game = game;
        this.currentMenu = null;
        this.menuStack = []; // For back navigation
        
        // Menu state tracking
        this.isVisible = false;
        this.isTransitioning = false;
        
        this.init();
    }
    
    init() {
        this.createMenuContainer();
        // MenuManager ready
    }
    
    createMenuContainer() {
        // Create main menu container
        const container = document.createElement('div');
        container.id = 'menuContainer';
        container.style.cssText = `
            position: fixed;
            top: 0; left: 0; right: 0; bottom: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            display: none;
            justify-content: center;
            align-items: center;
            z-index: 2000;
            font-family: 'Comic Sans MS', cursive;
            color: white;
        `;
        
        document.body.appendChild(container);
    }
    
    showMenu(menuType, data = {}) {
        console.log(`📱 MenuManager: Showing ${menuType} menu`);
        
        if (this.currentMenu) {
            this.menuStack.push({type: this.currentMenu, data: this.currentMenuData});
        }
        
        this.currentMenu = menuType;
        this.currentMenuData = data;
        this.isVisible = true;
        
        // Track activity change
        this.trackMenuActivity(menuType);
        
        // Hide game canvas and HUD
        if (this.game.canvas) this.game.canvas.style.display = 'none';
        const hudOverlay = document.getElementById('hudOverlay');
        if (hudOverlay) hudOverlay.style.display = 'none';
        
        // Show menu container
        const container = document.getElementById('menuContainer');
        container.style.display = 'flex';
        
        // Load the specific menu
        this.loadMenu(menuType, data);
    }
    
    trackMenuActivity(menuType) {
        if (!this.game.timeTracker) return;
        
        // Map menu types to activity types
        const activityMap = {
            'start': 'menu',
            'characterMenu': 'characterMenu',
            'characterSelection': 'menu',
            'characterCreation': 'menu',
            'levelSelect': 'menu',
            'store': 'store',
            'petFarm': 'petFarm',
            'achievements': 'menu',
            'settings': 'settings',
            'challenges': 'challenge'
        };
        
        const activity = activityMap[menuType] || 'menu';
        this.game.timeTracker.startActivity(activity);
    }
    
    hideMenu() {
        console.log('📱 MenuManager: Hiding menu');
        
        // End current activity tracking only if we're not transitioning to a level
        // The level manager will handle its own time tracking
        if (this.game.timeTracker && this.currentMenu && this.game.state !== 'playing') {
            this.game.timeTracker.endCurrentActivity();
        }
        
        this.isVisible = false;
        this.currentMenu = null;
        
        // Show game canvas and HUD
        if (this.game.canvas) this.game.canvas.style.display = 'block';
        const hudOverlay = document.getElementById('hudOverlay');
        if (hudOverlay) hudOverlay.classList.remove('hidden');
        
        // Hide menu container
        const container = document.getElementById('menuContainer');
        container.style.display = 'none';
        container.innerHTML = '';
    }
    
    goBack() {
        if (this.menuStack.length > 0) {
            const previousMenu = this.menuStack.pop();
            this.currentMenu = previousMenu.type;
            this.currentMenuData = previousMenu.data;
            this.loadMenu(this.currentMenu, this.currentMenuData);
        } else {
            this.hideMenu();
        }
    }
    
    loadMenu(menuType, data = {}) {
        const container = document.getElementById('menuContainer');
        container.innerHTML = '';
        
        switch (menuType) {
            case 'start':
                this.createStartMenu(container);
                break;
            case 'characterCreation':
                this.createCharacterCreationMenu(container);
                break;
            case 'characterSelection':
                this.createCharacterSelectionMenu(container);
                break;
            case 'character':
            case 'characterMenu':
                this.createCharacterMenu(container, data);
                break;
            case 'levelSelect':
                this.createLevelSelectMenu(container, data);
                break;
            case 'store':
                this.createStoreMenu(container, data);
                break;
            case 'petFarm':
                this.createPetFarmMenu(container, data);
                break;
            case 'achievements':
                this.createAchievementsMenu(container, data);
                break;
            case 'settings':
                this.createSettingsMenu(container);
                break;
            case 'challenges':
                this.createChallengesMenu(container);
                break;
            default:
                console.warn(`Unknown menu type: ${menuType}`);
                this.createStartMenu(container);
        }
    }
    
    createStartMenu(container) {
        container.innerHTML = `
            <div style="text-align: center; max-width: 600px;">
                <h1 style="font-size: 72px; margin-bottom: 20px; text-shadow: 3px 3px 6px rgba(0,0,0,0.3);">
                    🎮 AlphaHunters
                </h1>
                <p style="font-size: 24px; margin-bottom: 40px; opacity: 0.9;">
                    Letter Tracing Adventure Game
                </p>
                
                <div style="display: flex; flex-direction: column; gap: 20px; align-items: center;">
                    <button id="newPlayerBtn" class="menu-btn" style="
                        background: linear-gradient(135deg, #4CAF50, #45a049);
                        border: none; color: white; padding: 20px 40px;
                        border-radius: 15px; font-size: 24px; font-weight: bold;
                        cursor: pointer; min-width: 300px;
                        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
                        transition: transform 0.2s;
                    ">👤 New Player</button>
                    
                    <button id="continueBtn" class="menu-btn" style="
                        background: linear-gradient(135deg, #2196F3, #1976D2);
                        border: none; color: white; padding: 20px 40px;
                        border-radius: 15px; font-size: 24px; font-weight: bold;
                        cursor: pointer; min-width: 300px;
                        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
                        transition: transform 0.2s;
                    ">📁 Continue</button>
                    
                    <button id="settingsBtn" class="menu-btn" style="
                        background: linear-gradient(135deg, #9C27B0, #7B1FA2);
                        border: none; color: white; padding: 20px 40px;
                        border-radius: 15px; font-size: 24px; font-weight: bold;
                        cursor: pointer; min-width: 300px;
                        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
                        transition: transform 0.2s;
                    ">⚙️ Settings</button>
                    
                    <button id="joinClassroomBtn" class="menu-btn" style="
                        background: linear-gradient(135deg, #FF9800, #F57C00);
                        border: none; color: white; padding: 20px 40px;
                        border-radius: 15px; font-size: 24px; font-weight: bold;
                        cursor: pointer; min-width: 300px;
                        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
                        transition: transform 0.2s;
                    ">📚 Join Classroom</button>
                    
                    <div style="display: flex; gap: 20px; margin-top: 10px;">
                        <!-- Multiplayer buttons moved to character menu -->
                        <div style="display: none;">
                            <button id="hostBtn">Host</button>
                            <button id="joinBtn">Join</button>
                        </div>
                        
                        <button id="quitBtn" class="menu-btn" style="
                            background: linear-gradient(135deg, #757575, #424242);
                            border: none; color: white; padding: 15px 30px;
                            border-radius: 15px; font-size: 18px; font-weight: bold;
                            cursor: pointer;
                        ">❌ Quit</button>
                    </div>
                </div>
                
                <!-- Teacher button in corner -->
                <button id="teacherBtn" style="
                    position: absolute;
                    bottom: 20px;
                    right: 20px;
                    background: rgba(255, 255, 255, 0.2);
                    border: 2px solid rgba(255, 255, 255, 0.3);
                    color: white;
                    width: 50px;
                    height: 50px;
                    border-radius: 50%;
                    font-size: 24px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    opacity: 0.7;
                " title="Teacher Access">🎓</button>
            </div>
        `;
        
        // Add hover effects
        this.addButtonHoverEffects();
        
        // Bind events
        document.getElementById('newPlayerBtn').addEventListener('click', () => {
            this.showMenu('characterCreation');
        });
        
        document.getElementById('continueBtn').addEventListener('click', () => {
            this.showMenu('characterSelection');
        });
        
        document.getElementById('settingsBtn').addEventListener('click', () => {
            this.showMenu('settings');
        });
        
        document.getElementById('joinClassroomBtn').addEventListener('click', () => {
            this.game.classroomJoinUI.showJoinDialog();
        });
        
        document.getElementById('quitBtn').addEventListener('click', () => {
            if (confirm('Are you sure you want to quit AlphaHunters?')) {
                window.close();
            }
        });
        
        // Teacher button
        const teacherBtn = document.getElementById('teacherBtn');
        if (teacherBtn) {
            teacherBtn.addEventListener('click', () => {
                console.log('Teacher button clicked');
                try {
                    if (!this.game.teacherAuth) {
                        console.log('Creating new TeacherAuth instance');
                        this.game.teacherAuth = new TeacherAuth(this.game);
                    }
                    console.log('Showing PIN dialog');
                    this.game.teacherAuth.showPinDialog();
                } catch (error) {
                    console.error('Error showing teacher dialog:', error);
                    alert('Error accessing teacher menu. Please check the console.');
                }
            });
        } else {
            console.error('Teacher button not found in DOM!');
        }
        
        // Teacher button hover effect
        if (teacherBtn) {
            teacherBtn.addEventListener('mouseenter', () => {
                teacherBtn.style.opacity = '1';
                teacherBtn.style.transform = 'scale(1.1)';
            });
            
            teacherBtn.addEventListener('mouseleave', () => {
                teacherBtn.style.opacity = '0.7';
                teacherBtn.style.transform = 'scale(1)';
            });
        }
    }
    
    createCharacterCreationMenu(container) {
        container.innerHTML = `
            <div style="text-align: center; max-width: 600px;">
                <h2 style="font-size: 48px; margin-bottom: 30px; text-shadow: 2px 2px 4px rgba(0,0,0,0.3);">
                    Create Your Character
                </h2>
                
                <div style="margin-bottom: 30px;">
                    <label style="display: block; font-size: 24px; margin-bottom: 10px; color: #fff;">
                        Character Name:
                    </label>
                    <input id="characterNameInput" type="text" maxlength="20" 
                           placeholder="Enter your name..." style="
                        padding: 15px; font-size: 20px; border: none;
                        border-radius: 10px; text-align: center; min-width: 300px;
                        box-shadow: 0 3px 10px rgba(0,0,0,0.2);
                        font-family: 'Comic Sans MS', cursive;
                    ">
                    <div id="nameError" style="color: #ff6b6b; font-size: 16px; margin-top: 5px; height: 20px;"></div>
                </div>
                
                <div style="margin-bottom: 40px;">
                    <label style="display: block; font-size: 24px; margin-bottom: 20px; color: #fff;">
                        Choose Your Avatar:
                    </label>
                    <div id="avatarSelection" style="display: flex; gap: 15px; justify-content: center; flex-wrap: wrap;">
                        ${this.game.dataManager.availableAvatars.map(avatar => `
                            <button class="avatar-btn" data-avatar="${avatar}" style="
                                background: rgba(255,255,255,0.2);
                                border: 3px solid transparent;
                                border-radius: 15px; padding: 20px;
                                font-size: 48px; cursor: pointer;
                                transition: all 0.3s;
                                backdrop-filter: blur(10px);
                            ">${avatar}</button>
                        `).join('')}
                    </div>
                    <div id="avatarError" style="color: #ff6b6b; font-size: 16px; margin-top: 10px; height: 20px;"></div>
                </div>
                
                <div style="display: flex; gap: 20px; justify-content: center;">
                    <button id="createCharacterBtn" disabled style="
                        background: linear-gradient(135deg, #4CAF50, #45a049);
                        border: none; color: white; padding: 20px 40px;
                        border-radius: 15px; font-size: 20px; font-weight: bold;
                        cursor: pointer; min-width: 200px;
                        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
                        transition: all 0.3s;
                        opacity: 0.5;
                    ">🎮 Create Character</button>
                    
                    <button onclick="game.menuManager.goBack()" style="
                        background: linear-gradient(135deg, #757575, #424242);
                        border: none; color: white; padding: 20px 40px;
                        border-radius: 15px; font-size: 20px; font-weight: bold;
                        cursor: pointer; min-width: 200px;
                        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
                        transition: all 0.3s;
                    ">⬅️ Back</button>
                </div>
            </div>
        `;
        
        this.setupCharacterCreation();
    }
    
    setupCharacterCreation() {
        const nameInput = document.getElementById('characterNameInput');
        const nameError = document.getElementById('nameError');
        const avatarError = document.getElementById('avatarError');
        const createBtn = document.getElementById('createCharacterBtn');
        const avatarBtns = document.querySelectorAll('.avatar-btn');
        
        let selectedAvatar = null;
        let isNameValid = false;
        
        // Avatar selection handling
        avatarBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                // Remove selection from all buttons
                avatarBtns.forEach(b => {
                    b.style.border = '3px solid transparent';
                    b.style.transform = 'scale(1)';
                });
                
                // Add selection to clicked button
                btn.style.border = '3px solid #4CAF50';
                btn.style.transform = 'scale(1.1)';
                
                selectedAvatar = btn.dataset.avatar;
                avatarError.textContent = '';
                this.updateCreateButton();
            });
            
            // Hover effects
            btn.addEventListener('mouseenter', () => {
                if (btn.dataset.avatar !== selectedAvatar) {
                    btn.style.transform = 'scale(1.05)';
                    btn.style.background = 'rgba(255,255,255,0.3)';
                }
            });
            
            btn.addEventListener('mouseleave', () => {
                if (btn.dataset.avatar !== selectedAvatar) {
                    btn.style.transform = 'scale(1)';
                    btn.style.background = 'rgba(255,255,255,0.2)';
                }
            });
        });
        
        // Name input validation
        nameInput.addEventListener('input', () => {
            const name = nameInput.value.trim();
            nameError.textContent = '';
            
            if (name.length === 0) {
                isNameValid = false;
            } else if (name.length < 2) {
                nameError.textContent = 'Name must be at least 2 characters';
                isNameValid = false;
            } else if (name.length > 20) {
                nameError.textContent = 'Name must be less than 20 characters';
                isNameValid = false;
            } else if (!/^[a-zA-Z0-9\s]+$/.test(name)) {
                nameError.textContent = 'Name can only contain letters, numbers, and spaces';
                isNameValid = false;
            } else {
                // Check if character already exists
                // Check if character with this name already exists
                const existingChar = Object.values(this.game.dataManager.characters).find(
                    char => char.identity.name.toLowerCase() === name.trim().toLowerCase()
                );
                if (existingChar) {
                    nameError.textContent = 'A character with this name already exists';
                    isNameValid = false;
                } else {
                    isNameValid = true;
                }
            }
            
            this.updateCreateButton();
        });
        
        // Create button handling
        createBtn.addEventListener('click', () => this.handleCharacterCreation());
        
        // Focus name input
        nameInput.focus();
        
        const self = this;
        function updateCreateButton() {
            if (isNameValid && selectedAvatar) {
                createBtn.disabled = false;
                createBtn.style.opacity = '1';
                createBtn.style.cursor = 'pointer';
            } else {
                createBtn.disabled = true;
                createBtn.style.opacity = '0.5';
                createBtn.style.cursor = 'not-allowed';
            }
        }
        
        this.updateCreateButton = updateCreateButton;
    }
    
    handleCharacterCreation() {
        const nameInput = document.getElementById('characterNameInput');
        const nameError = document.getElementById('nameError');
        const avatarError = document.getElementById('avatarError');
        const selectedAvatarBtn = document.querySelector('.avatar-btn[style*="border: 3px solid"]');
        
        const name = nameInput.value.trim();
        const avatar = selectedAvatarBtn ? selectedAvatarBtn.dataset.avatar : null;
        
        // Final validation
        if (!name) {
            nameError.textContent = 'Please enter a character name';
            return;
        }
        
        if (!avatar) {
            avatarError.textContent = 'Please select an avatar';
            return;
        }
        
        try {
            // Create the character
            const character = this.game.dataManager.createCharacter(name, avatar);
            
            // Select the new character
            this.game.dataManager.selectCharacter(character.id);
            
            console.log(`✅ Character created successfully: ${name} (${avatar})`);
            
            // Navigate to character menu
            this.showMenu('characterMenu', { character: character });
            
        } catch (error) {
            console.error('Failed to create character:', error);
            nameError.textContent = error.message;
        }
    }
    
    createCharacterSelectionMenu(container) {
        const characters = this.game.dataManager.getCharacterList();
        
        if (characters.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; max-width: 600px;">
                    <h2 style="font-size: 48px; margin-bottom: 30px; text-shadow: 2px 2px 4px rgba(0,0,0,0.3);">
                        No Characters Found
                    </h2>
                    <p style="font-size: 20px; margin-bottom: 40px; opacity: 0.9;">
                        You haven't created any characters yet. Create your first character to get started!
                    </p>
                    <div style="display: flex; gap: 20px; justify-content: center;">
                        <button onclick="game.menuManager.showMenu('characterCreation')" style="
                            background: linear-gradient(135deg, #4CAF50, #45a049);
                            border: none; color: white; padding: 20px 40px;
                            border-radius: 15px; font-size: 20px; font-weight: bold;
                            cursor: pointer; min-width: 200px;
                            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
                        ">👤 Create Character</button>
                        
                        <button onclick="game.menuManager.goBack()" style="
                            background: linear-gradient(135deg, #757575, #424242);
                            border: none; color: white; padding: 20px 40px;
                            border-radius: 15px; font-size: 20px; font-weight: bold;
                            cursor: pointer; min-width: 200px;
                            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
                        ">⬅️ Back</button>
                    </div>
                </div>
            `;
            return;
        }
        
        container.innerHTML = `
            <div style="text-align: center; max-width: 800px;">
                <h2 style="font-size: 48px; margin-bottom: 30px; text-shadow: 2px 2px 4px rgba(0,0,0,0.3);">
                    Select Character
                </h2>
                
                <div id="characterList" style="
                    display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                    gap: 20px; margin-bottom: 40px; max-height: 400px;
                    overflow-y: auto; padding: 10px;
                ">
                    ${characters.map(character => `
                        <div class="character-card" data-character-id="${character.id}" style="
                            background: rgba(255,255,255,0.1);
                            border: 2px solid rgba(255,255,255,0.2);
                            border-radius: 15px; padding: 20px;
                            cursor: pointer; transition: all 0.3s;
                            backdrop-filter: blur(10px);
                            text-align: center;
                        ">
                            <div style="font-size: 64px; margin-bottom: 15px;">${character.identity.avatar || '😊'}</div>
                            <h3 style="font-size: 24px; margin-bottom: 10px; color: #fff;">${character.identity.name}</h3>
                            <div style="font-size: 16px; opacity: 0.8; margin-bottom: 10px;">
                                Level ${character.progression.level} • ${character.progression.coins} coins
                            </div>
                            <div style="font-size: 14px; opacity: 0.6;">
                                Levels Unlocked: ${character.progression.unlockedLevels.length}
                            </div>
                            <div style="font-size: 12px; opacity: 0.5; margin-top: 10px;">
                                Created: ${new Date(character.identity.createdDate).toLocaleDateString()}
                            </div>
                            
                            <button class="delete-character" data-character-id="${character.id}" style="
                                position: absolute; top: 10px; right: 10px;
                                background: rgba(255,0,0,0.7); border: none;
                                color: white; border-radius: 50%; width: 30px; height: 30px;
                                cursor: pointer; font-size: 16px;
                                display: none;
                            ">×</button>
                        </div>
                    `).join('')}
                </div>
                
                <div style="display: flex; gap: 20px; justify-content: center; flex-wrap: wrap;">
                    <button onclick="game.menuManager.showMenu('characterCreation')" style="
                        background: linear-gradient(135deg, #4CAF50, #45a049);
                        border: none; color: white; padding: 15px 30px;
                        border-radius: 15px; font-size: 18px; font-weight: bold;
                        cursor: pointer;
                        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
                    ">➕ New Character</button>
                    
                    <button id="deleteMode" style="
                        background: linear-gradient(135deg, #f44336, #d32f2f);
                        border: none; color: white; padding: 15px 30px;
                        border-radius: 15px; font-size: 18px; font-weight: bold;
                        cursor: pointer;
                        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
                    ">🗑️ Delete Mode</button>
                    
                    <button onclick="game.menuManager.goBack()" style="
                        background: linear-gradient(135deg, #757575, #424242);
                        border: none; color: white; padding: 15px 30px;
                        border-radius: 15px; font-size: 18px; font-weight: bold;
                        cursor: pointer;
                        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
                    ">⬅️ Back</button>
                </div>
            </div>
        `;
        
        this.setupCharacterSelection();
    }
    
    setupCharacterSelection() {
        const characterCards = document.querySelectorAll('.character-card');
        const deleteButtons = document.querySelectorAll('.delete-character');
        const deleteModeBtn = document.getElementById('deleteMode');
        let deleteMode = false;
        
        // Character selection
        characterCards.forEach(card => {
            card.addEventListener('click', (e) => {
                if (deleteMode) return;
                
                const characterId = card.dataset.characterId;
                try {
                    const character = this.game.dataManager.selectCharacter(characterId);
                    console.log(`✅ Selected character: ${character.identity.name}`);
                    
                    // Navigate to character menu
                    this.showMenu('characterMenu', { character: character });
                    
                } catch (error) {
                    console.error('Failed to select character:', error);
                    alert('Failed to load character: ' + error.message);
                }
            });
            
            // Hover effects
            card.addEventListener('mouseenter', () => {
                if (!deleteMode) {
                    card.style.transform = 'translateY(-5px) scale(1.02)';
                    card.style.borderColor = 'rgba(255,255,255,0.4)';
                    card.style.background = 'rgba(255,255,255,0.15)';
                }
            });
            
            card.addEventListener('mouseleave', () => {
                if (!deleteMode) {
                    card.style.transform = 'translateY(0) scale(1)';
                    card.style.borderColor = 'rgba(255,255,255,0.2)';
                    card.style.background = 'rgba(255,255,255,0.1)';
                }
            });
        });
        
        // Delete mode toggle
        deleteModeBtn.addEventListener('click', () => {
            deleteMode = !deleteMode;
            
            if (deleteMode) {
                deleteModeBtn.textContent = '❌ Cancel Delete';
                deleteModeBtn.style.background = 'linear-gradient(135deg, #FF9800, #F57C00)';
                
                // Show delete buttons
                deleteButtons.forEach(btn => btn.style.display = 'block');
                
                // Change card appearance
                characterCards.forEach(card => {
                    card.style.cursor = 'not-allowed';
                    card.style.opacity = '0.7';
                });
                
            } else {
                deleteModeBtn.textContent = '🗑️ Delete Mode';
                deleteModeBtn.style.background = 'linear-gradient(135deg, #f44336, #d32f2f)';
                
                // Hide delete buttons
                deleteButtons.forEach(btn => btn.style.display = 'none');
                
                // Restore card appearance
                characterCards.forEach(card => {
                    card.style.cursor = 'pointer';
                    card.style.opacity = '1';
                });
            }
        });
        
        // Delete character handling
        deleteButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                
                const characterId = btn.dataset.characterId;
                const character = this.game.dataManager.characters[characterId];
                
                if (confirm(`Are you sure you want to delete character "${character.name}"? This cannot be undone.`)) {
                    try {
                        this.game.dataManager.deleteCharacter(characterId);
                        console.log(`🗑️ Deleted character: ${character.name}`);
                        
                        // Refresh the character selection menu
                        this.showMenu('characterSelection');
                        
                    } catch (error) {
                        console.error('Failed to delete character:', error);
                        alert('Failed to delete character: ' + error.message);
                    }
                }
            });
        });
    }
    
    createCharacterMenu(container, data) {
        const character = data.character || this.game.dataManager.getCurrentCharacter();
        
        if (!character) {
            this.showMenu('characterSelection');
            return;
        }
        
        container.innerHTML = `
            <div style="text-align: center; max-width: 900px;">
                <div style="margin-bottom: 30px;">
                    <div style="font-size: 72px; margin-bottom: 10px;">${character.identity.avatar || '😊'}</div>
                    <h2 style="font-size: 42px; margin-bottom: 10px; text-shadow: 2px 2px 4px rgba(0,0,0,0.3);">
                        Welcome, ${character.identity.name}!
                    </h2>
                    <div style="font-size: 18px; opacity: 0.8; margin-bottom: 20px;">
                        Level ${character.progression.level} • ${character.progression.coins} 🪙 coins
                    </div>
                    <div style="font-size: 16px; opacity: 0.6;">
                        ${character.progression.unlockedLevels ? character.progression.unlockedLevels.length : 0} levels unlocked • ${this.countPets(character)} pets rescued
                    </div>
                </div>
                
                <div style="
                    display: grid; grid-template-columns: repeat(3, 1fr);
                    gap: 20px; margin-bottom: 40px;
                ">
                    <button class="character-menu-btn" onclick="game.menuManager.showMenu('challenges')" style="
                        background: linear-gradient(135deg, #FF5722, #D84315);
                        border: none; color: white; padding: 30px 20px;
                        border-radius: 20px; font-size: 20px; font-weight: bold;
                        cursor: pointer; transition: all 0.3s;
                        box-shadow: 0 8px 20px rgba(0,0,0,0.2);
                        backdrop-filter: blur(10px);
                        position: relative;
                    ">
                        <div style="font-size: 40px; margin-bottom: 10px;">📝</div>
                        <div>Challenges</div>
                        <div style="font-size: 14px; opacity: 0.8; margin-top: 5px;">
                            Pen & Paper Tasks
                        </div>
                        ${this.getChallengeNotification()}
                    </button>
                    
                    <button class="character-menu-btn" onclick="game.menuManager.showMenu('levelSelect', {character: game.dataManager.getCurrentCharacter()})" style="
                        background: linear-gradient(135deg, #4CAF50, #45a049);
                        border: none; color: white; padding: 30px 20px;
                        border-radius: 20px; font-size: 20px; font-weight: bold;
                        cursor: pointer; transition: all 0.3s;
                        box-shadow: 0 8px 20px rgba(0,0,0,0.2);
                        backdrop-filter: blur(10px);
                    ">
                        <div style="font-size: 40px; margin-bottom: 10px;">🎯</div>
                        <div>Play Levels</div>
                        <div style="font-size: 14px; opacity: 0.8; margin-top: 5px;">
                            ${character.progression.unlockedLevels.length}/11 unlocked
                        </div>
                    </button>
                    
                    ${this.createActivityButton('petFarm', {
                        title: 'Pet Farm',
                        icon: '🐾',
                        subtitle: `${this.countPets(character)} pets rescued`,
                        background: 'linear-gradient(135deg, #FF9800, #F57C00)',
                        character: character
                    })}
                    
                    ${this.createActivityButton('store', {
                        title: 'Store',
                        icon: '🛍️',
                        subtitle: 'Skins & Upgrades',
                        background: 'linear-gradient(135deg, #9C27B0, #7B1FA2)',
                        character: character
                    })}
                    
                    <button class="character-menu-btn" onclick="game.menuManager.showCustomizeMenu()" style="
                        background: linear-gradient(135deg, #00BCD4, #0097A7);
                        border: none; color: white; padding: 30px 20px;
                        border-radius: 20px; font-size: 20px; font-weight: bold;
                        cursor: pointer; transition: all 0.3s;
                        box-shadow: 0 8px 20px rgba(0,0,0,0.2);
                        backdrop-filter: blur(10px);
                    ">
                        <div style="font-size: 40px; margin-bottom: 10px;">🎨</div>
                        <div>Customize</div>
                        <div style="font-size: 14px; opacity: 0.8; margin-top: 5px;">
                            Skins & Hats
                        </div>
                    </button>
                    
                    <button class="character-menu-btn" onclick="game.menuManager.showMenu('achievements', {character: game.dataManager.getCurrentCharacter()})" style="
                        background: linear-gradient(135deg, #2196F3, #1976D2);
                        border: none; color: white; padding: 30px 20px;
                        border-radius: 20px; font-size: 20px; font-weight: bold;
                        cursor: pointer; transition: all 0.3s;
                        box-shadow: 0 8px 20px rgba(0,0,0,0.2);
                        backdrop-filter: blur(10px);
                    ">
                        <div style="font-size: 40px; margin-bottom: 10px;">🏆</div>
                        <div>Progress</div>
                        <div style="font-size: 14px; opacity: 0.8; margin-top: 5px;">
                            Stats & Reports
                        </div>
                    </button>
                    
                    <button class="character-menu-btn" onclick="game.menuManager.showMultiplayer()" style="
                        background: linear-gradient(135deg, #9C27B0, #7B1FA2);
                        border: none; color: white; padding: 30px 20px;
                        border-radius: 20px; font-size: 20px; font-weight: bold;
                        cursor: pointer; transition: all 0.3s;
                        box-shadow: 0 8px 20px rgba(0,0,0,0.2);
                        backdrop-filter: blur(10px);
                    ">
                        <div style="font-size: 40px; margin-bottom: 10px;">👫</div>
                        <div>Multiplayer</div>
                        <div style="font-size: 14px; opacity: 0.8; margin-top: 5px;">
                            Play Together!
                        </div>
                    </button>
                </div>
                
                <div style="margin-bottom: 30px;">
                    <h3 style="font-size: 24px; margin-bottom: 15px; opacity: 0.9;">Recent Progress</h3>
                    <div style="
                        background: rgba(255,255,255,0.1); border-radius: 15px;
                        padding: 20px; backdrop-filter: blur(10px);
                    ">
                        ${this.generateProgressSummary(character)}
                    </div>
                </div>
                
                <div style="display: flex; gap: 20px; justify-content: center; flex-wrap: wrap;">
                    <button onclick="game.menuManager.showMenu('settings')" style="
                        background: linear-gradient(135deg, #607D8B, #455A64);
                        border: none; color: white; padding: 15px 30px;
                        border-radius: 15px; font-size: 18px; font-weight: bold;
                        cursor: pointer;
                        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
                    ">⚙️ Settings</button>
                    
                    <button onclick="game.menuManager.showMenu('characterSelection')" style="
                        background: linear-gradient(135deg, #795548, #5D4037);
                        border: none; color: white; padding: 15px 30px;
                        border-radius: 15px; font-size: 18px; font-weight: bold;
                        cursor: pointer;
                        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
                    ">👥 Switch Character</button>
                    
                    <button onclick="game.menuManager.goBack()" style="
                        background: linear-gradient(135deg, #757575, #424242);
                        border: none; color: white; padding: 15px 30px;
                        border-radius: 15px; font-size: 18px; font-weight: bold;
                        cursor: pointer;
                        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
                    ">⬅️ Back</button>
                </div>
            </div>
        `;
        
        this.addCharacterMenuHoverEffects();
    }
    
    generateProgressSummary(character) {
        const levelStats = character.progression.levelStats;
        const completedLevels = Object.keys(levelStats).filter(
            level => levelStats[level].completions > 0
        ).length;
        
        const totalStars = Object.values(levelStats).reduce(
            (sum, stats) => sum + (stats.stars || 0), 0
        );
        
        const bestScore = Math.max(
            ...Object.values(levelStats).map(stats => stats.bestScore || 0),
            0
        );
        
        const totalTraces = Object.values(character.statistics.letterStats || {}).reduce(
            (sum, stats) => sum + (stats.totalTraces || 0), 0
        );
        
        return `
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 15px; text-align: center;">
                <div>
                    <div style="font-size: 24px; color: #4CAF50; font-weight: bold;">${completedLevels}</div>
                    <div style="font-size: 14px; opacity: 0.8;">Levels Completed</div>
                </div>
                <div>
                    <div style="font-size: 24px; color: #FFD700; font-weight: bold;">${totalStars}⭐</div>
                    <div style="font-size: 14px; opacity: 0.8;">Total Stars</div>
                </div>
                <div>
                    <div style="font-size: 24px; color: #2196F3; font-weight: bold;">${bestScore}</div>
                    <div style="font-size: 14px; opacity: 0.8;">Best Score</div>
                </div>
                <div>
                    <div style="font-size: 24px; color: #FF9800; font-weight: bold;">${totalTraces}</div>
                    <div style="font-size: 14px; opacity: 0.8;">Letters Traced</div>
                </div>
            </div>
        `;
    }
    
    addCharacterMenuHoverEffects() {
        const style = document.createElement('style');
        style.textContent = `
            .character-menu-btn:hover {
                transform: translateY(-5px) scale(1.02);
                filter: brightness(1.1);
                box-shadow: 0 12px 25px rgba(0,0,0,0.3);
            }
            .character-menu-btn:active {
                transform: translateY(-2px) scale(0.98);
            }
        `;
        document.head.appendChild(style);
    }
    
    createActivityButton(activity, options) {
        const { title, icon, subtitle, background, character } = options;
        
        // Check if activity is locked
        const isLocked = this.game.timeLimitManager?.isActivityLocked(activity) || false;
        const lockReason = isLocked ? this.game.timeLimitManager?.getLockReason(activity) : null;
        
        // Generate onclick handler
        const onclick = isLocked ? 
            `alert('${lockReason}\\n\\nComplete a level or challenge to unlock!')` :
            `game.menuManager.showMenu('${activity}', {character: game.dataManager.getCurrentCharacter()})`;
        
        return `
            <button class="character-menu-btn" onclick="${onclick}" style="
                background: ${isLocked ? 'linear-gradient(135deg, #757575, #424242)' : background};
                border: none; color: white; padding: 30px 20px;
                border-radius: 20px; font-size: 20px; font-weight: bold;
                cursor: ${isLocked ? 'not-allowed' : 'pointer'}; transition: all 0.3s;
                box-shadow: 0 8px 20px rgba(0,0,0,0.2);
                backdrop-filter: blur(10px);
                position: relative;
                opacity: ${isLocked ? '0.7' : '1'};
            ">
                ${isLocked ? `
                    <div style="
                        position: absolute;
                        top: 10px;
                        right: 10px;
                        background: rgba(244, 67, 54, 0.9);
                        width: 30px;
                        height: 30px;
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 16px;
                        box-shadow: 0 2px 5px rgba(0,0,0,0.3);
                    ">🔒</div>
                ` : ''}
                <div style="font-size: 40px; margin-bottom: 10px;">${icon}</div>
                <div>${title}</div>
                <div style="font-size: 14px; opacity: 0.8; margin-top: 5px;">
                    ${isLocked ? lockReason : subtitle}
                </div>
            </button>
        `;
    }
    
    createLevelSelectMenu(container, data) {
        const character = data.character || this.game.dataManager.getCurrentCharacter();
        
        if (!character) {
            this.showMenu('characterSelection');
            return;
        }
        
        if (!this.game.levelManager) {
            console.error('LevelManager not initialized');
            this.createPlaceholder(container, 'Level Select - Loading...');
            return;
        }
        
        const allLevels = this.game.levelManager.getAllLevels();
        console.log('🎮 All levels:', allLevels.length, allLevels);
        
        // Separate standard and custom levels
        const standardLevels = allLevels.filter(level => !level.isCustom);
        const customLevels = allLevels.filter(level => level.isCustom);
        console.log('📚 Standard levels:', standardLevels.length);
        console.log('✨ Custom levels:', customLevels.length, customLevels);
        
        const unlockedLevels = this.game.levelManager.getUnlockedLevels(character);
        
        // Check which tab to show
        const showTab = data.tab || 'standard';
        
        container.innerHTML = `
            <div style="text-align: center; max-width: 1000px;">
                <div style="margin-bottom: 30px;">
                    <div style="font-size: 48px; margin-bottom: 10px;">📋</div>
                    <h2 style="font-size: 42px; margin-bottom: 15px; text-shadow: 2px 2px 4px rgba(0,0,0,0.3);">
                        Select Level
                    </h2>
                    <div style="font-size: 18px; opacity: 0.8; margin-bottom: 10px;">
                        ${character.name} • ${unlockedLevels.filter(id => id < 100).length}/11 standard levels unlocked
                    </div>
                    
                    <!-- Tab buttons -->
                    <div style="display: flex; gap: 10px; justify-content: center; margin: 20px 0;">
                        <button id="standardLevelsTab" style="
                            background: ${showTab === 'standard' ? 'linear-gradient(135deg, #4CAF50, #45a049)' : 'linear-gradient(135deg, #757575, #424242)'};
                            border: none; color: white; padding: 12px 25px;
                            border-radius: 10px; font-size: 16px; font-weight: bold;
                            cursor: pointer;
                            box-shadow: 0 3px 10px rgba(0,0,0,0.2);
                        ">📚 Standard Levels</button>
                        
                        <button id="customLevelsTab" style="
                            background: ${showTab === 'custom' ? 'linear-gradient(135deg, #9C27B0, #7B1FA2)' : 'linear-gradient(135deg, #757575, #424242)'};
                            border: none; color: white; padding: 12px 25px;
                            border-radius: 10px; font-size: 16px; font-weight: bold;
                            cursor: pointer;
                            box-shadow: 0 3px 10px rgba(0,0,0,0.2);
                        ">✨ Teacher Levels ${customLevels.length > 0 ? `(${customLevels.length})` : ''}</button>
                    </div>
                </div>
                
                <!-- Levels grid -->
                <div id="levelsGrid" style="
                    display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                    gap: 20px; margin-bottom: 40px; max-height: 500px;
                    overflow-y: auto; padding: 10px;
                ">
                    ${showTab === 'standard' ? 
                        standardLevels.map(level => this.createLevelCard(level, character, unlockedLevels.includes(level.id))).join('') :
                        customLevels.length > 0 ?
                            customLevels.map(level => this.createLevelCard(level, character, true)).join('') :
                            '<div style="grid-column: 1 / -1; text-align: center; padding: 40px; opacity: 0.7;">No teacher-created levels available yet!</div>'
                    }
                </div>
                
                <div style="display: flex; gap: 20px; justify-content: center; flex-wrap: wrap;">
                    <button onclick="game.menuManager.showMenu('characterMenu', {character: game.dataManager.getCurrentCharacter()})" style="
                        background: linear-gradient(135deg, #2196F3, #1976D2);
                        border: none; color: white; padding: 15px 30px;
                        border-radius: 15px; font-size: 18px; font-weight: bold;
                        cursor: pointer;
                        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
                    ">🏠 Character Menu</button>
                    
                    <button onclick="game.menuManager.goBack()" style="
                        background: linear-gradient(135deg, #757575, #424242);
                        border: none; color: white; padding: 15px 30px;
                        border-radius: 15px; font-size: 18px; font-weight: bold;
                        cursor: pointer;
                        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
                    ">⬅️ Back</button>
                </div>
            </div>
        `;
        
        // Setup tab switching
        document.getElementById('standardLevelsTab')?.addEventListener('click', () => {
            this.showMenu('levelSelect', { character, tab: 'standard' });
        });
        
        document.getElementById('customLevelsTab')?.addEventListener('click', () => {
            this.showMenu('levelSelect', { character, tab: 'custom' });
        });
        
        this.setupLevelSelection();
    }
    
    createLevelCard(level, character, isUnlocked) {
        const levelStats = character.progression.levelStats[level.id];
        const stars = levelStats ? levelStats.stars : 0;
        const bestScore = levelStats ? levelStats.bestScore.toLocaleString() : '0';
        const completions = levelStats ? levelStats.completions : 0;
        
        const starDisplay = '⭐'.repeat(stars) + '☆'.repeat(3 - stars);
        
        // Check unlock requirement text
        let unlockText = '';
        if (!isUnlocked && level.unlockRequirement) {
            const req = level.unlockRequirement;
            unlockText = `Requires Level ${req.level} with ${req.stars} star${req.stars !== 1 ? 's' : ''}`;
        }
        
        return `
            <div class="level-card ${isUnlocked ? 'unlocked' : 'locked'}" 
                 data-level-id="${level.id}" style="
                background: ${isUnlocked ? level.background : 'linear-gradient(135deg, #bdc3c7, #95a5a6)'};
                border: 3px solid ${isUnlocked ? level.primaryColor : '#7f8c8d'};
                border-radius: 20px; padding: 20px;
                cursor: ${isUnlocked ? 'pointer' : 'not-allowed'};
                transition: all 0.3s; position: relative;
                backdrop-filter: blur(10px);
                opacity: ${isUnlocked ? '1' : '0.6'};
                text-align: center; color: white;
                text-shadow: 1px 1px 2px rgba(0,0,0,0.7);
            ">
                <div style="font-size: 48px; margin-bottom: 15px;">
                    ${isUnlocked ? level.icon : '🔒'}
                </div>
                
                <h3 style="font-size: 22px; margin-bottom: 8px; font-weight: bold;">
                    ${level.isCustom ? '' : `Level ${level.id}`}
                </h3>
                <h4 style="font-size: 18px; margin-bottom: 12px; opacity: 0.9;">
                    ${level.name}
                </h4>
                <p style="font-size: 14px; margin-bottom: 15px; opacity: 0.8; line-height: 1.3;">
                    ${level.description}
                </p>
                
                ${isUnlocked ? `
                    <div style="margin-bottom: 15px;">
                        <div style="font-size: 24px; margin-bottom: 8px;">${starDisplay}</div>
                        <div style="font-size: 14px; opacity: 0.9;">
                            Best: ${bestScore} pts
                        </div>
                        <div style="font-size: 12px; opacity: 0.7;">
                            Completed ${completions} time${completions !== 1 ? 's' : ''}
                        </div>
                    </div>
                    
                    <div style="margin-bottom: 15px;">
                        <div style="font-size: 12px; opacity: 0.8; margin-bottom: 5px;">Letters:</div>
                        <div style="font-size: 16px; font-weight: bold;">
                            ${level.letters.join(' • ')}
                        </div>
                    </div>
                    
                    <div style="margin-bottom: 15px;">
                        <div style="font-size: 12px; opacity: 0.8; margin-bottom: 5px;">Objectives:</div>
                        <div style="font-size: 11px; opacity: 0.7; text-align: left;">
                            ${level.objectives.map(obj => `• ${obj}`).join('<br>')}
                        </div>
                    </div>
                    
                    <button class="play-level-btn" data-level-id="${level.id}" style="
                        background: rgba(255,255,255,0.2);
                        border: 2px solid rgba(255,255,255,0.3);
                        color: white; padding: 12px 24px;
                        border-radius: 10px; font-size: 16px; font-weight: bold;
                        cursor: pointer; transition: all 0.3s;
                        backdrop-filter: blur(10px);
                        width: 100%;
                    ">🎮 Play Level</button>
                ` : `
                    <div style="margin: 20px 0;">
                        <div style="font-size: 16px; margin-bottom: 10px;">🔒 Locked</div>
                        <div style="font-size: 12px; opacity: 0.8; line-height: 1.3;">
                            ${unlockText}
                        </div>
                    </div>
                `}
            </div>
        `;
    }
    
    setupLevelSelection() {
        const levelCards = document.querySelectorAll('.level-card.unlocked');
        const playButtons = document.querySelectorAll('.play-level-btn');
        
        // Level card hover effects
        levelCards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-5px) scale(1.02)';
                card.style.boxShadow = '0 15px 30px rgba(0,0,0,0.3)';
                card.style.filter = 'brightness(1.1)';
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0) scale(1)';
                card.style.boxShadow = '0 5px 15px rgba(0,0,0,0.2)';
                card.style.filter = 'brightness(1)';
            });
            
            // Click to play level
            card.addEventListener('click', (e) => {
                if (e.target.classList.contains('play-level-btn')) return; // Let button handle it
                
                const levelId = parseInt(card.dataset.levelId);
                this.startLevel(levelId);
            });
        });
        
        // Play button specific handlers
        playButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const levelId = parseInt(btn.dataset.levelId);
                this.startLevel(levelId);
            });
            
            btn.addEventListener('mouseenter', () => {
                btn.style.background = 'rgba(255,255,255,0.3)';
                btn.style.borderColor = 'rgba(255,255,255,0.5)';
                btn.style.transform = 'scale(1.05)';
            });
            
            btn.addEventListener('mouseleave', () => {
                btn.style.background = 'rgba(255,255,255,0.2)';
                btn.style.borderColor = 'rgba(255,255,255,0.3)';
                btn.style.transform = 'scale(1)';
            });
        });
    }
    
    startLevel(levelId) {
        if (!this.game.levelManager) {
            console.error('LevelManager not available');
            return;
        }
        
        const character = this.game.dataManager.getCurrentCharacter();
        if (!character) {
            console.error('No character selected');
            return;
        }
        
        console.log(`🎯 Attempting to start Level ${levelId}`);
        
        const success = this.game.levelManager.startLevel(levelId, character);
        if (!success) {
            console.error(`Failed to start Level ${levelId}`);
            alert(`Cannot start Level ${levelId}. Please check if it's unlocked.`);
        }
    }
    createStoreMenu(container, data) {
        const character = data?.character || this.game.dataManager.getCurrentCharacter();
        if (!character) {
            this.showMenu('characterSelection');
            return;
        }
        
        // Store categories
        const categories = [
            { id: 'skins', name: 'Skins', icon: '👕' },
            { id: 'hats', name: 'Hats', icon: '🎩' },
            { id: 'petItems', name: 'Pet Items', icon: '🐾' },
            { id: 'backgrounds', name: 'Backgrounds', icon: '🌈' }
        ];
        
        let selectedCategory = 'skins';
        
        // Store items data with expanded options and price ranges
        const storeItems = {
            skins: [
                // Cheap tier (10-100 coins)
                { id: 'happy', emoji: '😊', name: 'Happy', price: 10 },
                { id: 'cool', emoji: '😎', name: 'Cool', price: 15 },
                { id: 'wink', emoji: '😉', name: 'Wink', price: 20 },
                { id: 'heart_eyes', emoji: '😍', name: 'Heart Eyes', price: 25 },
                { id: 'star_eyes', emoji: '🤩', name: 'Star Eyes', price: 30 },
                { id: 'nerd', emoji: '🤓', name: 'Nerd', price: 35 },
                { id: 'angel', emoji: '😇', name: 'Angel', price: 40 },
                { id: 'devil', emoji: '😈', name: 'Devil', price: 45 },
                { id: 'clown', emoji: '🤡', name: 'Clown', price: 50 },
                { id: 'ghost', emoji: '👻', name: 'Ghost', price: 60 },
                { id: 'alien', emoji: '👽', name: 'Alien', price: 70 },
                { id: 'robot_face', emoji: '🤖', name: 'Robot Face', price: 80 },
                { id: 'pumpkin', emoji: '🎃', name: 'Pumpkin', price: 90 },
                { id: 'skull', emoji: '💀', name: 'Skull', price: 100 },
                
                // Mid tier (150-500 coins)
                { id: 'knight', emoji: '⚔️', name: 'Knight', price: 150 },
                { id: 'wizard', emoji: '🧙', name: 'Wizard', price: 200 },
                { id: 'ninja', emoji: '🥷', name: 'Ninja', price: 250 },
                { id: 'astronaut', emoji: '🚀', name: 'Astronaut', price: 300 },
                { id: 'pirate', emoji: '🏴‍☠️', name: 'Pirate', price: 350 },
                { id: 'robot', emoji: '🤖', name: 'Robot Suit', price: 400 },
                { id: 'dinosaur', emoji: '🦕', name: 'Dinosaur', price: 450 },
                { id: 'unicorn', emoji: '🦄', name: 'Unicorn', price: 500 },
                
                // High tier (600-2000 coins)
                { id: 'dragon', emoji: '🐉', name: 'Dragon', price: 600 },
                { id: 'phoenix', emoji: '🔥', name: 'Phoenix', price: 750 },
                { id: 'mermaid', emoji: '🧜', name: 'Mermaid', price: 900 },
                { id: 'fairy', emoji: '🧚', name: 'Fairy', price: 1000 },
                { id: 'superhero', emoji: '🦸', name: 'Superhero', price: 1200 },
                { id: 'vampire', emoji: '🧛', name: 'Vampire', price: 1500 },
                { id: 'genie', emoji: '🧞', name: 'Genie', price: 1750 },
                { id: 'zombie', emoji: '🧟', name: 'Zombie', price: 2000 },
                
                // Legendary tier (2500-10000 coins)
                { id: 'rainbow', emoji: '🌈', name: 'Rainbow', price: 2500 },
                { id: 'galaxy', emoji: '🌌', name: 'Galaxy', price: 3000 },
                { id: 'lightning', emoji: '⚡', name: 'Lightning', price: 3500 },
                { id: 'crystal', emoji: '💎', name: 'Crystal', price: 4000 },
                { id: 'golden', emoji: '✨', name: 'Golden', price: 5000 },
                { id: 'mystic', emoji: '🔮', name: 'Mystic', price: 6000 },
                { id: 'cosmic', emoji: '💫', name: 'Cosmic', price: 7500 },
                { id: 'legendary', emoji: '🌟', name: 'Legendary', price: 10000 }
            ],
            hats: [
                // Cheap tier (5-50 coins)
                { id: 'headband', emoji: '🎗️', name: 'Headband', price: 5 },
                { id: 'bandana', emoji: '🏴', name: 'Bandana', price: 10 },
                { id: 'flower', emoji: '🌸', name: 'Flower', price: 15 },
                { id: 'sunflower', emoji: '🌻', name: 'Sunflower', price: 20 },
                { id: 'cap', emoji: '🧢', name: 'Baseball Cap', price: 25 },
                { id: 'beret', emoji: '🎨', name: 'Artist Beret', price: 30 },
                { id: 'headphones', emoji: '🎧', name: 'Headphones', price: 35 },
                { id: 'bow', emoji: '🎀', name: 'Bow', price: 40 },
                { id: 'glasses', emoji: '👓', name: 'Glasses', price: 45 },
                { id: 'sunglasses', emoji: '🕶️', name: 'Sunglasses', price: 50 },
                
                // Mid tier (75-300 coins)
                { id: 'party', emoji: '🥳', name: 'Party Hat', price: 75 },
                { id: 'tophat', emoji: '🎩', name: 'Top Hat', price: 100 },
                { id: 'cowboy', emoji: '🤠', name: 'Cowboy Hat', price: 125 },
                { id: 'crown', emoji: '👑', name: 'Crown', price: 150 },
                { id: 'graduation', emoji: '🎓', name: 'Graduation Cap', price: 175 },
                { id: 'santa', emoji: '🎅', name: 'Santa Hat', price: 200 },
                { id: 'pirate_hat', emoji: '🏴‍☠️', name: 'Pirate Hat', price: 250 },
                { id: 'wizard_hat', emoji: '🧙‍♂️', name: 'Wizard Hat', price: 300 },
                
                // High tier (400-1500 coins)
                { id: 'viking', emoji: '⛑️', name: 'Viking Helmet', price: 400 },
                { id: 'knight_helm', emoji: '🛡️', name: 'Knight Helmet', price: 500 },
                { id: 'halo', emoji: '😇', name: 'Halo', price: 600 },
                { id: 'horns', emoji: '😈', name: 'Devil Horns', price: 750 },
                { id: 'antlers', emoji: '🦌', name: 'Antlers', price: 900 },
                { id: 'unicorn_horn', emoji: '🦄', name: 'Unicorn Horn', price: 1000 },
                { id: 'golden_crown', emoji: '👑', name: 'Golden Crown', price: 1250 },
                { id: 'diamond_tiara', emoji: '💎', name: 'Diamond Tiara', price: 1500 },
                
                // Legendary tier (2000-7500 coins)
                { id: 'flame_crown', emoji: '🔥', name: 'Flame Crown', price: 2000 },
                { id: 'ice_crown', emoji: '❄️', name: 'Ice Crown', price: 2500 },
                { id: 'rainbow_halo', emoji: '🌈', name: 'Rainbow Halo', price: 3000 },
                { id: 'star_crown', emoji: '⭐', name: 'Star Crown', price: 4000 },
                { id: 'cosmic_helm', emoji: '🌌', name: 'Cosmic Helm', price: 5000 },
                { id: 'legendary_crown', emoji: '👑', name: 'Legendary Crown', price: 7500 }
            ],
            petItems: [
                // Cheap tier (5-50 coins)
                { id: 'treat_basic', emoji: '🍖', name: 'Pet Treat', price: 5, type: 'consumable' },
                { id: 'water_bowl', emoji: '🥤', name: 'Water Bowl', price: 10, type: 'furniture' },
                { id: 'food_bowl', emoji: '🍜', name: 'Food Bowl', price: 15, type: 'furniture' },
                { id: 'stick', emoji: '🦴', name: 'Stick', price: 20, type: 'toy' },
                { id: 'toy_mouse', emoji: '🐭', name: 'Toy Mouse', price: 25, type: 'toy' },
                { id: 'toy_ball', emoji: '⚽', name: 'Play Ball', price: 30, type: 'toy' },
                { id: 'rope_toy', emoji: '🪢', name: 'Rope Toy', price: 35, type: 'toy' },
                { id: 'toy_bone', emoji: '🦴', name: 'Chew Bone', price: 40, type: 'toy' },
                { id: 'squeaky_toy', emoji: '🦆', name: 'Squeaky Duck', price: 45, type: 'toy' },
                { id: 'treat_premium', emoji: '🍗', name: 'Premium Treat', price: 50, type: 'consumable' },
                
                // Mid tier (75-400 coins)
                { id: 'toy_frisbee', emoji: '🥏', name: 'Frisbee', price: 75 },
                { id: 'scratching_post', emoji: '🪵', name: 'Scratching Post', price: 100, type: 'furniture' },
                { id: 'pet_mat', emoji: '🟦', name: 'Pet Mat', price: 125, type: 'furniture' },
                { id: 'bed_small', emoji: '🛏️', name: 'Small Bed', price: 150, type: 'furniture' },
                { id: 'house_small', emoji: '🏠', name: 'Small House', price: 200, type: 'furniture' },
                { id: 'toy_tunnel', emoji: '🚇', name: 'Play Tunnel', price: 250, type: 'furniture' },
                { id: 'cat_tower', emoji: '🗼', name: 'Cat Tower', price: 300, type: 'furniture' },
                { id: 'bed_luxury', emoji: '🛋️', name: 'Luxury Bed', price: 350, type: 'furniture' },
                { id: 'house_large', emoji: '🏡', name: 'Large House', price: 400, type: 'furniture' },
                
                // High tier (500-2000 coins)
                { id: 'playground', emoji: '🎪', name: 'Pet Playground', price: 500, type: 'furniture' },
                { id: 'fountain', emoji: '⛲', name: 'Pet Fountain', price: 750, type: 'furniture' },
                { id: 'pool', emoji: '🏊', name: 'Swimming Pool', price: 1000, type: 'furniture' },
                { id: 'garden', emoji: '🌻', name: 'Pet Garden', price: 1250, type: 'furniture' },
                { id: 'treehouse', emoji: '🌳', name: 'Tree House', price: 1500, type: 'furniture' },
                { id: 'castle_pet', emoji: '🏰', name: 'Pet Castle', price: 1750, type: 'furniture' },
                { id: 'spa', emoji: '🧖', name: 'Pet Spa', price: 2000, type: 'furniture' },
                
                // Legendary tier (2500-8000 coins)
                { id: 'mansion', emoji: '🏛️', name: 'Pet Mansion', price: 2500, type: 'furniture' },
                { id: 'yacht', emoji: '🛥️', name: 'Pet Yacht', price: 3000, type: 'furniture' },
                { id: 'helicopter', emoji: '🚁', name: 'Pet Helicopter', price: 4000, type: 'furniture' },
                { id: 'rocket', emoji: '🚀', name: 'Pet Rocket', price: 5000, type: 'furniture' },
                { id: 'palace', emoji: '🏯', name: 'Golden Palace', price: 6000, type: 'furniture' },
                { id: 'paradise', emoji: '🏝️', name: 'Pet Paradise', price: 8000, type: 'furniture' }
            ],
            backgrounds: [
                // Cheap tier (50-200 coins)
                { id: 'meadow', emoji: '🌾', name: 'Meadow', price: 50 },
                { id: 'park', emoji: '🏞️', name: 'Park', price: 75 },
                { id: 'garden', emoji: '🌷', name: 'Garden', price: 100 },
                { id: 'farm', emoji: '🚜', name: 'Farm', price: 125 },
                { id: 'hills', emoji: '⛰️', name: 'Hills', price: 150 },
                { id: 'lake', emoji: '🏞️', name: 'Lakeside', price: 175 },
                { id: 'autumn', emoji: '🍂', name: 'Autumn', price: 200 },
                
                // Mid tier (250-600 coins)
                { id: 'beach', emoji: '🏖️', name: 'Beach Paradise', price: 250 },
                { id: 'forest', emoji: '🌲', name: 'Forest Glade', price: 300 },
                { id: 'desert', emoji: '🏜️', name: 'Desert Oasis', price: 350 },
                { id: 'underwater', emoji: '🌊', name: 'Underwater', price: 400 },
                { id: 'castle', emoji: '🏰', name: 'Castle Garden', price: 450 },
                { id: 'city', emoji: '🏙️', name: 'City Skyline', price: 500 },
                { id: 'jungle', emoji: '🌴', name: 'Jungle', price: 550 },
                { id: 'candy', emoji: '🍭', name: 'Candy Land', price: 600 },
                
                // High tier (700-2000 coins)
                { id: 'volcano', emoji: '🌋', name: 'Volcano', price: 700 },
                { id: 'arctic', emoji: '❄️', name: 'Arctic', price: 850 },
                { id: 'space', emoji: '🌌', name: 'Outer Space', price: 1000 },
                { id: 'heaven', emoji: '☁️', name: 'Cloud Heaven', price: 1250 },
                { id: 'crystal_cave', emoji: '💎', name: 'Crystal Cave', price: 1500 },
                { id: 'aurora', emoji: '🌌', name: 'Aurora Borealis', price: 1750 },
                { id: 'atlantis', emoji: '🏛️', name: 'Atlantis', price: 2000 },
                
                // Legendary tier (2500-10000 coins)
                { id: 'galaxy', emoji: '🌠', name: 'Galaxy', price: 2500 },
                { id: 'nebula', emoji: '🌌', name: 'Nebula', price: 3000 },
                { id: 'dimension', emoji: '🔮', name: 'Other Dimension', price: 4000 },
                { id: 'dreamland', emoji: '✨', name: 'Dreamland', price: 5000 },
                { id: 'paradise', emoji: '🏝️', name: 'Paradise Island', price: 6000 },
                { id: 'mystic_realm', emoji: '🌟', name: 'Mystic Realm', price: 7500 },
                { id: 'legendary_world', emoji: '🌈', name: 'Legendary World', price: 10000 }
            ]
        };
        
        const renderStore = () => {
            container.innerHTML = `
                <div style="text-align: center; max-width: 1000px;">
                    <h2 style="font-size: 48px; margin-bottom: 20px; text-shadow: 2px 2px 4px rgba(0,0,0,0.3);">
                        🛍️ AlphaHunters Store
                    </h2>
                    
                    <div style="
                        background: rgba(255,255,255,0.1);
                        padding: 15px;
                        border-radius: 12px;
                        margin-bottom: 20px;
                        font-size: 20px;
                    ">
                        💰 Your Coins: <span style="color: #FFD700; font-weight: bold;">${character.progression.coins}</span>
                    </div>
                    
                    <!-- Category Tabs -->
                    <div style="
                        display: flex;
                        justify-content: center;
                        gap: 10px;
                        margin-bottom: 30px;
                        flex-wrap: wrap;
                    ">
                        ${categories.map(cat => `
                            <button class="category-tab" data-category="${cat.id}" style="
                                background: ${selectedCategory === cat.id ? '#4CAF50' : 'rgba(255,255,255,0.2)'};
                                color: white;
                                border: none;
                                padding: 15px 30px;
                                border-radius: 12px;
                                font-size: 18px;
                                cursor: pointer;
                                transition: all 0.3s;
                            ">
                                ${cat.icon} ${cat.name}
                            </button>
                        `).join('')}
                    </div>
                    
                    <!-- Items Grid -->
                    <div style="
                        display: grid;
                        grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
                        gap: 20px;
                        margin-bottom: 30px;
                        max-height: 400px;
                        overflow-y: auto;
                        padding: 10px;
                    ">
                        ${storeItems[selectedCategory].map(item => {
                            const owned = this.isItemOwned(character, selectedCategory, item.id);
                            return `
                                <div class="store-item" data-item-id="${item.id}" style="
                                    background: ${owned ? 'rgba(76, 175, 80, 0.3)' : 'rgba(255,255,255,0.1)'};
                                    border: 2px solid ${owned ? '#4CAF50' : 'rgba(255,255,255,0.2)'};
                                    border-radius: 16px;
                                    padding: 20px;
                                    text-align: center;
                                    cursor: ${owned ? 'default' : 'pointer'};
                                    transition: all 0.3s;
                                    position: relative;
                                ">
                                    <div style="font-size: 48px; margin-bottom: 10px;">${item.emoji}</div>
                                    <div style="font-weight: bold; margin-bottom: 5px;">${item.name}</div>
                                    <div style="color: ${owned ? '#4CAF50' : '#FFD700'};">
                                        ${owned ? '✓ Owned' : `🪙 ${item.price}`}
                                    </div>
                                    ${owned && selectedCategory === 'skins' ? `
                                        <button class="equip-btn" style="
                                            background: #2196F3;
                                            color: white;
                                            border: none;
                                            padding: 5px 15px;
                                            border-radius: 8px;
                                            margin-top: 10px;
                                            cursor: pointer;
                                        ">Equip</button>
                                    ` : ''}
                                    ${owned && selectedCategory === 'hats' ? `
                                        <button class="equip-btn" style="
                                            background: #2196F3;
                                            color: white;
                                            border: none;
                                            padding: 5px 15px;
                                            border-radius: 8px;
                                            margin-top: 10px;
                                            cursor: pointer;
                                        ">Wear</button>
                                    ` : ''}
                                </div>
                            `;
                        }).join('')}
                    </div>
                    
                    <button onclick="game.menuManager.showMenu('characterMenu')" style="
                        background: linear-gradient(135deg, #666, #444);
                        border: none;
                        color: white;
                        padding: 15px 40px;
                        border-radius: 12px;
                        font-size: 18px;
                        cursor: pointer;
                    ">← Back</button>
                </div>
            `;
            
            // Add category switching
            container.querySelectorAll('.category-tab').forEach(tab => {
                tab.addEventListener('click', () => {
                    selectedCategory = tab.dataset.category;
                    renderStore();
                });
            });
            
            // Add purchase functionality
            container.querySelectorAll('.store-item').forEach(item => {
                const itemId = item.dataset.itemId;
                const itemData = storeItems[selectedCategory].find(i => i.id === itemId);
                const owned = this.isItemOwned(character, selectedCategory, itemId);
                
                if (!owned) {
                    item.addEventListener('click', () => {
                        this.purchaseItem(character, selectedCategory, itemData);
                        renderStore();
                    });
                }
            });
            
            // Add equip functionality
            container.querySelectorAll('.equip-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const itemElement = btn.closest('.store-item');
                    const itemId = itemElement.dataset.itemId;
                    const itemData = storeItems[selectedCategory].find(i => i.id === itemId);
                    this.equipItem(character, selectedCategory, itemData);
                    renderStore();
                });
            });
        };
        
        renderStore();
    }
    
    isItemOwned(character, category, itemId) {
        if (!character.shopData) {
            character.shopData = {
                purchasedSkins: [],
                purchasedHats: [],
                purchasedPetItems: [],
                purchasedBackgrounds: [],
                equippedHat: null,
                equippedBackground: 'default'
            };
        }
        
        switch(category) {
            case 'skins':
                return character.shopData.purchasedSkins?.includes(itemId) || false;
            case 'hats':
                return character.shopData.purchasedHats?.includes(itemId) || false;
            case 'petItems':
                return character.shopData.purchasedPetItems?.includes(itemId) || false;
            case 'backgrounds':
                return character.shopData.purchasedBackgrounds?.includes(itemId) || false;
        }
        return false;
    }
    
    purchaseItem(character, category, item) {
        if (character.progression.coins < item.price) {
            alert(`Not enough coins! You need ${item.price} coins.`);
            return;
        }
        
        // Initialize shop data if needed
        if (!character.shopData) {
            character.shopData = {
                purchasedSkins: [],
                purchasedHats: [],
                purchasedPetItems: [],
                purchasedBackgrounds: [],
                equippedHat: null,
                equippedBackground: 'default'
            };
        }
        
        // Deduct coins
        this.game.dataManager.spendCoins(item.price);
        
        // Add to purchased items
        switch(category) {
            case 'skins':
                if (!character.shopData.purchasedSkins) character.shopData.purchasedSkins = [];
                character.shopData.purchasedSkins.push(item.id);
                // Also add the emoji to unlocked skins
                this.game.dataManager.unlockSkin(item.emoji);
                break;
            case 'hats':
                if (!character.shopData.purchasedHats) character.shopData.purchasedHats = [];
                character.shopData.purchasedHats.push(item.id);
                break;
            case 'petItems':
                if (!character.shopData.purchasedPetItems) character.shopData.purchasedPetItems = [];
                character.shopData.purchasedPetItems.push(item.id);
                break;
            case 'backgrounds':
                if (!character.shopData.purchasedBackgrounds) character.shopData.purchasedBackgrounds = [];
                character.shopData.purchasedBackgrounds.push(item.id);
                break;
        }
        
        // Save data
        this.game.dataManager.markDirty();
        this.game.dataManager.save();
        
        // Show purchase animation
        this.showPurchaseAnimation(item);
    }
    
    equipItem(character, category, item) {
        if (!character.shopData) return;
        
        switch(category) {
            case 'skins':
                character.customization.activeSkin = item.emoji;
                character.identity.avatar = item.emoji;
                break;
            case 'hats':
                character.shopData.equippedHat = item.id;
                break;
        }
        
        this.game.dataManager.markDirty();
        this.game.dataManager.save();
        
        alert(`${item.name} equipped!`);
    }
    
    showPurchaseAnimation(item) {
        const animation = document.createElement('div');
        animation.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: #4CAF50;
            color: white;
            padding: 30px 50px;
            border-radius: 16px;
            font-size: 24px;
            font-weight: bold;
            z-index: 10000;
            animation: purchasePop 0.5s ease-out;
        `;
        animation.innerHTML = `
            <div style="text-align: center;">
                <div style="font-size: 48px; margin-bottom: 10px;">${item.emoji}</div>
                <div>Purchased ${item.name}!</div>
            </div>
        `;
        
        const style = document.createElement('style');
        style.textContent = `
            @keyframes purchasePop {
                0% { transform: translate(-50%, -50%) scale(0); opacity: 0; }
                50% { transform: translate(-50%, -50%) scale(1.2); }
                100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
        document.body.appendChild(animation);
        
        setTimeout(() => {
            animation.remove();
            style.remove();
        }, 2000);
    }
    createPetFarmMenu(container, data) {
        const character = data.character || this.game.dataManager.getCurrentCharacter();
        
        if (!character) {
            this.showMenu('characterSelection');
            return;
        }
        
        // Initialize PetFarm if not already done
        if (!this.game.petFarm) {
            this.game.petFarm = new PetFarm(this.game);
        } else {
            this.game.petFarm.loadPetsFromCharacter();
        }
        
        const petCount = Object.keys(character.pets.farm || {}).reduce((count, letter) => {
            const petData = character.pets.farm[letter];
            return count + (Array.isArray(petData) ? petData.length : 1);
        }, 0);
        
        container.innerHTML = `
            <div style="text-align: center; max-width: 900px; width: 100%;">
                <div style="margin-bottom: 20px;">
                    <h2 style="font-size: 42px; margin-bottom: 10px; text-shadow: 2px 2px 4px rgba(0,0,0,0.3);">
                        🐾 Pet Farm
                    </h2>
                    <div style="font-size: 18px; opacity: 0.8;">
                        ${character.name}'s Aquarium • ${petCount} pets rescued
                    </div>
                    ${this.game.petFarm.coinAvailable && !this.game.petFarm.coinEarnedThisVisit ? 
                        '<div style="font-size: 16px; color: #FFD700; margin-top: 10px;">✨ One pet has a coin reward! Click to find it!</div>' : 
                        '<div style="font-size: 14px; opacity: 0.6; margin-top: 10px;">Complete more levels to earn coin rewards from pets</div>'
                    }
                </div>
                
                <div id="petFarmContainer" style="
                    position: relative;
                    width: 800px; height: 500px;
                    margin: 0 auto 30px;
                    background: linear-gradient(to bottom, #8B4513 0%, #A0522D 30%, #D2B48C 100%);
                    border: 15px solid #654321;
                    border-radius: 5px;
                    overflow: hidden;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                ">
                    <canvas id="petFarmCanvas" width="800" height="500" style="
                        position: absolute; top: 0; left: 0;
                        cursor: pointer;
                    "></canvas>
                    
                    <!-- Wooden fence posts -->
                    <div style="
                        position: absolute; bottom: 0; left: -5px;
                        width: 20px; height: 120px;
                        background: linear-gradient(to right, #654321, #8B4513);
                        border-radius: 5px 5px 0 0;
                    "></div>
                    <div style="
                        position: absolute; bottom: 0; right: -5px;
                        width: 20px; height: 120px;
                        background: linear-gradient(to right, #654321, #8B4513);
                        border-radius: 5px 5px 0 0;
                    "></div>
                    <div style="
                        position: absolute; bottom: 0; left: 195px;
                        width: 20px; height: 120px;
                        background: linear-gradient(to right, #654321, #8B4513);
                        border-radius: 5px 5px 0 0;
                    "></div>
                    <div style="
                        position: absolute; bottom: 0; left: 395px;
                        width: 20px; height: 120px;
                        background: linear-gradient(to right, #654321, #8B4513);
                        border-radius: 5px 5px 0 0;
                    "></div>
                    <div style="
                        position: absolute; bottom: 0; right: 195px;
                        width: 20px; height: 120px;
                        background: linear-gradient(to right, #654321, #8B4513);
                        border-radius: 5px 5px 0 0;
                    "></div>
                    
                    <!-- Horizontal fence rails -->
                    <div style="
                        position: absolute; bottom: 30px; left: 0; right: 0;
                        height: 15px;
                        background: #8B4513;
                        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                    "></div>
                    <div style="
                        position: absolute; bottom: 70px; left: 0; right: 0;
                        height: 15px;
                        background: #8B4513;
                        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                    "></div>
                </div>
                
                <!-- Help text -->
                <div style="
                    text-align: center;
                    color: rgba(255,255,255,0.8);
                    font-size: 14px;
                    margin-bottom: 10px;
                ">
                    💡 Click on pets to interact • Pets with low happiness (😢) need treats or rest • Happy pets sparkle ✨
                </div>
                
                <!-- Item placement controls -->
                <div id="farmControls" style="
                    background: rgba(0,0,0,0.5);
                    padding: 10px;
                    border-radius: 8px;
                    margin-bottom: 20px;
                    display: flex;
                    gap: 10px;
                    justify-content: center;
                    flex-wrap: wrap;
                ">
                    <button id="editModeBtn" onclick="game.petFarm.toggleEditMode()" style="
                        background: #FF9800;
                        color: white;
                        border: none;
                        padding: 8px 16px;
                        border-radius: 6px;
                        cursor: pointer;
                    ">🔧 Edit Mode</button>
                    
                    <button id="inventoryBtn" onclick="game.menuManager.showFarmInventory()" style="
                        background: #9C27B0;
                        color: white;
                        border: none;
                        padding: 8px 16px;
                        border-radius: 6px;
                        cursor: pointer;
                    ">📦 Inventory</button>
                    
                    <button id="backgroundBtn" onclick="game.menuManager.showBackgroundSelector()" style="
                        background: #00BCD4;
                        color: white;
                        border: none;
                        padding: 8px 16px;
                        border-radius: 6px;
                        cursor: pointer;
                    ">🌈 Background</button>
                </div>
                
                <div style="display: flex; gap: 20px; justify-content: center; flex-wrap: wrap;">
                    <button onclick="game.menuManager.showMenu('characterMenu', {character: game.dataManager.getCurrentCharacter()})" style="
                        background: linear-gradient(135deg, #2196F3, #1976D2);
                        border: none; color: white; padding: 15px 30px;
                        border-radius: 15px; font-size: 18px; font-weight: bold;
                        cursor: pointer;
                        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
                    ">🏠 Character Menu</button>
                    
                    <button onclick="game.menuManager.goBack()" style="
                        background: linear-gradient(135deg, #757575, #424242);
                        border: none; color: white; padding: 15px 30px;
                        border-radius: 15px; font-size: 18px; font-weight: bold;
                        cursor: pointer;
                        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
                    ">⬅️ Back</button>
                </div>
            </div>
        `;
        
        // Start the pet farm animation
        this.startPetFarmAnimation();
    }
    
    drawFarmBackground(ctx, backgroundId) {
        const width = 800;
        const height = 500;
        
        switch(backgroundId) {
            case 'beach':
                // Beach gradient
                const beachGradient = ctx.createLinearGradient(0, 0, 0, height);
                beachGradient.addColorStop(0, '#87CEEB'); // Sky blue
                beachGradient.addColorStop(0.5, '#FDB813'); // Sand
                beachGradient.addColorStop(1, '#F4E4C1'); // Light sand
                ctx.fillStyle = beachGradient;
                ctx.fillRect(0, 0, width, height);
                
                // Add some waves
                ctx.fillStyle = 'rgba(0, 119, 190, 0.3)';
                for (let i = 0; i < 3; i++) {
                    ctx.beginPath();
                    ctx.arc(100 + i * 250, height - 50, 80, 0, Math.PI, true);
                    ctx.fill();
                }
                break;
                
            case 'forest':
                // Forest gradient
                const forestGradient = ctx.createLinearGradient(0, 0, 0, height);
                forestGradient.addColorStop(0, '#87CEEB'); // Sky
                forestGradient.addColorStop(0.3, '#228B22'); // Forest green
                forestGradient.addColorStop(1, '#013220'); // Dark green
                ctx.fillStyle = forestGradient;
                ctx.fillRect(0, 0, width, height);
                
                // Add trees
                ctx.fillStyle = 'rgba(34, 139, 34, 0.5)';
                for (let i = 0; i < 5; i++) {
                    const x = 50 + i * 150 + Math.random() * 50;
                    const y = 100 + Math.random() * 50;
                    ctx.beginPath();
                    ctx.moveTo(x, y);
                    ctx.lineTo(x - 30, y + 100);
                    ctx.lineTo(x + 30, y + 100);
                    ctx.closePath();
                    ctx.fill();
                }
                break;
                
            case 'space':
                // Space background
                ctx.fillStyle = '#000033';
                ctx.fillRect(0, 0, width, height);
                
                // Stars
                ctx.fillStyle = 'white';
                for (let i = 0; i < 100; i++) {
                    const x = Math.random() * width;
                    const y = Math.random() * height;
                    const size = Math.random() * 2;
                    ctx.beginPath();
                    ctx.arc(x, y, size, 0, Math.PI * 2);
                    ctx.fill();
                }
                break;
                
            case 'underwater':
                // Underwater gradient
                const waterGradient = ctx.createLinearGradient(0, 0, 0, height);
                waterGradient.addColorStop(0, '#006994');
                waterGradient.addColorStop(1, '#003366');
                ctx.fillStyle = waterGradient;
                ctx.fillRect(0, 0, width, height);
                
                // Bubbles
                ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
                for (let i = 0; i < 20; i++) {
                    const x = Math.random() * width;
                    const y = Math.random() * height;
                    const size = 5 + Math.random() * 15;
                    ctx.beginPath();
                    ctx.arc(x, y, size, 0, Math.PI * 2);
                    ctx.fill();
                }
                break;
                
            case 'castle':
                // Castle garden
                const castleGradient = ctx.createLinearGradient(0, 0, 0, height);
                castleGradient.addColorStop(0, '#87CEEB');
                castleGradient.addColorStop(0.4, '#90EE90');
                castleGradient.addColorStop(1, '#3CB371');
                ctx.fillStyle = castleGradient;
                ctx.fillRect(0, 0, width, height);
                
                // Castle walls
                ctx.fillStyle = '#8B7D6B';
                ctx.fillRect(0, height - 150, width, 150);
                
                // Battlements
                for (let i = 0; i < 8; i++) {
                    ctx.fillRect(i * 100 + 25, height - 180, 50, 30);
                }
                break;
                
            case 'candy':
                // Candy land
                const candyGradient = ctx.createLinearGradient(0, 0, 0, height);
                candyGradient.addColorStop(0, '#FFB6C1');
                candyGradient.addColorStop(0.5, '#FFC0CB');
                candyGradient.addColorStop(1, '#FFE4E1');
                ctx.fillStyle = candyGradient;
                ctx.fillRect(0, 0, width, height);
                
                // Candy decorations
                const candyColors = ['#FF69B4', '#FF1493', '#C71585', '#DB7093'];
                for (let i = 0; i < 10; i++) {
                    ctx.fillStyle = candyColors[i % candyColors.length];
                    const x = Math.random() * width;
                    const y = Math.random() * height * 0.5;
                    ctx.beginPath();
                    ctx.arc(x, y, 20, 0, Math.PI * 2);
                    ctx.fill();
                }
                break;
                
            default:
                // Default farm background
                const gradient = ctx.createLinearGradient(0, 0, 0, height);
                gradient.addColorStop(0, '#8B4513');
                gradient.addColorStop(0.3, '#A0522D');
                gradient.addColorStop(1, '#D2B48C');
                ctx.fillStyle = gradient;
                ctx.fillRect(0, 0, width, height);
                break;
        }
    }
    
    startPetFarmAnimation() {
        const canvas = document.getElementById('petFarmCanvas');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const petFarm = this.game.petFarm;
        
        // Mouse click handling
        canvas.addEventListener('click', (e) => {
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // Check if clicked on a pet
            petFarm.pets.forEach(pet => {
                const distance = Math.sqrt((x - pet.x) ** 2 + (y - pet.y) ** 2);
                if (distance < pet.size / 2) {
                    petFarm.handlePetClick(pet);
                }
            });
        });
        
        // Animation loop
        const animate = () => {
            // Don't animate if not on pet farm menu
            if (this.currentMenu !== 'petFarm') return;
            
            // Clear canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Draw background
            this.drawFarmBackground(ctx, petFarm.currentBackground);
            
            // Update pet positions
            petFarm.updatePets();
            
            // Draw placed items (behind pets)
            petFarm.farmItems.forEach(item => {
                const size = petFarm.getItemSize(item.type);
                ctx.save();
                ctx.translate(item.x, item.y);
                ctx.rotate(item.rotation || 0);
                
                // Draw item shadow
                ctx.globalAlpha = 0.3;
                ctx.fillStyle = 'rgba(0,0,0,0.3)';
                ctx.beginPath();
                ctx.ellipse(0, size/4, size/2, size/4, 0, 0, Math.PI * 2);
                ctx.fill();
                
                // Draw item with animation effects
                ctx.globalAlpha = 1;
                
                // Apply bounce effect for animated toys
                let yOffset = 0;
                if (item.isAnimating && item.type === 'toy') {
                    // Toy is already positioned with animation in updateItemAnimations
                    // No additional offset needed here
                }
                
                // Draw item emoji
                ctx.font = `${size}px Arial`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(item.emoji, 0, yOffset);
                
                // Draw cooldown indicator for treats
                if (item.type === 'consumable' && item.interactionCooldown > Date.now()) {
                    ctx.globalAlpha = 0.5;
                    ctx.fillStyle = 'rgba(0,0,0,0.3)';
                    ctx.beginPath();
                    ctx.arc(0, 0, size/2, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.globalAlpha = 1;
                }
                
                // Draw sleeping z's for occupied furniture
                if (item.type === 'furniture' && item.interactionCooldown > Date.now()) {
                    const time = Date.now() / 1000;
                    ctx.font = '16px Arial';
                    ctx.fillStyle = '#9C27B0';
                    ctx.fillText('💤', size/3, -size/3 + Math.sin(time) * 5);
                }
                
                // Highlight if selected in edit mode
                if (petFarm.isEditMode && petFarm.selectedItem === item) {
                    ctx.strokeStyle = '#4CAF50';
                    ctx.lineWidth = 3;
                    ctx.strokeRect(-size/2, -size/2, size, size);
                }
                
                ctx.restore();
            });
            
            // Draw grass particles
            petFarm.grassParticles.forEach(grass => {
                ctx.globalAlpha = grass.opacity;
                ctx.fillStyle = 'rgba(34, 139, 34, 0.6)';
                ctx.strokeStyle = 'rgba(0, 100, 0, 0.4)';
                ctx.lineWidth = 1;
                
                // Draw grass blade
                ctx.beginPath();
                ctx.ellipse(grass.x, grass.y, grass.size * 0.3, grass.size, grass.sway, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();
            });
            
            ctx.globalAlpha = 1;
            
            // Draw pets
            petFarm.pets.forEach(pet => {
                ctx.save();
                ctx.translate(pet.x, pet.y);
                
                // Draw pet body (rounded rectangle, not circular like fish)
                const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, pet.size / 2);
                gradient.addColorStop(0, pet.color);
                gradient.addColorStop(1, this.darkenColor(pet.color));
                
                ctx.fillStyle = gradient;
                ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
                ctx.lineWidth = 2;
                
                // Draw rounded rectangle instead of circle
                const width = pet.size * 0.8;
                const height = pet.size * 0.6;
                ctx.beginPath();
                ctx.roundRect(-width/2, -height/2, width, height, 8);
                ctx.fill();
                ctx.stroke();
                
                // Draw emoji larger
                ctx.fillStyle = 'black';
                ctx.font = `${pet.size * 0.5}px Arial`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(pet.emoji || '❓', 0, -8);
                
                // Draw letter below emoji
                ctx.fillStyle = 'white';
                ctx.strokeStyle = 'black';
                ctx.lineWidth = 2;
                ctx.font = `bold ${pet.size * 0.3}px Comic Sans MS`;
                ctx.strokeText(pet.letter.toUpperCase(), 0, 8);
                ctx.fillText(pet.letter.toUpperCase(), 0, 8);
                
                // Draw highlight for coin pet
                if (petFarm.coinAvailable && !petFarm.coinEarnedThisVisit && 
                    pet.id === petFarm.selectedPetForCoin?.id) {
                    ctx.strokeStyle = '#FFD700';
                    ctx.lineWidth = 3;
                    ctx.setLineDash([5, 5]);
                    ctx.beginPath();
                    ctx.arc(0, 0, pet.size / 2 + 5, 0, Math.PI * 2);
                    ctx.stroke();
                    ctx.setLineDash([]);
                }
                
                // Draw fins
                ctx.fillStyle = this.darkenColor(pet.color);
                ctx.beginPath();
                ctx.moveTo(-pet.size / 2, 0);
                ctx.lineTo(-pet.size * 0.8, -pet.size * 0.3);
                ctx.lineTo(-pet.size * 0.8, pet.size * 0.3);
                ctx.closePath();
                ctx.fill();
                
                // Draw happiness indicator
                if (pet.happiness < 70) {
                    // Show hunger/tiredness indicator
                    ctx.globalAlpha = 0.8;
                    const indicator = pet.happiness < 50 ? '😢' : '😐';
                    ctx.font = '14px Arial';
                    ctx.fillText(indicator, pet.size/2, -pet.size/2);
                    ctx.globalAlpha = 1;
                } else if (pet.happiness > 90) {
                    // Show happiness sparkles
                    const time = Date.now() / 500;
                    if (Math.sin(time) > 0) {
                        ctx.font = '12px Arial';
                        ctx.fillText('✨', pet.size/3, -pet.size/3);
                    }
                }
                
                ctx.restore();
            });
            
            requestAnimationFrame(animate);
        };
        
        animate();
    }
    
    darkenColor(color) {
        // Simple color darkening
        const num = parseInt(color.slice(1), 16);
        const r = (num >> 16) * 0.7;
        const g = ((num >> 8) & 0x00FF) * 0.7;
        const b = (num & 0x0000FF) * 0.7;
        return `#${Math.floor(r).toString(16).padStart(2, '0')}${Math.floor(g).toString(16).padStart(2, '0')}${Math.floor(b).toString(16).padStart(2, '0')}`;
    }
    
    countPets(character) {
        if (!character.pets || !character.pets.farm) return 0;
        
        let count = 0;
        Object.values(character.pets.farm).forEach(petData => {
            if (Array.isArray(petData)) {
                count += petData.length;
            } else {
                count += 1;
            }
        });
        return count;
    }
    createAchievementsMenu(container, data) { this.createPlaceholder(container, 'Achievements'); }
    createSettingsMenu(container) { this.createPlaceholder(container, 'Settings'); }
    
    createPlaceholder(container, title) {
        container.innerHTML = `
            <div style="text-align: center; max-width: 600px;">
                <h2 style="font-size: 48px; margin-bottom: 30px;">${title}</h2>
                <p style="font-size: 18px; margin-bottom: 30px;">This feature will be implemented soon!</p>
                <button onclick="game.menuManager.goBack()" style="
                    background: linear-gradient(135deg, #757575, #424242);
                    border: none; color: white; padding: 15px 30px;
                    border-radius: 15px; font-size: 18px; font-weight: bold;
                    cursor: pointer;
                ">⬅️ Back</button>
            </div>
        `;
    }
    
    addButtonHoverEffects() {
        const style = document.createElement('style');
        style.textContent = `
            .menu-btn:hover {
                transform: translateY(-2px) scale(1.02);
                filter: brightness(1.1);
            }
            .menu-btn:active {
                transform: translateY(0) scale(0.98);
            }
        `;
        document.head.appendChild(style);
    }
    
    showMultiplayerHost() {
        if (this.game.multiplayerUI) {
            this.hideMenu();
            this.game.multiplayerUI.show();
        } else {
            this.showNotImplemented('Multiplayer Host');
        }
    }
    
    showMultiplayerJoin() {
        if (this.game.multiplayerUI) {
            this.hideMenu();
            this.game.multiplayerUI.show();
            // Automatically show join dialog
            setTimeout(() => this.game.multiplayerUI.showJoinUI(), 100);
        } else {
            this.showNotImplemented('Multiplayer Join');
        }
    }
    
    showMultiplayer() {
        if (this.game.multiplayerUI) {
            this.hideMenu();
            this.game.multiplayerUI.show();
        } else {
            this.showNotImplemented('Multiplayer');
        }
    }
    
    showNotImplemented(feature) {
        alert(`${feature} will be available in a future update! 🚀`);
    }
    
    getChallengeNotification() {
        const availableChallenges = this.game.challengeManager?.getAvailableChallenges().length || 0;
        if (availableChallenges > 0) {
            return `
                <div style="
                    position: absolute;
                    top: 10px;
                    right: 10px;
                    background: #FFC107;
                    color: #333;
                    width: 30px;
                    height: 30px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 16px;
                    font-weight: bold;
                    box-shadow: 0 2px 5px rgba(0,0,0,0.3);
                ">${availableChallenges}</div>
            `;
        }
        return '';
    }
    
    createChallengesMenu(container) {
        // First show available challenges
        const availableChallenges = this.game.challengeManager?.getAvailableChallenges() || [];
        const completedChallenges = this.game.challengeManager?.getCompletedChallenges() || [];
        
        container.innerHTML = `
            <div style="text-align: center; max-width: 800px;">
                <h2 style="font-size: 48px; margin-bottom: 30px; text-shadow: 2px 2px 4px rgba(0,0,0,0.3);">
                    📝 Challenges
                </h2>
                
                <div style="margin-bottom: 30px;">
                    <button onclick="game.menuManager.showCreateChallenge()" style="
                        background: linear-gradient(135deg, #4CAF50, #45a049);
                        border: none;
                        color: white;
                        padding: 15px 30px;
                        border-radius: 15px;
                        font-size: 20px;
                        font-weight: bold;
                        cursor: pointer;
                        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
                    ">🎓 Create Challenge (Teacher)</button>
                </div>
                
                <div style="margin-bottom: 40px;">
                    <h3 style="font-size: 28px; margin-bottom: 20px; opacity: 0.9;">
                        Available Challenges (${availableChallenges.length})
                    </h3>
                    <div style="
                        display: grid;
                        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                        gap: 20px;
                        margin-bottom: 20px;
                    ">
                        ${availableChallenges.length === 0 ? `
                            <div style="
                                grid-column: 1 / -1;
                                padding: 40px;
                                background: rgba(255,255,255,0.1);
                                border-radius: 15px;
                                opacity: 0.7;
                            ">
                                No challenges available. Ask your teacher to create some!
                            </div>
                        ` : availableChallenges.map(challenge => `
                            <div style="
                                background: rgba(255,255,255,0.1);
                                border-radius: 15px;
                                padding: 20px;
                                backdrop-filter: blur(10px);
                                cursor: pointer;
                                transition: all 0.3s;
                            " onclick="game.challengeManager.startChallenge('${challenge.id}')">
                                <h4 style="font-size: 24px; margin-bottom: 10px;">${challenge.name}</h4>
                                <p style="opacity: 0.8; margin-bottom: 15px; height: 60px; overflow: hidden;">
                                    ${challenge.description || 'Complete this pen and paper challenge!'}
                                </p>
                                <div style="
                                    background: rgba(76, 175, 80, 0.2);
                                    padding: 10px;
                                    border-radius: 8px;
                                    font-size: 14px;
                                ">
                                    ${this.getChallengeRewardPreview(challenge.rewards)}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                ${completedChallenges.length > 0 ? `
                    <div>
                        <h3 style="font-size: 28px; margin-bottom: 20px; opacity: 0.9;">
                            Completed Challenges (${completedChallenges.length})
                        </h3>
                        <div style="
                            display: grid;
                            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                            gap: 20px;
                            opacity: 0.6;
                        ">
                            ${completedChallenges.map(challenge => `
                                <div style="
                                    background: rgba(255,255,255,0.05);
                                    border-radius: 15px;
                                    padding: 20px;
                                    position: relative;
                                ">
                                    <div style="
                                        position: absolute;
                                        top: 10px;
                                        right: 10px;
                                        background: #4CAF50;
                                        color: white;
                                        padding: 5px 10px;
                                        border-radius: 20px;
                                        font-size: 12px;
                                    ">✅ Completed</div>
                                    <h4 style="font-size: 24px; margin-bottom: 10px;">${challenge.name}</h4>
                                    <p style="opacity: 0.8;">
                                        ${challenge.description || 'Challenge completed!'}
                                    </p>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
                
                <button onclick="game.menuManager.showMenu('character')" style="
                    background: linear-gradient(135deg, #f44336, #d32f2f);
                    border: none; color: white; padding: 15px 30px;
                    border-radius: 15px; font-size: 20px; font-weight: bold;
                    cursor: pointer; margin-top: 30px;
                    box-shadow: 0 5px 15px rgba(0,0,0,0.2);
                ">🔙 Back</button>
            </div>
        `;
    }
    
    getChallengeRewardPreview(rewards) {
        const items = [];
        if (rewards.xp > 0) items.push(`⭐ ${rewards.xp} XP`);
        if (rewards.coins > 0) items.push(`🪙 ${rewards.coins} Coins`);
        if (rewards.skins?.length > 0) items.push(`👕 ${rewards.skins.length} Skins`);
        if (rewards.pets?.length > 0) items.push(`🐾 ${rewards.pets.length} Pets`);
        return items.join(' • ') || 'Complete for rewards!';
    }
    
    showCreateChallenge() {
        // Show PIN dialog first
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0, 0, 0, 0.9);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 7000;
        `;
        
        modal.innerHTML = `
            <div style="
                background: white;
                max-width: 400px;
                width: 90%;
                padding: 40px;
                border-radius: 16px;
                text-align: center;
            ">
                <h2 style="color: #1976D2; margin-bottom: 20px;">
                    🎓 Teacher Access Required
                </h2>
                
                <p style="color: #666; margin-bottom: 20px;">
                    Enter teacher PIN to create a challenge
                </p>
                
                <input type="password" id="createChallengePinInput" placeholder="Teacher PIN" style="
                    width: 200px;
                    padding: 12px;
                    border: 2px solid #ddd;
                    border-radius: 8px;
                    font-size: 18px;
                    text-align: center;
                    margin-bottom: 20px;
                " maxlength="4" />
                
                <div style="display: flex; gap: 10px; justify-content: center;">
                    <button id="verifyCreateBtn" style="
                        background: #4CAF50;
                        color: white;
                        border: none;
                        padding: 10px 20px;
                        border-radius: 8px;
                        font-size: 16px;
                        cursor: pointer;
                    ">Verify</button>
                    
                    <button id="cancelPinBtn" style="
                        background: #f44336;
                        color: white;
                        border: none;
                        padding: 10px 20px;
                        border-radius: 8px;
                        font-size: 16px;
                        cursor: pointer;
                    ">Cancel</button>
                </div>
                
                <p id="createChallengeError" style="
                    color: #f44336;
                    margin-top: 15px;
                    display: none;
                ">Incorrect PIN. Please try again.</p>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        const input = document.getElementById('createChallengePinInput');
        input.focus();
        
        // Only allow numbers
        input.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/[^0-9]/g, '');
        });
        
        const verify = () => {
            const pin = input.value;
            if (this.game.teacherAuth?.validatePin(pin)) {
                modal.remove();
                this.showChallengeCreator();
            } else {
                document.getElementById('createChallengeError').style.display = 'block';
                input.value = '';
                input.focus();
            }
        };
        
        document.getElementById('verifyCreateBtn').addEventListener('click', verify);
        document.getElementById('cancelPinBtn').addEventListener('click', () => {
            modal.remove();
        });
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') verify();
        });
    }
    
    showCustomizeMenu() {
        const character = this.game.dataManager?.getCurrentCharacter();
        if (!character) {
            alert('No character selected!');
            return;
        }
        
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0, 0, 0, 0.9);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 6000;
        `;
        
        const modalContent = document.createElement('div');
        modalContent.style.cssText = `
            background: white;
            max-width: 800px;
            width: 90%;
            padding: 40px;
            border-radius: 20px;
            max-height: 90vh;
            overflow-y: auto;
            text-align: center;
        `;
        
        modalContent.innerHTML = `
            <h2 style="color: #00BCD4; margin-bottom: 30px; font-size: 36px;">
                🎨 Customize Your Character
            </h2>
            
            <div style="display: flex; gap: 30px; justify-content: center; margin-bottom: 30px;">
                <button id="skinTabBtn" class="tab-btn" style="
                    background: #00BCD4;
                    color: white;
                    border: none;
                    padding: 12px 30px;
                    border-radius: 12px;
                    font-size: 18px;
                    cursor: pointer;
                ">👕 Skins</button>
                
                <button id="hatTabBtn" class="tab-btn" style="
                    background: rgba(0,0,0,0.1);
                    color: #333;
                    border: none;
                    padding: 12px 30px;
                    border-radius: 12px;
                    font-size: 18px;
                    cursor: pointer;
                ">🎩 Hats</button>
            </div>
            
            <div id="customizeContent"></div>
            
            <button id="closeCustomizeBtn" style="
                background: #666;
                color: white;
                border: none;
                padding: 15px 40px;
                border-radius: 12px;
                font-size: 18px;
                font-weight: bold;
                cursor: pointer;
                margin-top: 20px;
            ">Close</button>
        `;
        
        modal.appendChild(modalContent);
        document.body.appendChild(modal);
        
        // Tab functionality
        let currentTab = 'skins';
        
        const showSkinTab = () => {
            currentTab = 'skins';
            document.getElementById('skinTabBtn').style.background = '#00BCD4';
            document.getElementById('skinTabBtn').style.color = 'white';
            document.getElementById('hatTabBtn').style.background = 'rgba(0,0,0,0.1)';
            document.getElementById('hatTabBtn').style.color = '#333';
            
            const content = document.getElementById('customizeContent');
            
            // Get all available skins
            const defaultSkins = this.game.dataManager?.availableAvatars || ['😀', '😊', '🙂', '😄', '😎', '🤓', '😇', '🥰', '😋', '🤗'];
            const unlockedSkins = character.unlockedSkins || [];
            const shopSkins = [];
            
            if (character.shopData?.purchasedSkins) {
                const skinDefinitions = {
                    // Cheap tier
                    'happy': '😊',
                    'cool': '😎',
                    'wink': '😉',
                    'heart_eyes': '😍',
                    'star_eyes': '🤩',
                    'nerd': '🤓',
                    'angel': '😇',
                    'devil': '😈',
                    'clown': '🤡',
                    'ghost': '👻',
                    'alien': '👽',
                    'robot_face': '🤖',
                    'pumpkin': '🎃',
                    'skull': '💀',
                    // Mid tier
                    'knight': '⚔️',
                    'wizard': '🧙',
                    'ninja': '🥷',
                    'astronaut': '🚀',
                    'pirate': '🏴‍☠️',
                    'robot': '🤖',
                    'dinosaur': '🦕',
                    'unicorn': '🦄',
                    // High tier
                    'dragon': '🐉',
                    'phoenix': '🔥',
                    'mermaid': '🧜',
                    'fairy': '🧚',
                    'superhero': '🦸',
                    'vampire': '🧛',
                    'genie': '🧞',
                    'zombie': '🧟',
                    // Legendary tier
                    'rainbow': '🌈',
                    'galaxy': '🌌',
                    'lightning': '⚡',
                    'crystal': '💎',
                    'golden': '✨',
                    'mystic': '🔮',
                    'cosmic': '💫',
                    'legendary': '🌟'
                };
                character.shopData.purchasedSkins.forEach(skinId => {
                    if (skinDefinitions[skinId]) {
                        shopSkins.push(skinDefinitions[skinId]);
                    }
                });
            }
            
            const allSkins = [...new Set([...defaultSkins, ...unlockedSkins, ...shopSkins])];
            const currentSkin = character.customization?.activeSkin || character.identity.avatar;
            
            content.innerHTML = `
                <div style="
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 30px;
                    margin-bottom: 30px;
                    background: #F5F5F5;
                    padding: 20px;
                    border-radius: 16px;
                ">
                    <div>
                        <p style="margin-bottom: 10px; color: #666;">Current</p>
                        <div style="font-size: 80px;">${currentSkin}</div>
                    </div>
                    <div style="font-size: 48px; color: #666;">→</div>
                    <div>
                        <p style="margin-bottom: 10px; color: #666;">Preview</p>
                        <div style="font-size: 80px;" id="skinPreview">${currentSkin}</div>
                    </div>
                </div>
                
                <div style="
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
                    gap: 10px;
                    max-width: 600px;
                    margin: 0 auto;
                ">
                    ${allSkins.map(skin => `
                        <button class="skin-option" data-skin="${skin}" style="
                            font-size: 48px;
                            padding: 15px;
                            background: ${skin === currentSkin ? '#00BCD4' : 'white'};
                            border: 3px solid ${skin === currentSkin ? '#00BCD4' : '#ddd'};
                            border-radius: 12px;
                            cursor: pointer;
                            transition: all 0.2s;
                        ">${skin}</button>
                    `).join('')}
                </div>
            `;
            
            // Add skin click handlers
            content.querySelectorAll('.skin-option').forEach(btn => {
                btn.addEventListener('click', () => {
                    const skin = btn.dataset.skin;
                    document.getElementById('skinPreview').textContent = skin;
                    
                    // Update visual state
                    content.querySelectorAll('.skin-option').forEach(b => {
                        b.style.background = 'white';
                        b.style.borderColor = '#ddd';
                    });
                    btn.style.background = '#E1F5FE';
                    btn.style.borderColor = '#00BCD4';
                    
                    // Apply skin
                    character.customization = character.customization || {};
                    character.customization.activeSkin = skin;
                    character.identity.avatar = skin;
                    
                    this.game.dataManager.markDirty();
                    this.game.dataManager.save();
                });
            });
        };
        
        const showHatTab = () => {
            currentTab = 'hats';
            document.getElementById('hatTabBtn').style.background = '#00BCD4';
            document.getElementById('hatTabBtn').style.color = 'white';
            document.getElementById('skinTabBtn').style.background = 'rgba(0,0,0,0.1)';
            document.getElementById('skinTabBtn').style.color = '#333';
            
            const content = document.getElementById('customizeContent');
            
            const hatDefinitions = {
                'none': { emoji: '❌', name: 'No Hat' },
                // Cheap tier
                'headband': { emoji: '🎗️', name: 'Headband' },
                'bandana': { emoji: '🏴', name: 'Bandana' },
                'flower': { emoji: '🌸', name: 'Flower' },
                'sunflower': { emoji: '🌻', name: 'Sunflower' },
                'cap': { emoji: '🧢', name: 'Baseball Cap' },
                'beret': { emoji: '🎨', name: 'Artist Beret' },
                'headphones': { emoji: '🎧', name: 'Headphones' },
                'bow': { emoji: '🎀', name: 'Bow' },
                'glasses': { emoji: '👓', name: 'Glasses' },
                'sunglasses': { emoji: '🕶️', name: 'Sunglasses' },
                // Mid tier
                'party': { emoji: '🥳', name: 'Party Hat' },
                'tophat': { emoji: '🎩', name: 'Top Hat' },
                'cowboy': { emoji: '🤠', name: 'Cowboy Hat' },
                'crown': { emoji: '👑', name: 'Crown' },
                'graduation': { emoji: '🎓', name: 'Graduation Cap' },
                'santa': { emoji: '🎅', name: 'Santa Hat' },
                'pirate_hat': { emoji: '🏴‍☠️', name: 'Pirate Hat' },
                'wizard_hat': { emoji: '🧙‍♂️', name: 'Wizard Hat' },
                // High tier
                'viking': { emoji: '⛑️', name: 'Viking Helmet' },
                'knight_helm': { emoji: '🛡️', name: 'Knight Helmet' },
                'halo': { emoji: '😇', name: 'Halo' },
                'horns': { emoji: '😈', name: 'Devil Horns' },
                'antlers': { emoji: '🦌', name: 'Antlers' },
                'unicorn_horn': { emoji: '🦄', name: 'Unicorn Horn' },
                'golden_crown': { emoji: '👑', name: 'Golden Crown' },
                'diamond_tiara': { emoji: '💎', name: 'Diamond Tiara' },
                // Legendary tier
                'flame_crown': { emoji: '🔥', name: 'Flame Crown' },
                'ice_crown': { emoji: '❄️', name: 'Ice Crown' },
                'rainbow_halo': { emoji: '🌈', name: 'Rainbow Halo' },
                'star_crown': { emoji: '⭐', name: 'Star Crown' },
                'cosmic_helm': { emoji: '🌌', name: 'Cosmic Helm' },
                'legendary_crown': { emoji: '👑', name: 'Legendary Crown' }
            };
            
            const ownedHats = ['none', ...(character.shopData?.purchasedHats || [])];
            const currentHat = character.shopData?.equippedHat || 'none';
            
            content.innerHTML = `
                <div style="
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 30px;
                    margin-bottom: 30px;
                    background: #F5F5F5;
                    padding: 20px;
                    border-radius: 16px;
                ">
                    <div>
                        <p style="margin-bottom: 10px; color: #666;">Current Hat</p>
                        <div style="font-size: 60px;">${hatDefinitions[currentHat]?.emoji || '❌'}</div>
                    </div>
                    <div>
                        <p style="margin-bottom: 10px; color: #666;">Your Character</p>
                        <div style="position: relative; display: inline-block;">
                            <div style="font-size: 60px;">${character.identity.avatar}</div>
                            <div id="hatPreview" style="
                                position: absolute;
                                top: -20px;
                                left: 50%;
                                transform: translateX(-50%);
                                font-size: 40px;
                            ">${currentHat !== 'none' ? hatDefinitions[currentHat]?.emoji : ''}</div>
                        </div>
                    </div>
                </div>
                
                <div style="
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
                    gap: 15px;
                    max-width: 600px;
                    margin: 0 auto;
                ">
                    ${Object.entries(hatDefinitions).map(([hatId, hat]) => {
                        const owned = ownedHats.includes(hatId);
                        const equipped = hatId === currentHat;
                        
                        return `
                            <button class="hat-option" data-hat="${hatId}" style="
                                background: ${equipped ? '#00BCD4' : owned ? 'white' : '#F5F5F5'};
                                border: 3px solid ${equipped ? '#00BCD4' : owned ? '#ddd' : '#ccc'};
                                border-radius: 12px;
                                padding: 15px;
                                cursor: ${owned ? 'pointer' : 'not-allowed'};
                                opacity: ${owned ? '1' : '0.5'};
                                transition: all 0.2s;
                            " ${!owned ? 'disabled' : ''}>
                                <div style="font-size: 36px;">${hat.emoji}</div>
                                <div style="font-size: 14px; margin-top: 5px;">${hat.name}</div>
                                ${!owned && hatId !== 'none' ? '<div style="font-size: 12px; color: #666;">Shop</div>' : ''}
                            </button>
                        `;
                    }).join('')}
                </div>
            `;
            
            // Add hat click handlers
            content.querySelectorAll('.hat-option:not([disabled])').forEach(btn => {
                btn.addEventListener('click', () => {
                    const hatId = btn.dataset.hat;
                    
                    // Update preview
                    const preview = document.getElementById('hatPreview');
                    preview.textContent = hatId !== 'none' ? hatDefinitions[hatId]?.emoji : '';
                    
                    // Update visual state
                    content.querySelectorAll('.hat-option').forEach(b => {
                        if (!b.disabled) {
                            b.style.background = 'white';
                            b.style.borderColor = '#ddd';
                        }
                    });
                    btn.style.background = '#E1F5FE';
                    btn.style.borderColor = '#00BCD4';
                    
                    // Apply hat
                    if (!character.shopData) {
                        character.shopData = {};
                    }
                    character.shopData.equippedHat = hatId === 'none' ? null : hatId;
                    
                    this.game.dataManager.markDirty();
                    this.game.dataManager.save();
                });
            });
        };
        
        // Event listeners
        document.getElementById('skinTabBtn').addEventListener('click', showSkinTab);
        document.getElementById('hatTabBtn').addEventListener('click', showHatTab);
        document.getElementById('closeCustomizeBtn').addEventListener('click', () => {
            modal.remove();
            // Refresh character menu
            this.showMenu('character');
        });
        
        // Show skins tab by default
        showSkinTab();
    }
    
    showSkinSelector() {
        const character = this.game.dataManager?.getCurrentCharacter();
        if (!character) {
            alert('No character selected!');
            return;
        }
        
        // Get all available skins
        const defaultSkins = this.game.dataManager?.availableAvatars || ['😀', '😊', '🙂', '😄', '😎', '🤓', '😇', '🥰', '😋', '🤗'];
        const unlockedSkins = character.unlockedSkins || [];
        
        // Add purchased skins from shop
        const shopSkins = [];
        if (character.shopData?.purchasedSkins) {
            const skinDefinitions = {
                'knight': '⚔️',
                'wizard': '🧙',
                'ninja': '🥷',
                'astronaut': '🚀',
                'pirate': '🏴‍☠️',
                'robot': '🤖',
                'dinosaur': '🦕',
                'unicorn': '🦄'
            };
            character.shopData.purchasedSkins.forEach(skinId => {
                if (skinDefinitions[skinId]) {
                    shopSkins.push(skinDefinitions[skinId]);
                }
            });
        }
        
        const allSkins = [...new Set([...defaultSkins, ...unlockedSkins, ...shopSkins])];
        const currentSkin = character.customization?.activeSkin || character.identity.avatar;
        
        // Create modal
        const modal = document.createElement('div');
        modal.id = 'skinSelectorModal';
        modal.style.cssText = `
            position: fixed;
            top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0, 0, 0, 0.9);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 6000;
            overflow-y: auto;
        `;
        
        const modalContent = document.createElement('div');
        modalContent.style.cssText = `
            background: white;
            max-width: 800px;
            width: 90%;
            padding: 40px;
            border-radius: 20px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.3);
            text-align: center;
            max-height: 90vh;
            overflow-y: auto;
        `;
        
        modalContent.innerHTML = `
            <h2 style="color: #00BCD4; margin-bottom: 10px; font-size: 36px;">
                🎨 Choose Your Look
            </h2>
            <p style="color: #666; margin-bottom: 30px; font-size: 18px;">
                Select a skin to customize your character
            </p>
            
            <div style="
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 30px;
                margin-bottom: 30px;
                background: #F5F5F5;
                padding: 20px;
                border-radius: 16px;
            ">
                <div style="font-size: 80px;" id="currentSkinDisplay">${currentSkin}</div>
                <div style="font-size: 48px; color: #666;">→</div>
                <div style="font-size: 80px;" id="selectedSkinDisplay">${currentSkin}</div>
            </div>
            
            <div style="margin-bottom: 30px;">
                <h3 style="color: #333; margin-bottom: 15px;">Available Skins</h3>
                <div id="skinGrid" style="
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
                    gap: 10px;
                    max-width: 600px;
                    margin: 0 auto;
                ">
                    ${allSkins.map(skin => `
                        <button class="skin-option" data-skin="${skin}" style="
                            font-size: 48px;
                            padding: 15px;
                            background: ${skin === currentSkin ? '#00BCD4' : 'white'};
                            border: 3px solid ${skin === currentSkin ? '#00BCD4' : '#ddd'};
                            border-radius: 12px;
                            cursor: pointer;
                            transition: all 0.2s;
                        ">${skin}</button>
                    `).join('')}
                </div>
            </div>
            
            <div style="display: flex; gap: 15px; justify-content: center;">
                <button id="applySkinBtn" style="
                    background: #00BCD4;
                    color: white;
                    border: none;
                    padding: 15px 40px;
                    border-radius: 12px;
                    font-size: 18px;
                    font-weight: bold;
                    cursor: pointer;
                ">Apply</button>
                
                <button id="cancelSkinBtn" style="
                    background: #666;
                    color: white;
                    border: none;
                    padding: 15px 40px;
                    border-radius: 12px;
                    font-size: 18px;
                    font-weight: bold;
                    cursor: pointer;
                ">Cancel</button>
            </div>
        `;
        
        modal.appendChild(modalContent);
        document.body.appendChild(modal);
        
        // Track selected skin
        let selectedSkin = currentSkin;
        
        // Add event listeners
        modalContent.querySelectorAll('.skin-option').forEach(btn => {
            btn.addEventListener('click', () => {
                // Update selection
                selectedSkin = btn.dataset.skin;
                
                // Update visual state
                modalContent.querySelectorAll('.skin-option').forEach(b => {
                    b.style.background = 'white';
                    b.style.borderColor = '#ddd';
                });
                btn.style.background = '#E1F5FE';
                btn.style.borderColor = '#00BCD4';
                
                // Update preview
                document.getElementById('selectedSkinDisplay').textContent = selectedSkin;
            });
        });
        
        document.getElementById('applySkinBtn').addEventListener('click', () => {
            // Apply the selected skin
            if (!character.customization) {
                character.customization = {};
            }
            character.customization.activeSkin = selectedSkin;
            character.identity.avatar = selectedSkin;
            
            // Save the changes
            this.game.dataManager.markDirty();
            this.game.dataManager.save();
            
            // Show success message
            const successMsg = document.createElement('div');
            successMsg.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: #4CAF50;
                color: white;
                padding: 20px 40px;
                border-radius: 12px;
                font-size: 18px;
                font-weight: bold;
                z-index: 10000;
                box-shadow: 0 4px 20px rgba(0,0,0,0.3);
            `;
            successMsg.textContent = '✅ Skin applied successfully!';
            document.body.appendChild(successMsg);
            
            setTimeout(() => {
                successMsg.remove();
                modal.remove();
                // Refresh character menu to show new skin
                this.showMenu('character');
            }, 1500);
        });
        
        document.getElementById('cancelSkinBtn').addEventListener('click', () => {
            modal.remove();
        });
    }
    
    showFarmInventory() {
        const character = this.game.dataManager?.getCurrentCharacter();
        if (!character || !character.shopData) {
            alert('No items available!');
            return;
        }
        
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0, 0, 0, 0.9);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 6000;
        `;
        
        const modalContent = document.createElement('div');
        modalContent.style.cssText = `
            background: white;
            max-width: 600px;
            width: 90%;
            padding: 30px;
            border-radius: 20px;
            max-height: 80vh;
            overflow-y: auto;
        `;
        
        // Get purchased pet items
        const petItems = character.shopData.purchasedPetItems || [];
        const itemDefinitions = {
            // Consumables
            'treat_basic': { emoji: '🍖', name: 'Pet Treat', type: 'consumable' },
            'treat_premium': { emoji: '🍗', name: 'Premium Treat', type: 'consumable' },
            
            // Furniture
            'water_bowl': { emoji: '🥤', name: 'Water Bowl', type: 'furniture' },
            'food_bowl': { emoji: '🍜', name: 'Food Bowl', type: 'furniture' },
            'pet_mat': { emoji: '🟦', name: 'Pet Mat', type: 'furniture' },
            'bed_small': { emoji: '🛏️', name: 'Small Bed', type: 'furniture' },
            'bed_luxury': { emoji: '🛋️', name: 'Luxury Bed', type: 'furniture' },
            'house_small': { emoji: '🏠', name: 'Small House', type: 'furniture' },
            'house_large': { emoji: '🏡', name: 'Large House', type: 'furniture' },
            'scratching_post': { emoji: '🪵', name: 'Scratching Post', type: 'furniture' },
            'toy_tunnel': { emoji: '🚇', name: 'Play Tunnel', type: 'furniture' },
            'cat_tower': { emoji: '🗼', name: 'Cat Tower', type: 'furniture' },
            'playground': { emoji: '🎪', name: 'Pet Playground', type: 'furniture' },
            'fountain': { emoji: '⛲', name: 'Pet Fountain', type: 'furniture' },
            'pool': { emoji: '🏊', name: 'Swimming Pool', type: 'furniture' },
            'garden': { emoji: '🌻', name: 'Pet Garden', type: 'furniture' },
            'treehouse': { emoji: '🌳', name: 'Tree House', type: 'furniture' },
            'castle_pet': { emoji: '🏰', name: 'Pet Castle', type: 'furniture' },
            'spa': { emoji: '🧖', name: 'Pet Spa', type: 'furniture' },
            'mansion': { emoji: '🏛️', name: 'Pet Mansion', type: 'furniture' },
            'yacht': { emoji: '🛥️', name: 'Pet Yacht', type: 'furniture' },
            'helicopter': { emoji: '🚁', name: 'Pet Helicopter', type: 'furniture' },
            'rocket': { emoji: '🚀', name: 'Pet Rocket', type: 'furniture' },
            'palace': { emoji: '🏯', name: 'Golden Palace', type: 'furniture' },
            'paradise': { emoji: '🏝️', name: 'Pet Paradise', type: 'furniture' },
            
            // Toys
            'stick': { emoji: '🦴', name: 'Stick', type: 'toy' },
            'toy_mouse': { emoji: '🐭', name: 'Toy Mouse', type: 'toy' },
            'toy_ball': { emoji: '⚽', name: 'Play Ball', type: 'toy' },
            'rope_toy': { emoji: '🪢', name: 'Rope Toy', type: 'toy' },
            'toy_bone': { emoji: '🦴', name: 'Chew Bone', type: 'toy' },
            'squeaky_toy': { emoji: '🦆', name: 'Squeaky Duck', type: 'toy' },
            'toy_frisbee': { emoji: '🥏', name: 'Frisbee', type: 'toy' }
        };
        
        modalContent.innerHTML = `
            <h2 style="text-align: center; color: #9C27B0; margin-bottom: 20px;">
                📦 Farm Inventory
            </h2>
            
            <div style="
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
                gap: 15px;
                margin-bottom: 20px;
            ">
                ${petItems.map(itemId => {
                    const item = itemDefinitions[itemId];
                    if (!item) return '';
                    
                    return `
                        <div class="inventory-item" data-item-id="${itemId}" style="
                            background: #F5F5F5;
                            border: 2px solid #9C27B0;
                            border-radius: 12px;
                            padding: 15px;
                            text-align: center;
                            cursor: pointer;
                            transition: all 0.2s;
                        ">
                            <div style="font-size: 36px; margin-bottom: 5px;">${item.emoji}</div>
                            <div style="font-size: 14px; font-weight: bold;">${item.name}</div>
                            <div style="font-size: 12px; color: #666;">${item.type}</div>
                        </div>
                    `;
                }).join('')}
            </div>
            
            ${petItems.length === 0 ? `
                <p style="text-align: center; color: #666;">
                    No items yet! Visit the store to buy items for your pets.
                </p>
            ` : `
                <p style="text-align: center; color: #666; font-size: 14px;">
                    Click an item to place it in the farm (when in edit mode)
                </p>
            `}
            
            <button id="closeFarmInventory" style="
                display: block;
                margin: 0 auto;
                background: #666;
                color: white;
                border: none;
                padding: 10px 30px;
                border-radius: 8px;
                cursor: pointer;
            ">Close</button>
        `;
        
        modal.appendChild(modalContent);
        document.body.appendChild(modal);
        
        // Add item click handlers
        modalContent.querySelectorAll('.inventory-item').forEach(item => {
            item.addEventListener('click', () => {
                const itemId = item.dataset.itemId;
                const itemDef = itemDefinitions[itemId];
                if (this.game.petFarm?.isEditMode) {
                    this.game.petFarm.placeItem(itemId, itemDef);
                    modal.remove();
                } else {
                    alert('Enable Edit Mode first to place items!');
                }
            });
        });
        
        document.getElementById('closeFarmInventory').addEventListener('click', () => {
            modal.remove();
        });
    }
    
    showBackgroundSelector() {
        const character = this.game.dataManager?.getCurrentCharacter();
        if (!character) return;
        
        if (!character.shopData) {
            character.shopData = {
                purchasedBackgrounds: [],
                equippedBackground: 'default'
            };
        }
        
        const backgrounds = [
            { id: 'default', name: 'Default Farm', emoji: '🌾', owned: true },
            { id: 'beach', name: 'Beach Paradise', emoji: '🏖️', owned: character.shopData.purchasedBackgrounds?.includes('beach') },
            { id: 'forest', name: 'Forest Glade', emoji: '🌲', owned: character.shopData.purchasedBackgrounds?.includes('forest') },
            { id: 'space', name: 'Outer Space', emoji: '🌌', owned: character.shopData.purchasedBackgrounds?.includes('space') },
            { id: 'underwater', name: 'Underwater', emoji: '🌊', owned: character.shopData.purchasedBackgrounds?.includes('underwater') },
            { id: 'castle', name: 'Castle Garden', emoji: '🏰', owned: character.shopData.purchasedBackgrounds?.includes('castle') },
            { id: 'candy', name: 'Candy Land', emoji: '🍭', owned: character.shopData.purchasedBackgrounds?.includes('candy') }
        ];
        
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0, 0, 0, 0.9);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 6000;
        `;
        
        const modalContent = document.createElement('div');
        modalContent.style.cssText = `
            background: white;
            max-width: 600px;
            width: 90%;
            padding: 30px;
            border-radius: 20px;
            max-height: 80vh;
            overflow-y: auto;
        `;
        
        const currentBg = character.shopData.equippedBackground || 'default';
        
        modalContent.innerHTML = `
            <h2 style="text-align: center; color: #00BCD4; margin-bottom: 20px;">
                🌈 Select Background
            </h2>
            
            <div style="
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
                gap: 15px;
                margin-bottom: 20px;
            ">
                ${backgrounds.map(bg => `
                    <div class="bg-option" data-bg-id="${bg.id}" style="
                        background: ${bg.id === currentBg ? '#E1F5FE' : '#F5F5F5'};
                        border: 3px solid ${bg.id === currentBg ? '#00BCD4' : '#ddd'};
                        border-radius: 12px;
                        padding: 15px;
                        text-align: center;
                        cursor: ${bg.owned ? 'pointer' : 'not-allowed'};
                        opacity: ${bg.owned ? '1' : '0.5'};
                        transition: all 0.2s;
                    ">
                        <div style="font-size: 48px; margin-bottom: 5px;">${bg.emoji}</div>
                        <div style="font-weight: bold; margin-bottom: 5px;">${bg.name}</div>
                        <div style="font-size: 14px; color: ${bg.owned ? '#4CAF50' : '#666'};">
                            ${bg.owned ? '✓ Owned' : 'Locked'}
                        </div>
                        ${bg.id === currentBg ? '<div style="color: #00BCD4; font-size: 12px; margin-top: 5px;">Current</div>' : ''}
                    </div>
                `).join('')}
            </div>
            
            <button id="closeBackgroundSelector" style="
                display: block;
                margin: 0 auto;
                background: #666;
                color: white;
                border: none;
                padding: 10px 30px;
                border-radius: 8px;
                cursor: pointer;
            ">Close</button>
        `;
        
        modal.appendChild(modalContent);
        document.body.appendChild(modal);
        
        // Add background click handlers
        modalContent.querySelectorAll('.bg-option').forEach(bgElement => {
            bgElement.addEventListener('click', () => {
                const bgId = bgElement.dataset.bgId;
                const bg = backgrounds.find(b => b.id === bgId);
                
                if (bg.owned) {
                    character.shopData.equippedBackground = bgId;
                    this.game.dataManager.markDirty();
                    this.game.dataManager.save();
                    
                    // Update pet farm background
                    if (this.game.petFarm) {
                        this.game.petFarm.currentBackground = bgId;
                    }
                    
                    modal.remove();
                    
                    // Refresh display
                    alert(`Background changed to ${bg.name}!`);
                }
            });
        });
        
        document.getElementById('closeBackgroundSelector').addEventListener('click', () => {
            modal.remove();
        });
    }
    
    showChallengeCreator() {
        // Premium avatars that can be unlocked
        const premiumAvatars = this.game.dataManager?.premiumAvatars || [
            '🦸‍♀️', '🦸‍♂️', '🧙‍♀️', '🧙‍♂️', '🦄', '🦊', '🐰', '🐼', '🦁', '🐸',
            '🐯', '🐨', '🐵', '🦒', '🦩', '🦜', '🦅', '🦋', '🐲', '🦕',
            '🎃', '👻', '🤖', '👽', '👑', '🎩', '🧸', '🎪', '🎨', '🎭',
            '⚽', '🏀', '🏈', '⚾', '🎾', '🏐', '🏓', '🥊', '🎳', '🏹',
            '🚀', '✈️', '🚁', '🚂', '🚗', '🏎️', '🚓', '🚑', '🚒', '🛸'
        ];
        
        // Show challenge creation form
        const modal = document.createElement('div');
        modal.id = 'challengeCreatorModal';
        modal.style.cssText = `
            position: fixed;
            top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0, 0, 0, 0.95);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 7000;
            overflow: auto;
            padding: 20px;
        `;
        
        const modalContent = document.createElement('div');
        modalContent.style.cssText = `
            background: white;
            max-width: 700px;
            width: 100%;
            max-height: 90vh;
            padding: 40px;
            border-radius: 16px;
            overflow-y: auto;
            position: relative;
        `;
        
        modalContent.innerHTML = `
            <h2 style="color: #1976D2; margin-bottom: 30px; text-align: center;">
                📝 Create New Challenge
            </h2>
            
            <div style="margin-bottom: 20px;">
                <label style="display: block; color: #666; margin-bottom: 5px;">
                    Challenge Name <span style="color: #f44336;">*</span>
                </label>
                <input type="text" id="challengeName" placeholder="e.g., Practice Letter A" style="
                    width: 100%;
                    padding: 12px;
                    border: 2px solid #ddd;
                    border-radius: 8px;
                    font-size: 16px;
                    box-sizing: border-box;
                " />
            </div>
            
            <div style="margin-bottom: 20px;">
                <label style="display: block; color: #666; margin-bottom: 5px;">
                    Description <span style="font-size: 12px; color: #999;">(optional)</span>
                </label>
                <input type="text" id="challengeDescription" placeholder="Brief description" style="
                    width: 100%;
                    padding: 12px;
                    border: 2px solid #ddd;
                    border-radius: 8px;
                    font-size: 16px;
                    box-sizing: border-box;
                " />
            </div>
            
            <div style="margin-bottom: 20px;">
                <label style="display: block; color: #666; margin-bottom: 5px;">
                    Instructions <span style="font-size: 12px; color: #999;">(optional)</span>
                </label>
                <textarea id="challengeInstructions" placeholder="Step-by-step instructions for the student..." style="
                    width: 100%;
                    height: 120px;
                    padding: 12px;
                    border: 2px solid #ddd;
                    border-radius: 8px;
                    font-size: 16px;
                    resize: vertical;
                    box-sizing: border-box;
                    font-family: inherit;
                "></textarea>
            </div>
            
            <div style="
                background: #F5F5F5;
                padding: 20px;
                border-radius: 12px;
                margin-bottom: 20px;
            ">
                <h3 style="color: #333; margin-bottom: 15px;">🎁 Rewards</h3>
                
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-bottom: 20px;">
                    <div>
                        <label style="display: block; color: #666; margin-bottom: 5px;">XP Points</label>
                        <input type="number" id="rewardXP" value="50" min="0" max="1000" style="
                            width: 100%;
                            padding: 10px;
                            border: 2px solid #ddd;
                            border-radius: 8px;
                            font-size: 16px;
                            box-sizing: border-box;
                        " />
                    </div>
                    
                    <div>
                        <label style="display: block; color: #666; margin-bottom: 5px;">Coins</label>
                        <input type="number" id="rewardCoins" value="100" min="0" max="10000" style="
                            width: 100%;
                            padding: 10px;
                            border: 2px solid #ddd;
                            border-radius: 8px;
                            font-size: 16px;
                            box-sizing: border-box;
                        " />
                    </div>
                </div>
                
                <div>
                    <label style="display: block; color: #666; margin-bottom: 10px;">
                        Unlock Skins (click to select)
                    </label>
                    <div id="selectedSkinsDisplay" style="
                        min-height: 50px;
                        padding: 10px;
                        background: white;
                        border: 2px solid #ddd;
                        border-radius: 8px;
                        margin-bottom: 10px;
                        display: flex;
                        flex-wrap: wrap;
                        gap: 5px;
                    ">
                        <span style="color: #999;">No skins selected</span>
                    </div>
                    <div style="
                        display: grid;
                        grid-template-columns: repeat(10, 1fr);
                        gap: 5px;
                        max-height: 150px;
                        overflow-y: auto;
                        padding: 10px;
                        background: white;
                        border: 1px solid #ddd;
                        border-radius: 8px;
                    ">
                        ${premiumAvatars.map(emoji => `
                            <button class="skin-selector-btn" data-skin="${emoji}" style="
                                width: 40px;
                                height: 40px;
                                border: 2px solid #ddd;
                                background: white;
                                border-radius: 8px;
                                cursor: pointer;
                                font-size: 20px;
                                transition: all 0.2s;
                            ">${emoji}</button>
                        `).join('')}
                    </div>
                </div>
            </div>
            
            <div style="display: flex; gap: 10px; justify-content: center;">
                <button id="createChallengeSubmitBtn" style="
                    background: #4CAF50;
                    color: white;
                    border: none;
                    padding: 12px 30px;
                    border-radius: 8px;
                    font-size: 18px;
                    cursor: pointer;
                    transition: all 0.3s;
                ">✅ Create Challenge</button>
                
                <button id="cancelChallengeBtn" style="
                    background: #f44336;
                    color: white;
                    border: none;
                    padding: 12px 30px;
                    border-radius: 8px;
                    font-size: 18px;
                    cursor: pointer;
                    transition: all 0.3s;
                ">❌ Cancel</button>
            </div>
        `;
        
        modal.appendChild(modalContent);
        document.body.appendChild(modal);
        
        // Set up skin selection
        const selectedSkins = new Set();
        const updateSelectedDisplay = () => {
            const display = document.getElementById('selectedSkinsDisplay');
            if (selectedSkins.size === 0) {
                display.innerHTML = '<span style="color: #999;">No skins selected</span>';
            } else {
                display.innerHTML = Array.from(selectedSkins).map(skin => 
                    `<span style="
                        padding: 5px 10px;
                        background: #E3F2FD;
                        border-radius: 20px;
                        display: inline-flex;
                        align-items: center;
                        gap: 5px;
                    ">
                        ${skin}
                        <button onclick="this.parentElement.remove()" data-remove-skin="${skin}" style="
                            background: none;
                            border: none;
                            color: #f44336;
                            cursor: pointer;
                            font-size: 16px;
                            padding: 0;
                        ">×</button>
                    </span>`
                ).join('');
                
                // Re-attach remove handlers
                display.querySelectorAll('[data-remove-skin]').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        const skin = btn.dataset.removeSkin;
                        selectedSkins.delete(skin);
                        document.querySelector(`[data-skin="${skin}"]`).classList.remove('selected');
                        updateSelectedDisplay();
                    });
                });
            }
        };
        
        // Skin selector buttons
        modalContent.querySelectorAll('.skin-selector-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const skin = btn.dataset.skin;
                if (selectedSkins.has(skin)) {
                    selectedSkins.delete(skin);
                    btn.classList.remove('selected');
                    btn.style.background = 'white';
                    btn.style.borderColor = '#ddd';
                } else {
                    selectedSkins.add(skin);
                    btn.classList.add('selected');
                    btn.style.background = '#E3F2FD';
                    btn.style.borderColor = '#1976D2';
                }
                updateSelectedDisplay();
            });
        });
        
        // Button event listeners
        document.getElementById('createChallengeSubmitBtn').addEventListener('click', () => {
            const name = document.getElementById('challengeName').value.trim();
            const description = document.getElementById('challengeDescription').value.trim();
            const instructions = document.getElementById('challengeInstructions').value.trim();
            const xp = parseInt(document.getElementById('rewardXP').value) || 0;
            const coins = parseInt(document.getElementById('rewardCoins').value) || 0;
            
            if (!name) {
                alert('Please enter a challenge name.');
                return;
            }
            
            const challengeData = {
                name,
                description: description || '',
                instructions: instructions || 'Complete the challenge as directed by your teacher.',
                rewards: {
                    xp,
                    coins,
                    skins: Array.from(selectedSkins),
                    pets: []
                }
            };
            
            this.game.challengeManager.createChallenge(challengeData);
            modal.remove();
            
            // Show success message
            const successModal = document.createElement('div');
            successModal.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: #4CAF50;
                color: white;
                padding: 20px 40px;
                border-radius: 12px;
                font-size: 18px;
                font-weight: bold;
                z-index: 10000;
                box-shadow: 0 4px 20px rgba(0,0,0,0.3);
                animation: fadeInOut 2s;
            `;
            successModal.textContent = '✅ Challenge created successfully!';
            document.body.appendChild(successModal);
            
            // Add fade animation
            const style = document.createElement('style');
            style.textContent = `
                @keyframes fadeInOut {
                    0% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
                    20% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
                    80% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
                    100% { opacity: 0; transform: translate(-50%, -50%) scale(0.9); }
                }
            `;
            document.head.appendChild(style);
            
            setTimeout(() => {
                successModal.remove();
                style.remove();
                // Refresh challenges menu
                this.showMenu('challenges');
            }, 2000);
        });
        
        document.getElementById('cancelChallengeBtn').addEventListener('click', () => {
            modal.remove();
        });
        
        // Focus on the name input
        document.getElementById('challengeName').focus();
    }
    
}