// Skin Manager for purchasable emoji skins

class SkinManager {
    constructor(game) {
        this.game = game;
        this.currentSkin = '😊'; // Default skin
        this.ownedSkins = new Set(['😊']); // Start with default skin
        
        // Categorized emoji shop like mobile devices
        this.emojiCategories = {
            basic: {
                name: 'Smileys & People',
                icon: '😊',
                emojis: [
                    { emoji: '😊', name: 'Happy Face', price: 0, category: 'basic' }, // Free default
                    { emoji: '😀', name: 'Big Smile', price: 50, category: 'basic' }, // Very cheap
                    { emoji: '😃', name: 'Grinning', price: 75, category: 'basic' }, // Very cheap
                    { emoji: '🙂', name: 'Simple Smile', price: 100, category: 'basic' }, // Cheap
                    { emoji: '😎', name: 'Cool Face', price: 500, category: 'basic' },
                    { emoji: '🥳', name: 'Party Face', price: 750, category: 'basic' },
                    { emoji: '😇', name: 'Angel', price: 1000, category: 'basic' },
                    { emoji: '🤠', name: 'Cowboy', price: 1200, category: 'basic' },
                    { emoji: '🤓', name: 'Nerd', price: 800, category: 'basic' },
                    { emoji: '🤡', name: 'Clown', price: 1500, category: 'basic' },
                    { emoji: '👑', name: 'Crown', price: 5000, category: 'basic', levelRequired: 10 }
                ]
            },
            animals: {
                name: 'Animals & Nature',
                icon: '🐱',
                emojis: [
                    { emoji: '🐭', name: 'Mouse', price: 150, category: 'animals' }, // Cheap
                    { emoji: '🐸', name: 'Frog', price: 200, category: 'animals' }, // Cheap
                    { emoji: '🐱', name: 'Cat', price: 600, category: 'animals' },
                    { emoji: '🐶', name: 'Dog', price: 600, category: 'animals' },
                    { emoji: '🦊', name: 'Fox', price: 800, category: 'animals' },
                    { emoji: '🐼', name: 'Panda', price: 900, category: 'animals' },
                    { emoji: '🦁', name: 'Lion', price: 1200, category: 'animals' },
                    { emoji: '🐯', name: 'Tiger', price: 1100, category: 'animals' },
                    { emoji: '🦄', name: 'Unicorn', price: 2000, category: 'animals', levelRequired: 5 },
                    { emoji: '🐉', name: 'Dragon', price: 8000, category: 'animals', levelRequired: 15, letterRequired: 'd', petsRequired: 3 }
                ]
            },
            fantasy: {
                name: 'Fantasy & Magic',
                icon: '🧙',
                emojis: [
                    { emoji: '⭐', name: 'Star', price: 125, category: 'fantasy' }, // Cheap
                    { emoji: '🤖', name: 'Robot', price: 500, category: 'fantasy' },
                    { emoji: '👾', name: 'Space Invader', price: 750, category: 'fantasy' },
                    { emoji: '🧙', name: 'Wizard', price: 2500, category: 'fantasy', levelRequired: 8 },
                    { emoji: '🧚', name: 'Fairy', price: 3000, category: 'fantasy', levelRequired: 10 },
                    { emoji: '🧛', name: 'Vampire', price: 4000, category: 'fantasy', levelRequired: 12 },
                    { emoji: '👻', name: 'Ghost', price: 1500, category: 'fantasy' },
                    { emoji: '🎭', name: 'Theater Masks', price: 1800, category: 'fantasy' }
                ]
            },
            symbols: {
                name: 'Symbols & Effects',
                icon: '⚡',
                emojis: [
                    { emoji: '❤️', name: 'Heart', price: 80, category: 'symbols' }, // Cheap
                    { emoji: '✨', name: 'Sparkles', price: 120, category: 'symbols' }, // Cheap
                    { emoji: '⚡', name: 'Lightning', price: 850, category: 'symbols' },
                    { emoji: '🔥', name: 'Fire', price: 950, category: 'symbols' },
                    { emoji: '💫', name: 'Star', price: 700, category: 'symbols' },
                    { emoji: '🌟', name: 'Shiny Star', price: 1000, category: 'symbols' },
                    { emoji: '💎', name: 'Diamond', price: 6000, category: 'symbols', levelRequired: 12 },
                    { emoji: '🏆', name: 'Trophy', price: 4000, category: 'symbols', levelRequired: 8 },
                    { emoji: '🎯', name: 'Target', price: 850, category: 'symbols' },
                    { emoji: '🌈', name: 'Rainbow', price: 2500, category: 'symbols', levelRequired: 6 }
                ]
            },
            activities: {
                name: 'Activities & Sports',
                icon: '🎨',
                emojis: [
                    { emoji: '🎨', name: 'Artist Palette', price: 750, category: 'activities' },
                    { emoji: '🎪', name: 'Circus Tent', price: 1200, category: 'activities' },
                    { emoji: '🎮', name: 'Video Game', price: 1500, category: 'activities' },
                    { emoji: '🎸', name: 'Guitar', price: 1800, category: 'activities' },
                    { emoji: '🏀', name: 'Basketball', price: 900, category: 'activities' },
                    { emoji: '⚽', name: 'Soccer Ball', price: 900, category: 'activities' },
                    { emoji: '🎳', name: 'Bowling', price: 1100, category: 'activities' }
                ]
            },
            legendary: {
                name: 'Legendary',
                icon: '💯',
                emojis: [
                    { emoji: '💯', name: 'Hundred Points', price: 10000, category: 'legendary', levelRequired: 20, letterRequired: 'a', petsRequired: 5 },
                    { emoji: '🌌', name: 'Galaxy', price: 15000, category: 'legendary', levelRequired: 25, letterRequired: 'o', petsRequired: 7 },
                    { emoji: '🔮', name: 'Crystal Ball', price: 20000, category: 'legendary', levelRequired: 30, letterRequired: 'c', petsRequired: 10 },
                    { emoji: '👸', name: 'Princess', price: 25000, category: 'legendary', levelRequired: 35, letterRequired: 'p', petsRequired: 12 },
                    { emoji: '🦸', name: 'Superhero', price: 50000, category: 'legendary', levelRequired: 50, petsRequired: 20 }
                ]
            }
        };
        
        // Legacy support - flatten all emojis for backwards compatibility
        this.availableSkins = [];
        Object.values(this.emojiCategories).forEach(category => {
            this.availableSkins.push(...category.emojis);
        });
        
        this.init();
    }
    
