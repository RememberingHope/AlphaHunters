// Teacher Authentication System
class TeacherAuth {
    constructor(game) {
        this.game = game;
        this.isAuthenticated = false;
        this.sessionStartTime = null;
        this.sessionTimeout = 1800000; // 30 minutes default
        this.maxAttempts = 3;
        this.attemptCount = 0;
        this.lockoutTime = null;
        this.configLoaded = false;
        
        // Load teacher config
        this.loadConfig();
    }
    
    async loadConfig() {
        // Check localStorage first for updated PIN
        const savedPin = localStorage.getItem('alphahunters_teacher_pin');
        if (savedPin) {
            try {
                const pinData = JSON.parse(savedPin);
                this.config = {
                    pin: pinData.pin,
                    lastChanged: pinData.lastChanged,
                    settings: {
                        sessionTimeout: 1800000,
                        maxAttempts: 3
                    }
                };
                this.sessionTimeout = this.config.settings?.sessionTimeout || 1800000;
                this.maxAttempts = this.config.settings?.maxAttempts || 3;
                console.log('✅ Teacher PIN loaded from localStorage');
                this.configLoaded = true;
                return;
            } catch (error) {
                console.error('Error loading saved PIN:', error);
            }
        }
        
        // Fall back to default config (teacher.json can't be loaded from file:// protocol)
        console.log('⚠️ Using default teacher config (CORS prevents loading teacher.json from file://)');
        this.config = { 
            pin: '1234',
            settings: {
                sessionTimeout: 1800000,
                maxAttempts: 3
            }
        };
        this.sessionTimeout = this.config.settings?.sessionTimeout || 1800000;
        this.maxAttempts = this.config.settings?.maxAttempts || 3;
        
        this.configLoaded = true;
    }
    
