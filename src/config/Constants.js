// Physics and Movement
export const PHYSICS = {
    // Gravity & Speed
    GRAVITY_BASE: 300,
    GRAVITY_MAX: 600,
    TERMINAL_VELOCITY: 800,
    MAX_FALL_SPEED: 800,
    INITIAL_WALK_SPEED: 150,
    HORIZONTAL_SPEED: 400,
    HORIZONTAL_ACCEL: 2400,
    HORIZONTAL_DECEL: 1800,
    AIR_CONTROL: 0.85,

    // Tricks (prepared for future implementation)
    TRICK_DURATION_BASE: 800,
    TRICK_COOLDOWN: 200,
    TRICK_CANCEL_WINDOW: 100,

    // Collision & Near-Miss
    PLAYER_HITBOX: { w: 60, h: 80 },
    NEAR_MISS_RANGES: [150, 120, 90, 60], // Center-to-center distances (accounting for hitbox sizes)
    GRAZE_BONUS_RANGE: 50, // Very close pass

    // Special Mechanics
    SPEED_BOOST_MULT: 1.5,
    SPEED_BOOST_DURATION: 2000,
    WALL_BOUNCE_FORCE: 300
};

// Level/Stage Configuration
export const LEVEL = {
    CLIFF_EDGE: 300,
    FALL_START_Y: 200,
    CAMERA_OFFSET_Y: 200,
    LANDING_Y: 8000, // Distance of fall
    OBSTACLE_COUNT: 50,
    OBSTACLE_SPACING: 150
};

// Animation Configuration
export const ANIMATION = {
    SPRITE_SHEET_WIDTH: 500,
    SPRITE_SHEET_HEIGHT: 500,
    SPRITE_COLS: 3,
    SPRITE_ROWS: 3,
    SPRITE_WIDTH: 500 / 3,
    SPRITE_HEIGHT: 500 / 3,
    SPRITE_SCALE: 0.5
};

// UI Configuration
export const UI = {
    PANEL_WIDTH: 500,
    PANEL_HEIGHT: 400,
    PANEL_RADIUS: 20,
    BUTTON_WIDTH: 300,
    BUTTON_HEIGHT: 60,
    BUTTON_SPACING: 20,  // ADD THIS if it doesn't exist
    BUTTON_RADIUS: 10,
    TEXT_SIZE: {
        TITLE: 72,
        SUBTITLE: 36,
        NORMAL: 24,
        SMALL: 16
    }
};

// Story Panel Configuration
export const STORY = {
    PANEL_DISPLAY_TIME: 3000,
    PANEL_FADE_TIME: 800,
    PANEL_START_X: 50,
    PANEL_START_Y: 50,
    PANEL_OFFSET_X: 100,
    PANEL_OFFSET_Y: 40,
    PANEL_MAX_WIDTH: 400,
    PANEL_MAX_HEIGHT: 300
};

// Scoring Configuration
export const SCORING = {
    LANDING_PADS: [
        // Ordered from largest to smallest so smallest (best) pads are checked last and take priority
        { x_offset: -180, width: 360, color: 0xccffcc, points: 100, label: 'GOOD' },
        { x_offset: -90, width: 180, color: 0x88ff88, points: 500, label: 'GREAT' },
        { x_offset: -30, width: 60, color: 0x44ff44, points: 1000, label: 'PERFECT' }
    ],
    NEAR_MISS_POINTS: [100, 150, 200, 300],
    COMBO_MULTIPLIERS: [1, 2, 3, 5, 8, 10],
    COMBO_TIMEOUT: 3000
};

