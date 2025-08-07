// Challenge Manager - Handles pen-and-paper challenges with in-game rewards
class ChallengeManager {
    constructor(game) {
        this.game = game;
        this.challenges = [];
        this.completedChallenges = new Set();
        this.activeChallenge = null;
        
        this.loadChallenges();
        this.loadCompletedChallenges();
    }
    
    loadChallenges() {
        const stored = localStorage.getItem('alphahunters_challenges');
        if (stored) {
            try {
                this.challenges = JSON.parse(stored);
                console.log('📋 Loaded challenges:', this.challenges.length);
            } catch (error) {
                console.error('Error loading challenges:', error);
                this.challenges = [];
            }
        }
    }
    
    loadCompletedChallenges() {
        const character = this.game.dataManager?.getCurrentCharacter();
        if (!character) return;
        
        const stored = localStorage.getItem(`alphahunters_completed_challenges_${character.id}`);
        if (stored) {
            try {
                this.completedChallenges = new Set(JSON.parse(stored));
            } catch (error) {
                console.error('Error loading completed challenges:', error);
                this.completedChallenges = new Set();
            }
        }
    }
    
    saveCompletedChallenges() {
        const character = this.game.dataManager?.getCurrentCharacter();
        if (!character) return;
        
        localStorage.setItem(
            `alphahunters_completed_challenges_${character.id}`,
            JSON.stringify(Array.from(this.completedChallenges))
        );
    }
    
    createChallenge(challengeData) {
        const challenge = {
            id: `challenge_${Date.now()}`,
            createdAt: new Date().toISOString(),
            ...challengeData
        };
        
        this.challenges.push(challenge);
        this.saveChallenges();
        
        console.log('✅ Challenge created:', challenge);
        return challenge;
    }
    
    saveChallenges() {
        localStorage.setItem('alphahunters_challenges', JSON.stringify(this.challenges));
    }
    
    getAvailableChallenges() {
        return this.challenges.filter(c => !this.completedChallenges.has(c.id));
    }
    
    getCompletedChallenges() {
        return this.challenges.filter(c => this.completedChallenges.has(c.id));
    }
    
    startChallenge(challengeId) {
        const challenge = this.challenges.find(c => c.id === challengeId);
        if (!challenge) {
            console.error('Challenge not found:', challengeId);
            return false;
        }
        
        if (this.completedChallenges.has(challengeId)) {
            console.warn('Challenge already completed:', challengeId);
            return false;
        }
        
        this.activeChallenge = challenge;
        this.showChallengeInstructions();
        return true;
    }
    
    showChallengeInstructions() {
        if (!this.activeChallenge) return;
        
        // Create instruction modal
        const modal = document.createElement('div');
        modal.id = 'challengeInstructionModal';
        modal.style.cssText = `
            position: fixed;
            top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0, 0, 0, 0.9);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 7000;
        `;
        
        modal.innerHTML = `
            <div style="
                background: white;
                max-width: 600px;
                width: 90%;
                padding: 40px;
                border-radius: 16px;
                text-align: center;
            ">
                <h2 style="color: #1976D2; margin-bottom: 20px;">
                    📝 ${this.activeChallenge.name}
                </h2>
                
                <div style="
                    background: #F5F5F5;
                    padding: 20px;
                    border-radius: 8px;
                    margin-bottom: 20px;
                    text-align: left;
                ">
                    <h3 style="color: #333; margin-bottom: 10px;">Instructions:</h3>
                    <p style="color: #666; white-space: pre-wrap; line-height: 1.6;">
                        ${this.activeChallenge.instructions}
                    </p>
                </div>
                
                <div style="
                    background: #E8F5E9;
                    padding: 15px;
                    border-radius: 8px;
                    margin-bottom: 20px;
                ">
                    <h4 style="color: #2E7D32; margin-bottom: 10px;">🎁 Rewards:</h4>
                    ${this.getRewardDisplay(this.activeChallenge.rewards)}
                </div>
                
                <p style="color: #666; margin-bottom: 20px;">
                    Complete this challenge with pen and paper, then click "I'm Done!" when finished.
                </p>
                
                <div style="display: flex; gap: 10px; justify-content: center;">
                    <button id="startChallengeBtn" style="
                        background: #4CAF50;
                        color: white;
                        border: none;
                        padding: 12px 30px;
                        border-radius: 8px;
                        font-size: 16px;
                        cursor: pointer;
                    ">Let's Start!</button>
                    
                    <button id="cancelChallengeBtn" style="
                        background: #f44336;
                        color: white;
                        border: none;
                        padding: 12px 30px;
                        border-radius: 8px;
                        font-size: 16px;
                        cursor: pointer;
                    ">Maybe Later</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Event listeners
        document.getElementById('startChallengeBtn').addEventListener('click', () => {
            modal.remove();
            this.showChallengeProgress();
        });
        
        document.getElementById('cancelChallengeBtn').addEventListener('click', () => {
            this.activeChallenge = null;
            modal.remove();
        });
    }
    
    showChallengeProgress() {
        if (!this.activeChallenge) return;
        
        // Create progress modal
        const modal = document.createElement('div');
        modal.id = 'challengeProgressModal';
        modal.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: white;
            padding: 20px;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.2);
            z-index: 6000;
            max-width: 300px;
        `;
        
        modal.innerHTML = `
            <h4 style="color: #1976D2; margin-bottom: 10px;">
                Working on: ${this.activeChallenge.name}
            </h4>
            <p style="color: #666; font-size: 14px; margin-bottom: 15px;">
                Complete your pen and paper work, then click below!
            </p>
            <button id="completeChallengeBtn" style="
                width: 100%;
                background: #4CAF50;
                color: white;
                border: none;
                padding: 10px;
                border-radius: 8px;
                font-size: 16px;
                cursor: pointer;
            ">✅ I'm Done!</button>
        `;
        
        document.body.appendChild(modal);
        
        document.getElementById('completeChallengeBtn').addEventListener('click', () => {
            modal.remove();
            this.showCompletionVerification();
        });
    }
    
