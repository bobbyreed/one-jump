import { Container, Graphics } from 'pixi.js';
import { LEVEL, OBSTACLE_TYPES } from '../config/Constants.js';

export default class ObstacleManager {
    constructor(worldContainer, levelConfig = null) {
        this.worldContainer = worldContainer;
        this.container = new Container();
        this.obstacles = [];
        this.levelConfig = levelConfig;

        worldContainer.addChild(this.container);
    }

    generateObstacles(levelConfig = null) {
        // Use provided config or stored config or defaults
        const config = levelConfig || this.levelConfig || {
            obstacleCount: LEVEL.OBSTACLE_COUNT,
            obstacleSpacing: LEVEL.OBSTACLE_SPACING,
            availableObstacles: ['spike', 'platform', 'wall'] // Default to basic obstacles only
        };

        // Store config for later use
        this.levelConfig = config;

        // Clear existing obstacles
        this.clear();

        // Get available obstacle types for this level
        const availableTypes = this.getAvailableObstacleTypes(config.availableObstacles);

        console.log(`Generating obstacles - Available types: ${availableTypes.map(t => t.type).join(', ')}`);

        // Generate new obstacles
        const count = config.obstacleCount || LEVEL.OBSTACLE_COUNT;
        const spacing = config.obstacleSpacing || LEVEL.OBSTACLE_SPACING;

        for (let i = 0; i < count; i++) {
            const type = availableTypes[Math.floor(Math.random() * availableTypes.length)];
            const obstacle = this.createObstacle(type, i, spacing);

            if (obstacle) {
                this.container.addChild(obstacle.container);
                this.obstacles.push(obstacle);
            }
        }
    }

    // Filter obstacle types based on level restrictions
    getAvailableObstacleTypes(availableObstacleNames) {
        if (!availableObstacleNames || availableObstacleNames.length === 0) {
            // Safety fallback - return only basic obstacles if no config provided
            console.warn('No obstacle restrictions provided, defaulting to basic obstacles');
            return OBSTACLE_TYPES.filter(type =>
                ['spike', 'platform', 'wall'].includes(type.type)
            );
        }

        const filtered = OBSTACLE_TYPES.filter(type =>
            availableObstacleNames.includes(type.type)
        );

        // Safety check - if filtering resulted in empty array, return basic obstacles
        if (filtered.length === 0) {
            console.warn('Obstacle filtering resulted in no types, defaulting to basic obstacles');
            return OBSTACLE_TYPES.filter(type =>
                ['spike', 'platform', 'wall'].includes(type.type)
            );
        }

        return filtered;
    }

