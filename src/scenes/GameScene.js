import { Container, Graphics, Text } from 'pixi.js';
import BaseScene from './BaseScene.js';
import Player from '../entities/Player.js';
import ObstacleManager from '../systems/ObstacleManager.js';
import LandingZone from '../entities/LandingZone.js';
import ParticleSystem from '../systems/ParticleSystem.js';
import CameraSystem from '../systems/CameraSystem.js';
import CollisionSystem from '../systems/CollisionSystem.js';
import HUD from '../ui/HUD.js';
import ResultScreen from '../ui/ResultScreen.js';
import { LEVEL, PHYSICS, COLORS, PLAYER_STATES } from '../config/Constants.js';

export default class GameScene extends BaseScene {
    constructor(game) {
        super(game);

        // Game state
        this.gameState = {
            phase: PLAYER_STATES.WALKING,
            score: 0,
            distance: 0,
            cameraY: 0,
            fallSpeed: 0
        };

        // World container (moves with camera)
        this.worldContainer = new Container();
        this.container.addChild(this.worldContainer);

        // Systems
        this.player = null;
        this.obstacleManager = null;
        this.landingZone = null;
        this.particleSystem = null;
        this.cameraSystem = null;
        this.collisionSystem = null;

        // UI
        this.hud = null;
        this.resultScreen = null;

        // Environment
        this.cliff = null;
        this.walls = null;
    }

    async init() {
        await super.init();

        // Create world environment
        this.createEnvironment();

        // Initialize player
        this.player = new Player(this.game.assetManager);
        this.worldContainer.addChild(this.player.container);

        // Initialize systems
        this.obstacleManager = new ObstacleManager(this.worldContainer);
        this.obstacleManager.generateObstacles();

        this.landingZone = new LandingZone(this.worldContainer);

        this.particleSystem = new ParticleSystem(this.worldContainer);

        this.cameraSystem = new CameraSystem(
            this.worldContainer,
            this.game.app.screen
        );

        this.collisionSystem = new CollisionSystem();

        // Initialize UI
        this.hud = new HUD(this.container, this.game.app.screen);
        this.resultScreen = new ResultScreen(
            this.container,
            this.game.app.screen,
            () => this.resetGame(),
            () => this.game.sceneManager.changeScene('menu')
        );
    }

    createEnvironment() {
        // Create parallax background
        const bgFar = new Container();
        const bgMid = new Container();
        const bgNear = new Container();
        this.worldContainer.addChild(bgFar, bgMid, bgNear);

        // Add vertical particles for atmosphere
        this.createVerticalParticles(bgFar, 60, 1, 0.3, 0x4444ff);
        this.createVerticalParticles(bgMid, 40, 2, 0.6, 0x6666ff);
        this.createVerticalParticles(bgNear, 30, 3, 0.9, 0x8888ff);

        // Store background layers for camera system
        this.bgLayers = { far: bgFar, mid: bgMid, near: bgNear };

        // Create cliff
        this.createCliff();

        // Create walls
        this.createWalls();
    }

    createVerticalParticles(layer, count, size, speedMult, color) {
        for (let i = 0; i < count; i++) {
            const particle = new Graphics()
                .circle(0, 0, size)
                .fill({ color: color, alpha: Math.random() * 0.6 + 0.2 });

            particle.x = Math.random() * this.game.app.screen.width;
            particle.y = Math.random() * this.game.app.screen.height * 3 -
                this.game.app.screen.height;
            particle.speedMult = speedMult;
            particle.baseY = particle.y;

            layer.addChild(particle);
        }
    }

    createCliff() {
        const cliffContainer = new Container();
        this.worldContainer.addChild(cliffContainer);

        const cliffTop = new Graphics()
            .rect(0, 0, LEVEL.CLIFF_EDGE, 60)
            .fill({ color: COLORS.CLIFF_TOP })
            .rect(0, 0, LEVEL.CLIFF_EDGE, 10)
            .fill({ color: COLORS.CLIFF_EDGE });
        cliffTop.y = LEVEL.FALL_START_Y - 60;
        cliffContainer.addChild(cliffTop);

        // Cliff edge marker
        const cliffEdgeSign = new Graphics()
            .rect(LEVEL.CLIFF_EDGE - 10, -40, 10, 40)
            .fill({ color: 0x666666 })
            .moveTo(LEVEL.CLIFF_EDGE - 10, -40)
            .lineTo(LEVEL.CLIFF_EDGE + 20, -30)
            .lineTo(LEVEL.CLIFF_EDGE + 20, -10)
            .lineTo(LEVEL.CLIFF_EDGE - 10, -20)
            .fill({ color: COLORS.WARNING });
        cliffEdgeSign.y = LEVEL.FALL_START_Y - 60;
        cliffContainer.addChild(cliffEdgeSign);

        this.cliff = cliffContainer;
    }

