import { Container, Graphics, Text } from 'pixi.js';
import { COLORS, UI, LEVEL } from '../config/Constants.js';
import Button from './Button.js';

export default class ResultScreen {
  constructor(screenOrApp, callbacks = {}) {
    // Support both screen dimensions object or full app
    if (screenOrApp.ticker) {
      // Full app passed
      this.app = screenOrApp;
      this.screen = screenOrApp.screen;
    } else {
      // Just screen dimensions passed
      this.screen = screenOrApp;
      this.app = null;
    }

    this.callbacks = {
      onRestart: callbacks.onRestart || (() => {}),
      onMenu: callbacks.onMenu || (() => {}),
      onNextLevel: callbacks.onNextLevel || (() => {})
    };

    this.container = new Container();
    this.container.visible = false;

    this.createBackdrop();
    this.createResultPanel();
    this.createButtons();
  }

  createBackdrop() {
    // Semi-transparent backdrop
    this.backdrop = new Graphics()
      .rect(0, 0, this.screen.width, this.screen.height)
      .fill({ color: 0x000000, alpha: 0.8 });
    this.container.addChild(this.backdrop);
  }

  createResultPanel() {
    // Main result container
    this.resultContainer = new Container();

    // Large panel background (650x500 for spacious layout)
    this.panelBg = new Graphics()
      .roundRect(-325, -250, 650, 500, 20)
      .fill({ color: 0x1a1a2e, alpha: 0.95 })
      .roundRect(-325, -250, 650, 500, 20)
      .stroke({ width: 4, color: 0x4488ff });
    this.resultContainer.addChild(this.panelBg);

    // Title (PERFECT LANDING, CRASHED, etc.)
    this.titleText = new Text({
      text: '',
      style: {
        fontFamily: 'Arial Black',
        fontSize: 44,
        fill: 0xFFFFFF,
        fontWeight: 'bold',
        dropShadow: true,
        dropShadowDistance: 4,
        letterSpacing: 2
      }
    });
    this.titleText.anchor.set(0.5);
    this.titleText.y = -200;
    this.resultContainer.addChild(this.titleText);

    // Divider line under title
    this.titleDivider = new Graphics()
      .rect(-280, -160, 560, 2)
      .fill({ color: 0x666688, alpha: 0.5 });
    this.resultContainer.addChild(this.titleDivider);

    // Grade and Stars section
    this.gradeStarsContainer = new Container();
    this.gradeStarsContainer.y = -95;

    // Grade display (left side)
    this.gradeLabel = new Text({
      text: 'GRADE',
      style: {
        fontFamily: 'Arial',
        fontSize: 18,
        fill: 0x999999,
        letterSpacing: 1
      }
    });
    this.gradeLabel.anchor.set(0.5);
    this.gradeLabel.x = -150;
    this.gradeLabel.y = -25;
    this.gradeStarsContainer.addChild(this.gradeLabel);

    this.gradeText = new Text({
      text: 'S',
      style: {
        fontFamily: 'Arial Black',
        fontSize: 72,
        fill: 0xFFD700,
        fontWeight: 'bold',
        dropShadow: true,
        dropShadowDistance: 4
      }
    });
    this.gradeText.anchor.set(0.5);
    this.gradeText.x = -150;
    this.gradeText.y = 25;
    this.gradeStarsContainer.addChild(this.gradeText);

    // Stars display (right side)
    this.starsLabel = new Text({
      text: 'STARS',
      style: {
        fontFamily: 'Arial',
        fontSize: 18,
        fill: 0x999999,
        letterSpacing: 1
      }
    });
    this.starsLabel.anchor.set(0.5);
    this.starsLabel.x = 150;
    this.starsLabel.y = -25;
    this.gradeStarsContainer.addChild(this.starsLabel);

    this.starsContainer = new Container();
    this.starsContainer.x = 150;
    this.starsContainer.y = 25;
    this.gradeStarsContainer.addChild(this.starsContainer);

    this.resultContainer.addChild(this.gradeStarsContainer);

    // Divider line
    this.gradeDivider = new Graphics()
      .rect(-280, 20, 560, 2)
      .fill({ color: 0x666688, alpha: 0.5 });
    this.resultContainer.addChild(this.gradeDivider);

    // Score breakdown section
    this.scoreContainer = new Container();
    this.scoreContainer.y = 60;

    // Total Score (large, centered)
    this.totalScoreLabel = new Text({
      text: 'FINAL SCORE',
      style: {
        fontFamily: 'Arial',
        fontSize: 20,
        fill: 0x999999,
        letterSpacing: 1
      }
    });
    this.totalScoreLabel.anchor.set(0.5);
    this.totalScoreLabel.y = 0;
    this.scoreContainer.addChild(this.totalScoreLabel);

    this.totalScoreText = new Text({
      text: '0',
      style: {
        fontFamily: 'Arial Black',
        fontSize: 48,
        fill: 0xFFFFFF,
        fontWeight: 'bold',
        dropShadow: true,
        dropShadowDistance: 3
      }
    });
    this.totalScoreText.anchor.set(0.5);
    this.totalScoreText.y = 38;
    this.scoreContainer.addChild(this.totalScoreText);

    // Target score and percentage
    this.targetScoreText = new Text({
      text: 'Target: 10,000 (100%)',
      style: {
        fontFamily: 'Arial',
        fontSize: 18,
        fill: 0x88ff88,
        letterSpacing: 0.5
      }
    });
    this.targetScoreText.anchor.set(0.5);
    this.targetScoreText.y = 80;
    this.scoreContainer.addChild(this.targetScoreText);

    this.resultContainer.addChild(this.scoreContainer);

    // Score breakdown (compact 2-column layout)
    this.breakdownContainer = new Container();
    this.breakdownContainer.y = 170;

    this.breakdownText = new Text({
      text: '',
      style: {
        fontFamily: 'Arial',
        fontSize: 16,
        fill: 0xcccccc,
        align: 'center',
        lineHeight: 24
      }
    });
    this.breakdownText.anchor.set(0.5);
    this.breakdownContainer.addChild(this.breakdownText);

    this.resultContainer.addChild(this.breakdownContainer);

    // High score indicator
    this.highScoreText = new Text({
      text: '★ NEW HIGH SCORE! ★',
      style: {
        fontFamily: 'Arial Black',
        fontSize: 24,
        fill: 0xFFD700,
        fontWeight: 'bold',
        dropShadow: true,
        dropShadowDistance: 2
      }
    });
    this.highScoreText.anchor.set(0.5);
    this.highScoreText.y = 215;
    this.highScoreText.visible = false;
    this.resultContainer.addChild(this.highScoreText);

    this.resultContainer.x = this.screen.width / 2;
    this.resultContainer.y = this.screen.height / 2 - 20;
    this.container.addChild(this.resultContainer);
  }

