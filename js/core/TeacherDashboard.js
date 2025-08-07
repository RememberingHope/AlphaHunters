// Teacher Dashboard - Central hub for all teacher tools
class TeacherDashboard {
    constructor(game) {
        this.game = game;
        this.container = null;
        this.currentSection = 'overview';
        
        this.sections = {
            overview: { title: '📊 Overview', icon: '📊' },
            classroom: { title: '📚 Classroom', icon: '📚' },
            liveSessions: { title: '📡 Live Sessions', icon: '📡' },
            levels: { title: '🎮 Level Management', icon: '🎮' },
            letters: { title: '✏️ Letter Configuration', icon: '✏️' },
            challenges: { title: '📝 Challenges', icon: '📝' },
            students: { title: '👥 Student Progress', icon: '👥' },
            timeManagement: { title: '⏱️ Time Management', icon: '⏱️' },
            settings: { title: '⚙️ Settings', icon: '⚙️' }
        };
        
        this.selectedStudentId = null;
        
        // Classroom management
        this.classroomCode = null;
        this.classroomStudents = new Map();
        this.teacherPeer = null;
        this.studentConnections = new Map();
        this.monitoringActive = false;
        
        this.loadClassroomCode();
        this.init();
    }
    
    init() {
        this.createContainer();
    }
    
    createContainer() {
        // Create main dashboard container
        this.container = document.createElement('div');
        this.container.id = 'teacherDashboard';
        this.container.style.cssText = `
            position: fixed;
            top: 0; left: 0; right: 0; bottom: 0;
            background: #f5f5f5;
            display: none;
            z-index: 5000;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        `;
        
        document.body.appendChild(this.container);
    }
    
    show() {
        if (!this.game.teacherAuth?.checkAuth()) {
            console.error('Unauthorized access to teacher dashboard');
            return;
        }
        
        // Pause the game and stop any active level
        if (this.game.isPaused === false) {
            this.game.togglePause();
        }
        
        // End any active level
        if (this.game.levelManager && this.game.levelManager.isLevelActive()) {
            console.log('🛑 Ending active level before showing teacher dashboard');
            this.game.levelManager.endLevel();
        }
        
        // Hide game canvas
        if (this.game.canvas) {
            this.game.canvas.style.display = 'none';
        }
        
        // Hide HUD
        const hudOverlay = document.getElementById('hudOverlay');
        if (hudOverlay) {
            hudOverlay.classList.add('hidden');
        }
        
        this.container.style.display = 'flex';
        this.render();
        
        // Hide game menu if visible
        if (this.game.menuManager) {
            this.game.menuManager.hideMenu();
        }
    }
    
    hide() {
        this.container.style.display = 'none';
        
        // Show game canvas again
        if (this.game.canvas) {
            this.game.canvas.style.display = 'block';
        }
        
        // Show menu
        if (this.game.menuManager) {
            this.game.menuManager.showStartMenu();
        }
    }
    
    render() {
        this.container.innerHTML = `
            <div style="display: flex; height: 100%;">
                <!-- Sidebar -->
                <div style="
                    width: 260px;
                    background: #1976D2;
                    color: white;
                    padding: 20px;
                    box-shadow: 2px 0 5px rgba(0,0,0,0.1);
                ">
                    <h1 style="font-size: 24px; margin-bottom: 30px; text-align: center;">
                        🎓 Teacher Tools
                    </h1>
                    
                    <nav id="teacherNav">
                        ${Object.entries(this.sections).map(([key, section]) => `
                            <button class="teacher-nav-btn" data-section="${key}" style="
                                display: block;
                                width: 100%;
                                padding: 15px 20px;
                                margin-bottom: 10px;
                                background: ${this.currentSection === key ? 'rgba(255,255,255,0.2)' : 'transparent'};
                                border: none;
                                border-radius: 8px;
                                color: white;
                                font-size: 16px;
                                text-align: left;
                                cursor: pointer;
                                transition: background 0.3s;
                            ">
                                ${section.icon} ${section.title}
                            </button>
                        `).join('')}
                    </nav>
                    
                    <div style="margin-top: auto; padding-top: 30px;">
                        <button id="teacherLogoutBtn" style="
                            display: block;
                            width: 100%;
                            padding: 12px;
                            background: rgba(255,255,255,0.2);
                            border: 1px solid rgba(255,255,255,0.3);
                            border-radius: 8px;
                            color: white;
                            font-size: 14px;
                            cursor: pointer;
                        ">
                            🚪 Logout
                        </button>
                    </div>
                </div>
                
                <!-- Main Content -->
                <div style="flex: 1; overflow-y: auto;">
                    <!-- Header -->
                    <div style="
                        background: white;
                        padding: 20px 30px;
                        border-bottom: 1px solid #e0e0e0;
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                    ">
                        <h2 style="font-size: 28px; color: #333; margin: 0;">
                            ${this.sections[this.currentSection].title}
                        </h2>
                        
                        <button id="teacherBackBtn" style="
                            background: #f5f5f5;
                            border: 1px solid #ddd;
                            padding: 10px 20px;
                            border-radius: 8px;
                            cursor: pointer;
                            font-size: 14px;
                        ">
                            ← Back to Game
                        </button>
                    </div>
                    
                    <!-- Content Area -->
                    <div id="teacherContent" style="padding: 30px;">
                        ${this.renderSection()}
                    </div>
                </div>
            </div>
        `;
        
        this.attachEventListeners();
    }
    
    renderSection() {
        switch (this.currentSection) {
            case 'overview':
                return this.renderOverview();
            case 'classroom':
                return this.renderClassroom();
            case 'liveSessions':
                return this.renderLiveSessions();
            case 'levels':
                return this.renderLevelManagement();
            case 'letters':
                return this.renderLetterConfiguration();
            case 'challenges':
                return this.renderChallenges();
            case 'students':
                return this.renderStudentProgress();
            case 'timeManagement':
                return this.renderTimeManagement();
            case 'settings':
                return this.renderSettings();
            default:
                return '<p>Select a section from the menu.</p>';
        }
    }
    
    renderOverview() {
        const character = this.game.dataManager?.getCurrentCharacter();
        const characterName = character?.identity?.name || 'No character selected';
        
        return `
            <div style="max-width: 800px;">
                <div style="
                    background: white;
                    padding: 30px;
                    border-radius: 12px;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                    margin-bottom: 30px;
                ">
                    <h3 style="color: #1976D2; margin-bottom: 20px;">Welcome to Teacher Tools!</h3>
                    <p style="color: #666; line-height: 1.6;">
                        This dashboard gives you complete control over the AlphaHunters learning experience.
                        You can create custom levels, modify letter tracing patterns, track student progress,
                        and generate detailed reports.
                    </p>
                </div>
                
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px;">
                    <div style="
                        background: white;
                        padding: 25px;
                        border-radius: 12px;
                        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                    ">
                        <h4 style="color: #333; margin-bottom: 15px;">📊 Quick Stats</h4>
                        <p><strong>Current Student:</strong> ${characterName}</p>
                        <p><strong>Total Levels:</strong> ${Object.keys(this.game.levelManager?.levels || {}).length}</p>
                        <p><strong>Custom Levels:</strong> ${this.getCustomLevelCount()}</p>
                        <p><strong>Challenges:</strong> ${this.game.challengeManager?.challenges.length || 0}</p>
                    </div>
                    
                    <div style="
                        background: white;
                        padding: 25px;
                        border-radius: 12px;
                        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                    ">
                        <h4 style="color: #333; margin-bottom: 15px;">🚀 Quick Actions</h4>
                        <button class="quick-action-btn" data-action="create-level" style="
                            display: block;
                            width: 100%;
                            padding: 10px;
                            margin-bottom: 10px;
                            background: #4CAF50;
                            color: white;
                            border: none;
                            border-radius: 6px;
                            cursor: pointer;
                        ">Create New Level</button>
                        <button class="quick-action-btn" data-action="view-progress" style="
                            display: block;
                            width: 100%;
                            padding: 10px;
                            background: #2196F3;
                            color: white;
                            border: none;
                            border-radius: 6px;
                            cursor: pointer;
                        ">View Student Progress</button>
                    </div>
                </div>
                
                <div style="
                    background: #FFF3E0;
                    padding: 20px;
                    border-radius: 12px;
                    margin-top: 30px;
                    border-left: 4px solid #FF9800;
                ">
                    <h4 style="color: #F57C00; margin-bottom: 10px;">📌 Getting Started</h4>
                    <ol style="color: #666; line-height: 1.8;">
                        <li>Create custom levels in the Level Management section</li>
                        <li>Modify letter tracing patterns in Letter Configuration</li>
                        <li>Track student progress and generate reports</li>
                        <li>Adjust game settings to match your teaching style</li>
                    </ol>
                </div>
            </div>
        `;
    }
    
    renderClassroom() {
        return `
            <div>
                <h2 style="color: #333; margin-bottom: 30px;">📚 Classroom Management</h2>
                
                <!-- Classroom Setup -->
                <div style="
                    background: white;
                    padding: 30px;
                    border-radius: 12px;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                    margin-bottom: 30px;
                ">
                    <h3 style="color: #333; margin-bottom: 20px;">Your Classroom Code</h3>
                    
                    <div style="
                        display: flex;
                        align-items: center;
                        gap: 20px;
                        margin-bottom: 20px;
                    ">
                        <div style="
                            font-size: 48px;
                            font-weight: bold;
                            color: #1976D2;
                            letter-spacing: 5px;
                            padding: 20px 40px;
                            background: #E3F2FD;
                            border-radius: 10px;
                            border: 3px solid #1976D2;
                        ">
                            ${this.classroomCode || 'Not Set'}
                        </div>
                        
                        ${!this.classroomCode ? `
                            <button 
                                id="generateClassroomCode"
                                style="
                                    background: #4CAF50;
                                    color: white;
                                    border: none;
                                    padding: 15px 30px;
                                    border-radius: 8px;
                                    font-size: 18px;
                                    cursor: pointer;
                                "
                            >
                                Generate Code
                            </button>
                        ` : `
                            <button 
                                id="regenerateClassroomCode"
                                style="
                                    background: #FF9800;
                                    color: white;
                                    border: none;
                                    padding: 15px 30px;
                                    border-radius: 8px;
                                    font-size: 18px;
                                    cursor: pointer;
                                "
                            >
                                Generate New Code
                            </button>
                        `}
                    </div>
                    
                    <p style="color: #666; font-size: 16px;">
                        Share this code with your students. They only need to enter it once on their device.
                    </p>
                    
                    ${this.classroomCode ? `
                        <div style="
                            margin-top: 20px;
                            padding: 15px;
                            background: #FFF3E0;
                            border-radius: 8px;
                            border-left: 4px solid #FF9800;
                        ">
                            <strong>Instructions for Students:</strong>
                            <ol style="margin: 10px 0 0 20px; line-height: 1.6;">
                                <li>Open AlphaHunters game</li>
                                <li>Click "Join Classroom" in the menu</li>
                                <li>Enter code: <strong>${this.classroomCode}</strong></li>
                                <li>Click "Join" - that's it!</li>
                            </ol>
                        </div>
                    ` : ''}
                </div>
                
                <!-- Monitoring Status -->
                <div style="
                    background: white;
                    padding: 30px;
                    border-radius: 12px;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                    margin-bottom: 30px;
                ">
                    <h3 style="color: #333; margin-bottom: 20px;">Monitoring Status</h3>
                    
                    <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 20px;">
                        <div style="
                            width: 20px;
                            height: 20px;
                            border-radius: 50%;
                            background: ${this.monitoringActive ? '#4CAF50' : '#f44336'};
                        "></div>
                        <span style="font-size: 18px; color: #333;">
                            Monitoring: ${this.monitoringActive ? 'Active' : 'Inactive'}
                        </span>
                        
                        <button 
                            id="toggleMonitoring"
                            style="
                                margin-left: auto;
                                background: ${this.monitoringActive ? '#f44336' : '#4CAF50'};
                                color: white;
                                border: none;
                                padding: 10px 20px;
                                border-radius: 6px;
                                cursor: pointer;
                            "
                        >
                            ${this.monitoringActive ? 'Stop Monitoring' : 'Start Monitoring'}
                        </button>
                    </div>
                    
                    ${this.monitoringActive ? `
                        <div style="color: #666;">
                            <p>🔄 Students will automatically appear when they check in (up to 1 minute delay)</p>
                            <p>📊 Connected Students: ${this.classroomStudents.size}</p>
                        </div>
                    ` : `
                        <p style="color: #666;">
                            Start monitoring to see students as they play. Students can still join your classroom while monitoring is off.
                        </p>
                    `}
                </div>
                
                <!-- Student Grid -->
                ${this.monitoringActive ? `
                    <div style="
                        background: white;
                        padding: 30px;
                        border-radius: 12px;
                        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                    ">
                        <h3 style="color: #333; margin-bottom: 20px;">
                            Classroom Students 
                            <span style="color: #666; font-size: 16px;">
                                (${this.classroomStudents.size} connected)
                            </span>
                        </h3>
                        
                        <div id="classroomStudentsGrid" style="
                            display: grid;
                            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
                            gap: 15px;
                        ">
                            ${this.renderClassroomStudentTiles()}
                        </div>
                        
                        ${this.classroomStudents.size === 0 ? `
                            <div style="
                                text-align: center;
                                padding: 60px 20px;
                                color: #999;
                            ">
                                <div style="font-size: 48px; margin-bottom: 20px;">👥</div>
                                <p style="font-size: 18px;">Waiting for students to connect...</p>
                                <p style="font-size: 14px; margin-top: 10px;">
                                    Students who have joined your classroom will appear here when they play the game.
                                </p>
                            </div>
                        ` : ''}
                        
                        <!-- Quick Actions -->
                        ${this.classroomStudents.size > 0 ? `
                            <div style="
                                margin-top: 30px;
                                padding-top: 30px;
                                border-top: 2px solid #eee;
                            ">
                                <h4 style="color: #333; margin-bottom: 15px;">Quick Actions</h4>
                                <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                                    <button 
                                        class="classroom-action-btn"
                                        data-action="pause-all"
                                        style="
                                            padding: 10px 20px;
                                            background: #FF9800;
                                            color: white;
                                            border: none;
                                            border-radius: 6px;
                                            cursor: pointer;
                                        "
                                    >
                                        ⏸️ Pause All
                                    </button>
                                    
                                    <button 
                                        class="classroom-action-btn"
                                        data-action="encourage-all"
                                        style="
                                            padding: 10px 20px;
                                            background: #4CAF50;
                                            color: white;
                                            border: none;
                                            border-radius: 6px;
                                            cursor: pointer;
                                        "
                                    >
                                        🌟 Encourage All
                                    </button>
                                    
                                    <button 
                                        class="classroom-action-btn"
                                        data-action="challenge-all"
                                        style="
                                            padding: 10px 20px;
                                            background: #9C27B0;
                                            color: white;
                                            border: none;
                                            border-radius: 6px;
                                            cursor: pointer;
                                        "
                                    >
                                        🎯 Send Challenge
                                    </button>
                                </div>
                            </div>
                        ` : ''}
                    </div>
                ` : ''}
            </div>
        `;
    }
    
