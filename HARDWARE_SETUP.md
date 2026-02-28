# [TOOL] ClearPath AR Hardware Setup Guide

## Complete Component List

### Required Electronics
- **1x Arduino UNO R3** + USB cable
- **1x SG90 Servo Motor** (for haptic feedback)
- **1x Active Buzzer** (5V, with built-in oscillator)
- **3x Individual LEDs** (1 Red, 1 Green, 1 Blue - two-pronged)
- **3x 220Ω Resistors** (for LED current limiting)
- **1x Half-size Breadboard** (for quick setup)
- **10+ Jumper Wires** (male-to-male)

### Optional Professional Setup
- **3D Printed Belt Clip** (see FUSION360_DESIGN_GUIDE.md)
- **M2 Screws x4** (for servo mounting)
- **Heat Shrink Tubing** (wire management)
- **Small Zip Ties** (cable organization)

### Tools Needed
- Wire strippers
- Small screwdriver
- Computer with Arduino IDE
- Multimeter (for testing)

---

## [RULER] Wiring Diagram

```
                    ARDUINO UNO R3
           ┌─────────────────────────────────┐
           │                                 │
           │  ┌───┐  ┌───┐  ┌───┐  ┌───┐    │
           │  │ 3 │  │ 5 │  │ 6 │  │ 9 │    │ 
           │  └─┬─┘  └─┬─┘  └─┬─┘  └─┬─┘    │
           │    │      │      │      │      │
           │    │      │      │      │      │
           └────┼──────┼──────┼──────┼──────┘
                │      │      │      │
                │      │      │      └─── SG90 Servo Signal (Orange)
                │      │      └─────────── RGB LED Red
                │      └─────────────────── RGB LED Green  
                └─────────────────────────── RGB LED Blue
                
           ┌─────────────────────────────────┐
           │                                 │
           │  ┌───┐  ┌───┐                   │
           │  │ 8 │  │GND│  ┌───┐            │
           │  └─┬─┘  └─┬─┘  │ 5V│            │
           │    │      │    └─┬─┘            │
           └────┼──────┼──────┼──────────────┘
                │      │      │
                │      │      └─── Power Rail (+5V)
                │      └─────────── Ground Rail
                └─────────────────── Active Buzzer (+)

    Individual LEDs (Two-Pronged)       SG90 Servo Motor
    ┌─────────────────────┐          ┌──────────────────┐
    │ Red LED:            │          │ Brown  │ Ground  │
    │   (+)─[220Ω]─Pin6   │          │ Red    │ +5V     │  
    │   (-)─────── GND    │          │ Orange │ Signal  │
    │                     │          └──────────────────┘
    │ Green LED:          │          
    │   (+)─[220Ω]─Pin5   │          Active Buzzer
    │   (-)─────── GND    │          ┌──────────────────┐
    │                     │          │   (+) Pin 8     │ 
    │ Blue LED:           │          │   (-) GND       │
    │   (+)─[220Ω]─Pin3   │          └──────────────────┘
    │   (-)─────── GND    │          
    └─────────────────────┘
```

---

## [MAP] Physical Hardware Layout Map

