import { Container, Graphics, Text, Sprite } from 'pixi.js';
import BaseScene from './BaseScene.js';
import Button from '../ui/Button.js';
import { UI, COLORS } from '../config/Constants.js';

export default class LevelSelectScene extends BaseScene {
    constructor(game) {
        super(game);
        this.levelButtons = [];
        this.selectedLevel = null;
        this.levelPreviews = new Map();
        this.playButton = null;
        this.infoText = null;
    }

    async init() {
        await super.init();
        
        // Create background
        this.createBackground();
        
        // Create title
        this.createTitle();
        
        // Create level selection grid
        this.createLevelGrid();
        
        // Create info panel
        this.createInfoPanel();
        
        // Create navigation buttons
        this.createNavigationButtons();
        
        // Add keyboard controls
        this.setupKeyboardControls();
    }

    createBackground() {
        // Gradient background matching the game's theme
        const bg = new Graphics();
        
        // Create gradient from space (top) to earth (bottom)
        const gradientSteps = 10;
        for (let i = 0; i < gradientSteps; i++) {
            const y = (1080 / gradientSteps) * i;
            const height = 1080 / gradientSteps;
            const color = this.interpolateColor(0x000428, 0x004e92, i / gradientSteps);
            
            bg.rect(0, y, 1920, height);
            bg.fill(color);
        }
        
        this.container.addChild(bg);
        
        // Add stars for atmosphere
        this.createStarfield();
    }

    createStarfield() {
        const stars = new Graphics();
        for (let i = 0; i < 100; i++) {
            const x = Math.random() * 1920;
            const y = Math.random() * 540; // Upper half only
            const size = Math.random() * 2 + 0.5;
            const alpha = Math.random() * 0.8 + 0.2;
            
            stars.circle(x, y, size);
            stars.fill({ color: 0xffffff, alpha });
        }
        this.container.addChild(stars);
    }

    createTitle() {
        // Main title
        const title = new Text({
            text: 'SELECT YOUR DESCENT',
            style: {
                fontFamily: 'Arial Black',
                fontSize: 72,
                fill: 0xffffff,
                stroke: { color: 0x002147, width: 6 },
                dropShadow: {
                    alpha: 0.4,
                    angle: Math.PI / 6,
                    blur: 4,
                    distance: 5
                }
            }
        });
        title.x = 960;
        title.y = 80;
        title.anchor.set(0.5);
        this.container.addChild(title);

        // Subtitle
        const subtitle = new Text({
            text: 'From Space to Campus - Choose Your Path',
            style: {
                fontFamily: 'Arial',
                fontSize: 24,
                fill: 0xCDB87E,
                letterSpacing: 2
            }
        });
        subtitle.x = 960;
        subtitle.y = 140;
        subtitle.anchor.set(0.5);
        this.container.addChild(subtitle);
    }

