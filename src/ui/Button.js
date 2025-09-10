import { Container, Graphics, Text } from 'pixi.js';

export default class Button extends Container {
    constructor(options = {}) {
        super();
        
        // Default options
        this.options = {
            text: options.text || 'Button',
            width: options.width || 200,
            height: options.height || 60,
            onClick: options.onClick || (() => {}),
            style: {
                fill: options.style?.fill || 0x2266cc,
                stroke: options.style?.stroke || 0x4488ff,
                strokeWidth: options.style?.strokeWidth || 3,
                hoverFill: options.style?.hoverFill || 0x3377dd,
                pressFill: options.style?.pressFill || 0x1155bb,
                radius: options.style?.radius || 10
            },
            textStyle: {
                fontFamily: options.textStyle?.fontFamily || 'Arial Black',
                fontSize: options.textStyle?.fontSize || 24,
                fill: options.textStyle?.fill || 0xffffff,
                stroke: options.textStyle?.stroke || { color: 0x000000, width: 3 },
                align: options.textStyle?.align || 'center'
            },
            enabled: options.enabled !== undefined ? options.enabled : true,
            visible: options.visible !== undefined ? options.visible : true
        };
        
        this.isHovered = false;
        this.isPressed = false;
        
        // Create button graphics
        this.createButton();
        
        // Set initial state
        this.enabled = this.options.enabled;
        this.visible = this.options.visible;
    }
    
    createButton() {
        // Background graphics
        this.bg = new Graphics();
        this.drawButton(this.options.style.fill);
        this.addChild(this.bg);
        
        // Button text
        this.label = new Text({
            text: this.options.text,
            style: this.options.textStyle
        });
        this.label.anchor.set(0.5);
        this.label.x = this.options.width / 2;
        this.label.y = this.options.height / 2;
        this.addChild(this.label);
        
        // Make interactive
        this.eventMode = 'static';
        this.cursor = 'pointer';
        
        // Add event listeners
        this.setupEventListeners();
    }
    
    drawButton(fillColor, strokeColor = null) {
        this.bg.clear();
        
        // Draw rounded rectangle
        this.bg.roundRect(
            0, 0,
            this.options.width,
            this.options.height,
            this.options.style.radius
        );
        
        // Fill
        this.bg.fill(fillColor);
        
        // Stroke
        this.bg.stroke({
            color: strokeColor || this.options.style.stroke,
            width: this.options.style.strokeWidth
        });
    }
    
    setupEventListeners() {
        // Mouse/touch events
        this.on('pointerover', this.onHover.bind(this));
        this.on('pointerout', this.onOut.bind(this));
        this.on('pointerdown', this.onPress.bind(this));
        this.on('pointerup', this.onRelease.bind(this));
        this.on('pointerupoutside', this.onReleaseOutside.bind(this));
        this.on('pointertap', this.onClick.bind(this));
    }
    
    onHover() {
        if (!this.enabled) return;
        
        this.isHovered = true;
        this.drawButton(this.options.style.hoverFill);
        this.scale.set(1.05);
    }
    
    onOut() {
        if (!this.enabled) return;
        
        this.isHovered = false;
        this.isPressed = false;
        this.drawButton(this.options.style.fill);
        this.scale.set(1);
    }
    
    onPress() {
        if (!this.enabled) return;
        
        this.isPressed = true;
        this.drawButton(this.options.style.pressFill);
        this.scale.set(0.95);
    }
    
    onRelease() {
        if (!this.enabled) return;
        
        if (this.isPressed) {
            this.isPressed = false;
            if (this.isHovered) {
                this.drawButton(this.options.style.hoverFill);
                this.scale.set(1.05);
            } else {
                this.drawButton(this.options.style.fill);
                this.scale.set(1);
            }
        }
    }
    
    onReleaseOutside() {
        if (!this.enabled) return;
        
        this.isPressed = false;
        this.drawButton(this.options.style.fill);
        this.scale.set(1);
    }
    
    onClick() {
        if (!this.enabled) return;
        
        // Play click sound if available
        if (this.options.sound && window.audioManager) {
            window.audioManager.playSound('click');
        }
        
        // Execute callback
        if (this.options.onClick) {
            this.options.onClick();
        }
    }
    
    // Public methods
    setText(text) {
        this.label.text = text;
        this.options.text = text;
    }
    
    setEnabled(enabled) {
        this.enabled = enabled;
        this.eventMode = enabled ? 'static' : 'none';
        this.cursor = enabled ? 'pointer' : 'default';
        this.alpha = enabled ? 1 : 0.5;
        
        if (!enabled) {
            this.isHovered = false;
            this.isPressed = false;
            this.drawButton(this.options.style.fill);
            this.scale.set(1);
        }
    }
    
    setVisible(visible) {
        this.visible = visible;
    }
    
    setStyle(style) {
        Object.assign(this.options.style, style);
        this.drawButton(this.options.style.fill);
    }
    
    setTextStyle(textStyle) {
        Object.assign(this.options.textStyle, textStyle);
        this.label.style = this.options.textStyle;
    }
    
    // Cleanup
    destroy(options) {
        this.removeAllListeners();
        super.destroy(options);
    }
}