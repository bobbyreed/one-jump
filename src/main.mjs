import Game from './Game.js';

// Initialize the game when DOM is ready
async function init() {
  try {
    const game = new Game();
    await game.init();

    // Make game accessible globally for debugging
    window.gameInstance = game;

    console.log('Game started successfully');
  } catch (error) {
    console.error('Failed to initialize game:', error);
  }
}

// Start when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}