// Unified Data Manager - Combines character profiles, saves, and settings
// Replaces both CharacterManager and SaveManager with a cleaner architecture

class DataManager {
    constructor(game) {
        this.game = game;
        
        // Storage keys
        this.STORAGE_KEYS = {
            CURRENT_CHARACTER_ID: 'alphahunters_current_character',
            CHARACTERS: 'alphahunters_characters_v2',
            SETTINGS: 'alphahunters_settings_v2',
            MULTIPLAYER_PROFILE: 'alphahunters_multiplayer_profile'
        };
        
        // Data version for migration
        this.DATA_VERSION = '2.0';
        
        // In-memory data
        this.characters = {};
        this.currentCharacterId = null;
        this.settings = null;
        this.multiplayerProfile = null;
        
        // Auto-save
        this.autoSaveInterval = null;
        this.isDirty = false;
        
        // Available customization options - basic emojis for new characters
        this.availableAvatars = ['😀', '😊', '🙂', '😄', '😎', '🤓', '😇', '🥰', '😋', '🤗'];
        
        // Premium avatars for shop (stored for future use)
        this.premiumAvatars = [
            '🦸‍♀️', '🦸‍♂️', '🧙‍♀️', '🧙‍♂️', '🦄', '🦊', '🐰', '🐼', '🦁', '🐸',
            '🐯', '🐵', '🐶', '🐺', '🐱', '🐴', '🐷', '🐻', '🐨', '🐹',
            '🦝', '🦇', '🦅', '🦉', '🦜', '🦩', '🦚', '🦖', '🦕', '🐉',
            '🤖', '👻', '👽', '🎃', '🎅', '🧛', '🧟', '🧚', '🧜', '🧞',
            '⭐', '🌟', '✨', '💫', '🔥', '❄️', '🌈', '🍄', '🌺', '🌸'
        ];
        
        this.init();
    }
    
    init() {
        this.loadAllData();
        this.startAutoSave();
        // DataManager ready
    }
    
    // ========== Data Schema ==========
    
    createDefaultCharacter(name, avatar) {
        return {
            id: this.generateCharacterId(name),
            version: this.DATA_VERSION,
            
            // Identity
            identity: {
                name: name.trim(),
                avatar: avatar,
                createdDate: Date.now(),
                lastPlayed: Date.now()
            },
            
            // Progression
            progression: {
                level: 1,
                xp: 0,
                coins: 100, // Starting coins
                
                // Levels
                unlockedLevels: [1],
                levelStats: {
                    1: { 
                        unlocked: true,
                        stars: 0, 
                        bestScore: 0, 
                        completions: 0,
                        firstCompleted: null,
                        lastPlayed: null
                    }
                },
                
                // Letters
                letterMastery: {}, // letter -> { attempts, bestScore, mastery, etc }
                unlockedLetters: ['a', 'A', 'o', 'O', 'c', 'C'], // Starting letters
                
                // Achievements
                achievements: {
                    unlocked: [],
                    progress: {}
                }
            },
            
            // Customization
            customization: {
                purchasedSkins: [],
                activeSkin: avatar,
                purchasedUpgrades: [],
                activeUpgrades: []
            },
            
            // Pets
            pets: {
                rescued: [], // Array of rescued pet data
                farm: {}, // letter -> pet data
                totalRescued: 0,
                favorites: []
            },
            
            // Statistics
            statistics: {
                totalPlayTime: 0,
                sessionsPlayed: 0,
                lastSessionStart: Date.now(),
                
                // Letter performance
                letterStats: {}, // letter -> detailed stats
                totalTracesCompleted: 0,
                perfectTraces: 0,
                averageAccuracy: 0,
                
                // Level performance
                levelsCompleted: 0,
                totalStarsEarned: 0,
                
                // Daily tracking
                dailyStreak: 0,
                lastPlayDate: new Date().toDateString(),
                
                // Educational metrics
                strongestLetters: [],
                weakestLetters: [],
                recentImprovement: [],
                
                // Enhanced time tracking
                timeTracking: {
                    lifetime: {
                        total: 0,
                        byActivity: {}
                    },
                    sessions: [],
                    dailyHistory: {},
                    currentSession: null
                },
                
                // Enhanced letter performance tracking
                letterPerformance: {} // letter -> comprehensive performance data
            },
            
            // Time limits (teacher-set)
            timeLimits: {
                enabled: false,
                limits: {
                    store: 300000, // 5 minutes default
                    petFarm: 600000, // 10 minutes default
                    menu: 180000, // 3 minutes default
                    characterMenu: 180000, // 3 minutes default
                    settings: 120000, // 2 minutes default
                    nonEducationalTotal: 900000 // 15 minutes total
                },
                currentUsage: {},
                lastReset: Date.now()
            },
            
            // Challenge documentation
            challengeHistory: {},
            
            // Preferences
            preferences: {
                handedness: 'right',
                showHints: true,
                difficulty: 'normal',
                autoSave: true
            }
        };
    }
    
