// World Manager for handling game world and entities

class WorldManager {
    constructor(game) {
        this.game = game;
        this.letterlings = [];
        this.bots = [];
        this.orbs = [];
        this.spawners = [];
        this.environmentObjects = [];
        
        // World generation settings - High action for young kids
        this.letterlingCount = 50; // Lots of action to keep kids engaged
        this.botCount = 12; // More bots for competitive feel
        this.orbCount = 100; // Lots of collectibles everywhere
        this.maxLetterlings = 50; // Max 50 letterlings on screen
        this.minVisibleLetterlings = 25; // Always keep many visible for constant action
        this.targetChoicesNearPlayer = 5; // Aim for 5-6 different letter choices near player
        
        // Progressive letter system is now handled by SpawnPool
        this.availableLetters = []; // Deprecated - SpawnPool handles letters now
        this.letterWeights = new Map(); // For frequency control when 10+ letters
        this.recentlySpawned = []; // Track recently spawned letters for better variety
        this.maxRecentTracking = 10; // Track last 10 spawned letters
        
        console.log(`🌟 WorldManager: Starting with ${this.availableLetters.length} letters: [${this.availableLetters.join(', ')}]`);
        
        this.init();
    }
    
    init() {
        // WorldManager ready
    }
    
    generateWorld() {
        // Don't generate world entities if game is not in playing state
        if (this.game.state === 'playing') {
            this.generateLetterlings();
            this.generateBots();
            this.generateOrbs();
            this.generateEnvironmentObjects();
        }
        
        // Update game references (even if empty)
        this.game.letterlings = this.letterlings;
        this.game.bots = this.bots;
        this.game.orbs = this.orbs;
        this.game.environmentObjects = this.environmentObjects;
    }
    
    generateLetterlings() {
        // Generate letterlings using spawn pool
        
        const spawnedLetters = [];
        const playerX = this.game.player ? this.game.player.x : this.game.worldWidth / 2;
        const playerY = this.game.player ? this.game.player.y : this.game.worldHeight / 2;
        const minDistanceFromPlayer = 300; // Minimum distance from player
        
        for (let i = 0; i < this.letterlingCount; i++) {
            const letter = this.game.spawnPool ? this.game.spawnPool.getSpawnLetter() : 'a';
            spawnedLetters.push(letter);
            
            let x, y;
            let attempts = 0;
            
            // Keep trying to find a position away from the player
            do {
                x = Utils.randomBetween(100, this.game.worldWidth - 100);
                y = Utils.randomBetween(100, this.game.worldHeight - 100);
                attempts++;
            } while (Utils.distance(x, y, playerX, playerY) < minDistanceFromPlayer && attempts < 20);
            
            const letterling = new Letterling({
                x: x,
                y: y,
                letter: letter,
                radius: 25
            });
            
            this.letterlings.push(letterling);
        }
        
        // Show what was actually spawned
        const letterCounts = {};
        spawnedLetters.forEach(letter => {
            letterCounts[letter] = (letterCounts[letter] || 0) + 1;
        });
        
        console.log(`🌍 Generated ${this.letterlingCount} letterlings:`);
        Object.entries(letterCounts).forEach(([letter, count]) => {
            console.log(`  ${letter}: ${count} times`);
        });
    }
    
    generateBots() {
        // Popular names from 2017-2020 (ages 4-7 now)
        const popularNames = [
            // Boys
            'Liam', 'Noah', 'Oliver', 'Elijah', 'William', 'James', 'Benjamin', 'Lucas', 'Henry', 'Alexander',
            'Mason', 'Michael', 'Ethan', 'Daniel', 'Jacob', 'Logan', 'Jackson', 'Levi', 'Sebastian', 'Mateo',
            'Jack', 'Owen', 'Theodore', 'Aiden', 'Samuel', 'Joseph', 'John', 'David', 'Wyatt', 'Matthew',
            // Girls  
            'Emma', 'Olivia', 'Ava', 'Isabella', 'Sophia', 'Charlotte', 'Mia', 'Amelia', 'Harper', 'Evelyn',
            'Abigail', 'Emily', 'Elizabeth', 'Mila', 'Ella', 'Avery', 'Sofia', 'Camila', 'Aria', 'Scarlett',
            'Victoria', 'Madison', 'Luna', 'Grace', 'Chloe', 'Penelope', 'Layla', 'Riley', 'Zoey', 'Nora'
        ];
        
        for (let i = 0; i < this.botCount; i++) {
            const bot = new Bot({
                x: Utils.randomBetween(200, this.game.worldWidth - 200),
                y: Utils.randomBetween(200, this.game.worldHeight - 200),
                radius: 20,
                name: Utils.pickRandom(popularNames),
                game: this.game
            });
            
            this.bots.push(bot);
        }
        
        console.log(`🤖 Generated ${this.botCount} bots with names: [${this.bots.map(b => b.name).join(', ')}]`);
    }
    
    generateOrbs() {
        for (let i = 0; i < this.orbCount; i++) {
            const orb = new Orb({
                x: Utils.randomBetween(50, this.game.worldWidth - 50),
                y: Utils.randomBetween(50, this.game.worldHeight - 50),
                value: Utils.randomInt(1, 3),
                radius: 8
            });
            
            this.orbs.push(orb);
        }
    }
    
    generateEnvironmentObjects() {
        // Clear existing objects
        this.environmentObjects = [];
        
        // Get current level theme
        const currentLevel = this.game.levelManager?.getCurrentLevel();
        const levelTheme = this.currentLevelTheme;
        
        if (!currentLevel) return;
        
        // Generate objects based on level theme
        const objectCount = Utils.randomBetween(10, 20);
        
        for (let i = 0; i < objectCount; i++) {
            const obj = new EnvironmentObject({
                x: Utils.randomBetween(100, this.game.worldWidth - 100),
                y: Utils.randomBetween(100, this.game.worldHeight - 100),
                theme: currentLevel.theme,
                levelColor: currentLevel.primaryColor,
                game: this.game
            });
            
            // Ensure objects don't spawn too close to player start
            const distFromStart = Utils.distance(obj.x, obj.y, 
                this.game.worldWidth / 2, this.game.worldHeight / 2);
            
            if (distFromStart > 200) {
                this.environmentObjects.push(obj);
            }
        }
    }
    
    update(deltaTime) {
        // Update letterlings
        for (const letterling of this.letterlings) {
            if (letterling.isActive) {
                letterling.update(deltaTime);
            }
        }
        
        // Update bots with AI context
        for (const bot of this.bots) {
            if (bot.isActive) {
                // Provide targets for bot AI
                bot.findNearbyOrbs = (range) => this.findNearbyOrbs(bot.x, bot.y, range);
                bot.findNearbyLetterlings = (range) => this.findNearbyLetterlings(bot.x, bot.y, range);
                
                bot.update(deltaTime);
            }
        }
        
        // Update environment objects
        for (const obj of this.environmentObjects) {
            obj.update(deltaTime);
        }
        
        // Check bot collisions
        this.checkBotCollisions();
        
        // Handle letterling despawning and replacement
        this.handleLetterlingDespawning(deltaTime);
        
        // Respawn entities if needed
        this.handleRespawning();
    }
    