### Breadboard Assembly Overview
```
                    ┌─────────────────────────────────────────────────┐
                    │                WORKSPACE LAYOUT                 │
                    └─────────────────────────────────────────────────┘

    ┌──────────────────────┐                    ┌──────────────────────┐
    │    ARDUINO UNO R3    │                    │     HALF BREADBOARD  │
    │  ┌─────────────────┐ │                    │ ┌──────────────────┐ │
    │  │ USB   │ POWER   │ │◄──────USB Cable────┤ │  + + + + + + +   │ │
    │  │       │   LED   │ │                    │ │  - - - - - - -   │ │
    │  └─────────────────┘ │                    │ │                  │ │
    │                      │                    │ │  a b c d e f g h │ │
    │   Digital I/O Pins   │                    │ │ 1│ │ │ │ │ │ │ │ │ │
    │ 13 12 11 10  9  8  7 │                    │ │ 2│ │ │ │ │ │ │ │ │ │
    │                      │                    │ │ 3│ │[R][G][B][-] │ │◄─ Individual LEDs
    │  6  5  4  3  2  1  0 │                    │ │ 4│ │ │ │ │ │ │ │ │ │
    │                      │                    │ │ 5│ │ │ │ │ │ │ │ │ │
    │    5V   3.3V   GND   │                    │ │  │ │ │ │ │ │ │ │ │ │
    └──────────────────────┘                    │ │  │ │ │ │ │ │ │ │ │ │
             │         │                        │ │  │ │ │ │ │ │ │ │ │ │
             │         │                        │ │  │ │ │ │ │ │ │ │ │ │
      ┌──────┴─────┐   │                        │ │  │ │ │ │ │ │ │ │ │ │
      │  POWER     │   └─────────────────────┐  │ │  │ │ │ │ │ │ │ │ │ │
      │  RAILS     │                         │  │ └──┼─┼─┼─┼─┼─┼─┼─┼─┘ │
      └─────┬──────┘                         │  │    │ │ │ │ │ │ │ │   │
            │                                │  └────┼─┼─┼─┼─┼─┼─┼─┼───┘
    ┌───────┴────────┐                       │       │ │ │ │ │ │ │ │
    │   SERVO MOTOR  │                       │   Pin9│ │ │ │ │ │ │ │
    │  [    SG90    ]│                       │   Pin8│ │ │ │ │ │ │ │
    │    BROWN──┐    │                       │   Pin6│ │ │ │ │ │ │ │
    │    RED────┼────┼───────────────────────┘   Pin5│ │ │ │ │ │ │ │
    │    ORANGE─┼────┼─────────────────────Pin 9 Pin3│ │ │ │ │ │ │ │
    └───────────┴────┘                            GND│ │ │ │ │ │ │ │
                                                     │ │ │ │ │ │ │ │
      ┌─────────────────┐                            │ │ │ │ │ │ │Buzzer(+)
      │  ACTIVE BUZZER  │                            │ │ │ │ │ │ │ │
      │    ┌─────────┐  │                            │ │ │ │ │ │ │ │
      │    │    +    │  │─────────────────────Pin 8──┘ │ │ │ │ │ │ │
      │    │    -    │  │──────────────────────GND─────┘ │ │ │ │ │ │
      │    └─────────┘  │                                │ │ │ │ │ │
      └─────────────────┘                                │ │ │ │Pin6
                                                         │ │ │Pin5
                                                         │ │Pin3  
                                                         │GND
                                                         │
                                             ┌───────────┴─────────┐
                                             │   220Ω RESISTORS    │
                                             │  [R] [G] [B]        │
                                             │   │   │   │         │
                                             └───┼───┼───┼─────────┘
                                                 │   │   │
                                    ┌─────────────────────────────┐
                                    │     INDIVIDUAL LEDs         │
                                    │      (Two-Pronged)          │
                                    │                             │
                                    │ Red LED:                    │
                                    │   Long leg (+)──[220Ω]──Pin 6│
                                    │   Short leg (-)─────────GND │
                                    │                             │
                                    │ Green LED:                  │
                                    │   Long leg (+)──[220Ω]──Pin 5│
                                    │   Short leg (-)─────────GND │
                                    │                             │
                                    │ Blue LED:                   │
                                    │   Long leg (+)──[220Ω]──Pin 3│
                                    │   Short leg (-)─────────GND │
                                    │                             │
                                    │ Note: Long leg = Anode (+)  │
                                    │       Short leg = Cathode (-) │
                                    └─────────────────────────────┘

         COMPONENT PLACEMENT GUIDE:
         ┌─────────────────────────────────────────────────┐
         │ 1. Arduino on left side of workspace           │
         │ 2. Breadboard to the right of Arduino          │  
         │ 3. Servo motor above/beside breadboard         │
         │ 4. Active buzzer near Arduino pins             │
         │ 5. Individual LEDs inserted into breadboard    │
         │ 6. Jumper wires connect Arduino → Breadboard   │
         │ 7. Keep power/ground wires short & organized   │
         └─────────────────────────────────────────────────┘
```

