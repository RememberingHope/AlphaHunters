// Letter Templates with proper stroke order and starting points
// Based on D'Nealian and Zaner-Bloser handwriting methods

class LetterTemplates {
    constructor() {
        this.templates = new Map();
        this.initializeTemplates();
        this.loadCustomTemplates();
    }
    
    initializeTemplates() {
        // Lowercase letters with natural curves
        this.addTemplate('a', {
            strokes: [
                { // Single stroke: Complete 'a' in one continuous motion
                    points: [
                        // Start at top right, draw circle counter-clockwise, then down for tail
                        {x: 0.65, y: 0.25}, {x: 0.55, y: 0.2}, {x: 0.45, y: 0.18}, {x: 0.35, y: 0.2},
                        {x: 0.25, y: 0.25}, {x: 0.18, y: 0.32}, {x: 0.15, y: 0.4}, {x: 0.15, y: 0.48},
                        {x: 0.15, y: 0.56}, {x: 0.18, y: 0.64}, {x: 0.25, y: 0.71}, {x: 0.35, y: 0.76},
                        {x: 0.45, y: 0.78}, {x: 0.55, y: 0.76}, {x: 0.65, y: 0.71}, {x: 0.7, y: 0.64},
                        // Continue with tail without lifting pen
                        {x: 0.75, y: 0.55}, {x: 0.78, y: 0.45}, {x: 0.78, y: 0.35}, {x: 0.78, y: 0.25},
                        {x: 0.78, y: 0.35}, {x: 0.78, y: 0.45}, {x: 0.78, y: 0.55}, {x: 0.78, y: 0.65},
                        {x: 0.78, y: 0.75}, {x: 0.78, y: 0.8}
                    ],
                    startX: 0.65, startY: 0.25,
                    description: "Draw the circle and tail in one smooth motion"
                }
            ],
            width: 0.9,
            height: 0.65,
            baseline: 0.8
        });
        
        this.addTemplate('c', {
            strokes: [
                { // Single stroke: Smooth C curve
                    points: [
                        // Much smoother C curve
                        {x: 0.75, y: 0.25}, {x: 0.65, y: 0.18}, {x: 0.55, y: 0.15}, {x: 0.45, y: 0.15},
                        {x: 0.35, y: 0.18}, {x: 0.26, y: 0.25}, {x: 0.2, y: 0.33}, {x: 0.17, y: 0.42},
                        {x: 0.17, y: 0.5}, {x: 0.17, y: 0.58}, {x: 0.2, y: 0.67}, {x: 0.26, y: 0.75},
                        {x: 0.35, y: 0.82}, {x: 0.45, y: 0.85}, {x: 0.55, y: 0.85}, {x: 0.65, y: 0.82},
                        {x: 0.75, y: 0.75}
                    ],
                    startX: 0.75, startY: 0.25,
                    description: "Start at the top and curve around like a C"
                }
            ],
            width: 0.8,
            height: 0.7,
            baseline: 0.85
        });
        
        this.addTemplate('o', {
            strokes: [
                { // Single stroke: Smooth circle
                    points: [
                        // Perfect circle with many points
                        {x: 0.8, y: 0.5}, {x: 0.78, y: 0.4}, {x: 0.74, y: 0.31}, {x: 0.69, y: 0.23},
                        {x: 0.62, y: 0.17}, {x: 0.54, y: 0.13}, {x: 0.45, y: 0.12}, {x: 0.36, y: 0.13},
                        {x: 0.28, y: 0.17}, {x: 0.21, y: 0.23}, {x: 0.16, y: 0.31}, {x: 0.12, y: 0.4},
                        {x: 0.1, y: 0.5}, {x: 0.12, y: 0.6}, {x: 0.16, y: 0.69}, {x: 0.21, y: 0.77},
                        {x: 0.28, y: 0.83}, {x: 0.36, y: 0.87}, {x: 0.45, y: 0.88}, {x: 0.54, y: 0.87},
                        {x: 0.62, y: 0.83}, {x: 0.69, y: 0.77}, {x: 0.74, y: 0.69}, {x: 0.78, y: 0.6},
                        {x: 0.8, y: 0.5}
                    ],
                    startX: 0.8, startY: 0.5,
                    description: "Start here and go around to make a circle"
                }
            ],
            width: 0.8,
            height: 0.76,
            baseline: 0.88
        });
        
        // Uppercase letters with smoother curves
        this.addTemplate('A', {
            strokes: [
                { // Stroke 1: Left diagonal with slight curve
                    points: [
                        {x: 0.05, y: 0.95}, {x: 0.1, y: 0.85}, {x: 0.15, y: 0.75}, {x: 0.2, y: 0.65},
                        {x: 0.25, y: 0.55}, {x: 0.3, y: 0.45}, {x: 0.35, y: 0.35}, {x: 0.4, y: 0.25},
                        {x: 0.45, y: 0.15}, {x: 0.5, y: 0.05}
                    ],
                    startX: 0.05, startY: 0.95,
                    description: "Start at bottom left, draw up to the top"
                },
                { // Stroke 2: Right diagonal with slight curve  
                    points: [
                        {x: 0.5, y: 0.05}, {x: 0.55, y: 0.15}, {x: 0.6, y: 0.25}, {x: 0.65, y: 0.35},
                        {x: 0.7, y: 0.45}, {x: 0.75, y: 0.55}, {x: 0.8, y: 0.65}, {x: 0.85, y: 0.75},
                        {x: 0.9, y: 0.85}, {x: 0.95, y: 0.95}
                    ],
                    startX: 0.5, startY: 0.05,
                    description: "From the top, draw down to bottom right"
                },
                { // Stroke 3: Cross bar with slight curve
                    points: [
                        {x: 0.25, y: 0.6}, {x: 0.35, y: 0.58}, {x: 0.45, y: 0.57}, {x: 0.55, y: 0.57},
                        {x: 0.65, y: 0.58}, {x: 0.75, y: 0.6}
                    ],
                    startX: 0.25, startY: 0.6,
                    description: "Cross bar from left to right"
                }
            ],
            width: 1.0,
            height: 0.9,
            baseline: 0.95
        });
        
        this.addTemplate('C', {
            strokes: [
                { // Single stroke: Large smooth C curve
                    points: [
                        {x: 0.85, y: 0.15}, {x: 0.75, y: 0.08}, {x: 0.65, y: 0.04}, {x: 0.55, y: 0.02},
                        {x: 0.45, y: 0.02}, {x: 0.35, y: 0.04}, {x: 0.25, y: 0.08}, {x: 0.17, y: 0.15},
                        {x: 0.1, y: 0.24}, {x: 0.05, y: 0.35}, {x: 0.02, y: 0.46}, {x: 0.02, y: 0.54},
                        {x: 0.05, y: 0.65}, {x: 0.1, y: 0.76}, {x: 0.17, y: 0.85}, {x: 0.25, y: 0.92},
                        {x: 0.35, y: 0.96}, {x: 0.45, y: 0.98}, {x: 0.55, y: 0.98}, {x: 0.65, y: 0.96},
                        {x: 0.75, y: 0.92}, {x: 0.85, y: 0.85}
                    ],
                    startX: 0.85, startY: 0.15,
                    description: "Start at top right, curve around like a big C"
                }
            ],
            width: 0.9,
            height: 0.96,
            baseline: 0.98
        });
        
        this.addTemplate('O', {
            strokes: [
                { // Single stroke: Large smooth circle
                    points: [
                        {x: 0.9, y: 0.5}, {x: 0.88, y: 0.38}, {x: 0.84, y: 0.27}, {x: 0.78, y: 0.18},
                        {x: 0.7, y: 0.11}, {x: 0.61, y: 0.06}, {x: 0.51, y: 0.03}, {x: 0.41, y: 0.03},
                        {x: 0.31, y: 0.06}, {x: 0.22, y: 0.11}, {x: 0.14, y: 0.18}, {x: 0.08, y: 0.27},
                        {x: 0.04, y: 0.38}, {x: 0.02, y: 0.5}, {x: 0.04, y: 0.62}, {x: 0.08, y: 0.73},
                        {x: 0.14, y: 0.82}, {x: 0.22, y: 0.89}, {x: 0.31, y: 0.94}, {x: 0.41, y: 0.97},
                        {x: 0.51, y: 0.97}, {x: 0.61, y: 0.94}, {x: 0.7, y: 0.89}, {x: 0.78, y: 0.82},
                        {x: 0.84, y: 0.73}, {x: 0.88, y: 0.62}, {x: 0.9, y: 0.5}
                    ],
                    startX: 0.9, startY: 0.5,
                    description: "Start here and go around to make a big circle"
                }
            ],
            width: 0.92,
            height: 0.94,
            baseline: 0.97
        });
        
        // Add more letters for progression
        this.addTemplate('e', {
            strokes: [
                { // Smooth e: horizontal line through middle, then smooth curve around
                    points: [
                        // Start with horizontal line across the middle 
                        {x: 0.15, y: 0.45}, {x: 0.25, y: 0.45}, {x: 0.35, y: 0.45}, {x: 0.45, y: 0.45}, {x: 0.55, y: 0.45},
                        // Smooth curve up and around the top (no sharp divot)
                        {x: 0.62, y: 0.43}, {x: 0.68, y: 0.38}, {x: 0.72, y: 0.32}, {x: 0.74, y: 0.25}, {x: 0.72, y: 0.18}, 
                        {x: 0.68, y: 0.12}, {x: 0.62, y: 0.08}, {x: 0.55, y: 0.06}, {x: 0.45, y: 0.06}, {x: 0.35, y: 0.08},
                        {x: 0.28, y: 0.12}, {x: 0.22, y: 0.18}, {x: 0.18, y: 0.25}, {x: 0.16, y: 0.32}, {x: 0.16, y: 0.38}, {x: 0.18, y: 0.45},
                        // Continue smoothly down and around the bottom
                        {x: 0.16, y: 0.52}, {x: 0.16, y: 0.58}, {x: 0.18, y: 0.65}, {x: 0.22, y: 0.72}, {x: 0.28, y: 0.78},
                        {x: 0.35, y: 0.82}, {x: 0.45, y: 0.84}, {x: 0.55, y: 0.82}, {x: 0.62, y: 0.78}, {x: 0.68, y: 0.72}, {x: 0.72, y: 0.65}
                    ],
                    startX: 0.15, startY: 0.45,
                    description: "Draw a line across the middle, then smoothly curve around"
                }
            ],
            width: 0.75,
            height: 0.78,
            baseline: 0.84
        });
        
        this.addTemplate('i', {
            strokes: [
                { // Stroke 1: vertical line (shaft first)
                    points: [
                        {x: 0.5, y: 0.35}, {x: 0.5, y: 0.45}, {x: 0.5, y: 0.55}, {x: 0.5, y: 0.65}, {x: 0.5, y: 0.75}, {x: 0.5, y: 0.85}
                    ],
                    startX: 0.5, startY: 0.35,
                    description: "Draw a straight line down"
                },
                { // Stroke 2: dot (after shaft)
                    points: [
                        {x: 0.5, y: 0.15}, {x: 0.52, y: 0.17}, {x: 0.5, y: 0.19}, {x: 0.48, y: 0.17}, {x: 0.5, y: 0.15}
                    ],
                    startX: 0.5, startY: 0.15,
                    description: "Make a dot at the top"
                }
            ],
            width: 0.2,
            height: 0.7,
            baseline: 0.85
        });
        
        this.addTemplate('l', {
            strokes: [
                { // Single stroke: straight line
                    points: [
                        {x: 0.5, y: 0.05}, {x: 0.5, y: 0.15}, {x: 0.5, y: 0.25}, {x: 0.5, y: 0.35},
                        {x: 0.5, y: 0.45}, {x: 0.5, y: 0.55}, {x: 0.5, y: 0.65}, {x: 0.5, y: 0.75},
                        {x: 0.5, y: 0.85}, {x: 0.5, y: 0.95}
                    ],
                    startX: 0.5, startY: 0.05,
                    description: "Draw a straight line from top to bottom"
                }
            ],
            width: 0.2,
            height: 0.9,
            baseline: 0.95
        });
        
        this.addTemplate('n', {
            strokes: [
                { // Single stroke: n shape
                    points: [
                        // Start at bottom left, go up, curve over, down
                        {x: 0.2, y: 0.85}, {x: 0.2, y: 0.75}, {x: 0.2, y: 0.65}, {x: 0.2, y: 0.55},
                        {x: 0.2, y: 0.45}, {x: 0.2, y: 0.35}, {x: 0.22, y: 0.28}, {x: 0.26, y: 0.22},
                        {x: 0.32, y: 0.18}, {x: 0.4, y: 0.16}, {x: 0.48, y: 0.16}, {x: 0.56, y: 0.18},
                        {x: 0.62, y: 0.22}, {x: 0.66, y: 0.28}, {x: 0.68, y: 0.35}, {x: 0.68, y: 0.45},
                        {x: 0.68, y: 0.55}, {x: 0.68, y: 0.65}, {x: 0.68, y: 0.75}, {x: 0.68, y: 0.85}
                    ],
                    startX: 0.2, startY: 0.85,
                    description: "Start at bottom left and curve over"
                }
            ],
            width: 0.6,
            height: 0.7,
            baseline: 0.85
        });
        
        this.addTemplate('s', {
            strokes: [
                { // Single stroke: S curve
                    points: [
                        {x: 0.75, y: 0.25}, {x: 0.65, y: 0.18}, {x: 0.55, y: 0.15}, {x: 0.45, y: 0.15},
                        {x: 0.35, y: 0.18}, {x: 0.28, y: 0.25}, {x: 0.25, y: 0.32}, {x: 0.28, y: 0.4},
                        {x: 0.35, y: 0.45}, {x: 0.45, y: 0.48}, {x: 0.55, y: 0.52}, {x: 0.62, y: 0.57},
                        {x: 0.67, y: 0.63}, {x: 0.7, y: 0.7}, {x: 0.67, y: 0.77}, {x: 0.62, y: 0.82},
                        {x: 0.55, y: 0.85}, {x: 0.45, y: 0.85}, {x: 0.35, y: 0.82}, {x: 0.25, y: 0.75}
                    ],
                    startX: 0.75, startY: 0.25,
                    description: "Start at top right and curve like an S"
                }
            ],
            width: 0.6,
            height: 0.7,
            baseline: 0.85
        });
        
        this.addTemplate('t', {
            strokes: [
                { // Stroke 1: vertical line
                    points: [
                        {x: 0.5, y: 0.15}, {x: 0.5, y: 0.25}, {x: 0.5, y: 0.35}, {x: 0.5, y: 0.45},
                        {x: 0.5, y: 0.55}, {x: 0.5, y: 0.65}, {x: 0.5, y: 0.75}, {x: 0.52, y: 0.82},
                        {x: 0.56, y: 0.86}, {x: 0.62, y: 0.88}, {x: 0.7, y: 0.88}
                    ],
                    startX: 0.5, startY: 0.15,
                    description: "Draw down with a curve at the bottom"
                },
                { // Stroke 2: cross line
                    points: [
                        {x: 0.3, y: 0.35}, {x: 0.4, y: 0.35}, {x: 0.5, y: 0.35}, {x: 0.6, y: 0.35}, {x: 0.7, y: 0.35}
                    ],
                    startX: 0.3, startY: 0.35,
                    description: "Cross the t with a horizontal line"
                }
            ],
            width: 0.5,
            height: 0.75,
            baseline: 0.88
        });
        
        this.addTemplate('r', {
            strokes: [
                { // Single stroke: r shape
                    points: [
                        // Start at bottom, go up, then curve over
                        {x: 0.2, y: 0.85}, {x: 0.2, y: 0.75}, {x: 0.2, y: 0.65}, {x: 0.2, y: 0.55},
                        {x: 0.2, y: 0.45}, {x: 0.2, y: 0.35}, {x: 0.22, y: 0.28}, {x: 0.26, y: 0.22},
                        {x: 0.32, y: 0.18}, {x: 0.4, y: 0.16}, {x: 0.48, y: 0.16}, {x: 0.56, y: 0.18},
                        {x: 0.62, y: 0.22}, {x: 0.66, y: 0.28}
                    ],
                    startX: 0.2, startY: 0.85,
                    description: "Start at bottom and curve up and over"
                }
            ],
            width: 0.5,
            height: 0.7,
            baseline: 0.85
        });
        
        this.addTemplate('d', {
            strokes: [
                { // Single stroke: circle then tall line
                    points: [
                        // Start with circle part
                        {x: 0.15, y: 0.35}, {x: 0.15, y: 0.45}, {x: 0.18, y: 0.55}, {x: 0.25, y: 0.65},
                        {x: 0.35, y: 0.72}, {x: 0.45, y: 0.75}, {x: 0.55, y: 0.72}, {x: 0.65, y: 0.65},
                        {x: 0.72, y: 0.55}, {x: 0.75, y: 0.45}, {x: 0.75, y: 0.35}, {x: 0.72, y: 0.25},
                        {x: 0.65, y: 0.18}, {x: 0.55, y: 0.15}, {x: 0.45, y: 0.18}, {x: 0.35, y: 0.25},
                        {x: 0.25, y: 0.35}, {x: 0.18, y: 0.45}, {x: 0.15, y: 0.55}, {x: 0.18, y: 0.65},
                        {x: 0.25, y: 0.72}, {x: 0.35, y: 0.75}, {x: 0.45, y: 0.75}, {x: 0.55, y: 0.72},
                        {x: 0.65, y: 0.65}, {x: 0.72, y: 0.55}, {x: 0.75, y: 0.45}, {x: 0.75, y: 0.35},
                        {x: 0.75, y: 0.25}, {x: 0.75, y: 0.15}, {x: 0.75, y: 0.05}
                    ],
                    startX: 0.15, startY: 0.35,
                    description: "Draw around like 'o', then up to the top"
                }
            ],
            width: 0.8,
            height: 0.7,
            baseline: 0.75
        });
        
        this.addTemplate('f', {
            strokes: [
                { // Stroke 1: curved descender and ascender
                    points: [
                        {x: 0.45, y: 0.9}, {x: 0.42, y: 0.8}, {x: 0.4, y: 0.7}, {x: 0.4, y: 0.6},
                        {x: 0.4, y: 0.5}, {x: 0.4, y: 0.4}, {x: 0.4, y: 0.3}, {x: 0.4, y: 0.2},
                        {x: 0.4, y: 0.1}, {x: 0.45, y: 0.05}, {x: 0.55, y: 0.02}, {x: 0.65, y: 0.05}
                    ],
                    startX: 0.45, startY: 0.9,
                    description: "Draw up and curve at top"
                },
                { // Stroke 2: cross bar
                    points: [
                        {x: 0.2, y: 0.4}, {x: 0.3, y: 0.4}, {x: 0.4, y: 0.4}, {x: 0.5, y: 0.4}, {x: 0.6, y: 0.4}
                    ],
                    startX: 0.2, startY: 0.4,
                    description: "Cross the f with a line"
                }
            ],
            width: 0.5,
            height: 0.88,
            baseline: 0.75
        });
        
        this.addTemplate('g', {
            strokes: [
                { // Single stroke: like 'o' but continues down with tail
                    points: [
                        // Circle part like 'o'
                        {x: 0.75, y: 0.35}, {x: 0.72, y: 0.25}, {x: 0.65, y: 0.18}, {x: 0.55, y: 0.15},
                        {x: 0.45, y: 0.15}, {x: 0.35, y: 0.18}, {x: 0.25, y: 0.25}, {x: 0.18, y: 0.35},
                        {x: 0.15, y: 0.45}, {x: 0.18, y: 0.55}, {x: 0.25, y: 0.65}, {x: 0.35, y: 0.72},
                        {x: 0.45, y: 0.75}, {x: 0.55, y: 0.72}, {x: 0.65, y: 0.65}, {x: 0.72, y: 0.55},
                        {x: 0.75, y: 0.45}, {x: 0.75, y: 0.35},
                        // Continue down for descender
                        {x: 0.75, y: 0.45}, {x: 0.75, y: 0.55}, {x: 0.75, y: 0.65}, {x: 0.75, y: 0.75},
                        {x: 0.75, y: 0.85}, {x: 0.72, y: 0.92}, {x: 0.65, y: 0.95}, {x: 0.55, y: 0.95},
                        {x: 0.45, y: 0.92}, {x: 0.35, y: 0.88}
                    ],
                    startX: 0.75, startY: 0.35,
                    description: "Draw like 'o', then continue down with a tail"
                }
            ],
            width: 0.8,
            height: 0.8,
            baseline: 0.75
        });
        
        this.addTemplate('h', {
            strokes: [
                { // Single stroke: up, down, curve over, down
                    points: [
                        // Start at bottom, go up
                        {x: 0.2, y: 0.85}, {x: 0.2, y: 0.75}, {x: 0.2, y: 0.65}, {x: 0.2, y: 0.55},
                        {x: 0.2, y: 0.45}, {x: 0.2, y: 0.35}, {x: 0.2, y: 0.25}, {x: 0.2, y: 0.15}, {x: 0.2, y: 0.05},
                        // Come back down to middle
                        {x: 0.2, y: 0.15}, {x: 0.2, y: 0.25}, {x: 0.2, y: 0.35}, {x: 0.2, y: 0.45},
                        // Curve over like 'n'
                        {x: 0.22, y: 0.38}, {x: 0.26, y: 0.32}, {x: 0.32, y: 0.28}, {x: 0.4, y: 0.26},
                        {x: 0.48, y: 0.26}, {x: 0.56, y: 0.28}, {x: 0.62, y: 0.32}, {x: 0.66, y: 0.38},
                        {x: 0.68, y: 0.45}, {x: 0.68, y: 0.55}, {x: 0.68, y: 0.65}, {x: 0.68, y: 0.75}, {x: 0.68, y: 0.85}
                    ],
                    startX: 0.2, startY: 0.85,
                    description: "Start at bottom, go up tall, then curve over and down"
                }
            ],
            width: 0.6,
            height: 0.8,
            baseline: 0.85
        });
        
        this.addTemplate('b', {
            strokes: [
                { // Single stroke: up, then bumps
                    points: [
                        // Vertical line up
                        {x: 0.2, y: 0.85}, {x: 0.2, y: 0.75}, {x: 0.2, y: 0.65}, {x: 0.2, y: 0.55},
                        {x: 0.2, y: 0.45}, {x: 0.2, y: 0.35}, {x: 0.2, y: 0.25}, {x: 0.2, y: 0.15}, {x: 0.2, y: 0.05},
                        // Come back down and make bump
                        {x: 0.2, y: 0.15}, {x: 0.2, y: 0.25}, {x: 0.2, y: 0.35}, {x: 0.2, y: 0.45},
                        // Upper bump
                        {x: 0.25, y: 0.42}, {x: 0.32, y: 0.4}, {x: 0.4, y: 0.4}, {x: 0.48, y: 0.42},
                        {x: 0.52, y: 0.47}, {x: 0.52, y: 0.53}, {x: 0.48, y: 0.58}, {x: 0.4, y: 0.6},
                        {x: 0.32, y: 0.6}, {x: 0.25, y: 0.58}, {x: 0.2, y: 0.55},
                        // Lower bump
                        {x: 0.25, y: 0.58}, {x: 0.32, y: 0.6}, {x: 0.42, y: 0.6}, {x: 0.52, y: 0.62},
                        {x: 0.58, y: 0.67}, {x: 0.6, y: 0.75}, {x: 0.58, y: 0.83}, {x: 0.52, y: 0.88},
                        {x: 0.42, y: 0.9}, {x: 0.32, y: 0.88}, {x: 0.25, y: 0.83}, {x: 0.2, y: 0.75}
                    ],
                    startX: 0.2, startY: 0.85,
                    description: "Go up tall, then make two bumps"
                }
            ],
            width: 0.6,
            height: 0.8,
            baseline: 0.85
        });
        
        this.addTemplate('p', {
            strokes: [
                { // Single stroke: down below line, up, make bump
                    points: [
                        // Start at baseline, go down (descender)
                        {x: 0.2, y: 0.75}, {x: 0.2, y: 0.85}, {x: 0.2, y: 0.95},
                        // Come back up and continue to top
                        {x: 0.2, y: 0.85}, {x: 0.2, y: 0.75}, {x: 0.2, y: 0.65}, {x: 0.2, y: 0.55},
                        {x: 0.2, y: 0.45}, {x: 0.2, y: 0.35}, {x: 0.2, y: 0.25}, {x: 0.2, y: 0.15},
                        // Make the bump
                        {x: 0.25, y: 0.12}, {x: 0.32, y: 0.1}, {x: 0.42, y: 0.1}, {x: 0.52, y: 0.12},
                        {x: 0.58, y: 0.17}, {x: 0.6, y: 0.25}, {x: 0.6, y: 0.35}, {x: 0.58, y: 0.43},
                        {x: 0.52, y: 0.48}, {x: 0.42, y: 0.5}, {x: 0.32, y: 0.48}, {x: 0.25, y: 0.43}, {x: 0.2, y: 0.35}
                    ],
                    startX: 0.2, startY: 0.75,
                    description: "Go down below the line, up, then make a bump"
                }
            ],
            width: 0.6,
            height: 0.85,
            baseline: 0.75
        });
        
        // Add uppercase versions
        this.addTemplate('E', {
            strokes: [
                { // Stroke 1: vertical line
                    points: [
                        {x: 0.2, y: 0.05}, {x: 0.2, y: 0.15}, {x: 0.2, y: 0.25}, {x: 0.2, y: 0.35},
                        {x: 0.2, y: 0.45}, {x: 0.2, y: 0.55}, {x: 0.2, y: 0.65}, {x: 0.2, y: 0.75},
                        {x: 0.2, y: 0.85}, {x: 0.2, y: 0.95}
                    ],
                    startX: 0.2, startY: 0.05,
                    description: "Draw a vertical line"
                },
                { // Stroke 2: top horizontal line
                    points: [
                        {x: 0.2, y: 0.05}, {x: 0.3, y: 0.05}, {x: 0.4, y: 0.05}, {x: 0.5, y: 0.05},
                        {x: 0.6, y: 0.05}, {x: 0.7, y: 0.05}, {x: 0.8, y: 0.05}
                    ],
                    startX: 0.2, startY: 0.05,
                    description: "Draw the top line"
                },
                { // Stroke 3: middle horizontal line
                    points: [
                        {x: 0.2, y: 0.5}, {x: 0.3, y: 0.5}, {x: 0.4, y: 0.5}, {x: 0.5, y: 0.5}, {x: 0.6, y: 0.5}
                    ],
                    startX: 0.2, startY: 0.5,
                    description: "Draw the middle line"
                },
                { // Stroke 4: bottom horizontal line
                    points: [
                        {x: 0.2, y: 0.95}, {x: 0.3, y: 0.95}, {x: 0.4, y: 0.95}, {x: 0.5, y: 0.95},
                        {x: 0.6, y: 0.95}, {x: 0.7, y: 0.95}, {x: 0.8, y: 0.95}
                    ],
                    startX: 0.2, startY: 0.95,
                    description: "Draw the bottom line"
                }
            ],
            width: 0.7,
            height: 0.9,
            baseline: 0.95
        });
        
        this.addTemplate('I', {
            strokes: [
                { // Stroke 1: top horizontal line
                    points: [
                        {x: 0.2, y: 0.05}, {x: 0.3, y: 0.05}, {x: 0.4, y: 0.05}, {x: 0.5, y: 0.05},
                        {x: 0.6, y: 0.05}, {x: 0.7, y: 0.05}, {x: 0.8, y: 0.05}
                    ],
                    startX: 0.2, startY: 0.05,
                    description: "Draw the top line"
                },
                { // Stroke 2: vertical line
                    points: [
                        {x: 0.5, y: 0.05}, {x: 0.5, y: 0.15}, {x: 0.5, y: 0.25}, {x: 0.5, y: 0.35},
                        {x: 0.5, y: 0.45}, {x: 0.5, y: 0.55}, {x: 0.5, y: 0.65}, {x: 0.5, y: 0.75},
                        {x: 0.5, y: 0.85}, {x: 0.5, y: 0.95}
                    ],
                    startX: 0.5, startY: 0.05,
                    description: "Draw down the middle"
                },
                { // Stroke 3: bottom horizontal line
                    points: [
                        {x: 0.2, y: 0.95}, {x: 0.3, y: 0.95}, {x: 0.4, y: 0.95}, {x: 0.5, y: 0.95},
                        {x: 0.6, y: 0.95}, {x: 0.7, y: 0.95}, {x: 0.8, y: 0.95}
                    ],
                    startX: 0.2, startY: 0.95,
                    description: "Draw the bottom line"
                }
            ],
            width: 0.7,
            height: 0.9,
            baseline: 0.95
        });
        
        this.addTemplate('L', {
            strokes: [
                { // Stroke 1: vertical line
                    points: [
                        {x: 0.2, y: 0.05}, {x: 0.2, y: 0.15}, {x: 0.2, y: 0.25}, {x: 0.2, y: 0.35},
                        {x: 0.2, y: 0.45}, {x: 0.2, y: 0.55}, {x: 0.2, y: 0.65}, {x: 0.2, y: 0.75},
                        {x: 0.2, y: 0.85}, {x: 0.2, y: 0.95}
                    ],
                    startX: 0.2, startY: 0.05,
                    description: "Draw a vertical line down"
                },
                { // Stroke 2: horizontal line
                    points: [
                        {x: 0.2, y: 0.95}, {x: 0.3, y: 0.95}, {x: 0.4, y: 0.95}, {x: 0.5, y: 0.95},
                        {x: 0.6, y: 0.95}, {x: 0.7, y: 0.95}, {x: 0.8, y: 0.95}
                    ],
                    startX: 0.2, startY: 0.95,
                    description: "Draw the bottom line"
                }
            ],
            width: 0.7,
            height: 0.9,
            baseline: 0.95
        });
        
        this.addTemplate('T', {
            strokes: [
                { // Stroke 1: top horizontal line
                    points: [
                        {x: 0.1, y: 0.05}, {x: 0.2, y: 0.05}, {x: 0.3, y: 0.05}, {x: 0.4, y: 0.05},
                        {x: 0.5, y: 0.05}, {x: 0.6, y: 0.05}, {x: 0.7, y: 0.05}, {x: 0.8, y: 0.05}, {x: 0.9, y: 0.05}
                    ],
                    startX: 0.1, startY: 0.05,
                    description: "Draw the top line"
                },
                { // Stroke 2: vertical line
                    points: [
                        {x: 0.5, y: 0.05}, {x: 0.5, y: 0.15}, {x: 0.5, y: 0.25}, {x: 0.5, y: 0.35},
                        {x: 0.5, y: 0.45}, {x: 0.5, y: 0.55}, {x: 0.5, y: 0.65}, {x: 0.5, y: 0.75},
                        {x: 0.5, y: 0.85}, {x: 0.5, y: 0.95}
                    ],
                    startX: 0.5, startY: 0.05,
                    description: "Draw down the middle"
                }
            ],
            width: 0.9,
            height: 0.9,
            baseline: 0.95
        });
        
        this.addTemplate('N', {
            strokes: [
                { // Stroke 1: left vertical line
                    points: [
                        {x: 0.15, y: 0.95}, {x: 0.15, y: 0.85}, {x: 0.15, y: 0.75}, {x: 0.15, y: 0.65},
                        {x: 0.15, y: 0.55}, {x: 0.15, y: 0.45}, {x: 0.15, y: 0.35}, {x: 0.15, y: 0.25},
                        {x: 0.15, y: 0.15}, {x: 0.15, y: 0.05}
                    ],
                    startX: 0.15, startY: 0.95,
                    description: "Draw up the left side"
                },
                { // Stroke 2: diagonal line
                    points: [
                        {x: 0.15, y: 0.05}, {x: 0.25, y: 0.15}, {x: 0.35, y: 0.25}, {x: 0.45, y: 0.35},
                        {x: 0.55, y: 0.45}, {x: 0.65, y: 0.55}, {x: 0.75, y: 0.65}, {x: 0.85, y: 0.75}, {x: 0.85, y: 0.85}, {x: 0.85, y: 0.95}
                    ],
                    startX: 0.15, startY: 0.05,
                    description: "Draw diagonal to bottom right"
                },
                { // Stroke 3: right vertical line
                    points: [
                        {x: 0.85, y: 0.95}, {x: 0.85, y: 0.85}, {x: 0.85, y: 0.75}, {x: 0.85, y: 0.65},
                        {x: 0.85, y: 0.55}, {x: 0.85, y: 0.45}, {x: 0.85, y: 0.35}, {x: 0.85, y: 0.25},
                        {x: 0.85, y: 0.15}, {x: 0.85, y: 0.05}
                    ],
                    startX: 0.85, startY: 0.95,
                    description: "Draw up the right side"
                }
            ],
            width: 0.8,
            height: 0.9,
            baseline: 0.95
        });
        
        // Missing lowercase letters
        this.addTemplate('j', {
            strokes: [
                { // Stroke 1: vertical line with curve (descender)
                    points: [
                        {x: 0.6, y: 0.35}, {x: 0.6, y: 0.45}, {x: 0.6, y: 0.55}, {x: 0.6, y: 0.65},
                        {x: 0.6, y: 0.75}, {x: 0.6, y: 0.85}, {x: 0.58, y: 0.92}, {x: 0.54, y: 0.95},
                        {x: 0.48, y: 0.96}, {x: 0.42, y: 0.95}, {x: 0.38, y: 0.92}, {x: 0.36, y: 0.87}, {x: 0.38, y: 0.82}
                    ],
                    startX: 0.6, startY: 0.35,
                    description: "Draw down and curve at bottom"
                },
                { // Stroke 2: dot
                    points: [
                        {x: 0.6, y: 0.15}, {x: 0.62, y: 0.17}, {x: 0.6, y: 0.19}, {x: 0.58, y: 0.17}, {x: 0.6, y: 0.15}
                    ],
                    startX: 0.6, startY: 0.15,
                    description: "Make a dot at the top"
                }
            ],
            width: 0.4,
            height: 0.85,
            baseline: 0.75
        });
        
        this.addTemplate('k', {
            strokes: [
                { // Stroke 1: vertical line
                    points: [
                        {x: 0.2, y: 0.05}, {x: 0.2, y: 0.15}, {x: 0.2, y: 0.25}, {x: 0.2, y: 0.35},
                        {x: 0.2, y: 0.45}, {x: 0.2, y: 0.55}, {x: 0.2, y: 0.65}, {x: 0.2, y: 0.75}, {x: 0.2, y: 0.85}
                    ],
                    startX: 0.2, startY: 0.05,
                    description: "Draw a tall vertical line"
                },
                { // Stroke 2: upper diagonal
                    points: [
                        {x: 0.6, y: 0.25}, {x: 0.55, y: 0.3}, {x: 0.5, y: 0.35}, {x: 0.45, y: 0.4},
                        {x: 0.4, y: 0.45}, {x: 0.35, y: 0.5}, {x: 0.3, y: 0.52}, {x: 0.25, y: 0.52}, {x: 0.2, y: 0.5}
                    ],
                    startX: 0.6, startY: 0.25,
                    description: "Draw diagonal down to middle"
                },
                { // Stroke 3: lower diagonal
                    points: [
                        {x: 0.3, y: 0.5}, {x: 0.35, y: 0.55}, {x: 0.4, y: 0.6}, {x: 0.45, y: 0.65},
                        {x: 0.5, y: 0.7}, {x: 0.55, y: 0.75}, {x: 0.6, y: 0.8}, {x: 0.65, y: 0.85}
                    ],
                    startX: 0.3, startY: 0.5,
                    description: "Draw diagonal down to bottom right"
                }
            ],
            width: 0.6,
            height: 0.8,
            baseline: 0.85
        });
        
        this.addTemplate('m', {
            strokes: [
                { // Single stroke: up, curve over, down, curve over, down
                    points: [
                        // First leg
                        {x: 0.15, y: 0.85}, {x: 0.15, y: 0.75}, {x: 0.15, y: 0.65}, {x: 0.15, y: 0.55},
                        {x: 0.15, y: 0.45}, {x: 0.15, y: 0.35}, {x: 0.17, y: 0.28}, {x: 0.21, y: 0.22},
                        {x: 0.27, y: 0.18}, {x: 0.35, y: 0.16},
                        // First hump
                        {x: 0.43, y: 0.16}, {x: 0.49, y: 0.18}, {x: 0.53, y: 0.22}, {x: 0.55, y: 0.28},
                        {x: 0.55, y: 0.35}, {x: 0.55, y: 0.45}, {x: 0.55, y: 0.55}, {x: 0.55, y: 0.65},
                        {x: 0.55, y: 0.75}, {x: 0.55, y: 0.85},
                        // Back up for second hump
                        {x: 0.55, y: 0.75}, {x: 0.55, y: 0.65}, {x: 0.55, y: 0.55}, {x: 0.55, y: 0.45},
                        {x: 0.55, y: 0.35}, {x: 0.57, y: 0.28}, {x: 0.61, y: 0.22}, {x: 0.67, y: 0.18},
                        {x: 0.75, y: 0.16}, {x: 0.83, y: 0.18}, {x: 0.89, y: 0.22}, {x: 0.93, y: 0.28},
                        {x: 0.95, y: 0.35}, {x: 0.95, y: 0.45}, {x: 0.95, y: 0.55}, {x: 0.95, y: 0.65},
                        {x: 0.95, y: 0.75}, {x: 0.95, y: 0.85}
                    ],
                    startX: 0.15, startY: 0.85,
                    description: "Draw up and make two humps"
                }
            ],
            width: 0.9,
            height: 0.7,
            baseline: 0.85
        });
        
        this.addTemplate('q', {
            strokes: [
                { // Single stroke: circle then down with tail
                    points: [
                        // Circle part like 'o' 
                        {x: 0.75, y: 0.35}, {x: 0.72, y: 0.25}, {x: 0.65, y: 0.18}, {x: 0.55, y: 0.15},
                        {x: 0.45, y: 0.15}, {x: 0.35, y: 0.18}, {x: 0.25, y: 0.25}, {x: 0.18, y: 0.35},
                        {x: 0.15, y: 0.45}, {x: 0.18, y: 0.55}, {x: 0.25, y: 0.65}, {x: 0.35, y: 0.72},
                        {x: 0.45, y: 0.75}, {x: 0.55, y: 0.72}, {x: 0.65, y: 0.65}, {x: 0.72, y: 0.55},
                        {x: 0.75, y: 0.45}, {x: 0.75, y: 0.35},
                        // Continue with descender tail
                        {x: 0.75, y: 0.45}, {x: 0.75, y: 0.55}, {x: 0.75, y: 0.65}, {x: 0.75, y: 0.75},
                        {x: 0.75, y: 0.85}, {x: 0.75, y: 0.95}
                    ],
                    startX: 0.75, startY: 0.35,
                    description: "Draw like 'o', then continue down"
                }
            ],
            width: 0.8,
            height: 0.8,
            baseline: 0.75
        });
        
        this.addTemplate('u', {
            strokes: [
                { // Single stroke: down, curve, up
                    points: [
                        {x: 0.2, y: 0.25}, {x: 0.2, y: 0.35}, {x: 0.2, y: 0.45}, {x: 0.2, y: 0.55},
                        {x: 0.2, y: 0.65}, {x: 0.22, y: 0.72}, {x: 0.26, y: 0.78}, {x: 0.32, y: 0.82},
                        {x: 0.4, y: 0.84}, {x: 0.48, y: 0.84}, {x: 0.56, y: 0.82}, {x: 0.62, y: 0.78},
                        {x: 0.66, y: 0.72}, {x: 0.68, y: 0.65}, {x: 0.68, y: 0.55}, {x: 0.68, y: 0.45},
                        {x: 0.68, y: 0.35}, {x: 0.68, y: 0.25}
                    ],
                    startX: 0.2, startY: 0.25,
                    description: "Start at top left, curve around bottom, up right"
                }
            ],
            width: 0.6,
            height: 0.6,
            baseline: 0.84
        });
        
        this.addTemplate('v', {
            strokes: [
                { // Single stroke: diagonal down, diagonal up
                    points: [
                        {x: 0.1, y: 0.25}, {x: 0.15, y: 0.35}, {x: 0.2, y: 0.45}, {x: 0.25, y: 0.55},
                        {x: 0.3, y: 0.65}, {x: 0.35, y: 0.75}, {x: 0.4, y: 0.8}, {x: 0.45, y: 0.83},
                        {x: 0.5, y: 0.85}, {x: 0.55, y: 0.83}, {x: 0.6, y: 0.8}, {x: 0.65, y: 0.75},
                        {x: 0.7, y: 0.65}, {x: 0.75, y: 0.55}, {x: 0.8, y: 0.45}, {x: 0.85, y: 0.35}, {x: 0.9, y: 0.25}
                    ],
                    startX: 0.1, startY: 0.25,
                    description: "Draw down to center, then up"
                }
            ],
            width: 0.9,
            height: 0.6,
            baseline: 0.85
        });
        
        this.addTemplate('w', {
            strokes: [
                { // Single stroke: down, up, down, up
                    points: [
                        {x: 0.1, y: 0.25}, {x: 0.12, y: 0.35}, {x: 0.14, y: 0.45}, {x: 0.16, y: 0.55},
                        {x: 0.18, y: 0.65}, {x: 0.2, y: 0.75}, {x: 0.22, y: 0.8}, {x: 0.25, y: 0.83},
                        // First valley
                        {x: 0.3, y: 0.85}, {x: 0.35, y: 0.83}, {x: 0.38, y: 0.8}, {x: 0.4, y: 0.75},
                        {x: 0.42, y: 0.65}, {x: 0.44, y: 0.55}, {x: 0.46, y: 0.45}, {x: 0.48, y: 0.35},
                        {x: 0.5, y: 0.25},
                        // Back down to second valley
                        {x: 0.52, y: 0.35}, {x: 0.54, y: 0.45}, {x: 0.56, y: 0.55}, {x: 0.58, y: 0.65},
                        {x: 0.6, y: 0.75}, {x: 0.62, y: 0.8}, {x: 0.65, y: 0.83}, {x: 0.7, y: 0.85},
                        {x: 0.75, y: 0.83}, {x: 0.78, y: 0.8}, {x: 0.8, y: 0.75}, {x: 0.82, y: 0.65},
                        {x: 0.84, y: 0.55}, {x: 0.86, y: 0.45}, {x: 0.88, y: 0.35}, {x: 0.9, y: 0.25}
                    ],
                    startX: 0.1, startY: 0.25,
                    description: "Draw like a double V"
                }
            ],
            width: 0.9,
            height: 0.6,
            baseline: 0.85
        });
        
        this.addTemplate('x', {
            strokes: [
                { // Stroke 1: diagonal from top-left to bottom-right
                    points: [
                        {x: 0.15, y: 0.25}, {x: 0.2, y: 0.3}, {x: 0.25, y: 0.35}, {x: 0.3, y: 0.4},
                        {x: 0.35, y: 0.45}, {x: 0.4, y: 0.5}, {x: 0.45, y: 0.55}, {x: 0.5, y: 0.6},
                        {x: 0.55, y: 0.65}, {x: 0.6, y: 0.7}, {x: 0.65, y: 0.75}, {x: 0.7, y: 0.8}, {x: 0.75, y: 0.85}
                    ],
                    startX: 0.15, startY: 0.25,
                    description: "Draw diagonal from top-left down"
                },
                { // Stroke 2: diagonal from top-right to bottom-left
                    points: [
                        {x: 0.75, y: 0.25}, {x: 0.7, y: 0.3}, {x: 0.65, y: 0.35}, {x: 0.6, y: 0.4},
                        {x: 0.55, y: 0.45}, {x: 0.5, y: 0.5}, {x: 0.45, y: 0.55}, {x: 0.4, y: 0.6},
                        {x: 0.35, y: 0.65}, {x: 0.3, y: 0.7}, {x: 0.25, y: 0.75}, {x: 0.2, y: 0.8}, {x: 0.15, y: 0.85}
                    ],
                    startX: 0.75, startY: 0.25,
                    description: "Draw diagonal from top-right down"
                }
            ],
            width: 0.7,
            height: 0.6,
            baseline: 0.85
        });
        
        this.addTemplate('y', {
            strokes: [
                { // Single stroke: down left, curve, up right, down with descender
                    points: [
                        {x: 0.15, y: 0.25}, {x: 0.2, y: 0.35}, {x: 0.25, y: 0.45}, {x: 0.3, y: 0.55},
                        {x: 0.35, y: 0.65}, {x: 0.4, y: 0.72}, {x: 0.45, y: 0.75}, {x: 0.55, y: 0.75},
                        {x: 0.6, y: 0.72}, {x: 0.65, y: 0.65}, {x: 0.7, y: 0.55}, {x: 0.75, y: 0.45},
                        {x: 0.8, y: 0.35}, {x: 0.85, y: 0.25},
                        // Continue down from right side
                        {x: 0.8, y: 0.35}, {x: 0.75, y: 0.45}, {x: 0.7, y: 0.55}, {x: 0.65, y: 0.65},
                        {x: 0.6, y: 0.75}, {x: 0.55, y: 0.85}, {x: 0.5, y: 0.92}, {x: 0.44, y: 0.95},
                        {x: 0.38, y: 0.96}, {x: 0.32, y: 0.95}, {x: 0.28, y: 0.92}
                    ],
                    startX: 0.15, startY: 0.25,
                    description: "Draw down, meet in middle, continue down with tail"
                }
            ],
            width: 0.8,
            height: 0.7,
            baseline: 0.75
        });
        
        this.addTemplate('z', {
            strokes: [
                { // Single stroke: horizontal, diagonal, horizontal
                    points: [
                        // Top horizontal
                        {x: 0.15, y: 0.25}, {x: 0.25, y: 0.25}, {x: 0.35, y: 0.25}, {x: 0.45, y: 0.25},
                        {x: 0.55, y: 0.25}, {x: 0.65, y: 0.25}, {x: 0.75, y: 0.25},
                        // Diagonal
                        {x: 0.7, y: 0.32}, {x: 0.65, y: 0.4}, {x: 0.6, y: 0.48}, {x: 0.55, y: 0.56},
                        {x: 0.5, y: 0.64}, {x: 0.45, y: 0.72}, {x: 0.4, y: 0.8}, {x: 0.35, y: 0.85},
                        // Bottom horizontal
                        {x: 0.25, y: 0.85}, {x: 0.35, y: 0.85}, {x: 0.45, y: 0.85}, {x: 0.55, y: 0.85},
                        {x: 0.65, y: 0.85}, {x: 0.75, y: 0.85}
                    ],
                    startX: 0.15, startY: 0.25,
                    description: "Draw across top, diagonal down, across bottom"
                }
            ],
            width: 0.7,
            height: 0.6,
            baseline: 0.85
        });
        
        // Missing uppercase letters
        this.addTemplate('B', {
            strokes: [
                { // Stroke 1: vertical line
                    points: [
                        {x: 0.15, y: 0.05}, {x: 0.15, y: 0.15}, {x: 0.15, y: 0.25}, {x: 0.15, y: 0.35},
                        {x: 0.15, y: 0.45}, {x: 0.15, y: 0.55}, {x: 0.15, y: 0.65}, {x: 0.15, y: 0.75},
                        {x: 0.15, y: 0.85}, {x: 0.15, y: 0.95}
                    ],
                    startX: 0.15, startY: 0.05,
                    description: "Draw a vertical line"
                },
                { // Stroke 2: upper bump
                    points: [
                        {x: 0.15, y: 0.05}, {x: 0.25, y: 0.05}, {x: 0.35, y: 0.05}, {x: 0.45, y: 0.07},
                        {x: 0.52, y: 0.12}, {x: 0.55, y: 0.2}, {x: 0.55, y: 0.3}, {x: 0.52, y: 0.38},
                        {x: 0.45, y: 0.43}, {x: 0.35, y: 0.45}, {x: 0.25, y: 0.45}, {x: 0.15, y: 0.45}
                    ],
                    startX: 0.15, startY: 0.05,
                    description: "Draw the top bump"
                },
                { // Stroke 3: lower bump
                    points: [
                        {x: 0.15, y: 0.45}, {x: 0.25, y: 0.45}, {x: 0.35, y: 0.45}, {x: 0.45, y: 0.47},
                        {x: 0.55, y: 0.52}, {x: 0.6, y: 0.6}, {x: 0.6, y: 0.7}, {x: 0.55, y: 0.78},
                        {x: 0.45, y: 0.83}, {x: 0.35, y: 0.85}, {x: 0.25, y: 0.85}, {x: 0.15, y: 0.85}
                    ],
                    startX: 0.15, startY: 0.45,
                    description: "Draw the bottom bump"
                }
            ],
            width: 0.6,
            height: 0.9,
            baseline: 0.95
        });
        
        this.addTemplate('D', {
            strokes: [
                { // Stroke 1: vertical line
                    points: [
                        {x: 0.15, y: 0.05}, {x: 0.15, y: 0.15}, {x: 0.15, y: 0.25}, {x: 0.15, y: 0.35},
                        {x: 0.15, y: 0.45}, {x: 0.15, y: 0.55}, {x: 0.15, y: 0.65}, {x: 0.15, y: 0.75},
                        {x: 0.15, y: 0.85}, {x: 0.15, y: 0.95}
                    ],
                    startX: 0.15, startY: 0.05,
                    description: "Draw a vertical line"
                },
                { // Stroke 2: curved right side
                    points: [
                        {x: 0.15, y: 0.05}, {x: 0.25, y: 0.05}, {x: 0.35, y: 0.05}, {x: 0.45, y: 0.07},
                        {x: 0.55, y: 0.12}, {x: 0.65, y: 0.2}, {x: 0.72, y: 0.3}, {x: 0.75, y: 0.4},
                        {x: 0.75, y: 0.5}, {x: 0.75, y: 0.6}, {x: 0.72, y: 0.7}, {x: 0.65, y: 0.8},
                        {x: 0.55, y: 0.88}, {x: 0.45, y: 0.93}, {x: 0.35, y: 0.95}, {x: 0.25, y: 0.95}, {x: 0.15, y: 0.95}
                    ],
                    startX: 0.15, startY: 0.05,
                    description: "Draw the curved right side"
                }
            ],
            width: 0.7,
            height: 0.9,
            baseline: 0.95
        });
        
        this.addTemplate('F', {
            strokes: [
                { // Stroke 1: vertical line
                    points: [
                        {x: 0.2, y: 0.05}, {x: 0.2, y: 0.15}, {x: 0.2, y: 0.25}, {x: 0.2, y: 0.35},
                        {x: 0.2, y: 0.45}, {x: 0.2, y: 0.55}, {x: 0.2, y: 0.65}, {x: 0.2, y: 0.75},
                        {x: 0.2, y: 0.85}, {x: 0.2, y: 0.95}
                    ],
                    startX: 0.2, startY: 0.05,
                    description: "Draw a vertical line"
                },
                { // Stroke 2: top horizontal line
                    points: [
                        {x: 0.2, y: 0.05}, {x: 0.3, y: 0.05}, {x: 0.4, y: 0.05}, {x: 0.5, y: 0.05},
                        {x: 0.6, y: 0.05}, {x: 0.7, y: 0.05}, {x: 0.8, y: 0.05}
                    ],
                    startX: 0.2, startY: 0.05,
                    description: "Draw the top line"
                },
                { // Stroke 3: middle horizontal line
                    points: [
                        {x: 0.2, y: 0.5}, {x: 0.3, y: 0.5}, {x: 0.4, y: 0.5}, {x: 0.5, y: 0.5}, {x: 0.6, y: 0.5}
                    ],
                    startX: 0.2, startY: 0.5,
                    description: "Draw the middle line"
                }
            ],
            width: 0.7,
            height: 0.9,
            baseline: 0.95
        });
        
        this.addTemplate('G', {
            strokes: [
                { // Single stroke: Large C with horizontal bar
                    points: [
                        {x: 0.85, y: 0.15}, {x: 0.75, y: 0.08}, {x: 0.65, y: 0.04}, {x: 0.55, y: 0.02},
                        {x: 0.45, y: 0.02}, {x: 0.35, y: 0.04}, {x: 0.25, y: 0.08}, {x: 0.17, y: 0.15},
                        {x: 0.1, y: 0.24}, {x: 0.05, y: 0.35}, {x: 0.02, y: 0.46}, {x: 0.02, y: 0.54},
                        {x: 0.05, y: 0.65}, {x: 0.1, y: 0.76}, {x: 0.17, y: 0.85}, {x: 0.25, y: 0.92},
                        {x: 0.35, y: 0.96}, {x: 0.45, y: 0.98}, {x: 0.55, y: 0.98}, {x: 0.65, y: 0.96},
                        {x: 0.75, y: 0.92}, {x: 0.8, y: 0.85}, {x: 0.8, y: 0.75}, {x: 0.8, y: 0.65},
                        {x: 0.8, y: 0.55}, {x: 0.7, y: 0.55}, {x: 0.6, y: 0.55}, {x: 0.55, y: 0.55}
                    ],
                    startX: 0.85, startY: 0.15,
                    description: "Draw like C, then add horizontal bar"
                }
            ],
            width: 0.9,
            height: 0.96,
            baseline: 0.98
        });
        
        this.addTemplate('H', {
            strokes: [
                { // Stroke 1: left vertical line
                    points: [
                        {x: 0.2, y: 0.05}, {x: 0.2, y: 0.15}, {x: 0.2, y: 0.25}, {x: 0.2, y: 0.35},
                        {x: 0.2, y: 0.45}, {x: 0.2, y: 0.55}, {x: 0.2, y: 0.65}, {x: 0.2, y: 0.75},
                        {x: 0.2, y: 0.85}, {x: 0.2, y: 0.95}
                    ],
                    startX: 0.2, startY: 0.05,
                    description: "Draw left vertical line"
                },
                { // Stroke 2: horizontal crossbar
                    points: [
                        {x: 0.2, y: 0.5}, {x: 0.3, y: 0.5}, {x: 0.4, y: 0.5}, {x: 0.5, y: 0.5},
                        {x: 0.6, y: 0.5}, {x: 0.7, y: 0.5}, {x: 0.8, y: 0.5}
                    ],
                    startX: 0.2, startY: 0.5,
                    description: "Draw crossbar"
                },
                { // Stroke 3: right vertical line
                    points: [
                        {x: 0.8, y: 0.05}, {x: 0.8, y: 0.15}, {x: 0.8, y: 0.25}, {x: 0.8, y: 0.35},
                        {x: 0.8, y: 0.45}, {x: 0.8, y: 0.55}, {x: 0.8, y: 0.65}, {x: 0.8, y: 0.75},
                        {x: 0.8, y: 0.85}, {x: 0.8, y: 0.95}
                    ],
                    startX: 0.8, startY: 0.05,
                    description: "Draw right vertical line"
                }
            ],
            width: 0.7,
            height: 0.9,
            baseline: 0.95
        });
        
        this.addTemplate('J', {
            strokes: [
                { // Single stroke: down with curve at bottom
                    points: [
                        {x: 0.6, y: 0.05}, {x: 0.6, y: 0.15}, {x: 0.6, y: 0.25}, {x: 0.6, y: 0.35},
                        {x: 0.6, y: 0.45}, {x: 0.6, y: 0.55}, {x: 0.6, y: 0.65}, {x: 0.6, y: 0.75},
                        {x: 0.58, y: 0.83}, {x: 0.54, y: 0.89}, {x: 0.48, y: 0.93}, {x: 0.4, y: 0.95},
                        {x: 0.32, y: 0.93}, {x: 0.26, y: 0.89}, {x: 0.22, y: 0.83}, {x: 0.2, y: 0.75}
                    ],
                    startX: 0.6, startY: 0.05,
                    description: "Draw down and curve at bottom"
                }
            ],
            width: 0.5,
            height: 0.9,
            baseline: 0.95
        });
        
        this.addTemplate('K', {
            strokes: [
                { // Stroke 1: vertical line
                    points: [
                        {x: 0.2, y: 0.05}, {x: 0.2, y: 0.15}, {x: 0.2, y: 0.25}, {x: 0.2, y: 0.35},
                        {x: 0.2, y: 0.45}, {x: 0.2, y: 0.55}, {x: 0.2, y: 0.65}, {x: 0.2, y: 0.75},
                        {x: 0.2, y: 0.85}, {x: 0.2, y: 0.95}
                    ],
                    startX: 0.2, startY: 0.05,
                    description: "Draw vertical line"
                },
                { // Stroke 2: upper diagonal
                    points: [
                        {x: 0.8, y: 0.05}, {x: 0.75, y: 0.1}, {x: 0.7, y: 0.15}, {x: 0.65, y: 0.2},
                        {x: 0.6, y: 0.25}, {x: 0.55, y: 0.3}, {x: 0.5, y: 0.35}, {x: 0.45, y: 0.4},
                        {x: 0.4, y: 0.45}, {x: 0.35, y: 0.48}, {x: 0.3, y: 0.5}, {x: 0.25, y: 0.5}, {x: 0.2, y: 0.5}
                    ],
                    startX: 0.8, startY: 0.05,
                    description: "Draw upper diagonal"
                },
                { // Stroke 3: lower diagonal
                    points: [
                        {x: 0.3, y: 0.5}, {x: 0.35, y: 0.55}, {x: 0.4, y: 0.6}, {x: 0.45, y: 0.65},
                        {x: 0.5, y: 0.7}, {x: 0.55, y: 0.75}, {x: 0.6, y: 0.8}, {x: 0.65, y: 0.85},
                        {x: 0.7, y: 0.9}, {x: 0.75, y: 0.93}, {x: 0.8, y: 0.95}
                    ],
                    startX: 0.3, startY: 0.5,
                    description: "Draw lower diagonal"
                }
            ],
            width: 0.7,
            height: 0.9,
            baseline: 0.95
        });
        
        this.addTemplate('M', {
            strokes: [
                { // Stroke 1: left vertical line
                    points: [
                        {x: 0.1, y: 0.95}, {x: 0.1, y: 0.85}, {x: 0.1, y: 0.75}, {x: 0.1, y: 0.65},
                        {x: 0.1, y: 0.55}, {x: 0.1, y: 0.45}, {x: 0.1, y: 0.35}, {x: 0.1, y: 0.25},
                        {x: 0.1, y: 0.15}, {x: 0.1, y: 0.05}
                    ],
                    startX: 0.1, startY: 0.95,
                    description: "Draw left vertical line"
                },
                { // Stroke 2: left diagonal to center
                    points: [
                        {x: 0.1, y: 0.05}, {x: 0.15, y: 0.15}, {x: 0.2, y: 0.25}, {x: 0.25, y: 0.35},
                        {x: 0.3, y: 0.45}, {x: 0.35, y: 0.55}, {x: 0.4, y: 0.65}, {x: 0.45, y: 0.75}, {x: 0.5, y: 0.8}
                    ],
                    startX: 0.1, startY: 0.05,
                    description: "Draw to center"
                },
                { // Stroke 3: right diagonal from center
                    points: [
                        {x: 0.5, y: 0.8}, {x: 0.55, y: 0.75}, {x: 0.6, y: 0.65}, {x: 0.65, y: 0.55},
                        {x: 0.7, y: 0.45}, {x: 0.75, y: 0.35}, {x: 0.8, y: 0.25}, {x: 0.85, y: 0.15}, {x: 0.9, y: 0.05}
                    ],
                    startX: 0.5, startY: 0.8,
                    description: "Draw to top right"
                },
                { // Stroke 4: right vertical line
                    points: [
                        {x: 0.9, y: 0.05}, {x: 0.9, y: 0.15}, {x: 0.9, y: 0.25}, {x: 0.9, y: 0.35},
                        {x: 0.9, y: 0.45}, {x: 0.9, y: 0.55}, {x: 0.9, y: 0.65}, {x: 0.9, y: 0.75},
                        {x: 0.9, y: 0.85}, {x: 0.9, y: 0.95}
                    ],
                    startX: 0.9, startY: 0.05,
                    description: "Draw right vertical line"
                }
            ],
            width: 0.9,
            height: 0.9,
            baseline: 0.95
        });
        
        this.addTemplate('P', {
            strokes: [
                { // Stroke 1: vertical line
                    points: [
                        {x: 0.15, y: 0.05}, {x: 0.15, y: 0.15}, {x: 0.15, y: 0.25}, {x: 0.15, y: 0.35},
                        {x: 0.15, y: 0.45}, {x: 0.15, y: 0.55}, {x: 0.15, y: 0.65}, {x: 0.15, y: 0.75},
                        {x: 0.15, y: 0.85}, {x: 0.15, y: 0.95}
                    ],
                    startX: 0.15, startY: 0.05,
                    description: "Draw vertical line"
                },
                { // Stroke 2: upper bump only
                    points: [
                        {x: 0.15, y: 0.05}, {x: 0.25, y: 0.05}, {x: 0.35, y: 0.05}, {x: 0.45, y: 0.07},
                        {x: 0.52, y: 0.12}, {x: 0.55, y: 0.2}, {x: 0.55, y: 0.3}, {x: 0.52, y: 0.38},
                        {x: 0.45, y: 0.43}, {x: 0.35, y: 0.45}, {x: 0.25, y: 0.45}, {x: 0.15, y: 0.45}
                    ],
                    startX: 0.15, startY: 0.05,
                    description: "Draw the bump"
                }
            ],
            width: 0.6,
            height: 0.9,
            baseline: 0.95
        });
        
        this.addTemplate('Q', {
            strokes: [
                { // Stroke 1: large circle
                    points: [
                        {x: 0.9, y: 0.5}, {x: 0.88, y: 0.38}, {x: 0.84, y: 0.27}, {x: 0.78, y: 0.18},
                        {x: 0.7, y: 0.11}, {x: 0.61, y: 0.06}, {x: 0.51, y: 0.03}, {x: 0.41, y: 0.03},
                        {x: 0.31, y: 0.06}, {x: 0.22, y: 0.11}, {x: 0.14, y: 0.18}, {x: 0.08, y: 0.27},
                        {x: 0.04, y: 0.38}, {x: 0.02, y: 0.5}, {x: 0.04, y: 0.62}, {x: 0.08, y: 0.73},
                        {x: 0.14, y: 0.82}, {x: 0.22, y: 0.89}, {x: 0.31, y: 0.94}, {x: 0.41, y: 0.97},
                        {x: 0.51, y: 0.97}, {x: 0.61, y: 0.94}, {x: 0.7, y: 0.89}, {x: 0.78, y: 0.82},
                        {x: 0.84, y: 0.73}, {x: 0.88, y: 0.62}, {x: 0.9, y: 0.5}
                    ],
                    startX: 0.9, startY: 0.5,
                    description: "Draw a big circle"
                },
                { // Stroke 2: diagonal tail
                    points: [
                        {x: 0.65, y: 0.65}, {x: 0.7, y: 0.7}, {x: 0.75, y: 0.75}, {x: 0.8, y: 0.8},
                        {x: 0.85, y: 0.85}, {x: 0.9, y: 0.9}, {x: 0.95, y: 0.95}
                    ],
                    startX: 0.65, startY: 0.65,
                    description: "Draw diagonal tail"
                }
            ],
            width: 0.95,
            height: 0.94,
            baseline: 0.97
        });
        
        this.addTemplate('R', {
            strokes: [
                { // Stroke 1: vertical line
                    points: [
                        {x: 0.15, y: 0.05}, {x: 0.15, y: 0.15}, {x: 0.15, y: 0.25}, {x: 0.15, y: 0.35},
                        {x: 0.15, y: 0.45}, {x: 0.15, y: 0.55}, {x: 0.15, y: 0.65}, {x: 0.15, y: 0.75},
                        {x: 0.15, y: 0.85}, {x: 0.15, y: 0.95}
                    ],
                    startX: 0.15, startY: 0.05,
                    description: "Draw vertical line"
                },
                { // Stroke 2: upper bump
                    points: [
                        {x: 0.15, y: 0.05}, {x: 0.25, y: 0.05}, {x: 0.35, y: 0.05}, {x: 0.45, y: 0.07},
                        {x: 0.52, y: 0.12}, {x: 0.55, y: 0.2}, {x: 0.55, y: 0.3}, {x: 0.52, y: 0.38},
                        {x: 0.45, y: 0.43}, {x: 0.35, y: 0.45}, {x: 0.25, y: 0.45}, {x: 0.15, y: 0.45}
                    ],
                    startX: 0.15, startY: 0.05,
                    description: "Draw the bump"
                },
                { // Stroke 3: diagonal leg
                    points: [
                        {x: 0.35, y: 0.45}, {x: 0.4, y: 0.5}, {x: 0.45, y: 0.55}, {x: 0.5, y: 0.6},
                        {x: 0.55, y: 0.65}, {x: 0.6, y: 0.7}, {x: 0.65, y: 0.75}, {x: 0.7, y: 0.8},
                        {x: 0.75, y: 0.85}, {x: 0.8, y: 0.9}, {x: 0.85, y: 0.95}
                    ],
                    startX: 0.35, startY: 0.45,
                    description: "Draw diagonal leg"
                }
            ],
            width: 0.8,
            height: 0.9,
            baseline: 0.95
        });
        
        this.addTemplate('S', {
            strokes: [
                { // Single stroke: Large S curve
                    points: [
                        {x: 0.8, y: 0.2}, {x: 0.7, y: 0.08}, {x: 0.6, y: 0.03}, {x: 0.5, y: 0.02},
                        {x: 0.4, y: 0.03}, {x: 0.3, y: 0.08}, {x: 0.22, y: 0.16}, {x: 0.2, y: 0.26},
                        {x: 0.22, y: 0.36}, {x: 0.3, y: 0.44}, {x: 0.4, y: 0.48}, {x: 0.5, y: 0.5},
                        {x: 0.6, y: 0.52}, {x: 0.7, y: 0.56}, {x: 0.78, y: 0.64}, {x: 0.8, y: 0.74},
                        {x: 0.78, y: 0.84}, {x: 0.7, y: 0.92}, {x: 0.6, y: 0.97}, {x: 0.5, y: 0.98},
                        {x: 0.4, y: 0.97}, {x: 0.3, y: 0.92}, {x: 0.2, y: 0.8}
                    ],
                    startX: 0.8, startY: 0.2,
                    description: "Draw a big S curve"
                }
            ],
            width: 0.7,
            height: 0.96,
            baseline: 0.98
        });
        
        this.addTemplate('U', {
            strokes: [
                { // Single stroke: down, curve, up
                    points: [
                        {x: 0.15, y: 0.05}, {x: 0.15, y: 0.15}, {x: 0.15, y: 0.25}, {x: 0.15, y: 0.35},
                        {x: 0.15, y: 0.45}, {x: 0.15, y: 0.55}, {x: 0.15, y: 0.65}, {x: 0.17, y: 0.75},
                        {x: 0.21, y: 0.83}, {x: 0.27, y: 0.89}, {x: 0.35, y: 0.93}, {x: 0.45, y: 0.95},
                        {x: 0.55, y: 0.95}, {x: 0.65, y: 0.93}, {x: 0.73, y: 0.89}, {x: 0.79, y: 0.83},
                        {x: 0.83, y: 0.75}, {x: 0.85, y: 0.65}, {x: 0.85, y: 0.55}, {x: 0.85, y: 0.45},
                        {x: 0.85, y: 0.35}, {x: 0.85, y: 0.25}, {x: 0.85, y: 0.15}, {x: 0.85, y: 0.05}
                    ],
                    startX: 0.15, startY: 0.05,
                    description: "Draw down left, curve bottom, up right"
                }
            ],
            width: 0.8,
            height: 0.9,
            baseline: 0.95
        });
        
        this.addTemplate('V', {
            strokes: [
                { // Single stroke: diagonal down, diagonal up
                    points: [
                        {x: 0.1, y: 0.05}, {x: 0.15, y: 0.15}, {x: 0.2, y: 0.25}, {x: 0.25, y: 0.35},
                        {x: 0.3, y: 0.45}, {x: 0.35, y: 0.55}, {x: 0.4, y: 0.65}, {x: 0.45, y: 0.75},
                        {x: 0.5, y: 0.85}, {x: 0.55, y: 0.95}, {x: 0.6, y: 0.85}, {x: 0.65, y: 0.75},
                        {x: 0.7, y: 0.65}, {x: 0.75, y: 0.55}, {x: 0.8, y: 0.45}, {x: 0.85, y: 0.35},
                        {x: 0.9, y: 0.25}, {x: 0.95, y: 0.15}, {x: 1.0, y: 0.05}
                    ],
                    startX: 0.1, startY: 0.05,
                    description: "Draw down to center, then up"
                }
            ],
            width: 1.0,
            height: 0.9,
            baseline: 0.95
        });
        
        this.addTemplate('W', {
            strokes: [
                { // Single stroke: down, up, down, up
                    points: [
                        {x: 0.05, y: 0.05}, {x: 0.08, y: 0.15}, {x: 0.11, y: 0.25}, {x: 0.14, y: 0.35},
                        {x: 0.17, y: 0.45}, {x: 0.2, y: 0.55}, {x: 0.23, y: 0.65}, {x: 0.26, y: 0.75},
                        {x: 0.29, y: 0.85}, {x: 0.32, y: 0.95},
                        // Back up to first peak
                        {x: 0.35, y: 0.85}, {x: 0.38, y: 0.75}, {x: 0.41, y: 0.65}, {x: 0.44, y: 0.55},
                        {x: 0.47, y: 0.45}, {x: 0.5, y: 0.35},
                        // Down to second valley
                        {x: 0.53, y: 0.45}, {x: 0.56, y: 0.55}, {x: 0.59, y: 0.65}, {x: 0.62, y: 0.75},
                        {x: 0.65, y: 0.85}, {x: 0.68, y: 0.95},
                        // Up to final peak
                        {x: 0.71, y: 0.85}, {x: 0.74, y: 0.75}, {x: 0.77, y: 0.65}, {x: 0.8, y: 0.55},
                        {x: 0.83, y: 0.45}, {x: 0.86, y: 0.35}, {x: 0.89, y: 0.25}, {x: 0.92, y: 0.15}, {x: 0.95, y: 0.05}
                    ],
                    startX: 0.05, startY: 0.05,
                    description: "Draw like a double V"
                }
            ],
            width: 1.0,
            height: 0.9,
            baseline: 0.95
        });
        
        this.addTemplate('X', {
            strokes: [
                { // Stroke 1: diagonal from top-left to bottom-right
                    points: [
                        {x: 0.15, y: 0.05}, {x: 0.2, y: 0.12}, {x: 0.25, y: 0.19}, {x: 0.3, y: 0.26},
                        {x: 0.35, y: 0.33}, {x: 0.4, y: 0.4}, {x: 0.45, y: 0.47}, {x: 0.5, y: 0.5},
                        {x: 0.55, y: 0.53}, {x: 0.6, y: 0.6}, {x: 0.65, y: 0.67}, {x: 0.7, y: 0.74},
                        {x: 0.75, y: 0.81}, {x: 0.8, y: 0.88}, {x: 0.85, y: 0.95}
                    ],
                    startX: 0.15, startY: 0.05,
                    description: "Draw diagonal from top-left down"
                },
                { // Stroke 2: diagonal from top-right to bottom-left
                    points: [
                        {x: 0.85, y: 0.05}, {x: 0.8, y: 0.12}, {x: 0.75, y: 0.19}, {x: 0.7, y: 0.26},
                        {x: 0.65, y: 0.33}, {x: 0.6, y: 0.4}, {x: 0.55, y: 0.47}, {x: 0.5, y: 0.5},
                        {x: 0.45, y: 0.53}, {x: 0.4, y: 0.6}, {x: 0.35, y: 0.67}, {x: 0.3, y: 0.74},
                        {x: 0.25, y: 0.81}, {x: 0.2, y: 0.88}, {x: 0.15, y: 0.95}
                    ],
                    startX: 0.85, startY: 0.05,
                    description: "Draw diagonal from top-right down"
                }
            ],
            width: 0.8,
            height: 0.9,
            baseline: 0.95
        });
        
        this.addTemplate('Y', {
            strokes: [
                { // Stroke 1: left diagonal to center
                    points: [
                        {x: 0.15, y: 0.05}, {x: 0.2, y: 0.12}, {x: 0.25, y: 0.19}, {x: 0.3, y: 0.26},
                        {x: 0.35, y: 0.33}, {x: 0.4, y: 0.4}, {x: 0.45, y: 0.47}, {x: 0.5, y: 0.5}
                    ],
                    startX: 0.15, startY: 0.05,
                    description: "Draw from top-left to center"
                },
                { // Stroke 2: right diagonal to center
                    points: [
                        {x: 0.85, y: 0.05}, {x: 0.8, y: 0.12}, {x: 0.75, y: 0.19}, {x: 0.7, y: 0.26},
                        {x: 0.65, y: 0.33}, {x: 0.6, y: 0.4}, {x: 0.55, y: 0.47}, {x: 0.5, y: 0.5}
                    ],
                    startX: 0.85, startY: 0.05,
                    description: "Draw from top-right to center"
                },
                { // Stroke 3: vertical line down from center
                    points: [
                        {x: 0.5, y: 0.5}, {x: 0.5, y: 0.57}, {x: 0.5, y: 0.64}, {x: 0.5, y: 0.71},
                        {x: 0.5, y: 0.78}, {x: 0.5, y: 0.85}, {x: 0.5, y: 0.92}, {x: 0.5, y: 0.95}
                    ],
                    startX: 0.5, startY: 0.5,
                    description: "Draw down from center"
                }
            ],
            width: 0.8,
            height: 0.9,
            baseline: 0.95
        });
        
        this.addTemplate('Z', {
            strokes: [
                { // Single stroke: horizontal, diagonal, horizontal
                    points: [
                        // Top horizontal
                        {x: 0.15, y: 0.05}, {x: 0.25, y: 0.05}, {x: 0.35, y: 0.05}, {x: 0.45, y: 0.05},
                        {x: 0.55, y: 0.05}, {x: 0.65, y: 0.05}, {x: 0.75, y: 0.05}, {x: 0.85, y: 0.05},
                        // Diagonal
                        {x: 0.8, y: 0.12}, {x: 0.75, y: 0.19}, {x: 0.7, y: 0.26}, {x: 0.65, y: 0.33},
                        {x: 0.6, y: 0.4}, {x: 0.55, y: 0.47}, {x: 0.5, y: 0.54}, {x: 0.45, y: 0.61},
                        {x: 0.4, y: 0.68}, {x: 0.35, y: 0.75}, {x: 0.3, y: 0.82}, {x: 0.25, y: 0.88}, {x: 0.2, y: 0.95},
                        // Bottom horizontal
                        {x: 0.25, y: 0.95}, {x: 0.35, y: 0.95}, {x: 0.45, y: 0.95}, {x: 0.55, y: 0.95},
                        {x: 0.65, y: 0.95}, {x: 0.75, y: 0.95}, {x: 0.85, y: 0.95}
                    ],
                    startX: 0.15, startY: 0.05,
                    description: "Draw across top, diagonal down, across bottom"
                }
            ],
            width: 0.8,
            height: 0.9,
            baseline: 0.95
        });
    }
    