    createDefaultSettings() {
        return {
            version: this.DATA_VERSION,
            
            audio: {
                masterVolume: 0.7,
                musicVolume: 0.5,
                sfxVolume: 0.8,
                voiceVolume: 1.0,
                isMuted: false
            },
            
            graphics: {
                quality: 'medium',
                particleEffects: true,
                screenShake: true
            },
            
            accessibility: {
                leftHandedMode: false,
                highContrast: false,
                reducedMotion: false,
                largeText: false,
                colorblindMode: 'none'
            },
            
            gameplay: {
                adaptiveDifficulty: true,
                showDebugInfo: false,
                autoSkipIntro: false,
                showFPS: false
            }
        };
    }
    
    createDefaultMultiplayerProfile() {
        return {
            displayName: '',
            hostId: this.generateHostId(),
            joinHistory: [], // Recent room codes joined
            statistics: {
                gamesHosted: 0,
                gamesJoined: 0,
                totalMultiplayerTime: 0
            }
        };
    }
    
    // ========== Character Management ==========
    
    createCharacter(name, avatar) {
        if (!name || name.trim().length === 0) {
            throw new Error('Character name cannot be empty');
        }
        
        if (!this.availableAvatars.includes(avatar)) {
            throw new Error('Invalid avatar selection');
        }
        
        // Check for duplicate names
        const existingChar = Object.values(this.characters).find(
            char => char.identity.name.toLowerCase() === name.trim().toLowerCase()
        );
        if (existingChar) {
            throw new Error('A character with this name already exists');
        }
        
        const character = this.createDefaultCharacter(name, avatar);
        this.characters[character.id] = character;
        this.currentCharacterId = character.id;
        
        this.markDirty();
        this.save();
        
        console.log(`👤 Created character: ${name} (${avatar})`);
        return character;
    }
    
    selectCharacter(characterId) {
        if (!this.characters[characterId]) {
            throw new Error('Character not found');
        }
        
        this.currentCharacterId = characterId;
        this.characters[characterId].identity.lastPlayed = Date.now();
        
        this.markDirty();
        this.save();
        
        // Sync with game systems
        this.syncGameState();
        
        const character = this.characters[characterId];
        console.log(`👤 Selected character: ${character.identity.name}`);
        return character;
    }
    
    getCurrentCharacter() {
        if (!this.currentCharacterId || !this.characters[this.currentCharacterId]) {
            return null;
        }
        return this.characters[this.currentCharacterId];
    }
    
    getCharacterList() {
        return Object.values(this.characters)
            .sort((a, b) => b.identity.lastPlayed - a.identity.lastPlayed);
    }
    
    deleteCharacter(characterId) {
        if (!this.characters[characterId]) {
            throw new Error('Character not found');
        }
        
        const characterName = this.characters[characterId].identity.name;
        delete this.characters[characterId];
        
        // If this was current character, clear selection
        if (this.currentCharacterId === characterId) {
            this.currentCharacterId = null;
        }
        
        this.markDirty();
        this.save();
        
        console.log(`🗑️ Deleted character: ${characterName}`);
    }
    
    getAllCharacters() {
        return Object.values(this.characters);
    }
    
    getCharacterById(id) {
        return this.characters[id] || null;
    }
    
    saveCharacter(character) {
        if (!character || !character.id) return false;
        
        this.characters[character.id] = character;
        this.markDirty();
        this.save();
        
        return true;
    }
    
    // ========== Progression Updates ==========
    
