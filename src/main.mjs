import Game from './Game.js';

async function init() {
  try {
    const game = new Game();
    await game.init();
    
    // Make game accessible globally for debugging
    window.gameInstance = game;
    
    // Add debug helpers
    window.debug = {
      checkInput: () => {
        console.log('Input enabled:', game.inputManager.enabled);
        console.log('Keys pressed:', game.inputManager.keys);
        const h = game.inputManager.getHorizontalInput();
        console.log('Horizontal input:', h);
      },
      
      testMovement: () => {
        // Directly test if GameScene is receiving input
        const gameScene = game.sceneManager.scenes.get('game');
        if (gameScene && gameScene.player) {
          console.log('Player state:', gameScene.player.state);
          console.log('Player pos:', gameScene.player.position);
          console.log('Game phase:', gameScene.gameState.phase);
        } else {
          console.log('Game scene or player not found');
        }
      },
      
      goToGame: () => {
        game.sceneManager.changeScene('game');
        setTimeout(() => {
          console.log('Switched to game, try pressing arrow keys now');
        }, 100);
      }
    };
    
    console.log('✅ Game started! Debug commands available:');
    console.log('- debug.checkInput() - Check if input is working');
    console.log('- debug.testMovement() - Check player state');
    console.log('- debug.goToGame() - Skip to game scene');
    
  } catch (error) {
    console.error('Failed to initialize game:', error);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}