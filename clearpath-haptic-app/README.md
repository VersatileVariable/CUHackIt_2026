# ClearPath Haptic Belt - iPhone App

React Native Expo app that provides native haptic feedback for the ClearPath AR accessibility system.

## Quick Start

### 1. Configure Your Laptop IP Address

**Find your laptop's local IP:**
```bash
# On macOS
ifconfig | grep "inet " | grep -v 127.0.0.1

# Example output: inet 192.168.1.147
```

**Update App.js:**
Open `App.js` and replace the `LAPTOP_IP` constant:
```javascript
const LAPTOP_IP = '192.168.1.147';  // Your actual laptop IP
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start Expo Development Server

```bash
npx expo start
```

This will display a QR code in your terminal.

### 4. Load on iPhone

1. **Install Expo Go** from the App Store (free)
2. **Open iPhone Camera app**
3. **Scan the QR code** displayed in terminal
4. App loads instantly in Expo Go - no build required!

## Features

- **WebSocket Connection** - Connects to laptop bridge server automatically
- **Auto-Reconnect** - Recovers from network interruptions
- **Native Haptics** - Uses iPhone's Taptic Engine
- **Full-Screen Flashes** - Color-coded visual feedback
- **Connection Status** - Green/red dot shows connection state

## Haptic Events

| Event | Haptic Pattern | Color Flash |
|-------|----------------|-------------|
| `speaking` | Triple medium impact | White |
| `environmental` | Double warning notification | Orange |
| `topicChanged` | Heavy → Light impact | Purple |
| `leftSound` | Triple light impact | Red |
| `rightSound` | Single heavy impact | Green |

## Configuration

Edit `App.js` to customize:

```javascript
const LAPTOP_IP = '192.168.X.X';  // Your laptop's local IP
const PORT = 8080;                 // Bridge server port

const COLORS = {
  idle: '#1a1a2e',
  speaking: '#ffffff',
  // ... customize colors
};
```

## Troubleshooting

**App shows "Reconnecting...":**
- Check laptop IP address is correct in `App.js`
- Verify bridge server is running (`npm start` in main project)
- Ensure iPhone and laptop are on same Wi-Fi network

**No haptics:**
- Check iPhone is not in silent mode
- Verify Haptics enabled in Settings > Sounds & Haptics
- Make sure app has permission to access haptics

**Can't scan QR code:**
- Try `npx expo start --tunnel` for tunnel connection
- Or manually enter URL in Expo Go app

## File Structure

```
clearpath-haptic-app/
├── App.js           # Main app component with WebSocket logic
├── app.json         # Expo configuration
├── package.json     # Dependencies
└── README.md        # This file
```

## Integration with ClearPath

1. Start laptop bridge server: `npm start` (in main project directory)
2. Launch this app: `npx expo start` (in clearpath-haptic-app/)
3. Scan QR code with iPhone
4. Open Quest 3 AR app
5. All haptic events from Quest → Laptop → iPhone automatically

## System Requirements

- **iPhone**: iOS 13.4 or later
- **Network**: Wi-Fi connection (same network as laptop)
- **App**: Expo Go (free, no developer account needed)

## Demo Mode

Want to test without Quest 3? Send test events from bridge server console:

```javascript
// In bridge server (server.js), add test route:
// Send test speaking event to all phones
broadcast({ type: 'haptic', event: 'speaking' }, 'phone');
```

---

**Built for CUHackIt 2026**