    addXP(amount) {
        const character = this.getCurrentCharacter();
        if (!character) return null;
        
        const oldLevel = character.progression.level;
        character.progression.xp += amount;
        
        // Calculate new level (100 + 30 * N formula)
        const newLevel = this.calculateLevel(character.progression.xp);
        
        if (newLevel > oldLevel) {
            character.progression.level = newLevel;
            console.log(`🎉 Level up! ${oldLevel} → ${newLevel}`);
            this.markDirty();
            return { oldLevel, newLevel };
        }
        
        this.markDirty();
        return null;
    }
    
    addCoins(amount) {
        const character = this.getCurrentCharacter();
        if (!character) return 0;
        
        character.progression.coins += amount;
        this.markDirty();
        
        return character.progression.coins;
    }
    
    spendCoins(amount) {
        const character = this.getCurrentCharacter();
        if (!character || character.progression.coins < amount) return false;
        
        character.progression.coins -= amount;
        this.markDirty();
        
        return true;
    }
    
    unlockLevel(levelNumber) {
        const character = this.getCurrentCharacter();
        if (!character) return false;
        
        if (!character.progression.unlockedLevels.includes(levelNumber)) {
            character.progression.unlockedLevels.push(levelNumber);
            
            // Initialize level stats
            if (!character.progression.levelStats[levelNumber]) {
                character.progression.levelStats[levelNumber] = {
                    unlocked: true,
                    stars: 0,
                    bestScore: 0,
                    completions: 0,
                    firstCompleted: null,
                    lastPlayed: null
                };
            }
            
            this.markDirty();
            console.log(`🔓 Unlocked level ${levelNumber}`);
            return true;
        }
        
        return false;
    }
    
    completeLevelWithStats(levelNumber, score, stars) {
        const character = this.getCurrentCharacter();
        if (!character) return null;
        
        // Ensure level stats exist
        if (!character.progression.levelStats[levelNumber]) {
            character.progression.levelStats[levelNumber] = {
                unlocked: true,
                stars: 0,
                bestScore: 0,
                completions: 0,
                firstCompleted: null,
                lastPlayed: null
            };
        }
        
        const stats = character.progression.levelStats[levelNumber];
        const now = Date.now();
        
        // Update stats
        stats.completions++;
        stats.lastPlayed = now;
        if (!stats.firstCompleted) {
            stats.firstCompleted = now;
        }
        
        const oldStars = stats.stars;
        const oldBest = stats.bestScore;
        
        stats.bestScore = Math.max(stats.bestScore, score);
        stats.stars = Math.max(stats.stars, stars);
        
        // Update global statistics
        if (stats.completions === 1) {
            character.statistics.levelsCompleted++;
        }
        character.statistics.totalStarsEarned += Math.max(0, stats.stars - oldStars);
        
        this.markDirty();
        
        return {
            newBest: stats.bestScore > oldBest,
            newStars: stats.stars > oldStars,
            firstCompletion: stats.completions === 1
        };
    }
    
    // ========== Letter Tracking ==========
    
    recordLetterTrace(letter, score, accuracy, traceData = {}) {
        const character = this.getCurrentCharacter();
        if (!character) return;
        
        // Initialize letter stats if needed
        if (!character.statistics.letterStats[letter]) {
            character.statistics.letterStats[letter] = {
                totalTraces: 0,
                totalScore: 0,
                bestScore: 0,
                averageScore: 0,
                averageAccuracy: 0,
                lastTraced: null,
                recentScores: [],
                masteryLevel: 'none'
            };
        }
        
        const letterStats = character.statistics.letterStats[letter];
        
        // Update stats
        letterStats.totalTraces++;
        letterStats.totalScore += score;
        letterStats.bestScore = Math.max(letterStats.bestScore, score);
        letterStats.averageScore = Math.round(letterStats.totalScore / letterStats.totalTraces);
        letterStats.lastTraced = Date.now();
        
        // Track recent scores (keep last 10)
        letterStats.recentScores.push({ score, accuracy, timestamp: Date.now() });
        if (letterStats.recentScores.length > 10) {
            letterStats.recentScores.shift();
        }
        
        // Update accuracy
        const totalAccuracy = letterStats.recentScores.reduce((sum, s) => sum + s.accuracy, 0);
        letterStats.averageAccuracy = Math.round(totalAccuracy / letterStats.recentScores.length);
        
        // Update mastery
        letterStats.masteryLevel = this.calculateMasteryLevel(letterStats.recentScores);
        
        // Update global stats
        character.statistics.totalTracesCompleted++;
        if (score >= 90) {
            character.statistics.perfectTraces++;
        }
        
        // Recalculate strongest/weakest letters
        this.updateLetterRankings(character);
        
        this.markDirty();
    }
    
