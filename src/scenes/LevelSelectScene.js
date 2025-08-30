import { Container, Graphics, Text } from 'pixi.js';
import BaseScene from './BaseScene.js';
import Button from '../ui/Button.js';

export default class LevelSelectScene extends BaseScene {
    constructor(game) {
        super(game);
        this.levelButtons = [];
    }

    async init() {
        await super.init();
        
        // Background
        const bg = new Graphics();
        bg.rect(0, 0, 1920, 1080);
        bg.fill(0x0a0a1f);
        this.container.addChild(bg);

        // Title
        const title = new Text({
            text: 'SELECT STAGE',
            style: {
                fontFamily: 'Arial Black',
                fontSize: 72,
                fill: 0xffffff,
                stroke: { color: 0x000000, width: 5 }
            }
        });
        title.x = 960;
        title.y = 100;
        title.anchor.set(0.5);
        this.container.addChild(title);

        // Create level grid
        this.createLevelGrid();

        // Back button
        const backBtn = new Button({
            text: 'BACK',
            width: 200,
            height: 60,
            onClick: () => this.game.sceneManager.changeScene('menu')
        });
        backBtn.x = 100;
        backBtn.y = 980;
        this.container.addChild(backBtn);

        // Stats panel
        this.createStatsPanel();
    }

    createLevelGrid() {
        const levelManager = this.game.levelManager;
        const cols = 5;
        const rows = 2;
        const buttonSize = 150;
        const spacing = 50;
        const startX = 960 - (cols * (buttonSize + spacing) - spacing) / 2;
        const startY = 300;

        for (let i = 0; i < 10; i++) {
            const col = i % cols;
            const row = Math.floor(i / cols);
            const x = startX + col * (buttonSize + spacing) + buttonSize / 2;
            const y = startY + row * (buttonSize + spacing);

            const levelConfig = levelManager.getLevelConfig(i + 1);
            const isLocked = i + 1 > levelManager.unlockedLevels;
            const grade = levelManager.levelGrades[i];
            const score = levelManager.levelScores[i];

            // Level button container
            const buttonContainer = new Container();
            buttonContainer.x = x;
            buttonContainer.y = y;

            // Button background
            const btnBg = new Graphics();
            btnBg.roundRect(-buttonSize/2, -buttonSize/2, buttonSize, buttonSize, 10);
            btnBg.fill(isLocked ? 0x444444 : 0x2266cc);
            if (!isLocked) {
                btnBg.stroke({ color: 0xffffff, width: 2 });
            }
            buttonContainer.addChild(btnBg);

            // Level number
            const levelText = new Text({
                text: `${i + 1}`,
                style: {
                    fontFamily: 'Arial Black',
                    fontSize: 48,
                    fill: isLocked ? 0x888888 : 0xffffff
                }
            });
            levelText.anchor.set(0.5);
            levelText.y = -20;
            buttonContainer.addChild(levelText);

            // Level name
            const nameText = new Text({
                text: levelConfig.name.split(' ').slice(0, 2).join('\n'),
                style: {
                    fontFamily: 'Arial',
                    fontSize: 14,
                    fill: isLocked ? 0x666666 : 0xcccccc,
                    align: 'center',
                    wordWrap: true,
                    wordWrapWidth: buttonSize - 20
                }
            });
            nameText.anchor.set(0.5);
            nameText.y = 20;
            buttonContainer.addChild(nameText);

            // Grade display
            if (grade && !isLocked) {
                const gradeText = new Text({
                    text: grade,
                    style: {
                        fontFamily: 'Arial Black',
                        fontSize: 24,
                        fill: this.getGradeColor(grade),
                        stroke: { color: 0x000000, width: 2 }
                    }
                });
                gradeText.anchor.set(0.5);
                gradeText.x = buttonSize/2 - 20;
                gradeText.y = -buttonSize/2 + 20;
                buttonContainer.addChild(gradeText);
            }

            // Lock icon if locked
            if (isLocked) {
                const lockIcon = new Text({
                    text: '🔒',
                    style: { fontSize: 32 }
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
                    this.selectLevel(i + 1);
                });
                buttonContainer.on('pointerover', () => {
                    btnBg.tint = 0xaaaaff;
                });
                buttonContainer.on('pointerout', () => {
                    btnBg.tint = 0xffffff;
                });
            }

            this.container.addChild(buttonContainer);
            this.levelButtons.push(buttonContainer);
        }
    }

    createStatsPanel() {
        const levelManager = this.game.levelManager;
        
        // Stats background
        const statsBg = new Graphics();
        statsBg.roundRect(1420, 300, 400, 400, 15);
        statsBg.fill(0x1a1a2e);
        statsBg.stroke({ color: 0x4488ff, width: 2 });
        this.container.addChild(statsBg);

        // Stats title
        const statsTitle = new Text({
            text: 'PROGRESS',
            style: {
                fontFamily: 'Arial Black',
                fontSize: 32,
                fill: 0xffffff
            }
        });
        statsTitle.x = 1620;
        statsTitle.y = 320;
        statsTitle.anchor.set(0.5, 0);
        this.container.addChild(statsTitle);

        // Completion percentage
        const completion = new Text({
            text: `Completion: ${levelManager.getCompletionPercentage()}%`,
            style: {
                fontFamily: 'Arial',
                fontSize: 24,
                fill: 0xcccccc
            }
        });
        completion.x = 1620;
        completion.y = 380;
        completion.anchor.set(0.5, 0);
        this.container.addChild(completion);

        // Total score
        const totalScore = new Text({
            text: `Total Score: ${levelManager.getTotalScore().toLocaleString()}`,
            style: {
                fontFamily: 'Arial',
                fontSize: 24,
                fill: 0xcccccc
            }
        });
        totalScore.x = 1620;
        totalScore.y = 420;
        totalScore.anchor.set(0.5, 0);
        this.container.addChild(totalScore);

        // Best grades count
        const gradeCount = {
            'S+': 0, 'S': 0, 'A': 0, 'B': 0, 'C': 0, 'D': 0
        };
        levelManager.levelGrades.forEach(grade => {
            if (grade && gradeCount.hasOwnProperty(grade)) {
                gradeCount[grade]++;
            }
        });

        let yPos = 480;
        Object.entries(gradeCount).forEach(([grade, count]) => {
            if (count > 0) {
                const gradeText = new Text({
                    text: `${grade} Ranks: ${count}`,
                    style: {
                        fontFamily: 'Arial',
                        fontSize: 20,
                        fill: this.getGradeColor(grade)
                    }
                });
                gradeText.x = 1620;
                gradeText.y = yPos;
                gradeText.anchor.set(0.5, 0);
                this.container.addChild(gradeText);
                yPos += 30;
            }
        });
    }

    getGradeColor(grade) {
        const colors = {
            'S+': 0xffff00,
            'S': 0xffd700,
            'A': 0x00ff00,
            'B': 0x00ccff,
            'C': 0xffaa00,
            'D': 0xff6600,
            'F': 0xff0000
        };
        return colors[grade] || 0xffffff;
    }

    selectLevel(levelNumber) {
        this.game.levelManager.startLevel(levelNumber);
        // Show intro story for the level
        this.game.sceneManager.changeScene('story', { 
            level: levelNumber,
            isIntro: true 
        });
    }

    update(deltaTime) {
        super.update(deltaTime);
    }
}