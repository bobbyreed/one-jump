import { Container, Graphics, Text } from 'pixi.js';
import BaseScene from './BaseScene.js';
import Button from '../ui/Button.js';
import { UI, COLORS } from '../config/Constants.js';

export default class LeaderboardScene extends BaseScene {
    constructor(game) {
        super(game);
        this.currentView = 'global'; // 'global' or 'level1'-'level10'
        this.leaderboardData = [];
        this.leaderboardContainer = null;
        this.loadingText = null;
        this.refreshButton = null;
    }

    async init() {
        await super.init();

        // Create background
        this.createBackground();

        // Create title
        this.createTitle();

        // Create tab navigation
        this.createTabs();

        // Create leaderboard container
        this.leaderboardContainer = new Container();
        this.leaderboardContainer.x = 100;
        this.leaderboardContainer.y = 300;
        this.container.addChild(this.leaderboardContainer);

        // Create loading indicator
        this.createLoadingIndicator();

        // Create navigation buttons
        this.createNavigationButtons();

        // Load initial leaderboard
        await this.loadLeaderboard('global');
    }

    createBackground() {
        const bg = new Graphics();

        // Gradient background
        const gradientSteps = 10;
        for (let i = 0; i < gradientSteps; i++) {
            const y = (1080 / gradientSteps) * i;
            const height = 1080 / gradientSteps;
            const color = this.interpolateColor(0x001a33, 0x003366, i / gradientSteps);

            bg.rect(0, y, 1920, height);
            bg.fill(color);
        }

        this.container.addChild(bg);
    }

