// src/ui/ResultScreen.js
import { Container, Graphics, Text } from 'pixi.js';
import Button from './Button.js';
import { COLORS } from '../config/Constants.js';

export default class ResultScreen {
  constructor(parentContainer, screen, onRestart, onMenu) {
    this.container = new Container();
    this.container.visible = false;
    this.screen = screen;
    this.onRestart = onRestart;
    this.onMenu = onMenu;

    parentContainer.addChild(this.container);

    // Create screen elements
    this.createDimmer();
    this.createResultPanel();
    this.createButtons();
    this.createStatsDisplay();
  }

  createDimmer() {
    // Semi-transparent background
    this.dimmer = new Graphics()
      .rect(0, 0, this.screen.width, this.screen.height)
      .fill({ color: 0x000000, alpha: 0.7 });
    this.container.addChild(this.dimmer);
  }

  createResultPanel() {
    // Main result panel
    this.resultPanel = new Container();

    // Panel background
    const panelBg = new Graphics()
      .roundRect(-250, -150, 500, 300, 20)
      .fill({ color: 0x1a1a2e, alpha: 0.95 })
      .roundRect(-250, -150, 500, 300, 20)
      .stroke({ width: 3, color: COLORS.UI_PRIMARY });
    this.resultPanel.addChild(panelBg);

    // Result title
    this.resultTitle = new Text({
      text: '',
      style: {
        fontFamily: 'Arial Black',
        fontSize: 48,
        fill: COLORS.TEXT_PRIMARY,
        fontWeight: 'bold',
        dropShadow: true,
        dropShadowColor: 0x000000,
        dropShadowDistance: 3
      }
    });
    this.resultTitle.anchor.set(0.5);
    this.resultTitle.y = -80;
    this.resultPanel.addChild(this.resultTitle);

    // Score text
    this.scoreText = new Text({
      text: '',
      style: {
        fontFamily: 'Arial',
        fontSize: 32,
        fill: COLORS.TEXT_PRIMARY,
        align: 'center'
      }
    });
    this.scoreText.anchor.set(0.5);
    this.scoreText.y = -20;
    this.resultPanel.addChild(this.scoreText);

    // New high score indicator
    this.highScoreIndicator = new Text({
      text: '🏆 NEW HIGH SCORE! 🏆',
      style: {
        fontFamily: 'Arial',
        fontSize: 24,
        fill: COLORS.WARNING,
        fontWeight: 'bold'
      }
    });
    this.highScoreIndicator.anchor.set(0.5);
    this.highScoreIndicator.y = 20;
    this.highScoreIndicator.visible = false;
    this.resultPanel.addChild(this.highScoreIndicator);

    // Restart instruction
    const restartText = new Text({
      text: 'Press SPACE to Try Again',
      style: {
        fontFamily: 'Arial',
        fontSize: 18,
        fill: COLORS.TEXT_SECONDARY
      }
    });
    restartText.anchor.set(0.5);
    restartText.y = 60;
    this.resultPanel.addChild(restartText);

    this.resultPanel.x = this.screen.width / 2;
    this.resultPanel.y = this.screen.height / 2;
    this.container.addChild(this.resultPanel);
  }

  createButtons() {
    // Button container
    const buttonContainer = new Container();

    // Retry button
    this.retryButton = new Button(
      'TRY AGAIN',
      -110,
      0,
      200,
      50,
      COLORS.SUCCESS,
      this.onRestart
    );
    buttonContainer.addChild(this.retryButton.container);

    // Menu button
    this.menuButton = new Button(
      'MAIN MENU',
      -110,
      60,
      200,
      50,
      COLORS.UI_PRIMARY,
      this.onMenu
    );
    buttonContainer.addChild(this.menuButton.container);

    buttonContainer.x = this.screen.width / 2;
    buttonContainer.y = this.screen.height / 2 + 100;
    this.container.addChild(buttonContainer);
  }

  createStatsDisplay() {
    // Stats container (shown on success)
    this.statsContainer = new Container();
    this.statsContainer.visible = false;

    // Stats background
    const statsBg = new Graphics()
      .roundRect(-150, -60, 300, 120, 10)
      .fill({ color: 0x000000, alpha: 0.5 });
    this.statsContainer.addChild(statsBg);

    // Stats text
    this.statsText = new Text({
      text: '',
      style: {
        fontFamily: 'Arial',
        fontSize: 16,
        fill: COLORS.TEXT_PRIMARY,
        align: 'center',
        lineHeight: 22
      }
    });
    this.statsText.anchor.set(0.5);
    this.statsContainer.addChild(this.statsText);

    this.statsContainer.x = this.screen.width / 2;
    this.statsContainer.y = this.screen.height / 2 + 220;
    this.container.addChild(this.statsContainer);
  }

