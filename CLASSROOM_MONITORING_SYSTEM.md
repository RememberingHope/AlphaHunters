# Classroom Monitoring System - Implementation Guide

## Overview

This document outlines the implementation of a simplified classroom monitoring system that allows teachers to monitor students without disrupting their individual gameplay experience. Students join a classroom once and then play normally, while the system automatically connects them to their teacher when available.

## Key Design Principles

1. **Minimal Disruption** - Students play the game normally without constant teacher connection
2. **One-Time Setup** - Students join a classroom once and remain members
3. **Automatic Reconnection** - Background monitoring connects to teacher when available
4. **Individual Gameplay** - Students maintain their own game rooms and multiplayer sessions
5. **Delayed Sync is OK** - Up to 1-minute delay for student visibility is acceptable

## System Architecture

### Components

```
┌─────────────────────┐     ┌─────────────────────┐
│   Student Game      │     │  Teacher Dashboard  │
│                     │     │                     │
│ - Plays normally    │     │ - Creates classroom │
│ - Has classroom ID  │     │ - Monitors students │
│ - Checks every 60s  │────▶│ - Receives updates  │
└─────────────────────┘     └─────────────────────┘
         │                            │
         │                            │
         ▼                            ▼
┌─────────────────────────────────────────────────┐
│           Classroom Connection Manager           │
│                                                 │
│ - Maintains classroom memberships               │
│ - Handles background connections                │
│ - Routes monitoring data                        │
└─────────────────────────────────────────────────┘
```

### Data Flow

1. **Initial Setup**
   - Teacher creates classroom with unique code (e.g., "MATH101")
   - Student enters classroom code once
   - System stores classroom membership in localStorage

2. **Normal Gameplay**
   - Students play individually or in small multiplayer groups
   - Game functions normally without teacher connection
   - No performance impact or gameplay changes

3. **Background Monitoring**
   - Every 60 seconds, check if teacher is online
   - If teacher available, send monitoring update
   - If not available, continue normal gameplay

4. **Teacher Monitoring**
   - Teacher sees students appear as they check in
   - Grid view shows all classroom members
   - Real-time updates when students are active

## Implementation Plan

### Phase 1: Classroom Registration System

#### 1.1 Classroom Data Structure

```javascript
// Stored in localStorage
const classroomMembership = {
    classroomCode: "MATH101",
    studentName: "John Smith",
    studentId: "student_abc123",
    joinedAt: "2024-01-15T10:30:00Z",
    lastCheckIn: "2024-01-15T14:25:00Z"
};

// Teacher's classroom data
const classroom = {
    code: "MATH101",
    name: "Ms. Johnson's Math Class",
    created: "2024-01-15T08:00:00Z",
    students: [
        {
            id: "student_abc123",
            name: "John Smith",
            lastSeen: "2024-01-15T14:25:00Z",
            status: "online", // online, offline, playing
            currentData: { /* monitoring data */ }
        }
    ]
};
```

#### 1.2 Student Join Flow

```javascript
// In main menu
class ClassroomJoinUI {
    showJoinDialog() {
        // Simple modal with classroom code input
        // One-time setup per device
    }
    
    async joinClassroom(classroomCode) {
        // Validate code format
        // Store membership locally
        // Attempt immediate connection if teacher online
        localStorage.setItem('alphahunter_classroom', JSON.stringify({
            classroomCode,
            studentName: this.game.dataManager.getCurrentCharacter().identity.name,
            studentId: this.generateStudentId(),
            joinedAt: new Date().toISOString()
        }));
    }
}
```

### Phase 2: Background Connection System

#### 2.1 Connection Manager

```javascript
class ClassroomConnectionManager {
    constructor(game) {
        this.game = game;
        this.checkInterval = 60000; // 1 minute
        this.lastCheckTime = 0;
        this.isTeacherConnected = false;
        this.classroomData = null;
        
        this.loadClassroomMembership();
        this.startBackgroundChecking();
    }
    
    loadClassroomMembership() {
        const stored = localStorage.getItem('alphahunter_classroom');
        if (stored) {
            this.classroomData = JSON.parse(stored);
            console.log(`📚 Loaded classroom membership: ${this.classroomData.classroomCode}`);
        }
    }
    
    startBackgroundChecking() {
        // Check immediately on start
        this.checkTeacherConnection();
        
        // Then check every minute
        this.checkTimer = setInterval(() => {
            this.checkTeacherConnection();
        }, this.checkInterval);
    }
    
    async checkTeacherConnection() {
        if (!this.classroomData) return;
        
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
        // Implementation depends on connection method
        // Could use WebRTC, WebSocket, or polling
        try {
            const teacherPeerId = `teacher_classroom_${this.classroomData.classroomCode}`;
            return await this.connectToTeacherPeer(teacherPeerId);
        } catch (error) {
            return false; // Teacher not available
        }
    }
}
```