### Component Size References
```
Arduino UNO R3: 68.6mm × 53.4mm × 15mm
SG90 Servo:     22.8mm × 12.2mm × 29mm  
Half Breadboard: 80mm × 60mm × 10mm
Individual LEDs: 5mm diameter × 8mm height (each)
Active Buzzer:  12mm diameter × 9.5mm height
220Ω Resistors: 6mm × 2.5mm (standard 1/4W)
```

### Cable Management Tips
```
┌─────────────────────────────────────────────────────────────┐
│                     WIRING BEST PRACTICES                  │
├─────────────────────────────────────────────────────────────┤
│ [CHECK] Use different colors for different signals:             │
│    Red: +5V Power                                          │
│    Black: Ground (GND)                                     │
│    Orange: Servo PWM signal                                │ 
│    Blue: Digital I/O signals                               │
│                                                             │
│ [CHECK] Keep wires short to reduce electrical noise             │
│ [CHECK] Route power wires away from signal wires                │
│ [CHECK] Test each connection with multimeter                     │
│ [CHECK] Leave extra length for movement/adjustments              │
└─────────────────────────────────────────────────────────────┘
```

---

## [POWER] Step-by-Step Wiring

### Step 1: Power Rails Setup
1. **Connect Arduino GND** → Breadboard negative rail (blue/black)
2. **Connect Arduino 5V** → Breadboard positive rail (red)
3. **Add jumper wire** connecting both ground rails on breadboard
4. **Add jumper wire** connecting both power rails on breadboard

### Step 2: SG90 Servo Motor
```
Servo Wire Colors:
├── Brown (Ground): Arduino GND
├── Red (Power): Arduino 5V  
└── Orange (Signal): Arduino Pin 9
```

**Connections:**
- Servo **Brown** → Arduino **GND** (or breadboard ground rail)
- Servo **Red** → Arduino **5V** (or breadboard power rail)  
- Servo **Orange** → Arduino **Pin 9** (PWM pin for servo control)

### Step 3: Active Buzzer
```
Buzzer Connections:
├── Positive (+): Arduino Pin 8
└── Negative (-): Arduino GND
```

**Connections:**
- Buzzer **+** → Arduino **Pin 8**
- Buzzer **-** → Breadboard **ground rail**

### Step 4: Individual LEDs with Current Limiting
```
Each LED (Two-Pronged):
├── Long leg (Anode +): 220Ω resistor → Arduino Pin
└── Short leg (Cathode -): Arduino GND

LED Connections:
├── Red LED: Pin 6
├── Green LED: Pin 5  
└── Blue LED: Pin 3
```

**Wiring Steps:**
1. **Insert Red LED** into breadboard
   - Long leg (anode +) → 220Ω resistor → Arduino **Pin 6**
   - Short leg (cathode -) → breadboard ground rail
2. **Insert Green LED** into breadboard
   - Long leg (anode +) → 220Ω resistor → Arduino **Pin 5**
   - Short leg (cathode -) → breadboard ground rail
3. **Insert Blue LED** into breadboard
   - Long leg (anode +) → 220Ω resistor → Arduino **Pin 3**
   - Short leg (cathode -) → breadboard ground rail

**LED Polarity Check:**
- **Long leg = Anode (+)** - connects to resistor → Arduino pin
- **Short leg = Cathode (-)** - connects directly to ground
- **Flat side** of LED body indicates cathode (-) side

