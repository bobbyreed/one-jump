import { Container, Graphics, Text } from 'pixi.js';
import { COLORS, UI, LEVEL } from '../config/Constants.js';
import Button from './Button.js';

export default class ResultScreen {
  constructor(screen, callbacks = {}) {
    this.screen = screen;
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
    this.createStatsDisplay();
  }

  createBackdrop() {
    // Semi-transparent backdrop
    this.backdrop = new Graphics()
      .rect(0, 0, this.screen.width, this.screen.height)
      .fill({ color: 0x000000, alpha: 0.7 });
    this.container.addChild(this.backdrop);
  }

  createResultPanel() {
    // Main result panel
    this.resultPanel = new Container();

    // Panel background
    const panelBg = new Graphics()
      .roundRect(-200, -100, 400, 200, 15)
      .fill({ color: 0x222244, alpha: 0.95 })
      .roundRect(-200, -100, 400, 200, 15)
      .stroke({ width: 3, color: 0x666688 });
    this.resultPanel.addChild(panelBg);

    // Result title (SUCCESS, PERFECT, etc.)
    this.resultTitle = new Text({
      text: '',
      style: {
        fontFamily: 'Arial Black',
        fontSize: 42,
        fill: COLORS.SUCCESS,
        fontWeight: 'bold',
        dropShadow: true,
        dropShadowDistance: 4
      }
    });
    this.resultTitle.anchor.set(0.5);
    this.resultTitle.y = -50;
    this.resultPanel.addChild(this.resultTitle);

    // Score display
    this.scoreText = new Text({
      text: '',
      style: {
        fontFamily: 'Arial',
        fontSize: 28,
        fill: COLORS.TEXT_PRIMARY,
        fontWeight: 'bold'
      }
    });
    this.scoreText.anchor.set(0.5);
    this.scoreText.y = 0;
    this.resultPanel.addChild(this.scoreText);

    // Grade display
    this.gradeText = new Text({
      text: '',
      style: {
        fontFamily: 'Arial Black',
        fontSize: 36,
        fill: COLORS.WARNING,
        fontWeight: 'bold'
      }
    });
    this.gradeText.anchor.set(0.5);
    this.gradeText.y = 40;
    this.resultPanel.addChild(this.gradeText);

    // High score indicator
    this.highScoreIndicator = new Text({
      text: 'NEW HIGH SCORE! 🏆',
      style: {
        fontFamily: 'Arial',
        fontSize: 24,
        fill: COLORS.WARNING,
        fontWeight: 'bold'
      }
    });
    this.highScoreIndicator.anchor.set(0.5);
    this.highScoreIndicator.y = 80;
    this.highScoreIndicator.visible = false;
    this.resultPanel.addChild(this.highScoreIndicator);

    this.resultPanel.x = this.screen.width / 2;
    this.resultPanel.y = this.screen.height / 2 - 50;
    this.container.addChild(this.resultPanel);
  }

  createButtons() {
    // Button container
    this.buttonContainer = new Container();

    // Next Level button (only shown on success)
    this.nextLevelButton = new Button(
      'NEXT LEVEL',
      -160,
      0,
      140,
      50,
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
      140,
      50,
      COLORS.WARNING,
      () => this.callbacks.onRestart()
    );
    this.buttonContainer.addChild(this.retryButton.container);

    // Menu button
    this.menuButton = new Button(
      'MAIN MENU',
      160,
      0,
      140,
      50,
      COLORS.UI_PRIMARY,
      () => this.callbacks.onMenu()
    );
    this.buttonContainer.addChild(this.menuButton.container);

    this.buttonContainer.x = this.screen.width / 2;
    this.buttonContainer.y = this.screen.height / 2 + 120;
    this.container.addChild(this.buttonContainer);
  }

