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
        this.panelCount = 5; // Default, will be updated dynamically

        // UI elements
        this.nextButton = null;
        this.skipButton = null;
        this.storyTitle = null;
        this.panelCounter = null;

        //scene transition stuffs
        this.nextScene = 'game';
        this.nextData = {};

        // Story context
        this.levelNumber = null;
        this.isIntro = true;
        this.isOpening = false;
        this.endingPart = null;
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
        // Load panels based on level context if available
        if (this.levelNumber !== null) {
            this.panelTextures = await this.game.assetManager.loadLevelStoryPanels(
                this.levelNumber,
                this.isIntro,
                this.endingPart
            );
        } else {
            // Fallback to default opening panels
            this.panelTextures = await this.game.assetManager.loadStoryPanels();
        }

        // Update panel count based on loaded textures
        this.panelCount = this.panelTextures.length;
    }

    calculatePanelLayout(panelCount) {
        const screenWidth = this.game.app.screen.width;
        const screenHeight = this.game.app.screen.height;

        // Reserve space for UI elements
        const uiReserveTop = 150;     // Title area
        const uiReserveBottom = 150;  // Buttons area
        const sideMargin = 100;       // Side margins

        const usableWidth = screenWidth - (sideMargin * 2);
        const usableHeight = screenHeight - uiReserveTop - uiReserveBottom;

        let rows, cols;

        // Determine grid layout based on panel count
        if (panelCount === 2) {
            rows = 1;
            cols = 2;
        } else if (panelCount === 3) {
            rows = 1;
            cols = 3;
        } else if (panelCount <= 6) {
            rows = 2;
            cols = 3;
        } else {
            // Fallback for unexpected counts
            rows = Math.ceil(Math.sqrt(panelCount));
            cols = Math.ceil(panelCount / rows);
        }

        // Calculate spacing
        const horizontalSpacing = 40;
        const verticalSpacing = 40;

        // Calculate panel dimensions
        const totalHorizontalSpacing = horizontalSpacing * (cols - 1);
        const totalVerticalSpacing = verticalSpacing * (rows - 1);

        const panelWidth = (usableWidth - totalHorizontalSpacing) / cols;
        const panelHeight = (usableHeight - totalVerticalSpacing) / rows;

        // Calculate starting position to center the grid
        const gridWidth = (panelWidth * cols) + totalHorizontalSpacing;
        const gridHeight = (panelHeight * rows) + totalVerticalSpacing;

        const startX = sideMargin + (usableWidth - gridWidth) / 2;
        const startY = uiReserveTop + (usableHeight - gridHeight) / 2;

        return {
            rows,
            cols,
            panelWidth,
            panelHeight,
            startX,
            startY,
            horizontalSpacing,
            verticalSpacing
        };
    }

    createPanels() {
        // Clear any existing panels first
        this.panels.forEach(panel => {
            if (panel && panel.parent) {
                panel.parent.removeChild(panel);
            }
        });
        this.panels = [];

        // Calculate dynamic layout
        const layout = this.calculatePanelLayout(this.panelCount);

        for (let i = 0; i < this.panelCount; i++) {
            const panelContainer = new Container();

            // Calculate grid position
            const row = Math.floor(i / layout.cols);
            const col = i % layout.cols;

            // Calculate position in grid
            const gridX = layout.startX + (col * (layout.panelWidth + layout.horizontalSpacing));
            const gridY = layout.startY + (row * (layout.panelHeight + layout.verticalSpacing));

            // Panel image or placeholder
            let panelSprite;
            if (this.panelTextures[i]) {
                panelSprite = new Sprite(this.panelTextures[i]);

                // Scale to fit panel dimensions while maintaining aspect ratio
                const scale = Math.min(
                    layout.panelWidth / panelSprite.texture.width,
                    layout.panelHeight / panelSprite.texture.height
                );
                panelSprite.scale.set(scale);

                // Center sprite within panel area
                const scaledWidth = panelSprite.texture.width * scale;
                const scaledHeight = panelSprite.texture.height * scale;
                panelSprite.x = (layout.panelWidth - scaledWidth) / 2;
                panelSprite.y = (layout.panelHeight - scaledHeight) / 2;
            } else {
                // Create placeholder
                panelSprite = new Graphics()
                    .rect(0, 0, layout.panelWidth, layout.panelHeight)
                    .fill({ color: 0x444466 });
            }

            panelContainer.addChild(panelSprite);

            // Panel frame (draw around the actual panel dimensions)
            const frame = new Graphics()
                .roundRect(-10, -10, layout.panelWidth + 20, layout.panelHeight + 20, 10)
                .fill({ color: 0x222244, alpha: 0.8 })
                .roundRect(-10, -10, layout.panelWidth + 20, layout.panelHeight + 20, 10)
                .stroke({ width: 3, color: 0x666688 });
            panelContainer.addChildAt(frame, 0); // Add frame behind the image

            // Position panel
            panelContainer.x = gridX;
            panelContainer.y = gridY;
            panelContainer.alpha = 0;
            panelContainer.visible = false;

            // Add glow effect
            const glow = new Graphics()
                .roundRect(-15, -15, layout.panelWidth + 30, layout.panelHeight + 30, 12)
                .stroke({ width: 4, color: 0xffdd00, alpha: 0 });
            panelContainer.addChildAt(glow, 0);

            panelContainer.panelIndex = i;
            panelContainer.glow = glow;
            panelContainer.baseY = gridY;

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
        this.nextButton.container.alpha = 0;
        this.panelCounter.alpha = 0;
        this.storyTitle.alpha = 0;
        this.skipButton.container.visible = false;
        this.nextButton.setText('Next');
    }

    async enter(data = {}) {
        await super.enter(data);

        // Store where to go after story completes
        this.nextScene = data.nextScene || 'game';
        this.nextData = data.nextData || {};

        // Check if this is the opening story
        this.isOpening = data.isOpening || false;

        // Store level context
        // If it's opening story, don't set levelNumber so it loads opening panels
        this.levelNumber = this.isOpening ? null : (data.levelNumber || null);
        this.isIntro = data.isIntro !== undefined ? data.isIntro : true;
        this.endingPart = data.endingPart || null;

        // Reset the panels
        this.reset();

        // Reload panel textures for this specific story
        await this.loadPanelTextures();

        // Recreate panels with the new textures
        this.createPanels();

        // Update story title based on context
        if (this.isOpening) {
            // Opening story - the game intro
            if (this.storyTitle) {
                this.storyTitle.text = 'The Call to Campus';
            }
        } else if (data.levelNumber) {
            // Level-specific story
            const levelManager = this.game.levelManager;

            // Only try to get story panels if levelManager exists
            if (levelManager && levelManager.getStoryPanels) {
                const storyData = levelManager.getStoryPanels(data.levelNumber, data.isIntro, data.endingPart);

                // Update story title if we have one
                if (this.storyTitle && storyData && storyData.title) {
                    this.storyTitle.text = storyData.title;
                }
            }

            // Make sure level number is passed to game scene
            if (!this.nextData.levelNumber) {
                this.nextData.levelNumber = data.levelNumber;
            }
        }

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