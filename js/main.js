// Main entry point for AlphaHunters

let game = null;

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    try {
        console.log('DOM loaded, starting AlphaHunters...');
        
        // Add a small delay to ensure all elements are ready
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Create and initialize game
        console.log('Creating game instance...');
        game = new Game();
        
        console.log('Initializing game...');
        await game.init();
        
        console.log('AlphaHunters started successfully!');
    } catch (error) {
        console.error('Failed to start AlphaHunters:', error);
        showStartupError(error);
    }
});

// Handle page unload
window.addEventListener('beforeunload', (e) => {
    if (game && game.dataManager) {
        game.dataManager.save();
    }
});

// Error handling for startup failures
function showStartupError(error) {
    const gameContainer = document.getElementById('gameContainer');
    gameContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; font-family: 'Comic Sans MS', cursive;">
            <h1 style="color: #d32f2f; margin-bottom: 20px;">Oops! Something went wrong</h1>
            <p style="color: #333; margin-bottom: 20px; text-align: center; max-width: 400px;">
                AlphaHunters couldn't start properly. This might be due to browser compatibility or missing features.
            </p>
            <button onclick="location.reload()" style="
                padding: 12px 24px;
                font-size: 16px;
                font-weight: bold;
                border: 3px solid #333;
                border-radius: 15px;
                background: linear-gradient(to bottom, #4CAF50, #45a049);
                color: white;
                cursor: pointer;
                font-family: inherit;
            ">
                Try Again
            </button>
            <details style="margin-top: 20px; max-width: 500px;">
                <summary style="cursor: pointer; color: #666;">Technical Details</summary>
                <pre style="background: #f5f5f5; padding: 10px; border-radius: 5px; font-size: 12px; overflow: auto; margin-top: 10px;">
${error.stack || error.message}
                </pre>
            </details>
        </div>
    `;
}

// Global error handler
let lastErrorSave = 0;
window.addEventListener('error', (e) => {
    console.error('Global error:', e.error);
    
    // Only save on critical errors, not every minor issue
    // and throttle saves to once per 5 seconds
    const now = Date.now();
    if (game && (now - lastErrorSave > 5000)) {
        // Only save for critical errors that might lose data
        const isCritical = e.error && (
            e.error.message?.includes('Cannot read') ||
            e.error.message?.includes('undefined is not') ||
            e.error.stack?.includes('Game.js') ||
            e.error.stack?.includes('DataManager.js')
        );
        
        if (isCritical) {
            lastErrorSave = now;
            try {
                game.dataManager?.save();
            } catch (saveError) {
                console.error('Failed to save on error:', saveError);
            }
        }
    }
});

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled promise rejection:', e.reason);
    e.preventDefault(); // Prevent default browser behavior
});

// Export game instance for debugging
window.AlphaHunters = {
    game: () => game,
    version: '0.1.0-mvp'
};