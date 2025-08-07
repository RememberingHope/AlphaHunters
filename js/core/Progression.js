// Progression System for player advancement and upgrades

class Progression {
    constructor(game) {
        this.game = game;
        this.dataManager = game.dataManager;
        
        // Current player state
        this.playerLevel = 1;
        this.playerXP = 0;
        this.availableUpgrades = [];
        this.lootChanceBonus = 0; // Track loot chance bonuses
        
        // Letter score tracking
        this.letterScores = new Map(); // Track cumulative score for each letter
        this.letterFollowers = new Set(); // Track which letters are following as pets
        
        this.init();
    }
    
    init() {
        // Load progression data from character
        const character = this.dataManager?.getCurrentCharacter();
        if (character) {
            this.playerLevel = character.progression.level;
            this.playerXP = character.progression.xp;
            
            // Load letter scores
            if (character.statistics.letterScores) {
                this.letterScores = new Map(Object.entries(character.statistics.letterScores));
            }
            
            // Load letter followers (from pets)
            if (character.pets.followers) {
                this.letterFollowers = new Set(character.pets.followers);
            }
        }
        
        this.updateUI();
        
        // IMPORTANT: Check unlocks on initialization to set available letters
        this.checkUnlocks();
        
        // Load and apply stored upgrades
        this.loadStoredUpgrades();
        
        // Progression system ready
    }
    
    awardXP(amount) {
        if (!this.dataManager) {
            console.error('No DataManager available');
            return;
        }
        
        const oldXP = this.playerXP;
        const oldLevel = this.playerLevel;
        
        // Use DataManager to add XP (it handles level calculation internally)
        const levelUpResult = this.dataManager.addXP(amount);
        
        // Update local cache BEFORE checking for level up
        const character = this.dataManager.getCurrentCharacter();
        if (character) {
            this.playerXP = character.progression.xp;
            this.playerLevel = character.progression.level;
        }
        
        console.log(`💫 XP Awarded: +${amount} (${oldXP} → ${this.playerXP})`);
        
        // If in a level, also track XP for the leaderboard
        if (this.game.levelManager && this.game.levelManager.isLevelActive()) {
            this.game.levelManager.addLevelXP(amount);
        }
        
        // Check if we leveled up - use the actual levels, not the result
        if (this.playerLevel > oldLevel) {
            this.levelUp(this.playerLevel);
        }
        
        this.updateUI();
        
        // Show XP progress
        const progress = this.getXPProgress();
        console.log(`XP Progress: ${progress.current}/${progress.needed} (${Math.round(progress.percentage)}%)`);
    }
    
    calculateLevel(xp) {
        // Even faster progression for more addiction: Level 1=0, Level 2=100, Level 3=175, etc.
        if (xp < 100) return 1;
        if (xp < 175) return 2;
        if (xp < 265) return 3;
        if (xp < 370) return 4;
        if (xp < 490) return 5;
        if (xp < 625) return 6;
        if (xp < 775) return 7;
        if (xp < 940) return 8;
        return Math.floor(8 + (xp - 940) / 250);
    }
    
    getXPForLevel(level) {
        // Updated XP table to match faster progression
        const xpTable = [0, 0, 100, 175, 265, 370, 490, 625, 775, 940];
        if (level < xpTable.length) {
            return xpTable[level];
        }
        return 940 + (level - 8) * 250;
    }
    
    levelUp(newLevel) {
        // Don't update playerLevel here - it's already updated in awardXP
        const oldLevel = newLevel - 1; // Calculate the old level
        
        console.log(`🎉 LEVEL UP! ${oldLevel} -> ${newLevel}`);
        
        // IMPORTANT: Check for new letter unlocks when leveling up
        this.checkUnlocks();
        
        // Play level up sound
        if (this.game.audioManager) {
            this.game.audioManager.playLevelUp();
        }
        
        // Show visual level up celebration
        this.showLevelUpCelebration(oldLevel, newLevel);
        
        // Show upgrade selection after celebration
        setTimeout(() => {
            this.showUpgradeSelection();
        }, 2000);
    }
    
