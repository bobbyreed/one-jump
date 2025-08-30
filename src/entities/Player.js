import { Container, AnimatedSprite } from 'pixi.js';
import { PHYSICS, ANIMATION, PLAYER_STATES } from '../config/Constants.js';

export default class Player {
    constructor(assetManager) {
        this.container = new Container();
        this.assetManager = assetManager;

        // Physics properties
        this.velocity = { x: 0, y: 0 };
        this.position = { x: 100, y: 140 }; // FALL_START_Y - 60
        this.state = PLAYER_STATES.WALKING;

        // Animation sprites
        this.sprites = {};
        this.currentSprite = null;

        // Animation state
        this.jetpackActivating = false;
        this.isMoving = false;
        this.facingDirection = 1; // 1 = right, -1 = left

        this.createAnimations();
    }

    createAnimations() {
        // Create animated sprites for each state
        const animations = {
            idle: this.assetManager.getAnimation('idle'),
            running: this.assetManager.getAnimation('running'),
            jetpackActivation: this.assetManager.getAnimation('jetpackActivation'),
            falling: this.assetManager.getAnimation('falling')
        };

        // Create sprite for each animation
        for (const [name, textures] of Object.entries(animations)) {
            const sprite = new AnimatedSprite(textures);
            sprite.anchor.set(0.5);
            sprite.visible = false;
            sprite.scale.set(ANIMATION.SPRITE_SCALE);

            this.sprites[name] = sprite;
            this.container.addChild(sprite);
        }

        // Configure animation speeds
        this.sprites.idle.animationSpeed = 0.05;
        this.sprites.idle.loop = true;

        this.sprites.running.animationSpeed = 0.15;
        this.sprites.running.loop = true;

        this.sprites.jetpackActivation.animationSpeed = 0.2;
        this.sprites.jetpackActivation.loop = false;
        this.sprites.jetpackActivation.onComplete = () => {
            this.setAnimation('falling');
            this.jetpackActivating = false;
        };

        this.sprites.falling.animationSpeed = 0.1;
        this.sprites.falling.loop = true;

        // Start with idle
        this.setAnimation('idle');
    }

    setAnimation(animationName) {
        // Hide all sprites
        Object.values(this.sprites).forEach(sprite => {
            sprite.visible = false;
            sprite.stop();
        });

        // Show and play selected animation
        const selectedSprite = this.sprites[animationName];
        if (selectedSprite) {
            selectedSprite.visible = true;
            selectedSprite.gotoAndPlay(0);
            this.currentSprite = selectedSprite;
        }
    }

    update(deltaTime, horizontalInput) {
        const wasMoving = this.isMoving;
        this.isMoving = horizontalInput !== 0;

        switch (this.state) {
            case PLAYER_STATES.WALKING:
                this.updateWalking(deltaTime, horizontalInput, wasMoving);
                break;

            case PLAYER_STATES.FALLING:
                this.updateFalling(deltaTime, horizontalInput);
                break;

            case PLAYER_STATES.LANDED:
            case PLAYER_STATES.CRASHED:
                // No movement updates
                break;
        }

        // Update container position
        this.container.x = this.position.x;
        this.container.y = this.position.y;

        // Update facing direction
        if (horizontalInput > 0) {
            this.facingDirection = 1;
            this.container.scale.x = Math.abs(this.container.scale.x);
        } else if (horizontalInput < 0) {
            this.facingDirection = -1;
            this.container.scale.x = -Math.abs(this.container.scale.x);
        }
    }

    updateWalking(deltaTime, horizontalInput, wasMoving) {
        if (horizontalInput !== 0) {
            if (!wasMoving || this.currentSprite !== this.sprites.running) {
                this.setAnimation('running');
            }
            this.position.x += horizontalInput * PHYSICS.INITIAL_WALK_SPEED * deltaTime;
        } else {
            if (wasMoving || this.currentSprite !== this.sprites.idle) {
                this.setAnimation('idle');
            }
        }
    }

    updateFalling(deltaTime, horizontalInput) {
        // Apply gravity
        this.velocity.y += PHYSICS.GRAVITY_BASE * deltaTime;
        this.velocity.y = Math.min(this.velocity.y, PHYSICS.MAX_FALL_SPEED);

        // Horizontal movement
        this.velocity.x = horizontalInput * PHYSICS.HORIZONTAL_SPEED;

        // Update position
        this.position.x += this.velocity.x * deltaTime;
        this.position.y += this.velocity.y * deltaTime;

        // Tilt based on horizontal movement
        this.container.rotation = horizontalInput * 0.15;
    }

    startFalling() {
        this.state = PLAYER_STATES.FALLING;
        this.jetpackActivating = true;
        this.setAnimation('jetpackActivation');
    }

    land() {
        this.state = PLAYER_STATES.LANDED;
        this.velocity.x = 0;
        this.velocity.y = 0;
        this.container.rotation = 0;
        this.setAnimation('idle');
    }

    crash() {
        this.state = PLAYER_STATES.CRASHED;
        this.velocity.x = 0;
        this.velocity.y = 0;
        this.container.rotation = 0;

        // Tint sprites red
        Object.values(this.sprites).forEach(sprite => {
            sprite.tint = 0xff0000;
        });
    }

    reset() {
        this.position = { x: 100, y: 140 };
        this.velocity = { x: 0, y: 0 };
        this.state = PLAYER_STATES.WALKING;
        this.jetpackActivating = false;
        this.isMoving = false;
        this.facingDirection = 1;
        this.container.rotation = 0;
        this.container.scale.x = Math.abs(this.container.scale.x);

        // Reset tint
        Object.values(this.sprites).forEach(sprite => {
            sprite.tint = 0xffffff;
        });

        this.setAnimation('idle');
    }

    getBounds() {
        return {
            x: this.position.x - PHYSICS.PLAYER_HITBOX.w / 2,
            y: this.position.y - PHYSICS.PLAYER_HITBOX.h / 2,
            width: PHYSICS.PLAYER_HITBOX.w,
            height: PHYSICS.PLAYER_HITBOX.h
        };
    }

    destroy() {
        this.container.destroy(true);
    }
}