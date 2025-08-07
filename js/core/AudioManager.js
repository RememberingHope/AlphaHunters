// Audio Manager for handling sound effects and music

class AudioManager {
    constructor() {
        // Audio context for advanced audio features
        this.audioContext = null;
        this.gainNode = null;
        
        // Audio settings
        this.masterVolume = 0.7;
        this.musicVolume = 0.5;
        this.sfxVolume = 0.8;
        this.voiceVolume = 1.0;
        
        // Audio state
        this.isEnabled = true;
        this.isMuted = false;
        this.currentMusic = null;
        
        // Audio cache
        this.audioCache = new Map();
        this.loadedAudio = new Map();
        
        // Voice synthesis for text-to-speech
        this.speechSynthesis = window.speechSynthesis;
        this.voiceOptions = {
            rate: 0.8,
            pitch: 1.2,
            volume: 1.0,
            lang: 'en-US'
        };
        
        this.init();
    }
    
    async init() {
        try {
            // Initialize Web Audio API
            await this.initWebAudio();
            
            // Skip audio asset loading for now (no audio files yet)
            console.log('Skipping audio asset preloading (no audio files)');
            
            // Setup voice synthesis
            this.initVoiceSynthesis();
            
            // AudioManager ready
        } catch (error) {
            console.warn('AudioManager initialization failed:', error);
            this.isEnabled = false;
        }
    }
    
    async initWebAudio() {
        try {
            // Create audio context
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.audioContext = new AudioContext();
            
            // Create master gain node
            this.gainNode = this.audioContext.createGain();
            this.gainNode.connect(this.audioContext.destination);
            this.gainNode.gain.value = this.masterVolume;
            
            // Handle audio context state
            if (this.audioContext.state === 'suspended') {
                // Audio context is suspended - will be resumed on first user interaction
                this.setupAudioResume();
            }
            
        } catch (error) {
            console.warn('Web Audio API not supported:', error);
            throw error;
        }
    }
    
    setupAudioResume() {
        const resumeAudio = async () => {
            if (this.audioContext && this.audioContext.state === 'suspended') {
                try {
                    await this.audioContext.resume();
                    console.log('Audio context resumed');
                } catch (error) {
                    console.warn('Failed to resume audio context:', error);
                }
            }
        };
        
        // Resume on any user interaction
        const events = ['click', 'touch', 'keydown'];
        const handleInteraction = () => {
            resumeAudio();
            events.forEach(event => {
                document.removeEventListener(event, handleInteraction);
            });
        };
        
        events.forEach(event => {
            document.addEventListener(event, handleInteraction, { once: true });
        });
    }
    
    preloadAudioAssets() {
        // Define audio assets to preload
        const audioAssets = {
            // SFX
            'start_ping': './audio/sfx/start_ping.mp3',
            'curve_chime': './audio/sfx/curve_chime.mp3',
            'perfect_fanfare': './audio/sfx/perfect_fanfare.mp3',
            'near_miss': './audio/sfx/near_miss.mp3',
            'orb_collect': './audio/sfx/orb_collect.mp3',
            'level_up': './audio/sfx/level_up.mp3',
            'button_click': './audio/sfx/button_click.mp3',
            
            // Music
            'background_music': './audio/music/background.mp3',
            'menu_music': './audio/music/menu.mp3'
        };
        
        // Load each audio asset asynchronously (don't block initialization)
        Object.entries(audioAssets).forEach(([name, url]) => {
            this.loadAudioAsset(name, url).catch(error => {
                console.warn(`Failed to preload audio: ${name}`, error);
            });
        });
        
        console.log('Audio preloading started (non-blocking)');
    }
    
    async loadAudioAsset(name, url) {
        try {
            const audio = new Audio();
            audio.preload = 'auto';
            audio.src = url;
            
            await new Promise((resolve, reject) => {
                const timeout = setTimeout(() => {
                    console.warn(`Audio loading timeout: ${name}`);
                    resolve(); // Continue even if audio fails to load
                }, 2000); // 2 second timeout
                
                audio.addEventListener('canplaythrough', () => {
                    clearTimeout(timeout);
                    resolve();
                }, { once: true });
                
                audio.addEventListener('error', () => {
                    clearTimeout(timeout);
                    console.warn(`Audio file not found: ${name} at ${url}`);
                    resolve(); // Don't reject, just continue without this audio
                }, { once: true });
                
                audio.load();
            });
            
            this.audioCache.set(name, url);
            this.loadedAudio.set(name, audio);
            
        } catch (error) {
            console.warn(`Failed to load audio asset: ${name}`, error);
        }
    }
    
