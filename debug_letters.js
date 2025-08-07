// Debug script to check letter availability
// Run this in the browser console while playing

console.log("=== LETTER DEBUG SCRIPT ===");

// Check current progression state
if (window.game && window.game.progression) {
    const progression = window.game.progression;
    console.log(`Current Level: ${progression.playerLevel}`);
    console.log(`Current XP: ${progression.playerXP}`);
    
    // Manually trigger checkUnlocks
    console.log("Manually triggering checkUnlocks...");
    progression.checkUnlocks();
    
    // Check WorldManager state
    if (window.game.worldManager) {
        const wm = window.game.worldManager;
        console.log(`Available letters in WorldManager: ${wm.availableLetters.length}`);
        console.log(`Letter list: [${wm.availableLetters.join(', ')}]`);
        console.log(`Letter weights:`, Array.from(wm.letterWeights.entries()));
        console.log(`Recently spawned: [${wm.recentlySpawned.join(', ')}]`);
    } else {
        console.log("WorldManager not found!");
    }
} else {
    console.log("Game or progression not found!");
}

console.log("=== END DEBUG ===");