### Step 5: Final Connections Check
```
Pin Assignment Summary:
├── Pin 3: Blue LED (with 220Ω resistor)
├── Pin 5: Green LED (with 220Ω resistor)  
├── Pin 6: Red LED (with 220Ω resistor)
├── Pin 8: Active Buzzer positive
├── Pin 9: SG90 Servo signal (orange wire)
├── 5V: Servo power + LED/Buzzer power rail
└── GND: All component grounds
```

---

## [PLUG] Assembly Options

### Option A: Quick Breadboard Setup (30 minutes)

**Best for:** Initial testing, hackathon demo, rapid prototyping

**Assembly Steps:**
1. **Mount Arduino UNO** beside breadboard
2. **Insert components** into breadboard holes:
   - RGB LED in center area
   - Jumper wires for connections
3. **Connect servo motor** - often too large for breadboard, place beside it
4. **Wire according to diagram** above
5. **Test each component** individually before full assembly

**Pros:** Fast setup, easy to modify, good for debugging
**Cons:** Less portable, exposed wires, not suitable for wearing

### Option B: 3D Printed Belt Clip (2-3 hours + print time)

**Best for:** Professional demo, daily use, judge presentation

**Assembly Steps:**
1. **3D Print enclosure** (70-90 minutes, see FUSION360_DESIGN_GUIDE.md)
2. **Mount servo** in main cavity with M2 screws
3. **Install LED** in front window cutout
4. **Mount buzzer** in side cavity
5. **Solder connections** instead of jumper wires (more reliable)
6. **Route wires** through cable management channel
7. **Test all functions** before closing enclosure
8. **Attach belt clip** with snap-fit mechanism

**Pros:** Professional appearance, portable, durable, suitable for wearing
**Cons:** Requires 3D printer, longer assembly time, harder to modify

---

## [TEST] Testing Procedure

### Phase 1: Power-On Test
1. **Connect Arduino** to computer via USB
2. **Check power LED** on Arduino (should be solid red)
3. **Open Arduino IDE** → Tools → Port → Select your Arduino
4. **Upload test sketch**: 

```cpp
void setup() {
  pinMode(3, OUTPUT); // Blue LED
  pinMode(5, OUTPUT); // Green LED  
  pinMode(6, OUTPUT); // Red LED
  pinMode(8, OUTPUT); // Buzzer
  Serial.begin(9600);
  Serial.println("Hardware test starting...");
}

void loop() {
  // Test each component individually
  digitalWrite(6, HIGH); delay(500); digitalWrite(6, LOW); delay(500); // Red
  digitalWrite(5, HIGH); delay(500); digitalWrite(5, LOW); delay(500); // Green  
  digitalWrite(3, HIGH); delay(500); digitalWrite(3, LOW); delay(500); // Blue
  digitalWrite(8, HIGH); delay(200); digitalWrite(8, LOW); delay(800); // Buzzer
  Serial.println("Test cycle complete");
  delay(1000);
}
```

**Expected Behavior:**
- Red LED blinks for 1 second
- Green LED blinks for 1 second  
- Blue LED blinks for 1 second
- Buzzer beeps briefly
- Serial monitor shows "Test cycle complete"

### Phase 2: Servo Motor Test
1. **Upload servo test sketch**:

```cpp
#include <Servo.h>
Servo myServo;

void setup() {
  myServo.attach(9);
  Serial.begin(9600);
  Serial.println("Servo test starting...");
}

void loop() {
  myServo.write(90);  // Center
  delay(1000);
  myServo.write(75);  // Left oscillation
  delay(500);
  myServo.write(105); // Right oscillation  
  delay(500);
  Serial.println("Servo oscillation complete");
}
```

**Expected Behavior:**
- Servo moves to center (90°)
- Oscillates left and right (haptic feedback simulation)
- No jerky movements or unusual sounds

### Phase 3: ClearPath Firmware Test
1. **Upload main firmware**: `arduino/clearpath_wristband.ino`
2. **Open Serial Monitor** (9600 baud)
3. **Look for boot messages**:
   ```
   === ClearPath Belt Clip Starting ===
   System initialized successfully  
   Ready for commands
   ```
