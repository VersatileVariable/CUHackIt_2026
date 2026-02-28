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
        // Check for Web Speech API support
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        
        if (!SpeechRecognition) {
            console.error('❌ Web Speech API not supported in this browser');
            updateStatus('Speech recognition not supported');
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
        
        console.log('🎤 Speech recognition initialized');
        return true;
    }

    // Set up event listeners for speech recognition
    function setupRecognitionEventListeners() {
        // Recognition starts
        recognition.onstart = function() {
            console.log('🎤 Speech recognition started');
            isListening = true;
            updateStatus('Listening for speech...');
            updateSpeechButton('Stop Speech Recognition');
            
            // Trigger Arduino notification
            if (window.serialModule) {
                window.serialModule.sendCommand('SPEECH_START');
            }
        };

        // Recognition ends
        recognition.onend = function() {
            console.log('🎤 Speech recognition ended');
            isListening = false;
            updateStatus('Speech recognition stopped');
            updateSpeechButton('Start Speech Recognition');
            
            // Clear captions after a delay
            setTimeout(() => {
                if (window.updateCaption) {
                    window.updateCaption('');
                }
            }, 2000);
            
            // Trigger Arduino notification
            if (window.serialModule) {
                window.serialModule.sendCommand('SPEECH_END');
            }
        };

        // Recognition error
        recognition.onerror = function(event) {
            console.error('❌ Speech recognition error:', event.error);
            
            let errorMessage = 'Speech recognition error: ';
            switch(event.error) {
                case 'no-speech':
                    errorMessage += 'No speech detected';
                    break;
                case 'audio-capture':
                    errorMessage += 'Audio capture failed';
                    break;
                case 'not-allowed':
                    errorMessage += 'Permission denied';
                    break;
                case 'network':
                    errorMessage += 'Network error';
                    break;
                default:
                    errorMessage += event.error;
            }
            
            updateStatus(errorMessage);
            isListening = false;
            updateSpeechButton('Start Speech Recognition');
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
                        
                        console.log('🎯 Final speech:', transcript, 'Confidence:', confidence);
                        
                        // Trigger haptic feedback for speech detection
                        if (window.serialModule) {
                            window.serialModule.sendCommand('SPEECH_DETECTED');
                        }
                        
                    } else {
                        interimTranscript += transcript;
                        console.log('🎯 Interim speech:', transcript);
                    }
                } else {
                    console.log('🔇 Low confidence speech ignored:', transcript, 'Confidence:', confidence);
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
        
        console.log('📝 Speech buffer updated, entries:', speechBuffer.length);
    }

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
        
        console.log('💬 Caption updated:', displayText.trim());
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
            
            console.log('🔇 Silence detected - captions cleared');
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
                console.log('🚀 Starting speech recognition...');
                return true;
            } catch (error) {
                console.error('❌ Error starting speech recognition:', error);
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
            console.log('⏹️ Stopping speech recognition...');
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
        console.log('🗑️ Speech buffer cleared');
    }

    // Set language
    function setLanguage(lang) {
        config.language = lang;
        if (recognition) {
            recognition.lang = lang;
        }
        console.log('🌐 Language set to:', lang);
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
        config: config
    };

    // Auto-initialize when DOM is ready
    document.addEventListener('DOMContentLoaded', function() {
        console.log('🎤 Speech Recognition Module Loaded');
        updateStatus('Ready');
        
        // Initialize if in AR mode
        if (document.body.classList.contains('ar-active')) {
            initSpeechRecognition();
        }
    });

    console.log('✅ ClearPath Speech Recognition Module Ready');

})();