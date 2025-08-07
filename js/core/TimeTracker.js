// TimeTracker - Comprehensive time tracking system for monitoring student activity
class TimeTracker {
    constructor(game) {
        this.game = game;
        
        // Activity types we track
        this.ACTIVITY_TYPES = {
            MENU: 'menu',
            LEVEL: 'level',
            PET_FARM: 'petFarm',
            STORE: 'store',
            CHALLENGE: 'challenge',
            CHARACTER_MENU: 'characterMenu',
            SETTINGS: 'settings'
        };
        
        // Current tracking state
        this.currentActivity = null;
        this.activityStartTime = null;
        this.sessionStartTime = Date.now();
        
        // Activity data for current session
        this.sessionActivities = this.initializeActivityData();
        
        // Save interval
        this.saveInterval = null;
        this.SAVE_FREQUENCY = 30000; // Save every 30 seconds
        
        this.init();
    }
    
    init() {
        // Load existing session data if any
        this.loadSessionData();
        
        // Start auto-save
        this.startAutoSave();
        
        console.log('⏱️ TimeTracker initialized');
    }
    
    initializeActivityData() {
        const data = {};
        Object.values(this.ACTIVITY_TYPES).forEach(type => {
            data[type] = {
                totalTime: 0,
                startTime: null,
                count: 0 // Number of times this activity was started
            };
        });
        return data;
    }
    
    // Start tracking a new activity
    startActivity(activityType) {
        // Validate activity type
        if (!Object.values(this.ACTIVITY_TYPES).includes(activityType)) {
            console.warn(`Unknown activity type: ${activityType}`);
            return;
        }
        
        // End current activity if any
        if (this.currentActivity) {
            this.endCurrentActivity();
        }
        
        // Start new activity
        this.currentActivity = activityType;
        this.activityStartTime = Date.now();
        this.sessionActivities[activityType].startTime = this.activityStartTime;
        this.sessionActivities[activityType].count++;
        
        console.log(`⏱️ Started activity: ${activityType}`);
        
        // Notify time limit manager if exists
        if (this.game.timeLimitManager) {
            this.game.timeLimitManager.onActivityStart(activityType);
        }
    }
    
    // End current activity and record time
    endCurrentActivity() {
        if (!this.currentActivity || !this.activityStartTime) {
            console.log('⏱️ No current activity to end');
            return;
        }
        
        const elapsed = Date.now() - this.activityStartTime;
        console.log(`⏱️ Ending activity: ${this.currentActivity}, elapsed: ${Math.round(elapsed / 1000)}s`);
        
        this.sessionActivities[this.currentActivity].totalTime += elapsed;
        this.sessionActivities[this.currentActivity].startTime = null;
        
        // Update character data
        this.updateCharacterTimeData(this.currentActivity, elapsed);
        
        console.log(`⏱️ Ended activity: ${this.currentActivity} (${Math.round(elapsed / 1000)}s)`);
        
        // Notify time limit manager
        if (this.game.timeLimitManager) {
            this.game.timeLimitManager.onActivityEnd(this.currentActivity, elapsed);
        }
        
        this.currentActivity = null;
        this.activityStartTime = null;
    }
    
    // Update character's time tracking data
    updateCharacterTimeData(activityType, elapsed) {
        const character = this.game.dataManager?.getCurrentCharacter();
        if (!character) {
            console.error('⏱️ No current character for time tracking');
            return;
        }
        
        // Initialize time tracking if not exists
        if (!character.statistics.timeTracking) {
            character.statistics.timeTracking = {
                lifetime: {
                    total: 0,
                    byActivity: {}
                },
                sessions: [],
                dailyHistory: {},
                currentSession: null
            };
        }
        
        const tracking = character.statistics.timeTracking;
        
        // Update lifetime totals
        tracking.lifetime.total += elapsed;
        if (!tracking.lifetime.byActivity[activityType]) {
            tracking.lifetime.byActivity[activityType] = 0;
        }
        tracking.lifetime.byActivity[activityType] += elapsed;
        
        console.log(`⏱️ Updated time tracking for ${activityType}: +${Math.round(elapsed/1000)}s, total: ${Math.round(tracking.lifetime.byActivity[activityType]/1000)}s`);
        
        // Update current session
        if (!tracking.currentSession) {
            tracking.currentSession = {
                id: `session_${Date.now()}`,
                date: this.sessionStartTime,
                duration: 0,
                activities: {}
            };
        }
        
        tracking.currentSession.duration += elapsed;
        if (!tracking.currentSession.activities[activityType]) {
            tracking.currentSession.activities[activityType] = 0;
        }
        tracking.currentSession.activities[activityType] += elapsed;
        
        // Update daily history
        const today = new Date().toISOString().split('T')[0];
        if (!tracking.dailyHistory[today]) {
            tracking.dailyHistory[today] = {
                total: 0,
                byActivity: {},
                sessions: 0
            };
        }
        
        tracking.dailyHistory[today].total += elapsed;
        if (!tracking.dailyHistory[today].byActivity[activityType]) {
            tracking.dailyHistory[today].byActivity[activityType] = 0;
        }
        tracking.dailyHistory[today].byActivity[activityType] += elapsed;
        
        // Mark data as dirty for saving
        this.game.dataManager?.markDirty();
        
        // Force save to ensure time data is persisted
        this.game.dataManager?.save();
    }
    