    handleLetterlingDespawning(deltaTime) {
        const camera = this.game.camera;
        const screenWidth = this.game.width;
        const screenHeight = this.game.height;
        
        // Add some buffer around screen edges
        const buffer = 100;
        const leftEdge = camera.x - buffer;
        const rightEdge = camera.x + screenWidth + buffer;
        const topEdge = camera.y - buffer;
        const bottomEdge = camera.y + screenHeight + buffer;
        
        for (let i = this.letterlings.length - 1; i >= 0; i--) {
            const letterling = this.letterlings[i];
            if (!letterling.isActive) continue;
            
            // Check if letterling is off-screen
            const wasOffScreen = letterling.isOffScreen;
            letterling.isOffScreen = (
                letterling.x < leftEdge || 
                letterling.x > rightEdge || 
                letterling.y < topEdge || 
                letterling.y > bottomEdge
            );
            
            if (letterling.isOffScreen) {
                letterling.offScreenTime += deltaTime;
                
                // Despawn if off-screen too long
                if (letterling.offScreenTime >= letterling.offScreenDuration) {
                    console.log(`🗑️ Despawning letterling '${letterling.letter}' after ${letterling.offScreenTime/1000}s off-screen`);
                    
                    // Remove letterling
                    this.letterlings.splice(i, 1);
                    
                    // Spawn replacement
                    this.spawnNewLetterling();
                }
            } else {
                // Reset off-screen timer when back on screen
                if (wasOffScreen) {
                    letterling.offScreenTime = 0;
                    console.log(`👁️ Letterling '${letterling.letter}' back on screen, resetting timer`);
                }
            }
        }
        
        // Update game reference
        this.game.letterlings = this.letterlings;
    }
    
    spawnNewLetterling() {
        // Don't spawn if game is not in playing state
        if (this.game.state !== 'playing') {
            return;
        }
        
        // Get letter from spawn pool or fallback
        const letter = this.game.spawnPool ? this.game.spawnPool.getSpawnLetter() : 'a';
        
        // Spawn away from player but not too far
        const player = this.game.player;
        const spawnDistance = Utils.randomBetween(400, 800);
        const angle = Math.random() * Math.PI * 2;
        
        const x = Utils.clamp(
            player.x + Math.cos(angle) * spawnDistance,
            50, 
            this.game.worldWidth - 50
        );
        const y = Utils.clamp(
            player.y + Math.sin(angle) * spawnDistance,
            50,
            this.game.worldHeight - 50
        );
        
        const letterling = new Letterling({
            x: x,
            y: y,
            letter: letter,
            radius: Utils.randomBetween(35, 50)
        });
        
        this.letterlings.push(letterling);
        console.log(`✨ Spawned new letterling '${letter}' at (${Math.round(x)}, ${Math.round(y)}) from SpawnPool`);
        
        // Send multiplayer update if host
        if (this.game.multiplayerManager && this.game.multiplayerManager.isGameHost()) {
            this.game.multiplayerManager.sendLetterlingSpawn(letterling);
        }
    }
    
    findNearbyOrbs(x, y, range) {
        return this.game.orbs.filter(orb => {
            const distance = Utils.distance(x, y, orb.x, orb.y);
            return distance <= range;
        }).sort((a, b) => {
            const distA = Utils.distance(x, y, a.x, a.y);
            const distB = Utils.distance(x, y, b.x, b.y);
            return distA - distB;
        });
    }
    
    findNearbyLetterlings(x, y, range) {
        return this.letterlings.filter(letterling => {
            if (!letterling.isActive) return false;
            const distance = Utils.distance(x, y, letterling.x, letterling.y);
            return distance <= range;
        }).sort((a, b) => {
            const distA = Utils.distance(x, y, a.x, a.y);
            const distB = Utils.distance(x, y, b.x, b.y);
            return distA - distB;
        });
    }
    
    spawnLetterlingAt(data) {
        // Used by multiplayer to spawn letterlings at specific positions
        const letterling = new Letterling({
            id: data.id,
            x: data.x,
            y: data.y,
            letter: data.letter,
            radius: Utils.randomBetween(35, 50),
            vx: data.vx || 0,
            vy: data.vy || 0
        });
        
        this.letterlings.push(letterling);
        console.log(`🌐 Spawned multiplayer letterling '${data.letter}' at (${Math.round(data.x)}, ${Math.round(data.y)})`);
    }
    
    removeLetterling(letterlingId) {
        // Find and deactivate letterling by ID
        const letterling = this.letterlings.find(l => l.id === letterlingId);
        if (letterling && letterling.isActive) {
            letterling.deactivate();
            console.log(`🎯 Letterling ${letterlingId} removed (multiplayer collection)`);
        }
    }
    
    checkBotCollisions() {
        for (const bot of this.bots) {
            if (!bot.isActive) continue;
            
            // Bot-orb collisions
            for (let i = this.game.orbs.length - 1; i >= 0; i--) {
                const orb = this.game.orbs[i];
                if (!orb) continue; // Safety check
                
                const distance = Utils.distance(bot.x, bot.y, orb.x, orb.y);
                if (distance < bot.radius + orb.radius) {
                    bot.collectOrb(orb);
                    this.game.orbs.splice(i, 1);
                }
            }
            
            // Bot-letterling collisions (start capture)
            for (const letterling of this.letterlings) {
                if (!letterling || !letterling.isActive || bot.state === 'capturing') continue;
                
                // Don't let bots capture letterlings the player is tracing
                if (letterling.beingTracedByPlayer) continue;
                
                const distance = Utils.distance(bot.x, bot.y, letterling.x, letterling.y);
                if (distance < bot.radius + letterling.radius) {
                    bot.startCapture(letterling);
                    break; // Only capture one at a time
                }
            }
        }
    }
    
    handleRespawning() {
        // Don't respawn if game is not in playing state
        if (this.game.state !== 'playing') {
            return;
        }
        
        // Respawn letterlings extremely fast for younger kids' attention
        const inactiveLetterlings = this.letterlings.filter(l => !l.isActive);
        for (const letterling of inactiveLetterlings) {
            if (Date.now() - letterling.deactivatedTime > 800) { // Super fast: 0.8 seconds for constant action
                this.respawnLetterlingAwayFromPlayer(letterling);
            }
        }
        
        // Ensure minimum visible letterlings but respect the 10 max limit
        const activeCount = this.letterlings.filter(l => l.isActive).length;
        const visibleCount = this.getVisibleLetterlingCount();
        
        // Only spawn if we're below the max limit and need more visible letterlings
        if (activeCount < this.maxLetterlings && (visibleCount < this.minVisibleLetterlings || activeCount < this.letterlingCount)) {
            this.spawnNewLetterling();
        }
    }
    
