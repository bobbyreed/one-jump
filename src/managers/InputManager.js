export default class InputManager {
    constructor() {
        this.keys = {};
        this.listeners = new Map();
        this.enabled = true;

        // Bind event listeners
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleKeyUp = this.handleKeyUp.bind(this);

        // Add event listeners
        window.addEventListener('keydown', this.handleKeyDown);
        window.addEventListener('keyup', this.handleKeyUp);
    }

    handleKeyDown(event) {
        if (!this.enabled) return;

        this.keys[event.code] = true;

        // Trigger registered callbacks
        const callbacks = this.listeners.get('keydown');
        if (callbacks) {
            callbacks.forEach(callback => callback(event.code));
        }
    }

    handleKeyUp(event) {
        if (!this.enabled) return;

        this.keys[event.code] = false;

        // Trigger registered callbacks
        const callbacks = this.listeners.get('keyup');
        if (callbacks) {
            callbacks.forEach(callback => callback(event.code));
        }
    }

    isKeyDown(keyCode) {
        return !!this.keys[keyCode];
    }

    isAnyKeyDown(...keyCodes) {
        return keyCodes.some(key => this.isKeyDown(key));
    }

    // Register callbacks for events
    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }
        this.listeners.get(event).add(callback);
    }

    off(event, callback) {
        const callbacks = this.listeners.get(event);
        if (callbacks) {
            callbacks.delete(callback);
        }
    }

    // Get movement input (-1, 0, or 1)
    getHorizontalInput() {
        const left = this.isAnyKeyDown('KeyA', 'ArrowLeft') ? -1 : 0;
        const right = this.isAnyKeyDown('KeyD', 'ArrowRight') ? 1 : 0;
        return left + right;
    }

    getVerticalInput() {
        const up = this.isAnyKeyDown('KeyW', 'ArrowUp') ? -1 : 0;
        const down = this.isAnyKeyDown('KeyS', 'ArrowDown') ? 1 : 0;
        return up + down;
    }

    // Action keys
    isJumpPressed() {
        return this.isKeyDown('Space');
    }

    isBoostPressed() {
        return this.isKeyDown('ShiftLeft') || this.isKeyDown('ShiftRight');
    }

    isPausePressed() {
        return this.isKeyDown('Escape');
    }

    isRestartPressed() {
        return this.isKeyDown('KeyR');
    }

    // Enable/disable input
    setEnabled(enabled) {
        this.enabled = enabled;
        if (!enabled) {
            // Clear all keys when disabled
            this.keys = {};
        }
    }

    reset() {
        this.keys = {};
    }

    destroy() {
        window.removeEventListener('keydown', this.handleKeyDown);
        window.removeEventListener('keyup', this.handleKeyUp);
        this.listeners.clear();
        this.keys = {};
    }
}