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
        
        // Level-specific story data
        this.levelNumber = null;
        this.storyType = null; // 'opening', 'entry', or 'exit'
        this.actualPanelCount = STORY.PANEL_COUNT; // Will be updated based on loaded panels
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

        // Don't load panels in init - wait for enter() to determine which panels to load
        // Create UI elements
        this.createUI();
    }

    async loadPanelTextures() {
        // Determine which panels to load based on story type and level
        if (this.storyType === 'opening') {
            // Original opening story
            this.panelTextures = await this.game.assetManager.loadStoryPanels();
            this.actualPanelCount = this.panelTextures.length;
        } else if (this.levelNumber && this.storyType) {
            // Level-specific story (entry or exit)
            this.panelTextures = await this.game.assetManager.loadLevelStoryPanels(
                this.levelNumber, 
                this.storyType,
                3 // Try to load up to 3 panels for level stories
            );
            
            // Filter out any nulls to get actual panel count
            this.actualPanelCount = this.panelTextures.filter(p => p !== null).length;
            
            // If no panels were loaded, create placeholders
            if (this.actualPanelCount === 0) {
                console.warn(`No ${this.storyType} panels for level ${this.levelNumber}, using placeholders`);
                this.panelTextures = [null]; // At least one placeholder
                this.actualPanelCount = 1;
            }
        } else {
            // Fallback - no panels
            this.panelTextures = [];
            this.actualPanelCount = 0;
        }
    }

    createPanels() {
        // Clear existing panels
        this.panels.forEach(panel => panel.destroy());
        this.panels = [];
        this.panelsContainer.removeChildren();
        
        for (let i = 0; i < this.actualPanelCount; i++) {
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
                
                // Center the panel
                panel.x = (STORY.PANEL_MAX_WIDTH - panel.width) / 2;
                panel.y = (STORY.PANEL_MAX_HEIGHT - panel.height) / 2;

                panelContainer.addChild(panel);
            } else {
                // Create placeholder with text
                const placeholder = new Graphics()
                    .rect(0, 0, STORY.PANEL_MAX_WIDTH, STORY.PANEL_MAX_HEIGHT)
                    .fill({ color: 0x444466 });
                panelContainer.addChild(placeholder);
                
                // Add placeholder text
                const placeholderText = new Text({
                    text: `Level ${this.levelNumber || '?'}\n${this.storyType || 'Story'}\nPanel ${i + 1}`,
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
        // Next button
        this.nextButton = new Button(
            'Next',
            this.game.app.screen.width - 180,
            this.game.app.screen.height - 80,
            150,
            50,
            COLORS.UI_PRIMARY,
            () => this.handleNextClick()
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
            text: '1 / 1',
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

    handleNextClick() {
        // Clear auto-advance timer
        if (this.autoAdvanceTimer) {
            clearTimeout(this.autoAdvanceTimer);
            this.autoAdvanceTimer = null;
        }
        
        this.showNextPanel();
    }

    showNextPanel() {
        if (this.currentPanelIndex >= this.actualPanelCount) {
            this.endStorySequence();
            return;
        }

        const panel = this.panels[this.currentPanelIndex];
        if (!panel) {
            this.endStorySequence();
            return;
        }
        
        panel.visible = true;

        // Clear any existing timer
        if (this.autoAdvanceTimer) {
            clearTimeout(this.autoAdvanceTimer);
        }

        // Animate panel
        this.animatePanelIn(panel);

        // Update counter
        this.panelCounter.text = `${this.currentPanelIndex + 1} / ${this.actualPanelCount}`;

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
                if (this.panels[i]) {
                    this.darkenPanel(this.panels[i]);
                }
            }
        }

        this.currentPanelIndex++;

        // Update button text for last panel
        if (this.currentPanelIndex === this.actualPanelCount) {
            this.nextButton.setText('Continue');
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

            // Subtle floating animation
            panel.y = panel.baseY + Math.sin(elapsed * 2) * 5;

            if (progress >= 1) {
                this.game.app.ticker.remove(fadeIn);
            }
        };

        this.game.app.ticker.add(fadeIn);
    }

    darkenPanel(panel) {
        panel.alpha = 0.5;
        // Optionally add darkening overlay
    }

    fadeIn(element, duration) {
        let elapsed = 0;
        const fadeInDuration = duration / 1000;

        const fade = (ticker) => {
            elapsed += ticker.deltaTime / 60;
            const progress = Math.min(elapsed / fadeInDuration, 1);
            element.alpha = progress;

            if (progress >= 1) {
                this.game.app.ticker.remove(fade);
            }
        };

        this.game.app.ticker.add(fade);
    }

    endStorySequence() {
        // Clear auto-advance timer
        if (this.autoAdvanceTimer) {
            clearTimeout(this.autoAdvanceTimer);
            this.autoAdvanceTimer = null;
        }

        // Fade out and transition
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
            if (p) {
                p.visible = false;
                p.alpha = 0;
                p.scale.set(1);
            }
        });
        if (this.nextButton) this.nextButton.container.alpha = 0;
        if (this.panelCounter) this.panelCounter.alpha = 0;
        if (this.storyTitle) this.storyTitle.alpha = 0;
        if (this.skipButton) this.skipButton.container.visible = false;
        if (this.nextButton) this.nextButton.setText('Next');
    }

    async enter(data = {}) {
        await super.enter(data);
        
        // Store story configuration
        this.levelNumber = data.levelNumber || null;
        this.storyType = data.storyType || 'opening'; // 'opening', 'entry', or 'exit'
        
        // Store where to go after story completes
        this.nextScene = data.nextScene || 'game';
        this.nextData = data.nextData || {};
        
        // Make sure level number is passed along
        if (this.levelNumber && !this.nextData.levelNumber) {
            this.nextData.levelNumber = this.levelNumber;
        }
        
        // Load the appropriate panels
        await this.loadPanelTextures();
        
        // Create panels based on loaded textures
        this.createPanels();
        
        // Update story title based on type
        this.updateStoryTitle();
        
        // Reset the scene
        this.reset();
        
        // Start showing the story panels
        if (this.actualPanelCount > 0) {
            this.showNextPanel();
        } else {
            // No panels, skip directly to next scene
            console.warn('No story panels loaded, skipping to next scene');
            this.endStorySequence();
        }
    }

    updateStoryTitle() {
        if (!this.storyTitle) return;
        
        let title = 'The Story Continues...';
        
        if (this.storyType === 'opening') {
            title = 'The Call to Campus';
        } else if (this.levelNumber) {
            const levelName = this.game.levelManager?.getLevelConfig(this.levelNumber)?.name || `Level ${this.levelNumber}`;
            
            if (this.storyType === 'entry') {
                title = `Entering ${levelName}`;
            } else if (this.storyType === 'exit') {
                title = `${levelName} Complete!`;
            }
        }
        
        this.storyTitle.text = title;
    }

    async exit() {
        await super.exit();

        if (this.autoAdvanceTimer) {
            clearTimeout(this.autoAdvanceTimer);
            this.autoAdvanceTimer = null;
        }
    }

    destroy() {
        if (this.nextButton) this.nextButton.destroy();
        if (this.skipButton) this.skipButton.destroy();
        super.destroy();
    }
}