    init() {
        // Load owned skins from character
        const character = this.game.dataManager?.getCurrentCharacter();
        if (character && character.customization) {
            // Use the correct property names from DataManager
            if (character.customization.purchasedSkins) {
                const skins = character.customization.purchasedSkins;
                if (Array.isArray(skins)) {
                    this.ownedSkins = new Set(skins.map(s => typeof s === 'string' ? s : s.emoji));
                } else {
                    this.ownedSkins = new Set(['😊']); // Default skin
                }
            }
            if (character.customization.activeSkin) {
                this.currentSkin = character.customization.activeSkin;
            }
        }
        
        // SkinManager ready
    }
    
    canPurchase(skinEmoji) {
        const skin = this.availableSkins.find(s => s.emoji === skinEmoji);
        if (!skin) return false;
        
        if (this.ownedSkins.has(skinEmoji)) return false;
        
        const playerCoins = this.game.economy ? this.game.economy.coins : 0;
        const playerLevel = this.game.progression ? this.game.progression.playerLevel : 1;
        const letterFollowers = this.game.progression ? this.game.progression.getLetterFollowers() : [];
        
        // Check all requirements
        if (playerCoins < skin.price) return false;
        if (skin.levelRequired && playerLevel < skin.levelRequired) return false;
        if (skin.petsRequired && letterFollowers.length < skin.petsRequired) return false;
        if (skin.letterRequired && !letterFollowers.includes(skin.letterRequired)) return false;
        
        return true;
    }
    
    getUnlockStatus(skinEmoji) {
        const skin = this.availableSkins.find(s => s.emoji === skinEmoji);
        if (!skin) return { canUnlock: false, reasons: ['Skin not found'] };
        
        if (this.ownedSkins.has(skinEmoji)) {
            return { canUnlock: true, reasons: ['Already owned'] };
        }
        
        const playerCoins = this.game.economy ? this.game.economy.coins : 0;
        const playerLevel = this.game.progression ? this.game.progression.playerLevel : 1;
        const letterFollowers = this.game.progression ? this.game.progression.getLetterFollowers() : [];
        
        const reasons = [];
        let canUnlock = true;
        
        if (playerCoins < skin.price) {
            reasons.push(`Need ${skin.price - playerCoins} more coins`);
            canUnlock = false;
        }
        
        if (skin.levelRequired && playerLevel < skin.levelRequired) {
            reasons.push(`Requires level ${skin.levelRequired} (currently ${playerLevel})`);
            canUnlock = false;
        }
        
        if (skin.petsRequired && letterFollowers.length < skin.petsRequired) {
            reasons.push(`Need ${skin.petsRequired - letterFollowers.length} more letter pets`);
            canUnlock = false;
        }
        
        if (skin.letterRequired && !letterFollowers.includes(skin.letterRequired)) {
            reasons.push(`Requires letter '${skin.letterRequired}' pet`);
            canUnlock = false;
        }
        
        return { canUnlock, reasons };
    }
    
