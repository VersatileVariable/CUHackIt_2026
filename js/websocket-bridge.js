/**
 * ClearPath WebSocket Bridge Client
 * Connects Quest 3 AR app to laptop WebSocket server
 * Sends events that trigger iPhone haptic feedback
 */

(function() {
    'use strict';

    // WebSocket connection state
    let ws = null;
    let isConnected = false;
    let reconnectAttempts = 0;
    let reconnectTimer = null;
    let pingInterval = null;

    // Configuration
    const config = {
        // Default to localhost, can be overridden via setServerAddress()
        serverAddress: 'ws://localhost:8080',
        maxReconnectAttempts: 10,
        reconnectDelayMs: 3000,
        pingIntervalMs: 30000,
        clientType: 'headset',
        clientId: `quest3-${Date.now()}`
    };

    // Initialize WebSocket connection
    function connect() {
        if (isConnected && ws && ws.readyState === WebSocket.OPEN) {
            console.log('WebSocket already connected');
            return;
        }

        try {
            console.log(`Connecting to WebSocket bridge: ${config.serverAddress}`);
            updateStatus('Connecting to bridge server...');

            ws = new WebSocket(config.serverAddress);

            ws.onopen = handleOpen;
            ws.onmessage = handleMessage;
            ws.onclose = handleClose;
            ws.onerror = handleError;

        } catch (error) {
            console.error('Error creating WebSocket connection:', error);
            updateStatus('Failed to connect: ' + error.message);
            scheduleReconnect();
        }
    }

    // Handle connection open
    function handleOpen() {
        console.log('WebSocket connected to bridge server');
        isConnected = true;
        reconnectAttempts = 0;
        updateStatus('Bridge connected');

        // Register as headset client
        sendMessage({
            type: 'register',
            clientType: config.clientType,
            clientId: config.clientId,
            timestamp: Date.now()
        });

        // Start ping interval
        startPing();

        // Dispatch custom event
        document.dispatchEvent(new CustomEvent('websocketconnected', {
            detail: { serverAddress: config.serverAddress }
        }));
    }

    // Handle incoming messages
    function handleMessage(event) {
        try {
            const message = JSON.parse(event.data);

            switch (message.type) {
                case 'registered':
                    console.log(`Registered as ${message.clientType}: ${message.clientId}`);
                    updateStatus(`Registered: ${message.clientType}`);
                    break;

                case 'clientStatus':
                    console.log(`Connected clients - Headsets: ${message.headsets}, Phones: ${message.phones}`);
                    updateClientCount(message.headsets, message.phones);
                    break;

                case 'caption':
                    // Echo caption back (if needed for display)
                    document.dispatchEvent(new CustomEvent('bridgecaption', {
                        detail: {
                            text: message.text,
                            confidence: message.confidence,
                            timestamp: message.timestamp
                        }
                    }));
                    break;

                default:
                    console.log(`Received: ${message.type}`);
            }

        } catch (error) {
            console.error('Error parsing WebSocket message:', error);
        }
    }

    // Handle connection close
    function handleClose(event) {
        console.log(`WebSocket connection closed (code: ${event.code}, reason: ${event.reason})`);
        isConnected = false;
        stopPing();
        updateStatus('Bridge disconnected');

        // Dispatch custom event
        document.dispatchEvent(new CustomEvent('websocketdisconnected', {
            detail: { code: event.code, reason: event.reason }
        }));

        // Attempt reconnection if not a normal closure
        if (event.code !== 1000) {
            scheduleReconnect();
        }
    }

    // Handle connection error
    function handleError(error) {
        console.error('WebSocket error:', error);
        updateStatus('Bridge connection error');
    }

    // Schedule reconnection attempt
    function scheduleReconnect() {
        if (reconnectAttempts >= config.maxReconnectAttempts) {
            console.error('Max reconnection attempts reached');
            updateStatus('Bridge connection failed - manual reconnect needed');
            return;
        }

        reconnectAttempts++;
        console.log(`Scheduling reconnection attempt ${reconnectAttempts}/${config.maxReconnectAttempts} in ${config.reconnectDelayMs}ms`);
        updateStatus(`Reconnecting... (${reconnectAttempts}/${config.maxReconnectAttempts})`);

        reconnectTimer = setTimeout(() => {
            connect();
        }, config.reconnectDelayMs);
    }

    // Send message to server
    function sendMessage(message) {
        if (!isConnected || !ws || ws.readyState !== WebSocket.OPEN) {
            console.warn('Cannot send message - WebSocket not connected');
            return false;
        }

        try {
            ws.send(JSON.stringify(message));
            return true;
        } catch (error) {
            console.error('Error sending message:', error);
            return false;
        }
    }

    // Send haptic event to phone
    function sendHapticEvent(eventType, data = {}) {
        const validEvents = ['speaking', 'environmental', 'topicChanged', 'leftSound', 'rightSound'];
        
        if (!validEvents.includes(eventType)) {
            console.warn(`Invalid haptic event type: ${eventType}`);
            return false;
        }

        console.log(`Sending haptic event: ${eventType}`);
        
        return sendMessage({
            type: eventType,
            data: data,
            timestamp: Date.now()
        });
    }

    // Send caption update
    function sendCaption(text, confidence = 1.0) {
        return sendMessage({
            type: 'caption',
            text: text,
            confidence: confidence,
            timestamp: Date.now()
        });
    }

    // Start periodic ping
    function startPing() {
        stopPing();
        pingInterval = setInterval(() => {
            if (isConnected) {
                sendMessage({ type: 'ping', timestamp: Date.now() });
            }
        }, config.pingIntervalMs);
    }

    // Stop periodic ping
    function stopPing() {
        if (pingInterval) {
            clearInterval(pingInterval);
            pingInterval = null;
        }
    }

    // Disconnect from server
    function disconnect() {
        console.log('Disconnecting from bridge server...');
        
        stopPing();
        
        if (reconnectTimer) {
            clearTimeout(reconnectTimer);
            reconnectTimer = null;
        }

        if (ws) {
            ws.close(1000, 'Client disconnecting');
            ws = null;
        }

        isConnected = false;
        updateStatus('Disconnected from bridge');
    }

    // Set server address (must be called before connect)
    function setServerAddress(address) {
        if (isConnected) {
            console.warn('Cannot change server address while connected');
            return false;
        }

        // Validate WebSocket URL format
        if (!address.startsWith('ws://') && !address.startsWith('wss://')) {
            console.error('Invalid WebSocket URL - must start with ws:// or wss://');
            return false;
        }

        config.serverAddress = address;
        console.log(`Server address set to: ${address}`);
        return true;
    }

    // Update status display
    function updateStatus(message) {
        const statusEl = document.getElementById('bridgeStatus');
        if (statusEl) {
            statusEl.textContent = `Bridge: ${message}`;
            statusEl.className = isConnected ? 'status-item active' : 'status-item';
        }

        if (window.updateStatusText) {
            window.updateStatusText(message);
        }
    }

    // Update client count display
    function updateClientCount(headsets, phones) {
        const countEl = document.getElementById('bridgeClients');
        if (countEl) {
            countEl.textContent = `Clients: ${headsets} headset(s), ${phones} phone(s)`;
        }
    }

    // Public API
    const bridgeModule = {
        // Connection management
        connect: connect,
        disconnect: disconnect,
        isConnected: () => isConnected,
        setServerAddress: setServerAddress,

        // Event sending
        sendHapticEvent: sendHapticEvent,
        sendCaption: sendCaption,

        // Convenience methods for specific haptic events
        notifySpeaking: (data) => sendHapticEvent('speaking', data),
        notifyEnvironmental: (data) => sendHapticEvent('environmental', data),
        notifyTopicChanged: (data) => sendHapticEvent('topicChanged', data),
        notifyLeftSound: (data) => sendHapticEvent('leftSound', data),
        notifyRightSound: (data) => sendHapticEvent('rightSound', data),

        // Status
        getStatus: () => ({
            connected: isConnected,
            reconnectAttempts: reconnectAttempts,
            serverAddress: config.serverAddress,
            clientId: config.clientId
        })
    };

    // Export to global scope
    window.bridgeModule = bridgeModule;

    // Auto-initialize when DOM is ready
    document.addEventListener('DOMContentLoaded', function() {
        console.log('WebSocket Bridge Module Loaded');
        updateStatus('Ready to connect');
    });

    // Handle page unload
    window.addEventListener('beforeunload', function() {
        if (isConnected) {
            disconnect();
        }
    });

    console.log('ClearPath WebSocket Bridge Module Ready');

})();
