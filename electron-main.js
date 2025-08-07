const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const AppUpdater = require('./auto-updater');

let mainWindow;
let serverProcess;
let appUpdater;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            webSecurity: false
        },
        icon: path.join(__dirname, 'assets/icon.png') // You can add an icon later
    });

    mainWindow.loadFile('index.html');

    // Open DevTools in development
    if (process.env.NODE_ENV === 'development') {
        mainWindow.webContents.openDevTools();
    }
    
    // Initialize auto-updater in production only
    if (app.isPackaged) {
        appUpdater = new AppUpdater(mainWindow);
    }

    mainWindow.on('closed', () => {
        mainWindow = null;
        stopServer();
    });
}

function startServer() {
    if (serverProcess) {
        console.log('Server already running');
        return;
    }

    console.log('Starting multiplayer server...');
    
    serverProcess = spawn('node', ['server.js'], {
        cwd: path.join(__dirname, 'server'),
        env: { ...process.env, PORT: 3001 }
    });

    serverProcess.stdout.on('data', (data) => {
        console.log(`Server: ${data}`);
    });

    serverProcess.stderr.on('data', (data) => {
        console.error(`Server Error: ${data}`);
    });

    serverProcess.on('close', (code) => {
        console.log(`Server process exited with code ${code}`);
        serverProcess = null;
    });
}

function stopServer() {
    if (serverProcess) {
        console.log('Stopping multiplayer server...');
        serverProcess.kill();
        serverProcess = null;
    }
}

// IPC handlers for renderer process
ipcMain.handle('start-server', async () => {
    startServer();
    return { success: true };
});

ipcMain.handle('stop-server', async () => {
    stopServer();
    return { success: true };
});

ipcMain.handle('check-server', async () => {
    return { running: serverProcess !== null };
});

app.whenReady().then(() => {
    createWindow();
    
    // Auto-start server
    startServer();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    stopServer();
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('before-quit', () => {
    stopServer();
});