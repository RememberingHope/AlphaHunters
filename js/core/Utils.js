// Core utility functions for AlphaHunters

class Utils {
    // Math utilities
    static clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }
    
    static lerp(start, end, factor) {
        return start + (end - start) * factor;
    }
    
    static distance(x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    static angle(x1, y1, x2, y2) {
        return Math.atan2(y2 - y1, x2 - x1);
    }
    
    static normalize(x, y) {
        const len = Math.sqrt(x * x + y * y);
        return len > 0 ? { x: x / len, y: y / len } : { x: 0, y: 0 };
    }
    
    static randomBetween(min, max) {
        return Math.random() * (max - min) + min;
    }
    
    static randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    
    // Array utilities
    static shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }
    
    static pickRandom(array) {
        return array[Math.floor(Math.random() * array.length)];
    }
    
    // Timing utilities
    static formatTime(ms) {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    
    // Color utilities
    static hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }
    
    static rgbToHex(r, g, b) {
        return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }
    
    // Collision detection
    static pointInRect(px, py, rx, ry, rw, rh) {
        return px >= rx && px <= rx + rw && py >= ry && py <= ry + rh;
    }
    
    static circleCollision(x1, y1, r1, x2, y2, r2) {
        const dist = this.distance(x1, y1, x2, y2);
        return dist < (r1 + r2);
    }
    
    static rectCollision(x1, y1, w1, h1, x2, y2, w2, h2) {
        return x1 < x2 + w2 && x1 + w1 > x2 && y1 < y2 + h2 && y1 + h1 > y2;
    }
    
    // Stroke processing utilities
    static smoothStroke(points, factor = 0.3) {
        if (points.length < 3) return points;
        
        const smoothed = [points[0]];
        for (let i = 1; i < points.length - 1; i++) {
            const prev = points[i - 1];
            const curr = points[i];
            const next = points[i + 1];
            
            smoothed.push({
                x: curr.x + factor * (prev.x + next.x - 2 * curr.x),
                y: curr.y + factor * (prev.y + next.y - 2 * curr.y),
                t: curr.t
            });
        }
        smoothed.push(points[points.length - 1]);
        return smoothed;
    }
    
    static simplifyStroke(points, tolerance = 2) {
        if (points.length < 3) return points;
        
        // Douglas-Peucker algorithm
        const simplified = [points[0]];
        this._simplifyRecursive(points, 0, points.length - 1, tolerance, simplified);
        simplified.push(points[points.length - 1]);
        return simplified;
    }
    
    static _simplifyRecursive(points, start, end, tolerance, result) {
        let maxDist = 0;
        let maxIndex = 0;
        
        for (let i = start + 1; i < end; i++) {
            const dist = this._perpendicularDistance(points[i], points[start], points[end]);
            if (dist > maxDist) {
                maxDist = dist;
                maxIndex = i;
            }
        }
        
        if (maxDist > tolerance) {
            this._simplifyRecursive(points, start, maxIndex, tolerance, result);
            result.push(points[maxIndex]);
            this._simplifyRecursive(points, maxIndex, end, tolerance, result);
        }
    }
    
    static _perpendicularDistance(point, lineStart, lineEnd) {
        const dx = lineEnd.x - lineStart.x;
        const dy = lineEnd.y - lineStart.y;
        
        if (dx === 0 && dy === 0) {
            return this.distance(point.x, point.y, lineStart.x, lineStart.y);
        }
        
        const t = ((point.x - lineStart.x) * dx + (point.y - lineStart.y) * dy) / (dx * dx + dy * dy);
        const projection = {
            x: lineStart.x + t * dx,
            y: lineStart.y + t * dy
        };
        
        return this.distance(point.x, point.y, projection.x, projection.y);
    }
    
    static normalizeStroke(points) {
        if (points.length === 0) return points;
        
        // Find bounding box
        let minX = points[0].x, maxX = points[0].x;
        let minY = points[0].y, maxY = points[0].y;
        
        for (const point of points) {
            minX = Math.min(minX, point.x);
            maxX = Math.max(maxX, point.x);
            minY = Math.min(minY, point.y);
            maxY = Math.max(maxY, point.y);
        }
        
        const width = maxX - minX;
        const height = maxY - minY;
        const scale = width > 0 && height > 0 ? Math.max(width, height) : 1;
        
        // Normalize to 0-1 range
        return points.map(point => ({
            x: width > 0 ? (point.x - minX) / scale : 0.5,
            y: height > 0 ? (point.y - minY) / scale : 0.5,
            t: point.t
        }));
    }
    
    static resampleStroke(points, numPoints = 64) {
        if (points.length < 2) return points;
        
        // Calculate total path length
        let totalLength = 0;
        const lengths = [0];
        
        for (let i = 1; i < points.length; i++) {
            const segmentLength = this.distance(
                points[i-1].x, points[i-1].y,
                points[i].x, points[i].y
            );
            totalLength += segmentLength;
            lengths.push(totalLength);
        }
        
        if (totalLength === 0) return points;
        
        // Resample at equal intervals
        const resampled = [];
        const interval = totalLength / (numPoints - 1);
        
        let currentLength = 0;
        let pointIndex = 0;
        
        for (let i = 0; i < numPoints; i++) {
            const targetLength = i * interval;
            
            // Find the segment containing the target length
            while (pointIndex < lengths.length - 1 && lengths[pointIndex + 1] < targetLength) {
                pointIndex++;
            }
            
            if (pointIndex >= points.length - 1) {
                resampled.push(points[points.length - 1]);
                continue;
            }
            
            // Interpolate within the segment
            const segmentStart = lengths[pointIndex];
            const segmentEnd = lengths[pointIndex + 1];
            const segmentLength = segmentEnd - segmentStart;
            
            if (segmentLength === 0) {
                resampled.push(points[pointIndex]);
                continue;
            }
            
            const t = (targetLength - segmentStart) / segmentLength;
            const p1 = points[pointIndex];
            const p2 = points[pointIndex + 1];
            
            resampled.push({
                x: this.lerp(p1.x, p2.x, t),
                y: this.lerp(p1.y, p2.y, t),
                t: this.lerp(p1.t, p2.t, t)
            });
        }
        
        return resampled;
    }
    
    // DOM utilities
    static createElement(tag, className, innerHTML) {
        const element = document.createElement(tag);
        if (className) element.className = className;
        if (innerHTML) element.innerHTML = innerHTML;
        return element;
    }
    
    static getCanvasPoint(canvas, clientX, clientY) {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        
        return {
            x: (clientX - rect.left) * scaleX,
            y: (clientY - rect.top) * scaleY
        };
    }
    
    // Performance utilities
    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    static throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Utils;
}