// Rotating Spawning Pool System
// Manages which letters are currently spawning with rotation and shuffle features

class SpawnPool {
    constructor(game) {
        this.game = game;
        
        // Pool configuration
        this.isSpecialLevel = false; // Flag for the master's challenge level
        
        // Current state - start with empty letters until level sets them
        this.allAvailableLetters = []; // Will be set by level
        this.currentPool = []; // Letters currently spawning
        
        // UI state
        this.isVisible = true; // Start visible by default
        this.shuffleCost = 100; // Coins to shuffle pool
        
        // Statistics tracking
        this.letterEncounters = new Map(); // letter -> count
        this.letterScores = new Map(); // letter -> total score
        this.letterMastery = new Map(); // letter -> mastery level
        
        // Timer for rotation (only for special level)
        this.rotationTimer = null;
        this.rotationInterval = 15000; // 15 seconds between rotations
        
        this.init();
    }
    
    init() {
        // Don't initialize pools here - wait for level to set them
        this.createUI();
        // Don't start rotation timer by default
        // SpawnPool initialized, waiting for level letters
    }
    
    startRotationTimer() {
        // Only start rotation timer for the special Master's Challenge level
        if (!this.isSpecialLevel) {
            return;
        }
        
        // Clear existing timer
        if (this.rotationTimer) {
            clearInterval(this.rotationTimer);
        }
        
        // Start new timer for automatic rotation
        const self = this;
        this.rotationTimer = setInterval(function() {
            if (self.isSpecialLevel && self.currentPool.length > 3) {
                self.rotateSpecialPool();
            }
        }, this.rotationInterval);
        
        // Special level rotation timer started
    }
    
    stopRotationTimer() {
        if (this.rotationTimer) {
            clearInterval(this.rotationTimer);
            this.rotationTimer = null;
        }
    }
    
    updateAvailableLetters(letters, levelId = null) {
        // Check if this is the special Master's Challenge level (level 11)
        this.isSpecialLevel = (levelId === 11);
        
        // Updating available letters
        this.allAvailableLetters = [...letters];
        
        // For regular levels, all letters are available
        // For special level, start with a subset
        if (this.isSpecialLevel) {
            // Master's Challenge: start with 3 random letters, rotate through all
            this.initializeSpecialPool();
            this.startRotationTimer();
        } else {
            // Regular levels: all letters available, no rotation
            this.currentPool = [...letters];
            this.stopRotationTimer();
        }
        
        this.updateUI();
    }
    
    forcePoolRefresh(letters, levelId = null) {
        // Check if this is the special Master's Challenge level
        this.isSpecialLevel = (levelId === 11);
        
        // Force refresh spawn pool
        this.allAvailableLetters = [...letters];
        
        if (this.isSpecialLevel) {
            // Master's Challenge: initialize special rotating pool
            this.initializeSpecialPool();
            this.startRotationTimer();
        } else {
            // Regular levels: all letters available
            this.currentPool = [...letters];
            this.stopRotationTimer();
        }
        
        // Spawn pool refresh complete
    }
    
    initializeSpecialPool() {
        // Special pool initialization for Master's Challenge
        if (this.allAvailableLetters.length === 0) return;
        
        // Start with 3 random letters/symbols
        const shuffled = [...this.allAvailableLetters].sort(() => Math.random() - 0.5);
        this.currentPool = shuffled.slice(0, 3);
        
        // Spawn pool configured for special level
        this.updateUI();
    }
    
    rotateSpecialPool() {
        // Special rotation for Master's Challenge level only
        if (!this.isSpecialLevel || this.allAvailableLetters.length <= 3) return;
        
        // Remove one random letter
        const removeIndex = Math.floor(Math.random() * this.currentPool.length);
        const removed = this.currentPool.splice(removeIndex, 1)[0];
        
        // Add a new letter that's not currently in the pool
        const available = this.allAvailableLetters.filter(letter => 
            !this.currentPool.includes(letter)
        );
        
        if (available.length > 0) {
            const newLetter = available[Math.floor(Math.random() * available.length)];
            this.currentPool.push(newLetter);
            // Special pool rotated
        }
        
        this.showMessage('Pool rotated!', '#4CAF50');
        this.updateUI();
    }
    
    update() {
        // No automatic updates needed - rotation handled by timer if special level
    }
    
