export default class LevelManager {
    constructor(game) {
        this.game = game;
        this.currentLevel = 1;
        this.totalLevels = 10;
        this.levelScores = new Array(10).fill(0);
        this.levelGrades = new Array(10).fill('');
        this.levelBestTimes = new Array(10).fill(Infinity);
        this.levelStars = new Array(10).fill(0);
        this.unlockedLevels = 1;
        
        // Load saved progress
        this.loadProgress();
    }

    // Level definitions based on Game Design Document
    getLevelConfig(levelNumber) {
        // Base configuration that will be reused for wireframing
        const baseConfig = {
            gravity: 400,
            obstacleSpacing: 200,
            obstacleTypes: ['satellite', 'space_junk', 'solar_panel'],
            specialMechanics: {
                reducedGravity: true,
                noWind: true,
                wideNearMissZones: true
            }
        };

        // Specific configurations for each of the 10 levels
        const configs = [
            {
                // Stage 1: The Cosmic Perch (Tutorial)
                id: 1,
                name: "The Cosmic Perch",
                subtitle: "Tutorial in the stars",
                altitude: { start: 400, end: 400 },
                duration: 30,
                targetScore: 10000,
                gravity: 200,
                windSpeed: 0,
                obstacleCount: 20,
                obstacleSpacing: 250,
                difficulty: 0.3,
                backgroundColor: 0x000428,
                storyBeat: {
                    title: "The Call to Action",
                    panels: [
                        "Starsky adjusting his sunglasses in zero gravity",
                        "Radio: 'Starsky! The freshman orientation is starting!'",
                        "'Better hustle my hooves! Can't let my Stars down!'"
                    ]
                }
            },
            {
                // Stage 2: Thermosphere Thunder
                id: 2,
                name: "Thermosphere Thunder",
                subtitle: "Burning entry",
                altitude: { start: 300, end: 85 },
                duration: 45,
                targetScore: 20000,
                gravity: 350,
                windSpeed: 50,
                obstacleCount: 30,
                obstacleSpacing: 180,
                difficulty: 0.4,
                backgroundColor: 0x1a0033,
                storyBeat: {
                    title: "Heating Up",
                    panels: [
                        "Starsky's wool slightly singed",
                        "Shooting star passes: 'Hey, that's my cousin!'",
                        "Burns marshmallow on his horn: 'Waste not!'"
                    ]
                }
            },
            {
                // Stage 3: Aurora Alley
                id: 3,
                name: "Aurora Alley",
                subtitle: "Northern lights navigation",
                altitude: { start: 85, end: 50 },
                duration: 50,
                targetScore: 35000,
                gravity: 450,
                windSpeed: 75,
                obstacleCount: 35,
                obstacleSpacing: 160,
                difficulty: 0.5,
                backgroundColor: 0x004466,
                storyBeat: {
                    title: "Light Show",
                    panels: [
                        "Starsky surfs on aurora waves",
                        "Takes selfie: '#NaturalFilter #SpaceRam'",
                        "Aurora forms OCU letters briefly"
                    ]
                }
            },
            {
                // Stage 4: Jetstream Junction
                id: 4,
                name: "Jetstream Junction",
                subtitle: "High-speed winds",
                altitude: { start: 50, end: 12 },
                duration: 55,
                targetScore: 50000,
                gravity: 500,
                windSpeed: 150,
                obstacleCount: 40,
                obstacleSpacing: 150,
                difficulty: 0.55,
                backgroundColor: 0x0066aa,
                storyBeat: {
                    title: "Wind Rider",
                    panels: [
                        "Starsky's wool blowing dramatically",
                        "Airplane pilot does double-take",
                        "'This is your captain speaking... is that a ram?'"
                    ]
                }
            },
            {
                // Stage 5: Cloud Nine Chaos (Midpoint)
                id: 5,
                name: "Cloud Nine Chaos",
                subtitle: "Visibility challenge",
                altitude: { start: 12, end: 6 },
                duration: 60,
                targetScore: 70000,
                gravity: 520,
                windSpeed: 100,
                obstacleCount: 45,
                obstacleSpacing: 140,
                difficulty: 0.6,
                backgroundColor: 0x88aacc,
                storyBeat: {
                    title: "Halfway Home",
                    panels: [
                        "Starsky emerges from clouds dramatically",
                        "Birds form arrow pointing down: 'Thanks, friends!'",
                        "Thunder rumbles: 'Bring it on!'"
                    ]
                },
                isMidpoint: true
            },
            {
                // Stage 6: Storm Surge
                id: 6,
                name: "Storm Surge",
                subtitle: "Lightning and rain",
                altitude: { start: 6, end: 3 },
                duration: 65,
                targetScore: 90000,
                gravity: 540,
                windSpeed: 200,
                obstacleCount: 50,
                obstacleSpacing: 130,
                difficulty: 0.7,
                backgroundColor: 0x444466,
                storyBeat: {
                    title: "Weather the Storm",
                    panels: [
                        "Lightning illuminates Starsky's determined face",
                        "Uses horn as lightning rod: 'I'm electric!'",
                        "Rainbow appears: 'After every storm...'"
                    ]
                }
            },
            {
                // Stage 7: Bird Brigade
                id: 7,
                name: "Bird Brigade",
                subtitle: "Flock navigation",
                altitude: { start: 3, end: 2 },
                duration: 70,
                targetScore: 110000,
                gravity: 560,
                windSpeed: 80,
                obstacleCount: 55,
                obstacleSpacing: 120,
                difficulty: 0.75,
                backgroundColor: 0x66aadd,
                storyBeat: {
                    title: "Feathered Friends",
                    panels: [
                        "Geese: 'This is a no-ram zone!'",
                        "Starsky: 'That's discrimination!'",
                        "Creates his own V formation with confused birds"
                    ]
                }
            },
            {
                // Stage 8: Helicopter Heights
                id: 8,
                name: "Helicopter Heights",
                subtitle: "News coverage",
                altitude: { start: 2, end: 0.5 },
                duration: 75,
                targetScore: 135000,
                gravity: 580,
                windSpeed: 120,
                obstacleCount: 60,
                obstacleSpacing: 110,
                difficulty: 0.8,
                backgroundColor: 0x87ceeb,
                storyBeat: {
                    title: "Breaking News",
                    panels: [
                        "Reporter: 'This is unprecedented!'",
                        "Starsky peace sign: 'Hi OCU!'",
                        "Breaking News ticker: 'RAM RATES RADICAL'"
                    ]
                }
            },
            {
                // Stage 9: Skyscraper Slalom
                id: 9,
                name: "Skyscraper Slalom",
                subtitle: "Urban maze",
                altitude: { start: 0.5, end: 0.1 },
                duration: 80,
                targetScore: 160000,
                gravity: 600,
                windSpeed: 150,
                obstacleCount: 65,
                obstacleSpacing: 100,
                difficulty: 0.9,
                backgroundColor: 0x4169e1,
                storyBeat: {
                    title: "City Limits",
                    panels: [
                        "Construction workers: 'Did we order a ram?'",
                        "Starsky between buildings: 'Just passing through!'",
                        "Sign changes: 'RAM CONSTRUCTION CO.'"
                    ]
                }
            },
            {
                // Stage 10: Campus Crashdown (Finale)
                id: 10,
                name: "Campus Crashdown",
                subtitle: "Home sweet home",
                altitude: { start: 0.1, end: 0 },
                duration: 90,
                targetScore: 200000,
                gravity: 600,
                windSpeed: 100,
                obstacleCount: 70,
                obstacleSpacing: 90,
                difficulty: 1.0,
                backgroundColor: 0x228b22,
                storyBeat: {
                    title: "Final Descent",
                    panels: [
                        "OCU campus comes into view",
                        "Students gathering: 'It's Starsky!'",
                        "Perfect landing in fountain: 'STARS FOREVER!'"
                    ]
                },
                finalLevel: true
            }
        ];

        // Return specific config or reuse first level as wireframe
        if (levelNumber <= configs.length) {
            return { ...baseConfig, ...configs[levelNumber - 1] };
        } else {
            // Fallback for any level beyond 10 (shouldn't happen)
            return { ...baseConfig, ...configs[0], id: levelNumber };
        }
    }

