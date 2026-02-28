# 🚀 ClearPath AR Deployment & Testing Guide

## Overview
This guide covers deploying and testing your ClearPath AR accessibility system with the Meta Quest 3. The system consists of a WebXR frontend that runs in the Quest browser and communicates with Arduino hardware.

## 📋 Pre-Deployment Checklist

### Required Hardware
- ✅ **Meta Quest 3** with latest firmware
- ✅ **Arduino UNO R3** with USB cable  
- ✅ **SG90 Servo Motor** (for belt clip haptic feedback)
- ✅ **Active Buzzer** (audio feedback)
- ✅ **RGB LED** (visual status)
- ✅ **Computer** (for development server and Arduino programming)
- ✅ **3D Printed Belt Clip** (optional - see FUSION360_DESIGN_GUIDE.md)

### Software Requirements
- ✅ **Arduino IDE** (for uploading firmware)
- ✅ **Local Web Server** (Python, Node.js, or VS Code Live Server)
- ✅ **Meta Quest 3 Browser** with experimental features enabled

## 🌐 Step 1: Deploy Web Application

### Option A: Python HTTP Server (Recommended)
```bash
# Navigate to your project directory  
cd /Users/annagaleano/Code/Hackathon/CUHackIt_2026

# Start Python server on port 8000
python3 -m http.server 8000

# Your app will be available at:
# http://YOUR_COMPUTER_IP:8000
```

### Option B: VS Code Live Server Extension
1. Install "Live Server" extension in VS Code
2. Right-click on `index.html` → "Open with Live Server"
3. Note the local IP address (usually displayed in terminal)

### Option C: Node.js HTTP Server
```bash
# Install simple HTTP server globally
npm install -g http-server

# Navigate to project directory
cd /Users/annagaleano/Code/Hackathon/CUHackIt_2026

# Start server
http-server -p 8000 -c-1

# Note your computer's IP address for Quest access
```

### Find Your Computer's IP Address
```bash
# On macOS
ifconfig | grep "inet " | grep -v 127.0.0.1

# Look for something like: inet 192.168.1.XXX
```

## 🥽 Step 2: Configure Meta Quest 3 Browser

### Enable Experimental Web Features
1. **Put on Meta Quest 3**
2. **Open Browser app**
3. **Navigate to**: `chrome://flags/`
4. **Enable these flags**:
   - `#enable-webxr-passthrough` → **Enabled**
   - `#enable-web-serial` → **Enabled**  
   - `#enable-webxr-ar-module` → **Enabled**
   - `#enable-webxr` → **Enabled**
5. **Restart Browser** when prompted

### Grant Required Permissions
The app will request these permissions on first use:
- ✅ **Microphone Access** (for speech recognition)
- ✅ **Camera Access** (for passthrough AR)
- ✅ **Motion Sensors** (for head tracking)
- ✅ **Serial Port Access** (for Arduino communication)

## 🔌 Step 3: Set Up Arduino Hardware