    createObstacle(type, index, spacing = LEVEL.OBSTACLE_SPACING) {
        const obstacle = {
            container: new Container(),
            type: type.type,
            damage: type.damage,
            x: 0,
            y: LEVEL.FALL_START_Y + 300 + index * spacing +
                Math.random() * 100,
            width: 0,
            height: 0,
            centered: false, // Flag for obstacles drawn from center
            getBounds: function () {
                if (this.centered) {
                    // For centered obstacles like spinners
                    return {
                        x: this.x - this.width / 2,
                        y: this.y - this.height / 2,
                        width: this.width,
                        height: this.height
                    };
                } else {
                    // For obstacles drawn from top-left or specific anchor
                    return {
                        x: this.x,
                        y: this.y - this.height,
                        width: this.width,
                        height: this.height
                    };
                }
            }
        };

        const graphic = new Graphics();

        switch (type.type) {
            case 'spike':
                const size = 30 + Math.random() * 20;
                graphic.moveTo(0, 0)
                    .lineTo(size / 2, -size)
                    .lineTo(size, 0)
                    .fill({ color: type.color });
                obstacle.width = size;
                obstacle.height = size;
                break;

            case 'platform':
                const platformWidth = 80 + Math.random() * 100;
                graphic.rect(0, 0, platformWidth, 20)
                    .fill({ color: type.color });
                obstacle.width = platformWidth;
                obstacle.height = 20;
                break;

            case 'spinner':
                graphic.rect(-60, -8, 120, 16)
                    .fill({ color: type.color })
                    .rect(-8, -60, 16, 120)
                    .fill({ color: type.color });
                // Use tighter collision bounds based on the cross shape
                // Instead of full 120x120 square, use circular-ish bounds
                obstacle.width = 80;  // Reduced from 120
                obstacle.height = 80; // Reduced from 120
                obstacle.centered = true; // Spinner is drawn centered
                obstacle.spinSpeed = 0.02 + Math.random() * 0.03;
                break;

            case 'wall':
                const side = Math.random() > 0.5 ? 'left' : 'right';
                graphic.rect(0, 0, 150, 30)
                    .fill({ color: type.color });
                obstacle.width = 150;
                obstacle.height = 30;
                obstacle.wallSide = side;
                break;

            case 'alien':
                // Simple UFO/alien shape - oval body with dome
                graphic.ellipse(0, 0, 50, 25)
                    .fill({ color: type.color })
                    .ellipse(0, -15, 25, 15)
                    .fill({ color: 0x00ffff });
                obstacle.width = 100;
                obstacle.height = 80;
                obstacle.centered = true;
                obstacle.moveSpeed = 80 + Math.random() * 40; // pixels per second
                obstacle.patrolDistance = 200 + Math.random() * 100;
                obstacle.patrolDirection = Math.random() > 0.5 ? 1 : -1;
                obstacle.startX = 0; // Will be set during positioning
                break;

            case 'barrel':
                // Toxic barrel shape - cylinder with hazard stripes
                graphic.rect(-30, -40, 60, 80)
                    .fill({ color: type.color })
                    .rect(-30, -30, 60, 10)
                    .fill({ color: 0x000000 })
                    .rect(-30, -10, 60, 10)
                    .fill({ color: 0x000000 })
                    .rect(-30, 10, 60, 10)
                    .fill({ color: 0x000000 });
                obstacle.width = 60;
                obstacle.height = 80;
                obstacle.centered = true;
                obstacle.bobSpeed = 1 + Math.random() * 0.5; // oscillation speed
                obstacle.bobDistance = 20 + Math.random() * 15;
                obstacle.bobPhase = Math.random() * Math.PI * 2; // random starting phase
                obstacle.startY = 0; // Will be set during positioning
                break;

            case 'laser':
                // Horizontal laser beam
                const laserWidth = 300 + Math.random() * 200;
                graphic.rect(0, -5, laserWidth, 10)
                    .fill({ color: type.color, alpha: 0.8 });
                obstacle.width = laserWidth;
                obstacle.height = 10;
                obstacle.laserOn = true;
                obstacle.laserCycleTime = 2 + Math.random() * 2; // seconds per cycle
                obstacle.laserOnTime = obstacle.laserCycleTime * 0.6; // 60% on
                obstacle.laserTimer = 0;
                obstacle.laserWarning = false;
                break;

            case 'meteor':
                // Irregular asteroid/meteor shape
                const meteorSize = 40 + Math.random() * 40;
                graphic.circle(0, 0, meteorSize / 2)
                    .fill({ color: type.color })
                    .circle(meteorSize / 4, -meteorSize / 4, meteorSize / 4)
                    .fill({ color: 0x666666 })
                    .circle(-meteorSize / 4, meteorSize / 4, meteorSize / 5)
                    .fill({ color: 0xaaaaaa });
                obstacle.width = meteorSize;
                obstacle.height = meteorSize;
                obstacle.centered = true;
                obstacle.moveSpeedX = (Math.random() > 0.5 ? 1 : -1) * (50 + Math.random() * 100);
                obstacle.moveSpeedY = 100 + Math.random() * 100; // falling down
                obstacle.rotationSpeed = (Math.random() - 0.5) * 0.05; // random rotation
                break;

            case 'orbiter':
                // Small satellite orbiting a center point
                // Center point (invisible)
                graphic.circle(0, 0, 5)
                    .fill({ color: 0x666666, alpha: 0.3 });
                // Orbiting satellite
                const satelliteSize = 20;
                obstacle.orbitRadius = 60 + Math.random() * 40;
                graphic.circle(obstacle.orbitRadius, 0, satelliteSize)
                    .fill({ color: type.color })
                    .circle(obstacle.orbitRadius + satelliteSize / 3, -satelliteSize / 4, satelliteSize / 4)
                    .fill({ color: 0xffffff });
                // Only collision on the satellite itself, not the entire orbit
                obstacle.width = satelliteSize * 2;
                obstacle.height = satelliteSize * 2;
                obstacle.centered = true;
                obstacle.orbitSpeed = 1 + Math.random() * 1.5; // radians per second
                obstacle.orbitAngle = Math.random() * Math.PI * 2; // random start
                obstacle.satelliteSize = satelliteSize;
                obstacle.orbitRadius = obstacle.orbitRadius; // Store for update calculations
                break;

            case 'pendulum':
                // Swinging obstacle with chain
                const pendulumLength = 80 + Math.random() * 60;
                const pendulumBallSize = 25 + Math.random() * 15;
                // Chain/rope
                graphic.rect(-2, -pendulumLength, 4, pendulumLength)
                    .fill({ color: 0x666666 });
                // Ball at end
                graphic.circle(0, 0, pendulumBallSize)
                    .fill({ color: type.color })
                    .circle(0, 0, pendulumBallSize)
                    .stroke({ color: 0x000000, width: 2 });
                // Only collision on the ball itself, not the entire swing range
                obstacle.width = pendulumBallSize * 2;
                obstacle.height = pendulumBallSize * 2;
                obstacle.pendulumLength = pendulumLength;
                obstacle.pendulumAngle = 0;
                obstacle.pendulumSpeed = 1.5 + Math.random() * 1; // swing speed
                obstacle.pendulumMaxAngle = (Math.PI / 6) + (Math.random() * Math.PI / 6); // 30-60 degrees
                obstacle.anchorX = 0; // Will be set during positioning
                obstacle.anchorY = 0; // Will be set during positioning
                break;

            case 'pulsar':
                // Expanding/contracting energy ball
                const pulsarMinSize = 30;
                const pulsarMaxSize = 80;
                graphic.circle(0, 0, pulsarMinSize)
                    .fill({ color: type.color, alpha: 0.7 })
                    .circle(0, 0, pulsarMinSize * 0.6)
                    .fill({ color: 0xffffff, alpha: 0.5 });
                obstacle.width = pulsarMaxSize * 2;
                obstacle.height = pulsarMaxSize * 2;
                obstacle.centered = true;
                obstacle.pulsarPhase = Math.random() * Math.PI * 2;
                obstacle.pulsarSpeed = 2 + Math.random(); // cycle speed
                obstacle.pulsarMinSize = pulsarMinSize;
                obstacle.pulsarMaxSize = pulsarMaxSize;
                obstacle.graphic = graphic; // Store reference for scaling
                break;
        }

        obstacle.container.addChild(graphic);

        // Position obstacles
        if (obstacle.wallSide === 'left') {
            obstacle.x = 0;
        } else if (obstacle.wallSide === 'right') {
            obstacle.x = 1920 - obstacle.width; // Assuming screen width
        } else if (obstacle.type === 'laser') {
            // Lasers can be positioned at edges or random x
            if (Math.random() > 0.5) {
                obstacle.x = 0;
            } else {
                obstacle.x = 1920 - obstacle.width;
            }
        } else {
            // Use center-biased distribution by averaging multiple random values
            // This creates a bell curve that favors the center of the screen
            const rand1 = Math.random();
            const rand2 = Math.random();
            const rand3 = Math.random();
            const centerBiasedRandom = (rand1 + rand2 + rand3) / 3;
            obstacle.x = 100 + centerBiasedRandom * (1920 - 200 - obstacle.width);
        }

        // Store initial positions for animated obstacles
        if (obstacle.type === 'alien') {
            obstacle.startX = obstacle.x;
        }
        if (obstacle.type === 'barrel') {
            obstacle.startY = obstacle.y;
        }
        if (obstacle.type === 'pendulum') {
            // Pendulum anchors at the top, so adjust y position
            obstacle.anchorX = obstacle.x;
            obstacle.anchorY = obstacle.y - obstacle.pendulumLength;
            obstacle.container.y = obstacle.anchorY;
        }

        obstacle.container.x = obstacle.x;
        obstacle.container.y = obstacle.y;

        return obstacle;
    }