    // Legacy rotation method - kept for compatibility but not used
    rotatePools() {
        // Rotation disabled for regular levels
        // Use rotateSpecialPool() for Master's Challenge
    }
    
    shufflePool() {
        if (!this.game.economy || this.game.economy.getCoins() < this.shuffleCost) {
            console.log('❌ Not enough coins to shuffle pool');
            this.showMessage('Not enough coins! Need 100 coins to shuffle.', '#FF6B6B');
            return false;
        }
        
        // Deduct coins
        this.game.economy.spendCoins(this.shuffleCost);
        
        if (this.isSpecialLevel) {
            // For special level, randomize the current 3 letters
            const available = this.allAvailableLetters.filter(letter => 
                !this.currentPool.includes(letter)
            );
            if (available.length > 0) {
                // Replace all current letters with new random ones
                const shuffled = [...available].sort(() => Math.random() - 0.5);
                this.currentPool = shuffled.slice(0, 3);
            }
        } else {
            // For regular levels, just randomize the order (all letters still available)
            this.currentPool = [...this.currentPool].sort(() => Math.random() - 0.5);
        }
        
        console.log(`🎲 Pool shuffled! Current [${this.currentPool.join(', ')}]`);
        this.showMessage('Spawn pool shuffled!', '#4CAF50');
        this.updateUI();
        return true;
    }
    
    getSpawnLetter() {
        if (this.currentPool.length === 0) {
            // Current pool empty, using fallback
            // Fallback to any available letter
            const fallback = this.allAvailableLetters.length > 0 ? 
                this.allAvailableLetters[Math.floor(Math.random() * this.allAvailableLetters.length)] : 'a';
            // Fallback letter selected
            return fallback;
        }
        
        // Return random letter from current pool
        const letter = this.currentPool[Math.floor(Math.random() * this.currentPool.length)];
        
        // Track encounter
        this.trackLetterEncounter(letter);
        
        return letter;
    }
    
    trackLetterEncounter(letter) {
        const current = this.letterEncounters.get(letter) || 0;
        this.letterEncounters.set(letter, current + 1);
        console.log(`📊 Letter '${letter}' encountered ${current + 1} times`);
    }
    
    trackLetterScore(letter, score) {
        const currentTotal = this.letterScores.get(letter) || 0;
        this.letterScores.set(letter, currentTotal + score);
        
        // Update mastery based on total score
        const totalScore = currentTotal + score;
        let mastery = 'Beginner';
        if (totalScore >= 1000) mastery = 'Expert';
        else if (totalScore >= 500) mastery = 'Advanced';
        else if (totalScore >= 200) mastery = 'Intermediate';
        
        this.letterMastery.set(letter, mastery);
        console.log(`📊 Letter '${letter}' total score: ${totalScore}, mastery: ${mastery}`);
    }
    
