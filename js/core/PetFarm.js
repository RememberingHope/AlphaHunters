// Pet Farm - Aquarium-like collection system for letter pets

class PetFarm {
    constructor(game) {
        this.game = game;
        this.pets = []; // Array of pet objects
        this.coinAvailable = false; // Can earn a coin this visit
        this.coinEarnedThisVisit = false; // Already earned coin this visit
        this.selectedPetForCoin = null; // Which pet can give a coin
        
        // Visual settings for farm pen
        this.penWidth = 800;
        this.penHeight = 500;
        this.grassParticles = []; // Grass blowing in wind
        this.lastGrassTime = 0;
        this.grassInterval = 3000; // New grass particle every 3 seconds
        
        // Farm items
        this.farmItems = []; // Placed items (houses, toys, etc.)
        this.selectedItem = null; // Item being moved
        this.isDragging = false;
        this.dragOffset = { x: 0, y: 0 };
        
        // Background
        this.currentBackground = 'default';
        
        this.init();
    }
    
    init() {
        // PetFarm ready
        this.loadPetsFromCharacter();
    }
    
    loadPetsFromCharacter() {
        const character = this.game.dataManager?.getCurrentCharacter();
        if (!character) return;
        
        // Load all pets from character data
        this.pets = [];
        const petData = character.pets.farm || {};
        
        for (const [letter, data] of Object.entries(petData)) {
            // Check if this is an array (multiple pets of same letter) or single pet
            if (Array.isArray(data)) {
                // Multiple pets of same letter
                data.forEach((petInfo, index) => {
                    this.addPetToFarm(letter, petInfo, index);
                });
            } else {
                // Single pet
                this.addPetToFarm(letter, data, 0);
            }
        }
        
        console.log(`🏠 Loaded ${this.pets.length} pets from character data`);
        
        // Load farm items and background
        this.loadFarmCustomization();
        
        // Check if coin reward is available (completed a level since last visit)
        this.checkCoinAvailability();
    }
    
    loadFarmCustomization() {
        const character = this.game.dataManager?.getCurrentCharacter();
        if (!character || !character.shopData) return;
        
        // Load background
        this.currentBackground = character.shopData.equippedBackground || 'default';
        
        // Load placed items
        if (character.shopData.placedFarmItems) {
            this.farmItems = character.shopData.placedFarmItems.map(item => ({
                ...item,
                interactionCooldown: 0
            }));
        }
    }
    
    addPetToFarm(letter, petInfo, index = 0) {
        const pet = {
            id: `${letter}_${petInfo.rescuedDate}_${index}`,
            letter: letter,
            emoji: petInfo.emoji || this.getRandomEmoji(), // Use saved emoji or generate fallback
            rescuedDate: petInfo.rescuedDate,
            rescuedFromLevel: petInfo.rescuedFromLevel,
            happiness: petInfo.happiness !== undefined ? petInfo.happiness : (50 + Math.random() * 50), // Start with varied happiness
            
            // Visual properties for farm pen
            x: Math.random() * (this.penWidth - 100) + 50,
            y: Math.random() * (this.penHeight - 200) + 100,
            targetX: 0,
            targetY: 0,
            speed: 0.5 + Math.random() * 0.5,
            size: 40 + Math.random() * 20,
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() - 0.5) * 0.02,
            color: this.getLetterColor(letter),
            swimPattern: Math.floor(Math.random() * 3), // 0: lazy, 1: active, 2: circular
            lastDirectionChange: Date.now(),
            directionChangeInterval: 3000 + Math.random() * 4000
        };
        
        // Set initial target
        this.updatePetTarget(pet);
        