    showCompletionVerification() {
        if (!this.activeChallenge) return;
        
        // Create PIN verification modal
        const modal = document.createElement('div');
        modal.id = 'challengeVerifyModal';
        modal.style.cssText = `
            position: fixed;
            top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0, 0, 0, 0.9);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 7000;
        `;
        
        modal.innerHTML = `
            <div style="
                background: white;
                max-width: 400px;
                width: 90%;
                padding: 40px;
                border-radius: 16px;
                text-align: center;
            ">
                <h2 style="color: #1976D2; margin-bottom: 20px;">
                    🎉 Challenge Complete?
                </h2>
                
                <p style="color: #666; margin-bottom: 20px;">
                    Have your teacher enter their PIN to verify completion and receive your rewards!
                </p>
                
                <button id="recordWorkBtn" style="
                    background: #2196F3;
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 8px;
                    font-size: 16px;
                    cursor: pointer;
                    margin-bottom: 20px;
                    display: block;
                    width: 200px;
                    margin: 0 auto 20px;
                ">📸 Record Work</button>
                
                <input type="password" id="verifyPinInput" placeholder="Teacher PIN" style="
                    width: 200px;
                    padding: 12px;
                    border: 2px solid #ddd;
                    border-radius: 8px;
                    font-size: 18px;
                    text-align: center;
                    margin-bottom: 20px;
                " maxlength="4" />
                
                <div style="display: flex; gap: 10px; justify-content: center;">
                    <button id="verifyBtn" style="
                        background: #4CAF50;
                        color: white;
                        border: none;
                        padding: 10px 20px;
                        border-radius: 8px;
                        font-size: 16px;
                        cursor: pointer;
                    ">Verify</button>
                    
                    <button id="cancelVerifyBtn" style="
                        background: #f44336;
                        color: white;
                        border: none;
                        padding: 10px 20px;
                        border-radius: 8px;
                        font-size: 16px;
                        cursor: pointer;
                    ">Cancel</button>
                </div>
                
                <p id="verifyError" style="
                    color: #f44336;
                    margin-top: 15px;
                    display: none;
                ">Incorrect PIN. Please try again.</p>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        const input = document.getElementById('verifyPinInput');
        input.focus();
        
        // Only allow numbers
        input.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/[^0-9]/g, '');
        });
        
        const verify = () => {
            const pin = input.value;
            if (this.game.teacherAuth?.validatePin(pin)) {
                modal.remove();
                this.completeChallenge();
            } else {
                document.getElementById('verifyError').style.display = 'block';
                input.value = '';
                input.focus();
            }
        };
        
        document.getElementById('verifyBtn').addEventListener('click', verify);
        document.getElementById('cancelVerifyBtn').addEventListener('click', () => {
            modal.remove();
            this.showChallengeProgress();
        });
        
        // Record work button
        document.getElementById('recordWorkBtn').addEventListener('click', () => {
            modal.remove();
            this.showCameraCapture();
        });
        
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') verify();
        });
    }
    
    showCameraCapture() {
        if (!this.activeChallenge) return;
        
        // Create camera modal
        const modal = document.createElement('div');
        modal.id = 'cameraModal';
        modal.style.cssText = `
            position: fixed;
            top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0, 0, 0, 0.9);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 7000;
        `;
        
        modal.innerHTML = `
            <div style="
                background: white;
                max-width: 600px;
                width: 90%;
                padding: 30px;
                border-radius: 16px;
                text-align: center;
            ">
                <h2 style="color: #1976D2; margin-bottom: 20px;">
                    📸 Take a Photo of Your Work
                </h2>
                