  createButtons() {
    // Button container
    this.buttonContainer = new Container();

    // Next Level button
    this.nextLevelButton = new Button(
      'NEXT LEVEL',
      -195,
      0,
      180,
      55,
      COLORS.SUCCESS,
      () => this.callbacks.onNextLevel()
    );
    this.nextLevelButton.container.visible = false;
    this.buttonContainer.addChild(this.nextLevelButton.container);

    // Retry button
    this.retryButton = new Button(
      'TRY AGAIN',
      0,
      0,
      180,
      55,
      COLORS.WARNING,
      () => this.callbacks.onRestart()
    );
    this.buttonContainer.addChild(this.retryButton.container);

    // Menu button
    this.menuButton = new Button(
      'MAIN MENU',
      195,
      0,
      180,
      55,
      COLORS.UI_PRIMARY,
      () => this.callbacks.onMenu()
    );
    this.buttonContainer.addChild(this.menuButton.container);

    this.buttonContainer.x = this.screen.width / 2;
    this.buttonContainer.y = this.screen.height / 2 + 280;
    this.container.addChild(this.buttonContainer);
  }

  /**
   * Show success screen for landing on pad
   */
  showSuccess(data) {
    this.container.visible = true;

    const {
      label = 'SUCCESS',
      score = 0,
      color = COLORS.SUCCESS,
      isNewHighScore = false,
      grade = 'B',
      stars = 0,
      canProceed = true,
      time = 0,
      maxCombo = 0,
      nearMisses = 0,
      tricks = 0,
      targetScore = 10000,
      baseScore = 0,
      timeBonus = 0,
      comboBonus = 0,
      nearMissBonus = 0
    } = data;

    // Set title based on landing quality
    let titleText = label;
    if (label === 'PERFECT') {
      titleText = '★ PERFECT LANDING! ★';
    } else if (label === 'GREAT') {
      titleText = 'GREAT LANDING!';
    } else if (label === 'GOOD') {
      titleText = 'GOOD LANDING!';
    } else {
      titleText = 'LEVEL COMPLETE!';
    }

    this.titleText.text = titleText;
    this.titleText.style.fill = color;

    // Set grade
    this.gradeText.text = grade;
    this.gradeText.style.fill = this.getGradeColor(grade);

    // Show stars
    this.showStars(stars);

    // Set total score
    this.totalScoreText.text = score.toLocaleString();

    // Calculate percentage
    const percentage = ((score / targetScore) * 100).toFixed(1);
    this.targetScoreText.text = `Target: ${targetScore.toLocaleString()} (${percentage}%)`;

    // Color the percentage based on performance
    if (percentage >= 150) {
      this.targetScoreText.style.fill = 0xFFD700; // Gold
    } else if (percentage >= 100) {
      this.targetScoreText.style.fill = 0x88ff88; // Green
    } else if (percentage >= 60) {
      this.targetScoreText.style.fill = 0xffaa00; // Orange
    } else {
      this.targetScoreText.style.fill = 0xff4444; // Red
    }

    // Show score breakdown
    const breakdown = [];
    if (baseScore) breakdown.push(`Landing: ${baseScore.toLocaleString()}`);
    if (timeBonus) breakdown.push(`Time Bonus: ${timeBonus.toLocaleString()}`);
    if (comboBonus) breakdown.push(`Combo Bonus: ${comboBonus.toLocaleString()}`);
    if (nearMissBonus) breakdown.push(`Near-Miss: ${nearMissBonus.toLocaleString()}`);

    if (breakdown.length > 0) {
      // Format as compact 2-column layout
      const leftCol = [];
      const rightCol = [];
      breakdown.forEach((item, i) => {
        if (i % 2 === 0) {
          leftCol.push(item);
        } else {
          rightCol.push(item);
        }
      });

      const maxLen = Math.max(leftCol.length, rightCol.length);
      const lines = [];
      for (let i = 0; i < maxLen; i++) {
        const left = leftCol[i] || '';
        const right = rightCol[i] || '';
        lines.push(`${left.padEnd(30)}${right}`);
      }

      this.breakdownText.text = lines.join('\n');
    } else {
      this.breakdownText.text = '';
    }

    // Show high score indicator
    this.highScoreText.visible = isNewHighScore;
    if (isNewHighScore) {
      this.animateHighScore();
    }

    // Configure buttons
    this.configureSuccessButtons(canProceed);

    // Animate entrance
    this.animateEntrance(color);
  }