// Colors
export const COLORS = {
    BACKGROUND: 0x0a0a1f,
    CLIFF_TOP: 0x3d3d5c,
    CLIFF_EDGE: 0x4d4d6c,
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
        IDLE_RUN: '/assets/sprites/idlerun.png',
        COVER: '/assets/nukemCover.png'
    },
    NARRATIVE_PANELS: {
        // Opening sequence (6 panels)
        OPENING: Array.from({ length: 6 }, (_, i) =>
            `/assets/narrativePanels/opening/opening${i + 1}.png`),

        // Level entry panels
        LEVEL_1_ENTRY: Array.from({ length: 3 }, (_, i) =>
            `/assets/narrativePanels/level1/level1entry${i + 1}.png`),
        LEVEL_2_ENTRY: Array.from({ length: 3 }, (_, i) =>
            `/assets/narrativePanels/level2/level2entry${i + 1}.png`),
        LEVEL_3_ENTRY: Array.from({ length: 3 }, (_, i) =>
            `/assets/narrativePanels/level3/level3entry${i + 1}.png`),
        LEVEL_4_ENTRY: Array.from({ length: 2 }, (_, i) =>
            `/assets/narrativePanels/level4/level4entry${i + 1}.png`),
        LEVEL_5_ENTRY: Array.from({ length: 3 }, (_, i) =>
            `/assets/narrativePanels/level5/level5entry${i + 1}.png`),
        LEVEL_6_ENTRY: Array.from({ length: 3 }, (_, i) =>
            `/assets/narrativePanels/level6/level6entry${i + 1}.png`),
        LEVEL_7_ENTRY: Array.from({ length: 3 }, (_, i) =>
            `/assets/narrativePanels/level7/level7entry${i + 1}.png`),
        LEVEL_8_ENTRY: Array.from({ length: 3 }, (_, i) =>
            `/assets/narrativePanels/level8/level8entry${i + 1}.png`),
        LEVEL_9_ENTRY: Array.from({ length: 3 }, (_, i) =>
            `/assets/narrativePanels/level9/level9entry${i + 1}.png`),
        LEVEL_10_ENTRY: Array.from({ length: 3 }, (_, i) =>
            `/assets/narrativePanels/level10/level10entry${i + 1}.png`),

        // Level exit panels
        LEVEL_1_EXIT: Array.from({ length: 2 }, (_, i) =>
            `/assets/narrativePanels/level1/level1exit${i + 1}.png`),
        LEVEL_2_EXIT: Array.from({ length: 2 }, (_, i) =>
            `/assets/narrativePanels/level2/level2exit${i + 1}.png`),
        LEVEL_3_EXIT: Array.from({ length: 2 }, (_, i) =>
            `/assets/narrativePanels/level3/level3exit${i + 1}.png`),
        LEVEL_4_EXIT: Array.from({ length: 2 }, (_, i) =>
            `/assets/narrativePanels/level4/level4exit${i + 1}.png`),
        LEVEL_5_EXIT: Array.from({ length: 2 }, (_, i) =>
            `/assets/narrativePanels/level5/level5exit${i + 1}.png`),
        LEVEL_6_EXIT: Array.from({ length: 2 }, (_, i) =>
            `/assets/narrativePanels/level6/level6exit${i + 1}.png`),
        LEVEL_7_EXIT: Array.from({ length: 2 }, (_, i) =>
            `/assets/narrativePanels/level7/level7exit${i + 1}.png`),
        LEVEL_8_EXIT: Array.from({ length: 2 }, (_, i) =>
            `/assets/narrativePanels/level8/level8exit${i + 1}.png`),
        LEVEL_9_EXIT: Array.from({ length: 2 }, (_, i) =>
            `/assets/narrativePanels/level9/level9exit${i + 1}.png`),
        LEVEL_10_EXIT: Array.from({ length: 2 }, (_, i) =>
            `/assets/narrativePanels/level10/level10exit${i + 1}.png`),

        // Special sequences
        MIDPOINT: Array.from({ length: 6 }, (_, i) =>
            `/assets/narrativePanels/midpoint/midpoint${i + 1}.png`),
        ENDING: Array.from({ length: 10 }, (_, i) =>
            `/assets/narrativePanels/ending/ending${i + 1}.png`),

        // Ending split into two parts for better visibility
        ENDING_PART1: Array.from({ length: 5 }, (_, i) =>
            `/assets/narrativePanels/ending/ending${i + 1}.png`),
        ENDING_PART2: Array.from({ length: 5 }, (_, i) =>
            `/assets/narrativePanels/ending/ending${i + 6}.png`)
    }
};

// Game States
export const GAME_STATES = {
    MENU: 'menu',
    STORY: 'story',
    GAME: 'game',
    HIGHSCORES: 'highscores',
    PAUSE: 'pause'
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
    { type: 'wall', color: 0x4444ff, damage: 50 },
    { type: 'alien', color: 0x00ff88, damage: 100 },
    { type: 'barrel', color: 0xffaa00, damage: 75 },
    { type: 'laser', color: 0xff0000, damage: 100 },
    { type: 'meteor', color: 0x888888, damage: 75 },
    { type: 'orbiter', color: 0x00ffff, damage: 75 },
    { type: 'pendulum', color: 0xffff00, damage: 75 },
    { type: 'pulsar', color: 0xff00ff, damage: 50 }
];