    initVoiceSynthesis() {
        if (!this.speechSynthesis) {
            console.warn('Speech synthesis not supported');
            return;
        }
        
        // Wait for voices to load
        const loadVoices = () => {
            const voices = this.speechSynthesis.getVoices();
            
            // Try to find a child-friendly voice
            const preferredVoices = [
                'Google UK English Female',
                'Microsoft Zira Desktop',
                'Alex',
                'Samantha'
            ];
            
            let selectedVoice = null;
            for (const preferred of preferredVoices) {
                selectedVoice = voices.find(voice => voice.name.includes(preferred));
                if (selectedVoice) break;
            }
            
            // Fallback to first English voice
            if (!selectedVoice) {
                selectedVoice = voices.find(voice => voice.lang.startsWith('en'));
            }
            
            this.selectedVoice = selectedVoice;
            console.log('Selected voice:', selectedVoice?.name || 'Default');
        };
        
        if (this.speechSynthesis.getVoices().length > 0) {
            loadVoices();
        } else {
            this.speechSynthesis.addEventListener('voiceschanged', loadVoices, { once: true });
        }
    }
    
    // Sound effect methods
    playSFX(soundName, volume = 1.0) {
        if (!this.isEnabled || this.isMuted) return;
        
        const audio = this.loadedAudio.get(soundName);
        if (!audio) {
            // Sound effect not available - silently continue
            return;
        }
        
        try {
            // Clone audio for overlapping sounds
            const audioClone = audio.cloneNode();
            audioClone.volume = this.sfxVolume * volume;
            audioClone.play();
        } catch (error) {
            console.warn(`Failed to play sound: ${soundName}`, error);
        }
    }
    
    // Music methods
    playMusic(musicName, loop = true, fadeIn = true) {
        if (!this.isEnabled || this.isMuted) return;
        
        // Stop current music
        this.stopMusic();
        
        const audio = this.loadedAudio.get(musicName);
        if (!audio) {
            console.warn(`Music not found: ${musicName}`);
            return;
        }
        
        try {
            this.currentMusic = audio.cloneNode();
            this.currentMusic.loop = loop;
            this.currentMusic.volume = fadeIn ? 0 : this.musicVolume;
            
            this.currentMusic.play();
            
            if (fadeIn) {
                this.fadeInMusic();
            }
            
        } catch (error) {
            console.warn(`Failed to play music: ${musicName}`, error);
        }
    }
    
    stopMusic(fadeOut = true) {
        if (!this.currentMusic) return;
        
        if (fadeOut) {
            this.fadeOutMusic(() => {
                this.currentMusic = null;
            });
        } else {
            this.currentMusic.pause();
            this.currentMusic = null;
        }
    }
    
    fadeInMusic(duration = 1000) {
        if (!this.currentMusic) return;
        
        const steps = 20;
        const stepTime = duration / steps;
        const stepVolume = this.musicVolume / steps;
        let currentStep = 0;
        
        const fade = () => {
            if (!this.currentMusic || currentStep >= steps) return;
            
            this.currentMusic.volume = stepVolume * currentStep;
            currentStep++;
            
            setTimeout(fade, stepTime);
        };
        
        fade();
    }
    
    fadeOutMusic(onComplete, duration = 1000) {
        if (!this.currentMusic) {
            onComplete?.();
            return;
        }
        
        const startVolume = this.currentMusic.volume;
        const steps = 20;
        const stepTime = duration / steps;
        const stepVolume = startVolume / steps;
        let currentStep = 0;
        
        const fade = () => {
            if (!this.currentMusic || currentStep >= steps) {
                this.currentMusic?.pause();
                onComplete?.();
                return;
            }
            
            this.currentMusic.volume = startVolume - (stepVolume * currentStep);
            currentStep++;
            
            setTimeout(fade, stepTime);
        };
        
        fade();
    }
    
