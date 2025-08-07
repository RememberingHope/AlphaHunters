// Level Manager - Handles level definitions, progression, and gameplay

class LevelManager {
    constructor(game) {
        this.game = game;
        this.currentLevel = null;
        this.levelTimer = null;
        this.levelStartTime = 0;
        this.levelDuration = 5 * 60 * 1000; // 5 minutes in milliseconds
        
        // Level-specific score tracking (separate from persistent coins)
        this.currentLevelScore = 0;
        this.currentLevelXP = 0; // Track XP earned in this level
        this.currentLevelTracingScore = 0; // Track cumulative tracing scores (0-100 per trace)
        
        // Define all 11 levels with themes and letter sets
        this.levels = {
            1: {
                id: 1,
                name: "Letter Land",
                theme: "basics",
                description: "Welcome to Letter Land! Learn your first letters.",
                letters: ['a', 'A', 'o', 'O', 'c', 'C'],
                background: "linear-gradient(135deg, #a8e6cf, #88d8a3)",
                primaryColor: "#4CAF50",
                icon: "🌱",
                objectives: [
                    "Trace 10 letters correctly",
                    "Score 1,000 points",
                    "Complete without mistakes"
                ],
                starThresholds: { 1: 1000, 2: 2000, 3: 5000 },
                unlockRequirement: null, // Always unlocked
                petReward: "a"
            },
            2: {
                id: 2,
                name: "Sunny Meadow",
                theme: "nature",
                description: "Practice letters in the sunny meadow!",
                letters: ['s', 'S', 'n', 'N', 't', 'T'],
                background: "linear-gradient(135deg, #fff9c4, #f4d03f)",
                primaryColor: "#FFC107",
                icon: "☀️",
                objectives: [
                    "Trace 15 letters correctly",
                    "Score 1,500 points",
                    "No skipped letters"
                ],
                starThresholds: { 1: 1500, 2: 2500, 3: 6000 },
                unlockRequirement: { level: 1, stars: 1 },
                petReward: "s"
            },
            3: {
                id: 3,
                name: "Ocean Waves",
                theme: "water",
                description: "Dive into letters by the ocean!",
                letters: ['i', 'I', 'e', 'E', 'r', 'R'],
                background: "linear-gradient(135deg, #74b9ff, #0984e3)",
                primaryColor: "#2196F3",
                icon: "🌊",
                objectives: [
                    "Trace 20 letters correctly",
                    "Score 2,000 points",
                    "Complete within 4 minutes"
                ],
                starThresholds: { 1: 2000, 2: 3000, 3: 7000 },
                unlockRequirement: { level: 2, stars: 1 },
                petReward: "i"
            },
            4: {
                id: 4,
                name: "Magic Forest",
                theme: "fantasy",
                description: "Discover magical letters in the enchanted forest!",
                letters: ['l', 'L', 'm', 'M', 'h', 'H'],
                background: "linear-gradient(135deg, #a29bfe, #6c5ce7)",
                primaryColor: "#9C27B0",
                icon: "🌲",
                objectives: [
                    "Trace 25 letters correctly",
                    "Score 2,500 points",
                    "Achieve 90% accuracy"
                ],
                starThresholds: { 1: 2500, 2: 3500, 3: 8000 },
                unlockRequirement: { level: 3, stars: 1 },
                petReward: "l"
            },
            5: {
                id: 5,
                name: "Desert Adventure",
                theme: "desert",
                description: "Explore letters in the vast desert!",
                letters: ['d', 'D', 'u', 'U', 'p', 'P'],
                background: "linear-gradient(135deg, #ffeaa7, #fdcb6e)",
                primaryColor: "#FF9800",
                icon: "🐪",
                objectives: [
                    "Trace 30 letters correctly",
                    "Score 3,000 points",
                    "Find 3 bonus letters"
                ],
                starThresholds: { 1: 3000, 2: 4000, 3: 9000 },
                unlockRequirement: { level: 4, stars: 1 },
                petReward: "d"
            },
            6: {
                id: 6,
                name: "Space Station",
                theme: "space",
                description: "Blast off to practice letters in space!",
                letters: ['b', 'B', 'f', 'F', 'g', 'G'],
                background: "linear-gradient(135deg, #2d3436, #636e72)",
                primaryColor: "#607D8B",
                icon: "🚀",
                objectives: [
                    "Trace 35 letters correctly",
                    "Score 3,500 points",
                    "Complete without retries"
                ],
                starThresholds: { 1: 3500, 2: 4500, 3: 10000 },
                unlockRequirement: { level: 5, stars: 2 },
                petReward: "b"
            },
            7: {
                id: 7,
                name: "Pirate Cove",
                theme: "pirate",
                description: "Ahoy! Hunt for letter treasures!",
                letters: ['v', 'V', 'w', 'W', 'k', 'K'],
                background: "linear-gradient(135deg, #00b894, #00a085)",
                primaryColor: "#009688",
                icon: "🏴‍☠️",
                objectives: [
                    "Trace 40 letters correctly",
                    "Score 4,000 points",
                    "Discover hidden treasure"
                ],
                starThresholds: { 1: 4000, 2: 5000, 3: 11000 },
                unlockRequirement: { level: 6, stars: 2 },
                petReward: "v"
            },
            8: {
                id: 8,
                name: "Candy Kingdom",
                theme: "candy",
                description: "Sweet letters await in Candy Kingdom!",
                letters: ['j', 'J', 'q', 'Q', 'x', 'X'],
                background: "linear-gradient(135deg, #fd79a8, #e84393)",
                primaryColor: "#E91E63",
                icon: "🍭",
                objectives: [
                    "Trace 45 letters correctly",
                    "Score 4,500 points",
                    "Collect 5 candy bonuses"
                ],
                starThresholds: { 1: 4500, 2: 5500, 3: 12000 },
                unlockRequirement: { level: 7, stars: 2 },
                petReward: "j"
            },
            9: {
                id: 9,
                name: "Robot Factory",
                theme: "robot",
                description: "Build letters with helpful robots!",
                letters: ['y', 'Y', 'z', 'Z', '1', '2'],
                background: "linear-gradient(135deg, #95a5a6, #7f8c8d)",
                primaryColor: "#795548",
                icon: "🤖",
                objectives: [
                    "Trace 50 letters correctly",
                    "Score 5,000 points",
                    "Program robot helpers"
                ],
                starThresholds: { 1: 5000, 2: 6000, 3: 13000 },
                unlockRequirement: { level: 8, stars: 2 },
                petReward: "y"
            },
            10: {
                id: 10,
                name: "Dinosaur Valley",
                theme: "dinosaur",
                description: "Roar with the dinosaurs while tracing letters!",
                letters: ['3', '4', '5', '6', '7', '8'],
                background: "linear-gradient(135deg, #badc58, #6c5ce7)",
                primaryColor: "#8BC34A",
                icon: "🦕",
                objectives: [
                    "Trace 60 numbers correctly",
                    "Score 6,000 points",
                    "Tame 3 dino friends"
                ],
                starThresholds: { 1: 6000, 2: 7000, 3: 15000 },
                unlockRequirement: { level: 9, stars: 3 },
                petReward: "3"
            },
            11: {
                id: 11,
                name: "Master's Challenge",
                theme: "master",
                description: "The ultimate letter mastery test!",
                letters: ['9', '0', '!', '?', '@', '#'],
                background: "linear-gradient(135deg, #ffd700, #ff6b6b)",
                primaryColor: "#FF5722",
                icon: "👑",
                objectives: [
                    "Trace 75 symbols correctly",
                    "Score 10,000 points",
                    "Achieve perfect accuracy"
                ],
                starThresholds: { 1: 10000, 2: 15000, 3: 20000 },
                unlockRequirement: { level: 10, stars: 3 },
                petReward: "👑"
            }
        };
        
        this.init();
    }
    