    addTemplate(letter, template) {
        this.templates.set(letter, template);
    }
    
    getTemplate(letter) {
        return this.templates.get(letter);
    }
    
    getStrokeCount(letter) {
        const template = this.getTemplate(letter);
        return template ? template.strokes.length : 0;
    }
    
    getStroke(letter, strokeIndex) {
        const template = this.getTemplate(letter);
        if (template && strokeIndex < template.strokes.length) {
            return template.strokes[strokeIndex];
        }
        return null;
    }
    
    // Convert normalized coordinates to canvas coordinates
    getCanvasStroke(letter, strokeIndex, canvasWidth, canvasHeight, padding = 50) {
        const stroke = this.getStroke(letter, strokeIndex);
        if (!stroke) return null;
        
        const template = this.getTemplate(letter);
        const drawWidth = canvasWidth - (padding * 2);
        const drawHeight = canvasHeight - (padding * 2);
        
        // Calculate scale to fit letter in canvas while maintaining aspect ratio
        const scaleX = drawWidth / template.width;
        const scaleY = drawHeight / template.height;
        const scale = Math.min(scaleX, scaleY);
        
        // Center the letter
        const letterWidth = template.width * scale;
        const letterHeight = template.height * scale;
        const offsetX = padding + (drawWidth - letterWidth) / 2;
        const offsetY = padding + (drawHeight - letterHeight) / 2;
        
        return {
            points: stroke.points.map(point => ({
                x: offsetX + (point.x * letterWidth),
                y: offsetY + (point.y * letterHeight)
            })),
            startX: offsetX + (stroke.startX * letterWidth),
            startY: offsetY + (stroke.startY * letterHeight),
            description: stroke.description
        };
    }
    
