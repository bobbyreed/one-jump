import { Container } from 'pixi.js';

export default class BaseScene {
    constructor(game) {
        this.game = game;
        this.container = new Container();
        this.initialized = false;
    }

    // Called once when scene is created
    async init() {
        this.initialized = true;
    }

    // Called when entering this scene
    async enter(data = {}) {
        // Override in derived classes
    }

    // Called when leaving this scene
    async exit() {
        // Override in derived classes
    }

    // Called every frame when scene is active
    update(deltaTime) {
        // Override in derived classes
    }

    // Utility method to change scenes
    changeScene(sceneName, data = {}) {
        this.game.sceneManager.changeScene(sceneName, data);
    }

    // Clean up resources
    destroy() {
        this.container.destroy(true);
    }
}