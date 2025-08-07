// Leaderboard system for tracking player and bot rankings

class Leaderboard {
    constructor(game) {
        this.game = game;
        this.lastUpdateTime = 0;
        this.updateInterval = 1000; // Update every second
        
        this.init();
    }
    
    init() {
        // Leaderboard ready
    }
    
    update() {
        const currentTime = Date.now();
        if (currentTime - this.lastUpdateTime > this.updateInterval) {
            this.updateLeaderboard();
            this.lastUpdateTime = currentTime;
        }
    }
    
    updateLeaderboard() {
        const rankings = this.calculateRankings();
        this.displayLeaderboard(rankings);
    }
    
    calculateRankings() {
        const entries = [];
        
        // Add player entry
        if (this.game.progression) {
            const playerScore = this.calculatePlayerScore();
            const playerName = this.game.dataManager?.getCurrentCharacter()?.identity?.name || 'You';
            console.log(`🏆 Adding player '${playerName}' to leaderboard with score: ${playerScore}`);
            entries.push({
                name: playerName,
                score: playerScore,
                isPlayer: true
            });
        } else {
            console.log(`⚠️ No progression system found for leaderboard`);
        }
        
        // Add multiplayer players if connected
        if (this.game.multiplayerManager && this.game.multiplayerManager.isConnected()) {
            const mpPlayers = this.game.multiplayerManager.getAllPlayers();
            mpPlayers.forEach((player, id) => {
                if (!player.isSelf) {  // Don't double-add the local player
                    entries.push({
                        name: `${player.emoji} ${player.name}`,
                        score: player.score || 0,
                        isPlayer: false,
                        isMultiplayer: true
                    });
                }
            });
        }
        
        // Add bot entries
        if (this.game.bots) {
            for (const bot of this.game.bots) {
                if (bot.isActive) {
                    entries.push({
                        name: bot.name,
                        score: bot.score,
                        isPlayer: false
                    });
                }
            }
        }
        
        // Sort by score descending
        entries.sort((a, b) => b.score - a.score);
        
        console.log(`🏆 Sorted entries:`, entries.map(e => `${e.name}(${e.isPlayer ? 'player' : 'bot'}): ${e.score}`));
        
        // Add ranks
        entries.forEach((entry, index) => {
            entry.rank = index + 1;
        });
        
        return entries;
    }
    
    calculatePlayerScore() {
        // Show the total score including XP bonus during levels
        if (this.game.levelManager && this.game.levelManager.isLevelActive()) {
            const baseScore = this.game.levelManager.currentLevelScore || 0;
            const xpEarned = this.game.levelManager.currentLevelXP || 0;
            const xpBonus = xpEarned * 10; // Each XP point adds 10 to the final score
            const totalScore = baseScore + xpBonus;
            console.log(`🏆 LEVEL ACTIVE: Base score ${baseScore} + XP bonus ${xpBonus} = ${totalScore}`);
            return totalScore;
        }
        
        // If no level is active, show 0
        console.log(`🏆 NO ACTIVE LEVEL: Showing score 0`);
        return 0;
    }
    
    displayLeaderboard(rankings) {
        const leaderboardList = document.getElementById('leaderboardList');
        if (!leaderboardList) {
            console.log('⚠️ Leaderboard list element not found');
            return;
        }
        
        console.log(`🏆 Displaying leaderboard with ${rankings.length} entries:`, rankings.map(r => `${r.name}: ${r.score}`));
        
        leaderboardList.innerHTML = '';
        
        // Show top 10 entries, but always include player
        let topEntries = rankings.slice(0, 10);
        
        // Ensure player is always visible
        const playerEntry = rankings.find(entry => entry.isPlayer);
        if (playerEntry && !topEntries.includes(playerEntry)) {
            // Remove last entry and add player
            topEntries = topEntries.slice(0, 9);
            topEntries.push(playerEntry);
            console.log(`🏆 Added player to leaderboard display (rank ${playerEntry.rank})`);
        }
        
        topEntries.forEach(entry => {
            const entryElement = document.createElement('div');
            let className = 'leaderboard-entry';
            if (entry.isPlayer) {
                className += ' player';
            } else if (entry.isMultiplayer) {
                className += ' multiplayer';
            }
            entryElement.className = className;
            
            entryElement.innerHTML = `
                <span class="leaderboard-rank">${this.getRankDisplay(entry.rank)}</span>
                <span class="leaderboard-name">${entry.name}</span>
                <span class="leaderboard-score">${this.formatScore(entry.score)}</span>
            `;
            
            leaderboardList.appendChild(entryElement);
        });
    }
    
    getRankDisplay(rank) {
        switch (rank) {
            case 1: return '🥇';
            case 2: return '🥈';
            case 3: return '🥉';
            default: return `#${rank}`;
        }
    }
    
    formatScore(score) {
        // Always round to whole number first
        const roundedScore = Math.round(score);
        if (roundedScore >= 1000) {
            return (roundedScore / 1000).toFixed(1) + 'k';
        }
        return roundedScore.toString();
    }
    
    getPlayerRank() {
        const rankings = this.calculateRankings();
        const playerEntry = rankings.find(entry => entry.isPlayer);
        return playerEntry ? playerEntry.rank : null;
    }
}