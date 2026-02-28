/*
  ClearPath Haptic Wristband - Arduino Sketch
  
  Designed for Arduino UNO R3 with:
  - Active Buzzer for haptic feedback
  - RGB LED for visual status indication
  - Serial communication with Web Browser via Web Serial API
  
  Hardware Connections:
  - Digital Pin 9: Active Buzzer (positive terminal)
  - Digital Pin 6: RGB LED Red
  - Digital Pin 5: RGB LED Green  
  - Digital Pin 3: RGB LED Blue
  - GND: All component grounds
  - 5V: Power rail for components
  
  Commands from Browser:
  - SPEECH_START: Begin speech recognition
  - SPEECH_END: End speech recognition  
  - SPEECH_DETECTED: Speech was heard and processed
  - ENVIRONMENTAL_SOUND: Environmental sound detected
  - DIRECTION_LEFT: Sound from left (legacy - 270-90 degrees)
  - DIRECTION_RIGHT: Sound from right (legacy - 90-270 degrees)
  - DIRECTION_NORTH: Sound from north (315-45 degrees)
  - DIRECTION_EAST: Sound from east (45-135 degrees)
  - DIRECTION_SOUTH: Sound from south (135-225 degrees)
  - DIRECTION_WEST: Sound from west (225-315 degrees)
  - STATUS_CHECK: Request status update
  - RESET: Reset system
  
  Author: ClearPath Team - CUHackIt 2026
  License: MIT
*/

// Pin Definitions
const int BUZZER_PIN = 9;     // Active buzzer
const int LED_RED_PIN = 6;    // RGB LED Red
const int LED_GREEN_PIN = 5;  // RGB LED Green  
const int LED_BLUE_PIN = 3;   // RGB LED Blue

// System State
bool systemActive = false;
bool speechListening = false;
unsigned long lastCommandTime = 0;
unsigned long systemStartTime = 0;

// Pattern Timing
const int SHORT_PULSE = 100;   // Short pulse duration (ms)
const int LONG_PULSE = 300;    // Long pulse duration (ms)
const int PAUSE_SHORT = 50;    // Short pause between pulses (ms)
const int PAUSE_LONG = 200;    // Long pause between patterns (ms)

// LED Colors (PWM values 0-255)
struct Color {
  int red;
  int green;
  int blue;
};

const Color COLOR_OFF = {0, 0, 0};
const Color COLOR_RED = {255, 0, 0};        // Error/Alert
const Color COLOR_GREEN = {0, 255, 0};      // Success/Active
const Color COLOR_BLUE = {0, 0, 255};       // System Status
const Color COLOR_YELLOW = {255, 255, 0};   // Warning
const Color COLOR_PURPLE = {128, 0, 128};   // Speech Mode
const Color COLOR_CYAN = {0, 255, 255};     // Environmental Sound

void setup() {
  // Initialize serial communication
  Serial.begin(9600);
  
  // Initialize pins
  pinMode(BUZZER_PIN, OUTPUT);
  pinMode(LED_RED_PIN, OUTPUT);
  pinMode(LED_GREEN_PIN, OUTPUT);
  pinMode(LED_BLUE_PIN, OUTPUT);
  
  // Ensure all outputs start OFF
  digitalWrite(BUZZER_PIN, LOW);
  setLEDColor(COLOR_OFF);
  
  // Record system start time
  systemStartTime = millis();
  
  // Startup sequence
  startupSequence();
  
  Serial.println("ClearPath Wristband Ready");
  Serial.println("Commands: SPEECH_START, SPEECH_END, SPEECH_DETECTED, ENVIRONMENTAL_SOUND, DIRECTION_LEFT, DIRECTION_RIGHT, STATUS_CHECK, RESET");
  
  systemActive = true;
}

void loop() {
  // Check for serial commands
  if (Serial.available() > 0) {
    String command = Serial.readStringUntil('\n');
    command.trim();
    processCommand(command);
    lastCommandTime = millis();
  }
  
  // System heartbeat (every 30 seconds if no commands)
  if (millis() - lastCommandTime > 30000) {
    heartbeat();
    lastCommandTime = millis();
  }
  
  // Small delay to prevent overwhelming the processor
  delay(10);
}

void processCommand(String command) {
  Serial.print("Received: ");
  Serial.println(command);
  
  if (command == "SPEECH_START") {
    speechStartPattern();
    speechListening = true;
    
  } else if (command == "SPEECH_END") {
    speechEndPattern();
    speechListening = false;
    
  } else if (command == "SPEECH_DETECTED") {
    speechDetectedPattern();
    
  } else if (command == "ENVIRONMENTAL_SOUND") {
    environmentalSoundPattern();
    
  } else if (command == "DIRECTION_LEFT") {
    directionLeftPattern();
    
  } else if (command == "DIRECTION_RIGHT") {
    directionRightPattern();
    
  } else if (command == "DIRECTION_NORTH") {
    directionNorthPattern();
    
  } else if (command == "DIRECTION_EAST") {
    directionEastPattern();
    
  } else if (command == "DIRECTION_SOUTH") {
    directionSouthPattern();
    
  } else if (command == "DIRECTION_WEST") {
    directionWestPattern();
    
  } else if (command == "STATUS_CHECK") {
    statusCheck();
    
  } else if (command == "RESET") {
    resetSystem();
    
  } else {
    // Unknown command
    errorPattern();
    Serial.print("Unknown command: ");
    Serial.println(command);
  }
}

