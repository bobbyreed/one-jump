import { Container, Graphics, Text } from 'pixi.js';
import BaseScene from './BaseScene.js';
import Button from '../ui/Button.js';
import { COLORS, UI, PHYSICS, LEVEL, PLAYER_STATES } from '../config/Constants.js';
import Player from '../entities/Player.js';

export default class TutorialScene extends BaseScene {
    constructor(game) {
        super(game);

        // Tutorial state
        this.currentStep = 0;
        this.tutorialSteps = [];
        this.player = null;
        this.instructionText = null;
        this.titleText = null;
        this.stepIndicator = null;
        this.nextButton = null;
        this.prevButton = null;
        this.menuButton = null;
        this.demoContainer = null;
        this.inputHints = [];

        // For interactive demos
        this.demoPlayer = null;
        this.demoObjects = [];
    }

    async init() {
        await super.init();

        // Create background
        this.createBackground();

        // Create tutorial panel
        this.createTutorialPanel();

        // Create navigation buttons
        this.createNavigationButtons();

        // Define tutorial steps
        this.defineTutorialSteps();
    }

    createBackground() {
        // Dark background
        const bg = new Graphics()
            .rect(0, 0, this.game.app.screen.width, this.game.app.screen.height)
            .fill({ color: COLORS.BACKGROUND });
        this.container.addChild(bg);

        // Add some decorative elements
        for (let i = 0; i < 30; i++) {
            const star = new Graphics()
                .circle(0, 0, 1 + Math.random() * 2)
                .fill({ color: 0xffffff, alpha: Math.random() * 0.5 + 0.3 });
            star.x = Math.random() * this.game.app.screen.width;
            star.y = Math.random() * this.game.app.screen.height;
            this.container.addChild(star);
        }
    }

    createTutorialPanel() {
        // Main panel container
        this.tutorialPanel = new Container();

        // Panel background
        const panel = new Graphics()
            .roundRect(0, 0, 1400, 700, 20)
            .fill({ color: 0x1a1a2e, alpha: 0.95 })
            .roundRect(0, 0, 1400, 700, 20)
            .stroke({ width: 3, color: COLORS.UI_PRIMARY });

        this.tutorialPanel.addChild(panel);
        this.tutorialPanel.x = (this.game.app.screen.width - 1400) / 2;
        this.tutorialPanel.y = 100;

        // Title text
        this.titleText = new Text({
            text: 'Tutorial',
            style: {
                fontFamily: 'Arial Black',
                fontSize: 48,
                fill: COLORS.UI_PRIMARY,
                fontWeight: 'bold'
            }
        });
        this.titleText.anchor.set(0.5, 0);
        this.titleText.x = 700;
        this.titleText.y = 30;
        this.tutorialPanel.addChild(this.titleText);

        // Step indicator
        this.stepIndicator = new Text({
            text: 'Step 1 of 6',
            style: {
                fontFamily: 'Arial',
                fontSize: 20,
                fill: COLORS.TEXT_SECONDARY
            }
        });
        this.stepIndicator.anchor.set(0.5, 0);
        this.stepIndicator.x = 700;
        this.stepIndicator.y = 85;
        this.tutorialPanel.addChild(this.stepIndicator);

        // Instruction text container
        this.instructionContainer = new Container();
        this.instructionContainer.x = 100;
        this.instructionContainer.y = 140;
        this.tutorialPanel.addChild(this.instructionContainer);

        // Demo container for visual demonstrations
        this.demoContainer = new Container();
        this.demoContainer.x = 700;
        this.demoContainer.y = 400;
        this.tutorialPanel.addChild(this.demoContainer);

        this.container.addChild(this.tutorialPanel);
    }

    createNavigationButtons() {
        const buttonY = this.tutorialPanel.y + 620;
        const centerX = this.game.app.screen.width / 2;

        // Previous button
        this.prevButton = new Button(
            '← PREVIOUS',
            centerX - 280,
            buttonY,
            200,
            50,
            COLORS.UI_SECONDARY,
            () => this.previousStep()
        );
        this.container.addChild(this.prevButton.container);

        // Next button
        this.nextButton = new Button(
            'NEXT →',
            centerX + 80,
            buttonY,
            200,
            50,
            COLORS.UI_PRIMARY,
            () => this.nextStep()
        );
        this.container.addChild(this.nextButton.container);

        // Menu button (top right)
        this.menuButton = new Button(
            'BACK TO MENU',
            this.game.app.screen.width - 240,
            30,
            220,
            50,
            COLORS.DANGER,
            () => this.returnToMenu()
        );
        this.container.addChild(this.menuButton.container);
    }

