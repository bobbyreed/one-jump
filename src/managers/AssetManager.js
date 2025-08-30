import { Assets, Texture, Rectangle } from 'pixi.js';
import { ASSETS, ANIMATION } from '../config/Constants.js';

export default class AssetManager {
    constructor() {
        this.textures = new Map();
        this.animations = new Map();
    }

    async loadCoreAssets() {
        try {
            // Load cover image
            const coverTexture = await Assets.load(ASSETS.SPRITES.COVER);
            this.textures.set('cover', coverTexture);

            // Load sprite sheet
            const spriteSheetTexture = await Assets.load(ASSETS.SPRITES.IDLE_RUN);
            this.textures.set('spriteSheet', spriteSheetTexture);

            // Create animation textures from sprite sheet
            this.createAnimations(spriteSheetTexture);

            console.log('Core assets loaded successfully');
        } catch (error) {
            console.error('Failed to load core assets:', error);
            throw error;
        }
    }

    createAnimations(baseTexture) {
        const textures = [];

        // Extract individual frames from sprite sheet
        for (let row = 0; row < ANIMATION.SPRITE_ROWS; row++) {
            for (let col = 0; col < ANIMATION.SPRITE_COLS; col++) {
                const frame = new Rectangle(
                    col * ANIMATION.SPRITE_WIDTH,
                    row * (ANIMATION.SPRITE_HEIGHT + 12), // Account for spacing in sprite sheet
                    ANIMATION.SPRITE_WIDTH,
                    ANIMATION.SPRITE_HEIGHT
                );

                const texture = new Texture({
                    source: baseTexture.source,
                    frame: frame
                });

                textures.push(texture);
            }
        }

        // Define animation sequences
        // Cell numbering: 1=index 0, 2=index 1, etc.
        this.animations.set('idle', [textures[0]]);
        this.animations.set('running', [textures[0], textures[7], textures[8]]);
        this.animations.set('jetpackActivation', [
            textures[1], textures[2], textures[3],
            textures[4], textures[5], textures[6]
        ]);
        this.animations.set('falling', [textures[6]]);
    }

    async loadStoryPanels() {
        const panels = [];

        for (let i = 0; i < ASSETS.NARRATIVE_PANELS.OPENING.length; i++) {
            try {
                const texture = await Assets.load(ASSETS.NARRATIVE_PANELS.OPENING[i]);
                panels.push(texture);
            } catch (error) {
                console.warn(`Could not load panel ${i + 1}, using placeholder`);
                panels.push(null); // Scene will handle placeholder creation
            }
        }

        this.textures.set('storyPanels', panels);
        return panels;
    }

    getTexture(name) {
        return this.textures.get(name);
    }

    getAnimation(name) {
        return this.animations.get(name);
    }

    async loadTexture(url, name) {
        try {
            const texture = await Assets.load(url);
            this.textures.set(name, texture);
            return texture;
        } catch (error) {
            console.error(`Failed to load texture ${name} from ${url}:`, error);
            return null;
        }
    }

    unloadTexture(name) {
        const texture = this.textures.get(name);
        if (texture) {
            texture.destroy(true);
            this.textures.delete(name);
        }
    }

    clear() {
        this.textures.forEach(texture => {
            if (texture && texture.destroy) {
                texture.destroy(true);
            }
        });
        this.textures.clear();
        this.animations.clear();
    }
}