    getVisibleLetterlingCount() {
        const camera = this.game.camera;
        const screenBounds = {
            left: camera.x - 100,  // Extend bounds slightly
            right: camera.x + this.game.width + 100,
            top: camera.y - 100,
            bottom: camera.y + this.game.height + 100
        };
        
        return this.letterlings.filter(l => {
            if (!l.isActive) return false;
            return l.x >= screenBounds.left && l.x <= screenBounds.right &&
                   l.y >= screenBounds.top && l.y <= screenBounds.bottom;
        }).length;
    }
    
    respawnLetterlingAwayFromPlayer(letterling) {
        const player = this.game.player;
        let attempts = 0;
        let newX, newY;
        
        // Try to spawn away from player
        do {
            newX = Utils.randomBetween(100, this.game.worldWidth - 100);
            newY = Utils.randomBetween(100, this.game.worldHeight - 100);
            attempts++;
        } while (
            attempts < 10 && 
            Utils.distance(newX, newY, player.x, player.y) < 300 // Stay at least 300px away
        );
        
        letterling.respawn(newX, newY, this.game);
        console.log(`📍 Letterling respawned at (${Math.round(newX)}, ${Math.round(newY)}) - Distance from player: ${Math.round(Utils.distance(newX, newY, player.x, player.y))}`);
    }
    
    spawnNewLetterling() {
        // Check if we're at the limit
        const activeCount = this.letterlings.filter(l => l.isActive).length;
        if (activeCount >= this.maxLetterlings) {
            return; // Don't spawn if we're at the limit
        }
        
        const letter = this.game.spawnPool ? this.game.spawnPool.getSpawnLetter() : 'a';
        const player = this.game.player;
        
        // Spawn in a ring around the world edges, away from player
        let spawnX, spawnY;
        const margin = 150;
        const side = Math.floor(Math.random() * 4);
        
        switch (side) {
            case 0: // Top
                spawnX = Utils.randomBetween(margin, this.game.worldWidth - margin);
                spawnY = Utils.randomBetween(margin, margin + 200);
                break;
            case 1: // Right
                spawnX = Utils.randomBetween(this.game.worldWidth - margin - 200, this.game.worldWidth - margin);
                spawnY = Utils.randomBetween(margin, this.game.worldHeight - margin);
                break;
            case 2: // Bottom
                spawnX = Utils.randomBetween(margin, this.game.worldWidth - margin);
                spawnY = Utils.randomBetween(this.game.worldHeight - margin - 200, this.game.worldHeight - margin);
                break;
            case 3: // Left
                spawnX = Utils.randomBetween(margin, margin + 200);
                spawnY = Utils.randomBetween(margin, this.game.worldHeight - margin);
                break;
        }
        
        const letterling = new Letterling({
            x: spawnX,
            y: spawnY,
            letter: letter,
            radius: 25
        });
        
        this.letterlings.push(letterling);
        console.log(`✨ New letterling '${letter}' spawned at (${Math.round(spawnX)}, ${Math.round(spawnY)}) - Active count: ${activeCount + 1}/${this.maxLetterlings} from SpawnPool`);
    }
    
    // DEPRECATED: Letter system moved to SpawnPool
    // updateAvailableLetters(newLetters) { ... }
    
    // DEPRECATED: updateLetterWeights() - Letter system moved to SpawnPool
    /* 
    updateLetterWeights() {
        this.letterWeights.clear();
        // ... method body removed ...
    }
    */
    
    selectWeightedLetter() {
        if (this.availableLetters.length === 0) {
            // No letters available, using fallback
            return 'a';
        }
        
        // Simple letter selection for small pools
        
        let selectedLetter;
        
        // Simple random selection for <= 10 letters
        if (this.availableLetters.length <= 10) {
            selectedLetter = Utils.pickRandom(this.availableLetters);
            // Simple random selection
            this.trackRecentLetter(selectedLetter);
            return selectedLetter;
        }
        
        // Enhanced weighted selection with recent letter avoidance
        const adjustedWeights = new Map();
        
        for (const [letter, baseWeight] of this.letterWeights) {
            let adjustedWeight = baseWeight;
            
            // Reduce weight for recently spawned letters to improve variety
            const recentIndex = this.recentlySpawned.indexOf(letter);
            if (recentIndex !== -1) {
                // The more recent, the more we reduce the weight
                const recencyPenalty = 1.0 - (0.7 * (this.recentlySpawned.length - recentIndex) / this.recentlySpawned.length);
                adjustedWeight *= recencyPenalty;
            }
            
            adjustedWeights.set(letter, adjustedWeight);
        }
        
        const totalWeight = Array.from(adjustedWeights.values()).reduce((sum, weight) => sum + weight, 0);
        let random = Math.random() * totalWeight;
        
        // Enhanced weighted selection with recent letter tracking
        
        for (const [letter, weight] of adjustedWeights) {
            random -= weight;
            if (random <= 0) {
                selectedLetter = letter;
                // Enhanced selection successful
                this.trackRecentLetter(selectedLetter);
                return selectedLetter;
            }
        }
        
        // Fallback
        selectedLetter = this.availableLetters[this.availableLetters.length - 1];
        // Fallback selection
        this.trackRecentLetter(selectedLetter);
        return selectedLetter;
    }
    
    trackRecentLetter(letter) {
        // Add to recent list
        this.recentlySpawned.push(letter);
        
        // Keep only the most recent letters
        if (this.recentlySpawned.length > this.maxRecentTracking) {
            this.recentlySpawned.shift();
        }
        
        // Track recently spawned letter
    }
    
    showLetterUnlockNotification(newLetters) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 25%;
            left: 50%;
            transform: translateX(-50%);
            background: linear-gradient(135deg, #4CAF50, #8BC34A);
            color: white;
            padding: 20px 30px;
            border: 4px solid #333;
            border-radius: 20px;
            font-size: 24px;
            font-weight: bold;
            z-index: 1003;
            animation: upgradeFloat 4s ease-out forwards;
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.4);
            text-align: center;
        `;
        
        notification.innerHTML = `
            <div style="font-size: 40px; margin-bottom: 10px;">🔓</div>
            <div>NEW LETTERS UNLOCKED!</div>
            <div style="font-size: 20px; margin-top: 10px; color: #E8F5E8;">${newLetters.join(', ')}</div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 4000);
    }
}

