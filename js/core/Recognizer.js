// Letter Recognition Engine - placeholder for future implementation

class Recognizer {
    constructor() {
        this.templates = new Map();
        this.loadTemplates();
    }
    
    loadTemplates() {
        // Letter templates will be implemented in Phase 2
        console.log('Letter templates loading...');
    }
    
    scoreTrace(rawPoints, letter, bestMs, maxMs) {
        // More challenging scoring system
        
        const duration = this.calculateDuration(rawPoints);
        const processed = this.processStroke(rawPoints);
        
        // More realistic and challenging scoring
        const baseAccuracy = Math.random() * 35; // Reduced from 60 to 35
        const lengthPenalty = this.calculateLengthPenalty(rawPoints);
        const speedBonus = this.calculateSpeedScore(duration, bestMs, maxMs);
        const smoothnessBonus = this.calculateSmoothnessBonus(rawPoints);
        
        // More stringent calculation
        const accuracy = Math.max(0, baseAccuracy - lengthPenalty);
        const direction = Math.random() * 15; // Reduced from 25 to 15
        
        const totalScore = accuracy + direction + speedBonus + smoothnessBonus;
        
        // Apply difficulty scaling - harder to get high scores
        let finalScore = Math.min(100, totalScore);
        
        // Make it harder to score above 80
        if (finalScore > 80) {
            finalScore = 80 + (finalScore - 80) * 0.3;
        }
        
        // Make it harder to score above 90
        if (finalScore > 90) {
            finalScore = 90 + (finalScore - 90) * 0.1;
        }
        
        return Math.max(10, Math.round(finalScore)); // Minimum score of 10
    }
    
    calculateLengthPenalty(rawPoints) {
        // Penalize traces that are too short or too long
        const length = rawPoints.length;
        if (length < 10) {
            return 15; // Heavy penalty for very short traces
        } else if (length < 20) {
            return 8; // Medium penalty for short traces
        } else if (length > 100) {
            return 10; // Penalty for overly long traces
        }
        return 0; // No penalty for good length
    }
    
    calculateSmoothnessBonus(rawPoints) {
        // Simple smoothness calculation - reward steady drawing
        if (rawPoints.length < 3) return 0;
        
        let totalVariation = 0;
        for (let i = 1; i < rawPoints.length - 1; i++) {
            const prev = rawPoints[i - 1];
            const curr = rawPoints[i];
            const next = rawPoints[i + 1];
            
            const angle1 = Math.atan2(curr.y - prev.y, curr.x - prev.x);
            const angle2 = Math.atan2(next.y - curr.y, next.x - curr.x);
            const angleDiff = Math.abs(angle1 - angle2);
            totalVariation += Math.min(angleDiff, 2 * Math.PI - angleDiff);
        }
        
        const avgVariation = totalVariation / (rawPoints.length - 2);
        const smoothnessScore = Math.max(0, 10 - avgVariation * 3);
        
        return smoothnessScore;
    }
    
    processStroke(rawPoints) {
        // Process stroke: smooth -> simplify -> normalize -> resample
        let processed = Utils.smoothStroke(rawPoints);
        processed = Utils.simplifyStroke(processed);
        processed = Utils.normalizeStroke(processed);
        processed = Utils.resampleStroke(processed, 64);
        
        return processed;
    }
    
    calculateDuration(points) {
        if (points.length < 2) return 0;
        return points[points.length - 1].t - points[0].t;
    }
    
    calculateSpeedScore(duration, bestMs, maxMs) {
        const t = duration;
        return 15 * Utils.clamp((maxMs - t) / (maxMs - bestMs), 0, 1);
    }
}