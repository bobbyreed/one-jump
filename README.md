<p align="center">
  <img style="align-self:center" alt="One Jump cover image of Starsky the Ram Flying over those that mean him harm like aliens and toxic barrels" src="/public/assets/nukemCover.png" height="300">
</p>

# ONE JUMP

> **"From Space to Campus in One Epic Descent"**

A high-stakes vertical falling game where Starsky the Ram descends from the stars to Earth through 10 increasingly challenging atmospheric stages. Navigate through space debris, weather phenomena, and urban obstacles while performing daredevil tricks and near-misses for maximum points.

## 🎮 Features

- **10 Unique Atmospheric Stages** - Journey from Low Earth Orbit to the OCU campus
- **Stage-Specific Visuals** - Parallax backgrounds with dynamic weather and environmental effects
- **Risk/Reward Gameplay** - Thread the needle between obstacles for bonus points
- **Trick System** - Perform aerial maneuvers for style points and combo multipliers
- **Progressive Difficulty** - Each stage introduces new obstacles and mechanics
- **Story-Driven Campaign** - Comic-style narrative panels between stages
- **Leaderboard System** - Firebase-powered global and per-level rankings
- **Interactive Tutorial** - Learn the ropes with guided practice mode
- **Grading System** - Earn S through F ranks based on performance
- **Star Collection** - Unlock content and track completion across all levels

## 🚀 Tech Stack

<img alt="pixi.js logo" src="/public/assets/pixiLogo.svg" height="100">

### PixiJS v8 - WebGPU Rendering Engine

This game showcases the power and flexibility of **PixiJS v8**, a modern 2D rendering library that leverages WebGPU for high-performance graphics.

#### Key PixiJS Features Utilized:

**Graphics & Rendering:**
- **WebGPU Renderer** - Hardware-accelerated graphics with fallback to WebGL2
- **Render Groups** - Optimized batching for UI, game objects, and particle layers
- **Sprite System** - Efficient texture management and atlas support
- **Graphics API** - Procedural shapes for obstacles, UI, and effects
- **Particle Container** - High-performance particle systems (10,000+ particles)

**Scene Management:**
- **Container Hierarchy** - Modular scene architecture (Menu, Game, Level Select, etc.)
- **Display Object System** - Transform inheritance for camera and world positioning
- **Masking & Clipping** - UI panels and viewport management

**Animation & Effects:**
- **Ticker System** - Frame-perfect game loop and animation timing
- **Sprite Animations** - Character state machines and obstacle behaviors
- **Parallax Scrolling** - Multi-layer backgrounds with depth perception
- **Particle Effects** - Speed lines, near-miss sparks, collision impacts

**Asset Management:**
- **Assets API** - Lazy loading and bundle management per stage
- **Texture Atlas** - Optimized sprite sheet packing
- **Dynamic Loading** - On-demand asset streaming for story panels

**Performance Optimizations:**
- **Object Pooling** - Reusable obstacle and particle instances
- **Culling** - Only render visible objects
- **Spatial Partitioning** - Efficient collision detection grid
- **Resolution Scaling** - Device pixel ratio adaptation

### Additional Technologies

- **Firebase** - Authentication, Firestore database, and leaderboard hosting
- **Vite** - Lightning-fast build tool and dev server
- **ES6+ Modules** - Modern JavaScript architecture
- **CSS Variables** - Theme-aware styling system

## 🤖 AI-Assisted Development

This project was built with extensive AI assistance, showcasing how modern AI tools can accelerate game development while maintaining high code quality.

### AI Tools Used

#### Claude 3.5 Sonnet (Primary Development Assistant)
- **Architecture Design** - Scene management, collision systems, particle effects
- **Feature Implementation** - Tutorial system, leaderboards, grading mechanics
- **Code Refactoring** - Performance optimizations and bug fixes
- **Documentation** - Inline comments and system explanations

#### ChatGPT-4 (Asset Generation)
- **Image Generation** - Character sprites, story panels, UI elements
- **Concept Art** - Level themes and visual style direction
- **Prompt Engineering** - Iterative refinement of visual assets

#### Google Gemini 2.5 Flash (Supplemental Assets)
- **Background Elements** - Atmospheric layers and environmental details
- **UI Graphics** - Icons, buttons, and decorative elements

### Development Narrative

The game began as an experiment to explore PixiJS v8's new WebGPU capabilities. Initial prototyping focused on smooth scrolling mechanics and collision detection, quickly evolving into a full-featured arcade game.

**AI Collaboration Workflow:**