4. **Test manual commands**:
   - Type `STATUS_CHECK` → Should show system status
   - Type `DIRECTION_LEFT` → Red LED + left servo pattern
   - Type `SPEECH_START` → Purple LED + speech pulse

---

## [WRENCH] Troubleshooting Common Issues

### LED Not Working
**Symptoms:** LED doesn't light up or wrong colors
**Solutions:**
- Check resistor connections (220Ω required for each LED)
- Verify LED polarity (long leg = anode = + side goes to resistor)
- Verify LED polarity (short leg = cathode = - side goes to ground)
- Test individual pins with voltmeter (should read ~3.3V when HIGH)
- Ensure 5V power rail has voltage
- Check that LED isn't burned out (swap with known good LED)

### Servo Not Moving  
**Symptoms:** Servo doesn't respond to commands
**Solutions:**
- Verify 5V power connection (servo needs adequate current)
- Check signal wire on pin 9
- Test with simple servo sweep code
- Ensure servo isn't physically blocked

### Buzzer Silent
**Symptoms:** No sound from buzzer
**Solutions:**
- Confirm it's an "active" buzzer (has built-in oscillator)  
- Check polarity (+ to pin 8, - to ground)
- Test with digitalWrite(8, HIGH) to verify
- Ensure pin 8 is set to OUTPUT mode

### Arduino Not Detected
**Symptoms:** Computer can't find Arduino
**Solutions:**
- Try different USB cable (must be data cable, not charge-only)
- Check USB port and try different port
- Install Arduino drivers if needed
- Verify Arduino power LED is on

### Serial Communication Issues  
**Symptoms:** Web Serial API can't connect
**Solutions:**
- Close Arduino IDE Serial Monitor (conflicts with browser)
- Enable Web Serial in browser flags
- Try different USB port
- Restart Arduino (unplug/replug USB)

---

## [BOX] Professional Tips

### Wire Management
- **Color coding**: Red=power, Black=ground, Other colors=signals
- **Length**: Keep wires short to reduce noise
- **Routing**: Avoid crossing power and signal wires
- **Strain relief**: Loop wires near connections

### Power Considerations  
- **Servo current**: SG90 draws ~500mA when moving
- **Arduino limits**: USB can provide ~500mA total
- **External power**: Consider 5V external supply for heavy use
- **Voltage drop**: Keep power wires short and thick

### Mechanical Assembly
- **Servo mounting**: Ensure horn has clearance to oscillate  
- **LED positioning**: Flush mount for even light diffusion
- **Buzzer placement**: Sound holes must not be blocked
- **Cable flex**: Plan for movement and flexing

### Testing Best Practices
- **One component at a time**: Test individually before combining
- **Document working configs**: Note pin assignments that work
- **Measure voltages**: Use multimeter to verify connections
- **Serial debugging**: Add print statements for troubleshooting

---

## timing Estimates

| Setup Type | Assembly Time | Skill Level | Portability |
|-----------|---------------|-------------|-------------|
| **Breadboard** | 30 minutes | Beginner | Low |
| **Soldered** | 2 hours | Intermediate | Medium |  
| **3D Printed** | 3 hours + print | Advanced | High |

## [TARGET] Hackathon Strategy

For CUHackIt 2026, I recommend:

**[FAST] Quick Demo Setup (Day 1)**
- Start with breadboard setup for rapid testing
- Verify all components work individually  
- Upload ClearPath firmware and test Web Serial connection
- Focus on getting AR app communicating with hardware

**[TROPHY] Professional Presentation (Day 2)** 
- If time permits, assemble 3D printed version
- Clean up wiring and add proper strain relief
- Test complete system integration
- Practice demo presentation with reliable hardware setup

Your hardware setup is now ready to provide amazing haptic feedback for your ClearPath AR accessibility system! [ROCKET]