// ===== HAPTIC FEEDBACK PATTERNS =====

void speechStartPattern() {
  // Two short pulses with green LED
  setLEDColor(COLOR_PURPLE);
  
  buzzerPulse(SHORT_PULSE);
  delay(PAUSE_SHORT);
  buzzerPulse(SHORT_PULSE);
  
  Serial.println("Speech recognition started");
}

void speechEndPattern() {
  // One long pulse with blue LED
  setLEDColor(COLOR_BLUE);
  
  buzzerPulse(LONG_PULSE);
  
  delay(500);
  setLEDColor(COLOR_OFF);
  
  Serial.println("Speech recognition ended");
}

void speechDetectedPattern() {
  // Three quick pulses with purple LED
  setLEDColor(COLOR_PURPLE);
  
  for (int i = 0; i < 3; i++) {
    buzzerPulse(SHORT_PULSE);
    delay(PAUSE_SHORT);
  }
  
  Serial.println("Speech detected");
}

void environmentalSoundPattern() {
  // Single medium pulse with cyan LED
  setLEDColor(COLOR_CYAN);
  
  buzzerPulse(200);
  
  delay(300);
  setLEDColor(COLOR_OFF);
  
  Serial.println("Environmental sound detected");
}

void directionLeftPattern() {
  // Left directional pattern: short-long-short with red LED
  setLEDColor(COLOR_RED);
  
  buzzerPulse(SHORT_PULSE);
  delay(PAUSE_SHORT);
  buzzerPulse(LONG_PULSE);
  delay(PAUSE_SHORT);
  buzzerPulse(SHORT_PULSE);
  
  delay(300);
  setLEDColor(COLOR_OFF);
  
  Serial.println("Sound from left direction");
}

void directionRightPattern() {
  // Right directional pattern: long-short-long with green LED
  setLEDColor(COLOR_GREEN);
  
  buzzerPulse(LONG_PULSE);
  delay(PAUSE_SHORT);
  buzzerPulse(SHORT_PULSE);
  delay(PAUSE_SHORT);
  buzzerPulse(LONG_PULSE);
  
  delay(300);
  setLEDColor(COLOR_OFF);
  
  Serial.println("Sound from right direction");
}

// 360-DEGREE DIRECTIONAL PATTERNS

void directionNorthPattern() {
  // North pattern: single long pulse with cyan LED
  setLEDColor(COLOR_CYAN);
  
  buzzerPulse(LONG_PULSE);
  
  delay(300);
  setLEDColor(COLOR_OFF);
  
  Serial.println("Sound from north direction (0-45°)");
}

void directionEastPattern() {
  // East pattern: two medium pulses with green LED  
  setLEDColor(COLOR_GREEN);
  
  buzzerPulse(200);
  delay(PAUSE_SHORT);
  buzzerPulse(200);
  
  delay(300);
  setLEDColor(COLOR_OFF);
  
  Serial.println("Sound from east direction (45-135°)");
}

void directionSouthPattern() {
  // South pattern: three short pulses with yellow LED
  setLEDColor(COLOR_YELLOW);
  
  for (int i = 0; i < 3; i++) {
    buzzerPulse(SHORT_PULSE);
    delay(PAUSE_SHORT);
  }
  
  delay(300);
  setLEDColor(COLOR_OFF);
  
  Serial.println("Sound from south direction (135-225°)");
}

void directionWestPattern() {
  // West pattern: long-short-short with red LED
  setLEDColor(COLOR_RED);
  
  buzzerPulse(LONG_PULSE);
  delay(PAUSE_SHORT);
  buzzerPulse(SHORT_PULSE);
  delay(PAUSE_SHORT);
  buzzerPulse(SHORT_PULSE);
  
  delay(300);
  setLEDColor(COLOR_OFF);
  
  Serial.println("Sound from west direction (225-315°)");
}

void errorPattern() {
  // Error pattern: rapid pulses with red LED
  setLEDColor(COLOR_RED);
  
  for (int i = 0; i < 5; i++) {
    buzzerPulse(50);
    delay(50);
  }
  
  delay(500);
  setLEDColor(COLOR_OFF);
  
  Serial.println("Error pattern");
}

void startupSequence() {
  // Startup sequence: cycle through colors with ascending tones
  Color colors[] = {COLOR_RED, COLOR_GREEN, COLOR_BLUE, COLOR_YELLOW, COLOR_PURPLE, COLOR_CYAN};
  
  for (int i = 0; i < 6; i++) {
    setLEDColor(colors[i]);
    buzzerPulse(100);
    delay(150);
  }
  
  setLEDColor(COLOR_OFF);
  delay(500);
  
  // Final startup confirmation
  setLEDColor(COLOR_GREEN);
  buzzerPulse(LONG_PULSE);
  delay(200);
  setLEDColor(COLOR_OFF);
}