// Letterling entity class
class Letterling {
    constructor(config) {
        this.id = config.id || `letterling_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        this.x = config.x;
        this.y = config.y;
        this.letter = config.letter;
        this.radius = config.radius;
        this.isActive = true;
        this.deactivatedTime = 0;
        
        // Off-screen tracking for despawning
        this.isOffScreen = false;
        this.offScreenTime = 0;
        this.offScreenDuration = 5000; // 5 seconds off-screen before despawn
        
        // Movement - Much faster for younger kids
        this.vx = Utils.randomBetween(-70, 70);
        this.vy = Utils.randomBetween(-70, 70);
        this.speed = Utils.randomBetween(55, 85);
        
        // Visual
        this.color = this.getLetterColor();
        this.glowIntensity = 0;
        this.glowDirection = 1;
    }
    
    getLetterColor() {
        // Get level-specific colors if in a level
        const levelTheme = this.game?.worldManager?.currentLevelTheme;
        const currentLevel = this.game?.levelManager?.getCurrentLevel();
        
        if (levelTheme && currentLevel) {
            // Return level's primary color with slight variations
            const baseColor = levelTheme.primaryColor;
            const variation = this.letter.charCodeAt(0) % 40 - 20; // -20 to +20
            return this.adjustColorBrightness(baseColor, variation);
        }
        
        // Default colors when not in a level
        const colors = {
            'a': '#FF6B6B', 'A': '#FF6B6B',
            'c': '#4ECDC4', 'C': '#4ECDC4',
            'o': '#45B7D1', 'O': '#45B7D1'
        };
        return colors[this.letter] || '#95E1D3';
    }
    
    adjustColorBrightness(hex, percent) {
        // Remove # if present
        hex = hex.replace('#', '');
        
        // Parse hex to RGB
        let r = parseInt(hex.substring(0, 2), 16);
        let g = parseInt(hex.substring(2, 4), 16);
        let b = parseInt(hex.substring(4, 6), 16);
        
        // Adjust brightness
        r = Math.max(0, Math.min(255, r + (r * percent / 100)));
        g = Math.max(0, Math.min(255, g + (g * percent / 100)));
        b = Math.max(0, Math.min(255, b + (b * percent / 100)));
        
        // Convert back to hex
        return '#' + Math.round(r).toString(16).padStart(2, '0') + 
                     Math.round(g).toString(16).padStart(2, '0') + 
                     Math.round(b).toString(16).padStart(2, '0');
    }
    
    update(deltaTime) {
        if (!this.isActive) return;
        
        // Random movement
        this.x += this.vx * deltaTime;
        this.y += this.vy * deltaTime;
        
        // Bounce off world boundaries
        if (this.x <= this.radius || this.x >= 3000 - this.radius) {
            this.vx *= -1;
            this.x = Utils.clamp(this.x, this.radius, 3000 - this.radius);
        }
        if (this.y <= this.radius || this.y >= 3000 - this.radius) {
            this.vy *= -1;
            this.y = Utils.clamp(this.y, this.radius, 3000 - this.radius);
        }
        
        // Update glow effect
        this.glowIntensity += this.glowDirection * deltaTime * 2;
        if (this.glowIntensity >= 1 || this.glowIntensity <= 0) {
            this.glowDirection *= -1;
            this.glowIntensity = Utils.clamp(this.glowIntensity, 0, 1);
        }
    }
    
    render(ctx) {
        if (!this.isActive) return;
        
        // Check if this letter is part of the current level's letter set
        const levelTheme = this.game?.worldManager?.currentLevelTheme;
        const currentLevelManager = this.game?.levelManager;
        const currentLevel = currentLevelManager?.getCurrentLevel();
        
        let isSpecialLetter = false;
        let themeColor = levelTheme ? levelTheme.primaryColor : this.color;
        
        // Check if this letter is NOT in the current level's letters (special spawn)
        if (currentLevel && currentLevel.letters && !currentLevel.letters.includes(this.letter)) {
            isSpecialLetter = true;
            themeColor = '#FFD700'; // Gold color for special letters
        }
        
        // Glow effect for magical feel (enhanced for special letters)
        const glowRadius = this.radius + (this.glowIntensity * (isSpecialLetter ? 12 : 8));
        const gradient = ctx.createRadialGradient(
            this.x, this.y, this.radius * 0.3,
            this.x, this.y, glowRadius
        );
        
        if (isSpecialLetter) {
            // Special golden glow with sparkle effect
            gradient.addColorStop(0, '#FFD700');
            gradient.addColorStop(0.3, '#FFA500');
            gradient.addColorStop(0.7, 'rgba(255, 215, 0, 0.6)');
            gradient.addColorStop(1, 'rgba(255, 215, 0, 0)');
        } else {
            gradient.addColorStop(0, themeColor);
            gradient.addColorStop(0.7, themeColor + '80'); // Semi-transparent
            gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        }
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, glowRadius, 0, Math.PI * 2);
        ctx.fill();
        
        // Special sparkle effect for special letters
        if (isSpecialLetter) {
            this.renderSparkleEffect(ctx);
        }
        
        // Monster body (slightly squished circle for cute effect)
        ctx.fillStyle = themeColor;
        ctx.beginPath();
        ctx.ellipse(this.x, this.y + 2, this.radius, this.radius * 0.9, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Body outline
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 3;
        ctx.stroke();
        
        // Eyes (cute monster eyes)
        const eyeSize = this.radius * 0.15;
        const eyeOffset = this.radius * 0.35;
        
        // Left eye (white background)
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(this.x - eyeOffset, this.y - 3, eyeSize * 1.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Right eye (white background)
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(this.x + eyeOffset, this.y - 3, eyeSize * 1.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        // Eye pupils (move slightly with glow intensity for life)
        const pupilOffset = this.glowIntensity * 1.5;
        ctx.fillStyle = '#333';
        ctx.beginPath();
        ctx.arc(this.x - eyeOffset + pupilOffset, this.y - 3, eyeSize, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(this.x + eyeOffset - pupilOffset, this.y - 3, eyeSize, 0, Math.PI * 2);
        ctx.fill();
        
        // Small eye highlights for sparkle
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(this.x - eyeOffset + pupilOffset + 2, this.y - 5, eyeSize * 0.4, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(this.x + eyeOffset - pupilOffset + 2, this.y - 5, eyeSize * 0.4, 0, Math.PI * 2);
        ctx.fill();
        
        // Cute little antenna/horns
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        
        // Left antenna
        ctx.beginPath();
        ctx.moveTo(this.x - this.radius * 0.5, this.y - this.radius * 0.7);
        ctx.lineTo(this.x - this.radius * 0.7, this.y - this.radius * 1.2);
        ctx.stroke();
        
        // Right antenna
        ctx.beginPath();
        ctx.moveTo(this.x + this.radius * 0.5, this.y - this.radius * 0.7);
        ctx.lineTo(this.x + this.radius * 0.7, this.y - this.radius * 1.2);
        ctx.stroke();
        
        // Antenna tips (little balls)
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x - this.radius * 0.7, this.y - this.radius * 1.2, 3, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(this.x + this.radius * 0.7, this.y - this.radius * 1.2, 3, 0, Math.PI * 2);
        ctx.fill();
        
        // Letter on the belly
        ctx.fillStyle = 'white';
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        ctx.font = `bold ${this.radius * 0.8}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Letter outline
        ctx.strokeText(this.letter, this.x, this.y + 4);
        // Letter fill
        ctx.fillText(this.letter, this.x, this.y + 4);
        
        // Add level-specific decorations
        if (levelTheme && currentLevel) {
            this.renderLevelDecorations(ctx, currentLevel.theme);
        }
    }
    