    createUI() {
        // Create spawn pool panel (initially hidden)
        const panel = document.createElement('div');
        panel.id = 'spawnPoolPanel';
        panel.style.cssText = `
            position: fixed;
            left: 10px;
            bottom: 10px;
            width: 160px;
            background: rgba(0, 0, 0, 0.9);
            border: 3px solid #4CAF50;
            border-radius: 15px;
            color: white;
            font-family: 'Comic Sans MS', cursive;
            font-size: 12px;
            z-index: 200;
            display: block;
            padding: 8px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.4);
        `;
        
        panel.innerHTML = `
            <div style="text-align: center; margin-bottom: 10px;">
                <h3 style="margin: 0; color: #4CAF50;">Spawn Pool</h3>
                <button id="toggleSpawnPool" style="float: right; margin-top: -25px; background: none; border: 1px solid #4CAF50; color: #4CAF50; padding: 2px 8px; border-radius: 5px; font-size: 12px; cursor: pointer;">Hide</button>
            </div>
            
            <div style="margin-bottom: 15px;">
                <h4 style="margin: 5px 0; color: #FFD700;">Currently Spawning:</h4>
                <div id="currentPoolList" style="display: flex; flex-wrap: wrap; gap: 3px;"></div>
            </div>
            
            <div id="upcomingSection" style="margin-bottom: 15px; display: none;">
                <h4 style="margin: 5px 0; color: #87CEEB;">Coming Soon:</h4>
                <div id="upcomingPoolList" style="display: flex; flex-wrap: wrap; gap: 3px;"></div>
            </div>
            
            <div style="text-align: center;">
                <button id="shufflePoolBtn" style="background: linear-gradient(135deg, #FF6B6B, #FF8E53); border: none; color: white; padding: 8px 12px; border-radius: 8px; font-weight: bold; cursor: pointer; font-size: 12px;">
                    🎲 Shuffle (100 coins)
                </button>
            </div>
            
            <div id="poolMessage" style="margin-top: 10px; text-align: center; font-size: 12px; height: 20px;"></div>
        `;
        
        document.body.appendChild(panel);
        
        // Add toggle button to main UI
        const toggleBtn = document.createElement('button');
        toggleBtn.id = 'showSpawnPoolBtn';
        toggleBtn.style.cssText = `
            position: fixed;
            left: 20px;
            top: 120px;
            background: rgba(76, 175, 80, 0.9);
            border: 2px solid #4CAF50;
            color: white;
            padding: 10px;
            border-radius: 50%;
            font-size: 16px;
            cursor: pointer;
            z-index: 150;
            width: 50px;
            height: 50px;
            box-shadow: 0 4px 8px rgba(0,0,0,0.3);
            transition: transform 0.2s;
        `;
        toggleBtn.innerHTML = '🎯';
        toggleBtn.title = 'Show Spawn Pool';
        toggleBtn.addEventListener('mouseenter', () => {
            toggleBtn.style.transform = 'scale(1.1)';
        });
        toggleBtn.addEventListener('mouseleave', () => {
            toggleBtn.style.transform = 'scale(1)';
        });
        document.body.appendChild(toggleBtn);
        
        // Start with panel visible and toggle button hidden
        toggleBtn.style.display = 'none';
        
        // Event listeners
        document.getElementById('showSpawnPoolBtn').addEventListener('click', () => this.toggleUI(true));
        document.getElementById('toggleSpawnPool').addEventListener('click', () => this.toggleUI(false));
        document.getElementById('shufflePoolBtn').addEventListener('click', () => this.shufflePool());
    }
    
    toggleUI(show) {
        const panel = document.getElementById('spawnPoolPanel');
        const btn = document.getElementById('showSpawnPoolBtn');
        
        if (show) {
            panel.style.display = 'block';
            btn.style.display = 'none';
            this.isVisible = true;
        } else {
            panel.style.display = 'none';
            btn.style.display = 'block';
            this.isVisible = false;
        }
        this.updateUI(); // Update the UI when toggling
    }
    
    updateUI() {
        // Always update UI regardless of visibility to ensure it's correct when shown
        const currentList = document.getElementById('currentPoolList');
        const upcomingSection = document.getElementById('upcomingSection');
        
        if (currentList) {
            currentList.innerHTML = this.currentPool.map(letter => 
                `<span style="background: #4CAF50; padding: 3px 6px; border-radius: 5px; font-weight: bold; font-size: 16px;">${letter}</span>`
            ).join('');
        }
        
        // Hide upcoming section for regular levels
        if (upcomingSection) {
            upcomingSection.style.display = 'none';
        }
        
        // Update title based on level type
        const titleElement = document.querySelector('#spawnPoolPanel h3');
        if (titleElement) {
            if (this.isSpecialLevel) {
                titleElement.textContent = 'Spawn Pool (Rotating)';
                titleElement.style.color = '#FFD700';
            } else {
                titleElement.textContent = 'Available Letters';
                titleElement.style.color = '#4CAF50';
            }
        }
        
        // UI updated with current pool state
    }
    
    showMessage(text, color = '#4CAF50') {
        const messageDiv = document.getElementById('poolMessage');
        if (messageDiv) {
            messageDiv.textContent = text;
            messageDiv.style.color = color;
            setTimeout(() => {
                messageDiv.textContent = '';
            }, 3000);
        }
    }
    
    getStatistics() {
        return {
            encounters: Object.fromEntries(this.letterEncounters),
            scores: Object.fromEntries(this.letterScores),
            mastery: Object.fromEntries(this.letterMastery)
        };
    }
    
    exportStatsToPDF() {
        // This will be implemented later
        console.log('PDF export not yet implemented');
    }
    
    // Cleanup method
    destroy() {
        this.stopRotationTimer();
        
        // Remove UI elements
        const panel = document.getElementById('spawnPoolPanel');
        const btn = document.getElementById('showSpawnPoolBtn');
        if (panel) panel.remove();
        if (btn) btn.remove();
    }
}