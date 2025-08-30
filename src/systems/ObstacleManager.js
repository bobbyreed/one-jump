import { Container, Graphics } from 'pixi.js';
import { LEVEL, OBSTACLE_TYPES } from '../config/Constants.js';

export default class ObstacleManager {
    constructor(worldContainer) {
        this.worldContainer = worldContainer;
        this.container = new Container();
        this.obstacles = [];

        worldContainer.addChild(this.container);
    }

    generateObstacles() {
        // Clear existing obstacles
        this.clear();

        // Generate new obstacles
        for (let i = 0; i < LEVEL.OBSTACLE_COUNT; i++) {
            const type = OBSTACLE_TYPES[Math.floor(Math.random() * OBSTACLE_TYPES.length)];
            const obstacle = this.createObstacle(type, i);

            if (obstacle) {
                this.container.addChild(obstacle.container);
                this.obstacles.push(obstacle);
            }
        }
    }

    createObstacle(type, index) {
        const obstacle = {
            container: new Container(),
            type: type.type,
            damage: type.damage,
            x: 0,
            y: LEVEL.FALL_START_Y + 300 + index * LEVEL.OBSTACLE_SPACING +
                Math.random() * 100,
            width: 0,
            height: 0,
            getBounds: function () {
                return {
                    x: this.x,
                    y: this.y - this.height,
                    width: this.width,
                    height: this.height
                };
            }
        };

        const graphic = new Graphics();

        switch (type.type) {
            case 'spike':
                const size = 30 + Math.random() * 20;
                graphic.moveTo(0, 0)
                    .lineTo(size / 2, -size)
                    .lineTo(size, 0)
                    .fill({ color: type.color });
                obstacle.width = size;
                obstacle.height = size;
                break;

            case 'platform':
                const platformWidth = 80 + Math.random() * 100;
                graphic.rect(0, 0, platformWidth, 20)
                    .fill({ color: type.color });
                obstacle.width = platformWidth;
                obstacle.height = 20;
                break;

            case 'spinner':
                graphic.rect(-60, -8, 120, 16)
                    .fill({ color: type.color })
                    .rect(-8, -60, 16, 120)
                    .fill({ color: type.color });
                obstacle.width = 120;
                obstacle.height = 120;
                obstacle.spinSpeed = 0.02 + Math.random() * 0.03;
                break;

            case 'wall':
                const side = Math.random() > 0.5 ? 'left' : 'right';
                graphic.rect(0, 0, 150, 30)
                    .fill({ color: type.color });
                obstacle.width = 150;
                obstacle.height = 30;
                obstacle.wallSide = side;
                break;
        }

        obstacle.container.addChild(graphic);

        // Position obstacles
        if (obstacle.wallSide === 'left') {
            obstacle.x = 0;
        } else if (obstacle.wallSide === 'right') {
            obstacle.x = 1920 - obstacle.width; // Assuming screen width
        } else {
            obstacle.x = 100 + Math.random() * (1920 - 200 - obstacle.width);
        }

        obstacle.container.x = obstacle.x;
        obstacle.container.y = obstacle.y;

        return obstacle;
    }

    update(deltaTime) {
        // Update spinning obstacles
        this.obstacles.forEach(obstacle => {
            if (obstacle.type === 'spinner' && obstacle.spinSpeed) {
                obstacle.container.rotation += obstacle.spinSpeed;
            }
        });
    }

    getActiveObstacles() {
        // In the future, this could filter based on proximity
        return this.obstacles;
    }

    reset() {
        // Reset all obstacles
        this.obstacles.forEach(obstacle => {
            if (obstacle.type === 'spinner') {
                obstacle.container.rotation = 0;
            }
        });
    }

    clear() {
        this.obstacles.forEach(obstacle => {
            obstacle.container.destroy(true);
        });
        this.obstacles = [];
    }

    destroy() {
        this.clear();
        this.container.destroy(true);
    }
}