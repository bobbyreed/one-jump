import { Container, Text, Graphics } from 'pixi.js';
import { COLORS } from '../config/Constants.js';
import Button from './Button.js';

export default class HUD {
    constructor(parentContainer, screen, onMenuClick) {
        this.container = new Container();
        this.screen = screen;
        parentContainer.addChild(this.container);

        // Create HUD elements
        this.createSpeedDisplay();
        this.createDistanceDisplay();
        this.createComboDisplay();
        this.createJetpackDisplay();
        this.createInstructionText();
        this.createMenuButton(onMenuClick);

        // Combo system
        this.comboCount = 0;
        this.comboTimer = 0;
        this.comboMultiplier = 1;
    }

    createSpeedDisplay() {
        // Speed container
        const speedContainer = new Container();

        // Background panel
        const speedBg = new Graphics()
            .roundRect(0, 0, 150, 30, 5)
            .fill({ color: 0x000000, alpha: 0.5 });
        speedContainer.addChild(speedBg);

        // Speed text
        this.speedText = new Text({
            text: 'Speed: 0',
            style: {
                fontFamily: 'Arial',
                fontSize: 20,
                fill: COLORS.TEXT_PRIMARY,
                fontWeight: 'bold'
            }
        });
        this.speedText.x = 10;
        this.speedText.y = 5;
        speedContainer.addChild(this.speedText);

        speedContainer.x = 20;
        speedContainer.y = 20;
        this.container.addChild(speedContainer);
    }

    createDistanceDisplay() {
        // Distance container
        const distanceContainer = new Container();

        // Background panel
        const distanceBg = new Graphics()
            .roundRect(0, 0, 150, 30, 5)
            .fill({ color: 0x000000, alpha: 0.5 });
        distanceContainer.addChild(distanceBg);

        // Distance text
        this.distanceText = new Text({
            text: 'Distance: 0m',
            style: {
                fontFamily: 'Arial',
                fontSize: 20,
                fill: COLORS.TEXT_PRIMARY,
                fontWeight: 'bold'
            }
        });
        this.distanceText.x = 10;
        this.distanceText.y = 5;
        distanceContainer.addChild(this.distanceText);

        distanceContainer.x = 20;
        distanceContainer.y = 55;
        this.container.addChild(distanceContainer);
    }

    createComboDisplay() {
        // Combo container (top center)
        this.comboContainer = new Container();
        this.comboContainer.visible = false; // Hidden initially

        // Combo background
        const comboBg = new Graphics()
            .roundRect(-80, -20, 160, 40, 10)
            .fill({ color: 0x000000, alpha: 0.7 })
            .roundRect(-80, -20, 160, 40, 10)
            .stroke({ width: 2, color: COLORS.WARNING });
        this.comboContainer.addChild(comboBg);

        // Combo text
        this.comboText = new Text({
            text: 'COMBO x1',
            style: {
                fontFamily: 'Arial Black',
                fontSize: 24,
                fill: COLORS.WARNING,
                fontWeight: 'bold',
                dropShadow: true,
                dropShadowColor: 0x000000,
                dropShadowDistance: 2
            }
        });
        this.comboText.anchor.set(0.5);
        this.comboContainer.addChild(this.comboText);

        // Combo meter
        this.comboMeter = new Graphics();
        this.comboMeterBg = new Graphics()
            .rect(-60, 15, 120, 8)
            .fill({ color: 0x333333 });
        this.comboContainer.addChild(this.comboMeterBg);
        this.comboContainer.addChild(this.comboMeter);

        this.comboContainer.x = this.screen.width / 2;
        this.comboContainer.y = 50;
        this.container.addChild(this.comboContainer);
    }

