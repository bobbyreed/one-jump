import { Container, Graphics, Text } from 'pixi.js';

export default class TextInput {
    constructor(label, x, y, width, height, initialValue = '', maxLength = 20, onChange = null) {
        this.container = new Container();
        this.container.x = x;
        this.container.y = y;
        this.width = width;
        this.height = height;
        this.maxLength = maxLength;
        this.value = initialValue;
        this.onChange = onChange;
        this.isFocused = false;
        this.cursorVisible = true;
        this.cursorBlinkTimer = 0;
        this.cursorBlinkInterval = 500; // ms

        this.createLabel(label);
        this.createInputBox();
        this.createValueText();
        this.setupInteraction();
    }

    createLabel(labelText) {
        this.label = new Text({
            text: labelText,
            style: {
                fontFamily: 'Arial',
                fontSize: 18,
                fill: 0xffffff
            }
        });
        this.label.anchor.set(0, 0.5);
        this.label.x = 0;
        this.label.y = this.height / 2;
        this.container.addChild(this.label);

        // Saved indicator (appears after saving)
        this.savedIndicator = new Text({
            text: '✓ Saved',
            style: {
                fontFamily: 'Arial',
                fontSize: 14,
                fill: 0x44ff44
            }
        });
        this.savedIndicator.anchor.set(0, 0.5);
        this.savedIndicator.x = 0;
        this.savedIndicator.y = this.height / 2 + 25;
        this.savedIndicator.visible = false;
        this.container.addChild(this.savedIndicator);
    }

    createInputBox() {
        this.inputBox = new Graphics();
        const boxX = this.label.width + 15;

        // Background
        this.inputBox.rect(boxX, 0, this.width, this.height);
        this.inputBox.fill({ color: 0x2a2a3a, alpha: 0.9 });

        // Border
        this.inputBox.rect(boxX, 0, this.width, this.height);
        this.inputBox.stroke({ color: 0x4488ff, width: 2 });

        this.inputBox.interactive = true;
        this.inputBox.cursor = 'text';
        this.container.addChild(this.inputBox);

        this.boxX = boxX;
    }

    createValueText() {
        // Placeholder text
        this.placeholderText = new Text({
            text: 'Click to enter name...',
            style: {
                fontFamily: 'Arial',
                fontSize: 18,
                fill: 0x888888,
                fontStyle: 'italic'
            }
        });
        this.placeholderText.anchor.set(0, 0.5);
        this.placeholderText.x = this.boxX + 10;
        this.placeholderText.y = this.height / 2;
        this.placeholderText.visible = !this.value;
        this.container.addChild(this.placeholderText);

        // Actual value text
        this.valueText = new Text({
            text: this.value || '',
            style: {
                fontFamily: 'Arial',
                fontSize: 20,
                fill: 0xffffff
            }
        });
        this.valueText.anchor.set(0, 0.5);
        this.valueText.x = this.boxX + 10;
        this.valueText.y = this.height / 2;
        this.container.addChild(this.valueText);

        // Cursor
        this.cursor = new Graphics();
        this.cursor.rect(0, 0, 2, 24);
        this.cursor.fill(0xffffff);
        this.cursor.x = this.boxX + 10 + this.valueText.width;
        this.cursor.y = this.height / 2 - 12;
        this.cursor.visible = false;
        this.container.addChild(this.cursor);
    }

    setupInteraction() {
        this.inputBox.on('pointerdown', () => this.focus());

        // Listen for global clicks to unfocus
        this.globalClickHandler = (e) => {
            if (!this.inputBox.containsPoint(e.global)) {
                this.blur();
            }
        };
    }

