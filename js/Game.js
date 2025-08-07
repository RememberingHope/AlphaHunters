// Main Game class for AlphaHunters

class Game {
    constructor() {
        // Canvas and rendering
        this.canvas = null;
        this.ctx = null;
        this.width = 800;
        this.height = 600;
        this.lastTime = 0;
        this.deltaTime = 0;
        this.targetFPS = 60;
        this.frameTime = 1000 / this.targetFPS;
        
        // Game state
        this.state = 'loading'; // loading, menu, playing, paused, tracing
        this.isRunning = false;
        this.interactionBlocked = false; // Block interactions instead of pausing
        
        // World properties
        this.worldWidth = 3000;
        this.worldHeight = 3000;
        
        // Camera
        this.camera = {
            x: 0,
            y: 0,
            targetX: 0,
            targetY: 0,
            smoothing: 0.1
        };
        
        // Player - Super fast for younger kids' attention spans
        // Define base player stats
        this.basePlayerStats = {
            radius: 30,
            maxSpeed: 400,
            acceleration: 2000
        };
        
        this.player = {
            x: this.worldWidth / 2,
            y: this.worldHeight / 2,
            radius: this.basePlayerStats.radius,
            speed: 800, // Animation speed (not movement)
            color: '#4A90E2',
            vx: 0,
            vy: 0,
            acceleration: this.basePlayerStats.acceleration,
            friction: 0.78,
            maxSpeed: this.basePlayerStats.maxSpeed
        };
        
        // Game objects
        this.letterlings = [];
        this.bots = [];
        this.orbs = [];
        this.particles = [];
        this.letterFollowers = []; // Cartoon letters that follow the player
        this.environmentObjects = []; // Decorative objects
        
        // Managers (will be initialized later)
        this.inputManager = null;
        this.audioManager = null;
        // saveManager replaced by dataManager
        this.worldManager = null;
        this.tracePanel = null;
        this.progression = null;
        this.economy = null;
        this.leaderboard = null;
        this.skinManager = null;
        this.spawnPool = null;
        // GameMenu removed - using MenuManager instead
        this.achievementTracker = null;
        this.menuManager = null;
        this.dataManager = null;
        this.levelManager = null;
        this.petFarm = null;
        this.multiplayerManager = null;
        this.multiplayerUI = null;
        this.multiplayerUI = null;
        this.otherPlayers = new Map(); // Map of player ID -> OtherPlayer instance
        
        // Progress monitoring systems
        this.timeTracker = null;
        this.timeLimitManager = null;
        this.traceCapture = null;
        this.teacherAuth = null;
        this.teacherDashboard = null;
        this.challengeManager = null;
        
        // Debug
        this.showDebug = false;
        this.debugInfo = {
            fps: 0,
            frameCount: 0,
            lastFPSUpdate: 0
        };
    }
    
    async init() {
        try {
            console.log('Starting game initialization...');
            
            // Initialize canvas
            console.log('Setting up canvas...');
            this.setupCanvas();
            
            // Initialize managers
            console.log('Initializing input manager...');
            this.inputManager = new InputManager(this);
            
            console.log('Initializing audio manager...');
            this.audioManager = new AudioManager();
            await this.audioManager.init();
            
            console.log('Initializing data manager...');
            this.dataManager = new DataManager(this);
            
            // Setup event listeners
            console.log('Setting up event listeners...');
            this.setupEventListeners();
            
            // Initialize game state
            console.log('Loading game data...');
            await this.loadGameData();
            
            console.log('Initializing game objects...');
            this.initializeGameObjects();
            
            // Hide loading screen
            console.log('Hiding loading screen...');
            this.hideLoadingScreen();
            
            // Show start menu instead of immediately starting gameplay
            console.log('Showing start menu...');
            this.menuManager.showMenu('start');
            
            // Start game loop but in menu mode
            console.log('Starting game loop...');
            this.start();
            
            console.log('AlphaHunters initialized successfully');
        } catch (error) {
            console.error('Failed to initialize game:', error);
            this.showError('Failed to load game. Please refresh and try again.');
        }
    }
    
    setupCanvas() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Set canvas size
        this.resizeCanvas();
        