    createJetpackDisplay() {
        // Jetpack status container
        this.jetpackContainer = new Container();
        this.jetpackContainer.visible = false; // Hidden initially

        // Background panel
        const jetpackBg = new Graphics()
            .roundRect(0, 0, 180, 35, 5)
            .fill({ color: 0x000000, alpha: 0.5 });
        this.jetpackContainer.addChild(jetpackBg);

        // Status text
        this.jetpackText = new Text({
            text: 'JETPACK',
            style: {
                fontFamily: 'Arial',
                fontSize: 18,
                fill: COLORS.TEXT_PRIMARY,
                fontWeight: 'bold'
            }
        });
        this.jetpackText.x = 10;
        this.jetpackText.y = 8;
        this.jetpackContainer.addChild(this.jetpackText);

        // Cooldown bar
        this.jetpackCooldownBar = new Graphics();
        this.jetpackContainer.addChild(this.jetpackCooldownBar);

        this.jetpackContainer.x = 20;
        this.jetpackContainer.y = 90;
        this.container.addChild(this.jetpackContainer);
    }

    createInstructionText() {
        // Instruction text (center)
        this.instructionText = new Text({
            text: '',
            style: {
                fontFamily: 'Arial',
                fontSize: 20,
                fill: COLORS.WARNING,
                fontWeight: 'bold',
                dropShadow: true,
                dropShadowColor: 0x000000,
                dropShadowDistance: 2
            }
        });
        this.instructionText.anchor.set(0.5, 0);
        this.instructionText.x = this.screen.width / 2;
        this.instructionText.y = 100;
        this.container.addChild(this.instructionText);
    }

    createMenuButton(onClick) {
        // Menu button (top right)
        this.menuButton = new Button(
            'MENU',
            this.screen.width - 120,
            20,
            100,
            40,
            COLORS.DANGER,
            onClick || (() => console.log('Menu clicked'))
        );
        this.container.addChild(this.menuButton.container);
    }

    /**
     * Update speed display
     */
    updateSpeed(speed) {
        this.speedText.text = `Speed: ${Math.floor(speed)}`;

        // Change color based on speed
        if (speed < 200) {
            this.speedText.style.fill = COLORS.TEXT_PRIMARY;
        } else if (speed < 500) {
            this.speedText.style.fill = COLORS.WARNING;
        } else {
            this.speedText.style.fill = COLORS.DANGER;
        }
    }

    /**
     * Update distance display
     */
    updateDistance(distance) {
        this.distanceText.text = `Distance: ${distance}m`;
    }

    /**
     * Update jetpack status display
     * @param {Object} status - Jetpack status object
     * @param {boolean} status.slowdownActive - Is slowdown active
     * @param {boolean} status.boostActive - Is boost active
     * @param {number} status.cooldownRemaining - Cooldown time remaining (seconds)
     * @param {boolean} status.isFalling - Is player falling
     */
    updateJetpackStatus(status) {
        // Only show during falling
        if (!status.isFalling) {
            this.jetpackContainer.visible = false;
            return;
        }

        this.jetpackContainer.visible = true;

        // Update text and color based on state
        if (status.slowdownActive) {
            this.jetpackText.text = 'SLOWDOWN';
            this.jetpackText.style.fill = 0x00FFFF; // Cyan
        } else if (status.boostActive) {
            this.jetpackText.text = 'BOOST';
            this.jetpackText.style.fill = 0xFF4444; // Red
        } else if (status.cooldownRemaining > 0) {
            this.jetpackText.text = `COOLDOWN: ${status.cooldownRemaining.toFixed(1)}s`;
            this.jetpackText.style.fill = 0xFFFF00; // Yellow
        } else {
            this.jetpackText.text = 'READY';
            this.jetpackText.style.fill = 0x44FF44; // Green
        }

        // Draw cooldown bar if on cooldown
        this.jetpackCooldownBar.clear();
        if (status.cooldownRemaining > 0) {
            const maxCooldown = 2.0; // JETPACK_COOLDOWN in seconds
            const progress = status.cooldownRemaining / maxCooldown;
            this.jetpackCooldownBar
                .rect(10, 30, 160 * progress, 3)
                .fill({ color: 0xFFFF00 });
        }
    }