    renderLevelDecorations(ctx, theme) {
        switch (theme) {
            case 'nature':
                // Sunny Meadow - Add flower crown
                ctx.strokeStyle = '#FF69B4';
                ctx.fillStyle = '#FFB6C1';
                ctx.lineWidth = 2;
                for (let i = 0; i < 3; i++) {
                    const angle = (i * Math.PI * 2 / 3) - Math.PI / 2;
                    const flowerX = this.x + Math.cos(angle) * this.radius * 0.8;
                    const flowerY = this.y - this.radius * 0.9 + Math.sin(angle) * this.radius * 0.2;
                    ctx.beginPath();
                    ctx.arc(flowerX, flowerY, 4, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.stroke();
                }
                break;
                
            case 'water':
                // Ocean Waves - Add bubbles
                ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
                for (let i = 0; i < 3; i++) {
                    const bubbleX = this.x + Utils.randomBetween(-this.radius, this.radius);
                    const bubbleY = this.y - this.radius - 10 - (i * 8);
                    ctx.beginPath();
                    ctx.arc(bubbleX, bubbleY, 3 - i, 0, Math.PI * 2);
                    ctx.fill();
                }
                break;
                
            case 'fantasy':
                // Magic Forest - Add sparkles
                ctx.fillStyle = '#FFD700';
                for (let i = 0; i < 4; i++) {
                    const sparkleAngle = (Date.now() / 1000 + i) % (Math.PI * 2);
                    const sparkleX = this.x + Math.cos(sparkleAngle) * (this.radius + 10);
                    const sparkleY = this.y + Math.sin(sparkleAngle) * (this.radius + 10);
                    ctx.save();
                    ctx.translate(sparkleX, sparkleY);
                    ctx.rotate(sparkleAngle);
                    ctx.fillRect(-2, -2, 4, 4);
                    ctx.restore();
                }
                break;
                
            case 'space':
                // Space Station - Add satellite dishes
                ctx.strokeStyle = '#C0C0C0';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(this.x - this.radius * 0.8, this.y - this.radius * 0.8, 6, 0, Math.PI * 2);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(this.x - this.radius * 0.8, this.y - this.radius * 0.8);
                ctx.lineTo(this.x - this.radius * 0.5, this.y - this.radius * 0.5);
                ctx.stroke();
                break;
                
            case 'candy':
                // Candy Kingdom - Add lollipop swirls
                ctx.strokeStyle = '#FF1493';
                ctx.lineWidth = 3;
                ctx.setLineDash([3, 3]);
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius + 5, 0, Math.PI * 2);
                ctx.stroke();
                ctx.setLineDash([]);
                break;
        }
    }
    
    deactivate() {
        this.isActive = false;
        this.deactivatedTime = Date.now();
    }
    
    respawn(x, y, game = null) {
        this.x = x;
        this.y = y;
        this.isActive = true;
        this.vx = Utils.randomBetween(-45, 45);
        this.vy = Utils.randomBetween(-45, 45);
        
        // Get new letter from spawn pool if available
        if (game && game.spawnPool) {
            const oldLetter = this.letter;
            this.letter = game.spawnPool.getSpawnLetter();
            console.log(`🔄 Letterling respawned: '${oldLetter}' → '${this.letter}'`);
        }
    }
    
    renderSparkleEffect(ctx) {
        // Draw sparkles around special letters
        const sparkleCount = 6;
        const time = Date.now() * 0.003;
        
        for (let i = 0; i < sparkleCount; i++) {
            const angle = (i / sparkleCount) * Math.PI * 2 + time;
            const distance = this.radius + 25 + Math.sin(time * 2 + i) * 10;
            const sparkleX = this.x + Math.cos(angle) * distance;
            const sparkleY = this.y + Math.sin(angle) * distance;
            const sparkleSize = 3 + Math.sin(time * 3 + i) * 2;
            
            ctx.fillStyle = '#FFFFFF';
            ctx.shadowColor = '#FFD700';
            ctx.shadowBlur = 8;
            
            // Draw 4-pointed star
            ctx.beginPath();
            ctx.moveTo(sparkleX, sparkleY - sparkleSize);
            ctx.lineTo(sparkleX + sparkleSize * 0.3, sparkleY - sparkleSize * 0.3);
            ctx.lineTo(sparkleX + sparkleSize, sparkleY);
            ctx.lineTo(sparkleX + sparkleSize * 0.3, sparkleY + sparkleSize * 0.3);
            ctx.lineTo(sparkleX, sparkleY + sparkleSize);
            ctx.lineTo(sparkleX - sparkleSize * 0.3, sparkleY + sparkleSize * 0.3);
            ctx.lineTo(sparkleX - sparkleSize, sparkleY);
            ctx.lineTo(sparkleX - sparkleSize * 0.3, sparkleY - sparkleSize * 0.3);
            ctx.closePath();
            ctx.fill();
            
            // Reset shadow
            ctx.shadowBlur = 0;
        }
    }
}

// Bot entity class
class Bot {
    constructor(config) {
        this.x = config.x;
        this.y = config.y;
        this.radius = config.radius || 20;
        this.baseRadius = this.radius; // Store base size
        this.name = config.name;
        this.game = config.game; // Reference to game instance for fireworks
        this.isActive = true;
        
        // AI state
        this.state = 'wander'; // wander, seek_orb, seek_letterling, capturing
        this.target = null;
        this.baseSpeed = Utils.randomBetween(90, 130); // Base speed
        this.speed = this.baseSpeed;
        this.targetUpdateTime = 0;
        
        // Scoring system
        this.score = 0;
        this.coins = 0;
        this.lettersCaptured = new Map(); // Track letters and counts
        
        // Progression simulation
        this.progressionLevel = 1;
        this.progressionTimer = 0;
        this.nextProgressionTime = Utils.randomBetween(20000, 40000); // Progress every 20-40 seconds
        this.tempBoostEnd = 0;
        this.tempBoostType = null;
        
        // Capture progress
        this.captureProgress = 0;
        this.captureTarget = null;
        this.captureStartTime = 0;
        this.captureDuration = 3000; // 3 seconds to capture
        
        // Visual - Give bots random emoji skins
        this.color = Utils.pickRandom(['#FFD93D', '#6BCF7F', '#4D96FF', '#FF6B9D']);
        this.angle = 0;
        
        // Bot emoji skins - different from player skins
        const botEmojis = [
            '🤖', '👾', '🐱', '🐶', '🦊', '🐼', '🦁', '🐯', 
            '🎮', '⚡', '🔥', '💫', '🌟', '🎯', '🎨', '🎪',
            '😎', '🥳', '🤓', '🤠', '🎭', '👻', '🌈', '💎'
        ];
        this.emoji = Utils.pickRandom(botEmojis);
    }
    
