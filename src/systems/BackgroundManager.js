import { Container, Graphics, Sprite, Text } from 'pixi.js';
import { getStageTheme } from '../config/StageThemes.js';

/**
 * Manages stage-specific backgrounds with parallax layers
 * Provides visual differentiation for each of the 10 stages
 */
export default class BackgroundManager {
    constructor(game, worldContainer) {
        this.game = game;
        this.worldContainer = worldContainer;

        // Main containers for layering
        this.backgroundContainer = new Container();
        this.parallaxLayers = [];

        // Current stage data
        this.currentStage = 1;
        this.theme = null;

        // Insert background container at the bottom (behind everything)
        worldContainer.addChildAt(this.backgroundContainer, 0);
    }

    /**
     * Initialize background for a specific stage
     */
    initializeStage(stageNumber) {
        this.currentStage = stageNumber;
        this.theme = getStageTheme(stageNumber);

        // Clear existing background
        this.clear();

        // Create gradient background
        this.createGradientBackground();

        // Create parallax layers
        this.createParallaxLayers();

        console.log(`Background initialized for Stage ${stageNumber}: ${this.theme.name}`);
    }

    /**
     * Create gradient background
     */
    createGradientBackground() {
        const gradient = new Graphics();
        const { top, bottom } = this.theme.gradient;

        // Create vertical gradient
        gradient.rect(0, -2000, 1920, 12000);
        gradient.fill({
            color: top,
            alpha: 1
        });

        // Add gradient overlay
        const gradientOverlay = new Graphics();
        gradientOverlay.rect(0, -2000, 1920, 12000);
        gradientOverlay.fill({
            color: bottom,
            alpha: 0.6
        });

        this.backgroundContainer.addChild(gradient);
        this.backgroundContainer.addChild(gradientOverlay);
    }

    /**
     * Create parallax layers based on stage theme
     */
    createParallaxLayers() {
        const parallax = this.theme.parallax;

        // Create distant layer
        if (parallax.distant) {
            const layer = this.createLayer('distant', parallax.distant);
            if (layer) {
                this.parallaxLayers.push(layer);
                this.backgroundContainer.addChild(layer.container);
            }
        }

        // Create far layer
        if (parallax.far) {
            const layer = this.createLayer('far', parallax.far);
            if (layer) {
                this.parallaxLayers.push(layer);
                this.backgroundContainer.addChild(layer.container);
            }
        }

        // Create mid layer
        if (parallax.mid) {
            const layer = this.createLayer('mid', parallax.mid);
            if (layer) {
                this.parallaxLayers.push(layer);
                this.backgroundContainer.addChild(layer.container);
            }
        }

        // Create near layer
        if (parallax.near) {
            const layer = this.createLayer('near', parallax.near);
            if (layer) {
                this.parallaxLayers.push(layer);
                this.backgroundContainer.addChild(layer.container);
            }
        }
    }

    /**
     * Create a parallax layer based on type
     */
    createLayer(depth, config) {
        const container = new Container();
        const elements = [];

        // Create elements based on type
        switch (config.type) {
            case 'stars':
                this.createStars(container, elements, config);
                break;
            case 'nebula':
                this.createNebula(container, elements, config);
                break;
            case 'heatWaves':
                this.createHeatWaves(container, elements, config);
                break;
            case 'meteors':
                this.createMeteors(container, elements, config);
                break;
            case 'snowflakes':
                this.createSnowflakes(container, elements, config);
                break;
            case 'iceClouds':
                this.createClouds(container, elements, config, true);
                break;
            case 'clouds':
            case 'thinClouds':
            case 'stormClouds':
                this.createClouds(container, elements, config);
                break;
            case 'contrails':
                this.createContrails(container, elements, config);
                break;
            case 'distantPlanes':
                this.createPlanes(container, elements, config);
                break;
            case 'distantBirds':
                this.createBirds(container, elements, config);
                break;
            case 'citySkyline':
            case 'distantBuildings':
                this.createBuildings(container, elements, config);
                break;
            case 'trees':
                this.createTrees(container, elements, config);
                break;
            case 'flags':
                this.createFlags(container, elements, config);
                break;
            default:
                // Generic layer for unspecified types
                this.createGenericLayer(container, elements, config);
        }

        return {
            container,
            elements,
            speed: config.speed,
            type: config.type,
            config
        };
    }

    /**
     * Create star field
     */
    createStars(container, elements, config) {
        const density = config.density || 100;

        for (let i = 0; i < density; i++) {
            const star = new Graphics();
            const size = config.size ?
                config.size.min + Math.random() * (config.size.max - config.size.min) :
                1 + Math.random();

            star.circle(0, 0, size);
            star.fill({ color: 0xFFFFFF, alpha: 0.6 + Math.random() * 0.4 });

            star.x = Math.random() * 1920;
            star.y = Math.random() * 10000;

            // Twinkle data
            if (config.twinkle) {
                star.twinkleSpeed = 1 + Math.random() * 2;
                star.twinklePhase = Math.random() * Math.PI * 2;
            }

            container.addChild(star);
            elements.push(star);
        }
    }

