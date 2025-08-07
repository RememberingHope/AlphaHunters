// OtherPlayer - Represents and renders other players in multiplayer games

class OtherPlayer {
    constructor(id, name, emoji, x, y) {
        this.id = id;
        this.name = name;
        this.emoji = emoji;
        
        // Current position (for rendering)
        this.x = x;
        this.y = y;
        
        // Target position (for interpolation)
        this.targetX = x;
        this.targetY = y;
        
        // Previous position (for interpolation)
        this.prevX = x;
        this.prevY = y;
        
        // Velocity for prediction
        this.vx = 0;
        this.vy = 0;
        
        // Visual properties
        this.radius = 20; // Same as main player
        this.facing = 'right';
        this.isMoving = false;
        
        // Animation
        this.animationFrame = 0;
        this.animationSpeed = 0.2;
        
        // Connection quality
        this.lastUpdateTime = Date.now();
        this.connectionQuality = 'good'; // good, poor, lost
        
        // Score display
        this.score = 0;
        this.displayScore = 0; // For smooth score animation
        
        // Visual effects
        this.collectEffect = null;
        this.trailPositions = [];
        this.maxTrailLength = 5;
    }
    
    updatePosition(x, y, vx = 0, vy = 0, immediate = false) {
        // Store previous position
        this.prevX = this.x;
        this.prevY = this.y;
        
        if (immediate) {
            // Teleport to position (e.g., on initial spawn)
            this.x = this.targetX = x;
            this.y = this.targetY = y;
        } else {
            // Set target for interpolation
            this.targetX = x;
            this.targetY = y;
        }
        
        // Update velocity
        this.vx = vx;
        this.vy = vy;
        
        // Update facing direction
        if (Math.abs(vx) > 0.1) {
            this.facing = vx > 0 ? 'right' : 'left';
        }
        
        // Update movement state
        this.isMoving = Math.abs(vx) > 0.1 || Math.abs(vy) > 0.1;
        
        // Update connection quality
        this.lastUpdateTime = Date.now();
        this.connectionQuality = 'good';
    }
    
    update(deltaTime) {
        // Check connection quality
        const timeSinceUpdate = Date.now() - this.lastUpdateTime;
        if (timeSinceUpdate > 3000) {
            this.connectionQuality = 'lost';
        } else if (timeSinceUpdate > 1000) {
            this.connectionQuality = 'poor';
        }
        
        // Smooth position interpolation
        const interpSpeed = 0.15; // Adjust for smoothness vs responsiveness
        
        // Calculate interpolation with prediction
        const predictedX = this.targetX + this.vx * (timeSinceUpdate / 1000);
        const predictedY = this.targetY + this.vy * (timeSinceUpdate / 1000);
        
        // Interpolate to predicted position
        this.x += (predictedX - this.x) * interpSpeed;
        this.y += (predictedY - this.y) * interpSpeed;
        
        // Update animation
        if (this.isMoving) {
            this.animationFrame += this.animationSpeed;
            if (this.animationFrame >= 4) {
                this.animationFrame = 0;
            }
        } else {
            this.animationFrame = 0;
        }
        
        // Smooth score animation
        if (this.displayScore !== this.score) {
            const scoreDiff = this.score - this.displayScore;
            this.displayScore += Math.ceil(scoreDiff * 0.1);
        }
        
        // Update trail for movement effect
        if (this.isMoving && Math.abs(this.x - this.prevX) > 1) {
            this.trailPositions.push({ x: this.x, y: this.y, alpha: 0.5 });
            if (this.trailPositions.length > this.maxTrailLength) {
                this.trailPositions.shift();
            }
        }
        
        // Fade trail
        this.trailPositions.forEach((pos, i) => {
            pos.alpha *= 0.9;
            if (pos.alpha < 0.01) {
                this.trailPositions.splice(i, 1);
            }
        });
        
        // Update collect effect
        if (this.collectEffect) {
            this.collectEffect.update(deltaTime);
            if (this.collectEffect.finished) {
                this.collectEffect = null;
            }
        }
    }
    
