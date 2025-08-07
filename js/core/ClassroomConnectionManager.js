// Classroom Connection Manager - Handles background teacher monitoring
class ClassroomConnectionManager {
    constructor(game) {
        this.game = game;
        this.checkInterval = 60000; // 1 minute
        this.updateInterval = 5000; // 5 seconds when connected
        this.lastCheckTime = 0;
        this.isTeacherConnected = false;
        this.classroomData = null;
        this.teacherConnection = null;
        this.updateTimer = null;
        
        this.loadClassroomMembership();
        
        // Only start checking if we have classroom membership
        if (this.classroomData) {
            this.startBackgroundChecking();
        }
    }
    
    loadClassroomMembership() {
        try {
            const stored = localStorage.getItem('alphahunter_classroom');
            if (stored) {
                this.classroomData = JSON.parse(stored);
                console.log(`📚 Loaded classroom membership: ${this.classroomData.classroomCode}`);
            }
        } catch (error) {
            console.error('Error loading classroom membership:', error);
        }
    }
    
    saveClassroomMembership() {
        if (this.classroomData) {
            localStorage.setItem('alphahunter_classroom', JSON.stringify(this.classroomData));
        }
    }
    
    async joinClassroom(classroomCode, studentName) {
        // Validate classroom code format (letters and numbers only, 4-8 chars)
        if (!classroomCode || !classroomCode.match(/^[A-Z0-9]{4,8}$/)) {
            throw new Error('Invalid classroom code format');
        }
        
        // Generate unique student ID
        const studentId = 'student_' + Math.random().toString(36).substr(2, 9);
        
        // Store classroom membership
        this.classroomData = {
            classroomCode: classroomCode,
            studentName: studentName || this.game.dataManager?.getCurrentCharacter()?.identity?.name || 'Student',
            studentId: studentId,
            joinedAt: new Date().toISOString(),
            lastCheckIn: new Date().toISOString()
        };
        
        this.saveClassroomMembership();
        
        // Start background checking
        this.startBackgroundChecking();
        
        // Try immediate connection
        await this.checkTeacherConnection();
        
        return true;
    }
    
    leaveClassroom() {
        // Stop all timers
        if (this.checkTimer) {
            clearInterval(this.checkTimer);
            this.checkTimer = null;
        }
        
        if (this.updateTimer) {
            clearInterval(this.updateTimer);
            this.updateTimer = null;
        }
        
        // Disconnect from teacher
        if (this.teacherConnection) {
            this.teacherConnection.close();
            this.teacherConnection = null;
        }
        
        // Clear classroom data
        this.classroomData = null;
        localStorage.removeItem('alphahunter_classroom');
        
        console.log('📚 Left classroom');
    }
    
    startBackgroundChecking() {
        // Clear any existing timer
        if (this.checkTimer) {
            clearInterval(this.checkTimer);
        }
        
        // Check immediately on start
        this.checkTeacherConnection();
        
        // Then check every minute
        this.checkTimer = setInterval(() => {
            this.checkTeacherConnection();
        }, this.checkInterval);
        
        console.log('🔄 Started background teacher checking');
    }
    
    async checkTeacherConnection() {
        if (!this.classroomData) return;
        
        // Update last check-in time
        this.classroomData.lastCheckIn = new Date().toISOString();
        this.saveClassroomMembership();
        
        // Try to connect to teacher's classroom session
        const connected = await this.attemptTeacherConnection();
        
        if (connected && !this.isTeacherConnected) {
            console.log('✅ Connected to teacher monitoring');
            this.isTeacherConnected = true;
            this.startSendingUpdates();
        } else if (!connected && this.isTeacherConnected) {
            console.log('🔌 Teacher monitoring disconnected');
            this.isTeacherConnected = false;
            this.stopSendingUpdates();
        }
    }
    
    async attemptTeacherConnection() {
        try {
            // Use the existing multiplayer system with a special teacher peer ID
            const teacherPeerId = `teacher_classroom_${this.classroomData.classroomCode}`;
            
            // Create or get peer instance
            if (!this.game.multiplayerManager) {
                this.game.multiplayerManager = new ZeroSetupMultiplayer(this.game);
            }
            
            // Try to connect to teacher peer
            return await this.connectToTeacherPeer(teacherPeerId);
        } catch (error) {
            return false; // Teacher not available
        }
    }
    
