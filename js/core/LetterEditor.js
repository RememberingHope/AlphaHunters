// Letter Template Editor - Visual stroke editor for modifying letter tracing patterns
class LetterEditor {
    constructor(game) {
        this.game = game;
        this.container = null;
        this.canvas = null;
        this.ctx = null;
        this.previewCanvas = null;
        this.previewCtx = null;
        
        // Editor state
        this.currentLetter = 'A';
        this.currentStroke = 0;
        this.strokes = [];
        this.editMode = 'add'; // add, edit, delete
        this.selectedPoint = null;
        this.isDragging = false;
        
        // Canvas settings
        this.canvasWidth = 400;
        this.canvasHeight = 400;
        this.gridSize = 20;
        this.showGrid = true;
        this.showGuidelines = true;
        this.snapToGrid = false;
        
        // Guidelines positions (matching TracePanel)
        this.guidelines = {
            topLine: 100,
            midLine: 200,
            baseline: 300,
            leftMargin: 50,
            rightMargin: 350
        };
        
        // Available characters including non-English
        this.characterSets = {
            uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
            lowercase: 'abcdefghijklmnopqrstuvwxyz',
            numbers: '0123456789',
            special: '!@#$%^&*()+-=[]{}|;:,.<>?/',
            greek: 'ΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩαβγδεζηθικλμνξοπρστυφχψω',
            cyrillic: 'АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯабвгдеёжзийклмнопрстуфхцчшщъыьэюя',
            arabic: 'أبتثجحخدذرزسشصضطظعغفقكلمنهوي',
            custom: ''
        };
        
        this.init();
    }
    
    init() {
        this.createContainer();
        this.loadCustomTemplates();
    }
    
    createContainer() {
        // Create main editor container
        this.container = document.createElement('div');
        this.container.id = 'letterEditor';
        this.container.style.cssText = `
            position: fixed;
            top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0, 0, 0, 0.95);
            display: none;
            z-index: 6000;
            overflow: auto;
        `;
        
        document.body.appendChild(this.container);
    }
    
    show(letter = null) {
        this.container.style.display = 'flex';
        this.container.style.alignItems = 'center';
        this.container.style.justifyContent = 'center';
        
        if (letter) {
            this.currentLetter = letter;
            this.loadLetterTemplate(letter);
        } else {
            this.currentLetter = 'A';
            this.loadLetterTemplate('A');
        }
        
        this.render();
    }
    
    hide() {
        this.container.style.display = 'none';
    }
    
