// Level Editor - Create and edit custom levels
class LevelEditor {
    constructor(game) {
        this.game = game;
        this.container = null;
        this.currentLevel = null;
        this.isEditMode = false;
        
        // Default level template
        this.defaultLevel = {
            id: null,
            name: 'New Level',
            icon: '⭐',
            duration: 120, // 2 minutes
            letters: ['a', 'b', 'c'],
            theme: {
                background: '#E8F5E9',
                primaryColor: '#4CAF50',
                secondaryColor: '#81C784',
                decorations: ['tree', 'flower']
            },
            starThresholds: [100, 200, 300],
            spawnRate: 2.0,
            createdBy: 'teacher',
            createdDate: null,
            isCustom: true
        };
        
        // Available options
        this.availableIcons = ['⭐', '🌟', '✨', '💫', '🎯', '🎮', '🏆', '🎨', '📚', '🌈', 
                               '🌸', '🌺', '🌻', '🌲', '🌊', '🏔️', '🦋', '🐝', '🦄', '🐢'];
        
        this.availableThemes = {
            forest: {
                name: 'Forest',
                background: '#E8F5E9',
                primaryColor: '#4CAF50',
                secondaryColor: '#81C784',
                decorations: ['tree', 'flower', 'mushroom']
            },
            ocean: {
                name: 'Ocean',
                background: '#E3F2FD',
                primaryColor: '#2196F3',
                secondaryColor: '#64B5F6',
                decorations: ['wave', 'fish', 'shell']
            },
            space: {
                name: 'Space',
                background: '#1A237E',
                primaryColor: '#3F51B5',
                secondaryColor: '#5C6BC0',
                decorations: ['star', 'planet', 'rocket']
            },
            desert: {
                name: 'Desert',
                background: '#FFF8E1',
                primaryColor: '#FF9800',
                secondaryColor: '#FFB74D',
                decorations: ['cactus', 'sun', 'sand']
            },
            candy: {
                name: 'Candy Land',
                background: '#FCE4EC',
                primaryColor: '#E91E63',
                secondaryColor: '#F06292',
                decorations: ['candy', 'lollipop', 'cupcake']
            }
        };
        
        this.allLetters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    }
    
    show(levelId = null) {
        if (levelId) {
            // Load existing level for editing
            this.isEditMode = true;
            this.currentLevel = this.loadLevel(levelId);
        } else {
            // Create new level
            this.isEditMode = false;
            this.currentLevel = { ...this.defaultLevel };
            this.currentLevel.id = 'custom_' + Date.now();
            this.currentLevel.createdDate = new Date().toISOString();
        }
        
        this.render();
    }
    