    defineTutorialSteps() {
        this.tutorialSteps = [
            {
                title: 'Welcome to One Jump!',
                instructions: [
                    'In this game, you play as Starsky the Ram.',
                    'Your goal is to jump off a cliff and navigate through obstacles',
                    'while falling to land safely on a target pad.',
                    '',
                    'The game has three main phases:',
                    '• Walking Phase - Get ready at the cliff edge',
                    '• Falling Phase - Navigate obstacles and collect points',
                    '• Landing Phase - Hit the target pad for maximum score',
                    '',
                    'Let\'s learn the controls step by step!'
                ],
                demo: null
            },
            {
                title: 'Basic Movement',
                instructions: [
                    'Use the arrow keys or WASD to move:',
                    '',
                    '← or A: Move LEFT',
                    '→ or D: Move RIGHT',
                    '',
                    'During the walking phase, use these keys to position',
                    'yourself at the cliff edge.',
                    '',
                    'During the falling phase, you can steer left and right',
                    'to avoid obstacles and aim for near-misses.'
                ],
                demo: 'movement'
            },
            {
                title: 'Jetpack Controls - Slowdown',
                instructions: [
                    'Your jetpack has TWO modes for speed control:',
                    '',
                    '↑ or W: ENGAGE JETPACK (Slowdown)',
                    '• Reduces fall speed to 50%',
                    '• Lasts 1.5 seconds',
                    '• Has a 2-second cooldown',
                    '• Particles turn CYAN',
                    '',
                    'Use slowdown when you need more time to:',
                    '• Navigate through tight spaces',
                    '• Line up for near-misses',
                    '• Prepare for landing'
                ],
                demo: 'jetpack_slowdown'
            },
            {
                title: 'Jetpack Controls - Boost',
                instructions: [
                    '↓ or S: DISENGAGE JETPACK (Boost)',
                    '• Increases fall speed to 150%',
                    '• Active while key is held down',
                    '• No cooldown - use freely',
                    '• Particles turn RED',
                    '',
                    'Use boost when you want to:',
                    '• Quickly pass through safe zones',
                    '• Build speed for style points',
                    '• Make up time in a level',
                    '',
                    'Master both modes to control your fall perfectly!'
                ],
                demo: 'jetpack_boost'
            },
            {
                title: 'Near-Miss System',
                instructions: [
                    'Get close to obstacles WITHOUT hitting them to score points!',
                    '',
                    'Near-miss distances (from obstacle edge):',
                    '• 80px or less - 100 points (Yellow spark)',
                    '• 60px or less - 150 points (Orange spark)',
                    '• 40px or less - 200 points (Deep orange spark)',
                    '• 25px or less - 300 points (Red spark)',
                    '',
                    'GRAZE BONUS:',
                    '• Pass within 15px for extra effects!',
                    '',
                    'Chain near-misses together to build COMBOS',
                    'for multiplied points!'
                ],
                demo: 'nearmiss'
            },
            {
                title: 'Landing & Scoring',
                instructions: [
                    'At the bottom, aim for the landing pads:',
                    '',
                    'GOOD PAD (Green): 100 points',
                    'GREAT PAD (Brighter Green): 500 points',
                    'PERFECT PAD (Brightest Green): 1000 points',
                    '',
                    'Your final score includes:',
                    '• Landing pad points',
                    '• Near-miss points',
                    '• Combo bonuses',
                    '• Time bonuses',
                    '',
                    'You\'re ready to play! Good luck, Starsky!'
                ],
                demo: 'landing'
            }
        ];
    }