        // Configure context
        this.ctx.imageSmoothingEnabled = true;
        this.ctx.imageSmoothingQuality = 'high';
        this.ctx.textBaseline = 'middle';
        this.ctx.textAlign = 'center';
    }
    
    resizeCanvas() {
        const container = document.getElementById('gameContainer');
        const containerRect = container.getBoundingClientRect();
        
        // Calculate optimal canvas size maintaining aspect ratio
        const targetAspect = 4/3;
        let canvasWidth = Math.min(containerRect.width * 0.9, 1200);
        let canvasHeight = canvasWidth / targetAspect;
        
        if (canvasHeight > containerRect.height * 0.9) {
            canvasHeight = containerRect.height * 0.9;
            canvasWidth = canvasHeight * targetAspect;
        }
        
        this.width = canvasWidth;
        this.height = canvasHeight;
        
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.canvas.style.width = this.width + 'px';
        this.canvas.style.height = this.height + 'px';
    }
    
    setupEventListeners() {
        // Window resize
        this.resizeHandler = this.resizeCanvas.bind(this);
        window.addEventListener('resize', this.resizeHandler);
        
        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            this.handleKeyDown(e);
        });
        
        // Pause/visibility handling
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pause();
            }
        });
        
        // UI button handlers
        this.setupUIHandlers();
    }
    
    setupUIHandlers() {
        // Pause menu buttons
        document.getElementById('resumeBtn').addEventListener('click', () => {
            this.resume();
        });
        
        document.getElementById('newGameBtn').addEventListener('click', () => {
            this.startNewGame();
        });
        
        document.getElementById('quitBtn').addEventListener('click', () => {
            this.quit();
        });
        
        // Trace panel buttons
        document.getElementById('retryBtn').addEventListener('click', () => {
            if (this.tracePanel) {
                this.tracePanel.retry();
            }
        });
        
        document.getElementById('skipBtn').addEventListener('click', () => {
            if (this.tracePanel) {
                this.tracePanel.skip();
            }
        });
    }
    
    async loadGameData() {
        try {
            // Character loading is handled by dataManager in constructor
            
            // Initialize menu and character management first
            this.menuManager = new MenuManager(this);
            this.levelManager = new LevelManager(this);
            
            // Initialize all game managers
            this.initializeManagers();
            
        } catch (error) {
            console.warn('Error loading game data, using defaults:', error);
            
            // Create menu and character managers even if save fails
            this.menuManager = new MenuManager(this);
            this.levelManager = new LevelManager(this);
            
            // Initialize all managers with defaults
            this.initializeManagers();
        }
    }
    
    initializeManagers() {
        // Initialize or reinitialize all game managers
        this.progression = new Progression(this);
        this.economy = new Economy(this);
        this.leaderboard = new Leaderboard(this);
        this.skinManager = new SkinManager(this);
        this.achievementTracker = new AchievementTracker(this);
        this.challengeManager = new ChallengeManager(this);
        
        // Initialize progress monitoring systems
        this.teacherAuth = new TeacherAuth(this);
        this.timeTracker = new TimeTracker(this);
        this.timeLimitManager = new TimeLimitManager(this);
        this.traceCapture = new TraceCapture(this);
        this.teacherDashboard = new TeacherDashboard(this);
        
        // Validate player stats after upgrades are loaded
        this.validatePlayerStats();
    }
    
    initializeGameObjects() {
        // Initialize spawn pool system
        this.spawnPool = new SpawnPool(this);
        
        // Initialize world
        this.worldManager = new WorldManager(this);
        this.worldManager.generateWorld();
        
        // IMPORTANT: Update available letters now that WorldManager exists
        if (this.progression) {
            console.log('🔧 FIX: Re-running checkUnlocks now that WorldManager is available');
            this.progression.checkUnlocks();
        }
        
        // Initialize trace panel
        this.tracePanel = new TracePanel(this);
        
        // GameMenu removed - using MenuManager instead
        
        // Initialize achievement tracker
        this.achievementTracker = new AchievementTracker(this);
        
        // Initialize simple multiplayer UI
        this.multiplayerUI = new SimpleMultiplayerUI(this);
        // multiplayerManager will be set by SimpleMultiplayerUI when needed
        
        // Initialize combined UI panel
        this.combinedPanel = new CombinedPanel(this);
        // Keep the default leaderboard visible - it shows the bots
        
        // Initialize classroom components
        this.classroomJoinUI = new ClassroomJoinUI(this);
        this.classroomManager = new ClassroomConnectionManager(this);
        
        // Set initial camera position
        this.updateCamera();
    }
    
    onNewGameCreated() {
        // Called when a new game is created through the menu
        console.log('New game created, reinitializing game state...');
        
        // Reinitialize all managers with new save data
        this.initializeManagers();
        
        // Reset world state
        if (this.worldManager) {
            this.worldManager.generateWorld();
        }
        
        // Reset spawn pool
        if (this.spawnPool && this.progression) {
            this.progression.checkUnlocks(); // This will update available letters
        }
        
        // Reset player state
        this.resetPlayerState();
        
        console.log('New game initialization complete');
    }
    
    onGameLoaded() {
        // Called when a game is loaded through the menu
        console.log('Game loaded, reinitializing with saved data...');
        
        // Reinitialize all systems with loaded save data
        this.initializeManagers();
        
        // Update world state
        if (this.worldManager) {
            this.worldManager.generateWorld();
        }
        
        // Update spawn pool
        if (this.spawnPool && this.progression) {
            this.progression.checkUnlocks(); // This will update available letters
        }
        
        // Reset player position but keep stats
        this.resetPlayerPosition();
        
        console.log('Game load initialization complete');
    }
    
    resetPlayerState() {
        // Reset player to starting state for new game
        this.player.x = this.width / 2;
        this.player.y = this.height / 2;
        this.player.vx = 0;
        this.player.vy = 0;
        this.player.radius = this.basePlayerStats.radius;
        this.player.maxSpeed = this.basePlayerStats.maxSpeed;
        this.player.acceleration = this.basePlayerStats.acceleration;
        
        // Clear any temporary upgrades
        this.player.tempUpgradeEnd = 0;
        this.player.upgradeGlowTime = 0;
        this.player.isTempUpgrade = false;
        this.player.originalStats = null;
    }
    
    resetPlayerPosition() {
        // Reset player position but keep upgraded stats for loaded games
        this.player.x = this.width / 2;
        this.player.y = this.height / 2;
        this.player.vx = 0;
        this.player.vy = 0;
        
        // Clear any temporary upgrades but keep permanent ones
        this.player.tempUpgradeEnd = 0;
        this.player.upgradeGlowTime = 0;
        this.player.isTempUpgrade = false;
    }
    
    showGameMenu() {
        // Use MenuManager instead
        if (this.menuManager) {
            this.menuManager.showMenu('pause');
        }
    }
    
    validatePlayerStats() {
        // Check for corrupted or unreasonable player stats
        const maxRadius = 120;
        const maxSpeed = 2000;
        const maxAccel = 8000;
        
        if (!this.player) return;
        
        // Check radius
        if (this.player.radius > maxRadius || isNaN(this.player.radius) || this.player.radius <= 0) {
            console.warn(`Invalid player radius detected: ${this.player.radius}, resetting to base value`);
            this.player.radius = this.basePlayerStats.radius;
        }
        
        // Check max speed
        if (this.player.maxSpeed > maxSpeed || isNaN(this.player.maxSpeed) || this.player.maxSpeed <= 0) {
            console.warn(`Invalid player maxSpeed detected: ${this.player.maxSpeed}, resetting to base value`);
            this.player.maxSpeed = this.basePlayerStats.maxSpeed;
        }
        
        // Check acceleration
        if (this.player.acceleration > maxAccel || isNaN(this.player.acceleration) || this.player.acceleration <= 0) {
            console.warn(`Invalid player acceleration detected: ${this.player.acceleration}, resetting to base value`);
            this.player.acceleration = this.basePlayerStats.acceleration;
        }
        
        console.log(`Player stats validated - Radius: ${this.player.radius}, Speed: ${this.player.maxSpeed}, Accel: ${this.player.acceleration}`);
    }
    
    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) {
            console.log('Hiding loading screen...');
            loadingScreen.classList.add('hidden');
            loadingScreen.style.display = 'none'; // Force hide
        } else {
            console.error('Loading screen element not found!');
        }
        
        // Show game HUD
        const hudOverlay = document.getElementById('hudOverlay');
        if (hudOverlay) {
            console.log('Showing HUD overlay...');
            hudOverlay.classList.remove('hidden');
        }
    }
    
    showError(message) {
        // Simple error display for now
        alert(message);
    }
    
    start() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.state = 'menu'; // Start in menu mode
        this.lastTime = performance.now();
        
        // Validate player stats before starting
        this.validatePlayerStats();
        
        this.gameLoop();
    }
    
    startGameplay() {
        // Called when transitioning from menu to actual gameplay
        console.log('Starting gameplay...');
        this.state = 'playing';
        
        // Ensure HUD is visible
        const hudOverlay = document.getElementById('hudOverlay');
        if (hudOverlay) {
            hudOverlay.classList.remove('hidden');
        }
        
        // Show combined panel on the left side
        if (this.combinedPanel) {
            this.combinedPanel.show();
        }
    }
    
    pauseLevel() {
        if (!this.levelManager || !this.levelManager.isLevelActive()) return;
        
        // Create level pause overlay
        const overlay = document.createElement('div');
        overlay.id = 'levelPauseOverlay';
        overlay.style.cssText = `
            position: fixed; top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0,0,0,0.8); display: flex;
            justify-content: center; align-items: center;
            z-index: 3000; font-family: 'Comic Sans MS', cursive;
        `;
        
        const level = this.levelManager.getCurrentLevel();
        const remainingTime = this.levelManager.getRemainingTime();
        const minutes = Math.floor(remainingTime / 60000);
        const seconds = Math.floor((remainingTime % 60000) / 1000);
        
        overlay.innerHTML = `
            <div style="
                background: white; padding: 40px; border-radius: 20px;
                text-align: center; max-width: 400px;
                box-shadow: 0 20px 40px rgba(0,0,0,0.3);
            ">
                <div style="font-size: 48px; margin-bottom: 20px;">⏸️</div>
                <h2 style="font-size: 32px; margin-bottom: 10px; color: ${level.primaryColor};">
                    Level Paused
                </h2>
                <h3 style="font-size: 20px; margin-bottom: 20px; color: #666;">
                    ${level.name}
                </h3>
                
                <div style="margin: 20px 0; font-size: 18px; color: #666;">
                    Time Remaining: ${minutes}:${seconds.toString().padStart(2, '0')}
                </div>
                
                <div style="display: flex; gap: 15px; justify-content: center; margin-top: 30px;">
                    <button id="resumeLevelBtn" style="
                        background: linear-gradient(135deg, #4CAF50, #45a049);
                        border: none; color: white; padding: 15px 25px;
                        border-radius: 10px; font-size: 16px; font-weight: bold;
                        cursor: pointer; transition: all 0.3s;
                    ">▶️ Resume</button>
                    
                    <button id="completeLevelBtn" style="
                        background: linear-gradient(135deg, #2196F3, #1976D2);
                        border: none; color: white; padding: 15px 25px;
                        border-radius: 10px; font-size: 16px; font-weight: bold;
                        cursor: pointer; transition: all 0.3s;
                    ">🏁 Complete Level</button>
                    
                    <button id="exitLevelBtn" style="
                        background: linear-gradient(135deg, #f44336, #d32f2f);
                        border: none; color: white; padding: 15px 25px;
                        border-radius: 10px; font-size: 16px; font-weight: bold;
                        cursor: pointer; transition: all 0.3s;
                    ">🚪 Exit Level</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(overlay);
        
        // Add event listeners
        document.getElementById('resumeLevelBtn').addEventListener('click', () => this.resumeLevel());
        document.getElementById('completeLevelBtn').addEventListener('click', () => this.completeCurrentLevel());
        document.getElementById('exitLevelBtn').addEventListener('click', () => this.exitCurrentLevel());
    }
    
    resumeLevel() {
        const overlay = document.getElementById('levelPauseOverlay');
        if (overlay) overlay.remove();
    }
    
    completeCurrentLevel() {
        const overlay = document.getElementById('levelPauseOverlay');
        if (overlay) overlay.remove();
        
        if (this.levelManager) {
            console.log('🏁 Player chose to complete level early');
            this.levelManager.endLevel('completed');
        }
    }
    
    exitCurrentLevel() {
        const overlay = document.getElementById('levelPauseOverlay');
        if (overlay) overlay.remove();
        
        if (this.levelManager) {
            this.levelManager.exitLevel();
        }
    }
    
    showRandomUnlockedEmoji() {
        // Get all unlocked emojis from collected pets
        const character = this.dataManager?.getCurrentCharacter();
        if (!character || !character.pets.farm) return;
        
        const unlockedEmojis = [];
        Object.values(character.pets.farm).forEach(petData => {
            if (Array.isArray(petData)) {
                petData.forEach(pet => {
                    if (pet.emoji) unlockedEmojis.push(pet.emoji);
                });
            } else if (petData.emoji) {
                unlockedEmojis.push(petData.emoji);
            }
        });
        
        // Add some default emojis if no pets collected yet
        if (unlockedEmojis.length === 0) {
            unlockedEmojis.push('⭐', '✨', '🌟', '💫');
        }
        
        // Pick random emoji
        const emoji = unlockedEmojis[Math.floor(Math.random() * unlockedEmojis.length)];
        
        // Create floating emoji at player position
        const floatingEmoji = document.createElement('div');
        floatingEmoji.style.cssText = `
            position: fixed;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
            font-size: 48px;
            z-index: 2000;
            pointer-events: none;
            animation: emojiFloat 1.5s ease-out forwards;
        `;
        floatingEmoji.textContent = emoji;
        
        // Add animation style if not exists
        if (!document.querySelector('#emojiFloatStyle')) {
            const style = document.createElement('style');
            style.id = 'emojiFloatStyle';
            style.textContent = `
                @keyframes emojiFloat {
                    0% { 
                        transform: translate(-50%, -50%) scale(0.5); 
                        opacity: 0; 
                    }
                    50% { 
                        transform: translate(-50%, -80%) scale(1.2); 
                        opacity: 1; 
                    }
                    100% { 
                        transform: translate(-50%, -120%) scale(0.8); 
                        opacity: 0; 
                    }
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(floatingEmoji);
        
        // Remove after animation
        setTimeout(() => floatingEmoji.remove(), 1500);
    }
    
    stop() {
        this.isRunning = false;
    }
    
    pause() {
        if (this.state === 'playing') {
            this.state = 'paused';
            document.getElementById('pauseMenu').classList.remove('hidden');
        }
    }
    
    resume() {
        if (this.state === 'paused') {
            this.state = 'playing';
            document.getElementById('pauseMenu').classList.add('hidden');
        }
    }
    
    startNewGame() {
        // Confirm new game
        if (confirm('Are you sure you want to start a new game? All progress will be lost.')) {
            // Reset handled by dataManager if needed
            
            // Hide pause menu
            this.resume();
            
            // Reload the page to start fresh
            window.location.reload();
        }
    }
    
    quit() {
        // Save game data before quitting
        if (this.dataManager) {
            this.dataManager.save();
        }
        
        // Could navigate to main menu or close game
        if (confirm('Are you sure you want to quit?')) {
            this.stop();
            window.location.reload();
        }
    }
    
    gameLoop(currentTime = performance.now()) {
        if (!this.isRunning) return;
        
        // Calculate delta time
        this.deltaTime = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;
        
        // Cap delta time to prevent large jumps
        this.deltaTime = Math.min(this.deltaTime, 1/30);
        
        // Update FPS counter
        this.updateFPS();
        
        // Update game logic
        if (this.state === 'playing') {
            this.update(this.deltaTime);
        }
        
        // Render frame
        this.render();
        
        // Continue loop
        requestAnimationFrame((time) => this.gameLoop(time));
    }
    
    update(deltaTime) {
        // Update input (keyboard and mouse movement)
        if (this.inputManager) {
            this.inputManager.updateKeyboardMovement(deltaTime);
            this.inputManager.updateMouseMovement(deltaTime);
        }
        
        // Update player movement
        this.updatePlayer(deltaTime);
        
        // Update camera
        this.updateCamera();
        
        // Update spawn pool
        if (this.spawnPool) {
            this.spawnPool.update(deltaTime);
        }
        
        // Update world objects
        if (this.worldManager) {
            this.worldManager.update(deltaTime);
        }
        
        // Update leaderboard
        if (this.leaderboard) {
            this.leaderboard.update();
        }
        
        // Update particles
        this.updateParticles(deltaTime);
        
        // Update letter followers
        this.updateLetterFollowers(deltaTime);
        
        // Check collisions
        this.checkCollisions();
        
        // Check for letterling clicks
        if (this.inputManager && this.inputManager.isPointerDown && !this.interactionBlocked) {
            this.checkLetterlingClick();
        }
        
        // Update other players
        this.otherPlayers.forEach(otherPlayer => {
            otherPlayer.update(deltaTime);
        });
        
        // Send multiplayer updates
        if (this.multiplayerManager && this.multiplayerManager.isMultiplayer()) {
            this.multiplayerManager.sendPlayerUpdate();
        }
        
        // Update combined panel
        if (this.combinedPanel && this.combinedPanel.isVisible) {
            this.combinedPanel.updateContent();
        }
    }
    
    updatePlayer(deltaTime) {
        // Check for temporary upgrade expiration
        this.checkTemporaryUpgrades();
        
        // Apply friction
        this.player.vx *= this.player.friction;
        this.player.vy *= this.player.friction;
        
        // Update position based on velocity
        this.player.x += this.player.vx * deltaTime;
        this.player.y += this.player.vy * deltaTime;
        
        // Keep player within world bounds
        if (this.player.x <= this.player.radius) {
            this.player.x = this.player.radius;
            this.player.vx = 0;
        }
        if (this.player.x >= this.worldWidth - this.player.radius) {
            this.player.x = this.worldWidth - this.player.radius;
            this.player.vx = 0;
        }
        if (this.player.y <= this.player.radius) {
            this.player.y = this.player.radius;
            this.player.vy = 0;
        }
        if (this.player.y >= this.worldHeight - this.player.radius) {
            this.player.y = this.worldHeight - this.player.radius;
            this.player.vy = 0;
        }
    }
    
    checkTemporaryUpgrades() {
        if (this.player.tempUpgradeEnd && Date.now() > this.player.tempUpgradeEnd) {
            console.log('⏰ Temporary upgrade expired');
            
            // Restore original stats
            if (this.player.originalStats) {
                this.player.maxSpeed = this.player.originalStats.maxSpeed;
                this.player.acceleration = this.player.originalStats.acceleration;
                this.player.radius = this.player.originalStats.radius;
            }
            
            // Clean up temporary upgrade flags
            this.player.tempUpgradeEnd = null;
            this.player.tempUpgradeType = null;
            this.player.letterRadarActive = false;
            this.player.isTempUpgrade = false;
            
            // Show expiration effect
            this.showTempUpgradeExpired();
        }
    }
    
    showTempUpgradeExpired() {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 30%;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(255, 100, 100, 0.9);
            color: white;
            padding: 10px 20px;
            border: 2px solid #fff;
            border-radius: 15px;
            font-size: 16px;
            font-weight: bold;
            z-index: 1001;
            animation: fadeIn 1s ease-out;
        `;
        
        notification.innerHTML = '⏰ Power-up expired!';
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 2000);
    }
    
    updateCamera() {
        // Check if player exists before updating camera
        if (!this.player) return;
        
        // Smooth camera following
        this.camera.targetX = this.player.x - this.width / 2;
        this.camera.targetY = this.player.y - this.height / 2;
        
        const dx = this.camera.targetX - this.camera.x;
        const dy = this.camera.targetY - this.camera.y;
        
        // Use higher smoothing value if camera is far from target (catch up faster)
        const distance = Math.sqrt(dx * dx + dy * dy);
        const smoothing = distance > 200 ? 0.15 : this.camera.smoothing;
        
        this.camera.x += dx * smoothing;
        this.camera.y += dy * smoothing;
        
        // Keep camera within world bounds
        this.camera.x = Utils.clamp(this.camera.x, 0, this.worldWidth - this.width);
        this.camera.y = Utils.clamp(this.camera.y, 0, this.worldHeight - this.height);
    }
    
    updateParticles(deltaTime) {
        // Limit max particles to prevent memory issues
        const maxParticles = 100;
        if (this.particles.length > maxParticles) {
            // Remove oldest particles
            this.particles.splice(0, this.particles.length - maxParticles);
        }
        
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            particle.update(deltaTime);
            
            if (particle.isDead()) {
                this.particles.splice(i, 1);
            }
        }
    }
    
    checkCollisions() {
        // Skip collisions if interactions are blocked
        if (this.interactionBlocked) return;
        
        // Player-letterling collisions
        for (const letterling of this.letterlings) {
            if (letterling.isActive && this.isPlayerColliding(letterling)) {
                this.startTraceEncounter(letterling);
                break; // Only capture one letterling at a time
            }
        }
        
        // Player-bot collisions
        for (const bot of this.bots) {
            if (bot.isActive && this.isPlayerColliding(bot)) {
                // Check if this bot is on cooldown
                if (!bot.contestCooldown || Date.now() > bot.contestCooldown) {
                    this.startSprintEncounter(bot);
                    // Set cooldown for 30 seconds
                    bot.contestCooldown = Date.now() + 30000;
                }
            }
        }
        
        // Player-orb collisions
        for (let i = this.orbs.length - 1; i >= 0; i--) {
            const orb = this.orbs[i];
            if (this.isPlayerColliding(orb)) {
                this.collectOrb(orb);
                this.orbs.splice(i, 1);
            }
        }
    }
    
    isPlayerColliding(object) {
        const distance = Utils.distance(
            this.player.x, this.player.y,
            object.x, object.y
        );
        return distance < (this.player.radius + object.radius);
    }
    
    checkLetterlingClick() {
        if (this.state !== 'playing' || !this.inputManager || !this.inputManager.mouseTarget) return;
        
        // Get mouse position in world coordinates
        const mouseX = this.inputManager.mouseTarget.x;
        const mouseY = this.inputManager.mouseTarget.y;
        
        // Check if click is on any letterling
        for (const letterling of this.letterlings) {
            if (!letterling.isActive) continue;
            
            const distance = Utils.distance(mouseX, mouseY, letterling.x, letterling.y);
            if (distance < letterling.radius) {
                // Start trace encounter
                this.startTraceEncounter(letterling);
                // Reset pointer down state to prevent multiple clicks
                this.inputManager.isPointerDown = false;
                break;
            }
        }
    }
    
    startTraceEncounter(letterling) {
        // Double-check we're not already in tracing mode
        if (this.state === 'tracing') {
            console.warn('⚠️ Already in tracing mode, ignoring additional capture');
            return;
        }
        
        console.log(`🎯 Starting trace encounter for letterling '${letterling.letter}'`);
        
        this.state = 'tracing';
        this.interactionBlocked = true; // Block interactions during tracing
        this.currentTracingLetterling = letterling; // Track which letterling we're tracing
        letterling.beingTracedByPlayer = true; // Mark letterling as being traced by player
        
        // Add firework effect when letterling is captured
        this.addFireworkEffect(letterling.x, letterling.y, letterling.color);
        
        if (this.tracePanel) {
            try {
                this.tracePanel.startEncounter(letterling);
                console.log('✅ Trace panel started successfully');
            } catch (error) {
                console.error('❌ Error starting trace panel:', error);
                // Exit trace mode if panel fails to start
                this.exitTraceMode();
                return;
            }
        } else {
            console.error('❌ TracePanel not initialized!');
            this.exitTraceMode();
            return;
        }
        
        letterling.isActive = false;
        letterling.deactivatedTime = Date.now();
        
        // Push away any other nearby letterlings to prevent accidental multi-capture
        this.pushAwayNearbyLetterlings(letterling.x, letterling.y, 150);
    }
    
    startSprintEncounter(bot) {
        // Prevent multiple simultaneous contests
        if (this.contestPanel || this.interactionBlocked) return;
        
        console.log(`Contest started with ${bot.name}!`);
        
        // Create contest panel
        this.createContestPanel(bot);
        
        // Block other interactions
        this.setInteractionBlocking(true);
        
        // Pause player movement
        this.player.vx = 0;
        this.player.vy = 0;
        
        // Start the contest
        this.startLetterContest(bot);
    }
    
    createContestPanel(bot) {
        // Create contest UI
        this.contestPanel = document.createElement('div');
        this.contestPanel.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(135deg, #FFD700, #FFA500);
            border: 5px solid #333;
            border-radius: 25px;
            padding: 30px;
            text-align: center;
            z-index: 2000;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
            font-family: 'Comic Sans MS', cursive;
            min-width: 400px;
        `;
        
        this.contestPanel.innerHTML = `
            <h2 style="margin: 0 0 20px 0; font-size: 32px; color: #333;">
                ⚔️ CONTEST! ⚔️
            </h2>
            <div style="display: flex; justify-content: space-around; margin-bottom: 20px;">
                <div style="text-align: center;">
                    <div style="font-size: 48px;">${this.player.emoji || '😊'}</div>
                    <div style="font-size: 18px; font-weight: bold;">You</div>
                    <div id="playerContestScore" style="font-size: 24px; color: #333; margin-top: 10px;">0</div>
                </div>
                <div style="font-size: 48px; display: flex; align-items: center;">VS</div>
                <div style="text-align: center;">
                    <div style="font-size: 48px;">${bot.emoji}</div>
                    <div style="font-size: 18px; font-weight: bold;">${bot.name}</div>
                    <div id="botContestScore" style="font-size: 24px; color: #333; margin-top: 10px;">0</div>
                </div>
            </div>
            <div id="contestLetters" style="margin: 20px 0; font-size: 28px; letter-spacing: 10px;">
                <!-- Letters will appear here -->
            </div>
            <div id="contestStatus" style="font-size: 20px; color: #333; margin-top: 20px;">
                Get ready!
            </div>
        `;
        
        document.body.appendChild(this.contestPanel);
    }
    
    startLetterContest(bot) {
        // Get available letters from the current level or spawn pool
        const availableLetters = this.spawnPool ? 
            this.spawnPool.currentPool : 
            ['a', 'b', 'c', 'd', 'e'];
        
        // Select 3-5 random letters for the contest
        const contestLetterCount = Utils.randomBetween(3, 5);
        const contestLetters = [];
        for (let i = 0; i < contestLetterCount; i++) {
            contestLetters.push(Utils.pickRandom(availableLetters));
        }
        
        // Display letters
        const lettersDiv = document.getElementById('contestLetters');
        if (lettersDiv) {
            lettersDiv.textContent = contestLetters.join(' ');
        }
        
        // Initialize contest state
        this.contestState = {
            bot: bot,
            letters: contestLetters,
            currentLetterIndex: 0,
            playerScore: 0,
            botScore: 0,
            isActive: true
        };
        
        // Start contest after brief delay
        setTimeout(() => {
            this.showNextContestLetter();
        }, 1500);
    }
    
    showNextContestLetter() {
        if (!this.contestState || !this.contestState.isActive) return;
        
        const { currentLetterIndex, letters } = this.contestState;
        
        if (currentLetterIndex >= letters.length) {
            // Contest finished
            this.endContest();
            return;
        }
        
        const currentLetter = letters[currentLetterIndex];
        const statusDiv = document.getElementById('contestStatus');
        if (statusDiv) {
            statusDiv.textContent = `Trace: ${currentLetter.toUpperCase()}`;
        }
        
        // Hide contest panel to show trace panel
        if (this.contestPanel) {
            this.contestPanel.style.display = 'none';
        }
        
        // Create a mini letterling for the contest
        const contestLetterling = {
            letter: currentLetter,
            x: this.player.x,
            y: this.player.y
        };
        
        // Start trace encounter for this letter
        this.tracePanel.startEncounter(contestLetterling);
        
        // Temporarily increase trace panel z-index for contest mode
        if (this.tracePanel.panel) {
            this.tracePanel.panel.style.zIndex = '2001';
        }
        
        // Override the completion handler
        this.tracePanel.onComplete = (score) => {
            this.handleContestLetterComplete(score);
        };
    }
    
    handleContestLetterComplete(playerScore) {
        if (!this.contestState) return;
        
        // Reset trace panel z-index
        if (this.tracePanel.panel) {
            this.tracePanel.panel.style.zIndex = '';
        }
        
        // Show contest panel again
        if (this.contestPanel) {
            this.contestPanel.style.display = 'block';
        }
        
        // Calculate bot's score (simulated)
        const botSkillLevel = this.contestState.bot.progressionLevel || 1;
        const baseScore = Utils.randomBetween(60, 85);
        const botScore = Math.min(100, baseScore + (botSkillLevel * 3));
        
        // Update scores
        this.contestState.playerScore += playerScore;
        this.contestState.botScore += botScore;
        
        // Update UI
        const playerScoreDiv = document.getElementById('playerContestScore');
        const botScoreDiv = document.getElementById('botContestScore');
        if (playerScoreDiv) playerScoreDiv.textContent = this.contestState.playerScore;
        if (botScoreDiv) botScoreDiv.textContent = this.contestState.botScore;
        
        // Move to next letter
        this.contestState.currentLetterIndex++;
        
        // Brief pause before next letter
        setTimeout(() => {
            this.showNextContestLetter();
        }, 1000);
    }
    
    endContest() {
        if (!this.contestState) return;
        
        const { playerScore, botScore, bot } = this.contestState;
        const playerWon = playerScore > botScore;
        
        // Calculate rewards
        const baseReward = 50;
        const winnerBonus = 30;
        const loserBonus = 10;
        
        const playerReward = baseReward + (playerWon ? winnerBonus : loserBonus);
        const botReward = baseReward + (playerWon ? loserBonus : winnerBonus);
        
        // Apply rewards
        this.economy.addCoins(playerReward);
        bot.score += botReward;
        
        // Update contest panel with results
        const statusDiv = document.getElementById('contestStatus');
        if (statusDiv) {
            statusDiv.innerHTML = `
                <div style="font-size: 28px; color: ${playerWon ? '#4CAF50' : '#F44336'}; margin-bottom: 10px;">
                    ${playerWon ? '🎉 YOU WIN! 🎉' : '😔 You Lost 😔'}
                </div>
                <div style="font-size: 18px;">
                    You earned: ${playerReward} coins!
                </div>
                <button onclick="game.closeContest()" style="
                    margin-top: 20px;
                    padding: 15px 30px;
                    font-size: 20px;
                    background: #4CAF50;
                    color: white;
                    border: 3px solid #333;
                    border-radius: 15px;
                    cursor: pointer;
                    font-family: inherit;
                ">Continue</button>
            `;
        }
        
        // Clear contest state
        this.contestState.isActive = false;
    }
    
    closeContest() {
        // Remove contest panel
        if (this.contestPanel) {
            this.contestPanel.remove();
            this.contestPanel = null;
        }
        
        // Reset trace panel z-index
        if (this.tracePanel.panel) {
            this.tracePanel.panel.style.zIndex = '';
        }
        
        // Clear contest state
        this.contestState = null;
        
        // Re-enable interactions
        this.setInteractionBlocking(false);
    }
    
    pushAwayNearbyLetterlings(x, y, radius) {
        // Push away any letterlings within the radius to prevent multi-capture
        for (const letterling of this.letterlings) {
            if (!letterling.isActive) continue;
            
            const distance = Utils.distance(x, y, letterling.x, letterling.y);
            if (distance < radius && distance > 0) {
                // Calculate push direction
                const dx = letterling.x - x;
                const dy = letterling.y - y;
                const pushDistance = radius - distance + 50; // Extra 50px buffer
                const angle = Math.atan2(dy, dx);
                
                // Push letterling away
                letterling.x += Math.cos(angle) * pushDistance;
                letterling.y += Math.sin(angle) * pushDistance;
                
                // Add some velocity to make it look natural
                letterling.vx = Math.cos(angle) * 100;
                letterling.vy = Math.sin(angle) * 100;
                
                console.log(`🚀 Pushed away letterling '${letterling.letter}' to prevent multi-capture`);
            }
        }
    }
    
    collectOrb(orb) {
        // Add visual effect
        this.addCollectionEffect(orb.x, orb.y);
        
        // Award coins
        if (this.economy) {
            this.economy.addCoins(orb.value || 1);
        }
    }
    
    addCollectionEffect(x, y) {
        // Simple particle effect for orb collection
        for (let i = 0; i < 5; i++) {
            const angle = (Math.PI * 2 * i) / 5;
            const speed = Utils.randomBetween(50, 100);
            // Particle implementation would go here
        }
    }
    
    addFireworkEffect(x, y, color = '#FFD700') {
        // Create colorful firework particles when letterling is captured
        const particleCount = 12; // Reduced for better performance
        const colors = [color, '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFD93D', '#FF9800', '#9C27B0', '#E91E63', '#00BCD4'];
        
        // Main firework burst - bigger and faster
        for (let i = 0; i < particleCount; i++) {
            const angle = (Math.PI * 2 * i) / particleCount + Utils.randomBetween(-0.4, 0.4);
            const speed = Utils.randomBetween(200, 350); // Much faster for bigger spread
            const particleColor = Utils.pickRandom(colors);
            
            const particle = new FireworkParticle({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                color: particleColor,
                size: Utils.randomBetween(4, 8), // Smaller particles for performance
                life: Utils.randomBetween(0.8, 1.2) // Shorter duration
            });
            
            this.particles.push(particle);
        }
        
        // Add a secondary ring of particles for more impressive effect
        for (let i = 0; i < 8; i++) {
            const angle = (Math.PI * 2 * i) / 12 + Utils.randomBetween(-0.2, 0.2);
            const speed = Utils.randomBetween(120, 250);
            const particleColor = Utils.pickRandom(colors);
            
            const particle = new FireworkParticle({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                color: particleColor,
                size: Utils.randomBetween(4, 8),
                life: Utils.randomBetween(1.0, 1.5)
            });
            
            this.particles.push(particle);
        }
        
        // Add a central burst effect - bigger and more golden
        for (let i = 0; i < 5; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Utils.randomBetween(80, 180);
            
            const particle = new FireworkParticle({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                color: '#FFD700',
                size: Utils.randomBetween(6, 10), // Smaller central particles
                life: Utils.randomBetween(0.8, 1.2)
            });
            
            this.particles.push(particle);
        }
    }
    
    render() {
        // Clear canvas
        this.ctx.fillStyle = '#4CAF50';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // Save context for camera transform
        this.ctx.save();
        this.ctx.translate(-this.camera.x, -this.camera.y);
        
        // Render world background
        this.renderWorldBackground();
        
        // Render game objects
        this.renderEnvironmentObjects();
        this.renderOrbs();
        this.renderLetterlings();
        this.renderBots();
        this.renderLetterFollowers();
        this.renderOtherPlayers(); // Render other players before our player
        this.renderPlayer();
        this.renderParticles();
        
        // Restore context
        this.ctx.restore();
        
        // Render UI (not affected by camera)
        this.renderUI();
        
        // Debug info
        if (this.showDebug) {
            this.renderDebugInfo();
        }
    }
    
    renderWorldBackground() {
        // Simple grid pattern for world bounds
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        this.ctx.lineWidth = 1;
        
        const gridSize = 100;
        const startX = Math.floor(this.camera.x / gridSize) * gridSize;
        const startY = Math.floor(this.camera.y / gridSize) * gridSize;
        
        this.ctx.beginPath();
        for (let x = startX; x < this.camera.x + this.width + gridSize; x += gridSize) {
            this.ctx.moveTo(x, this.camera.y);
            this.ctx.lineTo(x, this.camera.y + this.height);
        }
        for (let y = startY; y < this.camera.y + this.height + gridSize; y += gridSize) {
            this.ctx.moveTo(this.camera.x, y);
            this.ctx.lineTo(this.camera.x + this.width, y);
        }
        this.ctx.stroke();
    }
    
    renderOtherPlayers() {
        if (!this.multiplayerManager || !this.multiplayerManager.isMultiplayer()) return;
        
        // Render each OtherPlayer instance
        this.otherPlayers.forEach(otherPlayer => {
            otherPlayer.render(this.ctx, this.camera);
        });
    }
    
    renderPlayer() {
        // Check for upgrade glow effect
        const now = Date.now();
        const hasUpgradeGlow = this.player.upgradeGlowTime && now < this.player.upgradeGlowTime;
        
        if (hasUpgradeGlow) {
            // Animated glow effect
            const glowIntensity = 0.7 + 0.3 * Math.sin(now / 200);
            const glowSize = this.player.radius + 8 + 4 * Math.sin(now / 150);
            
            // Outer glow
            this.ctx.shadowColor = '#FFD700';
            this.ctx.shadowBlur = 20 * glowIntensity;
            
            this.ctx.fillStyle = `rgba(255, 215, 0, ${0.3 * glowIntensity})`;
            this.ctx.beginPath();
            this.ctx.arc(this.player.x, this.player.y, glowSize, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Reset shadow
            this.ctx.shadowBlur = 0;
        }
        
        // Get current skin emoji
        const character = this.dataManager?.getCurrentCharacter();
        const skinEmoji = character?.identity?.avatar || '😊';
        
        // Render emoji skin
        this.ctx.font = `${this.player.radius * 2.5}px Arial`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(skinEmoji, this.player.x, this.player.y);
        
        // Draw equipped hat
        if (character?.shopData?.equippedHat) {
            const hatDefinitions = {
                // Cheap tier
                'headband': '🎗️',
                'bandana': '🏴',
                'flower': '🌸',
                'sunflower': '🌻',
                'cap': '🧢',
                'beret': '🎨',
                'headphones': '🎧',
                'bow': '🎀',
                'glasses': '👓',
                'sunglasses': '🕶️',
                // Mid tier
                'party': '🥳',
                'tophat': '🎩',
                'cowboy': '🤠',
                'crown': '👑',
                'graduation': '🎓',
                'santa': '🎅',
                'pirate_hat': '🏴‍☠️',
                'wizard_hat': '🧙‍♂️',
                // High tier
                'viking': '⛑️',
                'knight_helm': '🛡️',
                'halo': '😇',
                'horns': '😈',
                'antlers': '🦌',
                'unicorn_horn': '🦄',
                'golden_crown': '👑',
                'diamond_tiara': '💎',
                // Legendary tier
                'flame_crown': '🔥',
                'ice_crown': '❄️',
                'rainbow_halo': '🌈',
                'star_crown': '⭐',
                'cosmic_helm': '🌌',
                'legendary_crown': '👑'
            };
            
            const hatEmoji = hatDefinitions[character.shopData.equippedHat];
            if (hatEmoji) {
                this.ctx.font = `${this.player.radius * 1.5}px Arial`;
                this.ctx.fillText(hatEmoji, this.player.x, this.player.y - this.player.radius * 1.5);
            }
        }
        
        // Add upgrade glow border around emoji
        if (hasUpgradeGlow) {
            this.ctx.strokeStyle = '#FFD700';
            this.ctx.lineWidth = 3;
            this.ctx.beginPath();
            this.ctx.arc(this.player.x, this.player.y, this.player.radius + 5, 0, Math.PI * 2);
            this.ctx.stroke();
            
            // Add sparkle particles around the player
            for (let i = 0; i < 3; i++) {
                const angle = (now / 500 + i * (Math.PI * 2 / 3)) % (Math.PI * 2);
                const distance = this.player.radius + 15 + 5 * Math.sin(now / 300);
                const sparkleX = this.player.x + Math.cos(angle) * distance;
                const sparkleY = this.player.y + Math.sin(angle) * distance;
                
                this.ctx.fillStyle = '#FFD700';
                this.ctx.beginPath();
                this.ctx.arc(sparkleX, sparkleY, 3, 0, Math.PI * 2);
                this.ctx.fill();
            }
        }
    }
    
    renderLetterlings() {
        for (const letterling of this.letterlings) {
            if (letterling.isActive) {
                letterling.render(this.ctx);
            }
        }
    }
    
    renderBots() {
        for (const bot of this.bots) {
            if (bot.isActive) {
                bot.render(this.ctx);
            }
        }
    }
    
    renderEnvironmentObjects() {
        if (this.environmentObjects) {
            for (const obj of this.environmentObjects) {
                obj.render(this.ctx);
            }
        }
    }
    
    renderOrbs() {
        for (const orb of this.orbs) {
            orb.render(this.ctx);
        }
    }
    
    renderParticles() {
        for (const particle of this.particles) {
            particle.render(this.ctx);
        }
    }
    
    renderUI() {
        // UI is rendered in HTML overlay, but we could add canvas UI here
        this.renderLetterlingIndicators();
    }
    
    renderLetterlingIndicators() {
        // Show indicators for nearby letterlings off-screen
        const indicatorDistance = 100;
        const screenBounds = {
            left: this.camera.x,
            right: this.camera.x + this.width,
            top: this.camera.y,
            bottom: this.camera.y + this.height
        };
        
        for (const letterling of this.letterlings) {
            if (!letterling.isActive) continue;
            
            // Check if letterling is off-screen but within indicator range
            const distance = Utils.distance(
                this.player.x, this.player.y,
                letterling.x, letterling.y
            );
            
            if (distance < 600 && ( // Only show if within 600px
                letterling.x < screenBounds.left || 
                letterling.x > screenBounds.right ||
                letterling.y < screenBounds.top || 
                letterling.y > screenBounds.bottom
            )) {
                this.renderLetterlingIndicator(letterling, screenBounds);
            }
        }
    }
    
    renderLetterlingIndicator(letterling, screenBounds) {
        // Calculate direction from player to letterling
        const dx = letterling.x - this.player.x;
        const dy = letterling.y - this.player.y;
        const angle = Math.atan2(dy, dx);
        
        // Find edge intersection point
        const margin = 30;
        let indicatorX, indicatorY;
        
        // Calculate where the indicator should appear on screen edge
        const centerX = this.width / 2;
        const centerY = this.height / 2;
        const radius = Math.min(centerX, centerY) - margin;
        
        indicatorX = centerX + Math.cos(angle) * radius;
        indicatorY = centerY + Math.sin(angle) * radius;
        
        // Draw the indicator
        this.ctx.fillStyle = letterling.color;
        this.ctx.strokeStyle = '#333';
        this.ctx.lineWidth = 2;
        
        // Arrow pointing toward letterling
        this.ctx.save();
        this.ctx.translate(indicatorX, indicatorY);
        this.ctx.rotate(angle);
        
        this.ctx.beginPath();
        this.ctx.moveTo(8, 0);
        this.ctx.lineTo(-8, -6);
        this.ctx.lineTo(-5, 0);
        this.ctx.lineTo(-8, 6);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.stroke();
        
        // Letter indicator
        this.ctx.rotate(-angle);
        this.ctx.fillStyle = '#333';
        this.ctx.font = 'bold 12px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(letterling.letter, -15, 0);
        
        this.ctx.restore();
    }
    
    renderDebugInfo() {
        // Debug info panel
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.ctx.fillRect(10, 10, 250, 120);
        
        this.ctx.fillStyle = 'white';
        this.ctx.font = '14px monospace';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`FPS: ${this.debugInfo.fps}`, 20, 30);
        this.ctx.fillText(`Player: ${Math.round(this.player.x)}, ${Math.round(this.player.y)}`, 20, 50);
        this.ctx.fillText(`Velocity: ${Math.round(this.player.vx)}, ${Math.round(this.player.vy)}`, 20, 70);
        this.ctx.fillText(`Camera: ${Math.round(this.camera.x)}, ${Math.round(this.camera.y)}`, 20, 90);
        this.ctx.fillText(`Letterlings: ${this.letterlings.length}`, 20, 110);
        
        // Show mouse target if following
        if (this.inputManager && this.inputManager.isMouseFollowing) {
            this.ctx.save();
            this.ctx.translate(-this.camera.x, -this.camera.y);
            
            // Draw line from player to mouse target
            this.ctx.strokeStyle = 'lime';
            this.ctx.lineWidth = 2;
            this.ctx.setLineDash([5, 5]);
            this.ctx.beginPath();
            this.ctx.moveTo(this.player.x, this.player.y);
            this.ctx.lineTo(this.inputManager.mouseTarget.x, this.inputManager.mouseTarget.y);
            this.ctx.stroke();
            this.ctx.setLineDash([]);
            
            // Draw mouse target
            this.ctx.fillStyle = 'lime';
            this.ctx.beginPath();
            this.ctx.arc(this.inputManager.mouseTarget.x, this.inputManager.mouseTarget.y, 8, 0, Math.PI * 2);
            this.ctx.fill();
            
            this.ctx.restore();
        }
    }
    
    updateFPS() {
        this.debugInfo.frameCount++;
        const now = performance.now();
        
        if (now - this.debugInfo.lastFPSUpdate >= 1000) {
            this.debugInfo.fps = this.debugInfo.frameCount;
            this.debugInfo.frameCount = 0;
            this.debugInfo.lastFPSUpdate = now;
        }
    }
    
    handleKeyDown(event) {
        switch (event.code) {
            case 'Space':
                event.preventDefault();
                if (this.state === 'playing') {
                    this.showRandomUnlockedEmoji();
                }
                break;
            case 'Escape':
                event.preventDefault();
                if (this.state === 'tracing') {
                    this.exitTraceMode();
                } else if (this.levelManager && this.levelManager.isLevelActive()) {
                    // If in a level, show level pause/exit menu
                    this.pauseLevel();
                } else if (this.menuManager && this.menuManager.currentMenu) {
                    // If in menu system, go back or hide menu
                    console.log('🔙 Escape pressed in menu, going back');
                    this.menuManager.goBack();
                } else if (this.state === 'playing') {
                    this.pause();
                } else if (this.menuManager && !this.menuManager.currentMenu) {
                    this.menuManager.showMenu('pause');
                } else if (this.menuManager && this.menuManager.currentMenu) {
                    this.menuManager.hideMenu();
                }
                break;
                
            case 'KeyF':
                this.showDebug = !this.showDebug;
                break;
                
            case 'Tab':
                event.preventDefault();
                if (this.combinedPanel) {
                    this.combinedPanel.toggle();
                }
                break;
        }
    }
    
    exitTraceMode() {
        this.state = 'playing';
        this.interactionBlocked = false; // Re-enable interactions
        
        // Clear the trace state from the letterling
        if (this.currentTracingLetterling) {
            this.currentTracingLetterling.beingTracedByPlayer = false;
            this.currentTracingLetterling = null;
        }
        
        if (this.tracePanel) {
            this.tracePanel.hide();
        }
    }
    
    setInteractionBlocking(blocked) {
        this.interactionBlocked = blocked;
        console.log(`🚫 Interactions ${blocked ? 'blocked' : 'enabled'}`);
    }
    
    addLetterFollower(letter) {
        // Check if this letter is already following
        const existingFollower = this.letterFollowers.find(f => f.letter === letter);
        if (existingFollower) return;
        
        const index = this.letterFollowers.length;
        const follower = new LetterFollower(letter, this.player, index);
        
        // Set up chain following
        if (index > 0) {
            // Follow the previous follower
            follower.setChainTarget(this.letterFollowers[index - 1]);
        }
        
        this.letterFollowers.push(follower);
        console.log(`🐕 Letter '${letter}' is now following the player! (Position ${index + 1})`);
    }
    
    updateLetterFollowers(deltaTime) {
        for (const follower of this.letterFollowers) {
            follower.update(deltaTime);
        }
    }
    
    renderLetterFollowers() {
        for (const follower of this.letterFollowers) {
            follower.render(this.ctx);
        }
    }
    
    // Public methods for other classes to interact with the game
    
    getPlayerScreenPosition() {
        return {
            x: this.player.x - this.camera.x,
            y: this.player.y - this.camera.y
        };
    }
    
    worldToScreen(worldX, worldY) {
        return {
            x: worldX - this.camera.x,
            y: worldY - this.camera.y
        };
    }
    
    screenToWorld(screenX, screenY) {
        return {
            x: screenX + this.camera.x,
            y: screenY + this.camera.y
        };
    }
}