    purchaseSkin(skinEmoji) {
        const skin = this.availableSkins.find(s => s.emoji === skinEmoji);
        if (!skin || this.ownedSkins.has(skinEmoji)) {
            return { success: false, message: 'Skin already owned or not found' };
        }
        
        const playerCoins = this.game.economy ? this.game.economy.coins : 0;
        if (playerCoins < skin.price) {
            return { success: false, message: `Not enough coins! Need ${skin.price}, have ${playerCoins}` };
        }
        
        // Purchase successful
        this.game.economy.removeCoins(skin.price);
        this.ownedSkins.add(skinEmoji);
        this.currentSkin = skinEmoji; // Auto-equip new skin
        
        // Save to character
        const character = this.game.dataManager?.getCurrentCharacter();
        if (character) {
            if (!character.customization.purchasedSkins) {
                character.customization.purchasedSkins = [];
            }
            character.customization.purchasedSkins = Array.from(this.ownedSkins);
            character.customization.activeSkin = this.currentSkin;
            this.game.dataManager.markDirty();
            this.game.dataManager.save();
        }
        
        console.log(`🛍️ Purchased skin: ${skin.name} for ${skin.price} coins`);
        
        return { 
            success: true, 
            message: `Purchased ${skin.name}! Automatically equipped.` 
        };
    }
    
    setSkin(skinEmoji) {
        if (this.ownedSkins.has(skinEmoji)) {
            this.currentSkin = skinEmoji;
            
            // Save to character
            const character = this.game.dataManager?.getCurrentCharacter();
            if (character) {
                character.customization.activeSkin = this.currentSkin;
                this.game.dataManager.markDirty();
                this.game.dataManager.save();
            }
            
            console.log(`👤 Equipped skin: ${skinEmoji}`);
            return true;
        }
        return false;
    }
    
    getCurrentSkin() {
        return this.currentSkin;
    }
    
    getOwnedSkins() {
        return Array.from(this.ownedSkins);
    }
    
    getAvailableSkins() {
        return this.availableSkins;
    }
    
    getSkinInfo(skinEmoji) {
        return this.availableSkins.find(s => s.emoji === skinEmoji);
    }
    
    showSkinShop() {
        // Track store activity
        if (this.game.timeTracker) {
            this.game.timeTracker.startActivity('store');
        }
        this.displaySkinShopUI();
    }
    
    displaySkinShopUI() {
        // Create skin shop overlay
        const shopOverlay = document.createElement('div');
        shopOverlay.id = 'skinShop';
        shopOverlay.style.cssText = `
            position: fixed;
            top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1005;
            animation: fadeIn 0.3s ease-in-out;
        `;
        
        const shopContent = document.createElement('div');
        shopContent.style.cssText = `
            background: white;
            border: 5px solid #333;
            border-radius: 20px;
            padding: 30px;
            max-width: 90%;
            max-height: 90%;
            overflow-y: auto;
            text-align: center;
        `;
        
        const playerCoins = this.game.economy ? this.game.economy.coins : 0;
        const playerLevel = this.game.progression ? this.game.progression.playerLevel : 1;
        
        shopContent.innerHTML = `
            <h2 style="margin-bottom: 20px; color: #333;">🛍️ Emoji Skin Shop</h2>
            <p style="margin-bottom: 20px; color: #666;">Coins: 🪙 ${playerCoins} | Level: ${playerLevel}</p>
            <div id="categoryTabs" style="display: flex; gap: 10px; margin-bottom: 20px; justify-content: center; flex-wrap: wrap;"></div>
            <div id="skinGrid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 15px; margin-bottom: 20px;"></div>
            <button id="closeSkinShop" style="padding: 10px 20px; font-size: 16px; background: #f44336; color: white; border: none; border-radius: 10px; cursor: pointer;">Close</button>
        `;
        
        const categoryTabs = shopContent.querySelector('#categoryTabs');
        const skinGrid = shopContent.querySelector('#skinGrid');
        
        let currentCategory = 'basic';
        
        // Create category tabs
        Object.keys(this.emojiCategories).forEach(categoryKey => {
            const category = this.emojiCategories[categoryKey];
            const tab = document.createElement('button');
            tab.style.cssText = `
                padding: 8px 15px;
                border: 2px solid #333;
                border-radius: 20px;
                background: ${categoryKey === currentCategory ? '#4CAF50' : 'white'};
                color: ${categoryKey === currentCategory ? 'white' : '#333'};
                cursor: pointer;
                font-size: 14px;
                font-weight: bold;
                transition: all 0.2s ease;
            `;
            tab.innerHTML = `${category.icon} ${category.name}`;
            
            tab.addEventListener('click', () => {
                currentCategory = categoryKey;
                this.updateCategoryDisplay(categoryTabs, skinGrid, currentCategory, playerCoins, playerLevel);
            });
            
            categoryTabs.appendChild(tab);
        });
        
        // Initial display
        this.updateCategoryDisplay(categoryTabs, skinGrid, currentCategory, playerCoins, playerLevel);
        
        // Close button
        shopContent.querySelector('#closeSkinShop').addEventListener('click', () => {
            this.closeSkinShop();
        });
        
        shopOverlay.appendChild(shopContent);
        document.body.appendChild(shopOverlay);
        
        // Block game interactions
        this.game.setInteractionBlocking(true);
    }
    