    // Get story panels for transitions
    getStoryPanels(levelNumber, isIntro = true) {
        const config = this.getLevelConfig(levelNumber);
        
        if (isIntro) {
            // Use the story beat from the level config
            return {
                title: config.storyBeat.title,
                panels: config.storyBeat.panels,
                // Reuse opening images as wireframes for now
                images: this.getWireframeImages()
            };
        } else {
            // Victory/transition story after completing level
            if (levelNumber === 5) {
                // Special midpoint story
                return {
                    title: "Halfway There!",
                    panels: [
                        "You've made it halfway!",
                        "The hardest part is behind you...",
                        "...or is it? The campus awaits!"
                    ],
                    images: this.getWireframeImages()
                };
            } else if (levelNumber === 10) {
                // Final victory
                return {
                    title: "Mission Complete!",
                    panels: [
                        "Perfect landing at OCU!",
                        "The crowd goes wild!",
                        "You are a true STAR!"
                    ],
                    images: this.getWireframeImages()
                };
            } else {
                // Generic transition
                return {
                    title: `Stage ${levelNumber} Complete!`,
                    panels: [
                        "Excellent descent!",
                        `${10 - levelNumber} stages remaining...`,
                        "Keep up the great work!"
                    ],
                    images: this.getWireframeImages()
                };
            }
        }
    }

    // Get wireframe images (reusing opening scene assets)
    getWireframeImages() {
        // Return paths to existing opening images as placeholders
        return [
            '/public/assets/narrativePanels/opening/opening1.png',
            '/public/assets/narrativePanels/opening/opening2.png',
            '/public/assets/narrativePanels/opening/opening3.png'
        ];
    }

