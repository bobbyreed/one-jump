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
import LevelManager from './managers/LevelManager.js';
import LevelSelectScene from './scenes/LevelSelectScene.js';

export default class Game {
    constructor() {
        this.app = null;
        this.sceneManager = null;
        this.assetManager = null;
        this.inputManager = null;
        this.saveManager = null;
        this.levelManager = null;
        this.isInitialized = false;   
    }

    async init() {
        // Create PixiJS application
        this.app = new Application();

        await this.app.init({
            background: COLORS.BACKGROUND,
            width: 1920,
            height: 1080,
            antialias: true,
            resolution: 1,  // Force resolution to 1
            autoDensity: true,
            powerPreference: 'high-performance',
            preserveDrawingBuffer: false
            });
        
        // Handle WebGL context loss
        this.app.renderer.runners.contextChange.add(() => {
            console.log('WebGL context restored');
        });

        // Add context loss/restore handlers
        const canvas = this.app.canvas;
            canvas.addEventListener('webglcontextlost', (event) => {
                event.preventDefault();
                console.warn('WebGL context lost. Attempting to restore...');
            }, false);

        canvas.addEventListener('webglcontextrestored', () => {
                console.log('WebGL context successfully restored');
                // Reload assets if needed
                if (this.assetManager) {
                    this.assetManager.loadCoreAssets();
                }
            }, false);

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
        //level manager MUST be loaded before asset manager
        this.levelManager = new LevelManager(this);
        this.assetManager = new AssetManager();
        this.inputManager = new InputManager();
        this.sceneManager = new SceneManager(this);

        // Load core assets
        await this.assetManager.loadCoreAssets();

        // Initialize scenes
        await this.initializeScenes();

        // Start with menu
        this.sceneManager.changeScene('menu');

        this.app.ticker.add((ticker) => {
            const deltaTime = ticker.deltaTime / 60;
            this.update(deltaTime);
            });

        this.isInitialized = true;
        console.log('Game initialized successfully');
    }

    async initializeScenes() {
        // Create all game scenes
        const menuScene = new MenuScene(this);
        const storyScene = new StoryScene(this);
        const gameScene = new GameScene(this);
        const highscoresScene = new HighscoresScene(this);
        const levelSelectScene = new LevelSelectScene(this);


        // Register scenes with manager
        this.sceneManager.registerScene('menu', menuScene);
        this.sceneManager.registerScene('story', storyScene);
        this.sceneManager.registerScene('game', gameScene);
        this.sceneManager.registerScene('highscores', highscoresScene);
        this.sceneManager.registerScene('levelSelect', levelSelectScene);


        // Initialize all scenes
        await menuScene.init();
        await storyScene.init();
        await gameScene.init();
        await highscoresScene.init();
        await levelSelectScene.init();
    }

    // Global game methods
    getHighScore() {
        return this.saveManager.data.highScore;
    }

    update(deltaTime) {
        if (this.sceneManager) {
            this.sceneManager.update(deltaTime);
        }
        }

    setupCanvasScaling() {
        const resize = () => {
            const screenWidth = window.innerWidth;
            const screenHeight = window.innerHeight;
            const scale = Math.min(screenWidth / 1920, screenHeight / 1080);
            
            this.app.canvas.style.width = `${1920 * scale}px`;
            this.app.canvas.style.height = `${1080 * scale}px`;
            this.app.canvas.style.position = 'absolute';
            this.app.canvas.style.left = `${(screenWidth - 1920 * scale) / 2}px`;
            this.app.canvas.style.top = `${(screenHeight - 1080 * scale) / 2}px`;
        };
        
        resize();
        window.addEventListener('resize', resize);
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