# ONE JUMP - Complete Game Design Document
**Version 2.0 - Extended Edition**  
**"Time to Ram and Jam!"**

---

## Table of Contents
1. [Executive Summary](#executive-summary)
2. [Core Concept](#core-concept)
3. [Game Mechanics](#game-mechanics)
4. [Scoring System](#scoring-system)
5. [Level Design & Progression](#level-design--progression)
6. [Story & Narrative](#story--narrative)
7. [Characters](#characters)
8. [Visual Design](#visual-design)
9. [Audio Design](#audio-design)
10. [User Interface](#user-interface)
11. [Technical Implementation](#technical-implementation)
12. [Tutorial System](#tutorial-system)
13. [Power-Ups & Modifiers](#power-ups--modifiers)
14. [Accessibility Features](#accessibility-features)
15. [Social Features](#social-features)
16. [Analytics & Metrics](#analytics--metrics)
17. [Post-Launch Content](#post-launch-content)

---

## Executive Summary

**One Jump** is a high-stakes vertical falling game where Starsky the Ram, Oklahoma City University's cosmic mascot, descends from the stars to Earth through 10 increasingly challenging stages. Players earn points through daredevil near-misses and risky trick maneuvers in a retro Duke Nukem-inspired aesthetic with family-friendly charm.

### Key Features
- **10 Unique Atmospheric Stages** - From space to campus
- **Risk/Reward Trick System** - Higher risk equals higher reward
- **Near-Miss Mechanics** - Thread the needle for bonus points
- **Story-Driven Campaign** - Charming narrative between stages
- **Retro Aesthetic** - DOS-era graphics with modern polish
- **Educational Easter Eggs** - Learn while you leap!

### Target Audience
- **Primary**: College students and alumni (ages 17-30)
- **Secondary**: Casual gamers who enjoy skill-based challenges
- **Tertiary**: Younger players (10+) drawn to mascot character

---

## Core Concept

### Game Pillars

#### 1. **Controlled Chaos**
Every moment balances control with chaos - you're always falling, but you're in charge of HOW you fall.

#### 2. **Risk Theater**
Every trick is a dramatic decision - safety or glory?

#### 3. **Personality Plus**
Starsky's charm and humor make failure fun and success satisfying.

#### 4. **One More Try**
Quick restart, clear feedback, and visible improvement drive replay.

### Core Loop (30 seconds)
1. **Read** the upcoming obstacle pattern (2 seconds)
2. **Decide** on safe path vs. trick opportunity (1 second)
3. **Execute** movement and/or trick (3-5 seconds)
4. **React** to near-miss feedback or collision (1 second)
5. **Repeat** with increasing speed and complexity

### Extended Loop (5-10 minutes)
1. **Start Stage** with story panel
2. **Complete Stage** or retry until success
3. **View Story** progression panel
4. **Check Score** and compare to personal best
5. **Continue** to next stage or replay for better score

---

## Game Mechanics

### Movement System

#### Base Physics
```javascript
const PHYSICS = {
  // Gravity & Speed
  GRAVITY_BASE: 400,           // Base gravity acceleration
  GRAVITY_MAX: 600,            // Maximum gravity (late stages)
  TERMINAL_VELOCITY: 1000,     // Maximum fall speed
  SPEED_STAGES: [300, 350, 400, 450, 500, 550, 600, 700, 800, 900], // Per stage
  
  // Horizontal Movement
  HORIZONTAL_SPEED: 450,       // Left/right movement speed
  HORIZONTAL_ACCEL: 2400,      // Acceleration rate
  HORIZONTAL_DECEL: 1800,      // Deceleration rate
  AIR_CONTROL: 0.85,           // Control multiplier while tricking
  
  // Tricks
  TRICK_DURATION_BASE: 800,    // MS of no control
  TRICK_COOLDOWN: 200,         // MS between tricks
  TRICK_CANCEL_WINDOW: 100,    // MS to cancel into another trick
  
  // Collision & Near-Miss
  PLAYER_HITBOX: { w: 24, h: 36 },
  NEAR_MISS_RANGES: [50, 40, 30, 20], // Pixel thresholds
  GRAZE_BONUS_RANGE: 10,       // Super close calls
  
  // Special Mechanics
  SPEED_BOOST_MULT: 1.5,       // Boost multiplier
  SPEED_BOOST_DURATION: 2000,  // MS of boost
  WALL_BOUNCE_FORCE: 300,      // Horizontal push from walls
};
```

#### Advanced Movement Mechanics

**Momentum Conservation**
- Horizontal momentum carries through tricks
- Speed builds up over successful trick chains
- Wall bounces preserve 70% of momentum

**Air Strafing**
- Hold direction before trick for wider arc
- Release direction mid-trick for tight spin
- Combine with walls for "wall-kick" tricks

### Input System

#### Control Schemes

**Keyboard (Primary)**
```
← / A:        Move left
→ / D:        Move right  
↑ / W:        Slow fall (costs trick meter)
↓ / S:        Fast fall (builds trick meter)
SPACE:        Execute trick
SHIFT:        Speed boost
1-5:          Quick trick select
TAB:          View stage map
ESC:          Pause menu
R:            Quick restart (hold 1 second)
```

**Gamepad Support**
```
Left Stick:   Movement
Right Trigger: Trick
Left Trigger:  Speed boost
A/X:          Trick
B/Circle:     Cancel
D-Pad:        Trick selection
```

**Mobile Touch** (Future)
```
Left side:    Movement zones
Right side:   Trick button
Swipe up:     Speed boost
Swipe down:   Fast fall
Two finger:   Pause
```

### Collision System

#### Collision Types

1. **Hard Collision** - Instant stage failure
   - Direct obstacle hit
   - Out of bounds (too far left/right)
   - Missing landing zone

2. **Soft Collision** - Reduces score/combo
   - Grazing obstacles (damage but continue)
   - Wind current fights
   - Speed reduction zones

3. **Positive Collision** - Beneficial contact
   - Power-up collection
   - Star tokens
   - Speed rings

#### Hitbox Visualization
```
Player States:
Normal:     [  24x36 rectangle  ]
Tricking:   [  32x32 circle     ]
Diving:     [  16x40 rectangle  ]
Spinning:   [  40x20 rectangle  ]
```

---

## Scoring System

### Comprehensive Scoring

#### Point Categories

| Action | Base Points | Multipliers | Max Potential |
|--------|-------------|-------------|---------------|
| **Near Misses** ||||
| - Far (40-50px) | 100 | x1.0 | 100 |
| - Close (30-40px) | 150 | x1.5 | 225 |
| - Tight (20-30px) | 200 | x2.0 | 400 |
| - Graze (<20px) | 300 | x3.0 | 900 |
| **Tricks** ||||
| - Ram Spin | 250 | xCombo | 2500 |
| - Star Flip | 350 | xCombo | 3500 |
| - Horn Polish | 400 | xCombo | 4000 |
| - Cosmic Twist | 500 | xCombo | 5000 |
| - Full Starsky | 750 | xCombo | 7500 |
| **Combos** ||||
| - Trick Chain | +50 per | xChain | Unlimited |
| - Near-Miss Chain | +25 per | xChain | Unlimited |
| - Mixed Chain | +75 per | xChain | Unlimited |
| **Stage Completion** ||||
| - Base Clear | 5000 | xStage# | 50000 |
| - No Hit Bonus | 10000 | x2 | 20000 |
| - All Stars | 5000 | x1 | 5000 |
| - Speed Bonus | 2500 | xTime | 7500 |
| **Special** ||||
| - Thread OCU Letters | 10000 | x1 | 10000 |
| - Secret Areas | 1000 | x5 | 5000 |

#### Combo System Details

**Building Combos**
- Each successful action adds to combo counter
- Timer: 3 seconds (refreshes on each action)
- Visual indicator: Multiplier number grows and glows
- Audio feedback: Rising pitch with each combo level

**Combo Levels**
```
1-3 actions:   x1 multiplier (white text)
4-6 actions:   x2 multiplier (yellow text)
7-9 actions:   x3 multiplier (orange text)
10-14 actions: x5 multiplier (red text)
15-19 actions: x8 multiplier (purple text)
20+ actions:   x10 multiplier (rainbow text + particles)
```

**Combo Breakers**
- Any collision (instant reset)
- Time out (gradual decrease)
- Safe landing (converts to points)

### Grade System

End of stage letter grades:
- **S+**: 150% of target score + no hit
- **S**: 125% of target score
- **A**: 100% of target score  
-agnB**: 75% of target score
- **C**: 50% of target score
- **D**: Stage completed

---

## Level Design & Progression

### Detailed Stage Breakdowns

#### Stage 1: The Cosmic Perch
**Theme**: Tutorial in the stars  
**Altitude**: 400km (Low Earth Orbit)  
**Length**: 30 seconds  
**Target Score**: 10,000

**Obstacles**:
- Satellites (slow, predictable patterns)
- Space junk (stationary)
- Solar panels (wide, easy to see)

**Unique Mechanics**:
- Reduced gravity (slower fall)
- No wind currents
- Extra-wide near-miss zones

**Obstacle Patterns**:
```
Pattern A: "Satellite Parade"
[S]    [S]    [S]
   [J]    [J]
      [S]    [S]

Pattern B: "Debris Field"
[J] [J] [J]
  [GAP]
[J] [J] [J]

S = Satellite, J = Junk, GAP = Safe path
```

**Story Beat** (3 panels):
1. Starsky adjusting his sunglasses in zero gravity
2. Radio: "Starsky! The freshman orientation is starting!"
3. "Better hustle my hooves! Can't let my Stars down!"

**Hidden Secrets**:
- OCU pennant floating in background (+1000 pts)
- Astronaut gives thumbs up if you wave near ISS

---

#### Stage 2: Thermosphere Thunder
**Theme**: Burning entry  
**Altitude**: 300km → 85km  
**Length**: 45 seconds  
**Target Score**: 20,000

**Obstacles**:
- Meteors (diagonal movement)
- Heat waves (speed up zones)
- Plasma bursts (telegraphed danger)

**Unique Mechanics**:
- Heat zones accelerate falling
- Meteors have trail damage
- Screen shakes during reentry

**Obstacle Patterns**:
```
Pattern A: "Meteor Shower"
  [M↘]
      [M↘]
   [M↘]
       [H][H][H] (Heat zone)

Pattern B: "Plasma Maze"
[P] [ ] [P]
[ ] [P] [ ]
[P] [ ] [P]

M = Meteor, H = Heat, P = Plasma
```

**Environmental Hazards**:
- Screen gradually turns orange
- Heat distortion effects
- Particle trails increase

**Story Beat** (4 panels):
1. Starsky's wool slightly singed
2. Shooting star passes: "Hey, that's my cousin!"
3. Starsky waves: "Tell mom I'll be home for dinner!"
4. Burns marshmallow on his horn: "Waste not!"

---

#### Stage 3: Mesosphere Mayhem
**Theme**: Ice and wind  
**Altitude**: 85km → 50km  
**Length**: 50 seconds  
**Target Score**: 35,000

**Obstacles**:
- Ice crystals (shatter into fragments)
- Wind tunnels (push left/right)
- Noctilucent clouds (obscure vision)

**Unique Mechanics**:
- Wind affects movement
- Ice creates temporary platforms
- Clouds hide obstacles

**Advanced Patterns**:
```
Pattern A: "Crystal Cascade"
[I]→(shatter)→[i][i][i]
        ↓
    [Platform]

Pattern B: "Wind Tunnel"
←←←[W]←←←
   ↓
→→→[W]→→→

I = Ice, i = fragment, W = Wind source
```

**Story Beat** (4 panels):
1. Starsky shivers: "Should've brought my varsity jacket!"
2. Pulls out OCU pennant, uses as cape
3. "That's better! OCU Stars shine in any weather!"
4. Does superhero pose with cape flowing

---

#### Stage 4: Stratosphere Showdown
**Theme**: Scientific instruments  
**Altitude**: 50km → 12km  
**Length**: 55 seconds  
**Target Score**: 50,000

**Obstacles**:
- Weather balloons (bounce physics)
- Research equipment (rotating hazards)
- Ozone pockets (slow zones)

**Unique Mechanics**:
- Balloons can be bounced off for tricks
- Ozone clouds slow descent
- Science equipment has predictable rotation

**Complex Patterns**:
```
Pattern A: "Balloon Bounce"
    [B]
   ↙  ↘
[B]      [B]
(Bounce path opportunities)

Pattern B: "Equipment Gauntlet"
[R↻] [ ] [R↺]
[ ] [R↻] [ ]
[R↺] [ ] [R↻]

B = Balloon, R = Rotating equipment
```

**Story Beat** (4 panels):
1. Weather balloon with camera
2. Starsky poses: "Make sure you get my good side!"
3. Winks: "That's EVERY side, baby!"
4. Balloon operator: "This is going viral!"

---

#### Stage 5: Jet Stream Jam
**Theme**: Commercial aviation  
**Altitude**: 12km → 10km  
**Length**: 60 seconds  
**Target Score**: 70,000

**Obstacles**:
- Passenger planes (huge, moving)
- Jet streams (massive push zones)
- Contrails (lingering hazards)

**Unique Mechanics**:
- Planes have multiple hitboxes (wings, body)
- Jet streams can launch you across screen
- Contrails deal damage over time

**Aviation Patterns**:
```
Pattern A: "Flight Path"
[✈=========]→
         ←[✈=========]
   [✈=========]→

Pattern B: "Turbulence Zone"
[J→→→][ ][←←←J]
     [!]
[Turbulence shake]

✈ = Plane, J = Jet stream
```

**Mid-Game Checkpoint**: Quick save here

**Story Beat** (5 panels):
1. Pilot does double-take
2. Starsky gives thumbs up at window
3. Kid in plane: "Mom! I saw the OCU Ram!"
4. Mom: "Sure you did, sweetie..."
5. Starsky holds sign: "Hi Mom!"

---

#### Stage 6: Cloud Nine Catastrophe
**Theme**: Storm system  
**Altitude**: 10km → 5km  
**Length**: 65 seconds  
**Target Score**: 90,000

**Obstacles**:
- Lightning (telegraphed strikes)
- Thunder clouds (bouncy obstacles)
- Rain columns (push down)
- Hail (random projectiles)

**Unique Mechanics**:
- Lightning has 1-second warning
- Thunder clouds bounce you randomly
- Rain accelerates descent
- Hail follows player briefly

**Storm Patterns**:
```
Pattern A: "Lightning Strikes"
    [⚡]
[!]←1sec→[STRIKE]
    
Pattern B: "Cloud Maze"
[☁][☁][ ][☁]
[ ][☁][☁][ ]
[☁][ ][☁][☁]

⚡ = Lightning, ☁ = Cloud
```

**Weather Effects**:
- Screen flashes white on lightning
- Rain particle effects
- Wind howling sounds
- Darker atmosphere

**Story Beat** (5 panels):
1. Starsky's wool all frizzed from static
2. "Note to self: Wool + Lightning = Bad hair day!"
3. Smooths wool back: "Good thing I look rad no matter what!"
4. Lightning spells "OCU" in background
5. "Even the storm knows who's the STAR!"

---

#### Stage 7: Turbulence Territory
**Theme**: Living obstacles  
**Altitude**: 5km → 2km  
**Length**: 70 seconds  
**Target Score**: 110,000

**Obstacles**:
- Bird flocks (pattern movement)
- Small aircraft (predictable paths)
- Drones (follow player)
- Hang gliders (slow, wide)

**Unique Mechanics**:
- Birds move in formations
- Drones track player position
- Can "ride" hang gliders briefly

**Living Patterns**:
```
Pattern A: "V Formation"
    [B]
   [B][B]
  [B] [B]
 (moves as unit)

Pattern B: "Drone Chase"
[D]→(follows)
[D]→(follows)
  [Player]

B = Bird, D = Drone
```

**Story Beat** (5 panels):
1. Flock of geese in V formation
2. Starsky joins formation: "Mind if I catch a ride?"
3. Lead goose: "This is a no-ram zone!"
4. Starsky: "That's discrimination!"
5. Creates his own V with confused birds

---

#### Stage 8: Helicopter Heights
**Theme**: News coverage  
**Altitude**: 2km → 500m  
**Length**: 75 seconds  
**Target Score**: 135,000

**Obstacles**:
- News helicopters (rotating blades)
- Camera drones (flash stun)
- Hot air balloons (large, slow)
- Banner planes (long hitbox)

**Unique Mechanics**:
- Helicopter wash pushes player
- Camera flash temporarily blinds
- Can bounce off balloons
- Banners can be torn through for points

**Media Patterns**:
```
Pattern A: "Press Coverage"
[🚁]
 ↓(wash)
[Player pushed]

Pattern B: "Balloon Festival"
[🎈] [🎈] [🎈]
  [Gap] 
[🎈] [🎈] [🎈]
```

**Interactive Elements**:
- Reporters comment on your tricks
- Score multiplier for photogenic moves
- Easter egg: Find WRAM helicopter

**Story Beat** (5 panels):
1. News reporter: "This is unprecedented!"
2. Starsky peace sign: "Hi OCU!"
3. Reporter: "He's doing tricks! Is he insane?!"
4. Starsky: "I prefer 'confidently skilled'!"
5. Breaking News ticker: "RAM RATES RADICAL"

---

#### Stage 9: Skyscraper Slalom
**Theme**: Urban maze  
**Altitude**: 500m → 100m  
**Length**: 80 seconds  
**Target Score**: 160,000

**Obstacles**:
- Building edges (instant death)
- Construction cranes (swinging)
- Window washers (moving platforms)
- Rooftop gardens (soft landing)

**Unique Mechanics**:
- Threading between buildings scores big
- Cranes swing predictably
- Can wall-jump off buildings
- Gardens give brief safety

**Urban Patterns**:
```
Pattern A: "Threading the Needle"
[▐  ▌] (narrow gap)
[▐   ▌] 
[▐    ▌] (widening)

Pattern B: "Crane Dance"
   [C]
  ↙  ↘
[swing path]
```

**Environmental Details**:
- Office workers watch from windows
- Pigeons scatter
- Billboard cameos
- Traffic below gets louder

**Story Beat** (6 panels):
1. Construction workers eating lunch on beam
2. Starsky zooms past: "Save me a sandwich!"
3. Workers look at each other confused
4. Foreman: "Did we order a ram?"
5. Starsky between buildings: "Just passing through!"
6. Sign changes to read: "RAM CONSTRUCTION CO."

---

#### Stage 10: Campus Crashdown
**Theme**: Home sweet home  
**Altitude**: 100m → Ground  
**Length**: 90 seconds  
**Target Score**: 200,000

**Obstacles**:
- Flag poles (narrow gaps)
- University buildings (maze-like)
- Trees (branching paths)
- Fountain (final landing zone)

**Unique Mechanics**:
- OCU letters give massive bonus
- Multiple landing zones with different scores
- Students cheer for combos
- Marching band provides rhythm obstacles

**Campus Patterns**:
```
Pattern A: "OCU Threading"
[O]   [C]   [U]
 ↓     ↓     ↓
(+5000 each!)

Pattern B: "Quad Landing"
   [Trees]
  [Fountain]
[Landing zones]
```

**Final Challenge Sequence**:
1. Thread through OCU letters
2. Dodge marching band formation
3. Weave through flag ceremony
4. Land in fountain center

**Victory Story** (8 panels):
1. Perfect landing in fountain
2. Students cheering, throwing caps
3. President: "Starsky! You're late!"
4. "A Star arrives precisely when they mean to!"
5. Crowd lifts him up
6. "Who wants to hear about my space adventure?"
7. Everyone raises hands
8. "It started with ONE JUMP..."

---

## Story & Narrative

### Complete Story Arc

#### Act 1: The Call (Stages 1-3)
**Theme**: Duty calls
- Starsky realizes he's needed on campus
- Journey begins with confidence
- First challenges test his resolve

#### Act 2: The Journey (Stages 4-7)
**Theme**: Trials and growth
- Obstacles become more serious
- Starsky's determination grows
- Comic relief balances tension

#### Act 3: The Return (Stages 8-10)
**Theme**: Triumphant homecoming
- Media attention builds hype
- Urban challenges test all skills
- Campus welcomes their hero

### Extended Cutscenes

#### Opening (8 panels)
1. Starsky floating in space, reading "OCU Student Handbook"
   - {"prompt":"A retro video game style illustration of Starsky the Ram, an anthropomorphic ram mascot with bold golden curling horns and white fur, floating in deep space surrounded by stars and nebulas. He's wearing cool sunglasses and reading a red book labeled 'OCU Student Handbook'. The art uses bold 80s/90s video game aesthetics with dramatic space lighting and exaggerated perspective.","size":"1024x1024","n":1}

2. Telescope view of campus - freshman looking lost
   - {"prompt":"A retro video game cutscene showing a circular telescope view of a college campus from above. In the center, a confused freshman student with a backpack looks lost among campus buildings. The scene uses 80s/90s pixel-art inspired aesthetics with bold colors, showing OCU campus buildings and pathways from a bird's eye view.","size":"1024x1024","n":1}

3. Starsky floating in space saying "Those new Stars need guidance!"
   - {"prompt":"Retro video game illustration of Starsky the Ram floating in space with Earth visible below. The anthropomorphic ram with golden horns and sunglasses has a determined expression with a speech bubble saying 'Those new Stars need guidance!' The art uses bold 80s/90s comic book style with dramatic space backdrop and vibrant colors.","size":"1024x1024","n":1}

4. Starsky putting on jetpack and adjusts sunglasses
   - {"prompt":"Action-packed retro video game illustration of Starsky the Ram, the anthropomorphic ram mascot, strapping on a futuristic red jetpack while adjusting his cool wraparound sunglasses with one hoof. His golden horns gleam as he prepares for action. Bold 80s/90s video game cover art style with dynamic angles and dramatic lighting.","size":"1024x1024","n":1}

5. "Time for some RAM-spiration!"
   - {"prompt":"Retro video game style close-up of Starsky the Ram's face with a confident grin, his golden horns prominent and sunglasses reflecting stars. A bold speech bubble says 'Time for some RAM-spiration!' The art uses exaggerated 80s/90s comic book aesthetics with dramatic shading and vibrant colors against a space background.","size":"1024x1024","n":1}

6. Starsky checks watch and says: "Orientation in... 10 minutes?!"
   - {"prompt":"Retro video game illustration of Starsky the Ram looking shocked at a digital watch on his wrist, with a speech bubble saying 'Orientation in... 10 minutes?!' The anthropomorphic ram's eyes are wide behind his sunglasses. Bold 80s/90s cartoon style with exaggerated expressions, speed lines for emphasis, and a cosmic background.","size":"1024x1024","n":1}

7. Starsky smiles and puts his shades on and says with confidence "Good thing I know a shortcut!"
   - {"prompt":"Retro video game hero shot of Starsky the Ram putting on his cool sunglasses with a confident smirk. The anthropomorphic ram with golden horns has a speech bubble saying 'Good thing I know a shortcut!' Dynamic 80s/90s video game cover art style with dramatic lighting, lens flares on the sunglasses, and space backdrop.","size":"1024x1024","n":1}

##### In-game scene
1. (as starsky leaves the ledge under player control this square pops up) JUMPS with "STARS FOREVER!" battle cry
   - {"prompt":"Epic retro video game action scene of Starsky the Ram leaping off a space platform with arms spread wide, shouting 'STARS FOREVER!' in a bold speech bubble. The anthropomorphic ram with golden horns and sunglasses is captured mid-jump with his jetpack igniting. Dramatic 80s/90s video game aesthetics with motion lines, lens flares, and Earth visible far below.","size":"1024x1024","n":1}

#### Midpoint (After Stage 5) (6 panels)
1. Starsky catching breath on a cloud
   - {"prompt":"Retro video game illustration of Starsky the Ram sitting on a fluffy white cloud, wiping his brow and catching his breath. The anthropomorphic ram with golden horns has his sunglasses pushed up on his head. Peaceful mid-journey scene with blue sky, distant Earth below, and 80s/90s cartoon game art style.","size":"1024x1024","n":1}

2. Pulls out phone (somehow has signal)
   - {"prompt":"Humorous retro video game illustration of Starsky the Ram pulling out a smartphone while sitting on a cloud in the stratosphere. The phone shows full signal bars impossibly. The anthropomorphic ram looks amused. Bold 80s/90s cartoon style with exaggerated expressions and bright colors against a sky backdrop.","size":"1024x1024","n":1}

3. Text from mascot friends: "R U OK?"
   - {"prompt":"Retro video game style close-up of a smartphone screen showing text messages from other mascot friends asking 'R U OK?' with cartoon mascot profile pictures visible. The phone is held by Starsky the Ram's hoof. Bold 80s/90s pixel-art inspired interface design with vibrant colors and comic book style text bubbles.","size":"1024x1024","n":1}

4. Selfie with Earth in background
   - {"prompt":"Retro video game illustration of Starsky the Ram taking a selfie with his phone, golden horns prominent, sunglasses on, giving a thumbs up with Earth visible in the background. The anthropomorphic ram has a big grin. Bold 80s/90s video game art style with exaggerated perspective and vibrant space colors.","size":"1024x1024","n":1}

5. Posts: "Just dropping in! #RAMdom #OCUbound"
   - {"prompt":"Retro video game style social media post screen showing Starsky the Ram's selfie with the caption 'Just dropping in! #RAMdom #OCUbound'. The interface shows likes rapidly increasing. Bold 80s/90s inspired UI design with neon colors and pixelated elements mixed with cartoon graphics.","size":"1024x1024","n":1}

6. Comments explode: "LEGEND!" "Save some cool for us!"
   - {"prompt":"Retro video game illustration of a phone screen with comments exploding in cartoon style - 'LEGEND!' 'Save some cool for us!' with fire emojis and star effects bursting from the screen. Bold 80s/90s comic book style with exaggerated action lines and vibrant colors showing viral social media reaction.","size":"1024x1024","n":1}

#### Stage 1: Escape Velocity

##### Entrance (3 panels)
1. Starsky floating past the space station window, scientists inside drop their coffee
   - {"prompt":"Retro video game illustration showing Starsky the Ram floating past a space station window in zero gravity. Inside, shocked scientists in white coats drop their coffee cups in surprise. The anthropomorphic ram with golden horns and sunglasses waves casually. Bold 80s/90s cartoon style with exaggerated expressions and floating coffee droplets.","size":"1024x1024","n":1}

2. Adjusts sunglasses in zero gravity: "Time to show these satellites how to really orbit!"
   - {"prompt":"Retro video game close-up of Starsky the Ram adjusting his cool wraparound sunglasses while floating in space, with satellites visible in the background. Speech bubble says 'Time to show these satellites how to really orbit!' Bold 80s/90s action hero style with lens flares and cosmic backdrop.","size":"1024x1024","n":1}

3. Kicks off the station hull: "Let's make gravity jealous!"
   - {"prompt":"Dynamic retro video game action shot of Starsky the Ram kicking off from a space station hull to begin his descent, with a speech bubble saying 'Let's make gravity jealous!' His golden horns gleam as he pushes off with powerful legs. Bold 80s/90s comic book style with motion lines and dramatic perspective.","size":"1024x1024","n":1}

##### Exit (2 panels)
1. Starsky salutes the space station as he plummets away: "That's one small leap for a ram..."
   - {"prompt":"Retro video game illustration of Starsky the Ram saluting toward a distant space station while falling through space, with Earth visible below. Speech bubble reads 'That's one small leap for a ram...' Bold 80s/90s style with dramatic perspective showing him getting smaller against the vast cosmos.","size":"1024x1024","n":1}

2. Checks cosmic GPS: "Only 400,000 kilometers to OCU. Practically next door!"
   - {"prompt":"Retro video game illustration of Starsky the Ram checking a futuristic glowing GPS device while falling through space. The screen shows '400,000 km to OCU'. Speech bubble says 'Practically next door!' Bold 80s/90s sci-fi style with holographic display effects.","size":"1024x1024","n":1}

#### Stage 2: Asteroid Alley

##### Entrance (3 panels)
1. Asteroids come into view, Starsky cracks knuckles
   - {"prompt":"Retro video game scene showing Starsky the Ram cracking his knuckles as massive asteroids tumble into view around him. The anthropomorphic ram with golden horns looks determined and ready. Bold 80s/90s action game style with detailed space rocks and dramatic lighting.","size":"1024x1024","n":1}

2. "Dodgeball was my favorite subject!"
   - {"prompt":"Retro video game close-up of Starsky the Ram with a competitive grin, golden horns prominent, with a speech bubble saying 'Dodgeball was my favorite subject!' Asteroids float menacingly in the background. Bold 80s/90s cartoon style with exaggerated confident expression.","size":"1024x1024","n":1}

3. Strikes a superhero pose: "These space rocks are about to get schooled!"
   - {"prompt":"Retro video game illustration of Starsky the Ram striking a classic superhero pose with fists on hips, cape flowing (if he has one), saying 'These space rocks are about to get schooled!' Asteroids surround him dramatically. Bold 80s/90s comic book style with dynamic composition and action lines.","size":"1024x1024","n":1}

##### Exit (2 panels)
1. Starsky gives thumbs up to a confused astronaut on a passing asteroid
   - {"prompt":"Retro video game scene showing Starsky the Ram giving a thumbs up to a bewildered astronaut sitting on an asteroid. The astronaut in a space suit looks completely confused. Bold 80s/90s cartoon style with humorous character expressions and detailed space setting.","size":"1024x1024","n":1}

2. Points earthward: "350,000 kilometers to campus. I can almost smell the cafeteria food!"
   - {"prompt":"Retro video game illustration of Starsky the Ram pointing downward toward Earth while falling, with a speech bubble saying '350,000 kilometers to campus. I can almost smell the cafeteria food!' His golden horns catch starlight. Bold 80s/90s style with Earth visible in the distance.","size":"1024x1024","n":1}

#### Stage 3: Ice Ring Run

##### Entrance (3 panels)
1. Saturn's rings sparkle ahead, Starsky's eyes widen behind sunglasses
   - {"prompt":"Retro video game scene showing Starsky the Ram's eyes widening behind his sunglasses as Saturn's magnificent ice rings sparkle ahead. The crystalline rings shimmer with rainbow colors. Bold 80s/90s space adventure style with dramatic lighting and cosmic beauty.","size":"1024x1024","n":1}

2. "Ice to meet you, Saturn!"
   - {"prompt":"Retro video game close-up of Starsky the Ram making finger guns with a cheesy grin, speech bubble saying 'Ice to meet you, Saturn!' Ice crystals float around him sparkling. Bold 80s/90s cartoon style with pun-loving expression and icy particle effects.","size":"1024x1024","n":1}

3. Flexes: "Time to put these rings through their paces - Olympic style!"
   - {"prompt":"Retro video game illustration of Starsky the Ram flexing his muscles impressively, golden horns gleaming, saying 'Time to put these rings through their paces - Olympic style!' Saturn's rings create a spectacular backdrop. Bold 80s/90s action hero style with exaggerated muscles and dynamic pose.","size":"1024x1024","n":1}

##### Exit (2 panels)
1. Starsky surfs on an ice chunk: "And the judges give it a perfect 10!"
   - {"prompt":"Retro video game action shot of Starsky the Ram surfing on a large chunk of ice like a snowboard, arms out for balance, saying 'And the judges give it a perfect 10!' Ice particles trail behind him. Bold 80s/90s extreme sports style with motion blur and dynamic angle.","size":"1024x1024","n":1}

2. Earth gets bigger in view: "300,000 kilometers to go. The Stars are calling!"
   - {"prompt":"Retro video game illustration of Starsky the Ram looking toward Earth which now appears larger, with a determined expression. Speech bubble reads '300,000 kilometers to go. The Stars are calling!' Bold 80s/90s style with Earth's blue marble prominently featured.","size":"1024x1024","n":1}

#### Stage 4: Atmospheric Entry

##### Entrance (3 panels)
1. The atmosphere glows orange as Starsky approaches
   - {"prompt":"Retro video game scene showing Starsky the Ram approaching Earth's atmosphere which glows with intense orange and red fire. His figure is silhouetted against the burning atmospheric entry. Bold 80s/90s sci-fi style with dramatic fire effects and glowing plasma.","size":"1024x1024","n":1}

2. "Things are heating up! Good thing rams are naturally cool!"
   - {"prompt":"Retro video game close-up of Starsky the Ram with flames beginning to surround him, sunglasses reflecting the fire, saying 'Things are heating up! Good thing rams are naturally cool!' Bold 80s/90s action style with fire effects and confident expression despite the heat.","size":"1024x1024","n":1}

3. Strikes a confident pose as flames begin: "Let's turn up the heat on this entrance exam!"
   - {"prompt":"Retro video game illustration of Starsky the Ram striking a confident pose with arms crossed as flames engulf him, saying 'Let's turn up the heat on this entrance exam!' His golden horns glow from the heat. Bold 80s/90s comic style with intense fire effects.","size":"1024x1024","n":1}

##### Exit (2 panels)
1. Starsky emerges from the fire, slightly singed but grinning
   - {"prompt":"Retro video game illustration of Starsky the Ram emerging from flames with his white fur slightly singed and smoking, but still grinning confidently. His sunglasses are slightly askew. Bold 80s/90s cartoon style with smoke wisps and charred edges for comedy effect.","size":"1024x1024","n":1}

2. "Only 100 kilometers to OCU! I can practically see the library from here!"
   - {"prompt":"Retro video game scene of Starsky the Ram shading his eyes with one hoof to look down at Earth, saying 'Only 100 kilometers to OCU! I can practically see the library from here!' Clear blue sky surrounds him. Bold 80s/90s style with hopeful expression.","size":"1024x1024","n":1}

#### Stage 5: Cloud Nine

##### Entrance (3 panels)
1. Fluffy clouds surround Starsky as he breaks through
   - {"prompt":"Retro video game illustration of Starsky the Ram bursting through fluffy white clouds, creating a dramatic cloud break effect. His golden horns pierce through first. Bold 80s/90s style with volumetric cloud effects and god rays of sunlight.","size":"1024x1024","n":1}

2. "Now THIS is what I call higher education!"
   - {"prompt":"Retro video game close-up of Starsky the Ram with arms spread wide among beautiful clouds, huge grin, saying 'Now THIS is what I call higher education!' Sunlight creates a halo effect. Bold 80s/90s inspirational poster style with vibrant sky colors.","size":"1024x1024","n":1}

3. Does a backflip: "Cloud surfing should be a required course!"
   - {"prompt":"Retro video game action shot of Starsky the Ram performing an impressive backflip through clouds, his golden horns tracing an arc, saying 'Cloud surfing should be a required course!' Bold 80s/90s extreme sports style with motion lines and cloud wisps.","size":"1024x1024","n":1}

##### Exit (2 panels)
1. Starsky waves goodbye to a surprised pilot: "Thanks for sharing the airspace!"
   - {"prompt":"Retro video game scene showing Starsky the Ram waving cheerfully at a shocked pilot visible through an airplane cockpit window. Speech bubble says 'Thanks for sharing the airspace!' Bold 80s/90s cartoon style with exaggerated pilot's double-take expression.","size":"1024x1024","n":1}

2. "50 kilometers until touchdown! Time to stick the landing!"
   - {"prompt":"Retro video game illustration of Starsky the Ram in a diving pose with determination, looking down at the approaching ground, saying '50 kilometers until touchdown! Time to stick the landing!' Bold 80s/90s action style with speed lines and focused expression.","size":"1024x1024","n":1}

#### Stage 6: Storm Rider

##### Entrance (3 panels)
1. Dark storm clouds flash with lightning, Starsky grins wider
   - {"prompt":"Retro video game scene of Starsky the Ram grinning even wider as dark storm clouds flash with lightning around him. His golden horns conduct small sparks. Bold 80s/90s dramatic style with dark clouds, lightning effects, and fearless expression.","size":"1024x1024","n":1}

2. "Shocking development! But nothing stops this ram!"
   - {"prompt":"Retro video game close-up of Starsky the Ram with electricity crackling around his horns, confidently saying 'Shocking development! But nothing stops this ram!' Lightning illuminates his determined face. Bold 80s/90s comic style with electric effects.","size":"1024x1024","n":1}

3. Thunder booms, he shouts back: "Is that all you got? I've survived finals week!"
   - {"prompt":"Retro video game illustration of Starsky the Ram shouting defiantly at storm clouds with fist raised, saying 'Is that all you got? I've survived finals week!' Thunder and lightning surround him dramatically. Bold 80s/90s battle scene style with epic confrontation energy.","size":"1024x1024","n":1}

##### Exit (2 panels)
1. Starsky emerges from the storm, electricity still crackling off his horns
   - {"prompt":"Retro video game scene of Starsky the Ram emerging from dark clouds with residual electricity crackling between his golden horns like a Tesla coil. His fur is frizzed from static. Bold 80s/90s style with electric particle effects and dramatic exit.","size":"1024x1024","n":1}

2. "20 kilometers to campus! Even Mother Nature can't stop a Star!"
   - {"prompt":"Retro video game illustration of Starsky the Ram with fist pumped triumphantly, storm clouds behind him, saying '20 kilometers to campus! Even Mother Nature can't stop a Star!' Clear sky ahead. Bold 80s/90s victory style with contrast between storm and clear sky.","size":"1024x1024","n":1}

#### Stage 7: Wind Current

##### Entrance (3 panels)
1. Geese fly by in formation, Starsky joins them
   - {"prompt":"Retro video game scene of Starsky the Ram joining a V-formation of geese in flight, trying to fit in among them. The geese look confused at this ram among them. Bold 80s/90s cartoon style with humorous bird expressions and flying formation.","size":"1024x1024","n":1}

2. Lead goose squawks angrily, Starsky: "Don't worry, I'm just winging it!"
   - {"prompt":"Retro video game close-up of an angry lead goose squawking at Starsky the Ram who responds with a pun, saying 'Don't worry, I'm just winging it!' with a cheeky grin. Bold 80s/90s cartoon style with exaggerated animal expressions and speech bubbles.","size":"1024x1024","n":1}

3. Spins through the air: "Time to show these birds how migration is REALLY done!"
   - {"prompt":"Retro video game action shot of Starsky the Ram performing aerial spins and tricks while geese watch in amazement, saying 'Time to show these birds how migration is REALLY done!' Bold 80s/90s style with motion lines and impressed bird reactions.","size":"1024x1024","n":1}

##### Exit (2 panels)
1. Starsky high-fives a confused goose: "Thanks for the escort service!"
   - {"prompt":"Retro video game illustration of Starsky the Ram attempting to high-five a very confused goose mid-flight, saying 'Thanks for the escort service!' The goose's wing awkwardly meets his hoof. Bold 80s/90s cartoon style with humorous animal interaction.","size":"1024x1024","n":1}

2. City skyline appears: "10 kilometers! I can see the OCU flag from here!"
   - {"prompt":"Retro video game scene of Starsky the Ram pointing excitedly at the city skyline appearing below, saying '10 kilometers! I can see the OCU flag from here!' Buildings and urban landscape visible. Bold 80s/90s style with detailed cityscape background.","size":"1024x1024","n":1}

#### Stage 8: Helicopter Heights

##### Entrance (3 panels)
1. News helicopters swarm around, cameras rolling
   - {"prompt":"Retro video game scene of multiple news helicopters converging on Starsky the Ram, with camera operators visible filming him. TV station logos on the helicopters. Bold 80s/90s action news style with dramatic helicopter angles and spinning rotors.","size":"1024x1024","n":1}

2. Starsky faces the cameras: "This just in: Ram incoming!"
   - {"prompt":"Retro video game close-up of Starsky the Ram facing news cameras with a reporter's microphone gesture, saying 'This just in: Ram incoming!' in a news anchor voice. His golden horns gleam in camera lights. Bold 80s/90s broadcast style with lens flares.","size":"1024x1024","n":1}

3. Winks at news camera: "Tell my professors I'll be there for the quiz!"
   - {"prompt":"Retro video game illustration of Starsky the Ram winking directly at a news camera with finger guns, saying 'Tell my professors I'll be there for the quiz!' Camera lens reflection visible in his sunglasses. Bold 80s/90s style with charismatic media moment.","size":"1024x1024","n":1}

##### Exit (2 panels)
1. Starsky blows kisses to the news crews: "Remember, Stars shine brightest!"
   - {"prompt":"Retro video game scene of Starsky the Ram blowing kisses to multiple helicopter news crews while falling, saying 'Remember, Stars shine brightest!' Helicopters circle around him. Bold 80s/90s celebrity style with paparazzi energy and star quality poses.","size":"1024x1024","n":1}

2. "5 kilometers to touchdown! Hope they saved me a parking spot!"
   - {"prompt":"Retro video game illustration of Starsky the Ram looking down at the approaching campus, adjusting his sunglasses, saying '5 kilometers to touchdown! Hope they saved me a parking spot!' Bold 80s/90s style with campus buildings visible below.","size":"1024x1024","n":1}

#### Stage 9: Skyscraper Slalom

##### Entrance (3 panels)
1. City buildings tower around him, office workers pressed against windows
   - {"prompt":"Retro video game scene of Starsky the Ram falling between towering skyscrapers with office workers pressed against windows watching in amazement. His reflection appears in the glass buildings. Bold 80s/90s urban style with detailed building textures and crowd reactions.","size":"1024x1024","n":1}

2. "Urban jungle? More like urban playground!"
   - {"prompt":"Retro video game close-up of Starsky the Ram with a confident smirk surrounded by buildings, saying 'Urban jungle? More like urban playground!' City lights reflect in his sunglasses. Bold 80s/90s action style with urban environment and cocky attitude.","size":"1024x1024","n":1}

3. Wall-jumps between buildings: "Parkour? More like RAM-kour!"
   - {"prompt":"Retro video game action shot of Starsky the Ram performing a wall-jump between two buildings, legs extended, saying 'Parkour? More like RAM-kour!' Motion lines show his trajectory. Bold 80s/90s extreme sports style with dynamic urban acrobatics.","size":"1024x1024","n":1}

##### Exit (2 panels)
1. Starsky salutes construction workers: "Thanks for building my obstacle course!"
   - {"prompt":"Retro video game scene of Starsky the Ram saluting construction workers on scaffolding who wave back, saying 'Thanks for building my obstacle course!' Hard hats and tools visible. Bold 80s/90s cartoon style with blue-collar camaraderie.","size":"1024x1024","n":1}

2. Campus visible below: "1 kilometer! I can hear the fight song from here!"
   - {"prompt":"Retro video game illustration of Starsky the Ram with hand to ear in listening pose, OCU campus visible below, saying '1 kilometer! I can hear the fight song from here!' Campus buildings and fountain visible. Bold 80s/90s style with anticipation and school pride.","size":"1024x1024","n":1}

#### Stage 10: Campus Crashdown

##### Entrance (3 panels)
1. OCU campus spreads below, students pointing up and cheering
   - {"prompt":"Retro video game wide shot of OCU campus from above with crowds of students pointing up and cheering at Starsky the Ram descending. School buildings and quad visible. Bold 80s/90s celebration style with excited crowd energy and school spirit.","size":"1024x1024","n":1}

2. "Home sweet home! Did you miss me?"
   - {"prompt":"Retro video game close-up of Starsky the Ram with arms spread wide in greeting, huge smile, saying 'Home sweet home! Did you miss me?' Golden horns shining in sunlight. Bold 80s/90s homecoming style with warm, welcoming expression.","size":"1024x1024","n":1}

3. Arms spread wide: "Time for the most EPIC entrance in university history!"
   - {"prompt":"Retro video game hero shot of Starsky the Ram with arms spread wide like a skydiver, dramatic angle from below, saying 'Time for the most EPIC entrance in university history!' Bold 80s/90s epic moment style with dramatic perspective and heroic pose.","size":"1024x1024","n":1}

##### Exit (2 panels)
1. Starsky aims for the fountain: "Calculated trajectory: 100% awesome!"
   - {"prompt":"Retro video game POV shot of Starsky the Ram aiming for the campus fountain below, with targeting reticle overlay, saying 'Calculated trajectory: 100% awesome!' Bold 80s/90s video game HUD style with targeting graphics and precision landing setup.","size":"1024x1024","n":1}

2. "Zero kilometers! STARS FOREVER!"
   - {"prompt":"Retro video game illustration of Starsky the Ram in final approach to the fountain, fist raised triumphantly, shouting 'Zero kilometers! STARS FOREVER!' Fountain and cheering crowd visible below. Bold 80s/90s victory style with epic landing moment approaching.","size":"1024x1024","n":1}

#### Ending (10 panels)
1. Fountain landing with huge splash
   - {"prompt":"Epic retro video game illustration of Starsky the Ram landing in a campus fountain with a massive splash. Water droplets fly everywhere in dramatic slow motion, his golden horns gleaming through the spray. Students visible cheering around the fountain. Bold 80s/90s action game aesthetics with dynamic water effects and motion blur.","size":"1024x1024","n":1}

2. Students surround fountain cheering
   - {"prompt":"Retro video game celebration scene with dozens of diverse college students surrounding a fountain, cheering with raised arms. Starsky the Ram is visible in the center, soaking wet but triumphant. Bold 80s/90s cartoon style with vibrant school colors, confetti effects, and joyful crowd energy.","size":"1024x1024","n":1}

3. President hands him towel: "Starsky, that was..."
   - {"prompt":"Retro video game dialogue scene showing a distinguished university president in a suit handing a towel to a dripping wet Starsky the Ram. The president has a speech bubble saying 'Starsky, that was...' with an expression mixing stern and impressed. Bold 80s/90s visual novel style art with detailed character expressions.","size":"1024x1024","n":1}

4. "Necessary? Awesome? Ram-tastic?"
   - {"prompt":"Retro video game close-up of Starsky the Ram with a cheeky grin, still dripping wet, with multiple choice speech bubbles saying 'Necessary?' 'Awesome?' 'Ram-tastic?' His golden horns have water droplets and his sunglasses are slightly askew. Bold 80s/90s comic style with exaggerated expressions and vibrant colors.","size":"1024x1024","n":1}

5. "I was going to say 'unprecedented'..."
   - {"prompt":"Retro video game illustration of the university president with a slight smile, adjusting his glasses with a speech bubble saying 'I was going to say unprecedented...' Behind him, students are taking selfies with the wet Starsky the Ram. Bold 80s/90s visual novel art style with detailed backgrounds and character interactions.","size":"1024x1024","n":1}

6. Freshman approaches: "Can you teach me that?"
   - {"prompt":"Retro video game scene of a wide-eyed freshman student approaching Starsky the Ram with admiration, holding a notebook and saying 'Can you teach me that?' Starsky is drying his golden horns with a towel. Bold 80s/90s cartoon style showing the size difference and the freshman's awestruck expression.","size":"1024x1024","n":1}

7. Starsky grins: "First rule of being a Star..."
   - {"prompt":"Retro video game illustration of Starsky the Ram with a mentoring expression, one hoof on the freshman's shoulder, saying 'First rule of being a Star...' His golden horns catch the sunlight dramatically. Bold 80s/90s inspirational poster style with warm lighting and heroic composition.","size":"1024x1024","n":1}

8. "Always aim high..."
   - {"prompt":"Retro video game art of Starsky the Ram pointing dramatically upward toward the sky, his golden horns framing his determined face, with a speech bubble saying 'Always aim high...' The freshman and other students look up inspired. Bold 80s/90s motivational scene with dramatic sky and lens flares.","size":"1024x1024","n":1}

9. "...even when you're falling!"
   - {"prompt":"Retro video game illustration of Starsky the Ram with a knowing wink and finger guns pose, finishing his advice with '...even when you're falling!' Students around him laugh and cheer. Bold 80s/90s cartoon style with dynamic poses and comic book energy lines radiating from the character.","size":"1024x1024","n":1}

10. Everyone laughs, OCU flag waves, iris out on Starsky's wink
   - {"prompt":"Retro video game ending scene with a classic iris transition closing in on Starsky the Ram's winking face. The OCU flag waves proudly in the background, students are laughing and celebrating. Golden horns gleam one last time. Bold 80s/90s cartoon style with the classic circular closing transition effect and vibrant school colors.","size":"1024x1024","n":1}

---

## Characters

### Starsky the Ram - Complete Profile

#### Visual Design
- **Species**: Bighorn Ram
- **Height**: 5'10" (tall for a ram)
- **Build**: Athletic but approachable
- **Fur**: Bright white with blue highlights
- **Horns**: Golden, polished to shine
- **Outfit**: 
  - Red letterman jacket (optional)
  - Cool wraparound sunglasses
  - OCU cape (appears mid-game)
  - Red and white sneakers

#### Personality Matrix
| Trait | Example |
|-------|---------|
| **Confident** | "I don't fall, I descend with style!" |
| **Encouraging** | "You've got this, Stars!" |
| **Humorous** | "Gravity? Never heard of her!" |
| **Loyal** | "OCU Stars stick together!" |
| **Competitive** | "That high score is mine!" |

#### Voice Lines (Extended)

**Stage Start**:
- "Let's make this descent decent!"
- "Time to show gravity who's boss!"
- "Another stage, another slay!"
- "OCU Stars, watch this!"

**During Tricks**:
- "RAM-tastic!"
- "Styling and profiling!"
- "Physics? More like FUN-sics!"
- "That's what I call higher education!"

**Near Misses**:
- "Closer than my GPA to perfect!"
- "Threading the needle like finals week!"
- "That was on purpose, I swear!"
- "Calculated! ...Mostly!"

**Collisions**:
- "Oof! My pride!"
- "That's gonna leave a mark!"
- "I meant to do that... not!"
- "Time for a RAM-ake!"

**Victory**:
- "STARS forever!"
- "That's how we RAM!"
- "Textbook perfect!"
- "Who's the G.O.A.T? This ram!"

### Supporting Cast

#### President Patricia Powers
- Stern but secretly proud
- Always worried about insurance
- "Starsky, we talked about this..."

#### Freshman Freddy
- Wide-eyed newcomer
- Idolizes Starsky
- Becomes confident by game's end

#### News Reporter Nancy
- Excitable coverage
- Running commentary
- "This is Nancy at News 9..."

#### Rival Mascots (Cameos)
- **Sooner Schooner**: "Show-off!"
- **Cowboys' Pistol Pete**: "Not bad, wool-boy!"
- **Hurricane Henry**: "Blow it out your horns!"

---

## Visual Design

### Comprehensive Art Direction

#### Resolution Standards
```
Base Resolution: 1920x1080 (16:9)
Sprite Resolution: 32x32 (doubled from 16x16)
Animation Frame Rate: 12 FPS
Background Layers: 5 levels of parallax
Particle Density: 60 FPS target
```

#### Color Palette (Extended)

**Primary Palette**:
```css
--ocu-blue:        #002147
--ocu-gold:        #CDB87E
--star-white:      #FFFFFF
--ram-silver:      #C0C0C0
--sky-gradient-1:  #000428
--sky-gradient-2:  #004e92
--sky-gradient-3:  #87CEEB
--ground-brown:    #8B4513
```

**Stage-Specific Palettes**:
```css
/* Stage 1 - Space */
--space-black:     #000000
--star-white:      #FFFFFF
--nebula-purple:   #4B0082

/* Stage 6 - Storm */
--storm-gray:      #4A4A4A
--lightning-white: #FFFFCC
--rain-blue:       #1E3A8A

/* Stage 10 - Campus */
--grass-green:     #228B22
--building-brick:  #B22222
--fountain-blue:   #4169E1
```

#### Sprite Specifications

**Starsky Sprite Sheet**:
```
States Required:
- Idle (4 frames) - subtle breathing
- Falling (2 frames) - wind in wool
- Lean Left/Right (3 frames each)
- Trick 1-5 (6 frames each)
- Collision (4 frames) - impact and spin
- Victory (6 frames) - celebration loop
- Portrait emotions (8 types)

Total frames: ~70
```

**Obstacle Sprite Requirements**:
```
Each obstacle needs:
- Idle animation (2-4 frames)
- Danger telegraph (2 frames)
- Destruction (3 frames) if applicable
- Near-miss glow effect overlay
```

#### Particle Effects Library

**Essential Particles**:
```javascript
const PARTICLES = {
  speed_lines: {
    count: 20,
    speed: -500,
    alpha: 0.3,
    color: 0xFFFFFF
  },
  near_miss_sparks: {
    count: 10,
    spread: 360,
    lifetime: 0.5,
    color: 0xFFD700
  },
  trick_trail: {
    count: 30,
    follow: true,
    fade: 0.02,
    color: [0x002147, 0xCDB87E] // OCU colors
  },
  collision_stars: {
    count: 12,
    rotate: true,
    spread: 360,
    color: 0xFFFF00
  },
  landing_splash: {
    count: 50,
    gravity: true,
    spread: 180,
    color: 0x4169E1
  }
};
```

#### Background System

**Parallax Layers Per Stage**:
```
Layer 1 (0.1x): Distant elements (stars, far clouds)
Layer 2 (0.3x): Far background (mountains, skyline)
Layer 3 (0.5x): Mid background (clouds, buildings)
Layer 4 (0.7x): Near background (detail elements)
Layer 5 (1.0x): Gameplay layer
Layer 6 (1.2x): Foreground elements (optional)
```

---

## Audio Design

### Complete Sound Library

#### Music Tracks

**Menu Theme**: 
- Upbeat chiptune
- 120 BPM
- OCU fight song motif hidden at 0:45

**Stage Themes**:
```
Stage 1:  "Cosmic Campus" - Ethereal, mysterious
Stage 2:  "Heating Up" - Building tension
Stage 3:  "Ice to Meet You" - Crystal chimes
Stage 4:  "Stratosphere Serenade" - Scientific beeps
Stage 5:  "Jet Set Ram" - Fast-paced
Stage 6:  "Thunder Road" - Dramatic orchestra
Stage 7:  "Free as a Bird" - Light, airy
Stage 8:  "Breaking News" - Urgent, news theme
Stage 9:  "Urban Jungle" - City sounds, hip-hop influenced
Stage 10: "Home Sweet Home" - OCU fight song remix
```

#### Sound Effects (Detailed)

**Movement SFX**:
```
fallLoop:          "whoosh_loop.wav" (constant)
moveLeft/Right:    "swish_quick.wav"
trickStart:        "charge_up.wav"
trickExecute:      "whoosh_spin.wav"
trickLand:         "success_ding.wav"
speedBoost:        "rocket_boost.wav"
```

**Collision SFX**:
```
nearMiss_far:      "whoosh_by.wav"
nearMiss_close:    "sharp_whistle.wav"  
nearMiss_graze:    "metal_scrape.wav"
collision_soft:    "boing_soft.wav"
collision_hard:    "crash_big.wav"
wall_bounce:       "rubber_bounce.wav"
```

**Feedback SFX**:
```
combo_build:       "pitch_rise_01-10.wav"
combo_break:       "glass_shatter.wav"
score_count:       "coin_rapid.wav"
achievement:       "fanfare_short.wav"
new_highscore:     "fanfare_long.wav"
```

**Ambient Sounds** (per stage):
- Stage 1: Space whispers, radio chatter
- Stage 6: Thunder, rain
- Stage 8: Helicopter blades
- Stage 10: Crowd cheers, marching band

#### Voice Barks

**Starsky Voice Lines** (50+ contextual):
```json
{
  "game_start": ["Let's RAM!", "Time to drop!"],
  "trick_perfect": ["Nailed it!", "RAM-tastic!"],
  "near_miss": ["Too close!", "Whew!"],
  "collision": ["Oof!", "My horns!"],
  "combo_10": ["On fire!", "Unstoppable!"],
  "stage_clear": ["STARS forever!", "That's how we do it!"],
  "new_record": ["New personal best!", "Beat that!"]
}
```

### Dynamic Audio System

**Adaptive Music**:
- Tempo increases with falling speed
- Layers add with combo multiplier
- Muffles during underwater/cloud sections
- Beat syncs with obstacle patterns in Stage 10

---

## User Interface

### Menu Systems

#### Main Menu Layout
```
┌─────────────────────────────────┐
│         ONE JUMP                 │
│    [Starsky Animation]           │
│                                  │
│   > START DESCENT                │
│     CONTINUE (Stage X)           │
│     HIGH SCORES                 │
│     OPTIONS                      │
│     ACHIEVEMENTS                 │
│     CREDITS                      │
│                                  │
│   [A/D] Select  [Space] Confirm │
└─────────────────────────────────┘
```

#### Pause Menu
```
┌─────────────────────────────────┐
│         PAUSED                   │
│                                  │
│   > RESUME                       │
│     RESTART STAGE                │
│     OPTIONS                      │
│     QUIT TO MENU                 │
│                                  │
│   Stage: 5  Score: 45,250       │
│   Best: 52,100                  │
└─────────────────────────────────┘
```

### HUD Design

#### In-Game HUD Layout
```
Top Left:                Top Center:              Top Right:
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│ Speed: 450   │       │  COMBO x5    │       │Score: 12,450 │
│ Alt: 5,230m  │       │  ████████    │       │ Best: 15,200 │
└──────────────┘       └──────────────┘       └──────────────┘

Bottom Left:                                   Bottom Right:
┌──────────────┐                               ┌──────────────┐
│ Tricks: ★★★☆☆│                               │ Stage 5/10   │
│ Boost: ████  │                               │ 0:45         │
└──────────────┘                               └──────────────┘
```

#### Visual Indicators

**Speed Lines**:
- Increase with velocity
- Color shifts from white to red at max speed

**Combo Meter**:
- Fills up between multiplier thresholds
- Glows and pulses at high combos
- Shakes when about to expire

**Trick Indicator**:
- Shows available tricks as stars
- Depletes during execution
- Refills over time

**Near-Miss Aura**:
- Yellow glow for far (40-50px)
- Orange glow for close (30-40px)
- Red glow for tight (20-30px)
- White flash for graze (<20px)

### Results Screen

```
┌────────────────────────────────────────┐
│           STAGE COMPLETE!              │
│                                        │
│         [Starsky Victory Pose]         │
│                                        │
│  Stage Score:           45,250         │
│  Near Misses:      x23  2,300         │
│  Tricks:           x8   4,000         │
│  Combo Bonus:           x5.5          │
│  Time Bonus:            2,500         │
│  ─────────────────────────────         │
│  TOTAL:                54,050         │
│                                        │
│  Grade: A     New Record!              │
│                                        │
│  [CONTINUE]  [RETRY]  [MENU]          │
└────────────────────────────────────────┘
```

---

## Technical Implementation

### Architecture Overview

```javascript
// Core game architecture
class OneJumpGame {
  constructor() {
    this.app = new PIXI.Application();
    this.scenes = new SceneManager();
    this.assets = new AssetManager();
    this.physics = new PhysicsEngine();
    this.audio = new AudioSystem();
    this.save = new SaveSystem();
    this.analytics = new Analytics();
  }
  
  async initialize() {
    await this.app.init({
      width: 1920,
      height: 1080,
      preference: 'webgpu',
      resolution: window.devicePixelRatio,
      autoDensity: true
    });
    
    await this.loadCoreAssets();
    this.setupSystems();
    this.startGame();
  }
}
```

### System Components

#### Physics Engine
```javascript
class PhysicsEngine {
  constructor() {
    this.gravity = PHYSICS.GRAVITY_BASE;
    this.worldBounds = { x: 0, y: 0, w: 1920, h: Infinity };
    this.collisionGrid = new SpatialGrid(64);
  }
  
  update(deltaTime) {
    // Apply gravity
    this.applyGravity(deltaTime);
    
    // Update velocities
    this.integrateVelocities(deltaTime);
    
    // Check collisions
    this.broadPhase();
    this.narrowPhase();
    
    // Resolve collisions
    this.resolveCollisions();
  }
  
  checkNearMiss(player, obstacle) {
    const distance = this.getDistance(player, obstacle);
    
    for (let i = 0; i < PHYSICS.NEAR_MISS_RANGES.length; i++) {
      if (distance <= PHYSICS.NEAR_MISS_RANGES[i]) {
        return {
          level: i,
          distance: distance,
          points: this.calculateNearMissPoints(i, distance)
        };
      }
    }
    return null;
  }
}
```

#### Stage Manager
```javascript
class StageManager {
  constructor() {
    this.currentStage = 1;
    this.stageData = STAGE_DEFINITIONS;
    this.obstaclePool = new ObjectPool();
  }
  
  async loadStage(stageNumber) {
    const stage = this.stageData[stageNumber - 1];
    
    // Load stage-specific assets
    await Assets.loadBundle(`stage${stageNumber}`);
    
    // Generate obstacle patterns
    this.generateObstacles(stage.patterns);
    
    // Set physics parameters
    this.updatePhysics(stage.physics);
    
    // Initialize background
    this.setupParallax(stage.backgrounds);
    
    return stage;
  }
  
  generateObstacles(patterns) {
    const obstacles = [];
    
    patterns.forEach(pattern => {
      const obstacle = this.obstaclePool.get(pattern.type);
      obstacle.reset(pattern);
      obstacles.push(obstacle);
    });
    
    return obstacles;
  }
}
```

#### Trick System
```javascript
class TrickSystem {
  constructor() {
    this.availableTricks = TRICK_DEFINITIONS;
    this.currentTrick = null;
    this.trickMeter = 100;
    this.cooldownTimer = 0;
  }
  
  executeTrick(trickIndex, player) {
    if (this.canPerformTrick()) {
      const trick = this.availableTricks[trickIndex];
      
      this.currentTrick = {
        ...trick,
        startTime: performance.now(),
        startPosition: { x: player.x, y: player.y }
      };
      
      player.setState('tricking');
      player.playAnimation(trick.animation);
      
      this.lockControls(trick.duration);
      this.consumeMeter(trick.cost);
      
      return trick.basePoints;
    }
    return 0;
  }
  
  updateTrickMeter(deltaTime) {
    if (this.trickMeter < 100) {
      this.trickMeter += TRICK_REGEN_RATE * deltaTime;
      this.trickMeter = Math.min(100, this.trickMeter);
    }
  }
}
```

### Performance Optimizations

#### Object Pooling
```javascript
class ObjectPool {
  constructor(createFunc, resetFunc, size = 100) {
    this.available = [];
    this.active = [];
    
    // Pre-populate pool
    for (let i = 0; i < size; i++) {
      this.available.push(createFunc());
    }
  }
  
  get(type) {
    let obj = this.available.pop() || this.createFunc();
    this.active.push(obj);
    return obj;
  }
  
  release(obj) {
    const index = this.active.indexOf(obj);
    if (index > -1) {
      this.active.splice(index, 1);
      this.resetFunc(obj);
      this.available.push(obj);
    }
  }
}
```

#### Render Optimization
```javascript
// Use render groups for better performance
const gameLayer = new Container({ isRenderGroup: true });
const uiLayer = new Container({ isRenderGroup: true });
const particleLayer = new ParticleContainer({
  maxSize: 10000,
  properties: {
    scale: true,
    position: true,
    rotation: true,
    alpha: true
  }
});
```

### Save System

```javascript
class SaveSystem {
  constructor() {
    this.saveKey = 'oneJump_saveData';
    this.autoSaveInterval = 30000; // 30 seconds
  }
  
  getSaveData() {
    return {
      version: '1.0.0',
      profile: {
        totalScore: 0,
        totalFalls: 0,
        totalTricks: 0,
        playTime: 0
      },
      progression: {
        currentStage: 1,
        stagesUnlocked: 1,
        stageScores: Array(10).fill(0),
        stageGrades: Array(10).fill(''),
        stageTimes: Array(10).fill(0)
      },
      achievements: {
        unlocked: [],
        progress: {}
      },
      settings: {
        sfxVolume: 100,
        musicVolume: 100,
        difficulty: 'normal',
        controls: 'default'
      }
    };
  }
  
  save() {
    const data = this.getSaveData();
    localStorage.setItem(this.saveKey, JSON.stringify(data));
  }
  
  load() {
    const saved = localStorage.getItem(this.saveKey);
    return saved ? JSON.parse(saved) : this.getSaveData();
  }
}
```

---

## Tutorial System

### Progressive Tutorial

#### Stage 1 Tutorial Sequence
```javascript
const TUTORIAL_STEPS = [
  {
    trigger: 'gameStart',
    message: 'Use ← → or A/D to move!',
    position: 'center',
    duration: 3000
  },
  {
    trigger: 'firstObstacle',
    message: 'Avoid obstacles!',
    position: 'top',
    arrow: 'down'
  },
  {
    trigger: 'nearMissZone',
    message: 'Get close for bonus points!',
    highlight: 'nearMissAura'
  },
  {
    trigger: 'trickReady',
    message: 'Press SPACE to perform a trick!',
    position: 'bottom',
    pulse: 'spaceKey'
  },
  {
    trigger: 'comboStart',
    message: 'Chain actions for combo multipliers!',
    highlight: 'comboMeter'
  }
];
```

### Interactive Training

**Practice Mode**:
- Infinite retries
- Slow-motion option
- Ghost player shows optimal path
- Instant restart on failure
- Tips appear for repeated failures

**Skill Challenges**:
```
Challenge 1: "Thread the Needle"
- Pass through 10 narrow gaps

Challenge 2: "Trick Master"
- Perform all 5 tricks in one run

Challenge 3: "Combo King"
- Maintain 10x combo for 30 seconds

Challenge 4: "Perfectionist"
- Complete stage with no hits

Challenge 5: "Speed Demon"
- Complete stage in under 60 seconds
```

---

## Power-Ups & Modifiers

### Power-Up System

#### Collectible Power-Ups
```javascript
const POWERUPS = {
  shield: {
    duration: 5000,
    effect: 'One free hit',
    rarity: 'common',
    visual: 'blue bubble'
  },
  magnet: {
    duration: 10000,
    effect: 'Attract near-miss points',
    rarity: 'common',
    visual: 'magnetic field'
  },
  slowmo: {
    duration: 3000,
    effect: 'Time slows 50%',
    rarity: 'uncommon',
    visual: 'clock overlay'
  },
  multiball: {
    duration: 8000,
    effect: 'Triple score',
    rarity: 'rare',
    visual: 'x3 text'
  },
  invincible: {
    duration: 2000,
    effect: 'Pass through everything',
    rarity: 'legendary',
    visual: 'rainbow aura'
  }
};
```

### Difficulty Modifiers

**Assists** (reduce score by 50%):
- Wider near-miss zones
- Slower fall speed
- Visible trajectory line
- Auto-dodge (once per stage)

**Challenges** (increase score by 50%):
- Double speed
- One-hit mode
- Invisible obstacles (appear close)
- Mirror controls

---

## Accessibility Features

### Visual Accessibility
- **Color blind modes**: Protanopia, Deuteranopia, Tritanopia
- **High contrast mode**: Increases visibility
- **Reduce motion**: Limits particle effects
- **Text size options**: 75%, 100%, 125%, 150%
- **Flashing lights toggle**: Removes lightning effects

### Audio Accessibility
- **Subtitles**: For all voice lines
- **Visual sound indicators**: Icons for important audio
- **Separate volume sliders**: Music, SFX, Voice
- **Audio descriptions**: Narrated menu options

### Control Accessibility
- **Button remapping**: Full customization
- **One-handed mode**: All controls on one side
- **Hold-to-continue-trick**: Instead of timing
- **Auto-trick option**: Performs tricks automatically
- **Difficulty assists**: As detailed above

### Cognitive Accessibility
- **Simple language mode**: Clearer instructions
- **Extended timers**: More time for decisions
- **Practice mode**: Learn without pressure
- **Skip story option**: For replay focus
- **Checkpoint system**: Resume from any stage

---

## Social Features

### Leaderboards

**Categories**:
```
Global Leaderboards:
- Total Score (all stages combined)
- Individual Stage Scores
- Speed Records (per stage)
- Combo Records
- Trick Score Records

OCU Leaderboard:
- Direct friend comparison
- Weekly challenges
- College/Degree scores
```

### Sharing System

**Share Options**:
- Screenshot with score overlay
- Replay GIF (last 5 seconds)
- Stats card (beautiful infographic)
- Direct social media integration

**Share Card Example**:
```
┌─────────────────────────────┐
│   ONE JUMP - STARSKY        │
│                             │
│   Stage 7 Complete!         │
│   Score: 145,250            │
│   Grade: S                  │
│   Combo: x12                │
│                             │
│   [Starsky Image]           │
│                             │
│   Play at: onejump.com      │
└─────────────────────────────┘
```

## Analytics & Metrics

### Player Analytics

**Track Key Metrics**:
```javascript
const ANALYTICS_EVENTS = {
  // Gameplay
  stage_start: { stage, score, attempts },
  stage_complete: { stage, score, time, grade },
  stage_fail: { stage, obstacle_hit, score },
  trick_performed: { trick_type, score, combo },
  near_miss: { distance, points, combo },
  
  // Progression
  tutorial_complete: { time, skipped },
  achievement_unlock: { achievement_id, stage },
  high_score: { stage, score, previous_best },
  
  // Engagement
  session_start: { return_player, days_since_last },
  session_end: { duration, stages_played },
  share_action: { type, platform, stage },
  
  // Monetization (if applicable)
  iap_viewed: { item, stage, context },
  iap_purchased: { item, price, currency }
};
```

### Performance Metrics

**Technical Tracking**:
- Average FPS per device type
- Load times per stage
- Memory usage patterns
- Crash reports with stage context
- Input latency measurements

### Success KPIs

**Target Metrics**:
```
Retention:
- D1 Retention: 40%
- D7 Retention: 20%
- D30 Retention: 10%

Engagement:
- Average Session: 10 minutes
- Sessions/Day: 2.5
- Stages/Session: 5

Progression:
- Tutorial Completion: 80%
- Stage 5 Reach: 50%
- Game Completion: 10%
- Achievement Engagement: 60%

Social:
- Share Rate: 5%
- Leaderboard Check: 30%
- Daily Challenge Participation: 25%
```

---

## Future Goals

### Endless Mode
**Features**:
- Procedurally generated
- Increasing difficulty
- Milestone rewards every 1000m
- Special endless leaderboard
- Daily seed for fair competition

### Level Editor
**Tools**:
- Drag-and-drop obstacles
- Pattern templates
- Logic scripting (simple)
- Share with code
- Featured community levels

---

## Marketing Hooks

### Unique Selling Points
1. **"From Duke to Mascot"**: Nostalgic parody meets modern polish
2. **"Risk = Reward"**: Every trick is a gamble
3. **"10 Stages, Infinite Replayability"**: Perfect speedrun game
4. **"School Spirit Simulator"**: Represent your university
5. **"One Jump, One Legend"**: Simple concept, deep mastery

### Target Influencers
- Speedrunners
- University gaming clubs
- Retro gaming channels
- College sports broadcasts
- Mascot community

### Cross-Promotion
- OCU official channels
- College gaming tournaments
- Mascot competitions
- Educational gaming sites
- Speedrun event sponsorship

---

## Conclusion

**One Jump** combines nostalgic arcade action with modern game design sensibilities, creating an experience that's easy to learn, hard to master, and impossible to forget. With Starsky's charismatic personality, tight risk/reward mechanics, and progressive difficulty curve, players will find themselves saying "just one more jump" for hours.

The game respects its Duke Nukem inspiration while carving its own family-friendly identity, perfect for the university setting. From the cosmic perch to campus quad, every stage offers new challenges, memorable moments, and opportunities for skilled players to show off.

*"Remember, Stars: It's not about the fall, it's about how RAD you look doing it!"*

**- Starsky the Ram**

---

**Document Version**: 2.0  
**Date**: Current  
**Status**: Complete Game Design Document  
**Next Steps**: Prototype Stage 1, Test Core Mechanics, Iterate on Feedback

*"Always bet on RAM!"*