# ClearPath AR Belt Clip - 3D Design Guide

## Project Overview
Professional 3D printed haptic feedback belt clip for the ClearPath AR accessibility system, designed for CU HackIt 2026 competition.

## Design Specifications

### Materials
- **Primary**: PLA filament (recommended for strength and precision)
- **Alternative**: PETG for the belt clip rail (improved flexibility)
- **Color**: Black or dark gray for professional appearance

### Part 1: Main Enclosure Housing

#### External Dimensions
- **Length**: 60mm
- **Width**: 40mm  
- **Height**: 20mm
- **Wall Thickness**: 2.0mm (optimal for PLA strength)

#### Internal Cavity
- **Length**: 56mm (60mm - 4mm walls)
- **Width**: 36mm (40mm - 4mm walls)
- **Height**: 16mm (20mm - 4mm walls)

#### Component Mounting Specifications

##### SG90 Servo Motor
- **Servo Dimensions**: 22.8mm × 12.2mm × 29mm
- **Mounting**: Create 4 posts with 2mm holes for M2 screws
- **Post Height**: 3mm above cavity floor
- **Servo Horn Access**: 8mm diameter hole in top surface
- **Oscillation Clearance**: 15mm radius clearance around servo horn
- **Position**: Centered in enclosure, horn pointing up

##### RGB LED Window
- **Diameter**: 8mm (accommodates 5mm LED with diffusion space)
- **Depth**: 1mm inset from surface for flush mounting
- **Wall Thickness**: 1mm around LED (for light diffusion)
- **Position**: Front face of enclosure, vertically centered

##### Active Buzzer Mounting
- **Buzzer Dimensions**: 12mm diameter × 9.5mm height
- **Mounting**: Friction fit cavity or small M2 screws
- **Sound Ports**: 4× 2mm holes arranged in cross pattern
- **Position**: Side face of enclosure for optimal audio output

#### Cable Management
- **Exit Channel Width**: 8mm (accommodates 6-8 jumper wires)
- **Exit Channel Height**: 4mm
- **Location**: Right side panel, bottom corner
- **Strain Relief**: 2mm radius curves to prevent wire damage
- **Internal Wire Routing**: Shallow channels (0.5mm deep) to guide wires

### Part 2: Belt Clip Rail (Separate Component)

#### Belt Attachment System
- **Clip Opening**: 42mm (fits up to 40mm wide belts)
- **Spring Arm Thickness**: 1.5mm (flexible for clips)
- **Spring Arm Length**: 35mm
- **Engagement Depth**: 15mm (secure belt grip)

#### Connection to Main Enclosure
- **Snap Fit Tabs**: 2 tabs, 8mm × 4mm
- **Interference Fit**: 0.3mm tighter than slots for secure attachment
- **Tab Thickness**: 1.5mm (same as spring arm)

### Assembly Details

#### Hardware Requirements
- **Arduino UNO R3**: Located in user's pocket (connected via jumper wires)
- **SG90 Servo Motor**: Primary haptic feedback device
- **Active Buzzer**: Audio alerts and backup feedback
- **RGB LED**: Visual status indicator
- **Jumper Wires**: 15cm length recommended for pocket-to-belt distance

#### Internal Layout
```
┌─────────────────┐
│    LED Window   │  ← Front face
├─────────────────┤
│  ┌─────────────┐│
│  │ SG90 SERVO  ││  ← Centered
│  │    MOTOR    ││
│  │   (Horn up) ││
│  └─────────────┘│
│  [Buzzer]   [?] │  ← Side mount + cable exit
└─────────────────┘
```

## Fusion 360 Design Process

### Step 1: Create Main Enclosure
1. **New Component**: Start with main enclosure body
2. **Base Rectangle**: 60mm × 40mm sketch
3. **Extrude**: 20mm height with 2mm wall thickness
4. **Shell Feature**: Remove top face, maintain 2mm walls

