import { Container, Graphics, Text, Sprite } from 'pixi.js';
import BaseScene from './BaseScene.js';
import Button from '../ui/Button.js';

export default class LevelSelectScene extends BaseScene {
    constructor(game) {
        super(game);
        this.levelButtons = [];
        this.selectedLevel = null;
        this.levelPreviews = new Map();
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
        const gridContainer = new Container();
        gridContainer.x = 960;
        gridContainer.y = 450;
        
        const cols = 5;
        const rows = 2;
        const buttonWidth = 280;
        const buttonHeight = 160;
        const spacing = 30;
        
        const totalWidth = cols * buttonWidth + (cols - 1) * spacing;
        const totalHeight = rows * buttonHeight + (rows - 1) * spacing;
        
        for (let i = 0; i < 10; i++) {
            const col = i % cols;
            const row = Math.floor(i / cols);
            const x = col * (buttonWidth + spacing) - totalWidth / 2 + buttonWidth / 2;
            const y = row * (buttonHeight + spacing) - totalHeight / 2 + buttonHeight / 2;
            
            const levelButton = this.createLevelButton(i + 1, x, y, buttonWidth, buttonHeight);
            gridContainer.addChild(levelButton);
            this.levelButtons.push(levelButton);
        }
        
        this.container.addChild(gridContainer);
    }

    createLevelButton(levelNumber, x, y, width, height) {
        const levelManager = this.game.levelManager;
        const levelConfig = levelManager.getLevelConfig(levelNumber);
        const isLocked = levelNumber > levelManager.unlockedLevels;
        const score = levelManager.levelScores[levelNumber - 1];
        const grade = levelManager.levelGrades[levelNumber - 1];
        const bestTime = levelManager.levelBestTimes[levelNumber - 1];
        
        const buttonContainer = new Container();
        buttonContainer.x = x;
        buttonContainer.y = y;
        buttonContainer.levelNumber = levelNumber;
        
        // Card background with gradient
        const cardBg = new Graphics();
        const baseColor = isLocked ? 0x444444 : this.getLevelColor(levelNumber);
        
        // Create card with rounded corners
        cardBg.roundRect(-width/2, -height/2, width, height, 15);
        cardBg.fill({ color: baseColor, alpha: isLocked ? 0.3 : 0.9 });
        
        // Add border
        cardBg.stroke({
            color: isLocked ? 0x666666 : 0xffffff,
            width: isLocked ? 1 : 3,
            alpha: isLocked ? 0.5 : 0.8
        });
        
        buttonContainer.addChild(cardBg);
        
        // Level number badge
        const badge = new Graphics();
        badge.circle(-width/2 + 30, -height/2 + 30, 25);
        badge.fill(isLocked ? 0x333333 : 0xffffff);
        badge.stroke({ color: 0x000000, width: 2 });
        buttonContainer.addChild(badge);
        
        const levelNum = new Text({
            text: levelNumber.toString(),
            style: {
                fontFamily: 'Arial Black',
                fontSize: 24,
                fill: isLocked ? 0x999999 : 0x000000
            }
        });
        levelNum.anchor.set(0.5);
        levelNum.x = -width/2 + 30;
        levelNum.y = -height/2 + 30;
        buttonContainer.addChild(levelNum);
        
        // Level name
        const levelName = new Text({
            text: levelConfig.name,
            style: {
                fontFamily: 'Arial Black',
                fontSize: 20,
                fill: isLocked ? 0x999999 : 0xffffff,
                wordWrap: true,
                wordWrapWidth: width - 40,
                align: 'center'
            }
        });
        levelName.anchor.set(0.5, 0);
        levelName.y = -height/2 + 10;
        buttonContainer.addChild(levelName);
        
        // Subtitle
        const subtitle = new Text({
            text: levelConfig.subtitle,
            style: {
                fontFamily: 'Arial',
                fontSize: 14,
                fill: isLocked ? 0x666666 : 0xCDB87E,
                fontStyle: 'italic'
            }
        });
        subtitle.anchor.set(0.5, 0);
        subtitle.y = -height/2 + 40;
        buttonContainer.addChild(subtitle);
        
        if (!isLocked) {
            // Grade display
            if (grade) {
                const gradeBadge = new Graphics();
                gradeBadge.roundRect(width/2 - 60, -height/2 + 10, 50, 50, 10);
                gradeBadge.fill(this.getGradeColor(grade));
                gradeBadge.stroke({ color: 0xffffff, width: 2 });
                buttonContainer.addChild(gradeBadge);
                
                const gradeText = new Text({
                    text: grade,
                    style: {
                        fontFamily: 'Arial Black',
                        fontSize: 28,
                        fill: 0xffffff,
                        stroke: { color: 0x000000, width: 2 }
                    }
                });
                gradeText.anchor.set(0.5);
                gradeText.x = width/2 - 35;
                gradeText.y = -height/2 + 35;
                buttonContainer.addChild(gradeText);
            }
            
            // Score display
            if (score > 0) {
                const scoreText = new Text({
                    text: `Best: ${score.toLocaleString()}`,
                    style: {
                        fontFamily: 'Arial',
                        fontSize: 16,
                        fill: 0xffffff
                    }
                });
                scoreText.anchor.set(0.5);
                scoreText.y = height/2 - 40;
                buttonContainer.addChild(scoreText);
            }
            
            // Time display
            if (bestTime < Infinity) {
                const timeText = new Text({
                    text: `Time: ${this.formatTime(bestTime)}`,
                    style: {
                        fontFamily: 'Arial',
                        fontSize: 14,
                        fill: 0xaaaaaa
                    }
                });
                timeText.anchor.set(0.5);
                timeText.y = height/2 - 20;
                buttonContainer.addChild(timeText);
            }
            
            // Progress stars
            this.addProgressStars(buttonContainer, levelNumber, width, height);
            
            // Make interactive
            buttonContainer.eventMode = 'static';
            buttonContainer.cursor = 'pointer';
            
            // Hover effects
            buttonContainer.on('pointerover', () => {
                cardBg.tint = 0xddddff;
                buttonContainer.scale.set(1.05);
                this.showLevelPreview(levelNumber);
            });
            
            buttonContainer.on('pointerout', () => {
                cardBg.tint = 0xffffff;
                buttonContainer.scale.set(1);
                this.hideLevelPreview();
            });
            
            buttonContainer.on('pointerdown', () => {
                this.selectLevel(levelNumber);
            });
            
        } else {
            // Lock icon
            const lockIcon = new Text({
                text: '🔒',
                style: { fontSize: 48 }
            });
            lockIcon.anchor.set(0.5);
            lockIcon.y = 20;
            buttonContainer.addChild(lockIcon);
            
            // Unlock requirement
            const unlockText = new Text({
                text: `Complete Stage ${levelNumber - 1}`,
                style: {
                    fontFamily: 'Arial',
                    fontSize: 12,
                    fill: 0x999999
                }
            });
            unlockText.anchor.set(0.5);
            unlockText.y = height/2 - 20;
            buttonContainer.addChild(unlockText);
        }
        
        return buttonContainer;
    }

