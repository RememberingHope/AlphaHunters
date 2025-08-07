// Server Manager for starting/stopping the multiplayer server

class ServerManager {
    constructor() {
        this.serverProcess = null;
        this.serverPort = 3001;
        this.isServerRunning = false;
        this.serverUrl = `http://localhost:${this.serverPort}`;
        
        // Check if we're in an environment that can spawn processes
        this.canSpawnProcess = this.detectEnvironment();
    }
    
    detectEnvironment() {
        // Check if we're in Electron
        if (typeof window !== 'undefined') {
            // Check for Electron via user agent
            if (navigator.userAgent.includes('Electron')) {
                try {
                    // Try to use IPC for server control
                    const { ipcRenderer } = window.require ? window.require('electron') : {};
                    if (ipcRenderer) {
                        this.ipcRenderer = ipcRenderer;
                        console.log('🖥️ Electron IPC environment detected');
                        return true;
                    }
                } catch (e) {
                    console.log('⚠️ Electron detected but IPC not available:', e);
                }
            }
            
            // Fallback to Node.js modules if available
            if (window.require) {
                try {
                    this.childProcess = window.require('child_process');
                    this.path = window.require('path');
                    console.log('🖥️ Node.js modules available');
                    return true;
                } catch (e) {
                    console.log('❌ Node.js require failed:', e);
                }
            }
        }
        
        // Check if we're in Node.js environment
        if (typeof process !== 'undefined' && process.versions && process.versions.node) {
            console.log('🟢 Node.js environment detected');
            return true;
        }
        
        console.log('🌐 Browser environment - will try alternative server start method');
        return false;
    }
    
    async startServer() {
        if (this.isServerRunning) {
            console.log('Server is already running');
            return { success: true, message: 'Server already running' };
        }
        
        // First check if server is already running
        const isRunning = await this.checkServerHealth();
        if (isRunning) {
            this.isServerRunning = true;
            return { success: true, message: 'Server already running on another instance' };
        }
        
        if (this.canSpawnProcess) {
            return this.startServerProcess();
        } else {
            return this.startServerAlternative();
        }
    }
    
    async startServerProcess() {
        // If we have Electron IPC, use it
        if (this.ipcRenderer) {
            try {
                const result = await this.ipcRenderer.invoke('start-server');
                if (result.success) {
                    this.isServerRunning = true;
                    // Give server time to start
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    return { success: true, message: 'Server started via Electron' };
                }
            } catch (error) {
                console.error('Failed to start server via IPC:', error);
            }
        }
        
        // Fallback to direct process spawn
        try {
            const serverPath = this.path ? 
                this.path.join(__dirname, '../../server/server.js') : 
                'server/server.js';
            
            console.log('Starting server at:', serverPath);
            
            // Spawn the server process
            this.serverProcess = this.childProcess.spawn('node', [serverPath], {
                cwd: this.path ? this.path.join(__dirname, '../../') : undefined,
                env: { ...process.env, PORT: this.serverPort }
            });
            
            this.serverProcess.stdout.on('data', (data) => {
                console.log(`Server: ${data}`);
            });
            
            this.serverProcess.stderr.on('data', (data) => {
                console.error(`Server Error: ${data}`);
            });
            
            this.serverProcess.on('close', (code) => {
                console.log(`Server process exited with code ${code}`);
                this.isServerRunning = false;
                this.serverProcess = null;
            });
            
            this.isServerRunning = true;
            
            // Give server time to start
            return new Promise((resolve) => {
                setTimeout(async () => {
                    const healthy = await this.checkServerHealth();
                    if (healthy) {
                        resolve({ success: true, message: 'Server started successfully' });
                    } else {
                        resolve({ success: false, message: 'Server started but health check failed' });
                    }
                }, 2000);
            });
            
        } catch (error) {
            console.error('Failed to start server process:', error);
            return { success: false, message: `Failed to start server: ${error.message}` };
        }
    }
    
    async startServerAlternative() {
        // For browser environment, we'll provide instructions or try other methods
        
        // Method 1: Try to open server in new window (if allowed)
        try {
            // Check if a simple Node.js server runner is available
            const response = await fetch(`${this.serverUrl}/health`).catch(() => null);
            if (response && response.ok) {
                this.isServerRunning = true;
                return { success: true, message: 'Server already running' };
            }
        } catch (e) {
            // Server not running
        }
        
        // Method 2: Provide instructions for manual start
        return {
            success: false,
            message: 'Please start the server manually',
            instructions: [
                '1. Open a terminal/command prompt',
                '2. Navigate to the AlphaHunter folder',
                '3. Run: cd server && npm install && npm start',
                '4. Keep the terminal open while playing'
            ]
        };
    }
    
    async stopServer() {
        if (!this.isServerRunning) {
            return { success: true, message: 'Server not running' };
        }
        
        // If we have Electron IPC, use it
        if (this.ipcRenderer) {
            try {
                const result = await this.ipcRenderer.invoke('stop-server');
                if (result.success) {
                    this.isServerRunning = false;
                    return { success: true, message: 'Server stopped via Electron' };
                }
            } catch (error) {
                console.error('Failed to stop server via IPC:', error);
            }
        }
        
        // Fallback to direct process control
        if (this.serverProcess) {
            try {
                this.serverProcess.kill();
                this.serverProcess = null;
                this.isServerRunning = false;
                return { success: true, message: 'Server stopped' };
            } catch (error) {
                return { success: false, message: `Failed to stop server: ${error.message}` };
            }
        }
        
        this.isServerRunning = false;
        return { success: true, message: 'Server marked as stopped' };
    }
    
    async checkServerHealth() {
        try {
            const response = await fetch(`${this.serverUrl}/health`, {
                method: 'GET',
                mode: 'cors',
                cache: 'no-cache'
            });
            
            if (response.ok) {
                const data = await response.json();
                console.log('Server health check:', data);
                return true;
            }
            return false;
        } catch (error) {
            return false;
        }
    }
    
    getServerStatus() {
        return {
            running: this.isServerRunning,
            port: this.serverPort,
            url: this.serverUrl,
            canAutoStart: this.canSpawnProcess
        };
    }
}

// Create a singleton instance
const serverManager = new ServerManager();

// For non-module environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = serverManager;
}