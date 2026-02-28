/*
  ClearPath Haptic Belt Clip - Arduino Sketch
  
  Designed for Arduino UNO R3 with:
  - SG90 Servo Motor for haptic feedback (oscillation)
  - Active Buzzer for audio alerts
  - RGB LED for visual status indication
  - Serial communication with Web Browser via Web Serial API
  
  Hardware Connections:
  - Digital Pin 9: SG90 Servo Motor (PWM signal)
  - Digital Pin 8: Active Buzzer (positive terminal)
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

#include <Servo.h>

// Pin Definitions
const int SERVO_PIN = 9;      // SG90 Servo Motor
const int BUZZER_PIN = 8;     // Active Buzzer
const int LED_RED_PIN = 6;    // RGB LED Red
const int LED_GREEN_PIN = 5;  // RGB LED Green  
const int LED_BLUE_PIN = 3;   // RGB LED Blue

// Servo Control
Servo hapticServo;

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
  
  // Initialize servo
  hapticServo.attach(SERVO_PIN);
  hapticServo.write(90); // Center position
  
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
  
  Serial.println("ClearPath Belt Clip Ready");
  Serial.println("Commands: SPEECH_START, SPEECH_END, SPEECH_DETECTED, ENVIRONMENTAL_SOUND, DIRECTION_LEFT, DIRECTION_RIGHT, TOPIC_CHANGED, STATUS_CHECK, RESET");
  
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
    
  } else if (command == "TOPIC_CHANGED") {
    topicChangedPattern();
    
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

// ===== SERVO HAPTIC FEEDBACK PATTERNS =====

void speechStartPattern() {
  // Two short servo pulses with purple LED
  setLEDColor(COLOR_PURPLE);
  
  servoHapticPulse(15, 3);  // 15 degree oscillation, 3 times
  delay(PAUSE_SHORT);
  servoHapticPulse(15, 3);
  
  Serial.println("Speech recognition started");
}

void speechEndPattern() {
  // One long servo pulse with blue LED
  setLEDColor(COLOR_BLUE);
  
  servoSustainedPulse(20, 800);  // 20 degree oscillation for 800ms
  
  delay(500);
  setLEDColor(COLOR_OFF);
  
  Serial.println("Speech recognition ended");
}

void speechDetectedPattern() {
  // Short rapid servo pulses (15-20 degree oscillation, 3 times)
  setLEDColor(COLOR_PURPLE);
  
  servoHapticPulse(18, 3);  // 18 degree oscillation, 3 times
  
  Serial.println("Speech detected");
}

void environmentalSoundPattern() {
  // Long sustained servo pulse (continuous oscillation for 1 second)
  setLEDColor(COLOR_CYAN);
  
  servoSustainedPulse(25, 1000);  // 25 degree oscillation for 1000ms
  
  delay(300);
  setLEDColor(COLOR_OFF);
  
  Serial.println("Environmental sound detected");
}

void topicChangedPattern() {
  // Double pulse with pause — conversation topic has changed
  setLEDColor(COLOR_YELLOW);
  
  servoHapticPulse(20, 2);  // 20 degree oscillation, 2 times
  delay(PAUSE_LONG);
  servoHapticPulse(20, 2);  // Second pulse after pause
  
  delay(300);
  setLEDColor(COLOR_OFF);
  
  Serial.println("Conversation topic changed");
}

void directionLeftPattern() {
  // Left directional pattern with RED LED (mirrors AR glow)
  setLEDColor(COLOR_RED);
  
  servoHapticPulse(15, 2);  // Short servo pulse
  delay(PAUSE_SHORT);
  servoHapticPulse(25, 1);  // Long servo pulse
  delay(PAUSE_SHORT);
  servoHapticPulse(15, 2);  // Short servo pulse
  
  delay(300);
  setLEDColor(COLOR_OFF);
  
  Serial.println("Sound from left direction");
}

void directionRightPattern() {
  // Right directional pattern with GREEN LED (mirrors AR glow)
  setLEDColor(COLOR_GREEN);
  
  servoHapticPulse(25, 1);  // Long servo pulse
  delay(PAUSE_SHORT);
  servoHapticPulse(15, 2);  // Short servo pulse
  delay(PAUSE_SHORT);
  servoHapticPulse(25, 1);  // Long servo pulse
  
  delay(300);
  setLEDColor(COLOR_OFF);
  
  Serial.println("Sound from right direction");
}

// 360-DEGREE DIRECTIONAL PATTERNS

void directionNorthPattern() {
  // North pattern: single sustained pulse with cyan LED
  setLEDColor(COLOR_CYAN);
  
  servoSustainedPulse(20, 500);  // 20 degree oscillation for 500ms
  
  delay(300);
  setLEDColor(COLOR_OFF);
  
  Serial.println("Sound from north direction (0-45°)");
}

void directionEastPattern() {
  // East pattern: two medium servo pulses with green LED  
  setLEDColor(COLOR_GREEN);
  
  servoHapticPulse(20, 2);
  delay(PAUSE_SHORT);
  servoHapticPulse(20, 2);
  
  delay(300);
  setLEDColor(COLOR_OFF);
  
  Serial.println("Sound from east direction (45-135°)");
}

void directionSouthPattern() {
  // South pattern: three short servo pulses with yellow LED
  setLEDColor(COLOR_YELLOW);
  
  for (int i = 0; i < 3; i++) {
    servoHapticPulse(15, 1);
    delay(PAUSE_SHORT);
  }
  
  delay(300);
  setLEDColor(COLOR_OFF);
  
  Serial.println("Sound from south direction (135-225°)");
}

void directionWestPattern() {
  // West pattern: long-short-short with red LED
  setLEDColor(COLOR_RED);
  
  servoHapticPulse(25, 1);  // Long pulse
  delay(PAUSE_SHORT);
  servoHapticPulse(15, 1);  // Short pulse
  delay(PAUSE_SHORT);
  servoHapticPulse(15, 1);  // Short pulse
  
  delay(300);
  setLEDColor(COLOR_OFF);
  
  Serial.println("Sound from west direction (225-315°)");
}

void errorPattern() {
  // Error pattern: rapid servo oscillations with red LED
  setLEDColor(COLOR_RED);
  
  for (int i = 0; i < 5; i++) {
    servoHapticPulse(10, 1);  // Small rapid oscillation
    delay(50);
  }
  
  delay(500);
  setLEDColor(COLOR_OFF);
  
  Serial.println("Error pattern");
}

void startupSequence() {
  // Startup sequence: cycle through colors with servo movements
  Color colors[] = {COLOR_RED, COLOR_GREEN, COLOR_BLUE, COLOR_YELLOW, COLOR_PURPLE, COLOR_CYAN};
  
  for (int i = 0; i < 6; i++) {
    setLEDColor(colors[i]);
    servoHapticPulse(15, 1);
    delay(150);
  }
  
  setLEDColor(COLOR_OFF);
  delay(500);
  
  // Final startup confirmation
  setLEDColor(COLOR_GREEN);
  servoSustainedPulse(20, 300);
  delay(200);
  setLEDColor(COLOR_OFF);
}

void heartbeat() {
  // Subtle heartbeat if system is active but no recent commands
  if (systemActive) {
    setLEDColor(COLOR_BLUE);
    servoHapticPulse(8, 1);  // Very gentle servo pulse
    delay(100);
    setLEDColor(COLOR_OFF);
    
    Serial.println("Heartbeat - system active");
  }
}

// ===== SERVO CONTROL FUNCTIONS =====

void servoHapticPulse(int degrees, int pulses) {
  // Create haptic feedback by oscillating servo back and forth
  // degrees: how far to oscillate (5-30 degrees recommended)
  // pulses: number of oscillation cycles
  
  int centerPos = 90;  // Center servo position
  int minPos = centerPos - (degrees / 2);
  int maxPos = centerPos + (degrees / 2);
  
  // Ensure positions are within servo range
  minPos = max(0, min(180, minPos));
  maxPos = max(0, min(180, maxPos));
  
  for (int i = 0; i < pulses; i++) {
    // Oscillate back and forth rapidly
    hapticServo.write(maxPos);
    delay(25);  // Fast movement for haptic effect
    hapticServo.write(minPos);
    delay(25);
    hapticServo.write(centerPos);  // Return to center
    
    if (i < pulses - 1) {
      delay(30);  // Brief pause between pulses
    }
  }
}

void servoSustainedPulse(int degrees, int duration) {
  // Create sustained haptic feedback by continuous oscillation
  // degrees: oscillation range
  // duration: how long to oscillate (milliseconds)
  
  int centerPos = 90;
  int minPos = centerPos - (degrees / 2);
  int maxPos = centerPos + (degrees / 2);
  
  // Ensure positions are within servo range
  minPos = max(0, min(180, minPos));
  maxPos = max(0, min(180, maxPos));
  
  unsigned long startTime = millis();
  
  while (millis() - startTime < duration) {
    hapticServo.write(maxPos);
    delay(20);
    hapticServo.write(minPos);
    delay(20);
  }
  
  hapticServo.write(centerPos);  // Return to center when done
}

// ===== UTILITY FUNCTIONS =====

void buzzerPulse(int duration) {
  // Audio feedback through active buzzer (separate from haptic servo)
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
  Serial.println("=== ClearPath Belt Clip Status ===");
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
  servoHapticPulse(10, 2);
  delay(PAUSE_SHORT);
  servoHapticPulse(10, 2);
  delay(300);
  setLEDColor(COLOR_OFF);
}

void resetSystem() {
  Serial.println("Resetting ClearPath Belt Clip...");
  
  // Reset state variables
  systemActive = false;
  speechListening = false;
  lastCommandTime = millis();
  
  // Visual reset indicator
  for (int i = 0; i < 3; i++) {
    setLEDColor(COLOR_RED);
    servoHapticPulse(10, 1);
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
  ===== BELT CLIP WIRING DIAGRAM =====
  
  Arduino UNO R3:
  ┌─────────────┐
  │ DIGITAL I/O │
  ├─────────────┤
  │ ~3  → Blue  │ ← RGB LED Blue
  │  4          │
  │ ~5  → Green │ ← RGB LED Green
  │ ~6  → Red   │ ← RGB LED Red
  │  7          │
  │  8  → Buzz+ │ ← Active Buzzer (+)
  │ ~9  → Servo │ ← SG90 Servo Signal (Orange wire)
  │ 10          │
  │ 11          │
  │ 12          │
  │ 13          │
  └─────────────┘
  
  Power Rails:
  5V  → Servo Red wire + Buzzer + LED power
  GND → Servo Brown wire + All component grounds
  
  3D Printed Belt Clip Components:
  - SG90 Servo Motor: Haptic vibration via oscillation
  - Active Buzzer: Audio feedback (Pin 8)
  - RGB LED: Visual status with window cutout
  - Arduino UNO: In user's pocket, connected via jumper wires
  
  ===== FUSION 360 DESIGN SPECIFICATIONS =====
  
  ENCLOSURE BODY (Main Housing):
  - External Dimensions: 60mm x 40mm x 20mm
  - Wall Thickness: 2.0mm (for PLA strength)
  - Internal Cavity: 56mm x 36mm x 16mm
  
  SERVO MOUNTING:
  - SG90 Dimensions: 22.8mm x 12.2mm x 29mm
  - Mounting Posts: 4x M2 threaded inserts or 2mm holes
  - Servo Horn Access: 8mm diameter hole in top
  - Oscillation Clearance: 15mm radius around servo horn
  
  LED WINDOW:
  - Diameter: 8mm (for 5mm RGB LED with diffusion)
  - Depth: 1mm inset for flush LED placement
  - Material: Clear PLA or cutout for transparency
  
  BUZZER MOUNTING:
  - Active Buzzer: 12mm diameter x 9.5mm height
  - Mounting: Friction fit or small screws
  - Sound Ports: 4x 2mm holes for audio output
  
  CABLE EXIT CHANNEL:
  - Width: 8mm (for 6-8 jumper wires)
  - Height: 4mm 
  - Location: Right side of enclosure
  - Strain Relief: 2mm radius curves
  
  BELT CLIP RAIL (Separate Part):
  - Clip Opening: 42mm (fits up to 40mm belts)
  - Spring Arm Thickness: 1.5mm (flexible PLA)
  - Snap Fit Tabs: 2x tabs, 0.3mm interference fit
  - Material: PETG or flexible PLA if available
  
  PRINT SETTINGS:
  - Layer Height: 0.2mm (balance quality/speed)
  - Infill: 20% (sufficient strength)
  - Supports: None if oriented properly
  - Print Time: 45-90 minutes total for both parts
  
  ORIENTATION:
  - Enclosure: LED window facing up (no supports needed)
  - Belt Clip: Spring arm vertical (natural flex direction)
  
  ===== COMMAND REFERENCE =====
  
  Browser → Arduino:
  - SPEECH_START: User started voice recognition
  - SPEECH_END: User stopped voice recognition
  - SPEECH_DETECTED: Speech was heard and processed
  - ENVIRONMENTAL_SOUND: Background noise detected
  - DIRECTION_LEFT: Sound source on left (legacy compatibility + RED LED)
  - DIRECTION_RIGHT: Sound source on right (legacy compatibility + GREEN LED)
  - DIRECTION_NORTH: 360° Sound from north (315-45°, front-facing)
  - DIRECTION_EAST: 360° Sound from east (45-135°, right side)
  - DIRECTION_SOUTH: 360° Sound from south (135-225°, behind user)
  - DIRECTION_WEST: 360° Sound from west (225-315°, left side)
  - TOPIC_CHANGED: Double pulse - conversation topic has changed
  - STATUS_CHECK: Request current system status
  - RESET: Reset belt clip to initial state
  
  Arduino → Browser:
  - Status messages via Serial.println()
  - Confirmation of received commands
  - System diagnostics and uptime
  - Error reports for debugging
  
  HAPTIC PATTERNS:
  - Short Rapid Pulse: 3 quick servo oscillations (speech detected)
  - Long Sustained Pulse: Continuous oscillation for 1 second (environmental)
  - Double Pulse with Pause: Topic change indication
  - Directional Patterns: Unique servo sequences for each direction
  
  LED COLORS MIRROR AR GLOWS:
  - RED: Left/West directional sounds
  - GREEN: Right/East directional sounds  
  - CYAN: Environmental/North sounds
  - YELLOW: South/Topic change
  - PURPLE: Speech recognition active
  - BLUE: System status/heartbeat
*/