    addProgressStars(container, levelNumber, width, height) {
        const levelManager = this.game.levelManager;
        const config = levelManager.getLevelConfig(levelNumber);
        const score = levelManager.levelScores[levelNumber - 1];
        
        // Calculate stars earned (0-3)
        let stars = 0;
        if (score > 0) stars = 1;
        if (score >= config.targetScore * 0.75) stars = 2;
        if (score >= config.targetScore) stars = 3;
        
        const starContainer = new Container();
        starContainer.y = 0;
        
        for (let i = 0; i < 3; i++) {
            const star = new Text({
                text: i < stars ? '⭐' : '☆',
                style: { fontSize: 20 }
            });
            star.x = (i - 1) * 25;
            star.anchor.set(0.5);
            starContainer.addChild(star);
        }
        
        container.addChild(starContainer);
    }

    createInfoPanel() {
        const panel = new Graphics();
        panel.roundRect(50, 750, 400, 280, 15);
        panel.fill({ color: 0x000000, alpha: 0.7 });
        panel.stroke({ color: 0xCDB87E, width: 2 });
        this.container.addChild(panel);
        
        // Title
        const title = new Text({
            text: 'MISSION BRIEFING',
            style: {
                fontFamily: 'Arial Black',
                fontSize: 24,
                fill: 0xCDB87E
            }
        });
        title.x = 250;
        title.y = 770;
        title.anchor.set(0.5, 0);
        this.container.addChild(title);
        
        // Info text
        this.infoText = new Text({
            text: 'Select a stage to begin your descent!\n\nEarn stars by reaching score targets.\nUnlock new stages by completing previous ones.',
            style: {
                fontFamily: 'Arial',
                fontSize: 16,
                fill: 0xffffff,
                wordWrap: true,
                wordWrapWidth: 360,
                lineHeight: 24
            }
        });
        this.infoText.x = 70;
        this.infoText.y = 810;
        this.container.addChild(this.infoText);
    }