        this.pets.push(pet);
    }
    
    getLetterColor(letter) {
        // Assign consistent colors to letters
        const colors = [
            '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57',
            '#FF9FF3', '#54A0FF', '#48DBFB', '#A29BFE', '#FD79A8',
            '#BADC58', '#F8B500', '#FF6348', '#30336B', '#6C5CE7'
        ];
        
        const index = letter.toLowerCase().charCodeAt(0) - 'a'.charCodeAt(0);
        return colors[index % colors.length];
    }
    
    getRandomEmoji() {
        // Fallback emoji generator for pets without saved emojis
        const emojis = ['😀', '😊', '🥳', '😎', '🤖', '👾', '🌟', '⭐', '✨', '🎉', '🎈', '🎯', '🎨', '🎭', '🎪', '🎊', '🔥', '⚡', '💫', '🌈', '🦄', '🐻', '🐨', '🐼', '🦊', '🐸', '🐯', '🦁', '🐶', '🐱'];
        return emojis[Math.floor(Math.random() * emojis.length)];
    }
    
    checkCoinAvailability() {
        const character = this.game.dataManager?.getCurrentCharacter();
        if (!character) return;
        
        // Check if player completed a level since last pet farm visit
        const lastVisit = character.pets.lastFarmVisit || 0;
        const lastLevelCompletion = character.pets.lastLevelCompletion || 0;
        
        if (lastLevelCompletion > lastVisit && this.pets.length > 0) {
            this.coinAvailable = true;
            // Randomly select a pet that can give a coin
            this.selectedPetForCoin = this.pets[Math.floor(Math.random() * this.pets.length)];
            console.log(`💰 Coin available from pet: ${this.selectedPetForCoin.letter}`);
        }
    }
    
    updatePetTarget(pet) {
        // Update movement target based on pattern (walking/hopping in pen)
        switch (pet.swimPattern) {
            case 0: // Lazy - stays in small area
                pet.targetX = pet.x + (Math.random() - 0.5) * 80;
                pet.targetY = pet.y + (Math.random() - 0.5) * 60;
                break;
                
            case 1: // Active - roams around pen
                pet.targetX = Math.random() * (this.penWidth - 100) + 50;
                pet.targetY = Math.random() * (this.penHeight - 250) + 150;
                break;
                
            case 2: // Circular - follows path around pen edge
                const angle = Date.now() * 0.001 * pet.speed;
                const radius = 120;
                pet.targetX = this.penWidth / 2 + Math.cos(angle) * radius;
                pet.targetY = this.penHeight / 2 + Math.sin(angle) * radius * 0.6;
                break;
        }
        
        // Keep within pen bounds (with fence at bottom)
        pet.targetX = Math.max(50, Math.min(this.penWidth - 50, pet.targetX));
        pet.targetY = Math.max(100, Math.min(this.penHeight - 150, pet.targetY));
    }
    
    updatePets() {
        const currentTime = Date.now();
        
        this.pets.forEach(pet => {
            // Slowly decrease happiness over time
            if (Math.random() < 0.01) { // 1% chance per frame
                pet.happiness = Math.max(20, pet.happiness - 0.5);
            }
            // Update position
            const dx = pet.targetX - pet.x;
            const dy = pet.targetY - pet.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > 5) {
                pet.x += (dx / distance) * pet.speed;
                pet.y += (dy / distance) * pet.speed;
                
                // Update rotation to face direction
                const targetRotation = Math.atan2(dy, dx);
                const rotationDiff = targetRotation - pet.rotation;
                pet.rotation += rotationDiff * 0.1;
            }
            
            // Update rotation animation
            pet.rotation += pet.rotationSpeed;
            
            // Check if time to change direction
            if (currentTime - pet.lastDirectionChange > pet.directionChangeInterval) {
                this.updatePetTarget(pet);
                pet.lastDirectionChange = currentTime;
            }
            
            // Check for interactions with items
            this.checkPetItemInteractions(pet, currentTime);
        });
        
        // Update bubbles
        this.updateBubbles(currentTime);
        
        // Update item animations
        this.updateItemAnimations(currentTime);
    }
    
    updateBubbles(currentTime) {
        // Create new grass particles periodically (changed from bubbles to match farm theme)
        if (currentTime - this.lastGrassTime > this.grassInterval) {
            this.grassParticles.push({
                x: Math.random() * this.penWidth,
                y: this.penHeight,
                size: 3 + Math.random() * 8,
                speed: 0.3 + Math.random() * 0.7,
                sway: Math.random() * Math.PI * 2,
                opacity: 0.2 + Math.random() * 0.3
            });
            this.lastGrassTime = currentTime;
        }
        
        // Update existing grass particles
        this.grassParticles = this.grassParticles.filter(grass => {
            grass.y -= grass.speed;
            grass.x += Math.sin(grass.sway) * 0.3;
            grass.sway += 0.05;
            grass.opacity -= 0.001;
            
            return grass.y > -20 && grass.opacity > 0;
        });
    }
    
    handlePetClick(pet) {
        console.log(`🐾 Pet clicked: ${pet.letter}`);
        
        // Check if this pet can give a coin
        if (this.coinAvailable && !this.coinEarnedThisVisit && pet.id === this.selectedPetForCoin.id) {
            console.log(`💰 This pet has a coin reward!`);
            this.showLetterTraceForCoin(pet);
        } else {
            // Normal interaction - show happy emoji
            this.showPetReaction(pet);
        }
    }
    
    showPetReaction(pet) {
        // Create floating emoji above pet
        const reactions = ['❤️', '😊', '🌟', '✨', '💖', '🎵', '🌈', '💫'];
        const emoji = reactions[Math.floor(Math.random() * reactions.length)];
        
        const reaction = document.createElement('div');
        reaction.style.cssText = `
            position: absolute;
            left: ${pet.x}px;
            top: ${pet.y - 30}px;
            font-size: 24px;
            z-index: 1000;
            animation: floatUp 2s ease-out forwards;
            pointer-events: none;
        `;
        reaction.textContent = emoji;
        
        // Add animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes floatUp {
                0% { transform: translateY(0) scale(0.5); opacity: 0; }
                50% { transform: translateY(-30px) scale(1); opacity: 1; }
                100% { transform: translateY(-60px) scale(0.8); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
        
        const farmContainer = document.getElementById('petFarmContainer');
        if (farmContainer) {
            farmContainer.appendChild(reaction);
            
            // Remove after animation
            setTimeout(() => {
                reaction.remove();
                style.remove();
            }, 2000);
        }
        
        // Update pet happiness
        pet.happiness = Math.min(100, pet.happiness + 5);
    }
    
    showLetterTraceForCoin(pet) {
        // Create trace overlay for coin reward
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed; top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0,0,0,0.8); display: flex;
            justify-content: center; align-items: center;
            z-index: 3000; font-family: 'Comic Sans MS', cursive;
        `;
        
        overlay.innerHTML = `
            <div style="
                background: white; padding: 40px; border-radius: 20px;
                text-align: center; max-width: 500px;
                box-shadow: 0 20px 40px rgba(0,0,0,0.3);
            ">
                <div style="font-size: 64px; margin-bottom: 20px;">${pet.letter}</div>
                <h3 style="font-size: 24px; margin-bottom: 20px; color: #4CAF50;">
                    Trace this letter for a coin reward!
                </h3>
                <canvas id="petTraceCoinCanvas" width="300" height="300" style="
                    border: 3px solid #ddd; border-radius: 10px;
                    background: #f9f9f9; cursor: crosshair;
                "></canvas>
                <div style="margin-top: 20px;">
                    <button id="skipPetTraceBtn" style="
                        background: linear-gradient(135deg, #757575, #424242);
                        border: none; color: white; padding: 10px 20px;
                        border-radius: 10px; font-size: 16px; font-weight: bold;
                        cursor: pointer;
                    ">Skip</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(overlay);
        
        // Set up trace canvas
        const canvas = document.getElementById('petTraceCoinCanvas');
        const ctx = canvas.getContext('2d');
        let isDrawing = false;
        let points = [];
        
        // Draw letter guide
        ctx.font = '200px Arial';
        ctx.fillStyle = 'rgba(0,0,0,0.1)';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(pet.letter.toUpperCase(), 150, 150);
        
        // Mouse/touch events
        const startDrawing = (e) => {
            isDrawing = true;
            points = [];
            const rect = canvas.getBoundingClientRect();
            const x = (e.clientX || e.touches[0].clientX) - rect.left;
            const y = (e.clientY || e.touches[0].clientY) - rect.top;
            points.push({x, y});
        };
        
        const draw = (e) => {
            if (!isDrawing) return;
            const rect = canvas.getBoundingClientRect();
            const x = (e.clientX || e.touches[0].clientX) - rect.left;
            const y = (e.clientY || e.touches[0].clientY) - rect.top;
            points.push({x, y});
            
            // Draw line
            ctx.strokeStyle = '#4CAF50';
            ctx.lineWidth = 5;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(points[points.length - 2].x, points[points.length - 2].y);
            ctx.lineTo(x, y);
            ctx.stroke();
        };
        
        const stopDrawing = () => {
            if (!isDrawing) return;
            isDrawing = false;
            
            // Simple validation - check if enough points were drawn
            if (points.length > 20) {
                // Success! Award coin
                this.awardCoinFromPet(pet);
                overlay.remove();
            } else {
                // Try again
                ctx.clearRect(0, 0, 300, 300);
                ctx.font = '200px Arial';
                ctx.fillStyle = 'rgba(0,0,0,0.1)';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(pet.letter.toUpperCase(), 150, 150);
            }
        };
        
        canvas.addEventListener('mousedown', startDrawing);
        canvas.addEventListener('mousemove', draw);
        canvas.addEventListener('mouseup', stopDrawing);
        canvas.addEventListener('touchstart', startDrawing);
        canvas.addEventListener('touchmove', draw);
        canvas.addEventListener('touchend', stopDrawing);
        
        // Skip button
        document.getElementById('skipPetTraceBtn').addEventListener('click', () => {
            overlay.remove();
        });
    }
    
    awardCoinFromPet(pet) {
        console.log(`💰 Awarding coin from pet ${pet.letter}`);
        
        // Award coin
        if (this.game.dataManager) {
            this.game.dataManager.addCoins(1);
        }
        
        // Mark coin as earned
        this.coinEarnedThisVisit = true;
        this.coinAvailable = false;
        
        // Update character's last farm visit
        const character = this.game.dataManager.getCurrentCharacter();
        if (character) {
            character.pets.lastFarmVisit = Date.now();
            this.game.dataManager.markDirty();
            this.game.dataManager.save();
        }
        
        // Show success message
        const successMsg = document.createElement('div');
        successMsg.style.cssText = `
            position: fixed; top: 50%; left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(135deg, #4CAF50, #45a049);
            color: white; padding: 20px 40px;
            border-radius: 15px; font-size: 24px; font-weight: bold;
            z-index: 3001; animation: coinSuccess 2s ease-out forwards;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        `;
        successMsg.innerHTML = '💰 +1 Coin! Great job!';
        
        const style = document.createElement('style');
        style.textContent = `
            @keyframes coinSuccess {
                0% { transform: translate(-50%, -50%) scale(0.5); opacity: 0; }
                50% { transform: translate(-50%, -50%) scale(1.1); opacity: 1; }
                100% { transform: translate(-50%, -50%) scale(1); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(successMsg);
        
        setTimeout(() => {
            successMsg.remove();
            style.remove();
        }, 2000);
    }
    
    // Called when a level is completed to add new pets
    addPetsFromLevel(letters) {
        const character = this.game.dataManager?.getCurrentCharacter();
        if (!character) return;
        
        const currentLevel = this.game.levelManager?.getCurrentLevel();
        if (!currentLevel) return;
        
        console.log(`🐾 Adding ${letters.length} pets from level ${currentLevel.id}`);
        
        // Update character's pet data
        if (!character.pets.farm) {
            character.pets.farm = {};
        }
        
        letters.forEach(petInfo => {
            // petInfo is now {letter: 'a', emoji: '😊'} instead of just 'a'
            const letter = typeof petInfo === 'string' ? petInfo : petInfo.letter;
            const emoji = typeof petInfo === 'object' ? petInfo.emoji : null;
            
            const petData = {
                rescuedDate: Date.now(),
                rescuedFromLevel: currentLevel.id,
                happiness: 100,
                emoji: emoji // Save the emoji from the level
            };
            
            // Check if this letter already has pets
            if (character.pets.farm[letter]) {
                // Convert to array if not already
                if (!Array.isArray(character.pets.farm[letter])) {
                    character.pets.farm[letter] = [character.pets.farm[letter]];
                }
                character.pets.farm[letter].push(petData);
            } else {
                character.pets.farm[letter] = petData;
            }
        });
        
        // Mark that a level was completed (for coin availability)
        character.pets.lastLevelCompletion = Date.now();
        
        // Save updated character data
        this.game.dataManager.markDirty();
        this.game.dataManager.save();
    }
    
    // Edit mode for item placement
    toggleEditMode() {
        this.isEditMode = !this.isEditMode;
        const btn = document.getElementById('editModeBtn');
        if (btn) {
            btn.style.background = this.isEditMode ? '#4CAF50' : '#FF9800';
            btn.textContent = this.isEditMode ? '✓ Edit Mode On' : '🔧 Edit Mode';
        }
        
        if (this.isEditMode) {
            this.setupEditModeHandlers();
        } else {
            this.removeEditModeHandlers();
            this.saveFarmLayout();
        }
    }
    
    setupEditModeHandlers() {
        const canvas = document.getElementById('petFarmCanvas');
        if (!canvas) return;
        
        canvas.style.cursor = 'move';
        
        this.editModeHandlers = {
            mousedown: (e) => this.handleItemMouseDown(e),
            mousemove: (e) => this.handleItemMouseMove(e),
            mouseup: (e) => this.handleItemMouseUp(e),
            touchstart: (e) => this.handleItemMouseDown(e),
            touchmove: (e) => this.handleItemMouseMove(e),
            touchend: (e) => this.handleItemMouseUp(e)
        };
        
        Object.entries(this.editModeHandlers).forEach(([event, handler]) => {
            canvas.addEventListener(event, handler);
        });
    }
    
    removeEditModeHandlers() {
        const canvas = document.getElementById('petFarmCanvas');
        if (!canvas || !this.editModeHandlers) return;
        
        canvas.style.cursor = 'pointer';
        
        Object.entries(this.editModeHandlers).forEach(([event, handler]) => {
            canvas.removeEventListener(event, handler);
        });
    }
    
    handleItemMouseDown(e) {
        if (!this.isEditMode) return;
        
        const canvas = document.getElementById('petFarmCanvas');
        const rect = canvas.getBoundingClientRect();
        const x = (e.clientX || e.touches?.[0]?.clientX) - rect.left;
        const y = (e.clientY || e.touches?.[0]?.clientY) - rect.top;
        
        // Check if clicking on an item
        for (let i = this.farmItems.length - 1; i >= 0; i--) {
            const item = this.farmItems[i];
            const size = this.getItemSize(item.type);
            
            if (x >= item.x - size/2 && x <= item.x + size/2 &&
                y >= item.y - size/2 && y <= item.y + size/2) {
                this.selectedItem = item;
                this.isDragging = true;
                this.dragOffset = {
                    x: x - item.x,
                    y: y - item.y
                };
                break;
            }
        }
        
        e.preventDefault();
    }
    
    handleItemMouseMove(e) {
        if (!this.isDragging || !this.selectedItem) return;
        
        const canvas = document.getElementById('petFarmCanvas');
        const rect = canvas.getBoundingClientRect();
        const x = (e.clientX || e.touches?.[0]?.clientX) - rect.left;
        const y = (e.clientY || e.touches?.[0]?.clientY) - rect.top;
        
        // Update item position
        this.selectedItem.x = Math.max(50, Math.min(750, x - this.dragOffset.x));
        this.selectedItem.y = Math.max(50, Math.min(450, y - this.dragOffset.y));
        
        e.preventDefault();
    }
    
    handleItemMouseUp(e) {
        if (this.isDragging) {
            this.isDragging = false;
            this.selectedItem = null;
            this.saveFarmLayout();
        }
        e.preventDefault();
    }
    
    placeItem(itemId, itemDef) {
        if (!this.isEditMode) {
            alert('Enable Edit Mode first!');
            return;
        }
        
        const newItem = {
            id: `${itemId}_${Date.now()}`,
            itemId: itemId,
            type: itemDef.type,
            emoji: itemDef.emoji,
            name: itemDef.name,
            x: 400 + (Math.random() - 0.5) * 200,
            y: 250 + (Math.random() - 0.5) * 100,
            rotation: 0,
            interactionCooldown: 0
        };
        
        this.farmItems.push(newItem);
        this.saveFarmLayout();
    }
    
    getItemSize(type) {
        switch(type) {
            case 'furniture': return 80;
            case 'toy': return 40;
            case 'consumable': return 30;
            default: return 50;
        }
    }
    
    saveFarmLayout() {
        const character = this.game.dataManager?.getCurrentCharacter();
        if (!character) return;
        
        if (!character.shopData) {
            character.shopData = {};
        }
        
        character.shopData.placedFarmItems = this.farmItems.map(item => ({
            id: item.id,
            itemId: item.itemId,
            type: item.type,
            emoji: item.emoji,
            name: item.name,
            x: item.x,
            y: item.y,
            rotation: item.rotation
        }));
        
        this.game.dataManager.markDirty();
        this.game.dataManager.save();
    }
    
    checkPetItemInteractions(pet, currentTime) {
        if (!this.farmItems || this.farmItems.length === 0) return;
        
        this.farmItems.forEach(item => {
            const dx = pet.x - item.x;
            const dy = pet.y - item.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const interactionRange = this.getItemSize(item.type) + 30;
            
            if (distance < interactionRange && (!item.interactionCooldown || currentTime > item.interactionCooldown)) {
                // Different interactions based on item type
                switch(item.type) {
                    case 'consumable': // Treats
                        this.handleTreatInteraction(pet, item, currentTime);
                        break;
                    case 'furniture': // Houses/beds
                        this.handleFurnitureInteraction(pet, item, currentTime);
                        break;
                    case 'toy': // Toys
                        this.handleToyInteraction(pet, item, currentTime);
                        break;
                }
            }
        });
    }
    
    handleTreatInteraction(pet, treat, currentTime) {
        // Pet moves toward treat when hungry
        if (pet.happiness < 80 && Math.random() < 0.3) {
            pet.targetX = treat.x;
            pet.targetY = treat.y;
            
            // If very close, "eat" the treat
            const dx = pet.x - treat.x;
            const dy = pet.y - treat.y;
            if (Math.sqrt(dx * dx + dy * dy) < 20) {
                // Increase happiness
                pet.happiness = Math.min(100, pet.happiness + 20);
                
                // Show eating animation
                this.showItemInteractionEffect(treat, '😋', '#4CAF50');
                
                // Cooldown before pet can eat again
                treat.interactionCooldown = currentTime + 30000; // 30 seconds
                
                // Save happiness update
                this.updatePetInCharacterData(pet);
            }
        }
    }
    
    handleFurnitureInteraction(pet, furniture, currentTime) {
        // Pets rest in houses/beds when tired
        if (pet.happiness < 70 && Math.random() < 0.2) {
            // Move to furniture
            pet.targetX = furniture.x;
            pet.targetY = furniture.y;
            
            // If close enough, rest
            const dx = pet.x - furniture.x;
            const dy = pet.y - furniture.y;
            if (Math.sqrt(dx * dx + dy * dy) < 30) {
                // Slow down movement (resting)
                pet.speed = 0.1;
                pet.swimPattern = 0; // Lazy pattern
                
                // Gradually restore happiness
                pet.happiness = Math.min(100, pet.happiness + 0.1);
                
                // Show sleeping effect occasionally
                if (Math.random() < 0.05) {
                    this.showItemInteractionEffect(furniture, '💤', '#9C27B0');
                }
                
                // After resting, resume normal activity
                if (pet.happiness > 85) {
                    pet.speed = 0.5 + Math.random() * 0.5;
                    pet.swimPattern = Math.floor(Math.random() * 3);
                }
                
                furniture.interactionCooldown = currentTime + 5000; // 5 seconds
            }
        }
    }
    
    handleToyInteraction(pet, toy, currentTime) {
        // Pets play with toys when happy
        if (pet.happiness > 60 && Math.random() < 0.25) {
            // Move toward toy
            pet.targetX = toy.x + (Math.random() - 0.5) * 40;
            pet.targetY = toy.y + (Math.random() - 0.5) * 40;
            
            const dx = pet.x - toy.x;
            const dy = pet.y - toy.y;
            if (Math.sqrt(dx * dx + dy * dy) < 40) {
                // Play animation - make toy "bounce"
                if (!toy.isAnimating) {
                    toy.isAnimating = true;
                    toy.animationStart = currentTime;
                    toy.baseY = toy.y;
                }
                
                // Increase pet's speed temporarily (excited)
                pet.speed = Math.min(2, pet.speed * 1.5);
                
                // Show play effect
                if (Math.random() < 0.1) {
                    const playEmojis = ['🎵', '✨', '🌟', '💫'];
                    this.showItemInteractionEffect(
                        toy, 
                        playEmojis[Math.floor(Math.random() * playEmojis.length)],
                        '#FF9800'
                    );
                }
                
                // Maintain happiness
                pet.happiness = Math.min(100, pet.happiness + 0.05);
                
                toy.interactionCooldown = currentTime + 3000; // 3 seconds
            }
        }
    }
    
    updateItemAnimations(currentTime) {
        this.farmItems.forEach(item => {
            if (item.isAnimating && item.type === 'toy') {
                const elapsed = currentTime - item.animationStart;
                
                if (elapsed < 2000) { // 2 second animation
                    // Bounce effect
                    const progress = elapsed / 2000;
                    const bounce = Math.sin(progress * Math.PI * 4) * 10;
                    item.y = item.baseY + bounce;
                    
                    // Slight rotation
                    item.rotation = Math.sin(progress * Math.PI * 8) * 0.2;
                } else {
                    // End animation
                    item.isAnimating = false;
                    item.y = item.baseY;
                    item.rotation = 0;
                }
            }
        });
    }
    
    showItemInteractionEffect(item, emoji, color) {
        const effect = document.createElement('div');
        effect.style.cssText = `
            position: absolute;
            left: ${item.x}px;
            top: ${item.y - 20}px;
            font-size: 24px;
            color: ${color};
            z-index: 1000;
            animation: itemEffect 1.5s ease-out forwards;
            pointer-events: none;
        `;
        effect.textContent = emoji;
        
        const style = document.createElement('style');
        style.textContent = `
            @keyframes itemEffect {
                0% { 
                    transform: translateY(0) scale(0.5); 
                    opacity: 0; 
                }
                50% { 
                    transform: translateY(-20px) scale(1.2); 
                    opacity: 1; 
                }
                100% { 
                    transform: translateY(-40px) scale(0.8); 
                    opacity: 0; 
                }
            }
        `;
        document.head.appendChild(style);
        
        const farmContainer = document.getElementById('petFarmContainer');
        if (farmContainer) {
            farmContainer.appendChild(effect);
            
            setTimeout(() => {
                effect.remove();
                style.remove();
            }, 1500);
        }
    }
    
    updatePetInCharacterData(pet) {
        const character = this.game.dataManager?.getCurrentCharacter();
        if (!character || !character.pets || !character.pets.farm) return;
        
        // Find and update pet data
        const petData = character.pets.farm[pet.letter];
        if (petData) {
            if (Array.isArray(petData)) {
                // Find matching pet in array
                const index = petData.findIndex(p => 
                    `${pet.letter}_${p.rescuedDate}_${index}` === pet.id
                );
                if (index !== -1) {
                    petData[index].happiness = pet.happiness;
                }
            } else {
                petData.happiness = pet.happiness;
            }
            
            this.game.dataManager.markDirty();
            this.game.dataManager.save();
        }
    }
}