    renderLiveSessions() {
        // Initialize teacher multiplayer manager if not exists
        if (!this.game.teacherMultiplayer) {
            this.game.teacherMultiplayer = new TeacherMultiplayerManager(this.game);
        }
        
        return `
            <div>
                <h2 style="color: #333; margin-bottom: 30px;">📡 Live Student Sessions</h2>
                
                <!-- Session Discovery -->
                <div style="
                    background: white;
                    padding: 30px;
                    border-radius: 12px;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                    margin-bottom: 30px;
                ">
                    <h3 style="color: #333; margin-bottom: 20px;">Find Active Sessions</h3>
                    
                    <div style="display: flex; gap: 15px; align-items: center; margin-bottom: 20px;">
                        <input 
                            type="text" 
                            id="roomCodeInput" 
                            placeholder="Enter Room Code (e.g., 1234)"
                            style="
                                flex: 1;
                                padding: 12px;
                                border: 2px solid #ddd;
                                border-radius: 8px;
                                font-size: 16px;
                            "
                        />
                        <button 
                            id="connectToRoomBtn"
                            style="
                                background: #2196F3;
                                color: white;
                                border: none;
                                padding: 12px 24px;
                                border-radius: 8px;
                                font-size: 16px;
                                cursor: pointer;
                            "
                        >
                            🔌 Connect
                        </button>
                    </div>
                    
                    <div id="connectionStatus" style="
                        padding: 15px;
                        background: #f5f5f5;
                        border-radius: 8px;
                        text-align: center;
                        color: #666;
                    ">
                        Enter a room code to connect to a student session
                    </div>
                </div>
                
                <!-- Active Monitoring -->
                <div id="activeMonitoring" style="display: none;">
                    <div style="
                        background: white;
                        padding: 30px;
                        border-radius: 12px;
                        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                    ">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                            <h3 style="color: #333; margin: 0;">Connected Students</h3>
                            <button 
                                id="disconnectBtn"
                                style="
                                    background: #f44336;
                                    color: white;
                                    border: none;
                                    padding: 8px 16px;
                                    border-radius: 6px;
                                    cursor: pointer;
                                "
                            >
                                🔌 Disconnect
                            </button>
                        </div>
                        
                        <div id="connectedStudentsList" style="
                            display: grid;
                            gap: 15px;
                            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                        ">
                            <!-- Student cards will be dynamically added here -->
                        </div>
                    </div>
                </div>
                
                <!-- Quick Actions -->
                <div style="
                    background: white;
                    padding: 30px;
                    border-radius: 12px;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                    margin-top: 30px;
                ">
                    <h3 style="color: #333; margin-bottom: 20px;">Quick Actions</h3>
                    
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
                        <button 
                            class="teacher-action-btn"
                            data-action="encourage-all"
                            style="
                                padding: 20px;
                                background: #4CAF50;
                                color: white;
                                border: none;
                                border-radius: 8px;
                                font-size: 16px;
                                cursor: pointer;
                                text-align: center;
                            "
                        >
                            🌟 Encourage All
                        </button>
                        
                        <button 
                            class="teacher-action-btn"
                            data-action="pause-all"
                            style="
                                padding: 20px;
                                background: #FF9800;
                                color: white;
                                border: none;
                                border-radius: 8px;
                                font-size: 16px;
                                cursor: pointer;
                                text-align: center;
                            "
                        >
                            ⏸️ Pause All
                        </button>
                        
                        <button 
                            class="teacher-action-btn"
                            data-action="challenge-all"
                            style="
                                padding: 20px;
                                background: #9C27B0;
                                color: white;
                                border: none;
                                border-radius: 8px;
                                font-size: 16px;
                                cursor: pointer;
                                text-align: center;
                            "
                        >
                            🎯 Challenge All
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
    
    renderLevelManagement() {
        const customLevels = this.getCustomLevels();
        const defaultLevels = Object.values(this.game.levelManager?.levels || {});
        
        return `
            <div>
                <div style="margin-bottom: 30px;">
                    <button id="createLevelBtn" style="
                        background: #4CAF50;
                        color: white;
                        border: none;
                        padding: 12px 24px;
                        border-radius: 8px;
                        font-size: 16px;
                        cursor: pointer;
                    ">
                        ➕ Create New Level
                    </button>
                </div>
                
                <!-- Custom Levels -->
                <div style="
                    background: white;
                    padding: 30px;
                    border-radius: 12px;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                    margin-bottom: 30px;
                ">
                    <h3 style="color: #333; margin-bottom: 20px;">
                        Custom Levels
                        ${customLevels.length > 0 ? `<span style="color: #666; font-size: 16px;">(${customLevels.length})</span>` : ''}
                    </h3>
                    
                    ${customLevels.length === 0 ? `
                        <p style="color: #666; text-align: center; padding: 40px 0;">
                            No custom levels yet. Click "Create New Level" to get started!
                        </p>
                    ` : `
                        <div style="display: grid; gap: 15px;">
                            ${customLevels.map(level => `
                                <div style="
                                    display: flex;
                                    align-items: center;
                                    padding: 20px;
                                    background: #f5f5f5;
                                    border-radius: 8px;
                                    gap: 15px;
                                ">
                                    <div style="font-size: 36px;">${level.icon}</div>
                                    <div style="flex: 1;">
                                        <h4 style="margin: 0; color: #333;">${level.name}</h4>
                                        <p style="margin: 5px 0 0 0; color: #666; font-size: 14px;">
                                            ${level.letters.length} letters • ${this.formatDuration(level.duration)}
                                        </p>
                                    </div>
                                    <button class="edit-level-btn" data-level-id="${level.id}" style="
                                        background: #2196F3;
                                        color: white;
                                        border: none;
                                        padding: 8px 16px;
                                        border-radius: 6px;
                                        cursor: pointer;
                                        margin-right: 10px;
                                    ">✏️ Edit</button>
                                    <button class="delete-level-btn" data-level-id="${level.id}" style="
                                        background: #f44336;
                                        color: white;
                                        border: none;
                                        padding: 8px 16px;
                                        border-radius: 6px;
                                        cursor: pointer;
                                    ">🗑️ Delete</button>
                                </div>
                            `).join('')}
                        </div>
                    `}
                </div>
                
                <!-- Default Levels -->
                <div style="
                    background: white;
                    padding: 30px;
                    border-radius: 12px;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                ">
                    <h3 style="color: #333; margin-bottom: 20px;">Default Levels</h3>
                    <div style="display: grid; gap: 15px;">
                        ${defaultLevels.map(level => `
                            <div style="
                                display: flex;
                                align-items: center;
                                padding: 20px;
                                background: #f5f5f5;
                                border-radius: 8px;
                                gap: 15px;
                            ">
                                <div style="font-size: 36px;">${level.icon}</div>
                                <div style="flex: 1;">
                                    <h4 style="margin: 0; color: #333;">${level.name}</h4>
                                    <p style="margin: 5px 0 0 0; color: #666; font-size: 14px;">
                                        Level ${level.id} • ${level.duration}s
                                    </p>
                                </div>
                                <span style="
                                    background: #e0e0e0;
                                    color: #666;
                                    padding: 6px 12px;
                                    border-radius: 20px;
                                    font-size: 12px;
                                ">Default</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }
    
    renderLetterConfiguration() {
        return `
            <div style="
                background: white;
                padding: 30px;
                border-radius: 12px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            ">
                <h3 style="color: #333; margin-bottom: 20px;">Letter Template Editor</h3>
                <p style="color: #666; margin-bottom: 20px;">
                    Customize how letters are traced by modifying their stroke paths. 
                    You can edit existing letters or add templates for new characters including 
                    non-English alphabets, numbers, and special symbols.
                </p>
                
                <button id="openLetterEditorBtn" style="
                    background: #1976D2;
                    color: white;
                    border: none;
                    padding: 12px 24px;
                    border-radius: 8px;
                    font-size: 16px;
                    cursor: pointer;
                ">
                    ✏️ Open Letter Editor
                </button>
                
                <div style="
                    margin-top: 30px;
                    padding: 20px;
                    background: #FFF3E0;
                    border-radius: 8px;
                    border-left: 4px solid #FF9800;
                ">
                    <h4 style="color: #F57C00; margin-bottom: 10px;">📌 Editor Features</h4>
                    <ul style="color: #666; line-height: 1.8; margin: 0;">
                        <li>Visual stroke path editor with point-by-point control</li>
                        <li>Support for multiple strokes per letter</li>
                        <li>Guidelines matching the practice paper</li>
                        <li>Preview animation to test your templates</li>
                        <li>Support for any Unicode character</li>
                        <li>Import/export templates for sharing</li>
                    </ul>
                </div>
            </div>
        `;
    }
    
    renderChallenges() {
        const challenges = this.game.challengeManager?.challenges || [];
        
        return `
            <div>
                <div style="margin-bottom: 30px;">
                    <button id="createChallengeBtn" style="
                        background: #4CAF50;
                        color: white;
                        border: none;
                        padding: 12px 24px;
                        border-radius: 8px;
                        font-size: 16px;
                        cursor: pointer;
                    ">
                        ➕ Create New Challenge
                    </button>
                </div>
                
                <div style="
                    background: white;
                    padding: 30px;
                    border-radius: 12px;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                ">
                    <h3 style="color: #333; margin-bottom: 20px;">
                        Manage Challenges
                        ${challenges.length > 0 ? `<span style="color: #666; font-size: 16px;">(${challenges.length})</span>` : ''}
                    </h3>
                    
                    ${challenges.length === 0 ? `
                        <p style="color: #666; text-align: center; padding: 40px 0;">
                            No challenges created yet. Click "Create New Challenge" to get started!
                        </p>
                    ` : `
                        <div style="display: grid; gap: 15px;">
                            ${challenges.map(challenge => `
                                <div style="
                                    display: flex;
                                    align-items: center;
                                    padding: 20px;
                                    background: #f5f5f5;
                                    border-radius: 8px;
                                    gap: 15px;
                                ">
                                    <div style="flex: 1;">
                                        <h4 style="margin: 0; color: #333;">${challenge.name}</h4>
                                        <p style="margin: 5px 0 0 0; color: #666; font-size: 14px;">
                                            ${challenge.description || 'No description'}
                                        </p>
                                        <div style="margin-top: 10px; font-size: 14px; color: #888;">
                                            Rewards: ${this.formatChallengeRewards(challenge.rewards)}
                                        </div>
                                    </div>
                                    <button class="edit-challenge-btn" data-challenge-id="${challenge.id}" style="
                                        background: #2196F3;
                                        color: white;
                                        border: none;
                                        padding: 8px 16px;
                                        border-radius: 6px;
                                        cursor: pointer;
                                        margin-right: 10px;
                                    ">✏️ Edit</button>
                                    <button class="delete-challenge-btn" data-challenge-id="${challenge.id}" style="
                                        background: #f44336;
                                        color: white;
                                        border: none;
                                        padding: 8px 16px;
                                        border-radius: 6px;
                                        cursor: pointer;
                                    ">🗑️ Delete</button>
                                </div>
                            `).join('')}
                        </div>
                    `}
                </div>
                
                <div style="
                    background: #E3F2FD;
                    padding: 20px;
                    border-radius: 12px;
                    margin-top: 30px;
                    border-left: 4px solid #2196F3;
                ">
                    <h4 style="color: #1976D2; margin-bottom: 10px;">💡 About Challenges</h4>
                    <p style="color: #666; line-height: 1.6;">
                        Challenges bridge digital practice with traditional pen-and-paper learning. 
                        Students complete handwriting tasks offline and receive in-game rewards upon 
                        teacher verification. This helps develop proper writing skills while maintaining 
                        engagement through the game's reward systems.
                    </p>
                </div>
            </div>
        `;
    }
    
    formatChallengeRewards(rewards) {
        const items = [];
        if (rewards.xp > 0) items.push(`${rewards.xp} XP`);
        if (rewards.coins > 0) items.push(`${rewards.coins} coins`);
        if (rewards.skins?.length > 0) items.push(`${rewards.skins.length} skins`);
        if (rewards.pets?.length > 0) items.push(`${rewards.pets.length} pets`);
        return items.join(', ') || 'No rewards';
    }
    
    renderTimeManagement() {
        const allCharacters = this.game.dataManager?.getAllCharacters() || [];
        
        return `
            <div>
                <div style="
                    background: white;
                    padding: 30px;
                    border-radius: 12px;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                    margin-bottom: 30px;
                ">
                    <h3 style="color: #333; margin-bottom: 20px;">Time Management Overview</h3>
                    <p style="color: #666; margin-bottom: 20px;">
                        Track and manage how students spend their time in different areas of the game. 
                        Set limits for non-educational activities to ensure focused learning time.
                    </p>
                    
                    ${allCharacters.length === 0 ? `
                        <p style="color: #666; text-align: center; padding: 40px 0;">
                            No student profiles found. Students need to create characters to track their time.
                        </p>
                    ` : `
                        <div style="display: grid; gap: 20px; margin-top: 30px;">
                            ${allCharacters.map(char => this.renderStudentTimePanel(char)).join('')}
                        </div>
                    `}
                </div>
                
                <div style="
                    background: #E3F2FD;
                    padding: 20px;
                    border-radius: 12px;
                    border-left: 4px solid #2196F3;
                ">
                    <h4 style="color: #1976D2; margin-bottom: 10px;">💡 Time Management Features</h4>
                    <ul style="color: #666; line-height: 1.8; margin: 0;">
                        <li>Track time spent in menus, pet farm, store, and educational content</li>
                        <li>Set time limits for non-educational activities per student</li>
                        <li>Visual countdown timers show students their remaining time</li>
                        <li>Automatic lockout when time limits are reached</li>
                        <li>Time limits reset after completing levels or challenges</li>
                    </ul>
                </div>
            </div>
        `;
    }
    
    renderStudentTimePanel(character) {
        const timeData = character.statistics?.timeTracking || {};
        const timeLimits = character.timeLimits || {};
        
        // Get current session data from TimeTracker if available
        let currentSessionData = null;
        if (this.game.timeTracker) {
            const reportData = this.game.timeTracker.getReportData();
            if (reportData && reportData.currentSession) {
                currentSessionData = reportData.currentSession;
            }
        }
        const currentSession = currentSessionData || timeData.currentSession;
        
        // Calculate total times
        const lifetimeByActivity = timeData.lifetime?.byActivity || {};
        const totalTime = timeData.lifetime?.total || 0;
        
        return `
            <div class="student-time-panel" data-char-id="${character.id}" style="
                background: #f5f5f5;
                padding: 25px;
                border-radius: 10px;
                cursor: pointer;
                transition: all 0.3s;
                position: relative;
            ">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                    <h4 style="margin: 0; color: #333; font-size: 18px;">
                        ${character.identity.name}
                        ${currentSession ? '<span style="color: #4CAF50; font-size: 14px; margin-left: 10px;">● Online</span>' : ''}
                    </h4>
                    <span style="color: #666; font-size: 14px;">
                        Total: ${this.formatTime(totalTime)}
                    </span>
                </div>
                
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-bottom: 15px;">
                    <div>
                        <span style="color: #888; font-size: 12px;">Educational</span>
                        <div style="font-size: 16px; font-weight: bold; color: #4CAF50;">
                            ${this.formatTime((lifetimeByActivity.level || 0) + (lifetimeByActivity.challenge || 0))}
                        </div>
                    </div>
                    <div>
                        <span style="color: #888; font-size: 12px;">Non-Educational</span>
                        <div style="font-size: 16px; font-weight: bold; color: #FF9800;">
                            ${this.formatTime(
                                (lifetimeByActivity.menu || 0) + 
                                (lifetimeByActivity.petFarm || 0) + 
                                (lifetimeByActivity.store || 0) +
                                (lifetimeByActivity.characterMenu || 0) +
                                (lifetimeByActivity.settings || 0)
                            )}
                        </div>
                    </div>
                </div>
                
                <div style="background: white; padding: 10px; border-radius: 6px;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span style="color: #666; font-size: 14px;">
                            Time Limits: ${timeLimits.enabled ? 'Active' : 'Disabled'}
                        </span>
                        <button class="toggle-limits-btn" data-char-id="${character.id}" style="
                            background: ${timeLimits.enabled ? '#f44336' : '#4CAF50'};
                            color: white;
                            border: none;
                            padding: 6px 12px;
                            border-radius: 20px;
                            font-size: 12px;
                            cursor: pointer;
                        " onclick="event.stopPropagation();">
                            ${timeLimits.enabled ? 'Disable' : 'Enable'}
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
    
    formatTime(milliseconds) {
        const totalSeconds = Math.floor(milliseconds / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        
        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        } else if (minutes > 0) {
            return `${minutes}m ${seconds}s`;
        } else {
            return `${seconds}s`;
        }
    }
    
    renderStudentProgress() {
        const allCharacters = this.game.dataManager?.getAllCharacters() || [];
        
        if (allCharacters.length === 0) {
            return `
                <div style="
                    background: white;
                    padding: 30px;
                    border-radius: 12px;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                    text-align: center;
                ">
                    <p style="color: #666;">No student data available. Students need to create characters first.</p>
                </div>
            `;
        }
        
        // Show character selector if multiple students
        const characterSelector = allCharacters.length > 1 ? `
            <div style="margin-bottom: 20px;">
                <label style="color: #666; margin-right: 10px;">Select Student:</label>
                <select id="studentSelector" style="
                    padding: 8px 16px;
                    border: 1px solid #ddd;
                    border-radius: 6px;
                    font-size: 16px;
                    cursor: pointer;
                ">
                    ${allCharacters.map(char => `
                        <option value="${char.id}" ${char.id === this.selectedStudentId ? 'selected' : ''}>
                            ${char.identity.name}
                        </option>
                    `).join('')}
                </select>
            </div>
        ` : '';
        
        // Get selected character
        const character = this.selectedStudentId ? 
            this.game.dataManager.getCharacterById(this.selectedStudentId) : 
            allCharacters[0];
        
        if (!character) {
            return '<p>Error loading character data.</p>';
        }
        
        const letterPerformance = character.statistics?.letterPerformance || {};
        const challengePhotos = character.challengePhotos || [];
        
        return `
            <div>
                ${characterSelector}
                
                <!-- Overview Stats -->
                <div style="
                    background: white;
                    padding: 30px;
                    border-radius: 12px;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                    margin-bottom: 30px;
                ">
                    <h3 style="color: #333; margin-bottom: 20px;">Student: ${character.identity.name}</h3>
                    <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px;">
                        <div>
                            <h4 style="color: #666; font-size: 14px; margin-bottom: 5px;">Level</h4>
                            <p style="font-size: 24px; font-weight: bold; color: #1976D2;">${character.progression.level}</p>
                        </div>
                        <div>
                            <h4 style="color: #666; font-size: 14px; margin-bottom: 5px;">Total XP</h4>
                            <p style="font-size: 24px; font-weight: bold; color: #4CAF50;">${character.progression.xp}</p>
                        </div>
                        <div>
                            <h4 style="color: #666; font-size: 14px; margin-bottom: 5px;">Play Time</h4>
                            <p style="font-size: 24px; font-weight: bold; color: #FF9800;">
                                ${this.formatTime(character.statistics?.timeTracking?.lifetime?.total || 0)}
                            </p>
                        </div>
                        <div>
                            <h4 style="color: #666; font-size: 14px; margin-bottom: 5px;">Letters Mastered</h4>
                            <p style="font-size: 24px; font-weight: bold; color: #9C27B0;">
                                ${Object.values(letterPerformance).filter(p => (p.averageScore || 0) >= 90).length}
                            </p>
                        </div>
                    </div>
                </div>
                
                <!-- Letter Performance -->
                <div style="
                    background: white;
                    padding: 30px;
                    border-radius: 12px;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                    margin-bottom: 30px;
                ">
                    <h3 style="color: #333; margin-bottom: 20px;">📊 Letter Performance</h3>
                    ${this.renderLetterPerformanceGrid(letterPerformance)}
                </div>
                
                <!-- Recent Traces -->
                <div style="
                    background: white;
                    padding: 30px;
                    border-radius: 12px;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                    margin-bottom: 30px;
                ">
                    <h3 style="color: #333; margin-bottom: 20px;">✏️ Recent Letter Traces</h3>
                    ${this.renderRecentTraces(letterPerformance)}
                </div>
                
                <!-- Challenge Photos -->
                ${challengePhotos.length > 0 ? `
                    <div style="
                        background: white;
                        padding: 30px;
                        border-radius: 12px;
                        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                        margin-bottom: 30px;
                    ">
                        <h3 style="color: #333; margin-bottom: 20px;">📸 Challenge Work Photos</h3>
                        ${this.renderChallengePhotos(challengePhotos)}
                    </div>
                ` : ''}
                
                <!-- Export Button -->
                <div style="text-align: center;">
                    <button id="exportReportBtn" style="
                        background: #2196F3;
                        color: white;
                        border: none;
                        padding: 12px 24px;
                        border-radius: 8px;
                        font-size: 16px;
                        cursor: pointer;
                    ">
                        📄 Export Progress Report (PDF)
                    </button>
                </div>
            </div>
        `;
    }
    
    renderSettings() {
        return `
            <div style="max-width: 600px;">
                <div style="
                    background: white;
                    padding: 30px;
                    border-radius: 12px;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                    margin-bottom: 30px;
                ">
                    <h3 style="color: #333; margin-bottom: 20px;">Teacher PIN</h3>
                    <p style="color: #666; margin-bottom: 20px;">Change your access PIN</p>
                    
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; color: #666; margin-bottom: 5px;">Current PIN</label>
                        <input type="password" id="currentPin" style="
                            width: 200px;
                            padding: 10px;
                            border: 1px solid #ddd;
                            border-radius: 6px;
                            font-size: 16px;
                        " maxlength="4" />
                    </div>
                    
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; color: #666; margin-bottom: 5px;">New PIN</label>
                        <input type="password" id="newPin" style="
                            width: 200px;
                            padding: 10px;
                            border: 1px solid #ddd;
                            border-radius: 6px;
                            font-size: 16px;
                        " maxlength="4" />
                    </div>
                    
                    <div style="margin-bottom: 20px;">
                        <label style="display: block; color: #666; margin-bottom: 5px;">Confirm New PIN</label>
                        <input type="password" id="confirmPin" style="
                            width: 200px;
                            padding: 10px;
                            border: 1px solid #ddd;
                            border-radius: 6px;
                            font-size: 16px;
                        " maxlength="4" />
                    </div>
                    
                    <button id="changePinBtn" style="
                        background: #1976D2;
                        color: white;
                        border: none;
                        padding: 10px 20px;
                        border-radius: 6px;
                        cursor: pointer;
                    ">Change PIN</button>
                    
                    <p id="pinChangeMsg" style="
                        margin-top: 15px;
                        padding: 10px;
                        border-radius: 6px;
                        display: none;
                    "></p>
                </div>
                
                <div style="
                    background: white;
                    padding: 30px;
                    border-radius: 12px;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                ">
                    <h3 style="color: #333; margin-bottom: 20px;">Export/Import</h3>
                    <p style="color: #666; margin-bottom: 20px;">Backup or share your configurations</p>
                    
                    <button id="exportSettingsBtn" style="
                        background: #4CAF50;
                        color: white;
                        border: none;
                        padding: 10px 20px;
                        border-radius: 6px;
                        cursor: pointer;
                        margin-right: 10px;
                    ">📥 Export All Settings</button>
                    
                    <button id="importSettingsBtn" style="
                        background: #FF9800;
                        color: white;
                        border: none;
                        padding: 10px 20px;
                        border-radius: 6px;
                        cursor: pointer;
                    ">📤 Import Settings</button>
                    
                    <input type="file" id="importFileInput" accept=".json" style="display: none;" />
                </div>
            </div>
        `;
    }
    
    attachEventListeners() {
        // Navigation
        const navButtons = this.container.querySelectorAll('.teacher-nav-btn');
        navButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                this.currentSection = btn.dataset.section;
                this.render();
            });
            
            // Hover effect
            btn.addEventListener('mouseenter', () => {
                if (btn.dataset.section !== this.currentSection) {
                    btn.style.background = 'rgba(255,255,255,0.1)';
                }
            });
            
            btn.addEventListener('mouseleave', () => {
                if (btn.dataset.section !== this.currentSection) {
                    btn.style.background = 'transparent';
                }
            });
        });
        
