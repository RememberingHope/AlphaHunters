// Letter Follower - Cartoon letters that follow the player as pets

class LetterFollower {
    constructor(letter, player, index = 0) {
        this.letter = letter;
        this.player = player;
        this.index = index; // Position in the chain
        
        // Position slightly behind player
        this.x = player.x - 50;
        this.y = player.y;
        this.targetX = this.x;
        this.targetY = this.y;
        
        // Visual properties
        this.radius = 15;
        this.color = this.getLetterColor();
        this.emoji = this.getRandomEmoji(); // Random emoji background
        this.bounceOffset = Math.random() * Math.PI * 2; // For animation variety
        this.followSpeed = 0.1; // How quickly it follows
        
        // Animation
        this.bounceTime = 0;
        this.bounceSpeed = 3 + Math.random() * 2;
        this.bobHeight = 8;
        
        // Chain following
        this.chainTarget = null; // What this follower is following (player or another follower)
        
        console.log(`✨ Letter follower '${letter}' created with emoji ${this.emoji}`);
    }
    
    getLetterColor() {
        const colors = {
            'a': '#FF6B6B', 'A': '#FF6B6B',
            'c': '#4ECDC4', 'C': '#4ECDC4', 
            'o': '#45B7D1', 'O': '#45B7D1',
            'e': '#96CEB4', 'E': '#96CEB4',
            'i': '#FFEAA7', 'I': '#FFEAA7',
            'l': '#DDA0DD', 'L': '#DDA0DD',
            't': '#F39C12', 'T': '#F39C12',
            'r': '#E17055', 'R': '#E17055',
            'n': '#00B894', 'N': '#00B894',
            's': '#6C5CE7', 'S': '#6C5CE7',
            'd': '#FD79A8', 'D': '#FD79A8',
            'p': '#FDCB6E', 'P': '#FDCB6E'
        };
        return colors[this.letter] || '#95E1D3';
    }
    
    getRandomEmoji() {
        const emojis = ['😀', '😊', '🥳', '😎', '🤖', '👾', '🌟', '⭐', '✨', '🎉', '🎈', '🎯', '🎨', '🎭', '🎪', '🎊', '🔥', '⚡', '💫', '🌈', '🦄', '🐻', '🐨', '🐼', '🦊', '🐸', '🐯', '🦁', '🐶', '🐱'];
        return emojis[Math.floor(Math.random() * emojis.length)];
    }
    
    setChainTarget(target) {
        this.chainTarget = target;
    }
    
    update(deltaTime) {
        this.bounceTime += deltaTime * this.bounceSpeed;
        
        // Determine what to follow
        const followTarget = this.chainTarget || this.player;
        
        // Calculate follow distance based on player's current radius and chain position
        const baseDistance = this.player.radius + 30; // Base distance from player edge
        const chainSpacing = 35; // Distance between chain followers
        const totalDistance = baseDistance + (this.index * chainSpacing);
        
        // Calculate ideal position behind the target
        let angle;
        if (followTarget === this.player) {
            // Follow behind player based on movement direction
            if (Math.abs(this.player.vx) > 1 || Math.abs(this.player.vy) > 1) {
                angle = Math.atan2(this.player.vy, this.player.vx) + Math.PI;
            } else {
                // Player is stationary, maintain current relative position
                angle = Math.atan2(this.y - this.player.y, this.x - this.player.x);
            }
            this.targetX = this.player.x + Math.cos(angle) * totalDistance;
            this.targetY = this.player.y + Math.sin(angle) * totalDistance;
        } else {
            // Follow behind another follower
            if (followTarget.x && followTarget.y) {
                const dx = followTarget.x - this.player.x;
                const dy = followTarget.y - this.player.y;
                const distFromPlayer = Math.sqrt(dx * dx + dy * dy);
                
                if (distFromPlayer > 0) {
                    angle = Math.atan2(dy, dx);
                    this.targetX = this.player.x + Math.cos(angle) * (distFromPlayer + chainSpacing);
                    this.targetY = this.player.y + Math.sin(angle) * (distFromPlayer + chainSpacing);
                }
            }
        }
        
        // Smooth follow movement
        const dx = this.targetX - this.x;
        const dy = this.targetY - this.y;
        
        this.x += dx * this.followSpeed;
        this.y += dy * this.followSpeed;
    }
    
    render(ctx) {
        // Calculate bounce
        const bounce = Math.sin(this.bounceTime + this.bounceOffset) * this.bobHeight;
        const renderY = this.y + bounce;
        
        // Glow effect
        const glowRadius = this.radius + 5;
        const gradient = ctx.createRadialGradient(
            this.x, renderY, 0,
            this.x, renderY, glowRadius
        );
        gradient.addColorStop(0, this.color);
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, renderY, glowRadius, 0, Math.PI * 2);
        ctx.fill();
        
        // Emoji background (larger)
        ctx.font = `${this.radius * 2.2}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.emoji, this.x, renderY);
        
        // Letter text (prominent and contrasting)
        ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
        ctx.shadowBlur = 3;
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 1;
        
        ctx.fillStyle = '#FFFFFF';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3;
        ctx.font = `bold ${this.radius + 4}px Arial`;
        ctx.strokeText(this.letter, this.x, renderY);
        ctx.fillText(this.letter, this.x, renderY);
        
        // Reset shadow
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        
        // Sparkle effects occasionally
        if (Math.random() < 0.05) {
            this.drawSparkle(ctx, this.x + Math.random() * 30 - 15, renderY + Math.random() * 30 - 15);
        }
    }
    
    drawSparkle(ctx, x, y) {
        ctx.fillStyle = '#FFD700';
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(Math.random() * Math.PI * 2);
        
        // Draw 4-pointed star
        ctx.beginPath();
        ctx.moveTo(0, -3);
        ctx.lineTo(1, -1);
        ctx.lineTo(3, 0);
        ctx.lineTo(1, 1);
        ctx.lineTo(0, 3);
        ctx.lineTo(-1, 1);
        ctx.lineTo(-3, 0);
        ctx.lineTo(-1, -1);
        ctx.closePath();
        ctx.fill();
        
        ctx.restore();
    }
}