    /**
     * Create nebula clouds
     */
    createNebula(container, elements, config) {
        const count = config.count || 3;
        const colors = config.colors || [0x4B0082];

        for (let i = 0; i < count; i++) {
            const nebula = new Graphics();
            const color = colors[Math.floor(Math.random() * colors.length)];
            const size = 300 + Math.random() * 400;

            nebula.circle(0, 0, size);
            nebula.fill({ color, alpha: config.alpha || 0.2 });

            nebula.x = Math.random() * 2200 - 100;
            nebula.y = Math.random() * 10000;

            container.addChild(nebula);
            elements.push(nebula);
        }
    }

    /**
     * Create heat waves
     */
    createHeatWaves(container, elements, config) {
        const count = config.count || 5;

        for (let i = 0; i < count; i++) {
            const wave = new Graphics();

            // Wavy line
            wave.moveTo(0, 0);
            for (let x = 0; x < 1920; x += 50) {
                const y = Math.sin(x * 0.01) * 30;
                wave.lineTo(x, y);
            }
            wave.stroke({ width: 3, color: 0xFF8C00, alpha: config.alpha || 0.2 });

            wave.y = 500 + i * 1500;

            container.addChild(wave);
            elements.push(wave);
        }
    }

    /**
     * Create meteors
     */
    createMeteors(container, elements, config) {
        const count = config.count || 4;

        for (let i = 0; i < count; i++) {
            const meteor = new Graphics();
            const size = 20 + Math.random() * 30;

            // Meteor body
            meteor.circle(0, 0, size);
            meteor.fill({ color: 0x888888 });

            // Trail
            if (config.trail) {
                meteor.moveTo(0, 0);
                meteor.lineTo(size * 3, -size * 2);
                meteor.stroke({ width: size / 2, color: 0xFF8C00, alpha: 0.5 });
            }

            meteor.x = Math.random() * 1920;
            meteor.y = Math.random() * 10000;
            meteor.angle = 45 + Math.random() * 90;

            container.addChild(meteor);
            elements.push(meteor);
        }
    }

    /**
     * Create snowflakes
     */
    createSnowflakes(container, elements, config) {
        const density = config.density || 60;

        for (let i = 0; i < density; i++) {
            const flake = new Graphics();
            const size = config.size ?
                config.size.min + Math.random() * (config.size.max - config.size.min) :
                2 + Math.random() * 3;

            flake.star(0, 0, 6, size, size * 0.5);
            flake.fill({ color: 0xFFFFFF, alpha: 0.7 });

            flake.x = Math.random() * 1920;
            flake.y = Math.random() * 10000;
            flake.drift = (Math.random() - 0.5) * 50; // Horizontal drift

            container.addChild(flake);
            elements.push(flake);
        }
    }

    /**
     * Create clouds
     */
    createClouds(container, elements, config, isIce = false) {
        const count = config.count || 5;

        for (let i = 0; i < count; i++) {
            const cloud = new Graphics();
            const width = 200 + Math.random() * 300;
            const height = 60 + Math.random() * 80;

            const color = isIce ? 0xE0FFFF : 0xFFFFFF;
            const alpha = config.alpha || 0.5;

            // Simple cloud shape (multiple ellipses)
            cloud.ellipse(0, 0, width / 2, height / 2);
            cloud.fill({ color, alpha });
            cloud.ellipse(-width * 0.2, -height * 0.2, width / 3, height / 3);
            cloud.fill({ color, alpha });
            cloud.ellipse(width * 0.2, -height * 0.3, width / 3, height / 3);
            cloud.fill({ color, alpha });

            cloud.x = Math.random() * 2200 - 100;
            cloud.y = Math.random() * 10000;

            container.addChild(cloud);
            elements.push(cloud);
        }
    }

    /**
     * Create contrails
     */
    createContrails(container, elements, config) {
        const count = config.count || 8;

        for (let i = 0; i < count; i++) {
            const trail = new Graphics();

            trail.rect(0, 0, 600, 3);
            trail.fill({ color: 0xFFFFFF, alpha: 0.4 });

            trail.x = Math.random() * 1500;
            trail.y = Math.random() * 10000;

            container.addChild(trail);
            elements.push(trail);
        }
    }

