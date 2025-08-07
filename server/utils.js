// Emoji sets for room codes - fun and easy to remember
const EMOJI_SETS = {
    animals: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔', '🐧', '🐦', '🐤', '🦆', '🦅', '🦉', '🦇', '🐺', '🐗', '🐴', '🦄', '🐝', '🐛', '🦋', '🐌', '🐞', '🐜', '🦟', '🦗', '🦂', '🐢', '🐍', '🦎', '🦖', '🦕', '🐙', '🦑', '🦐', '🦞', '🦀', '🐡', '🐠', '🐟', '🐬', '🐳', '🐋', '🦈', '🐊', '🐆', '🦓', '🦍', '🦧', '🐘', '🦛', '🦏', '🐪', '🐫', '🦒', '🦘', '🐃', '🐂', '🐄', '🐎', '🐖', '🐏', '🐑', '🦙', '🐐', '🦌', '🐕', '🐩', '🦮', '🐈', '🐓', '🦃', '🦚', '🦜', '🦢', '🦩', '🕊️', '🐇', '🦝', '🦨', '🦡', '🦦', '🦥', '🐁', '🐀', '🐿️', '🦔'],
    food: ['🍎', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🍆', '🥑', '🥦', '🥬', '🥒', '🌶️', '🌽', '🥕', '🥔', '🍠', '🥐', '🥖', '🥨', '🧀', '🥚', '🍳', '🥓', '🥩', '🍗', '🍖', '🌭', '🍔', '🍟', '🍕', '🥙', '🌮', '🌯', '🥗', '🥘', '🍝', '🍜', '🍲', '🍛', '🍣', '🍱', '🍤', '🍙', '🍚', '🍘', '🍥', '🥠', '🍢', '🍡', '🍧', '🍨', '🍦', '🥧', '🧁', '🍰', '🎂', '🍮', '🍭', '🍬', '🍫', '🍿', '🍩', '🍪', '🌰', '🥜', '🍯', '🥛', '🍼', '☕', '🍵', '🥤', '🍶', '🍺', '🍻', '🥂', '🍷', '🥃', '🍸', '🍹', '🍾', '🧃', '🧉', '🧊'],
    objects: ['⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🥏', '🎱', '🪀', '🏓', '🏸', '🏒', '🏑', '🥍', '🏏', '🪃', '🥅', '⛳', '🪁', '🏹', '🎣', '🤿', '🥊', '🥋', '🎽', '🛹', '🛼', '🛷', '⛸️', '🥌', '🎿', '⛷️', '🏂', '🪂', '🏋️', '🤼', '🤸', '⛹️', '🤺', '🤾', '🏌️', '🏇', '🧘', '🏄', '🏊', '🤽', '🚣', '🧗', '🚴', '🚵', '🎪', '🎭', '🎨', '🎬', '🎤', '🎧', '🎼', '🎹', '🥁', '🎷', '🎺', '🎸', '🪕', '🎻', '🎲', '♟️', '🎯', '🎳', '🎮', '🎰', '🧩'],
    nature: ['🌵', '🎄', '🌲', '🌳', '🌴', '🌱', '🌿', '☘️', '🍀', '🎍', '🎋', '🍃', '🍂', '🍁', '🍄', '🐚', '🌾', '💐', '🌷', '🌹', '🥀', '🌺', '🌸', '🌼', '🌻', '🌞', '🌝', '🌛', '🌜', '🌚', '🌕', '🌖', '🌗', '🌘', '🌑', '🌒', '🌓', '🌔', '🌙', '🌎', '🌍', '🌏', '💫', '⭐', '🌟', '✨', '⚡', '☄️', '💥', '🔥', '🌪️', '🌈', '☀️', '🌤️', '⛅', '🌥️', '☁️', '🌦️', '🌧️', '⛈️', '🌩️', '🌨️', '❄️', '☃️', '⛄', '🌬️', '💨', '💧', '💦', '☔', '🌊', '🌫️'],
    symbols: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '☮️', '✝️', '☪️', '🕉️', '☸️', '✡️', '🔯', '🕎', '☯️', '☦️', '🛐', '⛎', '♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓', '🆔', '⚛️', '🉑', '☢️', '☣️', '📴', '📳', '🈶', '🈚', '🈸', '🈺', '🈷️', '✴️', '🆚', '💮', '🉐', '㊙️', '㊗️', '🈴', '🈵', '🈹', '🈲', '🅰️', '🅱️', '🆎', '🆑', '🅾️', '🆘', '❌', '⭕', '🛑', '⛔', '📛', '🚫', '💯', '💢', '♨️', '🚷', '🚯', '🚳', '🚱', '🔞', '📵', '🚭', '❗', '❕', '❓', '❔', '‼️', '⁉️', '🔅', '🔆', '〽️', '⚠️', '🚸', '🔱', '⚜️', '🔰', '♻️', '✅', '🈯', '💹', '❇️', '✳️', '❎', '🌐', '💠', 'Ⓜ️', '🌀', '💤', '🏧', '🚾', '♿', '🅿️', '🈳', '🈂️', '🛂', '🛃', '🛄', '🛅', '🚹', '🚺', '🚼', '🚻', '🚮', '🎦', '📶', '🈁', '🔣', 'ℹ️', '🔤', '🔡', '🔠', '🆖', '🆗', '🆙', '🆒', '🆕', '🆓', '0️⃣', '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟']
};

