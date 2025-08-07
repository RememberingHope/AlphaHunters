// TraceCapture - Captures and stores letter trace images for progress tracking
class TraceCapture {
    constructor(game) {
        this.game = game;
        
        // Canvas for capturing traces
        this.captureCanvas = null;
        this.captureCtx = null;
        
        // Capture settings
        this.CAPTURE_SIZE = 200; // 200x200 pixels
        this.STROKE_COLOR = '#2196F3';
        this.BACKGROUND_COLOR = '#FFFFFF';
        this.GUIDE_COLOR = 'rgba(200, 200, 200, 0.3)';
        
        this.init();
    }
    
    init() {
        // Create off-screen canvas for capturing
        this.captureCanvas = document.createElement('canvas');
        this.captureCanvas.width = this.CAPTURE_SIZE;
        this.captureCanvas.height = this.CAPTURE_SIZE;
        this.captureCtx = this.captureCanvas.getContext('2d');
        
        console.log('📸 TraceCapture initialized');
    }
    
    // Capture current trace from the game canvas
    captureTrace(letter, userStrokes, score, letterTemplate = null) {
        // Clear capture canvas
        this.captureCtx.fillStyle = this.BACKGROUND_COLOR;
        this.captureCtx.fillRect(0, 0, this.CAPTURE_SIZE, this.CAPTURE_SIZE);
        
        // Calculate common bounds for both template and user strokes
        let combinedBounds = null;
        if (letterTemplate && userStrokes.length > 0) {
            // Get bounds of template
            const templateBounds = this.calculateTemplateBounds(letterTemplate);
            // Get bounds of user strokes
            const userBounds = this.calculateStrokeBounds(userStrokes);
            
            // Combine bounds to ensure both fit
            combinedBounds = {
                minX: Math.min(templateBounds.minX, userBounds.minX),
                minY: Math.min(templateBounds.minY, userBounds.minY),
                maxX: Math.max(templateBounds.maxX, userBounds.maxX),
                maxY: Math.max(templateBounds.maxY, userBounds.maxY),
                width: 0,
                height: 0
            };
            combinedBounds.width = combinedBounds.maxX - combinedBounds.minX || 1;
            combinedBounds.height = combinedBounds.maxY - combinedBounds.minY || 1;
        }
        
        // Draw letter guide strokes in background if template provided
        if (letterTemplate) {
            this.drawLetterStrokeGuide(letterTemplate, combinedBounds);
        } else {
            // Fallback to font-based guide
            this.drawLetterGuide(letter);
        }
        
        // Draw user strokes
        this.drawUserStrokes(userStrokes, combinedBounds);
        
        // Add metadata overlay
        this.addMetadataOverlay(letter, score);
        
        // Convert to base64 image
        const imageData = this.captureCanvas.toDataURL('image/png', 0.8);
        
        console.log(`📸 Captured trace for letter ${letter}, score: ${score}`);
        
        return imageData;
    }
    
    drawLetterGuide(letter) {
        this.captureCtx.save();
        
        // Draw light letter guide
        this.captureCtx.font = `${this.CAPTURE_SIZE * 0.7}px Arial`;
        this.captureCtx.fillStyle = this.GUIDE_COLOR;
        this.captureCtx.textAlign = 'center';
        this.captureCtx.textBaseline = 'middle';
        this.captureCtx.fillText(letter.toUpperCase(), this.CAPTURE_SIZE / 2, this.CAPTURE_SIZE / 2);
        
        this.captureCtx.restore();
    }
    