    /**
     * Update combo display
     */
    updateCombo(count, multiplier, timeRemaining = 1) {
        this.comboCount = count;
        this.comboMultiplier = multiplier;

        if (count > 0) {
            this.comboContainer.visible = true;
            this.comboText.text = `COMBO x${multiplier}`;

            // Update combo meter
            this.comboMeter.clear();
            this.comboMeter.rect(-60, 15, 120 * timeRemaining, 8)
                .fill({ color: this.getComboColor(multiplier) });

            // Pulse effect for high combos
            if (multiplier >= 5) {
                const scale = 1 + Math.sin(Date.now() * 0.01) * 0.1;
                this.comboContainer.scale.set(scale);
            } else {
                this.comboContainer.scale.set(1);
            }
        } else {
            this.comboContainer.visible = false;
        }
    }

    /**
     * Get color based on combo multiplier
     */
    getComboColor(multiplier) {
        if (multiplier >= 10) return 0xFF00FF; // Rainbow (would animate)
        if (multiplier >= 8) return 0x9900FF;  // Purple
        if (multiplier >= 5) return 0xFF0000;  // Red
        if (multiplier >= 3) return 0xFF8800;  // Orange
        if (multiplier >= 2) return 0xFFFF00;  // Yellow
        return COLORS.TEXT_PRIMARY;            // White
    }

    /**
     * Show instruction text
     */
    showInstruction(text, duration = 0) {
        this.instructionText.text = text;
        this.instructionText.visible = true;

        if (duration > 0) {
            setTimeout(() => {
                this.hideInstruction();
            }, duration);
        }
    }

    /**
     * Hide instruction text
     */
    hideInstruction() {
        this.instructionText.visible = false;
    }

    /**
     * Show achievement notification
     */
    showAchievement(title, description) {
        // Create achievement popup
        const achievementContainer = new Container();

        const bg = new Graphics()
            .roundRect(0, 0, 300, 80, 10)
            .fill({ color: 0x000000, alpha: 0.9 })
            .roundRect(0, 0, 300, 80, 10)
            .stroke({ width: 2, color: COLORS.WARNING });
        achievementContainer.addChild(bg);

        const titleText = new Text({
            text: '🏆 ' + title,
            style: {
                fontFamily: 'Arial',
                fontSize: 18,
                fill: COLORS.WARNING,
                fontWeight: 'bold'
            }
        });
        titleText.x = 10;
        titleText.y = 10;
        achievementContainer.addChild(titleText);

        const descText = new Text({
            text: description,
            style: {
                fontFamily: 'Arial',
                fontSize: 14,
                fill: COLORS.TEXT_PRIMARY
            }
        });
        descText.x = 10;
        descText.y = 35;
        achievementContainer.addChild(descText);

        achievementContainer.x = this.screen.width - 320;
        achievementContainer.y = 100;
        achievementContainer.alpha = 0;

        this.container.addChild(achievementContainer);

        // Animate in
        let elapsed = 0;
        const animateIn = (ticker) => {
            elapsed += ticker.deltaTime / 60;
            achievementContainer.alpha = Math.min(elapsed * 2, 1);

            if (elapsed >= 0.5) {
                ticker.remove(animateIn);

                // Wait then animate out
                setTimeout(() => {
                    let fadeElapsed = 0;
                    const animateOut = (ticker) => {
                        fadeElapsed += ticker.deltaTime / 60;
                        achievementContainer.alpha = 1 - fadeElapsed;

                        if (fadeElapsed >= 1) {
                            ticker.remove(animateOut);
                            this.container.removeChild(achievementContainer);
                        }
                    };
                    ticker.add(animateOut);
                }, 3000);
            }
        };

        // Would need ticker access in real implementation
    }

    /**
     * Update HUD (called each frame)
     */
    update(deltaTime) {
        // Update combo timer
        if (this.comboTimer > 0) {
            this.comboTimer -= deltaTime;
            if (this.comboTimer <= 0) {
                this.updateCombo(0, 1);
            }
        }
    }

    /**
     * Reset HUD
     */
    reset() {
        this.updateSpeed(0);
        this.updateDistance(0);
        this.updateCombo(0, 1);
        this.hideInstruction();
    }

    /**
     * Destroy HUD
     */
    destroy() {
        if (this.menuButton) {
            this.menuButton.destroy();
        }
        this.container.destroy(true);
    }
}