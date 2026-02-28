/**
 * ClearPath Speech Recognition Module
 * Handles Web Speech API integration for real-time captions
 * Designed for Meta Quest 3 browser compatibility
 */

(function() {
    'use strict';

    // Speech Recognition State
    let recognition = null;
    let isListening = false;
    let continuous = true;
    let interimResults = true;
    let finalTranscript = '';
    let interimTranscript = '';
    let silenceTimer = null;
    let lastSpeechTime = 0;
    let speechBuffer = [];
    let lastSentCaption = '';  // Track last caption sent to bridge
    
    // Configuration
    const config = {
        language: 'en-US',
        maxSilenceMs: 3000,      // 3 seconds of silence to hide captions
        maxCaptionLength: 120,    // Maximum characters in caption
        bufferTime: 30000,       // 30 seconds for AI summarization
        confidenceThreshold: 0.6  // Minimum confidence for results
    };

    // Initialize Speech Recognition
    function initSpeechRecognition() {
        console.log('Initializing LIVE speech recognition (microphone required)...');
        
        // Check for Web Speech API support
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        
        if (!SpeechRecognition) {
            console.error('Web Speech API not supported in this browser');
            updateStatus('ERROR: Speech recognition not supported on this browser');
            showSpeechNotSupportedError();
            return false;
        }

        // Create recognition instance
        recognition = new SpeechRecognition();
        
        // Configure recognition
        recognition.continuous = continuous;
        recognition.interimResults = interimResults;
        recognition.lang = config.language;
        recognition.maxAlternatives = 1;

        // Set up event listeners
        setupRecognitionEventListeners();
        
        updateStatus('Live speech recognition ready - Click button to start');
        console.log('Speech recognition initialized with Web Speech API');
        return true;
    }

    // Set up event listeners for speech recognition
    function setupRecognitionEventListeners() {
        // Recognition starts
        recognition.onstart = function() {
            console.log('Speech recognition started - LIVE LISTENING');
            isListening = true;
            updateStatus('LIVE: Listening for speech...');
            updateSpeechButton('Stop Speech Recognition');
            
            // Show mic indicator in AR
            const micIndicator = document.getElementById('micIndicator');
            if (micIndicator) {
                micIndicator.setAttribute('visible', 'true');
            }
            
            // Show confirmation that live mode is active
            showLiveRecognitionActive();
        };

        // Recognition ends
        recognition.onend = function() {
            console.log('Speech recognition ended');
            isListening = false;
            updateStatus('Speech recognition stopped');
            updateSpeechButton('Start Speech Recognition');
            
            // Hide mic indicator in AR
            const micIndicator = document.getElementById('micIndicator');
            if (micIndicator) {
                micIndicator.setAttribute('visible', 'false');
            }
            
            // Clear captions after a delay
            setTimeout(() => {
                if (window.updateCaption) {
                    window.updateCaption('');
                }
            }, 2000);
        };

        // Recognition error
        recognition.onerror = function(event) {
            console.error('Speech recognition error:', event.error);
            
            let errorMessage = 'Speech recognition error: ';
            let isPermissionError = false;
            
            switch(event.error) {
                case 'no-speech':
                    errorMessage += 'No speech detected';
                    break;
                case 'audio-capture':
                    errorMessage += 'Audio capture failed - Check microphone';
                    isPermissionError = true;
                    break;
                case 'not-allowed':
                    errorMessage += 'Permission denied - Please allow microphone access';
                    isPermissionError = true;
                    break;
                case 'network':
                    errorMessage += 'Network error';
                    break;
                default:
                    errorMessage += event.error;
            }
            
            updateStatus(errorMessage);
            
            // Show help for permission errors
            if (isPermissionError) {
                showMicrophonePermissionError();
            }
            
            isListening = false;
            updateSpeechButton('Start Speech Recognition');
            
            // Hide mic indicator in AR
            const micIndicator = document.getElementById('micIndicator');
            if (micIndicator) {
                micIndicator.setAttribute('visible', 'false');
            }
        };

        // Recognition results
        recognition.onresult = function(event) {
            interimTranscript = '';
            
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                const result = event.results[i];
                const transcript = result[0].transcript;
                const confidence = result[0].confidence;
                
                // Only use results above confidence threshold
                if (confidence >= config.confidenceThreshold) {
                    if (result.isFinal) {
                        finalTranscript += transcript + ' ';
                        
                        // Add to speech buffer for AI summarization
                        addToSpeechBuffer(transcript);
                        
                        console.log('Final speech:', transcript, 'Confidence:', confidence);
                        
                    } else {
                        interimTranscript += transcript;
                        console.log('Interim speech:', transcript);
                    }
                } else {
                    console.log('Low confidence speech ignored:', transcript, 'Confidence:', confidence);
                }
            }
            
            // Update captions with current transcript
            updateCaptions();
            
            // Reset silence timer
            resetSilenceTimer();
            lastSpeechTime = Date.now();
        };
    }

    // Add speech to buffer for AI summarization
    function addToSpeechBuffer(transcript) {
        const timestamp = Date.now();
        speechBuffer.push({
            text: transcript,
            timestamp: timestamp
        });
        
        // Remove old entries (older than buffer time)
        const cutoff = timestamp - config.bufferTime;
        speechBuffer = speechBuffer.filter(entry => entry.timestamp > cutoff);
        
        // Trigger AI summarization update
        if (window.aiModule) {
            const fullText = speechBuffer.map(entry => entry.text).join(' ');
            window.aiModule.updateTranscript(fullText);
        }
        
        // Check for person introduction (name detection)
        detectPersonIntroduction(transcript);
        
        console.log('Speech buffer updated, entries:', speechBuffer.length);
    }

    // Detect when someone introduces themselves and extract information
    function detectPersonIntroduction(text) {
        const lowerText = text.toLowerCase();
        
        // Introduction patterns
        const patterns = [
            /(?:my name is|i'm|i am|this is|call me|i go by)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i,
            /(?:i'm|i am)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?),/i,
            /^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?),?\s+(?:here|nice to meet you|speaking)/i
        ];
        
        let detectedName = null;
        
        // Try each pattern
        for (const pattern of patterns) {
            const match = text.match(pattern);
            if (match && match[1]) {
                detectedName = match[1].trim();
                break;
            }
        }
        
        if (detectedName) {
            console.log('✓ Detected introduction:', detectedName);
            updatePersonInfo(detectedName, text);
        }
        
        // Also check for relationship mentions
        const relationshipPatterns = [
            /i'm (?:your|a) (friend|colleague|coworker|classmate|neighbor|partner|spouse|family|student|teacher|doctor|client|customer)/i,
            /we're (friends|colleagues|coworkers|classmates|neighbors|partners)/i
        ];
        
        for (const pattern of relationshipPatterns) {
            const match = text.match(pattern);
            if (match && match[1]) {
                updateRelationship(match[1]);
                break;
            }
        }
    }

    // Update person information in dashboard
    function updatePersonInfo(name, fullText) {
        // Store in localStorage for persistence
        const personData = {
            name: name,
            detectedAt: new Date().toISOString(),
            context: fullText,
            lastUpdated: new Date().toISOString()
        };
        
        try {
            localStorage.setItem('clearpath_current_person', JSON.stringify(personData));
        } catch (e) {
            console.warn('Could not save to localStorage:', e);
        }
        
        // Update dashboard immediately
        const nameEl = document.getElementById('dashboardName');
        if (nameEl) {
            nameEl.setAttribute('value', `Person's Name: ${name}`);
            console.log('✓ Dashboard updated with name:', name);
            
            // Visual feedback - flash the text briefly
            const originalColor = nameEl.getAttribute('color') || '#FFFFFF';
            nameEl.setAttribute('color', '#10B981'); // Green flash
            setTimeout(() => {
                nameEl.setAttribute('color', originalColor);
            }, 1000);
        }
        
        // Notes functionality removed - only tracking name and relationship
    }

    // Update relationship information
    function updateRelationship(relationship) {
        const relationEl = document.getElementById('dashboardRelation');
        if (relationEl) {
            const capitalizedRel = relationship.charAt(0).toUpperCase() + relationship.slice(1);
            relationEl.setAttribute('value', `Relationship: ${capitalizedRel}`);
            console.log('✓ Relationship updated:', capitalizedRel);
            
            // Store in localStorage
            try {
                const existing = localStorage.getItem('clearpath_current_person');
                if (existing) {
                    const data = JSON.parse(existing);
                    data.relationship = capitalizedRel;
                    data.lastUpdated = new Date().toISOString();
                    localStorage.setItem('clearpath_current_person', JSON.stringify(data));
                }
            } catch (e) {
                console.warn('Could not update relationship in localStorage:', e);
            }
        }
    }

    // Notes functionality removed - only auto-detecting name and relationship
    // function extractAndUpdateNotes() - REMOVED

    // Update live captions in AR view
    function updateCaptions() {
        // Combine final and interim transcripts
        let displayText = finalTranscript;
        if (interimTranscript) {
            displayText += interimTranscript;
        }
        
        // Limit caption length
        if (displayText.length > config.maxCaptionLength) {
            displayText = '...' + displayText.slice(-(config.maxCaptionLength - 3));
        }
        
        // Update AR caption
        if (window.updateCaption) {
            window.updateCaption(displayText.trim());
        }
        
        // Send caption and speaking event to bridge (iPhone haptic)
        if (window.bridgeModule && window.bridgeModule.isConnected()) {
            if (finalTranscript && finalTranscript !== lastSentCaption) {
                // Send caption to bridge
                window.bridgeModule.sendCaption(finalTranscript.trim(), 1.0);
                
                // Send speaking haptic event (triple medium impact, white flash)
                window.bridgeModule.notifySpeaking({
                    text: finalTranscript.trim(),
                    length: finalTranscript.length
                });
                
                lastSentCaption = finalTranscript;
            }
        }
        
        console.log('Caption updated:', displayText.trim());
    }

    // Reset silence timer
    function resetSilenceTimer() {
        if (silenceTimer) {
            clearTimeout(silenceTimer);
        }
        
        silenceTimer = setTimeout(() => {
            // Hide captions after silence
            if (window.updateCaption) {
                window.updateCaption('');
            }
            
            // Clear final transcript to prevent accumulation
            finalTranscript = '';
            
            console.log('Silence detected - captions cleared');
        }, config.maxSilenceMs);
    }

    // Update status display
    function updateStatus(message) {
        const statusEl = document.getElementById('speechStatus');
        if (statusEl) {
            statusEl.textContent = `Speech: ${message}`;
            statusEl.className = isListening ? 'status-item active' : 'status-item';
        }
        
        if (window.updateStatusText) {
            window.updateStatusText(message);
        }
    }

    // Update speech button text
    function updateSpeechButton(text) {
        const button = document.getElementById('toggleSpeech');
        if (button) {
            button.textContent = text;
        }
    }

    // Start speech recognition
    function startListening() {
        if (!recognition) {
            if (!initSpeechRecognition()) {
                return false;
            }
        }
        
        if (!isListening) {
            try {
                recognition.start();
                console.log('Starting speech recognition...');
                return true;
            } catch (error) {
                console.error('Error starting speech recognition:', error);
                updateStatus('Error starting speech recognition');
                return false;
            }
        }
        
        return true;
    }

    // Stop speech recognition
    function stopListening() {
        if (recognition && isListening) {
            recognition.stop();
            console.log('Stopping speech recognition...');
        }
    }

    // Toggle speech recognition
    function toggleSpeechRecognition() {
        if (isListening) {
            stopListening();
        } else {
            startListening();
        }
    }

    // Get current speech buffer for AI processing
    function getSpeechBuffer() {
        return speechBuffer.map(entry => entry.text).join(' ');
    }

    // Clear speech buffer
    function clearSpeechBuffer() {
        speechBuffer = [];
        finalTranscript = '';
        console.log('Speech buffer cleared');
    }

    // Set language
    function setLanguage(lang) {
        config.language = lang;
        if (recognition) {
            recognition.lang = lang;
        }
        console.log('Language set to:', lang);
    }

    // Get recognition status
    function getStatus() {
        return {
            isListening: isListening,
            isSupported: !!recognition,
            language: config.language,
            bufferSize: speechBuffer.length,
            lastSpeechTime: lastSpeechTime
        };
    }
    
    // Helper to show live recognition is active
    function showLiveRecognitionActive() {
        const liveDiv = document.createElement('div');
        liveDiv.id = 'live-recognition-active';
        liveDiv.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(220, 38, 38, 0.95);
            color: white;
            padding: 15px 30px;
            border-radius: 10px;
            font-size: 18px;
            font-weight: bold;
            z-index: 10000;
            text-align: center;
            box-shadow: 0 4px 15px rgba(0,0,0,0.5);
            animation: pulse 2s ease-in-out infinite;
        `;
        
        // Add pulsing animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.8; }
            }
        `;
        document.head.appendChild(style);
        
        liveDiv.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: center; gap: 10px;">
                <div style="width: 12px; height: 12px; background: white; border-radius: 50%; animation: blink 1s ease-in-out infinite;"></div>
                LIVE - Speaking Now Creates Real-Time Captions
            </div>
        `;
        
        const blinkStyle = document.createElement('style');
        blinkStyle.textContent = `
            @keyframes blink {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.2; }
            }
        `;
        document.head.appendChild(blinkStyle);
        
        document.body.appendChild(liveDiv);
        
        // Remove after 5 seconds
        setTimeout(() => {
            if (liveDiv.parentElement) {
                liveDiv.style.transition = 'opacity 0.5s';
                liveDiv.style.opacity = '0';
                setTimeout(() => liveDiv.remove(), 500);
            }
        }, 5000);
    }

    // Helper to show speech not supported error
    function showSpeechNotSupportedError() {
        const errorDiv = document.createElement('div');
        errorDiv.id = 'speech-not-supported';
        errorDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(220, 38, 38, 0.95);
            color: white;
            padding: 30px 40px;
            border-radius: 15px;
            font-size: 16px;
            font-weight: bold;
            z-index: 10001;
            text-align: center;
            max-width: 500px;
            box-shadow: 0 8px 30px rgba(0,0,0,0.5);
        `;
        errorDiv.innerHTML = `
            <div style="font-size: 24px; margin-bottom: 15px;">Speech Recognition Not Available</div>
            <div style="font-size: 14px; font-weight: normal; line-height: 1.6;">
                This browser does not support Web Speech API.<br><br>
                Please use:<br>
                • Chrome browser on Meta Quest 3<br>
                • Chrome/Edge on desktop<br>
                • Safari on iOS/macOS<br><br>
                Live captions require microphone access.
            </div>
            <button onclick="this.parentElement.remove()" style="
                margin-top: 20px;
                padding: 12px 30px;
                background: white;
                color: #dc2626;
                border: none;
                border-radius: 8px;
                font-weight: bold;
                cursor: pointer;
            ">Close</button>
        `;
        document.body.appendChild(errorDiv);
    }
    
    function showMicrophonePermissionError() {
        const errorDiv = document.createElement('div');
        errorDiv.id = 'microphone-permission-error';
        errorDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(239, 68, 68, 0.95);
            color: white;
            padding: 30px 40px;
            border-radius: 15px;
            font-size: 16px;
            font-weight: bold;
            z-index: 10001;
            text-align: center;
            max-width: 500px;
            box-shadow: 0 8px 30px rgba(0,0,0,0.5);
        `;
        errorDiv.innerHTML = `
            <div style="font-size: 24px; margin-bottom: 15px;">Microphone Permission Required</div>
            <div style="font-size: 14px; font-weight: normal; line-height: 1.6;">
                ClearPath needs microphone access for live speech captions.
                <br><br>
                <strong>On Meta Quest 3:</strong><br>
                1. Tap the three dots menu in Quest Browser<br>
                2. Go to Settings → Site Settings → Permissions<br>
                3. Enable Microphone for this site<br>
                4. Reload this page<br>
                <br>
                <strong>On Desktop/Mobile:</strong><br>
                Click "Allow" when prompted for microphone access.
            </div>
            <button onclick="location.reload()" style="
                margin-top: 20px;
                padding: 12px 30px;
                background: white;
                color: #ef4444;
                border: none;
                border-radius: 8px;
                font-weight: bold;
                cursor: pointer;
                box-shadow: 0 2px 8px rgba(0,0,0,0.2);
            ">Reload Page</button>
            <button onclick="this.parentElement.remove()" style="
                margin-top: 10px;
                margin-left: 10px;
                padding: 12px 30px;
                background: transparent;
                color: white;
                border: 2px solid white;
                border-radius: 8px;
                font-weight: bold;
                cursor: pointer;
            ">Close</button>
        `;
        document.body.appendChild(errorDiv);
    }

    // Restore person information from localStorage
    function restorePersonInfo() {
        try {
            const stored = localStorage.getItem('clearpath_current_person');
            if (stored) {
                const data = JSON.parse(stored);
                console.log('✓ Restoring person info from storage:', data.name);
                
                // Update dashboard elements
                const nameEl = document.getElementById('dashboardName');
                if (nameEl && data.name) {
                    nameEl.setAttribute('value', `Person's Name: ${data.name}`);
                }
                
                const relationEl = document.getElementById('dashboardRelation');
                if (relationEl && data.relationship) {
                    relationEl.setAttribute('value', `Relationship: ${data.relationship}`);
                }
                
                // Notes section removed
                
                return data;
            }
        } catch (e) {
            console.warn('Could not restore person info from localStorage:', e);
        }
        return null;
    }

    // Clear stored person information
    function clearPersonInfo() {
        try {
            localStorage.removeItem('clearpath_current_person');
            
            // Reset dashboard to defaults
            const nameEl = document.getElementById('dashboardName');
            if (nameEl) nameEl.setAttribute('value', "Person's Name: ...");
            
            const relationEl = document.getElementById('dashboardRelation');
            if (relationEl) relationEl.setAttribute('value', 'Relationship: Unknown');
            
            // Notes section removed
            
            console.log('✓ Person info cleared');
        } catch (e) {
            console.warn('Could not clear person info:', e);
        }
    }

    // Export speech module to global scope
    window.speechModule = {
        init: initSpeechRecognition,
        start: startListening,
        stop: stopListening,
        toggle: toggleSpeechRecognition,
        getSpeechBuffer: getSpeechBuffer,
        clearBuffer: clearSpeechBuffer,
        setLanguage: setLanguage,
        getStatus: getStatus,
        restorePersonInfo: restorePersonInfo,
        clearPersonInfo: clearPersonInfo,
        config: config
    };

    // Auto-initialize when DOM is ready
    document.addEventListener('DOMContentLoaded', function() {
        console.log('Speech Recognition Module Loaded');
        updateStatus('Ready');
        
        // Restore saved person information
        restorePersonInfo();
        
        // Initialize if in AR mode
        if (document.body.classList.contains('ar-active')) {
            initSpeechRecognition();
        }
    });

    console.log('ClearPath Speech Recognition Module Ready');

})();