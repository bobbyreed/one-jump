import { Container, Graphics, Sprite, Text } from 'pixi.js';
import BaseScene from './BaseScene.js';
import { STORY, COLORS } from '../config/Constants.js';
import Button from '../ui/Button.js';

export default class StoryScene extends BaseScene {
    constructor(game) {
        super(game);

        this.panelsContainer = null;
        this.panels = [];
        this.currentPanelIndex = 0;
        this.autoAdvanceTimer = null;
        this.panelTextures = [];

        // UI elements
        this.nextButton = null;
        this.skipButton = null;
        this.storyTitle = null;
        this.panelCounter = null;

        // Scene transition data
        this.nextScene = 'game';
        this.nextData = {};
        
        // Level-specific data
        this.levelNumber = 0;
        this.isIntro = true;
        this.panelCount = STORY.PANEL_COUNT;
    }

    async init() {
        await super.init();

        // Create background
        const bg = new Graphics()
            .rect(0, 0, this.game.app.screen.width, this.game.app.screen.height)
            .fill({ color: COLORS.BACKGROUND });
        this.container.addChild(bg);

        // Create panels container
        this.panelsContainer = new Container();
        this.container.addChild(this.panelsContainer);

        // Don't load panels here - wait for enter() to get level data
    }

    async loadPanelTextures() {
        // Load level-specific panels
        this.panelTextures = await this.game.assetManager.loadStoryPanels(
            this.levelNumber, 
            this.isIntro
        );
        
        // Update panel count based on loaded textures
        this.panelCount = this.panelTextures.length || STORY.PANEL_COUNT;
    }

    createPanels() {
        // Clear existing panels
        this.panels.forEach(panel => panel.destroy());
        this.panels = [];
        
        for (let i = 0; i < this.panelCount; i++) {
            const panelContainer = new Container();

            // Panel frame
            const frame = new Graphics()
                .roundRect(-10, -10, STORY.PANEL_MAX_WIDTH + 20, STORY.PANEL_MAX_HEIGHT + 20, 10)
                .fill({ color: 0x222244, alpha: 0.8 })
                .roundRect(-10, -10, STORY.PANEL_MAX_WIDTH + 20, STORY.PANEL_MAX_HEIGHT + 20, 10)
                .stroke({ width: 3, color: 0x666688 });
            panelContainer.addChild(frame);

            // Panel image or placeholder
            if (this.panelTextures[i]) {
                const panel = new Sprite(this.panelTextures[i]);

                // Scale to fit
                const scale = Math.min(
                    STORY.PANEL_MAX_WIDTH / panel.texture.width,
                    STORY.PANEL_MAX_HEIGHT / panel.texture.height
                );
                panel.scale.set(scale);

                panelContainer.addChild(panel);
            } else {
                // Create placeholder with level info
                const placeholder = new Graphics()
                    .rect(0, 0, STORY.PANEL_MAX_WIDTH, STORY.PANEL_MAX_HEIGHT)
                    .fill({ color: 0x444466 });
                panelContainer.addChild(placeholder);
                
                // Add placeholder text
                const placeholderText = new Text({
                    text: `Level ${this.levelNumber}\nPanel ${i + 1}`,
                    style: {
                        fontFamily: 'Arial',
                        fontSize: 32,
                        fill: 0x888888,
                        align: 'center'
                    }
                });
                placeholderText.anchor.set(0.5);
                placeholderText.x = STORY.PANEL_MAX_WIDTH / 2;
                placeholderText.y = STORY.PANEL_MAX_HEIGHT / 2;
                panelContainer.addChild(placeholderText);
            }

            // Calculate fan position
            const fanX = STORY.PANEL_START_X + (i * STORY.PANEL_OFFSET_X);
            const fanY = STORY.PANEL_START_Y + (i * STORY.PANEL_OFFSET_Y);

            panelContainer.x = fanX;
            panelContainer.y = fanY;
            panelContainer.alpha = 0;
            panelContainer.visible = false;

            // Add glow effect
            const glow = new Graphics()
                .roundRect(-15, -15, STORY.PANEL_MAX_WIDTH + 30, STORY.PANEL_MAX_HEIGHT + 30, 12)
                .stroke({ width: 4, color: 0xffdd00, alpha: 0 });
            panelContainer.addChildAt(glow, 0);

            panelContainer.panelIndex = i;
            panelContainer.glow = glow;
            panelContainer.baseY = fanY;

            this.panels.push(panelContainer);
            this.panelsContainer.addChild(panelContainer);
        }
    }

