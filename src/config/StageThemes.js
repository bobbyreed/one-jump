/**
 * Visual theme configurations for all 10 stages
 * Aligned with GDD atmospheric progression from space to campus
 */

export const STAGE_THEMES = {
    1: {
        // Stage 1: The Cosmic Perch
        name: "The Cosmic Perch",
        atmosphere: "space",

        // Color palette
        colors: {
            primary: 0x000428,      // Deep space black-blue
            secondary: 0x001a4d,    // Dark blue
            accent: 0xFFFFFF,       // Bright stars
            nebula: 0x4B0082,       // Purple nebula
            obstacle: 0x888888,     // Metallic gray
            highlight: 0x00FFFF     // Cyan tech
        },

        // Background gradient
        gradient: {
            top: 0x000000,
            bottom: 0x000428
        },

        // Parallax layers configuration
        parallax: {
            // Layer 1: Distant stars (slowest)
            distant: {
                type: 'stars',
                density: 100,
                speed: 0.1,
                size: { min: 1, max: 2 },
                twinkle: true
            },
            // Layer 2: Nebula clouds
            far: {
                type: 'nebula',
                count: 3,
                speed: 0.2,
                alpha: 0.3,
                colors: [0x4B0082, 0x800080, 0x9400D3]
            },
            // Layer 3: Medium stars
            mid: {
                type: 'stars',
                density: 50,
                speed: 0.4,
                size: { min: 2, max: 3 },
                twinkle: true
            },
            // Layer 4: Satellites
            near: {
                type: 'satellites',
                count: 2,
                speed: 0.7,
                alpha: 0.5
            }
        },

        // Environmental effects
        effects: {
            particles: {
                type: 'starDust',
                count: 30,
                speed: 50,
                color: 0xFFFFFF,
                alpha: 0.6
            },
            ambient: null
        }
    },

    2: {
        // Stage 2: Thermosphere Thunder
        name: "Thermosphere Thunder",
        atmosphere: "reentry",

        colors: {
            primary: 0xFF4500,      // Orange-red
            secondary: 0xFF6347,    // Tomato
            accent: 0xFFFF00,       // Bright yellow
            glow: 0xFF8C00,         // Dark orange
            obstacle: 0xCC3300,     // Red-orange
            highlight: 0xFFFFCC     // Light yellow
        },

        gradient: {
            top: 0x1a0a00,
            bottom: 0xFF4500
        },

        parallax: {
            distant: {
                type: 'heatWaves',
                count: 5,
                speed: 0.2,
                alpha: 0.2,
                distortion: true
            },
            far: {
                type: 'meteors',
                count: 4,
                speed: 0.3,
                trail: true
            },
            mid: {
                type: 'plasmaClouds',
                count: 3,
                speed: 0.5,
                alpha: 0.4,
                colors: [0xFF4500, 0xFF8C00]
            },
            near: {
                type: 'fireParticles',
                density: 40,
                speed: 0.8
            }
        },

        effects: {
            particles: {
                type: 'ember',
                count: 50,
                speed: 80,
                color: 0xFF4500,
                alpha: 0.7,
                rise: true
            },
            ambient: {
                type: 'heatShimmer',
                intensity: 0.3
            },
            screenShake: {
                enabled: true,
                intensity: 1
            }
        }
    },

    3: {
        // Stage 3: Mesosphere Mayhem
        name: "Mesosphere Mayhem",
        atmosphere: "ice",

        colors: {
            primary: 0x87CEEB,      // Sky blue
            secondary: 0x4682B4,    // Steel blue
            accent: 0xFFFFFF,       // Pure white
            ice: 0xE0FFFF,          // Light cyan
            obstacle: 0x6495ED,     // Cornflower blue
            highlight: 0xADD8E6     // Light blue
        },

        gradient: {
            top: 0x001f3f,
            bottom: 0x87CEEB
        },

        parallax: {
            distant: {
                type: 'aurora',
                count: 2,
                speed: 0.1,
                alpha: 0.3,
                colors: [0x00FF00, 0x00FFFF, 0xFF00FF]
            },
            far: {
                type: 'iceClouds',
                count: 5,
                speed: 0.25,
                alpha: 0.5
            },
            mid: {
                type: 'snowflakes',
                density: 60,
                speed: 0.4,
                size: { min: 2, max: 5 }
            },
            near: {
                type: 'iceCrystals',
                count: 20,
                speed: 0.7,
                sparkle: true
            }
        },

        effects: {
            particles: {
                type: 'snow',
                count: 80,
                speed: 60,
                color: 0xFFFFFF,
                alpha: 0.8,
                drift: true
            },
            ambient: {
                type: 'frost',
                intensity: 0.2
            }
        }
    },

    4: {
        // Stage 4: Stratosphere Showdown
        name: "Stratosphere Showdown",
        atmosphere: "sky",

        colors: {
            primary: 0x87CEEB,      // Sky blue
            secondary: 0x4169E1,    // Royal blue
            accent: 0xFFFFFF,       // White clouds
            tech: 0xC0C0C0,         // Silver instruments
            obstacle: 0x708090,     // Slate gray
            highlight: 0xFFA500     // Orange markers
        },

        gradient: {
            top: 0x1e3a8a,
            bottom: 0x87CEEB
        },

        parallax: {
            distant: {
                type: 'horizonClouds',
                count: 4,
                speed: 0.15,
                alpha: 0.4
            },
            far: {
                type: 'weatherBalloons',
                count: 3,
                speed: 0.3,
                float: true
            },
            mid: {
                type: 'thinClouds',
                count: 6,
                speed: 0.5,
                alpha: 0.3
            },
            near: {
                type: 'instruments',
                count: 2,
                speed: 0.7,
                rotate: true
            }
        },

        effects: {
            particles: {
                type: 'cloudWisps',
                count: 40,
                speed: 50,
                color: 0xFFFFFF,
                alpha: 0.5
            },
            ambient: null
        }
    },

    5: {
        // Stage 5: Jet Stream Jam
        name: "Jet Stream Jam",
        atmosphere: "aviation",

        colors: {
            primary: 0x4169E1,      // Royal blue
            secondary: 0x1E90FF,    // Dodger blue
            accent: 0xFFFFFF,       // White contrails
            metal: 0xC0C0C0,        // Silver planes
            obstacle: 0x696969,     // Dim gray
            highlight: 0xFF0000     // Red lights
        },

        gradient: {
            top: 0x0047AB,
            bottom: 0x87CEEB
        },

        parallax: {
            distant: {
                type: 'horizonLine',
                speed: 0.1,
                alpha: 0.3
            },
            far: {
                type: 'distantPlanes',
                count: 2,
                speed: 0.2,
                silhouette: true
            },
            mid: {
                type: 'contrails',
                count: 8,
                speed: 0.4,
                fade: true
            },
            near: {
                type: 'windStreaks',
                density: 30,
                speed: 0.8
            }
        },

        effects: {
            particles: {
                type: 'jetstream',
                count: 60,
                speed: 120,
                color: 0xFFFFFF,
                alpha: 0.6,
                horizontal: true
            },
            ambient: {
                type: 'wind',
                intensity: 0.4
            }
        }
    },

    6: {
        // Stage 6: Cloud Nine Catastrophe
        name: "Cloud Nine Catastrophe",
        atmosphere: "storm",

        colors: {
            primary: 0x2F4F4F,      // Dark slate gray
            secondary: 0x696969,    // Dim gray
            accent: 0xFFFF00,       // Lightning yellow
            cloud: 0x778899,        // Light slate gray
            obstacle: 0x4A4A4A,     // Dark gray
            highlight: 0xFFFFFF     // Lightning white
        },

        gradient: {
            top: 0x000000,
            bottom: 0x2F4F4F
        },

        parallax: {
            distant: {
                type: 'stormClouds',
                count: 6,
                speed: 0.15,
                alpha: 0.6,
                dark: true
            },
            far: {
                type: 'rainClouds',
                count: 4,
                speed: 0.3,
                alpha: 0.7
            },
            mid: {
                type: 'lightning',
                count: 3,
                speed: 0,
                flash: true
            },
            near: {
                type: 'heavyRain',
                density: 100,
                speed: 1.0
            }
        },

        effects: {
            particles: {
                type: 'rain',
                count: 150,
                speed: 200,
                color: 0x4169E1,
                alpha: 0.6,
                vertical: true
            },
            ambient: {
                type: 'storm',
                lightning: true,
                thunder: true,
                screenFlash: true
            }
        }
    },

    7: {
        // Stage 7: Turbulence Territory
        name: "Turbulence Territory",
        atmosphere: "open_sky",

        colors: {
            primary: 0x87CEEB,      // Sky blue
            secondary: 0xB0E0E6,    // Powder blue
            accent: 0xFFFFFF,       // White clouds
            nature: 0x8B4513,       // Saddle brown (birds)
            obstacle: 0x696969,     // Gray (drones)
            highlight: 0x90EE90     // Light green
        },

        gradient: {
            top: 0x4682B4,
            bottom: 0xADD8E6
        },

        parallax: {
            distant: {
                type: 'mountains',
                speed: 0.1,
                alpha: 0.4,
                silhouette: true
            },
            far: {
                type: 'distantBirds',
                count: 15,
                speed: 0.25,
                flock: true
            },
            mid: {
                type: 'clouds',
                count: 7,
                speed: 0.5,
                alpha: 0.4
            },
            near: {
                type: 'birdShadows',
                count: 8,
                speed: 0.8,
                dynamic: true
            }
        },

        effects: {
            particles: {
                type: 'feathers',
                count: 20,
                speed: 40,
                color: 0xFFFFFF,
                alpha: 0.7,
                float: true
            },
            ambient: null
        }
    },

    8: {
        // Stage 8: Helicopter Heights
        name: "Helicopter Heights",
        atmosphere: "media",

        colors: {
            primary: 0x4682B4,      // Steel blue
            secondary: 0x5F9EA0,    // Cadet blue
            accent: 0xFFFFFF,       // White
            tech: 0xFF0000,         // Red (news)
            obstacle: 0x708090,     // Slate gray
            highlight: 0xFFFF00     // Yellow lights
        },

        gradient: {
            top: 0x1e3a8a,
            bottom: 0x87CEEB
        },

        parallax: {
            distant: {
                type: 'citySkyline',
                speed: 0.1,
                alpha: 0.5,
                silhouette: true
            },
            far: {
                type: 'helicopters',
                count: 3,
                speed: 0.3,
                rotor: true
            },
            mid: {
                type: 'cameraDrones',
                count: 5,
                speed: 0.5,
                flash: true
            },
            near: {
                type: 'spotlight',
                count: 2,
                speed: 0.7,
                beam: true
            }
        },

        effects: {
            particles: {
                type: 'cameraFlash',
                count: 10,
                speed: 0,
                color: 0xFFFFFF,
                alpha: 1.0,
                burst: true
            },
            ambient: {
                type: 'attention',
                spotlights: true
            }
        }
    },

    9: {
        // Stage 9: Skyscraper Slalom
        name: "Skyscraper Slalom",
        atmosphere: "urban",

        colors: {
            primary: 0x2F4F4F,      // Dark slate
            secondary: 0x696969,    // Dim gray
            accent: 0xFFD700,       // Gold (windows)
            concrete: 0x808080,     // Gray
            obstacle: 0x4A4A4A,     // Charcoal
            highlight: 0xFF6347     // Tomato (caution)
        },

        gradient: {
            top: 0x1a1a2e,
            bottom: 0x4A4A4A
        },

        parallax: {
            distant: {
                type: 'distantBuildings',
                speed: 0.1,
                alpha: 0.6,
                windows: true
            },
            far: {
                type: 'midBuildings',
                speed: 0.25,
                alpha: 0.7,
                windows: true,
                lights: true
            },
            mid: {
                type: 'nearBuildings',
                speed: 0.5,
                windows: true,
                details: true
            },
            near: {
                type: 'constructionElements',
                count: 4,
                speed: 0.8,
                cranes: true
            }
        },

        effects: {
            particles: {
                type: 'urbanFog',
                count: 40,
                speed: 30,
                color: 0xC0C0C0,
                alpha: 0.3
            },
            ambient: {
                type: 'cityLights',
                windows: true,
                neon: true
            }
        }
    },

    10: {
        // Stage 10: Campus Crashdown
        name: "Campus Crashdown",
        atmosphere: "campus",

        colors: {
            primary: 0x002147,      // OCU Blue
            secondary: 0xCDB87E,    // OCU Gold
            accent: 0xFFFFFF,       // White
            grass: 0x228B22,        // Forest green
            obstacle: 0xB22222,     // Firebrick (buildings)
            highlight: 0x4169E1     // Royal blue (fountain)
        },

        gradient: {
            top: 0x87CEEB,
            bottom: 0xADD8E6
        },

        parallax: {
            distant: {
                type: 'campusBackground',
                speed: 0.1,
                alpha: 0.8,
                buildings: true
            },
            far: {
                type: 'trees',
                count: 10,
                speed: 0.3,
                sway: true
            },
            mid: {
                type: 'buildings',
                speed: 0.5,
                windows: true,
                details: true
            },
            near: {
                type: 'flags',
                count: 5,
                speed: 0.8,
                wave: true,
                ocu: true
            }
        },

        effects: {
            particles: {
                type: 'confetti',
                count: 100,
                speed: 80,
                colors: [0x002147, 0xCDB87E, 0xFFFFFF],
                alpha: 0.8
            },
            ambient: {
                type: 'celebration',
                cheering: true,
                flags: true
            }
        }
    }
};

// Utility function to get theme by stage number
export function getStageTheme(stageNumber) {
    return STAGE_THEMES[stageNumber] || STAGE_THEMES[1];
}

// Get all stage themes
export function getAllStageThemes() {
    return STAGE_THEMES;
}
