/**
 * ClearPath Audio Direction Detection Module
 * Handles webcam-based directional audio detection for AR glows
 * Uses Web Audio API with stereo audio analysis
 */

(function() {
    'use strict';

    // Audio Context and Analysis
    let audioContext = null;
    let mediaStream = null;
    let analyser = null;
    let splitter = null;
    let leftAnalyser = null;
    let rightAnalyser = null;
    let isActive = false;
    let animationFrame = null;

    // Audio data buffers
    let leftBuffer = null;
    let rightBuffer = null;
    const bufferSize = 256;

    // Configuration
    const config = {
        sampleRate: 44100,
        fftSize: 512,
        smoothingTimeConstant: 0.8,
        minDecibels: -90,
        maxDecibels: -10,
        volumeThreshold: 0.1,      // Minimum volume to trigger detection
        directionThreshold: 0.3,    // Difference needed to determine direction
        triggerCooldown: 1000,      // Minimum time between triggers (ms)
        glowDuration: 1500,         // How long directional glow lasts (ms)
        environmentalSoundThreshold: 0.15  // Threshold for environmental sound detection
    };

    // Timing and state
    let lastTriggerTime = 0;
    let currentDirection = null;
    let volumeHistory = [];
    const historyLength = 10;

    // Initialize audio direction detection
    async function initAudioDirection() {
        try {
            console.log('🎧 Initializing audio direction detection...');
            
            // Check for required APIs
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                console.error('❌ getUserMedia not supported');
                updateStatus('Audio API not supported');
                return false;
            }

            // Request microphone access
            updateStatus('Requesting microphone access...');
            mediaStream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: false,
                    noiseSuppression: false,
                    autoGainControl: false,
                    channelCount: 2  // Request stereo input
                },
                video: false
            });

            console.log('🎤 Microphone access granted');
            
            // Set up audio context
            audioContext = new (window.AudioContext || window.webkitAudioContext)({
                sampleRate: config.sampleRate
            });

            // Create audio processing chain
            setupAudioProcessingChain();

            updateStatus('Audio direction detection ready');
            console.log('✅ Audio direction detection initialized');
            return true;

        } catch (error) {
            console.error('❌ Error initializing audio direction:', error);
            
            if (error.name === 'NotAllowedError') {
                updateStatus('Microphone permission denied');
            } else if (error.name === 'NotFoundError') {
                updateStatus('No microphone found');
            } else {
                updateStatus('Audio setup failed: ' + error.message);
            }
            
            return false;
        }
    }

    // Set up audio processing chain for stereo analysis
    function setupAudioProcessingChain() {
        // Create source from media stream
        const source = audioContext.createMediaStreamSource(mediaStream);
        
        // Create channel splitter for left/right analysis
        splitter = audioContext.createChannelSplitter(2);
        source.connect(splitter);

        // Create analysers for each channel
        leftAnalyser = audioContext.createAnalyser();
        rightAnalyser = audioContext.createAnalyser();
        
        // Configure analysers
        [leftAnalyser, rightAnalyser].forEach(analyser => {
            analyser.fftSize = config.fftSize;
            analyser.smoothingTimeConstant = config.smoothingTimeConstant;
            analyser.minDecibels = config.minDecibels;
            analyser.maxDecibels = config.maxDecibels;
        });

        // Connect channels to analysers
        splitter.connect(leftAnalyser, 0); // Left channel
        splitter.connect(rightAnalyser, 1); // Right channel

        // Create data buffers
        leftBuffer = new Uint8Array(leftAnalyser.frequencyBinCount);
        rightBuffer = new Uint8Array(rightAnalyser.frequencyBinCount);

        console.log('🎵 Audio processing chain configured');
        console.log('📊 FFT Size:', config.fftSize, 'Buffer Size:', leftAnalyser.frequencyBinCount);
    }

    // Start audio direction monitoring
    function startAudioDirection() {
        if (!audioContext || !leftAnalyser || !rightAnalyser) {
            console.error('❌ Audio not initialized');
            return false;
        }

        if (audioContext.state === 'suspended') {
            audioContext.resume();
        }

        isActive = true;
        analyzeAudio();
        
        updateStatus('Monitoring audio direction...');
        console.log('🎧 Audio direction monitoring started');
        return true;
    }

    // Stop audio direction monitoring
    function stopAudioDirection() {
        isActive = false;
        
        if (animationFrame) {
            cancelAnimationFrame(animationFrame);
            animationFrame = null;
        }

        updateStatus('Audio direction monitoring stopped');
        console.log('🔇 Audio direction monitoring stopped');
    }

    // Main audio analysis loop
    function analyzeAudio() {
        if (!isActive || !leftAnalyser || !rightAnalyser) {
            return;
        }

        // Get frequency data from both channels
        leftAnalyser.getByteFrequencyData(leftBuffer);
        rightAnalyser.getByteFrequencyData(rightBuffer);

        // Calculate average volume for each channel
        const leftVolume = calculateAverageVolume(leftBuffer);
        const rightVolume = calculateAverageVolume(rightBuffer);
        
        // Analyze direction and volume patterns
        analyzeDirectionAndVolume(leftVolume, rightVolume);

        // Continue analysis loop
        animationFrame = requestAnimationFrame(analyzeAudio);
    }

    // Calculate average volume from frequency data
    function calculateAverageVolume(buffer) {
        let sum = 0;
        for (let i = 0; i < buffer.length; i++) {
            sum += buffer[i];
        }
        return sum / buffer.length / 255; // Normalize to 0-1
    }

    // Analyze direction and trigger appropriate responses
    function analyzeDirectionAndVolume(leftVolume, rightVolume) {
        const totalVolume = (leftVolume + rightVolume) / 2;
        const volumeDifference = Math.abs(leftVolume - rightVolume);
        const currentTime = Date.now();
        
        // Add to volume history for trend analysis
        volumeHistory.push(totalVolume);
        if (volumeHistory.length > historyLength) {
            volumeHistory.shift();
        }

        // Check for environmental sound (sudden volume increase)
        checkEnvironmentalSound(totalVolume);

        // Only process directional detection if volume is above threshold
        if (totalVolume > config.volumeThreshold && 
            volumeDifference > config.directionThreshold &&
            currentTime - lastTriggerTime > config.triggerCooldown) {
            
            // Determine direction based on volume difference
            let detectedDirection = null;
            
            if (leftVolume > rightVolume + config.directionThreshold) {
                detectedDirection = 'left';
            } else if (rightVolume > leftVolume + config.directionThreshold) {
                detectedDirection = 'right';
            }

            if (detectedDirection && detectedDirection !== currentDirection) {
                triggerDirectionalGlow(detectedDirection, leftVolume, rightVolume);
                lastTriggerTime = currentTime;
                currentDirection = detectedDirection;
                
                // Reset direction after cooldown
                setTimeout(() => {
                    currentDirection = null;
                }, config.triggerCooldown);
            }
        }

        // Log audio levels for debugging (throttled)
        if (currentTime % 1000 < 50) { // Log roughly every second
            console.log(`🎵 Audio levels - Left: ${leftVolume.toFixed(3)}, Right: ${rightVolume.toFixed(3)}, Total: ${totalVolume.toFixed(3)}`);
        }
    }

    // Check for environmental sound events
    function checkEnvironmentalSound(currentVolume) {
        if (volumeHistory.length < historyLength) return;

        // Calculate average of recent history
        const recentAverage = volumeHistory.slice(0, -1).reduce((a, b) => a + b, 0) / (volumeHistory.length - 1);
        
        // Check for sudden volume spike
        if (currentVolume > recentAverage + config.environmentalSoundThreshold && 
            currentVolume > config.volumeThreshold) {
            
            console.log('🔊 Environmental sound detected:', currentVolume, 'vs avg:', recentAverage);
            
            // Trigger environmental sound notification
            if (window.serialModule) {
                window.serialModule.notifyEnvironmentalSound();
            }
        }
    }

    // Trigger directional glow in AR view
    function triggerDirectionalGlow(direction, leftVol, rightVol) {
        const intensity = Math.max(leftVol, rightVol);
        
        console.log(`🎯 Direction detected: ${direction} (L:${leftVol.toFixed(3)}, R:${rightVol.toFixed(3)})`);
        
        // Trigger AR glow
        if (window.triggerDirectionalGlow) {
            window.triggerDirectionalGlow(direction, intensity, config.glowDuration);
        }

        // Notify Arduino wristband
        if (window.serialModule) {
            if (direction === 'left') {
                window.serialModule.notifyDirectionLeft();
            } else if (direction === 'right') {
                window.serialModule.notifyDirectionRight();
            }
        }

        updateStatus(`Sound from ${direction} detected`);
    }

    // Toggle audio direction detection
    function toggleAudioDirection() {
        if (!isActive) {
            if (audioContext) {
                startAudioDirection();
            } else {
                initAudioDirection().then(success => {
                    if (success) {
                        startAudioDirection();
                    }
                });
            }
        } else {
            stopAudioDirection();
        }
    }

    // Cleanup resources
    async function cleanup() {
        stopAudioDirection();

        if (mediaStream) {
            mediaStream.getTracks().forEach(track => track.stop());
            mediaStream = null;
        }

        if (audioContext && audioContext.state !== 'closed') {
            await audioContext.close();
            audioContext = null;
        }

        console.log('🧹 Audio direction cleanup complete');
    }

    // Update status display
    function updateStatus(message) {
        const statusEl = document.getElementById('audioStatus');
        if (statusEl) {
            statusEl.textContent = `Audio: ${message}`;
            statusEl.className = isActive ? 'status-item active' : 'status-item';
        }

        if (window.updateStatusText) {
            window.updateStatusText(message);
        }
    }

    // Get current status
    function getStatus() {
        return {
            isActive: isActive,
            hasAudioContext: !!audioContext,
            hasStream: !!mediaStream,
            currentDirection: currentDirection,
            lastTriggerTime: lastTriggerTime,
            volumeHistoryLength: volumeHistory.length
        };
    }

    // Export audio module to global scope
    window.audioModule = {
        init: initAudioDirection,
        start: startAudioDirection,
        stop: stopAudioDirection,
        toggle: toggleAudioDirection,
        cleanup: cleanup,
        getStatus: getStatus,
        config: config
    };

    // Auto-initialize when DOM is ready
    document.addEventListener('DOMContentLoaded', function() {
        console.log('🎧 Audio Direction Module Loaded');
        updateStatus('Ready');
    });

    // Cleanup on page unload
    window.addEventListener('beforeunload', function() {
        cleanup();
    });

    console.log('✅ ClearPath Audio Direction Module Ready');

})();