    // Voice synthesis methods
    speak(text, options = {}) {
        if (!this.speechSynthesis || !this.isEnabled || this.isMuted) {
            return;
        }
        
        // Cancel any ongoing speech
        this.speechSynthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(text);
        
        // Apply voice options
        utterance.rate = options.rate || this.voiceOptions.rate;
        utterance.pitch = options.pitch || this.voiceOptions.pitch;
        utterance.volume = (options.volume || this.voiceOptions.volume) * this.voiceVolume;
        utterance.lang = options.lang || this.voiceOptions.lang;
        
        if (this.selectedVoice) {
            utterance.voice = this.selectedVoice;
        }
        
        // Add event listeners
        utterance.onstart = () => {}; // Speech started
        utterance.onend = () => {}; // Speech ended
        utterance.onerror = (e) => {}; // Speech errors are expected when interrupted
        
        this.speechSynthesis.speak(utterance);
    }
    
    // Predefined voice prompts for the game
    sayEncouragement() {
        const encouragements = [
            "Great job!",
            "You're doing wonderful!",
            "Keep going!",
            "Fantastic!",
            "You're getting better!"
        ];
        
        const text = Utils.pickRandom(encouragements);
        this.speak(text, { pitch: 1.3, rate: 0.9 });
    }
    
    sayInstruction(instruction) {
        this.speak(instruction, { rate: 0.8, pitch: 1.1 });
    }
    
    sayLetterName(letter) {
        this.speak(`The letter ${letter}`, { rate: 0.7, pitch: 1.2 });
    }
    
    // Volume controls
    setMasterVolume(volume) {
        this.masterVolume = Utils.clamp(volume, 0, 1);
        if (this.gainNode) {
            this.gainNode.gain.value = this.masterVolume;
        }
    }
    
    setMusicVolume(volume) {
        this.musicVolume = Utils.clamp(volume, 0, 1);
        if (this.currentMusic) {
            this.currentMusic.volume = this.musicVolume;
        }
    }
    
    setSFXVolume(volume) {
        this.sfxVolume = Utils.clamp(volume, 0, 1);
    }
    
    setVoiceVolume(volume) {
        this.voiceVolume = Utils.clamp(volume, 0, 1);
    }
    
    // Mute controls
    mute() {
        this.isMuted = true;
        if (this.currentMusic) {
            this.currentMusic.volume = 0;
        }
        this.speechSynthesis?.cancel();
    }
    
    unmute() {
        this.isMuted = false;
        if (this.currentMusic) {
            this.currentMusic.volume = this.musicVolume;
        }
    }
    
    toggleMute() {
        if (this.isMuted) {
            this.unmute();
        } else {
            this.mute();
        }
        return this.isMuted;
    }
    
    // Game-specific audio methods
    playTraceStart() {
        this.playSFX('start_ping');
        this.speak("Start here", { rate: 0.8, pitch: 1.2 });
    }
    
    playTraceSuccess(score) {
        if (score >= 90) {
            this.playSFX('perfect_fanfare');
            this.speak("Perfect!", { pitch: 1.4 });
        } else if (score >= 70) {
            this.playSFX('curve_chime');
            this.speak("Great curve!", { pitch: 1.3 });
        } else {
            this.playSFX('near_miss');
            this.speak("Good try!", { pitch: 1.1 });
        }
    }
    
    playOrbCollect() {
        this.playSFX('orb_collect', 0.6);
    }
    
    playLevelUp() {
        this.playSFX('level_up');
        this.speak("Level up! Choose your upgrade!", { pitch: 1.3, rate: 0.9 });
    }
    
    playButtonClick() {
        this.playSFX('button_click', 0.4);
    }
    
    // Cleanup
    destroy() {
        this.stopMusic(false);
        this.speechSynthesis?.cancel();
        
        if (this.audioContext) {
            this.audioContext.close();
        }
        
        this.audioCache.clear();
        this.loadedAudio.clear();
    }
}