### Upload Arduino Firmware
1. **Connect Arduino** to your computer via USB
2. **Open Arduino IDE**
3. **Load firmware**: `arduino/clearpath_wristband.ino`
4. **Select board**: Arduino UNO
5. **Select port**: (your Arduino's USB port)
6. **Upload code** (Ctrl+U or click upload button)

### Verify Arduino Connection 
```bash
# Open Serial Monitor in Arduino IDE (Tools → Serial Monitor)
# Set baud rate to 9600
# You should see boot messages like:
# "=== ClearPath Belt Clip Starting ==="
# "System initialized successfully"
```

### Hardware Wiring (Quick Setup)
If you don't have the 3D printed clip yet, breadboard setup:
```
Arduino UNO → Components:
Pin 9  → SG90 Servo Signal (Orange wire)
Pin 8  → Active Buzzer (+)  
Pin 6  → RGB LED Red
Pin 5  → RGB LED Green
Pin 3  → RGB LED Blue
5V     → Servo Power (Red) + Components +
GND    → Servo Ground (Brown) + All grounds
```

## 🧪 Step 4: Testing Procedure

### Phase 1: Web App Basic Test
1. **Connect Quest to WiFi** (same network as your computer)
2. **Open Quest Browser**
3. **Navigate to**: `http://YOUR_IP:8000/setup.html`
4. **Configure user profile** (name, relationships, etc.)
5. **Click "Save & Continue"** → Should redirect to main AR app

### Phase 2: WebXR AR Test  
1. **Grant all permissions** when prompted
2. **Click "Enter AR Mode"** button
3. **Verify AR overlays**:
   - Caption bar at bottom (should say "Speech recognition ready")
   - Edge glow indicators (left/right sides)
   - Topic box (center-left)
   - Dashboard panel (top-right with your configured info)

### Phase 3: Speech Recognition Test
1. **Click "Start Speech"** button (or say "Start listening")
2. **Speak clearly** → Should see real-time captions
3. **Check status**: Speech indicator should turn purple
4. **Test different phrases and volumes**

### Phase 4: Audio Direction Test
1. **Play audio/music** from different directions
2. **Move audio source**: left, right, front, back
3. **Verify edge glows**: 
   - Red glow for left side sounds
   - Green glow for right side sounds
   - Cyan glow for front/back sounds

### Phase 5: Arduino Integration Test
1. **Connect Arduino** to your computer via USB
2. **In Quest browser**: Click "Connect Serial" button
3. **Select Arduino** from device list  
4. **Test commands**:
   - Speak → Should trigger servo oscillation
   - Move audio → Should trigger directional patterns
   - Topic changes → Should trigger double pulse

### Phase 6: Full System Integration
1. **Start speech recognition**
2. **Have a conversation** while wearing Quest
3. **Play directional audio** from different sources
4. **Verify all components work together**:
   - ✅ Real-time captions appear
   - ✅ Edge glows respond to audio direction  
   - ✅ Arduino belt clip provides haptic feedback
   - ✅ Topic summarization updates context
   - ✅ All status indicators working

## ❌ Troubleshooting Common Issues

### WebXR Not Working
```
Problem: AR mode button doesn't appear
Solution: 
1. Verify Quest browser flags are enabled
2. Ensure HTTPS or localhost (WebXR security requirement)
3. Check browser console (F12) for errors
4. Try refreshing page after flag changes
```

### Arduino Not Connecting
```
Problem: Serial connection fails in Quest browser  
Solution:
1. Verify Arduino firmware uploaded successfully
2. Check USB cable (data cable, not charge-only)
3. Close Arduino IDE Serial Monitor (conflicts with browser)
4. Try different USB port
5. Restart Arduino (unplug/replug USB)
```

### Speech Recognition Not Working
```
Problem: No captions appear when speaking
Solution:
1. Grant microphone permission in Quest browser
2. Check internet connection (Web Speech API requires online)
3. Speak clearly and loudly
4. Try different browser languages in settings
5. Check browser console for API errors
```

### Audio Direction Detection Issues
```
Problem: Edge glows not responding to directional audio
Solution: 
1. Ensure microphone access granted
2. Test with clear, distinct audio sources
3. Move audio source slowly between positions  
4. Check volume levels (too quiet may not register)
5. Verify webcam/microphone not used by other apps
```

### Servo Haptic Feedback Problems
```
Problem: Belt clip servo not oscillating
Solution:
1. Check servo wiring (signal to pin 9, power to 5V)
2. Verify servo has adequate power supply
3. Test servo manually in Arduino IDE Serial Monitor
4. Send test commands: "STATUS_CHECK", "RESET"
5. Check for loose connections
```

## 🔧 Development Testing Tips

### Browser Console Debugging
Press **F12** in Quest browser to see:
```javascript
// Look for these successful connection messages:
console.log("✅ WebXR AR initialized")  
console.log("🎙️ Speech recognition active")
console.log("🔗 Arduino connected successfully")
console.log("📍 Audio direction detected: LEFT")
```

### Arduino Serial Monitor Testing
Send manual commands to test individual functions:
```
SPEECH_START        → Purple LED + servo pulse
DIRECTION_LEFT      → Red LED + left pattern  
DIRECTION_RIGHT     → Green LED + right pattern
ENVIRONMENTAL_SOUND → Blue LED + sustained pulse
STATUS_CHECK        → System diagnostics
RESET               → Full system restart
```

### Testing Without Quest (Development Mode)
For faster development iteration:
1. **Open in desktop browser**: `http://localhost:8000`
2. **Enable device emulation** (F12 → Device toolbar)  
3. **Test individual modules** without full AR
4. **Use browser console** for debugging
5. **Test Arduino communication** separately

## 📱 Mobile/Quest Browser Differences

### Performance Optimization
- **Quest 3 browser** is essentially Chrome but with limited resources
- **Reduce visual complexity** during development
- **Test frame rates** with Quest development tools
- **Optimize A-Frame scenes** for mobile performance

### Touch vs Hand Tracking
```javascript
// The code supports both input methods:
// Touch: Tap buttons on virtual panels  
// Voice: Speech commands for hands-free operation
// Hand tracking: Point and pinch gestures (if enabled)
```

## 🎯 Demo Day Preparation

### 5-Minute Setup Checklist
1. **✅ Start local server** (`python3 -m http.server 8000`)
2. **✅ Connect Arduino** and verify serial output  
3. **✅ Quest browser** → Navigate to setup page
4. **✅ Configure demo profile** (judge/tester info)
5. **✅ Test all systems** (speech, audio, haptic, AR)

### Judge Demo Script
```
1. [30s] System Overview & Accessibility Mission
   → "ClearPath helps deaf/hard of hearing users..."

2. [60s] Live Speech + Directional Audio Demo  
   → Show real-time captions + edge glow responses

3. [60s] Belt Clip Haptic + Topic Summarization
   → Demonstrate servo patterns + AI topic detection  

4. [30s] Technical Innovation & Questions
   → "WebXR + Arduino direct communication..."
```

### Backup Plans
- **No Arduino**: Demo works in "simulation mode" (visual only)  
- **Quest Issues**: Desktop browser with device emulation
- **Network Problems**: Local server with mobile hotspot
- **Servo Problems**: Active buzzer still provides audio haptic feedback

## 🔒 Security & Privacy Notes

### Data Handling
- **Speech data**: Processed locally, not stored permanently
- **Audio direction**: Real-time processing only  
- **Personal info**: Stored in browser localStorage only  
- **Arduino communication**: Local serial only (no network)

### Permission Management
```javascript
// All browser permissions are explicitly requested:
navigator.mediaDevices.getUserMedia()    // Microphone
navigator.xr.requestSession()            // AR/VR  
navigator.serial.requestPort()           // Arduino communication
```

Your ClearPath AR system is now ready for deployment and testing! 🚀✨

---

**Next Steps**: Start with Phase 1 testing and work through each phase systematically. The system is designed to work even if some components fail, so you can demo successfully even with partial functionality.