    createLevelGrid() {
        const levelManager = this.game.levelManager;

        // Define regions with their levels and visual themes
        const regions = [
            {
                name: 'SPACE',
                levels: [1, 2],
                color: 0x000428,
                accentColor: 0xCCCCFF,  // Light purple/blue for contrast
                startY: 200
            },
            {
                name: 'UPPER ATMOSPHERE',
                levels: [3, 4],
                color: 0xFF4500,
                accentColor: 0xFFFFAA,  // Light yellow for contrast
                startY: 400
            },
            {
                name: 'MID ATMOSPHERE',
                levels: [5, 6, 7],
                color: 0x1E90FF,
                accentColor: 0xFFFFFF,  // White for contrast
                startY: 600
            },
            {
                name: 'GROUND APPROACH',
                levels: [8, 9, 10],
                color: 0x2F4F4F,
                accentColor: 0xCDB87E,  // OCU gold for contrast
                startY: 800
            }
        ];

        const buttonSize = 140;
        const spacing = 35;

        regions.forEach(region => {
            // Create region container
            const regionContainer = new Container();

            // Calculate region width based on number of levels
            const regionWidth = region.levels.length * (buttonSize + spacing) + 300;
            const regionX = 960 - regionWidth / 2;

            // Region background panel
            const regionBg = new Graphics();
            regionBg.roundRect(0, 0, regionWidth, 160, 15);
            regionBg.fill({ color: region.color, alpha: 0.3 });
            regionBg.stroke({ color: region.accentColor, width: 3 });
            regionContainer.addChild(regionBg);

            // Region label
            const regionLabel = new Text({
                text: region.name,
                style: {
                    fontFamily: 'Arial Black',
                    fontSize: 21,
                    fill: region.accentColor,
                    letterSpacing: 5,
                    margin: 5
                }
            });
            //regionLabel.anchor.set(-1.5, 4.5);
            regionLabel.x = 30 - regionLabel.text.length;
            regionLabel.y = -30;
            regionContainer.addChild(regionLabel);

            // Position region container
            regionContainer.x = regionX;
            regionContainer.y = region.startY;
            this.container.addChild(regionContainer);

            // Create level buttons for this region
            region.levels.forEach((levelNum, index) => {
                const i = levelNum - 1;
                const x = 250 + index * (buttonSize + spacing);
                const y = 80;

                const levelConfig = levelManager.getLevelConfig(levelNum);
                const isLocked = levelNum > levelManager.unlockedLevels;
                const grade = levelManager.levelGrades[i];
                const score = levelManager.levelScores[i];

                // Level button container
                const buttonContainer = new Container();
                buttonContainer.x = x;
                buttonContainer.y = y;
                buttonContainer.levelNumber = levelNum;

                // Button background with region-specific styling
                const btnBg = new Graphics();
                btnBg.roundRect(-buttonSize/2, -buttonSize/2, buttonSize, buttonSize, 10);
                btnBg.fill(isLocked ? 0x333333 : region.color);
                btnBg.stroke({ color: region.accentColor, width: isLocked ? 1 : 3 });
                buttonContainer.addChild(btnBg);

                // Level number
                const levelText = new Text({
                    text: `${levelNum}`,
                    style: {
                        fontFamily: 'Arial Black',
                        fontSize: 42,
                        fill: isLocked ? 0x666666 : 0xffffff
                    }
                });
                levelText.anchor.set(0.5);
                levelText.y = -15;
                buttonContainer.addChild(levelText);

                // Level name (abbreviated)
                const levelName = levelConfig.name.replace('The ', '').replace(' Thunder', '').replace(' Mayhem', '').replace(' Showdown', '').replace(' Jam', '').replace(' Catastrophe', '').replace(' Territory', '').replace(' Heights', '').replace(' Slalom', '').replace(' Crashdown', '');
                const nameText = new Text({
                    text: levelName,
                    style: {
                        fontFamily: 'Arial',
                        fontSize: 13,
                        fill: isLocked ? 0x555555 : region.accentColor,
                        align: 'center',
                        wordWrap: true,
                        wordWrapWidth: buttonSize - 10
                    }
                });
                nameText.anchor.set(0.5);
                nameText.y = 25;
                buttonContainer.addChild(nameText);

                // Grade display in corner
                if (grade && !isLocked && grade !== 'F') {
                    const gradeText = new Text({
                        text: grade,
                        style: {
                            fontFamily: 'Arial Black',
                            fontSize: 20,
                            fill: this.getGradeColor(grade),
                            stroke: { color: 0x000000, width: 2 }
                        }
                    });
                    gradeText.anchor.set(1, 0);
                    gradeText.x = buttonSize/2 - 8;
                    gradeText.y = -buttonSize/2 + 8;
                    buttonContainer.addChild(gradeText);
                }

                // Stars display at bottom
                if (score > 0 && !isLocked) {
                    const stars = levelManager.levelStars[i];
                    const starContainer = new Container();
                    starContainer.y = buttonSize/2 - 20;

                    for (let s = 0; s < 3; s++) {
                        const star = new Graphics();
                        const filled = s < stars;
                        star.star(0, 0, 5, 8, 4);
                        star.fill({ color: filled ? 0xFFD700 : 0x444444 });
                        star.x = (s - 1) * 18;
                        starContainer.addChild(star);
                    }
                    buttonContainer.addChild(starContainer);
                }

                // Lock icon if locked
                if (isLocked) {
                    const lockIcon = new Text({
                        text: '🔒',
                        style: { fontSize: 28 }
                    });
                    lockIcon.anchor.set(0.5);
                    lockIcon.y = 50;
                    buttonContainer.addChild(lockIcon);
                }

                // Make clickable if unlocked
                if (!isLocked) {
                    buttonContainer.eventMode = 'static';
                    buttonContainer.cursor = 'pointer';
                    buttonContainer.on('pointerdown', () => {
                        this.selectLevel(levelNum);
                    });
                    buttonContainer.on('pointerover', () => {
                        btnBg.tint = 0xcccccc;
                    });
                    buttonContainer.on('pointerout', () => {
                        btnBg.tint = 0xffffff;
                    });
                }

                regionContainer.addChild(buttonContainer);
                this.levelButtons.push(buttonContainer);
            });
        });
    }