    drawLetterStrokeGuide(letterTemplate, bounds = null) {
        this.captureCtx.save();
        
        // Set style for guide strokes
        this.captureCtx.strokeStyle = 'rgba(200, 200, 200, 0.5)';
        this.captureCtx.lineWidth = 3;
        this.captureCtx.lineCap = 'round';
        this.captureCtx.lineJoin = 'round';
        this.captureCtx.setLineDash([5, 5]); // Dashed line for guide
        
        // Calculate scale and offset
        const padding = 30;
        const availableSize = this.CAPTURE_SIZE - (padding * 2);
        let scale, offsetX, offsetY;
        
        if (bounds) {
            // Use provided bounds for consistent scaling
            const scaleX = availableSize / (bounds.width || 1);
            const scaleY = availableSize / (bounds.height || 1);
            scale = Math.min(scaleX, scaleY) * 0.9;
            offsetX = padding + (availableSize - bounds.width * scale) / 2;
            offsetY = padding + (availableSize - bounds.height * scale) / 2;
        } else {
            // Default scaling for template coordinates (0-1 range)
            scale = availableSize;
            offsetX = padding;
            offsetY = padding;
        }
        
        // Draw each stroke from the template
        letterTemplate.strokes.forEach((stroke, strokeIndex) => {
            this.captureCtx.beginPath();
            
            stroke.points.forEach((point, index) => {
                // Scale points to fit canvas
                let x, y;
                if (bounds) {
                    x = offsetX + (point.x - bounds.minX) * scale;
                    y = offsetY + (point.y - bounds.minY) * scale;
                } else {
                    x = offsetX + point.x * scale;
                    y = offsetY + point.y * scale;
                }
                
                if (index === 0) {
                    this.captureCtx.moveTo(x, y);
                    
                    // Draw start point indicator
                    this.captureCtx.save();
                    this.captureCtx.fillStyle = 'rgba(76, 175, 80, 0.6)';
                    this.captureCtx.beginPath();
                    this.captureCtx.arc(x, y, 6, 0, Math.PI * 2);
                    this.captureCtx.fill();
                    
                    // Draw stroke number
                    this.captureCtx.fillStyle = 'white';
                    this.captureCtx.font = 'bold 10px Arial';
                    this.captureCtx.textAlign = 'center';
                    this.captureCtx.textBaseline = 'middle';
                    this.captureCtx.fillText((strokeIndex + 1).toString(), x, y);
                    this.captureCtx.restore();
                } else {
                    this.captureCtx.lineTo(x, y);
                }
            });
            
            this.captureCtx.stroke();
            
            // Draw arrow at the end
            if (stroke.points.length >= 2) {
                const endPoint = stroke.points[stroke.points.length - 1];
                const prevPoint = stroke.points[stroke.points.length - 2];
                let endX, endY, prevX, prevY;
                
                if (bounds) {
                    endX = offsetX + (endPoint.x - bounds.minX) * scale;
                    endY = offsetY + (endPoint.y - bounds.minY) * scale;
                    prevX = offsetX + (prevPoint.x - bounds.minX) * scale;
                    prevY = offsetY + (prevPoint.y - bounds.minY) * scale;
                } else {
                    endX = offsetX + endPoint.x * scale;
                    endY = offsetY + endPoint.y * scale;
                    prevX = offsetX + prevPoint.x * scale;
                    prevY = offsetY + prevPoint.y * scale;
                }
                
                // Calculate arrow direction
                const angle = Math.atan2(endY - prevY, endX - prevX);
                
                // Draw arrowhead
                this.captureCtx.save();
                this.captureCtx.translate(endX, endY);
                this.captureCtx.rotate(angle);
                this.captureCtx.fillStyle = 'rgba(200, 200, 200, 0.6)';
                this.captureCtx.beginPath();
                this.captureCtx.moveTo(0, 0);
                this.captureCtx.lineTo(-8, -4);
                this.captureCtx.lineTo(-8, 4);
                this.captureCtx.closePath();
                this.captureCtx.fill();
                this.captureCtx.restore();
            }
        });
        
        this.captureCtx.restore();
    }
    
