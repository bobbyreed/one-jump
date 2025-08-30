// src/entities/LandingZone.js
import { Container, Graphics, Text } from 'pixi.js';
import { LEVEL, SCORING, COLORS } from '../config/Constants.js';

export default class LandingZone {
    constructor(worldContainer) {
        this.container = new Container();
        this.landingPads = [];
        this.ground = null;

        // Create landing zone elements
        this.createLandingPads();
        this.createGround();

        // Add to world
        worldContainer.addChild(this.container);
    }

    createLandingPads() {
        // Calculate center of screen (assuming 1920 width)
        const screenCenterX = 960;

        SCORING.LANDING_PADS.forEach((padConfig, index) => {
            // Calculate actual position
            const x = screenCenterX + padConfig.x_offset;
            const y = LEVEL.LANDING_Y;

            // Create pad graphics
            const padGraphic = new Graphics()
                .rect(0, 0, padConfig.width, 40)
                .fill({ color: padConfig.color })
                .rect(5, 5, padConfig.width - 10, 30)
                .fill({ color: padConfig.color, alpha: 0.5 });

            padGraphic.x = x;
            padGraphic.y = y;

            // Create label
            const label = new Text({
                text: padConfig.label,
                style: {
                    fontFamily: 'Arial',
                    fontSize: 16,
                    fill: 0x000000,
                    fontWeight: 'bold'
                }
            });
            label.anchor.set(0.5);
            label.x = x + padConfig.width / 2;
            label.y = y + 20;

            // Add to container
            this.container.addChild(padGraphic);
            this.container.addChild(label);

            // Store pad data for collision detection
            this.landingPads.push({
                x: x,
                y: y,
                width: padConfig.width,
                height: 40,
                points: padConfig.points,
                label: padConfig.label,
                color: padConfig.color,
                graphic: padGraphic,
                textLabel: label
            });
        });

        // Add visual indicators for landing zone
        this.createLandingIndicators();
    }

    createLandingIndicators() {
        // Create arrow indicators pointing to perfect landing
        const perfectPad = this.landingPads.find(pad => pad.label === 'PERFECT');
        if (perfectPad) {
            // Create pulsing arrow above perfect zone
            const arrow = new Graphics();
            arrow.moveTo(0, -20)
                .lineTo(-10, -10)
                .lineTo(-5, -10)
                .lineTo(-5, 0)
                .lineTo(5, 0)
                .lineTo(5, -10)
                .lineTo(10, -10)
                .lineTo(0, -20)
                .fill({ color: COLORS.WARNING, alpha: 0.8 });

            arrow.x = perfectPad.x + perfectPad.width / 2;
            arrow.y = perfectPad.y - 50;

            this.container.addChild(arrow);

            // Store for animation
            this.perfectArrow = arrow;
            this.arrowBobTime = 0;
        }

        // Create side markers
        const leftMarker = new Graphics()
            .rect(0, 0, 5, 60)
            .fill({ color: COLORS.WARNING, alpha: 0.5 });
        leftMarker.x = this.landingPads[this.landingPads.length - 1].x - 10;
        leftMarker.y = LEVEL.LANDING_Y - 10;

        const rightMarker = new Graphics()
            .rect(0, 0, 5, 60)
            .fill({ color: COLORS.WARNING, alpha: 0.5 });
        const lastPad = this.landingPads[this.landingPads.length - 1];
        rightMarker.x = lastPad.x + lastPad.width + 5;
        rightMarker.y = LEVEL.LANDING_Y - 10;

        this.container.addChild(leftMarker, rightMarker);
    }

    createGround() {
        // Create ground below landing pads
        this.ground = new Graphics()
            .rect(0, LEVEL.LANDING_Y + 40, 1920, 200)
            .fill({ color: COLORS.GROUND });

        // Add some texture to ground
        for (let i = 0; i < 20; i++) {
            const x = Math.random() * 1920;
            const y = LEVEL.LANDING_Y + 50 + Math.random() * 150;
            const width = 20 + Math.random() * 80;

            this.ground.rect(x, y, width, 5)
                .fill({ color: 0x1d1d33, alpha: 0.3 });
        }

        this.container.addChild(this.ground);

        // Add danger zone indicator below ground
        const dangerText = new Text({
            text: '⚠ DANGER ZONE ⚠',
            style: {
                fontFamily: 'Arial Black',
                fontSize: 24,
                fill: COLORS.DANGER,
                fontWeight: 'bold'
            }
        });
        dangerText.anchor.set(0.5);
        dangerText.x = 960;
        dangerText.y = LEVEL.LANDING_Y + 100;
        this.container.addChild(dangerText);
    }

    /**
     * Check if player has landed
     * @returns {Object|null} Landing result or null if not landed
     */
    checkLanding(playerPosition) {
        // Check if player is at landing height
        if (playerPosition.y >= LEVEL.LANDING_Y &&
            playerPosition.y <= LEVEL.LANDING_Y + 40) {

            // Check which pad the player landed on
            for (const pad of this.landingPads) {
                if (playerPosition.x >= pad.x &&
                    playerPosition.x <= pad.x + pad.width) {

                    // Successful landing on a pad
                    return {
                        type: 'pad',
                        points: pad.points,
                        label: pad.label,
                        color: pad.color,
                        pad: pad
                    };
                }
            }

            // Landed but missed all pads
            return {
                type: 'missed',
                points: 0,
                label: 'MISSED',
                color: COLORS.DANGER
            };
        }

        // Check if crashed into ground
        if (playerPosition.y > LEVEL.LANDING_Y + 40) {
            return {
                type: 'crash',
                points: 0,
                label: 'CRASHED',
                color: COLORS.DANGER
            };
        }

        // Not landed yet
        return null;
    }

    /**
     * Highlight a landing pad (for effects)
     */
    highlightPad(padLabel, duration = 1000) {
        const pad = this.landingPads.find(p => p.label === padLabel);
        if (!pad) return;

        // Create highlight effect
        const highlight = new Graphics()
            .rect(0, 0, pad.width, 40)
            .fill({ color: 0xFFFFFF, alpha: 0.5 });

        highlight.x = pad.x;
        highlight.y = pad.y;

        this.container.addChild(highlight);

        // Animate highlight
        let elapsed = 0;
        const animate = (ticker) => {
            elapsed += ticker.deltaTime * 16.67; // Convert to ms
            const progress = elapsed / duration;

            highlight.alpha = 0.5 * (1 - progress);
            highlight.scale.set(1 + progress * 0.2);

            if (progress >= 1) {
                this.container.removeChild(highlight);
                ticker.remove(animate);
            }
        };

        // Note: This would need access to the ticker
        // In a real implementation, this would be handled by the particle system
    }

    /**
     * Update landing zone (for animations)
     */
    update(deltaTime) {
        // Animate perfect landing arrow
        if (this.perfectArrow) {
            this.arrowBobTime += deltaTime * 2;
            this.perfectArrow.y = (LEVEL.LANDING_Y - 50) + Math.sin(this.arrowBobTime) * 5;
        }
    }

    /**
     * Get landing zone bounds for camera
     */
    getBounds() {
        return {
            top: LEVEL.LANDING_Y - 100,
            bottom: LEVEL.LANDING_Y + 240,
            left: 0,
            right: 1920
        };
    }

    /**
     * Reset landing zone
     */
    reset() {
        // Reset any animations or states
        this.arrowBobTime = 0;
        if (this.perfectArrow) {
            this.perfectArrow.y = LEVEL.LANDING_Y - 50;
        }
    }

    /**
     * Destroy landing zone
     */
    destroy() {
        this.container.destroy(true);
    }
}