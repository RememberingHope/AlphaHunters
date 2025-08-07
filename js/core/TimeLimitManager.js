// TimeLimitManager - Enforces teacher-set time limits for non-educational activities
class TimeLimitManager {
    constructor(game) {
        this.game = game;
        
        // Activity categories
        this.LIMITED_ACTIVITIES = ['store', 'petFarm', 'menu', 'characterMenu', 'settings'];
        this.EDUCATIONAL_ACTIVITIES = ['level', 'challenge'];
        
        // Current state
        this.limitsEnabled = false;
        this.limits = this.getDefaultLimits();
        this.currentUsage = this.initializeUsage();
        this.lastReset = Date.now();
        
        // Warning states
        this.warningLevels = {
            GREEN: { threshold: 120000, shown: false }, // > 2 minutes
            YELLOW: { threshold: 60000, shown: false }, // > 1 minute
            RED: { threshold: 30000, shown: false }, // > 30 seconds
            CRITICAL: { threshold: 0, shown: false } // Time's up
        };
        
        // UI elements
        this.timerDisplay = null;
        this.warningModal = null;
        this.lockOverlay = null;
        
        // Update interval
        this.updateInterval = null;
        this.UPDATE_FREQUENCY = 1000; // Update every second
        
        this.init();
    }
    
    init() {
        this.loadLimits();
        this.createTimerDisplay();
        console.log('⏰ TimeLimitManager initialized');
    }
    
    getDefaultLimits() {
        return {
            store: 300000, // 5 minutes
            petFarm: 600000, // 10 minutes
            menu: 180000, // 3 minutes
            characterMenu: 180000, // 3 minutes
            settings: 120000, // 2 minutes
            nonEducationalTotal: 900000 // 15 minutes total
        };
    }
    
    initializeUsage() {
        const usage = {};
        this.LIMITED_ACTIVITIES.forEach(activity => {
            usage[activity] = 0;
        });
        usage.nonEducationalTotal = 0;
        return usage;
    }
    
    loadLimits() {
        const character = this.game.dataManager?.getCurrentCharacter();
        if (!character) return;
        
        // Check if teacher has set limits for this character
        if (character.timeLimits) {
            this.limitsEnabled = character.timeLimits.enabled || false;
            this.limits = { ...this.getDefaultLimits(), ...character.timeLimits.limits };
            this.currentUsage = { ...this.initializeUsage(), ...character.timeLimits.currentUsage };
            this.lastReset = character.timeLimits.lastReset || Date.now();
        }
    }
    
    saveLimits() {
        const character = this.game.dataManager?.getCurrentCharacter();
        if (!character) return;
        
        character.timeLimits = {
            enabled: this.limitsEnabled,
            limits: this.limits,
            currentUsage: this.currentUsage,
            lastReset: this.lastReset
        };
        
        this.game.dataManager?.markDirty();
    }
    
    // Called when an activity starts
    onActivityStart(activityType) {
        if (!this.limitsEnabled) return;
        
        // Check if this is a limited activity
        if (this.LIMITED_ACTIVITIES.includes(activityType)) {
            this.startTracking();
            this.showTimerDisplay();
        } else {
            this.stopTracking();
            this.hideTimerDisplay();
        }
    }
    
    // Called when an activity ends
    onActivityEnd(activityType, elapsed) {
        if (!this.limitsEnabled) return;
        
        // Update usage if it was a limited activity
        if (this.LIMITED_ACTIVITIES.includes(activityType)) {
            this.currentUsage[activityType] += elapsed;
            this.currentUsage.nonEducationalTotal += elapsed;
            this.saveLimits();
        }
        
        this.stopTracking();
        this.hideTimerDisplay();
    }
    
    // Start tracking time for current activity
    startTracking() {
        if (this.updateInterval) return;
        
        // Reset warning states
        Object.values(this.warningLevels).forEach(level => level.shown = false);
        
        this.updateInterval = setInterval(() => {
            this.updateTimer();
        }, this.UPDATE_FREQUENCY);
        
        this.updateTimer(); // Initial update
    }
    