    updateCategoryDisplay(categoryTabs, skinGrid, currentCategory, playerCoins, playerLevel) {
        // Update tab styles
        categoryTabs.querySelectorAll('button').forEach((tab, index) => {
            const categoryKey = Object.keys(this.emojiCategories)[index];
            const isActive = categoryKey === currentCategory;
            tab.style.background = isActive ? '#4CAF50' : 'white';
            tab.style.color = isActive ? 'white' : '#333';
        });
        
        // Clear and populate skin grid
        skinGrid.innerHTML = '';
        
        const categoryEmojis = this.emojiCategories[currentCategory].emojis;
        const letterFollowers = this.game.progression ? this.game.progression.getLetterFollowers() : [];
        
        categoryEmojis.forEach(skin => {
            const isOwned = this.ownedSkins.has(skin.emoji);
            const isCurrent = this.currentSkin === skin.emoji;
            const unlockStatus = this.getUnlockStatus(skin.emoji);
            const canUnlock = unlockStatus.canUnlock && !isOwned;
            
            const skinCard = document.createElement('div');
            skinCard.style.cssText = `
                border: 3px solid ${isCurrent ? '#4CAF50' : isOwned ? '#2196F3' : canUnlock ? '#333' : '#ccc'};
                border-radius: 15px;
                padding: 15px;
                background: ${isCurrent ? '#E8F5E8' : isOwned ? '#E3F2FD' : canUnlock ? 'white' : '#f5f5f5'};
                cursor: ${isOwned || canUnlock ? 'pointer' : 'not-allowed'};
                transition: transform 0.2s ease;
                opacity: ${canUnlock || isOwned ? '1' : '0.6'};
            `;
            
            let requirementText = '';
            if (!isOwned && !canUnlock) {
                requirementText = `<div style="font-size: 11px; color: #ff5722; margin-top: 5px;">${unlockStatus.reasons.join('<br>')}</div>`;
            }
            
            skinCard.innerHTML = `
                <div style="font-size: 40px; margin-bottom: 10px;">${skin.emoji}</div>
                <div style="font-weight: bold; margin-bottom: 5px; color: #333; font-size: 14px;">${skin.name}</div>
                <div style="color: #666; margin-bottom: 5px; font-size: 13px;">${skin.price === 0 ? 'Free' : `🪙 ${skin.price}`}</div>
                <div style="font-size: 11px; color: ${isCurrent ? '#4CAF50' : isOwned ? '#2196F3' : canUnlock ? '#333' : '#999'}; font-weight: bold;">
                    ${isCurrent ? 'EQUIPPED' : isOwned ? 'OWNED' : canUnlock ? 'BUY' : 'LOCKED'}
                </div>
                ${requirementText}
            `;
            
            if (isOwned || canUnlock) {
                skinCard.addEventListener('mouseenter', () => {
                    skinCard.style.transform = 'scale(1.05)';
                });
                
                skinCard.addEventListener('mouseleave', () => {
                    skinCard.style.transform = 'scale(1)';
                });
                
                skinCard.addEventListener('click', () => {
                    if (isOwned) {
                        this.setSkin(skin.emoji);
                        this.closeSkinShop();
                    } else if (canUnlock) {
                        const result = this.purchaseSkin(skin.emoji);
                        if (result.success) {
                            this.closeSkinShop();
                        } else {
                            alert(result.message);
                        }
                    }
                });
            }
            
            skinGrid.appendChild(skinCard);
        });
    }
    
    closeSkinShop() {
        const shopOverlay = document.getElementById('skinShop');
        if (shopOverlay) {
            shopOverlay.remove();
        }
        
        // End store activity tracking
        if (this.game.timeTracker) {
            this.game.timeTracker.endCurrentActivity();
        }
        
        // Re-enable game interactions
        this.game.setInteractionBlocking(false);
    }
}