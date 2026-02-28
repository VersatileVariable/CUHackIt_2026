# ClearPath - AR Accessibility Wearable

![ClearPath Logo](https://img.shields.io/badge/ClearPath-AR%20Accessibility-blue?style=for-the-badge)
![Hackathon](https://img.shields.io/badge/CUHackIt%202026-24%20Hour%20Hackathon-green?style=for-the-badge)
![Categories](https://img.shields.io/badge/Categories-Hack%20for%20Good%20|%20Best%20Hardware%20|%20Best%20Execution%20|%20Most%20Innovative-orange?style=for-the-badge)

## 🌟 Project Overview

ClearPath is a revolutionary AR accessibility system designed for deaf, hard of hearing, and cognitively impaired users. Using the Meta Quest 3's passthrough AR capability, ClearPath overlays real-time information directly in the user's field of vision, paired with a companion haptic wristband for tactile feedback.

### 🎯 Target Users
- **Deaf and Hard of Hearing** - Live captions and directional sound indicators
- **Cognitively Impaired** - Persistent context dashboard with conversation context

## 🚀 Features

### AR Visual Layers
1. **Directional Noise Indicators** - Colored ambient glows showing sound direction
2. **Topic of Conversation Box** - AI-generated summary of last 30 seconds
3. **Live Caption Bar** - Real-time speech transcription (lower third positioning)
4. **Dashboard Panel** - Person identification and relationship context

### Hardware Components
- **Haptic Wristband** - Arduino-based with distinct buzzing patterns
- **Environmental Awareness** - Webcam-powered directional audio detection
- **Voice Recognition** - Browser-based Web Speech API (no external APIs required)

## 🛠️ Tech Stack

### Software
- **WebXR + A-Frame** - AR overlay system (browser-based, no Unity needed)
- **Web Speech API** - Real-time speech-to-text transcription
- **Web Serial API** - Browser-to-Arduino communication
- **Meta Quest 3 Browser** - Passthrough AR environment
- **AI Summarization API** - Conversation topic generation

### Hardware
- **Meta Quest 3** - AR headset with passthrough mode
- **Arduino UNO R3** - Microcontroller for haptic feedback
- **Active Buzzer + RGB LED** - Wristband feedback components
- **Logitech Webcam** - Environmental sound direction detection
- **Breadboard & Components** - Prototyping hardware

## 📁 Project Structure

```
ClearPath/
├── index.html              # Main WebXR + A-Frame AR application
├── setup.html              # Caregiver/user configuration interface
├── css/
│   └── ar-styles.css       # AR UI design system
├── js/
│   ├── ar-manager.js       # AR overlay management
│   ├── speech-recognition.js  # Web Speech API integration
│   ├── serial-communication.js  # Arduino wristband control
│   ├── audio-direction.js  # Webcam audio direction detection
│   └── ai-summarizer.js    # Conversation topic generation
├── arduino/
│   └── clearpath_wristband.ino  # Arduino haptic wristband code
└── README.md               # This file
```

## 🔧 Hardware Requirements

### From RexQualis Kit
- Arduino UNO R3
- Active Buzzer
- RGB LED
- Breadboard
- Jumper wires
- Resistors

### From Elegoo Kit
- Additional RGB LEDs
- Breadboard components
- Power supply module

### Additional Hardware
- Meta Quest 3 (with passthrough AR capability)
- Logitech Webcam (USB connectivity)
- Computer for development and testing

## 🚀 Quick Start

### 1. Hardware Setup
1. Wire Arduino components according to circuit diagram
2. Connect Arduino to computer via USB
3. Set up webcam for audio direction detection

### 2. Software Setup
1. Clone this repository
2. Open `setup.html` in Meta Quest 3 browser
3. Configure user information and relationships
4. Launch `index.html` for full AR experience

### 3. Usage
1. Put on Meta Quest 3 with passthrough mode enabled
2. Arduino wristband provides tactile feedback
3. AR overlays display real-time information
4. Webcam detects environmental sound direction

## 🎛️ AR Interface Guide

### Caption Bar (Lower Third)
- **Position**: Lower 20% of field of vision
- **Purpose**: Never obscures speaker's face
- **Content**: Real-time speech transcription

### Directional Indicators (Edge Glows)
- **Left Edge**: Red glow for sounds from left
- **Right Edge**: Green glow for sounds from right/above
- **Driven by**: Webcam audio direction detection

### Topic Box (Contextual)
- **Position**: Center-left overlay
- **Content**: AI-generated 30-second conversation summary
- **Updates**: Real-time as conversation progresses

### Dashboard Panel (Top Right)
- **Content**: Person name, relationship, notes
- **Setup**: Configured via caregiver/user setup screen
- **Purpose**: Cognitive assistance and context

## 🔌 Arduino Wiring Diagram

```
Arduino UNO R3 Connections:
├── Digital Pin 9  → Active Buzzer (+)
├── Digital Pin 6  → RGB LED (Red)
├── Digital Pin 5  → RGB LED (Green)
├── Digital Pin 3  → RGB LED (Blue)
├── GND           → All component grounds
└── 5V            → Power rail
```

## 🌐 Browser Requirements

### Meta Quest 3 Browser
- **WebXR Support**: Required for AR functionality
- **Web Speech API**: Built-in browser support
- **Web Serial API**: Experimental feature (enable in flags)
- **Microphone Access**: Required for speech recognition
- **Camera Access**: Required for passthrough AR

## 🎯 Demo Script

### Judge Demo (2-3 minutes)
1. **Setup** - Judge puts on Quest 3, Anna explains system
2. **Speech Test** - Someone speaks, captions appear instantly
3. **Direction Test** - Sound from different directions triggers edge glows
4. **Wristband Test** - Arduino buzzes with distinct patterns
5. **Context Test** - Conversation topic updates automatically
6. **Dashboard Test** - Person information displays correctly

## 🏆 Competition Categories

- **Hack for Good** - Accessibility impact for underserved communities
- **Best Hardware** - Arduino integration with AR system
- **Best Execution** - Polished end-to-end experience
- **Most Innovative** - Novel WebXR + hardware approach

## ⚠️ Known Limitations

- **24-Hour Development** - Prioritizes working demo over perfect code
- **Browser Dependencies** - Requires experimental Web APIs
- **Hardware Prototyping** - Breadboard-based, not production-ready
- **Network Requirements** - AI summarization requires internet connection

## 🤝 Team

- **Person 1 (Anna)** - AR frontend, WebXR, Web Speech API, all overlay layers
- **Person 2** - Arduino haptic wristband, Web Serial API, hardware integration

## 📄 License

MIT License - Built for CUHackIt 2026 Hackathon

---

*Built with ❤️ for accessibility during CUHackIt 2026*