    stopTracking() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
    }
    
    updateTimer() {
        const currentActivity = this.game.timeTracker?.currentActivity;
        if (!currentActivity || !this.LIMITED_ACTIVITIES.includes(currentActivity)) return;
        
        // Calculate remaining time
        const activityRemaining = this.getRemainingTime(currentActivity);
        const totalRemaining = this.getRemainingTime('nonEducationalTotal');
        const timeRemaining = Math.min(activityRemaining, totalRemaining);
        
        // Update display
        this.updateTimerDisplay(currentActivity, timeRemaining);
        
        // Check for warnings
        this.checkWarnings(timeRemaining);
        
        // Check if time is up
        if (timeRemaining <= 0) {
            this.enforceTimeLimit();
        }
    }
    
    getRemainingTime(activityType) {
        const limit = this.limits[activityType];
        const used = this.currentUsage[activityType];
        
        // Add current session time if this is the active activity
        let currentSessionTime = 0;
        if (this.game.timeTracker?.currentActivity === activityType && 
            this.game.timeTracker?.activityStartTime) {
            currentSessionTime = Date.now() - this.game.timeTracker.activityStartTime;
        }
        
        return Math.max(0, limit - used - currentSessionTime);
    }
    
    createTimerDisplay() {
        this.timerDisplay = document.createElement('div');
        this.timerDisplay.id = 'timeLimitDisplay';
        this.timerDisplay.className = 'time-limit-display';
        this.timerDisplay.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(0, 0, 0, 0.7);
            color: white;
            padding: 10px 20px;
            border-radius: 25px;
            font-family: 'Comic Sans MS', cursive;
            font-size: 16px;
            display: none;
            align-items: center;
            gap: 10px;
            z-index: 9999;
            transition: all 0.3s ease;
        `;
        
        document.body.appendChild(this.timerDisplay);
    }
    
    showTimerDisplay() {
        if (this.timerDisplay && this.limitsEnabled) {
            this.timerDisplay.style.display = 'flex';
        }
    }
    
    hideTimerDisplay() {
        if (this.timerDisplay) {
            this.timerDisplay.style.display = 'none';
        }
    }
    
    updateTimerDisplay(activity, timeRemaining) {
        if (!this.timerDisplay) return;
        
        const minutes = Math.floor(timeRemaining / 60000);
        const seconds = Math.floor((timeRemaining % 60000) / 1000);
        const timeString = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        
        // Determine display state
        let className = 'time-limit-display';
        let icon = '⏱️';
        
        if (timeRemaining <= this.warningLevels.RED.threshold) {
            className += ' critical';
            icon = '⚠️';
        } else if (timeRemaining <= this.warningLevels.YELLOW.threshold) {
            className += ' warning';
            icon = '⏰';
        }
        
        // Update display
        this.timerDisplay.className = className;
        this.timerDisplay.innerHTML = `
            <span style="font-size: 20px;">${icon}</span>
            <span>${this.getActivityName(activity)}: ${timeString}</span>
        `;
        
        // Add pulsing animation for critical state
        if (timeRemaining <= this.warningLevels.RED.threshold) {
            this.timerDisplay.style.animation = 'pulse 0.5s infinite';
        } else if (timeRemaining <= this.warningLevels.YELLOW.threshold) {
            this.timerDisplay.style.animation = 'pulse 1s infinite';
        } else {
            this.timerDisplay.style.animation = 'none';
        }
    }
    
    getActivityName(activity) {
        const names = {
            store: 'Store',
            petFarm: 'Pet Farm',
            menu: 'Menu',
            characterMenu: 'Character',
            settings: 'Settings'
        };
        return names[activity] || activity;
    }
    
    checkWarnings(timeRemaining) {
        // Check each warning level
        Object.entries(this.warningLevels).forEach(([level, config]) => {
            if (timeRemaining <= config.threshold && !config.shown && timeRemaining > 0) {
                config.shown = true;
                
                if (level === 'RED') {
                    this.showWarningModal(timeRemaining);
                }
            }
        });
    }
    
    showWarningModal(timeRemaining) {
        // Remove existing modal if any
        if (this.warningModal) {
            this.warningModal.remove();
        }
        
        const seconds = Math.floor(timeRemaining / 1000);
        
        this.warningModal = document.createElement('div');
        this.warningModal.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(135deg, #ff6b6b, #ff4444);
            color: white;
            padding: 30px 40px;
            border-radius: 20px;
            font-size: 20px;
            font-weight: bold;
            z-index: 10000;
            box-shadow: 0 10px 30px rgba(0,0,0,0.5);
            animation: warningBounce 0.5s ease-out;
            text-align: center;
            font-family: 'Comic Sans MS', cursive;
        `;
        
        this.warningModal.innerHTML = `
            <div style="font-size: 48px; margin-bottom: 15px;">⏰</div>
            <div style="margin-bottom: 10px;">Time Almost Up!</div>
            <div style="font-size: 28px;">${seconds} seconds left</div>
            <div style="font-size: 16px; margin-top: 15px; opacity: 0.9;">
                Complete a level to get more time!
            </div>
        `;
        
        document.body.appendChild(this.warningModal);
        
        // Auto-remove after 3 seconds
        setTimeout(() => {
            if (this.warningModal) {
                this.warningModal.remove();
                this.warningModal = null;
            }
        }, 3000);
        
        // Add animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes warningBounce {
                0% { transform: translate(-50%, -50%) scale(0.5); opacity: 0; }
                50% { transform: translate(-50%, -50%) scale(1.1); }
                100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
            }
            @keyframes pulse {
                0% { transform: scale(1); }
                50% { transform: scale(1.05); }
                100% { transform: scale(1); }
            }
        `;
        document.head.appendChild(style);
    }
    
    enforceTimeLimit() {
        console.log('⏰ Time limit reached!');
        
        // Stop tracking
        this.stopTracking();
        this.hideTimerDisplay();
        
        // Show lock overlay
        this.showLockOverlay();
        
        // Disable current screen after delay
        setTimeout(() => {
            this.redirectToCharacterMenu();
        }, 5000);
    }
    
    showLockOverlay() {
        this.lockOverlay = document.createElement('div');
        this.lockOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 20000;
            animation: fadeIn 0.3s ease-out;
        `;
        
        this.lockOverlay.innerHTML = `
            <div style="
                background: white;
                padding: 40px;
                border-radius: 20px;
                text-align: center;
                max-width: 500px;
                animation: slideIn 0.5s ease-out;
            ">
                <div style="font-size: 64px; margin-bottom: 20px;">🔒</div>
                <h2 style="color: #333; margin-bottom: 20px; font-size: 28px;">
                    Time Limit Reached!
                </h2>
                <p style="color: #666; font-size: 18px; margin-bottom: 30px; line-height: 1.5;">
                    You've used all your time for fun activities.<br>
                    Complete a level or challenge to earn more time!
                </p>
                <div style="color: #999; font-size: 16px;">
                    Returning to character menu in <span id="redirectCountdown">5</span> seconds...
                </div>
            </div>
        `;
        
        document.body.appendChild(this.lockOverlay);
        
        // Countdown
        let countdown = 5;
        const countdownInterval = setInterval(() => {
            countdown--;
            const countdownEl = document.getElementById('redirectCountdown');
            if (countdownEl) {
                countdownEl.textContent = countdown;
            }
            if (countdown <= 0) {
                clearInterval(countdownInterval);
            }
        }, 1000);
        
        // Add animations
        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            @keyframes slideIn {
                from { transform: translateY(-50px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    }
    
    redirectToCharacterMenu() {
        // Remove overlay
        if (this.lockOverlay) {
            this.lockOverlay.remove();
            this.lockOverlay = null;
        }
        
        // Navigate to character menu
        if (this.game.menuManager) {
            this.game.menuManager.showMenu('characterMenu', {
                character: this.game.dataManager?.getCurrentCharacter()
            });
        }
        
        // Update UI to show locked state
        this.updateLockedUI();
    }
    
    updateLockedUI() {
        // Update character menu buttons if it's currently shown
        if (this.game.menuManager?.currentMenu === 'characterMenu') {
            // Re-render the character menu to update lock states
            this.game.menuManager.showMenu('characterMenu');
        }
    }
    
    // Reset time limits (called after completing educational content)
    resetLimits() {
        console.log('⏰ Resetting time limits');
        
        // Reset usage
        this.currentUsage = this.initializeUsage();
        this.lastReset = Date.now();
        
        // Reset warning states
        Object.values(this.warningLevels).forEach(level => level.shown = false);
        
        // Save
        this.saveLimits();
        
        // Show success message
        this.showResetMessage();
    }
    
    showResetMessage() {
        const message = document.createElement('div');
        message.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(135deg, #4CAF50, #45a049);
            color: white;
            padding: 20px 40px;
            border-radius: 20px;
            font-size: 18px;
            font-weight: bold;
            z-index: 10000;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            animation: successBounce 0.5s ease-out;
        `;
        
        message.innerHTML = `
            <div style="display: flex; align-items: center; gap: 15px;">
                <div style="font-size: 32px;">🎉</div>
                <div>Great job! Your time limits have been reset!</div>
            </div>
        `;
        
        document.body.appendChild(message);
        
        setTimeout(() => {
            message.remove();
        }, 3000);
        
        // Add animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes successBounce {
                0% { transform: translate(-50%, -50%) scale(0.5); opacity: 0; }
                50% { transform: translate(-50%, -50%) scale(1.1); }
                100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    }
    
    // Check if any activities are currently locked
    isActivityLocked(activityType) {
        if (!this.limitsEnabled || !this.LIMITED_ACTIVITIES.includes(activityType)) {
            return false;
        }
        
        const remaining = this.getRemainingTime(activityType);
        const totalRemaining = this.getRemainingTime('nonEducationalTotal');
        
        return remaining <= 0 || totalRemaining <= 0;
    }
    
    // Get lock reason for display
    getLockReason(activityType) {
        if (!this.isActivityLocked(activityType)) return null;
        
        const activityRemaining = this.getRemainingTime(activityType);
        const totalRemaining = this.getRemainingTime('nonEducationalTotal');
        
        if (activityRemaining <= 0) {
            return `${this.getActivityName(activityType)} time limit reached`;
        } else if (totalRemaining <= 0) {
            return 'Total activity time limit reached';
        }
        
        return 'Time limit reached';
    }
}