    render() {
        if (!this.container) {
            this.createContainer();
        }
        
        this.container.innerHTML = `
            <div style="
                background: white;
                width: 90%;
                max-width: 1000px;
                max-height: 90vh;
                margin: 5vh auto;
                border-radius: 12px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                overflow: hidden;
                display: flex;
                flex-direction: column;
            ">
                <!-- Header -->
                <div style="
                    background: #1976D2;
                    color: white;
                    padding: 20px 30px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                ">
                    <h2 style="margin: 0; font-size: 24px;">
                        ${this.isEditMode ? '✏️ Edit Level' : '➕ Create New Level'}
                    </h2>
                    <button id="closeLevelEditor" style="
                        background: rgba(255,255,255,0.2);
                        border: none;
                        color: white;
                        padding: 8px 16px;
                        border-radius: 6px;
                        cursor: pointer;
                        font-size: 16px;
                    ">✕ Close</button>
                </div>
                
                <!-- Content -->
                <div style="
                    flex: 1;
                    overflow-y: auto;
                    display: flex;
                ">
                    <!-- Left Panel - Settings -->
                    <div style="
                        width: 400px;
                        padding: 30px;
                        border-right: 1px solid #e0e0e0;
                        overflow-y: auto;
                    ">
                        <h3 style="color: #333; margin-bottom: 20px;">Level Settings</h3>
                        
                        <!-- Name and Icon -->
                        <div style="margin-bottom: 25px;">
                            <label style="display: block; color: #666; margin-bottom: 8px; font-weight: 500;">
                                Level Name
                            </label>
                            <input type="text" id="levelName" value="${this.currentLevel.name}" style="
                                width: 100%;
                                padding: 10px;
                                border: 1px solid #ddd;
                                border-radius: 6px;
                                font-size: 16px;
                            ">
                        </div>
                        
                        <div style="margin-bottom: 25px;">
                            <label style="display: block; color: #666; margin-bottom: 8px; font-weight: 500;">
                                Icon
                            </label>
                            <div style="display: grid; grid-template-columns: repeat(10, 1fr); gap: 5px;">
                                ${this.availableIcons.map(icon => `
                                    <button class="icon-selector" data-icon="${icon}" style="
                                        padding: 10px;
                                        border: 2px solid ${this.currentLevel.icon === icon ? '#1976D2' : '#ddd'};
                                        background: ${this.currentLevel.icon === icon ? '#E3F2FD' : 'white'};
                                        border-radius: 6px;
                                        cursor: pointer;
                                        font-size: 20px;
                                        transition: all 0.2s;
                                    ">${icon}</button>
                                `).join('')}
                            </div>
                        </div>
                        
                        <!-- Duration -->
                        <div style="margin-bottom: 25px;">
                            <label style="display: block; color: #666; margin-bottom: 8px; font-weight: 500;">
                                Duration (seconds)
                            </label>
                            <input type="range" id="levelDuration" 
                                min="30" max="300" step="30" 
                                value="${this.currentLevel.duration}" 
                                style="width: 100%;">
                            <div style="display: flex; justify-content: space-between; margin-top: 5px;">
                                <span style="color: #999;">30s</span>
                                <span id="durationDisplay" style="color: #333; font-weight: bold;">
                                    ${this.formatDuration(this.currentLevel.duration)}
                                </span>
                                <span style="color: #999;">5m</span>
                            </div>
                        </div>
                        
                        <!-- Theme -->
                        <div style="margin-bottom: 25px;">
                            <label style="display: block; color: #666; margin-bottom: 8px; font-weight: 500;">
                                Theme
                            </label>
                            <div style="display: grid; gap: 10px;">
                                ${Object.entries(this.availableThemes).map(([key, theme]) => `
                                    <button class="theme-selector" data-theme="${key}" style="
                                        padding: 15px;
                                        border: 2px solid ${this.isThemeSelected(theme) ? '#1976D2' : '#ddd'};
                                        background: linear-gradient(to right, ${theme.background}, ${theme.primaryColor});
                                        border-radius: 8px;
                                        cursor: pointer;
                                        color: white;
                                        font-weight: 500;
                                        text-shadow: 1px 1px 2px rgba(0,0,0,0.3);
                                        transition: all 0.2s;
                                    ">${theme.name}</button>
                                `).join('')}
                            </div>
                        </div>
                        
                        <!-- Star Thresholds -->
                        <div style="margin-bottom: 25px;">
                            <label style="display: block; color: #666; margin-bottom: 8px; font-weight: 500;">
                                Star Thresholds
                            </label>
                            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;">
                                <div>
                                    <div style="text-align: center; color: #999; margin-bottom: 5px;">⭐</div>
                                    <input type="number" id="star1" value="${this.currentLevel.starThresholds[0]}" 
                                        min="50" max="1000" step="50" style="
                                        width: 100%;
                                        padding: 8px;
                                        border: 1px solid #ddd;
                                        border-radius: 6px;
                                        text-align: center;
                                    ">
                                </div>
                                <div>
                                    <div style="text-align: center; color: #999; margin-bottom: 5px;">⭐⭐</div>
                                    <input type="number" id="star2" value="${this.currentLevel.starThresholds[1]}" 
                                        min="100" max="2000" step="50" style="
                                        width: 100%;
                                        padding: 8px;
                                        border: 1px solid #ddd;
                                        border-radius: 6px;
                                        text-align: center;
                                    ">
                                </div>
                                <div>
                                    <div style="text-align: center; color: #999; margin-bottom: 5px;">⭐⭐⭐</div>
                                    <input type="number" id="star3" value="${this.currentLevel.starThresholds[2]}" 
                                        min="150" max="3000" step="50" style="
                                        width: 100%;
                                        padding: 8px;
                                        border: 1px solid #ddd;
                                        border-radius: 6px;
                                        text-align: center;
                                    ">
                                </div>
                            </div>
                        </div>
                        
                        <!-- Spawn Rate -->
                        <div style="margin-bottom: 25px;">
                            <label style="display: block; color: #666; margin-bottom: 8px; font-weight: 500;">
                                Spawn Rate
                            </label>
                            <input type="range" id="spawnRate" 
                                min="0.5" max="5" step="0.5" 
                                value="${this.currentLevel.spawnRate}" 
                                style="width: 100%;">
                            <div style="display: flex; justify-content: space-between; margin-top: 5px;">
                                <span style="color: #999;">Slow</span>
                                <span id="spawnRateDisplay" style="color: #333; font-weight: bold;">
                                    ${this.currentLevel.spawnRate}x
                                </span>
                                <span style="color: #999;">Fast</span>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Right Panel - Letter Selection -->
                    <div style="
                        flex: 1;
                        padding: 30px;
                        overflow-y: auto;
                    ">
                        <h3 style="color: #333; margin-bottom: 20px;">
                            Letter Selection
                            <span style="
                                background: #1976D2;
                                color: white;
                                padding: 4px 12px;
                                border-radius: 20px;
                                font-size: 14px;
                                margin-left: 10px;
                            ">${this.currentLevel.letters.length} selected</span>
                        </h3>
                        
                        <div style="margin-bottom: 20px;">
                            <button id="selectAllLetters" style="
                                background: #4CAF50;
                                color: white;
                                border: none;
                                padding: 8px 16px;
                                border-radius: 6px;
                                cursor: pointer;
                                margin-right: 10px;
                            ">Select All</button>
                            <button id="clearAllLetters" style="
                                background: #f44336;
                                color: white;
                                border: none;
                                padding: 8px 16px;
                                border-radius: 6px;
                                cursor: pointer;
                                margin-right: 10px;
                            ">Clear All</button>
                            <button id="selectVowels" style="
                                background: #FF9800;
                                color: white;
                                border: none;
                                padding: 8px 16px;
                                border-radius: 6px;
                                cursor: pointer;
                            ">Vowels Only</button>
                        </div>
                        
                        <div style="display: grid; grid-template-columns: repeat(13, 1fr); gap: 5px;">
                            ${this.allLetters.map(letter => `
                                <button class="letter-selector" data-letter="${letter}" style="
                                    padding: 12px;
                                    border: 2px solid ${this.currentLevel.letters.includes(letter) ? '#1976D2' : '#ddd'};
                                    background: ${this.currentLevel.letters.includes(letter) ? '#E3F2FD' : 'white'};
                                    border-radius: 6px;
                                    cursor: pointer;
                                    font-size: 18px;
                                    font-weight: 500;
                                    transition: all 0.2s;
                                ">${letter}</button>
                            `).join('')}
                        </div>
                        
                        <!-- Preview -->
                        <div style="
                            margin-top: 40px;
                            padding: 20px;
                            background: #f5f5f5;
                            border-radius: 8px;
                        ">
                            <h4 style="color: #333; margin-bottom: 15px;">Preview</h4>
                            <div id="levelPreview" style="
                                background: ${this.currentLevel.theme.background};
                                padding: 20px;
                                border-radius: 8px;
                                min-height: 150px;
                                position: relative;
                                overflow: hidden;
                            ">
                                <div style="
                                    text-align: center;
                                    color: ${this.currentLevel.theme.primaryColor};
                                ">
                                    <div style="font-size: 48px; margin-bottom: 10px;">
                                        ${this.currentLevel.icon}
                                    </div>
                                    <div style="font-size: 24px; font-weight: bold;">
                                        ${this.currentLevel.name}
                                    </div>
                                    <div style="font-size: 18px; opacity: 0.8; margin-top: 10px;">
                                        ${this.currentLevel.letters.slice(0, 10).join(' ')}
                                        ${this.currentLevel.letters.length > 10 ? '...' : ''}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Footer -->
                <div style="
                    padding: 20px 30px;
                    border-top: 1px solid #e0e0e0;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    background: #fafafa;
                ">
                    <button id="testLevel" style="
                        background: #FF9800;
                        color: white;
                        border: none;
                        padding: 12px 24px;
                        border-radius: 8px;
                        font-size: 16px;
                        cursor: pointer;
                    ">🎮 Test Level</button>
                    
                    <div>
                        <button id="cancelLevel" style="
                            background: #666;
                            color: white;
                            border: none;
                            padding: 12px 24px;
                            border-radius: 8px;
                            font-size: 16px;
                            cursor: pointer;
                            margin-right: 10px;
                        ">Cancel</button>
                        <button id="saveLevel" style="
                            background: #4CAF50;
                            color: white;
                            border: none;
                            padding: 12px 24px;
                            border-radius: 8px;
                            font-size: 16px;
                            cursor: pointer;
                        ">💾 Save Level</button>
                    </div>
                </div>
            </div>
        `;
        
        this.container.style.display = 'flex';
        this.attachEventListeners();
    }
    
