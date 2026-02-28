# 🔌 ClearPath Hardware Quick Reference

## PIN CONNECTIONS CHEAT SHEET
```
┌─────────────────────┐
│    ARDUINO UNO      │
├─────────────────────┤
│ Pin 3  → LED Blue   │ ← 220Ω resistor required
│ Pin 5  → LED Green  │ ← 220Ω resistor required  
│ Pin 6  → LED Red    │ ← 220Ω resistor required
│ Pin 8  → Buzzer (+) │
│ Pin 9  → Servo PWM  │ ← Orange/yellow wire (signal)
│ 5V     → Power Rail │ ← Servo red wire + components
│ GND    → Ground     │ ← All negatives/grounds
└─────────────────────┘
```

## COMPONENT WIRING

### SG90 Servo Motor
```
Servo Colors:  Arduino Pin:
Brown   ────────→  GND
Red     ────────→  5V  
Orange  ────────→  Pin 9 (PWM)
```

### RGB LED (Common Cathode)
```
LED Leg:        Resistor:    Arduino Pin:
Red     ───── [220Ω] ────────→  Pin 6
Green   ───── [220Ω] ────────→  Pin 5  
Blue    ───── [220Ω] ────────→  Pin 3
Cathode ─────────────────────→  GND (longest leg)
```

### Active Buzzer
```
Buzzer Terminal:  Arduino Pin:
(+) Positive ──────────────→  Pin 8
(-) Negative ──────────────→  GND
```

## BREADBOARD LAYOUT
```
    Power Rails              Component Area
   ┌─────────────┐         ┌────────────────┐
   │ + + + + + + │         │ a b c d e f g h│
   │ - - - - - - │         │ 1 2 3 4 5 6 7 8│
   └─────────────┘         │ │ │ │ │ │ │ │ ││
        │     │             │ │ │ │ │ │ │ │ ││
        │     └─── GND      │[R][G][B][-] │ ││ ← RGB LED
        └────────── 5V      │ │ │ │ │ │ │ │ ││
                            │ │ │ │ │ │ │ │ ││
                            └─┼─┼─┼─┼─┼─┼─┼─┼┘
                              │ │ │ │ │ │ │ │
                       Pin6 ──┘ │ │ │ │ │ │ │
                       Pin5 ────┘ │ │ │ │ │ │  
                       Pin3 ──────┘ │ │ │ │ │
                       GND ─────────┘ │ │ │ │
                       Pin8 ───────────┘ │ │ │ ← Buzzer
                       GND ─────────────┘ │ │
                       Pin9 ───────────────┘ │ ← Servo Signal
                       5V/GND ──────────────┘   ← Servo Power
```

## COMPONENT TESTING ORDER

### 1️⃣ Power Test
- [ ] Arduino power LED on (red)
- [ ] 5V measured between power rails
- [ ] GND continuity verified

### 2️⃣ LED Test  
- [ ] Red LED: `digitalWrite(6, HIGH)`
- [ ] Green LED: `digitalWrite(5, HIGH)`
- [ ] Blue LED: `digitalWrite(3, HIGH)`

### 3️⃣ Buzzer Test
- [ ] Buzzer sound: `digitalWrite(8, HIGH)`

### 4️⃣ Servo Test
- [ ] Servo movement: `myServo.write(90)`
- [ ] Smooth oscillation: `75° ↔ 105°`

### 5️⃣ Integration Test
- [ ] Upload `clearpath_wristband.ino` 
- [ ] Serial commands work
- [ ] Web Serial API connects

## ⚡ POWER REQUIREMENTS

| Component | Voltage | Current | Notes |
|-----------|---------|---------|-------|
| Arduino UNO | 5V | ~50mA | Via USB or external |
| SG90 Servo | 5V | ~500mA | When moving |
| RGB LED | 3.3V | ~60mA | With 220Ω resistors |
| Active Buzzer | 5V | ~30mA | Intermittent use |
| **Total** | **5V** | **~640mA** | USB limit: 500mA |

⚠️ **Power Warning**: Servo can draw more current than USB provides. If servo behaves erratically, consider external 5V power supply.

## 🚨 COMMON MISTAKES

### ❌ Incorrect Wiring
- **LED burned out**: Forgot current-limiting resistors
- **Servo not moving**: Connected to digital pin instead of PWM
- **No buzzer sound**: Used passive buzzer instead of active
- **Wrong colors**: Mixed up RGB LED legs

### ❌ Software Issues  
- **Serial conflicts**: Arduino IDE Serial Monitor open while using Web Serial
- **Pin conflicts**: Using pins for multiple purposes 
- **Power issues**: Insufficient current for servo operation

### ❌ Physical Problems
- **Loose connections**: Jumper wires not fully inserted
- **Short circuits**: Wires touching on breadboard
- **Component damage**: Reversed polarity on buzzer/LED

## 🔧 DEBUGGING TOOLS

### Multimeter Tests
1. **Voltage**: Measure 5V and 3.3V rails
2. **Continuity**: Verify all ground connections
3. **Current**: Check if components draw expected current

### Arduino Serial Monitor
```cpp
// Add debug prints to your code:
Serial.println("LED Red ON"); 
digitalWrite(6, HIGH);
delay(1000);
Serial.println("LED Red OFF");
digitalWrite(6, LOW);
```

### Visual Inspection
- [ ] All connections secure
- [ ] No crossed wires
- [ ] Components properly oriented  
- [ ] Power/ground not reversed

## 📋 ASSEMBLY CHECKLIST

### Before Powering On
- [ ] Double-check wiring diagram
- [ ] Verify resistor values (220Ω)
- [ ] Confirm LED polarity
- [ ] Check servo wire colors
- [ ] Ensure no short circuits

### After Powering On  
- [ ] Arduino power LED illuminated
- [ ] Upload test sketch successfully
- [ ] All components respond individually
- [ ] Serial communication works
- [ ] Ready for ClearPath firmware

## 🎯 HACKATHON SUCCESS TIPS

### Day 1: Get It Working
- Focus on breadboard setup first
- Test each component individually
- Don't worry about appearance yet
- Document what works

### Day 2: Make It Presentable
- Clean up wiring if time permits
- Add strain relief to connections
- Practice demo with reliable setup
- Have backup components ready

### Demo Day: Be Confident 
- Test setup before judges arrive  
- Have troubleshooting knowledge ready
- Explain the innovation clearly
- Show backups if main system fails

**Remember**: A working breadboard demo is better than a beautiful non-working 3D printed version! 🚀