// Combine all emoji sets for room codes
const ALL_EMOJIS = [
    ...EMOJI_SETS.animals,
    ...EMOJI_SETS.food,
    ...EMOJI_SETS.objects,
    ...EMOJI_SETS.nature,
    ...EMOJI_SETS.symbols
];

// Store used room codes to avoid duplicates
const usedRoomCodes = new Set();

/**
 * Generate a unique room code using 3 random emojis
 * @returns {string} Room code like "🐶🍕⚽"
 */
function generateRoomCode() {
    let attempts = 0;
    const maxAttempts = 100;
    
    while (attempts < maxAttempts) {
        // Pick 3 random emojis
        const emojis = [];
        for (let i = 0; i < 3; i++) {
            const randomIndex = Math.floor(Math.random() * ALL_EMOJIS.length);
            emojis.push(ALL_EMOJIS[randomIndex]);
        }
        
        const roomCode = emojis.join('');
        
        // Check if this code is already in use
        if (!usedRoomCodes.has(roomCode)) {
            usedRoomCodes.add(roomCode);
            
            // Clean up old codes after 2 hours
            setTimeout(() => {
                usedRoomCodes.delete(roomCode);
            }, 2 * 60 * 60 * 1000);
            
            return roomCode;
        }
        
        attempts++;
    }
    
    // Fallback: add random number if can't find unique emoji combo
    const fallbackEmojis = [];
    for (let i = 0; i < 2; i++) {
        const randomIndex = Math.floor(Math.random() * ALL_EMOJIS.length);
        fallbackEmojis.push(ALL_EMOJIS[randomIndex]);
    }
    const randomNum = Math.floor(Math.random() * 10);
    return fallbackEmojis.join('') + randomNum + '️⃣';
}

/**
 * Validate a room code
 * @param {string} code - Room code to validate
 * @returns {boolean} True if valid
 */
function isValidRoomCode(code) {
    // Room codes should be exactly 3 emojis
    // This is a simple check - in production you'd want more robust validation
    return code && code.length >= 3 && code.length <= 12; // Emojis can be 1-4 chars each
}

/**
 * Format room code for display
 * @param {string} code - Room code
 * @returns {string} Formatted code with spaces
 */
function formatRoomCode(code) {
    // Try to split emojis (this is approximate as emoji detection is complex)
    const emojis = code.match(/(\p{Emoji_Presentation}|\p{Emoji}\uFE0F)/gu);
    return emojis ? emojis.join(' ') : code;
}

/**
 * Get a themed emoji set for special occasions
 * @param {string} theme - Theme name
 * @returns {string[]} Array of emojis
 */
function getThemedEmojis(theme) {
    switch (theme) {
        case 'halloween':
            return ['🎃', '👻', '🦇', '🕷️', '🕸️', '🧙', '🧛', '🧟', '💀', '☠️', '🌙', '⚰️', '🪦', '🍬', '🍭'];
        case 'christmas':
            return ['🎄', '🎅', '🤶', '🎁', '🔔', '❄️', '☃️', '⛄', '🦌', '🛷', '⭐', '🌟', '🎶', '🍪', '🥛'];
        case 'summer':
            return ['☀️', '🌞', '🏖️', '🏝️', '🌊', '🏄', '🤿', '🩱', '🩳', '🕶️', '🍉', '🍹', '🌺', '🌴', '🦩'];
        case 'space':
            return ['🚀', '🛸', '🌌', '🌠', '☄️', '🌟', '⭐', '🌙', '🌎', '🪐', '👽', '👾', '🛰️', '🔭', '✨'];
        default:
            return ALL_EMOJIS;
    }
}

module.exports = {
    generateRoomCode,
    isValidRoomCode,
    formatRoomCode,
    getThemedEmojis,
    EMOJI_SETS,
    ALL_EMOJIS
};