    update(deltaTime) {
        this.obstacles.forEach(obstacle => {
            // Spinner rotation
            if (obstacle.type === 'spinner' && obstacle.spinSpeed) {
                obstacle.container.rotation += obstacle.spinSpeed;
            }

            // Alien horizontal patrol
            if (obstacle.type === 'alien') {
                const movement = obstacle.moveSpeed * obstacle.patrolDirection * deltaTime;
                obstacle.x += movement;
                obstacle.container.x = obstacle.x;

                // Reverse direction at patrol limits
                if (Math.abs(obstacle.x - obstacle.startX) >= obstacle.patrolDistance) {
                    obstacle.patrolDirection *= -1;
                }
            }

            // Barrel vertical bobbing
            if (obstacle.type === 'barrel') {
                obstacle.bobPhase += obstacle.bobSpeed * deltaTime;
                const bobOffset = Math.sin(obstacle.bobPhase) * obstacle.bobDistance;
                obstacle.container.y = obstacle.startY + bobOffset;
            }

            // Laser on/off cycling
            if (obstacle.type === 'laser') {
                obstacle.laserTimer += deltaTime;

                if (obstacle.laserTimer >= obstacle.laserCycleTime) {
                    obstacle.laserTimer = 0;
                    obstacle.laserOn = true;
                    obstacle.laserWarning = false;
                }

                // Warning phase before turning on
                if (obstacle.laserTimer >= obstacle.laserCycleTime - 0.5 && !obstacle.laserOn) {
                    obstacle.laserWarning = true;
                    obstacle.container.alpha = 0.3 + Math.sin(obstacle.laserTimer * 20) * 0.2;
                }
                // On phase
                else if (obstacle.laserTimer < obstacle.laserOnTime) {
                    obstacle.laserOn = true;
                    obstacle.container.alpha = 1;
                }
                // Off phase
                else {
                    obstacle.laserOn = false;
                    obstacle.container.alpha = 0.1;
                }
            }

            // Meteor movement and rotation
            if (obstacle.type === 'meteor') {
                obstacle.x += obstacle.moveSpeedX * deltaTime;
                obstacle.y += obstacle.moveSpeedY * deltaTime;
                obstacle.container.x = obstacle.x;
                obstacle.container.y = obstacle.y;
                obstacle.container.rotation += obstacle.rotationSpeed;
            }

            // Orbiter circular motion
            if (obstacle.type === 'orbiter') {
                obstacle.orbitAngle += obstacle.orbitSpeed * deltaTime;
                // Rotate the entire container to make satellite orbit
                obstacle.container.rotation = obstacle.orbitAngle;

                // Update the satellite's actual position for collision detection
                const centerX = obstacle.container.x;
                const centerY = obstacle.container.y;
                obstacle.x = centerX + Math.cos(obstacle.orbitAngle) * obstacle.orbitRadius;
                obstacle.y = centerY + Math.sin(obstacle.orbitAngle) * obstacle.orbitRadius;
            }

            // Pendulum swinging
            if (obstacle.type === 'pendulum') {
                // Simple harmonic motion
                obstacle.pendulumAngle = Math.sin(obstacle.pendulumSpeed *
                    (Date.now() / 1000)) * obstacle.pendulumMaxAngle;
                obstacle.container.rotation = obstacle.pendulumAngle;

                // Update the ball's actual position for collision detection
                obstacle.x = obstacle.anchorX + Math.sin(obstacle.pendulumAngle) * obstacle.pendulumLength;
                obstacle.y = obstacle.anchorY + Math.cos(obstacle.pendulumAngle) * obstacle.pendulumLength;
                obstacle.centered = true;
            }

            // Pulsar expand/contract
            if (obstacle.type === 'pulsar') {
                obstacle.pulsarPhase += obstacle.pulsarSpeed * deltaTime;
                // Calculate current size based on sine wave
                const sizeProgress = (Math.sin(obstacle.pulsarPhase) + 1) / 2; // 0 to 1
                const currentSize = obstacle.pulsarMinSize +
                    (obstacle.pulsarMaxSize - obstacle.pulsarMinSize) * sizeProgress;
                const scale = currentSize / obstacle.pulsarMinSize;
                obstacle.graphic.scale.set(scale);

                // Update collision bounds based on current size
                obstacle.width = currentSize * 2;
                obstacle.height = currentSize * 2;

                // Pulse alpha for warning effect
                obstacle.container.alpha = 0.5 + sizeProgress * 0.5;
            }
        });
    }

    getActiveObstacles() {
        // In the future, this could filter based on proximity
        return this.obstacles;
    }

    reset() {
        // Reset all obstacles
        this.obstacles.forEach(obstacle => {
            if (obstacle.type === 'spinner') {
                obstacle.container.rotation = 0;
            }
        });
    }

    clear() {
        this.obstacles.forEach(obstacle => {
            obstacle.container.destroy(true);
        });
        this.obstacles = [];
    }

    destroy() {
        this.clear();
        this.container.destroy(true);
    }
}