    createWalls() {
        const leftWall = new Graphics();
        const rightWall = new Graphics();
        const wallHeight = 3000;

        // Left wall
        leftWall.rect(-200, LEVEL.FALL_START_Y, 200, wallHeight)
            .fill({ color: COLORS.WALL });

        // Right wall  
        rightWall.rect(this.game.app.screen.width, LEVEL.FALL_START_Y, 200, wallHeight)
            .fill({ color: COLORS.WALL });

        // Add texture
        for (let i = 0; i < wallHeight / 100; i++) {
            const y = LEVEL.FALL_START_Y + i * 100 + Math.random() * 50;
            leftWall.rect(-180, y, 150, 5)
                .fill({ color: 0x1d1d33, alpha: 0.5 });
            rightWall.rect(this.game.app.screen.width + 20, y, 150, 5)
                .fill({ color: 0x1d1d33, alpha: 0.5 });
        }

        this.worldContainer.addChild(leftWall, rightWall);
        this.walls = { left: leftWall, right: rightWall };
    }

    async enter(data = {}) {
        await super.enter(data);
        
        if (data.levelNumber) {
            const levelConfig = this.game.levelManager.startLevel(data.levelNumber);
            if (levelConfig) {
                this.currentLevel = data.levelNumber;
                this.levelConfig = levelConfig;
                this.setupLevel(levelConfig);
            }
        }
    }

    async exit() {
        await super.exit();

        // Clean up input handlers
        this.cleanupInputHandlers();
    }

    setupInputHandlers() {
        this.handleKeyDown = (keyCode) => {
            if (keyCode === 'Space' &&
                (this.gameState.phase === PLAYER_STATES.CRASHED ||
                    this.gameState.phase === PLAYER_STATES.LANDED)) {
                this.resetGame();
            }
        };

        this.game.inputManager.on('keydown', this.handleKeyDown);
    }

    cleanupInputHandlers() {
        if (this.handleKeyDown) {
            this.game.inputManager.off('keydown', this.handleKeyDown);
        }
    }

    resetGame() {
        this.gameState.phase = PLAYER_STATES.WALKING;
        this.gameState.score = 0;
        this.gameState.distance = 0;
        this.gameState.cameraY = 0;
        this.gameState.fallSpeed = 0;

        this.player.reset();
        this.cameraSystem.reset();
        this.particleSystem.clear();
        this.obstacleManager.reset();
        this.resultScreen.hide();

        this.hud.showInstruction('Walk to the edge with →');
        this.hud.updateSpeed(0);
        this.hud.updateDistance(0);
    }

    update(deltaTime) {
        if (!this.initialized) return;

        // Get input
        const horizontalInput = this.game.inputManager.getHorizontalInput();

        // Update player
        this.player.update(deltaTime, horizontalInput);

        // Check game state transitions
        this.checkStateTransitions();

        // Update based on phase
        if (this.gameState.phase === PLAYER_STATES.FALLING) {
            this.updateFalling(deltaTime);
        }

        // Update camera
        if (this.gameState.phase === PLAYER_STATES.FALLING ||
            this.gameState.phase === PLAYER_STATES.LANDED ||
            this.gameState.phase === PLAYER_STATES.CRASHED) {
            this.cameraSystem.followPlayer(this.player, deltaTime);
            this.updateParallax();
        }

        // Update systems
        this.obstacleManager.update(deltaTime);
        this.particleSystem.update(deltaTime);
    }

    checkStateTransitions() {
        // Check if walked off cliff
        if (this.player.state === PLAYER_STATES.WALKING &&
            this.player.position.x >= LEVEL.CLIFF_EDGE) {
            this.player.startFalling();
            this.gameState.phase = PLAYER_STATES.FALLING;
            this.hud.showInstruction('Use A/D or ←/→ to steer!');
        }
    }