// Simple Firework Particle class for visual effects
class FireworkParticle {
    constructor(config) {
        this.x = config.x;
        this.y = config.y;
        this.vx = config.vx;
        this.vy = config.vy;
        this.color = config.color;
        this.size = config.size;
        this.maxLife = config.life;
        this.life = config.life;
        this.gravity = 150; // Gravity effect
        this.friction = 0.98; // Air resistance
    }
    
    update(deltaTime) {
        // Apply velocity
        this.x += this.vx * deltaTime;
        this.y += this.vy * deltaTime;
        
        // Apply gravity
        this.vy += this.gravity * deltaTime;
        
        // Apply friction
        this.vx *= this.friction;
        this.vy *= this.friction;
        
        // Decrease life
        this.life -= deltaTime;
    }
    
    render(ctx) {
        if (this.life <= 0) return;
        
        const alpha = this.life / this.maxLife;
        const currentSize = this.size * alpha;
        
        // Create a MUCH bigger glowing effect
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 20; // Doubled the glow
        
        // Draw outer glow ring
        const glowSize = currentSize * 2;
        ctx.fillStyle = this.color + Math.floor(alpha * 0.3 * 255).toString(16).padStart(2, '0');
        ctx.beginPath();
        ctx.arc(this.x, this.y, glowSize, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw the main particle
        ctx.fillStyle = this.color + Math.floor(alpha * 255).toString(16).padStart(2, '0');
        ctx.beginPath();
        ctx.arc(this.x, this.y, currentSize, 0, Math.PI * 2);
        ctx.fill();
        
        // Add a bright white center for sparkle effect
        if (alpha > 0.5) {
            ctx.fillStyle = `rgba(255, 255, 255, ${(alpha - 0.5) * 2})`;
            ctx.beginPath();
            ctx.arc(this.x, this.y, currentSize * 0.4, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Reset shadow
        ctx.shadowBlur = 0;
    }
    
    isDead() {
        return this.life <= 0;
    }
}

// Add cleanup method to Game class
Game.prototype.destroy = function() {
    // Stop game loop
    this.isRunning = false;
    
    // Remove event listeners
    if (this.resizeHandler) {
        window.removeEventListener('resize', this.resizeHandler);
    }
    if (this.keyDownHandler) {
        document.removeEventListener('keydown', this.keyDownHandler);
    }
    if (this.visibilityHandler) {
        document.removeEventListener('visibilitychange', this.visibilityHandler);
    }
    
    // Clean up managers
    if (this.dataManager) {
        this.dataManager.destroy();
    }
    if (this.multiplayerManager) {
        this.multiplayerManager.disconnect();
    }
    if (this.classroomManager) {
        this.classroomManager.cleanup();
    }
    if (this.inputManager) {
        this.inputManager.destroy();
    }
    
    // Clear arrays to free memory
    this.particles = [];
    this.letterFollowers = [];
    this.orbs = [];
    
    console.log('🧹 Game cleaned up');
};