    createInfoPanel() {
        // Info panel positioned at left edge
        const infoPanelContainer = new Container();
        infoPanelContainer.x = 50;
        infoPanelContainer.y = 200;

        const panel = new Graphics();
        panel.roundRect(0, 0, 400, 520, 15);
        panel.fill({ color: 0x000000, alpha: 0.8 });
        panel.stroke({ color: 0xCDB87E, width: 2 });
        infoPanelContainer.addChild(panel);

        // Title
        const title = new Text({
            text: 'MISSION BRIEFING',
            style: {
                fontFamily: 'Arial Black',
                fontSize: 22,
                fill: 0xCDB87E
            }
        });
        title.x = 200;
        title.y = 20;
        title.anchor.set(0.5, 0);
        infoPanelContainer.addChild(title);

        // Info text
        this.infoText = new Text({
            text: 'Select a stage to begin your descent!',
            style: {
                fontFamily: 'Arial',
                fontSize: 16,
                fill: 0xffffff,
                wordWrap: true,
                wordWrapWidth: 360,
                lineHeight: 24,
                align: 'left'
            }
        });
        this.infoText.x = 20;
        this.infoText.y = 60;
        this.infoText.anchor.set(0, 0);
        infoPanelContainer.addChild(this.infoText);

        this.container.addChild(infoPanelContainer);
    }

    createNavigationButtons() {
        // Back to Menu button - using the existing Button class format
        const backBtn = new Button(
            'BACK',
            100,
            980,
            200,
            60,
            COLORS.DANGER,
            () => this.game.sceneManager.changeScene('menu')
        );
        this.container.addChild(backBtn.container);
        
        // Play Selected button - using the existing Button class format
        this.playButton = new Button(
            'START MISSION →',
            1570,
            980,
            250,
            60,
            0x44ff44,
            () => this.startSelectedLevel()
        );
        this.playButton.container.visible = false;
        this.container.addChild(this.playButton.container);

        // Total progress display
        this.createProgressDisplay();
    }

    createProgressDisplay() {
        const levelManager = this.game.levelManager;
        const totalStars = levelManager.getTotalStars ? levelManager.getTotalStars() : 0;
        const maxStars = 30; // 3 stars × 10 levels

        const progressContainer = new Container();
        progressContainer.x = 1470;
        progressContainer.y = 200;

        // Background
        const bg = new Graphics();
        bg.roundRect(0, 0, 400, 520, 15);
        bg.fill({ color: 0x000000, alpha: 0.8 });
        bg.stroke({ color: 0xCDB87E, width: 2 });
        progressContainer.addChild(bg);

        // Progress text
        const progressText = new Text({
            text: 'OVERALL PROGRESS',
            style: {
                fontFamily: 'Arial Black',
                fontSize: 22,
                fill: 0xCDB87E
            }
        });
        progressText.x = 200;
        progressText.y = 20;
        progressText.anchor.set(0.5, 0);
        progressContainer.addChild(progressText);

        // Star count
        const starText = new Text({
            text: `⭐ ${totalStars} / ${maxStars}`,
            style: {
                fontFamily: 'Arial Black',
                fontSize: 32,
                fill: 0xffffff
            }
        });
        starText.x = 200;
        starText.y = 70;
        starText.anchor.set(0.5);
        progressContainer.addChild(starText);

        // Progress bar
        const barBg = new Graphics();
        barBg.roundRect(20, 120, 360, 16, 8);
        barBg.fill(0x333333);
        progressContainer.addChild(barBg);

        const barFill = new Graphics();
        const fillWidth = (totalStars / maxStars) * 360;
        if (fillWidth > 0) {
            barFill.roundRect(20, 120, fillWidth, 16, 8);
            barFill.fill(0xCDB87E);
            progressContainer.addChild(barFill);
        }
        
        this.container.addChild(progressContainer);
    }

