import { Container } from 'pixi.js';

export default class SceneManager {
    constructor(game) {
        this.game = game;
        this.scenes = new Map();
        this.currentScene = null;
        this.currentSceneName = null;
        
        // Create scene root container
        this.sceneContainer = new Container({ label: 'SceneRoot' });
        this.game.app.stage.addChild(this.sceneContainer);
        
        // Add resize listener for responsive scaling
        this.setupResizeHandler();
    }

    registerScene(name, scene) {
        this.scenes.set(name, scene);
    }

    async changeScene(sceneName, data = {}) {
        const newScene = this.scenes.get(sceneName);

        if (!newScene) {
            console.error(`Scene "${sceneName}" not found`);
            return;
        }

        // Exit current scene
        if (this.currentScene) {
            await this.currentScene.exit();
            this.sceneContainer.removeChildren();
        }

        // Create new scale container for responsive scaling
        const scaleContainer = new Container({ label: 'ScaleContainer' });
        this.applyResponsiveScaling(scaleContainer);

        // Add scene container to scale container
        scaleContainer.addChild(newScene.container);

        // Add scale container to scene root
        this.sceneContainer.addChild(scaleContainer);

        // Enter new scene
        this.currentScene = newScene;
        this.currentSceneName = sceneName;
        await newScene.enter(data);

        console.log(`Changed to scene: ${sceneName}`);
    }

    applyResponsiveScaling(container) {
        const scale = this.calculateScale();
        container.scale.set(scale);
        this.centerContainer(container);
    }

    calculateScale() {
        const { width, height } = this.game.app.screen;
        const targetWidth = 1920;
        const targetHeight = 1080;
        const targetRatio = targetWidth / targetHeight;
        const currentRatio = width / height;
        
        // Scale to fit within screen bounds while maintaining aspect ratio
        if (currentRatio > targetRatio) {
            // Screen is wider than target - scale by height
            return height / targetHeight;
        } else {
            // Screen is taller than target - scale by width
            return width / targetWidth;
        }
    }

    centerContainer(container) {
        const { width, height } = this.game.app.screen;
        const targetWidth = 1920;
        const targetHeight = 1080;
        const scale = container.scale.x;
        
        // Center the scaled content
        container.x = (width - (targetWidth * scale)) / 2;
        container.y = (height - (targetHeight * scale)) / 2;
    }

    setupResizeHandler() {
        // Handle window resize for responsive scaling
        const resize = () => {
            if (this.currentScene && this.sceneContainer.children.length > 0) {
                const scaleContainer = this.sceneContainer.children[0];
                this.applyResponsiveScaling(scaleContainer);
            }
        };

        window.addEventListener('resize', resize);
        
        // Also handle when the app screen changes (device rotation, etc.)
        this.game.app.renderer.on('resize', resize);
    }

    update(deltaTime) {
        if (this.currentScene && this.currentScene.update) {
            this.currentScene.update(deltaTime);
        }
    }

    getCurrentSceneName() {
        return this.currentSceneName;
    }

    getCurrentScene() {
        return this.currentScene;
    }

    destroy() {
        this.scenes.forEach(scene => {
            if (scene.destroy) {
                scene.destroy();
            }
        });
        this.scenes.clear();
        this.sceneContainer.destroy(true);
    }
}