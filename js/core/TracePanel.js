// Trace Panel for multi-stroke letter tracing encounters

class TracePanel {
    constructor(game) {
        this.game = game;
        this.panel = document.getElementById('tracePanel');
        this.canvas = document.getElementById('traceCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Letter templates system
        this.letterTemplates = new LetterTemplates();
        
        // Tracing state
        this.isActive = false;
        this.currentLetterling = null;
        this.currentLetter = '';
        this.currentStrokeIndex = 0;
        this.completedStrokes = [];
        this.currentUserStroke = [];
        this.userStrokes = []; // Store all user strokes for the letter
        
        // Scoring
        this.strokeScores = [];
        
        // Input cleanup function
        this.inputCleanup = null;
        
        // Input enabled flag to prevent immediate dismissal
        this.inputEnabled = true;
        
        // Contest mode callback
        this.onComplete = null;
        
        this.init();
    }
    
    init() {
        this.setupCanvas();
        this.setupEventListeners();
        // TracePanel ready with multi-stroke support
    }
    
    setupCanvas() {
        this.canvas.width = 500;
        this.canvas.height = 500;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        
        // Ensure proper touch handling
        this.canvas.style.touchAction = 'none';
        this.canvas.style.userSelect = 'none';
        this.canvas.style.webkitUserSelect = 'none';
        this.canvas.style.webkitTouchCallout = 'none';
        this.canvas.style.webkitTapHighlightColor = 'transparent';
    }
    
    setupEventListeners() {
        // Button handlers are set up in Game.js
    }
    
    startEncounter(letterling) {
        // Validate panel and canvas exist
        if (!this.panel || !this.canvas || !this.ctx) {
            console.error('TracePanel elements not properly initialized');
            throw new Error('TracePanel not ready');
        }
        
        // Clean up any existing dismiss handlers from previous encounters
        if (this.dismissHandler) {
            this.canvas.removeEventListener('click', this.dismissHandler);
            this.canvas.removeEventListener('touchstart', this.dismissHandler);
            this.dismissHandler = null;
        }
        
        // Clear any existing completion timeout
        if (this.completionTimeout) {
            clearTimeout(this.completionTimeout);
            this.completionTimeout = null;
        }
        
        this.currentLetterling = letterling;
        this.currentLetter = letterling.letter;
        this.isActive = true;
        
        // Reset tracing state
        this.currentStrokeIndex = 0;
        this.completedStrokes = [];
        this.currentUserStroke = [];
        this.userStrokes = [];
        this.strokeScores = [];
        
        // Check if letter is supported
        if (!this.letterTemplates.isSupported(this.currentLetter)) {
            console.warn(`Letter '${this.currentLetter}' not supported, using fallback`);
            this.currentLetter = 'o'; // fallback
        }
        
        // Ensure panel is hidden first to reset state
        this.panel.classList.add('hidden');
        
        // Force reflow before showing
        void this.panel.offsetHeight;
        
        this.show();
        this.drawLetterGuide();
        this.setupInput();
        
        // Play start sound and instruction
        if (this.game.audioManager) {
            this.game.audioManager.playTraceStart();
            
            // Give stroke instruction
            const stroke = this.letterTemplates.getStroke(this.currentLetter, this.currentStrokeIndex);
            if (stroke) {
                setTimeout(() => {
                    this.game.audioManager.speak(stroke.description);
                }, 1000);
            }
        }
        
        console.log(`Starting ${this.currentLetter} - ${this.letterTemplates.getStrokeCount(this.currentLetter)} strokes total`);
    }
    
    show() {
        this.panel.classList.remove('hidden');
    }
    
    hide() {
        this.panel.classList.add('hidden');
        this.cleanup();
    }
    
    drawLetterGuide() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Set up handwriting-style font
        this.drawBackground();
        this.drawLetterTemplate();
        this.drawCompletedStrokes();
        this.drawCurrentStrokeGuide();
        this.drawStartPoint();
        this.drawInstructions();
    }
    
    drawBackground() {
        // Light paper-like background with subtle texture
        this.ctx.fillStyle = '#FEFEFE';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Add subtle paper texture gradient
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, 'rgba(240, 240, 240, 0.1)');
        gradient.addColorStop(0.5, 'rgba(250, 250, 250, 0.05)');
        gradient.addColorStop(1, 'rgba(240, 240, 240, 0.1)');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw writing guidelines (like school paper)
        const margin = 50;
        const baseline = this.canvas.height * 0.7;
        const midline = this.canvas.height * 0.45;
        const topline = this.canvas.height * 0.2;
        
        // Left margin (red line)
        this.ctx.strokeStyle = '#FFB3BA';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(margin, 0);
        this.ctx.lineTo(margin, this.canvas.height);
        this.ctx.stroke();
        
        // Right margin (optional, lighter)
        this.ctx.strokeStyle = 'rgba(255, 179, 186, 0.3)';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.moveTo(this.canvas.width - margin, 0);
        this.ctx.lineTo(this.canvas.width - margin, this.canvas.height);
        this.ctx.stroke();
        