    createTitle() {
        const title = new Text({
            text: 'LEADERBOARDS',
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

        // Subtitle showing current view
        this.subtitle = new Text({
            text: 'Global Rankings',
            style: {
                fontFamily: 'Arial',
                fontSize: 24,
                fill: 0xCDB87E,
                letterSpacing: 2
            }
        });
        this.subtitle.x = 960;
        this.subtitle.y = 140;
        this.subtitle.anchor.set(0.5);
        this.container.addChild(this.subtitle);
    }

    createTabs() {
        const tabContainer = new Container();
        tabContainer.x = 100;
        tabContainer.y = 200;

        const tabs = [
            { id: 'global', label: 'GLOBAL' },
            { id: 'level1', label: 'LVL 1' },
            { id: 'level2', label: 'LVL 2' },
            { id: 'level3', label: 'LVL 3' },
            { id: 'level4', label: 'LVL 4' },
            { id: 'level5', label: 'LVL 5' },
            { id: 'level6', label: 'LVL 6' },
            { id: 'level7', label: 'LVL 7' },
            { id: 'level8', label: 'LVL 8' },
            { id: 'level9', label: 'LVL 9' },
            { id: 'level10', label: 'LVL 10' }
        ];

        const tabWidth = 145;
        const tabHeight = 50;
        const tabSpacing = 10;

        tabs.forEach((tab, index) => {
            const x = index * (tabWidth + tabSpacing);

            const tabBg = new Graphics();
            tabBg.roundRect(0, 0, tabWidth, tabHeight, 5);
            tabBg.fill({ color: tab.id === this.currentView ? 0x4488ff : 0x333366 });

            const tabText = new Text({
                text: tab.label,
                style: {
                    fontFamily: 'Arial',
                    fontSize: 18,
                    fill: 0xffffff,
                    fontWeight: 'bold'
                }
            });
            tabText.anchor.set(0.5);
            tabText.x = tabWidth / 2;
            tabText.y = tabHeight / 2;

            const tabButton = new Container();
            tabButton.x = x;
            tabButton.addChild(tabBg);
            tabButton.addChild(tabText);

            tabButton.eventMode = 'static';
            tabButton.cursor = 'pointer';
            tabButton.on('pointerdown', () => this.switchView(tab.id));
            tabButton.on('pointerover', () => {
                if (tab.id !== this.currentView) {
                    tabBg.tint = 0xaaaaff;
                }
            });
            tabButton.on('pointerout', () => {
                tabBg.tint = 0xffffff;
            });

            // Store reference for updating active state
            tabButton.userData = { tab, tabBg };
            tabContainer.addChild(tabButton);
        });

        this.tabContainer = tabContainer;
        this.container.addChild(tabContainer);
    }

    createLoadingIndicator() {
        this.loadingText = new Text({
            text: 'Loading...',
            style: {
                fontFamily: 'Arial',
                fontSize: 32,
                fill: 0xffffff
            }
        });
        this.loadingText.anchor.set(0.5);
        this.loadingText.x = 960;
        this.loadingText.y = 540;
        this.loadingText.visible = false;
        this.container.addChild(this.loadingText);
    }

    createNavigationButtons() {
        // Back button
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

        // Refresh button
        this.refreshButton = new Button(
            'REFRESH',
            1620,
            980,
            200,
            60,
            COLORS.SUCCESS,
            () => this.refreshLeaderboard()
        );
        this.container.addChild(this.refreshButton.container);
    }

    async switchView(viewId) {
        this.currentView = viewId;

        // Update tab appearance
        this.tabContainer.children.forEach(tabButton => {
            const { tab, tabBg } = tabButton.userData;
            tabBg.clear();
            tabBg.roundRect(0, 0, 145, 50, 5);
            tabBg.fill({ color: tab.id === viewId ? 0x4488ff : 0x333366 });
        });

        // Update subtitle
        if (viewId === 'global') {
            this.subtitle.text = 'Global Rankings - Total Score';
        } else {
            const levelNum = parseInt(viewId.replace('level', ''));
            this.subtitle.text = `Level ${levelNum} Rankings`;
        }

        // Load leaderboard
        await this.loadLeaderboard(viewId);
    }

    async loadLeaderboard(viewId) {
        this.showLoading(true);

        try {
            if (viewId === 'global') {
                this.leaderboardData = await this.game.leaderboardManager.getGlobalLeaderboard(10);
            } else {
                const levelNum = parseInt(viewId.replace('level', ''));
                this.leaderboardData = await this.game.leaderboardManager.getLevelLeaderboard(levelNum, 10);
            }

            this.displayLeaderboard();
        } catch (error) {
            console.error('Error loading leaderboard:', error);
            this.displayError();
        } finally {
            this.showLoading(false);
        }
    }

    async refreshLeaderboard() {
        this.game.leaderboardManager.clearCache();
        await this.loadLeaderboard(this.currentView);
    }

    displayLeaderboard() {
        // Clear existing leaderboard
        this.leaderboardContainer.removeChildren();

        if (this.leaderboardData.length === 0) {
            const emptyText = new Text({
                text: 'No scores yet. Be the first!',
                style: {
                    fontFamily: 'Arial',
                    fontSize: 28,
                    fill: 0xcccccc
                }
            });
            emptyText.anchor.set(0, 0.5);
            emptyText.x = 60;
            emptyText.y = 200;
            this.leaderboardContainer.addChild(emptyText);
            return;
        }

        // Create header
        this.createLeaderboardHeader();

        // Create scrollable content
        const scrollContainer = new Container();
        scrollContainer.y = 60;

        const rowHeight = 50;
        const currentUserId = this.game.firebaseManager.getUserId();

        this.leaderboardData.forEach((entry, index) => {
            const y = index * rowHeight;
            const isCurrentUser = entry.userId === currentUserId;

            // Row background
            const rowBg = new Graphics();
            rowBg.rect(0, y, 1720, rowHeight - 5);
            rowBg.fill({ color: isCurrentUser ? 0x444488 : (index % 2 === 0 ? 0x222233 : 0x2a2a3a), alpha: 0.8 });
            scrollContainer.addChild(rowBg);

            // Rank
            const rankText = new Text({
                text: `#${entry.rank}`,
                style: {
                    fontFamily: 'Arial Black',
                    fontSize: 20,
                    fill: entry.rank <= 3 ? 0xFFD700 : 0xffffff,
                    fontWeight: 'bold'
                }
            });
            rankText.x = 30;
            rankText.y = y + 15;
            scrollContainer.addChild(rankText);

            // Username
            const usernameText = new Text({
                text: entry.username || 'Anonymous',
                style: {
                    fontFamily: 'Arial',
                    fontSize: 18,
                    fill: isCurrentUser ? 0x88ff88 : 0xffffff,
                    fontWeight: isCurrentUser ? 'bold' : 'normal'
                }
            });
            usernameText.x = 150;
            usernameText.y = y + 15;
            scrollContainer.addChild(usernameText);

            // Score/Stats
            if (this.currentView === 'global') {
                // Global view: total score
                const scoreText = new Text({
                    text: entry.totalScore.toLocaleString(),
                    style: {
                        fontFamily: 'Arial Black',
                        fontSize: 22,
                        fill: 0xFFD700
                    }
                });
                scoreText.anchor.set(1, 0);
                scoreText.x = 1400;
                scoreText.y = y + 12;
                scrollContainer.addChild(scoreText);

                // Levels completed
                const levelsText = new Text({
                    text: `${entry.levelsCompleted}/10`,
                    style: {
                        fontFamily: 'Arial',
                        fontSize: 16,
                        fill: 0xcccccc
                    }
                });
                levelsText.anchor.set(1, 0);
                levelsText.x = 1550;
                levelsText.y = y + 15;
                scrollContainer.addChild(levelsText);

                // Stars
                const starsText = new Text({
                    text: `⭐${entry.totalStars}`,
                    style: {
                        fontFamily: 'Arial',
                        fontSize: 16,
                        fill: 0xffffff
                    }
                });
                starsText.anchor.set(1, 0);
                starsText.x = 1680;
                starsText.y = y + 15;
                scrollContainer.addChild(starsText);
            } else {
                // Level view: score, grade, time
                const scoreText = new Text({
                    text: entry.score.toLocaleString(),
                    style: {
                        fontFamily: 'Arial Black',
                        fontSize: 22,
                        fill: 0xFFD700
                    }
                });
                scoreText.anchor.set(1, 0);
                scoreText.x = 1300;
                scoreText.y = y + 12;
                scrollContainer.addChild(scoreText);

                // Grade
                const gradeText = new Text({
                    text: entry.grade,
                    style: {
                        fontFamily: 'Arial Black',
                        fontSize: 20,
                        fill: this.getGradeColor(entry.grade)
                    }
                });
                gradeText.anchor.set(0.5, 0);
                gradeText.x = 1420;
                gradeText.y = y + 12;
                scrollContainer.addChild(gradeText);

                // Time
                const timeText = new Text({
                    text: `${entry.time.toFixed(1)}s`,
                    style: {
                        fontFamily: 'Arial',
                        fontSize: 16,
                        fill: 0xcccccc
                    }
                });
                timeText.anchor.set(1, 0);
                timeText.x = 1580;
                timeText.y = y + 15;
                scrollContainer.addChild(timeText);

                // Stars
                const starsText = new Text({
                    text: `⭐${entry.stars}`,
                    style: {
                        fontFamily: 'Arial',
                        fontSize: 16,
                        fill: 0xffffff
                    }
                });
                starsText.anchor.set(1, 0);
                starsText.x = 1680;
                starsText.y = y + 15;
                scrollContainer.addChild(starsText);
            }
        });

        this.leaderboardContainer.addChild(scrollContainer);
    }

    createLeaderboardHeader() {
        const headerBg = new Graphics();
        headerBg.rect(0, 0, 1720, 50);
        headerBg.fill({ color: 0x1a1a2e, alpha: 0.9 });
        this.leaderboardContainer.addChild(headerBg);

        const headerStyle = {
            fontFamily: 'Arial Black',
            fontSize: 16,
            fill: 0xCDB87E
        };

        // Rank header
        const rankHeader = new Text({ text: 'RANK', style: headerStyle });
        rankHeader.x = 30;
        rankHeader.y = 17;
        this.leaderboardContainer.addChild(rankHeader);

        // Username header
        const nameHeader = new Text({ text: 'PLAYER', style: headerStyle });
        nameHeader.x = 150;
        nameHeader.y = 17;
        this.leaderboardContainer.addChild(nameHeader);

        if (this.currentView === 'global') {
            // Global headers
            const scoreHeader = new Text({ text: 'TOTAL SCORE', style: headerStyle });
            scoreHeader.anchor.set(1, 0);
            scoreHeader.x = 1400;
            scoreHeader.y = 17;
            this.leaderboardContainer.addChild(scoreHeader);

            const levelsHeader = new Text({ text: 'LEVELS', style: headerStyle });
            levelsHeader.anchor.set(1, 0);
            levelsHeader.x = 1550;
            levelsHeader.y = 17;
            this.leaderboardContainer.addChild(levelsHeader);

            const starsHeader = new Text({ text: 'STARS', style: headerStyle });
            starsHeader.anchor.set(1, 0);
            starsHeader.x = 1680;
            starsHeader.y = 17;
            this.leaderboardContainer.addChild(starsHeader);
        } else {
            // Level headers
            const scoreHeader = new Text({ text: 'SCORE', style: headerStyle });
            scoreHeader.anchor.set(1, 0);
            scoreHeader.x = 1300;
            scoreHeader.y = 17;
            this.leaderboardContainer.addChild(scoreHeader);

            const gradeHeader = new Text({ text: 'GRADE', style: headerStyle });
            gradeHeader.anchor.set(0.5, 0);
            gradeHeader.x = 1420;
            gradeHeader.y = 17;
            this.leaderboardContainer.addChild(gradeHeader);

            const timeHeader = new Text({ text: 'TIME', style: headerStyle });
            timeHeader.anchor.set(1, 0);
            timeHeader.x = 1580;
            timeHeader.y = 17;
            this.leaderboardContainer.addChild(timeHeader);

            const starsHeader = new Text({ text: 'STARS', style: headerStyle });
            starsHeader.anchor.set(1, 0);
            starsHeader.x = 1680;
            starsHeader.y = 17;
            this.leaderboardContainer.addChild(starsHeader);
        }
    }

    displayError() {
        this.leaderboardContainer.removeChildren();

        const errorText = new Text({
            text: 'Failed to load leaderboard.\nCheck your connection and try again.',
            style: {
                fontFamily: 'Arial',
                fontSize: 24,
                fill: 0xff4444,
                align: 'center'
            }
        });
        errorText.anchor.set(0, 0.5);
        errorText.x = 60;
        errorText.y = 200;
        this.leaderboardContainer.addChild(errorText);
    }

    showLoading(visible) {
        if (this.loadingText) {
            this.loadingText.visible = visible;
        }
    }

    getGradeColor(grade) {
        const colors = {
            'S': 0xFFD700,
            'A': 0x00FF00,
            'B': 0x00AAFF,
            'C': 0xFFFF00,
            'D': 0xFF8800,
            'F': 0xFF0000
        };
        return colors[grade] || 0xffffff;
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
        // Refresh leaderboard when entering scene
        await this.loadLeaderboard(this.currentView);
    }
}