    drawUserStrokes(userStrokes, providedBounds = null) {
        if (!userStrokes || userStrokes.length === 0) return;
        
        this.captureCtx.save();
        
        // Set stroke style - make it more vibrant and visible
        this.captureCtx.strokeStyle = '#FF5722'; // Bright orange-red
        this.captureCtx.lineWidth = 5;
        this.captureCtx.lineCap = 'round';
        this.captureCtx.lineJoin = 'round';
        
        // Add shadow for better visibility
        this.captureCtx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        this.captureCtx.shadowBlur = 3;
        this.captureCtx.shadowOffsetX = 1;
        this.captureCtx.shadowOffsetY = 1;
        
        // Use provided bounds or calculate from strokes
        const padding = 30;
        const availableSize = this.CAPTURE_SIZE - (padding * 2);
        const bounds = providedBounds || this.calculateStrokeBounds(userStrokes);
        
        // Calculate scale to fit strokes while maintaining aspect ratio
        const scaleX = availableSize / (bounds.width || 1);
        const scaleY = availableSize / (bounds.height || 1);
        const scale = Math.min(scaleX, scaleY) * 0.9; // Slightly smaller to ensure it fits
        
        // Center the strokes
        const offsetX = padding + (availableSize - bounds.width * scale) / 2;
        const offsetY = padding + (availableSize - bounds.height * scale) / 2;
        
        // Draw each stroke (each stroke is an array of points)
        userStrokes.forEach((stroke, strokeIndex) => {
            if (stroke && stroke.length > 1) {
                this.captureCtx.beginPath();
                
                stroke.forEach((point, index) => {
                    const x = offsetX + (point.x - bounds.minX) * scale;
                    const y = offsetY + (point.y - bounds.minY) * scale;
                    
                    if (index === 0) {
                        this.captureCtx.moveTo(x, y);
                    } else {
                        this.captureCtx.lineTo(x, y);
                    }
                });
                
                this.captureCtx.stroke();
            }
        });
        
        this.captureCtx.restore();
    }
    
    calculateStrokeBounds(strokes) {
        let minX = Infinity, minY = Infinity;
        let maxX = -Infinity, maxY = -Infinity;
        
        // Each stroke is an array of points
        strokes.forEach(stroke => {
            if (stroke && stroke.length > 0) {
                stroke.forEach(point => {
                    if (point && point.x !== undefined && point.y !== undefined) {
                        minX = Math.min(minX, point.x);
                        minY = Math.min(minY, point.y);
                        maxX = Math.max(maxX, point.x);
                        maxY = Math.max(maxY, point.y);
                    }
                });
            }
        });
        
        // Ensure we have valid bounds
        if (minX === Infinity || minY === Infinity || maxX === -Infinity || maxY === -Infinity) {
            // Default to center of capture area if no valid points
            return {
                minX: 50, minY: 50, maxX: 150, maxY: 150,
                width: 100, height: 100
            };
        }
        
        return {
            minX, minY, maxX, maxY,
            width: maxX - minX || 1,
            height: maxY - minY || 1
        };
    }
    
    calculateTemplateBounds(letterTemplate) {
        let minX = Infinity, minY = Infinity;
        let maxX = -Infinity, maxY = -Infinity;
        
        // Go through all strokes in the template
        letterTemplate.strokes.forEach(stroke => {
            stroke.points.forEach(point => {
                minX = Math.min(minX, point.x);
                minY = Math.min(minY, point.y);
                maxX = Math.max(maxX, point.x);
                maxY = Math.max(maxY, point.y);
            });
        });
        
        return {
            minX: minX || 0,
            minY: minY || 0,
            maxX: maxX || 1,
            maxY: maxY || 1,
            width: (maxX - minX) || 1,
            height: (maxY - minY) || 1
        };
    }
    
    calculateScale(bounds) {
        const padding = 20;
        const availableSize = this.CAPTURE_SIZE - (padding * 2);
        
        const scaleX = availableSize / bounds.width;
        const scaleY = availableSize / bounds.height;
        
        return Math.min(scaleX, scaleY);
    }
    
    calculateOffset(bounds, scale) {
        const scaledWidth = bounds.width * scale;
        const scaledHeight = bounds.height * scale;
        
        return {
            x: (this.CAPTURE_SIZE - scaledWidth) / 2,
            y: (this.CAPTURE_SIZE - scaledHeight) / 2
        };
    }
    
    addMetadataOverlay(letter, score) {
        this.captureCtx.save();
        
        // Add score badge
        const badgeSize = 40;
        const badgeX = this.CAPTURE_SIZE - badgeSize - 10;
        const badgeY = 10;
        
        // Badge background
        this.captureCtx.fillStyle = score >= 90 ? '#4CAF50' : 
                                   score >= 70 ? '#FFC107' : '#FF5722';
        this.captureCtx.beginPath();
        this.captureCtx.arc(badgeX + badgeSize/2, badgeY + badgeSize/2, badgeSize/2, 0, Math.PI * 2);
        this.captureCtx.fill();
        
        // Score text
        this.captureCtx.fillStyle = 'white';
        this.captureCtx.font = 'bold 16px Arial';
        this.captureCtx.textAlign = 'center';
        this.captureCtx.textBaseline = 'middle';
        this.captureCtx.fillText(score + '%', badgeX + badgeSize/2, badgeY + badgeSize/2);
        
        // Add timestamp
        const date = new Date();
        const timeStr = date.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        
        this.captureCtx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.captureCtx.font = '10px Arial';
        this.captureCtx.textAlign = 'right';
        this.captureCtx.textBaseline = 'bottom';
        this.captureCtx.fillText(timeStr, this.CAPTURE_SIZE - 5, this.CAPTURE_SIZE - 5);
        
        this.captureCtx.restore();
    }
    