    // ========== Pet Management ==========
    
    addPetToFarm(letter, emoji, levelNumber) {
        const character = this.getCurrentCharacter();
        if (!character) return false;
        
        const petData = {
            letter: letter,
            emoji: emoji,
            rescuedDate: Date.now(),
            rescuedFromLevel: levelNumber,
            happiness: 100,
            interactions: 0
        };
        
        // Add to rescued array
        character.pets.rescued.push(petData);
        
        // Add to farm
        if (!character.pets.farm[letter]) {
            character.pets.farm[letter] = [];
        }
        character.pets.farm[letter].push(petData);
        
        character.pets.totalRescued++;
        
        this.markDirty();
        console.log(`🐾 Added pet ${emoji} (${letter}) to farm`);
        return true;
    }
    
    unlockSkin(skin) {
        const character = this.getCurrentCharacter();
        if (!character) return false;
        
        // Initialize unlocked skins array if it doesn't exist
        if (!character.unlockedSkins) {
            character.unlockedSkins = [];
        }
        
        // Check if already unlocked
        if (character.unlockedSkins.includes(skin)) {
            console.log(`🎨 Skin already unlocked: ${skin}`);
            return false;
        }
        
        // Unlock the skin
        character.unlockedSkins.push(skin);
        this.markDirty();
        this.save();
        
        console.log(`🎨 Unlocked new skin: ${skin}`);
        return true;
    }
    
    unlockPet(pet) {
        // For future pet unlocking functionality
        console.log(`🐾 Pet unlocking not yet implemented: ${pet}`);
        return false;
    }
    
    // ========== Statistics ==========
    
    updatePlayTime() {
        const character = this.getCurrentCharacter();
        if (!character || !character.statistics.lastSessionStart) return;
        
        const sessionTime = Date.now() - character.statistics.lastSessionStart;
        character.statistics.totalPlayTime += sessionTime;
        character.statistics.lastSessionStart = Date.now();
        
        this.markDirty();
    }
    
    updateDailyStreak() {
        const character = this.getCurrentCharacter();
        if (!character) return 0;
        
        const today = new Date().toDateString();
        const lastPlay = character.statistics.lastPlayDate;
        
        if (lastPlay !== today) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            
            if (lastPlay === yesterday.toDateString()) {
                character.statistics.dailyStreak++;
            } else {
                character.statistics.dailyStreak = 1;
            }
            
            character.statistics.lastPlayDate = today;
            this.markDirty();
        }
        
