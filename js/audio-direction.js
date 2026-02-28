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
            console.log('Initializing LIVE audio direction detection (microphone required)...');
            
            // Check for required APIs
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                console.error('getUserMedia not supported');
                updateStatus('ERROR: Audio API not supported on this browser');
                return false;
            }

            // Request microphone access
            updateStatus('Requesting microphone access for audio direction...');
            mediaStream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: false,
                    noiseSuppression: false,
                    autoGainControl: false,
                    channelCount: 2  // Request stereo input
                },
                video: false
            });

            console.log('Microphone access granted for audio direction');
            
            // Set up audio context
            audioContext = new (window.AudioContext || window.webkitAudioContext)({
                sampleRate: config.sampleRate
            });

            // Create audio processing chain
            setupAudioProcessingChain();

            updateStatus('Live audio direction detection ready');
            console.log('Audio direction detection initialized with real microphone');
            return true;

        } catch (error) {
            console.error('Error initializing audio direction:', error);
            
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

        console.log('Audio processing chain configured');
        console.log('FFT Size:', config.fftSize, 'Buffer Size:', leftAnalyser.frequencyBinCount);
    }

    // Start audio direction monitoring
    function startAudioDirection() {
        if (!audioContext || !leftAnalyser || !rightAnalyser) {
            console.error('Audio not initialized');
            return false;
        }

        if (audioContext.state === 'suspended') {
            audioContext.resume();
        }

        isActive = true;
        analyzeAudio();
        
        updateStatus('Monitoring audio direction...');
        console.log('Audio direction monitoring started');
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
        console.log('Audio direction monitoring stopped');
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

    // Analyze 360-degree direction and trigger appropriate responses
    function analyzeDirectionAndVolume(leftVolume, rightVolume) {
        const totalVolume = (leftVolume + rightVolume) / 2;
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
            currentTime - lastTriggerTime > config.triggerCooldown) {
            
            // Calculate 360-degree direction using advanced stereo analysis
            const directionData = calculate360Direction(leftVolume, rightVolume, leftBuffer, rightBuffer);
            
            if (directionData && directionData.confidence > 0.6) {
                trigger360DirectionalGlow(directionData.angle, directionData.intensity, directionData.soundType);
                lastTriggerTime = currentTime;
                currentDirection = directionData.angle;
                
                // Reset direction after cooldown
                setTimeout(() => {
                    currentDirection = null;
                }, config.triggerCooldown);
            }
        }

        // Log audio levels for debugging (throttled)
        if (currentTime % 1000 < 50) { // Log roughly every second
            console.log(`Audio 360° - L: ${leftVolume.toFixed(3)}, R: ${rightVolume.toFixed(3)}, Total: ${totalVolume.toFixed(3)}`);
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
            
            console.log('Environmental sound detected:', currentVolume, 'vs avg:', recentAverage);
            
            // Send to bridge for iPhone haptic (double warning notification, orange flash)
            if (window.bridgeModule && window.bridgeModule.isConnected()) {
                window.bridgeModule.notifyEnvironmental({
                    volume: currentVolume,
                    average: recentAverage
                });
            }
        }
    }

    // Calculate 360-degree direction using advanced stereo analysis
    function calculate360Direction(leftVolume, rightVolume, leftFreqData, rightFreqData) {
        // Calculate basic left/right positioning (-90 to +90 degrees)
        const volumeDifference = rightVolume - leftVolume;
        const maxVolume = Math.max(leftVolume, rightVolume);
        
        // Base angle calculation using volume differences
        let baseAngle = 0;
        if (Math.abs(volumeDifference) > config.directionThreshold) {
            // Map volume difference to angle (-90 to +90 degrees)
            baseAngle = Math.atan2(volumeDifference, maxVolume) * (180 / Math.PI) * 2;
            baseAngle = Math.max(-90, Math.min(90, baseAngle));
        }
        
        // Enhance with frequency analysis for front/back discrimination
        const frontBackFactor = analyzeFrequencyContent(leftFreqData, rightFreqData);
        
        // Convert to 360-degree system (0 = North, 90 = East, 180 = South, 270 = West)
        let finalAngle = 0;
        
        if (frontBackFactor > 0.3) {
            // Sound is likely in front (0-180 degrees)
            if (baseAngle >= 0) {
                finalAngle = 90 + baseAngle; // Right front quadrant (90-180)
            } else {
                finalAngle = 90 + baseAngle; // Left front quadrant (0-90)
            }
        } else {
            // Sound is likely behind (180-360 degrees)
            if (baseAngle >= 0) {
                finalAngle = 270 - baseAngle; // Right back quadrant (270-360/0)
            } else {
                finalAngle = 270 - baseAngle; // Left back quadrant (180-270)
            }
        }
        
        // Normalize angle to 0-360 degrees
        finalAngle = ((finalAngle % 360) + 360) % 360;
        
        // Calculate confidence based on volume levels and consistency
        const confidence = Math.min(1.0, maxVolume / config.volumeThreshold);
        
        // Determine sound type based on frequency content
        const soundType = classifySoundType(leftFreqData, rightFreqData);
        
        // Calculate intensity (higher for closer/louder sounds)
        const intensity = Math.min(1.0, maxVolume * 1.2);
        
        return {
            angle: finalAngle,
            intensity: intensity,
            confidence: confidence,
            soundType: soundType,
            leftVolume: leftVolume,
            rightVolume: rightVolume
        };
    }

    // Analyze frequency content to determine front/back positioning
    function analyzeFrequencyContent(leftFreqData, rightFreqData) {
        // High frequency attenuation suggests sound is behind
        let highFreqL = 0, midFreqL = 0, lowFreqL = 0;
        let highFreqR = 0, midFreqR = 0, lowFreqR = 0;
        
        const third = leftFreqData.length / 3;
        
        // Analyze frequency bands
        for (let i = 0; i < leftFreqData.length; i++) {
            if (i < third) {
                lowFreqL += leftFreqData[i];
                lowFreqR += rightFreqData[i];
            } else if (i < third * 2) {
                midFreqL += leftFreqData[i];
                midFreqR += rightFreqData[i];
            } else {
                highFreqL += leftFreqData[i];
                highFreqR += rightFreqData[i];
            }
        }
        
        // Calculate ratios
        const totalL = highFreqL + midFreqL + lowFreqL;
        const totalR = highFreqR + midFreqR + lowFreqR;
        
        if (totalL === 0 || totalR === 0) return 0.5; // Neutral
        
        const highRatioL = highFreqL / totalL;
        const highRatioR = highFreqR / totalR;
        const avgHighRatio = (highRatioL + highRatioR) / 2;
        
        // Higher high-frequency content suggests front-facing sound
        return avgHighRatio;
    }

    // Classify sound type based on frequency characteristics
    function classifySoundType(leftFreqData, rightFreqData) {
        const avgData = new Float32Array(leftFreqData.length);
        for (let i = 0; i < leftFreqData.length; i++) {
            avgData[i] = (leftFreqData[i] + rightFreqData[i]) / 2;
        }
        
        // Calculate frequency band energies
        const lowEnergy = avgData.slice(0, 8).reduce((a, b) => a + b, 0); // ~0-700 Hz
        const midEnergy = avgData.slice(8, 24).reduce((a, b) => a + b, 0); // ~700-2100 Hz  
        const highEnergy = avgData.slice(24, 64).reduce((a, b) => a + b, 0); // ~2100-5600 Hz
        const totalEnergy = lowEnergy + midEnergy + highEnergy;
        
        if (totalEnergy === 0) return 'silence';
        
        const lowRatio = lowEnergy / totalEnergy;
        const midRatio = midEnergy / totalEnergy;
        const highRatio = highEnergy / totalEnergy;
        
        // Classify based on frequency distribution
        if (midRatio > 0.5 && highRatio > 0.25) {
            return 'speech';
        } else if (lowRatio > 0.6) {
            return 'mechanical';
        } else if (highRatio > 0.4) {
            return 'environmental';
        } else {
            return 'general';
        }
    }

    // Trigger 360-degree directional glow in AR view
    function trigger360DirectionalGlow(angle, intensity, soundType) {
        console.log(`360° Sound: ${Math.round(angle)}° (${intensity.toFixed(3)}, ${soundType})`);
        
        // Trigger AR glow with angle and intensity
        if (window.triggerDirectionalGlow) {
            window.triggerDirectionalGlow(angle, intensity, config.glowDuration, soundType);
        }

        // Send directional info to bridge for iPhone haptics
        if (angle >= 270 || angle < 90) {
            // Send to bridge for iPhone haptic (triple light impact, red flash)
            if (window.bridgeModule && window.bridgeModule.isConnected()) {
                window.bridgeModule.notifyLeftSound({
                    angle: angle,
                    intensity: intensity,
                    soundType: soundType
                });
            }
        } else {
            // Send to bridge for iPhone haptic (single heavy impact, green flash)
            if (window.bridgeModule && window.bridgeModule.isConnected()) {
                window.bridgeModule.notifyRightSound({
                    angle: angle,
                    intensity: intensity,
                    soundType: soundType
                });
            }
        }

        updateStatus(`${soundType} sound from ${Math.round(angle)}°`);
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

        console.log('Audio direction cleanup complete');
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
        console.log('Audio Direction Module Loaded');
        updateStatus('Ready');
    });

    // Cleanup on page unload
    window.addEventListener('beforeunload', function() {
        cleanup();
    });

    console.log('ClearPath Audio Direction Module Ready');

})();