  createStatsDisplay() {
    // Stats container (shown on success)
    this.statsContainer = new Container();
    this.statsContainer.visible = false;

    // Stats background
    const statsBg = new Graphics()
      .roundRect(-200, -80, 400, 160, 10)
      .fill({ color: 0x000000, alpha: 0.5 });
    this.statsContainer.addChild(statsBg);

    // Stats title
    const statsTitle = new Text({
      text: 'LEVEL STATS',
      style: {
        fontFamily: 'Arial',
        fontSize: 20,
        fill: COLORS.TEXT_SECONDARY,
        fontWeight: 'bold'
      }
    });
    statsTitle.anchor.set(0.5);
    statsTitle.y = -60;
    this.statsContainer.addChild(statsTitle);

    // Stats text
    this.statsText = new Text({
      text: '',
      style: {
        fontFamily: 'Arial',
        fontSize: 18,
        fill: COLORS.TEXT_PRIMARY,
        align: 'center',
        lineHeight: 24
      }
    });
    this.statsText.anchor.set(0.5);
    this.statsText.y = -10;
    this.statsContainer.addChild(this.statsText);

    // Stars display
    this.starsContainer = new Container();
    this.starsContainer.y = 40;
    this.statsContainer.addChild(this.starsContainer);

    this.statsContainer.x = this.screen.width / 2;
    this.statsContainer.y = this.screen.height / 2 + 250;
    this.container.addChild(this.statsContainer);
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
      tricks = 0
    } = data;

    // Set result text based on landing quality
    let titleText = label;
    if (label === 'PERFECT') {
      titleText = 'PERFECT LANDING!';
    } else if (label === 'GOOD') {
      titleText = 'GOOD LANDING!';
    } else if (label === 'OK') {
      titleText = 'NICE LANDING!';
    } else {
      titleText = 'LEVEL COMPLETE!';
    }
    
    this.resultTitle.text = titleText;
    this.resultTitle.style.fill = color;

    // Animate title
    this.animateTitle();

    // Set score
    this.scoreText.text = `Score: ${score.toLocaleString()}`;

    // Set grade
    this.gradeText.text = `Grade: ${grade}`;
    this.gradeText.style.fill = this.getGradeColor(grade);

    // Show high score indicator if applicable
    this.highScoreIndicator.visible = isNewHighScore;
    if (isNewHighScore) {
      this.animateHighScore();
    }

    // Show stats
    this.showStats({
      time,
      maxCombo,
      nearMisses,
      tricks
    });

    // Display stars
    this.showStars(stars);

    // Configure buttons for success
    this.configureSuccessButtons(canProceed);

