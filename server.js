#!/usr/bin/env node

/**
 * ClearPath WebSocket Bridge Server
 * 
 * Bridges Quest 3 AR headset and iPhone haptic app
 * - Receives events from Quest 3 (speech, audio direction, topics)
 * - Broadcasts haptic events to iPhone Expo app
 * - Sends caption updates to headset
 */

const WebSocket = require('ws');
const http = require('http');
const os = require('os');

const PORT = process.env.PORT || 8080;

// Create HTTP server for health check
const server = http.createServer((req, res) => {
    if (req.url === '/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
            status: 'ok', 
            clients: {
                headsets: Array.from(clients.values()).filter(c => c.type === 'headset').length,
                phones: Array.from(clients.values()).filter(c => c.type === 'phone').length
            },
            uptime: process.uptime()
        }));
    } else {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('ClearPath WebSocket Bridge Server\nListening on port ' + PORT);
    }
});

// Create WebSocket server
const wss = new WebSocket.Server({ server });

// Client registry: Map<ws, {type: 'headset'|'phone', id: string}>
const clients = new Map();

// Get local IP addresses
function getLocalIPs() {
    const interfaces = os.networkInterfaces();
    const ips = [];
    
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            // Skip internal/non-IPv4 addresses
            if (iface.family === 'IPv4' && !iface.internal) {
                ips.push(iface.address);
            }
        }
    }
    
    return ips;
}

// Broadcast message to specific client types
function broadcast(message, targetType = 'all') {
    const payload = JSON.stringify(message);
    let sentCount = 0;
    
    clients.forEach((clientInfo, ws) => {
        if (ws.readyState === WebSocket.OPEN) {
            if (targetType === 'all' || clientInfo.type === targetType) {
                ws.send(payload);
                sentCount++;
            }
        }
    });
    
    return sentCount;
}

// Handle new client connections
wss.on('connection', (ws, req) => {
    const clientIP = req.socket.remoteAddress;
    console.log(`\nNew connection from ${clientIP}`);
    
    // Temporary registration until we receive handshake
    const tempId = `temp-${Date.now()}`;
    clients.set(ws, { type: 'unknown', id: tempId });
    
    // Handle incoming messages
    ws.on('message', (data) => {
        try {
            const message = JSON.parse(data.toString());
            const clientInfo = clients.get(ws);
            
            // Handle client registration
            if (message.type === 'register') {
                const clientType = message.clientType; // 'headset' or 'phone'
                const clientId = message.clientId || `${clientType}-${Date.now()}`;
                
                clients.set(ws, { type: clientType, id: clientId });
                
                console.log(`Registered ${clientType} client: ${clientId}`);
                
                // Send confirmation
                ws.send(JSON.stringify({
                    type: 'registered',
                    clientType: clientType,
                    clientId: clientId,
                    serverTime: Date.now()
                }));
                
                // Notify all clients about connected clients
                broadcastClientStatus();
                return;
            }
            
            // Route messages based on client type and message type
            if (!clientInfo || clientInfo.type === 'unknown') {
                console.warn('Received message from unregistered client');
                return;
            }
            
            // Handle messages from headset
            if (clientInfo.type === 'headset') {
                handleHeadsetMessage(message, clientInfo);
            }
            
            // Handle messages from phone (if any - phone mostly receives)
            if (clientInfo.type === 'phone') {
                handlePhoneMessage(message, clientInfo);
            }
            
        } catch (error) {
            console.error('Error processing message:', error);
        }
    });
    
    // Handle client disconnect
    ws.on('close', () => {
        const clientInfo = clients.get(ws);
        if (clientInfo) {
            console.log(`\nDisconnected: ${clientInfo.type} ${clientInfo.id}`);
            clients.delete(ws);
            broadcastClientStatus();
        }
    });
    
    // Handle errors
    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
    });
});