    /**
     * Create planes
     */
    createPlanes(container, elements, config) {
        const count = config.count || 2;

        for (let i = 0; i < count; i++) {
            const plane = new Graphics();

            // Simple plane silhouette
            plane.rect(-30, -3, 60, 6); // Body
            plane.fill({ color: 0x696969, alpha: 0.5 });
            plane.rect(-15, -15, 30, 3); // Wings
            plane.fill({ color: 0x696969, alpha: 0.5 });

            plane.x = Math.random() * 1920;
            plane.y = Math.random() * 10000;

            container.addChild(plane);
            elements.push(plane);
        }
    }

    /**
     * Create birds
     */
    createBirds(container, elements, config) {
        const count = config.count || 15;

        for (let i = 0; i < count; i++) {
            const bird = new Graphics();

            // Simple V-shape bird
            bird.moveTo(0, 0);
            bird.lineTo(-8, -5);
            bird.moveTo(0, 0);
            bird.lineTo(8, -5);
            bird.stroke({ width: 2, color: 0x8B4513, alpha: 0.7 });

            bird.x = Math.random() * 1920;
            bird.y = Math.random() * 10000;

            container.addChild(bird);
            elements.push(bird);
        }
    }

    /**
     * Create buildings
     */
    createBuildings(container, elements, config) {
        const buildingCount = 5;

        for (let i = 0; i < buildingCount; i++) {
            const building = new Graphics();
            const width = 100 + Math.random() * 200;
            const height = 400 + Math.random() * 600;

            // Building body
            building.rect(0, 0, width, height);
            building.fill({ color: 0x4A4A4A, alpha: config.alpha || 0.6 });

            // Windows
            if (config.windows) {
                for (let row = 0; row < height / 40; row++) {
                    for (let col = 0; col < width / 30; col++) {
                        if (Math.random() > 0.3) {
                            building.rect(col * 30 + 10, row * 40 + 10, 10, 20);
                            building.fill({ color: 0xFFD700, alpha: 0.8 });
                        }
                    }
                }
            }

            building.x = i * 400;
            building.y = 8000;

            container.addChild(building);
            elements.push(building);
        }
    }

    /**
     * Create trees
     */
    createTrees(container, elements, config) {
        const count = config.count || 10;

        for (let i = 0; i < count; i++) {
            const tree = new Graphics();

            // Trunk
            tree.rect(-10, 0, 20, 60);
            tree.fill({ color: 0x8B4513 });

            // Foliage (triangle)
            tree.moveTo(0, -40);
            tree.lineTo(-40, 20);
            tree.lineTo(40, 20);
            tree.fill({ color: 0x228B22 });

            tree.x = Math.random() * 1920;
            tree.y = 8500 + Math.random() * 1000;

            container.addChild(tree);
            elements.push(tree);
        }
    }

    /**
     * Create flags
     */
    createFlags(container, elements, config) {
        const count = config.count || 5;

        for (let i = 0; i < count; i++) {
            const flag = new Graphics();

            // Pole
            flag.rect(-2, -100, 4, 120);
            flag.fill({ color: 0x808080 });

            // Flag
            const isOCU = config.ocu && i === 0;
            const color = isOCU ? 0x002147 : 0xFF0000;

            flag.rect(0, -100, 60, 40);
            flag.fill({ color, alpha: 0.9 });

            flag.x = 300 + i * 300;
            flag.y = 9000;
            flag.wavePhase = Math.random() * Math.PI * 2;

            container.addChild(flag);
            elements.push(flag);
        }
    }

    /**
     * Create generic layer
     */
    createGenericLayer(container, elements, config) {
        // Fallback for undefined layer types
        console.warn(`Unimplemented layer type: ${config.type}`);
    }

    /**
     * Update parallax effect based on camera position
     */
    update(deltaTime, cameraY) {
        this.parallaxLayers.forEach(layer => {
            // Update layer position based on camera and parallax speed
            const offset = cameraY * layer.speed;
            layer.container.y = offset;

            // Update individual elements (animations)
            layer.elements.forEach(element => {
                // Twinkle stars
                if (element.twinkleSpeed) {
                    element.twinklePhase += deltaTime * element.twinkleSpeed;
                    element.alpha = 0.4 + Math.sin(element.twinklePhase) * 0.3;
                }

                // Drift snowflakes
                if (element.drift !== undefined) {
                    element.x += element.drift * deltaTime;
                    if (element.x < -50) element.x = 1970;
                    if (element.x > 1970) element.x = -50;
                }

                // Wave flags
                if (element.wavePhase !== undefined) {
                    element.wavePhase += deltaTime * 3;
                    element.rotation = Math.sin(element.wavePhase) * 0.1;
                }
            });
        });
    }

    /**
     * Clear all background elements
     */
    clear() {
        this.backgroundContainer.removeChildren();
        this.parallaxLayers = [];
    }

    /**
     * Destroy background manager
     */
    destroy() {
        this.clear();
        this.backgroundContainer.destroy(true);
    }
}