    updateFalling(deltaTime) {
        // Keep player in bounds
        this.player.position.x = Math.max(30,
            Math.min(this.game.app.screen.width - 30, this.player.position.x));

        // Update distance
        this.gameState.distance = Math.floor(
            (this.player.position.y - LEVEL.FALL_START_Y) / 10
        );

        // Create particles
        if (!this.player.jetpackActivating) {
            this.particleSystem.createJetpackParticles(this.player.position, deltaTime);
        }

        if (this.player.velocity.y > 200) {
            this.particleSystem.createWindStreaks(
                this.player.position,
                this.player.velocity.y,
                deltaTime
            );
        }

        // Check collisions
        this.checkCollisions();

        // Check landing
        this.checkLanding();

        // Update HUD
        this.hud.updateSpeed(Math.floor(this.player.velocity.y));
        this.hud.updateDistance(this.gameState.distance);

        // Hide instruction after falling
        if (this.gameState.distance > 50) {
            this.hud.hideInstruction();
        }
    }

    checkCollisions() {
        const obstacles = this.obstacleManager.getActiveObstacles();

        for (const obstacle of obstacles) {
            if (this.collisionSystem.checkCollision(
                this.player.getBounds(),
                obstacle.getBounds()
            )) {
                this.handleCrash();
                break;
            }
        }
    }

    checkLanding() {
        const landingResult = this.landingZone.checkLanding(this.player.position);

        if (landingResult) {
            if (landingResult.type === 'pad') {
                this.handleSuccessfulLanding(landingResult);
            } else {
                this.handleCrash();
            }
        }
    }

    handleSuccessfulLanding(landingResult) {
        this.player.land();
        this.gameState.phase = PLAYER_STATES.LANDED;
        this.gameState.score = landingResult.points;

        // Update save data
        this.game.saveManager.incrementStat('gamesPlayed');

        if (landingResult.label === 'PERFECT') {
            this.game.saveManager.incrementStat('perfectLandings');
        } else if (landingResult.label === 'GREAT') {
            this.game.saveManager.incrementStat('greatLandings');
        } else {
            this.game.saveManager.incrementStat('goodLandings');
        }

        // Check high score
        const isNewHighScore = this.game.setHighScore(this.gameState.score);

        // Show result
        this.resultScreen.showSuccess(
            landingResult.label,
            this.gameState.score,
            landingResult.color,
            isNewHighScore
        );
    }

    handleCrash() {
        this.player.crash();
        this.gameState.phase = PLAYER_STATES.CRASHED;

        // Update stats
        this.game.saveManager.incrementStat('crashes');
        this.game.saveManager.incrementStat('gamesPlayed');

        // Create crash effect
        this.particleSystem.createCrashEffect(this.player.position);

        // Show result
        this.resultScreen.showCrash(this.gameState.distance);
    }

    updateParallax() {
        // Update background layers with parallax effect
        const cameraY = this.cameraSystem.getCameraY();

        this.bgLayers.far.children.forEach(star => {
            star.y = star.baseY - cameraY * star.speedMult;
        });
        this.bgLayers.mid.children.forEach(star => {
            star.y = star.baseY - cameraY * star.speedMult;
        });
        this.bgLayers.near.children.forEach(star => {
            star.y = star.baseY - cameraY * star.speedMult;
        });
    }

    onLevelComplete(score, time) {
        const result = this.game.levelManager.completeLevel(
            this.currentLevel,
            score,
            time
        );
        
        // Show completion screen with grade and stars
        this.showCompletionScreen(result);
        
        // After a delay, show outro story if not final level
        if (this.currentLevel < 10) {
            setTimeout(() => {
                this.game.sceneManager.changeScene('story', {
                    levelNumber: this.currentLevel,
                    isIntro: false,
                    nextScene: 'levelSelect',
                    nextData: { lastLevel: this.currentLevel }
                });
            }, 3000);
        } else {
            // Final level complete - show ending
            setTimeout(() => {
                this.game.sceneManager.changeScene('story', {
                    levelNumber: this.currentLevel,
                    isIntro: false,
                    nextScene: 'highscores',
                    nextData: { 
                        score: this.game.levelManager.getTotalScore(),
                        completed: true
                    }
                });
            }, 3000);
        }
    }

    destroy() {
        this.cleanupInputHandlers();

        if (this.player) this.player.destroy();
        if (this.obstacleManager) this.obstacleManager.destroy();
        if (this.landingZone) this.landingZone.destroy();
        if (this.particleSystem) this.particleSystem.destroy();
        if (this.hud) this.hud.destroy();
        if (this.resultScreen) this.resultScreen.destroy();

        super.destroy();
    }
}