    init() {
        // Load custom teacher levels after standard levels are defined
        this.loadCustomLevels();
        // LevelManager ready with all levels
    }
    
    getLevel(levelId) {
        return this.levels[levelId] || null;
    }
    
    getAllLevels() {
        return Object.values(this.levels);
    }
    
    isLevelUnlocked(levelId, character) {
        if (!character) return false;
        
        const level = this.getLevel(levelId);
        if (!level) return false;
        
        // Level 1 is always unlocked
        if (levelId === 1) return true;
        
        // Check unlock requirement
        const requirement = level.unlockRequirement;
        if (!requirement) return true;
        
        const requiredLevelStats = character.progression.levelStats[requirement.level];
        if (!requiredLevelStats) return false;
        
        return requiredLevelStats.stars >= requirement.stars;
    }
    
    getUnlockedLevels(character) {
        if (!character) return [1];
        
        const unlockedLevels = [];
        // Check all levels, including custom ones
        Object.values(this.levels).forEach(level => {
            if (this.isLevelUnlocked(level.id, character)) {
                unlockedLevels.push(level.id);
            }
        });
        return unlockedLevels;
    }
    
    startLevel(levelId, character, isMultiplayer = false) {
        const level = this.getLevel(levelId);
        if (!level) {
            console.error(`Level ${levelId} not found`);
            return false;
        }
        
        // In multiplayer mode, skip unlock check (host already checked)
        if (!isMultiplayer && !this.isLevelUnlocked(levelId, character)) {
            console.error(`Level ${levelId} is not unlocked`);
            return false;
        }
        
        console.log(`🎯 Starting Level ${levelId}: ${level.name}${isMultiplayer ? ' (Multiplayer)' : ''}`);
        
        this.currentLevel = level;
        this.levelStartTime = Date.now();
        this.isMultiplayerMode = isMultiplayer;
        
        // Set duration based on level (custom levels can have custom duration)
        if (level.duration) {
            this.levelDuration = level.duration * 1000; // Convert seconds to milliseconds
        } else {
            this.levelDuration = 5 * 60 * 1000; // Default 5 minutes
        }
        
        // Update game state
        this.game.state = 'playing';
        
        // Track level activity
        if (this.game.timeTracker) {
            this.game.timeTracker.startActivity('level');
        }
        
        // Hide menu and show game
        if (this.game.menuManager) {
            this.game.menuManager.hideMenu();
        }
        
        // Debug log character stats at level start
        this.logCharacterStats();
        if (this.game.canvas) {
            this.game.canvas.style.display = 'block';
        }
        
        // Ensure HUD is visible and coin counter shows coins (not score)
        const hudOverlay = document.getElementById('hudOverlay');
        if (hudOverlay) {
            hudOverlay.classList.remove('hidden');
            hudOverlay.style.display = 'block';
            console.log('✅ HUD overlay made visible for level');
        }
        
        // Ensure coin counter shows actual coins during level
        const coinCounter = document.getElementById('coinCounter');
        if (coinCounter && this.game.economy) {
            const countElement = coinCounter.querySelector('.count');
            const iconElement = coinCounter.querySelector('.icon');
            
            if (countElement) {
                countElement.textContent = this.game.economy.coins.toString();
            }
            if (iconElement) {
                iconElement.textContent = '💰'; // Coin icon
            }
            console.log(`💰 Coin counter set to show ${this.game.economy.coins} coins during level`);
        }
        
        // Set up level-specific configuration
        this.setupLevelEnvironment(level);
        
        // Start level timer
        this.startLevelTimer();
        
        // Disable progression system's letter management during levels
        if (this.game.progression) {
            this.game.progression.levelMode = true;
            this.game.progression.levelLetters = level.letters;
        }
        
        // Update spawn pool with level letters ONLY
        if (this.game.spawnPool) {
            console.log(`🎯 Level ${level.id}: Setting spawn pool to ONLY [${level.letters.join(', ')}]`);
            this.game.spawnPool.pauseSpawning = false; // Re-enable spawning
            this.game.spawnPool.updateAvailableLetters(level.letters, level.id);
            // Force complete pool refresh to ensure only level letters spawn
            this.game.spawnPool.forcePoolRefresh(level.letters, level.id);
        }
        
        // Reset score and XP for this level but preserve player progression
        this.resetLevelScore();
        
        // Clear any existing letter followers from previous level
        if (this.game.letterFollowers) {
            this.game.letterFollowers = [];
            console.log('🧹 Cleared letter followers for new level');
        }
        
        // Generate world entities now that we're in playing state
        if (this.game.worldManager) {
            console.log('🌍 Generating world entities for level');
            this.game.worldManager.generateWorld();
        }
        
        // Show level start notification
        this.showLevelStartNotification(level);
        
        return true;
    }
    