                <p style="color: #666; margin-bottom: 20px;">
                    Hold up your completed worksheet and take a photo!
                </p>
                
                <video id="cameraVideo" style="
                    width: 100%;
                    max-width: 500px;
                    border-radius: 8px;
                    margin-bottom: 20px;
                    display: none;
                    transform: scaleX(-1);
                " autoplay></video>
                
                <canvas id="photoCanvas" style="
                    width: 100%;
                    max-width: 500px;
                    border-radius: 8px;
                    margin-bottom: 20px;
                    display: none;
                "></canvas>
                
                <div id="cameraError" style="
                    color: #f44336;
                    padding: 20px;
                    display: none;
                    margin-bottom: 20px;
                ">
                    Camera access denied. Please allow camera access and try again.
                </div>
                
                <div id="cameraControls">
                    <button id="startCameraBtn" style="
                        background: #2196F3;
                        color: white;
                        border: none;
                        padding: 12px 30px;
                        border-radius: 8px;
                        font-size: 16px;
                        cursor: pointer;
                        margin: 5px;
                    ">📷 Start Camera</button>
                    
                    <button id="takePictureBtn" style="
                        background: #4CAF50;
                        color: white;
                        border: none;
                        padding: 12px 30px;
                        border-radius: 8px;
                        font-size: 16px;
                        cursor: pointer;
                        margin: 5px;
                        display: none;
                    ">📸 Take Picture</button>
                    
                    <button id="retakePictureBtn" style="
                        background: #FF9800;
                        color: white;
                        border: none;
                        padding: 12px 30px;
                        border-radius: 8px;
                        font-size: 16px;
                        cursor: pointer;
                        margin: 5px;
                        display: none;
                    ">🔄 Retake</button>
                    
                    <button id="confirmPictureBtn" style="
                        background: #4CAF50;
                        color: white;
                        border: none;
                        padding: 12px 30px;
                        border-radius: 8px;
                        font-size: 16px;
                        cursor: pointer;
                        margin: 5px;
                        display: none;
                    ">✅ Confirm</button>
                    
                    <button id="cancelCameraBtn" style="
                        background: #f44336;
                        color: white;
                        border: none;
                        padding: 12px 30px;
                        border-radius: 8px;
                        font-size: 16px;
                        cursor: pointer;
                        margin: 5px;
                    ">❌ Cancel</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        let stream = null;
        const video = document.getElementById('cameraVideo');
        const canvas = document.getElementById('photoCanvas');
        const ctx = canvas.getContext('2d');
        
        // Button handlers
        document.getElementById('startCameraBtn').addEventListener('click', async () => {
            try {
                stream = await navigator.mediaDevices.getUserMedia({ 
                    video: { 
                        facingMode: 'environment',
                        width: { ideal: 1280 },
                        height: { ideal: 720 }
                    } 
                });
                
                video.srcObject = stream;
                video.style.display = 'block';
                document.getElementById('startCameraBtn').style.display = 'none';
                document.getElementById('takePictureBtn').style.display = 'inline-block';
                document.getElementById('cameraError').style.display = 'none';
                
            } catch (error) {
                console.error('Camera access error:', error);
                document.getElementById('cameraError').style.display = 'block';
            }
        });
        
        document.getElementById('takePictureBtn').addEventListener('click', () => {
            // Set canvas size to video size
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            
            // Draw the video frame to canvas (without mirroring for the captured image)
            ctx.save();
            ctx.scale(-1, 1);
            ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
            ctx.restore();
            
            // Show canvas, hide video
            canvas.style.display = 'block';
            video.style.display = 'none';
            
            // Update buttons
            document.getElementById('takePictureBtn').style.display = 'none';
            document.getElementById('retakePictureBtn').style.display = 'inline-block';
            document.getElementById('confirmPictureBtn').style.display = 'inline-block';
        });
        