    render(ctx, camera) {
        // Calculate screen position
        const screenX = this.x - camera.x + ctx.canvas.width / 2;
        const screenY = this.y - camera.y + ctx.canvas.height / 2;
        
        // Don't render if off-screen
        if (screenX < -100 || screenX > ctx.canvas.width + 100 ||
            screenY < -100 || screenY > ctx.canvas.height + 100) {
            return;
        }
        
        ctx.save();
        
        // Apply connection quality effects
        if (this.connectionQuality === 'poor') {
            ctx.globalAlpha = 0.7;
        } else if (this.connectionQuality === 'lost') {
            ctx.globalAlpha = 0.3;
        }
        
        // Draw movement trail
        this.trailPositions.forEach(pos => {
            ctx.globalAlpha = pos.alpha * 0.3;
            ctx.fillStyle = '#4CAF50';
            ctx.beginPath();
            ctx.arc(
                pos.x - camera.x + ctx.canvas.width / 2,
                pos.y - camera.y + ctx.canvas.height / 2,
                this.radius * 0.7,
                0,
                Math.PI * 2
            );
            ctx.fill();
        });
        
        ctx.globalAlpha = this.connectionQuality === 'lost' ? 0.3 : 1;
        
        // Draw shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.beginPath();
        ctx.ellipse(screenX, screenY + this.radius + 5, this.radius * 0.8, this.radius * 0.3, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw player body
        ctx.fillStyle = '#2196F3'; // Different color from main player
        ctx.strokeStyle = '#1976D2';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(screenX, screenY, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        // Draw emoji face
        ctx.save();
        ctx.translate(screenX, screenY);
        if (this.facing === 'left') {
            ctx.scale(-1, 1);
        }
        
        // Draw emoji
        ctx.font = `${this.radius * 1.5}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.emoji, 0, 0);
        
        ctx.restore();
        
        // Draw name tag
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(
            screenX - 40,
            screenY - this.radius - 35,
            80,
            20
        );
        
        ctx.fillStyle = 'white';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.name, screenX, screenY - this.radius - 25);
        
        // Draw score
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(
            screenX - 30,
            screenY + this.radius + 10,
            60,
            18
        );
        
        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 12px Arial';
        ctx.fillText(`${this.displayScore} pts`, screenX, screenY + this.radius + 19);
        
        // Draw connection indicator
        if (this.connectionQuality !== 'good') {
            const indicatorX = screenX + this.radius + 5;
            const indicatorY = screenY - this.radius;
            
            ctx.fillStyle = this.connectionQuality === 'poor' ? '#FFA500' : '#FF0000';
            ctx.beginPath();
            ctx.arc(indicatorX, indicatorY, 4, 0, Math.PI * 2);
            ctx.fill();
            
            // WiFi symbol
            ctx.strokeStyle = ctx.fillStyle;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(indicatorX, indicatorY, 8, -Math.PI * 0.75, -Math.PI * 0.25, false);
            ctx.stroke();
            
            if (this.connectionQuality === 'lost') {
                // Draw X through WiFi symbol
                ctx.beginPath();
                ctx.moveTo(indicatorX - 6, indicatorY - 6);
                ctx.lineTo(indicatorX + 6, indicatorY + 6);
                ctx.moveTo(indicatorX - 6, indicatorY + 6);
                ctx.lineTo(indicatorX + 6, indicatorY - 6);
                ctx.stroke();
            }
        }
        
        // Draw collect effect
        if (this.collectEffect) {
            this.collectEffect.render(ctx, screenX, screenY);
        }
        
        ctx.restore();
    }
    
    // Called when this player collects a letterling
    triggerCollectEffect() {
        this.collectEffect = new CollectEffect();
    }
    
    // Update score with animation
    setScore(newScore) {
        if (newScore > this.score) {
            this.triggerCollectEffect();
        }
        this.score = newScore;
    }
    
    // Get interpolated position for collision checks
    getPosition() {
        return { x: this.x, y: this.y };
    }
    
    // Check if player is active (not disconnected)
    isActive() {
        return this.connectionQuality !== 'lost';
    }
}

// Simple collect effect for visual feedback
class CollectEffect {
    constructor() {
        this.particles = [];
        this.finished = false;
        
        // Create sparkle particles
        for (let i = 0; i < 8; i++) {
            const angle = (Math.PI * 2 * i) / 8;
            this.particles.push({
                x: 0,
                y: 0,
                vx: Math.cos(angle) * 3,
                vy: Math.sin(angle) * 3,
                life: 1.0,
                size: 4
            });
        }
    }
    
    update(deltaTime) {
        let allDead = true;
        
        this.particles.forEach(p => {
            if (p.life > 0) {
                p.x += p.vx;
                p.y += p.vy;
                p.vx *= 0.95;
                p.vy *= 0.95;
                p.life -= 0.05;
                p.size *= 0.95;
                allDead = false;
            }
        });
        
        this.finished = allDead;
    }
    
    render(ctx, x, y) {
        ctx.save();
        this.particles.forEach(p => {
            if (p.life > 0) {
                ctx.globalAlpha = p.life;
                ctx.fillStyle = '#FFD700';
                ctx.beginPath();
                ctx.arc(x + p.x, y + p.y, p.size, 0, Math.PI * 2);
                ctx.fill();
            }
        });
        ctx.restore();
    }
}