    render() {
        this.container.innerHTML = `
            <div style="
                background: white;
                width: 95%;
                max-width: 1200px;
                max-height: 95vh;
                border-radius: 16px;
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
                    <h2 style="margin: 0; font-size: 24px;">✏️ Letter Template Editor</h2>
                    <button id="closeLetterEditor" style="
                        background: rgba(255, 255, 255, 0.2);
                        border: none;
                        color: white;
                        padding: 8px 16px;
                        border-radius: 8px;
                        cursor: pointer;
                        font-size: 16px;
                    ">✕ Close</button>
                </div>
                
                <!-- Main Content -->
                <div style="flex: 1; display: flex; overflow: hidden;">
                    <!-- Left Panel - Character Selection -->
                    <div style="
                        width: 200px;
                        background: #f5f5f5;
                        padding: 20px;
                        overflow-y: auto;
                        border-right: 1px solid #ddd;
                    ">
                        <h3 style="margin: 0 0 15px 0; font-size: 18px;">Character Sets</h3>
                        
                        ${Object.entries(this.characterSets).map(([setName, chars]) => `
                            <div style="margin-bottom: 20px;">
                                <h4 style="
                                    text-transform: capitalize;
                                    color: #666;
                                    font-size: 14px;
                                    margin-bottom: 10px;
                                ">${setName}</h4>
                                <div style="
                                    display: flex;
                                    flex-wrap: wrap;
                                    gap: 5px;
                                ">
                                    ${setName === 'custom' ? `
                                        <input id="customCharInput" type="text" placeholder="Type character" style="
                                            width: 100%;
                                            padding: 8px;
                                            border: 1px solid #ddd;
                                            border-radius: 6px;
                                            font-size: 16px;
                                            text-align: center;
                                        " maxlength="1" />
                                    ` : Array.from(chars).map(char => `
                                        <button class="char-select-btn" data-char="${char}" style="
                                            width: 36px;
                                            height: 36px;
                                            border: 1px solid #ddd;
                                            background: ${char === this.currentLetter ? '#1976D2' : 'white'};
                                            color: ${char === this.currentLetter ? 'white' : '#333'};
                                            border-radius: 6px;
                                            cursor: pointer;
                                            font-size: 18px;
                                            font-family: Arial, sans-serif;
                                        ">${char}</button>
                                    `).join('')}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                    
                    <!-- Center Panel - Canvas Editor -->
                    <div style="
                        flex: 1;
                        padding: 30px;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                    ">
                        <h3 style="margin: 0 0 20px 0;">Editing: <span style="
                            font-size: 36px;
                            color: #1976D2;
                            font-family: Arial, sans-serif;
                        ">${this.currentLetter}</span></h3>
                        
                        <!-- Toolbar -->
                        <div style="
                            display: flex;
                            gap: 10px;
                            margin-bottom: 20px;
                            padding: 15px;
                            background: #f5f5f5;
                            border-radius: 8px;
                        ">
                            <button class="tool-btn" data-mode="add" style="
                                padding: 10px 20px;
                                background: ${this.editMode === 'add' ? '#1976D2' : 'white'};
                                color: ${this.editMode === 'add' ? 'white' : '#333'};
                                border: 1px solid #ddd;
                                border-radius: 6px;
                                cursor: pointer;
                            ">➕ Add Points</button>
                            
                            <button class="tool-btn" data-mode="edit" style="
                                padding: 10px 20px;
                                background: ${this.editMode === 'edit' ? '#1976D2' : 'white'};
                                color: ${this.editMode === 'edit' ? 'white' : '#333'};
                                border: 1px solid #ddd;
                                border-radius: 6px;
                                cursor: pointer;
                            ">✏️ Edit Points</button>
                            
                            <button class="tool-btn" data-mode="delete" style="
                                padding: 10px 20px;
                                background: ${this.editMode === 'delete' ? '#1976D2' : 'white'};
                                color: ${this.editMode === 'delete' ? 'white' : '#333'};
                                border: 1px solid #ddd;
                                border-radius: 6px;
                                cursor: pointer;
                            ">🗑️ Delete Points</button>
                            
                            <div style="width: 1px; background: #ddd; margin: 0 10px;"></div>
                            
                            <button id="smoothPathBtn" style="
                                padding: 10px 20px;
                                background: white;
                                color: #333;
                                border: 1px solid #ddd;
                                border-radius: 6px;
                                cursor: pointer;
                            ">🌊 Smooth Path</button>
                            
                            <button id="clearStrokeBtn" style="
                                padding: 10px 20px;
                                background: white;
                                color: #333;
                                border: 1px solid #ddd;
                                border-radius: 6px;
                                cursor: pointer;
                            ">🧹 Clear Stroke</button>
                        </div>
                        
                        <!-- Canvas -->
                        <canvas id="letterCanvas" width="${this.canvasWidth}" height="${this.canvasHeight}" style="
                            border: 2px solid #ddd;
                            border-radius: 8px;
                            background: white;
                            cursor: crosshair;
                            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                        "></canvas>
                        
                        <!-- Options -->
                        <div style="
                            display: flex;
                            gap: 20px;
                            margin-top: 20px;
                            align-items: center;
                        ">
                            <label style="display: flex; align-items: center; gap: 8px;">
                                <input type="checkbox" id="showGridCheck" ${this.showGrid ? 'checked' : ''} />
                                Show Grid
                            </label>
                            
                            <label style="display: flex; align-items: center; gap: 8px;">
                                <input type="checkbox" id="showGuidelinesCheck" ${this.showGuidelines ? 'checked' : ''} />
                                Show Guidelines
                            </label>
                            
                            <label style="display: flex; align-items: center; gap: 8px;">
                                <input type="checkbox" id="snapToGridCheck" ${this.snapToGrid ? 'checked' : ''} />
                                Snap to Grid
                            </label>
                        </div>
                    </div>
                    
                    <!-- Right Panel - Stroke Management & Preview -->
                    <div style="
                        width: 300px;
                        background: #f5f5f5;
                        padding: 20px;
                        border-left: 1px solid #ddd;
                    ">
                        <h3 style="margin: 0 0 15px 0; font-size: 18px;">Stroke Management</h3>
                        
                        <!-- Stroke List -->
                        <div style="
                            background: white;
                            border: 1px solid #ddd;
                            border-radius: 8px;
                            padding: 15px;
                            margin-bottom: 20px;
                            max-height: 200px;
                            overflow-y: auto;
                        ">
                            ${this.strokes.length === 0 ? `
                                <p style="color: #666; text-align: center;">No strokes yet</p>
                            ` : this.strokes.map((stroke, index) => `
                                <div class="stroke-item" data-stroke="${index}" style="
                                    display: flex;
                                    align-items: center;
                                    padding: 10px;
                                    margin-bottom: 8px;
                                    background: ${index === this.currentStroke ? '#E3F2FD' : '#f5f5f5'};
                                    border: 1px solid ${index === this.currentStroke ? '#1976D2' : '#ddd'};
                                    border-radius: 6px;
                                    cursor: pointer;
                                ">
                                    <span style="flex: 1;">Stroke ${index + 1} (${stroke.length} points)</span>
                                    <button class="delete-stroke-btn" data-stroke="${index}" style="
                                        background: #f44336;
                                        color: white;
                                        border: none;
                                        padding: 4px 8px;
                                        border-radius: 4px;
                                        cursor: pointer;
                                        font-size: 12px;
                                    ">Delete</button>
                                </div>
                            `).join('')}
                        </div>
                        
                        <button id="addStrokeBtn" style="
                            width: 100%;
                            padding: 10px;
                            background: #4CAF50;
                            color: white;
                            border: none;
                            border-radius: 6px;
                            cursor: pointer;
                            margin-bottom: 20px;
                        ">➕ Add New Stroke</button>
                        
                        <!-- Preview -->
                        <h3 style="margin: 20px 0 15px 0; font-size: 18px;">Preview</h3>
                        <canvas id="previewCanvas" width="260" height="260" style="
                            border: 1px solid #ddd;
                            border-radius: 8px;
                            background: white;
                            width: 100%;
                        "></canvas>
                        
                        <button id="animatePreviewBtn" style="
                            width: 100%;
                            padding: 10px;
                            background: #2196F3;
                            color: white;
                            border: none;
                            border-radius: 6px;
                            cursor: pointer;
                            margin-top: 10px;
                        ">▶️ Animate Preview</button>
                        
                        <!-- Save/Load -->
                        <div style="
                            display: flex;
                            gap: 10px;
                            margin-top: 20px;
                        ">
                            <button id="saveTemplateBtn" style="
                                flex: 1;
                                padding: 12px;
                                background: #4CAF50;
                                color: white;
                                border: none;
                                border-radius: 6px;
                                cursor: pointer;
                                font-weight: bold;
                            ">💾 Save Template</button>
                            
                            <button id="resetTemplateBtn" style="
                                flex: 1;
                                padding: 12px;
                                background: #FF9800;
                                color: white;
                                border: none;
                                border-radius: 6px;
                                cursor: pointer;
                            ">🔄 Reset to Default</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        this.setupCanvas();
        this.attachEventListeners();
        this.drawCanvas();
        this.updatePreview();
    }
    
