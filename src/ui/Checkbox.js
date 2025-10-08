import { Container, Graphics, Text } from 'pixi.js';

export default class Checkbox {
    constructor(label, x, y, checked = false, onChange) {
        this.container = new Container();
        this.container.x = x;
        this.container.y = y;

        this.checked = checked;
        this.onChange = onChange;

        this.boxSize = 30;
        this.box = null;
        this.checkmark = null;
        this.label = null;

        this.createCheckbox(label);
        this.updateVisual();
    }

    createCheckbox(labelText) {
        // Create checkbox box
        this.box = new Graphics();
        this.drawBox(false);
        this.box.eventMode = 'static';
        this.box.cursor = 'pointer';
        this.container.addChild(this.box);

        // Create checkmark (initially hidden)
        this.checkmark = new Graphics()
            .moveTo(6, 15)
            .lineTo(12, 22)
            .lineTo(24, 8)
            .stroke({ width: 3, color: 0x44ff44 });
        this.checkmark.visible = this.checked;
        this.container.addChild(this.checkmark);

        // Create label
        this.label = new Text({
            text: labelText,
            style: {
                fontFamily: 'Arial',
                fontSize: 20,
                fill: 0xffffff,
                dropShadow: true,
                dropShadowColor: 0x000000,
                dropShadowDistance: 2
            }
        });
        this.label.x = this.boxSize + 10;
        this.label.y = (this.boxSize - this.label.height) / 2;
        this.container.addChild(this.label);

        // Make entire container interactive
        this.container.eventMode = 'static';
        this.container.cursor = 'pointer';

        // Add hover effects
        this.container.on('pointerover', () => this.onHover());
        this.container.on('pointerout', () => this.onHoverEnd());
        this.container.on('pointerdown', () => this.toggle());
    }

    drawBox(hover) {
        this.box.clear();
        this.box
            .roundRect(0, 0, this.boxSize, this.boxSize, 5)
            .fill({ color: 0x222244, alpha: hover ? 0.8 : 0.5 })
            .roundRect(0, 0, this.boxSize, this.boxSize, 5)
            .stroke({ width: 2, color: hover ? 0x88aaff : 0x4488ff });
    }

    onHover() {
        this.drawBox(true);
        this.label.style.fill = 0xaaccff;
    }

    onHoverEnd() {
        this.drawBox(false);
        this.label.style.fill = 0xffffff;
    }

    toggle() {
        this.checked = !this.checked;
        this.updateVisual();

        if (this.onChange) {
            this.onChange(this.checked);
        }
    }

    setChecked(value) {
        this.checked = value;
        this.updateVisual();
    }

    updateVisual() {
        if (this.checkmark) {
            this.checkmark.visible = this.checked;
        }
    }

    destroy() {
        this.container.destroy(true);
    }
}