        // Baseline (solid blue)
        this.ctx.strokeStyle = '#1976D2';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(margin - 10, baseline);
        this.ctx.lineTo(this.canvas.width - margin + 10, baseline);
        this.ctx.stroke();
        
        // Midline (dashed blue)
        this.ctx.strokeStyle = '#42A5F5';
        this.ctx.lineWidth = 1.5;
        this.ctx.setLineDash([8, 4]);
        this.ctx.beginPath();
        this.ctx.moveTo(margin, midline);
        this.ctx.lineTo(this.canvas.width - margin, midline);
        this.ctx.stroke();
        
        // Top line (dotted, very light)
        this.ctx.strokeStyle = 'rgba(66, 165, 245, 0.3)';
        this.ctx.lineWidth = 1;
        this.ctx.setLineDash([2, 4]);
        this.ctx.beginPath();
        this.ctx.moveTo(margin, topline);
        this.ctx.lineTo(this.canvas.width - margin, topline);
        this.ctx.stroke();
        
        // Reset line dash
        this.ctx.setLineDash([]);
        
        // Add line labels (optional)
        this.ctx.fillStyle = 'rgba(100, 100, 100, 0.3)';
        this.ctx.font = '10px Arial';
        this.ctx.textAlign = 'right';
        this.ctx.fillText('top', margin - 15, topline + 3);
        this.ctx.fillText('mid', margin - 15, midline + 3);
        this.ctx.fillText('base', margin - 15, baseline + 3);
    }
    
    drawLetterTemplate() {
        const totalStrokes = this.letterTemplates.getStrokeCount(this.currentLetter);
        
        // Calculate guide opacity based on level time
        const guideOpacity = this.calculateGuideOpacity();
        
        // Draw all strokes as light guide
        this.ctx.strokeStyle = `rgba(0, 0, 0, ${guideOpacity})`;
        this.ctx.lineWidth = 10;
        
        for (let i = 0; i < totalStrokes; i++) {
            const canvasStroke = this.letterTemplates.getCanvasStroke(
                this.currentLetter, i, this.canvas.width, this.canvas.height
            );
            
            if (canvasStroke) {
                this.ctx.beginPath();
                this.ctx.moveTo(canvasStroke.points[0].x, canvasStroke.points[0].y);
                
                for (let j = 1; j < canvasStroke.points.length; j++) {
                    this.ctx.lineTo(canvasStroke.points[j].x, canvasStroke.points[j].y);
                }
                
                this.ctx.stroke();
            }
        }
    }
    
    drawCompletedStrokes() {
        // Draw completed strokes in green with better visibility
        this.ctx.save();
        
        this.ctx.strokeStyle = '#4CAF50';
        this.ctx.lineWidth = 8;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        
        // Add shadow for depth
        this.ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
        this.ctx.shadowBlur = 3;
        this.ctx.shadowOffsetX = 1;
        this.ctx.shadowOffsetY = 1;
        
        for (const userStroke of this.completedStrokes) {
            if (userStroke.length > 0) {
                this.ctx.beginPath();
                
                if (userStroke.length === 1) {
                    // Draw a dot for single point
                    this.ctx.arc(userStroke[0].x, userStroke[0].y, 4, 0, Math.PI * 2);
                    this.ctx.fill();
                } else {
                    // Draw the stroke
                    this.ctx.moveTo(userStroke[0].x, userStroke[0].y);
                    
                    for (let i = 1; i < userStroke.length; i++) {
                        this.ctx.lineTo(userStroke[i].x, userStroke[i].y);
                    }
                    
                    this.ctx.stroke();
                }
            }
        }
        
        this.ctx.restore();
    }
    
    drawCurrentStrokeGuide() {
        const canvasStroke = this.letterTemplates.getCanvasStroke(
            this.currentLetter, this.currentStrokeIndex, 
            this.canvas.width, this.canvas.height
        );
        
        if (canvasStroke) {
            // Get player level for adaptive sizing
            const playerLevel = this.game.progression ? this.game.progression.playerLevel : 1;
            
            // Much more noticeable sizing differences
            const baseWidth = 36; // Starting width (much larger)
            const minWidth = 12;  // Minimum width at high levels (much smaller)
            const levelReduction = Math.min(24, (playerLevel - 1) * 3); // Reduce by 3px per level, max 24px
            const strokeWidth = Math.max(minWidth, baseWidth - levelReduction);
            
            // Stroke width calculated based on player level
            
            // Highlight current stroke to trace with adaptive width
            this.ctx.strokeStyle = 'rgba(33, 150, 243, 0.4)';
            this.ctx.lineWidth = strokeWidth;
            
            this.ctx.beginPath();
            this.ctx.moveTo(canvasStroke.points[0].x, canvasStroke.points[0].y);
            
            for (let i = 1; i < canvasStroke.points.length; i++) {
                this.ctx.lineTo(canvasStroke.points[i].x, canvasStroke.points[i].y);
            }
            
            this.ctx.stroke();
            
            // Draw direction arrows
            this.drawDirectionArrows(canvasStroke);
        }
    }
    
    drawDirectionArrows(canvasStroke) {
        this.ctx.fillStyle = '#2196F3';
        this.ctx.strokeStyle = '#2196F3';
        this.ctx.lineWidth = 2;
        
        const points = canvasStroke.points;
        const arrowSpacing = Math.max(2, Math.floor(points.length / 4));
        
        for (let i = arrowSpacing; i < points.length - 1; i += arrowSpacing) {
            const p1 = points[i - 1];
            const p2 = points[i];
            
            const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);
            const arrowLength = 12;
            const arrowWidth = 6;
            
            this.ctx.save();
            this.ctx.translate(p2.x, p2.y);
            this.ctx.rotate(angle);
            
            this.ctx.beginPath();
            this.ctx.moveTo(0, 0);
            this.ctx.lineTo(-arrowLength, -arrowWidth);
            this.ctx.lineTo(-arrowLength + 4, 0);
            this.ctx.lineTo(-arrowLength, arrowWidth);
            this.ctx.closePath();
            this.ctx.fill();
            
            this.ctx.restore();
        }
    }
    
    drawStartPoint() {
        const canvasStroke = this.letterTemplates.getCanvasStroke(
            this.currentLetter, this.currentStrokeIndex,
            this.canvas.width, this.canvas.height
        );
        
        if (canvasStroke) {
            // Animated golden spark at start point
            const time = Date.now() / 200;
            const pulse = 0.8 + 0.2 * Math.sin(time);
            const sparkSize = 12 * pulse;
            
            // Glow effect
            this.ctx.shadowColor = '#FFD700';
            this.ctx.shadowBlur = 15;
            
            this.ctx.fillStyle = '#FFD700';
            this.ctx.beginPath();
            this.ctx.arc(canvasStroke.startX, canvasStroke.startY, sparkSize, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Inner bright point
            this.ctx.fillStyle = '#FFF';
            this.ctx.beginPath();
            this.ctx.arc(canvasStroke.startX, canvasStroke.startY, sparkSize * 0.4, 0, Math.PI * 2);
            this.ctx.fill();
            
            this.ctx.shadowBlur = 0;
        }
    }
    
    calculateGuideOpacity() {
        // Get level start time from level manager
        const levelManager = this.game.levelManager;
        if (!levelManager || !levelManager.levelStartTime) {
            return 0.15; // Default opacity
        }
        
        const elapsedTime = Date.now() - levelManager.levelStartTime;
        const threeMins = 3 * 60 * 1000; // 3 minutes in milliseconds
        const fiveMins = 5 * 60 * 1000; // 5 minutes (level duration)
        
        if (elapsedTime < threeMins) {
            // First 3 minutes: Full guide visibility
            return 0.25; // Slightly more visible than before
        } else if (elapsedTime < fiveMins) {
            // From 3-5 minutes: Gradually fade guide
            const fadeProgress = (elapsedTime - threeMins) / (fiveMins - threeMins);
            // Fade from 0.25 to 0.05
            return Math.max(0.05, 0.25 - (fadeProgress * 0.20));
        } else {
            // After 5 minutes: Minimal guide
            return 0.05;
        }
    }
    
    drawInstructions() {
        // Stroke counter
        const totalStrokes = this.letterTemplates.getStrokeCount(this.currentLetter);
        this.ctx.fillStyle = '#333';
        this.ctx.font = 'bold 20px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(
            `Stroke ${this.currentStrokeIndex + 1} of ${totalStrokes}`,
            20, 40
        );
        
        // Letter being traced
        this.ctx.font = 'bold 24px Arial';
        this.ctx.textAlign = 'right';
        this.ctx.fillText(
            `Letter: ${this.currentLetter}`,
            this.canvas.width - 20, 40
        );
        
        // Level bonus indicator
        const playerLevel = this.game.progression ? this.game.progression.playerLevel : 1;
        if (playerLevel > 1) {
            const multiplier = 1 + ((playerLevel - 1) * 0.02);
            
            // Animated bonus indicator
            const time = Date.now() / 300;
            const glow = 0.8 + 0.2 * Math.sin(time);
            
            // Background glow
            this.ctx.shadowColor = '#FFD700';
            this.ctx.shadowBlur = 15 * glow;
            
            // Bonus box background
            this.ctx.fillStyle = `rgba(255, 215, 0, ${0.2 * glow})`;
            this.ctx.fillRect(this.canvas.width - 200, 10, 180, 50);
            
            // Bonus text
            this.ctx.shadowBlur = 0;
            this.ctx.fillStyle = '#FFD700';
            this.ctx.font = 'bold 16px Arial';
            this.ctx.textAlign = 'left';
            this.ctx.fillText(`🌟 Level ${playerLevel} Bonus`, this.canvas.width - 190, 25);
            
            this.ctx.fillStyle = '#FFF8DC';
            this.ctx.font = '14px Arial';
            this.ctx.fillText(`Score x${multiplier.toFixed(2)} • XP +${Math.floor(2 * (playerLevel - 1))}%`, this.canvas.width - 190, 45);
        }
        
        // Debug info: Level and sizing
        if (this.game.showDebug) {
            this.ctx.font = '14px Arial';
            this.ctx.textAlign = 'left';
            this.ctx.fillStyle = '#666';
            this.ctx.fillText(`Level ${playerLevel} Difficulty`, 20, this.canvas.height - 40);
            
            // Show guide width
            const baseWidth = 36;
            const minWidth = 12;
            const levelReduction = Math.min(24, (playerLevel - 1) * 3);
            const strokeWidth = Math.max(minWidth, baseWidth - levelReduction);
            this.ctx.fillText(`Guide width: ${strokeWidth}px`, 20, this.canvas.height - 20);
        }
    }
    
    drawCurrentUserStroke() {
        if (this.currentUserStroke.length > 0) {
            this.ctx.save();
            
            // Draw with a vibrant color that stands out
            this.ctx.strokeStyle = '#FF5722';
            this.ctx.lineWidth = 8;
            this.ctx.lineCap = 'round';
            this.ctx.lineJoin = 'round';
            
            // Add shadow for better visibility
            this.ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
            this.ctx.shadowBlur = 4;
            this.ctx.shadowOffsetX = 2;
            this.ctx.shadowOffsetY = 2;
            
            if (this.currentUserStroke.length === 1) {
                // Draw a dot for single point
                this.ctx.beginPath();
                this.ctx.arc(this.currentUserStroke[0].x, this.currentUserStroke[0].y, 4, 0, Math.PI * 2);
                this.ctx.fill();
            } else {
                // Draw the stroke
                this.ctx.beginPath();
                this.ctx.moveTo(this.currentUserStroke[0].x, this.currentUserStroke[0].y);
                
                for (let i = 1; i < this.currentUserStroke.length; i++) {
                    this.ctx.lineTo(this.currentUserStroke[i].x, this.currentUserStroke[i].y);
                }
                
                this.ctx.stroke();
            }
            
            this.ctx.restore();
        }
    }
    
    setupInput() {
        // Clean up previous input if exists
        if (this.inputCleanup) {
            this.inputCleanup();
            this.inputCleanup = null;
        }
        
        // Validate input manager exists
        if (!this.game.inputManager || !this.game.inputManager.setupTraceInput) {
            console.error('InputManager not available or setupTraceInput method missing');
            return;
        }
        
        // Add a small delay before accepting input to prevent immediate dismissal
        // This prevents lingering touch events from closing the panel
        this.inputEnabled = false;
        setTimeout(() => {
            this.inputEnabled = true;
        }, 150);
        
        try {
            this.inputCleanup = this.game.inputManager.setupTraceInput(
                this.canvas,
                this.onStrokeStart.bind(this),
                this.onStrokeMove.bind(this),
                this.onStrokeEnd.bind(this)
            );
        } catch (error) {
            console.error('Failed to setup trace input:', error);
        }
    }
    
    onStrokeStart(point) {
        if (!this.inputEnabled) return; // Ignore input until enabled
        this.currentUserStroke = [point];
        this.redraw();
    }
    
    onStrokeMove(stroke) {
        if (!this.inputEnabled) return; // Ignore input until enabled
        this.currentUserStroke = stroke;
        this.redraw();
    }
    
    onStrokeEnd(stroke) {
        if (!this.inputEnabled) return; // Ignore input until enabled
        // Score this stroke
        const strokeScore = this.scoreStroke(stroke);
        this.strokeScores.push(strokeScore);
        
        // Add to completed strokes
        this.completedStrokes.push([...stroke]);
        this.userStrokes.push([...stroke]); // Also store in userStrokes for trace capture
        this.currentUserStroke = [];
        
        // Move to next stroke or complete letter
        this.currentStrokeIndex++;
        
        const totalStrokes = this.letterTemplates.getStrokeCount(this.currentLetter);
        
        if (this.currentStrokeIndex >= totalStrokes) {
            // Letter complete!
            this.completeLetter();
        } else {
            // Move to next stroke
            this.redraw();
            
            // Give instruction for next stroke
            if (this.game.audioManager) {
                const nextStroke = this.letterTemplates.getStroke(this.currentLetter, this.currentStrokeIndex);
                if (nextStroke) {
                    setTimeout(() => {
                        this.game.audioManager.speak(nextStroke.description);
                    }, 500);
                }
            }
        }
    }
    
    redraw() {
        this.drawLetterGuide();
        this.drawCurrentUserStroke();
    }
    
    scoreStroke(userStroke) {
        // Get the template stroke
        const templateStroke = this.letterTemplates.getCanvasStroke(
            this.currentLetter, this.currentStrokeIndex,
            this.canvas.width, this.canvas.height
        );
        
        if (!templateStroke || userStroke.length < 3) {
            return 60; // Minimum score
        }
        
        // Process user stroke
        const processed = this.processUserStroke(userStroke);
        
        // Calculate accuracy based on how close the stroke follows the template
        const accuracy = this.calculateStrokeAccuracy(processed, templateStroke);
        
        // Calculate direction score
        const direction = this.calculateDirectionScore(processed, templateStroke);
        
        // Calculate timing score (simple for now)
        const timing = this.calculateTimingScore(userStroke);
        
        // Base score before level multipliers
        const baseScore = Math.min(100, accuracy + direction + timing);
        
        // Apply level-based multipliers - higher levels get bonus points!
        const playerLevel = this.game.progression ? this.game.progression.playerLevel : 1;
        const levelMultiplier = 1 + ((playerLevel - 1) * 0.05); // 5% bonus per level
        const totalScore = Math.min(100, Math.round(baseScore * levelMultiplier));
        
        // Stroke scored - logging removed for cleaner console
        
        return totalScore;
    }
    
    processUserStroke(rawStroke) {
        // Smooth, simplify, and normalize the stroke
        let processed = Utils.smoothStroke(rawStroke, 0.2);
        processed = Utils.simplifyStroke(processed, 3);
        return processed;
    }
    
    calculateStrokeAccuracy(userStroke, templateStroke) {
        // Resample both strokes to same number of points
        const userResampled = Utils.resampleStroke(userStroke, 32);
        const templateResampled = Utils.resampleStroke(templateStroke.points.map(p => ({x: p.x, y: p.y, t: 0})), 32);
        
        // Calculate average distance between corresponding points
        let totalDistance = 0;
        for (let i = 0; i < Math.min(userResampled.length, templateResampled.length); i++) {
            const dist = Utils.distance(
                userResampled[i].x, userResampled[i].y,
                templateResampled[i].x, templateResampled[i].y
            );
            totalDistance += dist;
        }
        
        const avgDistance = totalDistance / Math.min(userResampled.length, templateResampled.length);
        
        // Level-based tolerance: much more forgiving for beginners
        const playerLevel = this.game.progression ? this.game.progression.playerLevel : 1;
        const baseTolerance = 80; // Starting tolerance (very generous)
        const minTolerance = 25;  // Minimum tolerance at high levels (quite strict)
        const toleranceReduction = Math.min(55, (playerLevel - 1) * 5); // Reduce by 5px per level
        const maxAllowedDistance = Math.max(minTolerance, baseTolerance - toleranceReduction);
        
        // Tolerance calculated based on player level
        
        // Very generous scoring - staying in blue area should give 80-90+ scores
        let accuracy = 0;
        if (avgDistance <= maxAllowedDistance) {
            // High scores for staying in blue area
            const normalizedDistance = avgDistance / maxAllowedDistance;
            accuracy = 70 * (1 - normalizedDistance * 0.2); // 56-70 points for staying in blue area
        } else {
            // Some credit for being close
            const overage = avgDistance - maxAllowedDistance;
            accuracy = Math.max(0, 30 * (1 - overage / maxAllowedDistance));
        }
        
        return accuracy;
    }
    
    calculateDirectionScore(userStroke, templateStroke) {
        if (userStroke.length < 3) return 0;
        
        // Calculate direction vectors
        const userDirs = [];
        for (let i = 1; i < userStroke.length; i++) {
            const dx = userStroke[i].x - userStroke[i-1].x;
            const dy = userStroke[i].y - userStroke[i-1].y;
            const len = Math.sqrt(dx*dx + dy*dy);
            if (len > 0) {
                userDirs.push({x: dx/len, y: dy/len});
            }
        }
        
        // Simple direction score based on general movement direction
        let directionScore = 20; // Base score
        
        // Bonus for consistent direction (no backtracking)
        let consistencyBonus = 5;
        
        return directionScore + consistencyBonus;
    }
    
    calculateTimingScore(userStroke) {
        if (userStroke.length < 2) return 0;
        
        const duration = userStroke[userStroke.length - 1].t - userStroke[0].t;
        
        // Ideal timing: 1-3 seconds per stroke
        const idealMin = 1000;
        const idealMax = 3000;
        
        let timingScore = 15;
        
        if (duration < idealMin) {
            timingScore *= (duration / idealMin); // Too fast
        } else if (duration > idealMax) {
            timingScore *= (idealMax / duration); // Too slow
        }
        
        return Math.max(0, timingScore);
    }
    
    completeLetter() {
        // Calculate overall score
        const avgStrokeScore = this.strokeScores.reduce((sum, score) => sum + score, 0) / this.strokeScores.length;
        const totalScore = Math.round(avgStrokeScore);
        
        // Letter completed - score calculated
        
        // Capture trace image and record performance
        if (this.game.traceCapture && this.game.dataManager) {
            const traceStartTime = (this.userStrokes[0] && this.userStrokes[0][0] && this.userStrokes[0][0].t) || Date.now();
            const traceEndTime = Date.now();
            const timeMs = traceEndTime - traceStartTime;
            
            // Get the letter template
            const letterTemplate = this.letterTemplates.getTemplate(this.currentLetter);
            
            // Capture the trace image with template
            const traceImageData = this.game.traceCapture.captureTrace(
                this.currentLetter, 
                this.userStrokes,
                totalScore,
                letterTemplate
            );
            
            // Record in data manager
            this.game.dataManager.recordLetterTrace(
                this.currentLetter,
                totalScore,
                timeMs,
                traceImageData,
                this.strokeScores
            );
        }
        
        // Play feedback sound
        if (this.game.audioManager) {
            this.game.audioManager.playTraceSuccess(totalScore);
        }
        
        // Track the tracing score for leaderboard
        if (this.game.levelManager && this.game.levelManager.isLevelActive()) {
            this.game.levelManager.addTracingScore(totalScore);
        }
        
        // Award XP and coins with level multipliers (reduced amounts)
        if (this.game.progression) {
            const playerLevel = this.game.progression.playerLevel;
            const baseXP = totalScore >= 90 ? 25 : totalScore >= 80 ? 18 : 12; // Reduced from 35/25/15
            const bonusXP = Math.floor(baseXP * (playerLevel - 1) * 0.02); // Reduced from 5% to 2%
            this.game.progression.awardXP(baseXP + bonusXP);
            
            // Add to letter score tracking
            this.game.progression.addLetterScore(this.currentLetter, totalScore);
            
            // Track in spawn pool for statistics
            if (this.game.spawnPool) {
                this.game.spawnPool.trackLetterScore(this.currentLetter, totalScore);
            }
        }
        
        // During levels, add to level score instead of economy coins
        if (this.game.levelManager && this.game.levelManager.isLevelActive()) {
            const playerLevel = this.game.progression ? this.game.progression.playerLevel : 1;
            const baseScore = totalScore >= 90 ? 15 : totalScore >= 70 ? 10 : 5;
            const bonusScore = Math.floor(baseScore * (playerLevel - 1) * 0.15); // 15% bonus score per level
            this.game.levelManager.addScore(baseScore + bonusScore);
            console.log(`📊 Added ${baseScore + bonusScore} to level score (base: ${baseScore}, bonus: ${bonusScore})`);
            
            // Notify multiplayer server if in multiplayer mode
            if (this.game.multiplayerManager && this.game.multiplayerManager.isMultiplayer() && this.currentLetterling) {
                this.game.multiplayerManager.sendLetterlingCollected(
                    this.currentLetterling.id,
                    this.currentLetterling.letter,
                    baseScore + bonusScore
                );
            }
        } else if (this.game.economy) {
            // Outside levels, award coins normally
            const playerLevel = this.game.progression ? this.game.progression.playerLevel : 1;
            const baseCoins = totalScore >= 90 ? 15 : totalScore >= 70 ? 10 : 5;
            const bonusCoins = Math.floor(baseCoins * (playerLevel - 1) * 0.15); // 15% bonus coins per level
            this.game.economy.addCoins(baseCoins + bonusCoins);
        }
        
        // Check for loot drop from this letterling
        this.checkLootDrop(totalScore);
        
        // Show completion screen
        this.showCompletionScreen(totalScore);
        
        // Set up click/tap to dismiss functionality with a delay to prevent immediate dismiss
        setTimeout(() => {
            this.setupDismissHandler();
        }, 100);
        
        // Auto-dismiss after 3 seconds
        this.completionTimeout = setTimeout(() => {
            this.dismissCompletionScreen();
        }, 3000);
    }
    
    showCompletionScreen(score) {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Score
        this.ctx.fillStyle = score >= 90 ? '#4CAF50' : score >= 70 ? '#FF9800' : '#F44336';
        this.ctx.font = 'bold 64px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(score.toString(), this.canvas.width/2, this.canvas.height/2 - 40);
        
        // Grade with level bonus indicator
        const grade = score >= 90 ? 'Perfect!' : score >= 70 ? 'Great!' : 'Good Try!';
        this.ctx.fillStyle = 'white';
        this.ctx.font = 'bold 32px Arial';
        this.ctx.fillText(grade, this.canvas.width/2, this.canvas.height/2 + 20);
        
        // Letter completed  
        this.ctx.fillStyle = 'white';
        this.ctx.font = 'bold 24px Arial';
        this.ctx.fillText(`Letter ${this.currentLetter} completed!`, this.canvas.width/2, this.canvas.height/2 + 60);
        
        // Show level bonus if applicable
        const playerLevel = this.game.progression ? this.game.progression.playerLevel : 1;
        if (playerLevel > 1) {
            const multiplier = 1 + ((playerLevel - 1) * 0.02);
            this.ctx.fillStyle = '#FFD700';
            this.ctx.font = 'bold 18px Arial';
            this.ctx.fillText(`🌟 Level ${playerLevel} Bonus: x${multiplier.toFixed(2)}!`, this.canvas.width/2, this.canvas.height/2 + 90);
        }
        
        // Stroke details
        this.ctx.fillStyle = 'white';
        this.ctx.font = '16px Arial';
        this.ctx.fillText(`${this.strokeScores.length} strokes traced`, this.canvas.width/2, this.canvas.height/2 + (playerLevel > 1 ? 115 : 90));
        
        // Show letter pet progress if applicable
        if (this.game.progression) {
            const letterScore = this.game.progression.letterScores.get(this.currentLetter) || 0;
            const LETTER_PET_THRESHOLD = 3000;
            const progress = Math.min(100, Math.round((letterScore / LETTER_PET_THRESHOLD) * 100));
            
            if (progress < 100) {
                // Draw progress bar
                const barWidth = 200;
                const barHeight = 20;
                const barX = (this.canvas.width - barWidth) / 2;
                const barY = this.canvas.height - 80;
                
                // Background
                this.ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
                this.ctx.fillRect(barX, barY, barWidth, barHeight);
                
                // Progress fill
                this.ctx.fillStyle = progress >= 80 ? '#4CAF50' : progress >= 50 ? '#FF9800' : '#2196F3';
                this.ctx.fillRect(barX, barY, (barWidth * progress) / 100, barHeight);
                
                // Border
                this.ctx.strokeStyle = 'white';
                this.ctx.strokeRect(barX, barY, barWidth, barHeight);
                
                // Text
                this.ctx.fillStyle = 'white';
                this.ctx.font = '14px Arial';
                this.ctx.textAlign = 'center';
                this.ctx.fillText(`🐕 Letter Pet Progress: ${progress}%`, this.canvas.width/2, barY - 5);
            }
        }
        
        // Add instruction to click/tap to continue
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        this.ctx.font = '18px Arial';
        this.ctx.fillText('Click or tap to continue...', this.canvas.width/2, this.canvas.height - 30);
    }
    
    setupDismissHandler() {
        // Only set up handler if we're in a completed state
        if (this.currentStrokeIndex < this.letterTemplates.getStrokeCount(this.currentLetter)) {
            console.warn('Attempting to set up dismiss handler before letter completion');
            return;
        }
        
        // Set up click/tap handler for dismissing completion screen
        this.dismissHandler = (event) => {
            event.preventDefault();
            event.stopPropagation(); // Stop propagation to prevent multiple handlers
            
            // Double-check we're still in completion state
            if (this.isActive && this.currentStrokeIndex >= this.letterTemplates.getStrokeCount(this.currentLetter)) {
                this.dismissCompletionScreen();
            }
        };
        
        // Add event listeners for both mouse and touch
        this.canvas.addEventListener('click', this.dismissHandler);
        this.canvas.addEventListener('touchstart', this.dismissHandler);
    }
    
    dismissCompletionScreen() {
        // Clear the timeout if it exists
        if (this.completionTimeout) {
            clearTimeout(this.completionTimeout);
            this.completionTimeout = null;
        }
        
        // Remove dismiss handlers
        if (this.dismissHandler) {
            this.canvas.removeEventListener('click', this.dismissHandler);
            this.canvas.removeEventListener('touchstart', this.dismissHandler);
            this.dismissHandler = null;
        }
        
        // Get the final score before hiding
        const avgStrokeScore = this.strokeScores.reduce((sum, score) => sum + score, 0) / this.strokeScores.length;
        const totalScore = Math.round(avgStrokeScore);
        
        // Check if this is contest mode
        if (this.onComplete) {
            // Call the contest completion handler
            const callback = this.onComplete;
            this.onComplete = null; // Clear callback
            this.hide();
            callback(totalScore);
        } else {
            // Normal mode - hide and exit trace mode
            this.hide();
            this.game.exitTraceMode();
        }
    }
    
    checkLootDrop(score) {
        // Reduced base loot chance: 12% (down from 18%)
        const baseLootChance = 0.12;
        const lootChanceBonus = this.game.progression?.getLootChanceBonus() || 0;
        const finalLootChance = Math.min(0.45, baseLootChance + lootChanceBonus); // Reduced cap to 45%
        
        // Smaller score bonus
        const scoreBonus = Math.max(0, (score - 85) / 300); // Reduced bonus, higher threshold
        const totalChance = Math.min(0.50, finalLootChance + scoreBonus); // Lower max cap
        
        const roll = Math.random();
        console.log(`🎲 Loot roll: ${Math.round(roll * 100)} vs ${Math.round(totalChance * 100)}% chance`);
        
        if (roll < totalChance) {
            console.log(`🎁 LOOT DROP! (${Math.round(totalChance * 100)}% chance)`);
            this.generateLootDrop();
        } else {
            console.log(`No loot this time (${Math.round(totalChance * 100)}% chance)`);
        }
    }
    
    generateLootDrop() {
        const lootTypes = [
            // Temporary mini-boosts (shorter duration than level-up upgrades)
            { name: 'Speed Boost', description: '+100% speed for 8 seconds', effect: 'tempSpeed', value: 1.0, duration: 8000, rarity: 'common' },
            { name: 'Quick Hands', description: '+150% acceleration for 6 seconds', effect: 'tempAccel', value: 1.5, duration: 6000, rarity: 'common' },
            { name: 'Bigger Reach', description: '+200% collision radius for 10 seconds', effect: 'tempReach', value: 2.0, duration: 10000, rarity: 'common' },
            
            // Instant rewards
            { name: 'XP Boost', description: '+15 XP instantly', effect: 'instantXP', value: 15, rarity: 'common' },
            { name: 'Coin Shower', description: '+25 coins instantly', effect: 'instantCoins', value: 25, rarity: 'common' },
            { name: 'Big XP Boost', description: '+35 XP instantly', effect: 'instantXP', value: 35, rarity: 'rare' },
            
            // Rare powerful effects
            { name: 'Super Speed', description: '+250% speed for 5 seconds', effect: 'tempSpeed', value: 2.5, duration: 5000, rarity: 'rare' },
            { name: 'Lightning Reflexes', description: '+300% acceleration for 4 seconds', effect: 'tempAccel', value: 3.0, duration: 4000, rarity: 'rare' },
            { name: 'Golden Touch', description: '+50 coins instantly', effect: 'instantCoins', value: 50, rarity: 'rare' },
        ];
        
        // Weighted selection based on rarity
        const commonLoot = lootTypes.filter(l => l.rarity === 'common');
        const rareLoot = lootTypes.filter(l => l.rarity === 'rare');
        
        const isRare = Math.random() < 0.15; // 15% chance for rare loot
        const selectedLoot = isRare ? 
            rareLoot[Math.floor(Math.random() * rareLoot.length)] :
            commonLoot[Math.floor(Math.random() * commonLoot.length)];
        
        this.applyLootDrop(selectedLoot);
    }
    
    applyLootDrop(loot) {
        console.log(`🎁 Applying loot: ${loot.name} - ${loot.description}`);
        
        switch (loot.effect) {
            case 'tempSpeed':
                this.applyTempBoost('maxSpeed', loot.value, loot.duration, loot.name);
                break;
            case 'tempAccel':
                this.applyTempBoost('acceleration', loot.value, loot.duration, loot.name);
                break;
            case 'tempReach':
                this.applyTempBoost('radius', loot.value, loot.duration, loot.name);
                break;
            case 'instantXP':
                if (this.game.progression) {
                    this.game.progression.awardXP(loot.value);
                }
                this.showLootEffect(`+${loot.value} XP!`, '⭐');
                break;
            case 'instantCoins':
                if (this.game.economy) {
                    this.game.economy.addCoins(loot.value);
                }
                this.showLootEffect(`+${loot.value} Coins!`, '🪙');
                break;
        }
    }
    
    applyTempBoost(stat, multiplier, duration, name) {
        if (!this.game.player.originalStats) {
            this.game.player.originalStats = {
                maxSpeed: this.game.player.maxSpeed,
                acceleration: this.game.player.acceleration,
                radius: this.game.player.radius
            };
        }
        
        const player = this.game.player;
        const original = player.originalStats;
        
        switch (stat) {
            case 'maxSpeed':
                player.maxSpeed = Math.round(original.maxSpeed * (1 + multiplier));
                this.showLootEffect(`${name}! Speed: ${original.maxSpeed} → ${player.maxSpeed}`, '🚀');
                break;
            case 'acceleration':
                player.acceleration = Math.round(original.acceleration * (1 + multiplier));
                this.showLootEffect(`${name}! Accel: ${original.acceleration} → ${player.acceleration}`, '⚡');
                break;
            case 'radius':
                player.radius = Math.round(original.radius * (1 + multiplier));
                this.showLootEffect(`${name}! Reach: ${original.radius} → ${player.radius}`, '👐');
                break;
        }
        
        // Set shorter temporary effect
        player.tempUpgradeEnd = Date.now() + duration;
        player.tempUpgradeType = `loot_${stat}`;
        player.upgradeGlowTime = Date.now() + duration;
        player.isTempUpgrade = true;
    }
    
    showLootEffect(message, icon) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 40%;
            left: 50%;
            transform: translateX(-50%);
            background: linear-gradient(135deg, #32CD32, #228B22);
            color: white;
            padding: 12px 20px;
            border: 3px solid #fff;
            border-radius: 18px;
            font-size: 18px;
            font-weight: bold;
            z-index: 1002;
            animation: lootPop 2.5s ease-out forwards;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
        `;
        
        notification.innerHTML = `${icon} ${message}`;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 2500);
    }
    
    retry() {
        if (this.currentLetterling) {
            this.currentStrokeIndex = 0;
            this.completedStrokes = [];
            this.currentUserStroke = [];
            this.userStrokes = [];
            this.strokeScores = [];
            this.drawLetterGuide();
        }
    }
    
    skip() {
        // Allow skipping with minimal reward
        if (this.game.progression) {
            this.game.progression.awardXP(5);
        }
        
        this.hide();
        this.game.exitTraceMode();
    }
    
    cleanup() {
        this.isActive = false;
        this.currentLetterling = null;
        this.currentLetter = '';
        this.currentStrokeIndex = 0;
        this.completedStrokes = [];
        this.currentUserStroke = [];
        this.userStrokes = [];
        this.strokeScores = [];
        this.inputEnabled = true; // Reset input enabled state
        
        if (this.inputCleanup) {
            this.inputCleanup();
            this.inputCleanup = null;
        }
        
        // Clean up any completion screen handlers
        if (this.dismissHandler) {
            this.canvas.removeEventListener('click', this.dismissHandler);
            this.canvas.removeEventListener('touchstart', this.dismissHandler);
            this.dismissHandler = null;
        }
        
        if (this.completionTimeout) {
            clearTimeout(this.completionTimeout);
            this.completionTimeout = null;
        }
    }
}