    setupKeyboardControls() {
        this.game.inputManager.on('keydown', (key) => {
            if (key === 'Escape') {
                this.game.sceneManager.changeScene('menu');
            }

            // Hidden debug: Shift+U to unlock all levels
            if (key === 'KeyU') {
                const isShiftPressed = this.game.inputManager.isKeyDown('ShiftLeft') ||
                                     this.game.inputManager.isKeyDown('ShiftRight');
                if (isShiftPressed) {
                    console.log('Debug: Shift+U detected - Unlocking all levels');
                    this.game.levelManager.unlockAllLevels();
                    this.updateLevelButtons();
                    console.log('All levels unlocked!');
                }
            }

            // Number keys for quick level select
            const num = parseInt(key.replace('Digit', '').replace('Numpad', ''));
            if (num >= 1 && num <= 9) {
                if (num <= this.game.levelManager.unlockedLevels) {
                    this.selectLevel(num);
                }
            } else if (key === 'Digit0' || key === 'Numpad0') {
                if (10 <= this.game.levelManager.unlockedLevels) {
                    this.selectLevel(10);
                }
            }
        });
    }

    showLevelPreview(levelNumber) {
        // Could show a small preview of the level obstacles
        const config = this.game.levelManager.getLevelConfig(levelNumber);
        // Implementation for preview tooltip
    }

    hideLevelPreview() {
        // Hide preview tooltip
    }

    createStatsPanel() {
        // Optional: Add stats panel showing total game progress
        const statsContainer = new Container();
        statsContainer.x = 1470;
        statsContainer.y = 200;
        
        const bg = new Graphics();
        bg.roundRect(0, 0, 400, 500, 15);
        bg.fill({ color: 0x000000, alpha: 0.5 });
        bg.stroke({ color: 0xffffff, width: 1 });
        statsContainer.addChild(bg);
        
        const title = new Text({
            text: 'STATISTICS',
            style: {
                fontFamily: 'Arial Black',
                fontSize: 24,
                fill: 0xffffff
            }
        });
        title.x = 200;
        title.y = 20;
        title.anchor.set(0.5, 0);
        statsContainer.addChild(title);
        
        // Add various stats here
        const statsText = new Text({
            text: this.getStatsText(),
            style: {
                fontFamily: 'Arial',
                fontSize: 16,
                fill: 0xcccccc,
                lineHeight: 24
            }
        });
        statsText.x = 20;
        statsText.y = 60;
        statsContainer.addChild(statsText);
        
        this.container.addChild(statsContainer);
    }

    getStatsText() {
        const levelManager = this.game.levelManager;
        const completedLevels = levelManager.levelScores.filter(s => s > 0).length;
        const totalScore = levelManager.getTotalScore ? levelManager.getTotalScore() : 0;
        const completion = levelManager.getCompletionPercentage ? levelManager.getCompletionPercentage() : 0;
        
        return `Levels Completed: ${completedLevels}/10\n` +
               `Total Score: ${totalScore.toLocaleString()}\n` +
               `Completion: ${completion}%\n` +
               `\nBest Grades:\n` +
               this.getBestGradesText();
    }

    getBestGradesText() {
        const levelManager = this.game.levelManager;
        let text = '';
        const gradeCount = { 'S+': 0, 'S': 0, 'A': 0, 'B': 0, 'C': 0, 'D': 0 };
        
        levelManager.levelGrades.forEach(grade => {
            if (grade && gradeCount[grade] !== undefined) {
                gradeCount[grade]++;
            }
        });
        
        for (const [grade, count] of Object.entries(gradeCount)) {
            if (count > 0) {
                text += `${grade}: ${count} `;
            }
        }
        
        return text || 'None yet';
    }

    // Utility functions
    getGradeColor(grade) {
        const colors = {
            'S': 0xFFD700,  // Gold
            'A': 0x00FF00,  // Green
            'B': 0x00AAFF,  // Blue
            'C': 0xFFFF00,  // Yellow
            'D': 0xFF8800,  // Orange
            'F': 0xFF0000   // Red
        };
        return colors[grade] || 0xFFFFFF;
    }

    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    interpolateColor(color1, color2, factor) {
        const r1 = (color1 >> 16) & 0xff;
        const g1 = (color1 >> 8) & 0xff;
        const b1 = color1 & 0xff;
        
        const r2 = (color2 >> 16) & 0xff;
        const g2 = (color2 >> 8) & 0xff;
        const b2 = color2 & 0xff;
        
        const r = Math.round(r1 + (r2 - r1) * factor);
        const g = Math.round(g1 + (g2 - g1) * factor);
        const b = Math.round(b1 + (b2 - b1) * factor);
        
        return (r << 16) | (g << 8) | b;
    }