// Handle messages from Quest 3 headset
function handleHeadsetMessage(message, clientInfo) {
    console.log(`[${clientInfo.type}] ${message.type || 'unknown'}`);
    
    switch (message.type) {
        case 'speaking':
            // User is speaking - send haptic to phone
            broadcast({
                type: 'haptic',
                event: 'speaking',
                timestamp: Date.now(),
                data: message.data
            }, 'phone');
            console.log('   → Phone haptic: speaking (triple medium, white)');
            break;
            
        case 'environmental':
            // Environmental sound detected
            broadcast({
                type: 'haptic',
                event: 'environmental',
                timestamp: Date.now(),
                data: message.data
            }, 'phone');
            console.log('   → Phone haptic: environmental (double warning, orange)');
            break;
            
        case 'topicChanged':
            // AI detected topic change
            broadcast({
                type: 'haptic',
                event: 'topicChanged',
                timestamp: Date.now(),
                data: message.data
            }, 'phone');
            console.log('   → Phone haptic: topicChanged (heavy+light, purple)');
            break;
            
        case 'leftSound':
            // Sound from left direction
            broadcast({
                type: 'haptic',
                event: 'leftSound',
                timestamp: Date.now(),
                data: message.data
            }, 'phone');
            console.log('   → Phone haptic: leftSound (triple light, red)');
            break;
            
        case 'rightSound':
            // Sound from right direction
            broadcast({
                type: 'haptic',
                event: 'rightSound',
                timestamp: Date.now(),
                data: message.data
            }, 'phone');
            console.log('   → Phone haptic: rightSound (single heavy, green)');
            break;
            
        case 'caption':
            // Speech caption - can be sent to both headset (echo) and phone if needed
            broadcast({
                type: 'caption',
                text: message.text,
                confidence: message.confidence,
                timestamp: Date.now()
            }, 'headset');
            console.log(`   → Caption: "${message.text}"`);
            break;
            
        case 'ping':
            // Keep-alive ping
            break;
            
        default:
            console.warn(`   Unknown message type: ${message.type}`);
    }
}

// Handle messages from iPhone (if any)
function handlePhoneMessage(message, clientInfo) {
    console.log(`[${clientInfo.type}] ${message.type || 'unknown'}`);
    
    switch (message.type) {
        case 'hapticConfirm':
            // Phone confirming haptic was triggered
            console.log(`   Haptic confirmed: ${message.event}`);
            break;
            
        case 'ping':
            // Keep-alive ping
            break;
            
        default:
            console.warn(`   Unknown message type: ${message.type}`);
    }
}

// Broadcast current client status to all clients
function broadcastClientStatus() {
    const status = {
        type: 'clientStatus',
        headsets: Array.from(clients.values()).filter(c => c.type === 'headset').length,
        phones: Array.from(clients.values()).filter(c => c.type === 'phone').length,
        timestamp: Date.now()
    };
    
    broadcast(status, 'all');
}

// Start server
server.listen(PORT, () => {
    const localIPs = getLocalIPs();
    
    console.log('\n╭─────────────────────────────────────────────╮');
    console.log('│  ClearPath WebSocket Bridge Server         │');
    console.log('╰─────────────────────────────────────────────╯\n');
    console.log(`Server running on port ${PORT}\n`);
    console.log('Connection URLs:');
    console.log(`   Local:    ws://localhost:${PORT}`);
    
    localIPs.forEach(ip => {
        console.log(`   Network:  ws://${ip}:${PORT}`);
    });
    
    console.log('\nClient Types:');
    console.log('   headset - Meta Quest 3 AR app');
    console.log('   phone   - iPhone Expo haptic app');
    
    console.log('\nHealth Check:');
    localIPs.forEach(ip => {
        console.log(`   http://${ip}:${PORT}/health`);
    });
    
    console.log('\nReady for connections...\n');
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n\nShutting down server...');
    
    // Close all client connections
    clients.forEach((clientInfo, ws) => {
        ws.close(1000, 'Server shutting down');
    });
    
    // Close server
    wss.close(() => {
        server.close(() => {
            console.log('Server stopped');
            process.exit(0);
        });
    });
});

// Handle errors
process.on('uncaughtException', (error) => {
    console.error('Uncaught exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled rejection at:', promise, 'reason:', reason);
});
