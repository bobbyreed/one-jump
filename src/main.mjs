import { Application, Assets, Sprite, Graphics, Container, Text } from "pixi.js";

(async () => {
  // Create application
  const app = new Application();
  
  // Initialize the application
  await app.init({ 
    background: "#1a1a2e", 
    resizeTo: window,
    antialias: true,
    resolution: window.devicePixelRatio || 1
  });
  
  // Append canvas to the container
  document.getElementById("pixi-container").appendChild(app.canvas);
  
  // Game constants
  const GRAVITY = 1500;
  const JUMP_FORCE = -650;
  const GAME_SPEED = 300;
  const GROUND_Y = app.screen.height - 100;
  
  // Game state
  let gameState = {
    isPlaying: true,
    isJumping: false,
    isDead: false,
    score: 0,
    highScore: 0,
    velocity: { x: 0, y: 0 }
  };
  
  // Create main game container
  const gameContainer = new Container();
  app.stage.addChild(gameContainer);
  
  // Create parallax background layers
  const bgLayer1 = new Container();
  const bgLayer2 = new Container();
  const bgLayer3 = new Container();
  gameContainer.addChild(bgLayer1, bgLayer2, bgLayer3);
  
  // Create starfield background
  function createStarfield(layer, count, size, speed) {
    for (let i = 0; i < count; i++) {
      const star = new Graphics()
        .circle(0, 0, size)
        .fill({ color: 0xffffff, alpha: Math.random() * 0.8 + 0.2 });
      
      star.x = Math.random() * app.screen.width * 2;
      star.y = Math.random() * (GROUND_Y - 100);
      star.speed = speed;
      
      layer.addChild(star);
    }
  }
  
  createStarfield(bgLayer1, 50, 1, 0.2);  // Distant stars
  createStarfield(bgLayer2, 30, 2, 0.5);  // Mid stars
  createStarfield(bgLayer3, 20, 3, 1);    // Near stars
  
  // Create ground
  const groundContainer = new Container();
  gameContainer.addChild(groundContainer);
  
  const groundHeight = 100;
  const groundSegmentWidth = 200;
  const groundSegments = [];
  
  for (let i = 0; i < Math.ceil(app.screen.width / groundSegmentWidth) + 2; i++) {
    const ground = new Graphics()
      .rect(0, 0, groundSegmentWidth, groundHeight)
      .fill({ color: 0x2d2d44 })
      .rect(0, 0, groundSegmentWidth, 10)
      .fill({ color: 0x3d3d5c });
    
    ground.x = i * groundSegmentWidth;
    ground.y = GROUND_Y;
    groundContainer.addChild(ground);
    groundSegments.push(ground);
    
    // Add ground details
    for (let j = 0; j < 3; j++) {
      const detail = new Graphics()
        .rect(0, 0, Math.random() * 40 + 10, 3)
        .fill({ color: 0x4d4d6c, alpha: 0.5 });
      detail.x = Math.random() * groundSegmentWidth;
      detail.y = 15 + Math.random() * 30;
      ground.addChild(detail);
    }
  }
  
  // Create player character
  const player = new Container();
  const playerBody = new Graphics()
    .rect(-20, -40, 40, 40)
    .fill({ color: 0x00ff88 })
    .rect(-15, -35, 10, 10)
    .fill({ color: 0x001122 })
    .rect(5, -35, 10, 10)
    .fill({ color: 0x001122 });
  
  player.addChild(playerBody);
  player.x = app.screen.width * 0.25;
  player.y = GROUND_Y;
  gameContainer.addChild(player);
  
  // Add trail effect
  const trail = new Container();
  gameContainer.addChildAt(trail, gameContainer.getChildIndex(player));
  
  // Create obstacles container
  const obstaclesContainer = new Container();
  gameContainer.addChild(obstaclesContainer);
  const obstacles = [];
  
  // Obstacle types
  function createObstacle(type) {
    const obstacle = new Container();
    
    if (type === 'spike') {
      const spike = new Graphics()
        .moveTo(0, 0)
        .lineTo(25, -50)
        .lineTo(50, 0)
        .fill({ color: 0xff4444 });
      obstacle.addChild(spike);
      obstacle.width = 50;
      obstacle.height = 50;
    } else if (type === 'box') {
      const box = new Graphics()
        .rect(0, -60, 40, 60)
        .fill({ color: 0xff6644 })
        .rect(5, -55, 30, 10)
        .fill({ color: 0xff8866 });
      obstacle.addChild(box);
      obstacle.width = 40;
      obstacle.height = 60;
    } else if (type === 'double') {
      const spike1 = new Graphics()
        .moveTo(0, 0)
        .lineTo(20, -40)
        .lineTo(40, 0)
        .fill({ color: 0xff4444 });
      const spike2 = new Graphics()
        .moveTo(50, 0)
        .lineTo(70, -40)
        .lineTo(90, 0)
        .fill({ color: 0xff4444 });
      obstacle.addChild(spike1, spike2);
      obstacle.width = 90;
      obstacle.height = 40;
    }
    
    obstacle.x = app.screen.width + 100;
    obstacle.y = GROUND_Y;
    obstacle.type = type;
    
    return obstacle;
  }
  
  // Spawn obstacles
  let obstacleTimer = 0;
  let nextObstacleTime = 2;
  
  // Create UI
  const uiContainer = new Container();
  app.stage.addChild(uiContainer);
  
  const scoreText = new Text({
    text: 'Score: 0',
    style: {
      fontFamily: 'Arial',
      fontSize: 32,
      fill: 0xffffff,
      fontWeight: 'bold'
    }
  });
  scoreText.x = 20;
  scoreText.y = 20;
  uiContainer.addChild(scoreText);
  
  const highScoreText = new Text({
    text: 'Best: 0',
    style: {
      fontFamily: 'Arial',
      fontSize: 24,
      fill: 0x888888
    }
  });
  highScoreText.x = 20;
  highScoreText.y = 60;
  uiContainer.addChild(highScoreText);
  
  // Game over screen
  const gameOverContainer = new Container();
  gameOverContainer.visible = false;
  uiContainer.addChild(gameOverContainer);
  
  const dimmer = new Graphics()
    .rect(0, 0, app.screen.width, app.screen.height)
    .fill({ color: 0x000000, alpha: 0.7 });
  gameOverContainer.addChild(dimmer);
  
  const gameOverText = new Text({
    text: 'GAME OVER',
    style: {
      fontFamily: 'Arial',
      fontSize: 64,
      fill: 0xff4444,
      fontWeight: 'bold'
    }
  });
  gameOverText.anchor.set(0.5);
  gameOverText.x = app.screen.width / 2;
  gameOverText.y = app.screen.height / 2 - 50;
  gameOverContainer.addChild(gameOverText);
  
  const restartText = new Text({
    text: 'Press SPACE or Click to Restart',
    style: {
      fontFamily: 'Arial',
      fontSize: 24,
      fill: 0xffffff
    }
  });
  restartText.anchor.set(0.5);
  restartText.x = app.screen.width / 2;
  restartText.y = app.screen.height / 2 + 20;
  gameOverContainer.addChild(restartText);
  
  // Input handling
  function jump() {
    if (gameState.isDead) {
      resetGame();
      return;
    }
    
    if (!gameState.isJumping && gameState.isPlaying) {
      gameState.velocity.y = JUMP_FORCE;
      gameState.isJumping = true;
      
      // Jump effect
      const jumpEffect = new Graphics()
        .circle(0, 0, 30)
        .stroke({ width: 3, color: 0x00ff88, alpha: 0.5 });
      jumpEffect.x = player.x;
      jumpEffect.y = player.y;
      gameContainer.addChild(jumpEffect);
      
      // Animate jump effect
      const startScale = 1;
      const endScale = 2;
      let effectTime = 0;
      
      const animateEffect = (delta) => {
        effectTime += delta.deltaTime;
        const progress = effectTime / 20;
        
        if (progress >= 1) {
          gameContainer.removeChild(jumpEffect);
          app.ticker.remove(animateEffect);
        } else {
          jumpEffect.scale.set(startScale + (endScale - startScale) * progress);
          jumpEffect.alpha = 1 - progress;
        }
      };
      
      app.ticker.add(animateEffect);
    }
  }
  
  // Keyboard controls
  window.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
      e.preventDefault();
      jump();
    }
  });
  
  // Mouse/Touch controls
  app.canvas.addEventListener('pointerdown', jump);
  app.canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    jump();
  }, { passive: false });
  
  // Collision detection
  function checkCollision(player, obstacle) {
    const playerBounds = {
      x: player.x - 20,
      y: player.y - 40,
      width: 40,
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
  
  // Game over
  function gameOver() {
    gameState.isDead = true;
    gameState.isPlaying = false;
    gameOverContainer.visible = true;
    
    if (gameState.score > gameState.highScore) {
      gameState.highScore = gameState.score;
      highScoreText.text = `Best: ${gameState.highScore}`;
    }
    
    // Death effect
    const deathEffect = new Graphics()
      .circle(0, 0, 50)
      .fill({ color: 0xff0000, alpha: 0.3 });
    deathEffect.x = player.x;
    deathEffect.y = player.y;
    gameContainer.addChild(deathEffect);
    
    // Flash effect
    player.tint = 0xff0000;
  }
  
  // Reset game
  function resetGame() {
    gameState.isDead = false;
    gameState.isPlaying = true;
    gameState.isJumping = false;
    gameState.score = 0;
    gameState.velocity.y = 0;
    
    player.y = GROUND_Y;
    player.tint = 0xffffff;
    
    scoreText.text = 'Score: 0';
    gameOverContainer.visible = false;
    
    // Clear obstacles
    obstacles.forEach(obstacle => {
      obstaclesContainer.removeChild(obstacle);
    });
    obstacles.length = 0;
    
    obstacleTimer = 0;
    nextObstacleTime = 2;
  }
  
  // Game loop
  app.ticker.add((ticker) => {
    const deltaTime = ticker.deltaTime / 60; // Convert to seconds
    
    if (gameState.isPlaying && !gameState.isDead) {
      // Update score
      gameState.score += Math.floor(deltaTime * 10);
      scoreText.text = `Score: ${gameState.score}`;
      
      // Apply gravity
      gameState.velocity.y += GRAVITY * deltaTime;
      player.y += gameState.velocity.y * deltaTime;
      
      // Ground collision
      if (player.y >= GROUND_Y) {
        player.y = GROUND_Y;
        gameState.velocity.y = 0;
        gameState.isJumping = false;
      }
      
      // Player animation
      if (gameState.isJumping) {
        player.rotation = -0.2;
      } else {
        player.rotation = 0;
      }
      
      // Add trail particle when jumping
      if (gameState.isJumping && Math.random() < 0.3) {
        const particle = new Graphics()
          .circle(0, 0, Math.random() * 5 + 2)
          .fill({ color: 0x00ff88, alpha: 0.6 });
        particle.x = player.x - 10;
        particle.y = player.y - 20;
        trail.addChild(particle);
        
        // Animate trail particle
        const animateParticle = (delta) => {
          particle.x -= GAME_SPEED * 1.5 * deltaTime;
          particle.alpha -= 0.02;
          particle.scale.x *= 0.95;
          particle.scale.y *= 0.95;
          
          if (particle.alpha <= 0) {
            trail.removeChild(particle);
            app.ticker.remove(animateParticle);
          }
        };
        app.ticker.add(animateParticle);
      }
      
      // Move background layers (parallax)
      bgLayer1.children.forEach(star => {
        star.x -= star.speed * GAME_SPEED * deltaTime;
        if (star.x < -50) star.x = app.screen.width + 50;
      });
      
      bgLayer2.children.forEach(star => {
        star.x -= star.speed * GAME_SPEED * deltaTime;
        if (star.x < -50) star.x = app.screen.width + 50;
      });
      
      bgLayer3.children.forEach(star => {
        star.x -= star.speed * GAME_SPEED * deltaTime;
        if (star.x < -50) star.x = app.screen.width + 50;
      });
      
      // Move ground
      groundSegments.forEach(segment => {
        segment.x -= GAME_SPEED * deltaTime;
        if (segment.x < -groundSegmentWidth) {
          segment.x += groundSegmentWidth * groundSegments.length;
        }
      });
      
      // Spawn obstacles
      obstacleTimer += deltaTime;
      if (obstacleTimer >= nextObstacleTime) {
        const types = ['spike', 'box', 'double'];
        const type = types[Math.floor(Math.random() * types.length)];
        const obstacle = createObstacle(type);
        obstaclesContainer.addChild(obstacle);
        obstacles.push(obstacle);
        
        obstacleTimer = 0;
        nextObstacleTime = 1.5 + Math.random() * 2;
        
        // Increase difficulty
        if (gameState.score > 500) {
          nextObstacleTime *= 0.8;
        }
      }
      
      // Move and check obstacles
      for (let i = obstacles.length - 1; i >= 0; i--) {
        const obstacle = obstacles[i];
        obstacle.x -= GAME_SPEED * deltaTime;
        
        // Check collision
        if (checkCollision(player, obstacle)) {
          gameOver();
        }
        
        // Remove off-screen obstacles
        if (obstacle.x < -200) {
          obstaclesContainer.removeChild(obstacle);
          obstacles.splice(i, 1);
        }
      }
    }
  });
})();