    displayStep(stepIndex) {
        const step = this.tutorialSteps[stepIndex];
        if (!step) return;

        // Update title
        this.titleText.text = step.title;

        // Update step indicator
        this.stepIndicator.text = `Step ${stepIndex + 1} of ${this.tutorialSteps.length}`;

        // Clear previous instructions
        this.instructionContainer.removeChildren();

        // Display instructions
        let yOffset = 0;
        step.instructions.forEach(line => {
            const text = new Text({
                text: line,
                style: {
                    fontFamily: line.startsWith('•') || line.includes(':') ? 'Arial' : 'Arial',
                    fontSize: line.includes(':') && !line.startsWith('•') ? 24 : 20,
                    fill: line.startsWith('•') ? COLORS.UI_PRIMARY : COLORS.TEXT_PRIMARY,
                    fontWeight: line.includes(':') && !line.startsWith('•') ? 'bold' : 'normal',
                    wordWrap: true,
                    wordWrapWidth: 1200
                }
            });
            text.y = yOffset;
            this.instructionContainer.addChild(text);
            yOffset += text.height + 8;
        });

        // Clear and setup demo
        this.demoContainer.removeChildren();
        this.demoObjects = [];

        if (step.demo) {
            this.setupDemo(step.demo);
        }

        // Update button states
        this.prevButton.setEnabled(stepIndex > 0);
        this.nextButton.container.children[2].text =
            stepIndex === this.tutorialSteps.length - 1 ? 'FINISH' : 'NEXT →';
    }

    setupDemo(demoType) {
        switch (demoType) {
            case 'movement':
                this.createMovementDemo();
                break;
            case 'jetpack_slowdown':
                this.createJetpackDemo('slowdown');
                break;
            case 'jetpack_boost':
                this.createJetpackDemo('boost');
                break;
            case 'nearmiss':
                this.createNearMissDemo();
                break;
            case 'landing':
                this.createLandingDemo();
                break;
        }
    }

    createMovementDemo() {
        // Simple left/right arrows animation
        const leftArrow = new Text({
            text: '←',
            style: { fontSize: 60, fill: COLORS.UI_PRIMARY }
        });
        leftArrow.x = -100;
        leftArrow.anchor.set(0.5);
        this.demoContainer.addChild(leftArrow);

        const rightArrow = new Text({
            text: '→',
            style: { fontSize: 60, fill: COLORS.UI_PRIMARY }
        });
        rightArrow.x = 100;
        rightArrow.anchor.set(0.5);
        this.demoContainer.addChild(rightArrow);

        // Animate arrows
        let time = 0;
        const animate = () => {
            time += 0.05;
            leftArrow.alpha = 0.5 + Math.sin(time) * 0.5;
            rightArrow.alpha = 0.5 + Math.cos(time) * 0.5;
        };
        this.demoObjects.push({ update: animate });
    }

    createJetpackDemo(mode) {
        const color = mode === 'slowdown' ? 0x00FFFF : 0xFF4444;
        const label = mode === 'slowdown' ? 'SLOWDOWN' : 'BOOST';

        // Key indicator
        const keyText = new Text({
            text: mode === 'slowdown' ? '↑ / W' : '↓ / S',
            style: { fontSize: 40, fill: color, fontWeight: 'bold' }
        });
        keyText.anchor.set(0.5);
        keyText.y = -80;
        this.demoContainer.addChild(keyText);

        // Status label
        const statusText = new Text({
            text: label,
            style: { fontSize: 32, fill: color, fontWeight: 'bold' }
        });
        statusText.anchor.set(0.5);
        statusText.y = -30;
        this.demoContainer.addChild(statusText);

        // Particle effect visualization
        const particles = [];
        for (let i = 0; i < 8; i++) {
            const particle = new Graphics()
                .circle(0, 0, 4)
                .fill({ color: color, alpha: 0.8 });
            particle.x = (Math.random() - 0.5) * 40;
            particle.y = 20 + Math.random() * 40;
            particle.velocity = mode === 'slowdown' ? 2 : 6;
            this.demoContainer.addChild(particle);
            particles.push(particle);
        }

        // Animate particles
        let time = 0;
        const animate = () => {
            time += 0.1;
            particles.forEach((p, i) => {
                p.y += p.velocity;
                p.alpha = 0.8 - (p.y / 100) * 0.8;
                if (p.y > 100) {
                    p.y = 20;
                    p.x = (Math.random() - 0.5) * 40;
                }
            });
        };
        this.demoObjects.push({ update: animate });
    }

