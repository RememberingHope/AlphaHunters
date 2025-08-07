// Achievement Tracker for letter mastery and statistics

class AchievementTracker {
    constructor(game) {
        this.game = game;
        this.isVisible = false;
        
        // Achievement definitions
        this.achievements = {
            // Letter mastery achievements
            firstLetter: { name: 'First Steps', description: 'Trace your first letter', icon: '✨', unlocked: false },
            tenLetters: { name: 'Getting Started', description: 'Trace 10 different letters', icon: '🌟', unlocked: false },
            allLowercase: { name: 'Lowercase Master', description: 'Master all lowercase letters', icon: '🔤', unlocked: false },
            allUppercase: { name: 'Uppercase Master', description: 'Master all uppercase letters', icon: '🔠', unlocked: false },
            perfectionist: { name: 'Perfectionist', description: 'Score 100 on any letter', icon: '💯', unlocked: false },
            
            // Progress achievements
            level5: { name: 'Rising Star', description: 'Reach level 5', icon: '⭐', unlocked: false },
            level10: { name: 'Letter Hunter', description: 'Reach level 10', icon: '🎯', unlocked: false },
            level20: { name: 'Alphabet Expert', description: 'Reach level 20', icon: '🏆', unlocked: false },
            
            // Special achievements
            speedDemon: { name: 'Speed Demon', description: 'Trace 100 letters in one session', icon: '⚡', unlocked: false },
            collector: { name: 'Collector', description: 'Encounter every letter at least once', icon: '📚', unlocked: false },
            dedication: { name: 'Dedication', description: 'Play for 60 minutes total', icon: '⏰', unlocked: false }
        };
        
        this.init();
    }
    
    init() {
        this.createUI();
        this.bindEvents();
        // AchievementTracker ready
    }
    
