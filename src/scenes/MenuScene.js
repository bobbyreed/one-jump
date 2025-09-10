import { Sprite, Graphics, Text, Container } from 'pixi.js';
import BaseScene from './BaseScene.js';
import { UI, COLORS } from '../config/Constants.js';
import Button from '../ui/Button.js';

export default class MenuScene extends BaseScene {
    constructor(game) {
        super(game);
        this.coverSprite = null;
        this.menuPanel = null;
        this.buttons = [];
        this.highScoreText = null;
    }

    async init() {
        await super.init();


        // Get cover texture from asset manager
        const coverTexture = this.game.assetManager.getTexture('cover');
        if (coverTexture) {
            this.coverSprite = new Sprite(coverTexture);

            // Scale cover to fit screen
            const scale = Math.max(
                this.game.app.screen.width / this.coverSprite.texture.width,
                this.game.app.screen.height / this.coverSprite.texture.height
            ) * 0.75;

            this.coverSprite.scale.set(scale);
            this.coverSprite.anchor.set(0.5);
            this.coverSprite.x = this.game.app.screen.width / 2;
            this.coverSprite.y = this.game.app.screen.height / 2;

            this.container.addChild(this.coverSprite);
        }

        // Create menu panel
        this.createMenuPanel();

        // Create buttons
        this.createButtons();

        // Create instructions text
        this.createInstructions();
    }

    createMenuPanel() {
        const panel = new Graphics()
            .roundRect(0, 0, UI.PANEL_WIDTH, UI.PANEL_HEIGHT, UI.PANEL_RADIUS)
            .fill({ color: COLORS.UI_PRIMARY, alpha: 0.25 })
            .roundRect(0, 0, UI.PANEL_WIDTH, UI.PANEL_HEIGHT, UI.PANEL_RADIUS);

        panel.x = (this.game.app.screen.width - UI.PANEL_WIDTH) / 2;
        panel.y = (this.game.app.screen.height - UI.PANEL_HEIGHT) / 2 + 50;

        this.menuPanel = panel;
        this.container.addChild(panel);

        // Title
        const title = new Text({
            text: 'ONE JUMP',
            style: {
                fontFamily: 'Arial Black',
                fontSize: 72,
                fill: 0xffffff,
                stroke: { color: 0x000000, width: 5 }
            }
        });
        title.x = 960;
        title.y = 200;
        title.anchor.set(0.5);
        this.container.addChild(title);

        //sub
        const subtitle = new Text({
            text: 'Starsky the Ram starring in...',
            style: {
                fontFamily: 'Arial Black',
                fontSize: 20,
                fill: 'black',
                stroke: { color: '#AA4A44', width: 5 }
        }
        });
        subtitle.x = 750;
        subtitle.y = 150;
        subtitle.anchor.set(0.5);
        this.container.addChild(subtitle);
    }

    createButtons() {
        const buttonX = this.menuPanel.x + (UI.PANEL_WIDTH - UI.BUTTON_WIDTH) / 2;
        const startY = this.menuPanel.y + 60;

        // Start Game button
        const startButton = new Button(
            'START GAME',
            buttonX,
            startY,
            UI.BUTTON_WIDTH,
            UI.BUTTON_HEIGHT,
            COLORS.UI_PRIMARY,
            () => this.startGame()
        );
        this.container.addChild(startButton.container);
        this.buttons.push(startButton);

        // View Highscores button
        const highscoresButton = new Button(
            'HIGHSCORES',
            buttonX,
            startY + UI.BUTTON_HEIGHT + UI.BUTTON_SPACING,
            UI.BUTTON_WIDTH,
            UI.BUTTON_HEIGHT,
            COLORS.UI_SECONDARY,
            () => this.showHighscores()
        );
        this.container.addChild(highscoresButton.container);
        this.buttons.push(highscoresButton);

        //level selct
        const levelSelectBtn = new Button({
                text: 'LEVEL SELECT',
                width: 300,
                height: 80,
                onClick: () => this.game.sceneManager.changeScene('levelSelect')
            });
            levelSelectBtn.x = 960;
            levelSelectBtn.y = 500;
            this.container.addChild(levelSelectBtn);

        // High score display
        this.highScoreText = new Text({
            text: `Best Score: ${this.game.saveManager.data.highScore}`,
            style: {
                fontFamily: 'Arial',
                fontSize: 20,
                fill: COLORS.TEXT_PRIMARY,
                dropShadow: true,
                dropShadowColor: 0x000000,
                dropShadowDistance: 2
            }
        });
        this.highScoreText.anchor.set(0.5);
        this.highScoreText.x = this.menuPanel.x + UI.PANEL_WIDTH / 2;
        this.highScoreText.y = startY + (UI.BUTTON_HEIGHT + UI.BUTTON_SPACING) * 2 + 30;
        this.container.addChild(this.highScoreText);
    }

    createInstructions() {
        const instructionsText = new Text({
            text: 'Walk off the edge and navigate the fall!\nLand on the pads for maximum points!',
            style: {
                fontFamily: 'Arial',
                fontSize: 16,
                fill: COLORS.TEXT_SECONDARY,
                align: 'center',
                dropShadow: true,
                dropShadowColor: 0x000000,
                dropShadowDistance: 2
            }
        });
        instructionsText.anchor.set(0.5);
        instructionsText.x = this.game.app.screen.width / 2;
        instructionsText.y = this.game.app.screen.height - 60;
        this.container.addChild(instructionsText);
    }

    startGame() {
        this.changeScene('story');
    }

    showHighscores() {
        this.changeScene('highscores');
    }

    async enter(data) {
        await super.enter(data);

        // Update high score display in case it changed
        if (this.highScoreText) {
            this.highScoreText.text = `Best Score: ${this.game.saveManager.data.highScore}`;
        }
    }

    destroy() {
        this.buttons.forEach(button => button.destroy());
        this.buttons = [];
        super.destroy();
    }
}