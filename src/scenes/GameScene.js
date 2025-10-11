import { Container, Graphics, Text } from 'pixi.js';
import BaseScene from './BaseScene.js';
import Player from '../entities/Player.js';
import ObstacleManager from '../systems/ObstacleManager.js';
import LandingZone from '../entities/LandingZone.js';
import ParticleSystem from '../systems/ParticleSystem.js';
import CameraSystem from '../systems/CameraSystem.js';
import CollisionSystem from '../systems/CollisionSystem.js';
import BackgroundManager from '../systems/BackgroundManager.js';
import HUD from '../ui/HUD.js';
import ResultScreen from '../ui/ResultScreen.js';
import { LEVEL, PHYSICS, COLORS, PLAYER_STATES, SCORING } from '../config/Constants.js';

export default class GameScene extends BaseScene {
    constructor(game) {
        super(game);

        // Game state
        this.gameState = {
            phase: PLAYER_STATES.WALKING,
            score: 0,
            distance: 0,
            cameraY: 0,
            fallSpeed: 0,
            gameOver: false
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
        this.backgroundManager = null;

        // UI
        this.hud = null;
        this.resultScreen = null;

        //Level Tracking
        this.currentLevel = 1;
        this.levelConfig = null;

            // Performance tracking
        this.timeElapsed = 0;
        this.maxCombo = 0;
        this.currentCombo = 0;
        this.nearMisses = 0;
        this.tricksPerformed = 0;
        this.nearMissPoints = 0; // Track actual points from near-misses
        this.lastComboTime = 0; // Track time of last combo action

        // Track obstacles that have been checked for near-misses
        this.checkedObstacles = new Set();

        // Track vertical input for jetpack control
        this.previousVerticalInput = 0;

        // World container (moves with camera)
        this.worldContainer = new Container();
        this.container.addChild(this.worldContainer);

        // Environment
        this.cliff = null;
        this.walls = null;
        this.bgLayers = { far: null, mid: null, near: null };
    }

    async init() {
        await super.init();

        // Initialize background manager first (adds to worldContainer at index 0)
        this.backgroundManager = new BackgroundManager(this.game, this.worldContainer);

        // Create world environment
        this.createEnvironment();

        // Initialize player
        this.player = new Player(this.game.assetManager);
        this.worldContainer.addChild(this.player.container);

        // Initialize systems (don't generate obstacles yet - wait for level config)
        this.obstacleManager = new ObstacleManager(this.worldContainer);

        this.landingZone = new LandingZone(this.worldContainer);

        this.particleSystem = new ParticleSystem(this.worldContainer);

        this.cameraSystem = new CameraSystem(
            this.worldContainer,
            this.game.app
        );

        this.collisionSystem = new CollisionSystem();

        // Initialize UI

        this.hud = new HUD(this.container, this.game.app.screen, () => this.returnToMenu());
        this.resultScreen = new ResultScreen(
                this.game.app,  // Pass full app for ticker access
                {
                    onRestart: () => this.restartLevel(),
                    onMenu: () => this.returnToMenu(),
                    onNextLevel: () => this.proceedToNextLevel()  // NEW callback
                }
            );
            this.container.addChild(this.resultScreen.container);

        // Setup input handlers (including space-to-restart)
        this.setupInputHandlers();
    }

    // Proceed to next level
        proceedToNextLevel() {
            console.log(`Proceeding from level ${this.currentLevel}`);

            // Clean up current level
            this.cleanup();

            // Special case: Level 10 completed - show ending and return to menu
            if (this.currentLevel === 10) {
                const skipStory = this.game.saveManager.data.settings.skipStory;

                if (skipStory) {
                    // Skip ending, go directly to menu
                    this.game.sceneManager.changeScene('menu');
                } else {
                    // Show ending part 1 (5 panels), then part 2 (5 panels), then menu
                    this.game.sceneManager.changeScene('story', {
                        levelNumber: 10,
                        isIntro: false, // This is the ending
                        endingPart: 1, // First part of ending
                        nextScene: 'story', // Chain to second part
                        nextData: {
                            levelNumber: 10,
                            isIntro: false,
                            endingPart: 2, // Second part of ending
                            nextScene: 'menu',
                            nextData: {}
                        }
                    });
                }
                return;
            }

            // For levels 1-9: proceed to next level
            console.log(`Proceeding to level ${this.currentLevel + 1}`);

            // Check if story should be skipped
            const skipStory = this.game.saveManager.data.settings.skipStory;

            if (skipStory) {
                // Skip directly to next level game
                this.game.sceneManager.changeScene('game', {
                    levelNumber: this.currentLevel + 1
                });
            } else {
                // Transition to outro story, then next level intro
                this.game.sceneManager.changeScene('story', {
                    levelNumber: this.currentLevel,
                    isIntro: false, // This is the outro
                    nextScene: 'story', // After outro, show next level's intro
                    nextData: {
                        levelNumber: this.currentLevel + 1,
                        isIntro: true, // Next story is an intro
                        nextScene: 'game', // After that intro, start the game
                        nextData: {
                            levelNumber: this.currentLevel + 1
                        }
                    }
                });
            }
}

        // Return to main menu
    returnToMenu() {
        console.log('Returning to menu');
        
        // Clean up the scene
        this.cleanup();
        
        // Transition to menu
        this.game.sceneManager.changeScene('menu');
    }

    // Restart the current level
    restartLevel() {
        console.log(`Restarting level ${this.currentLevel}`);
        
        // Hide result screen
        this.resultScreen.hide();
        
        // Reset the level
        this.resetLevel();
        
        // Restart with same level
        const levelConfig = this.game.levelManager.startLevel(this.currentLevel);
        this.loadLevel(levelConfig);
        
        // Reset game state
        this.gameState = {
            phase: PLAYER_STATES.WALKING,
            score: 0,
            distance: 0,
            cameraY: 0,
            fallSpeed: 0,
            gameOver: false
        };
        
        // Reset tracking variables
        this.timeElapsed = 0;
        this.maxCombo = 0;
        this.currentCombo = 0;
        this.nearMisses = 0;
        this.tricksPerformed = 0;
        this.nearMissPoints = 0;
        this.lastComboTime = 0;
        this.checkedObstacles.clear();
        this.previousVerticalInput = 0;
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
    
    console.log('GameScene enter with data:', data);
    
    // Reset game state
    this.gameState = {
        phase: PLAYER_STATES.WALKING,
        score: 0,
        distance: 0,
        cameraY: 0,
        fallSpeed: 0,
        gameOver: false
    };
    
    // Reset tracking variables
    this.timeElapsed = 0;
    this.maxCombo = 0;
    this.currentCombo = 0;
    this.nearMisses = 0;
    this.tricksPerformed = 0;
    this.nearMissPoints = 0;
    this.lastComboTime = 0;
    this.checkedObstacles.clear();
    this.previousVerticalInput = 0;

    // Check if a specific level was requested
    if (data.levelNumber) {
        this.currentLevel = data.levelNumber;
        const levelConfig = this.game.levelManager.startLevel(this.currentLevel);
        
        if (levelConfig) {
            console.log(`Loading level ${this.currentLevel}: ${levelConfig.name}`);
            this.loadLevel(levelConfig);
        } else {
            console.error(`Failed to load level ${this.currentLevel}`);
            // Fall back to menu
            this.game.sceneManager.changeScene('menu');
        }
    } else {
        // Default to level 1 if no level specified
        console.log('No level specified, defaulting to level 1');
        this.currentLevel = 1;
        const levelConfig = this.game.levelManager.startLevel(1);
        this.loadLevel(levelConfig);
    }
    
    // Make sure result screen is hidden
    if (this.resultScreen) {
        this.resultScreen.hide();
    }
    
    // Reset player to starting position
    if (this.player) {
        this.player.reset();
        this.player.position.x = 960;
        this.player.position.y = LEVEL.FALL_START_Y;
    }
}

loadLevel(config) {
    // Reset level state
    this.resetLevel();

    // Store level configuration
    this.levelConfig = config;

    // Initialize stage-specific background
    if (this.backgroundManager) {
        this.backgroundManager.initializeStage(config.id);
    }

    // Apply level-specific settings
    if (this.player) {
        // Update physics based on level
        this.player.gravity = config.gravity || PHYSICS.GRAVITY;
        this.player.maxFallSpeed = config.maxFallSpeed || PHYSICS.MAX_FALL_SPEED;
    }
    
    // Set level duration if specified
    this.levelDuration = config.duration || 90;
    this.timeRemaining = this.levelDuration;
    
    // Configure obstacles based on level
    if (this.obstacleManager) {
        // Clear existing obstacles
        this.obstacleManager.reset();

        // Generate obstacles for the level with difficulty config
        this.obstacleManager.generateObstacles({
            obstacleCount: config.obstacleCount,
            obstacleSpacing: config.obstacleSpacing,
            availableObstacles: config.availableObstacles
        });
    }

    // Update landing zone position based on level difficulty
    if (this.landingZone && config.endHeight) {
        this.landingZone.updatePosition(config.endHeight);
    }
    
    // Apply wind if specified
    this.windStrength = config.windStrength || 0;
    
    // Update HUD with level info
    if (this.hud) {
        this.hud.setLevelInfo({
            levelNumber: config.id,
            levelName: config.name,
            targetScore: config.targetScore
        });
    }
    
    console.log(`Level ${config.id} loaded: ${config.name}`);
    console.log(`Target Score: ${config.targetScore}, Duration: ${config.duration}s`);
}

resetLevel() {
    console.log('Resetting level');
    
    // Clear any existing completion overlay
    if (this.completionOverlay) {
        this.container.removeChild(this.completionOverlay);
        this.completionOverlay.destroy();
        this.completionOverlay = null;
    }
    
    // Reset score and time
    this.score = 0;
    this.combo = 0;
    this.timeElapsed = 0;
    this.timeRemaining = 90;
    
    // Reset tracking
    this.maxCombo = 0;
    this.currentCombo = 0;
    this.nearMisses = 0;
    this.tricksPerformed = 0;
    this.nearMissPoints = 0;
    this.lastComboTime = 0;
    this.checkedObstacles.clear();
    this.previousVerticalInput = 0;

    // Reset player
    if (this.player) {
        this.player.reset();
        this.player.position.x = 960;
        this.player.position.y = LEVEL.FALL_START_Y;
    }
    
    // Clear obstacles
    if (this.obstacleManager) {
        this.obstacleManager.reset();
    }
    
    // Clear particles
    if (this.particleSystem) {
        this.particleSystem.clear();
    }
    
    // Reset camera
    if (this.cameraSystem) {
        this.cameraSystem.reset();
    }
    this.cameraY = 0;
    
    // Reset game state
    this.gameState = {
        phase: PLAYER_STATES.WALKING,
        score: 0,
        distance: 0,
        cameraY: 0,
        fallSpeed: 0,
        gameOver: false
    };
}

async exit() {
    await super.exit();
    
    // Clean up when leaving the scene
    this.cleanup();
}


    setupInputHandlers() {
        this.handleKeyDown = (keyCode) => {
            // Space to restart after crash or landing
            if (keyCode === 'Space') {
                if (this.gameState.phase === PLAYER_STATES.CRASHED ||
                    this.gameState.phase === PLAYER_STATES.LANDED) {
                    console.log('Space pressed - restarting level');
                    this.restartLevel();
                }
            }
        };

        this.game.inputManager.on('keydown', this.handleKeyDown);
    }

    // Clean up the scene
        cleanup() {
            // Hide result screen
            if (this.resultScreen) {
                this.resultScreen.hide();
            }
            
            // Reset systems
            if (this.player) {
                this.player.reset();
            }
            
            if (this.obstacleManager) {
                this.obstacleManager.reset();
            }
            
            if (this.particleSystem) {
                this.particleSystem.clear();
            }
            
            // Clear any ongoing animations
            this.gameState.gameOver = true;
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
        const verticalInput = this.game.inputManager.getVerticalInput();

        // Update player
        this.player.update(deltaTime, horizontalInput);

        // Handle jetpack control during falling
        if (this.gameState.phase === PLAYER_STATES.FALLING) {
            this.handleJetpackControl(verticalInput);
        }

        // Check game state transitions
        this.checkStateTransitions();

        // Update based on phase
        if (this.gameState.phase === PLAYER_STATES.FALLING) {
            this.updateFalling(deltaTime);
        }

        // Don't update if game is over
        if (this.gameState.gameOver) {
            return;
        }

        // Update camera
        if (this.gameState.phase === PLAYER_STATES.FALLING ||
            this.gameState.phase === PLAYER_STATES.LANDED ||
            this.gameState.phase === PLAYER_STATES.CRASHED) {
            this.cameraSystem.followPlayer(this.player, deltaTime);
            this.updateParallax();

            // Update stage-specific backgrounds
            if (this.backgroundManager) {
                const cameraY = this.cameraSystem.getCameraY();
                this.backgroundManager.update(deltaTime, cameraY);
            }
        }

        switch (this.gameState.phase) {
        case PLAYER_STATES.WALKING:
            this.updateWalking(deltaTime);
            break;
        case PLAYER_STATES.FALLING:
            this.updateFalling(deltaTime);
            break;
        case PLAYER_STATES.LANDED:
        case PLAYER_STATES.CRASHED:
            // Game is over, no updates needed
            break;
    }
    
    // Update systems
    if (this.particleSystem) {
        this.particleSystem.update(deltaTime);
    }

    if (this.obstacleManager) {
        this.obstacleManager.update(deltaTime);
    }

    if (this.cameraSystem.followPlayer) {
    this.cameraSystem.followPlayer(this.player, deltaTime);
}
    
    // Update timer
    if (this.gameState.phase === PLAYER_STATES.FALLING) {
        this.timeElapsed += deltaTime;

        // Check combo timeout
        const timeSinceLastCombo = (this.timeElapsed - this.lastComboTime) * 1000; // Convert to ms
        if (this.currentCombo > 0 && timeSinceLastCombo > SCORING.COMBO_TIMEOUT) {
            console.log(`Combo broken! Time since last: ${timeSinceLastCombo.toFixed(0)}ms > ${SCORING.COMBO_TIMEOUT}ms`);
            this.currentCombo = 0;
        }
    }

        
    }

    handleJetpackControl(verticalInput) {
        // Handle W/↑ key (slowdown) - trigger on press
        if (verticalInput === -1 && this.previousVerticalInput !== -1) {
            const success = this.player.engageJetpackSlowdown();
            if (success) {
                console.log('Jetpack slowdown engaged!');
                // TODO: Add visual/audio feedback
            } else {
                // On cooldown
                const cooldown = this.player.getJetpackCooldownRemaining();
                if (cooldown > 0) {
                    console.log(`Jetpack on cooldown: ${cooldown.toFixed(1)}s remaining`);
                    // TODO: Add feedback for cooldown
                }
            }
        }

        // Handle S/↓ key (boost) - engage while held
        if (verticalInput === 1) {
            if (this.previousVerticalInput !== 1) {
                // Just pressed
                this.player.disengageJetpackForBoost();
                console.log('Jetpack boost activated!');
                // TODO: Add visual/audio feedback
            }
        } else if (this.previousVerticalInput === 1) {
            // Just released S/↓
            this.player.normalFallSpeed();
            console.log('Jetpack boost deactivated!');
        }

        this.previousVerticalInput = verticalInput;
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

        // Handle rocket spawning (if enabled for this level)
        if (this.obstacleManager.enableRocketSpawning) {
            this.obstacleManager.rocketSpawnTimer += deltaTime;
            if (this.obstacleManager.rocketSpawnTimer >= this.obstacleManager.rocketSpawnInterval) {
                this.obstacleManager.spawnRocket(this.player.position.y);
                this.obstacleManager.rocketSpawnTimer = 0;
            }
        }

        // Create particles with color based on jetpack state
        if (!this.player.jetpackActivating) {
            let particleColor = 0xff8800; // Normal orange
            if (this.player.jetpackSlowdownActive) {
                particleColor = 0x00FFFF; // Cyan for slowdown
            } else if (this.player.jetpackBoostActive) {
                particleColor = 0xFF4444; // Red for boost
            }
            this.particleSystem.createJetpackParticles(this.player.position, deltaTime, particleColor);
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
        this.hud.updateJetpackStatus({
            slowdownActive: this.player.jetpackSlowdownActive,
            boostActive: this.player.jetpackBoostActive,
            cooldownRemaining: this.player.getJetpackCooldownRemaining(),
            isFalling: true
        });

        // Hide instruction after falling
        if (this.gameState.distance > 50) {
            this.hud.hideInstruction();
        }
    }

    handleMissedLanding() {
        console.log('Missed the landing pad!');
        
        this.player.crash();
        this.gameState.phase = PLAYER_STATES.CRASHED;

        // Update stats
        this.game.saveManager.incrementStat('missedLandings');
        this.game.saveManager.incrementStat('gamesPlayed');

        // Show failure result screen
        this.resultScreen.showFailure({
            type: 'missed',
            distance: this.gameState.distance
        });

        // Stop game
        this.gameState.gameOver = true;
    }

    checkCollisions() {
        const obstacles = this.obstacleManager.getActiveObstacles();
        const playerBounds = this.player.getBounds();
        const playerY = this.player.position.y;

        for (const obstacle of obstacles) {
            // Handle rocket riding mechanic (helper objects)
            if (obstacle.type === 'rocket' && obstacle.isHelper) {
                // Skip if rocket is already used
                if (obstacle.used) {
                    continue;
                }

                const rocketProximity = this.collisionSystem.checkRocketProximity(
                    this.player.position,
                    obstacle
                );

                if (rocketProximity.isNear && !this.player.isRocketRiding) {
                    // Player is near rocket and not already riding
                    console.log('Player grabbed rocket!');
                    this.player.startRocketRide(obstacle);
                    this.particleSystem.createFloatingText(
                        this.player.position,
                        'Rocket Boost!',
                        0xff6600,
                        24
                    );

                    // Mark rocket as used and create explosion
                    obstacle.used = true;
                    this.createRocketExplosion(obstacle.x, obstacle.y);

                    // Remove rocket after a short delay
                    setTimeout(() => {
                        this.obstacleManager.removeRocket(obstacle);
                    }, 500);
                }
                continue; // Skip regular collision checks for rockets
            }

            // Skip lasers that are off
            if (obstacle.type === 'laser' && !obstacle.laserOn) {
                continue;
            }

            // Skip collision check if player is invulnerable (rocket riding)
            if (this.player.state === PLAYER_STATES.ROCKET_RIDING) {
                continue; // Player is invulnerable while riding rocket
            }

            // Check for collision
            if (this.collisionSystem.checkCollision(
                playerBounds,
                obstacle.getBounds()
            )) {
                this.handleCrash();
                break;
            }

            // Check for near-miss (only for obstacles player has passed)
            // Only check obstacles within a reasonable range above player
            const obstacleY = obstacle.y;
            const isAbovePlayer = obstacleY < playerY;
            const isWithinRange = Math.abs(obstacleY - playerY) < 200;

            if (isAbovePlayer && isWithinRange && !this.checkedObstacles.has(obstacle)) {
                const nearMiss = this.collisionSystem.calculateNearMiss(
                    playerBounds,
                    obstacle.getBounds()
                );

                // Debug logging
                if (nearMiss) {
                    console.log(`✓ NEAR-MISS DETECTED! Type: ${obstacle.type}, Level: ${nearMiss.level}, Distance: ${nearMiss.distance.toFixed(1)}px, Graze: ${nearMiss.isGraze}`);
                }

                if (nearMiss) {
                    this.handleNearMiss(nearMiss, obstacle);
                    this.checkedObstacles.add(obstacle);
                }
            }
        }
    }

    checkLanding() {
            const landingResult = this.landingZone.checkLanding(this.player.position);

            if (landingResult) {
                if (landingResult.type === 'pad') {
                    // Successfully landed on a pad
                    this.handleSuccessfulLanding(landingResult);
                } else if (landingResult.type === 'missed') {
                    // Landed but missed the pads
                    this.handleMissedLanding();
                } else if (landingResult.type === 'crash') {
                    // Crashed into the ground
                    this.handleCrash();
                }
            }
        }

    handleSuccessfulLanding(landingResult) {
            console.log('Successful landing!', landingResult);
            
            // Stop gameplay
            this.player.land();
            this.gameState.phase = PLAYER_STATES.LANDED;
            
            // Calculate final score (you can add more factors here)
            const baseScore = landingResult.points;
            const levelDuration = this.levelConfig?.duration || 60; // Use actual level duration
            const timeBonus = Math.max(0, (levelDuration - this.timeElapsed) * 10);
            const comboBonus = this.maxCombo * 100;
            const nearMissBonus = this.nearMissPoints; // Use actual points earned from near-misses

            const totalScore = baseScore + timeBonus + comboBonus + nearMissBonus;

            console.log(`Score breakdown - Base: ${baseScore}, Time: ${timeBonus} (${levelDuration}s - ${this.timeElapsed.toFixed(1)}s), Combo: ${comboBonus}, Near-miss: ${nearMissBonus}, Total: ${totalScore}`);
            this.gameState.score = totalScore;

            // Update save data
            this.game.saveManager.incrementStat('gamesPlayed');

            if (landingResult.label === 'PERFECT') {
                this.game.saveManager.incrementStat('perfectLandings');
            } else if (landingResult.label === 'GREAT') {
                this.game.saveManager.incrementStat('greatLandings');
            } else {
                this.game.saveManager.incrementStat('goodLandings');
            }

            // Complete the level in the manager
            const levelResult = this.game.levelManager.completeLevel(
                this.currentLevel,
                totalScore,
                this.timeElapsed
            );

            // Submit score to leaderboard (async, non-blocking)
            if (this.game.leaderboardManager) {
                this.game.leaderboardManager.submitScore(this.currentLevel, {
                    username: this.game.saveManager.data.username || 'Anonymous',
                    score: totalScore,
                    time: this.timeElapsed,
                    grade: levelResult.grade,
                    stars: levelResult.stars,
                    maxCombo: this.maxCombo || 0,
                    nearMisses: this.nearMisses || 0
                }).catch(err => console.error('Failed to submit score:', err));

                // Submit to global leaderboard
                const globalScore = this.game.levelManager.getTotalScore();
                const levelsCompleted = this.game.levelManager.levelScores.filter(s => s > 0).length;
                const totalStars = this.game.levelManager.levelStars.reduce((sum, s) => sum + s, 0);

                this.game.leaderboardManager.submitGlobalScore({
                    username: this.game.saveManager.data.username || 'Anonymous',
                    totalScore: globalScore,
                    levelsCompleted: levelsCompleted,
                    totalStars: totalStars
                }).catch(err => console.error('Failed to submit global score:', err));
            }

            // Check if next level is available
            // For level 10, allow proceeding to trigger the ending scene
            const canProceed = (this.currentLevel === 10) ||
                            (this.currentLevel < 10 && this.game.levelManager.isLevelUnlocked(this.currentLevel + 1));

            // Show success result screen with all the data
            this.resultScreen.showSuccess({
                label: landingResult.label,
                score: totalScore,
                color: landingResult.color,
                isNewHighScore: levelResult.newHighScore,
                grade: levelResult.grade,
                stars: levelResult.stars,
                canProceed: canProceed,
                time: this.timeElapsed,
                maxCombo: this.maxCombo || 0,
                nearMisses: this.nearMisses || 0,
                tricks: this.tricksPerformed || 0,
                // Score breakdown
                targetScore: this.levelConfig.targetScore,
                baseScore: baseScore,
                timeBonus: timeBonus,
                comboBonus: comboBonus,
                nearMissBonus: nearMissBonus
            });

            // Stop any ongoing animations/updates
            this.gameState.gameOver = true;
        }

    handleCrash() {
            console.log('Crashed!');

            this.player.crash();
            this.gameState.phase = PLAYER_STATES.CRASHED;

            // Update stats
            this.game.saveManager.incrementStat('crashes');
            this.game.saveManager.incrementStat('gamesPlayed');

            // Create crash effect
            this.particleSystem.createCrashEffect(this.player.position);

            // Show failure result screen
            this.resultScreen.showFailure({
                type: 'crash',
                distance: this.gameState.distance
            });

            // Stop game
            this.gameState.gameOver = true;
        }

    /**
     * Create explosion effect when rocket is used
     */
    createRocketExplosion(x, y) {
        // Create multiple particles radiating outward
        for (let i = 0; i < 20; i++) {
            const angle = (Math.PI * 2 * i) / 20;
            const speed = 100 + Math.random() * 100;
            const velocity = {
                x: Math.cos(angle) * speed,
                y: Math.sin(angle) * speed
            };

            this.particleSystem.createExplosionParticle(
                { x, y },
                velocity,
                0xff6600, // Orange color
                0.5
            );
        }

        // Add extra green particles for the helper effect
        for (let i = 0; i < 10; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 80 + Math.random() * 80;
            const velocity = {
                x: Math.cos(angle) * speed,
                y: Math.sin(angle) * speed
            };

            this.particleSystem.createExplosionParticle(
                { x, y },
                velocity,
                0x00ff00, // Green color
                0.6
            );
        }
    }

    handleNearMiss(nearMiss, obstacle) {
        // Award points based on near-miss level (closer = more points)
        const points = SCORING.NEAR_MISS_POINTS[nearMiss.level] || 100;

        // Increment counters
        this.nearMisses++;
        this.nearMissPoints += points;

        // Update combo and reset timeout
        this.currentCombo++;
        this.lastComboTime = this.timeElapsed;
        if (this.currentCombo > this.maxCombo) {
            this.maxCombo = this.currentCombo;
        }

        // Create visual feedback at player position
        this.particleSystem.createNearMissEffect(
            this.player.position,
            nearMiss.level,
            nearMiss.isGraze
        );

        // Create floating text notification
        const messages = ['Near Miss!', 'Close!', 'So Close!', 'Amazing!'];
        const colors = [0xFFFF00, 0xFFAA00, 0xFF6600, 0xFF0000];
        const sizes = [20, 24, 28, 32];

        const text = nearMiss.isGraze ? 'Perfect!' : messages[nearMiss.level];
        const color = nearMiss.isGraze ? 0x00FFFF : colors[nearMiss.level];
        const size = nearMiss.isGraze ? 36 : sizes[nearMiss.level];

        this.particleSystem.createFloatingText(
            this.player.position,
            text,
            color,
            size
        );

        console.log(`Near-miss! Level: ${nearMiss.level}, Points: ${points}, Combo: x${this.currentCombo}, Distance: ${nearMiss.distance.toFixed(1)}px`);
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

    onLevelComplete(score, time) {
            console.log(`Level ${this.currentLevel} complete! Score: ${score}, Time: ${time}`);
            
            // Complete the level in the manager
            const result = this.game.levelManager.completeLevel(
                this.currentLevel,
                score,
                time
            );
            
            // Show completion UI (stars, grade, score)
            this.showCompletionScreen(result);
            
            // After a delay, transition to outro story
            setTimeout(() => {
                // Transition to outro story scene
                this.game.sceneManager.changeScene('story', {
                    levelNumber: this.currentLevel,
                    isIntro: false, // This is the outro story
                    nextScene: 'levelSelect', // After outro, go to level select
                    nextData: { 
                        lastLevel: this.currentLevel,
                        justCompleted: true 
                    }
                });
            }, 3000); // 3 second delay to show completion screen
        }

        showCompletionScreen(result) {
            // Create completion overlay
            const overlay = new PIXI.Container();
            
            // Semi-transparent background
            const bg = new PIXI.Graphics();
            bg.rect(0, 0, this.game.app.screen.width, this.game.app.screen.height);
            bg.fill({ color: 0x000000, alpha: 0.7 });
            overlay.addChild(bg);
            
            // Victory text
            const victoryText = new PIXI.Text({
                text: 'LEVEL COMPLETE!',
                style: {
                    fontFamily: 'Arial',
                    fontSize: 48,
                    fill: 0xFFD700,
                    fontWeight: 'bold',
                    dropShadow: true,
                    dropShadowDistance: 4
                }
            });
            victoryText.anchor.set(0.5);
            victoryText.x = this.game.app.screen.width / 2;
            victoryText.y = 200;
            overlay.addChild(victoryText);
            
            // Grade display
            const gradeText = new PIXI.Text({
                text: `Grade: ${result.grade}`,
                style: {
                    fontFamily: 'Arial',
                    fontSize: 36,
                    fill: 0xFFFFFF,
                    dropShadow: true,
                    dropShadowDistance: 2
                }
            });
            gradeText.anchor.set(0.5);
            gradeText.x = this.game.app.screen.width / 2;
            gradeText.y = 300;
            overlay.addChild(gradeText);
            
            // Stars display
            const starContainer = new PIXI.Container();
            starContainer.x = this.game.app.screen.width / 2;
            starContainer.y = 380;
            
            for (let i = 0; i < 3; i++) {
                const star = new PIXI.Graphics();
                const filled = i < result.stars;
                
                // Draw star shape
                star.star(0, 0, 5, 30, 15);
                star.fill({ color: filled ? 0xFFD700 : 0x444444 });
                star.stroke({ color: 0xFFFFFF, width: 2 });
                
                star.x = (i - 1) * 80;
                starContainer.addChild(star);
            }
            overlay.addChild(starContainer);
            
            // New high score indicator
            if (result.newHighScore) {
                const highScoreText = new PIXI.Text({
                    text: 'NEW HIGH SCORE!',
                    style: {
                        fontFamily: 'Arial',
                        fontSize: 24,
                        fill: 0xFF00FF,
                        fontWeight: 'bold',
                        dropShadow: true,
                        dropShadowDistance: 2
                    }
                });
                highScoreText.anchor.set(0.5);
                highScoreText.x = this.game.app.screen.width / 2;
                highScoreText.y = 450;
                overlay.addChild(highScoreText);
                
                // Pulse animation
                const pulse = () => {
                    highScoreText.scale.set(1 + Math.sin(Date.now() * 0.005) * 0.1);
                };
                this.game.app.ticker.add(pulse);
            }
            
            // Next level unlocked message
            if (result.nextLevelUnlocked) {
                const unlockedText = new PIXI.Text({
                    text: `Level ${this.currentLevel + 1} Unlocked!`,
                    style: {
                        fontFamily: 'Arial',
                        fontSize: 20,
                        fill: 0x00FF00,
                        dropShadow: true,
                        dropShadowDistance: 2
                    }
                });
                unlockedText.anchor.set(0.5);
                unlockedText.x = this.game.app.screen.width / 2;
                unlockedText.y = 500;
                overlay.addChild(unlockedText);
            }
            
            // Add overlay to scene
            this.container.addChild(overlay);
            this.completionOverlay = overlay;
        }


    destroy() {
        this.cleanupInputHandlers();

        if (this.player) this.player.destroy();
        if (this.obstacleManager) this.obstacleManager.destroy();
        if (this.landingZone) this.landingZone.destroy();
        if (this.particleSystem) this.particleSystem.destroy();
        if (this.backgroundManager) this.backgroundManager.destroy();
        if (this.hud) this.hud.destroy();
        if (this.resultScreen) this.resultScreen.destroy();

        super.destroy();
    }
}