    resetLevelScore() {
        // Reset level-specific score, XP, and tracing score
        this.currentLevelScore = 0;
        this.currentLevelXP = 0;
        this.currentLevelTracingScore = 0;
        console.log('📊 Level score, XP, and tracing score reset to 0');
        
        // Keep coin counter showing coins, don't change it to show score
        // The leaderboard will show the level score separately
        console.log('💰 Keeping coin display unchanged - coins remain visible during level');
        
        console.log('🔄 Level score reset complete');
    }
    
    setupLevelEnvironment(level) {
        // Update game visual theme based on level
        document.documentElement.style.setProperty('--level-bg', level.background);
        document.documentElement.style.setProperty('--level-primary', level.primaryColor);
        
        // Update canvas background to match level theme
        const canvas = document.getElementById('gameCanvas');
        if (canvas) {
            // Convert the level's primary color to a darker shade for the canvas
            const canvasColor = this.adjustColorBrightness(level.primaryColor, -20);
            const borderColor = this.adjustColorBrightness(level.primaryColor, -40);
            
            canvas.style.background = canvasColor;
            canvas.style.borderColor = borderColor;
            
            console.log(`🎨 Canvas theme updated: ${canvasColor} with border ${borderColor}`);
        }
        
        // Update letterling appearance based on level theme
        this.setupLevelLetterlingTheme(level);
        
        // Update HUD with level information
        this.updateLevelHUD(level);
    }
    
    adjustColorBrightness(hex, percent) {
        // Remove # if present
        hex = hex.replace('#', '');
        
        // Handle 3-character hex codes
        if (hex.length === 3) {
            hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
        }
        
        // Parse hex to RGB
        let r = parseInt(hex.substring(0, 2), 16);
        let g = parseInt(hex.substring(2, 4), 16);
        let b = parseInt(hex.substring(4, 6), 16);
        
        // If parsing failed, return original color
        if (isNaN(r) || isNaN(g) || isNaN(b)) {
            console.warn(`Failed to parse color: ${hex}`);
            return '#' + hex;
        }
        
        // Adjust brightness
        r = Math.max(0, Math.min(255, r + (r * percent / 100)));
        g = Math.max(0, Math.min(255, g + (g * percent / 100)));
        b = Math.max(0, Math.min(255, b + (b * percent / 100)));
        
        // Convert back to hex
        const result = '#' + Math.round(r).toString(16).padStart(2, '0') + 
                               Math.round(g).toString(16).padStart(2, '0') + 
                               Math.round(b).toString(16).padStart(2, '0');
        
        console.log(`Color adjustment: ${hex} -> ${result} (${percent}%)`);
        return result;
    }
    
