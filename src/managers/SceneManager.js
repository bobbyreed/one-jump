import { Container } from 'pixi.js';

export default class SceneManager {
    constructor(game) {
        this.game = game;
        this.scenes = new Map();
        this.currentScene = null;
        this.currentSceneName = null;
        this.container = new Container();

        // Add the scene container to the stage
        this.game.app.stage.addChild(this.container);
    }

    registerScene(name, scene) {
        this.scenes.set(name, scene);
        // Add scene's container but keep it hidden initially
        this.container.addChild(scene.container);
        scene.container.visible = false;
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
            this.currentScene.container.visible = false;
        }

        // Enter new scene
        this.currentScene = newScene;
        this.currentSceneName = sceneName;
        newScene.container.visible = true;
        await newScene.enter(data);

        console.log(`Changed to scene: ${sceneName}`);
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
        this.container.destroy(true);
    }
}