void heartbeat() {
  // Subtle heartbeat if system is active but no recent commands
  if (systemActive) {
    setLEDColor(COLOR_BLUE);
    buzzerPulse(50);
    delay(100);
    setLEDColor(COLOR_OFF);
    
    Serial.println("Heartbeat - system active");
  }
}

// ===== UTILITY FUNCTIONS =====

void buzzerPulse(int duration) {
  digitalWrite(BUZZER_PIN, HIGH);
  delay(duration);
  digitalWrite(BUZZER_PIN, LOW);
}

void setLEDColor(Color color) {
  analogWrite(LED_RED_PIN, color.red);
  analogWrite(LED_GREEN_PIN, color.green);
  analogWrite(LED_BLUE_PIN, color.blue);
}

void statusCheck() {
  // Report current system status
  Serial.println("=== ClearPath Wristband Status ===");
  Serial.print("System Active: ");
  Serial.println(systemActive ? "YES" : "NO");
  Serial.print("Speech Listening: ");
  Serial.println(speechListening ? "YES" : "NO");
  Serial.print("Uptime (ms): ");
  Serial.println(millis() - systemStartTime);
  Serial.print("Last Command: ");
  Serial.print((millis() - lastCommandTime) / 1000);
  Serial.println(" seconds ago");
  Serial.println("================================");
  
  // Status confirmation pattern
  setLEDColor(COLOR_BLUE);
  buzzerPulse(SHORT_PULSE);
  delay(PAUSE_SHORT);
  buzzerPulse(SHORT_PULSE);
  delay(300);
  setLEDColor(COLOR_OFF);
}

void resetSystem() {
  Serial.println("Resetting ClearPath Wristband...");
  
  // Reset state variables
  systemActive = false;
  speechListening = false;
  lastCommandTime = millis();
  
  // Visual reset indicator
  for (int i = 0; i < 3; i++) {
    setLEDColor(COLOR_RED);
    buzzerPulse(100);
    delay(100);
    setLEDColor(COLOR_OFF);
    delay(100);
  }
  
  delay(500);
  
  // Restart system
  systemActive = true;
  startupSequence();
  
  Serial.println("System reset complete");
}

// ===== ADVANCED PATTERNS =====

void fadeColorTransition(Color from, Color to, int steps, int stepDelay) {
  // Smooth color transition (for future enhancements)
  for (int i = 0; i <= steps; i++) {
    Color current;
    current.red = map(i, 0, steps, from.red, to.red);
    current.green = map(i, 0, steps, from.green, to.green);
    current.blue = map(i, 0, steps, from.blue, to.blue);
    
    setLEDColor(current);
    delay(stepDelay);
  }
}

void customPattern(String patternCode) {
  // Custom pattern interpreter for future extensibility
  // Format: "B100-L255,0,0-P50-B200"
  // B = Buzzer pulse (duration)
  // L = LED color (R,G,B)
  // P = Pause (duration)
  
  // Implementation placeholder for hackathon extension
  Serial.print("Custom pattern requested: ");
  Serial.println(patternCode);
}

/*
  ===== WIRING DIAGRAM =====
  
  Arduino UNO R3:
  ┌─────────────┐
  │ DIGITAL I/O │
  ├─────────────┤
  │ ~3  → Blue  │ ← RGB LED Blue
  │  4          │
  │ ~5  → Green │ ← RGB LED Green
  │ ~6  → Red   │ ← RGB LED Red
  │  7          │
  │  8          │
  │ ~9  → Buzz+ │ ← Active Buzzer (+)
  │ 10          │
  │ 11          │
  │ 12          │
  │ 13          │
  └─────────────┘
  
  Power Rails:
  5V  → Positive power rail
  GND → All component grounds
  
  Components:
  - Active Buzzer: Pin 9 (+), GND (-)
  - RGB LED: Pins 6,5,3 (R,G,B), GND (common cathode)
  - Resistors: 220Ω for each LED pin (current limiting)
  
  ===== COMMAND REFERENCE =====
  
  Browser → Arduino:
  - SPEECH_START: User started voice recognition
  - SPEECH_END: User stopped voice recognition
  - SPEECH_DETECTED: Speech was heard and processed
  - ENVIRONMENTAL_SOUND: Background noise detected
  - DIRECTION_LEFT: Sound source on left (legacy compatibility)
  - DIRECTION_RIGHT: Sound source on right (legacy compatibility)
  - DIRECTION_NORTH: 360° Sound from north (315-45°, front-facing)
  - DIRECTION_EAST: 360° Sound from east (45-135°, right side)
  - DIRECTION_SOUTH: 360° Sound from south (135-225°, behind user)
  - DIRECTION_WEST: 360° Sound from west (225-315°, left side)
  - STATUS_CHECK: Request current system status
  - RESET: Reset wristband to initial state
  
  Arduino → Browser:
  - Status messages via Serial.println()
  - Confirmation of received commands
  - System diagnostics and uptime
  - Error reports for debugging
*/