import { Assets } from 'pixi.js';
import { ASSETS } from '../config/Constants.js';

export default class AssetManager {
    constructor(game) {
        this.game = game;
        this.textures = new Map();
        this.animations = new Map();
        this.sounds = new Map();
    }

    async preload() {
        try {
            // Load main spritesheet
            const idleRunTexture = await Assets.load(ASSETS.SPRITES.IDLE_RUN);
            this.textures.set('idleRun', idleRunTexture);

            // Load cover image
            const coverTexture = await Assets.load(ASSETS.SPRITES.COVER);
            this.textures.set('cover', coverTexture);

            // Setup animations after spritesheet loads
            this.setupAnimations();

            console.log('Assets preloaded successfully');
        } catch (error) {
            console.error('Failed to preload assets:', error);
        }
    }

    setupAnimations() {
        // Get base texture
        const baseTexture = this.textures.get('idleRun');
        if (!baseTexture) return;

        // Define frame dimensions
        const frameWidth = 144;
        const frameHeight = 126;
        const columns = 3;
        const rows = 3;

        // Create textures for each frame
        const textures = [];
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < columns; col++) {
                const texture = baseTexture.clone();
                texture.frame.x = col * frameWidth;
                texture.frame.y = row * frameHeight;
                texture.frame.width = frameWidth;
                texture.frame.height = frameHeight;
                texture.updateUvs();
                textures.push(texture);
            }
        }

        // Define animations
        this.animations.set('idle', [textures[0]]);
        this.animations.set('running', [textures[0], textures[7], textures[8]]);
        this.animations.set('jetpackActivation', [
            textures[1], textures[2], textures[3],
            textures[4], textures[5], textures[6]
        ]);
        this.animations.set('falling', [textures[6]]);
    }

    /**
     * Load story panels dynamically for a specific level and story type
     * @param {number} levelNumber - The level number (1-10)
     * @param {string} storyType - Either 'entry' or 'exit'
     * @param {number} panelCount - Number of panels to load (default 1-3 for level stories)
     * @returns {Array} Array of loaded textures or nulls for missing panels
     */
    async loadLevelStoryPanels(levelNumber, storyType, panelCount = 3) {
        const panels = [];
        const basePath = `/public/assets/narrativePanels/level${levelNumber}/`;
        
        for (let i = 1; i <= panelCount; i++) {
            const filename = `level${levelNumber}${storyType}${i}.png`;
            const path = basePath + filename;
            
            try {
                const texture = await Assets.load(path);
                panels.push(texture);
                console.log(`Loaded story panel: ${filename}`);
            } catch (error) {
                console.warn(`Could not load panel ${filename}, checking if single panel...`);
                
                // If it's the first panel and failed, it might not exist at all
                if (i === 1) {
                    // Return empty array if no panels exist for this level/type
                    console.warn(`No ${storyType} panels found for level ${levelNumber}`);
                    return [];
                }
                
                // Otherwise, just add null for missing subsequent panels
                panels.push(null);
            }
        }
        
        // Store in texture cache for later retrieval
        const cacheKey = `level${levelNumber}_${storyType}_panels`;
        this.textures.set(cacheKey, panels);
        
        return panels;
    }

    /**
     * Load opening story panels (original implementation kept for compatibility)
     */
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

    /**
     * Get cached story panels for a level
     */
    getLevelStoryPanels(levelNumber, storyType) {
        const cacheKey = `level${levelNumber}_${storyType}_panels`;
        return this.textures.get(cacheKey) || [];
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

    /**
     * Clear level-specific story panels from cache
     */
    clearLevelStoryPanels(levelNumber) {
        const entryKey = `level${levelNumber}_entry_panels`;
        const exitKey = `level${levelNumber}_exit_panels`;
        
        this.unloadTexture(entryKey);
        this.unloadTexture(exitKey);
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