// Economy System for coins and purchases

class Economy {
    constructor(game) {
        this.game = game;
        this.dataManager = game.dataManager;
        
        // Current coin count
        this.coins = 0;
        
        // Shop items
        this.shopItems = {
            hats: [
                { id: 'cap', name: 'Baseball Cap', price: 100, unlocked: true },
                { id: 'crown', name: 'Royal Crown', price: 200, unlocked: false }
            ],
            trails: [
                { id: 'sparkles', name: 'Sparkle Trail', price: 150, unlocked: true },
                { id: 'rainbow', name: 'Rainbow Trail', price: 300, unlocked: false }
            ],
            pets: [
                { id: 'cat', name: 'Letter Cat', price: 120, unlocked: true },
                { id: 'dragon', name: 'Alphabet Dragon', price: 240, unlocked: false }
            ]
        };
        
        this.init();
    }
    
    init() {
        // Load coin count from character
        const character = this.dataManager?.getCurrentCharacter();
        if (character) {
            this.coins = character.progression.coins;
        }
        
        this.updateUI();
        // Economy system ready
    }
    
    addCoins(amount) {
        this.coins += amount;
        
        // Only update save data if not in level mode (during level, this is just tracking score)
        if (this.dataManager && !this.levelMode) {
            this.dataManager.addCoins(amount);
        }
        
        this.updateUI();
        
        // Play coin collection sound
        if (this.game.audioManager) {
            this.game.audioManager.playOrbCollect();
        }
        
        console.log(`+${amount} coins! Total: ${this.coins}`);
    }
    
    spendCoins(amount, item) {
        if (this.coins >= amount) {
            this.coins -= amount;
            
            // Update save data
            if (this.dataManager) {
                this.dataManager.spendCoins(amount);
            }
            
            this.updateUI();
            
            console.log(`Purchased ${item} for ${amount} coins. Remaining: ${this.coins}`);
            return true;
        }
        
        console.log(`Not enough coins for ${item}. Need ${amount}, have ${this.coins}`);
        return false;
    }
    
    getCoins() {
        return this.coins;
    }
    
    removeCoins(amount) {
        if (this.coins >= amount) {
            this.coins -= amount;
            
            // Update save data
            if (this.dataManager) {
                this.dataManager.spendCoins(amount);
            }
            
            this.updateUI();
            return true;
        }
        return false;
    }
    
    canAfford(price) {
        return this.coins >= price;
    }
    
    updateUI() {
        // Update coin counter in HUD
        const coinCounter = document.getElementById('coinCounter');
        if (coinCounter) {
            coinCounter.querySelector('.count').textContent = this.coins;
        }
    }
    
    // Shop system methods
    getShopItems(category) {
        return this.shopItems[category] || [];
    }
    
    purchaseItem(category, itemId) {
        const items = this.shopItems[category];
        const item = items?.find(i => i.id === itemId);
        
        if (!item) {
            console.error('Item not found:', category, itemId);
            return false;
        }
        
        if (!item.unlocked) {
            console.error('Item not unlocked:', item.name);
            return false;
        }
        
        if (this.spendCoins(item.price, item.name)) {
            // Add item to player's inventory
            this.addToInventory(category, item);
            return true;
        }
        
        return false;
    }
    
    addToInventory(category, item) {
        const character = this.dataManager?.getCurrentCharacter();
        if (character && character.customization) {
            let targetArray;
            
            // Map category to correct data structure
            if (category === 'skins') {
                targetArray = character.customization.purchasedSkins;
            } else if (category === 'upgrades') {
                targetArray = character.customization.purchasedUpgrades;
            } else {
                console.warn(`Unknown inventory category: ${category}`);
                return;
            }
            
            // Ensure array exists
            if (!Array.isArray(targetArray)) {
                if (category === 'skins') {
                    character.customization.purchasedSkins = [];
                    targetArray = character.customization.purchasedSkins;
                } else if (category === 'upgrades') {
                    character.customization.purchasedUpgrades = [];
                    targetArray = character.customization.purchasedUpgrades;
                }
            }
            
            targetArray.push({
                ...item,
                purchaseDate: Date.now()
            });
            
            this.dataManager.markDirty();
            this.dataManager.save();
        }
    }
    
    // Daily rewards and bonuses
    awardDailyBonus() {
        const bonusAmount = 100;
        this.addCoins(bonusAmount);
        
        console.log('Daily bonus awarded:', bonusAmount);
        return bonusAmount;
    }
    
    // Special coin awards
    awardPerfectBonus() {
        this.addCoins(5);
    }
    
    awardSprintWin() {
        this.addCoins(25);
    }
    
    // Get earnings summary
    getEarningsInfo() {
        return {
            traceSuccess: '5-10 coins',
            perfectTrace: '15 coins',
            sprintWin: '25 coins',
            dailyBonus: '100 coins'
        };
    }
}