1. **Conceptual Phase** - Discussed game mechanics and visual style with Claude, establishing the "Duke Nukem meets mascot platformer" aesthetic
2. **Technical Foundation** - Built scene management, physics engine, and rendering pipeline with AI-assisted architecture
3. **Visual Development** - Generated 100+ story panels and sprites using ChatGPT and Gemini's image generation
4. **Feature Expansion** - Iteratively added tutorials, leaderboards, and polish with AI suggesting optimizations
5. **Bug Fixing** - Rapid debugging sessions with AI identifying edge cases and providing solutions

**Key AI Contributions:**

- **Code Generation Speed** - Complex systems like parallax backgrounds implemented in minutes vs. hours
- **Best Practices** - AI suggested PixiJS v8 patterns like render groups and proper container hierarchies
- **Problem Solving** - Collision detection refinement, landing zone protection, and combo system logic
- **Asset Iteration** - Rapid visual prototyping with dozens of variations to find the right style

**Human Direction:**

- Game design decisions and difficulty balancing
- Story writing and character personality
- Final asset selection and curation
- Gameplay feel and polish tuning

The result is a production-quality game built in a fraction of the traditional development time, demonstrating the synergy between human creativity and AI execution.

## 📦 Installation & Setup

### Prerequisites

- Node.js 18+ and npm
- Modern browser with WebGPU support (Chrome 113+, Edge 113+, or WebGL2 fallback)

### Quick Start

```bash
# Clone the repository
git clone https://github.com/bobbyreed/one-jump.git
cd one-jump

# Install dependencies
npm install

# Start development server
npm run dev
```

The game will be available at `http://localhost:5173`

### Build for Production

```bash
# Create optimized build
npm run build

# Preview production build
npm run preview
```

## 🗂️ Project Structure

```
one-jump/
├── public/
│   └── assets/          # Images, story panels, sprites
├── src/
│   ├── config/          # Game constants and configuration
│   │   ├── Constants.js
│   │   └── StageThemes.js
│   ├── entities/        # Game objects
│   │   ├── Player.js
│   │   └── Obstacle.js
│   ├── managers/        # System managers
│   │   ├── LevelManager.js
│   │   ├── FirebaseManager.js
│   │   ├── LeaderboardManager.js
│   │   ├── AssetManager.js
│   │   └── SaveManager.js
│   ├── scenes/          # Game scenes
│   │   ├── MenuScene.js
│   │   ├── GameScene.js
│   │   ├── LevelSelectScene.js
│   │   ├── StoryScene.js
│   │   ├── LeaderboardScene.js
│   │   └── TutorialScene.js
│   ├── systems/         # Game systems
│   │   ├── CollisionSystem.js
│   │   ├── ObstacleManager.js
│   │   ├── BackgroundManager.js
│   │   ├── ParticleSystem.js
│   │   └── InputManager.js
│   ├── ui/              # UI components
│   │   ├── HUD.js
│   │   ├── Button.js
│   │   └── ResultScreen.js
│   ├── Game.js          # Main game class
│   └── main.js          # Entry point
├── docs/
│   └── devDocs/
│       └── gdd.md       # Game Design Document
└── package.json
```

## 🎯 Development

### Key Systems

**Scene Management:**
- Modular scene architecture with BaseScene inheritance
- Smooth transitions with fade effects
- Asynchronous asset loading per scene

**Physics Engine:**
- Custom gravity and velocity system
- Collision detection with spatial grid optimization
- Near-miss detection with distance thresholds

**Scoring System:**
- Base points for completion
- Near-miss bonuses (50-300 points based on proximity)
- Combo multipliers (up to 10x)
- Time bonuses and grade calculation

**Stage Progression:**
- 10 unique atmospheric environments
- Dynamic obstacle generation based on level config
- Progressive difficulty with new obstacle types

### Debug Features

- `Shift+U` - Unlock all levels (Level Select)
- `Shift+D` - Toggle debug overlay (Game)
- Firebase emulator support for local development

## 🎨 Credits

### Development
- **Lead Developer** - Bobby Reed
- **AI Development Assistant** - Claude 3.5 Sonnet (Anthropic)
- **Game Engine** - PixiJS v8

### Art & Assets
- **AI Image Generation** - ChatGPT-4, Google Gemini 2.5 Flash
- **Character Design** - Starsky the Ram, OCU Mascot
- **Visual Style** - 80s/90s arcade inspired

### Special Thanks
- Oklahoma City University for mascot inspiration
- PixiJS community for documentation and examples
- Firebase for backend infrastructure

## 📄 License

This project is private and proprietary.

## 🔗 Links

- [Game Design Document](docs/devDocs/gdd.md)
- [PixiJS Documentation](https://pixijs.com/8.x/guides)
- [Firebase Documentation](https://firebase.google.com/docs)

---

**Made with ❤️ using PixiJS v8 and AI assistance**