    createContainer() {
        this.container = document.createElement('div');
        this.container.id = 'levelEditorContainer';
        this.container.style.cssText = `
            position: fixed;
            top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0, 0, 0, 0.8);
            display: none;
            justify-content: center;
            align-items: center;
            z-index: 6000;
        `;
        document.body.appendChild(this.container);
    }
    
    attachEventListeners() {
        // Close button
        document.getElementById('closeLevelEditor')?.addEventListener('click', () => {
            this.close();
        });
        
        // Name input
        document.getElementById('levelName')?.addEventListener('input', (e) => {
            this.currentLevel.name = e.target.value;
            this.updatePreview();
        });
        
        // Icon selection
        this.container.querySelectorAll('.icon-selector').forEach(btn => {
            btn.addEventListener('click', () => {
                this.currentLevel.icon = btn.dataset.icon;
                this.render();
            });
        });
        
        // Duration slider
        const durationSlider = document.getElementById('levelDuration');
        const durationDisplay = document.getElementById('durationDisplay');
        durationSlider?.addEventListener('input', (e) => {
            this.currentLevel.duration = parseInt(e.target.value);
            durationDisplay.textContent = this.formatDuration(this.currentLevel.duration);
        });
        
        // Theme selection
        this.container.querySelectorAll('.theme-selector').forEach(btn => {
            btn.addEventListener('click', () => {
                const theme = this.availableThemes[btn.dataset.theme];
                this.currentLevel.theme = { ...theme };
                delete this.currentLevel.theme.name;
                this.render();
            });
        });
        
        // Star thresholds
        ['star1', 'star2', 'star3'].forEach((id, index) => {
            document.getElementById(id)?.addEventListener('input', (e) => {
                this.currentLevel.starThresholds[index] = parseInt(e.target.value) || 0;
            });
        });
        
        // Spawn rate
        const spawnRateSlider = document.getElementById('spawnRate');
        const spawnRateDisplay = document.getElementById('spawnRateDisplay');
        spawnRateSlider?.addEventListener('input', (e) => {
            this.currentLevel.spawnRate = parseFloat(e.target.value);
            spawnRateDisplay.textContent = this.currentLevel.spawnRate + 'x';
        });
        
        // Letter selection
        this.container.querySelectorAll('.letter-selector').forEach(btn => {
            btn.addEventListener('click', () => {
                const letter = btn.dataset.letter;
                if (this.currentLevel.letters.includes(letter)) {
                    this.currentLevel.letters = this.currentLevel.letters.filter(l => l !== letter);
                } else {
                    this.currentLevel.letters.push(letter);
                }
                this.render();
            });
        });
        
        // Letter selection helpers
        document.getElementById('selectAllLetters')?.addEventListener('click', () => {
            this.currentLevel.letters = [...this.allLetters];
            this.render();
        });
        
        document.getElementById('clearAllLetters')?.addEventListener('click', () => {
            this.currentLevel.letters = [];
            this.render();
        });
        
        document.getElementById('selectVowels')?.addEventListener('click', () => {
            this.currentLevel.letters = ['a', 'e', 'i', 'o', 'u', 'A', 'E', 'I', 'O', 'U'];
            this.render();
        });
        
        // Action buttons
        document.getElementById('testLevel')?.addEventListener('click', () => {
            this.testLevel();
        });
        
        document.getElementById('cancelLevel')?.addEventListener('click', () => {
            if (confirm('Are you sure you want to cancel? Unsaved changes will be lost.')) {
                this.close();
            }
        });
        
        document.getElementById('saveLevel')?.addEventListener('click', () => {
            this.saveLevel();
        });
    }
    
