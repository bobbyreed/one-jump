import { LEVEL } from '../config/Constants.js';

export default class CameraSystem {
    constructor(worldContainer, app) {
        this.worldContainer = worldContainer;
        this.app = app;

        // Camera position
        this.cameraX = 0;
        this.cameraY = 0;

        // Target position for smooth following
        this.targetX = 0;
        this.targetY = 0;

        // Camera settings
        this.smoothing = 0.1; // Lower = smoother, higher = more responsive
        this.offsetY = LEVEL.CAMERA_OFFSET_Y;
        this.bounds = {
            minX: -Infinity,
            maxX: Infinity,
            minY: -Infinity,
            maxY: 0 // Don't go above ground level
        };

        // Shake effect
        this.shakeIntensity = 0;
        this.shakeDuration = 0;
        this.shakeOffset = { x: 0, y: 0 };
        
        // Base dimensions for calculations
        this.baseWidth = 1920;
        this.baseHeight = 1080;
    }

    /**
     * Get effective screen dimensions considering responsive scaling
     */
    getEffectiveScreenSize() {
        // Since we're using responsive scaling, the effective screen size
        // is always our base dimensions for world positioning purposes
        return {
            width: this.baseWidth,
            height: this.baseHeight
        };
    }

    /**
     * Follow player with smooth camera movement
     */
    followPlayer(player, deltaTime) {
        const screenSize = this.getEffectiveScreenSize();
        
        // Calculate target position
        this.targetY = -(player.position.y - this.offsetY);

        // Optional: Center horizontally if player moves too far
        const screenCenterX = screenSize.width / 2;
        const deadZoneX = 200; // Pixels from center before camera moves

        if (Math.abs(player.position.x - screenCenterX) > deadZoneX) {
            this.targetX = -(player.position.x - screenCenterX);
        } else {
            this.targetX = 0;
        }

        // Apply smoothing
        this.cameraX += (this.targetX - this.cameraX) * this.smoothing;
        this.cameraY += (this.targetY - this.cameraY) * this.smoothing;

        // Apply bounds
        this.cameraX = Math.max(this.bounds.minX, Math.min(this.bounds.maxX, this.cameraX));
        this.cameraY = Math.max(this.bounds.minY, Math.min(this.bounds.maxY, this.cameraY));

        // Update shake
        this.updateShake(deltaTime);

        // Apply to world container
        this.worldContainer.x = this.cameraX + this.shakeOffset.x;
        this.worldContainer.y = this.cameraY + this.shakeOffset.y;
    }

    /**
     * Instantly set camera position
     */
    setPosition(x, y) {
        this.cameraX = x;
        this.cameraY = y;
        this.targetX = x;
        this.targetY = y;
        this.worldContainer.x = x;
        this.worldContainer.y = y;
    }

    /**
     * Get current camera position
     */
    getPosition() {
        return {
            x: this.cameraX,
            y: this.cameraY
        };
    }

    /**
     * Get camera Y for parallax effects
     */
    getCameraY() {
        return -this.cameraY;
    }

    /**
     * Trigger camera shake effect
     */
    shake(intensity = 10, duration = 500) {
        this.shakeIntensity = intensity;
        this.shakeDuration = duration;
    }

    /**
     * Update shake effect
     */
    updateShake(deltaTime) {
        if (this.shakeDuration > 0) {
            this.shakeDuration -= deltaTime * 1000; // Convert to ms

            if (this.shakeDuration > 0) {
                // Calculate shake offset
                const angle = Math.random() * Math.PI * 2;
                const fadeOut = this.shakeDuration / 500; // Fade out over time
                const currentIntensity = this.shakeIntensity * fadeOut;

                this.shakeOffset.x = Math.cos(angle) * currentIntensity;
                this.shakeOffset.y = Math.sin(angle) * currentIntensity;
            } else {
                // Reset shake
                this.shakeDuration = 0;
                this.shakeIntensity = 0;
                this.shakeOffset.x = 0;
                this.shakeOffset.y = 0;
            }
        }
    }

    /**
     * Set camera bounds
     */
    setBounds(minX, maxX, minY, maxY) {
        this.bounds = { minX, maxX, minY, maxY };
    }

    /**
     * Set camera smoothing (0-1, lower is smoother)
     */
    setSmoothing(smoothing) {
        this.smoothing = Math.max(0.01, Math.min(1, smoothing));
    }

    /**
     * Set vertical offset for camera following
     */
    setOffsetY(offset) {
        this.offsetY = offset;
    }

    /**
     * Check if a point is visible on screen
     */
    isVisible(worldX, worldY, margin = 100) {
        const screenSize = this.getEffectiveScreenSize();
        const screenX = worldX + this.cameraX;
        const screenY = worldY + this.cameraY;

        return screenX > -margin &&
            screenX < screenSize.width + margin &&
            screenY > -margin &&
            screenY < screenSize.height + margin;
    }

    /**
     * Convert world coordinates to screen coordinates
     */
    worldToScreen(worldX, worldY) {
        return {
            x: worldX + this.cameraX,
            y: worldY + this.cameraY
        };
    }

    /**
     * Convert screen coordinates to world coordinates
     */
    screenToWorld(screenX, screenY) {
        return {
            x: screenX - this.cameraX,
            y: screenY - this.cameraY
        };
    }

    /**
     * Reset camera to initial position
     */
    reset() {
        this.cameraX = 0;
        this.cameraY = 0;
        this.targetX = 0;
        this.targetY = 0;
        this.shakeIntensity = 0;
        this.shakeDuration = 0;
        this.shakeOffset = { x: 0, y: 0 };
        this.worldContainer.x = 0;
        this.worldContainer.y = 0;
    }
}