    update(deltaTime) {
        if (!this.isActive) return;
        
        const currentTime = Date.now();
        
        // Update progression simulation
        this.updateProgression(deltaTime, currentTime);
        
        // Handle capturing state
        if (this.state === 'capturing' && this.captureTarget) {
            this.updateCapture(deltaTime, currentTime);
            return;
        }
        
        // Update AI target every 2 seconds
        if (currentTime - this.targetUpdateTime > 2000) {
            this.updateAITarget();
            this.targetUpdateTime = currentTime;
        }
        
        // Move based on current state
        this.updateMovement(deltaTime);
        
        // Keep in bounds
        this.constrainToBounds();
    }
    
    updateProgression(deltaTime, currentTime) {
        // Update progression timer
        this.progressionTimer += deltaTime * 1000;
        
        // Check for progression level up
        if (this.progressionTimer >= this.nextProgressionTime) {
            this.simulateProgression();
            this.progressionTimer = 0;
            this.nextProgressionTime = Utils.randomBetween(20000, 40000);
        }
        
        // Handle temporary boosts
        if (this.tempBoostEnd > 0 && currentTime > this.tempBoostEnd) {
            this.endTempBoost();
        }
    }
    
    simulateProgression() {
        this.progressionLevel++;
        
        // Randomly choose upgrade type
        const upgradeTypes = ['speed', 'size', 'both'];
        const upgrade = Utils.pickRandom(upgradeTypes);
        
        // 50% chance for temporary boost instead of permanent
        const isTemp = Math.random() < 0.5;
        
        if (isTemp) {
            // Apply temporary boost
            const duration = Utils.randomBetween(10000, 20000); // 10-20 seconds
            this.tempBoostEnd = Date.now() + duration;
            this.tempBoostType = upgrade;
            
            switch (upgrade) {
                case 'speed':
                    this.speed = this.baseSpeed * Utils.randomBetween(1.5, 2.0);
                    break;
                case 'size':
                    this.radius = this.baseRadius * Utils.randomBetween(1.3, 1.8);
                    break;
                case 'both':
                    this.speed = this.baseSpeed * Utils.randomBetween(1.3, 1.7);
                    this.radius = this.baseRadius * Utils.randomBetween(1.2, 1.5);
                    break;
            }
        } else {
            // Apply permanent upgrade (smaller)
            switch (upgrade) {
                case 'speed':
                    this.baseSpeed *= Utils.randomBetween(1.1, 1.2);
                    this.speed = this.baseSpeed;
                    break;
                case 'size':
                    this.baseRadius *= Utils.randomBetween(1.05, 1.1);
                    this.radius = this.baseRadius;
                    break;
                case 'both':
                    this.baseSpeed *= Utils.randomBetween(1.05, 1.1);
                    this.baseRadius *= Utils.randomBetween(1.02, 1.05);
                    this.speed = this.baseSpeed;
                    this.radius = this.baseRadius;
                    break;
            }
        }
        
        // Increase score to show progression
        this.score += Utils.randomBetween(50, 150);
    }
    
    endTempBoost() {
        // Reset to base stats
        this.speed = this.baseSpeed;
        this.radius = this.baseRadius;
        this.tempBoostEnd = 0;
        this.tempBoostType = null;
    }
    
    updateCapture(deltaTime, currentTime) {
        if (!this.captureTarget) {
            // Capture target was removed, reset state
            this.state = 'wander';
            this.captureProgress = 0;
            return;
        }
        
        // Check if letterling is still active
        if (!this.captureTarget.isActive) {
            console.log(`🚫 ${this.name} stopping capture - letterling deactivated`);
            this.captureTarget = null;
            this.state = 'wander';
            this.captureProgress = 0;
            return;
        }
        
        const elapsed = currentTime - this.captureStartTime;
        this.captureProgress = Math.min(elapsed / this.captureDuration, 1.0);
        
        if (this.captureProgress >= 1.0) {
            // Capture completed
            this.completeCapture();
            return; // Exit early since captureTarget is now null
        }
        
        // Stay near target while capturing
        const distance = Utils.distance(this.x, this.y, this.captureTarget.x, this.captureTarget.y);
        if (distance > this.radius + this.captureTarget.radius + 5) {
            this.moveToward(this.captureTarget, deltaTime * 0.5); // Slow movement while capturing
        }
    }
    
    updateAITarget() {
        // Simple AI: prioritize orbs, then letterlings
        this.target = null;
        this.state = 'wander';
        
        // Look for nearby orbs (higher priority)
        const nearbyOrbs = this.findNearbyOrbs(200);
        if (nearbyOrbs.length > 0) {
            this.target = nearbyOrbs[0];
            this.state = 'seek_orb';
            return;
        }
        
        // Look for nearby letterlings
        const nearbyLetterlings = this.findNearbyLetterlings(150);
        if (nearbyLetterlings.length > 0) {
            this.target = nearbyLetterlings[0];
            this.state = 'seek_letterling';
            return;
        }
    }
    
    updateMovement(deltaTime) {
        if (this.target && (this.state === 'seek_orb' || this.state === 'seek_letterling')) {
            // Double-check target still exists
            if (this.target.x !== undefined && this.target.y !== undefined) {
                this.moveToward(this.target, deltaTime);
            } else {
                // Target is invalid, switch to wander
                this.target = null;
                this.state = 'wander';
            }
        } else {
            // Wander behavior
            this.angle += Utils.randomBetween(-2, 2) * deltaTime;
            this.x += Math.cos(this.angle) * this.speed * deltaTime;
            this.y += Math.sin(this.angle) * this.speed * deltaTime;
        }
    }
    