    updatePreview() {
        const preview = document.getElementById('levelPreview');
        if (preview) {
            preview.innerHTML = `
                <div style="
                    text-align: center;
                    color: ${this.currentLevel.theme.primaryColor};
                ">
                    <div style="font-size: 48px; margin-bottom: 10px;">
                        ${this.currentLevel.icon}
                    </div>
                    <div style="font-size: 24px; font-weight: bold;">
                        ${this.currentLevel.name}
                    </div>
                    <div style="font-size: 18px; opacity: 0.8; margin-top: 10px;">
                        ${this.currentLevel.letters.slice(0, 10).join(' ')}
                        ${this.currentLevel.letters.length > 10 ? '...' : ''}
                    </div>
                </div>
            `;
        }
    }
    
    formatDuration(seconds) {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return minutes > 0 ? `${minutes}m ${secs}s` : `${secs}s`;
    }
    
    isThemeSelected(theme) {
        return this.currentLevel.theme.background === theme.background &&
               this.currentLevel.theme.primaryColor === theme.primaryColor;
    }
    
    testLevel() {
        // Save level temporarily and start it
        console.log('Testing level:', this.currentLevel);
        alert('Test mode coming soon! This will let you play the level without saving.');
    }
    
    saveLevel() {
        // Validate level
        if (!this.currentLevel.name || this.currentLevel.name.trim() === '') {
            alert('Please enter a level name');
            return;
        }
        
        if (this.currentLevel.letters.length === 0) {
            alert('Please select at least one letter');
            return;
        }
        
        // Save to localStorage
        const customLevels = this.loadCustomLevels();
        
        if (this.isEditMode) {
            // Update existing level
            const index = customLevels.findIndex(l => l.id === this.currentLevel.id);
            if (index !== -1) {
                customLevels[index] = this.currentLevel;
            }
        } else {
            // Add new level
            customLevels.push(this.currentLevel);
        }
        
        localStorage.setItem('alphahunters_custom_levels', JSON.stringify(customLevels));
        
        console.log('✅ Level saved:', this.currentLevel);
        alert('Level saved successfully!');
        
        // Refresh teacher dashboard if needed
        if (this.game.teacherDashboard) {
            this.game.teacherDashboard.render();
        }
        
        this.close();
    }
    
    loadCustomLevels() {
        const stored = localStorage.getItem('alphahunters_custom_levels');
        return stored ? JSON.parse(stored) : [];
    }
    
    loadLevel(levelId) {
        const customLevels = this.loadCustomLevels();
        return customLevels.find(l => l.id === levelId) || { ...this.defaultLevel };
    }
    
    close() {
        this.container.style.display = 'none';
        this.currentLevel = null;
    }
}