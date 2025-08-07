// Input Manager for handling mouse and touch interactions

class InputManager {
    constructor(game) {
        this.game = game;
        this.canvas = game.canvas;
        
        // Input state
        this.isPointerDown = false;
        this.pointerPosition = { x: 0, y: 0 };
        this.lastPointerPosition = { x: 0, y: 0 };
        this.pointerStartPosition = { x: 0, y: 0 };
        
        // Mouse follow settings
        this.isMouseFollowing = false;
        this.mouseTarget = { x: 0, y: 0 };
        this.mouseFollowSpeed = 3500; // Much faster acceleration toward mouse for young kids
        
        // Touch/mouse unified handling
        this.supportedEvents = this.getPointerEvents();
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        // InputManager ready
    }
    
    getPointerEvents() {
        // Use Pointer Events if available (modern approach)
        if (window.PointerEvent) {
            return {
                start: 'pointerdown',
                move: 'pointermove',
                end: 'pointerup',
                cancel: 'pointercancel'
            };
        }
        // Fallback to touch events for mobile
        else if ('ontouchstart' in window) {
            return {
                start: 'touchstart',
                move: 'touchmove',
                end: 'touchend',
                cancel: 'touchcancel'
            };
        }
        // Fallback to mouse events
        else {
            return {
                start: 'mousedown',
                move: 'mousemove',
                end: 'mouseup',
                cancel: 'mouseleave'
            };
        }
    }
    