    // Progress management
    startLevel(levelNumber) {
        if (levelNumber > this.unlockedLevels || levelNumber < 1 || levelNumber > this.totalLevels) {
            return false;
        }
        
        this.currentLevel = levelNumber;
        return this.getLevelConfig(levelNumber);
    }

    completeLevel(levelNumber, score, time) {
        // Calculate grade based on score
        const config = this.getLevelConfig(levelNumber);
        const grade = this.calculateGrade(score, config.targetScore);
        
        // Update scores
        if (score > this.levelScores[levelNumber - 1]) {
            this.levelScores[levelNumber - 1] = score;
        }
        
        // Update grade
        if (this.getGradeValue(grade) > this.getGradeValue(this.levelGrades[levelNumber - 1])) {
            this.levelGrades[levelNumber - 1] = grade;
        }
        
        // Update best time
        if (time < this.levelBestTimes[levelNumber - 1]) {
            this.levelBestTimes[levelNumber - 1] = time;
        }
        
        // Calculate stars
        this.levelStars[levelNumber - 1] = this.calculateStars(score, config.targetScore);
        
        // Unlock next level
        if (levelNumber === this.unlockedLevels && levelNumber < this.totalLevels) {
            this.unlockedLevels++;
        }
        
        // Save progress
        this.saveProgress();
        
        return {
            grade,
            stars: this.levelStars[levelNumber - 1],
            newBest: score === this.levelScores[levelNumber - 1],
            levelUnlocked: levelNumber === this.unlockedLevels - 1
        };
    }

    calculateGrade(score, targetScore) {
        const percentage = (score / targetScore) * 100;
        
        if (percentage >= 150) return 'S+';
        if (percentage >= 125) return 'S';
        if (percentage >= 100) return 'A';
        if (percentage >= 75) return 'B';
        if (percentage >= 50) return 'C';
        return 'D';
    }

    calculateStars(score, targetScore) {
        if (score >= targetScore) return 3;
        if (score >= targetScore * 0.75) return 2;
        if (score >= targetScore * 0.5) return 1;
        return 0;
    }

    getGradeValue(grade) {
        const values = { 'S+': 6, 'S': 5, 'A': 4, 'B': 3, 'C': 2, 'D': 1, '': 0 };
        return values[grade] || 0;
    }

    getTotalStars() {
        return this.levelStars.reduce((sum, stars) => sum + stars, 0);
    }

    getTotalScore() {
        return this.levelScores.reduce((sum, score) => sum + score, 0);
    }

    getCompletionPercentage() {
        const completedLevels = this.levelScores.filter(score => score > 0).length;
        return Math.round((completedLevels / this.totalLevels) * 100);
    }

    isLevelUnlocked(levelNumber) {
        return levelNumber <= this.unlockedLevels;
    }

    // Save/Load progress
    saveProgress() {
        const data = {
            unlockedLevels: this.unlockedLevels,
            levelScores: this.levelScores,
            levelGrades: this.levelGrades,
            levelBestTimes: this.levelBestTimes,
            levelStars: this.levelStars
        };
        
        if (this.game && this.game.saveManager) {
            this.game.saveManager.data.levelProgress = data;
            this.game.saveManager.save();
        } else {
            // Fallback to localStorage
            localStorage.setItem('oneJump_levelProgress', JSON.stringify(data));
        }
    }

    loadProgress() {
        let data;
        
        if (this.game && this.game.saveManager && this.game.saveManager.data.levelProgress) {
            data = this.game.saveManager.data.levelProgress;
        } else {
            // Fallback to localStorage
            const saved = localStorage.getItem('oneJump_levelProgress');
            if (saved) {
                data = JSON.parse(saved);
            }
        }
        
        if (data) {
            this.unlockedLevels = data.unlockedLevels || 1;
            this.levelScores = data.levelScores || new Array(10).fill(0);
            this.levelGrades = data.levelGrades || new Array(10).fill('');
            this.levelBestTimes = data.levelBestTimes || new Array(10).fill(Infinity);
            this.levelStars = data.levelStars || new Array(10).fill(0);
        }
    }

    // Reset progress
    resetProgress() {
        this.unlockedLevels = 1;
        this.levelScores = new Array(10).fill(0);
        this.levelGrades = new Array(10).fill('');
        this.levelBestTimes = new Array(10).fill(Infinity);
        this.levelStars = new Array(10).fill(0);
        this.saveProgress();
    }

    // Debug methods
    unlockAllLevels() {
        this.unlockedLevels = this.totalLevels;
        this.saveProgress();
    }

    setTestScores() {
        // Set some test scores for development
        for (let i = 0; i < 5; i++) {
            const config = this.getLevelConfig(i + 1);
            const score = Math.floor(config.targetScore * (0.5 + Math.random() * 0.8));
            this.completeLevel(i + 1, score, 30 + Math.random() * 60);
        }
    }
}