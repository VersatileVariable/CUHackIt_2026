/**
 * ClearPath Quest Compatibility Layer
 * Provides fallbacks and alternatives for Meta Quest browser limitations
 */

(function() {
    'use strict';

    // Browser detection and capability checks
    const browserInfo = {
        isQuest: /Quest|VR/i.test(navigator.userAgent),
        isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
        supportsWebSpeech: !!(window.SpeechRecognition || window.webkitSpeechRecognition),
        supportsWebAudio: !!(window.AudioContext || window.webkitAudioContext),
        supportsGetUserMedia: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)
    };

    console.log('Browser Detection:', browserInfo);

    // Quest-specific configuration adjustments
    const questConfig = {
        // Simplified audio processing for Quest
        audioSettings: {
            sampleRate: 22050,           // Lower sample rate for better performance
            fftSize: 256,                // Smaller FFT for Quest
            bufferSize: 128,             // Smaller buffer size
            updateInterval: 100          // Less frequent updates (10fps instead of 60fps)
        },
        
        // Alternative caption methods
        captionSettings: {
            simulatedCaptions: true,     // Enable simulated captions for Quest
            keywordTriggers: [           // Keywords that trigger caption simulation
                'hello', 'help', 'stop', 'emergency', 'alarm', 'car', 'music'
            ],
            updateRate: 500              // Update every 500ms instead of real-time
        },
        
        // Simplified haptic feedback patterns
        hapticSettings: {
            speechPattern: 'PULSE_SHORT',
            soundPattern: 'PULSE_LONG',
            alertPattern: 'PULSE_RAPID'
        }
    };

    // Alternative Speech Recognition using Simulated Input
    function createQuestSpeechRecognition() {
        return {
            // Simulated speech recognition for Quest
            start: function() {
                console.log('Starting Quest-compatible speech simulation...');
                
                // More realistic simulated phrases for accessibility demo
                const simulatedPhrases = [
                    "Hello, can you hear me?",
                    "The meeting starts in five minutes",
                    "Please turn left at the next intersection",
                    "Your appointment is confirmed for tomorrow",
                    "There's a fire alarm test happening now",
                    "The presentation slides are ready",
                    "Would you like some coffee?",
                    "The bus is arriving soon",
                    "Please check your email for the update",
                    "Thank you for your attention"
                ];
                
                let phraseIndex = 0;
                const speechSimulator = setInterval(() => {
                    if (this.onresult && phraseIndex < simulatedPhrases.length) {
                        const phrase = simulatedPhrases[phraseIndex];
                        
                        // Create mock speech recognition event
                        const mockEvent = {
                            results: [{
                                0: {
                                    transcript: phrase,
                                    confidence: 0.85 + Math.random() * 0.15  // 0.85-1.0 confidence
                                },
                                isFinal: true
                            }],
                            resultIndex: 0
                        };
                        
                        console.log(`Simulated speech: "${phrase}"`);
                        this.onresult(mockEvent);
                        phraseIndex++;
                    } else {
                        // Loop back to start after all phrases
                        phraseIndex = 0;
                    }
                }, 4000); // New phrase every 4 seconds
                
                if (this.onstart) this.onstart();
                
                // Store interval ID for cleanup
                this._simulationInterval = speechSimulator;
                return true;
            },
            
            stop: function() {
                if (this._simulationInterval) {
                    clearInterval(this._simulationInterval);
                    this._simulationInterval = null;
                }
                if (this.onend) this.onend();
            },
            
            // Event handler properties
            onstart: null,
            onend: null,
            onerror: null,
            onresult: null,
            
            // Configuration properties
            continuous: true,
            interimResults: true,
            lang: 'en-US'
        };
    }

    // Alternative Audio Direction Detection for Quest
    function createQuestAudioDirection() {
        let isActive = false;
        let simulationInterval = null;
        
        return {
            init: async function() {
                console.log('Initializing Quest-compatible audio direction...');
                
                // Check if we can at least get basic microphone access
                try {
                    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                        // Try to get permission without actually using the stream
                        const stream = await navigator.mediaDevices.getUserMedia({ 
                            audio: { echoCancellation: true, noiseSuppression: true }
                        });
                        
                        // Immediately stop the stream - we just wanted permission
                        stream.getTracks().forEach(track => track.stop());
                        console.log('Microphone access granted');
                        
                        return true;
                    }
                } catch (error) {
                    console.warn('Microphone access limited:', error.message);
                }
                
                // Fallback to simulated audio direction
                console.log('Using simulated audio direction for Quest');
                return true;
            },
            
            start: function() {
                if (isActive) return true;
                
                isActive = true;
                console.log('Starting Quest audio direction simulation...');
                
                // Simulate directional audio events
                const directions = ['LEFT', 'RIGHT', 'FRONT', 'BACK'];
                const soundTypes = ['speech', 'environmental', 'alert'];
                
                simulationInterval = setInterval(() => {
                    if (!isActive) return;
                    
                    // Randomly simulate audio events
                    if (Math.random() > 0.7) { // 30% chance per interval
                        const direction = directions[Math.floor(Math.random() * directions.length)];
                        const soundType = soundTypes[Math.floor(Math.random() * soundTypes.length)];
                        const intensity = 0.3 + Math.random() * 0.7; // 0.3-1.0 intensity
                        
                        // Trigger directional glow
                        if (window.updateDirectionalGlow) {
                            window.updateDirectionalGlow(direction.toLowerCase(), intensity, soundType);
                        }
                        
                        console.log(`Simulated audio: ${direction} ${soundType} (${intensity.toFixed(2)})`);
                    }
                }, questConfig.audioSettings.updateInterval * 5); // Check every 500ms
                
                return true;
            },
            
            stop: function() {
                isActive = false;
                if (simulationInterval) {
                    clearInterval(simulationInterval);
                    simulationInterval = null;
                }
                console.log('Quest audio direction stopped');
            },
            
            isActive: () => isActive
        };
    }

    // Quest-optimized caption display with larger, more visible text
    function enhanceCaptionsForQuest() {
        const style = document.createElement('style');
        style.textContent = `
            .ar-caption {
                font-size: 24px !important;
                font-weight: bold !important;
                background: rgba(0, 0, 0, 0.8) !important;
                padding: 15px 25px !important;
                border-radius: 10px !important;
                border: 2px solid #00ff00 !important;
                box-shadow: 0 0 20px rgba(0, 255, 0, 0.5) !important;
                max-width: 80% !important;
                text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8) !important;
            }
            
            .directional-glow {
                opacity: 0.9 !important;
                filter: blur(3px) !important;
                animation-duration: 2s !important;
            }
            
            .quest-optimized .status-panel {
                font-size: 18px !important;
                background: rgba(0, 0, 0, 0.9) !important;
                padding: 20px !important;
                border-radius: 10px !important;
            }
        `;
        document.head.appendChild(style);
        document.body.classList.add('quest-optimized');
        console.log('Quest-optimized UI styles applied');
    }

    // Initialize Quest compatibility layer
    function initQuestCompatibility() {
        console.log('Initializing Quest compatibility layer...');
        
        // Apply Quest-specific UI enhancements
        enhanceCaptionsForQuest();
        
        // Note: Demo mode disabled - real microphone required
        // Quest users must enable microphone permissions for live captions
        if (browserInfo.isQuest) {
            console.log('Quest detected - real speech recognition will be used');
            showQuestMicrophoneRequirement();
        }
        
        // Note: Audio direction requires microphone access for real directional detection
        // Demo mode disabled - system will use actual microphone input
        if (browserInfo.isQuest && !browserInfo.supportsWebAudio) {
            console.log('Quest Web Audio API limited - directional audio may not work');
        }
        
        // Global Quest utilities
        window.questCompat = {
            browserInfo,
            questConfig,
            isQuestMode: () => browserInfo.isQuest,
            getOptimalSettings: () => questConfig,
            showQuestStatus: function() {
                const statusText = `Quest Mode: ${browserInfo.isQuest ? 'Active' : 'Inactive'}
WebSpeech: ${browserInfo.supportsWebSpeech ? 'Supported' : 'Using Fallback'}
WebAudio: ${browserInfo.supportsWebAudio ? 'Supported' : 'Using Fallback'}
MediaDevices: ${browserInfo.supportsGetUserMedia ? 'Supported' : 'Limited'}`;
                
                console.log('Quest Compatibility Status:\n', statusText);
                return statusText;
            }
        };
        
        console.log('Quest compatibility layer initialized');
        window.questCompat.showQuestStatus();
    }
    
    // Show microphone requirement for Quest users
    function showQuestMicrophoneRequirement() {
        const welcomeDiv = document.createElement('div');
        welcomeDiv.id = 'quest-microphone-requirement';
        welcomeDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(135deg, rgba(0, 100, 255, 0.95), rgba(0, 200, 150, 0.95));
            color: white;
            padding: 30px 40px;
            border-radius: 15px;
            font-size: 18px;
            font-weight: bold;
            z-index: 10001;
            text-align: center;
            max-width: 500px;
            box-shadow: 0 8px 30px rgba(0,0,0,0.5);
        `;
        welcomeDiv.innerHTML = `
            <div style="font-size: 24px; margin-bottom: 15px;">ClearPath on Meta Quest 3</div>
            <div style="font-size: 16px; font-weight: normal; line-height: 1.6; margin-bottom: 20px;">
                <strong>Microphone Access Required</strong><br><br>
                ClearPath uses LIVE speech recognition to create real-time captions.
                <br><br>
                <strong>Before starting:</strong><br>
                1. Allow microphone when prompted<br>
                2. Speak clearly near the Quest's built-in mic<br>
                3. Speech will be transcribed in real-time<br><br>
                <strong>Features:</strong><br>
                • Live speech-to-text captions<br>
                • Directional sound visualization<br>
                • AI topic summaries<br>
                • Haptic feedback via belt clip
            </div>
            <div style="font-size: 13px; font-weight: normal; margin-top: 15px; padding: 12px; background: rgba(0,0,0,0.3); border-radius: 8px;">
                Tip: If microphone permission is denied, go to Quest Browser Settings → Site Settings → Permissions and enable Microphone.
            </div>
            <button onclick="this.parentElement.remove()" style="
                margin-top: 20px;
                padding: 12px 30px;
                background: white;
                color: #0064ff;
                border: none;
                border-radius: 8px;
                font-weight: bold;
                font-size: 16px;
                cursor: pointer;
                box-shadow: 0 2px 8px rgba(0,0,0,0.2);
            ">I Understand - Continue</button>
        `;
        document.body.appendChild(welcomeDiv);
    }

    // Auto-initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initQuestCompatibility);
    } else {
        initQuestCompatibility();
    }

    // Export for manual initialization
    window.initQuestCompatibility = initQuestCompatibility;

})();