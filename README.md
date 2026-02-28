# ClearPath - AR Accessibility Wearable

![ClearPath Logo](https://img.shields.io/badge/ClearPath-AR%20Accessibility-blue?style=for-the-badge)
![Hackathon](https://img.shields.io/badge/CUHackIt%202026-24%20Hour%20Hackathon-green?style=for-the-badge)
![Categories](https://img.shields.io/badge/Categories-Hack%20for%20Good%20|%20Best%20Hardware%20|%20Best%20Execution%20|%20Most%20Innovative-orange?style=for-the-badge)

## Project Overview

ClearPath is a revolutionary AR accessibility system designed for deaf, hard of hearing, and cognitively impaired users. Using the Meta Quest 3's passthrough AR capability, ClearPath overlays real-time information directly in the user's field of vision, paired with a companion haptic belt clip for tactile feedback.

### Target Users
- **Deaf and Hard of Hearing** - Live captions and directional sound indicators
- **Cognitively Impaired** - Persistent context dashboard with conversation context

## Features

### AR Visual Layers
1. **Directional Noise Indicators** - Colored ambient glows showing sound direction
2. **Topic of Conversation Box** - AI-generated summary of last 30 seconds
3. **Live Caption Bar** - Real-time speech transcription (lower third positioning)
4. **Dashboard Panel** - Person identification and relationship context

### Hardware Components
- **iPhone Haptic Device** - React Native Expo app providing native haptic feedback via Taptic Engine
- **Meta Quest 3** - AR headset with passthrough mode for visual overlays
- **Laptop/Computer** - WebSocket bridge server for routing events
- **Microphone** - Built-in audio for speech recognition and directional detection

## Tech Stack

### Software
- **WebXR + A-Frame** - AR overlay system (browser-based, no Unity needed)
- **Web Speech API** - Real-time speech-to-text transcription
- **Meta Quest 3 Browser** - Passthrough AR environment
- **AI Summarization API** - Conversation topic generation

### Hardware
- **Meta Quest 3** - AR headset with passthrough mode
- **iPhone** - Running Expo Go app for native haptic feedback
- **Laptop/Computer** - Runs WebSocket bridge server (Node.js)
- **Logitech Webcam** - Environmental sound direction detection

## Project Structure

```
ClearPath/
├── index.html                 # Main WebXR + A-Frame AR application
├── server.js                  # WebSocket bridge server (Node.js)
├── package.json               # Node.js dependencies for bridge server
├── start-https-server.py      # HTTPS server with SSL certificates
├── cert.pem, key.pem          # SSL certificates (generated locally)
├── deploy.sh, deploy-vercel.sh # Deployment scripts
├── css/
│   └── ar-styles.css          # AR UI design system
├── js/
│   ├── ar-manager.js          # AR overlay management
│   ├── speech-recognition.js  # Web Speech API integration
│   ├── websocket-bridge.js    # WebSocket client for Quest 3
│   ├── audio-direction.js     # Webcam audio direction detection
│   ├── ai-summarizer.js       # Conversation topic generation
│   └── quest-compatibility.js # Quest browser fallbacks
├── clearpath-haptic-app/      # React Native Expo iPhone app
│   ├── App.js                 # Main haptic feedback component
│   ├── app.json               # Expo configuration
│   ├── package.json           # Expo dependencies
│   └── quick-start.sh         # Quick setup script
└── README.md                  # This file
```

## Getting Started
Prerequisites
- **Meta Quest 3** with passthrough AR capability
- **iPhone** with Expo Go app installed (free from App Store)
- **Laptop/Computer** with Node.js v16+ installed
- All devices on the same Wi-Fi network

### Network Architecture
```
Quest 3 Browser ──► WebSocket Bridge (Laptop) ──► iPhone Expo App
    (Events)              :8080                    (Haptics)
```

## Quick Start

### 1. Install Dependencies
### 1. iPhone Haptic App Setup (Recommended)

```bash
cd /path/to/ClearPath
npm install
```

### 2. Configure iPhone Haptic App

Update the WebSocket URL in the Expo app:
```bash
cd clearpath-haptic-app
npm install
```

Edit `clearpath-haptic-app/App.js` and set your laptop's IP address:
```javascript
const LAPTOP_IP = '192.168.1.XXX';  // Replace with your laptop IP
```

Find your laptop's IP:
```bash
# macOS: ifconfig | grep "inet " | grep -v 127.0.0.1
# Windows: ipconfig | findstr "IPv4"
# Linux: hostname -I
```

### 3. Start WebSocket Bridge Server
```bash
npm start
# Server runs on ws://YOUR_IP:8080
```

### 4. Launch iPhone Haptic App
```bash
cd clearpath-haptic-app
npx expo start
```
Scan the QR code with your iPhone Camera app to open in Expo Go.

### 5. Deploy AR Interface (Choose Based on Your Needs)

#### Option A: Public Cloud Deployment - Vercel (Recommended for Demos)
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy to Vercel (automatic HTTPS)
vercel --prod

# Get URL like: https://clearpath-ar.vercel.app
# Open this URL in Quest 3 browser
```

**Available Features:**
- ✅ Speech Recognition & Live Captions
- ✅ Audio Direction Detection
- ✅ AI Topic Summarization
- ❌ iPhone Haptic Feedback (requires local network)

#### Option B: ngrok Tunnel (Public + Some Local Features)
```bash
# Install ngrok (if not installed)
brew install ngrok  # macOS

# Configure ngrok with auth token
ngrok config add-authtoken YOUR_TOKEN

# Start HTTPS server
python3 start-https-server.py  # Runs on localhost:5500

# In another terminal, start ngrok tunnel
ngrok http https://localhost:5500

# Copy the ngrok HTTPS URL (e.g., https://abc123.ngrok-free.dev)
# Open this URL in Quest 3 browser
```

**Available Features:**
- ✅ Speech Recognition & Live Captions
- ✅ Audio Direction Detection  
- ✅ AI Topic Summarization
- ❌ iPhone Haptic Feedback (requires local network)

#### Option C: Local Network (Full Feature Set)
```bash
# Start HTTPS server with SSL
python3 start-https-server.py

# Access at: https://YOUR_LOCAL_IP:5500
# Example: https://172.22.53.62:5500
```

**Available Features:**
- ✅ Speech Recognition & Live Captions
- ✅ Audio Direction Detection
- ✅ AI Topic Summarization
- ✅ iPhone Haptic Feedback via WebSocket Bridge

**Note:** Local network deployment requires all devices (Quest 3, iPhone, laptop) on the same Wi-Fi network.

### 6. Open AR App in Quest 3
- In Quest 3 browser, navigate to your deployment URL
- Grant microphone permissions when prompted
- Click "Start Speech Recognition" to begin

## Haptic Feedback Patterns

| Event Type | Haptic Pattern | Color Flash | Trigger |
|-----------|----------------|-------------|---------|
| `speaking` | Triple medium impact | White | User speaks (Web Speech API) |
| `environmental` | Double warning notification | Orange | Sudden loud sound detected |
| `topicChanged` | Heavy → Light impact | Purple | AI detects topic shift |
| `leftSound` | Triple light impact | Red | Audio from left (270-90°) |
| `rightSound` | Single heavy impact | Green | Audio from right (90-270°) |

## AR Interface Guide

### Visual Overlay Layers
1. **Caption Bar** (Lower third) - Real-time speech transcription
2. **Directional Indicators** (Edge glows) - Left (red) and right (green) sound indicators
3. **Topic Box** (Center-left) - AI-generated 30-second conversation summary
4. **Dashboard Panel** (Top right) - Connection status and system info

## WebSocket Bridge Architecture

```
┌─────────────────┐          WebSocket          ┌──────────────────┐
│   Quest 3 AR    │ ───────► ws://laptop:8080 ─►│  Laptop Bridge   │
│   (Headset)     │          (sends events)      │  (Node.js WS)    │
└─────────────────┘                              └────────┬─────────┘
                                                          │
                                                WebSocket │
                                                          ▼
                                                 ┌──────────────────┐
                                                 │  iPhone Expo App │
                                                 │ (Haptic Output)  │
                                                 └──────────────────┘
```

### Event Flow
1. Quest 3 detects event (speech, sound direction, topic change)
2. Quest sends to bridge via WebSocket with event type
3. Bridge routes to iPhone based on client type
4. iPhone triggers haptic pattern using expo-haptics
5. Full-screen color flash accompanies each haptic

## Browser Requirements

### Meta Quest 3 Browser
- **WebXR Support**: Required for AR functionality
- **Web Speech API**: Built-in browser support
- **Microphone Access**: Required for speech recognition
- **Camera Access**: Required for passthrough AR

## Demo Script

### Demo Steps
- **Meta Quest 3 Browser** - WebXR support for AR, Web Speech API for transcription
- **Microphone Access** - Required for speech recognition and audio direction
- **WebSocket Support** - For bridge communicationays correctly

## Competition Categories

- **Hack for Good** - Accessibility impact for underserved communities
- **Best Execution** - Polished end-to-end experience
- **Most Innovative** - Novel WebXR + haptic feedback approach

## Known Limitations

- **24-Hour Hackathon Project** - Prioritizes working demo over perfect code
- **Browser Dependencies** - Requires Web Speech API and WebAudio support
- **Network Requirements** - All devices must be on same Wi-Fi (or use ngrok tunnel)
- **AI Summarization** - Uses local fallback keyword extraction (can be extended with OpenAI/Claude)

## Team

- **Person 1 (Anna)** - AR frontend, WebXR, Web Speech API, all overlay layers
- **Person 2** - Expo haptic app, WebSocket bridge, audio direction, haptic feedback integration

## License

MIT License - Built for CUHackIt 2026 Hackathon

---

*Built with for accessibility during CUHackIt 2026*