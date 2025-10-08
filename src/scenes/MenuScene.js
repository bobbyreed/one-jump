import { Sprite, Graphics, Text, Container } from 'pixi.js';
import BaseScene from './BaseScene.js';
import { UI, COLORS } from '../config/Constants.js';
import Button from '../ui/Button.js';
import Checkbox from '../ui/Checkbox.js';
import TextInput from '../ui/TextInput.js';

export default class MenuScene extends BaseScene {
    constructor(game) {
        super(game);
        this.coverSprite = null;
        this.menuPanel = null;
        this.buttons = [];
        this.skipStoryCheckbox = null;
        this.usernameInput = null;
        this.usernameDisplay = null;
        this.changeUserButton = null;
        this.isEditingUsername = false;
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

        // Leaderboard button
        const leaderboardButton = new Button(
            'LEADERBOARD',
            buttonX,
            startY + (UI.BUTTON_HEIGHT + UI.BUTTON_SPACING) * 2,
            UI.BUTTON_WIDTH,
            UI.BUTTON_HEIGHT,
            COLORS.UI_SECONDARY,
            () => this.showLeaderboard()
        );
        this.container.addChild(leaderboardButton.container);
        this.buttons.push(leaderboardButton);

        // Username section - STACKED VERTICALLY
        const usernameY = startY + (UI.BUTTON_HEIGHT + UI.BUTTON_SPACING) * 3 + 20;
        const usernameX = this.menuPanel.x + (UI.PANEL_WIDTH / 2) - 100; // Centered

        // Username display (shown when not editing)
        this.usernameDisplay = new Container();

        const usernameLabel = new Text({
            text: 'Logged in as:',
            style: {
                fontFamily: 'Arial',
                fontSize: 16,
                fill: 0xcccccc
            }
        });
        usernameLabel.anchor.set(0.5, 0);
        usernameLabel.x = 100;
        usernameLabel.y = 0;
        this.usernameDisplay.addChild(usernameLabel);

        this.usernameText = new Text({
            text: this.game.saveManager.data.username,
            style: {
                fontFamily: 'Arial',
                fontSize: 22,
                fill: 0x88ff88,
                fontWeight: 'bold'
            }
        });
        this.usernameText.anchor.set(0.5, 0);
        this.usernameText.x = 100;
        this.usernameText.y = 22;
        this.usernameDisplay.addChild(this.usernameText);

        this.usernameDisplay.x = usernameX;
        this.usernameDisplay.y = usernameY;
        this.container.addChild(this.usernameDisplay);

        // Change User button - BELOW USERNAME
        this.changeUserButton = new Button(
            'CHANGE USER',
            usernameX + 100 - 90, // Centered (button width / 2)
            usernameY + 55,
            180,
            40,
            0x6666ff,
            () => this.showUsernameInput()
        );
        this.container.addChild(this.changeUserButton.container);

        // Username input (shown when editing)
        this.usernameInput = new TextInput(
            'Username:',
            usernameX,
            usernameY,
            280,
            40,
            this.game.saveManager.data.username === 'Anonymous' ? '' : this.game.saveManager.data.username,
            20,
            (value) => {
                // Save username when changed (trim whitespace)
                const trimmedValue = value.trim();
                this.game.saveManager.data.username = trimmedValue || 'Anonymous';
                this.game.saveManager.save();
                console.log(`Username set to: ${this.game.saveManager.data.username}`);

                // Switch back to display mode
                this.hideUsernameInput();
            }
        );
        this.usernameInput.container.visible = false;
        this.container.addChild(this.usernameInput.container);

        // Skip Story checkbox - MOVED DOWN
        const checkboxY = usernameY + 105;
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

    showLeaderboard() {
        this.changeScene('leaderboard');
    }

    showUsernameInput() {
        this.isEditingUsername = true;
        this.usernameDisplay.visible = false;
        this.changeUserButton.container.visible = false;
        this.usernameInput.container.visible = true;

        // Focus the input and load current value
        const currentUsername = this.game.saveManager.data.username;
        const displayValue = currentUsername === 'Anonymous' ? '' : currentUsername;
        this.usernameInput.setValue(displayValue);
        setTimeout(() => this.usernameInput.focus(), 100);
    }

    hideUsernameInput() {
        this.isEditingUsername = false;
        this.usernameInput.container.visible = false;
        this.usernameDisplay.visible = true;
        this.changeUserButton.container.visible = true;

        // Update username display text
        this.usernameText.text = this.game.saveManager.data.username;
    }

    async enter(data) {
        await super.enter(data);

        // Reload username from save data and ensure display mode
        const savedUsername = this.game.saveManager.data.username;
        if (this.usernameText) {
            this.usernameText.text = savedUsername;
        }

        // Always show display mode when entering menu
        if (this.isEditingUsername) {
            this.hideUsernameInput();
        }
    }

    update(deltaTime) {
        super.update(deltaTime);
        if (this.usernameInput) {
            this.usernameInput.update(deltaTime);
        }
    }

    destroy() {
        this.buttons.forEach(button => button.destroy());
        this.buttons = [];
        if (this.skipStoryCheckbox) {
            this.skipStoryCheckbox.destroy();
        }
        if (this.usernameInput) {
            this.usernameInput.destroy();
        }
        if (this.changeUserButton) {
            this.changeUserButton.destroy();
        }
        super.destroy();
    }
}