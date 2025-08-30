import { Container, Graphics, Text } from 'pixi.js';

export default class Button {
    constructor(text, x, y, width, height, color, onClick) {
        this.container = new Container();
        this.container.eventMode = 'static';
        this.container.cursor = 'pointer';

        this.width = width;
        this.height = height;
        this.color = color;
        this.onClick = onClick;

        // Create backgrounds
        this.bg = new Graphics()
            .roundRect(0, 0, width, height, 10)
            .fill({ color: color, alpha: 0.3 })
            .roundRect(0, 0, width, height, 10)
            .stroke({ width: 2, color: color });

        this.hoverBg = new Graphics()
            .roundRect(0, 0, width, height, 10)
            .fill({ color: color, alpha: 0.5 })
            .roundRect(0, 0, width, height, 10)
            .stroke({ width: 3, color: color });
        this.hoverBg.visible = false;

        // Create label
        this.label = new Text({
            text: text,
            style: {
                fontFamily: 'Arial',
                fontSize: 24,
                fill: 0xffffff,
                fontWeight: 'bold',
                dropShadow: true,
                dropShadowColor: 0x000000,
                dropShadowDistance: 2
            }
        });
        this.label.anchor.set(0.5);
        this.label.x = width / 2;
        this.label.y = height / 2;

        // Add to container
        this.container.addChild(this.bg, this.hoverBg, this.label);
        this.container.x = x;
        this.container.y = y;

        // Setup interactions
        this.setupInteractions();
    }

    setupInteractions() {
        this.container.on('pointerover', () => {
            this.hoverBg.visible = true;
            this.container.scale.set(1.05);
        });

        this.container.on('pointerout', () => {
            this.hoverBg.visible = false;
            this.container.scale.set(1);
        });

        this.container.on('pointerdown', () => {
            if (this.onClick) {
                this.onClick();
            }
        });
    }

    setText(text) {
        this.label.text = text;
    }

    setEnabled(enabled) {
        this.container.eventMode = enabled ? 'static' : 'none';
        this.container.alpha = enabled ? 1 : 0.5;
    }

    destroy() {
        this.container.destroy(true);
    }
}
