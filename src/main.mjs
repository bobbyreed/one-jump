import { Application, Assets, Sprite, Graphics, Container, Text } from "pixi.js";

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
  
  // Game state
  let gameState = {
    phase: 'walking', // 'walking', 'falling', 'landed', 'crashed'
    score: 0,
    highScore: 0,
    distance: 0,
    velocity: { x: 0, y: 0 },
    cameraY: 0,
    fallSpeed: 0,
    horizontalInput: 0
  };
  
  // Create main game container (this will move with camera)
  const worldContainer = new Container();
  app.stage.addChild(worldContainer);
  
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
          .lineTo(size/2, -size)
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
  
  // Create player character
  const player = new Container();
  const playerBody = new Graphics()
    .rect(-15, -20, 30, 40)
    .fill({ color: 0x00ff88 })
    .rect(-10, -15, 8, 8)
    .fill({ color: 0x001122 })
    .rect(2, -15, 8, 8)
    .fill({ color: 0x001122 })
    .rect(-5, -5, 10, 3)
    .fill({ color: 0x001122 });
  
  player.addChild(playerBody);
  player.x = 100;
  player.y = FALL_START_Y - 60;
  worldContainer.addChild(player);
  
  // Wind streaks effect container
  const windStreaks = new Container();
  worldContainer.addChildAt(windStreaks, worldContainer.getChildIndex(player));
  
  // Create UI (doesn't move with camera)
  const uiContainer = new Container();
  app.stage.addChild(uiContainer);
  
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
  
  // Input handling
  const keys = {};
  
  window.addEventListener('keydown', (e) => {
    keys[e.code] = true;
    
    if (e.code === 'Space' && (gameState.phase === 'crashed' || gameState.phase === 'landed')) {
      resetGame();
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
      x: player.x - 15,
      y: player.y - 20,
      width: 30,
      height: 40
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
    
    player.x = 100;
    player.y = FALL_START_Y - 60;
    player.rotation = 0;
    player.tint = 0xffffff;
    
    worldContainer.y = 0;
    resultContainer.visible = false;
    instructionText.text = 'Walk to the edge with →';
    
    // Clear wind streaks
    windStreaks.removeChildren();
    
    // Reset obstacles
    obstacles.forEach(obstacle => {
      if (obstacle.obstacleType === 'spinner') {
        obstacle.rotation = 0;
      }
    });
  }
  
  // Game loop
  app.ticker.add((ticker) => {
    const deltaTime = ticker.deltaTime / 60;
    
    // Handle input
    gameState.horizontalInput = 0;
    if (keys['KeyA'] || keys['ArrowLeft']) gameState.horizontalInput = -1;
    if (keys['KeyD'] || keys['ArrowRight']) gameState.horizontalInput = 1;
    
    if (gameState.phase === 'walking') {
      // Walking phase
      if (gameState.horizontalInput > 0) {
        player.x += INITIAL_WALK_SPEED * deltaTime;
        instructionText.text = 'Keep going...';
      }
      
      // Check if walked off cliff
      if (player.x >= CLIFF_EDGE) {
        gameState.phase = 'falling';
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
      
      // Update distance
      gameState.distance = Math.floor((player.y - FALL_START_Y) / 10);
      
      // Tilt player based on horizontal movement
      player.rotation = gameState.horizontalInput * 0.15;
      
      // Add wind streak effects
      if (Math.random() < 0.3 && gameState.velocity.y > 200) {
        const streak = new Graphics()
          .rect(0, 0, 2, 20 + Math.random() * 30)
          .fill({ color: 0xffffff, alpha: 0.3 });
        streak.x = player.x + (Math.random() - 0.5) * 60;
        streak.y = player.y - 40;
        windStreaks.addChild(streak);
        
        // Animate streak
        const animateStreak = (delta) => {
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
          player.tint = 0xff0000;
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
    
    // Clean up old wind streaks
    if (windStreaks.children.length > 50) {
      windStreaks.removeChildAt(0);
    }
  });
})();