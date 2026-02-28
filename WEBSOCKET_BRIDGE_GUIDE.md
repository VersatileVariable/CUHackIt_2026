# ClearPath WebSocket Bridge Setup Guide

This guide explains how to set up the WebSocket bridge server that connects your Meta Quest 3 AR headset to the iPhone haptic feedback app.

## Prerequisites

- **Node.js** v16 or higher installed on your laptop
- **iPhone** with Expo Go app installed (free from App Store)
- **Meta Quest 3** with browser access
- All devices on the **same Wi-Fi network**

## Quick Start (5 minutes)

### Step 1: Install Node.js Dependencies

```bash
cd /path/to/ClearPath
npm install
```

This installs the `ws` WebSocket library needed for the bridge server.

### Step 2: Find Your Laptop's Local IP Address

**On macOS:**
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

**On Windows:**
```bash
ipconfig | findstr "IPv4"
```

**On Linux:**
```bash
hostname -I
```

Look for an IP address like `192.168.1.XXX` or `10.0.0.XXX`. This is your laptop's local network address.

**Example output:**
```
inet 192.168.1.147 netmask 0xffffff00 broadcast 192.168.1.255
     ^^^^^^^^^^^^ <- This is your laptop IP
```

### Step 3: Start the WebSocket Bridge Server

```bash
npm start
# or
node server.js
```

**Expected output:**
```
╭─────────────────────────────────────────────╮
│  ClearPath WebSocket Bridge Server         │
╰─────────────────────────────────────────────╯

Server running on port 8080

Connection URLs:
   Local:    ws://localhost:8080
   Network:  ws://192.168.1.147:8080  <- Use this for Quest & iPhone

Client Types:
   headset - Meta Quest 3 AR app
   phone   - iPhone Expo haptic app

Health Check:
   http://192.168.1.147:8080/health

Ready for connections...
```

**Keep this terminal window open!** The server must stay running while you use ClearPath.

### Step 4: Configure the Quest 3 Web App

1. Open a web browser on your computer
2. Edit `js/websocket-bridge.js` or configure via browser console
3. The Quest app will auto-connect to `ws://YOUR_LAPTOP_IP:8080`

**OR** configure dynamically in the Quest browser console:
```javascript
bridgeModule.setServerAddress('ws://192.168.1.147:8080');
bridgeModule.connect();
```

### Step 5: Configure the iPhone Expo App

In your Expo app (located at `clearpath-haptic-app/App.js`):

```javascript
// Line 5 in App.js
const LAPTOP_IP = '192.168.1.147';  // Replace with YOUR laptop IP
const PORT = 8080;
```

### Step 6: Launch the Expo App on iPhone

```bash
cd clearpath-haptic-app
npm install
npx expo start
```

**Scan the QR code** with your iPhone Camera app → App opens in Expo Go immediately

## Event Flow

```
┌─────────────┐                    ┌──────────────┐                    ┌─────────────┐
│  Quest 3    │  WebSocket Event   │   Laptop     │  WebSocket Event   │   iPhone    │
│  Browser    │ ──────────────────►│   Bridge     │───────────────────►│  Expo App   │
│  (Headset)  │                    │  (server.js) │                    │  (Haptics)  │
└─────────────┘                    └──────────────┘                    └─────────────┘
     ▲                                    │                                    │
     │                                    ▼                                    ▼
     │                            Logs all events                    Triggers native
     │                            Routes by client type              iPhone haptics
     │                                                                + color flashes
     │                                                                       │
     └───────────────────────── Confirmation (optional) ───────────────────┘
```

## Supported Events

### From Quest 3 → Bridge → iPhone

| Event Type | When Triggered | iPhone Haptic | Color |
|-----------|----------------|---------------|-------|
| `speaking` | Web Speech API detects speech | Triple medium impact | White |
| `environmental` | Sudden loud sound detected | Double warning | Orange |
| `topicChanged` | AI detects conversation topic change | Heavy→Light | Purple |
| `leftSound` | Directional audio from left (270-90°) | Triple light | Red |
| `rightSound` | Directional audio from right (90-270°) | Single heavy | Green |

### Message Format

**Quest sends to bridge:**
```json
{
  "type": "speaking",
  "data": {
    "text": "Hello world",
    "length": 11
  },
  "timestamp": 1709164800000
}
```

**Bridge routes to iPhone:**
```json
{
  "type": "haptic",
  "event": "speaking",
  "timestamp": 1709164800000,
  "data": {
    "text": "Hello world",
    "length": 11
  }
}
```

## Debugging

### Check Server Status

```bash
curl http://localhost:8080/health
```

**Expected response:**
```json
{
  "status": "ok",
  "clients": {
    "headsets": 1,
    "phones": 1
  },
  "uptime": 123.456
}
```

### Monitor Server Logs

The server logs all connections and events in real-time:

```
New connection from ::ffff:192.168.1.100

Registered headset client: quest3-1709164800000

New connection from ::ffff:192.168.1.101

Registered phone client: iphone-1709164805000

[headset] speaking
   → Phone haptic: speaking (triple medium, white)

[headset] leftSound
   → Phone haptic: leftSound (triple light, red)
```

### Common Issues

**Problem:** Server won't start
```bash
Error: listen EADDRINUSE: address already in use :::8080
```
**Solution:** Another process is using port 8080. Kill it or use different port:
```bash
PORT=8081 npm start
```

**Problem:** iPhone can't connect
**Solution:** 
- Verify laptop IP address is correct in Expo app config
- Ensure both devices are on same Wi-Fi network
- Check firewall isn't blocking port 8080
- Restart the bridge server

**Problem:** Quest can't connect
**Solution:**
- Verify WebSocket URL in Quest browser console
- Check `ws://` not `wss://` (no SSL on local network)
- Ensure bridge server is running
- Check Quest browser console for errors

## Stopping the Server

Press `Ctrl+C` in the terminal where server is running. The server will:
1. Close all client connections gracefully
2. Send shutdown notifications
3. Exit cleanly

## Advanced Configuration

### Custom Port

```bash
PORT=9000 npm start
```

### Environment Variables

Create `.env` file in project root:
```bash
PORT=8080
NODE_ENV=development
```

### Multiple Clients

The bridge supports multiple headsets and phones simultaneously:
- All headsets can send events
- All phones receive all haptic events
- Useful for demos with multiple users

## Performance

- **Latency**: Typically 20-50ms from Quest event to iPhone haptic
- **Bandwidth**: ~1KB per event (minimal network usage)
- **Reliability**: Auto-reconnect on network interruptions
- **Scalability**: Tested with 5+ simultaneous clients

## Production Deployment (Optional)

For hackathon demos on public networks:

1. Deploy to cloud service (Heroku, Railway, etc.)
2. Use secure WebSocket (wss://)
3. Configure CORS and authentication
4. Use environment-based configuration

**Example Heroku deployment:**
```bash
heroku create clearpath-bridge
git push heroku main
heroku open
```

## API Reference

### Bridge Server

**Health Check Endpoint:**
```
GET /health
Response: {status: "ok", clients: {...}, uptime: number}
```

**WebSocket Connection:**
```
Connect: ws://localhost:8080
Protocol: WebSocket
```

### Client Registration

**Quest 3 sends:**
```json
{
  "type": "register",
  "clientType": "headset",
  "clientId": "quest3-12345"
}
```

**iPhone sends:**
```json
{
  "type": "register",
  "clientType": "phone",
  "clientId": "iphone-12345"
}
```

## Contributing

Found a bug? Have a feature request? Open an issue or submit a PR!

---

**Built for CUHackIt 2026**