        document.getElementById('retakePictureBtn').addEventListener('click', () => {
            // Show video, hide canvas
            video.style.display = 'block';
            canvas.style.display = 'none';
            
            // Update buttons
            document.getElementById('takePictureBtn').style.display = 'inline-block';
            document.getElementById('retakePictureBtn').style.display = 'none';
            document.getElementById('confirmPictureBtn').style.display = 'none';
        });
        
        document.getElementById('confirmPictureBtn').addEventListener('click', () => {
            // Save the photo
            const photoData = canvas.toDataURL('image/jpeg', 0.8);
            this.saveChallengePhoto(photoData);
            
            // Clean up
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
            
            modal.remove();
            this.showCompletionVerification();
        });
        
        document.getElementById('cancelCameraBtn').addEventListener('click', () => {
            // Clean up camera
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
            
            modal.remove();
            this.showCompletionVerification();
        });
    }
    
    saveChallengePhoto(photoData) {
        if (!this.activeChallenge) return;
        
        const character = this.game.dataManager?.getCurrentCharacter();
        if (!character) return;
        
        // Initialize challenge photos array if needed
        if (!character.challengePhotos) {
            character.challengePhotos = [];
        }
        
        // Create photo record
        const photoRecord = {
            challengeId: this.activeChallenge.id,
            challengeName: this.activeChallenge.name,
            photoData: photoData,
            timestamp: Date.now(),
            verified: false
        };
        
        // Add to character's photos
        character.challengePhotos.push(photoRecord);
        
        // Keep only last 20 photos to manage storage
        if (character.challengePhotos.length > 20) {
            character.challengePhotos = character.challengePhotos.slice(-20);
        }
        
        // Save character data
        this.game.dataManager.markDirty();
        this.game.dataManager.save();
        
        console.log('📸 Challenge photo saved');
    }
    
    completeChallenge() {
        if (!this.activeChallenge) return;
        
        const challenge = this.activeChallenge;
        const rewards = challenge.rewards;
        
        // Mark as completed
        this.completedChallenges.add(challenge.id);
        this.saveCompletedChallenges();
        
        // Mark photo as verified if one was taken
        const character = this.game.dataManager?.getCurrentCharacter();
        if (character && character.challengePhotos) {
            // Find the most recent photo for this challenge
            const photoIndex = character.challengePhotos.findIndex(
                photo => photo.challengeId === challenge.id && !photo.verified
            );
            if (photoIndex !== -1) {
                character.challengePhotos[photoIndex].verified = true;
                character.challengePhotos[photoIndex].verifiedAt = Date.now();
                this.game.dataManager.markDirty();
            }
        }
        
        // Apply rewards
        if (character && rewards) {
            // Store initial values for animation
            const startXP = character.progression.xp;
            const startCoins = character.progression.coins;
            
            if (rewards.xp > 0) {
                this.game.dataManager.addXP(rewards.xp);
            }
            
            if (rewards.coins > 0) {
                this.game.dataManager.addCoins(rewards.coins);
            }
            
            if (rewards.skins && rewards.skins.length > 0) {
                // Unlock skins using DataManager
                rewards.skins.forEach(skin => {
                    this.game.dataManager.unlockSkin(skin);
                });
            }
            
            if (rewards.pets && rewards.pets.length > 0) {
                // Unlock pets (not yet implemented)
                rewards.pets.forEach(pet => {
                    if (this.game.dataManager.unlockPet) {
                        this.game.dataManager.unlockPet(pet);
                    } else {
                        console.log('🐾 Pet unlocking not yet implemented:', pet);
                    }
                });
            }
            
            // Show reward animation with counter animations
            this.showRewardAnimationWithCounters(rewards, startXP, startCoins);
        } else {
            // Show basic reward animation if no character
            this.showRewardAnimation(rewards);
        }
        
        // Clear active challenge
        this.activeChallenge = null;
        
        console.log('🎉 Challenge completed:', challenge.name);
    }
    
    showRewardAnimation(rewards) {
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0, 0, 0, 0.9);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 8000;
        `;
        
        modal.innerHTML = `
            <div style="
                background: white;
                padding: 40px;
                border-radius: 16px;
                text-align: center;
                animation: bounceIn 0.5s;
            ">
                <h1 style="color: #4CAF50; margin-bottom: 20px; font-size: 48px;">
                    🎉 Congratulations! 🎉
                </h1>
                
                <h2 style="color: #1976D2; margin-bottom: 20px;">
                    Challenge Completed!
                </h2>
                
                <div style="margin-bottom: 30px;">
                    ${this.getRewardDisplay(rewards)}
                </div>
                
                <button id="closeRewardBtn" style="
                    background: #4CAF50;
                    color: white;
                    border: none;
                    padding: 12px 30px;
                    border-radius: 8px;
                    font-size: 18px;
                    cursor: pointer;
                ">Awesome!</button>
            </div>
        `;
        
        // Add animation styles
        const style = document.createElement('style');
        style.textContent = `
            @keyframes bounceIn {
                0% { transform: scale(0.3); opacity: 0; }
                50% { transform: scale(1.05); }
                70% { transform: scale(0.9); }
                100% { transform: scale(1); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(modal);
        
        // Confetti effect
        this.createConfetti();
        
        document.getElementById('closeRewardBtn').addEventListener('click', () => {
            modal.remove();
            style.remove();
            // Refresh character screen if visible
            if (this.game.menuManager?.currentMenu === 'character') {
                this.game.menuManager.showMenu('character');
            }
        });
    }
    
    showRewardAnimationWithCounters(rewards, startXP, startCoins) {
        const character = this.game.dataManager?.getCurrentCharacter();
        const endXP = character?.progression.xp || startXP;
        const endCoins = character?.progression.coins || startCoins;
        
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0, 0, 0, 0.9);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 8000;
        `;
        
        const modalContent = document.createElement('div');
        modalContent.style.cssText = `
            background: white;
            padding: 40px;
            border-radius: 16px;
            text-align: center;
            animation: bounceIn 0.5s;
            max-width: 500px;
        `;
        
        modalContent.innerHTML = `
            <h1 style="color: #4CAF50; margin-bottom: 20px; font-size: 48px;">
                🎉 Congratulations! 🎉
            </h1>
            
            <h2 style="color: #1976D2; margin-bottom: 30px;">
                Challenge Completed!
            </h2>
            
            <div style="margin-bottom: 30px;">
                ${rewards.xp > 0 ? `
                    <div style="
                        background: #E3F2FD;
                        padding: 20px;
                        border-radius: 12px;
                        margin-bottom: 15px;
                    ">
                        <p style="font-size: 20px; color: #1976D2; margin-bottom: 10px;">
                            ⭐ Experience Points
                        </p>
                        <div style="font-size: 36px; font-weight: bold; color: #1565C0;">
                            <span id="xpCounter">${startXP}</span>
                            <span style="font-size: 24px; color: #4CAF50;"> +${rewards.xp}</span>
                        </div>
                    </div>
                ` : ''}
                
                ${rewards.coins > 0 ? `
                    <div style="
                        background: #FFF8E1;
                        padding: 20px;
                        border-radius: 12px;
                        margin-bottom: 15px;
                    ">
                        <p style="font-size: 20px; color: #F57C00; margin-bottom: 10px;">
                            🪙 Coins
                        </p>
                        <div style="font-size: 36px; font-weight: bold; color: #E65100;">
                            <span id="coinCounter">${startCoins}</span>
                            <span style="font-size: 24px; color: #4CAF50;"> +${rewards.coins}</span>
                        </div>
                    </div>
                ` : ''}
                
                ${rewards.skins && rewards.skins.length > 0 ? `
                    <div style="
                        background: #F3E5F5;
                        padding: 20px;
                        border-radius: 12px;
                        margin-bottom: 15px;
                    ">
                        <p style="font-size: 20px; color: #7B1FA2; margin-bottom: 10px;">
                            🎨 New Skins Unlocked!
                        </p>
                        <div style="
                            display: flex;
                            justify-content: center;
                            gap: 15px;
                            flex-wrap: wrap;
                            margin-top: 10px;
                        ">
                            ${rewards.skins.map(skin => `
                                <div style="
                                    font-size: 48px;
                                    padding: 10px;
                                    background: white;
                                    border-radius: 12px;
                                    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                                    animation: skinBounce 0.5s;
                                ">
                                    ${skin}
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
                
                ${rewards.pets && rewards.pets.length > 0 ? `
                    <div style="
                        background: #FFEBEE;
                        padding: 20px;
                        border-radius: 12px;
                    ">
                        <p style="font-size: 20px; color: #C62828;">
                            🐾 ${rewards.pets.length} New Pet${rewards.pets.length > 1 ? 's' : ''}!
                        </p>
                    </div>
                ` : ''}
            </div>
            
            <button id="closeRewardBtn" style="
                background: #4CAF50;
                color: white;
                border: none;
                padding: 12px 30px;
                border-radius: 8px;
                font-size: 18px;
                cursor: pointer;
                transform: scale(1);
                transition: transform 0.2s;
            ">Awesome!</button>
        `;
        
        modal.appendChild(modalContent);
        
        // Add animation styles
        const style = document.createElement('style');
        style.textContent = `
            @keyframes bounceIn {
                0% { transform: scale(0.3); opacity: 0; }
                50% { transform: scale(1.05); }
                70% { transform: scale(0.9); }
                100% { transform: scale(1); opacity: 1; }
            }
            @keyframes skinBounce {
                0% { transform: scale(0); }
                50% { transform: scale(1.2); }
                100% { transform: scale(1); }
            }
            #closeRewardBtn:hover {
                transform: scale(1.05) !important;
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(modal);
        
        // Animate counters after a short delay
        setTimeout(() => {
            // Animate XP counter
            if (rewards.xp > 0) {
                this.animateCounter('xpCounter', startXP, endXP, 1500);
            }
            
            // Animate coin counter
            if (rewards.coins > 0) {
                this.animateCounter('coinCounter', startCoins, endCoins, 1500);
            }
        }, 500);
        
        // Confetti effect
        this.createConfetti();
        
        document.getElementById('closeRewardBtn').addEventListener('click', () => {
            modal.remove();
            style.remove();
            // Refresh character screen if visible
            if (this.game.menuManager?.currentMenu === 'character') {
                this.game.menuManager.showMenu('character');
            }
        });
    }
    
    animateCounter(elementId, start, end, duration) {
        const element = document.getElementById(elementId);
        if (!element) return;
        
        const range = end - start;
        const increment = range / (duration / 16); // 60fps
        let current = start;
        
        const timer = setInterval(() => {
            current += increment;
            if (current >= end) {
                current = end;
                clearInterval(timer);
            }
            element.textContent = Math.floor(current);
        }, 16);
    }
    
    getRewardDisplay(rewards) {
        const items = [];
        
        if (rewards.xp > 0) {
            items.push(`<p style="font-size: 20px; color: #1976D2;">⭐ ${rewards.xp} XP</p>`);
        }
        
        if (rewards.coins > 0) {
            items.push(`<p style="font-size: 20px; color: #FFC107;">🪙 ${rewards.coins} Coins</p>`);
        }
        
        if (rewards.skins && rewards.skins.length > 0) {
            items.push(`<p style="font-size: 20px; color: #9C27B0;">👕 ${rewards.skins.length} New Skins</p>`);
        }
        
        if (rewards.pets && rewards.pets.length > 0) {
            items.push(`<p style="font-size: 20px; color: #FF5722;">🐾 ${rewards.pets.length} New Pets</p>`);
        }
        
        return items.join('');
    }
    
    createConfetti() {
        const colors = ['#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', 
                       '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4caf50'];
        
        for (let i = 0; i < 50; i++) {
            const confetti = document.createElement('div');
            confetti.style.cssText = `
                position: fixed;
                width: 10px;
                height: 10px;
                background: ${colors[Math.floor(Math.random() * colors.length)]};
                left: ${Math.random() * 100}%;
                top: -10px;
                opacity: ${0.5 + Math.random() * 0.5};
                transform: rotate(${Math.random() * 360}deg);
                animation: confettiFall ${2 + Math.random() * 2}s linear;
                z-index: 8001;
            `;
            document.body.appendChild(confetti);
            
            setTimeout(() => confetti.remove(), 4000);
        }
        
        // Add animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes confettiFall {
                to {
                    top: 100%;
                    transform: rotate(${Math.random() * 720}deg);
                }
            }
        `;
        document.head.appendChild(style);
        setTimeout(() => style.remove(), 5000);
    }
    
    deleteChallenge(challengeId) {
        this.challenges = this.challenges.filter(c => c.id !== challengeId);
        this.saveChallenges();
        console.log('🗑️ Challenge deleted:', challengeId);
    }
    
    editChallenge(challengeId, updates) {
        const index = this.challenges.findIndex(c => c.id === challengeId);
        if (index !== -1) {
            this.challenges[index] = { ...this.challenges[index], ...updates };
            this.saveChallenges();
            console.log('✏️ Challenge updated:', challengeId);
            return true;
        }
        return false;
    }
}