        // Logout button
        document.getElementById('teacherLogoutBtn')?.addEventListener('click', () => {
            if (confirm('Are you sure you want to logout?')) {
                this.game.teacherAuth.logout();
                this.hide();
                this.game.menuManager?.showMenu('start');
            }
        });
        
        // Live Sessions event listeners
        if (this.currentSection === 'liveSessions') {
            this.attachLiveSessionsListeners();
        }
        
        // Classroom event listeners
        if (this.currentSection === 'classroom') {
            this.attachClassroomListeners();
        }
        
        // Back to game button
        document.getElementById('teacherBackBtn')?.addEventListener('click', () => {
            this.hide();
            this.game.menuManager?.showMenu('start');
        });
        
        // Quick action buttons
        const quickActions = this.container.querySelectorAll('.quick-action-btn');
        quickActions.forEach(btn => {
            btn.addEventListener('click', () => {
                const action = btn.dataset.action;
                if (action === 'create-level') {
                    this.currentSection = 'levels';
                    this.render();
                } else if (action === 'view-progress') {
                    this.currentSection = 'students';
                    this.render();
                }
            });
        });
        
        // Settings specific
        if (this.currentSection === 'settings') {
            // PIN change
            document.getElementById('changePinBtn')?.addEventListener('click', () => {
                this.handlePinChange();
            });
            
            // Only allow numbers in PIN inputs
            ['currentPin', 'newPin', 'confirmPin'].forEach(id => {
                const input = document.getElementById(id);
                if (input) {
                    input.addEventListener('input', (e) => {
                        e.target.value = e.target.value.replace(/[^0-9]/g, '');
                    });
                }
            });
            
            // Export/Import handlers
            document.getElementById('exportSettingsBtn')?.addEventListener('click', () => {
                this.exportSettings();
            });
            
            document.getElementById('importSettingsBtn')?.addEventListener('click', () => {
                document.getElementById('importFileInput').click();
            });
            
            document.getElementById('importFileInput')?.addEventListener('change', (e) => {
                this.importSettings(e.target.files[0]);
            });
        }
        
        // Level management specific
        if (this.currentSection === 'levels') {
            this.attachLevelEventListeners();
        }
        
        // Letter configuration specific
        if (this.currentSection === 'letters') {
            document.getElementById('openLetterEditorBtn')?.addEventListener('click', () => {
                if (!this.game.letterEditor) {
                    this.game.letterEditor = new LetterEditor(this.game);
                }
                this.game.letterEditor.show();
            });
        }
        
        // Challenges specific
        if (this.currentSection === 'challenges') {
            this.attachChallengeEventListeners();
        }
        
        // Time management specific
        if (this.currentSection === 'timeManagement') {
            this.attachTimeManagementEventListeners();
        }
        