  /**
   * Show crash/failure screen
   */
  showFailure(data) {
    this.container.visible = true;

    const {
      type = 'crash',
      distance = 0
    } = data;

    // Set result text based on failure type
    if (type === 'crash') {
      this.titleText.text = 'CRASHED!';
      this.titleText.style.fill = COLORS.DANGER;
      this.totalScoreLabel.text = 'DISTANCE FALLEN';
      this.totalScoreText.text = `${distance}m`;
      this.shakePanel();
    } else if (type === 'missed') {
      this.titleText.text = 'MISSED THE PAD!';
      this.titleText.style.fill = COLORS.WARNING;
      this.totalScoreLabel.text = 'TRY TO LAND ON';
      this.totalScoreText.text = 'THE COLORED PADS';
      this.totalScoreText.style.fontSize = 28;
    }

    // Hide grade/stars/breakdown for failures
    this.gradeStarsContainer.visible = false;
    this.gradeDivider.visible = false;
    this.targetScoreText.visible = false;
    this.breakdownContainer.visible = false;
    this.highScoreText.visible = false;

    // Reposition total score for failure layout
    this.scoreContainer.y = -60;

    // Configure buttons for failure
    this.configureFailureButtons();
  }

  /**
   * Configure buttons for successful completion
   */
  configureSuccessButtons(canProceed) {
    // Show next level button if player can proceed
    this.nextLevelButton.container.visible = canProceed;

    if (canProceed) {
      // Three button layout
      this.nextLevelButton.container.x = -195;
      this.retryButton.container.x = 0;
      this.menuButton.container.x = 195;
    } else {
      // Two button layout (final level or locked)
      this.retryButton.container.x = -100;
      this.menuButton.container.x = 100;
    }
  }

  /**
   * Configure buttons for failure
   */
  configureFailureButtons() {
    // Hide next level button on failure
    this.nextLevelButton.container.visible = false;

    // Two button layout
    this.retryButton.container.x = -100;
    this.menuButton.container.x = 100;
  }

  /**
   * Display star rating
   */
  showStars(earnedStars) {
    // Clear existing stars
    this.starsContainer.removeChildren();

    for (let i = 0; i < 3; i++) {
      const star = new Graphics();
      const filled = i < earnedStars;

      // Draw star shape
      star.star(0, 0, 5, 22, 11);
      star.fill({ color: filled ? 0xFFD700 : 0x333333 });
      star.stroke({ color: filled ? 0xFFFF00 : 0x555555, width: 2 });

      star.x = (i - 1) * 50;
      this.starsContainer.addChild(star);

      // Animate earned stars
      if (filled) {
        star.scale.set(0);
        const delay = i * 150;

        setTimeout(() => {
          this.animateStar(star);
        }, delay);
      }
    }
  }