    // Create a thumbnail version for display
    createThumbnail(imageData, size = 80) {
        const thumbCanvas = document.createElement('canvas');
        thumbCanvas.width = size;
        thumbCanvas.height = size;
        const thumbCtx = thumbCanvas.getContext('2d');
        
        const img = new Image();
        img.onload = () => {
            thumbCtx.drawImage(img, 0, 0, size, size);
        };
        img.src = imageData;
        
        return thumbCanvas.toDataURL('image/png', 0.6);
    }
    
    // Helper to display trace history in UI
    createTraceHistoryElement(traceData) {
        const container = document.createElement('div');
        container.style.cssText = `
            display: inline-block;
            margin: 5px;
            text-align: center;
            cursor: pointer;
            transition: transform 0.2s;
        `;
        
        const img = document.createElement('img');
        img.src = traceData.imageData;
        img.style.cssText = `
            width: 80px;
            height: 80px;
            border: 2px solid #ddd;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        `;
        
        const info = document.createElement('div');
        info.style.cssText = `
            font-size: 12px;
            color: #666;
            margin-top: 5px;
        `;
        info.innerHTML = `
            <div style="font-weight: bold; color: ${this.getScoreColor(traceData.score)};">
                ${traceData.score}%
            </div>
            <div>${this.formatTime(traceData.timestamp)}</div>
        `;
        
        container.appendChild(img);
        container.appendChild(info);
        
        // Add hover effect
        container.addEventListener('mouseenter', () => {
            container.style.transform = 'scale(1.05)';
        });
        
        container.addEventListener('mouseleave', () => {
            container.style.transform = 'scale(1)';
        });
        
        // Click to view larger
        container.addEventListener('click', () => {
            this.showTraceModal(traceData);
        });
        
        return container;
    }
    
    getScoreColor(score) {
        if (score >= 90) return '#4CAF50';
        if (score >= 70) return '#FFC107';
        return '#FF5722';
    }
    
    formatTime(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) {
            return date.toLocaleTimeString('en-US', { 
                hour: 'numeric', 
                minute: '2-digit' 
            });
        } else if (diffDays === 1) {
            return 'Yesterday';
        } else if (diffDays < 7) {
            return `${diffDays} days ago`;
        } else {
            return date.toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric' 
            });
        }
    }
    
    showTraceModal(traceData) {
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
        `;
        
        const content = document.createElement('div');
        content.style.cssText = `
            background: white;
            padding: 20px;
            border-radius: 12px;
            text-align: center;
            max-width: 400px;
        `;
        
        content.innerHTML = `
            <h3 style="margin-bottom: 15px;">Letter Trace Details</h3>
            <img src="${traceData.imageData}" style="
                width: 300px;
                height: 300px;
                border: 2px solid #ddd;
                border-radius: 8px;
                margin-bottom: 15px;
            ">
            <div style="
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 10px;
                text-align: left;
                background: #f5f5f5;
                padding: 15px;
                border-radius: 8px;
            ">
                <div><strong>Score:</strong></div>
                <div style="color: ${this.getScoreColor(traceData.score)};">
                    ${traceData.score}%
                </div>
                <div><strong>Time:</strong></div>
                <div>${(traceData.timeMs / 1000).toFixed(1)}s</div>
                <div><strong>Date:</strong></div>
                <div>${new Date(traceData.timestamp).toLocaleString()}</div>
            </div>
            <button onclick="this.parentElement.parentElement.remove()" style="
                margin-top: 20px;
                background: #2196F3;
                color: white;
                border: none;
                padding: 10px 30px;
                border-radius: 8px;
                cursor: pointer;
                font-size: 16px;
            ">Close</button>
        `;
        
        modal.appendChild(content);
        document.body.appendChild(modal);
        
        // Close on background click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }
}