    async enter(data = {}) {
            await super.enter(data);
            
            // Check if returning from a completed level
            if (data.justCompleted && data.lastLevel) {
                console.log(`Returned from completing level ${data.lastLevel}`);
                
                // Highlight the completed level
                this.highlightCompletedLevel(data.lastLevel);
                
                // Check if next level was unlocked
                if (this.game.levelManager.isLevelUnlocked(data.lastLevel + 1)) {
                    this.showUnlockedAnimation(data.lastLevel + 1);
                }
            }
            
            // Update all level buttons to reflect current progress
            this.updateLevelButtons();
        }

        updateLevelButtons() {
            const levelManager = this.game.levelManager;

            this.levelButtons.forEach((button, index) => {
                const levelNumber = index + 1;
                const isUnlocked = levelManager.isLevelUnlocked(levelNumber);
                const score = levelManager.levelScores[index];
                const stars = levelManager.levelStars[index];
                const grade = levelManager.levelGrades[index];

                // Update button appearance based on unlock status
                if (isUnlocked) {
                    button.interactive = true;
                    button.eventMode = 'static';
                    button.cursor = 'pointer';
                    button.alpha = 1;

                    // Remove all existing event listeners to avoid duplicates
                    button.removeAllListeners();

                    // Add click handler
                    button.on('pointerdown', () => {
                        this.selectLevel(levelNumber);
                    });

                    // Add hover effects
                    button.on('pointerover', () => {
                        const bgGraphic = button.children[0];
                        if (bgGraphic) bgGraphic.tint = 0xaaaaff;
                    });
                    button.on('pointerout', () => {
                        const bgGraphic = button.children[0];
                        if (bgGraphic) bgGraphic.tint = 0xffffff;
                    });

                    // Show completion status
                    if (score > 0) {
                        // Level has been completed
                        this.addCompletionIndicator(button, stars, grade);
                    }
                } else {
                    // Level is locked
                    button.interactive = false;
                    button.eventMode = 'none';
                    button.cursor = 'default';
                    button.alpha = 0.5;
                    button.removeAllListeners();
                    this.addLockIcon(button);
                }
            });
        }

        highlightCompletedLevel(levelNumber) {
            const button = this.levelButtons[levelNumber - 1];
            if (!button) return;
            
            // Create a glow effect
            const glow = new PIXI.Graphics();
            glow.rect(-5, -5, button.width + 10, button.height + 10);
            glow.stroke({ color: 0x00FF00, width: 3, alpha: 1 });
            button.addChild(glow);
            
            // Animate the glow
            let glowAlpha = 1;
            const glowAnimation = (delta) => {
                glowAlpha -= delta * 0.02;
                glow.alpha = Math.max(0, glowAlpha);
                
                if (glowAlpha <= 0) {
                    this.game.app.ticker.remove(glowAnimation);
                    button.removeChild(glow);
                    glow.destroy();
                }
            };
            this.game.app.ticker.add(glowAnimation);
        }

        showUnlockedAnimation(levelNumber) {
            const button = this.levelButtons[levelNumber - 1];
            if (!button) return;
            
            // Create unlock effect
            const unlockText = new PIXI.Text({
                text: 'UNLOCKED!',
                style: {
                    fontFamily: 'Arial',
                    fontSize: 16,
                    fill: 0xFFD700,
                    fontWeight: 'bold',
                    dropShadow: true,
                    dropShadowDistance: 2
                }
            });
            unlockText.anchor.set(0.5);
            unlockText.x = button.width / 2;
            unlockText.y = -20;
            button.addChild(unlockText);
            
            // Animate the unlock text
            let unlockY = -20;
            const unlockAnimation = (delta) => {
                unlockY -= delta * 0.5;
                unlockText.y = unlockY;
                unlockText.alpha = Math.max(0, 1 + unlockY / 50);
                
                if (unlockText.alpha <= 0) {
                    this.game.app.ticker.remove(unlockAnimation);
                    button.removeChild(unlockText);
                    unlockText.destroy();
                }
            };
            this.game.app.ticker.add(unlockAnimation);
            
            // Also do a scale bounce on the button
            const originalScale = button.scale.x;
            button.scale.set(originalScale * 1.2);
            
            const scaleAnimation = (delta) => {
                const currentScale = button.scale.x;
                const targetScale = originalScale;
                button.scale.set(currentScale + (targetScale - currentScale) * 0.1);
                
                if (Math.abs(currentScale - targetScale) < 0.01) {
                    button.scale.set(targetScale);
                    this.game.app.ticker.remove(scaleAnimation);
                }
            };
            this.game.app.ticker.add(scaleAnimation);
        }

