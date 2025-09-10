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

        // Load panel textures
        await this.loadPanelTextures();

        // Create panels
        this.createPanels();

        // Create UI elements
        this.createUI();
    }

    async loadPanelTextures() {
        this.panelTextures = await this.game.assetManager.loadStoryPanels();
    }

    createPanels() {
        for (let i = 0; i < STORY.PANEL_COUNT; i++) {
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
                // Create placeholder
                const placeholder = new Graphics()
                    .rect(0, 0, STORY.PANEL_MAX_WIDTH, STORY.PANEL_MAX_HEIGHT)
                    .fill({ color: 0x444466 });
                panelContainer.addChild(placeholder);
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
            text: 'The Call to Campus',
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
            text: '1 / 5',
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

    showNextPanel() {
        if (this.currentPanelIndex >= STORY.PANEL_COUNT) {
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
        this.panelCounter.text = `${this.currentPanelIndex + 1} / ${STORY.PANEL_COUNT}`;

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
        if (this.currentPanelIndex === STORY.PANEL_COUNT) {
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

        const animate = (ticker) => {
            elapsed += ticker.deltaTime / 60;
            const progress = Math.min(elapsed / fadeInDuration, 1);

            // Ease-out curve
            const eased = 1 - Math.pow(1 - progress, 3);

            panel.alpha = eased;

            // Glow effect
            if (progress < 0.5) {
                panel.glow.alpha = progress * 2;
            } else {
                panel.glow.alpha = (1 - progress) * 2;
            }

            // Scale effect
            panel.scale.set(0.95 + (eased * 0.05));

            if (progress >= 1) {
                this.game.app.ticker.remove(animate);
                this.addFloatingAnimation(panel);
            }
        };

        this.game.app.ticker.add(animate);
    }

    darkenPanel(panel) {
        const darkenDuration = 0.5;
        let elapsed = 0;

        const animate = (ticker) => {
            elapsed += ticker.deltaTime / 60;
            const progress = Math.min(elapsed / darkenDuration, 1);

            panel.alpha = 1 - (progress * 0.4);
            panel.glow.alpha = 0;

            if (progress >= 1) {
                this.game.app.ticker.remove(animate);
            }
        };

        this.game.app.ticker.add(animate);
    }

    addFloatingAnimation(panel) {
        panel.floatTime = 0;
        const float = (ticker) => {
            if (!panel.visible) {
                this.game.app.ticker.remove(float);
                return;
            }
            panel.floatTime += ticker.deltaTime * 0.05;
            panel.y = panel.baseY + Math.sin(panel.floatTime) * 2;
        };
        this.game.app.ticker.add(float);
    }

    fadeIn(element, duration) {
        let elapsed = 0;
        const fadeTime = duration / 1000;

        const animate = (ticker) => {
            elapsed += ticker.deltaTime / 60;
            const progress = Math.min(elapsed / fadeTime, 1);
            element.alpha = progress;

            if (progress >= 1) {
                this.game.app.ticker.remove(animate);
            }
        };

        this.game.app.ticker.add(animate);
    }

    endStorySequence() {
        // Clear timer
        if (this.autoAdvanceTimer) {
            clearTimeout(this.autoAdvanceTimer);
        }

        // Fade out and transition
        let fadeElapsed = 0;
        const fadeDuration = 0.5;

        const fadeOut = (ticker) => {
            fadeElapsed += ticker.deltaTime / 60;
            const progress = Math.min(fadeElapsed / fadeDuration, 1);
            this.container.alpha = 1 - progress;

            if (progress >= 1) {
                this.game.app.ticker.remove(fadeOut);
                this.container.alpha = 1;
                this.changeScene('game');
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
        this.nextButton.container.alpha = 0;
        this.panelCounter.alpha = 0;
        this.storyTitle.alpha = 0;
        this.skipButton.container.visible = false;
        this.nextButton.setText('Next');
    }

    async enter(data = {}) {
        await super.enter(data);
        
        // Check if this is a level-specific story
        if (data.levelNumber) {
            const levelManager = this.game.levelManager;
            const storyData = levelManager.getStoryPanels(data.levelNumber, data.isIntro);
            
            this.storyData = {
                title: storyData.title,
                panels: storyData.panels,
                images: storyData.images
            };
            
            this.nextScene = data.nextScene || 'game';
            this.nextData = data.nextData || { levelNumber: data.levelNumber };
        } else {
            // Use default story data
            this.storyData = data.story || this.defaultStory;
            this.nextScene = data.nextScene || 'game';
            this.nextData = data.nextData || {};
        }
        
        this.currentPanel = 0;
        this.setupPanels();
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