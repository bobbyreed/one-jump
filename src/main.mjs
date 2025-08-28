import { Application, Assets, Sprite, Graphics, Container, Text, AnimatedSprite, Texture, Rectangle } from "pixi.js";

(async () => {
  // Create application
  const app = new Application();

  // Initialize the application
  await app.init({
    background: "#0a0a1f",
    resizeTo: window,
    antialias: true,
    resolution: window.devicePixelRatio || 1
  });

  // Append canvas to the container
  document.getElementById("pixi-container").appendChild(app.canvas);

  // Game constants
  const GRAVITY = 300;
  const MAX_FALL_SPEED = 800;
  const HORIZONTAL_SPEED = 400;
  const INITIAL_WALK_SPEED = 150;
  const CLIFF_EDGE = 300;
  const FALL_START_Y = 200;
  const CAMERA_OFFSET_Y = 200;

  // Animation constants
  const SPRITE_SHEET_WIDTH = 500;
  const SPRITE_SHEET_HEIGHT = 500;
  const SPRITE_COLS = 3;
  const SPRITE_ROWS = 3;
  const SPRITE_WIDTH = SPRITE_SHEET_WIDTH / SPRITE_COLS; // ~166.67
  const SPRITE_HEIGHT = SPRITE_SHEET_HEIGHT / SPRITE_ROWS; // ~166.67

  // Game state
  let gameState = {
    currentScene: 'menu',
    phase: 'walking', // 'walking', 'falling', 'landed', 'crashed'
    score: 0,
    highScore: localStorage.getItem('oneJumpHighScore') || 0,
    distance: 0,
    velocity: { x: 0, y: 0 },
    cameraY: 0,
    fallSpeed: 0,
    horizontalInput: 0,
    isMoving: false,
    jetpackActivating: false
  };

  // Scene containers
  const menuContainer = new Container();
  const gameContainer = new Container();
  const highscoresContainer = new Container();

  app.stage.addChild(menuContainer);
  app.stage.addChild(gameContainer);
  app.stage.addChild(highscoresContainer);

  // Initially hide game and highscores
  gameContainer.visible = false;
  highscoresContainer.visible = false;

  // ===============================
  // SPRITE SHEET LOADING
  // ===============================
  
  // Load the sprite sheet texture
  const spriteSheetTexture = await Assets.load('/public/assets/sprites/idlerun.png');
  
  // Create texture arrays for animations
  function createTexturesFromSpriteSheet(baseTexture) {
    const textures = [];
    
    for (let row = 0; row < SPRITE_ROWS; row++) {
      for (let col = 0; col < SPRITE_COLS; col++) {
        const frame = new Rectangle(
          col * SPRITE_WIDTH,
          row * (SPRITE_HEIGHT + 12),
          SPRITE_WIDTH,
          SPRITE_HEIGHT
        );
        
        const texture = new Texture({
          source: baseTexture.source,
          frame: frame
        });
        
        textures.push(texture);
      }
    }
    
    return textures;
  }
  
  const allTextures = createTexturesFromSpriteSheet(spriteSheetTexture);
  
  // Define animation sequences
  // Cell numbering: 1=index 0, 2=index 1, etc.
  const animations = {
    idle: [allTextures[0]], // Cell 1
    running: [allTextures[0], allTextures[7], allTextures[8]], // Cells 1, 8, 9
    jetpackActivation: [
      allTextures[1], // Cell 2
      allTextures[2], // Cell 3
      allTextures[3], // Cell 4
      allTextures[4], // Cell 5
      allTextures[5], // Cell 6
      allTextures[6]  // Cell 7
    ],
    falling: [allTextures[6]] // Use last frame of jetpack for falling
  };

  // ===============================
  // MENU SCENE SETUP
  // ===============================

  async function setupMenuScene() {
    // Load and display cover image
    const coverTexture = await Assets.load('/public/assets/nukemCover.png');
    const coverSprite = new Sprite(coverTexture);

    // Scale cover to fit screen while maintaining aspect ratio
    const scale = Math.max(
      app.screen.width / coverSprite.texture.width,
      app.screen.height / coverSprite.texture.height
    );
    coverSprite.scale.set((scale*.75));
    coverSprite.anchor.set(0.5);
    coverSprite.x = app.screen.width / 2;
    coverSprite.y = app.screen.height / 2;

    menuContainer.addChild(coverSprite);

    // Create menu panel
    const panelWidth = 400;
    const panelHeight = 300;
    const panel = new Graphics()
      .roundRect(0, 0, panelWidth, panelHeight, 20)
      .fill({ color: 0x1a1a2e, alpha: 0.25 })
      .roundRect(0, 0, panelWidth, panelHeight, 20)

    panel.x = (app.screen.width - panelWidth) / 2;
    panel.y = (app.screen.height - panelHeight) / 2 + 50;
    menuContainer.addChild(panel);

    // Create buttons
    const buttonWidth = 300;
    const buttonHeight = 60;
    const buttonSpacing = 20;
    const startY = panel.y + 60;

    // Start Game button
    const startButton = createMenuButton(
      'START GAME',
      panel.x + (panelWidth - buttonWidth) / 2,
      startY,
      buttonWidth,
      buttonHeight,
      0x88,
      () => startGame()
    );
    menuContainer.addChild(startButton);

    // View Highscores button
    const highscoresButton = createMenuButton(
      'HIGHSCORES',
      panel.x + (panelWidth - buttonWidth) / 2,
      startY + buttonHeight + buttonSpacing,
      buttonWidth,
      buttonHeight,
      0xff88ff,
      () => showHighscores()
    );
    menuContainer.addChild(highscoresButton);

    // Current high score display
    const highScoreText = new Text({
      text: `Best Score: ${gameState.highScore}`,
      style: {
        fontFamily: 'Arial',
        fontSize: 20,
        fill: 0xffffff,
        dropShadow: true,
        dropShadowColor: 0x000000,
        dropShadowDistance: 2
      }
    });
    highScoreText.anchor.set(0.5);
    highScoreText.x = panel.x + panelWidth / 2;
    highScoreText.y = startY + (buttonHeight + buttonSpacing) * 2 + 30;
    menuContainer.addChild(highScoreText);

    // Instructions
    const instructionsText = new Text({
      text: 'Walk off the edge and navigate the fall!\nLand on the pads for maximum points!',
      style: {
        fontFamily: 'Arial',
        fontSize: 16,
        fill: 0xcccccc,
        align: 'center',
        dropShadow: true,
        dropShadowColor: 0x000000,
        dropShadowDistance: 2
      }
    });
    instructionsText.anchor.set(0.5);
    instructionsText.x = app.screen.width / 2;
    instructionsText.y = app.screen.height - 60;
    menuContainer.addChild(instructionsText);
  }

  function createMenuButton(text, x, y, width, height, color, onClick) {
    const button = new Container();
    button.eventMode = 'static';
    button.cursor = 'pointer';

    const bg = new Graphics()
      .roundRect(0, 0, width, height, 10)
      .fill({ color: color, alpha: 0.3 })
      .roundRect(0, 0, width, height, 10)
      .stroke({ width: 2, color: color });

    const hoverBg = new Graphics()
      .roundRect(0, 0, width, height, 10)
      .fill({ color: color, alpha: 0.5 })
      .roundRect(0, 0, width, height, 10)
      .stroke({ width: 3, color: color });
    hoverBg.visible = false;

    const label = new Text({
      text: text,
      style: {
        fontFamily: 'Arial',
        fontSize: 24,
        fill: 0xffffff,
        fontWeight: 'bold',
        dropShadow: true,
        dropShadowColor: 0x000000,
        dropShadowDistance: 2
      }
    });
    label.anchor.set(0.5);
    label.x = width / 2;
    label.y = height / 2;

    button.addChild(bg, hoverBg, label);
    button.x = x;
    button.y = y;

    // Add interactivity
    button.on('pointerover', () => {
      hoverBg.visible = true;
      button.scale.set(1.05);
    });

    button.on('pointerout', () => {
      hoverBg.visible = false;
      button.scale.set(1);
    });

    button.on('pointerdown', onClick);

    return button;
  }

  function startGame() {
    menuContainer.visible = false;
    gameContainer.visible = true;
    gameState.currentScene = 'game';
    resetGame();
  }

  function showHighscores() {
    menuContainer.visible = false;
    highscoresContainer.visible = true;
    gameState.currentScene = 'highscores';
  }

  function returnToMenu() {
    menuContainer.visible = true;
    gameContainer.visible = false;
    highscoresContainer.visible = false;
    gameState.currentScene = 'menu';
  }

  // ===============================
  // HIGHSCORES SCENE SETUP
  // ===============================

  function setupHighscoresScene() {
    // Background
    const bg = new Graphics()
      .rect(0, 0, app.screen.width, app.screen.height)
      .fill({ color: 0x0a0a1f });
    highscoresContainer.addChild(bg);

    // Title
    const title = new Text({
      text: 'HIGHSCORES',
      style: {
        fontFamily: 'Arial Black, sans-serif',
        fontSize: 48,
        fill: 0xffffff,
        fontWeight: 'bold',
        dropShadow: true,
        dropShadowColor: 0x000000,
        dropShadowDistance: 4
      }
    });
    title.anchor.set(0.5);
    title.x = app.screen.width / 2;
    title.y = 80;
    highscoresContainer.addChild(title);

    // Placeholder for scores
    const scoresText = new Text({
      text: 'Coming Soon!\n\nYour best score: ' + gameState.highScore,
      style: {
        fontFamily: 'Arial',
        fontSize: 24,
        fill: 0xffffff,
        align: 'center'
      }
    });
    scoresText.anchor.set(0.5);
    scoresText.x = app.screen.width / 2;
    scoresText.y = app.screen.height / 2;
    highscoresContainer.addChild(scoresText);

    // Back button
    const backButton = createMenuButton(
      'BACK TO MENU',
      (app.screen.width - 300) / 2,
      app.screen.height - 150,
      300,
      60,
      0xff4444,
      () => returnToMenu()
    );
    highscoresContainer.addChild(backButton);
  }

  // ===============================
  // GAME SCENE
  // ===============================

  // Create main game container (this will move with camera)
  const worldContainer = new Container();
  gameContainer.addChild(worldContainer);

  // Create parallax background layers
  const bgFar = new Container();
  const bgMid = new Container();
  const bgNear = new Container();
  worldContainer.addChild(bgFar, bgMid, bgNear);

  // Create vertical starfield/particles
  function createVerticalParticles(layer, count, size, speedMult, color = 0xffffff) {
    for (let i = 0; i < count; i++) {
      const particle = new Graphics()
        .circle(0, 0, size)
        .fill({ color: color, alpha: Math.random() * 0.6 + 0.2 });

      particle.x = Math.random() * app.screen.width;
      particle.y = Math.random() * app.screen.height * 3 - app.screen.height;
      particle.speedMult = speedMult;
      particle.baseY = particle.y;

      layer.addChild(particle);
    }
  }

  createVerticalParticles(bgFar, 60, 1, 0.3, 0x4444ff);  // Distant stars
  createVerticalParticles(bgMid, 40, 2, 0.6, 0x6666ff);  // Mid stars
  createVerticalParticles(bgNear, 30, 3, 0.9, 0x8888ff); // Near stars

  // Create cliff and starting platform
  const cliffContainer = new Container();
  worldContainer.addChild(cliffContainer);

  const cliffTop = new Graphics()
    .rect(0, 0, CLIFF_EDGE, 60)
    .fill({ color: 0x3d3d5c })
    .rect(0, 0, CLIFF_EDGE, 10)
    .fill({ color: 0x4d4d6c });
  cliffTop.y = FALL_START_Y - 60;
  cliffContainer.addChild(cliffTop);

  // Add cliff edge marker
  const cliffEdgeSign = new Graphics()
    .rect(CLIFF_EDGE - 10, -40, 10, 40)
    .fill({ color: 0x666666 })
    .moveTo(CLIFF_EDGE - 10, -40)
    .lineTo(CLIFF_EDGE + 20, -30)
    .lineTo(CLIFF_EDGE + 20, -10)
    .lineTo(CLIFF_EDGE - 10, -20)
    .fill({ color: 0xffff00 });
  cliffEdgeSign.y = FALL_START_Y - 60;
  cliffContainer.addChild(cliffEdgeSign);

  // Create cliff walls (for visual during fall)
  const leftWall = new Graphics();
  const rightWall = new Graphics();

  function drawCliffWalls(height) {
    leftWall.clear();
    rightWall.clear();

    // Left wall
    leftWall.rect(-200, FALL_START_Y, 200, height)
      .fill({ color: 0x2d2d44 });

    // Right wall  
    rightWall.rect(app.screen.width, FALL_START_Y, 200, height)
      .fill({ color: 0x2d2d44 });

    // Add some texture
    for (let i = 0; i < height / 100; i++) {
      const y = FALL_START_Y + i * 100 + Math.random() * 50;
      leftWall.rect(-180, y, 150, 5)
        .fill({ color: 0x1d1d33, alpha: 0.5 });
      rightWall.rect(app.screen.width + 20, y, 150, 5)
        .fill({ color: 0x1d1d33, alpha: 0.5 });
    }
  }

  drawCliffWalls(3000);
  worldContainer.addChild(leftWall, rightWall);

  // Create obstacles container
  const obstaclesContainer = new Container();
  worldContainer.addChild(obstaclesContainer);
  const obstacles = [];

  // Generate obstacles throughout the fall
  function generateObstacles() {
    const obstacleTypes = [
      { type: 'spike', color: 0xff4444 },
      { type: 'platform', color: 0xff8844 },
      { type: 'spinner', color: 0xff44ff },
      { type: 'wall', color: 0x4444ff }
    ];

    for (let i = 0; i < 50; i++) {
      const type = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
      const obstacle = new Container();
      obstacle.obstacleType = type.type;

      if (type.type === 'spike') {
        const spike = new Graphics();
        const size = 30 + Math.random() * 20;
        spike.moveTo(0, 0)
          .lineTo(size / 2, -size)
          .lineTo(size, 0)
          .fill({ color: type.color });
        obstacle.addChild(spike);
        obstacle.width = size;
        obstacle.height = size;
      } else if (type.type === 'platform') {
        const platform = new Graphics()
          .rect(0, 0, 80 + Math.random() * 100, 20)
          .fill({ color: type.color });
        obstacle.addChild(platform);
        obstacle.width = platform.width;
        obstacle.height = 20;
      } else if (type.type === 'spinner') {
        const spinner = new Graphics()
          .rect(-60, -8, 120, 16)
          .fill({ color: type.color })
          .rect(-8, -60, 16, 120)
          .fill({ color: type.color });
        obstacle.addChild(spinner);
        obstacle.width = 120;
        obstacle.height = 120;
        obstacle.spinSpeed = 0.02 + Math.random() * 0.03;
      } else if (type.type === 'wall') {
        const side = Math.random() > 0.5 ? 'left' : 'right';
        const wall = new Graphics()
          .rect(0, 0, 150, 30)
          .fill({ color: type.color });
        obstacle.addChild(wall);
        obstacle.width = 150;
        obstacle.height = 30;
        obstacle.wallSide = side;
      }

      // Position obstacles
      if (obstacle.wallSide === 'left') {
        obstacle.x = 0;
      } else if (obstacle.wallSide === 'right') {
        obstacle.x = app.screen.width - obstacle.width;
      } else {
        obstacle.x = 100 + Math.random() * (app.screen.width - 200 - obstacle.width);
      }
      obstacle.y = FALL_START_Y + 300 + i * 150 + Math.random() * 100;

      obstaclesContainer.addChild(obstacle);
      obstacles.push(obstacle);
    }
  }

  generateObstacles();

  // Create landing zone at the bottom
  const landingZone = new Container();
  const LANDING_Y = FALL_START_Y + 8000; // Long fall!

  // Create multiple landing pads with different scores
  const landingPads = [
    { x: app.screen.width / 2 - 150, width: 60, color: 0x44ff44, points: 1000, label: 'PERFECT' },
    { x: app.screen.width / 2 - 90, width: 180, color: 0x88ff88, points: 500, label: 'GREAT' },
    { x: app.screen.width / 2 - 180, width: 360, color: 0xccffcc, points: 100, label: 'GOOD' }
  ];

  landingPads.forEach(pad => {
    const padGraphic = new Graphics()
      .rect(pad.x, 0, pad.width, 40)
      .fill({ color: pad.color })
      .rect(pad.x + 5, 5, pad.width - 10, 30)
      .fill({ color: pad.color, alpha: 0.5 });

    padGraphic.y = LANDING_Y;
    landingZone.addChild(padGraphic);

    // Add label
    const label = new Text({
      text: pad.label,
      style: {
        fontFamily: 'Arial',
        fontSize: 16,
        fill: 0x000000,
        fontWeight: 'bold'
      }
    });
    label.anchor.set(0.5);
    label.x = pad.x + pad.width / 2;
    label.y = LANDING_Y + 20;
    landingZone.addChild(label);
  });

  // Add ground below landing zone
  const ground = new Graphics()
    .rect(0, LANDING_Y + 40, app.screen.width, 200)
    .fill({ color: 0x2d2d44 });
  landingZone.addChild(ground);

  worldContainer.addChild(landingZone);

  // ===============================
  // ANIMATED PLAYER CHARACTER
  // ===============================
  
  // Create player container
  const player = new Container();
  
  // Create animated sprites for each state
  const playerSprites = {
    idle: new AnimatedSprite(animations.idle),
    running: new AnimatedSprite(animations.running),
    jetpackActivation: new AnimatedSprite(animations.jetpackActivation),
    falling: new AnimatedSprite(animations.falling)
  };
  
  // Configure each animated sprite
  Object.values(playerSprites).forEach(sprite => {
    sprite.anchor.set(0.5);
    sprite.visible = false;
    sprite.scale.set(0.5); // Scale down to reasonable size
    player.addChild(sprite);
  });
  
  // Set animation speeds (adjust as needed)
  playerSprites.idle.animationSpeed = 0.05;
  playerSprites.idle.loop = true;
  
  playerSprites.running.animationSpeed = 0.15;
  playerSprites.running.loop = true;
  
  playerSprites.jetpackActivation.animationSpeed = 0.2;
  playerSprites.jetpackActivation.loop = false;
  playerSprites.jetpackActivation.onComplete = () => {
    // When jetpack activation finishes, switch to falling
    setPlayerAnimation('falling');
    gameState.jetpackActivating = false;
  };
  
  playerSprites.falling.animationSpeed = 0.1;
  playerSprites.falling.loop = true;
  
  // Current active sprite reference
  let currentPlayerSprite = playerSprites.idle;
  
  // Function to switch animations
  function setPlayerAnimation(animationName) {
    // Hide all sprites
    Object.values(playerSprites).forEach(sprite => {
      sprite.visible = false;
      sprite.stop();
    });
    
    // Show and play the selected animation
    const selectedSprite = playerSprites[animationName];
    if (selectedSprite) {
      selectedSprite.visible = true;
      selectedSprite.gotoAndPlay(0);
      currentPlayerSprite = selectedSprite;
    }
  }
  
  // Start with idle animation
  setPlayerAnimation('idle');
  
  player.x = 100;
  player.y = FALL_START_Y - 60;
  worldContainer.addChild(player);

  // Wind streaks effect container
  const windStreaks = new Container();
  worldContainer.addChildAt(windStreaks, worldContainer.getChildIndex(player));

  // Create jetpack particle effects
  const jetpackParticles = new Container();
  worldContainer.addChildAt(jetpackParticles, worldContainer.getChildIndex(player));
  
  function createJetpackParticle() {
    const particle = new Graphics()
      .circle(0, 0, 3 + Math.random() * 3)
      .fill({ color: 0xff8800, alpha: 0.8 });
    
    particle.x = player.x + (Math.random() - 0.5) * 20;
    particle.y = player.y + 40; // Below player
    particle.velocity = {
      x: (Math.random() - 0.5) * 2,
      y: 5 + Math.random() * 3
    };
    particle.lifetime = 30;
    
    jetpackParticles.addChild(particle);
    
    // Animate particle
    const animateParticle = () => {
      particle.x += particle.velocity.x;
      particle.y += particle.velocity.y;
      particle.alpha -= 0.02;
      particle.scale.x *= 0.95;
      particle.scale.y *= 0.95;
      particle.lifetime--;
      
      if (particle.lifetime <= 0 || particle.alpha <= 0) {
        jetpackParticles.removeChild(particle);
        app.ticker.remove(animateParticle);
      }
    };
    
    app.ticker.add(animateParticle);
  }

  // Create UI (doesn't move with camera)
  const uiContainer = new Container();
  gameContainer.addChild(uiContainer);

  const speedText = new Text({
    text: 'Speed: 0',
    style: {
      fontFamily: 'Arial',
      fontSize: 24,
      fill: 0xffffff,
      fontWeight: 'bold'
    }
  });
  speedText.x = 20;
  speedText.y = 20;
  uiContainer.addChild(speedText);

  const distanceText = new Text({
    text: 'Distance: 0m',
    style: {
      fontFamily: 'Arial',
      fontSize: 24,
      fill: 0xffffff,
      fontWeight: 'bold'
    }
  });
  distanceText.x = 20;
  distanceText.y = 50;
  uiContainer.addChild(distanceText);

  const instructionText = new Text({
    text: 'Walk to the edge with →',
    style: {
      fontFamily: 'Arial',
      fontSize: 20,
      fill: 0xffff00
    }
  });
  instructionText.x = app.screen.width / 2 - 100;
  instructionText.y = 50;
  uiContainer.addChild(instructionText);

  // Back to menu button during game
  const gameMenuButton = createMenuButton(
    'MENU',
    app.screen.width - 120,
    20,
    100,
    40,
    0xff4444,
    () => returnToMenu()
  );
  uiContainer.addChild(gameMenuButton);

  // Game over/success screen
  const resultContainer = new Container();
  resultContainer.visible = false;
  uiContainer.addChild(resultContainer);

  const dimmer = new Graphics()
    .rect(0, 0, app.screen.width, app.screen.height)
    .fill({ color: 0x000000, alpha: 0.7 });
  resultContainer.addChild(dimmer);

  const resultText = new Text({
    text: '',
    style: {
      fontFamily: 'Arial',
      fontSize: 48,
      fill: 0xffffff,
      fontWeight: 'bold'
    }
  });
  resultText.anchor.set(0.5);
  resultText.x = app.screen.width / 2;
  resultText.y = app.screen.height / 2 - 50;
  resultContainer.addChild(resultText);

  const scoreResultText = new Text({
    text: '',
    style: {
      fontFamily: 'Arial',
      fontSize: 32,
      fill: 0xffffff
    }
  });
  scoreResultText.anchor.set(0.5);
  scoreResultText.x = app.screen.width / 2;
  scoreResultText.y = app.screen.height / 2 + 20;
  resultContainer.addChild(scoreResultText);

  const restartText = new Text({
    text: 'Press SPACE to Try Again',
    style: {
      fontFamily: 'Arial',
      fontSize: 24,
      fill: 0xffffff
    }
  });
  restartText.anchor.set(0.5);
  restartText.x = app.screen.width / 2;
  restartText.y = app.screen.height / 2 + 80;
  resultContainer.addChild(restartText);

  const menuReturnButton = createMenuButton(
    'RETURN TO MENU',
    (app.screen.width - 200) / 2,
    app.screen.height / 2 + 130,
    200,
    50,
    0x4488ff,
    () => returnToMenu()
  );
  resultContainer.addChild(menuReturnButton);

  // Input handling
  const keys = {};

  window.addEventListener('keydown', (e) => {
    keys[e.code] = true;

    if (e.code === 'Space' && gameState.currentScene === 'game' &&
      (gameState.phase === 'crashed' || gameState.phase === 'landed')) {
      resetGame();
    }

    if (e.code === 'Escape' && gameState.currentScene !== 'menu') {
      returnToMenu();
    }
  });

  window.addEventListener('keyup', (e) => {
    keys[e.code] = false;
  });

  // Update camera to follow player
  function updateCamera() {
    if (gameState.phase === 'falling' || gameState.phase === 'landed' || gameState.phase === 'crashed') {
      const targetY = -(player.y - CAMERA_OFFSET_Y);
      gameState.cameraY = targetY;
      worldContainer.y = targetY;

      // Parallax effect for background
      bgFar.children.forEach(star => {
        star.y = star.baseY - gameState.cameraY * star.speedMult;
      });
      bgMid.children.forEach(star => {
        star.y = star.baseY - gameState.cameraY * star.speedMult;
      });
      bgNear.children.forEach(star => {
        star.y = star.baseY - gameState.cameraY * star.speedMult;
      });
    }
  }

  // Collision detection
  function checkCollision(player, obstacle) {
    const playerBounds = {
      x: player.x - 30,
      y: player.y - 40,
      width: 60,
      height: 80
    };

    const obstacleBounds = {
      x: obstacle.x,
      y: obstacle.y - obstacle.height,
      width: obstacle.width,
      height: obstacle.height
    };

    return playerBounds.x < obstacleBounds.x + obstacleBounds.width &&
      playerBounds.x + playerBounds.width > obstacleBounds.x &&
      playerBounds.y < obstacleBounds.y + obstacleBounds.height &&
      playerBounds.y + playerBounds.height > obstacleBounds.y;
  }

  // Check landing
  function checkLanding() {
    if (player.y >= LANDING_Y && player.y <= LANDING_Y + 40) {
      gameState.phase = 'landed';
      setPlayerAnimation('idle');

      // Check which pad we landed on
      let landedPad = null;
      for (const pad of landingPads) {
        if (player.x >= pad.x && player.x <= pad.x + pad.width) {
          landedPad = pad;
          break;
        }
      }

      if (landedPad) {
        gameState.score = landedPad.points;
        resultText.text = landedPad.label + '!';
        resultText.style.fill = landedPad.color;
        scoreResultText.text = `Score: ${gameState.score}`;

        // Update high score
        if (gameState.score > gameState.highScore) {
          gameState.highScore = gameState.score;
          localStorage.setItem('oneJumpHighScore', gameState.highScore);
        }
      } else {
        resultText.text = 'MISSED!';
        resultText.style.fill = 0xff4444;
        scoreResultText.text = 'Try to land on the pads!';
      }

      resultContainer.visible = true;

      // Stop player
      gameState.velocity.y = 0;
      gameState.velocity.x = 0;
    } else if (player.y > LANDING_Y + 40) {
      // Crashed into ground
      gameState.phase = 'crashed';
      setPlayerAnimation('idle');
      resultText.text = 'CRASHED!';
      resultText.style.fill = 0xff4444;
      scoreResultText.text = 'Too fast!';
      resultContainer.visible = true;
    }
  }

  // Reset game
  function resetGame() {
    gameState.phase = 'walking';
    gameState.score = 0;
    gameState.distance = 0;
    gameState.velocity = { x: 0, y: 0 };
    gameState.fallSpeed = 0;
    gameState.cameraY = 0;
    gameState.isMoving = false;
    gameState.jetpackActivating = false;

    player.x = 100;
    player.y = FALL_START_Y - 60;
    player.rotation = 0;
    
    // Reset to idle animation
    setPlayerAnimation('idle');
    
    // Reset sprite tints
    Object.values(playerSprites).forEach(sprite => {
      sprite.tint = 0xffffff;
    });

    worldContainer.y = 0;
    resultContainer.visible = false;
    instructionText.text = 'Walk to the edge with →';
    instructionText.visible = true;

    // Clear particles
    windStreaks.removeChildren();
    jetpackParticles.removeChildren();

    // Reset obstacles
    obstacles.forEach(obstacle => {
      if (obstacle.obstacleType === 'spinner') {
        obstacle.rotation = 0;
      }
    });
  }

  // Initialize scenes
  await setupMenuScene();
  setupHighscoresScene();

  // Game loop
  app.ticker.add((ticker) => {
    const deltaTime = ticker.deltaTime / 60;

    // Only update game if in game scene
    if (gameState.currentScene !== 'game') return;

    // Handle input
    const wasMoving = gameState.isMoving;
    gameState.horizontalInput = 0;
    if (keys['KeyA'] || keys['ArrowLeft']) gameState.horizontalInput = -1;
    if (keys['KeyD'] || keys['ArrowRight']) gameState.horizontalInput = 1;
    gameState.isMoving = gameState.horizontalInput !== 0;

    if (gameState.phase === 'walking') {
      // Walking phase animations
      if (gameState.horizontalInput > 0) {
        if (!wasMoving || currentPlayerSprite !== playerSprites.running) {
          setPlayerAnimation('running');
        }
        player.x += INITIAL_WALK_SPEED * deltaTime;
        instructionText.text = 'Keep going...';
        // Face right
        player.scale.x = Math.abs(player.scale.x);
      } else if (gameState.horizontalInput < 0) {
        if (!wasMoving || currentPlayerSprite !== playerSprites.running) {
          setPlayerAnimation('running');
        }
        player.x -= INITIAL_WALK_SPEED * deltaTime;
        // Face left
        player.scale.x = -Math.abs(player.scale.x);
      } else {
        // Not moving - switch to idle
        if (wasMoving || currentPlayerSprite !== playerSprites.idle) {
          setPlayerAnimation('idle');
        }
      }

      // Check if walked off cliff
      if (player.x >= CLIFF_EDGE) {
        gameState.phase = 'falling';
        gameState.jetpackActivating = true;
        setPlayerAnimation('jetpackActivation');
        instructionText.text = 'Use A/D or ←/→ to steer!';
      }

    } else if (gameState.phase === 'falling') {
      // Falling phase

      // Apply gravity
      gameState.velocity.y += GRAVITY * deltaTime;
      gameState.velocity.y = Math.min(gameState.velocity.y, MAX_FALL_SPEED);

      // Horizontal movement
      gameState.velocity.x = gameState.horizontalInput * HORIZONTAL_SPEED;

      // Update position
      player.x += gameState.velocity.x * deltaTime;
      player.y += gameState.velocity.y * deltaTime;

      // Keep player in bounds
      player.x = Math.max(30, Math.min(app.screen.width - 30, player.x));

      // Face direction of movement
      if (gameState.horizontalInput > 0) {
        player.scale.x = Math.abs(player.scale.x);
      } else if (gameState.horizontalInput < 0) {
        player.scale.x = -Math.abs(player.scale.x);
      }

      // Update distance
      gameState.distance = Math.floor((player.y - FALL_START_Y) / 10);

      // Tilt player based on horizontal movement
      player.rotation = gameState.horizontalInput * 0.15;

      // Create jetpack particles if falling
      if (!gameState.jetpackActivating && Math.random() < 0.5) {
        createJetpackParticle();
      }

      // Add wind streak effects
      if (Math.random() < 0.3 && gameState.velocity.y > 200) {
        const streak = new Graphics()
          .rect(0, 0, 2, 20 + Math.random() * 30)
          .fill({ color: 0xffffff, alpha: 0.3 });
        streak.x = player.x + (Math.random() - 0.5) * 60;
        streak.y = player.y - 40;
        windStreaks.addChild(streak);

        // Animate streak
        const animateStreak = () => {
          streak.y -= gameState.velocity.y * 0.3 * deltaTime;
          streak.alpha -= 0.02;
          streak.scale.y *= 1.02;

          if (streak.alpha <= 0) {
            windStreaks.removeChild(streak);
            app.ticker.remove(animateStreak);
          }
        };
        app.ticker.add(animateStreak);
      }

      // Check obstacle collisions
      for (const obstacle of obstacles) {
        // Animate spinners
        if (obstacle.obstacleType === 'spinner') {
          obstacle.rotation += obstacle.spinSpeed;
        }

        if (checkCollision(player, obstacle)) {
          gameState.phase = 'crashed';
          // Tint all sprites red on crash
          Object.values(playerSprites).forEach(sprite => {
            sprite.tint = 0xff0000;
          });
          resultText.text = 'CRASHED!';
          resultText.style.fill = 0xff4444;
          scoreResultText.text = `Distance: ${gameState.distance}m`;
          resultContainer.visible = true;

          // Death effect
          const crashEffect = new Graphics()
            .circle(0, 0, 50)
            .fill({ color: 0xff0000, alpha: 0.5 });
          crashEffect.x = player.x;
          crashEffect.y = player.y;
          worldContainer.addChild(crashEffect);

          break;
        }
      }

      // Check landing
      checkLanding();

      // Update camera
      updateCamera();

      // Update UI
      speedText.text = `Speed: ${Math.floor(gameState.velocity.y)}`;
      distanceText.text = `Distance: ${gameState.distance}m`;

      // Hide instruction after falling for a bit
      if (gameState.distance > 50) {
        instructionText.visible = false;
      }
    }

    // Clean up old particles
    if (windStreaks.children.length > 50) {
      windStreaks.removeChildAt(0);
    }
    if (jetpackParticles.children.length > 30) {
      jetpackParticles.removeChildAt(0);
    }
  });
})();