    focus() {
        if (this.isFocused) return;

        this.isFocused = true;
        this.cursor.visible = true;
        this.cursorVisible = true;

        // Hide placeholder when focused
        this.placeholderText.visible = false;

        // Update border color
        this.inputBox.clear();
        this.inputBox.rect(this.boxX, 0, this.width, this.height);
        this.inputBox.fill({ color: 0x2a2a3a, alpha: 0.9 });
        this.inputBox.rect(this.boxX, 0, this.width, this.height);
        this.inputBox.stroke({ color: 0x66aaff, width: 3 });

        // Add keyboard listener
        window.addEventListener('keydown', this.keydownHandler = (e) => this.handleKeydown(e));
    }

    blur() {
        if (!this.isFocused) return;

        this.isFocused = false;
        this.cursor.visible = false;

        // Show placeholder if no value
        this.placeholderText.visible = !this.value || this.value.trim() === '';

        // Reset border color
        this.inputBox.clear();
        this.inputBox.rect(this.boxX, 0, this.width, this.height);
        this.inputBox.fill({ color: 0x2a2a3a, alpha: 0.9 });
        this.inputBox.rect(this.boxX, 0, this.width, this.height);
        this.inputBox.stroke({ color: 0x4488ff, width: 2 });

        // Remove keyboard listener
        if (this.keydownHandler) {
            window.removeEventListener('keydown', this.keydownHandler);
            this.keydownHandler = null;
        }

        // Trigger onChange callback and show saved indicator
        if (this.onChange && this.value.trim()) {
            this.onChange(this.value);
            this.showSavedIndicator();
        }
    }

    showSavedIndicator() {
        this.savedIndicator.visible = true;
        this.savedIndicator.alpha = 1;

        // Fade out after 2 seconds
        if (this.savedIndicatorTimeout) {
            clearTimeout(this.savedIndicatorTimeout);
        }

        this.savedIndicatorTimeout = setTimeout(() => {
            this.fadeSavedIndicator();
        }, 2000);
    }

    fadeSavedIndicator() {
        let alpha = 1;
        const fadeInterval = setInterval(() => {
            alpha -= 0.05;
            this.savedIndicator.alpha = alpha;

            if (alpha <= 0) {
                this.savedIndicator.visible = false;
                clearInterval(fadeInterval);
            }
        }, 30);
    }

    handleKeydown(e) {
        if (!this.isFocused) return;

        // Prevent default behavior for input keys
        if (e.key.length === 1 || e.key === 'Backspace' || e.key === 'Enter') {
            e.preventDefault();
        }

        if (e.key === 'Enter') {
            this.blur();
            return;
        }

        if (e.key === 'Backspace') {
            if (this.value.length > 0) {
                this.value = this.value.slice(0, -1);
                this.updateDisplay();
            }
            return;
        }

        // Only allow alphanumeric, spaces, and basic punctuation
        if (e.key.length === 1) {
            const allowedChars = /^[a-zA-Z0-9 _\-.]$/;
            if (allowedChars.test(e.key) && this.value.length < this.maxLength) {
                this.value += e.key;
                this.updateDisplay();
            }
        }
    }

    updateDisplay() {
        this.valueText.text = this.value || '';
        this.placeholderText.visible = !this.value || this.value.trim() === '';
        this.cursor.x = this.boxX + 10 + this.valueText.width;

        // Reset cursor blink
        this.cursorVisible = true;
        this.cursor.visible = true;
        this.cursorBlinkTimer = 0;
    }

    update(deltaTime) {
        if (!this.isFocused) return;

        // Blink cursor
        this.cursorBlinkTimer += deltaTime;
        if (this.cursorBlinkTimer >= this.cursorBlinkInterval) {
            this.cursorBlinkTimer = 0;
            this.cursorVisible = !this.cursorVisible;
            this.cursor.visible = this.cursorVisible;
        }
    }

    getValue() {
        return this.value;
    }

    setValue(newValue) {
        this.value = newValue.slice(0, this.maxLength);
        this.updateDisplay();
    }

    destroy() {
        if (this.keydownHandler) {
            window.removeEventListener('keydown', this.keydownHandler);
        }
        this.inputBox.removeAllListeners();
        this.container.destroy({ children: true });
    }
}