    setupLevelLetterlingTheme(level) {
        // Set theme data that letterlings can access
        if (this.game.worldManager) {
            this.game.worldManager.currentLevelTheme = {
                primaryColor: level.primaryColor,
                theme: level.theme,
                background: level.background
            };
            console.log(`🎨 Letterling theme set: ${level.theme} (${level.primaryColor})`);
        }
    }
    
    updateLevelHUD(level) {
        // Update level display in HUD
        const levelDisplay = document.getElementById('levelDisplay');
        if (levelDisplay) {
            const valueElement = levelDisplay.querySelector('.value');
            if (valueElement) {
                valueElement.textContent = `${level.id}: ${level.name}`;
            }
        }
    }
    
    startLevelTimer() {
        if (this.levelTimer) {
            clearInterval(this.levelTimer);
        }
        
        const updateTimer = () => {
            const elapsed = Date.now() - this.levelStartTime;
            const remaining = Math.max(0, this.levelDuration - elapsed);
            
            // Update timer display
            this.updateTimerDisplay(remaining);
            
            // Check if time is up
            if (remaining <= 0) {
                this.endLevel('timeout');
            }
        };
        
        this.levelTimer = setInterval(updateTimer, 1000);
        updateTimer(); // Initial update
    }
    
    updateTimerDisplay(remainingTime) {
        const minutes = Math.floor(remainingTime / 60000);
        const seconds = Math.floor((remainingTime % 60000) / 1000);
        const timeString = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        
        // Update timer in HUD (if exists)
        let timerElement = document.getElementById('levelTimer');
        if (!timerElement) {
            // Create timer element if it doesn't exist
            const hudLeft = document.querySelector('.hud-left');
            if (hudLeft) {
                timerElement = document.createElement('div');
                timerElement.id = 'levelTimer';
                timerElement.className = 'hud-element';
                timerElement.style.cssText = `
                    background: rgba(255, 0, 0, 0.8);
                    color: white;
                    padding: 8px 12px;
                    border-radius: 8px;
                    font-weight: bold;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                `;
                timerElement.innerHTML = `
                    <span class="label" style="font-size: 12px; opacity: 0.9;">Time</span>
                    <div class="value" style="font-size: 18px; margin-top: 2px;">${timeString}</div>
                `;
                // Insert at the top of HUD for visibility
                hudLeft.insertBefore(timerElement, hudLeft.firstChild);
                console.log('⏰ Level timer created and added to HUD');
            }
        } else {
            const valueElement = timerElement.querySelector('.value');
            if (valueElement) {
                valueElement.textContent = timeString;
                
                // Change color based on remaining time
                if (remainingTime < 60000) { // Last minute
                    timerElement.style.background = 'rgba(255, 0, 0, 0.9)';
                    timerElement.style.animation = 'pulse 1s infinite';
                } else if (remainingTime < 120000) { // Last 2 minutes
                    timerElement.style.background = 'rgba(255, 165, 0, 0.8)';
                }
            }
        }
        
        // Add pulsing animation for urgency
        if (remainingTime < 60000 && !document.querySelector('#timerPulseStyle')) {
            const style = document.createElement('style');
            style.id = 'timerPulseStyle';
            style.textContent = `
                @keyframes pulse {
                    0% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(1.05); opacity: 0.8; }
                    100% { transform: scale(1); opacity: 1; }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    endLevel(reason = 'completed') {
        if (!this.currentLevel) return;
        
        console.log(`🏁 Level ${this.currentLevel.id} ended: ${reason}`);
        
        // End level activity tracking
        if (this.game.timeTracker) {
            this.game.timeTracker.endCurrentActivity();
        }
        
        // Set game state to level results (pauses gameplay)
        this.game.state = 'levelResults';
        
        // Stop timer
        if (this.levelTimer) {
            clearInterval(this.levelTimer);
            this.levelTimer = null;
        }
        
        // Calculate results
        const results = this.calculateLevelResults(reason);
        
        // Collect letter pets from letterFollowers
        const collectedPets = this.collectLevelPets();
        results.petsCollected = collectedPets;
        
        // Update character progression
        if (this.game.dataManager && this.game.dataManager.getCurrentCharacter()) {
            const character = this.game.dataManager.getCurrentCharacter();
            const completionResult = this.game.dataManager.completeLevelWithStats(
                this.currentLevel.id,
                results.score,
                results.stars
            );
            
            // Award coins based on level performance (separate from score)
            const coinReward = this.calculateCoinReward(results.score, results.stars);
            this.game.dataManager.addCoins(coinReward);
            results.coinsEarned = coinReward;
            console.log(`🪙 Awarded ${coinReward} coins for level performance`);
            
            // Reset time limits if level was completed (not just exited)
            if (this.game.timeLimitManager && results.stars > 0) {
                this.game.timeLimitManager.resetLimits();
            }
            
            // Sync game state with updated character data
            this.game.dataManager.syncGameState();
            
            // Add collected pets to pet farm
            if (collectedPets.length > 0) {
                console.log(`🐾 Adding ${collectedPets.length} pets to farm`);
                if (!this.game.petFarm) {
                    this.game.petFarm = new PetFarm(this.game);
                }
                // Add pets to character data and farm
                collectedPets.forEach(pet => {
                    if (typeof pet === 'object' && pet.letter && pet.emoji) {
                        this.game.dataManager.addPetToFarm(pet.letter, pet.emoji, this.currentLevel.id);
                    }
                });
                
                // Update the visual pet farm
                if (this.game.petFarm) {
                    this.game.petFarm.loadPetsFromCharacter();
                }
            }
            
            results.unlockInfo = completionResult;
        }
        
        // Show level completion screen
        this.showLevelResults(results);
        
        // Clean up level environment
        this.cleanupLevel();
    }
    
    calculateLevelResults(reason) {
        // Calculate final score including base score and XP earned
        const baseScore = this.currentLevelScore;
        const xpEarned = this.currentLevelXP;
        const xpBonus = xpEarned * 10; // Each XP point adds 10 to the final score
        const currentScore = baseScore + xpBonus;
        const level = this.currentLevel;
        
        console.log(`📊 Level ${level.id} Results: Base Score = ${baseScore}, XP = ${xpEarned}, XP Bonus = ${xpBonus}, Total Score = ${currentScore}, Reason = ${reason}`);
        console.log(`📊 Level score breakdown: Base(${baseScore}) + XP Bonus(${xpBonus}) = ${currentScore}`);
        
        // Calculate stars based on score thresholds
        let stars = 0;
        const thresholds = level.starThresholds;
        console.log(`⭐ Star calculation: Score ${currentScore} vs thresholds [1⭐=${thresholds[1]}, 2⭐=${thresholds[2]}, 3⭐=${thresholds[3]}]`);
        
        if (currentScore >= thresholds[3]) {
            stars = 3;
            console.log(`⭐ Earned 3 stars! (${currentScore} >= ${thresholds[3]})`);
        }
        else if (currentScore >= thresholds[2]) {
            stars = 2;
            console.log(`⭐ Earned 2 stars! (${currentScore} >= ${thresholds[2]})`);
        }
        else if (currentScore >= thresholds[1]) {
            stars = 1;
            console.log(`⭐ Earned 1 star! (${currentScore} >= ${thresholds[1]})`);
        }
        else {
            console.log(`⭐ No stars earned. Score ${currentScore} < ${thresholds[1]}`);
        }
        
        // Coins will be calculated separately in calculateCoinReward()
        let coinsEarned = 0; // Placeholder, will be set in endLevel()
        
        const elapsedTime = Date.now() - this.levelStartTime;
        const timeBonus = reason === 'completed' && elapsedTime < this.levelDuration * 0.8;
        
        return {
            level: level,
            score: currentScore,
            baseScore: baseScore,
            xpEarned: xpEarned,
            xpBonus: xpBonus,
            stars: stars,
            coinsEarned: coinsEarned,
            timeBonus: timeBonus,
            reason: reason,
            elapsedTime: elapsedTime
        };
    }
    
    calculateCoinReward(score, stars) {
        // Base coin reward based on score (reduced from economy system)
        const baseCoins = Math.floor(score / 20); // Reduced rate: 1 coin per 20 points
        
        // Star bonus
        const starBonus = stars * 25; // 25 coins per star
        
        // Level completion bonus
        const completionBonus = 10;
        
        const totalCoins = baseCoins + starBonus + completionBonus;
        
        console.log(`🪙 Coin calculation: base(${baseCoins}) + stars(${starBonus}) + completion(${completionBonus}) = ${totalCoins}`);
        return totalCoins;
    }
    
    collectLevelPets() {
        // Collect all letter followers as pets with their emojis
        const pets = [];
        
        if (this.game.letterFollowers && this.game.letterFollowers.length > 0) {
            this.game.letterFollowers.forEach(follower => {
                pets.push({
                    letter: follower.letter,
                    emoji: follower.emoji
                });
            });
            
            console.log(`🐾 Collected ${pets.length} letter pets with emojis: [${pets.map(p => p.letter + p.emoji).join(', ')}]`);
            
            // Clear letter followers for next level
            this.game.letterFollowers = [];
        }
        
        return pets;
    }
    
    showLevelStartNotification(level) {
        // Create temporary notification overlay
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed; top: 50%; left: 50%;
            transform: translate(-50%, -50%);
            background: ${level.background};
            color: white; padding: 30px 40px;
            border-radius: 20px; text-align: center;
            font-family: 'Comic Sans MS', cursive;
            font-size: 24px; font-weight: bold;
            z-index: 3000; animation: fadeInOut 3s ease-in-out;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        `;
        
        notification.innerHTML = `
            <div style="font-size: 48px; margin-bottom: 10px;">${level.icon}</div>
            <div style="font-size: 28px; margin-bottom: 10px;">Level ${level.id}</div>
            <div style="font-size: 24px; margin-bottom: 15px;">${level.name}</div>
            <div style="font-size: 16px; opacity: 0.9;">${level.description}</div>
        `;
        
        // Add CSS animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeInOut {
                0% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
                20%, 80% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
                100% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(notification);
        
        // Remove after animation
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
            if (style.parentNode) {
                style.parentNode.removeChild(style);
            }
        }, 3000);
    }
    
    showLevelResults(results) {
        const level = results.level;
        const stars = '⭐'.repeat(results.stars) + '☆'.repeat(3 - results.stars);
        
        // Create results overlay
        const overlay = document.createElement('div');
        overlay.id = 'levelResultsOverlay';
        overlay.style.cssText = `
            position: fixed; top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0,0,0,0.8); display: flex;
            justify-content: center; align-items: center;
            z-index: 3000; font-family: 'Comic Sans MS', cursive;
        `;
        
        overlay.innerHTML = `
            <div style="
                background: white; padding: 40px; border-radius: 20px;
                text-align: center; max-width: 500px; min-width: 400px;
                box-shadow: 0 20px 40px rgba(0,0,0,0.3);
            ">
                <div style="font-size: 64px; margin-bottom: 20px;">${level.icon}</div>
                <h2 style="font-size: 32px; margin-bottom: 10px; color: ${level.primaryColor};">
                    Level ${level.id} ${results.reason === 'completed' ? 'Complete!' : 'Time Up!'}
                </h2>
                <h3 style="font-size: 24px; margin-bottom: 20px; color: #666;">
                    ${level.name}
                </h3>
                
                <div style="font-size: 36px; margin: 20px 0;">${stars}</div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 30px 0;">
                    <div>
                        <div style="font-size: 24px; font-weight: bold; color: ${level.primaryColor};">
                            ${results.score.toLocaleString()}
                        </div>
                        <div style="font-size: 14px; color: #666;">Total Points</div>
                    </div>
                    <div>
                        <div style="font-size: 24px; font-weight: bold; color: #4CAF50;">
                            +${results.coinsEarned}
                        </div>
                        <div style="font-size: 14px; color: #666;">Coins</div>
                    </div>
                </div>
                
                <div style="background: #F5F5F5; padding: 15px; border-radius: 10px; margin: 20px 0;">
                    <div style="font-size: 16px; color: #666; margin-bottom: 10px;">Score Breakdown</div>
                    <div style="display: flex; flex-direction: column; gap: 8px;">
                        <div style="display: flex; justify-content: space-between;">
                            <span>Base Score:</span>
                            <span style="font-weight: bold;">${results.baseScore.toLocaleString()}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between;">
                            <span>XP Earned:</span>
                            <span style="font-weight: bold; color: #9C27B0;">${results.xpEarned} XP</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; border-top: 1px solid #DDD; padding-top: 8px;">
                            <span>XP Bonus (${results.xpEarned} × 10):</span>
                            <span style="font-weight: bold; color: #9C27B0;">+${results.xpBonus}</span>
                        </div>
                    </div>
                </div>
                
                ${results.petsCollected && results.petsCollected.length > 0 ? `
                    <div style="background: #E8F5E8; padding: 15px; border-radius: 10px; margin: 20px 0;">
                        <div style="font-size: 18px; color: #4CAF50;">🐾 Pets Rescued!</div>
                        <div style="font-size: 24px; margin: 5px 0;">
                            ${results.petsCollected.map(pet => `<span style="margin: 0 5px;">${pet}</span>`).join('')}
                        </div>
                        <div style="font-size: 14px; opacity: 0.8; margin-top: 5px;">
                            Added to your Pet Farm!
                        </div>
                    </div>
                ` : ''}
                
                ${results.unlockInfo?.levelUnlocked ? `
                    <div style="background: #FFF3E0; padding: 15px; border-radius: 10px; margin: 20px 0;">
                        <div style="font-size: 18px; color: #FF9800;">🔓 New Level Unlocked!</div>
                        <div style="font-size: 16px; margin: 5px 0;">Level ${results.unlockInfo.levelUnlocked}</div>
                    </div>
                ` : ''}
                
                <div style="display: flex; gap: 15px; justify-content: center; margin-top: 30px;">
                    <button id="retryLevelBtn" style="
                        background: linear-gradient(135deg, #FF9800, #F57C00);
                        border: none; color: white; padding: 15px 25px;
                        border-radius: 10px; font-size: 16px; font-weight: bold;
                        cursor: pointer; transition: all 0.3s;
                    ">🔄 Retry</button>
                    
                    ${results.unlockInfo?.levelUnlocked ? `
                        <button id="nextLevelBtn" data-level-id="${results.unlockInfo.levelUnlocked}" style="
                            background: linear-gradient(135deg, #4CAF50, #45a049);
                            border: none; color: white; padding: 15px 25px;
                            border-radius: 10px; font-size: 16px; font-weight: bold;
                            cursor: pointer; transition: all 0.3s;
                        ">➡️ Next Level</button>
                    ` : ''}
                    
                    <button id="levelSelectBtn" style="
                        background: linear-gradient(135deg, #2196F3, #1976D2);
                        border: none; color: white; padding: 15px 25px;
                        border-radius: 10px; font-size: 16px; font-weight: bold;
                        cursor: pointer; transition: all 0.3s;
                    ">📋 Level Select</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(overlay);
        
        // Add event listeners for result buttons
        document.getElementById('retryLevelBtn').addEventListener('click', () => this.retryLevel());
        document.getElementById('levelSelectBtn').addEventListener('click', () => this.returnToLevelSelect());
        
        const nextLevelBtn = document.getElementById('nextLevelBtn');
        if (nextLevelBtn) {
            nextLevelBtn.addEventListener('click', () => {
                const nextLevelId = parseInt(nextLevelBtn.dataset.levelId);
                const character = this.game.dataManager.getCurrentCharacter();
                this.startLevel(nextLevelId, character);
            });
        }
    }
    
    retryLevel() {
        // Remove results overlay
        const overlay = document.getElementById('levelResultsOverlay');
        if (overlay) overlay.remove();
        
        // Restart current level
        if (this.currentLevel && this.game.dataManager) {
            const character = this.game.dataManager.getCurrentCharacter();
            this.startLevel(this.currentLevel.id, character);
        }
    }
    
    returnToLevelSelect() {
        // Remove results overlay
        const overlay = document.getElementById('levelResultsOverlay');
        if (overlay) overlay.remove();
        
        // Clean up and return to level select
        this.cleanupLevel();
        
        if (this.game.menuManager && this.game.dataManager) {
            const character = this.game.dataManager.getCurrentCharacter();
            this.game.menuManager.showMenu('levelSelect', { character: character });
        }
    }
    
    cleanupLevel() {
        // Stop timer
        if (this.levelTimer) {
            clearInterval(this.levelTimer);
            this.levelTimer = null;
        }
        
        // Remove timer from HUD
        const timerElement = document.getElementById('levelTimer');
        if (timerElement) {
            timerElement.remove();
        }
        
        // Clear all letterlings
        if (this.game.letterlings) {
            console.log(`🧹 Clearing ${this.game.letterlings.length} letterlings`);
            this.game.letterlings = [];
        }
        
        // Clear all bots
        if (this.game.bots) {
            console.log(`🤖 Clearing ${this.game.bots.length} bots`);
            this.game.bots = [];
        }
        
        // Clear any orbs
        if (this.game.orbs) {
            this.game.orbs = [];
        }
        
        // Clear environment objects
        if (this.game.environmentObjects) {
            this.game.environmentObjects = [];
        }
        
        // Stop spawn pool from generating new entities
        if (this.game.spawnPool) {
            this.game.spawnPool.pauseSpawning = true;
        }
        
        // Reset visual theme
        document.documentElement.style.removeProperty('--level-bg');
        document.documentElement.style.removeProperty('--level-primary');
        
        // Reset canvas to default appearance
        const canvas = document.getElementById('gameCanvas');
        if (canvas) {
            canvas.style.background = '#4CAF50'; // Default green
            canvas.style.borderColor = '#2E7D32'; // Default dark green
            console.log('🎨 Canvas theme reset to default');
        }
        
        // Clear letterling theme
        if (this.game.worldManager) {
            this.game.worldManager.currentLevelTheme = null;
        }
        
        // Clear economy level mode and restore coin display
        if (this.game.economy) {
            this.game.economy.levelMode = false;
            
            // Restore coin counter to show coins instead of score
            const coinCounter = document.getElementById('coinCounter');
            if (coinCounter) {
                const countElement = coinCounter.querySelector('.count');
                const iconElement = coinCounter.querySelector('.icon');
                
                if (countElement) {
                    countElement.textContent = this.game.economy.coins.toString();
                }
                if (iconElement) {
                    iconElement.textContent = '🢰'; // Coin icon
                }
            }
            console.log('🪙 Coin display restored after level cleanup');
        }
        
        // Re-enable progression system's letter management
        if (this.game.progression) {
            this.game.progression.levelMode = false;
            this.game.progression.levelLetters = null;
            // Restore normal progression-based letters
            this.game.progression.checkUnlocks();
        }
        
        // Clear current level
        this.currentLevel = null;
        
        console.log('🧹 Level cleanup completed');
    }
    
    getCurrentLevel() {
        return this.currentLevel;
    }
    
    isLevelActive() {
        const isActive = this.currentLevel !== null && this.levelTimer !== null;
        // Check if level is currently active
        return isActive;
    }
    
    addScore(points) {
        if (!this.isLevelActive()) return;
        
        this.currentLevelScore += points;
        console.log(`📈 Level score: +${points} = ${this.currentLevelScore} total`);
        
        // Don't update coin counter with score - let it show coins
        // The leaderboard shows the level score
        console.log(`📊 Level score updated to ${this.currentLevelScore}, but coin counter shows coins`);
    }
    
    addLevelXP(xp) {
        if (!this.isLevelActive()) return;
        
        this.currentLevelXP += xp;
        console.log(`💫 Level XP: +${xp} = ${this.currentLevelXP} total`);
    }
    
    addTracingScore(score) {
        if (!this.isLevelActive()) return;
        
        this.currentLevelTracingScore += score;
        console.log(`✏️ Tracing Score: +${score} = ${this.currentLevelTracingScore} total`);
    }
    
    getRemainingTime() {
        if (!this.isLevelActive()) return 0;
        
        const elapsed = Date.now() - this.levelStartTime;
        return Math.max(0, this.levelDuration - elapsed);
    }
    
    // Emergency exit from level
    exitLevel() {
        if (this.isLevelActive()) {
            this.endLevel('exited');
        }
    }
    
    logCharacterStats() {
        const character = this.game.dataManager?.getCurrentCharacter();
        const player = this.game.player;
        
        console.log('📊 === CHARACTER STATS AT LEVEL START ===');
        
        if (character) {
            console.log(`👤 Character: ${character.identity.name} (${character.identity.avatar})`);
            console.log(`🎮 Level: ${character.progression.level}`);
            console.log(`✨ XP: ${character.progression.xp}`);
            console.log(`🪙 Coins: ${character.progression.coins}`);
            console.log(`🎯 Unlocked Levels: [${character.progression.unlockedLevels.join(', ')}]`);
            
            // Log any active upgrades
            if (character.customization?.activeUpgrades?.length > 0) {
                console.log(`🚀 Active Upgrades: ${character.customization.activeUpgrades.length}`);
                character.customization.activeUpgrades.forEach((upgrade, index) => {
                    console.log(`  ${index + 1}. ${upgrade.name} - ${upgrade.stat} +${Math.round(upgrade.value * 100)}%`);
                });
            } else {
                console.log('🚀 Active Upgrades: None');
            }
        } else {
            console.log('⚠️ No character data found!');
        }
        
        if (player) {
            console.log('\n🎮 === PLAYER STATS ===');
            console.log(`📏 Radius: ${player.radius} (base: ${this.game.basePlayerStats.radius})`);
            console.log(`🏃 Max Speed: ${player.maxSpeed} (base: ${this.game.basePlayerStats.maxSpeed})`);
            console.log(`⚡ Acceleration: ${player.acceleration} (base: ${this.game.basePlayerStats.acceleration})`);
            console.log(`📍 Position: (${Math.round(player.x)}, ${Math.round(player.y)})`);
            
            // Check for size discrepancy
            if (player.radius > this.game.basePlayerStats.radius * 1.5) {
                console.warn(`⚠️ Player radius seems too large! ${player.radius} vs base ${this.game.basePlayerStats.radius}`);
            }
        } else {
            console.log('⚠️ No player object found!');
        }
        
        console.log('📊 === END STATS ===\n');
    }
    
    loadCustomLevels() {
        try {
            const stored = localStorage.getItem('alphahunters_custom_levels');
            console.log('🔍 Checking for custom levels in localStorage...');
            if (stored) {
                const customLevels = JSON.parse(stored);
                console.log(`📚 Found ${customLevels.length} custom teacher levels:`, customLevels);
                
                // Add custom levels starting from ID 100
                let customId = 100;
                customLevels.forEach(level => {
                    // Convert custom level format to game level format
                    const gameLevel = {
                        id: customId,
                        name: level.name,
                        theme: 'custom',
                        description: `Custom level with ${level.letters.length} letters`,
                        letters: level.letters,
                        background: level.theme.background || "linear-gradient(135deg, #E8F5E9, #4CAF50)",
                        primaryColor: level.theme.primaryColor || "#4CAF50",
                        icon: level.icon || "⭐",
                        objectives: [
                            `Trace ${Math.floor(level.letters.length * 2)} letters correctly`,
                            `Score ${level.starThresholds[0]} points`,
                            "Complete the level"
                        ],
                        starThresholds: {
                            1: level.starThresholds[0],
                            2: level.starThresholds[1],
                            3: level.starThresholds[2]
                        },
                        unlockRequirement: null, // Custom levels are always available
                        petReward: level.letters[0], // Use first letter as pet reward
                        duration: level.duration,
                        spawnRate: level.spawnRate || 2.0,
                        isCustom: true,
                        originalId: level.id // Keep reference to original ID
                    };
                    
                    this.levels[customId] = gameLevel;
                    console.log(`✅ Added custom level: ${gameLevel.name} (ID: ${customId})`);
                    customId++;
                });
                
                console.log('✅ Custom levels loaded successfully');
                console.log('📋 Total levels now:', Object.keys(this.levels).length);
            } else {
                console.log('ℹ️ No custom levels found in localStorage');
            }
        } catch (error) {
            console.error('Error loading custom levels:', error);
        }
    }
    
    getLevelTime() {
        if (!this.levelActive || !this.levelStartTime) return 0;
        return Math.floor((Date.now() - this.levelStartTime) / 1000); // Return seconds
    }
}