        addCompletionIndicator(button, stars, grade) {
            // Remove any existing indicators
            const existingIndicators = button.children.filter(child => child.isCompletionIndicator);
            existingIndicators.forEach(child => button.removeChild(child));
            
            // Add star display
            const starContainer = new PIXI.Container();
            starContainer.isCompletionIndicator = true;
            starContainer.y = button.height - 25;
            
            for (let i = 0; i < 3; i++) {
                const star = new PIXI.Graphics();
                const filled = i < stars;
                
                star.star(0, 0, 5, 8, 4);
                star.fill({ color: filled ? 0xFFD700 : 0x444444 });
                
                star.x = (button.width / 2) + (i - 1) * 20;
                starContainer.addChild(star);
            }
            button.addChild(starContainer);
            
            // Add grade indicator
            if (grade !== 'F') {
                const gradeText = new PIXI.Text({
                    text: grade,
                    style: {
                        fontFamily: 'Arial',
                        fontSize: 14,
                        fill: this.getGradeColor(grade),
                        fontWeight: 'bold'
                    }
                });
                gradeText.isCompletionIndicator = true;
                gradeText.anchor.set(1, 0);
                gradeText.x = button.width - 5;
                gradeText.y = 5;
                button.addChild(gradeText);
            }
        }

        addLockIcon(button) {
            // Remove any existing lock icons
            const existingLocks = button.children.filter(child => child.isLockIcon);
            existingLocks.forEach(child => button.removeChild(child));
            
            // Create lock icon
            const lock = new Graphics();
            lock.isLockIcon = true;
            
            // Draw simple lock shape
            lock.rect(-10, -5, 20, 15);
            lock.fill({ color: 0x666666 });
            
            // Draw lock shackle
            lock.moveTo(-8, -5);
            lock.arc(0, -5, 8, Math.PI, 0);
            lock.stroke({ color: 0x666666, width: 3 });
            
            lock.x = button.width / 2;
            lock.y = button.height / 2;
            button.addChild(lock);
        }

        selectLevel(levelNumber) {
            this.selectedLevel = levelNumber;
            
            // Update button highlights
            this.levelButtons.forEach((btn, index) => {
                if (index + 1 === levelNumber) {
                    btn.scale.set(1.1);
                    btn.tint = 0xAAFFAA; // Highlight selected
                } else {
                    btn.scale.set(1);
                    btn.tint = 0xFFFFFF; // Normal
                }
            });
            
            // Update info panel with level details
            const config = this.game.levelManager.getLevelConfig(levelNumber);
            const score = this.game.levelManager.levelScores[levelNumber - 1];
            const bestTime = this.game.levelManager.levelBestTimes[levelNumber - 1];

            let infoText = `STAGE ${levelNumber}: ${config.name}\n`;
            infoText += `${config.subtitle} • Target: ${config.targetScore.toLocaleString()}\n`;

            if (score > 0) {
                infoText += `Best: ${score.toLocaleString()} • Time: ${bestTime.toFixed(1)}s`;
            } else {
                infoText += `Not yet completed`;
            }

            this.infoText.text = infoText;

            // Show play button
            this.playButton.container.visible = true;
        }

        startSelectedLevel() {
            if (!this.selectedLevel) return;

            console.log(`Starting level ${this.selectedLevel}`);

            // Check if story should be skipped
            const skipStory = this.game.saveManager.data.settings.skipStory;

            if (skipStory) {
                // Skip directly to game
                this.game.sceneManager.changeScene('game', {
                    levelNumber: this.selectedLevel
                });
            } else {
                // Transition to intro story for the selected level
                this.game.sceneManager.changeScene('story', {
                    levelNumber: this.selectedLevel,
                    isIntro: true, // This is the intro story
                    nextScene: 'game', // After intro, go to game
                    nextData: { levelNumber: this.selectedLevel }
                });
            }
        }
}