    createUI() {
        // Clean up existing UI elements if they exist
        if (this.nextButton) {
            this.nextButton.container.destroy();
        }
        if (this.skipButton) {
            this.skipButton.container.destroy();
        }
        if (this.storyTitle) {
            this.storyTitle.destroy();
        }
        if (this.panelCounter) {
            this.panelCounter.destroy();
        }

        // Next button
        this.nextButton = new Button(
            'Next',
            this.game.app.screen.width - 180,
            this.game.app.screen.height - 80,
            150,
            50,
            COLORS.UI_PRIMARY,
            () => this.showNextPanel()
        );
        this.nextButton.container.alpha = 0;
        this.container.addChild(this.nextButton.container);

        // Skip button
        this.skipButton = new Button(
            'Skip Story',
            this.game.app.screen.width - 180,
            this.game.app.screen.height - 140,
            150,
            40,
            0x666666,
            () => this.endStorySequence()
        );
        this.skipButton.container.visible = false;
        this.container.addChild(this.skipButton.container);

        // Story title
        this.storyTitle = new Text({
            text: this.getStoryTitle(),
            style: {
                fontFamily: 'Arial Black',
                fontSize: 36,
                fill: COLORS.TEXT_PRIMARY,
                fontWeight: 'bold',
                dropShadow: true,
                dropShadowColor: 0x000000,
                dropShadowDistance: 3
            }
        });
        this.storyTitle.anchor.set(0.5);
        this.storyTitle.x = this.game.app.screen.width / 2;
        this.storyTitle.y = this.game.app.screen.height - 50;
        this.storyTitle.alpha = 0;
        this.container.addChild(this.storyTitle);

        // Panel counter
        this.panelCounter = new Text({
            text: `1 / ${this.panelCount}`,
            style: {
                fontFamily: 'Arial',
                fontSize: 20,
                fill: COLORS.TEXT_SECONDARY
            }
        });
        this.panelCounter.anchor.set(1, 0);
        this.panelCounter.x = this.game.app.screen.width - 20;
        this.panelCounter.y = 20;
        this.panelCounter.alpha = 0;
        this.container.addChild(this.panelCounter);
    }

    getStoryTitle() {
        if (this.levelNumber === 0) {
            return 'The Call to Campus';
        }
        
        const levelManager = this.game.levelManager;
        if (levelManager && levelManager.getStoryPanels) {
            const storyData = levelManager.getStoryPanels(this.levelNumber, this.isIntro);
            if (storyData && storyData.title) {
                return storyData.title;
            }
        }
        
        // Fallback title
        return this.isIntro ? 
            `Stage ${this.levelNumber}: Beginning` : 
            `Stage ${this.levelNumber}: Complete!`;
    }

    showNextPanel() {
        if (this.currentPanelIndex >= this.panelCount) {
            this.endStorySequence();
            return;
        }

        const panel = this.panels[this.currentPanelIndex];
        panel.visible = true;

        // Clear any existing timer
        if (this.autoAdvanceTimer) {
            clearTimeout(this.autoAdvanceTimer);
        }

        // Animate panel
        this.animatePanelIn(panel);

        // Update counter
        this.panelCounter.text = `${this.currentPanelIndex + 1} / ${this.panelCount}`;

        // Show UI on first panel
        if (this.currentPanelIndex === 0) {
            this.skipButton.container.visible = true;
            this.fadeIn(this.nextButton.container, 500);
            this.fadeIn(this.panelCounter, 500);
            this.fadeIn(this.storyTitle, 800);
        }

        // Darken previous panels
        if (this.currentPanelIndex > 0) {
            for (let i = 0; i < this.currentPanelIndex; i++) {
                this.darkenPanel(this.panels[i]);
            }
        }

        this.currentPanelIndex++;

        // Update button text for last panel
        if (this.currentPanelIndex === this.panelCount) {
            this.nextButton.setText('Start Game');
        }

        // Auto advance
        this.autoAdvanceTimer = setTimeout(() => {
            this.showNextPanel();
        }, STORY.PANEL_DISPLAY_TIME);
    }