    // Get current session stats
    getSessionStats() {
        const stats = {
            sessionDuration: Date.now() - this.sessionStartTime,
            activities: {}
        };
        
        // Calculate totals including current activity
        Object.entries(this.sessionActivities).forEach(([type, data]) => {
            let total = data.totalTime;
            
            // Add current activity time if still active
            if (this.currentActivity === type && this.activityStartTime) {
                total += Date.now() - this.activityStartTime;
            }
            
            stats.activities[type] = {
                time: total,
                count: data.count,
                percentage: 0
            };
        });
        
        // Calculate percentages
        const totalActivityTime = Object.values(stats.activities)
            .reduce((sum, activity) => sum + activity.time, 0);
        
        if (totalActivityTime > 0) {
            Object.values(stats.activities).forEach(activity => {
                activity.percentage = Math.round((activity.time / totalActivityTime) * 100);
            });
        }
        
        return stats;
    }
    
    // Get time spent in non-educational activities
    getNonEducationalTime() {
        const nonEducational = [
            this.ACTIVITY_TYPES.STORE,
            this.ACTIVITY_TYPES.PET_FARM,
            this.ACTIVITY_TYPES.MENU,
            this.ACTIVITY_TYPES.CHARACTER_MENU,
            this.ACTIVITY_TYPES.SETTINGS
        ];
        
        let total = 0;
        nonEducational.forEach(type => {
            total += this.sessionActivities[type].totalTime;
            
            // Add current activity time if applicable
            if (this.currentActivity === type && this.activityStartTime) {
                total += Date.now() - this.activityStartTime;
            }
        });
        
        return total;
    }
    
    // Get time spent in educational activities
    getEducationalTime() {
        const educational = [
            this.ACTIVITY_TYPES.LEVEL,
            this.ACTIVITY_TYPES.CHALLENGE
        ];
        
        let total = 0;
        educational.forEach(type => {
            total += this.sessionActivities[type].totalTime;
            
            // Add current activity time if applicable
            if (this.currentActivity === type && this.activityStartTime) {
                total += Date.now() - this.activityStartTime;
            }
        });
        
        return total;
    }
    
    // Save session when ending
    endSession() {
        // End current activity
        this.endCurrentActivity();
        
        // Save session to character data
        const character = this.game.dataManager?.getCurrentCharacter();
        if (character && character.statistics.timeTracking) {
            const tracking = character.statistics.timeTracking;
            
            // Add current session to history
            if (tracking.currentSession) {
                if (!tracking.sessions) {
                    tracking.sessions = [];
                }
                
                // Keep only last 50 sessions
                tracking.sessions.push(tracking.currentSession);
                if (tracking.sessions.length > 50) {
                    tracking.sessions.shift();
                }
                
                // Update daily session count
                const today = new Date().toISOString().split('T')[0];
                if (tracking.dailyHistory[today]) {
                    tracking.dailyHistory[today].sessions++;
                }
                
                // Clear current session
                tracking.currentSession = null;
            }
            
            this.game.dataManager.save();
        }
        
        // Stop auto-save
        this.stopAutoSave();
        
        console.log('⏱️ TimeTracker session ended');
    }
    
    // Auto-save functionality
    startAutoSave() {
        this.saveInterval = setInterval(() => {
            this.saveCurrentState();
        }, this.SAVE_FREQUENCY);
    }
    
    stopAutoSave() {
        if (this.saveInterval) {
            clearInterval(this.saveInterval);
            this.saveInterval = null;
        }
    }
    
    saveCurrentState() {
        // Save to localStorage for recovery
        const state = {
            sessionStartTime: this.sessionStartTime,
            currentActivity: this.currentActivity,
            activityStartTime: this.activityStartTime,
            sessionActivities: this.sessionActivities
        };
        
        localStorage.setItem('alphahunters_time_tracker_state', JSON.stringify(state));
        
        // Also trigger DataManager save
        if (this.game.dataManager?.isDirty) {
            this.game.dataManager.save();
        }
    }
    
    loadSessionData() {
        try {
            const saved = localStorage.getItem('alphahunters_time_tracker_state');
            if (saved) {
                const state = JSON.parse(saved);
                
                // Check if this is the same session (within 5 minutes)
                if (Date.now() - state.sessionStartTime < 300000) {
                    this.sessionStartTime = state.sessionStartTime;
                    this.sessionActivities = state.sessionActivities;
                    
                    // Don't restore current activity as state may have changed
                    console.log('⏱️ Restored previous session data');
                }
            }
        } catch (error) {
            console.error('Error loading time tracker state:', error);
        }
    }
    
    // Helper method to format time
    formatTime(milliseconds) {
        const seconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        
        if (hours > 0) {
            return `${hours}h ${minutes % 60}m`;
        } else if (minutes > 0) {
            return `${minutes}m ${seconds % 60}s`;
        } else {
            return `${seconds}s`;
        }
    }
    
    // Get report data for teacher dashboard
    getReportData() {
        const character = this.game.dataManager?.getCurrentCharacter();
        if (!character || !character.statistics.timeTracking) {
            return null;
        }
        
        const tracking = character.statistics.timeTracking;
        
        return {
            lifetime: tracking.lifetime,
            recentSessions: tracking.sessions?.slice(-10) || [],
            dailyHistory: tracking.dailyHistory,
            currentSession: this.getSessionStats(),
            trends: this.calculateTrends(tracking.dailyHistory)
        };
    }
    
    calculateTrends(dailyHistory) {
        const days = Object.keys(dailyHistory).sort().slice(-7); // Last 7 days
        
        const trends = {
            totalTime: [],
            byActivity: {}
        };
        
        days.forEach(day => {
            const data = dailyHistory[day];
            trends.totalTime.push({
                date: day,
                value: data.total
            });
            
            Object.entries(data.byActivity || {}).forEach(([activity, time]) => {
                if (!trends.byActivity[activity]) {
                    trends.byActivity[activity] = [];
                }
                trends.byActivity[activity].push({
                    date: day,
                    value: time
                });
            });
        });
        
        return trends;
    }
}