  /**
   * Show success screen
   */
  showSuccess(label, score, color, isNewHighScore = false) {
    this.container.visible = true;

    // Set result text
    this.resultTitle.text = label + '!';
    this.resultTitle.style.fill = color;

    // Animate title
    this.animateTitle();

    // Set score
    this.scoreText.text = `Score: ${score}`;

    // Show high score indicator if applicable
    this.highScoreIndicator.visible = isNewHighScore;
    if (isNewHighScore) {
      this.animateHighScore();
    }

    // Show stats
    this.showStats({
      score: score,
      label: label
    });

    // Play success animation
    this.playSuccessAnimation(color);
  }

  /**
   * Show crash screen
   */
  showCrash(distance) {
    this.container.visible = true;

    // Set result text
    this.resultTitle.text = 'CRASHED!';
    this.resultTitle.style.fill = COLORS.DANGER;

    // Shake effect
    this.shakePanel();

    // Set distance
    this.scoreText.text = `Distance: ${distance}m`;

    // Hide stats for crash
    this.statsContainer.visible = false;
    this.highScoreIndicator.visible = false;
  }

  /**
   * Show missed landing screen
   */
  showMissed() {
    this.container.visible = true;

    // Set result text
    this.resultTitle.text = 'MISSED!';
    this.resultTitle.style.fill = COLORS.WARNING;

    // Set message
    this.scoreText.text = 'Try to land on the pads!';

    // Hide stats
    this.statsContainer.visible = false;
    this.highScoreIndicator.visible = false;
  }

  /**
   * Show statistics
   */
  showStats(data) {
    const stats = [];

    if (data.score) {
      stats.push(`Points: ${data.score}`);
    }
    if (data.distance) {
      stats.push(`Distance: ${data.distance}m`);
    }
    if (data.nearMisses) {
      stats.push(`Near Misses: ${data.nearMisses}`);
    }
    if (data.maxCombo) {
      stats.push(`Max Combo: x${data.maxCombo}`);
    }

    if (stats.length > 0) {
      this.statsText.text = stats.join('\n');
      this.statsContainer.visible = true;
    }
  }

  /**
   * Animate title appearance
   */
  animateTitle() {
    this.resultTitle.scale.set(0);

    let elapsed = 0;
    const animate = (ticker) => {
      elapsed += ticker.deltaTime / 60;
      const progress = Math.min(elapsed * 3, 1);

      // Bounce ease out
      const scale = 1 - Math.pow(1 - progress, 3);
      this.resultTitle.scale.set(scale);

      if (progress >= 1) {
        ticker.remove(animate);
      }
    };

    // Would need ticker access in real implementation
  }

  /**
   * Animate high score indicator
   */
  animateHighScore() {
    let time = 0;
    const animate = (ticker) => {
      if (!this.highScoreIndicator.visible) {
        ticker.remove(animate);
        return;
      }

      time += ticker.deltaTime * 0.1;
      this.highScoreIndicator.scale.set(1 + Math.sin(time) * 0.1);

      // Rainbow color effect
      const hue = (time * 50) % 360;
      // Would convert HSL to hex here
    };

    // Would need ticker access in real implementation
  }

  /**
   * Shake panel effect
   */
  shakePanel() {
    const originalX = this.resultPanel.x;
    let shakeTime = 0;
    const shakeDuration = 0.5;

    const animate = (ticker) => {
      shakeTime += ticker.deltaTime / 60;

      if (shakeTime < shakeDuration) {
        const intensity = (1 - shakeTime / shakeDuration) * 10;
        this.resultPanel.x = originalX + (Math.random() - 0.5) * intensity;
      } else {
        this.resultPanel.x = originalX;
        ticker.remove(animate);
      }
    };

    // Would need ticker access in real implementation
  }

  /**
   * Play success animation
   */
  playSuccessAnimation(color) {
    // Create particle burst
    for (let i = 0; i < 20; i++) {
      const particle = new Graphics()
        .star(0, 0, 5, 5, 5)
        .fill({ color: color });

      const angle = (Math.PI * 2 / 20) * i;
      const distance = 100 + Math.random() * 50;

      particle.x = this.screen.width / 2 + Math.cos(angle) * distance;
      particle.y = this.screen.height / 2 + Math.sin(angle) * distance;
      particle.scale.set(0);

      this.container.addChild(particle);

      // Animate particle
      let elapsed = 0;
      const animate = (ticker) => {
        elapsed += ticker.deltaTime / 60;

        particle.scale.set(Math.min(elapsed * 2, 1));
        particle.alpha = 1 - elapsed;
        particle.rotation += 0.1;

        if (elapsed >= 1) {
          this.container.removeChild(particle);
          ticker.remove(animate);
        }
      };

      // Would need ticker access in real implementation
    }
  }

  /**
   * Hide result screen
   */
  hide() {
    this.container.visible = false;
    this.highScoreIndicator.visible = false;
    this.statsContainer.visible = false;
  }

  /**
   * Reset result screen
   */
  reset() {
    this.hide();
    this.resultTitle.scale.set(1);
    this.resultPanel.x = this.screen.width / 2;
  }

  /**
   * Destroy result screen
   */
  destroy() {
    if (this.retryButton) {
      this.retryButton.destroy();
    }
    if (this.menuButton) {
      this.menuButton.destroy();
    }
    this.container.destroy(true);
  }
}