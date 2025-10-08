import { Sprite, Graphics, Text, Container } from 'pixi.js';
import BaseScene from './BaseScene.js';
import { UI, COLORS } from '../config/Constants.js';
import Button from '../ui/Button.js';
import Checkbox from '../ui/Checkbox.js';

export default class MenuScene extends BaseScene {
    constructor(game) {
        super(game);
        this.coverSprite = null;
        this.menuPanel = null;
        this.buttons = [];
        this.highScoreText = null;
        this.skipStoryCheckbox = null;
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

        // New Game button
        const startButton = new Button(
            'NEW GAME',
            buttonX,
            startY,
            UI.BUTTON_WIDTH,
            UI.BUTTON_HEIGHT,
            COLORS.UI_PRIMARY,
            () => this.startGame()
        );
        this.container.addChild(startButton.container);
        this.buttons.push(startButton);

        // Level Select button - FIXED FORMAT
        const levelSelectButton = new Button(
            'LEVEL SELECT',
            buttonX,
            startY + UI.BUTTON_HEIGHT + UI.BUTTON_SPACING,
            UI.BUTTON_WIDTH,
            UI.BUTTON_HEIGHT,
            COLORS.SUCCESS,
            () => this.game.sceneManager.changeScene('levelSelect')
        );
        this.container.addChild(levelSelectButton.container);
        this.buttons.push(levelSelectButton);

        // Highscores button
        const highscoresButton = new Button(
            'HIGHSCORES',
            buttonX,
            startY + (UI.BUTTON_HEIGHT + UI.BUTTON_SPACING) * 2,
            UI.BUTTON_WIDTH,
            UI.BUTTON_HEIGHT,
            COLORS.UI_SECONDARY,
            () => this.showHighscores()
        );
        this.container.addChild(highscoresButton.container);
        this.buttons.push(highscoresButton);

        // Leaderboard button
        const leaderboardButton = new Button(
            'LEADERBOARD',
            buttonX,
            startY + (UI.BUTTON_HEIGHT + UI.BUTTON_SPACING) * 3,
            UI.BUTTON_WIDTH,
            UI.BUTTON_HEIGHT,
            0x4488ff, // Blue color for online feature
            () => this.showLeaderboard()
        );
        this.container.addChild(leaderboardButton.container);
        this.buttons.push(leaderboardButton);

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
        this.highScoreText.y = startY + (UI.BUTTON_HEIGHT + UI.BUTTON_SPACING) * 3 + 30;
        this.container.addChild(this.highScoreText);

        // Skip Story checkbox
        const checkboxY = this.highScoreText.y + 50;
        const checkboxX = this.menuPanel.x + (UI.PANEL_WIDTH - 200) / 2;
        this.skipStoryCheckbox = new Checkbox(
            'Skip Story Scenes',
            checkboxX,
            checkboxY,
            this.game.saveManager.data.settings.skipStory,
            (checked) => {
                this.game.saveManager.data.settings.skipStory = checked;
                this.game.saveManager.save();
                console.log(`Story skip ${checked ? 'enabled' : 'disabled'}`);
            }
        );
        this.container.addChild(this.skipStoryCheckbox.container);
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
        // Check if story should be skipped
        const skipStory = this.game.saveManager.data.settings.skipStory;

        if (skipStory) {
            // Skip directly to game
            this.changeScene('game', { levelNumber: 1 });
        } else {
            // Start new game flow: opening story → level 1 intro → level 1 game
            this.changeScene('story', {
                isOpening: true, // Flag to indicate this is the opening story
                nextScene: 'story', // After opening, go to level 1 intro story
                nextData: {
                    levelNumber: 1,
                    isIntro: true,
                    nextScene: 'game',
                    nextData: { levelNumber: 1 }
                }
            });
        }
    }

    showHighscores() {
        this.changeScene('highscores');
    }

    showLeaderboard() {
        this.changeScene('leaderboard');
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
        if (this.skipStoryCheckbox) {
            this.skipStoryCheckbox.destroy();
        }
        super.destroy();
    }
}