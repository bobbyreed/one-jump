// Physics
export const PHYSICS = {
    GRAVITY: 981,
    FALL_SPEED: 300,
    HORIZONTAL_SPEED: 400,
    NEAR_MISS_THRESHOLD: 50,
    COLLISION_PADDING: 10,
    WALL_POSITION_LEFT: 50,
    WALL_POSITION_RIGHT: 1870,
    FALL_START_Y: 200,
    LANDING_Y: 900
};

// Animation
export const ANIMATION = {
    FRAME_WIDTH: 190,
    FRAME_HEIGHT: 250,
    SPRITE_SCALE: 0.4,
    FRAMES_PER_ROW: 16,
    TOTAL_FRAMES: 16,
    RUN_SPEED: 0.2,
    JETPACK_SPEED: 0.15,
    IDLE_SPEED: 0.1
};

// Scoring
export const SCORING = {
    NEAR_MISS_BASE: 100,
    NEAR_MISS_MULTIPLIER: 1.5,
    TRICK_BASE: 50,
    COMBO_MULTIPLIER: 2,
    PERFECT_LANDING: 500
};

// UI Configuration
export const UI = {
    BUTTON_WIDTH: 200,
    BUTTON_HEIGHT: 60,
    BUTTON_RADIUS: 10,
    HUD_PADDING: 20,
    HUD_FONT_SIZE: 24,
    TITLE_FONT_SIZE: 72,
    MENU_SPACING: 30
};

// Story/Narrative
export const STORY = {
    PANEL_COUNT: 5, // Default for opening story
    PANEL_MAX_WIDTH: 800,
    PANEL_MAX_HEIGHT: 600,
    PANEL_START_X: 100,
    PANEL_START_Y: 100,
    PANEL_OFFSET_X: 150,
    PANEL_OFFSET_Y: 30,
    PANEL_FADE_TIME: 800,
    PANEL_DISPLAY_TIME: 5000,
    AUTO_ADVANCE: true
};

// Colors
export const COLORS = {
    BACKGROUND: 0x1a1a2e,
    PLAYER: 0x00ff00,
    OBSTACLE: 0xff0000,
    PLATFORM_EDGE: 0x4d4d6c,
    WALL: 0x2d2d44,
    GROUND: 0x2d2d44,
    WARNING: 0xffff00,
    DANGER: 0xff4444,
    SUCCESS: 0x44ff44,
    UI_PRIMARY: 0x4488ff,
    UI_SECONDARY: 0xff88ff,
    TEXT_PRIMARY: 0xffffff,
    TEXT_SECONDARY: 0xcccccc
};

// Asset Paths
export const ASSETS = {
    SPRITES: {
        IDLE_RUN: '/public/assets/sprites/idlerun.png',
        COVER: '/public/assets/nukemCover.png'
    },
    NARRATIVE_PANELS: {
        // Opening story panels (main menu intro)
        OPENING: Array.from({ length: 5 }, (_, i) =>
            `/public/assets/narrativePanels/opening/opening${i + 1}.png`),
        
        // Level-specific panels are loaded dynamically
        // Level 1 panels
        LEVEL1_ENTRY: Array.from({ length: 3 }, (_, i) =>
            `/public/assets/narrativePanels/level1/level1entry${i + 1}.png`),
        LEVEL1_EXIT: Array.from({ length: 2 }, (_, i) =>
            `/public/assets/narrativePanels/level1/level1exit${i + 1}.png`),
        
        // Level 2 panels (the ones you've added)
        LEVEL2_ENTRY: Array.from({ length: 3 }, (_, i) =>
            `/public/assets/narrativePanels/level2/level2entry${i + 1}.png`),
        LEVEL2_EXIT: Array.from({ length: 2 }, (_, i) =>
            `/public/assets/narrativePanels/level2/level2exit${i + 1}.png`),
        
        // Level 3 panels
        LEVEL3_ENTRY: Array.from({ length: 3 }, (_, i) =>
            `/public/assets/narrativePanels/level3/level3entry${i + 1}.png`),
        LEVEL3_EXIT: Array.from({ length: 2 }, (_, i) =>
            `/public/assets/narrativePanels/level3/level3exit${i + 1}.png`),
        
        // Victory sequence (Level 10 exit)
        VICTORY: Array.from({ length: 8 }, (_, i) =>
            `/public/assets/narrativePanels/victory/victory${i + 1}.png`)
    }
};

// Game States
export const GAME_STATES = {
    MENU: 'menu',
    STORY: 'story',
    GAME: 'game',
    HIGHSCORES: 'highscores',
    PAUSE: 'pause',
    LEVELSELECT: 'levelselect'
};

// Player States
export const PLAYER_STATES = {
    WALKING: 'walking',
    FALLING: 'falling',
    LANDED: 'landed',
    CRASHED: 'crashed',
    TRICKING: 'tricking'
};

// Obstacle Types
export const OBSTACLE_TYPES = [
    { type: 'spike', color: 0xff4444, damage: 100 },
    { type: 'platform', color: 0xff8844, damage: 0 },
    { type: 'spinner', color: 0xff44ff, damage: 100 },
    { type: 'wall', color: 0x4444ff, damage: 50 }
];

// Level-specific obstacle types
export const LEVEL_OBSTACLES = {
    1: ['satellite', 'debris', 'asteroid'],
    2: ['asteroid_small', 'asteroid_large', 'comet'],
    3: ['ice_chunk', 'ring_particle', 'frozen_debris'],
    4: ['heat_wave', 'plasma', 'turbulence'],
    5: ['cloud', 'bird', 'plane'],
    6: ['skyscraper', 'antenna', 'billboard'],
    7: ['helicopter', 'drone', 'balloon'],
    8: ['tree', 'powerline', 'streetlight'],
    9: ['flag', 'banner', 'mascot'],
    10: ['fountain', 'statue', 'crowd']
};