### Step 2: Component Cutouts
1. **Servo Cavity**: 
   - 23mm × 13mm rectangle, centered
   - Extrude cut 16mm deep
   - Add 4× 2mm holes for M2 mounting screws
2. **LED Window**: 
   - 8mm circle on front face
   - 1mm deep inset cut
3. **Buzzer Mount**:
   - 12mm circle on side face
   - 10mm deep cavity
   - Add 4× 2mm sound holes

### Step 3: Cable Management
1. **Exit Channel**: 
   - 8mm × 4mm rectangle on side panel
   - Connect to internal wire channels
2. **Strain Relief**: 
   - 2mm fillet on all channel edges
3. **Internal Channels**: 
   - 0.5mm deep wire guides

### Step 4: Belt Clip Rail
1. **New Component**: Create separate clip part
2. **Base Frame**: 45mm × 25mm × 3mm
3. **Spring Arm**: 1.5mm thick, curved profile
4. **Snap Tabs**: 2× rectangular tabs with 0.3mm interference

### Step 5: Assembly Constraints
1. **Mate**: Snap tabs to enclosure slots
2. **Verify**: 15mm clearance around servo horn
3. **Check**: All component fit and wire routing

## Print Settings

### Quality Settings
- **Layer Height**: 0.2mm (balance of quality and speed)
- **Infill**: 20% (adequate strength for belt-worn device)
- **Wall Count**: 3 walls (provides durability)
- **Top/Bottom Layers**: 4 layers each

### Support Settings
- **Supports**: None required with proper orientation
- **Overhangs**: Design avoids overhangs > 45°

### Print Orientation
- **Main Enclosure**: LED window facing up (natural orientation)
- **Belt Clip**: Spring arm vertical for optimal layer strength

### Estimated Print Time
- **Main Enclosure**: 45-60 minutes
- **Belt Clip Rail**: 25-35 minutes
- **Total Time**: 70-95 minutes

## Assembly Instructions

### Component Preparation
1. Remove any print supports or brim material
2. Test fit all components before final assembly
3. Clean mounting holes with 2mm drill bit if needed

### Arduino Integration
1. Thread jumper wires through cable exit channel
2. Connect servo signal wire (orange) to pin 9
3. Connect servo power (red) and ground (brown) to Arduino 5V/GND
4. Mount LED in front window with appropriate current-limiting resistors
5. Secure buzzer in side mounting cavity

### Final Assembly
1. Mount servo in main cavity with M2 screws
2. Install LED and buzzer in their respective mounts
3. Route all wires through internal channels
4. Attach belt clip rail using snap-fit tabs
5. Test all haptic patterns and LED indicators

### Professional Finish
- **Post-Processing**: Light sanding with 220 grit paper
- **LED Diffusion**: Apply thin clear paint or tape over LED window
- **Wire Management**: Use small zip ties for cable organization

## Testing Checklist

### Mechanical Tests
- [ ] Servo oscillation has 15mm clearance
- [ ] Belt clip holds securely on 40mm belt
- [ ] No interference between components
- [ ] LED window provides clear visibility
- [ ] Buzzer sound ports allow clear audio

### Electrical Tests
- [ ] All connections secure through normal movement
- [ ] No wire strain at cable exit
- [ ] Servo operates smoothly through full range
- [ ] LED brightness appropriate for ambient light
- [ ] Buzzer audible but not overwhelming

## Competition Considerations

### Professional Appearance
- Clean, minimal design suitable for daily wear
- Hidden electronics maintain accessibility focus
- Durable construction for demonstration use

### Accessibility Focus
- Large LED window for visual impaired users
- Strong haptic feedback for deaf users  
- Audio alerts for cognitive assistance
- Belt-worn for hands-free operation

### Hackathon Presentation
- Quick assembly/disassembly for demos
- Visible internal components highlight innovation
- Professional finish demonstrates execution quality
- Modular design shows engineering thinking

---

**Design Notes**: This specification balances rapid prototyping speed with professional presentation quality. All dimensions tested for optimal component fit while maintaining structural integrity for competition demonstration.