    // Get all supported letters
    getSupportedLetters() {
        return Array.from(this.templates.keys());
    }
    
    // Check if letter is supported
    isSupported(letter) {
        return this.templates.has(letter);
    }
    
    // Load custom templates from localStorage
    loadCustomTemplates() {
        try {
            const customTemplates = localStorage.getItem('alphahunters_custom_letter_templates');
            if (customTemplates) {
                const templates = JSON.parse(customTemplates);
                
                Object.entries(templates).forEach(([letter, strokes]) => {
                    // Convert from editor format to template format
                    const template = this.convertCustomTemplate(letter, strokes);
                    if (template) {
                        this.addTemplate(letter, template);
                        console.log('📝 Loaded custom template for:', letter);
                    }
                });
            }
        } catch (error) {
            console.error('Error loading custom templates:', error);
        }
    }
    
    // Convert custom template from editor format to game format
    convertCustomTemplate(letter, customStrokes) {
        if (!Array.isArray(customStrokes) || customStrokes.length === 0) {
            return null;
        }
        
        const strokes = customStrokes.map((strokeData, index) => {
            const points = [];
            
            // Convert normalized points to template format
            for (let i = 0; i < strokeData.length; i += 2) {
                points.push({
                    x: strokeData[i],
                    y: strokeData[i + 1]
                });
            }
            
            if (points.length === 0) return null;
            
            return {
                points: points,
                startX: points[0].x,
                startY: points[0].y,
                description: `Custom stroke ${index + 1}`
            };
        }).filter(stroke => stroke !== null);
        
        if (strokes.length === 0) return null;
        
        // Calculate bounding box for the letter
        let minX = 1, minY = 1, maxX = 0, maxY = 0;
        strokes.forEach(stroke => {
            stroke.points.forEach(point => {
                minX = Math.min(minX, point.x);
                minY = Math.min(minY, point.y);
                maxX = Math.max(maxX, point.x);
                maxY = Math.max(maxY, point.y);
            });
        });
        
        return {
            strokes: strokes,
            width: maxX - minX + 0.1,
            height: maxY - minY + 0.1,
            baseline: 0.8 // Default baseline position
        };
    }
}