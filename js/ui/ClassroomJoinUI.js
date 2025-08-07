// Classroom Join UI - Simple interface for students to join a classroom
class ClassroomJoinUI {
    constructor(game) {
        this.game = game;
        this.modal = null;
    }
    
    showJoinDialog() {
        // Create modal overlay
        this.modal = document.createElement('div');
        this.modal.className = 'classroom-join-modal';
        this.modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
        `;
        
        // Create dialog box
        const dialog = document.createElement('div');
        dialog.style.cssText = `
            background: white;
            border-radius: 20px;
            padding: 40px;
            max-width: 400px;
            text-align: center;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
            font-family: 'Comic Sans MS', cursive;
        `;
        
        // Check if already in a classroom
        const currentClassroom = this.game.classroomManager?.getClassroomCode();
        
        dialog.innerHTML = `
            <h2 style="margin: 0 0 20px 0; color: #333;">
                ${currentClassroom ? '📚 Classroom Settings' : '📚 Join a Classroom'}
            </h2>
            
            ${currentClassroom ? `
                <div style="margin-bottom: 20px; padding: 20px; background: #e8f5e9; border-radius: 10px;">
                    <p style="margin: 0 0 10px 0; color: #2e7d32;">You are currently in classroom:</p>
                    <h3 style="margin: 0; color: #2e7d32;">${currentClassroom}</h3>
                </div>
                
                <button onclick="game.classroomJoinUI.leaveClassroom()" style="
                    background: #f44336;
                    color: white;
                    border: none;
                    padding: 12px 24px;
                    border-radius: 8px;
                    font-size: 16px;
                    cursor: pointer;
                    margin-bottom: 15px;
                ">
                    Leave Classroom
                </button>
                
                <p style="color: #666; font-size: 14px; margin: 20px 0;">
                    Or join a different classroom:
                </p>
            ` : `
                <p style="color: #666; margin-bottom: 20px;">
                    Enter the classroom code from your teacher:
                </p>
            `}
            
            <input 
                type="text" 
                id="classroomCodeInput" 
                placeholder="Enter Code (e.g., MATH101)"
                maxlength="8"
                style="
                    width: 100%;
                    padding: 15px;
                    font-size: 20px;
                    text-align: center;
                    border: 3px solid #ddd;
                    border-radius: 10px;
                    margin-bottom: 20px;
                    text-transform: uppercase;
                    letter-spacing: 2px;
                    box-sizing: border-box;
                "
                onkeypress="if(event.key === 'Enter') game.classroomJoinUI.joinClassroom()"
            />
            
            <div id="classroomError" style="
                color: #f44336;
                margin-bottom: 15px;
                display: none;
                font-size: 14px;
            "></div>
            
            <div style="display: flex; gap: 10px; justify-content: center;">
                <button onclick="game.classroomJoinUI.joinClassroom()" style="
                    background: #4CAF50;
                    color: white;
                    border: none;
                    padding: 15px 30px;
                    border-radius: 8px;
                    font-size: 18px;
                    cursor: pointer;
                    font-weight: bold;
                ">
                    Join Classroom
                </button>
                
                <button onclick="game.classroomJoinUI.closeDialog()" style="
                    background: #9e9e9e;
                    color: white;
                    border: none;
                    padding: 15px 30px;
                    border-radius: 8px;
                    font-size: 18px;
                    cursor: pointer;
                ">
                    Cancel
                </button>
            </div>
            
            ${!currentClassroom ? `
                <p style="color: #999; font-size: 12px; margin-top: 20px;">
                    You only need to enter this code once. The game will remember your classroom.
                </p>
            ` : ''}
        `;
        
        this.modal.appendChild(dialog);
        document.body.appendChild(this.modal);
        
        // Focus input
        setTimeout(() => {
            const input = document.getElementById('classroomCodeInput');
            if (input) input.focus();
        }, 100);
        
        // Convert input to uppercase
        const input = document.getElementById('classroomCodeInput');
        if (input) {
            input.addEventListener('input', (e) => {
                e.target.value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
            });
        }
    }
    
    async joinClassroom() {
        const input = document.getElementById('classroomCodeInput');
        const errorDiv = document.getElementById('classroomError');
        
        if (!input) return;
        
        const code = input.value.trim();
        
        // Validate code
        if (!code) {
            this.showError('Please enter a classroom code');
            return;
        }
        
        if (code.length < 4) {
            this.showError('Classroom code must be at least 4 characters');
            return;
        }
        
        try {
            // Disable button during join
            const buttons = this.modal.querySelectorAll('button');
            buttons.forEach(btn => btn.disabled = true);
            
            // Get student name
            const studentName = this.game.dataManager?.getCurrentCharacter()?.identity?.name || 'Student';
            
            // Join classroom
            await this.game.classroomManager.joinClassroom(code, studentName);
            
            // Show success
            this.showSuccess(code);
            
            // Close after delay
            setTimeout(() => {
                this.closeDialog();
            }, 2000);
            
        } catch (error) {
            this.showError(error.message || 'Failed to join classroom');
            
            // Re-enable buttons
            const buttons = this.modal.querySelectorAll('button');
            buttons.forEach(btn => btn.disabled = false);
        }
    }
    
    leaveClassroom() {
        if (confirm('Are you sure you want to leave this classroom?')) {
            this.game.classroomManager.leaveClassroom();
            this.closeDialog();
            
            // Show confirmation
            const notification = document.createElement('div');
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                left: 50%;
                transform: translateX(-50%);
                background: #f44336;
                color: white;
                padding: 15px 25px;
                border-radius: 10px;
                font-size: 16px;
                z-index: 10001;
                animation: slideDown 0.3s ease-out;
            `;
            notification.textContent = 'Left classroom successfully';
            document.body.appendChild(notification);
            
            setTimeout(() => {
                notification.remove();
            }, 3000);
        }
    }
    
    showError(message) {
        const errorDiv = document.getElementById('classroomError');
        if (errorDiv) {
            errorDiv.textContent = message;
            errorDiv.style.display = 'block';
        }
    }
    
    showSuccess(code) {
        const dialog = this.modal.querySelector('div');
        if (dialog) {
            dialog.innerHTML = `
                <div style="padding: 40px;">
                    <div style="font-size: 64px; margin-bottom: 20px;">✅</div>
                    <h2 style="color: #4CAF50; margin: 0 0 10px 0;">Success!</h2>
                    <p style="color: #666; font-size: 18px;">
                        You've joined classroom<br>
                        <strong style="font-size: 24px; color: #333;">${code}</strong>
                    </p>
                </div>
            `;
        }
    }
    
    closeDialog() {
        if (this.modal) {
            this.modal.remove();
            this.modal = null;
        }
    }
}