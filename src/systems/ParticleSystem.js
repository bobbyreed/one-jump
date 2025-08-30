import { Graphics, Container } from 'pixi.js';
import { COLORS } from '../config/Constants.js';

export default class ParticleSystem {
    constructor(worldContainer) {
        this.worldContainer = worldContainer;

        // Particle containers
        this.jetpackParticles = new Container();
        this.windStreaks = new Container();
        this.effects = new Container();

        // Add containers to world
        worldContainer.addChild(this.windStreaks);
        worldContainer.addChild(this.jetpackParticles);
        worldContainer.addChild(this.effects);

        // Active particles tracking
        this.activeParticles = [];

        // Particle pools for performance
        this.particlePools = new Map();

        // Settings
        this.maxJetpackParticles = 30;
        this.maxWindStreaks = 50;
    }

    /**
     * Create jetpack thrust particles
     */
    createJetpackParticles(position, deltaTime) {
        if (Math.random() > 0.5) return; // Limit particle creation rate

        // Clean up if too many particles
        if (this.jetpackParticles.children.length > this.maxJetpackParticles) {
            this.jetpackParticles.removeChildAt(0);
        }

        const particle = new Graphics()
            .circle(0, 0, 3 + Math.random() * 3)
            .fill({ color: 0xff8800, alpha: 0.8 });

        particle.x = position.x + (Math.random() - 0.5) * 20;
        particle.y = position.y + 40; // Below player

        // Store particle data
        particle.velocity = {
            x: (Math.random() - 0.5) * 2,
            y: 5 + Math.random() * 3
        };
        particle.lifetime = 30;
        particle.baseAlpha = 0.8;

        this.jetpackParticles.addChild(particle);

        // Add to active particles for update
        this.activeParticles.push({
            sprite: particle,
            container: this.jetpackParticles,
            type: 'jetpack',
            update: (p, dt) => this.updateJetpackParticle(p, dt)
        });
    }

    /**
     * Update jetpack particle
     */
    updateJetpackParticle(particle, deltaTime) {
        const sprite = particle.sprite;

        sprite.x += sprite.velocity.x;
        sprite.y += sprite.velocity.y;
        sprite.alpha -= 0.02;
        sprite.scale.x *= 0.95;
        sprite.scale.y *= 0.95;
        sprite.lifetime--;

        if (sprite.lifetime <= 0 || sprite.alpha <= 0) {
            particle.container.removeChild(sprite);
            return false; // Remove from active particles
        }

        return true; // Keep in active particles
    }

    /**
     * Create wind streak effects during fast falling
     */
    createWindStreaks(position, speed, deltaTime) {
        if (Math.random() > 0.3) return; // Limit creation rate

        // Clean up old streaks
        if (this.windStreaks.children.length > this.maxWindStreaks) {
            this.windStreaks.removeChildAt(0);
        }

        const streak = new Graphics()
            .rect(0, 0, 2, 20 + Math.random() * 30)
            .fill({ color: COLORS.TEXT_PRIMARY, alpha: 0.3 });

        streak.x = position.x + (Math.random() - 0.5) * 60;
        streak.y = position.y - 40;
        streak.velocity = speed * 0.3;
        streak.baseAlpha = 0.3;

        this.windStreaks.addChild(streak);

        this.activeParticles.push({
            sprite: streak,
            container: this.windStreaks,
            type: 'streak',
            update: (p, dt) => this.updateWindStreak(p, dt)
        });
    }

    /**
     * Update wind streak
     */
    updateWindStreak(particle, deltaTime) {
        const streak = particle.sprite;

        streak.y -= streak.velocity * deltaTime;
        streak.alpha -= 0.02;
        streak.scale.y *= 1.02;

        if (streak.alpha <= 0) {
            particle.container.removeChild(streak);
            return false;
        }

        return true;
    }

    /**
     * Create crash explosion effect
     */
    createCrashEffect(position) {
        // Main explosion circle
        const explosion = new Graphics()
            .circle(0, 0, 50)
            .fill({ color: COLORS.DANGER, alpha: 0.5 });
        explosion.x = position.x;
        explosion.y = position.y;

        this.effects.addChild(explosion);

        // Animate explosion
        this.activeParticles.push({
            sprite: explosion,
            container: this.effects,
            type: 'explosion',
            update: (p, dt) => {
                p.sprite.scale.x *= 1.1;
                p.sprite.scale.y *= 1.1;
                p.sprite.alpha -= 0.05;

                if (p.sprite.alpha <= 0) {
                    p.container.removeChild(p.sprite);
                    return false;
                }
                return true;
            }
        });

        // Create debris particles
        for (let i = 0; i < 12; i++) {
            const debris = new Graphics()
                .rect(0, 0, 5 + Math.random() * 10, 5 + Math.random() * 10)
                .fill({ color: Math.random() > 0.5 ? COLORS.DANGER : COLORS.WARNING });

            debris.x = position.x;
            debris.y = position.y;

            const angle = (Math.PI * 2 / 12) * i;
            const speed = 5 + Math.random() * 10;
            debris.velocity = {
                x: Math.cos(angle) * speed,
                y: Math.sin(angle) * speed - 5
            };
            debris.gravity = 0.5;
            debris.rotation = Math.random() * Math.PI;
            debris.rotationSpeed = (Math.random() - 0.5) * 0.3;

            this.effects.addChild(debris);

            this.activeParticles.push({
                sprite: debris,
                container: this.effects,
                type: 'debris',
                update: (p, dt) => this.updateDebris(p, dt)
            });
        }
    }