    showLevelUpCelebration(oldLevel, newLevel) {
        // Create a level-up overlay
        const celebration = document.createElement('div');
        celebration.style.cssText = `
            position: fixed;
            top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            z-index: 1000;
            animation: fadeIn 0.5s ease-in-out;
        `;
        
        celebration.innerHTML = `
            <div style="text-align: center; color: white;">
                <div style="font-size: 72px; margin-bottom: 20px;">🎉</div>
                <div style="font-size: 48px; font-weight: bold; color: #FFD700; margin-bottom: 10px;">LEVEL UP!</div>
                <div style="font-size: 32px; margin-bottom: 20px;">Level ${oldLevel} → Level ${newLevel}</div>
                <div style="font-size: 20px; color: #87CEEB;">You're getting better at letter tracing!</div>
            </div>
        `;
        
        document.body.appendChild(celebration);
        
        // Play varied level-up audio
        this.playLevelUpAudio();
        
        // Remove after 2 seconds
        setTimeout(() => {
            celebration.remove();
        }, 2000);
    }
    
    playLevelUpAudio() {
        if (!this.game.audioManager) return;
        
        const levelUpPhrases = [
            "Level up! Choose your upgrade!",
            "Awesome! Pick your power!",
            "You're growing stronger! Select your boost!",
            "Fantastic progress! Choose wisely!",
            "Level up achieved! What's your choice?",
            "Great job! Time to power up!",
            "Incredible! Pick your enhancement!",
            "Well done! Choose your upgrade path!"
        ];
        
        const randomPhrase = levelUpPhrases[Math.floor(Math.random() * levelUpPhrases.length)];
        console.log('🎵 Playing level-up audio:', randomPhrase);
        
        // Use speech synthesis for varied audio
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(randomPhrase);
            utterance.rate = 0.9;
            utterance.pitch = 1.1;
            utterance.volume = 0.8;
            speechSynthesis.speak(utterance);
        }
    }
    
    showUpgradeSelection() {
        // Generate 3 random upgrades
        const upgrades = this.generateUpgradeOptions();
        
        console.log('🎮 Showing upgrade selection:', upgrades.map(u => u.name));
        
        // Show the upgrade selection UI
        this.displayUpgradeUI(upgrades);
    }
    
    displayUpgradeUI(upgrades) {
        const upgradeMenu = document.getElementById('upgradeMenu');
        const upgradeOptions = document.getElementById('upgradeOptions');
        
        // Clear previous options
        upgradeOptions.innerHTML = '';
        
        // Create upgrade cards
        upgrades.forEach((upgrade, index) => {
            const card = document.createElement('div');
            card.className = upgrade.permanent === false ? 'upgrade-card temp-upgrade' : 'upgrade-card';
            
            const durationText = upgrade.permanent === false ? `<div class="upgrade-duration">${upgrade.duration/1000}s duration</div>` : '';
            const categoryText = upgrade.permanent === false ? 'TEMPORARY' : upgrade.category;
            
            card.innerHTML = `
                <div class="upgrade-category ${upgrade.permanent === false ? 'temporary' : upgrade.category}">${categoryText}</div>
                <div class="upgrade-icon">${this.getUpgradeIcon(upgrade)}</div>
                <div class="upgrade-name">${upgrade.name}</div>
                <div class="upgrade-description">${upgrade.description}</div>
                ${durationText}
            `;
            
            // Add click handler
            card.addEventListener('click', () => {
                this.selectUpgrade(upgrade);
            });
            
            upgradeOptions.appendChild(card);
        });
        
        // Show the menu
        upgradeMenu.classList.remove('hidden');
        
        // Don't pause the game - set interaction blocking instead
        this.game.setInteractionBlocking(true);
    }
    
    getUpgradeIcon(upgrade) {
        const icons = {
            moveSpeed: '🏃',
            acceleration: '⚡',
            sprintDuration: '💨',
            attractRadius: '🧲',
            collisionReach: '👐',
            stability: '🎯',
            timeBonus: '⏰',
            lootChance: '🍀',
            // Temporary upgrade icons
            tempSpeed: '🚀',
            tempAccel: '⚡',
            tempReach: '🧲',
            tempUltimate: '💫',
            tempVision: '👁️'
        };
        return icons[upgrade.effect] || '⭐';
    }
    
    generateUpgradeOptions() {
        const permanentUpgrades = {
            mobility: [
                { name: 'Swift Shoes', description: '+30% move speed', effect: 'moveSpeed', value: 0.30, permanent: true },
                { name: 'Turbo Boost', description: '+50% move speed', effect: 'moveSpeed', value: 0.50, permanent: true },
                { name: 'Quick Start', description: '+40% acceleration', effect: 'acceleration', value: 0.40, permanent: true },
                { name: 'Rocket Boots', description: '+60% acceleration', effect: 'acceleration', value: 0.60, permanent: true }
            ],
            reach: [
                { name: 'Letter Magnet', description: '+40% reach for 30 seconds', effect: 'tempReach', value: 0.40, duration: 30000, permanent: false },
                { name: 'Super Magnet', description: '+70% reach for 25 seconds', effect: 'tempReach', value: 0.70, duration: 25000, permanent: false },
                { name: 'Long Arms', description: '+50% reach for 30 seconds', effect: 'tempReach', value: 0.50, duration: 30000, permanent: false },
                { name: 'Giant Hands', description: '+80% reach for 20 seconds', effect: 'tempReach', value: 0.80, duration: 20000, permanent: false }
            ],
            focus: [
                { name: 'Steady Hand', description: '+30% movement stability', effect: 'stability', value: 0.30, permanent: true },
                { name: 'Zen Focus', description: '+50% movement stability', effect: 'stability', value: 0.50, permanent: true },
                { name: 'Time Dilation', description: '+40% move speed', effect: 'timeBonus', value: 0.40, permanent: true },
                { name: 'Perfect Timing', description: '+60% acceleration', effect: 'timeBonus', value: 0.60, permanent: true }
            ],
            luck: [
                { name: 'Lucky Charm', description: '+15% loot chance from letterlings', effect: 'lootChance', value: 0.15, permanent: true },
                { name: 'Treasure Hunter', description: '+25% loot chance from letterlings', effect: 'lootChance', value: 0.25, permanent: true },
                { name: 'Golden Horseshoe', description: '+35% loot chance from letterlings', effect: 'lootChance', value: 0.35, permanent: true }
            ]
        };

        const temporaryUpgrades = {
            power: [
                { name: 'Speed Burst', description: '+200% speed for 15 seconds', effect: 'tempSpeed', value: 2.0, duration: 15000, permanent: false },
                { name: 'Lightning Mode', description: '+300% acceleration for 12 seconds', effect: 'tempAccel', value: 3.0, duration: 12000, permanent: false },
                { name: 'Mega Magnet', description: '+500% reach for 10 seconds', effect: 'tempReach', value: 5.0, duration: 10000, permanent: false },
                { name: 'Time Freeze', description: 'Extreme speed for 8 seconds', effect: 'tempUltimate', value: 4.0, duration: 8000, permanent: false },
                { name: 'Letter Radar', description: 'See all letters for 20 seconds', effect: 'tempVision', value: 1.0, duration: 20000, permanent: false }
            ]
        };
        
        // Combine all permanent upgrades
        const allPermanent = [];
        Object.keys(permanentUpgrades).forEach(category => {
            permanentUpgrades[category].forEach(upgrade => {
                allPermanent.push({ ...upgrade, category });
            });
        });
        
        // Add temporary upgrades
        const allTemporary = [];
        Object.keys(temporaryUpgrades).forEach(category => {
            temporaryUpgrades[category].forEach(upgrade => {
                allTemporary.push({ ...upgrade, category });
            });
        });
        
        // Select 2 permanent upgrades and 1 temporary (or mix based on level)
        const finalOptions = [];
        
        // Always include 1 temporary upgrade for excitement
        const randomTemp = allTemporary[Math.floor(Math.random() * allTemporary.length)];
        finalOptions.push(randomTemp);
        
        // Add 2 permanent upgrades from different categories if possible
        const shuffledPermanent = allPermanent.sort(() => Math.random() - 0.5);
        const usedCategories = new Set([randomTemp.category]);
        
        for (const upgrade of shuffledPermanent) {
            if (finalOptions.length >= 3) break;
            if (!usedCategories.has(upgrade.category) || finalOptions.length === 2) {
                finalOptions.push(upgrade);
                usedCategories.add(upgrade.category);
            }
        }
        
        // If we need more, add any remaining
        while (finalOptions.length < 3) {
            const remaining = shuffledPermanent.find(u => !finalOptions.includes(u));
            if (remaining) {
                finalOptions.push(remaining);
            } else {
                break;
            }
        }
        
        return finalOptions;
    }
    
    selectUpgrade(upgrade) {
        console.log('Upgrade selected:', upgrade.name);
        
        // Prevent multiple selections
        const upgradeMenu = document.getElementById('upgradeMenu');
        if (upgradeMenu.classList.contains('hidden')) {
            console.warn('Upgrade already selected, ignoring duplicate click');
            return;
        }
        
        // Hide menu immediately to prevent double-clicks
        upgradeMenu.classList.add('hidden');
        this.game.setInteractionBlocking(false);
        
        // Apply upgrade effect
        this.applyUpgrade(upgrade);
        
        // Save upgrade choice to correct location
        const character = this.dataManager?.getCurrentCharacter();
        if (character && upgrade.permanent !== false) {
            // Initialize customization object if it doesn't exist
            if (!character.customization) {
                character.customization = {};
            }
            // Initialize upgrades array if it doesn't exist
            if (!character.customization.activeUpgrades) {
                character.customization.activeUpgrades = [];
            }
            
            character.customization.activeUpgrades.push({
                ...upgrade,
                levelAcquired: this.playerLevel,
                timestamp: Date.now()
            });
            this.dataManager.markDirty();
            this.dataManager.save();
        }
    }
    
    applyUpgrade(upgrade) {
        // Apply upgrade effects to player or game systems
        console.log(`🚀 Applying upgrade: ${upgrade.name} - ${upgrade.description}`);
        
        if (upgrade.permanent === false) {
            // Handle temporary upgrades
            this.applyTemporaryUpgrade(upgrade);
            return;
        }
        
        // Handle permanent upgrades
        const oldStats = {
            maxSpeed: this.game.player.maxSpeed,
            acceleration: this.game.player.acceleration,
            radius: this.game.player.radius
        };
        
        switch (upgrade.effect) {
            case 'moveSpeed':
                // Check if stats are corrupted and reset to base if needed
                if (oldStats.maxSpeed > 2000 || isNaN(oldStats.maxSpeed)) {
                    console.warn(`Corrupted maxSpeed detected: ${oldStats.maxSpeed}, resetting to base`);
                    this.game.player.maxSpeed = this.game.basePlayerStats.maxSpeed;
                    oldStats.maxSpeed = this.game.basePlayerStats.maxSpeed;
                }
                const newSpeed = Math.min(2000, Math.round(oldStats.maxSpeed * (1 + upgrade.value)));
                this.game.player.maxSpeed = newSpeed;
                console.log(`🏃 MAX SPEED: ${oldStats.maxSpeed} → ${this.game.player.maxSpeed} (+${Math.round(upgrade.value * 100)}%)`);
                this.showUpgradeEffect(`Speed Boost! ${oldStats.maxSpeed} → ${this.game.player.maxSpeed}`, '🏃');
                break;
            case 'acceleration':
                // Check if stats are corrupted and reset to base if needed
                if (oldStats.acceleration > 8000 || isNaN(oldStats.acceleration)) {
                    console.warn(`Corrupted acceleration detected: ${oldStats.acceleration}, resetting to base`);
                    this.game.player.acceleration = this.game.basePlayerStats.acceleration;
                    oldStats.acceleration = this.game.basePlayerStats.acceleration;
                }
                const newAccel = Math.min(8000, Math.round(oldStats.acceleration * (1 + upgrade.value)));
                this.game.player.acceleration = newAccel;
                console.log(`⚡ ACCELERATION: ${oldStats.acceleration} → ${this.game.player.acceleration} (+${Math.round(upgrade.value * 100)}%)`);
                this.showUpgradeEffect(`Acceleration Boost! ${oldStats.acceleration} → ${this.game.player.acceleration}`, '⚡');
                break;
            case 'collisionReach':
                // Reach upgrades are now temporary only
                console.log('Reach upgrades are now temporary only - converting to temp upgrade');
                this.applyTemporaryUpgrade({
                    ...upgrade,
                    effect: 'tempReach',
                    duration: 30000,
                    permanent: false
                });
                break;
            case 'stability':
                this.game.player.maxSpeed = Math.round(this.game.player.maxSpeed * (1 + upgrade.value * 0.5));
                console.log(`🎯 STABILITY: Max speed improved to ${this.game.player.maxSpeed}`);
                this.showUpgradeEffect(`Steady Movement! Speed +${Math.round(upgrade.value * 50)}%`, '🎯');
                break;
            case 'timeBonus':
                this.game.player.acceleration = Math.round(this.game.player.acceleration * (1 + upgrade.value * 0.5));
                console.log(`⏰ TIME MASTERY: Acceleration improved to ${this.game.player.acceleration}`);
                this.showUpgradeEffect(`Time Mastery! Acceleration +${Math.round(upgrade.value * 50)}%`, '⏰');
                break;
            case 'lootChance':
                this.lootChanceBonus += upgrade.value;
                console.log(`🍀 LUCK UPGRADE: Loot chance bonus now +${Math.round(this.lootChanceBonus * 100)}%`);
                this.showUpgradeEffect(`Lucky! Loot chance +${Math.round(upgrade.value * 100)}%`, '🍀');
                break;
            default:
                console.log('Upgrade effect not yet implemented:', upgrade.effect);
        }
        
        // Show a visual effect on the player
        this.addPlayerUpgradeEffect();
    }
    
    applyTemporaryUpgrade(upgrade) {
        console.log(`⚡ TEMPORARY UPGRADE: ${upgrade.name} for ${upgrade.duration/1000} seconds`);
        
        // Store original stats if not already stored
        if (!this.game.player.originalStats) {
            this.game.player.originalStats = {
                maxSpeed: this.game.player.maxSpeed,
                acceleration: this.game.player.acceleration,
                radius: this.game.player.radius
            };
        }
        
        const originalStats = this.game.player.originalStats;
        let icon = '⚡';
        
        switch (upgrade.effect) {
            case 'tempSpeed':
                this.game.player.maxSpeed = Math.round(originalStats.maxSpeed * (1 + upgrade.value));
                icon = '🚀';
                this.showUpgradeEffect(`SPEED BURST! ${upgrade.duration/1000}s`, icon);
                break;
            case 'tempAccel':
                this.game.player.acceleration = Math.round(originalStats.acceleration * (1 + upgrade.value));
                icon = '⚡';
                this.showUpgradeEffect(`LIGHTNING MODE! ${upgrade.duration/1000}s`, icon);
                break;
            case 'tempReach':
                this.game.player.radius = Math.round(originalStats.radius * (1 + upgrade.value));
                icon = '🧲';
                this.showUpgradeEffect(`MEGA MAGNET! ${upgrade.duration/1000}s`, icon);
                break;
            case 'tempUltimate':
                this.game.player.maxSpeed = Math.round(originalStats.maxSpeed * (1 + upgrade.value));
                this.game.player.acceleration = Math.round(originalStats.acceleration * (1 + upgrade.value));
                icon = '💫';
                this.showUpgradeEffect(`TIME FREEZE! ${upgrade.duration/1000}s`, icon);
                break;
            case 'tempVision':
                // Special effect to highlight all letterlings
                this.game.player.letterRadarActive = true;
                icon = '👁️';
                this.showUpgradeEffect(`LETTER RADAR! ${upgrade.duration/1000}s`, icon);
                break;
        }
        
        // Set expiration time
        this.game.player.tempUpgradeEnd = Date.now() + upgrade.duration;
        this.game.player.tempUpgradeType = upgrade.effect;
        
        // Add super glow effect for temporary upgrades
        this.game.player.upgradeGlowTime = Date.now() + upgrade.duration;
        this.game.player.isTempUpgrade = true;
    }
    
    showUpgradeEffect(message, icon) {
        // Create a floating upgrade notification
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20%;
            left: 50%;
            transform: translateX(-50%);
            background: linear-gradient(135deg, #FFD700, #FFA500);
            color: #333;
            padding: 15px 25px;
            border: 3px solid #333;
            border-radius: 20px;
            font-size: 20px;
            font-weight: bold;
            z-index: 1001;
            animation: upgradeFloat 3s ease-out forwards;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
        `;
        
        notification.innerHTML = `${icon} ${message}`;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
    
    addPlayerUpgradeEffect() {
        // Add a temporary glow effect to the player
        if (this.game.player.upgradeGlowTime) {
            this.game.player.upgradeGlowTime = Date.now() + 5000; // Extend glow
        } else {
            this.game.player.upgradeGlowTime = Date.now() + 5000; // 5 second glow
        }
    }
    
    updateUI() {
        // Update level display
        const levelDisplay = document.getElementById('levelDisplay');
        if (levelDisplay) {
            levelDisplay.querySelector('.value').textContent = this.playerLevel;
        }
        
        // Update XP bar
        const xpBar = document.getElementById('xpBar');
        if (xpBar) {
            const currentLevelXP = this.getXPForLevel(this.playerLevel);
            const nextLevelXP = this.getXPForLevel(this.playerLevel + 1);
            const xpInLevel = this.playerXP - currentLevelXP;
            const xpNeeded = nextLevelXP - currentLevelXP;
            
            const percentage = (xpInLevel / xpNeeded) * 100;
            xpBar.querySelector('.fill').style.width = `${percentage}%`;
        }
    }
    
    // Letter mastery tracking
    updateLetterMastery(letter, score, accuracy) {
        if (this.dataManager) {
            const character = this.dataManager.getCurrentCharacter();
            if (!character) return 'none';
            
            // Update letter statistics
            if (!character.statistics.letterMastery[letter]) {
                character.statistics.letterMastery[letter] = {
                    timesTraced: 0,
                    totalScore: 0,
                    bestScore: 0,
                    averageAccuracy: 0
                };
            }
            
            const mastery = character.statistics.letterMastery[letter];
            mastery.timesTraced++;
            mastery.totalScore += score;
            mastery.bestScore = Math.max(mastery.bestScore, score);
            
            // Update average accuracy
            mastery.averageAccuracy = ((mastery.averageAccuracy * (mastery.timesTraced - 1)) + accuracy) / mastery.timesTraced;
            
            this.dataManager.markDirty();
            this.dataManager.save();
            
            // Check if this unlocks new letters or achievements
            this.checkUnlocks();
            
            // Determine mastery level
            if (mastery.timesTraced >= 50 && mastery.averageAccuracy >= 0.9) return 'master';
            if (mastery.timesTraced >= 20 && mastery.averageAccuracy >= 0.8) return 'expert';
            if (mastery.timesTraced >= 10 && mastery.averageAccuracy >= 0.7) return 'proficient';
            if (mastery.timesTraced >= 5) return 'learning';
            return 'beginner';
        }
        return 'none';
    }
    
    checkUnlocks() {
        // Level-based letter unlocking is no longer used in free play
        // Letters are now only defined by levels themselves
        // This method is kept for compatibility but doesn't update spawn pool
        
        const playerLevel = this.playerLevel;
        console.log(`📚 Player at level ${playerLevel} - letter unlocks handled by level definitions`);
        
        // Don't update spawn pool - levels control their own letters
        if (this.levelMode) {
            console.log(`🎯 Level Mode: Using level-specific letters`);
        }
    }
    
    // Get player stats for UI
    getPlayerStats() {
        return {
            level: this.playerLevel,
            xp: this.playerXP,
            xpProgress: this.getXPProgress()
        };
    }
    
    getXPProgress() {
        const currentLevelXP = this.getXPForLevel(this.playerLevel);
        const nextLevelXP = this.getXPForLevel(this.playerLevel + 1);
        const xpInLevel = this.playerXP - currentLevelXP;
        const xpNeeded = nextLevelXP - currentLevelXP;
        
        return {
            current: xpInLevel,
            needed: xpNeeded,
            percentage: (xpInLevel / xpNeeded) * 100
        };
    }
    
    getLootChanceBonus() {
        return this.lootChanceBonus;
    }
    
    addLetterScore(letter, score) {
        // Add score to the letter's cumulative total
        const currentScore = this.letterScores.get(letter) || 0;
        const newScore = currentScore + score;
        this.letterScores.set(letter, newScore);
        
        console.log(`📝 Letter '${letter}' score: ${currentScore} + ${score} = ${newScore}`);
        
        // Check if this letter should become a follower (at 3000 points - about 30-40 perfect traces)
        // This ensures letter pets are a meaningful achievement
        const LETTER_PET_THRESHOLD = 3000;
        if (newScore >= LETTER_PET_THRESHOLD && !this.letterFollowers.has(letter)) {
            this.addLetterFollower(letter);
            console.log(`🎉 Letter ${letter} reached ${LETTER_PET_THRESHOLD} points - awarding pet!`);
        } else if (newScore < LETTER_PET_THRESHOLD) {
            // Show progress toward letter pet
            const progress = Math.round((newScore / LETTER_PET_THRESHOLD) * 100);
            console.log(`📊 Letter ${letter} pet progress: ${progress}% (${newScore}/${LETTER_PET_THRESHOLD})`);
        }
        
        // Update character data
        const character = this.dataManager?.getCurrentCharacter();
        if (character) {
            character.statistics.letterScores = Object.fromEntries(this.letterScores);
            character.pets.followers = Array.from(this.letterFollowers);
            this.dataManager.markDirty();
            this.dataManager.save();
        }
        
        return newScore;
    }
    
    addLetterFollower(letter) {
        this.letterFollowers.add(letter);
        console.log(`🐕 Letter '${letter}' is now following you! (Reached 1000 points)`);
        
        // Show notification
        this.showLetterFollowerNotification(letter);
        
        // Add the follower to the game
        if (this.game.addLetterFollower) {
            this.game.addLetterFollower(letter);
        }
    }
    
    showLetterFollowerNotification(letter) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 35%;
            left: 50%;
            transform: translateX(-50%);
            background: linear-gradient(135deg, #FF6B6B, #FF8E53);
            color: white;
            padding: 25px 35px;
            border: 4px solid #333;
            border-radius: 25px;
            font-size: 28px;
            font-weight: bold;
            z-index: 1004;
            animation: upgradeFloat 5s ease-out forwards;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
            text-align: center;
        `;
        
        notification.innerHTML = `
            <div style="font-size: 60px; margin-bottom: 15px;">🐕</div>
            <div>NEW LETTER PET!</div>
            <div style="font-size: 48px; margin: 15px 0; color: #FFE4E1;">${letter}</div>
            <div style="font-size: 20px; color: #FFE4E1;">Will follow you around!</div>
            <div style="font-size: 16px; color: #FFE4E1; margin-top: 10px;">Earned after mastering this letter!</div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }
    
    getLetterScore(letter) {
        return this.letterScores.get(letter) || 0;
    }
    
    getLetterFollowers() {
        return Array.from(this.letterFollowers);
    }
    
    loadStoredUpgrades() {
        const character = this.dataManager?.getCurrentCharacter();
        if (!character || !character.customization || !character.customization.activeUpgrades) {
            console.log('📊 No stored upgrades to load');
            return;
        }
        
        console.log(`📊 Loading ${character.customization.activeUpgrades.length} stored upgrades for ${character.identity.name}`);
        
        // Reset player stats to base values before applying upgrades
        if (this.game.player && this.game.basePlayerStats) {
            console.log('📊 Resetting player stats to base values:');
            console.log(`  Radius: ${this.game.player.radius} → ${this.game.basePlayerStats.radius}`);
            console.log(`  Speed: ${this.game.player.maxSpeed} → ${this.game.basePlayerStats.maxSpeed}`);
            console.log(`  Accel: ${this.game.player.acceleration} → ${this.game.basePlayerStats.acceleration}`);
            
            this.game.player.maxSpeed = this.game.basePlayerStats.maxSpeed;
            this.game.player.acceleration = this.game.basePlayerStats.acceleration;
            this.game.player.radius = this.game.basePlayerStats.radius;
        }
        
        // Apply each stored upgrade without re-saving
        character.customization.activeUpgrades.forEach(upgrade => {
            console.log(`Restoring upgrade: ${upgrade.name} from level ${upgrade.levelAcquired}`);
            // Apply the upgrade effect without saving again
            this.applyUpgradeEffect(upgrade);
        });
    }
    
    applyUpgradeEffect(upgrade) {
        // Apply just the effect without the full upgrade process
        const oldStats = {
            maxSpeed: this.game.player.maxSpeed,
            acceleration: this.game.player.acceleration,
            radius: this.game.player.radius
        };
        
        switch (upgrade.effect) {
            case 'moveSpeed':
                const baseSpeed = (this.game.player.maxSpeed > 2000) ? 400 : this.game.player.maxSpeed;
                const newSpeed = Math.min(2000, Math.round(baseSpeed * (1 + upgrade.value)));
                this.game.player.maxSpeed = newSpeed;
                break;
            case 'acceleration':
                const baseAccel = (this.game.player.acceleration > 8000) ? 2000 : this.game.player.acceleration;
                const newAccel = Math.min(8000, Math.round(baseAccel * (1 + upgrade.value)));
                this.game.player.acceleration = newAccel;
                break;
            case 'collisionReach':
                // Skip permanent reach upgrades - these should now be temporary only
                console.log('Skipping permanent reach upgrade (now temporary only)');
                break;
            case 'stability':
                this.game.player.maxSpeed = Math.min(2000, Math.round(this.game.player.maxSpeed * (1 + upgrade.value * 0.5)));
                break;
            case 'timeBonus':
                this.game.player.acceleration = Math.min(8000, Math.round(this.game.player.acceleration * (1 + upgrade.value * 0.5)));
                break;
            case 'lootChance':
                this.lootChanceBonus += upgrade.value;
                break;
        }
    }
}