    // Play success animation
    this.playSuccessAnimation(color);
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
      this.resultTitle.text = 'CRASHED!';
      this.resultTitle.style.fill = COLORS.DANGER;
      this.scoreText.text = `Distance: ${distance}m`;
      this.shakePanel();
    } else if (type === 'missed') {
      this.resultTitle.text = 'MISSED THE PAD!';
      this.resultTitle.style.fill = COLORS.WARNING;
      this.scoreText.text = 'Try to land on the colored pads!';
    }

    // Hide grade for failures
    this.gradeText.visible = false;

    // Hide stats for failure
    this.statsContainer.visible = false;
    this.highScoreIndicator.visible = false;

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
      this.nextLevelButton.container.x = -160;
      this.retryButton.container.x = 0;
      this.menuButton.container.x = 160;
    } else {
      // Two button layout (final level or locked)
      this.retryButton.container.x = -80;
      this.menuButton.container.x = 80;
    }
  }

  /**
   * Configure buttons for failure
   */
  configureFailureButtons() {
    // Hide next level button on failure
    this.nextLevelButton.container.visible = false;
    
    // Two button layout
    this.retryButton.container.x = -80;
    this.menuButton.container.x = 80;
  }

  /**
   * Show statistics
   */
  showStats(data) {
    const stats = [];
    
    if (data.time !== undefined) {
      stats.push(`Time: ${data.time.toFixed(1)}s`);
    }
    if (data.maxCombo) {
      stats.push(`Max Combo: x${data.maxCombo}`);
    }
    if (data.nearMisses) {
      stats.push(`Near Misses: ${data.nearMisses}`);
    }
    if (data.tricks) {
      stats.push(`Tricks: ${data.tricks}`);
    }

    if (stats.length > 0) {
      this.statsText.text = stats.join('  •  ');
      this.statsContainer.visible = true;
    }
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
      star.star(0, 0, 5, 20, 10);
      star.fill({ color: filled ? 0xFFD700 : 0x444444 });
      star.stroke({ color: filled ? 0xFFFF00 : 0x666666, width: 2 });
      
      star.x = (i - 1) * 60;
      this.starsContainer.addChild(star);
      
      // Animate earned stars
      if (filled) {
        star.scale.set(0);
        const delay = i * 200;
        
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
      currentScale += ticker.deltaTime * 0.1;
      if (currentScale >= targetScale) {
        star.scale.set(targetScale);
        ticker.remove(animate);
        
        // Sparkle effect at the end
        this.createSparkle(star.x, star.y);
      } else {
        // Overshoot effect
        const overshoot = 1.3;
        const scale = targetScale + (overshoot - targetScale) * Math.pow(1 - currentScale, 2);
        star.scale.set(scale);
      }
    };
    
    if (this.screen.ticker) {
      this.screen.ticker.add(animate);
    }
  }

  /**
   * Create sparkle effect
   */
  createSparkle(x, y) {
    const sparkle = new Graphics();
    sparkle.star(0, 0, 4, 15, 2);
    sparkle.fill({ color: 0xFFFFFF, alpha: 0.8 });
    sparkle.x = x;
    sparkle.y = y;
    this.starsContainer.addChild(sparkle);
    
    let alpha = 0.8;
    const animate = (ticker) => {
      alpha -= ticker.deltaTime * 0.05;
      sparkle.alpha = alpha;
      sparkle.rotation += ticker.deltaTime * 0.1;
      sparkle.scale.set(1 + (1 - alpha) * 2);
      
      if (alpha <= 0) {
        this.starsContainer.removeChild(sparkle);
        ticker.remove(animate);
      }
    };
    
    if (this.screen.ticker) {
      this.screen.ticker.add(animate);
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
    
    if (this.screen.ticker) {
      this.screen.ticker.add(animate);
    }
  }

  /**
   * Animate high score indicator
   */
  animateHighScore() {
    let time = 0;
    const animate = (ticker) => {
      time += ticker.deltaTime / 60;
      this.highScoreIndicator.scale.set(1 + Math.sin(time * 10) * 0.1);
      
      // Stop after 3 seconds
      if (time > 3) {
        this.highScoreIndicator.scale.set(1);
        ticker.remove(animate);
      }
    };
    
    if (this.screen.ticker) {
      this.screen.ticker.add(animate);
    }
  }

  /**
   * Shake panel effect for crashes
   */
  shakePanel() {
    const originalX = this.resultPanel.x;
    let shakeTime = 0;
    
    const animate = (ticker) => {
      shakeTime += ticker.deltaTime / 60;
      const intensity = Math.max(0, 1 - shakeTime * 2);
      
      this.resultPanel.x = originalX + Math.random() * 20 * intensity - 10 * intensity;
      
      if (shakeTime > 0.5) {
        this.resultPanel.x = originalX;
        ticker.remove(animate);
      }
    };
    
    if (this.screen.ticker) {
      this.screen.ticker.add(animate);
    }
  }

  /**
   * Play success animation
   */
  playSuccessAnimation(color) {
    // Create particle burst effect
    for (let i = 0; i < 10; i++) {
      const particle = new Graphics();
      particle.circle(0, 0, 3);
      particle.fill({ color: color });
      
      const angle = (Math.PI * 2 * i) / 10;
      const speed = 5 + Math.random() * 5;
      particle.vx = Math.cos(angle) * speed;
      particle.vy = Math.sin(angle) * speed;
      particle.x = this.resultPanel.x;
      particle.y = this.resultPanel.y;
      
      this.container.addChild(particle);
      
      const animate = (ticker) => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.vy += 0.5; // Gravity
        particle.alpha -= ticker.deltaTime * 0.02;
        
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
    this.gradeText.visible = true; // Reset for next time
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