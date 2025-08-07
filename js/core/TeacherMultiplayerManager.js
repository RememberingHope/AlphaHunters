// Teacher Multiplayer Manager - Handles teacher-specific monitoring and interaction features
class TeacherMultiplayerManager {
    constructor(game) {
        this.game = game;
        this.monitoredSessions = new Map(); // roomCode -> sessionData
        this.activeConnections = new Map(); // peerId -> connection
        this.isMonitoring = false;
        this.currentRoomCode = null;
        
        // UI elements
        this.monitorPanel = null;
        this.sessionCards = new Map();
        
        // Permissions
        this.permissions = ['view', 'interact', 'control'];
        
        // Message types
        this.messageTypes = {
            HINT: 'hint',
            ENCOURAGEMENT: 'encouragement',
            CHALLENGE: 'challenge',
            PAUSE: 'pause',
            RESUME: 'resume',
            JOIN: 'join'
        };
        
        // Encouragement messages
        this.encouragements = [
            "Great job! Keep going! 🌟",
            "You're doing amazing! 💪",
            "Almost there! You can do it! 🎯",
            "Fantastic work! 🎉",
            "Keep up the excellent effort! 👏"
        ];
    }
    
    // Initialize teacher monitoring
    async init() {
        // Verify teacher authentication
        if (!this.game.teacherAuth?.isAuthenticated) {
            console.error('Teacher not authenticated');
            return false;
        }
        
        this.isMonitoring = true;
        return true;
    }
    
    // Discover active sessions on the network
    async discoverSessions() {
        const sessions = [];
        
        // Try common room codes (this is a simplified approach)
        // In a real implementation, you might use service discovery
        for (let i = 1000; i <= 9999; i++) {
            const roomCode = i.toString();
            if (await this.checkRoomExists(roomCode)) {
                sessions.push({
                    roomCode: roomCode,
                    status: 'active'
                });
            }
        }
        
        return sessions;
    }
    
    // Check if a room exists
    async checkRoomExists(roomCode) {
        // This would attempt to connect and check
        // For now, return false to avoid spamming connections
        return false;
    }
    
    // Connect to a student session as observer
    async connectAsObserver(roomCode) {
        if (!this.isMonitoring) {
            await this.init();
        }
        
        this.currentRoomCode = roomCode;
        
        // Use the existing multiplayer manager with teacher mode
        const multiplayer = this.game.multiplayerManager;
        if (!multiplayer) {
            console.error('Multiplayer manager not available');
            return false;
        }
        
        // Connect as teacher
        const teacherPin = this.game.teacherAuth.config.pin;
        return await multiplayer.connectAsTeacher(roomCode, teacherPin);
    }
    
