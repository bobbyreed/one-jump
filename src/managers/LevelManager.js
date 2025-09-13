export default class LevelManager {
    constructor(game) {
        this.game = game;
        this.currentLevel = 1;
        this.unlockedLevels = 1;
        this.totalLevels = 10;
        this.levelScores = new Array(10).fill(0);
        this.levelGrades = new Array(10).fill('');
    }

    // Get configuration for a specific level
    getLevelConfig(levelNumber) {
        // Base configuration shared by all levels
        const baseConfig = {
            fallSpeed: 200 + (levelNumber * 20),
            spawnRate: Math.max(0.5, 1.2 - (levelNumber * 0.05)),
            obstacleSpeed: 150 + (levelNumber * 10),
            nearMissThreshold: 50,
            duration: 60
        };

        // Level-specific configurations
        const configs = [
            {
                // Level 1 - Space Station
                id: 1,
                name: "Space Station",
                subtitle: "Escape Velocity",
                targetScore: 5000,
                duration: 45,
                obstaclePatterns: ['single', 'double'],
                obstacleTypes: ['satellite', 'debris', 'asteroid'],
                powerUpFrequency: 0.3,
                windStrength: 0,
                storyBeat: {
                    title: "Escape Velocity",
                    entryPanels: [
                        "Starsky floats past the space station window, scientists inside drop their coffee",
                        "Time to show these satellites how to really orbit!",
                        "Let's make gravity jealous!"
                    ],
                    exitPanels: [
                        "That's one small leap for a ram...",
                        "Only 400,000 kilometers to OCU. Practically next door!"
                    ]
                }
            },
            {
                // Level 2 - Asteroid Alley
                id: 2,
                name: "Asteroid Alley",
                subtitle: "Space Rocks",
                targetScore: 6000,
                duration: 60,
                obstaclePatterns: ['single', 'double', 'triple'],
                obstacleTypes: ['asteroid_small', 'asteroid_large', 'comet'],
                powerUpFrequency: 0.25,
                windStrength: 0.05,
                storyBeat: {
                    title: "Asteroid Alley",
                    entryPanels: [
                        "Asteroids come into view, Starsky cracks knuckles",
                        "Dodgeball was my favorite subject!",
                        "These space rocks are about to get schooled!"
                    ],
                    exitPanels: [
                        "Starsky gives thumbs up to a confused astronaut on a passing asteroid",
                        "Points earthward: 350,000 kilometers to campus. I can almost smell the cafeteria food!"
                    ]
                }
            },
            {
                // Level 3 - Ice Ring Run
                id: 3,
                name: "Ice Ring Run",
                subtitle: "Saturn's Challenge",
                targetScore: 7500,
                duration: 70,
                obstaclePatterns: ['single', 'double', 'zigzag', 'spiral'],
                obstacleTypes: ['ice_chunk', 'ring_particle', 'frozen_debris'],
                powerUpFrequency: 0.2,
                windStrength: 0.1,
                storyBeat: {
                    title: "Ice Ring Run",
                    entryPanels: [
                        "Saturn's rings sparkle ahead, Starsky's eyes widen behind sunglasses",
                        "Ice to meet you, Saturn!",
                        "Time to put these rings through their paces - Olympic style!"
                    ],
                    exitPanels: [
                        "Starsky surfs on an ice chunk: And the judges give it a perfect 10!",
                        "Earth gets bigger in view: 300,000 kilometers to go. The Stars are calling!"
                    ]
                }
            },
            {
                // Level 4 - Atmospheric Entry
                id: 4,
                name: "Atmospheric Entry",
                subtitle: "Burning Through",
                targetScore: 8500,
                duration: 75,
                obstaclePatterns: ['wave', 'double', 'cross'],
                obstacleTypes: ['heat_wave', 'plasma', 'turbulence'],
                powerUpFrequency: 0.15,
                windStrength: 0.15,
                storyBeat: {
                    title: "Atmospheric Entry",
                    entryPanels: [
                        "The atmosphere glows orange as Starsky approaches",
                        "Time to turn up the heat!",
                        "This ram's about to become a shooting star!"
                    ],
                    exitPanels: [
                        "Starsky emerges from the flames unscathed",
                        "Looking down: I can see the continent! Almost home!"
                    ]
                }
            }
        ];

        // Return specific config or create placeholder for unfinished levels
        if (levelNumber <= configs.length) {
            const config = { ...baseConfig, ...configs[levelNumber - 1] };
            // Ensure we have proper panel data
            if (!config.storyBeat.entryPanels) {
                config.storyBeat.entryPanels = [
                    `Stage ${levelNumber} begins...`,
                    "Navigate carefully!",
                    "Good luck!"
                ];
            }
            if (!config.storyBeat.exitPanels) {
                config.storyBeat.exitPanels = [
                    `Stage ${levelNumber} complete!`,
                    "Well done!"
                ];
            }
            return config;
        } else {
            // For levels 5-10, create placeholder config
            return { 
                ...baseConfig, 
                id: levelNumber,
                name: `Stage ${levelNumber}`,
                subtitle: "Coming Soon",
                targetScore: 5000 + (levelNumber * 1000),
                duration: 60 + (levelNumber * 5),
                obstaclePatterns: ['single', 'double', 'triple'],
                obstacleTypes: ['placeholder'],
                powerUpFrequency: 0.2,
                windStrength: 0.1,
                storyBeat: {
                    title: `Stage ${levelNumber}`,
                    entryPanels: [
                        `Stage ${levelNumber} - Coming Soon`,
                        "This level is under construction",
                        "For now, enjoy classic gameplay!"
                    ],
                    exitPanels: [
                        `Stage ${levelNumber} Complete!`,
                        "More content coming soon!"
                    ]
                }
            };
        }
    }

    // Get story panels for transitions
    getStoryPanels(levelNumber, isIntro = true) {
        const config = this.getLevelConfig(levelNumber);
        
        if (isIntro) {
            // Intro story before the level starts
            return {
                title: config.storyBeat.title,
                panels: config.storyBeat.entryPanels,
                panelCount: config.storyBeat.entryPanels.length
            };
        } else {
            // Outro story after completing the level
            if (levelNumber === 10) {
                // Special victory sequence
                return {
                    title: "Mission Complete!",
                    panels: [
                        "Perfect landing in fountain",
                        "Students cheering, throwing caps",
                        "President: Starsky! You're late!",
                        "A Star arrives precisely when they mean to!",
                        "Crowd lifts him up",
                        "Who wants to hear about my space adventure?",
                        "Everyone raises hands",
                        "It started with ONE JUMP..."
                    ],
                    panelCount: 8
                };
            } else if (levelNumber === 5) {
                // Special midpoint story
                return {
                    title: "Halfway There!",
                    panels: [
                        "You've made it halfway!",
                        "The hardest part is behind you...",
                        "...or is it? The campus awaits!"
                    ],
                    panelCount: 3
                };
            } else {
                // Use level-specific outro panels
                return {
                    title: `Stage ${levelNumber} Complete!`,
                    panels: config.storyBeat.exitPanels || [
                        "Excellent descent!",
                        `${10 - levelNumber} stages remaining...`,
                        "Keep up the great work!"
                    ],
                    panelCount: config.storyBeat.exitPanels ? config.storyBeat.exitPanels.length : 3
                };
            }
        }
    }

    // Start a level
    startLevel(levelNumber) {
        if (levelNumber > this.unlockedLevels || levelNumber < 1 || levelNumber > this.totalLevels) {
            console.warn(`Cannot start level ${levelNumber}. Unlocked: ${this.unlockedLevels}`);
            return null;
        }

        this.currentLevel = levelNumber;
        const config = this.getLevelConfig(levelNumber);
        
        console.log(`Starting Level ${levelNumber}: ${config.name}`);
        return config;
    }

    // Complete a level
    completeLevel(levelNumber, score) {
        const config = this.getLevelConfig(levelNumber);
        
        // Update score if it's a new high score
        if (score > this.levelScores[levelNumber - 1]) {
            this.levelScores[levelNumber - 1] = score;
            
            // Calculate grade
            const targetScore = config.targetScore;
            const percentage = (score / targetScore) * 100;
            
            let grade = 'F';
            if (percentage >= 150) grade = 'S';
            else if (percentage >= 120) grade = 'A';
            else if (percentage >= 100) grade = 'B';
            else if (percentage >= 80) grade = 'C';
            else if (percentage >= 60) grade = 'D';
            
            this.levelGrades[levelNumber - 1] = grade;
        }
        
        // Unlock next level if needed
        if (levelNumber === this.unlockedLevels && levelNumber < this.totalLevels) {
            this.unlockedLevels++;
            console.log(`Level ${this.unlockedLevels} unlocked!`);
        }
        
        // Save progress
        this.saveProgress();
        
        return {
            grade: this.levelGrades[levelNumber - 1],
            newHighScore: score === this.levelScores[levelNumber - 1],
            nextLevelUnlocked: levelNumber === this.unlockedLevels - 1
        };
    }

    // Calculate total score across all levels
    getTotalScore() {
        return this.levelScores.reduce((total, score) => total + score, 0);
    }

    // Get completion percentage
    getCompletionPercentage() {
        const completedLevels = this.levelScores.filter(score => score > 0).length;
        return Math.round((completedLevels / this.totalLevels) * 100);
    }

    // Check if a level is unlocked
    isLevelUnlocked(levelNumber) {
        return levelNumber <= this.unlockedLevels;
    }

    // Save progress to local storage via SaveManager
    saveProgress() {
        if (this.game.saveManager) {
            this.game.saveManager.saveData.unlockedLevels = this.unlockedLevels;
            this.game.saveManager.saveData.levelScores = [...this.levelScores];
            this.game.saveManager.saveData.levelGrades = [...this.levelGrades];
            this.game.saveManager.save();
        }
    }

    // Load progress from SaveManager
    loadProgress() {
        if (this.game.saveManager && this.game.saveManager.saveData) {
            const data = this.game.saveManager.saveData;
            this.unlockedLevels = data.unlockedLevels || 1;
            this.levelScores = data.levelScores || new Array(10).fill(0);
            this.levelGrades = data.levelGrades || new Array(10).fill('');
        }
    }

    // Reset all progress
    resetProgress() {
        this.currentLevel = 1;
        this.unlockedLevels = 1;
        this.levelScores = new Array(10).fill(0);
        this.levelGrades = new Array(10).fill('');
        this.saveProgress();
    }
}