#### 2.2 Monitoring Data Updates

```javascript
// Send minimal data during normal gameplay
sendMonitoringUpdate() {
    if (!this.isTeacherConnected) return;
    
    const monitoringData = {
        studentId: this.classroomData.studentId,
        studentName: this.classroomData.studentName,
        timestamp: Date.now(),
        status: this.getStudentStatus(),
        gameData: {
            currentScreen: this.getCurrentScreen(),
            isPlaying: this.game.levelManager?.isLevelActive(),
            currentLevel: this.game.levelManager?.currentLevel?.id,
            score: this.game.levelManager?.currentLevelScore || 0,
            // Only send detailed data if actively playing
            ...(this.game.levelManager?.isLevelActive() ? {
                levelTime: this.game.levelManager.getLevelTime(),
                lettersCollected: this.getLettersCollected(),
                currentActivity: this.getCurrentActivity()
            } : {})
        }
    };
    
    this.sendToTeacher('monitoring_update', monitoringData);
}
```

### Phase 3: Teacher Dashboard Updates

#### 3.1 Classroom Management Section

```javascript
renderClassroomSection() {
    return `
        <div>
            <h2>📚 Classroom Management</h2>
            
            <!-- Classroom Setup -->
            <div class="classroom-setup">
                <h3>Your Classroom Code</h3>
                <div class="classroom-code-display">
                    <span class="code">${this.classroomCode || 'Not Set'}</span>
                    <button onclick="this.generateClassroomCode()">
                        Generate New Code
                    </button>
                </div>
                <p class="help-text">
                    Share this code with students. They only need to enter it once.
                </p>
            </div>
            
            <!-- Student Grid -->
            <div class="students-grid">
                <h3>Classroom Students (${this.connectedStudents.size}/${this.totalStudents})</h3>
                <div class="student-tiles">
                    ${this.renderStudentTiles()}
                </div>
            </div>
            
            <!-- Quick Actions -->
            <div class="classroom-actions">
                <button onclick="this.pauseAllStudents()">⏸️ Pause All</button>
                <button onclick="this.sendClassAnnouncement()">📢 Announcement</button>
                <button onclick="this.startClassChallenge()">🎯 Class Challenge</button>
            </div>
        </div>
    `;
}
```

#### 3.2 Student Status Grid

```javascript
renderStudentTiles() {
    const tiles = [];
    
    this.classroomStudents.forEach(student => {
        const status = this.getStudentStatusColor(student);
        const isOnline = Date.now() - student.lastSeen < 120000; // 2 minutes
        
        tiles.push(`
            <div class="student-tile ${status}" 
                 onclick="this.showStudentDetails('${student.id}')">
                <div class="student-status ${isOnline ? 'online' : 'offline'}"></div>
                <div class="student-name">${student.name}</div>
                <div class="student-info">
                    ${student.currentData ? 
                        this.getStudentSummary(student.currentData) : 
                        'Waiting for data...'}
                </div>
                <div class="student-actions">
                    <button onclick="this.sendHint('${student.id}')" 
                            title="Send Hint">💡</button>
                    <button onclick="this.sendEncouragement('${student.id}')" 
                            title="Encourage">⭐</button>
                </div>
            </div>
        `);
    });
    
    return tiles.join('');
}

getStudentStatusColor(student) {
    if (!student.currentData) return 'status-unknown';
    
    const data = student.currentData.gameData;
    
    // Green: Actively playing and doing well
    if (data.isPlaying && data.score > 50) return 'status-good';
    
    // Yellow: Playing but might need help
    if (data.isPlaying && data.levelTime > 300) return 'status-warning';
    
    // Red: Stuck or idle
    if (data.currentScreen === 'game' && !data.isPlaying) return 'status-alert';
    
    // Gray: In menu or not playing
    return 'status-idle';
}
```

### Phase 4: Connection Methods

#### Option A: WebRTC with Teacher as Persistent Peer