    animatePanelIn(panel) {
        const fadeInDuration = STORY.PANEL_FADE_TIME / 1000;
        let elapsed = 0;

        const fadeIn = (ticker) => {
            elapsed += ticker.deltaTime / 60;
            const progress = Math.min(elapsed / fadeInDuration, 1);
            panel.alpha = progress;

            // Subtle zoom effect
            const scale = 0.95 + (0.05 * progress);
            panel.scale.set(scale);

            // Subtle float animation
            const floatAmount = Math.sin(elapsed * 2) * 2;
            panel.y = panel.baseY + floatAmount;

            // Glow pulse
            if (panel.glow) {
                panel.glow.alpha = Math.sin(elapsed * 3) * 0.3 + 0.2;
            }

            if (progress >= 1) {
                this.game.app.ticker.remove(fadeIn);
            }
        };

        this.game.app.ticker.add(fadeIn);
    }

    darkenPanel(panel) {
        panel.alpha = 0.5;
        panel.scale.set(0.95);
        if (panel.glow) {
            panel.glow.alpha = 0;
        }
    }

    fadeIn(object, duration) {
        const fadeDuration = duration / 1000;
        let elapsed = 0;

        const fade = (ticker) => {
            elapsed += ticker.deltaTime / 60;
            const progress = Math.min(elapsed / fadeDuration, 1);
            object.alpha = progress;

            if (progress >= 1) {
                this.game.app.ticker.remove(fade);
            }
        };

        this.game.app.ticker.add(fade);
    }

    endStorySequence() {
        if (this.autoAdvanceTimer) {
            clearTimeout(this.autoAdvanceTimer);
        }

        // Fade out transition
        const fadeDuration = 0.5;
        let fadeElapsed = 0;

        const fadeOut = (ticker) => {
            fadeElapsed += ticker.deltaTime / 60;
            const progress = Math.min(fadeElapsed / fadeDuration, 1);
            this.container.alpha = 1 - progress;

            if (progress >= 1) {
                this.game.app.ticker.remove(fadeOut);
                this.container.alpha = 1;

                // Use the stored next scene and data
                this.changeScene(this.nextScene, this.nextData);
                this.reset();
            }
        };

        this.game.app.ticker.add(fadeOut);
    }

    reset() {
        // Reset for next time
        this.currentPanelIndex = 0;
        this.panels.forEach(p => {
            p.visible = false;
            p.alpha = 0;
            p.scale.set(1);
        });
        if (this.nextButton) this.nextButton.container.alpha = 0;
        if (this.panelCounter) this.panelCounter.alpha = 0;
        if (this.storyTitle) this.storyTitle.alpha = 0;
        if (this.skipButton) this.skipButton.container.visible = false;
        if (this.nextButton) this.nextButton.setText('Next');
    }

    async enter(data = {}) {
        await super.enter(data);

        // Store level-specific data
        this.levelNumber = data.levelNumber || 0;
        this.isIntro = data.isIntro !== undefined ? data.isIntro : true;

        // Store where to go after story completes
        this.nextScene = data.nextScene || 'game';
        this.nextData = data.nextData || {};

        // Make sure level number is passed to game scene
        if (this.levelNumber && !this.nextData.levelNumber) {
            this.nextData.levelNumber = this.levelNumber;
        }

        // Reset the panels
        this.reset();

        // Load the appropriate panels for this level
        await this.loadPanelTextures();

        // Create panels with loaded textures
        this.createPanels();

        // Recreate UI with proper panel count
        this.createUI();

        // Start showing the story panels
        this.showNextPanel();
    }

    async exit() {
        await super.exit();

        if (this.autoAdvanceTimer) {
            clearTimeout(this.autoAdvanceTimer);
        }
    }

    destroy() {
        if (this.nextButton) this.nextButton.destroy();
        if (this.skipButton) this.skipButton.destroy();
        super.destroy();
    }
}