    createNavigationButtons() {
        // Back to Menu button
        const backBtn = new Button({
            text: '← MENU',
            width: 150,
            height: 60,
            onClick: () => this.game.sceneManager.changeScene('menu')
        });
        backBtn.x = 100;
        backBtn.y = 50;
        this.container.addChild(backBtn);
        
        // Play Selected button
        this.playButton = new Button({
            text: 'START MISSION →',
            width: 250,
            height: 70,
            onClick: () => this.startSelectedLevel(),
            style: {
                fill: 0x44ff44,
                stroke: 0x00ff00
            }
        });
        this.playButton.x = 1570;
        this.playButton.y = 900;
        this.playButton.visible = false;
        this.container.addChild(this.playButton);
        
        // Total progress display
        this.createProgressDisplay();
    }

    createProgressDisplay() {
        const levelManager = this.game.levelManager;
        const totalStars = levelManager.getTotalStars();
        const maxStars = 30; // 3 stars × 10 levels
        
        const progressContainer = new Container();
        progressContainer.x = 1470;
        progressContainer.y = 780;
        
        // Background
        const bg = new Graphics();
        bg.roundRect(0, 0, 400, 100, 15);
        bg.fill({ color: 0x000000, alpha: 0.7 });
        bg.stroke({ color: 0xCDB87E, width: 2 });
        progressContainer.addChild(bg);
        
        // Progress text
        const progressText = new Text({
            text: 'OVERALL PROGRESS',
            style: {
                fontFamily: 'Arial Black',
                fontSize: 18,
                fill: 0xCDB87E
            }
        });
        progressText.x = 200;
        progressText.y = 20;
        progressText.anchor.set(0.5);
        progressContainer.addChild(progressText);
        
        // Star count
        const starText = new Text({
            text: `⭐ ${totalStars} / ${maxStars}`,
            style: {
                fontFamily: 'Arial Black',
                fontSize: 24,
                fill: 0xffffff
            }
        });
        starText.x = 200;
        starText.y = 50;
        starText.anchor.set(0.5);
        progressContainer.addChild(starText);
        
        // Progress bar
        const barBg = new Graphics();
        barBg.roundRect(20, 70, 360, 10, 5);
        barBg.fill(0x333333);
        progressContainer.addChild(barBg);
        
        const barFill = new Graphics();
        const fillWidth = (totalStars / maxStars) * 360;
        if (fillWidth > 0) {
            barFill.roundRect(20, 70, fillWidth, 10, 5);
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

    selectLevel(levelNumber) {
        this.selectedLevel = levelNumber;
        
        // Update button highlights
        this.levelButtons.forEach(btn => {
            if (btn.levelNumber === levelNumber) {
                btn.scale.set(1.1);
                btn.children[0].tint = 0xaaffaa; // Highlight selected
            } else {
                btn.scale.set(1);
                btn.children[0].tint = 0xffffff;
            }
        });
        
        // Update info panel
        const config = this.game.levelManager.getLevelConfig(levelNumber);
        this.infoText.text = `STAGE ${levelNumber}: ${config.name}\n\n${config.subtitle}\n\nTarget Score: ${config.targetScore.toLocaleString()}\nDuration: ${config.duration} seconds`;
        
        // Show play button
        this.playButton.visible = true;
    }

    startSelectedLevel() {
        if (!this.selectedLevel) return;
        
        // Show story intro for the level
        this.game.sceneManager.changeScene('story', {
            levelNumber: this.selectedLevel,
            isIntro: true,
            nextScene: 'game',
            nextData: { levelNumber: this.selectedLevel }
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

    // Utility functions
    getLevelColor(levelNumber) {
        const colors = [
            0x000428, // Space
            0x004e92, // Upper atmosphere
            0x0066cc, // Sky
            0x3399ff, // Clouds
            0x66ccff, // Lower clouds
            0x99ddff, // Mist
            0xaaeeff, // Clear sky
            0x87ceeb, // Day sky
            0x4169e1, // Royal blue
            0x228b22  // Campus green
        ];
        return colors[levelNumber - 1] || 0x4444ff;
    }

    getGradeColor(grade) {
        const colors = {
            'S+': 0xffd700,
            'S': 0xffaa00,
            'A': 0x44ff44,
            'B': 0x4444ff,
            'C': 0xffff44,
            'D': 0xff4444
        };
        return colors[grade] || 0xffffff;
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
        
        // Refresh the display with latest progress
        this.container.removeChildren();
        await this.init();
        
        // Auto-select last played level if coming back from game
        if (data.lastLevel) {
            this.selectLevel(data.lastLevel);
        }
    }
}