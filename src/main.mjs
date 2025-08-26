import { Application, Assets, Sprite } from "pixi.js";

(async () => {
  // Create a new application
  const app = new Application();

  // Initialize the application
  await app.init({ background: "#1099bb", resizeTo: window });

  // Append the application canvas to the document body
  document.getElementById("pixi-container").appendChild(app.canvas);

  // Load textures
  const starskyPixelTexture = await Assets.load("/public/assets/starskyPixel.png");  
  const starskyTexture = await Assets.load("/public/assets/Starsky.png");
  const texture = await Assets.load("/public/assets/bunny.png");

  // Create a bunny Sprite
  const bunny = new Sprite(texture);

  // Center the sprite's anchor point
  bunny.anchor.set(0.5);

  // Move the sprite to the center of the screen
  bunny.position.set(app.screen.width / 2, app.screen.height / 2);

  // Add the bunny to the stage
  app.stage.addChild(bunny);

  // Listen for animate update
  app.ticker.add((time) => {
    // Just for fun, let's rotate mr rabbit a little.
    // * Delta is 1 if running at 100% performance *
    // * Creates frame-independent transformation *
    bunny.rotation += 0.1 * time.deltaTime;

  document.addEventListener("keydown", onKeyDown);

function onKeyDown(event) {
  switch (event.key) {
    case "4": {
      app.stage.removeChildren();
      const starsky = new Sprite(starskyTexture);
      starsky.anchor.set(0.5);
      starsky.position.set(app.screen.width / 2, app.screen.height / 2);
      starsky.scale.set(0.2);
      app.stage.addChild(starsky);
      break;
    }
    case "5": {
      app.stage.removeChildren();
      const starskyPixel = new Sprite(starskyPixelTexture);
      starskyPixel.anchor.set(0.5);
      starskyPixel.position.set(app.screen.width / 2, app.screen.height / 2);
      starskyPixel.scale.set(0.2);
      app.stage.addChild(starskyPixel);
      break;
    }
  }
}
  });
})();