    /**
     * Update debris particle
     */
    updateDebris(particle, deltaTime) {
        const debris = particle.sprite;

        debris.x += debris.velocity.x;
        debris.y += debris.velocity.y;
        debris.velocity.y += debris.gravity;
        debris.rotation += debris.rotationSpeed;
        debris.alpha -= 0.02;

        if (debris.alpha <= 0) {
            particle.container.removeChild(debris);
            return false;
        }

        return true;
    }

    /**
     * Create landing success effect
     */
    createLandingEffect(position, color = COLORS.SUCCESS) {
        // Create ring effect
        const ring = new Graphics()
            .circle(0, 0, 30)
            .stroke({ width: 3, color: color, alpha: 1 });
        ring.x = position.x;
        ring.y = position.y;

        this.effects.addChild(ring);

        this.activeParticles.push({
            sprite: ring,
            container: this.effects,
            type: 'ring',
            update: (p, dt) => {
                p.sprite.scale.x *= 1.1;
                p.sprite.scale.y *= 1.1;
                p.sprite.alpha -= 0.03;

                if (p.sprite.alpha <= 0) {
                    p.container.removeChild(p.sprite);
                    return false;
                }
                return true;
            }
        });

        // Create star burst
        for (let i = 0; i < 8; i++) {
            const star = new Graphics()
                .star(0, 0, 5, 5, 5)
                .fill({ color: color });

            star.x = position.x;
            star.y = position.y;

            const angle = (Math.PI * 2 / 8) * i;
            star.velocity = {
                x: Math.cos(angle) * 3,
                y: Math.sin(angle) * 3
            };

            this.effects.addChild(star);

            this.activeParticles.push({
                sprite: star,
                container: this.effects,
                type: 'star',
                update: (p, dt) => {
                    p.sprite.x += p.sprite.velocity.x;
                    p.sprite.y += p.sprite.velocity.y;
                    p.sprite.rotation += 0.1;
                    p.sprite.alpha -= 0.02;
                    p.sprite.scale.x *= 0.95;
                    p.sprite.scale.y *= 0.95;

                    if (p.sprite.alpha <= 0) {
                        p.container.removeChild(p.sprite);
                        return false;
                    }
                    return true;
                }
            });
        }
    }

    /**
     * Create near-miss spark effect
     */
    createNearMissEffect(position, level = 0) {
        const colors = [0xFFFFFF, 0xFFFF00, 0xFFAA00, 0xFF0000];
        const color = colors[Math.min(level, colors.length - 1)];

        for (let i = 0; i < 5; i++) {
            const spark = new Graphics()
                .circle(0, 0, 2)
                .fill({ color: color, alpha: 1 });

            spark.x = position.x + (Math.random() - 0.5) * 20;
            spark.y = position.y + (Math.random() - 0.5) * 20;

            const angle = Math.random() * Math.PI * 2;
            spark.velocity = {
                x: Math.cos(angle) * 2,
                y: Math.sin(angle) * 2
            };

            this.effects.addChild(spark);

            this.activeParticles.push({
                sprite: spark,
                container: this.effects,
                type: 'spark',
                update: (p, dt) => {
                    p.sprite.x += p.sprite.velocity.x;
                    p.sprite.y += p.sprite.velocity.y;
                    p.sprite.alpha -= 0.05;

                    if (p.sprite.alpha <= 0) {
                        p.container.removeChild(p.sprite);
                        return false;
                    }
                    return true;
                }
            });
        }
    }

    /**
     * Update all active particles
     */
    update(deltaTime) {
        // Update all active particles
        this.activeParticles = this.activeParticles.filter(particle => {
            return particle.update(particle, deltaTime);
        });
    }

    /**
     * Clear all particles
     */
    clear() {
        this.jetpackParticles.removeChildren();
        this.windStreaks.removeChildren();
        this.effects.removeChildren();
        this.activeParticles = [];
    }

    /**
     * Destroy particle system
     */
    destroy() {
        this.clear();
        this.jetpackParticles.destroy(true);
        this.windStreaks.destroy(true);
        this.effects.destroy(true);
    }
}