    createUI() {
        // Achievement panel
        const panel = document.createElement('div');
        panel.id = 'achievementPanel';
        panel.style.cssText = `
            position: fixed;
            top: 50%; left: 50%;
            transform: translate(-50%, -50%);
            width: 90%; max-width: 800px;
            height: 80%; max-height: 600px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border: 4px solid #fff;
            border-radius: 20px;
            color: white;
            font-family: 'Comic Sans MS', cursive;
            display: none;
            flex-direction: column;
            z-index: 1500;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
        `;
        
        panel.innerHTML = `
            <div style="padding: 20px; border-bottom: 2px solid rgba(255,255,255,0.3);">
                <h2 style="margin: 0; text-align: center; font-size: 28px;">🏆 Achievements & Statistics</h2>
                <button id="closeAchievements" style="
                    position: absolute; top: 15px; right: 15px;
                    background: rgba(255,255,255,0.2); border: none;
                    color: white; padding: 8px 12px; border-radius: 50%;
                    cursor: pointer; font-size: 16px;
                ">❌</button>
            </div>
            
            <div style="display: flex; height: 100%; overflow: hidden;">
                <!-- Left side: Achievements -->
                <div style="flex: 1; padding: 20px; overflow-y: auto;">
                    <h3 style="margin: 0 0 15px 0; font-size: 22px; color: #FFD700;">🏆 Achievements</h3>
                    <div id="achievementsList" style="display: flex; flex-direction: column; gap: 10px;">
                        <!-- Achievements will be populated here -->
                    </div>
                </div>
                
                <!-- Right side: Statistics -->
                <div style="flex: 1; padding: 20px; border-left: 2px solid rgba(255,255,255,0.3); overflow-y: auto;">
                    <h3 style="margin: 0 0 15px 0; font-size: 22px; color: #87CEEB;">📊 Letter Statistics</h3>
                    <div id="statisticsList" style="font-size: 14px;">
                        <!-- Statistics will be populated here -->
                    </div>
                    
                    <div style="margin-top: 20px; text-align: center;">
                        <button id="exportPdfBtn" style="
                            background: linear-gradient(135deg, #4CAF50, #45a049);
                            border: none; color: white; padding: 10px 20px;
                            border-radius: 10px; font-size: 14px; font-weight: bold;
                            cursor: pointer; margin-right: 10px;
                        ">📄 Export as PDF</button>
                        <button id="exportTextBtn" style="
                            background: linear-gradient(135deg, #607D8B, #455A64);
                            border: none; color: white; padding: 10px 20px;
                            border-radius: 10px; font-size: 14px; font-weight: bold;
                            cursor: pointer;
                        ">📝 Export as Text</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(panel);
        
        // Add achievement notification container
        const notificationContainer = document.createElement('div');
        notificationContainer.id = 'achievementNotifications';
        notificationContainer.style.cssText = `
            position: fixed;
            top: 20px; right: 20px;
            z-index: 2000;
            pointer-events: none;
        `;
        document.body.appendChild(notificationContainer);
        
        // Add toggle button to main UI
        const toggleBtn = document.createElement('button');
        toggleBtn.id = 'showAchievementsBtn';
        toggleBtn.style.cssText = `
            position: fixed;
            top: 20px; right: 80px;
            background: rgba(255, 215, 0, 0.9);
            border: none;
            color: #333;
            padding: 10px;
            border-radius: 50%;
            font-size: 16px;
            cursor: pointer;
            z-index: 100;
            width: 40px;
            height: 40px;
        `;
        toggleBtn.innerHTML = '🏆';
        toggleBtn.title = 'Show Achievements';
        document.body.appendChild(toggleBtn);
    }
    
    bindEvents() {
        document.getElementById('showAchievementsBtn').addEventListener('click', () => this.show());
        document.getElementById('closeAchievements').addEventListener('click', () => this.hide());
        document.getElementById('exportPdfBtn').addEventListener('click', () => this.exportAsPDF());
        document.getElementById('exportTextBtn').addEventListener('click', () => this.exportAsText());
        
        // Close panel when clicking outside
        document.getElementById('achievementPanel').addEventListener('click', (e) => {
            if (e.target.id === 'achievementPanel') this.hide();
        });
    }
    
    show() {
        this.updateAchievements();
        this.updateStatistics();
        document.getElementById('achievementPanel').style.display = 'flex';
        this.isVisible = true;
    }
    
    hide() {
        document.getElementById('achievementPanel').style.display = 'none';
        this.isVisible = false;
    }
    
    updateAchievements() {
        const achievementsList = document.getElementById('achievementsList');
        achievementsList.innerHTML = '';
        
        // Check and update achievement status
        this.checkAchievements();
        
        // Populate achievements
        Object.entries(this.achievements).forEach(([key, achievement]) => {
            const achievementItem = document.createElement('div');
            achievementItem.style.cssText = `
                background: ${achievement.unlocked ? 'rgba(76, 175, 80, 0.3)' : 'rgba(255, 255, 255, 0.1)'};
                border: 2px solid ${achievement.unlocked ? '#4CAF50' : 'rgba(255, 255, 255, 0.2)'};
                border-radius: 10px;
                padding: 15px;
                display: flex;
                align-items: center;
                gap: 15px;
            `;
            
            achievementItem.innerHTML = `
                <div style="font-size: 24px; opacity: ${achievement.unlocked ? '1' : '0.5'};">
                    ${achievement.icon}
                </div>
                <div style="flex: 1;">
                    <h4 style="margin: 0; font-size: 16px; color: ${achievement.unlocked ? '#4CAF50' : '#ccc'};">
                        ${achievement.name}
                    </h4>
                    <p style="margin: 5px 0 0 0; font-size: 12px; color: #ddd;">
                        ${achievement.description}
                    </p>
                </div>
                ${achievement.unlocked ? '<div style="color: #4CAF50; font-size: 18px;">✓</div>' : ''}
            `;
            
            achievementsList.appendChild(achievementItem);
        });
    }
    
    updateStatistics() {
        const statisticsList = document.getElementById('statisticsList');
        
        // Get statistics from spawn pool and progression
        const spawnPoolStats = this.game.spawnPool?.getStatistics() || { encounters: {}, scores: {}, mastery: {} };
        const progression = this.game.progression;
        
        // Calculate statistics
        const totalEncounters = Object.values(spawnPoolStats.encounters).reduce((sum, count) => sum + count, 0);
        const uniqueLetters = Object.keys(spawnPoolStats.encounters).length;
        const averageScore = this.calculateAverageScore(spawnPoolStats.scores, spawnPoolStats.encounters);
        
        // Letter mastery breakdown
        const masteryBreakdown = {
            'Expert': Object.values(spawnPoolStats.mastery).filter(m => m === 'Expert').length,
            'Advanced': Object.values(spawnPoolStats.mastery).filter(m => m === 'Advanced').length,
            'Intermediate': Object.values(spawnPoolStats.mastery).filter(m => m === 'Intermediate').length,
            'Beginner': Object.values(spawnPoolStats.mastery).filter(m => m === 'Beginner').length
        };
        
        statisticsList.innerHTML = `
            <div style="background: rgba(255,255,255,0.1); padding: 15px; border-radius: 10px; margin-bottom: 15px;">
                <h4 style="margin: 0 0 10px 0; color: #FFD700;">📈 Overall Progress</h4>
                <p style="margin: 5px 0;">Level: ${progression?.playerLevel || 1}</p>
                <p style="margin: 5px 0;">Total XP: ${progression?.playerXP || 0}</p>
                <p style="margin: 5px 0;">Letters Encountered: ${uniqueLetters}/52</p>
                <p style="margin: 5px 0;">Total Traces: ${totalEncounters}</p>
                <p style="margin: 5px 0;">Average Score: ${averageScore}%</p>
            </div>
            
            <div style="background: rgba(255,255,255,0.1); padding: 15px; border-radius: 10px; margin-bottom: 15px;">
                <h4 style="margin: 0 0 10px 0; color: #87CEEB;">🎯 Letter Mastery</h4>
                <p style="margin: 5px 0;">Expert (1000+ pts): ${masteryBreakdown.Expert}</p>
                <p style="margin: 5px 0;">Advanced (500+ pts): ${masteryBreakdown.Advanced}</p>
                <p style="margin: 5px 0;">Intermediate (200+ pts): ${masteryBreakdown.Intermediate}</p>
                <p style="margin: 5px 0;">Beginner (< 200 pts): ${masteryBreakdown.Beginner}</p>
            </div>
            
            <div style="background: rgba(255,255,255,0.1); padding: 15px; border-radius: 10px;">
                <h4 style="margin: 0 0 10px 0; color: #FF9800;">📝 Letter Details</h4>
                <div style="max-height: 200px; overflow-y: auto; font-size: 12px;">
                    ${this.generateLetterDetails(spawnPoolStats)}
                </div>
            </div>
        `;
    }
    
    generateLetterDetails(stats) {
        const letters = Object.keys(stats.encounters);
        if (letters.length === 0) {
            return '<p style="color: #ccc;">No letters traced yet.</p>';
        }
        
        // Sort by encounter count (most encountered first)
        letters.sort((a, b) => (stats.encounters[b] || 0) - (stats.encounters[a] || 0));
        
        return letters.map(letter => {
            const encounters = stats.encounters[letter] || 0;
            const totalScore = stats.scores[letter] || 0;
            const avgScore = encounters > 0 ? Math.round(totalScore / encounters) : 0;
            const mastery = stats.mastery[letter] || 'Beginner';
            
            return `
                <div style="display: flex; justify-content: space-between; padding: 5px; border-bottom: 1px solid rgba(255,255,255,0.1);">
                    <span style="font-weight: bold;">${letter}</span>
                    <span>${encounters} traces</span>
                    <span>${avgScore}% avg</span>
                    <span style="color: ${this.getMasteryColor(mastery)};">${mastery}</span>
                </div>
            `;
        }).join('');
    }
    
    getMasteryColor(mastery) {
        switch (mastery) {
            case 'Expert': return '#4CAF50';
            case 'Advanced': return '#2196F3';
            case 'Intermediate': return '#FF9800';
            default: return '#757575';
        }
    }
    
    calculateAverageScore(scores, encounters) {
        const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0);
        const totalEncounters = Object.values(encounters).reduce((sum, count) => sum + count, 0);
        return totalEncounters > 0 ? Math.round(totalScore / totalEncounters) : 0;
    }
    
    checkAchievements() {
        const spawnPoolStats = this.game.spawnPool?.getStatistics() || { encounters: {}, scores: {}, mastery: {} };
        const progression = this.game.progression;
        
        // Check first letter
        if (Object.keys(spawnPoolStats.encounters).length > 0) {
            this.unlockAchievement('firstLetter');
        }
        
        // Check ten letters
        if (Object.keys(spawnPoolStats.encounters).length >= 10) {
            this.unlockAchievement('tenLetters');
        }
        
        // Check perfect score
        Object.entries(spawnPoolStats.encounters).forEach(([letter, count]) => {
            const avgScore = count > 0 ? (spawnPoolStats.scores[letter] || 0) / count : 0;
            if (avgScore >= 100) {
                this.unlockAchievement('perfectionist');
            }
        });
        
        // Check level achievements
        const level = progression?.playerLevel || 1;
        if (level >= 5) this.unlockAchievement('level5');
        if (level >= 10) this.unlockAchievement('level10');
        if (level >= 20) this.unlockAchievement('level20');
        
        // Check mastery achievements
        const masteredLetters = Object.keys(spawnPoolStats.mastery);
        const lowercaseLetters = masteredLetters.filter(l => l >= 'a' && l <= 'z');
        const uppercaseLetters = masteredLetters.filter(l => l >= 'A' && l <= 'Z');
        
        if (lowercaseLetters.length >= 26) this.unlockAchievement('allLowercase');
        if (uppercaseLetters.length >= 26) this.unlockAchievement('allUppercase');
        
        // Check collector (all letters encountered)
        if (Object.keys(spawnPoolStats.encounters).length >= 52) {
            this.unlockAchievement('collector');
        }
        
        // Check speed demon (100 letters in session)
        const totalThisSession = Object.values(spawnPoolStats.encounters).reduce((sum, count) => sum + count, 0);
        if (totalThisSession >= 100) {
            this.unlockAchievement('speedDemon');
        }
    }
    
    unlockAchievement(achievementKey) {
        if (!this.achievements[achievementKey] || this.achievements[achievementKey].unlocked) {
            return; // Already unlocked
        }
        
        this.achievements[achievementKey].unlocked = true;
        console.log(`🏆 Achievement unlocked: ${this.achievements[achievementKey].name}`);
        
        // Show notification
        this.showAchievementNotification(this.achievements[achievementKey]);
    }
    
    showAchievementNotification(achievement) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            background: linear-gradient(135deg, #FFD700, #FFA500);
            border: 3px solid #fff;
            border-radius: 15px;
            padding: 15px 20px;
            margin-bottom: 10px;
            color: #333;
            font-weight: bold;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
            animation: slideInRight 0.5s ease-out;
            pointer-events: auto;
            cursor: pointer;
        `;
        
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px;">
                <div style="font-size: 24px;">${achievement.icon}</div>
                <div>
                    <div style="font-size: 16px; margin-bottom: 2px;">Achievement Unlocked!</div>
                    <div style="font-size: 14px; color: #555;">${achievement.name}</div>
                </div>
            </div>
        `;
        
        // Add click to dismiss
        notification.addEventListener('click', () => notification.remove());
        
        // Add animation styles if not already added
        if (!document.getElementById('achievementAnimations')) {
            const style = document.createElement('style');
            style.id = 'achievementAnimations';
            style.textContent = `
                @keyframes slideInRight {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `;
            document.head.appendChild(style);
        }
        
        document.getElementById('achievementNotifications').appendChild(notification);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
    }
    
    exportAsPDF() {
        // Create a printable HTML version and use browser's print to PDF
        const spawnPoolStats = this.game.spawnPool?.getStatistics() || { encounters: {}, scores: {}, mastery: {} };
        const progression = this.game.progression;
        const playerName = this.game.dataManager?.getCurrentCharacter()?.identity.name || 'Player';
        
        const htmlContent = this.generatePDFContent(playerName, progression, spawnPoolStats);
        
        // Create a new window with the printable content
        const printWindow = window.open('', '_blank');
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        
        // Add print styles and auto-print
        printWindow.addEventListener('load', () => {
            setTimeout(() => {
                printWindow.print();
                setTimeout(() => printWindow.close(), 100);
            }, 500);
        });
        
        console.log('PDF export initiated via browser print dialog');
    }
    
    exportAsText() {
        // Create a simple text-based statistics export
        const spawnPoolStats = this.game.spawnPool?.getStatistics() || { encounters: {}, scores: {}, mastery: {} };
        const progression = this.game.progression;
        const playerName = this.game.dataManager?.getCurrentCharacter()?.identity.name || 'Player';
        
        const exportData = this.generateStatisticsReport(playerName, progression, spawnPoolStats);
        
        // Create and download the file
        const blob = new Blob([exportData], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `AlphaHunters_Statistics_${playerName}_${new Date().toISOString().split('T')[0]}.txt`;
        link.click();
        URL.revokeObjectURL(url);
        
        console.log('Statistics exported successfully');
    }
    
    generatePDFContent(playerName, progression, stats) {
        const date = new Date().toLocaleDateString();
        const totalEncounters = Object.values(stats.encounters).reduce((sum, count) => sum + count, 0);
        const averageScore = this.calculateAverageScore(stats.scores, stats.encounters);
        
        // Create achievement status
        const achievementsList = Object.entries(this.achievements).map(([key, achievement]) => {
            const status = achievement.unlocked ? '✅ UNLOCKED' : '❌ Locked';
            return `<tr><td>${achievement.icon} ${achievement.name}</td><td>${status}</td><td>${achievement.description}</td></tr>`;
        }).join('');
        
        // Create letter details
        const letters = Object.keys(stats.encounters).sort();
        const letterDetails = letters.map(letter => {
            const encounters = stats.encounters[letter] || 0;
            const totalScore = stats.scores[letter] || 0;
            const avgScore = encounters > 0 ? Math.round(totalScore / encounters) : 0;
            const mastery = stats.mastery[letter] || 'Beginner';
            
            return `<tr><td style="font-weight: bold; font-size: 18px;">${letter}</td><td>${encounters}</td><td>${avgScore}%</td><td>${mastery}</td></tr>`;
        }).join('');
        
        return `<!DOCTYPE html>
<html>
<head>
    <title>AlphaHunters Progress Report - ${playerName}</title>
    <style>
        @media print {
            @page { margin: 1in; }
            body { -webkit-print-color-adjust: exact; }
        }
        body {
            font-family: 'Comic Sans MS', cursive;
            margin: 0;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: #333;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            padding: 30px;
            border-radius: 15px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        .header {
            text-align: center;
            border-bottom: 3px solid #667eea;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .header h1 {
            color: #667eea;
            margin: 0;
            font-size: 36px;
        }
        .header h2 {
            color: #666;
            margin: 10px 0;
            font-size: 24px;
        }
        .stats-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 30px;
            margin-bottom: 30px;
        }
        .stats-box {
            background: linear-gradient(135deg, #f8f9fa, #e9ecef);
            padding: 20px;
            border-radius: 10px;
            border-left: 5px solid #667eea;
        }
        .stats-box h3 {
            margin: 0 0 15px 0;
            color: #667eea;
            font-size: 18px;
        }
        .stats-box p {
            margin: 8px 0;
            font-size: 14px;
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
        th {
            background: #667eea;
            color: white;
            font-weight: bold;
        }
        tr:nth-child(even) {
            background: #f8f9fa;
        }
        .section {
            margin: 30px 0;
        }
        .section h3 {
            color: #667eea;
            border-bottom: 2px solid #667eea;
            padding-bottom: 5px;
            margin-bottom: 15px;
        }
        .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #eee;
            color: #666;
            font-size: 12px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🏆 AlphaHunters Progress Report</h1>
            <h2>Player: ${playerName}</h2>
            <p>Generated on ${date}</p>
        </div>
        
        <div class="stats-grid">
            <div class="stats-box">
                <h3>📈 Overall Progress</h3>
                <p><strong>Level:</strong> ${progression?.playerLevel || 1}</p>
                <p><strong>Total XP:</strong> ${progression?.playerXP || 0}</p>
                <p><strong>Letters Encountered:</strong> ${Object.keys(stats.encounters).length}/52</p>
                <p><strong>Total Traces:</strong> ${totalEncounters}</p>
                <p><strong>Average Score:</strong> ${averageScore}%</p>
            </div>
            
            <div class="stats-box">
                <h3>🎯 Letter Mastery</h3>
                <p><strong>Expert (1000+ pts):</strong> ${Object.values(stats.mastery).filter(m => m === 'Expert').length}</p>
                <p><strong>Advanced (500+ pts):</strong> ${Object.values(stats.mastery).filter(m => m === 'Advanced').length}</p>
                <p><strong>Intermediate (200+ pts):</strong> ${Object.values(stats.mastery).filter(m => m === 'Intermediate').length}</p>
                <p><strong>Beginner (< 200 pts):</strong> ${Object.values(stats.mastery).filter(m => m === 'Beginner').length}</p>
            </div>
        </div>
        
        <div class="section">
            <h3>🏅 Achievements</h3>
            <table>
                <thead>
                    <tr><th>Achievement</th><th>Status</th><th>Description</th></tr>
                </thead>
                <tbody>
                    ${achievementsList}
                </tbody>
            </table>
        </div>
        
        <div class="section">
            <h3>📝 Letter Performance Details</h3>
            ${letters.length > 0 ? `
            <table>
                <thead>
                    <tr><th>Letter</th><th>Traces</th><th>Avg Score</th><th>Mastery Level</th></tr>
                </thead>
                <tbody>
                    ${letterDetails}
                </tbody>
            </table>
            ` : '<p>No letters traced yet.</p>'}
        </div>
        
        <div class="footer">
            <p>Generated by AlphaHunters Educational Game</p>
            <p>Keep practicing and have fun learning! 🌟</p>
        </div>
    </div>
</body>
</html>`;
    }
    
    generateStatisticsReport(playerName, progression, stats) {
        const date = new Date().toLocaleDateString();
        const totalEncounters = Object.values(stats.encounters).reduce((sum, count) => sum + count, 0);
        const averageScore = this.calculateAverageScore(stats.scores, stats.encounters);
        
        let report = `AlphaHunters Progress Report
=============================
Player: ${playerName}
Date: ${date}
Level: ${progression?.playerLevel || 1}
Total XP: ${progression?.playerXP || 0}

SUMMARY STATISTICS
==================
Total Letters Traced: ${totalEncounters}
Unique Letters Encountered: ${Object.keys(stats.encounters).length}/52
Average Score: ${averageScore}%

LETTER BREAKDOWN
================
`;
        
        // Sort letters alphabetically for the report
        const letters = Object.keys(stats.encounters).sort();
        letters.forEach(letter => {
            const encounters = stats.encounters[letter];
            const totalScore = stats.scores[letter] || 0;
            const avgScore = encounters > 0 ? Math.round(totalScore / encounters) : 0;
            const mastery = stats.mastery[letter] || 'Beginner';
            
            report += `${letter}: ${encounters} traces, ${avgScore}% average, ${mastery} level\n`;
        });
        
        report += `\nACHIEVEMENTS
============
`;
        
        Object.entries(this.achievements).forEach(([key, achievement]) => {
            const status = achievement.unlocked ? '✓ UNLOCKED' : '✗ Locked';
            report += `${achievement.icon} ${achievement.name}: ${status}\n`;
        });
        
        report += `\nGenerated by AlphaHunters Educational Game\n`;
        
        return report;
    }
}