        return character.statistics.dailyStreak;
    }
    
    // ========== Settings Management ==========
    
    updateSetting(path, value) {
        if (!this.settings) {
            this.settings = this.createDefaultSettings();
        }
        
        const keys = path.split('.');
        let obj = this.settings;
        
        for (let i = 0; i < keys.length - 1; i++) {
            if (!(keys[i] in obj)) {
                obj[keys[i]] = {};
            }
            obj = obj[keys[i]];
        }
        
        obj[keys[keys.length - 1]] = value;
        this.markDirty();
        
        return true;
    }
    
    getSetting(path, defaultValue = null) {
        if (!this.settings) return defaultValue;
        
        const keys = path.split('.');
        let obj = this.settings;
        
        for (const key of keys) {
            if (!(key in obj)) return defaultValue;
            obj = obj[key];
        }
        
        return obj;
    }
    
    // ========== Multiplayer Profile ==========
    
    getOrCreateMultiplayerProfile() {
        if (!this.multiplayerProfile) {
            this.multiplayerProfile = this.createDefaultMultiplayerProfile();
            this.markDirty();
        }
        return this.multiplayerProfile;
    }
    
    updateMultiplayerDisplayName(name) {
        const profile = this.getOrCreateMultiplayerProfile();
        profile.displayName = name;
        this.markDirty();
    }
    
    addJoinedRoom(roomCode) {
        const profile = this.getOrCreateMultiplayerProfile();
        
        // Remove if already exists
        profile.joinHistory = profile.joinHistory.filter(code => code !== roomCode);
        
        // Add to front
        profile.joinHistory.unshift(roomCode);
        
        // Keep only last 10
        if (profile.joinHistory.length > 10) {
            profile.joinHistory = profile.joinHistory.slice(0, 10);
        }
        
        profile.statistics.gamesJoined++;
        this.markDirty();
    }
    
    // ========== Data Persistence ==========
    
    loadAllData() {
        try {
            // Load characters
            const charactersData = localStorage.getItem(this.STORAGE_KEYS.CHARACTERS);
            if (charactersData) {
                const parsed = JSON.parse(charactersData);
                this.characters = this.migrateCharacterData(parsed);
                console.log(`📂 Loaded ${Object.keys(this.characters).length} characters`);
            }
            
            // Load current character ID
            const currentId = localStorage.getItem(this.STORAGE_KEYS.CURRENT_CHARACTER_ID);
            if (currentId && this.characters[currentId]) {
                this.currentCharacterId = currentId;
            }
            
            // Load settings
            const settingsData = localStorage.getItem(this.STORAGE_KEYS.SETTINGS);
            if (settingsData) {
                this.settings = JSON.parse(settingsData);
            } else {
                this.settings = this.createDefaultSettings();
            }
            
            // Load multiplayer profile
            const mpData = localStorage.getItem(this.STORAGE_KEYS.MULTIPLAYER_PROFILE);
            if (mpData) {
                this.multiplayerProfile = JSON.parse(mpData);
            }
            
            // Try to migrate from old systems
            this.migrateFromOldSystems();
            
        } catch (error) {
            console.error('Failed to load data:', error);
            // Start fresh if load fails
            this.settings = this.createDefaultSettings();
        }
    }
    
    save() {
        if (!this.isDirty) return false;
        
        try {
            // Save characters
            localStorage.setItem(this.STORAGE_KEYS.CHARACTERS, JSON.stringify(this.characters));
            
            // Save current character ID
            if (this.currentCharacterId) {
                localStorage.setItem(this.STORAGE_KEYS.CURRENT_CHARACTER_ID, this.currentCharacterId);
            }
            
            // Save settings
            localStorage.setItem(this.STORAGE_KEYS.SETTINGS, JSON.stringify(this.settings));
            
            // Save multiplayer profile
            if (this.multiplayerProfile) {
                localStorage.setItem(this.STORAGE_KEYS.MULTIPLAYER_PROFILE, JSON.stringify(this.multiplayerProfile));
            }
            
            this.isDirty = false;
            console.log('💾 Data saved successfully');
            return true;
            
        } catch (error) {
            console.error('Failed to save data:', error);
            return false;
        }
    }
    
    // ========== Migration ==========
    
    migrateFromOldSystems() {
        // Check for old CharacterManager data
        const oldCharacters = localStorage.getItem('alphahunters_characters');
        if (oldCharacters && Object.keys(this.characters).length === 0) {
            console.log('🔄 Migrating from old CharacterManager...');
            try {
                const parsed = JSON.parse(oldCharacters);
                for (const oldChar of Object.values(parsed)) {
                    const newChar = this.createDefaultCharacter(oldChar.name, oldChar.avatar);
                    
                    // Migrate data
                    newChar.progression.level = oldChar.progression?.playerLevel || 1;
                    newChar.progression.xp = oldChar.progression?.playerXP || 0;
                    newChar.progression.coins = oldChar.economy?.coins || 100;
                    newChar.progression.unlockedLevels = oldChar.progression?.unlockedLevels || [1];
                    newChar.progression.levelStats = oldChar.progression?.levelStats || {};
                    
                    // Migrate pets
                    if (oldChar.pets?.rescued) {
                        newChar.pets.rescued = oldChar.pets.rescued;
                        newChar.pets.farm = oldChar.pets.farm || {};
                    }
                    
                    this.characters[newChar.id] = newChar;
                }
                
                this.markDirty();
                this.save();
                
                // Rename old data to prevent re-migration
                localStorage.setItem('alphahunters_characters_old', oldCharacters);
                localStorage.removeItem('alphahunters_characters');
                
                console.log('✅ Migration complete');
            } catch (error) {
                console.error('Migration failed:', error);
            }
        }
    }
    
    migrateCharacterData(characters) {
        // Ensure all characters have current structure
        for (const charId in characters) {
            const char = characters[charId];
            
            // Add version if missing
            if (!char.version) {
                char.version = this.DATA_VERSION;
            }
            
            // Ensure all sections exist
            if (!char.identity) char.identity = {};
            if (!char.progression) char.progression = {};
            if (!char.customization) char.customization = {};
            if (!char.customization.purchasedSkins) char.customization.purchasedSkins = [];
            if (!char.customization.activeSkin) char.customization.activeSkin = char.identity.avatar || '😊';
            if (!char.customization.purchasedUpgrades) char.customization.purchasedUpgrades = [];
            if (!char.customization.activeUpgrades) char.customization.activeUpgrades = [];
            if (!char.pets) char.pets = { rescued: [], farm: {}, totalRescued: 0 };
            if (!char.statistics) char.statistics = {};
            if (!char.preferences) char.preferences = {};
        }
        
        return characters;
    }
    
    // ========== Sync with Game Systems ==========
    
    syncGameState() {
        const character = this.getCurrentCharacter();
        if (!character) return;
        
        // Sync with Economy
        if (this.game.economy) {
            this.game.economy.coins = character.progression.coins;
            this.game.economy.updateUI();
        }
        
        // Sync with Progression
        if (this.game.progression) {
            this.game.progression.playerLevel = character.progression.level;
            this.game.progression.playerXP = character.progression.xp;
            this.game.progression.unlockedLevels = [...character.progression.unlockedLevels];
            this.game.progression.unlockedLetters = [...character.progression.unlockedLetters];
            
            // Clear and reload letter scores for this character
            this.game.progression.letterScores = new Map();
            if (character.statistics.letterScores) {
                this.game.progression.letterScores = new Map(Object.entries(character.statistics.letterScores));
            }
            
            // Clear and reload letter followers for this character
            this.game.progression.letterFollowers = new Set();
            if (character.pets.followers) {
                this.game.progression.letterFollowers = new Set(character.pets.followers);
            }
            
            // Clear any existing letter followers in the game
            if (this.game.letterFollowers) {
                this.game.letterFollowers = [];
            }
            
            // Re-add the letter followers for this character
            if (character.pets.followers) {
                character.pets.followers.forEach(letter => {
                    if (this.game.addLetterFollower) {
                        this.game.addLetterFollower(letter);
                    }
                });
            }
            
            console.log(`📊 Synced letter scores:`, this.game.progression.letterScores);
            console.log(`🐕 Synced letter followers:`, this.game.progression.letterFollowers);
        }
        
        // Update HUD
        this.updateHUD();
        
        console.log('🔄 Game state synchronized with character data');
    }
    
    updateHUD() {
        const character = this.getCurrentCharacter();
        if (!character) return;
        
        // Update coin display
        const coinCounter = document.getElementById('coinCounter');
        if (coinCounter) {
            const countElement = coinCounter.querySelector('.count');
            if (countElement) {
                countElement.textContent = character.progression.coins.toString();
            }
        }
        
        // Update level display
        const levelDisplay = document.getElementById('levelDisplay');
        if (levelDisplay) {
            const valueElement = levelDisplay.querySelector('.value');
            if (valueElement) {
                valueElement.textContent = character.progression.level.toString();
            }
        }
    }
    
    // ========== Utility Methods ==========
    
    generateCharacterId(name) {
        const cleanName = name.toLowerCase().replace(/[^a-z0-9]/g, '');
        return `${cleanName}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    generateHostId() {
        return Math.random().toString(36).substr(2, 9).toUpperCase();
    }
    
    calculateLevel(xp) {
        // Match the Progression system's XP table
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
    
    calculateMasteryLevel(recentScores) {
        if (recentScores.length < 3) return 'none';
        
        const avgScore = recentScores.reduce((sum, s) => sum + s.score, 0) / recentScores.length;
        
        if (avgScore >= 85) return 'gold';
        if (avgScore >= 70) return 'silver';
        if (avgScore >= 60) return 'bronze';
        return 'learning';
    }
    
    updateLetterRankings(character) {
        const letterStats = Object.entries(character.statistics.letterStats)
            .filter(([_, stats]) => stats.totalTraces >= 3)
            .map(([letter, stats]) => ({ letter, score: stats.averageScore }))
            .sort((a, b) => b.score - a.score);
        
        character.statistics.strongestLetters = letterStats.slice(0, 5).map(s => s.letter);
        character.statistics.weakestLetters = letterStats.slice(-5).map(s => s.letter);
    }
    
    markDirty() {
        this.isDirty = true;
    }
    
    // ========== Auto-save ==========
    
    startAutoSave(interval = 30000) {
        this.stopAutoSave();
        
        this.autoSaveInterval = setInterval(() => {
            const character = this.getCurrentCharacter();
            if (character?.preferences?.autoSave) {
                this.save();
            }
        }, interval);
    }
    
    stopAutoSave() {
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
            this.autoSaveInterval = null;
        }
    }
    
    // ========== Export/Import ==========
    
    exportCharacterData(characterId = null) {
        const character = characterId ? this.characters[characterId] : this.getCurrentCharacter();
        if (!character) throw new Error('Character not found');
        
        return {
            version: this.DATA_VERSION,
            exportDate: new Date().toISOString(),
            character: character,
            
            // Teacher-friendly summary
            summary: {
                name: character.identity.name,
                level: character.progression.level,
                playTime: Math.round(character.statistics.totalPlayTime / 60000) + ' minutes',
                levelsCompleted: character.statistics.levelsCompleted,
                totalTraces: character.statistics.totalTracesCompleted,
                accuracy: character.statistics.averageAccuracy + '%',
                strongestLetters: character.statistics.strongestLetters.join(', '),
                weakestLetters: character.statistics.weakestLetters.join(', ')
            }
        };
    }
    
    importCharacterData(jsonData) {
        try {
            const parsed = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
            
            if (!parsed.character || !parsed.character.identity) {
                throw new Error('Invalid character data');
            }
            
            const character = parsed.character;
            
            // Check for duplicate
            const existingChar = Object.values(this.characters).find(
                char => char.identity.name.toLowerCase() === character.identity.name.toLowerCase()
            );
            
            if (existingChar) {
                throw new Error('Character with this name already exists');
            }
            
            // Generate new ID for imported character
            character.id = this.generateCharacterId(character.identity.name);
            
            this.characters[character.id] = character;
            this.markDirty();
            this.save();
            
            console.log(`📥 Imported character: ${character.identity.name}`);
            return character;
            
        } catch (error) {
            console.error('Import failed:', error);
            throw error;
        }
    }
    
    // ========== Enhanced Letter Performance Tracking ==========
    
    recordLetterTrace(letter, score, timeMs, traceImageData, strokeAccuracy) {
        const character = this.getCurrentCharacter();
        if (!character) return;
        
        // Initialize letter performance if not exists
        if (!character.statistics.letterPerformance[letter]) {
            character.statistics.letterPerformance[letter] = {
                attempts: 0,
                bestScore: 0,
                averageScore: 0,
                recentScores: [],
                masteryLevel: 1,
                averageTime: 0,
                firstAttempt: Date.now(),
                lastAttempt: Date.now(),
                traceHistory: [],
                progressTimeline: []
            };
        }
        
        const letterPerf = character.statistics.letterPerformance[letter];
        
        // Update basic stats
        letterPerf.attempts++;
        letterPerf.lastAttempt = Date.now();
        letterPerf.bestScore = Math.max(letterPerf.bestScore, score);
        
        // Update average score
        const totalScore = letterPerf.averageScore * (letterPerf.attempts - 1) + score;
        letterPerf.averageScore = Math.round(totalScore / letterPerf.attempts * 10) / 10;
        
        // Update average time
        const totalTime = letterPerf.averageTime * (letterPerf.attempts - 1) + timeMs;
        letterPerf.averageTime = Math.round(totalTime / letterPerf.attempts);
        
        // Add to recent scores (keep last 10)
        letterPerf.recentScores.push(score);
        if (letterPerf.recentScores.length > 10) {
            letterPerf.recentScores.shift();
        }
        
        // Calculate mastery level (1-5)
        this.updateMasteryLevel(letterPerf);
        
        // Add trace to history (keep last 5)
        const traceRecord = {
            id: `trace_${letter}_${Date.now()}`,
            timestamp: Date.now(),
            score: score,
            timeMs: timeMs,
            imageData: traceImageData,
            strokeAccuracy: strokeAccuracy || []
        };
        
        letterPerf.traceHistory.push(traceRecord);
        if (letterPerf.traceHistory.length > 5) {
            letterPerf.traceHistory.shift();
        }
        
        // Update progress timeline (daily aggregates)
        this.updateProgressTimeline(letter, score);
        
        // Update old letterStats for compatibility
        if (!character.statistics.letterStats[letter]) {
            character.statistics.letterStats[letter] = {
                attempts: 0,
                bestScore: 0,
                averageScore: 0,
                totalTime: 0,
                lastPracticed: Date.now()
            };
        }
        
        const oldStats = character.statistics.letterStats[letter];
        oldStats.attempts = letterPerf.attempts;
        oldStats.bestScore = letterPerf.bestScore;
        oldStats.averageScore = letterPerf.averageScore;
        oldStats.totalTime += timeMs / 1000;
        oldStats.lastPracticed = Date.now();
        
        // Update global stats
        character.statistics.totalTracesCompleted++;
        if (score >= 95) {
            character.statistics.perfectTraces++;
        }
        
        this.markDirty();
        return traceRecord;
    }
    
    updateMasteryLevel(letterPerf) {
        // Calculate mastery based on recent performance
        if (letterPerf.recentScores.length < 3) {
            letterPerf.masteryLevel = 1;
            return;
        }
        
        const recentAvg = letterPerf.recentScores.slice(-5).reduce((a, b) => a + b, 0) / 
                         Math.min(5, letterPerf.recentScores.length);
        
        if (recentAvg >= 95 && letterPerf.attempts >= 10) {
            letterPerf.masteryLevel = 5;
        } else if (recentAvg >= 90 && letterPerf.attempts >= 7) {
            letterPerf.masteryLevel = 4;
        } else if (recentAvg >= 80 && letterPerf.attempts >= 5) {
            letterPerf.masteryLevel = 3;
        } else if (recentAvg >= 70) {
            letterPerf.masteryLevel = 2;
        } else {
            letterPerf.masteryLevel = 1;
        }
    }
    
    updateProgressTimeline(letter, score) {
        const character = this.getCurrentCharacter();
        if (!character) return;
        
        const letterPerf = character.statistics.letterPerformance[letter];
        const today = new Date().toISOString().split('T')[0];
        
        // Find today's entry
        let todayEntry = letterPerf.progressTimeline.find(entry => entry.date === today);
        
        if (!todayEntry) {
            todayEntry = {
                date: today,
                score: score,
                attempts: 1,
                bestScore: score
            };
            letterPerf.progressTimeline.push(todayEntry);
            
            // Keep only last 30 days
            if (letterPerf.progressTimeline.length > 30) {
                letterPerf.progressTimeline.shift();
            }
        } else {
            // Update today's aggregate
            const totalScore = todayEntry.score * todayEntry.attempts + score;
            todayEntry.attempts++;
            todayEntry.score = Math.round(totalScore / todayEntry.attempts);
            todayEntry.bestScore = Math.max(todayEntry.bestScore, score);
        }
    }
    
    getLetterPerformance(letter) {
        const character = this.getCurrentCharacter();
        if (!character || !character.statistics.letterPerformance[letter]) {
            return null;
        }
        
        return character.statistics.letterPerformance[letter];
    }
    
    getAllLetterPerformance() {
        const character = this.getCurrentCharacter();
        if (!character) return {};
        
        return character.statistics.letterPerformance || {};
    }
    
    // ========== Challenge Documentation ==========
    
    recordChallengeCompletion(challengeId, worksheetPhotoData, rewards) {
        const character = this.getCurrentCharacter();
        if (!character) return;
        
        if (!character.challengeHistory) {
            character.challengeHistory = {};
        }
        
        const record = {
            completedDate: Date.now(),
            verifiedBy: 'teacherPIN',
            worksheetPhoto: worksheetPhotoData ? {
                id: `photo_${challengeId}_${Date.now()}`,
                timestamp: Date.now(),
                imageData: worksheetPhotoData,
                fileSize: worksheetPhotoData.length
            } : null,
            rewards: rewards || {}
        };
        
        character.challengeHistory[challengeId] = record;
        
        this.markDirty();
        return record;
    }
    
    // ========== Cleanup ==========
    
    destroy() {
        this.updatePlayTime();
        this.stopAutoSave();
        this.save();
    }
}