const { autoUpdater } = require('electron-updater');
const { dialog, BrowserWindow } = require('electron');

class AppUpdater {
    constructor(mainWindow) {
        this.mainWindow = mainWindow;
        
        // Configure auto-updater
        autoUpdater.autoDownload = false;
        autoUpdater.autoInstallOnAppQuit = true;
        
        // Set up event handlers
        this.setupEventHandlers();
        
        // Check for updates
        this.checkForUpdates();
    }
    
    setupEventHandlers() {
        // Update available
        autoUpdater.on('update-available', (info) => {
            dialog.showMessageBox(this.mainWindow, {
                type: 'info',
                title: 'Update Available',
                message: `A new version (${info.version}) is available!`,
                detail: 'Would you like to download and install it now?',
                buttons: ['Install Now', 'Later'],
                defaultId: 0,
                cancelId: 1
            }).then((result) => {
                if (result.response === 0) {
                    autoUpdater.downloadUpdate();
                    this.showDownloadProgress();
                }
            });
        });
        
        // No update available
        autoUpdater.on('update-not-available', () => {
            console.log('App is up to date');
        });
        
        // Download progress
        autoUpdater.on('download-progress', (progressObj) => {
            let message = `Download speed: ${this.formatBytes(progressObj.bytesPerSecond)}/s`;
            message += ` - Downloaded ${progressObj.percent.toFixed(2)}%`;
            message += ` (${this.formatBytes(progressObj.transferred)} / ${this.formatBytes(progressObj.total)})`;
            
            console.log(message);
            
            // Send progress to renderer
            this.mainWindow.webContents.send('download-progress', progressObj);
        });
        
        // Update downloaded
        autoUpdater.on('update-downloaded', () => {
            dialog.showMessageBox(this.mainWindow, {
                type: 'info',
                title: 'Update Ready',
                message: 'Update downloaded successfully!',
                detail: 'The application will restart to apply the update.',
                buttons: ['Restart Now', 'Later'],
                defaultId: 0,
                cancelId: 1
            }).then((result) => {
                if (result.response === 0) {
                    autoUpdater.quitAndInstall();
                }
            });
        });
        
        // Error handling
        autoUpdater.on('error', (error) => {
            dialog.showErrorBox('Update Error', 
                `An error occurred while updating: ${error.message}`);
        });
    }
    
    checkForUpdates() {
        // Check for updates on startup
        autoUpdater.checkForUpdatesAndNotify();
        
        // Check every 4 hours
        setInterval(() => {
            autoUpdater.checkForUpdatesAndNotify();
        }, 4 * 60 * 60 * 1000);
    }
    
    showDownloadProgress() {
        // Create progress window
        const progressWindow = new BrowserWindow({
            width: 400,
            height: 200,
            parent: this.mainWindow,
            modal: true,
            show: false,
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false
            }
        });
        
        progressWindow.loadURL(`data:text/html,
            <html>
            <head>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        padding: 20px;
                        background: #f0f0f0;
                    }
                    h2 { margin-top: 0; }
                    .progress-bar {
                        width: 100%;
                        height: 30px;
                        background: #ddd;
                        border-radius: 5px;
                        overflow: hidden;
                    }
                    .progress-fill {
                        height: 100%;
                        background: #4CAF50;
                        transition: width 0.3s;
                        width: 0%;
                    }
                    .info { margin-top: 10px; color: #666; }
                </style>
            </head>
            <body>
                <h2>Downloading Update...</h2>
                <div class="progress-bar">
                    <div class="progress-fill" id="progress"></div>
                </div>
                <div class="info" id="info">Starting download...</div>
                <script>
                    const { ipcRenderer } = require('electron');
                    ipcRenderer.on('download-progress', (event, progress) => {
                        document.getElementById('progress').style.width = progress.percent + '%';
                        document.getElementById('info').innerText = 
                            'Downloaded ' + progress.percent.toFixed(2) + '%';
                    });
                </script>
            </body>
            </html>
        `);
        
        progressWindow.once('ready-to-show', () => {
            progressWindow.show();
        });
        
        // Close progress window when download is complete
        autoUpdater.once('update-downloaded', () => {
            progressWindow.close();
        });
    }
    
    formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}

module.exports = AppUpdater;