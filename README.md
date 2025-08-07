# AlphaHunter - Letter Tracing Adventure Game

An educational game for kids to learn letter tracing with multiplayer support!

## 🎮 Quick Start

### Option 1: Simple Browser Mode (Single Player)
Just open `index.html` in your web browser to play single-player mode.

### Option 2: With Multiplayer Support

#### Windows:
Double-click `start-alphahunter.bat`

#### Mac/Linux:
```bash
chmod +x start-alphahunter.sh
./start-alphahunter.sh
```

#### Manual Start:
1. Open a terminal in the AlphaHunter folder
2. Start the server:
   ```bash
   cd server
   npm install
   npm start
   ```
3. Open `index.html` in your browser

### Option 3: Electron App (Best Experience)
```bash
npm install
npm start
```

## 🎯 How to Play

### Single Player:
1. Create a character
2. Select levels to trace letters
3. Collect letterlings and earn coins
4. Visit the Pet Farm to see your rescued letter pets

### Multiplayer (LAN):
1. Ensure all players are on the same network
2. **Host**: Click "Host" → Select a level → Share the 3-emoji room code
3. **Join**: Click "Join" → Enter the 3-emoji room code
4. Race to collect letters together!

## 🏠 Multiplayer Features

- **Emoji Room Codes**: Easy-to-share codes like 🐶🍕⚽
- **Real-time Sync**: See other players move in real-time
- **Shared Scoring**: Track everyone's progress
- **LAN Play**: Works on your home/school network

## 🛠️ Technical Requirements

- Modern web browser (Chrome, Firefox, Edge, Safari)
- For multiplayer: Node.js 14+ installed
- All players must be on the same local network

## 📁 Project Structure

```
AlphaHunter/
├── index.html          # Main game file
├── js/                 # Game scripts
├── server/             # Multiplayer server
├── styles/             # CSS files
├── assets/             # Game assets
└── start-alphahunter.* # Quick start scripts
```

## 🐛 Troubleshooting

### Server won't start:
- Make sure Node.js is installed: `node --version`
- Check if port 3001 is available
- Try running server manually from terminal

### Can't join multiplayer:
- Verify all devices are on same WiFi network
- Check firewall settings for port 3001
- Make sure server is running on host computer

### Game runs slowly:
- Close other browser tabs
- Try a different browser
- Reduce browser window size

## 🎨 Features

- 📝 Letter tracing with multi-stroke support
- 🐾 Pet collection system
- 💰 Coin economy for skins
- 🏆 Achievement tracking
- 📊 Progress tracking per character
- 🌈 Multiple character support
- 🎮 LAN multiplayer mode

## 👨‍👩‍👧‍👦 For Parents & Teachers

AlphaHunter helps children learn:
- Letter recognition and formation
- Fine motor skills through tracing
- Following multi-step instructions
- Turn-taking in multiplayer mode

Track progress through the built-in statistics and achievement system!

## 📄 License

This is an educational project designed for learning purposes.

---

Have fun learning letters! 🎉