    createNearMissDemo() {
        // Obstacle
        const obstacle = new Graphics()
            .rect(-30, -30, 60, 60)
            .fill({ color: 0xFF4444 });
        obstacle.x = -80;
        this.demoContainer.addChild(obstacle);

        // Player hitbox
        const player = new Graphics()
            .rect(-30, -40, 60, 80)
            .fill({ color: COLORS.UI_PRIMARY, alpha: 0.6 });
        player.x = 80;
        this.demoContainer.addChild(player);

        // Distance indicator
        const line = new Graphics()
            .moveTo(-50, 0)
            .lineTo(50, 0)
            .stroke({ width: 2, color: 0xFFFF00, alpha: 0.7 });
        this.demoContainer.addChild(line);

        const distText = new Text({
            text: 'Close Pass = Points!',
            style: { fontSize: 20, fill: 0xFFFF00 }
        });
        distText.anchor.set(0.5);
        distText.y = -70;
        this.demoContainer.addChild(distText);

        // Animate
        let time = 0;
        const animate = () => {
            time += 0.05;
            const sparkAlpha = Math.abs(Math.sin(time * 2));
            if (sparkAlpha > 0.7) {
                // Create temporary spark
                const spark = new Graphics()
                    .circle(0, (Math.random() - 0.5) * 40, 3)
                    .fill({ color: 0xFFFF00 });
                this.demoContainer.addChild(spark);
                setTimeout(() => this.demoContainer.removeChild(spark), 200);
            }
        };
        this.demoObjects.push({ update: animate });
    }

    createLandingDemo() {
        // Landing pads
        const pads = [
            { width: 120, color: 0xccffcc, label: 'GOOD', y: 40 },
            { width: 60, color: 0x88ff88, label: 'GREAT', y: 40 },
            { width: 20, color: 0x44ff44, label: 'PERFECT', y: 40 }
        ];

        let xOffset = -80;
        pads.forEach(pad => {
            const padGraphic = new Graphics()
                .rect(-pad.width / 2, 0, pad.width, 10)
                .fill({ color: pad.color });
            padGraphic.x = xOffset;
            padGraphic.y = pad.y;
            this.demoContainer.addChild(padGraphic);

            const label = new Text({
                text: pad.label,
                style: { fontSize: 14, fill: pad.color, fontWeight: 'bold' }
            });
            label.anchor.set(0.5);
            label.x = xOffset;
            label.y = pad.y + 25;
            this.demoContainer.addChild(label);

            xOffset += 60;
        });

        // Falling player indicator
        const player = new Graphics()
            .rect(-15, -20, 30, 40)
            .fill({ color: COLORS.UI_PRIMARY });
        player.x = 0;
        player.y = -40;
        this.demoContainer.addChild(player);

        // Arrow pointing down
        const arrow = new Text({
            text: '↓',
            style: { fontSize: 40, fill: COLORS.WARNING }
        });
        arrow.anchor.set(0.5);
        arrow.x = 0;
        arrow.y = 0;
        this.demoContainer.addChild(arrow);

        // Animate
        let time = 0;
        const animate = () => {
            time += 0.1;
            arrow.y = Math.sin(time) * 10;
            arrow.alpha = 0.5 + Math.sin(time * 2) * 0.5;
        };
        this.demoObjects.push({ update: animate });
    }

    nextStep() {
        if (this.currentStep < this.tutorialSteps.length - 1) {
            this.currentStep++;
            this.displayStep(this.currentStep);
        } else {
            // Finished tutorial
            this.returnToMenu();
        }
    }

    previousStep() {
        if (this.currentStep > 0) {
            this.currentStep--;
            this.displayStep(this.currentStep);
        }
    }

    returnToMenu() {
        this.changeScene('menu');
    }

    async enter(data = {}) {
        await super.enter(data);

        // Reset to first step
        this.currentStep = 0;
        this.displayStep(this.currentStep);
    }

    update(deltaTime) {
        super.update(deltaTime);

        // Update demo animations
        this.demoObjects.forEach(obj => {
            if (obj.update) {
                obj.update(deltaTime);
            }
        });
    }

    destroy() {
        // Clean up buttons
        if (this.prevButton) this.prevButton.destroy();
        if (this.nextButton) this.nextButton.destroy();
        if (this.menuButton) this.menuButton.destroy();

        // Clean up demo objects
        this.demoObjects = [];

        super.destroy();
    }
}
