/**
 * ClearPath AR Manager Module
 * Coordinates all AR systems and manages overall application state
 * Handles integration between speech, audio, AI, and Arduino systems
 */

(function() {
    'use strict';

    // Application State
    let isInitialized = false;
    let systemsReady = {
        speech: false,
        audio: false,
        serial: false,
        ai: false
    };

    // Performance monitoring
    let performanceStats = {
        startTime: Date.now(),
        speechEvents: 0,
        directionEvents: 0,
        topicUpdates: 0,
        arduinoCommands: 0,
        errors: 0
    };

    // Configuration
    const config = {
        autoStartSystems: true,
        enablePerformanceLogging: true,
        systemCheckIntervalMs: 5000,
        maxErrorsBeforeShutdown: 10
    };

    // Initialize AR Manager and all subsystems
    function initializeARManager() {
        if (isInitialized) {
            console.log('⚠️ AR Manager already initialized');
            return true;
        }

        console.log('🚀 Initializing ClearPath AR Manager...');
        
        try {
            // Set up global error handling
            setupGlobalErrorHandling();
            
            // Initialize all subsystems
            initializeSubsystems();
            
            // Set up system monitoring
            setupSystemMonitoring();
            
            // Set up event coordination
            setupEventCoordination();
            
            // Configure UI integration
            setupUIIntegration();
            
            isInitialized = true;
            
            // Auto-start systems if configured
            if (config.autoStartSystems) {
                setTimeout(autoStartSystems, 1000);
            }
            
            console.log('✅ ClearPath AR Manager initialized successfully');
            logStatus('AR Manager ready');
            
            return true;
            
        } catch (error) {
            console.error('❌ Failed to initialize AR Manager:', error);
            logStatus('AR Manager initialization failed: ' + error.message);
            return false;
        }
    }

    // Initialize all subsystems
    function initializeSubsystems() {
        console.log('🔧 Initializing subsystems...');
        
        // Check if modules are loaded
        const modules = {
            speech: window.speechModule,
            audio: window.audioModule,
            serial: window.serialModule,  
            ai: window.aiModule
        };

        for (const [name, module] of Object.entries(modules)) {
            if (module) {
                console.log(`✅ ${name} module available`);
                systemsReady[name] = true;
            } else {
                console.warn(`⚠️ ${name} module not available`);
                systemsReady[name] = false;
            }
        }

        console.log('🔧 Subsystem initialization complete');
        logSystemStatus();
    }

    // Set up global error handling
    function setupGlobalErrorHandling() {
        window.addEventListener('error', function(event) {
            performanceStats.errors++;
            console.error('💥 Global error:', event.error);
            
            // Attempt recovery for certain errors
            attemptErrorRecovery(event.error);
            
            // Shutdown if too many errors
            if (performanceStats.errors >= config.maxErrorsBeforeShutdown) {
                console.error('🛑 Too many errors, shutting down systems');
                shutdownAllSystems();
            }
        });

        window.addEventListener('unhandledrejection', function(event) {
            performanceStats.errors++;
            console.error('💥 Unhandled promise rejection:', event.reason);
        });
    }

    // Set up system monitoring
    function setupSystemMonitoring() {
        setInterval(() => {
            if (config.enablePerformanceLogging) {
                logPerformanceStats();
            }
            checkSystemHealth();
        }, config.systemCheckIntervalMs);
        
        console.log('📊 System monitoring configured');
    }

    // Set up event coordination between systems
    function setupEventCoordination() {
        // Speech Recognition Events
        document.addEventListener('speechstart', function() {
            performanceStats.speechEvents++;
            
            // Notify Arduino
            if (systemsReady.serial && window.serialModule) {
                window.serialModule.notifySpeechStart();
                performanceStats.arduinoCommands++;
            }
            
            console.log('🎤 Speech recognition started - systems notified');
        });

        document.addEventListener('speechend', function() {
            // Notify Arduino
            if (systemsReady.serial && window.serialModule) {
                window.serialModule.notifySpeechEnd();
                performanceStats.arduinoCommands++;
            }
            
            console.log('🎤 Speech recognition ended - systems notified');
        });

        // Direction Detection Events
        document.addEventListener('directiondetected', function(event) {
            performanceStats.directionEvents++;
            
            // Coordinate response across all systems
            const direction = event.detail.direction;
            const intensity = event.detail.intensity;
            
            console.log(`🎯 Direction event coordinated: ${direction} (${intensity})`);
        });

        // Topic Update Events
        document.addEventListener('topicupdated', function(event) {
            performanceStats.topicUpdates++;
            
            console.log('🤖 Topic updated:', event.detail.topic);
        });

        console.log('🔗 Event coordination configured');
    }

    // Set up UI integration
    function setupUIIntegration() {
        // Enhance button click handlers with coordination
        const speechButton = document.getElementById('toggleSpeech');
        const audioButton = document.getElementById('toggleAudio');
        const serialButton = document.getElementById('connectArduino');
        const aiButton = document.getElementById('toggleAI');

        if (speechButton) {
            speechButton.addEventListener('click', function() {
                coordinatedSpeechToggle();
            });
        }

        if (audioButton) {
            audioButton.addEventListener('click', function() {
                coordinatedAudioToggle();
            });
        }

        if (serialButton) {
            serialButton.addEventListener('click', function() {
                coordinatedSerialToggle();
            });
        }

        if (aiButton) {
            aiButton.addEventListener('click', function() {
                coordinatedAIToggle();
            });
        }

        console.log('🖥️ UI integration configured');
    }

    // Coordinated system toggles
    function coordinatedSpeechToggle() {
        if (systemsReady.speech && window.speechModule) {
            const status = window.speechModule.getStatus();
            
            if (!status.isListening) {
                // Start speech recognition and related systems
                window.speechModule.start();
                
                // Auto-start AI if available
                if (systemsReady.ai && window.aiModule) {
                    window.aiModule.start();
                }
                
                logStatus('Speech system activated');
            } else {
                window.speechModule.stop();
                logStatus('Speech system deactivated');
            }
        }
    }

    function coordinatedAudioToggle() {
        if (systemsReady.audio && window.audioModule) {
            window.audioModule.toggle();
            logStatus('Audio direction system toggled');
        }
    }

    function coordinatedSerialToggle() {
        if (systemsReady.serial && window.serialModule) {
            const status = window.serialModule.getStatus();
            
            if (!status.connected) {
                window.serialModule.connect();
                logStatus('Arduino connection initiated');
            } else {
                window.serialModule.disconnect();
                logStatus('Arduino disconnected');
            }
        }
    }

    function coordinatedAIToggle() {
        if (systemsReady.ai && window.aiModule) {
            window.aiModule.toggle();
            logStatus('AI summarization toggled');
        }
    }

    // Auto-start recommended systems
    function autoStartSystems() {
        console.log('🚀 Auto-starting systems...');
        
        try {
            // Start audio direction detection
            if (systemsReady.audio && window.audioModule) {
                window.audioModule.init().then(() => {
                    console.log('👂 Audio direction auto-started');
                });
            }
            
            // Initialize speech recognition (don't start listening yet)
            if (systemsReady.speech && window.speechModule) {
                window.speechModule.init();
                console.log('🎤 Speech recognition initialized');
            }
            
            // Initialize AI summarization
            if (systemsReady.ai && window.aiModule) {
                window.aiModule.init();
                console.log('🤖 AI summarization initialized');
            }
            
            logStatus('Core systems auto-started');
            
        } catch (error) {
            console.error('❌ Error auto-starting systems:', error);
            logStatus('Auto-start failed: ' + error.message);
        }
    }

    // Attempt error recovery
    function attemptErrorRecovery(error) {
        console.log('🔄 Attempting error recovery...');
        
        // Reset unstable systems
        if (error.message.includes('speech') || error.message.includes('recognition')) {
            if (systemsReady.speech && window.speechModule) {
                try {
                    window.speechModule.stop();
                    setTimeout(() => window.speechModule.init(), 1000);
                    console.log('🔄 Speech system reset');
                } catch (recoveryError) {
                    console.error('❌ Speech recovery failed:', recoveryError);
                }
            }
        }
        
        // Similar recovery for other systems...
    }

    // Shutdown all systems gracefully
    function shutdownAllSystems() {
        console.log('🛑 Shutting down all systems...');
        
        try {
            if (systemsReady.speech && window.speechModule) {
                window.speechModule.stop();
            }
            
            if (systemsReady.audio && window.audioModule) {
                window.audioModule.cleanup();
            }
            
            if (systemsReady.serial && window.serialModule) {
                window.serialModule.disconnect();
            }
            
            if (systemsReady.ai && window.aiModule) {
                window.aiModule.stop();
            }
            
            logStatus('All systems shutdown');
            console.log('✅ Shutdown complete');
            
        } catch (error) {
            console.error('❌ Error during shutdown:', error);
        }
    }

    // Check system health
    function checkSystemHealth() {
        let healthyCount = 0;
        const totalSystems = Object.keys(systemsReady).length;
        
        for (const [name, ready] of Object.entries(systemsReady)) {
            if (ready) healthyCount++;
        }
        
        const healthPercentage = Math.round((healthyCount / totalSystems) * 100);
        
        if (healthPercentage < 50) {
            console.warn('⚠️ System health critical:', healthPercentage + '%');
            logStatus(`System health: ${healthPercentage}% - Some features unavailable`);
        }
    }

    // Log performance statistics
    function logPerformanceStats() {
        const uptime = Math.round((Date.now() - performanceStats.startTime) / 1000);
        
        console.log('📊 Performance Stats:', {
            uptime: uptime + 's',
            speechEvents: performanceStats.speechEvents,
            directionEvents: performanceStats.directionEvents,
            topicUpdates: performanceStats.topicUpdates,
            arduinoCommands: performanceStats.arduinoCommands,
            errors: performanceStats.errors
        });
    }

    // Log system status
    function logSystemStatus() {
        console.log('🔍 System Status:', systemsReady);
        
        const readySystems = Object.entries(systemsReady)
            .filter(([, ready]) => ready)
            .map(([name]) => name);
            
        logStatus(`Ready: ${readySystems.join(', ')}`);
    }

    // Log status to UI
    function logStatus(message) {
        if (window.updateStatusText) {
            window.updateStatusText(message);
        }
        console.log('📱 Status:', message);
    }

    // Get comprehensive system status
    function getSystemStatus() {
        const status = {
            manager: {
                initialized: isInitialized,
                uptime: Date.now() - performanceStats.startTime,
                performance: performanceStats
            },
            systems: {}
        };

        // Collect status from all subsystems
        if (systemsReady.speech && window.speechModule) {
            status.systems.speech = window.speechModule.getStatus();
        }
        
        if (systemsReady.audio && window.audioModule) {
            status.systems.audio = window.audioModule.getStatus();
        }
        
        if (systemsReady.serial && window.serialModule) {
            status.systems.serial = window.serialModule.getStatus();
        }
        
        if (systemsReady.ai && window.aiModule) {
            status.systems.ai = window.aiModule.getStatus();
        }

        return status;
    }

    // Export AR Manager to global scope
    window.arManager = {
        init: initializeARManager,
        shutdown: shutdownAllSystems,
        getStatus: getSystemStatus,
        logStatus: logStatus,
        config: config,
        stats: performanceStats
    };

    // Auto-initialize when DOM is ready
    document.addEventListener('DOMContentLoaded', function() {
        console.log('🎮 AR Manager Module Loaded');
        
        // Small delay to ensure all modules are loaded
        setTimeout(initializeARManager, 500);
    });

    // Cleanup on page unload
    window.addEventListener('beforeunload', function() {
        shutdownAllSystems();
    });

    console.log('✅ ClearPath AR Manager Module Ready');

})();