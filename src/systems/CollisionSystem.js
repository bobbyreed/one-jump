import { PHYSICS } from '../config/Constants.js';

export default class CollisionSystem {
    constructor() {
        this.debugMode = false;
    }

    /**
     * Check AABB collision between two rectangular bounds
     */
    checkCollision(bounds1, bounds2) {
        return bounds1.x < bounds2.x + bounds2.width &&
            bounds1.x + bounds1.width > bounds2.x &&
            bounds1.y < bounds2.y + bounds2.height &&
            bounds1.y + bounds1.height > bounds2.y;
    }

    /**
     * Check circle collision
     */
    checkCircleCollision(circle1, circle2) {
        const dx = circle1.x - circle2.x;
        const dy = circle1.y - circle2.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < circle1.radius + circle2.radius;
    }

    /**
     * Check point in rectangle
     */
    pointInRectangle(point, rect) {
        return point.x >= rect.x &&
            point.x <= rect.x + rect.width &&
            point.y >= rect.y &&
            point.y <= rect.y + rect.height;
    }

    /**
     * Calculate near-miss distance and scoring
     */
    calculateNearMiss(playerBounds, obstacleBounds) {
        // Calculate closest distance between bounds
        const playerCenterX = playerBounds.x + playerBounds.width / 2;
        const playerCenterY = playerBounds.y + playerBounds.height / 2;
        const obstacleCenterX = obstacleBounds.x + obstacleBounds.width / 2;
        const obstacleCenterY = obstacleBounds.y + obstacleBounds.height / 2;

        // Simple distance calculation (could be improved with edge distance)
        const distance = Math.sqrt(
            Math.pow(playerCenterX - obstacleCenterX, 2) +
            Math.pow(playerCenterY - obstacleCenterY, 2)
        );

        // Check against near-miss ranges
        for (let i = 0; i < PHYSICS.NEAR_MISS_RANGES.length; i++) {
            if (distance <= PHYSICS.NEAR_MISS_RANGES[i]) {
                return {
                    level: i,
                    distance: distance,
                    isGraze: distance <= PHYSICS.GRAZE_BONUS_RANGE
                };
            }
        }

        return null;
    }

    /**
     * Get overlap amount between two bounds
     */
    getOverlap(bounds1, bounds2) {
        const overlapX = Math.min(bounds1.x + bounds1.width, bounds2.x + bounds2.width) -
            Math.max(bounds1.x, bounds2.x);
        const overlapY = Math.min(bounds1.y + bounds1.height, bounds2.y + bounds2.height) -
            Math.max(bounds1.y, bounds2.y);

        if (overlapX > 0 && overlapY > 0) {
            return {
                x: overlapX,
                y: overlapY,
                area: overlapX * overlapY
            };
        }

        return null;
    }

    /**
     * Resolve collision by pushing objects apart
     */
    resolveCollision(movableBounds, staticBounds, velocity) {
        const overlap = this.getOverlap(movableBounds, staticBounds);

        if (!overlap) return null;

        // Determine push direction based on overlap amounts
        const pushX = overlap.x < overlap.y;

        const resolution = {
            x: 0,
            y: 0,
            velocityX: velocity.x,
            velocityY: velocity.y
        };

        if (pushX) {
            // Push horizontally
            if (movableBounds.x < staticBounds.x) {
                resolution.x = -overlap.x;
            } else {
                resolution.x = overlap.x;
            }
            resolution.velocityX = -velocity.x * 0.5; // Bounce with damping
        } else {
            // Push vertically
            if (movableBounds.y < staticBounds.y) {
                resolution.y = -overlap.y;
            } else {
                resolution.y = overlap.y;
            }
            resolution.velocityY = -velocity.y * 0.5; // Bounce with damping
        }

        return resolution;
    }

    /**
     * Perform broad phase collision detection using spatial partitioning
     */
    broadPhase(objects, cellSize = 100) {
        const grid = new Map();

        // Insert objects into grid
        objects.forEach(obj => {
            const bounds = obj.getBounds();
            const startX = Math.floor(bounds.x / cellSize);
            const endX = Math.floor((bounds.x + bounds.width) / cellSize);
            const startY = Math.floor(bounds.y / cellSize);
            const endY = Math.floor((bounds.y + bounds.height) / cellSize);

            for (let x = startX; x <= endX; x++) {
                for (let y = startY; y <= endY; y++) {
                    const key = `${x},${y}`;
                    if (!grid.has(key)) {
                        grid.set(key, []);
                    }
                    grid.get(key).push(obj);
                }
            }
        });

        // Find potential collisions
        const pairs = new Set();
        grid.forEach(cell => {
            for (let i = 0; i < cell.length; i++) {
                for (let j = i + 1; j < cell.length; j++) {
                    const pairKey = [cell[i].id, cell[j].id].sort().join('-');
                    pairs.add({
                        key: pairKey,
                        obj1: cell[i],
                        obj2: cell[j]
                    });
                }
            }
        });

        return Array.from(pairs);
    }

    setDebugMode(enabled) {
        this.debugMode = enabled;
    }
}