  /**
   * Animate star appearance
   */
  animateStar(star) {
    const targetScale = 1;
    let currentScale = 0;

    const animate = (ticker) => {
      currentScale += ticker.deltaTime * 0.15;
      if (currentScale >= targetScale) {
        star.scale.set(targetScale);
        ticker.remove(animate);
      } else {
        // Overshoot effect
        const overshoot = 1.3;
        const scale = targetScale + (overshoot - targetScale) * Math.pow(1 - currentScale, 2);
        star.scale.set(scale);
      }
    };

    const ticker = this.app?.ticker || this.screen?.ticker;
    if (ticker) {
      ticker.add(animate);
    }
  }

  /**
   * Get color for grade
   */
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

  /**
   * Animate entrance
   */
  animateEntrance(color) {
    this.resultContainer.scale.set(0);
    this.resultContainer.alpha = 0;

    let elapsed = 0;
    const animate = (ticker) => {
      elapsed += ticker.deltaTime / 60;
      const progress = Math.min(elapsed * 2.5, 1);

      // Bounce ease out
      const scale = 1 - Math.pow(1 - progress, 3);
      this.resultContainer.scale.set(scale);
      this.resultContainer.alpha = progress;

      if (progress >= 1) {
        ticker.remove(animate);
        // Create particle burst
        this.createParticleBurst(color);
      }
    };

    const ticker = this.app?.ticker || this.screen?.ticker;
    if (ticker) {
      ticker.add(animate);
    }
  }

  /**
   * Animate high score indicator
   */
  animateHighScore() {
    let time = 0;
    const animate = (ticker) => {
      time += ticker.deltaTime / 60;
      this.highScoreText.scale.set(1 + Math.sin(time * 8) * 0.1);

      // Stop after 4 seconds
      if (time > 4) {
        this.highScoreText.scale.set(1);
        ticker.remove(animate);
      }
    };

    const ticker = this.app?.ticker || this.screen?.ticker;
    if (ticker) {
      ticker.add(animate);
    }
  }

  /**
   * Shake panel effect for crashes
   */
  shakePanel() {
    const originalX = this.resultContainer.x;
    let shakeTime = 0;

    const animate = (ticker) => {
      shakeTime += ticker.deltaTime / 60;
      const intensity = Math.max(0, 1 - shakeTime * 2);

      this.resultContainer.x = originalX + Math.random() * 25 * intensity - 12.5 * intensity;

      if (shakeTime > 0.6) {
        this.resultContainer.x = originalX;
        ticker.remove(animate);
      }
    };

    const ticker = this.app?.ticker || this.screen?.ticker;
    if (ticker) {
      ticker.add(animate);
    }
  }

  /**
   * Create particle burst effect
   */
  createParticleBurst(color) {
    for (let i = 0; i < 12; i++) {
      const particle = new Graphics();
      particle.circle(0, 0, 4);
      particle.fill({ color: color });

      const angle = (Math.PI * 2 * i) / 12;
      const speed = 6 + Math.random() * 4;
      particle.vx = Math.cos(angle) * speed;
      particle.vy = Math.sin(angle) * speed;
      particle.x = this.resultContainer.x;
      particle.y = this.resultContainer.y - 180;

      this.container.addChild(particle);

      const animate = (ticker) => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.vy += 0.4; // Gravity
        particle.alpha -= ticker.deltaTime * 0.015;

        if (particle.alpha <= 0) {
          this.container.removeChild(particle);
          ticker.remove(animate);
        }
      };

      if (this.screen.ticker) {
        this.screen.ticker.add(animate);
      }
    }
  }

  /**
   * Hide the result screen
   */
  hide() {
    this.container.visible = false;

    // Reset visibility of elements that may have been hidden
    this.gradeStarsContainer.visible = true;
    this.gradeDivider.visible = true;
    this.targetScoreText.visible = true;
    this.breakdownContainer.visible = true;
    this.scoreContainer.y = 60;
    this.totalScoreText.style.fontSize = 48;
    this.totalScoreLabel.text = 'FINAL SCORE';
  }

  /**
   * Destroy the result screen
   */
  destroy() {
    this.retryButton.destroy();
    this.menuButton.destroy();
    this.nextLevelButton.destroy();
    this.container.destroy(true);
  }
}
