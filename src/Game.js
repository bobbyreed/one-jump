import { Application } from 'pixi.js';
import { COLORS } from './config/Constants.js';
import SceneManager from './managers/SceneManager.js';
import AssetManager from './managers/AssetManager.js';
import InputManager from './managers/InputManager.js';
import SaveManager from './managers/SaveManager.js';
import MenuScene from './scenes/MenuScene.js';
import StoryScene from './scenes/StoryScene.js';
import GameScene from './scenes/GameScene.js';
import HighscoresScene from './scenes/HighscoresScene.js';

export default class Game {
    constructor() {
        this.app = null;
        this.sceneManager = null;
        this.assetManager = null;
        this.inputManager = null;
        this.saveManager = null;
        this.isInitialized = false;
    }

    async init() {
        // Create PixiJS application
        this.app = new Application();

        await this.app.init({
            background: COLORS.BACKGROUND,
            resizeTo: window,
            antialias: true,
            resolution: window.devicePixelRatio || 1
        });

        // Append canvas to DOM
        const container = document.getElementById('pixi-container');
        if (container) {
            container.appendChild(this.app.canvas);
        } else {
            document.body.appendChild(this.app.canvas);
        }

        // Initialize managers
        this.saveManager = new SaveManager();
        this.saveManager.load();

        this.assetManager = new AssetManager();
        this.inputManager = new InputManager();
        this.sceneManager = new SceneManager(this);

        // Load core assets
        await this.assetManager.loadCoreAssets();

        // Initialize scenes
        await this.initializeScenes();

        // Start with menu
        this.sceneManager.changeScene('menu');

        this.isInitialized = true;
        console.log('Game initialized successfully');
    }

    async initializeScenes() {
        // Create all game scenes
        const menuScene = new MenuScene(this);
        const storyScene = new StoryScene(this);
        const gameScene = new GameScene(this);
        const highscoresScene = new HighscoresScene(this);

        // Register scenes with manager
        this.sceneManager.registerScene('menu', menuScene);
        this.sceneManager.registerScene('story', storyScene);
        this.sceneManager.registerScene('game', gameScene);
        this.sceneManager.registerScene('highscores', highscoresScene);

        // Initialize all scenes
        await menuScene.init();
        await storyScene.init();
        await gameScene.init();
        await highscoresScene.init();
    }

    // Global game methods
    getHighScore() {
        return this.saveManager.data.highScore;
    }

    setHighScore(score) {
        if (score > this.saveManager.data.highScore) {
            this.saveManager.data.highScore = score;
            this.saveManager.save();
            return true;
        }
        return false;
    }

    // Utility method to create consistent buttons
    createButton(text, x, y, width, height, color, onClick) {
        // This will be moved to a UI component
        const button = new Container();
        button.eventMode = 'static';
        button.cursor = 'pointer';

        const bg = new Graphics()
            .roundRect(0, 0, width, height, 10)
            .fill({ color: color, alpha: 0.3 })
            .roundRect(0, 0, width, height, 10)
            .stroke({ width: 2, color: color });

        const hoverBg = new Graphics()
            .roundRect(0, 0, width, height, 10)
            .fill({ color: color, alpha: 0.5 })
            .roundRect(0, 0, width, height, 10)
            .stroke({ width: 3, color: color });
        hoverBg.visible = false;

        const label = new Text({
            text: text,
            style: {
                fontFamily: 'Arial',
                fontSize: 24,
                fill: 0xffffff,
                fontWeight: 'bold',
                dropShadow: true,
                dropShadowColor: 0x000000,
                dropShadowDistance: 2
            }
        });
        label.anchor.set(0.5);
        label.x = width / 2;
        label.y = height / 2;

        button.addChild(bg, hoverBg, label);
        button.x = x;
        button.y = y;

        button.on('pointerover', () => {
            hoverBg.visible = true;
            button.scale.set(1.05);
        });

        button.on('pointerout', () => {
            hoverBg.visible = false;
            button.scale.set(1);
        });

        button.on('pointerdown', onClick);

        return button;
    }

    destroy() {
        if (this.sceneManager) {
            this.sceneManager.destroy();
        }
        if (this.inputManager) {
            this.inputManager.destroy();
        }
        if (this.app) {
            this.app.destroy(true);
        }
    }
}