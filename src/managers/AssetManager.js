import { Assets } from 'pixi.js';
import { ASSETS, ANIMATION } from '../config/Constants.js';

export default class AssetManager {
    constructor() {
        this.textures = new Map();
        this.animations = new Map();
    }

    async loadCoreAssets() {
        // Load idle-run sprite sheet
        const idleRunTexture = await Assets.load(ASSETS.SPRITES.IDLE_RUN);
        this.textures.set('idleRun', idleRunTexture);

        // Load cover image
        const coverTexture = await Assets.load(ASSETS.SPRITES.COVER);
        this.textures.set('cover', coverTexture);

        // Create animations from sprite sheet
        this.createCharacterAnimations(idleRunTexture);
    }

    createCharacterAnimations(baseTexture) {
        const textures = [];
        const frameWidth = ANIMATION.FRAME_WIDTH;
        const frameHeight = ANIMATION.FRAME_HEIGHT;

        // Extract frames from the sprite sheet
        for (let i = 0; i < ANIMATION.TOTAL_FRAMES; i++) {
            const x = (i % ANIMATION.FRAMES_PER_ROW) * frameWidth;
            const y = Math.floor(i / ANIMATION.FRAMES_PER_ROW) * frameHeight;

            const frame = baseTexture.clone();
            frame.frame.x = x;
            frame.frame.y = y;
            frame.frame.width = frameWidth;
            frame.frame.height = frameHeight;
            frame.updateUvs();

            textures.push(frame);
        }

        // Map frames to animations
        this.animations.set('idle', [textures[0]]);
        this.animations.set('running', [textures[0], textures[7], textures[8]]);
        this.animations.set('jetpackActivation', [
            textures[1], textures[2], textures[3],
            textures[4], textures[5], textures[6]
        ]);
        this.animations.set('falling', [textures[6]]);
    }

    async loadStoryPanels(levelNumber = 0, isIntro = true) {
        const panels = [];
        let panelPaths = [];

        // Determine which panels to load based on level
        if (levelNumber === 0) {
            // Opening story panels
            panelPaths = ASSETS.NARRATIVE_PANELS.OPENING;
        } else {
            // Level-specific panels
            panelPaths = this.getLevelPanelPaths(levelNumber, isIntro);
        }

        // Load each panel
        for (let i = 0; i < panelPaths.length; i++) {
            try {
                const texture = await Assets.load(panelPaths[i]);
                panels.push(texture);
            } catch (error) {
                console.warn(`Could not load panel ${i + 1} from ${panelPaths[i]}, using placeholder`);
                panels.push(null); // Scene will handle placeholder creation
            }
        }

        // Store in textures map with a unique key
        const key = levelNumber === 0 ? 'storyPanels' : `level${levelNumber}${isIntro ? 'Intro' : 'Outro'}Panels`;
        this.textures.set(key, panels);
        
        return panels;
    }

    getLevelPanelPaths(levelNumber, isIntro) {
        const panelType = isIntro ? 'entry' : 'exit';
        const basePath = `/public/assets/narrativePanels/level${levelNumber}`;
        
        // Determine number of panels based on level and type
        let panelCount = 3; // Default for most levels
        
        // Special cases for different levels
        if (levelNumber === 1 && isIntro) {
            panelCount = 3;
        } else if (levelNumber === 2 && isIntro) {
            panelCount = 3;
        } else if (levelNumber === 10 && !isIntro) {
            panelCount = 8; // Victory sequence
        }
        
        // Generate paths
        const paths = [];
        for (let i = 1; i <= panelCount; i++) {
            paths.push(`${basePath}/level${levelNumber}${panelType}${i}.png`);
        }
        
        return paths;
    }

    async loadLevelAssets(levelNumber) {
        // Load intro panels for the level
        await this.loadStoryPanels(levelNumber, true);
        
        // Pre-load outro panels as well
        await this.loadStoryPanels(levelNumber, false);
        
        // Load any level-specific gameplay assets here
        // For example: unique obstacles, backgrounds, etc.
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