        // Student progress specific
        if (this.currentSection === 'students') {
            this.attachStudentProgressEventListeners();
        }
    }
    
    handlePinChange() {
        const currentPin = document.getElementById('currentPin').value;
        const newPin = document.getElementById('newPin').value;
        const confirmPin = document.getElementById('confirmPin').value;
        const msg = document.getElementById('pinChangeMsg');
        
        // Validate
        if (!currentPin || !newPin || !confirmPin) {
            this.showMessage(msg, 'Please fill in all fields', 'error');
            return;
        }
        
        if (newPin !== confirmPin) {
            this.showMessage(msg, 'New PINs do not match', 'error');
            return;
        }
        
        if (newPin.length !== 4) {
            this.showMessage(msg, 'PIN must be 4 digits', 'error');
            return;
        }
        
        // Verify current PIN
        if (!this.game.teacherAuth.validatePin(currentPin)) {
            this.showMessage(msg, 'Current PIN is incorrect', 'error');
            return;
        }
        
        // Change PIN
        if (this.game.teacherAuth.changePin(newPin)) {
            this.showMessage(msg, 'PIN changed successfully!', 'success');
            // Clear inputs
            document.getElementById('currentPin').value = '';
            document.getElementById('newPin').value = '';
            document.getElementById('confirmPin').value = '';
        } else {
            this.showMessage(msg, 'Failed to change PIN', 'error');
        }
    }
    
    showMessage(element, text, type) {
        element.textContent = text;
        element.style.display = 'block';
        element.style.background = type === 'error' ? '#FFEBEE' : '#E8F5E9';
        element.style.color = type === 'error' ? '#C62828' : '#2E7D32';
        
        setTimeout(() => {
            element.style.display = 'none';
        }, 5000);
    }
    
    getCustomLevelCount() {
        return this.getCustomLevels().length;
    }
    
    getCustomLevels() {
        const stored = localStorage.getItem('alphahunters_custom_levels');
        return stored ? JSON.parse(stored) : [];
    }
    
    formatDuration(seconds) {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return minutes > 0 ? `${minutes}m ${secs}s` : `${secs}s`;
    }
    
    attachLevelEventListeners() {
        // Create level button
        document.getElementById('createLevelBtn')?.addEventListener('click', () => {
            if (!this.game.levelEditor) {
                this.game.levelEditor = new LevelEditor(this.game);
            }
            this.game.levelEditor.show();
        });
        
        // Edit level buttons
        this.container.querySelectorAll('.edit-level-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const levelId = btn.dataset.levelId;
                if (!this.game.levelEditor) {
                    this.game.levelEditor = new LevelEditor(this.game);
                }
                this.game.levelEditor.show(levelId);
            });
        });
        
        // Delete level buttons
        this.container.querySelectorAll('.delete-level-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const levelId = btn.dataset.levelId;
                if (confirm('Are you sure you want to delete this level?')) {
                    this.deleteLevel(levelId);
                }
            });
        });
    }
    
    deleteLevel(levelId) {
        const customLevels = this.getCustomLevels();
        const filtered = customLevels.filter(l => l.id !== levelId);
        localStorage.setItem('alphahunters_custom_levels', JSON.stringify(filtered));
        console.log('🗑️ Level deleted:', levelId);
        this.render();
    }
    
    attachChallengeEventListeners() {
        // Create challenge button
        document.getElementById('createChallengeBtn')?.addEventListener('click', () => {
            this.game.menuManager.showChallengeCreator();
        });
        
        // Edit challenge buttons
        this.container.querySelectorAll('.edit-challenge-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const challengeId = btn.dataset.challengeId;
                // For now, just show a message - could implement full edit later
                alert('Challenge editing will be available in a future update.');
            });
        });
        
        // Delete challenge buttons
        this.container.querySelectorAll('.delete-challenge-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const challengeId = btn.dataset.challengeId;
                if (confirm('Are you sure you want to delete this challenge?')) {
                    this.game.challengeManager.deleteChallenge(challengeId);
                    this.render();
                }
            });
        });
    }
    
    attachTimeManagementEventListeners() {
        // Student time panel click handlers
        this.container.querySelectorAll('.student-time-panel').forEach(panel => {
            panel.addEventListener('click', (e) => {
                // Don't trigger if clicking on buttons
                if (e.target.tagName === 'BUTTON') return;
                const charId = panel.dataset.charId;
                this.showDetailedTimeView(charId);
            });
            
            // Hover effect
            panel.addEventListener('mouseenter', () => {
                panel.style.transform = 'translateY(-2px)';
                panel.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
            });
            
            panel.addEventListener('mouseleave', () => {
                panel.style.transform = 'translateY(0)';
                panel.style.boxShadow = 'none';
            });
        });
        
        // Toggle time limits buttons
        this.container.querySelectorAll('.toggle-limits-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const charId = btn.dataset.charId;
                const character = this.game.dataManager.getCharacterById(charId);
                if (character) {
                    // Toggle time limits
                    character.timeLimits = character.timeLimits || { enabled: false, limits: {} };
                    character.timeLimits.enabled = !character.timeLimits.enabled;
                    
                    // Save the character
                    this.game.dataManager.saveCharacter(character);
                    
                    // Re-render
                    this.render();
                }
            });
        });
    }
    
    showDetailedTimeView(charId) {
        const character = this.game.dataManager.getCharacterById(charId);
        if (!character) return;
        
        let timeData = character.statistics?.timeTracking || {};
        const timeLimits = character.timeLimits || { enabled: false, limits: {} };
        const letterPerformance = character.statistics?.letterPerformance || {};
        
        // Get current session data and merge with saved data
        if (this.game.timeTracker) {
            const reportData = this.game.timeTracker.getReportData();
            if (reportData && reportData.currentSession) {
                // Merge current session activities with lifetime data
                const currentActivities = reportData.currentSession.activities || {};
                const mergedByActivity = { ...(timeData.lifetime?.byActivity || {}) };
                
                // Add current session times to lifetime totals for the report
                Object.entries(currentActivities).forEach(([activity, data]) => {
                    mergedByActivity[activity] = (mergedByActivity[activity] || 0) + data.time;
                });
                
                // Create merged time data for display
                timeData = {
                    ...timeData,
                    lifetime: {
                        total: (timeData.lifetime?.total || 0) + reportData.currentSession.sessionDuration,
                        byActivity: mergedByActivity
                    }
                };
            }
        }
        
        // Create modal overlay
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 6000;
        `;
        
        const content = document.createElement('div');
        content.style.cssText = `
            background: white;
            border-radius: 12px;
            padding: 30px;
            max-width: 800px;
            width: 90%;
            max-height: 90vh;
            overflow-y: auto;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        `;
        
        content.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px;">
                <h2 style="margin: 0; color: #333;">${character.identity.name} - Detailed Time Analysis</h2>
                <button id="closeDetailedView" style="
                    background: #f5f5f5;
                    border: 1px solid #ddd;
                    padding: 8px 16px;
                    border-radius: 6px;
                    cursor: pointer;
                ">✕ Close</button>
            </div>
            
            <!-- Time Breakdown -->
            <div style="margin-bottom: 30px;">
                <h3 style="color: #1976D2; margin-bottom: 20px;">⏱️ Time Breakdown by Activity</h3>
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px;">
                    ${this.renderActivityTime('Menu Navigation', timeData.lifetime?.byActivity?.menu || 0, 'menu')}
                    ${this.renderActivityTime('Pet Farm', timeData.lifetime?.byActivity?.petFarm || 0, 'petFarm')}
                    ${this.renderActivityTime('Store', timeData.lifetime?.byActivity?.store || 0, 'store')}
                    ${this.renderActivityTime('Playing Levels', timeData.lifetime?.byActivity?.level || 0, 'level', true)}
                    ${this.renderActivityTime('Challenges', timeData.lifetime?.byActivity?.challenge || 0, 'challenge', true)}
                    ${this.renderActivityTime('Character Menu', timeData.lifetime?.byActivity?.characterMenu || 0, 'characterMenu')}
                </div>
            </div>
            
            <!-- Time Limits Configuration -->
            <div style="
                background: #f5f5f5;
                padding: 25px;
                border-radius: 10px;
                margin-bottom: 30px;
            ">
                <h3 style="color: #333; margin-bottom: 20px;">⚙️ Time Limit Configuration</h3>
                <div style="margin-bottom: 20px;">
                    <label style="display: flex; align-items: center; gap: 10px; cursor: pointer;">
                        <input type="checkbox" id="enableTimeLimits" ${timeLimits.enabled ? 'checked' : ''} style="
                            width: 20px;
                            height: 20px;
                            cursor: pointer;
                        ">
                        <span style="color: #666; font-size: 16px;">Enable time limits for non-educational activities</span>
                    </label>
                </div>
                
                <div id="timeLimitInputs" style="${timeLimits.enabled ? '' : 'opacity: 0.5; pointer-events: none;'}">
                    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px;">
                        ${this.renderTimeLimitInput('Store', 'store', timeLimits.limits?.store || 300000)}
                        ${this.renderTimeLimitInput('Pet Farm', 'petFarm', timeLimits.limits?.petFarm || 600000)}
                        ${this.renderTimeLimitInput('Menus', 'menu', timeLimits.limits?.menu || 180000)}
                        ${this.renderTimeLimitInput('Total Non-Educational', 'nonEducationalTotal', timeLimits.limits?.nonEducationalTotal || 900000)}
                    </div>
                    <button id="saveTimeLimits" style="
                        background: #1976D2;
                        color: white;
                        border: none;
                        padding: 10px 20px;
                        border-radius: 6px;
                        cursor: pointer;
                        margin-top: 20px;
                    ">💾 Save Time Limits</button>
                </div>
            </div>
            
            <!-- Letter Performance Preview -->
            <div style="margin-bottom: 20px;">
                <h3 style="color: #4CAF50; margin-bottom: 20px;">📊 Letter Performance Summary</h3>
                <p style="color: #666;">
                    Traced ${Object.keys(letterPerformance).length} different letters
                    ${Object.keys(letterPerformance).length > 0 ? 
                        `• Average score: ${this.calculateAverageScore(letterPerformance).toFixed(1)}%` : ''}
                </p>
            </div>
            
            <div style="text-align: center; padding-top: 20px; border-top: 1px solid #eee;">
                <button id="viewFullProgress" style="
                    background: #4CAF50;
                    color: white;
                    border: none;
                    padding: 12px 24px;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 16px;
                ">📈 View Full Progress Report</button>
            </div>
        `;
        
        modal.appendChild(content);
        document.body.appendChild(modal);
        
        // Event listeners
        document.getElementById('closeDetailedView').addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });
        
        // Enable/disable time limits checkbox
        const enableCheckbox = document.getElementById('enableTimeLimits');
        const timeLimitInputs = document.getElementById('timeLimitInputs');
        
        enableCheckbox.addEventListener('change', () => {
            timeLimitInputs.style.opacity = enableCheckbox.checked ? '1' : '0.5';
            timeLimitInputs.style.pointerEvents = enableCheckbox.checked ? 'auto' : 'none';
        });
        
        // Save time limits
        document.getElementById('saveTimeLimits').addEventListener('click', () => {
            const newLimits = {
                enabled: enableCheckbox.checked,
                limits: {
                    store: parseInt(document.getElementById('limit-store').value) * 60000,
                    petFarm: parseInt(document.getElementById('limit-petFarm').value) * 60000,
                    menu: parseInt(document.getElementById('limit-menu').value) * 60000,
                    nonEducationalTotal: parseInt(document.getElementById('limit-nonEducationalTotal').value) * 60000
                }
            };
            
            character.timeLimits = newLimits;
            this.game.dataManager.saveCharacter(character);
            
            alert('Time limits saved successfully!');
            document.body.removeChild(modal);
            this.render();
        });
        
        // View full progress button
        document.getElementById('viewFullProgress').addEventListener('click', () => {
            document.body.removeChild(modal);
            this.currentSection = 'students';
            this.render();
        });
    }
    
    renderActivityTime(label, milliseconds, key, isEducational = false) {
        const minutes = Math.floor(milliseconds / 60000);
        const bgColor = isEducational ? '#E8F5E9' : '#FFF3E0';
        const iconColor = isEducational ? '#4CAF50' : '#FF9800';
        
        return `
            <div style="
                background: ${bgColor};
                padding: 15px;
                border-radius: 8px;
                border-left: 4px solid ${iconColor};
            ">
                <div style="color: #666; font-size: 14px; margin-bottom: 5px;">${label}</div>
                <div style="font-size: 20px; font-weight: bold; color: #333;">
                    ${minutes} minutes
                </div>
                <div style="color: #888; font-size: 12px; margin-top: 5px;">
                    ${this.formatTime(milliseconds)}
                </div>
            </div>
        `;
    }
    
    renderTimeLimitInput(label, key, currentValue) {
        const minutes = Math.floor(currentValue / 60000);
        
        return `
            <div>
                <label style="display: block; color: #666; margin-bottom: 5px; font-size: 14px;">
                    ${label} (minutes)
                </label>
                <input type="number" id="limit-${key}" value="${minutes}" min="0" max="999" style="
                    width: 100%;
                    padding: 8px;
                    border: 1px solid #ddd;
                    border-radius: 6px;
                    font-size: 16px;
                ">
            </div>
        `;
    }
    
    calculateAverageScore(letterPerformance) {
        let totalScore = 0;
        let totalAttempts = 0;
        
        Object.values(letterPerformance).forEach(perf => {
            if (perf.scoreHistory && perf.scoreHistory.length > 0) {
                perf.scoreHistory.forEach(score => {
                    totalScore += score;
                    totalAttempts++;
                });
            }
        });
        
        return totalAttempts > 0 ? (totalScore / totalAttempts) : 0;
    }
    
    renderLetterPerformanceGrid(letterPerformance) {
        const letters = Object.keys(letterPerformance);
        
        if (letters.length === 0) {
            return '<p style="color: #666; text-align: center;">No letter performance data yet.</p>';
        }
        
        return `
            <div style="
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
                gap: 15px;
            ">
                ${letters.map(letter => {
                    const perf = letterPerformance[letter];
                    const avgScore = perf.averageScore || 0;
                    const attempts = perf.attempts || 0;
                    const scoreColor = avgScore >= 90 ? '#4CAF50' : avgScore >= 70 ? '#FF9800' : '#f44336';
                    
                    return `
                        <div class="letter-perf-card" data-letter="${letter}" style="
                            background: #f5f5f5;
                            padding: 20px;
                            border-radius: 10px;
                            text-align: center;
                            cursor: pointer;
                            transition: all 0.3s;
                            position: relative;
                        ">
                            <div style="font-size: 36px; font-weight: bold; margin-bottom: 10px;">
                                ${letter}
                            </div>
                            <div style="
                                font-size: 24px;
                                font-weight: bold;
                                color: ${scoreColor};
                                margin-bottom: 5px;
                            ">
                                ${avgScore}%
                            </div>
                            <div style="font-size: 14px; color: #666;">
                                ${attempts} attempt${attempts !== 1 ? 's' : ''}
                            </div>
                            ${perf.scoreHistory && perf.scoreHistory.length > 0 ? `
                                <div style="
                                    margin-top: 10px;
                                    height: 40px;
                                    background: white;
                                    border-radius: 5px;
                                    padding: 5px;
                                ">
                                    ${this.renderMiniScoreGraph(perf.scoreHistory)}
                                </div>
                            ` : ''}
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }
    
    renderMiniScoreGraph(scoreHistory) {
        // Take last 10 scores
        const scores = scoreHistory.slice(-10);
        const maxScore = 100;
        const width = 100;
        const height = 30;
        
        const points = scores.map((score, index) => {
            const x = (index / (scores.length - 1)) * width;
            const y = height - (score / maxScore) * height;
            return `${x},${y}`;
        }).join(' ');
        
        return `
            <svg width="${width}%" height="${height}" style="display: block;">
                <polyline
                    points="${points}"
                    fill="none"
                    stroke="#2196F3"
                    stroke-width="2"
                />
                ${scores.map((score, index) => {
                    const x = (index / (scores.length - 1)) * 100;
                    const y = ((100 - score) / 100) * height;
                    return `<circle cx="${x}%" cy="${y}" r="3" fill="#2196F3" />`;
                }).join('')}
            </svg>
        `;
    }
    
    renderRecentTraces(letterPerformance) {
        const recentTraces = [];
        
        // Collect all recent traces
        Object.entries(letterPerformance).forEach(([letter, perf]) => {
            if (perf.traceHistory && perf.traceHistory.length > 0) {
                perf.traceHistory.slice(-5).forEach(trace => {
                    recentTraces.push({
                        letter,
                        ...trace
                    });
                });
            }
        });
        
        // Sort by timestamp (most recent first)
        recentTraces.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
        
        if (recentTraces.length === 0) {
            return '<p style="color: #666; text-align: center;">No trace images captured yet.</p>';
        }
        
        return `
            <div style="
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
                gap: 15px;
            ">
                ${recentTraces.slice(0, 20).map(trace => `
                    <div style="
                        background: #f5f5f5;
                        padding: 10px;
                        border-radius: 8px;
                        text-align: center;
                    ">
                        <img src="${trace.imageData}" style="
                            width: 100%;
                            height: 120px;
                            object-fit: contain;
                            border-radius: 5px;
                            background: white;
                            margin-bottom: 10px;
                        " />
                        <div style="font-size: 20px; font-weight: bold; margin-bottom: 5px;">
                            ${trace.letter}
                        </div>
                        <div style="
                            font-size: 18px;
                            font-weight: bold;
                            color: ${trace.score >= 90 ? '#4CAF50' : trace.score >= 70 ? '#FF9800' : '#f44336'};
                        ">
                            ${trace.score}%
                        </div>
                        <div style="font-size: 12px; color: #666; margin-top: 5px;">
                            ${new Date(trace.timestamp).toLocaleDateString()}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    renderChallengePhotos(challengePhotos) {
        if (challengePhotos.length === 0) {
            return '<p style="color: #666; text-align: center;">No challenge photos yet.</p>';
        }
        
        // Sort by timestamp (most recent first)
        const sortedPhotos = [...challengePhotos].sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
        
        return `
            <div style="
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
                gap: 20px;
            ">
                ${sortedPhotos.slice(0, 12).map(photo => `
                    <div style="
                        background: #f5f5f5;
                        padding: 15px;
                        border-radius: 8px;
                    ">
                        <img src="${photo.photoData}" style="
                            width: 100%;
                            height: 150px;
                            object-fit: cover;
                            border-radius: 5px;
                            margin-bottom: 10px;
                            cursor: pointer;
                        " onclick="window.open('${photo.photoData}', '_blank')" />
                        <div style="font-weight: bold; margin-bottom: 5px;">
                            ${photo.challengeName || 'Challenge'}
                        </div>
                        <div style="font-size: 14px; color: #666;">
                            ${new Date(photo.timestamp).toLocaleDateString()}
                        </div>
                        ${photo.verified ? `
                            <div style="
                                color: #4CAF50;
                                font-size: 14px;
                                margin-top: 5px;
                            ">
                                ✓ Verified
                            </div>
                        ` : ''}
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    // Enhanced methods for detailed progress view
    renderDetailedLetterView(letter, performance) {
        const avgScore = performance.averageScore || 0;
        const scoreColor = avgScore >= 90 ? '#4CAF50' : avgScore >= 70 ? '#FF9800' : '#f44336';
        const recentTraces = performance.traceHistory?.slice(-10) || [];
        const scoreHistory = performance.scoreHistory || [];
        
        return `
            <div style="position: relative;">
                <button onclick="document.getElementById('letterDetailModal').style.display='none'" style="
                    position: absolute;
                    top: -20px;
                    right: -20px;
                    background: #f44336;
                    color: white;
                    border: none;
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    font-size: 20px;
                    cursor: pointer;
                ">×</button>
                
                <h2 style="text-align: center; margin-bottom: 30px;">
                    Letter ${letter} - Detailed Progress
                </h2>
                
                <!-- Summary Stats -->
                <div style="
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 20px;
                    margin-bottom: 40px;
                    text-align: center;
                ">
                    <div>
                        <div style="font-size: 48px; font-weight: bold; color: ${scoreColor};">
                            ${avgScore}%
                        </div>
                        <div style="color: #666;">Average Score</div>
                    </div>
                    <div>
                        <div style="font-size: 48px; font-weight: bold; color: #2196F3;">
                            ${performance.attempts || 0}
                        </div>
                        <div style="color: #666;">Total Attempts</div>
                    </div>
                    <div>
                        <div style="font-size: 48px; font-weight: bold; color: #9C27B0;">
                            ${Math.max(...(scoreHistory || [0]))}%
                        </div>
                        <div style="color: #666;">Best Score</div>
                    </div>
                    <div>
                        <div style="font-size: 48px; font-weight: bold; color: #FF5722;">
                            ${this.calculateStreak(scoreHistory)}
                        </div>
                        <div style="color: #666;">Current Streak</div>
                    </div>
                </div>
                
                <!-- Score Progress Chart -->
                <div style="
                    background: #f8f9fa;
                    padding: 30px;
                    border-radius: 12px;
                    margin-bottom: 30px;
                ">
                    <h3 style="margin-bottom: 20px;">Score Progress Over Time</h3>
                    ${this.renderFullScoreChart(scoreHistory, scoreColor)}
                </div>
                
                <!-- Recent Traces -->
                ${recentTraces.length > 0 ? `
                    <div style="margin-bottom: 30px;">
                        <h3 style="margin-bottom: 20px;">Recent Trace Attempts</h3>
                        <div style="
                            display: grid;
                            grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
                            gap: 15px;
                        ">
                            ${recentTraces.map((trace, index) => `
                                <div style="
                                    background: white;
                                    border: 2px solid #e0e0e0;
                                    padding: 10px;
                                    border-radius: 8px;
                                    text-align: center;
                                ">
                                    <img src="${trace.imageData}" style="
                                        width: 100%;
                                        height: 120px;
                                        object-fit: contain;
                                        background: #f8f9fa;
                                        border-radius: 5px;
                                        margin-bottom: 10px;
                                    " />
                                    <div style="
                                        font-size: 24px;
                                        font-weight: bold;
                                        color: ${trace.score >= 90 ? '#4CAF50' : trace.score >= 70 ? '#FF9800' : '#f44336'};
                                    ">
                                        ${trace.score}%
                                    </div>
                                    <div style="font-size: 12px; color: #666;">
                                        Attempt #${scoreHistory.length - recentTraces.length + index + 1}
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
                
                <!-- Performance Analysis -->
                <div style="
                    background: #E3F2FD;
                    padding: 20px;
                    border-radius: 12px;
                    border-left: 4px solid #2196F3;
                ">
                    <h4 style="color: #1976D2; margin-bottom: 10px;">Performance Analysis</h4>
                    ${this.generatePerformanceAnalysis(letter, performance)}
                </div>
            </div>
        `;
    }
    
    renderFullScoreChart(scoreHistory, color) {
        if (!scoreHistory || scoreHistory.length === 0) {
            return '<p style="text-align: center; color: #666;">No score history available</p>';
        }
        
        const width = 700;
        const height = 250;
        const padding = 40;
        const graphWidth = width - 2 * padding;
        const graphHeight = height - 2 * padding;
        
        // Calculate points
        const points = scoreHistory.map((score, index) => {
            const x = padding + (index / (scoreHistory.length - 1)) * graphWidth;
            const y = height - padding - (score / 100) * graphHeight;
            return { x, y, score };
        });
        
        // Create path
        const pathData = points.map((point, index) => 
            `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
        ).join(' ');
        
        // Calculate average line
        const avgScore = scoreHistory.reduce((a, b) => a + b, 0) / scoreHistory.length;
        const avgY = height - padding - (avgScore / 100) * graphHeight;
        
        return `
            <svg viewBox="0 0 ${width} ${height}" style="width: 100%; max-width: ${width}px;">
                <!-- Grid lines -->
                ${[0, 25, 50, 75, 100].map(score => {
                    const y = height - padding - (score / 100) * graphHeight;
                    return `
                        <line x1="${padding}" y1="${y}" x2="${width - padding}" y2="${y}" 
                              stroke="#e0e0e0" stroke-width="1" stroke-dasharray="3,3"/>
                        <text x="${padding - 10}" y="${y + 5}" text-anchor="end" 
                              font-size="12" fill="#666">${score}%</text>
                    `;
                }).join('')}
                
                <!-- Average line -->
                <line x1="${padding}" y1="${avgY}" x2="${width - padding}" y2="${avgY}" 
                      stroke="${color}" stroke-width="2" stroke-dasharray="5,5" opacity="0.5"/>
                <text x="${width - padding + 5}" y="${avgY + 5}" 
                      font-size="12" fill="${color}" font-weight="bold">Avg: ${Math.round(avgScore)}%</text>
                
                <!-- Score line -->
                <path d="${pathData}" fill="none" stroke="${color}" stroke-width="3" />
                
                <!-- Score points -->
                ${points.map((point, index) => `
                    <g>
                        <circle cx="${point.x}" cy="${point.y}" r="5" 
                                fill="white" stroke="${color}" stroke-width="3">
                            <title>Attempt ${index + 1}: ${point.score}%</title>
                        </circle>
                        ${index === points.length - 1 ? `
                            <text x="${point.x}" y="${point.y - 10}" 
                                  text-anchor="middle" font-size="14" 
                                  font-weight="bold" fill="${color}">
                                ${point.score}%
                            </text>
                        ` : ''}
                    </g>
                `).join('')}
                
                <!-- X-axis labels -->
                <text x="${padding}" y="${height - 10}" font-size="12" fill="#666">First</text>
                <text x="${width - padding}" y="${height - 10}" text-anchor="end" 
                      font-size="12" fill="#666">Latest</text>
            </svg>
        `;
    }
    
    calculateStreak(scoreHistory) {
        if (!scoreHistory || scoreHistory.length === 0) return 0;
        
        let streak = 0;
        for (let i = scoreHistory.length - 1; i >= 0; i--) {
            if (scoreHistory[i] >= 90) {
                streak++;
            } else {
                break;
            }
        }
        return streak;
    }
    
    generatePerformanceAnalysis(letter, performance) {
        const avgScore = performance.averageScore || 0;
        const attempts = performance.attempts || 0;
        const scoreHistory = performance.scoreHistory || [];
        const recentScores = scoreHistory.slice(-5);
        const trend = this.calculateTrend(recentScores);
        
        let analysis = '<ul style="margin: 0; padding-left: 20px; line-height: 1.8;">';
        
        // Performance level
        if (avgScore >= 90) {
            analysis += '<li><strong>Mastery Level:</strong> Excellent! Student has mastered this letter.</li>';
        } else if (avgScore >= 70) {
            analysis += '<li><strong>Progress Level:</strong> Good progress. Continue practicing for mastery.</li>';
        } else {
            analysis += '<li><strong>Learning Level:</strong> Needs more practice and guidance.</li>';
        }
        
        // Trend analysis
        if (trend === 'up') {
            analysis += '<li><strong>Trend:</strong> Improving! Recent scores show upward progress.</li>';
        } else if (trend === 'down') {
            analysis += '<li><strong>Trend:</strong> Declining. May need additional support.</li>';
        } else {
            analysis += '<li><strong>Trend:</strong> Stable performance.</li>';
        }
        
        // Consistency
        if (scoreHistory.length > 3) {
            const variance = this.calculateVariance(recentScores);
            if (variance < 10) {
                analysis += '<li><strong>Consistency:</strong> Very consistent performance.</li>';
            } else if (variance < 20) {
                analysis += '<li><strong>Consistency:</strong> Moderately consistent.</li>';
            } else {
                analysis += '<li><strong>Consistency:</strong> Inconsistent. May indicate varying attention or understanding.</li>';
            }
        }
        
        // Recommendations
        if (avgScore < 70) {
            analysis += '<li><strong>Recommendation:</strong> Consider one-on-one practice or alternative teaching methods.</li>';
        } else if (avgScore < 90) {
            analysis += '<li><strong>Recommendation:</strong> Continue regular practice to achieve mastery.</li>';
        } else {
            analysis += '<li><strong>Recommendation:</strong> Challenge with more complex words containing this letter.</li>';
        }
        
        analysis += '</ul>';
        return analysis;
    }
    
    calculateVariance(scores) {
        if (scores.length === 0) return 0;
        const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
        const variance = scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / scores.length;
        return Math.sqrt(variance);
    }
    
    calculateTrend(scores) {
        if (!scores || scores.length < 2) return 'stable';
        
        // Simple linear regression
        const n = scores.length;
        const indices = Array.from({ length: n }, (_, i) => i);
        
        const sumX = indices.reduce((a, b) => a + b, 0);
        const sumY = scores.reduce((a, b) => a + b, 0);
        const sumXY = indices.reduce((sum, x, i) => sum + x * scores[i], 0);
        const sumX2 = indices.reduce((sum, x) => sum + x * x, 0);
        
        const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
        
        if (slope > 2) return 'up';
        if (slope < -2) return 'down';
        return 'stable';
    }
    
    attachStudentProgressEventListeners() {
        // Student selector
        const studentSelector = document.getElementById('studentSelector');
        if (studentSelector) {
            studentSelector.addEventListener('change', (e) => {
                this.selectedStudentId = e.target.value;
                this.render();
            });
        }
        
        // Letter performance cards - click for details
        this.container.querySelectorAll('.letter-perf-card').forEach(card => {
            card.addEventListener('click', () => {
                const letter = card.dataset.letter;
                this.showLetterDetails(letter);
            });
            
            // Hover effect
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-3px)';
                card.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0)';
                card.style.boxShadow = 'none';
            });
        });
        
        // Export report button
        const exportBtn = document.getElementById('exportReportBtn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                this.exportProgressReport();
            });
        }
    }
    
    showLetterDetails(letter) {
        const character = this.selectedStudentId ? 
            this.game.dataManager.getCharacterById(this.selectedStudentId) : 
            this.game.dataManager.getAllCharacters()[0];
            
        if (!character) return;
        
        const letterPerf = character.statistics?.letterPerformance?.[letter];
        if (!letterPerf) return;
        
        // Use the existing modal in the DOM
        const modal = document.getElementById('letterDetailModal');
        const content = document.getElementById('letterDetailContent');
        
        if (modal && content) {
            content.innerHTML = this.renderDetailedLetterView(letter, letterPerf);
            modal.style.display = 'block';
            
            // Add click outside to close
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.style.display = 'none';
                }
            });
        }
    }
    
    exportProgressReport() {
        const character = this.selectedStudentId ? 
            this.game.dataManager.getCharacterById(this.selectedStudentId) : 
            this.game.dataManager.getAllCharacters()[0];
            
        if (!character) {
            alert('No student data to export.');
            return;
        }
        
        // Check if jsPDF is available
        console.log('Checking for jsPDF...', typeof window.jspdf);
        if (typeof window.jspdf === 'undefined') {
            console.error('jsPDF library not loaded, falling back to HTML report');
            console.log('Window object:', window);
            this.exportProgressReportHTML(character);
            return;
        }
        
        // Show loading indicator
        const loadingDiv = document.createElement('div');
        loadingDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
            z-index: 10000;
            text-align: center;
        `;
        loadingDiv.innerHTML = `
            <h3>Generating PDF Report...</h3>
            <div style="margin-top: 20px;">
                <div style="width: 50px; height: 50px; border: 5px solid #f3f3f3; border-top: 5px solid #1976D2; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto;"></div>
            </div>
            <style>
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            </style>
        `;
        document.body.appendChild(loadingDiv);
        
        try {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            
            const letterPerformance = character.statistics?.letterPerformance || {};
            let timeData = character.statistics?.timeTracking || {};
            
            // Get current session data and merge with saved data
            if (this.game.timeTracker) {
                const reportData = this.game.timeTracker.getReportData();
                if (reportData && reportData.currentSession) {
                    // Merge current session activities with lifetime data
                    const currentActivities = reportData.currentSession.activities || {};
                    const mergedByActivity = { ...(timeData.lifetime?.byActivity || {}) };
                    
                    // Add current session times to lifetime totals for the report
                    Object.entries(currentActivities).forEach(([activity, data]) => {
                        mergedByActivity[activity] = (mergedByActivity[activity] || 0) + data.time;
                    });
                    
                    // Create merged time data for report
                    timeData = {
                        ...timeData,
                        lifetime: {
                            total: (timeData.lifetime?.total || 0) + reportData.currentSession.sessionDuration,
                            byActivity: mergedByActivity
                        }
                    };
                }
            }
            
            // Title Page
            doc.setFontSize(24);
            doc.setTextColor(25, 118, 210); // Blue
            doc.text('Student Progress Report', 105, 30, { align: 'center' });
            
            doc.setFontSize(18);
            doc.setTextColor(0, 0, 0);
            doc.text(character.identity.name, 105, 45, { align: 'center' });
            
            doc.setFontSize(12);
            doc.setTextColor(100, 100, 100);
            doc.text(`Generated: ${new Date().toLocaleDateString()}`, 105, 55, { align: 'center' });
            doc.text(`Teacher: ${localStorage.getItem('alphahunters_teacher_name') || 'Teacher'}`, 105, 65, { align: 'center' });
            
            // Overview Section
            let yPos = 85;
            doc.setFontSize(16);
            doc.setTextColor(25, 118, 210);
            doc.text('Overview', 20, yPos);
            yPos += 10;
            
            doc.setFontSize(12);
            doc.setTextColor(0, 0, 0);
            
            // Stats boxes
            const stats = [
                { label: 'Level', value: character.progression.level },
                { label: 'Total XP', value: character.progression.xp },
                { label: 'Play Time', value: this.formatTime(timeData.lifetime?.total || 0) },
                { label: 'Letters Mastered', value: Object.values(letterPerformance).filter(p => (p.averageScore || 0) >= 90).length }
            ];
            
            let xPos = 20;
            stats.forEach(stat => {
                // Draw box
                doc.setDrawColor(200, 200, 200);
                doc.setFillColor(245, 245, 245);
                doc.rect(xPos, yPos, 40, 25, 'FD');
                
                // Add text
                doc.setFontSize(16);
                doc.setTextColor(25, 118, 210);
                doc.text(String(stat.value), xPos + 20, yPos + 12, { align: 'center' });
                
                doc.setFontSize(10);
                doc.setTextColor(100, 100, 100);
                doc.text(stat.label, xPos + 20, yPos + 20, { align: 'center' });
                
                xPos += 45;
            });
            
            yPos += 35;
            
            // Letter Performance Section
            doc.setFontSize(16);
            doc.setTextColor(25, 118, 210);
            doc.text('Letter Performance', 20, yPos);
            yPos += 10;
            
            // Letter grid
            const letters = Object.keys(letterPerformance).sort();
            let letterX = 20;
            let letterY = yPos;
            let lettersPerRow = 0;
            
            doc.setFontSize(10);
            letters.forEach(letter => {
                const perf = letterPerformance[letter];
                const avgScore = perf.averageScore || 0;
                
                // Determine color based on score
                if (avgScore >= 90) {
                    doc.setDrawColor(76, 175, 80); // Green
                    doc.setFillColor(232, 245, 233);
                } else if (avgScore >= 70) {
                    doc.setDrawColor(255, 152, 0); // Orange
                    doc.setFillColor(255, 243, 224);
                } else {
                    doc.setDrawColor(244, 67, 54); // Red
                    doc.setFillColor(255, 235, 238);
                }
                
                // Draw letter box
                doc.rect(letterX, letterY, 20, 25, 'FD');
                
                // Letter
                doc.setFontSize(14);
                doc.setTextColor(0, 0, 0);
                doc.text(letter, letterX + 10, letterY + 10, { align: 'center' });
                
                // Score
                doc.setFontSize(10);
                if (avgScore >= 90) doc.setTextColor(76, 175, 80);
                else if (avgScore >= 70) doc.setTextColor(255, 152, 0);
                else doc.setTextColor(244, 67, 54);
                doc.text(`${avgScore}%`, letterX + 10, letterY + 17, { align: 'center' });
                
                // Attempts
                doc.setFontSize(8);
                doc.setTextColor(100, 100, 100);
                doc.text(`${perf.attempts || 0}x`, letterX + 10, letterY + 22, { align: 'center' });
                
                letterX += 22;
                lettersPerRow++;
                
                if (lettersPerRow >= 8) {
                    letterX = 20;
                    letterY += 27;
                    lettersPerRow = 0;
                }
            });
            
            // Add new page for time usage and recommendations
            doc.addPage();
            yPos = 20;
            
            // Time Usage Section
            doc.setFontSize(16);
            doc.setTextColor(25, 118, 210);
            doc.text('Time Usage Breakdown', 20, yPos);
            yPos += 15;
            
            // Time table
            doc.setFontSize(11);
            doc.setTextColor(0, 0, 0);
            
            const activities = timeData.lifetime?.byActivity || {};
            const total = timeData.lifetime?.total || 1;
            
            const timeRows = [
                ['Educational (Levels)', this.formatTime(activities.level || 0), `${Math.round(((activities.level || 0) / total) * 100)}%`],
                ['Educational (Challenges)', this.formatTime(activities.challenge || 0), `${Math.round(((activities.challenge || 0) / total) * 100)}%`],
                ['Pet Farm', this.formatTime(activities.petFarm || 0), `${Math.round(((activities.petFarm || 0) / total) * 100)}%`],
                ['Store', this.formatTime(activities.store || 0), `${Math.round(((activities.store || 0) / total) * 100)}%`],
                ['Menus', this.formatTime((activities.menu || 0) + (activities.characterMenu || 0) + (activities.settings || 0)), `${Math.round((((activities.menu || 0) + (activities.characterMenu || 0) + (activities.settings || 0)) / total) * 100)}%`]
            ];
            
            // Draw table headers
            doc.setFillColor(240, 240, 240);
            doc.rect(20, yPos, 60, 8, 'F');
            doc.rect(80, yPos, 60, 8, 'F');
            doc.rect(140, yPos, 40, 8, 'F');
            
            doc.setFontSize(10);
            doc.setTextColor(0, 0, 0);
            doc.text('Activity', 50, yPos + 5.5, { align: 'center' });
            doc.text('Time Spent', 110, yPos + 5.5, { align: 'center' });
            doc.text('Percentage', 160, yPos + 5.5, { align: 'center' });
            
            yPos += 8;
            
            // Draw table rows
            timeRows.forEach(row => {
                doc.setDrawColor(200, 200, 200);
                doc.line(20, yPos, 180, yPos);
                
                doc.text(row[0], 22, yPos + 5);
                doc.text(row[1], 110, yPos + 5, { align: 'center' });
                doc.text(row[2], 160, yPos + 5, { align: 'center' });
                
                yPos += 8;
            });
            doc.line(20, yPos, 180, yPos);
            
            // End of report
            
            // Add trace images organized by letter
            const lettersWithTraces = Object.entries(letterPerformance)
                .filter(([letter, perf]) => perf.traceHistory && perf.traceHistory.length > 0)
                .sort(([a], [b]) => a.localeCompare(b));
            
            if (lettersWithTraces.length > 0) {
                doc.addPage();
                doc.setFontSize(16);
                doc.setTextColor(25, 118, 210);
                doc.text('Letter Trace History', 20, 20);
                
                let yPos = 35;
                
                // Process each letter
                lettersWithTraces.forEach(([letter, perf]) => {
                    // Check if we need a new page
                    if (yPos > 220) {
                        doc.addPage();
                        yPos = 20;
                    }
                    
                    // Letter header
                    doc.setFontSize(14);
                    doc.setTextColor(0, 0, 0);
                    doc.text(`Letter ${letter}`, 20, yPos);
                    
                    // Average score for this letter
                    const avgScore = perf.averageScore || 0;
                    doc.setFontSize(10);
                    if (avgScore >= 90) doc.setTextColor(76, 175, 80);
                    else if (avgScore >= 70) doc.setTextColor(255, 152, 0);
                    else doc.setTextColor(244, 67, 54);
                    doc.text(`Average: ${avgScore}%`, 50, yPos);
                    
                    yPos += 10;
                    
                    // Get up to 4 most recent traces for this letter
                    const traces = perf.traceHistory.slice(-4);
                    let xPos = 20;
                    
                    traces.forEach((trace, index) => {
                        try {
                            // Add trace image
                            doc.addImage(trace.imageData, 'PNG', xPos, yPos, 30, 30);
                            
                            // Add score below image
                            doc.setFontSize(9);
                            if (trace.score >= 90) doc.setTextColor(76, 175, 80);
                            else if (trace.score >= 70) doc.setTextColor(255, 152, 0);
                            else doc.setTextColor(244, 67, 54);
                            doc.text(`${trace.score}%`, xPos + 15, yPos + 33, { align: 'center' });
                            
                            // Add attempt number
                            doc.setFontSize(8);
                            doc.setTextColor(100, 100, 100);
                            const attemptNum = perf.traceHistory.length - traces.length + index + 1;
                            doc.text(`#${attemptNum}`, xPos + 15, yPos + 37, { align: 'center' });
                            
                            xPos += 35;
                        } catch (err) {
                            console.error(`Error adding trace image for letter ${letter}:`, err);
                        }
                    });
                    
                    yPos += 45;
                });
            }
            
            // Save the PDF
            const filename = `${character.identity.name.replace(/[^a-z0-9]/gi, '_')}_Progress_Report_${new Date().toISOString().split('T')[0]}.pdf`;
            doc.save(filename);
            
            // Remove loading indicator
            loadingDiv.remove();
            
            // Show success message
            const successDiv = document.createElement('div');
            successDiv.style.cssText = loadingDiv.style.cssText;
            successDiv.innerHTML = `
                <h3 style="color: #4CAF50;">✓ PDF Report Generated!</h3>
                <p>The report has been downloaded as:<br><strong>${filename}</strong></p>
                <button onclick="this.parentElement.remove()" style="
                    margin-top: 20px;
                    background: #1976D2;
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 5px;
                    cursor: pointer;
                    font-size: 16px;
                ">OK</button>
            `;
            document.body.appendChild(successDiv);
            
        } catch (error) {
            console.error('Error generating PDF:', error);
            console.error('Error stack:', error.stack);
            
            // Remove loading indicator if it exists
            if (loadingDiv && loadingDiv.parentNode) {
                loadingDiv.remove();
            }
            
            alert(`Error generating PDF report: ${error.message}\n\nFalling back to HTML report.`);
            
            // Fall back to HTML report
            this.exportProgressReportHTML(character);
        }
    }
    
    exportProgressReportHTML(character) {
        // Original HTML report code as fallback
        const reportWindow = window.open('', '_blank');
        const letterPerformance = character.statistics?.letterPerformance || {};
        let timeData = character.statistics?.timeTracking || {};
        const challengePhotos = character.challengePhotos || [];
        
        // Get current session data and merge with saved data
        if (this.game.timeTracker) {
            const reportData = this.game.timeTracker.getReportData();
            if (reportData && reportData.currentSession) {
                // Merge current session activities with lifetime data
                const currentActivities = reportData.currentSession.activities || {};
                const mergedByActivity = { ...(timeData.lifetime?.byActivity || {}) };
                
                // Add current session times to lifetime totals for the report
                Object.entries(currentActivities).forEach(([activity, data]) => {
                    mergedByActivity[activity] = (mergedByActivity[activity] || 0) + data.time;
                });
                
                // Create merged time data for report
                timeData = {
                    ...timeData,
                    lifetime: {
                        total: (timeData.lifetime?.total || 0) + reportData.currentSession.sessionDuration,
                        byActivity: mergedByActivity
                    }
                };
            }
        }
        
        // Generate report HTML
        const reportHTML = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>${character.identity.name} - Progress Report</title>
                <style>
                    @media print {
                        body { margin: 0; }
                        .no-print { display: none !important; }
                        .page-break { page-break-after: always; }
                        @page { margin: 0.5in; }
                    }
                    body {
                        font-family: Arial, sans-serif;
                        line-height: 1.6;
                        color: #333;
                        max-width: 800px;
                        margin: 0 auto;
                        padding: 20px;
                    }
                    h1, h2, h3 { color: #1976D2; }
                    h1 { text-align: center; margin-bottom: 10px; }
                    .subtitle { text-align: center; color: #666; margin-bottom: 30px; }
                    .section { margin-bottom: 40px; }
                    .stats-grid {
                        display: grid;
                        grid-template-columns: repeat(4, 1fr);
                        gap: 20px;
                        margin: 20px 0;
                    }
                    .stat-box {
                        background: #f5f5f5;
                        padding: 20px;
                        border-radius: 8px;
                        text-align: center;
                    }
                    .stat-value {
                        font-size: 32px;
                        font-weight: bold;
                        color: #1976D2;
                    }
                    .stat-label {
                        color: #666;
                        font-size: 14px;
                    }
                    .letter-grid {
                        display: grid;
                        grid-template-columns: repeat(8, 1fr);
                        gap: 10px;
                        margin: 20px 0;
                    }
                    .letter-card {
                        background: #f5f5f5;
                        padding: 15px;
                        border-radius: 8px;
                        text-align: center;
                        border: 2px solid transparent;
                    }
                    .letter-card.mastered { border-color: #4CAF50; }
                    .letter-card.progress { border-color: #FF9800; }
                    .letter-card.needs-work { border-color: #f44336; }
                    .letter { font-size: 24px; font-weight: bold; }
                    .score { font-size: 18px; margin: 5px 0; }
                    .attempts { font-size: 12px; color: #666; }
                    .traces-grid {
                        display: grid;
                        grid-template-columns: repeat(5, 1fr);
                        gap: 15px;
                        margin: 20px 0;
                    }
                    .trace-box {
                        text-align: center;
                    }
                    .trace-box img {
                        width: 100%;
                        height: 120px;
                        object-fit: contain;
                        background: white;
                        border: 1px solid #ddd;
                        border-radius: 5px;
                    }
                    table {
                        width: 100%;
                        border-collapse: collapse;
                        margin: 20px 0;
                    }
                    th, td {
                        padding: 10px;
                        text-align: left;
                        border-bottom: 1px solid #ddd;
                    }
                    th { background: #f5f5f5; }
                    .print-button {
                        background: #1976D2;
                        color: white;
                        border: none;
                        padding: 15px 30px;
                        border-radius: 5px;
                        cursor: pointer;
                        font-size: 18px;
                        font-weight: bold;
                        margin: 10px auto;
                        display: inline-block;
                        transition: background 0.3s ease;
                    }
                    .print-button:hover {
                        background: #1565C0;
                    }
                    @media print {
                        .print-button { display: none; }
                    }
                </style>
            </head>
            <body>
                <div class="no-print" style="text-align: center; padding: 20px; background: #E3F2FD; margin-bottom: 20px;">
                    <button class="print-button" onclick="window.print()">🖨️ Print Report</button>
                    <p style="margin-top: 10px; color: #666;">
                        To save as PDF: Click Print → Select "Save as PDF" as the printer → Click Save
                    </p>
                </div>
                
                <h1>Student Progress Report</h1>
                <p class="subtitle">
                    <strong>${character.identity.name}</strong> | 
                    Generated: ${new Date().toLocaleDateString()} |
                    Teacher: ${localStorage.getItem('alphahunters_teacher_name') || 'Teacher'}
                </p>
                
                <!-- Overview Section -->
                <div class="section">
                    <h2>Overview</h2>
                    <div class="stats-grid">
                        <div class="stat-box">
                            <div class="stat-value">${character.progression.level}</div>
                            <div class="stat-label">Level</div>
                        </div>
                        <div class="stat-box">
                            <div class="stat-value">${character.progression.xp}</div>
                            <div class="stat-label">Total XP</div>
                        </div>
                        <div class="stat-box">
                            <div class="stat-value">${this.formatTime(timeData.lifetime?.total || 0)}</div>
                            <div class="stat-label">Play Time</div>
                        </div>
                        <div class="stat-box">
                            <div class="stat-value">${Object.values(letterPerformance).filter(p => (p.averageScore || 0) >= 90).length}</div>
                            <div class="stat-label">Letters Mastered</div>
                        </div>
                    </div>
                </div>
                
                <!-- Letter Performance Section -->
                <div class="section">
                    <h2>Letter Performance</h2>
                    <div class="letter-grid">
                        ${Object.keys(letterPerformance).sort().map(letter => {
                            const perf = letterPerformance[letter];
                            const avgScore = perf.averageScore || 0;
                            const scoreClass = avgScore >= 90 ? 'mastered' : avgScore >= 70 ? 'progress' : 'needs-work';
                            const scoreColor = avgScore >= 90 ? '#4CAF50' : avgScore >= 70 ? '#FF9800' : '#f44336';
                            
                            return `
                                <div class="letter-card ${scoreClass}">
                                    <div class="letter">${letter}</div>
                                    <div class="score" style="color: ${scoreColor};">${avgScore}%</div>
                                    <div class="attempts">${perf.attempts || 0} attempts</div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
                
                <!-- Time Usage Section -->
                <div class="section">
                    <h2>Time Usage Breakdown</h2>
                    <table>
                        <thead>
                            <tr>
                                <th>Activity</th>
                                <th>Time Spent</th>
                                <th>Percentage</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${this.generateTimeBreakdownRows(timeData)}
                        </tbody>
                    </table>
                </div>
                
                <!-- Recent Letter Traces -->
                ${this.generateTracesSection(letterPerformance)}
                
                
                <div class="section no-print" style="text-align: center; color: #666; font-size: 14px;">
                    <p>Generated by AlphaHunter Teacher Dashboard</p>
                </div>
            </body>
            </html>
        `;
        
        // Write the report to the new window
        reportWindow.document.write(reportHTML);
        reportWindow.document.close();
    }
    
    generateTimeBreakdownRows(timeData) {
        const activities = timeData.lifetime?.byActivity || {};
        const total = timeData.lifetime?.total || 1; // Prevent division by zero
        
        const rows = [
            { name: 'Educational (Levels)', time: activities.level || 0 },
            { name: 'Educational (Challenges)', time: activities.challenge || 0 },
            { name: 'Pet Farm', time: activities.petFarm || 0 },
            { name: 'Store', time: activities.store || 0 },
            { name: 'Menus', time: (activities.menu || 0) + (activities.characterMenu || 0) + (activities.settings || 0) }
        ];
        
        return rows.map(row => `
            <tr>
                <td>${row.name}</td>
                <td>${this.formatTime(row.time)}</td>
                <td>${Math.round((row.time / total) * 100)}%</td>
            </tr>
        `).join('');
    }
    
    generateTracesSection(letterPerformance) {
        const lettersWithTraces = Object.entries(letterPerformance)
            .filter(([letter, perf]) => perf.traceHistory && perf.traceHistory.length > 0)
            .sort(([a], [b]) => a.localeCompare(b));
        
        if (lettersWithTraces.length === 0) {
            return '';
        }
        
        return `
            <div class="section page-break">
                <h2>Letter Trace History</h2>
                ${lettersWithTraces.map(([letter, perf]) => {
                    const avgScore = perf.averageScore || 0;
                    const traces = perf.traceHistory.slice(-4); // Show last 4 traces
                    
                    return `
                        <div style="margin-bottom: 30px;">
                            <h3 style="margin-bottom: 10px;">
                                Letter ${letter} 
                                <span style="font-size: 16px; color: ${avgScore >= 90 ? '#4CAF50' : avgScore >= 70 ? '#FF9800' : '#f44336'};">
                                    (Average: ${avgScore}%)
                                </span>
                            </h3>
                            <div style="display: flex; gap: 15px; flex-wrap: wrap;">
                                ${traces.map((trace, index) => {
                                    const attemptNum = perf.traceHistory.length - traces.length + index + 1;
                                    return `
                                        <div class="trace-box" style="width: 120px;">
                                            <img src="${trace.imageData}" alt="Letter ${letter}" />
                                            <div style="color: ${trace.score >= 90 ? '#4CAF50' : trace.score >= 70 ? '#FF9800' : '#f44336'}; font-weight: bold;">
                                                ${trace.score}%
                                            </div>
                                            <div style="font-size: 12px; color: #666;">Attempt #${attemptNum}</div>
                                        </div>
                                    `;
                                }).join('')}
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }
    
    generateRecommendations(character, letterPerformance) {
        const recommendations = [];
        
        // Analyze overall performance
        const letters = Object.keys(letterPerformance);
        const masteredCount = letters.filter(l => (letterPerformance[l].averageScore || 0) >= 90).length;
        const strugglingLetters = letters.filter(l => (letterPerformance[l].averageScore || 0) < 70);
        
        if (masteredCount === letters.length && letters.length > 0) {
            recommendations.push('<li><strong>Excellent Progress!</strong> Student has mastered all practiced letters. Consider introducing more challenging content.</li>');
        } else if (masteredCount / letters.length > 0.7) {
            recommendations.push('<li><strong>Good Progress:</strong> Student is performing well overall. Focus on the remaining letters for complete mastery.</li>');
        }
        
        if (strugglingLetters.length > 0) {
            recommendations.push(`<li><strong>Focus Areas:</strong> Extra practice recommended for letters: ${strugglingLetters.join(', ')}</li>`);
        }
        
        // Time usage recommendations
        const timeData = character.statistics?.timeTracking?.lifetime?.byActivity || {};
        const educationalTime = (timeData.level || 0) + (timeData.challenge || 0);
        const nonEducationalTime = (timeData.petFarm || 0) + (timeData.store || 0) + (timeData.menu || 0);
        
        if (educationalTime < nonEducationalTime) {
            recommendations.push('<li><strong>Time Balance:</strong> Consider setting time limits for non-educational activities to encourage more learning time.</li>');
        }
        
        // Level-based recommendations
        if (character.progression.level < 5) {
            recommendations.push('<li><strong>Progression:</strong> Continue regular practice to advance through levels and unlock new content.</li>');
        } else if (character.progression.level > 10) {
            recommendations.push('<li><strong>Advanced Student:</strong> Consider introducing handwriting challenges for real-world application.</li>');
        }
        
        return recommendations.length > 0 ? 
            `<ul style="line-height: 2;">${recommendations.join('')}</ul>` : 
            '<p>Continue with current learning plan.</p>';
    }
    
    generateRecommendationsList(character, letterPerformance) {
        const recommendations = [];
        
        // Analyze overall performance
        const letters = Object.keys(letterPerformance);
        const masteredCount = letters.filter(l => (letterPerformance[l].averageScore || 0) >= 90).length;
        const strugglingLetters = letters.filter(l => (letterPerformance[l].averageScore || 0) < 70);
        
        if (masteredCount === letters.length && letters.length > 0) {
            recommendations.push('Excellent Progress! Student has mastered all practiced letters. Consider introducing more challenging content.');
        } else if (letters.length > 0 && masteredCount / letters.length > 0.7) {
            recommendations.push('Good Progress: Student is performing well overall. Focus on the remaining letters for complete mastery.');
        }
        
        if (strugglingLetters.length > 0) {
            recommendations.push(`Focus Areas: Extra practice recommended for letters: ${strugglingLetters.join(', ')}`);
        }
        
        // Time usage recommendations
        const timeData = character.statistics?.timeTracking?.lifetime?.byActivity || {};
        const educationalTime = (timeData.level || 0) + (timeData.challenge || 0);
        const nonEducationalTime = (timeData.petFarm || 0) + (timeData.store || 0) + (timeData.menu || 0);
        
        if (educationalTime < nonEducationalTime) {
            recommendations.push('Time Balance: Consider setting time limits for non-educational activities to encourage more learning time.');
        }
        
        // Level-based recommendations
        if (character.progression.level < 5) {
            recommendations.push('Progression: Continue regular practice to advance through levels and unlock new content.');
        } else if (character.progression.level > 10) {
            recommendations.push('Advanced Student: Consider introducing handwriting challenges for real-world application.');
        }
        
        // Add performance-based recommendations
        const avgScores = Object.values(letterPerformance).map(p => p.averageScore || 0);
        const overallAvg = avgScores.length > 0 ? avgScores.reduce((a, b) => a + b, 0) / avgScores.length : 0;
        
        if (overallAvg < 70) {
            recommendations.push('Practice Frequency: Increase daily practice sessions to improve letter recognition and tracing accuracy.');
        }
        
        // Consistency recommendations
        const recentActivity = character.statistics?.timeTracking?.last7Days || {};
        const activeDays = Object.keys(recentActivity).length;
        if (activeDays < 4) {
            recommendations.push('Consistency: Encourage more regular practice sessions throughout the week for better retention.');
        }
        
        return recommendations.length > 0 ? recommendations : ['Continue with current learning plan.'];
    }
    
    exportSettings() {
        try {
            // Gather all settings
            const settings = {
                version: '1.0',
                exportDate: new Date().toISOString(),
                
                // Teacher PIN (encrypted/hashed in production)
                teacherPin: localStorage.getItem('alphahunters_teacher_pin') ? 
                    JSON.parse(localStorage.getItem('alphahunters_teacher_pin')) : null,
                
                // Custom levels
                customLevels: this.getCustomLevels(),
                
                // Custom letter templates
                customLetterTemplates: localStorage.getItem('alphahunters_custom_letter_templates') ? 
                    JSON.parse(localStorage.getItem('alphahunters_custom_letter_templates')) : {},
                
                // Custom letter editor data (stroke data)
                customLetters: localStorage.getItem('alphahunters_custom_letters') ? 
                    JSON.parse(localStorage.getItem('alphahunters_custom_letters')) : {},
                
                // Teacher settings
                teacherSettings: localStorage.getItem('alphahunters_teacher_settings') ? 
                    JSON.parse(localStorage.getItem('alphahunters_teacher_settings')) : {},
                
                // Challenges
                challenges: localStorage.getItem('alphahunters_challenges') ? 
                    JSON.parse(localStorage.getItem('alphahunters_challenges')) : []
            };
            
            // Create blob and download
            const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `alphahunters_teacher_settings_${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            console.log('📥 Settings exported successfully');
            alert('Settings exported successfully!');
        } catch (error) {
            console.error('Error exporting settings:', error);
            alert('Error exporting settings. Please check the console.');
        }
    }
    
    importSettings(file) {
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const settings = JSON.parse(e.target.result);
                
                // Validate settings structure
                if (!settings.version) {
                    throw new Error('Invalid settings file');
                }
                
                // Confirm import
                const items = [];
                if (settings.teacherPin) items.push('Teacher PIN');
                if (settings.customLevels?.length) items.push(`${settings.customLevels.length} custom levels`);
                if (Object.keys(settings.customLetterTemplates || {}).length) {
                    items.push(`${Object.keys(settings.customLetterTemplates).length} custom letter templates`);
                }
                if (settings.challenges?.length) {
                    items.push(`${settings.challenges.length} challenges`);
                }
                
                const message = `This will import:\n${items.join('\n')}\n\nExisting settings will be overwritten. Continue?`;
                
                if (!confirm(message)) {
                    return;
                }
                
                // Import each setting type
                if (settings.teacherPin) {
                    localStorage.setItem('alphahunters_teacher_pin', JSON.stringify(settings.teacherPin));
                    // Reload the PIN in the auth system
                    this.game.teacherAuth.loadConfig();
                }
                
                if (settings.customLevels) {
                    localStorage.setItem('alphahunters_custom_levels', JSON.stringify(settings.customLevels));
                    // Reload custom levels in the game
                    if (this.game.levelManager) {
                        this.game.levelManager.loadCustomLevels();
                    }
                }
                
                if (settings.customLetterTemplates) {
                    localStorage.setItem('alphahunters_custom_letter_templates', 
                        JSON.stringify(settings.customLetterTemplates));
                }
                
                if (settings.customLetters) {
                    localStorage.setItem('alphahunters_custom_letters', 
                        JSON.stringify(settings.customLetters));
                }
                
                if (settings.teacherSettings) {
                    localStorage.setItem('alphahunters_teacher_settings', 
                        JSON.stringify(settings.teacherSettings));
                }
                
                if (settings.challenges) {
                    localStorage.setItem('alphahunters_challenges', 
                        JSON.stringify(settings.challenges));
                    // Reload challenges in the game
                    if (this.game.challengeManager) {
                        this.game.challengeManager.loadChallenges();
                    }
                }
                
                // Reload letter templates if game is active
                if (this.game.letterTemplates) {
                    this.game.letterTemplates = new LetterTemplates();
                }
                
                console.log('📤 Settings imported successfully');
                alert('Settings imported successfully! The page will refresh to apply changes.');
                
                // Refresh the page to ensure all changes are applied
                setTimeout(() => location.reload(), 1000);
                
            } catch (error) {
                console.error('Error importing settings:', error);
                alert('Error importing settings. Please ensure the file is valid.');
            }
        };
        
        reader.readAsText(file);
    }
    
    attachLiveSessionsListeners() {
        // Connect to room button
        document.getElementById('connectToRoomBtn')?.addEventListener('click', async () => {
            const roomCodeInput = document.getElementById('roomCodeInput');
            const roomCode = roomCodeInput?.value.trim();
            const statusDiv = document.getElementById('connectionStatus');
            
            if (!roomCode || roomCode.length !== 4) {
                if (statusDiv) {
                    statusDiv.style.background = '#ffebee';
                    statusDiv.style.color = '#c62828';
                    statusDiv.textContent = 'Please enter a valid 4-digit room code';
                }
                return;
            }
            
            if (statusDiv) {
                statusDiv.style.background = '#e3f2fd';
                statusDiv.style.color = '#1976D2';
                statusDiv.textContent = 'Connecting...';
            }
            
            try {
                // Initialize multiplayer if not exists
                if (!this.game.multiplayerManager) {
                    this.game.multiplayerManager = new ZeroSetupMultiplayer(this.game);
                }
                
                // Connect as teacher
                const result = await this.game.teacherMultiplayer.connectAsObserver(roomCode);
                
                if (result) {
                    if (statusDiv) {
                        statusDiv.style.background = '#e8f5e9';
                        statusDiv.style.color = '#2e7d32';
                        statusDiv.textContent = `Connected to room ${roomCode}!`;
                    }
                    
                    // Show active monitoring section
                    const activeMonitoring = document.getElementById('activeMonitoring');
                    if (activeMonitoring) {
                        activeMonitoring.style.display = 'block';
                    }
                    
                    // Start monitoring updates
                    this.startMonitoringUpdates();
                } else {
                    throw new Error('Failed to connect');
                }
            } catch (error) {
                console.error('Connection error:', error);
                if (statusDiv) {
                    statusDiv.style.background = '#ffebee';
                    statusDiv.style.color = '#c62828';
                    statusDiv.textContent = 'Failed to connect. Make sure the room code is correct.';
                }
            }
        });
        
        // Disconnect button
        document.getElementById('disconnectBtn')?.addEventListener('click', () => {
            this.game.teacherMultiplayer?.closeMonitoring();
            this.game.multiplayerManager?.disconnect();
            
            // Hide monitoring section
            const activeMonitoring = document.getElementById('activeMonitoring');
            if (activeMonitoring) {
                activeMonitoring.style.display = 'none';
            }
            
            // Update status
            const statusDiv = document.getElementById('connectionStatus');
            if (statusDiv) {
                statusDiv.style.background = '#f5f5f5';
                statusDiv.style.color = '#666';
                statusDiv.textContent = 'Disconnected from session';
            }
        });
        
        // Teacher action buttons
        document.querySelectorAll('.teacher-action-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const action = btn.dataset.action;
                this.handleTeacherAction(action);
            });
        });
    }
    
    startMonitoringUpdates() {
        // Clear any existing interval
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
        }
        
        // Update student cards every second
        this.monitoringInterval = setInterval(() => {
            this.updateConnectedStudents();
        }, 1000);
    }
    
    updateConnectedStudents() {
        const studentsList = document.getElementById('connectedStudentsList');
        if (!studentsList) return;
        
        const multiplayer = this.game.multiplayerManager;
        if (!multiplayer || !multiplayer.isConnected()) {
            studentsList.innerHTML = '<p style="text-align: center; color: #666;">No students connected</p>';
            return;
        }
        
        const players = multiplayer.getAllPlayers();
        studentsList.innerHTML = '';
        
        players.forEach((player, id) => {
            if (!player.isSelf) {
                const card = this.createStudentMonitorCard(id, player);
                studentsList.appendChild(card);
            }
        });
    }
    
    createStudentMonitorCard(studentId, playerData) {
        const card = document.createElement('div');
        card.style.cssText = `
            background: #f5f5f5;
            border: 2px solid #ddd;
            border-radius: 10px;
            padding: 15px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        `;
        
        const extendedData = playerData.extendedData || {};
        
        card.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
                <span style="font-size: 24px;">${playerData.emoji || '😊'}</span>
                <strong>${playerData.name || 'Student'}</strong>
                <span style="margin-left: auto; color: green;">🟢</span>
            </div>
            <div style="font-size: 14px; color: #666;">
                <div>📊 Score: ${playerData.score || 0}</div>
                <div>📱 Screen: ${extendedData.currentScreen || 'game'}</div>
                ${extendedData.currentLevel ? `<div>🎮 Level: ${extendedData.currentLevel}</div>` : ''}
                ${extendedData.traceActivity?.isTracing ? 
                    `<div>✍️ Tracing: ${extendedData.traceActivity.currentLetter?.toUpperCase()}</div>` : ''}
            </div>
            <div style="display: flex; gap: 5px; margin-top: 10px;">
                <button 
                    onclick="game.teacherDashboard.sendStudentHint('${studentId}')"
                    style="
                        padding: 5px 10px;
                        background: #2196F3;
                        color: white;
                        border: none;
                        border-radius: 5px;
                        cursor: pointer;
                        font-size: 12px;
                    "
                >
                    💡 Hint
                </button>
                <button 
                    onclick="game.teacherDashboard.sendStudentEncouragement('${studentId}')"
                    style="
                        padding: 5px 10px;
                        background: #4CAF50;
                        color: white;
                        border: none;
                        border-radius: 5px;
                        cursor: pointer;
                        font-size: 12px;
                    "
                >
                    🌟 Encourage
                </button>
            </div>
        `;
        
        return card;
    }
    
    handleTeacherAction(action) {
        const teacherMultiplayer = this.game.teacherMultiplayer;
        if (!teacherMultiplayer) return;
        
        switch (action) {
            case 'encourage-all':
                teacherMultiplayer.sendTeacherMessage('encouragement', {
                    message: "Great job everyone! Keep up the excellent work! 🌟"
                });
                break;
                
            case 'pause-all':
                teacherMultiplayer.sendTeacherMessage('pause', {});
                break;
                
            case 'challenge-all':
                const letters = ['a', 'b', 'c', 'd', 'e'];
                const letter = letters[Math.floor(Math.random() * letters.length)];
                teacherMultiplayer.sendTeacherMessage('challenge', {
                    type: 'letter_trace',
                    letter: letter,
                    reward: 100
                });
                break;
        }
    }
    
    sendStudentHint(studentId) {
        this.game.teacherMultiplayer?.sendHint(studentId);
    }
    
    sendStudentEncouragement(studentId) {
        this.game.teacherMultiplayer?.sendEncouragement(studentId);
    }
    
    // Classroom Management Methods
    loadClassroomCode() {
        const stored = localStorage.getItem('teacher_classroom_code');
        if (stored) {
            this.classroomCode = stored;
        }
    }
    
    generateClassroomCode() {
        // Generate a random 6-character code
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = '';
        for (let i = 0; i < 6; i++) {
            code += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        
        this.classroomCode = code;
        localStorage.setItem('teacher_classroom_code', code);
        
        console.log(`📚 Generated classroom code: ${code}`);
        
        // Re-render the section
        this.render();
        
        // If monitoring is active, restart with new code
        if (this.monitoringActive) {
            this.stopClassroomMonitoring();
            setTimeout(() => {
                this.startClassroomMonitoring();
            }, 1000);
        }
    }
    
    startClassroomMonitoring() {
        if (!this.classroomCode) {
            alert('Please generate a classroom code first');
            return;
        }
        
        this.monitoringActive = true;
        
        // Create teacher peer with predictable ID
        const teacherPeerId = `teacher_classroom_${this.classroomCode}`;
        
        try {
            this.teacherPeer = new Peer(teacherPeerId, {
                debug: 2,
                config: {
                    'iceServers': [
                        { urls: 'stun:stun.l.google.com:19302' }
                    ]
                }
            });
            
            this.teacherPeer.on('open', (id) => {
                console.log(`📚 Teacher peer opened with ID: ${id}`);
            });
            
            this.teacherPeer.on('connection', (conn) => {
                console.log('📚 Student connection received:', conn.metadata);
                this.handleStudentConnection(conn);
            });
            
            this.teacherPeer.on('error', (err) => {
                console.error('Teacher peer error:', err);
                if (err.type === 'unavailable-id') {
                    // ID already taken, try again with a suffix
                    this.teacherPeer = null;
                    setTimeout(() => {
                        this.startClassroomMonitoring();
                    }, 1000);
                }
            });
            
        } catch (error) {
            console.error('Error starting classroom monitoring:', error);
            this.monitoringActive = false;
        }
        
        // Update UI
        this.render();
    }
    
    stopClassroomMonitoring() {
        this.monitoringActive = false;
        
        // Close all student connections
        this.studentConnections.forEach(conn => {
            conn.close();
        });
        this.studentConnections.clear();
        
        // Destroy teacher peer
        if (this.teacherPeer) {
            this.teacherPeer.destroy();
            this.teacherPeer = null;
        }
        
        // Clear students (but remember them for when monitoring restarts)
        // Don't clear this.classroomStudents as we want to remember who joined
        
        // Update UI
        this.render();
    }
    
    handleStudentConnection(conn) {
        const studentData = conn.metadata?.studentData;
        if (!studentData) return;
        
        const studentId = studentData.studentId;
        
        // Store connection
        this.studentConnections.set(studentId, conn);
        
        // Add/update student in classroom
        this.classroomStudents.set(studentId, {
            id: studentId,
            name: studentData.studentName,
            joinedAt: studentData.joinedAt,
            lastSeen: Date.now(),
            status: 'connecting',
            connection: conn,
            gameData: {}
        });
        
        // Set up connection handlers
        conn.on('open', () => {
            console.log(`✅ Student ${studentData.studentName} connected`);
            const student = this.classroomStudents.get(studentId);
            if (student) {
                student.status = 'online';
                student.lastSeen = Date.now();
            }
            
            // Send welcome message
            conn.send({
                type: 'teacher_connected',
                message: `Connected to ${this.classroomCode} classroom`
            });
        });
        
        conn.on('data', (data) => {
            this.handleStudentData(studentId, data);
        });
        
        conn.on('close', () => {
            console.log(`🔌 Student ${studentId} disconnected`);
            const student = this.classroomStudents.get(studentId);
            if (student) {
                student.status = 'offline';
                student.connection = null;
            }
            this.studentConnections.delete(studentId);
            this.updateClassroomDisplay();
        });
        
        // Update display
        this.updateClassroomDisplay();
    }
    
    handleStudentData(studentId, data) {
        const student = this.classroomStudents.get(studentId);
        if (!student) return;
        
        switch (data.type) {
            case 'monitoring_update':
                student.lastSeen = Date.now();
                student.status = data.status || 'online';
                student.gameData = data.gameData || {};
                this.updateClassroomDisplay();
                break;
                
            case 'pong':
                student.lastSeen = Date.now();
                break;
        }
    }
    
    updateClassroomDisplay() {
        // Only update if we're on the classroom section
        if (this.currentSection !== 'classroom') return;
        
        const grid = document.getElementById('classroomStudentsGrid');
        if (!grid) return;
        
        grid.innerHTML = this.renderClassroomStudentTiles();
    }
    
    renderClassroomStudentTiles() {
        const tiles = [];
        const now = Date.now();
        
        this.classroomStudents.forEach((student, studentId) => {
            const isOnline = (now - student.lastSeen) < 120000; // 2 minutes
            const status = this.getStudentStatusColor(student);
            
            tiles.push(`
                <div class="student-tile ${status}" style="
                    background: white;
                    border: 2px solid ${isOnline ? '#4CAF50' : '#ccc'};
                    border-radius: 10px;
                    padding: 15px;
                    text-align: center;
                    cursor: pointer;
                    transition: all 0.2s;
                    position: relative;
                " onclick="game.teacherDashboard.showStudentDetails('${studentId}')">
                    <div style="
                        position: absolute;
                        top: 10px;
                        right: 10px;
                        width: 10px;
                        height: 10px;
                        border-radius: 50%;
                        background: ${isOnline ? '#4CAF50' : '#ccc'};
                    "></div>
                    
                    <div style="font-size: 24px; margin-bottom: 5px;">
                        ${this.getStudentEmoji(student)}
                    </div>
                    
                    <div style="
                        font-weight: bold;
                        color: #333;
                        margin-bottom: 5px;
                        white-space: nowrap;
                        overflow: hidden;
                        text-overflow: ellipsis;
                    ">
                        ${student.name}
                    </div>
                    
                    <div style="font-size: 12px; color: #666;">
                        ${this.getStudentStatusText(student)}
                    </div>
                    
                    <div style="
                        margin-top: 10px;
                        display: flex;
                        gap: 5px;
                        justify-content: center;
                    ">
                        <button 
                            onclick="event.stopPropagation(); game.teacherDashboard.sendClassroomHint('${studentId}')"
                            style="
                                padding: 5px 10px;
                                background: #2196F3;
                                color: white;
                                border: none;
                                border-radius: 5px;
                                cursor: pointer;
                                font-size: 11px;
                            "
                            ${!isOnline ? 'disabled' : ''}
                        >
                            💡
                        </button>
                        <button 
                            onclick="event.stopPropagation(); game.teacherDashboard.sendClassroomEncouragement('${studentId}')"
                            style="
                                padding: 5px 10px;
                                background: #4CAF50;
                                color: white;
                                border: none;
                                border-radius: 5px;
                                cursor: pointer;
                                font-size: 11px;
                            "
                            ${!isOnline ? 'disabled' : ''}
                        >
                            ⭐
                        </button>
                    </div>
                </div>
            `);
        });
        
        return tiles.join('');
    }
    
    getStudentStatusColor(student) {
        if (!student.gameData || !student.connection) return '';
        
        const data = student.gameData;
        
        // Green border for active playing
        if (data.isPlaying) return 'status-good';
        
        // Yellow for in menu
        if (data.currentScreen === 'menu') return 'status-warning';
        
        // Default
        return '';
    }
    
    getStudentEmoji(student) {
        const gameData = student.gameData || {};
        
        if (gameData.isPlaying) return '🎮';
        if (gameData.currentScreen === 'trace') return '✍️';
        if (gameData.currentScreen === 'menu') return '📋';
        if (gameData.currentScreen === 'pause') return '⏸️';
        
        return '😊';
    }
    
    getStudentStatusText(student) {
        const gameData = student.gameData || {};
        
        if (!student.connection) return 'Offline';
        
        if (gameData.isPlaying && gameData.currentLevel) {
            return `Level ${gameData.currentLevel}`;
        }
        
        if (gameData.currentScreen) {
            const screens = {
                'menu': 'In Menu',
                'game': 'Playing',
                'trace': 'Tracing',
                'pause': 'Paused',
                'upgrade': 'Upgrading'
            };
            return screens[gameData.currentScreen] || gameData.currentScreen;
        }
        
        return 'Connected';
    }
    
    showStudentDetails(studentId) {
        const student = this.classroomStudents.get(studentId);
        if (!student) return;
        
        // TODO: Show detailed student view
        console.log('Student details:', student);
    }
    
    sendClassroomMessage(studentId, type, data) {
        const student = this.classroomStudents.get(studentId);
        if (!student || !student.connection) return;
        
        try {
            student.connection.send({
                type: `teacher_${type}`,
                data: data
            });
        } catch (error) {
            console.error('Error sending message to student:', error);
        }
    }
    
    sendClassroomHint(studentId) {
        const student = this.classroomStudents.get(studentId);
        if (!student) return;
        
        const hint = this.generateStudentHint(student);
        this.sendClassroomMessage(studentId, 'hint', hint);
    }
    
    sendClassroomEncouragement(studentId) {
        const encouragements = [
            "Great job! Keep it up! 🌟",
            "You're doing amazing! 💪",
            "Fantastic work! 🎉",
            "Keep going, you've got this! 🚀",
            "Excellent progress! 👏"
        ];
        
        const message = encouragements[Math.floor(Math.random() * encouragements.length)];
        this.sendClassroomMessage(studentId, 'encouragement', message);
    }
    
    generateStudentHint(student) {
        const gameData = student.gameData || {};
        
        if (gameData.currentActivity && gameData.currentActivity.includes('Tracing')) {
            return "Remember to start from the dot and follow the arrows! 📝";
        }
        
        if (gameData.isPlaying) {
            return "Look for letterlings that match the level theme! 🔍";
        }
        
        return "Take your time and focus on accuracy! 🎯";
    }
    
    handleClassroomAction(action) {
        switch (action) {
            case 'pause-all':
                this.classroomStudents.forEach((student, id) => {
                    if (student.connection) {
                        this.sendClassroomMessage(id, 'pause', {});
                    }
                });
                break;
                
            case 'encourage-all':
                this.classroomStudents.forEach((student, id) => {
                    if (student.connection) {
                        this.sendClassroomEncouragement(id);
                    }
                });
                break;
                
            case 'challenge-all':
                const letters = ['a', 'b', 'c', 'd', 'e'];
                const letter = letters[Math.floor(Math.random() * letters.length)];
                
                this.classroomStudents.forEach((student, id) => {
                    if (student.connection) {
                        this.sendClassroomMessage(id, 'challenge', {
                            type: 'letter_trace',
                            letter: letter,
                            reward: 100
                        });
                    }
                });
                break;
        }
    }
    
    attachClassroomListeners() {
        // Generate classroom code button
        document.getElementById('generateClassroomCode')?.addEventListener('click', () => {
            this.generateClassroomCode();
        });
        
        document.getElementById('regenerateClassroomCode')?.addEventListener('click', () => {
            if (confirm('This will invalidate the current code. Students will need the new code to join. Continue?')) {
                this.generateClassroomCode();
            }
        });
        
        // Toggle monitoring button
        document.getElementById('toggleMonitoring')?.addEventListener('click', () => {
            if (this.monitoringActive) {
                this.stopClassroomMonitoring();
            } else {
                this.startClassroomMonitoring();
            }
        });
        
        // Classroom action buttons
        document.querySelectorAll('.classroom-action-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const action = btn.dataset.action;
                this.handleClassroomAction(action);
            });
        });
        
        // Auto-refresh student display
        if (this.monitoringActive && this.currentSection === 'classroom') {
            this.classroomRefreshInterval = setInterval(() => {
                this.updateClassroomDisplay();
            }, 5000); // Refresh every 5 seconds
        }
    }
}