    // Create monitoring UI
    createMonitoringPanel() {
        if (this.monitorPanel) {
            this.monitorPanel.remove();
        }
        
        this.monitorPanel = document.createElement('div');
        this.monitorPanel.className = 'teacher-monitor-panel';
        this.monitorPanel.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            width: 350px;
            max-height: 80vh;
            background: rgba(255, 255, 255, 0.95);
            border: 3px solid #333;
            border-radius: 15px;
            padding: 15px;
            overflow-y: auto;
            z-index: 1500;
            font-family: 'Comic Sans MS', cursive;
        `;
        
        this.monitorPanel.innerHTML = `
            <div class="monitor-header">
                <h3>👩‍🏫 Teacher Monitor</h3>
                <button onclick="game.teacherMultiplayer.closeMonitoring()" 
                        style="position: absolute; top: 10px; right: 10px; 
                               background: #f44336; color: white; border: none; 
                               border-radius: 5px; padding: 5px 10px; cursor: pointer;">
                    ✖️ Close
                </button>
            </div>
            <div class="monitor-content">
                <div class="room-info">
                    <strong>Room Code:</strong> ${this.currentRoomCode || 'Not connected'}
                </div>
                <div id="studentsList" class="students-list" style="margin-top: 15px;">
                    <!-- Student cards will be added here -->
                </div>
            </div>
        `;
        
        document.body.appendChild(this.monitorPanel);
    }
    
    // Update student monitoring data
    updateStudentData(studentId, data) {
        let session = this.monitoredSessions.get(studentId);
        if (!session) {
            session = new StudentSession(studentId, data.name, data.emoji);
            this.monitoredSessions.set(studentId, session);
        }
        
        session.updateState(data);
        this.updateStudentCard(studentId, session);
    }
    
    // Create or update student card
    updateStudentCard(studentId, session) {
        let card = this.sessionCards.get(studentId);
        if (!card) {
            card = document.createElement('div');
            card.className = 'student-card';
            card.style.cssText = `
                background: white;
                border: 2px solid #ddd;
                border-radius: 10px;
                padding: 10px;
                margin: 10px 0;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            `;
            
            const studentsList = document.getElementById('studentsList');
            if (studentsList) {
                studentsList.appendChild(card);
            }
            this.sessionCards.set(studentId, card);
        }
        
        const currentState = session.currentState;
        const extendedData = currentState.extendedData || {};
        
        card.innerHTML = `
            <div class="student-header" style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
                <span style="font-size: 24px;">${session.emoji}</span>
                <strong>${session.name}</strong>
                <span style="margin-left: auto; color: ${currentState.isActive ? 'green' : 'gray'};">
                    ${currentState.isActive ? '🟢' : '⚫'}
                </span>
            </div>
            <div class="student-info" style="font-size: 14px;">
                <div>📍 Position: (${Math.round(currentState.x || 0)}, ${Math.round(currentState.y || 0)})</div>
                <div>📊 Score: ${currentState.score || 0}</div>
                <div>📱 Screen: ${extendedData.currentScreen || 'unknown'}</div>
                <div>🎮 Level: ${extendedData.currentLevel || 'N/A'}</div>
                ${extendedData.traceActivity?.isTracing ? 
                    `<div>✍️ Tracing: ${extendedData.traceActivity.currentLetter?.toUpperCase()}</div>` : ''}
            </div>
            <div class="student-actions" style="display: flex; gap: 5px; margin-top: 10px;">
                <button onclick="game.teacherMultiplayer.sendHint('${studentId}')" 
                        style="padding: 5px 10px; background: #2196F3; color: white; 
                               border: none; border-radius: 5px; cursor: pointer;">
                    💡 Hint
                </button>
                <button onclick="game.teacherMultiplayer.sendEncouragement('${studentId}')" 
                        style="padding: 5px 10px; background: #4CAF50; color: white; 
                               border: none; border-radius: 5px; cursor: pointer;">
                    🌟 Encourage
                </button>
                <button onclick="game.teacherMultiplayer.sendChallenge('${studentId}')" 
                        style="padding: 5px 10px; background: #FF9800; color: white; 
                               border: none; border-radius: 5px; cursor: pointer;">
                    🎯 Challenge
                </button>
            </div>
        `;
    }
    
    // Send hint to student
    sendHint(studentId) {
        const session = this.monitoredSessions.get(studentId);
        if (!session) return;
        
        const hint = this.generateHint(session);
        this.sendTeacherMessage(this.messageTypes.HINT, {
            targetStudent: studentId,
            message: hint
        });
    }
    
    // Generate context-aware hint
    generateHint(session) {
        const extendedData = session.currentState.extendedData || {};
        
        if (extendedData.traceActivity?.isTracing) {
            const letter = extendedData.traceActivity.currentLetter;
            return `Try starting the letter "${letter}" from the top! 📝`;
        }
        
        if (extendedData.currentScreen === 'game') {
            return "Look for letterlings that match your current level! 🔍";
        }
        
        return "Take your time and focus on accuracy! 🎯";
    }
    
    // Send encouragement
    sendEncouragement(studentId) {
        const message = this.encouragements[Math.floor(Math.random() * this.encouragements.length)];
        this.sendTeacherMessage(this.messageTypes.ENCOURAGEMENT, {
            targetStudent: studentId,
            message: message
        });
    }
    
    // Send challenge
    sendChallenge(studentId) {
        // For now, send a simple letter challenge
        const letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
        const challengeLetter = letters[Math.floor(Math.random() * letters.length)];
        
        this.sendTeacherMessage(this.messageTypes.CHALLENGE, {
            targetStudent: studentId,
            type: 'letter_trace',
            letter: challengeLetter,
            reward: 50
        });
    }
    
    // Send teacher message through multiplayer
    sendTeacherMessage(type, data) {
        const multiplayer = this.game.multiplayerManager;
        if (!multiplayer || !multiplayer.isTeacher) {
            console.error('Not connected as teacher');
            return;
        }
        
        multiplayer.sendTeacherMessage(type, data);
    }
    
    // Close monitoring
    closeMonitoring() {
        this.isMonitoring = false;
        
        if (this.monitorPanel) {
            this.monitorPanel.remove();
            this.monitorPanel = null;
        }
        
        this.sessionCards.clear();
        this.monitoredSessions.clear();
        
        // Disconnect from multiplayer
        const multiplayer = this.game.multiplayerManager;
        if (multiplayer && multiplayer.isTeacher) {
            multiplayer.disconnect();
        }
    }
}

// Student session tracking class
class StudentSession {
    constructor(studentId, name, emoji) {
        this.studentId = studentId;
        this.name = name || 'Student';
        this.emoji = emoji || '😊';
        this.sessionStart = Date.now();
        this.currentState = {
            isActive: true
        };
        this.activityLog = [];
        this.performanceMetrics = {
            lettersPerMinute: 0,
            averageTraceScore: 0,
            strugglingLetters: [],
            strongLetters: []
        };
    }
    
    updateState(newState) {
        this.currentState = { ...this.currentState, ...newState };
        this.activityLog.push({
            timestamp: Date.now(),
            state: newState
        });
        this.calculateMetrics();
    }
    
    calculateMetrics() {
        // Calculate performance metrics based on activity log
        const recentActivities = this.activityLog.slice(-50); // Last 50 activities
        
        // Letters per minute
        const timeSpan = (Date.now() - this.sessionStart) / 60000; // minutes
        const lettersCollected = recentActivities.filter(a => 
            a.state.type === 'letterling_collected'
        ).length;
        this.performanceMetrics.lettersPerMinute = lettersCollected / timeSpan;
        
        // Average trace score
        const traceScores = recentActivities
            .filter(a => a.state.traceScore !== undefined)
            .map(a => a.state.traceScore);
        if (traceScores.length > 0) {
            this.performanceMetrics.averageTraceScore = 
                traceScores.reduce((a, b) => a + b, 0) / traceScores.length;
        }
    }
}