    async connectToTeacherPeer(teacherPeerId) {
        return new Promise((resolve) => {
            try {
                // Get or create student peer
                if (!this.studentPeer) {
                    const studentPeerId = `classroom_${this.classroomData.studentId}`;
                    this.studentPeer = new Peer(studentPeerId, {
                        debug: 1,
                        config: {
                            'iceServers': [
                                { urls: 'stun:stun.l.google.com:19302' }
                            ]
                        }
                    });
                    
                    this.studentPeer.on('error', (err) => {
                        console.error('Peer error:', err);
                        resolve(false);
                    });
                }
                
                // Attempt connection to teacher
                const conn = this.studentPeer.connect(teacherPeerId, {
                    reliable: true,
                    metadata: {
                        type: 'classroom_monitoring',
                        studentData: this.classroomData
                    }
                });
                
                const timeout = setTimeout(() => {
                    resolve(false); // Teacher not available
                }, 5000);
                
                conn.on('open', () => {
                    clearTimeout(timeout);
                    this.teacherConnection = conn;
                    this.setupConnectionHandlers(conn);
                    resolve(true);
                });
                
                conn.on('error', () => {
                    clearTimeout(timeout);
                    resolve(false);
                });
            } catch (error) {
                resolve(false);
            }
        });
    }
    
    setupConnectionHandlers(conn) {
        conn.on('data', (data) => {
            this.handleTeacherMessage(data);
        });
        
        conn.on('close', () => {
            console.log('Teacher connection closed');
            this.teacherConnection = null;
            this.isTeacherConnected = false;
            this.stopSendingUpdates();
        });
    }
    
    handleTeacherMessage(message) {
        // Handle messages from teacher
        switch (message.type) {
            case 'ping':
                // Teacher checking if student is still active
                this.teacherConnection.send({ type: 'pong' });
                break;
                
            case 'teacher_hint':
                this.game.multiplayerManager?.showTeacherHint(message.data);
                break;
                
            case 'teacher_encouragement':
                this.game.multiplayerManager?.showTeacherEncouragement(message.data);
                break;
                
            case 'teacher_challenge':
                this.game.multiplayerManager?.startTeacherChallenge(message.data);
                break;
                
            case 'teacher_pause':
                this.game.pause();
                this.game.multiplayerManager?.showTeacherNotification('Teacher paused the game');
                break;
        }
    }
    
    startSendingUpdates() {
        // Send initial update
        this.sendMonitoringUpdate();
        
        // Then send updates every 5 seconds while connected
        this.updateTimer = setInterval(() => {
            this.sendMonitoringUpdate();
        }, this.updateInterval);
    }
    
    stopSendingUpdates() {
        if (this.updateTimer) {
            clearInterval(this.updateTimer);
            this.updateTimer = null;
        }
    }
    
    sendMonitoringUpdate() {
        if (!this.isTeacherConnected || !this.teacherConnection) return;
        
        const monitoringData = {
            type: 'monitoring_update',
            studentId: this.classroomData.studentId,
            studentName: this.classroomData.studentName,
            timestamp: Date.now(),
            status: this.getStudentStatus(),
            gameData: {
                currentScreen: this.getCurrentScreen(),
                isPlaying: this.game.levelManager?.isLevelActive() || false,
                currentLevel: this.game.levelManager?.currentLevel?.id || null,
                score: this.game.levelManager?.currentLevelScore || 0,
                // Only send detailed data if actively playing
                ...(this.game.levelManager?.isLevelActive() ? {
                    levelTime: this.game.levelManager.getLevelTime(),
                    lettersCollected: this.getLettersCollected(),
                    currentActivity: this.getCurrentActivity()
                } : {})
            }
        };
        
        try {
            this.teacherConnection.send(monitoringData);
        } catch (error) {
            console.error('Error sending monitoring update:', error);
        }
    }
    
    getStudentStatus() {
        if (this.game.levelManager?.isLevelActive()) return 'playing';
        if (this.game.isPaused) return 'paused';
        if (this.game.menuManager?.currentMenu) return 'menu';
        return 'idle';
    }
    
    getCurrentScreen() {
        if (this.game.isPaused) return 'pause';
        if (this.game.tracePanel?.isActive) return 'trace';
        if (document.querySelector('#upgradeMenu:not(.hidden)')) return 'upgrade';
        if (this.game.menuManager?.currentMenu) return 'menu';
        if (this.game.levelManager?.isLevelActive()) return 'game';
        return 'unknown';
    }
    
    getLettersCollected() {
        // Count inactive letterlings as collected
        if (!this.game.letterlings) return 0;
        return this.game.letterlings.filter(l => !l.isActive).length;
    }
    
    getCurrentActivity() {
        if (this.game.tracePanel?.isActive) {
            return `Tracing letter ${this.game.tracePanel.currentLetter}`;
        }
        if (this.game.contestPanel) {
            return 'In contest';
        }
        return 'Exploring';
    }
    
    // Check if student is in a classroom
    isInClassroom() {
        return this.classroomData !== null;
    }
    
    getClassroomCode() {
        return this.classroomData?.classroomCode || null;
    }
    
    // Clean up on game exit
    cleanup() {
        this.stopSendingUpdates();
        
        if (this.checkTimer) {
            clearInterval(this.checkTimer);
        }
        
        if (this.teacherConnection) {
            this.teacherConnection.close();
        }
        
        if (this.studentPeer) {
            this.studentPeer.destroy();
        }
    }
}