    async showPinDialog() {
        console.log('🎓 Showing teacher PIN dialog...');
        
        // Check if modal already exists and remove it
        const existingModal = document.getElementById('teacherPinModal');
        if (existingModal) {
            existingModal.remove();
        }
        
        // Hide any other overlays that might interfere
        const overlays = document.querySelectorAll('.overlay');
        overlays.forEach(overlay => {
            if (overlay.id !== 'teacherPinModal') {
                overlay.style.display = 'none';
            }
        });
        
        // Wait for config to load if not already loaded
        if (!this.configLoaded) {
            console.log('⏳ Waiting for config to load...');
            await this.loadConfig();
        }
        
        console.log('Config loaded:', this.config);
        
        // Check if locked out
        if (this.isLockedOut()) {
            const remainingTime = Math.ceil((this.lockoutTime + 300000 - Date.now()) / 1000);
            alert(`Too many incorrect attempts. Please try again in ${remainingTime} seconds.`);
            return;
        }
        
        // Create PIN entry modal
        const modal = document.createElement('div');
        modal.id = 'teacherPinModal';
        modal.style.cssText = `
            position: fixed;
            top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 99999;
        `;
        
        modal.innerHTML = `
            <div style="
                background: white;
                padding: 30px;
                border-radius: 15px;
                text-align: center;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
                min-width: 300px;
                position: relative;
                z-index: 100000;
            ">
                <h2 style="color: #1976D2; margin-bottom: 20px;">🎓 Teacher Access</h2>
                <p style="color: #666; margin-bottom: 20px;">Enter your PIN to access teacher tools</p>
                
                <input type="password" id="teacherPinInput" style="
                    width: 200px;
                    padding: 10px;
                    font-size: 24px;
                    text-align: center;
                    border: 2px solid #ddd;
                    border-radius: 8px;
                    margin-bottom: 20px;
                " maxlength="4" placeholder="••••" />
                
                <div style="display: flex; gap: 10px; justify-content: center;">
                    <button id="teacherPinSubmit" style="
                        background: #1976D2;
                        color: white;
                        border: none;
                        padding: 10px 30px;
                        border-radius: 8px;
                        font-size: 16px;
                        cursor: pointer;
                    ">Enter</button>
                    
                    <button id="teacherPinCancel" style="
                        background: #666;
                        color: white;
                        border: none;
                        padding: 10px 30px;
                        border-radius: 8px;
                        font-size: 16px;
                        cursor: pointer;
                    ">Cancel</button>
                </div>
                
                <p id="teacherPinError" style="
                    color: #f44336;
                    margin-top: 15px;
                    display: none;
                ">Incorrect PIN. Please try again.</p>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Ensure modal is visible
        console.log('Modal added to DOM');
        
        // Debug: Check if modal is actually visible
        const addedModal = document.getElementById('teacherPinModal');
        if (addedModal) {
            console.log('Modal found in DOM, display:', window.getComputedStyle(addedModal).display);
            console.log('Modal z-index:', window.getComputedStyle(addedModal).zIndex);
            console.log('Modal dimensions:', addedModal.offsetWidth, 'x', addedModal.offsetHeight);
        } else {
            console.error('Modal not found in DOM after adding!');
        }
        
        // Focus input with a small delay to ensure DOM is ready
        setTimeout(() => {
            const input = document.getElementById('teacherPinInput');
            if (input) {
                input.focus();
                console.log('PIN input focused');
                
                // Try clicking to ensure it's interactive
                input.click();
                
                // Additional check - if modal is not visible, use prompt as fallback
                const modalCheck = document.getElementById('teacherPinModal');
                if (!modalCheck || window.getComputedStyle(modalCheck).display === 'none') {
                    console.error('Modal not visible, using prompt fallback');
                    modal.remove();
                    this.showPinPrompt();
                }
            } else {
                console.error('Could not find PIN input element!');
                modal.remove();
                this.showPinPrompt();
            }
        }, 100);
        
        // Handle submit
        const submit = () => {
            const pinInput = document.getElementById('teacherPinInput');
            if (!pinInput) {
                console.error('PIN input not found during submit!');
                return;
            }
            
            const pin = pinInput.value;
            console.log('Validating PIN...');
            
            if (this.validatePin(pin)) {
                console.log('PIN correct!');
                this.onAuthSuccess();
                modal.remove();
            } else {
                console.log('PIN incorrect');
                this.attemptCount++;
                const errorMsg = document.getElementById('teacherPinError');
                
                if (this.attemptCount >= this.maxAttempts) {
                    this.lockoutTime = Date.now();
                    errorMsg.textContent = 'Too many attempts. Locked out for 5 minutes.';
                } else {
                    errorMsg.textContent = `Incorrect PIN. ${this.maxAttempts - this.attemptCount} attempts remaining.`;
                }
                
                errorMsg.style.display = 'block';
                pinInput.value = '';
                pinInput.focus();
            }
        };
        
        // Event listeners with error handling - use setTimeout to ensure DOM is ready
        setTimeout(() => {
            const submitBtn = document.getElementById('teacherPinSubmit');
            const cancelBtn = document.getElementById('teacherPinCancel');
            const pinInput = document.getElementById('teacherPinInput');
            
            if (submitBtn) {
                submitBtn.addEventListener('click', submit);
                console.log('Submit button listener attached');
            } else {
                console.error('Submit button not found!');
            }
            
            if (cancelBtn) {
                cancelBtn.addEventListener('click', () => {
                    console.log('Cancel button clicked');
                    modal.remove();
                });
                console.log('Cancel button listener attached');
            } else {
                console.error('Cancel button not found!');
            }
            
            if (pinInput) {
                pinInput.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        console.log('Enter key pressed');
                        submit();
                    }
                });
                
                // Only allow numbers
                pinInput.addEventListener('input', (e) => {
                    e.target.value = e.target.value.replace(/[^0-9]/g, '');
                });
                console.log('Input listeners attached');
            } else {
                console.error('PIN input not found!');
            }
        }, 150);
    }
    
    validatePin(pin) {
        // Simple comparison - in production, this should be hashed
        return pin === this.config.pin;
    }
    
    isLockedOut() {
        if (!this.lockoutTime) return false;
        // Lockout for 5 minutes
        return Date.now() - this.lockoutTime < 300000;
    }
    
    showPinPrompt() {
        console.log('Using fallback PIN prompt');
        const pin = prompt('Enter teacher PIN (default: 1234):');
        
        if (pin === null) {
            console.log('PIN entry cancelled');
            return;
        }
        
        if (this.validatePin(pin)) {
            console.log('PIN correct!');
            this.onAuthSuccess();
        } else {
            console.log('PIN incorrect');
            this.attemptCount++;
            
            if (this.attemptCount >= this.maxAttempts) {
                this.lockoutTime = Date.now();
                alert('Too many attempts. Locked out for 5 minutes.');
            } else {
                alert(`Incorrect PIN. ${this.maxAttempts - this.attemptCount} attempts remaining.`);
                // Try again
                setTimeout(() => this.showPinPrompt(), 100);
            }
        }
    }
    
    onAuthSuccess() {
        this.isAuthenticated = true;
        this.sessionStartTime = Date.now();
        this.attemptCount = 0;
        this.lockoutTime = null;
        
        console.log('🎓 Teacher authenticated successfully');
        
        // Start session timer
        this.startSessionTimer();
        
        // Navigate to teacher dashboard
        if (this.game.teacherDashboard) {
            this.game.teacherDashboard.show();
        } else {
            // Create dashboard if it doesn't exist
            this.game.teacherDashboard = new TeacherDashboard(this.game);
            this.game.teacherDashboard.show();
        }
    }
    
    startSessionTimer() {
        // Clear any existing timer
        if (this.sessionTimer) {
            clearInterval(this.sessionTimer);
        }
        
        // Check session every minute
        this.sessionTimer = setInterval(() => {
            if (this.isSessionExpired()) {
                this.logout();
                alert('Teacher session expired. Please log in again.');
            }
        }, 60000);
    }
    
    isSessionExpired() {
        if (!this.isAuthenticated || !this.sessionStartTime) return true;
        return Date.now() - this.sessionStartTime > this.sessionTimeout;
    }
    
    logout() {
        this.isAuthenticated = false;
        this.sessionStartTime = null;
        
        if (this.sessionTimer) {
            clearInterval(this.sessionTimer);
            this.sessionTimer = null;
        }
        
        // Hide teacher dashboard if visible
        if (this.game.teacherDashboard) {
            this.game.teacherDashboard.hide();
        }
        
        console.log('🎓 Teacher logged out');
    }
    
    checkAuth() {
        return this.isAuthenticated && !this.isSessionExpired();
    }
    
    changePin(newPin) {
        if (!this.checkAuth()) {
            console.error('Must be authenticated to change PIN');
            return false;
        }
        
        if (!/^\d{4}$/.test(newPin)) {
            console.error('PIN must be 4 digits');
            return false;
        }
        
        // Update config
        this.config.pin = newPin;
        this.config.lastChanged = new Date().toISOString();
        
        // Save to localStorage (since we can't write to teacher.json from browser)
        localStorage.setItem('alphahunters_teacher_pin', JSON.stringify({
            pin: newPin,
            lastChanged: this.config.lastChanged
        }));
        
        console.log('✅ PIN changed successfully and saved to localStorage');
        return true;
    }
}