```javascript
// Teacher creates a persistent peer with predictable ID
class TeacherClassroomHost {
    async startClassroomSession(classroomCode) {
        this.peer = new Peer(`teacher_classroom_${classroomCode}`, {
            // Peer config
        });
        
        this.peer.on('connection', (conn) => {
            this.handleStudentConnection(conn);
        });
    }
}

// Students connect when teacher is available
class StudentClassroomClient {
    async connectToTeacherPeer(teacherPeerId) {
        try {
            const conn = this.peer.connect(teacherPeerId);
            return new Promise((resolve) => {
                conn.on('open', () => resolve(true));
                conn.on('error', () => resolve(false));
                setTimeout(() => resolve(false), 5000); // 5s timeout
            });
        } catch (error) {
            return false;
        }
    }
}
```

#### Option B: Local Storage Polling (Same Device Testing)

```javascript
// For testing when teacher and students are on same device
class LocalStorageClassroomConnection {
    sendUpdate(data) {
        const updates = JSON.parse(
            localStorage.getItem('classroom_updates') || '[]'
        );
        updates.push({
            ...data,
            timestamp: Date.now()
        });
        // Keep only last 100 updates
        if (updates.length > 100) {
            updates.splice(0, updates.length - 100);
        }
        localStorage.setItem('classroom_updates', JSON.stringify(updates));
    }
    
    getRecentUpdates() {
        const updates = JSON.parse(
            localStorage.getItem('classroom_updates') || '[]'
        );
        const cutoff = Date.now() - 120000; // Last 2 minutes
        return updates.filter(u => u.timestamp > cutoff);
    }
}
```

## User Workflows

### Student Workflow

1. **First Time Setup** (One time only)
   - Launch game normally
   - Click "Join Classroom" in menu
   - Enter teacher's classroom code
   - Click "Join"
   - See confirmation: "Joined Ms. Johnson's Class!"

2. **Regular Gameplay**
   - Play game as normal
   - Create/join multiplayer rooms with friends
   - No visible difference in gameplay
   - Background monitoring happens automatically

3. **When Teacher is Online**
   - No interruption to gameplay
   - May see occasional encouragement messages
   - Can receive challenges from teacher

### Teacher Workflow

1. **Classroom Setup** (One time)
   - Open Teacher Dashboard
   - Go to "Classroom" section
   - Click "Generate Classroom Code"
   - Write code on board: "MATH101"

2. **Daily Monitoring**
   - Open Teacher Dashboard
   - Go to "Classroom" section
   - Students automatically appear as they check in
   - See grid view of all students
   - Click any student for details

3. **Interventions**
   - See color-coded student status
   - Yellow/Red students may need help
   - Click student tile for options
   - Send individual hints or encouragement

## Implementation Timeline

### Week 1: Foundation
- Create ClassroomConnectionManager
- Implement localStorage for classroom membership
- Add "Join Classroom" UI to student menu
- Basic teacher classroom code generation

### Week 2: Background Monitoring
- Implement 60-second connection checking
- Create monitoring data collection
- Add WebRTC connection for teacher-student link
- Test connection reliability

### Week 3: Teacher Dashboard
- Create classroom section in dashboard
- Implement student grid view
- Add color-coded status indicators
- Create individual student interaction options

### Week 4: Polish & Testing
- Optimize connection efficiency
- Add connection status indicators
- Test with multiple students
- Performance optimization

## Technical Considerations

### Performance
- Minimal impact on gameplay (< 1% CPU)
- Small data packets (< 1KB per update)
- 60-second intervals prevent battery drain
- No continuous connections during gameplay

### Reliability
- Graceful handling of connection failures
- Automatic reconnection attempts
- No data loss if teacher goes offline
- Students can play without teacher

### Privacy
- Only monitoring data, no personal info
- Data stays on local network
- Teacher sees only classroom members
- Students can leave classroom anytime

### Scalability
- Supports 30+ students per classroom
- Efficient data structures
- Batched updates when possible
- Teacher dashboard remains responsive

## Configuration Options

```javascript
// In settings or config file
const classroomConfig = {
    checkInterval: 60000, // How often to check for teacher (ms)
    updateInterval: 5000, // How often to send updates when connected
    maxReconnectAttempts: 3,
    connectionTimeout: 5000,
    enableNotifications: true,
    compressData: true
};
```

## Error Handling

1. **Teacher Offline** - Continue normal gameplay, check again later
2. **Connection Failed** - Log error, retry next interval
3. **Invalid Classroom Code** - Show error to student, allow retry
4. **Network Issues** - Graceful degradation, no gameplay impact

## Future Enhancements

1. **Classroom Analytics** - Daily/weekly progress reports
2. **Homework Assignments** - Teacher assigns specific levels
3. **Achievement Tracking** - Classroom-wide achievements
4. **Parent Portal** - Parents can see child's progress
5. **Multi-Teacher Support** - Students in multiple classrooms