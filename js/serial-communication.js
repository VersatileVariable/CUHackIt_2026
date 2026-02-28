/**
 * ClearPath Serial Communication Module
 * Handles Web Serial API integration for Arduino wristband communication
 * Designed for Meta Quest 3 browser compatibility
 */

(function() {
    'use strict';

    // Serial Communication State
    let port = null;
    let reader = null;
    let writer = null;
    let isConnected = false;
    let reconnectAttempts = 0;
    let commandQueue = [];
    let isProcessingQueue = false;

    // Configuration
    const config = {
        baudRate: 9600,
        dataBits: 8,
        parity: 'none',
        stopBits: 1,
        flowControl: 'none',
        maxReconnectAttempts: 3,
        commandDelayMs: 100,
        responseTimeoutMs: 2000
    };

    // Arduino command mappings
    const COMMANDS = {
        SPEECH_START: 'SPEECH_START',
        SPEECH_END: 'SPEECH_END', 
        SPEECH_DETECTED: 'SPEECH_DETECTED',
        ENVIRONMENTAL_SOUND: 'ENVIRONMENTAL_SOUND',
        DIRECTION_LEFT: 'DIRECTION_LEFT',
        DIRECTION_RIGHT: 'DIRECTION_RIGHT',
        STATUS_CHECK: 'STATUS_CHECK',
        RESET: 'RESET'
    };

    // Initialize Web Serial API
    function initWebSerial() {
        // Check for Web Serial API support
        if (!('serial' in navigator)) {
            console.error('❌ Web Serial API not supported in this browser');
            updateStatus('Web Serial API not supported - enable in browser flags');
            return false;
        }

        console.log('📡 Web Serial API available');
        updateStatus('Web Serial API ready');
        return true;
    }

    // Connect to Arduino
    async function connectToArduino() {
        if (isConnected) {
            console.log('⚠️ Already connected to Arduino');
            return true;
        }

        if (!initWebSerial()) {
            return false;
        }

        try {
            // Request a port and open the connection
            console.log('📡 Requesting Arduino connection...');
            updateStatus('Connecting to Arduino...');

            port = await navigator.serial.requestPort();
            console.log('🔌 Port selected, opening connection...');

            await port.open({ 
                baudRate: config.baudRate,
                dataBits: config.dataBits,
                parity: config.parity,
                stopBits: config.stopBits,
                flowControl: config.flowControl
            });

            // Set up the TextEncoderStream and TextDecoderStream
            const textDecoder = new TextDecoderStream();
            const readableStreamClosed = port.readable.pipeTo(textDecoder.writable);
            reader = textDecoder.readable.getReader();

            const textEncoder = new TextEncoderStream();
            const writableStreamClosed = textEncoder.readable.pipeTo(port.writable);
            writer = textEncoder.writable.getWriter();

            isConnected = true;
            reconnectAttempts = 0;

            console.log('✅ Connected to Arduino');
            updateStatus('Connected to Arduino wristband');
            updateConnectionButton('Disconnect Wristband');

            // Start reading responses
            startReadingResponses();

            // Send status check
            await sendCommand(COMMANDS.STATUS_CHECK);

            return true;

        } catch (error) {
            console.error('❌ Error connecting to Arduino:', error);
            updateStatus('Failed to connect to Arduino: ' + error.message);
            
            if (error.name === 'NetworkError') {
                updateStatus('Arduino not found - check USB connection');
            } else if (error.name === 'SecurityError') {
                updateStatus('Permission denied - allow serial access');
            }
            
            return false;
        }
    }

    // Disconnect from Arduino
    async function disconnect() {
        if (!isConnected) {
            return;
        }

        try {
            console.log('📡 Disconnecting from Arduino...');
            updateStatus('Disconnecting...');

            // Cancel reader
            if (reader) {
                await reader.cancel();
                reader.releaseLock();
                reader = null;
            }

            // Close writer
            if (writer) {
                await writer.close();
                writer = null;
            }

            // Close port
            if (port) {
                await port.close();
                port = null;
            }

            isConnected = false;
            console.log('✅ Disconnected from Arduino');
            updateStatus('Disconnected from Arduino');
            updateConnectionButton('Connect Wristband');

        } catch (error) {
            console.error('❌ Error disconnecting:', error);
            updateStatus('Error disconnecting: ' + error.message);
        }
    }

    // Start reading responses from Arduino
    async function startReadingResponses() {
        try {
            while (isConnected && reader) {
                const { value, done } = await reader.read();
                
                if (done) {
                    console.log('📡 Arduino connection closed');
                    break;
                }

                if (value) {
                    handleArduinoResponse(value.trim());
                }
            }
        } catch (error) {
            console.error('❌ Error reading Arduino response:', error);
            
            if (isConnected) {
                // Attempt reconnection
                attemptReconnection();
            }
        }
    }

    // Handle responses from Arduino
    function handleArduinoResponse(response) {
        console.log('📨 Arduino response:', response);

        // Update status based on Arduino responses
        if (response.includes('Ready')) {
            updateStatus('Arduino wristband ready');
        } else if (response.includes('Error')) {
            updateStatus('Arduino error: ' + response);
        } else if (response.includes('Status')) {
            updateStatus('Arduino status received');
        }

        // Log specific command confirmations
        if (response.includes('Speech recognition started')) {
            console.log('🎤 Arduino confirmed speech start');
        } else if (response.includes('Speech detected')) {
            console.log('🎯 Arduino confirmed speech detection');
        } else if (response.includes('direction')) {
            console.log('🎯 Arduino confirmed directional feedback');
        }
    }

    // Send command to Arduino
    async function sendCommand(command) {
        if (!isConnected || !writer) {
            console.error('❌ Cannot send command - not connected');
            queueCommand(command);
            return false;
        }

        try {
            console.log('📤 Sending command to Arduino:', command);
            
            await writer.write(command + '\n');
            
            // Add delay between commands to prevent overwhelming Arduino
            await delay(config.commandDelayMs);
            
            return true;

        } catch (error) {
            console.error('❌ Error sending command:', error);
            updateStatus('Error sending command: ' + error.message);
            
            // Queue command for retry
            queueCommand(command);
            return false;
        }
    }

    // Queue command for when connection is restored
    function queueCommand(command) {
        if (commandQueue.length < 10) { // Limit queue size
            commandQueue.push(command);
            console.log('📋 Command queued:', command);
        }
    }

    // Process queued commands
    async function processCommandQueue() {
        if (isProcessingQueue || commandQueue.length === 0 || !isConnected) {
            return;
        }

        isProcessingQueue = true;
        console.log('📋 Processing command queue:', commandQueue.length, 'commands');

        while (commandQueue.length > 0 && isConnected) {
            const command = commandQueue.shift();
            await sendCommand(command);
            await delay(config.commandDelayMs);
        }

        isProcessingQueue = false;
    }

    // Attempt to reconnect to Arduino
    async function attemptReconnection() {
        if (reconnectAttempts >= config.maxReconnectAttempts) {
            console.error('❌ Max reconnection attempts reached');
            updateStatus('Connection lost - manual reconnection required');
            isConnected = false;
            updateConnectionButton('Connect Wristband');
            return;
        }

        reconnectAttempts++;
        console.log(`🔄 Attempting reconnection ${reconnectAttempts}/${config.maxReconnectAttempts}...`);
        updateStatus(`Reconnecting... (${reconnectAttempts}/${config.maxReconnectAttempts})`);

        // Wait before retry
        await delay(2000);

        try {
            await connectToArduino();
            
            if (isConnected) {
                // Process any queued commands
                processCommandQueue();
            }
            
        } catch (error) {
            console.error('❌ Reconnection failed:', error);
        }
    }

    // Update status display
    function updateStatus(message) {
        const statusEl = document.getElementById('arduinoStatus');
        if (statusEl) {
            statusEl.textContent = `Arduino: ${message}`;
            statusEl.className = isConnected ? 'status-item active' : 'status-item';
        }

        if (window.updateStatusText) {
            window.updateStatusText(message);
        }
    }

    // Update connection button text
    function updateConnectionButton(text) {
        const button = document.getElementById('connectArduino');
        if (button) {
            button.textContent = text;
        }
    }

    // Utility delay function
    function delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Public API for other modules
    const serialModule = {
        // Connection management
        connect: connectToArduino,
        disconnect: disconnect,
        isConnected: () => isConnected,
        
        // Command sending
        sendCommand: sendCommand,
        
        // Convenience methods for common commands
        notifySpeechStart: () => sendCommand(COMMANDS.SPEECH_START),
        notifySpeechEnd: () => sendCommand(COMMANDS.SPEECH_END),
        notifySpeechDetected: () => sendCommand(COMMANDS.SPEECH_DETECTED),
        notifyEnvironmentalSound: () => sendCommand(COMMANDS.ENVIRONMENTAL_SOUND),
        notifyDirectionLeft: () => sendCommand(COMMANDS.DIRECTION_LEFT),
        notifyDirectionRight: () => sendCommand(COMMANDS.DIRECTION_RIGHT),
        requestStatus: () => sendCommand(COMMANDS.STATUS_CHECK),
        resetArduino: () => sendCommand(COMMANDS.RESET),
        
        // Status
        getStatus: () => ({
            connected: isConnected,
            queueLength: commandQueue.length,
            reconnectAttempts: reconnectAttempts
        })
    };

    // Export to global scope
    window.serialModule = serialModule;

    // Auto-initialize when DOM is ready
    document.addEventListener('DOMContentLoaded', function() {
        console.log('📡 Serial Communication Module Loaded');
        
        // Initialize Web Serial API check
        initWebSerial();
        
        // Set up periodic queue processing
        setInterval(processCommandQueue, 1000);
        
        updateStatus('Ready to connect');
    });

    // Handle page unload
    window.addEventListener('beforeunload', async function() {
        if (isConnected) {
            await disconnect();
        }
    });

    console.log('✅ ClearPath Serial Communication Module Ready');

})();