    setupEventListeners() {
        // Prevent default touch behaviors
        this.canvas.style.touchAction = 'none';
        
        // Also prevent touch behaviors on trace canvas when it exists
        const traceCanvas = document.getElementById('traceCanvas');
        if (traceCanvas) {
            traceCanvas.style.touchAction = 'none';
            traceCanvas.style.userSelect = 'none';
            traceCanvas.style.webkitUserSelect = 'none';
        }
        
        // Pointer start
        this.canvas.addEventListener(this.supportedEvents.start, (e) => {
            this.handlePointerStart(e);
        }, { passive: false });
        
        // Pointer move
        this.canvas.addEventListener(this.supportedEvents.move, (e) => {
            this.handlePointerMove(e);
        }, { passive: false });
        
        // Pointer end
        this.canvas.addEventListener(this.supportedEvents.end, (e) => {
            this.handlePointerEnd(e);
        }, { passive: false });
        
        // Pointer cancel
        this.canvas.addEventListener(this.supportedEvents.cancel, (e) => {
            this.handlePointerCancel(e);
        }, { passive: false });
        
        // Prevent context menu on canvas
        this.canvas.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });
        
        // Keyboard input for movement (WASD/Arrow keys)
        this.setupKeyboardMovement();
    }
    
    setupKeyboardMovement() {
        this.keys = {
            'KeyW': { x: 0, y: -1 },
            'KeyA': { x: -1, y: 0 },
            'KeyS': { x: 0, y: 1 },
            'KeyD': { x: 1, y: 0 },
            'ArrowUp': { x: 0, y: -1 },
            'ArrowLeft': { x: -1, y: 0 },
            'ArrowDown': { x: 0, y: 1 },
            'ArrowRight': { x: 1, y: 0 }
        };
        
        this.pressedKeys = new Set();
        
        document.addEventListener('keydown', (e) => {
            if (this.keys[e.code] && this.game.state === 'playing') {
                e.preventDefault();
                this.pressedKeys.add(e.code);
            }
        });
        
        document.addEventListener('keyup', (e) => {
            if (this.keys[e.code]) {
                e.preventDefault();
                this.pressedKeys.delete(e.code);
            }
        });
    }
    
    updateKeyboardMovement(deltaTime) {
        if (this.pressedKeys.size === 0 || this.game.state !== 'playing') return;
        
        let moveX = 0;
        let moveY = 0;
        
        for (const key of this.pressedKeys) {
            const direction = this.keys[key];
            moveX += direction.x;
            moveY += direction.y;
        }
        
        // Normalize diagonal movement
        if (moveX !== 0 && moveY !== 0) {
            const length = Math.sqrt(moveX * moveX + moveY * moveY);
            moveX /= length;
            moveY /= length;
        }
        
        // Apply acceleration to player velocity
        if (moveX !== 0 || moveY !== 0) {
            const player = this.game.player;
            const acceleration = player.acceleration * deltaTime;
            
            player.vx += moveX * acceleration;
            player.vy += moveY * acceleration;
            
            // Cap max speed
            const speed = Math.sqrt(player.vx * player.vx + player.vy * player.vy);
            if (speed > player.maxSpeed) {
                player.vx = (player.vx / speed) * player.maxSpeed;
                player.vy = (player.vy / speed) * player.maxSpeed;
            }
        }
    }
    
    updateMouseMovement(deltaTime) {
        if (!this.isMouseFollowing || this.game.state !== 'playing') return;
        
        const player = this.game.player;
        
        // Calculate direction from player to mouse target (in world coordinates)
        const dx = this.mouseTarget.x - player.x;
        const dy = this.mouseTarget.y - player.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Only move if we're not very close to the target
        if (distance > 10) {
            // Normalize direction
            const dirX = dx / distance;
            const dirY = dy / distance;
            
            // Apply acceleration toward mouse
            const acceleration = this.mouseFollowSpeed * deltaTime;
            
            player.vx += dirX * acceleration;
            player.vy += dirY * acceleration;
            
            // Cap max speed
            const speed = Math.sqrt(player.vx * player.vx + player.vy * player.vy);
            if (speed > player.maxSpeed) {
                player.vx = (player.vx / speed) * player.maxSpeed;
                player.vy = (player.vy / speed) * player.maxSpeed;
            }
        }
    }
    
    updateMouseTarget(screenPoint) {
        // Convert screen coordinates to world coordinates
        this.mouseTarget.x = screenPoint.x + this.game.camera.x;
        this.mouseTarget.y = screenPoint.y + this.game.camera.y;
    }
    
    handlePointerStart(event) {
        if (this.game.state !== 'playing') return;
        
        event.preventDefault();
        
        const point = this.getPointerPosition(event);
        this.pointerPosition = point;
        this.lastPointerPosition = { ...point };
        this.pointerStartPosition = { ...point };
        this.isPointerDown = true;
        
        // Start mouse following
        this.isMouseFollowing = true;
        this.updateMouseTarget(point);
        
        console.log('Mouse follow started at:', point);
    }
    
    handlePointerMove(event) {
        event.preventDefault();
        
        const point = this.getPointerPosition(event);
        this.lastPointerPosition = { ...this.pointerPosition };
        this.pointerPosition = point;
        
        // Update mouse target if we're following
        if (this.isMouseFollowing) {
            this.updateMouseTarget(point);
        }
    }
    
    handlePointerEnd(event) {
        event.preventDefault();
        
        // Stop mouse following
        this.isMouseFollowing = false;
        this.isPointerDown = false;
        
        console.log('Mouse follow stopped');
    }
    
    handlePointerCancel(event) {
        event.preventDefault();
        this.isPointerDown = false;
        this.isMoving = false;
        console.log('Pointer cancelled');
    }
    
    getPointerPosition(event) {
        let clientX, clientY;
        
        // Handle different event types
        if (event.type.startsWith('pointer')) {
            clientX = event.clientX;
            clientY = event.clientY;
        } else if (event.type.startsWith('touch')) {
            // Use first touch point
            const touch = event.touches[0] || event.changedTouches[0];
            clientX = touch.clientX;
            clientY = touch.clientY;
        } else {
            // Mouse event
            clientX = event.clientX;
            clientY = event.clientY;
        }
        
        // Convert to canvas coordinates
        return Utils.getCanvasPoint(this.canvas, clientX, clientY);
    }
    
    // Alternative movement mode: drag to move (like mobile games)
    enableDragMode() {
        this.dragMode = true;
        this.canvas.style.cursor = 'move';
    }
    
    disableDragMode() {
        this.dragMode = false;
        this.canvas.style.cursor = 'pointer';
    }
    
    // Get input state for other systems
    getInputState() {
        return {
            isPointerDown: this.isPointerDown,
            pointerPosition: { ...this.pointerPosition },
            isMoving: this.isMoving
        };
    }
    
    // For trace panel input handling
    setupTraceInput(traceCanvas, onStrokeStart, onStrokeMove, onStrokeEnd) {
        let isDrawing = false;
        let currentStroke = [];
        let touchId = null; // Track specific touch for multi-touch scenarios
        
        const handleStart = (e) => {
            e.preventDefault();
            
            console.log('Touch start event:', e.type, 'touches:', e.touches?.length);
            
            const point = this.getTracePoint(traceCanvas, e);
            if (!point) {
                console.warn('Failed to get trace point on start');
                return;
            }
            
            // For touch events, track the specific touch ID
            if (e.type.startsWith('touch') && e.touches && e.touches.length > 0) {
                touchId = e.touches[0].identifier;
                console.log('Tracking touch ID:', touchId);
            }
            
            isDrawing = true;
            currentStroke = [];
            
            currentStroke.push({
                x: point.x,
                y: point.y,
                t: performance.now()
            });
            
            if (onStrokeStart) onStrokeStart(currentStroke[0]);
            // Touch/mouse start - removed verbose logging
        };
        
        const handleMove = (e) => {
            if (!isDrawing) {
                // Move event but not drawing - this is normal, no need to log
                return;
            }
            e.preventDefault();
            
            // For touch events, make sure we're tracking the same touch
            if (e.type.startsWith('touch') && touchId !== null) {
                let foundTouch = false;
                if (e.touches) {
                    for (let touch of e.touches) {
                        if (touch.identifier === touchId) {
                            foundTouch = true;
                            break;
                        }
                    }
                }
                if (!foundTouch) {
                    console.log('Touch ID not found in move event, ending stroke');
                    handleEnd(e);
                    return;
                }
            }
            
            const point = this.getTracePoint(traceCanvas, e);
            if (!point) {
                console.warn('Failed to get trace point on move');
                return;
            }
            
            // Add point only if it's a reasonable distance from last point
            const lastPoint = currentStroke[currentStroke.length - 1];
            const distance = Math.sqrt(
                Math.pow(point.x - lastPoint.x, 2) + 
                Math.pow(point.y - lastPoint.y, 2)
            );
            
            // Only add point if moved enough (reduces noise)
            if (distance >= 2) {
                currentStroke.push({
                    x: point.x,
                    y: point.y,
                    t: performance.now()
                });
                
                // Added point to stroke
                if (onStrokeMove) onStrokeMove(currentStroke);
            }
        };
        
        const handleEnd = (e) => {
            // End event - only log errors
            
            if (!isDrawing) return;
            e.preventDefault();
            
            // For touch events, verify we're ending the correct touch
            if (e.type.startsWith('touch') && touchId !== null) {
                let correctTouch = false;
                if (e.changedTouches) {
                    for (let touch of e.changedTouches) {
                        if (touch.identifier === touchId) {
                            correctTouch = true;
                            break;
                        }
                    }
                }
                if (!correctTouch && e.type !== 'touchcancel') {
                    console.log('End event not for our touch ID, ignoring');
                    return;
                }
            }
            
            isDrawing = false;
            touchId = null;
            
            // Require a meaningful stroke length
            if (onStrokeEnd && currentStroke.length >= 5) {
                // Ending stroke
                onStrokeEnd(currentStroke);
            } else {
                console.warn('Stroke too short (' + currentStroke.length + ' points), not ending');
            }
        };
        
        const handleCancel = (e) => {
            console.log('Touch cancelled');
            isDrawing = false;
            touchId = null;
            currentStroke = [];
        };
        
        // Set up trace canvas event listeners with more specific handling
        traceCanvas.addEventListener(this.supportedEvents.start, handleStart, { passive: false });
        traceCanvas.addEventListener(this.supportedEvents.move, handleMove, { passive: false });
        traceCanvas.addEventListener(this.supportedEvents.end, handleEnd, { passive: false });
        traceCanvas.addEventListener(this.supportedEvents.cancel, handleCancel, { passive: false });
        
        // Return cleanup function
        return () => {
            traceCanvas.removeEventListener(this.supportedEvents.start, handleStart);
            traceCanvas.removeEventListener(this.supportedEvents.move, handleMove);
            traceCanvas.removeEventListener(this.supportedEvents.end, handleEnd);
            traceCanvas.removeEventListener(this.supportedEvents.cancel, handleCancel);
        };
    }
    
    getTracePoint(traceCanvas, event) {
        let clientX, clientY;
        
        if (event.type.startsWith('pointer')) {
            clientX = event.clientX;
            clientY = event.clientY;
        } else if (event.type.startsWith('touch')) {
            let touch = null;
            
            // For touch events, be very specific about which touch to use
            if (event.type === 'touchstart' && event.touches && event.touches.length > 0) {
                touch = event.touches[0];
            } else if (event.type === 'touchmove' && event.touches && event.touches.length > 0) {
                touch = event.touches[0];
            } else if (event.type === 'touchend' && event.changedTouches && event.changedTouches.length > 0) {
                touch = event.changedTouches[0];
            } else if (event.type === 'touchcancel' && event.changedTouches && event.changedTouches.length > 0) {
                touch = event.changedTouches[0];
            }
            
            if (!touch) {
                console.warn('No touch data available for', event.type, 'touches:', event.touches?.length, 'changedTouches:', event.changedTouches?.length);
                return null;
            }
            
            clientX = touch.clientX;
            clientY = touch.clientY;
        } else {
            clientX = event.clientX;
            clientY = event.clientY;
        }
        
        const point = Utils.getCanvasPoint(traceCanvas, clientX, clientY);
        // Removed verbose trace point logging
        return point;
    }
    
    // Accessibility helpers
    enableKeyboardNavigation() {
        // Add keyboard navigation support for menu systems
        document.addEventListener('keydown', (e) => {
            if (this.game.state === 'paused') {
                this.handleMenuNavigation(e);
            }
        });
    }
    
    handleMenuNavigation(event) {
        // Basic keyboard navigation for accessibility
        const focusableElements = document.querySelectorAll(
            '#pauseMenu button:not([disabled]), #tracePanel button:not([disabled])'
        );
        
        const currentFocus = document.activeElement;
        const currentIndex = Array.from(focusableElements).indexOf(currentFocus);
        
        switch (event.code) {
            case 'Tab':
                // Tab navigation is handled by browser
                break;
            case 'ArrowDown':
            case 'ArrowRight':
                event.preventDefault();
                const nextIndex = (currentIndex + 1) % focusableElements.length;
                focusableElements[nextIndex]?.focus();
                break;
            case 'ArrowUp':
            case 'ArrowLeft':
                event.preventDefault();
                const prevIndex = currentIndex > 0 ? currentIndex - 1 : focusableElements.length - 1;
                focusableElements[prevIndex]?.focus();
                break;
            case 'Enter':
            case 'Space':
                event.preventDefault();
                currentFocus?.click();
                break;
        }
    }
    
    // Cleanup
    destroy() {
        // Remove all event listeners
        if (this.canvas) {
            this.canvas.removeEventListener(this.supportedEvents.start, this.handlePointerStart);
            this.canvas.removeEventListener(this.supportedEvents.move, this.handlePointerMove);
            this.canvas.removeEventListener(this.supportedEvents.end, this.handlePointerEnd);
            this.canvas.removeEventListener(this.supportedEvents.cancel, this.handlePointerCancel);
        }
    }
}