    moveToward(target, deltaTime) {
        if (!target) return;
        
        const dx = target.x - this.x;
        const dy = target.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 0) {
            const moveX = (dx / distance) * this.speed * deltaTime;
            const moveY = (dy / distance) * this.speed * deltaTime;
            this.x += moveX;
            this.y += moveY;
        }
    }
    
    constrainToBounds() {
        if (this.x <= this.radius || this.x >= 3000 - this.radius) {
            this.angle = Math.PI - this.angle;
            this.x = Utils.clamp(this.x, this.radius, 3000 - this.radius);
        }
        if (this.y <= this.radius || this.y >= 3000 - this.radius) {
            this.angle = -this.angle;
            this.y = Utils.clamp(this.y, this.radius, 3000 - this.radius);
        }
    }
    
    findNearbyOrbs(range) {
        // This should be provided by the world manager
        return [];
    }
    
    findNearbyLetterlings(range) {
        // This should be provided by the world manager
        return [];
    }
    
    startCapture(letterling) {
        this.state = 'capturing';
        this.captureTarget = letterling;
        this.captureStartTime = Date.now();
        this.captureProgress = 0;
        console.log(`🤖 ${this.name} started capturing ${letterling.letter}`);
    }
    
    completeCapture() {
        if (this.captureTarget) {
            // Check if letterling is still active before capturing
            if (!this.captureTarget.isActive) {
                console.log(`🚫 ${this.name} aborted capture - letterling no longer active`);
                this.captureTarget = null;
                this.state = 'wander';
                this.captureProgress = 0;
                return;
            }
            
            const letter = this.captureTarget.letter;
            
            // More competitive scoring - bots get closer to player scores
            const baseScore = Math.round(Utils.randomBetween(75, 98)); // Higher base scores
            
            // Add bonus for bot performance (simulated skill level)
            const skillBonus = Math.round(Utils.randomBetween(5, 25));
            const totalScore = Math.min(100, baseScore + skillBonus);
            
            // Update bot's score
            this.score += totalScore;
            const letterCount = this.lettersCaptured.get(letter) || 0;
            this.lettersCaptured.set(letter, letterCount + 1);
            
            console.log(`🎯 ${this.name} captured '${letter}' for ${totalScore} points! Total: ${this.score}`);
            
            // Add firework effect when bot captures letterling
            if (this.game && this.game.addFireworkEffect && this.captureTarget) {
                this.game.addFireworkEffect(this.captureTarget.x, this.captureTarget.y, this.captureTarget.color);
            }
            
            // Deactivate the letterling
            if (this.captureTarget && this.captureTarget.deactivate) {
                this.captureTarget.deactivate();
            }
            
            // Reset capture state
            this.state = 'wander';
            this.captureTarget = null;
            this.captureProgress = 0;
        }
    }
    
    collectOrb(orb) {
        this.coins += orb.value;
        this.score += orb.value * 8; // Increased orb value for more competitive scoring
        console.log(`💰 ${this.name} collected orb! Coins: ${this.coins}, Score: ${this.score}`);
    }
    
    render(ctx) {
        if (!this.isActive) return;
        
        // Draw boost effect if active
        if (this.tempBoostEnd > Date.now()) {
            const glowSize = this.radius + 10;
            const gradient = ctx.createRadialGradient(this.x, this.y, this.radius * 0.5, this.x, this.y, glowSize);
            
            switch (this.tempBoostType) {
                case 'speed':
                    gradient.addColorStop(0, 'rgba(0, 255, 255, 0.6)');
                    gradient.addColorStop(1, 'rgba(0, 255, 255, 0)');
                    break;
                case 'size':
                    gradient.addColorStop(0, 'rgba(255, 0, 255, 0.6)');
                    gradient.addColorStop(1, 'rgba(255, 0, 255, 0)');
                    break;
                case 'both':
                    gradient.addColorStop(0, 'rgba(255, 215, 0, 0.6)');
                    gradient.addColorStop(1, 'rgba(255, 215, 0, 0)');
                    break;
            }
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(this.x, this.y, glowSize, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Render emoji bot
        ctx.font = `${this.radius * 2}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Highlight background if capturing
        if (this.state === 'capturing') {
            ctx.fillStyle = 'rgba(255, 179, 71, 0.6)';
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius + 5, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Render the emoji
        ctx.fillText(this.emoji, this.x, this.y);
        
        // Name tag background with level indicator
        const levelText = `Lv.${this.progressionLevel}`;
        const nameWidth = Math.max(60, (this.name.length + levelText.length) * 6);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(this.x - nameWidth/2, this.y - 45, nameWidth, 15);
        
        // Name text with level
        ctx.fillStyle = 'white';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`${this.name} ${levelText}`, this.x, this.y - 37);
        
        // Capture progress bar
        if (this.state === 'capturing' && this.captureProgress > 0) {
            const barWidth = 40;
            const barHeight = 6;
            const barX = this.x - barWidth/2;
            const barY = this.y - 55;
            
            // Background
            ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
            ctx.fillRect(barX, barY, barWidth, barHeight);
            
            // Progress fill
            ctx.fillStyle = '#4CAF50';
            ctx.fillRect(barX, barY, barWidth * this.captureProgress, barHeight);
            
            // Border
            ctx.strokeStyle = '#333';
            ctx.lineWidth = 1;
            ctx.strokeRect(barX, barY, barWidth, barHeight);
            
            // Progress text
            ctx.fillStyle = 'white';
            ctx.font = '8px Arial';
            ctx.fillText(`${Math.round(this.captureProgress * 100)}%`, this.x, barY - 3);
        }
        
        // Score indicator (small)
        if (this.score > 0) {
            ctx.fillStyle = 'rgba(255, 215, 0, 0.8)';
            ctx.font = '8px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(`${this.score}`, this.x, this.y + this.radius + 10);
        }
    }
}

// Orb entity class
class Orb {
    constructor(config) {
        this.x = config.x;
        this.y = config.y;
        this.radius = config.radius;
        this.value = config.value;
        
        // Visual effects
        this.pulsePhase = Math.random() * Math.PI * 2;
        this.color = this.getOrbColor();
    }
    
    getOrbColor() {
        const colors = {
            1: '#FFD700', // Gold
            2: '#C0C0C0', // Silver
            3: '#CD7F32'  // Bronze
        };
        return colors[this.value] || '#FFD700';
    }
    
    update(deltaTime) {
        this.pulsePhase += deltaTime * 3;
    }
    
    render(ctx) {
        const pulseSize = Math.sin(this.pulsePhase) * 2;
        const currentRadius = this.radius + pulseSize;
        
        // Glow
        const gradient = ctx.createRadialGradient(
            this.x, this.y, 0,
            this.x, this.y, currentRadius + 5
        );
        gradient.addColorStop(0, this.color);
        gradient.addColorStop(1, 'rgba(255, 215, 0, 0)');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, currentRadius + 5, 0, Math.PI * 2);
        ctx.fill();
        
        // Main orb
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, currentRadius, 0, Math.PI * 2);
        ctx.fill();
        
        // Shine effect
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.beginPath();
        ctx.arc(this.x - currentRadius/3, this.y - currentRadius/3, currentRadius/3, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Environment Object class for decorative elements
class EnvironmentObject {
    constructor(config) {
        this.x = config.x;
        this.y = config.y;
        this.theme = config.theme;
        this.levelColor = config.levelColor;
        this.game = config.game;
        
        // Randomly choose object type based on theme
        this.type = this.getRandomObjectType();
        this.size = Utils.randomBetween(30, 60);
        this.rotation = Math.random() * Math.PI * 2;
        this.swayOffset = Math.random() * Math.PI * 2;
        this.color = this.getObjectColor();
    }
    
    getRandomObjectType() {
        const themeObjects = {
            'basics': ['flower', 'bush', 'grass'],
            'nature': ['flower', 'tree', 'mushroom', 'butterfly'],
            'water': ['coral', 'seaweed', 'shell', 'starfish'],
            'fantasy': ['crystal', 'mushroom', 'tree', 'orb'],
            'desert': ['cactus', 'rock', 'palmtree', 'pyramid'],
            'space': ['satellite', 'asteroid', 'star', 'planet'],
            'pirate': ['palmtree', 'barrel', 'chest', 'anchor'],
            'candy': ['lollipop', 'candycane', 'gummy', 'chocolate'],
            'robot': ['gear', 'antenna', 'circuit', 'battery'],
            'dinosaur': ['tree', 'rock', 'bone', 'volcano'],
            'master': ['trophy', 'star', 'crown', 'gem']
        };
        
        const objects = themeObjects[this.theme] || themeObjects['basics'];
        return Utils.pickRandom(objects);
    }
    
    getObjectColor() {
        // Base color on level color with variations
        const baseColor = this.levelColor;
        const variation = Utils.randomBetween(-30, 30);
        return this.adjustColorBrightness(baseColor, variation);
    }
    
    adjustColorBrightness(hex, percent) {
        hex = hex.replace('#', '');
        let r = parseInt(hex.substring(0, 2), 16);
        let g = parseInt(hex.substring(2, 4), 16);
        let b = parseInt(hex.substring(4, 6), 16);
        
        r = Math.max(0, Math.min(255, r + (r * percent / 100)));
        g = Math.max(0, Math.min(255, g + (g * percent / 100)));
        b = Math.max(0, Math.min(255, b + (b * percent / 100)));
        
        return '#' + Math.round(r).toString(16).padStart(2, '0') + 
                     Math.round(g).toString(16).padStart(2, '0') + 
                     Math.round(b).toString(16).padStart(2, '0');
    }
    
    update(deltaTime) {
        // Gentle swaying for organic objects
        if (['tree', 'flower', 'seaweed', 'coral', 'palmtree'].includes(this.type)) {
            this.swayOffset += deltaTime * 0.5;
        }
    }
    
    render(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        
        // Apply sway if applicable
        if (['tree', 'flower', 'seaweed', 'coral', 'palmtree'].includes(this.type)) {
            const swayAmount = Math.sin(this.swayOffset) * 0.05;
            ctx.rotate(swayAmount);
        }
        
        switch (this.type) {
            case 'tree':
                this.renderTree(ctx);
                break;
            case 'flower':
                this.renderFlower(ctx);
                break;
            case 'rock':
                this.renderRock(ctx);
                break;
            case 'cactus':
                this.renderCactus(ctx);
                break;
            case 'coral':
                this.renderCoral(ctx);
                break;
            case 'crystal':
                this.renderCrystal(ctx);
                break;
            default:
                this.renderGenericObject(ctx);
        }
        
        ctx.restore();
    }
    
    renderTree(ctx) {
        // Trunk
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(-this.size * 0.15, 0, this.size * 0.3, this.size * 0.6);
        
        // Leaves
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(0, -this.size * 0.3, this.size * 0.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(-this.size * 0.3, -this.size * 0.1, this.size * 0.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(this.size * 0.3, -this.size * 0.1, this.size * 0.4, 0, Math.PI * 2);
        ctx.fill();
    }
    
    renderFlower(ctx) {
        // Stem
        ctx.strokeStyle = '#228B22';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, this.size * 0.5);
        ctx.stroke();
        
        // Petals
        ctx.fillStyle = this.color;
        for (let i = 0; i < 6; i++) {
            ctx.save();
            ctx.rotate((i * Math.PI * 2) / 6);
            ctx.beginPath();
            ctx.ellipse(0, -this.size * 0.3, this.size * 0.15, this.size * 0.3, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
        
        // Center
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(0, 0, this.size * 0.15, 0, Math.PI * 2);
        ctx.fill();
    }
    
    renderRock(ctx) {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.moveTo(-this.size * 0.4, this.size * 0.3);
        ctx.lineTo(-this.size * 0.3, -this.size * 0.2);
        ctx.lineTo(0, -this.size * 0.4);
        ctx.lineTo(this.size * 0.3, -this.size * 0.2);
        ctx.lineTo(this.size * 0.4, this.size * 0.3);
        ctx.closePath();
        ctx.fill();
        
        // Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.beginPath();
        ctx.ellipse(0, this.size * 0.35, this.size * 0.4, this.size * 0.1, 0, 0, Math.PI * 2);
        ctx.fill();
    }
    
    renderCactus(ctx) {
        ctx.fillStyle = this.color;
        // Main body
        ctx.beginPath();
        ctx.ellipse(0, 0, this.size * 0.25, this.size * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Arms
        ctx.beginPath();
        ctx.ellipse(-this.size * 0.3, -this.size * 0.1, this.size * 0.15, this.size * 0.3, -0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(this.size * 0.3, -this.size * 0.2, this.size * 0.15, this.size * 0.25, 0.3, 0, Math.PI * 2);
        ctx.fill();
        
        // Spines
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1;
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            ctx.beginPath();
            ctx.moveTo(Math.cos(angle) * this.size * 0.2, Math.sin(angle) * this.size * 0.4);
            ctx.lineTo(Math.cos(angle) * this.size * 0.3, Math.sin(angle) * this.size * 0.5);
            ctx.stroke();
        }
    }
    
    renderCoral(ctx) {
        ctx.fillStyle = this.color;
        // Base
        ctx.beginPath();
        ctx.ellipse(0, this.size * 0.4, this.size * 0.3, this.size * 0.1, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Branches
        for (let i = 0; i < 5; i++) {
            const angle = (i / 5) * Math.PI - Math.PI / 2;
            const height = this.size * (0.3 + i * 0.1);
            ctx.beginPath();
            ctx.moveTo(0, this.size * 0.3);
            ctx.quadraticCurveTo(
                Math.cos(angle) * this.size * 0.2, 
                0,
                Math.cos(angle) * this.size * 0.3, 
                -height
            );
            ctx.lineWidth = 4 - i * 0.5;
            ctx.strokeStyle = this.color;
            ctx.stroke();
        }
    }
    
    renderCrystal(ctx) {
        // Gradient for magical effect
        const gradient = ctx.createLinearGradient(0, -this.size * 0.5, 0, this.size * 0.5);
        gradient.addColorStop(0, this.color);
        gradient.addColorStop(1, this.adjustColorBrightness(this.color, -30));
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.moveTo(0, -this.size * 0.5);
        ctx.lineTo(-this.size * 0.2, -this.size * 0.2);
        ctx.lineTo(-this.size * 0.15, this.size * 0.3);
        ctx.lineTo(0, this.size * 0.5);
        ctx.lineTo(this.size * 0.15, this.size * 0.3);
        ctx.lineTo(this.size * 0.2, -this.size * 0.2);
        ctx.closePath();
        ctx.fill();
        
        // Shine
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.beginPath();
        ctx.moveTo(0, -this.size * 0.5);
        ctx.lineTo(-this.size * 0.1, -this.size * 0.3);
        ctx.lineTo(0, -this.size * 0.2);
        ctx.lineTo(this.size * 0.1, -this.size * 0.3);
        ctx.closePath();
        ctx.fill();
    }
    
    renderGenericObject(ctx) {
        // Fallback for unimplemented objects
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(0, 0, this.size * 0.5, 0, Math.PI * 2);
        ctx.fill();
    }
}