    setupCanvas() {
        this.canvas = document.getElementById('letterCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        this.previewCanvas = document.getElementById('previewCanvas');
        this.previewCtx = this.previewCanvas.getContext('2d');
    }
    
    drawCanvas() {
        if (!this.ctx) return;
        
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
        
        // Draw grid
        if (this.showGrid) {
            this.ctx.strokeStyle = '#f0f0f0';
            this.ctx.lineWidth = 1;
            
            for (let x = 0; x <= this.canvasWidth; x += this.gridSize) {
                this.ctx.beginPath();
                this.ctx.moveTo(x, 0);
                this.ctx.lineTo(x, this.canvasHeight);
                this.ctx.stroke();
            }
            
            for (let y = 0; y <= this.canvasHeight; y += this.gridSize) {
                this.ctx.beginPath();
                this.ctx.moveTo(0, y);
                this.ctx.lineTo(this.canvasWidth, y);
                this.ctx.stroke();
            }
        }
        
        // Draw guidelines
        if (this.showGuidelines) {
            // Baseline (solid blue)
            this.ctx.strokeStyle = '#1976D2';
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.moveTo(0, this.guidelines.baseline);
            this.ctx.lineTo(this.canvasWidth, this.guidelines.baseline);
            this.ctx.stroke();
            
            // Midline (dashed blue)
            this.ctx.strokeStyle = '#42A5F5';
            this.ctx.lineWidth = 1;
            this.ctx.setLineDash([5, 5]);
            this.ctx.beginPath();
            this.ctx.moveTo(0, this.guidelines.midLine);
            this.ctx.lineTo(this.canvasWidth, this.guidelines.midLine);
            this.ctx.stroke();
            
            // Top line (dotted)
            this.ctx.setLineDash([2, 3]);
            this.ctx.beginPath();
            this.ctx.moveTo(0, this.guidelines.topLine);
            this.ctx.lineTo(this.canvasWidth, this.guidelines.topLine);
            this.ctx.stroke();
            
            this.ctx.setLineDash([]);
            
            // Margins (red)
            this.ctx.strokeStyle = '#EF5350';
            this.ctx.lineWidth = 1;
            this.ctx.beginPath();
            this.ctx.moveTo(this.guidelines.leftMargin, 0);
            this.ctx.lineTo(this.guidelines.leftMargin, this.canvasHeight);
            this.ctx.stroke();
            
            this.ctx.beginPath();
            this.ctx.moveTo(this.guidelines.rightMargin, 0);
            this.ctx.lineTo(this.guidelines.rightMargin, this.canvasHeight);
            this.ctx.stroke();
        }
        
        // Draw strokes
        this.strokes.forEach((stroke, strokeIndex) => {
            if (stroke.length < 2) return;
            
            // Draw stroke path
            this.ctx.strokeStyle = strokeIndex === this.currentStroke ? '#1976D2' : '#666';
            this.ctx.lineWidth = strokeIndex === this.currentStroke ? 3 : 2;
            this.ctx.lineCap = 'round';
            this.ctx.lineJoin = 'round';
            
            this.ctx.beginPath();
            this.ctx.moveTo(stroke[0].x, stroke[0].y);
            
            for (let i = 1; i < stroke.length; i++) {
                this.ctx.lineTo(stroke[i].x, stroke[i].y);
            }
            
            this.ctx.stroke();
            
            // Draw points
            stroke.forEach((point, pointIndex) => {
                // Point circle
                this.ctx.fillStyle = strokeIndex === this.currentStroke ? '#1976D2' : '#888';
                this.ctx.beginPath();
                this.ctx.arc(point.x, point.y, 6, 0, Math.PI * 2);
                this.ctx.fill();
                
                // Start point indicator
                if (pointIndex === 0) {
                    this.ctx.fillStyle = '#4CAF50';
                    this.ctx.beginPath();
                    this.ctx.arc(point.x, point.y, 8, 0, Math.PI * 2);
                    this.ctx.fill();
                    
                    this.ctx.fillStyle = 'white';
                    this.ctx.font = '12px Arial';
                    this.ctx.textAlign = 'center';
                    this.ctx.textBaseline = 'middle';
                    this.ctx.fillText('S', point.x, point.y);
                }
            });
        });
    }
    
    updatePreview() {
        if (!this.previewCtx) return;
        
        // Clear preview
        this.previewCtx.clearRect(0, 0, 260, 260);
        
        // Scale strokes to fit preview
        const scale = 260 / this.canvasWidth;
        
        // Draw guidelines in preview
        if (this.showGuidelines) {
            this.previewCtx.strokeStyle = '#E3F2FD';
            this.previewCtx.lineWidth = 1;
            
            // Baseline
            this.previewCtx.beginPath();
            this.previewCtx.moveTo(0, this.guidelines.baseline * scale);
            this.previewCtx.lineTo(260, this.guidelines.baseline * scale);
            this.previewCtx.stroke();
            
            // Midline
            this.previewCtx.setLineDash([3, 3]);
            this.previewCtx.beginPath();
            this.previewCtx.moveTo(0, this.guidelines.midLine * scale);
            this.previewCtx.lineTo(260, this.guidelines.midLine * scale);
            this.previewCtx.stroke();
            
            this.previewCtx.setLineDash([]);
        }
        
        // Draw all strokes
        this.strokes.forEach((stroke) => {
            if (stroke.length < 2) return;
            
            this.previewCtx.strokeStyle = '#333';
            this.previewCtx.lineWidth = 2;
            this.previewCtx.lineCap = 'round';
            this.previewCtx.lineJoin = 'round';
            
            this.previewCtx.beginPath();
            this.previewCtx.moveTo(stroke[0].x * scale, stroke[0].y * scale);
            
            for (let i = 1; i < stroke.length; i++) {
                this.previewCtx.lineTo(stroke[i].x * scale, stroke[i].y * scale);
            }
            
            this.previewCtx.stroke();
        });
    }
    
    attachEventListeners() {
        // Close button
        document.getElementById('closeLetterEditor')?.addEventListener('click', () => {
            this.hide();
        });
        
        // Character selection
        this.container.querySelectorAll('.char-select-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.currentLetter = btn.dataset.char;
                this.loadLetterTemplate(this.currentLetter);
                this.render();
            });
        });
        
        // Custom character input
        const customInput = document.getElementById('customCharInput');
        if (customInput) {
            customInput.addEventListener('input', (e) => {
                if (e.target.value) {
                    this.currentLetter = e.target.value;
                    this.loadLetterTemplate(this.currentLetter);
                    this.render();
                }
            });
        }
        
        // Tool buttons
        this.container.querySelectorAll('.tool-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.editMode = btn.dataset.mode;
                this.render();
            });
        });
        
        // Canvas interactions
        this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('mouseup', (e) => this.handleMouseUp(e));
        
        // Touch support
        this.canvas.addEventListener('touchstart', (e) => this.handleTouchStart(e));
        this.canvas.addEventListener('touchmove', (e) => this.handleTouchMove(e));
        this.canvas.addEventListener('touchend', (e) => this.handleTouchEnd(e));
        
        // Options
        document.getElementById('showGridCheck')?.addEventListener('change', (e) => {
            this.showGrid = e.target.checked;
            this.drawCanvas();
        });
        
        document.getElementById('showGuidelinesCheck')?.addEventListener('change', (e) => {
            this.showGuidelines = e.target.checked;
            this.drawCanvas();
            this.updatePreview();
        });
        
        document.getElementById('snapToGridCheck')?.addEventListener('change', (e) => {
            this.snapToGrid = e.target.checked;
        });
        
        // Stroke management
        document.getElementById('addStrokeBtn')?.addEventListener('click', () => {
            this.addNewStroke();
        });
        
        this.container.querySelectorAll('.stroke-item').forEach(item => {
            item.addEventListener('click', () => {
                this.currentStroke = parseInt(item.dataset.stroke);
                this.render();
            });
        });
        
        this.container.querySelectorAll('.delete-stroke-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const strokeIndex = parseInt(btn.dataset.stroke);
                this.deleteStroke(strokeIndex);
            });
        });
        
        // Path operations
        document.getElementById('smoothPathBtn')?.addEventListener('click', () => {
            this.smoothCurrentStroke();
        });
        
        document.getElementById('clearStrokeBtn')?.addEventListener('click', () => {
            if (confirm('Clear current stroke?')) {
                this.clearCurrentStroke();
            }
        });
        
        // Preview
        document.getElementById('animatePreviewBtn')?.addEventListener('click', () => {
            this.animatePreview();
        });
        
        // Save/Load
        document.getElementById('saveTemplateBtn')?.addEventListener('click', () => {
            this.saveTemplate();
        });
        
        document.getElementById('resetTemplateBtn')?.addEventListener('click', () => {
            if (confirm('Reset to default template? This will lose your changes.')) {
                this.resetToDefault();
            }
        });
    }
    
    handleMouseDown(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        this.handlePointerDown(x, y);
    }
    
    handleMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        this.handlePointerMove(x, y);
    }
    
    handleMouseUp() {
        this.handlePointerUp();
    }
    
    handleTouchStart(e) {
        e.preventDefault();
        const rect = this.canvas.getBoundingClientRect();
        const touch = e.touches[0];
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        
        this.handlePointerDown(x, y);
    }
    
    handleTouchMove(e) {
        e.preventDefault();
        const rect = this.canvas.getBoundingClientRect();
        const touch = e.touches[0];
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        
        this.handlePointerMove(x, y);
    }
    
    handleTouchEnd(e) {
        e.preventDefault();
        this.handlePointerUp();
    }
    
    handlePointerDown(x, y) {
        // Ensure we have at least one stroke
        if (this.strokes.length === 0) {
            this.addNewStroke();
        }
        
        const currentStroke = this.strokes[this.currentStroke];
        
        if (this.editMode === 'add') {
            // Add new point
            const point = this.snapToGrid ? this.snapPoint(x, y) : { x, y };
            currentStroke.push(point);
            this.drawCanvas();
            this.updatePreview();
        } else if (this.editMode === 'edit') {
            // Find nearest point
            this.selectedPoint = this.findNearestPoint(x, y);
            if (this.selectedPoint) {
                this.isDragging = true;
            }
        } else if (this.editMode === 'delete') {
            // Delete nearest point
            const point = this.findNearestPoint(x, y);
            if (point) {
                currentStroke.splice(point.index, 1);
                this.drawCanvas();
                this.updatePreview();
            }
        }
    }
    
    handlePointerMove(x, y) {
        if (this.isDragging && this.selectedPoint) {
            const currentStroke = this.strokes[this.selectedPoint.strokeIndex];
            const point = this.snapToGrid ? this.snapPoint(x, y) : { x, y };
            currentStroke[this.selectedPoint.index] = point;
            this.drawCanvas();
            this.updatePreview();
        }
    }
    
    handlePointerUp() {
        this.isDragging = false;
        this.selectedPoint = null;
    }
    
    snapPoint(x, y) {
        return {
            x: Math.round(x / this.gridSize) * this.gridSize,
            y: Math.round(y / this.gridSize) * this.gridSize
        };
    }
    
    findNearestPoint(x, y) {
        let nearest = null;
        let minDistance = 20; // Threshold distance
        
        this.strokes.forEach((stroke, strokeIndex) => {
            stroke.forEach((point, pointIndex) => {
                const distance = Math.sqrt(
                    Math.pow(x - point.x, 2) + Math.pow(y - point.y, 2)
                );
                
                if (distance < minDistance) {
                    minDistance = distance;
                    nearest = {
                        strokeIndex,
                        index: pointIndex,
                        point
                    };
                }
            });
        });
        
        return nearest;
    }
    
    addNewStroke() {
        this.strokes.push([]);
        this.currentStroke = this.strokes.length - 1;
        this.render();
    }
    
    deleteStroke(index) {
        this.strokes.splice(index, 1);
        if (this.currentStroke >= this.strokes.length) {
            this.currentStroke = Math.max(0, this.strokes.length - 1);
        }
        this.render();
    }
    
    clearCurrentStroke() {
        if (this.strokes[this.currentStroke]) {
            this.strokes[this.currentStroke] = [];
            this.drawCanvas();
            this.updatePreview();
        }
    }
    
    smoothCurrentStroke() {
        const stroke = this.strokes[this.currentStroke];
        if (!stroke || stroke.length < 3) return;
        
        // Simple smoothing algorithm
        const smoothed = [];
        smoothed.push(stroke[0]); // Keep first point
        
        for (let i = 1; i < stroke.length - 1; i++) {
            const prev = stroke[i - 1];
            const curr = stroke[i];
            const next = stroke[i + 1];
            
            smoothed.push({
                x: (prev.x + curr.x * 2 + next.x) / 4,
                y: (prev.y + curr.y * 2 + next.y) / 4
            });
        }
        
        smoothed.push(stroke[stroke.length - 1]); // Keep last point
        
        this.strokes[this.currentStroke] = smoothed;
        this.drawCanvas();
        this.updatePreview();
    }
    
    animatePreview() {
        if (this.strokes.length === 0) return;
        
        // Clear preview
        this.previewCtx.clearRect(0, 0, 260, 260);
        
        const scale = 260 / this.canvasWidth;
        let strokeIndex = 0;
        let pointIndex = 0;
        
        const animate = () => {
            if (strokeIndex >= this.strokes.length) {
                // Animation complete
                setTimeout(() => this.updatePreview(), 1000);
                return;
            }
            
            const stroke = this.strokes[strokeIndex];
            if (stroke.length < 2) {
                strokeIndex++;
                pointIndex = 0;
                animate();
                return;
            }
            
            // Draw current stroke up to current point
            this.previewCtx.strokeStyle = '#1976D2';
            this.previewCtx.lineWidth = 3;
            this.previewCtx.lineCap = 'round';
            this.previewCtx.lineJoin = 'round';
            
            this.previewCtx.beginPath();
            this.previewCtx.moveTo(stroke[0].x * scale, stroke[0].y * scale);
            
            for (let i = 1; i <= Math.min(pointIndex, stroke.length - 1); i++) {
                this.previewCtx.lineTo(stroke[i].x * scale, stroke[i].y * scale);
            }
            
            this.previewCtx.stroke();
            
            // Move to next point
            pointIndex++;
            if (pointIndex >= stroke.length) {
                strokeIndex++;
                pointIndex = 0;
            }
            
            requestAnimationFrame(animate);
        };
        
        animate();
    }
    
    loadLetterTemplate(letter) {
        // First check for custom template
        const customTemplates = this.loadCustomTemplates();
        if (customTemplates[letter]) {
            this.strokes = JSON.parse(JSON.stringify(customTemplates[letter]));
            return;
        }
        
        // Try to load from default templates
        const defaultTemplate = this.getDefaultTemplate(letter);
        if (defaultTemplate) {
            this.strokes = JSON.parse(JSON.stringify(defaultTemplate));
        } else {
            // No template found, start with empty
            this.strokes = [];
        }
    }
    
    getDefaultTemplate(letter) {
        // Check if template exists in LetterTemplates
        if (window.LetterTemplates && window.LetterTemplates.templates[letter]) {
            const template = window.LetterTemplates.templates[letter];
            // Convert template format to editor format
            return this.convertTemplateToEditor(template);
        }
        return null;
    }
    
    convertTemplateToEditor(template) {
        const strokes = [];
        
        template.forEach(stroke => {
            const points = [];
            for (let i = 0; i < stroke.length; i += 2) {
                points.push({
                    x: stroke[i] * this.canvasWidth,
                    y: stroke[i + 1] * this.canvasHeight
                });
            }
            strokes.push(points);
        });
        
        return strokes;
    }
    
    convertEditorToTemplate() {
        const template = [];
        
        this.strokes.forEach(stroke => {
            const normalized = [];
            stroke.forEach(point => {
                normalized.push(point.x / this.canvasWidth);
                normalized.push(point.y / this.canvasHeight);
            });
            if (normalized.length > 0) {
                template.push(normalized);
            }
        });
        
        return template;
    }
    
    saveTemplate() {
        if (this.strokes.length === 0) {
            alert('Please create at least one stroke before saving.');
            return;
        }
        
        // Convert to template format
        const template = this.convertEditorToTemplate();
        
        // Load existing custom templates
        const customTemplates = this.loadCustomTemplates();
        
        // Save the template
        customTemplates[this.currentLetter] = this.strokes;
        
        // Save to localStorage
        localStorage.setItem('alphahunters_custom_letters', JSON.stringify(customTemplates));
        
        // Also save in game-compatible format
        const gameTemplates = JSON.parse(localStorage.getItem('alphahunters_custom_letter_templates') || '{}');
        gameTemplates[this.currentLetter] = template;
        localStorage.setItem('alphahunters_custom_letter_templates', JSON.stringify(gameTemplates));
        
        console.log('💾 Saved custom template for:', this.currentLetter);
        alert(`Template saved for "${this.currentLetter}"!`);
    }
    
    loadCustomTemplates() {
        const stored = localStorage.getItem('alphahunters_custom_letters');
        return stored ? JSON.parse(stored) : {};
    }
    
    resetToDefault() {
        const defaultTemplate = this.getDefaultTemplate(this.currentLetter);
        if (defaultTemplate) {
            this.strokes = defaultTemplate;
        } else {
            this.strokes = [];
        }
        
        // Remove custom template
        const customTemplates = this.loadCustomTemplates();
        delete customTemplates[this.currentLetter];
        localStorage.setItem('alphahunters_custom_letters', JSON.stringify(customTemplates));
        
        // Also remove from game format
        const gameTemplates = JSON.parse(localStorage.getItem('alphahunters_custom_letter_templates') || '{}');
        delete gameTemplates[this.currentLetter];
        localStorage.setItem('alphahunters_custom_letter_templates', JSON.stringify(gameTemplates));
        
        this.render();
    }
}