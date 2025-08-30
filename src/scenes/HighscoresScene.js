import { Graphics, Text, Container } from 'pixi.js';
import BaseScene from './BaseScene.js';
import Button from '../ui/Button.js';
import { COLORS } from '../config/Constants.js';

export default class HighscoresScene extends BaseScene {
  constructor(game) {
    super(game);
    this.scoresList = null;
    this.backButton = null;
  }

  async init() {
    await super.init();

    // Background
    const bg = new Graphics()
      .rect(0, 0, this.game.app.screen.width, this.game.app.screen.height)
      .fill({ color: COLORS.BACKGROUND });
    this.container.addChild(bg);

    // Title
    const title = new Text({
      text: 'HIGHSCORES',
      style: {
        fontFamily: 'Arial Black, sans-serif',
        fontSize: 48,
        fill: COLORS.TEXT_PRIMARY,
        fontWeight: 'bold',
        dropShadow: true,
        dropShadowColor: 0x000000,
        dropShadowDistance: 4
      }
    });
    title.anchor.set(0.5);
    title.x = this.game.app.screen.width / 2;
    title.y = 80;
    this.container.addChild(title);

    // Create scores container
    this.createScoresList();

    // Back button
    this.backButton = new Button(
      'BACK TO MENU',
      (this.game.app.screen.width - 300) / 2,
      this.game.app.screen.height - 150,
      300,
      60,
      COLORS.DANGER,
      () => this.changeScene('menu')
    );
    this.container.addChild(this.backButton.container);
  }

  createScoresList() {
    const scoresContainer = new Container();

    // Get save data
    const saveData = this.game.saveManager.data;

    // Display current stats
    const statsText = new Text({
      text: this.formatStats(saveData),
      style: {
        fontFamily: 'Arial',
        fontSize: 24,
        fill: COLORS.TEXT_PRIMARY,
        align: 'center',
        lineHeight: 32
      }
    });
    statsText.anchor.set(0.5);
    statsText.x = this.game.app.screen.width / 2;
    statsText.y = this.game.app.screen.height / 2 - 50;
    scoresContainer.addChild(statsText);

    // If we have stage scores, display them
    if (saveData.stageProgress && saveData.stageProgress.stageScores) {
      const stageScoresText = this.createStageScoresDisplay(saveData.stageProgress);
      stageScoresText.x = this.game.app.screen.width / 2;
      stageScoresText.y = this.game.app.screen.height / 2 + 100;
      scoresContainer.addChild(stageScoresText);
    }

    this.container.addChild(scoresContainer);
    this.scoresList = scoresContainer;
  }

  formatStats(data) {
    const stats = [];

    stats.push(`🏆 Best Score: ${data.highScore || 0}`);
    stats.push('');
    stats.push('📊 Statistics:');
    stats.push(`Games Played: ${data.gamesPlayed || 0}`);
    stats.push(`Total Distance: ${data.totalDistance || 0}m`);

    if (data.statistics) {
      stats.push('');
      stats.push('🎯 Landing Accuracy:');
      stats.push(`Perfect: ${data.statistics.perfectLandings || 0}`);
      stats.push(`Great: ${data.statistics.greatLandings || 0}`);
      stats.push(`Good: ${data.statistics.goodLandings || 0}`);
      stats.push(`Crashes: ${data.statistics.crashes || 0}`);

      if (data.statistics.maxCombo > 0) {
        stats.push('');
        stats.push(`Max Combo: x${data.statistics.maxCombo}`);
      }
    }

    return stats.join('\n');
  }

  createStageScoresDisplay(stageProgress) {
    const scores = [];
    let hasScores = false;

    for (let i = 0; i < 10; i++) {
      if (stageProgress.stageScores[i] > 0) {
        scores.push(`Stage ${i + 1}: ${stageProgress.stageScores[i]} ${stageProgress.stageGrades[i] || ''}`);
        hasScores = true;
      }
    }

    const text = new Text({
      text: hasScores ? '🌟 Stage Scores:\n' + scores.join('\n') : '',
      style: {
        fontFamily: 'Arial',
        fontSize: 20,
        fill: COLORS.TEXT_SECONDARY,
        align: 'center'
      }
    });
    text.anchor.set(0.5);

    return text;
  }

  async enter(data) {
    await super.enter(data);

    // Refresh scores when entering
    if (this.scoresList) {
      this.scoresList.destroy(true);
      this.createScoresList();
    }
  }

  destroy() {
    if (this.backButton) {
      this.backButton.destroy();
    }
    super.destroy();
  }
}