import SaveManager from './SaveManager.js';
import { ASSETS } from '../config/Constants.js';

export default class LevelManager {
    constructor(game) {
        this.game = game;
        
        // Level progression tracking
        this.totalLevels = 10;
        this.currentLevel = 1;
        this.unlockedLevels = 2; // Start with levels 1 and 2 unlocked for testing
        
        // Level scores and grades
        this.levelScores = new Array(this.totalLevels).fill(0);
        this.levelGrades = new Array(this.totalLevels).fill('F');
        this.levelStars = new Array(this.totalLevels).fill(0);
        this.levelBestTimes = new Array(this.totalLevels).fill(Infinity);
        
        // Load saved progress
        this.loadProgress();
    }

    // Get difficulty settings for a specific level
    // Aligned with GDD target scores and progressive difficulty
    getDifficultyConfig(levelNumber) {
        // Define target scores (adjusted for realistic gameplay)
        // Target score earns A rank, 150% of target earns S rank (very difficult)
        const targetScores = [
            3000,   // Stage 1 (A grade at 3,000, S at 4,500)
            5000,   // Stage 2 (A grade at 5,000, S at 7,500)
            8000,   // Stage 3 (A grade at 8,000, S at 12,000)
            10000,  // Stage 4 (A grade at 10,000, S at 15,000)
            13000,  // Stage 5 (A grade at 13,000, S at 19,500)
            16000,  // Stage 6 (A grade at 16,000, S at 24,000)
            19000,  // Stage 7 (A grade at 19,000, S at 28,500)
            22000,  // Stage 8 (A grade at 22,000, S at 33,000)
            25000,  // Stage 9 (A grade at 25,000, S at 37,500)
            28000   // Stage 10 (A grade at 28,000, S at 42,000)
        ];

        // Progressive difficulty from level 1 (easy) to 10 (very hard)
        const difficulty = levelNumber / 10; // 0.1 to 1.0

        return {
            // Obstacle count: 30 at level 1, 60 at level 10
            obstacleCount: Math.floor(30 + (difficulty * 30)),

            // Obstacle spacing: 200px at level 1, 120px at level 10
            obstacleSpacing: Math.floor(200 - (difficulty * 80)),

            // Fall distance: 5000 at level 1, 10000 at level 10
            fallDistance: Math.floor(5000 + (difficulty * 5000)),

            // Target score from GDD specifications
            targetScore: targetScores[levelNumber - 1] || 10000,

            // Available obstacle types unlock progressively
            availableObstacles: this.getAvailableObstacles(levelNumber)
        };
    }

    // Determine which obstacles are available at each level
    // Aligned with GDD stage themes and progressive difficulty
    getAvailableObstacles(levelNumber) {
        switch (levelNumber) {
            case 1:
                // Stage 1: Cosmic Perch (Tutorial) - Basic obstacles only
                return ['spike', 'platform', 'wall'];

            case 2:
                // Stage 2: Thermosphere Thunder - Add space hazards
                return ['spike', 'platform', 'wall', 'meteor'];

            case 3:
                // Stage 3: Mesosphere Mayhem - Add ice/spinning obstacles
                return ['spike', 'platform', 'wall', 'meteor', 'spinner'];

            case 4:
                // Stage 4: Stratosphere Showdown - Add scientific equipment
                return ['spike', 'platform', 'wall', 'meteor', 'spinner', 'barrel'];

            case 5:
                // Stage 5: Jet Stream Jam - Add aviation/alien hazards + ROCKETS!
                return ['spike', 'platform', 'wall', 'meteor', 'spinner', 'barrel', 'alien', 'rocket'];

            case 6:
                // Stage 6: Cloud Nine Catastrophe - Add high-energy storm hazards
                return ['spike', 'platform', 'wall', 'meteor', 'spinner', 'barrel', 'alien', 'laser', 'pulsar', 'rocket'];

            case 7:
                // Stage 7: Turbulence Territory - Add living/swinging obstacles
                return ['spike', 'platform', 'wall', 'spinner', 'barrel', 'alien', 'laser', 'pulsar', 'pendulum', 'rocket'];

            case 8:
                // Stage 8: Helicopter Heights - Add mechanical/orbiting obstacles
                return ['spike', 'platform', 'wall', 'spinner', 'barrel', 'alien', 'laser', 'pulsar', 'pendulum', 'orbiter', 'rocket'];

            case 9:
            case 10:
                // Stage 9-10: Skyscraper Slalom & Campus Crashdown - All obstacles
                return ['spike', 'platform', 'wall', 'spinner', 'barrel', 'alien', 'laser', 'meteor', 'pulsar', 'pendulum', 'orbiter', 'rocket'];

            default:
                // Fallback to basic obstacles
                return ['spike', 'platform', 'wall'];
        }
    }

    // Get configuration for a specific level
    getLevelConfig(levelNumber) {
        // Get difficulty settings
        const difficultyConfig = this.getDifficultyConfig(levelNumber);

        // Base configuration shared by all levels
        const baseConfig = {
            id: levelNumber,
            gravity: 0.3,
            maxFallSpeed: 15,
            startHeight: -200,
            endHeight: difficultyConfig.fallDistance,
            backgroundType: 'sky',
            windStrength: 0,
            targetScore: difficultyConfig.targetScore, // Scales with level difficulty
            duration: 90,
            obstacleSpacing: difficultyConfig.obstacleSpacing,
            obstacleCount: difficultyConfig.obstacleCount,
            availableObstacles: difficultyConfig.availableObstacles
        };

        // Level-specific configurations aligned with GDD
        const configs = [
            {
                // Stage 1: The Cosmic Perch
                id: 1,
                name: "The Cosmic Perch",
                subtitle: "Tutorial in the stars",
                altitude: "400km (Low Earth Orbit)",
                duration: 30,
                windStrength: 0,
                storyBeat: {
                    title: "The Cosmic Perch",
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
                altitude: "300km → 85km",
                duration: 45,
                windStrength: 0,
                storyBeat: {
                    title: "Thermosphere Thunder",
                    panels: [
                        "Starsky's wool slightly singed",
                        "Shooting star passes: 'Hey, that's my cousin!'",
                        "Burns marshmallow on his horn: 'Waste not!'"
                    ]
                }
            },
            {
                // Stage 3: Mesosphere Mayhem
                id: 3,
                name: "Mesosphere Mayhem",
                subtitle: "Ice and wind",
                altitude: "85km → 50km",
                duration: 50,
                windStrength: 0.1,
                storyBeat: {
                    title: "Mesosphere Mayhem",
                    panels: [
                        "Starsky shivers: 'Should've brought my varsity jacket!'",
                        "Pulls out OCU pennant, uses as cape",
                        "Does superhero pose with cape flowing"
                    ]
                }
            },
            {
                // Stage 4: Stratosphere Showdown
                id: 4,
                name: "Stratosphere Showdown",
                subtitle: "Scientific instruments",
                altitude: "50km → 12km",
                duration: 55,
                windStrength: 0.05,
                storyBeat: {
                    title: "Stratosphere Showdown",
                    panels: [
                        "Weather balloon with camera",
                        "Starsky winks: 'That's EVERY side, baby!'",
                        "Balloon operator: 'This is going viral!'"
                    ]
                }
            },
            {
                // Stage 5: Jet Stream Jam
                id: 5,
                name: "Jet Stream Jam",
                subtitle: "Commercial aviation",
                altitude: "12km → 10km",
                duration: 60,
                windStrength: 0.15,
                storyBeat: {
                    title: "Jet Stream Jam",
                    panels: [
                        "Pilot does double-take",
                        "Kid in plane: 'Mom! I saw the OCU Ram!'",
                        "Starsky holds sign: 'Hi Mom!'"
                    ]
                }
            },
            {
                // Stage 6: Cloud Nine Catastrophe
                id: 6,
                name: "Cloud Nine Catastrophe",
                subtitle: "Storm system",
                altitude: "10km → 5km",
                duration: 65,
                windStrength: 0.2,
                storyBeat: {
                    title: "Cloud Nine Catastrophe",
                    panels: [
                        "Starsky's wool all frizzed from static",
                        "Lightning spells 'OCU' in background",
                        "'Even the storm knows who's the STAR!'"
                    ]
                }
            },
            {
                // Stage 7: Turbulence Territory
                id: 7,
                name: "Turbulence Territory",
                subtitle: "Living obstacles",
                altitude: "5km → 2km",
                duration: 70,
                windStrength: 0.15,
                storyBeat: {
                    title: "Turbulence Territory",
                    panels: [
                        "Starsky joins V formation with geese",
                        "Lead goose: 'This is a no-ram zone!'",
                        "Creates his own V with confused birds"
                    ]
                }
            },
            {
                // Stage 8: Helicopter Heights
                id: 8,
                name: "Helicopter Heights",
                subtitle: "News coverage",
                altitude: "2km → 500m",
                duration: 75,
                windStrength: 0.1,
                storyBeat: {
                    title: "Helicopter Heights",
                    panels: [
                        "News reporter: 'This is unprecedented!'",
                        "Starsky: 'I prefer confidently skilled!'",
                        "Breaking News ticker: 'RAM RATES RADICAL'"
                    ]
                }
            },
            {
                // Stage 9: Skyscraper Slalom
                id: 9,
                name: "Skyscraper Slalom",
                subtitle: "Urban maze",
                altitude: "500m → 100m",
                duration: 80,
                windStrength: 0.05,
                storyBeat: {
                    title: "Skyscraper Slalom",
                    panels: [
                        "Construction workers eating lunch on beam",
                        "Starsky: 'Just passing through!'",
                        "Sign changes to read: 'RAM CONSTRUCTION CO.'"
                    ]
                }
            },
            {
                // Stage 10: Campus Crashdown
                id: 10,
                name: "Campus Crashdown",
                subtitle: "Home sweet home",
                altitude: "100m → Ground",
                duration: 90,
                windStrength: 0,
                storyBeat: {
                    title: "Campus Crashdown",
                    panels: [
                        "OCU campus spreads below, students cheering",
                        "'Home sweet home! Did you miss me?'",
                        "'Time for the most EPIC entrance in university history!'"
                    ]
                }
            }
        ];

        // Return specific config, now all 10 stages are defined
        if (levelNumber >= 1 && levelNumber <= configs.length) {
            return { ...baseConfig, ...configs[levelNumber - 1] };
        } else {
            // Fallback for invalid level numbers
            console.warn(`Invalid level number: ${levelNumber}. Using Stage 1 as fallback.`);
            return { ...baseConfig, ...configs[0] };
        }
    }

    // Get story panels for transitions
    getStoryPanels(levelNumber, isIntro = true, endingPart = 1) {
        if (isIntro) {
            // Intro story before the level starts
            const entryPanels = {
                1: { title: "Level 1: Duke's Last Stand", count: 3, images: ASSETS.NARRATIVE_PANELS.LEVEL_1_ENTRY },
                2: { title: "Level 2: The Journey Continues", count: 3, images: ASSETS.NARRATIVE_PANELS.LEVEL_2_ENTRY },
                3: { title: "Level 3: Urban Descent", count: 3, images: ASSETS.NARRATIVE_PANELS.LEVEL_3_ENTRY },
                4: { title: "Level 4: Into the Unknown", count: 2, images: ASSETS.NARRATIVE_PANELS.LEVEL_4_ENTRY },
                5: { title: "Level 5: Halfway Point", count: 3, images: ASSETS.NARRATIVE_PANELS.LEVEL_5_ENTRY },
                6: { title: "Level 6: The Second Half", count: 3, images: ASSETS.NARRATIVE_PANELS.LEVEL_6_ENTRY },
                7: { title: "Level 7: Rising Stakes", count: 3, images: ASSETS.NARRATIVE_PANELS.LEVEL_7_ENTRY },
                8: { title: "Level 8: Approaching the End", count: 3, images: ASSETS.NARRATIVE_PANELS.LEVEL_8_ENTRY },
                9: { title: "Level 9: One More to Go", count: 3, images: ASSETS.NARRATIVE_PANELS.LEVEL_9_ENTRY },
                10: { title: "Level 10: The Final Drop", count: 3, images: ASSETS.NARRATIVE_PANELS.LEVEL_10_ENTRY }
            };

            const panel = entryPanels[levelNumber];
            return {
                title: panel.title,
                panelCount: panel.count,
                images: panel.images
            };
        } else {
            // Outro story after completing the level
            if (levelNumber === 5) {
                // Special midpoint story (6 panels)
                return {
                    title: "Halfway There!",
                    panelCount: 6,
                    images: ASSETS.NARRATIVE_PANELS.MIDPOINT
                };
            } else if (levelNumber === 10) {
                // Final victory ending - split into 2 parts for better visibility
                if (endingPart === 1) {
                    return {
                        title: "Mission Complete!",
                        panelCount: 5,
                        images: ASSETS.NARRATIVE_PANELS.ENDING_PART1
                    };
                } else {
                    return {
                        title: "The Journey Ends...",
                        panelCount: 5,
                        images: ASSETS.NARRATIVE_PANELS.ENDING_PART2
                    };
                }
            } else {
                // Regular level exit panels (2 panels each)
                const exitPanels = {
                    1: { title: "Stage 1 Complete!", images: ASSETS.NARRATIVE_PANELS.LEVEL_1_EXIT },
                    2: { title: "Stage 2 Complete!", images: ASSETS.NARRATIVE_PANELS.LEVEL_2_EXIT },
                    3: { title: "Stage 3 Complete!", images: ASSETS.NARRATIVE_PANELS.LEVEL_3_EXIT },
                    4: { title: "Stage 4 Complete!", images: ASSETS.NARRATIVE_PANELS.LEVEL_4_EXIT },
                    6: { title: "Stage 6 Complete!", images: ASSETS.NARRATIVE_PANELS.LEVEL_6_EXIT },
                    7: { title: "Stage 7 Complete!", images: ASSETS.NARRATIVE_PANELS.LEVEL_7_EXIT },
                    8: { title: "Stage 8 Complete!", images: ASSETS.NARRATIVE_PANELS.LEVEL_8_EXIT },
                    9: { title: "Stage 9 Complete!", images: ASSETS.NARRATIVE_PANELS.LEVEL_9_EXIT }
                };

                const panel = exitPanels[levelNumber];
                return {
                    title: panel.title,
                    panelCount: 2,
                    images: panel.images
                };
            }
        }
    }

    // Start a level
    startLevel(levelNumber) {
        if (levelNumber > this.unlockedLevels || levelNumber < 1 || levelNumber > this.totalLevels) {
            console.warn(`Cannot start level ${levelNumber}. Unlocked: ${this.unlockedLevels}`);
            return false;
        }
        
        this.currentLevel = levelNumber;
        console.log(`Starting level ${levelNumber}`);
        return this.getLevelConfig(levelNumber);
    }

    // Complete a level
    completeLevel(levelNumber, score, time) {
        console.log(`Completing level ${levelNumber} with score ${score} in ${time}s`);
        
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
        
        // Unlock next level if this was the highest unlocked level
        if (levelNumber === this.unlockedLevels && levelNumber < this.totalLevels) {
            this.unlockedLevels++;
            console.log(`Unlocked level ${this.unlockedLevels}`);
        }
        
        // Save progress
        this.saveProgress();
        
        return {
            grade,
            stars: this.levelStars[levelNumber - 1],
            newHighScore: score === this.levelScores[levelNumber - 1],
            nextLevelUnlocked: levelNumber < this.unlockedLevels
        };
    }

    // Calculate grade based on score
    calculateGrade(score, targetScore) {
        const percentage = (score / targetScore) * 100;

        console.log(`[GRADING] Score: ${score}, Target: ${targetScore}, Percentage: ${percentage.toFixed(1)}%`);

        let grade;
        if (percentage >= 150) grade = 'S';      // 150%+ (very difficult)
        else if (percentage >= 100) grade = 'A'; // 100%+ (target score)
        else if (percentage >= 80) grade = 'B';  // 80%+
        else if (percentage >= 60) grade = 'C';  // 60%+
        else if (percentage >= 40) grade = 'D';  // 40%+
        else grade = 'F';                        // <40%

        console.log(`[GRADING] Calculated grade: ${grade}`);
        return grade;
    }

    // Get numeric value for grade comparison
    getGradeValue(grade) {
        const values = { 'F': 0, 'D': 1, 'C': 2, 'B': 3, 'A': 4, 'S': 5 };
        return values[grade] || 0;
    }

    // Calculate stars earned
    calculateStars(score, targetScore) {
        const percentage = (score / targetScore) * 100;

        if (percentage >= 150) return 3; // S rank
        if (percentage >= 100) return 2; // A rank
        if (percentage >= 60) return 1;  // C rank or better
        return 0;                        // D or F rank
    }

    // Get total score across all levels
    getTotalScore() {
        return this.levelScores.reduce((sum, score) => sum + score, 0);
    }

    // Get total stars earned across all levels
    getTotalStars() {
        return this.levelStars.reduce((sum, stars) => sum + stars, 0);
    }

    // Get completion percentage
    getCompletionPercentage() {
        const completedLevels = this.levelScores.filter(score => score > 0).length;
        return Math.floor((completedLevels / this.totalLevels) * 100);
    }

    // Check if a level is unlocked
    isLevelUnlocked(levelNumber) {
        return levelNumber <= this.unlockedLevels;
    }

    // Save progress to local storage
    saveProgress() {
        const progressData = {
            unlockedLevels: this.unlockedLevels,
            levelScores: this.levelScores,
            levelGrades: this.levelGrades,
            levelStars: this.levelStars,
            levelBestTimes: this.levelBestTimes
        };
        
        if (this.game.saveManager) {
            this.game.saveManager.data.levelProgress = progressData;
            this.game.saveManager.save();
        }
        
        // Also save directly to localStorage as backup
        localStorage.setItem('oneJumpLevelProgress', JSON.stringify(progressData));
    }

    // Load progress from local storage
    loadProgress() {
        let progressData = null;
        
        // Try to load from SaveManager first
        if (this.game.saveManager && this.game.saveManager.data.levelProgress) {
            progressData = this.game.saveManager.data.levelProgress;
        } else {
            // Fall back to direct localStorage
            const saved = localStorage.getItem('oneJumpLevelProgress');
            if (saved) {
                try {
                    progressData = JSON.parse(saved);
                } catch (e) {
                    console.error('Failed to parse saved progress:', e);
                }
            }
        }
        
        if (progressData) {
            this.unlockedLevels = progressData.unlockedLevels || 2; // Keep 2 unlocked for testing
            this.levelScores = progressData.levelScores || new Array(this.totalLevels).fill(0);
            this.levelGrades = progressData.levelGrades || new Array(this.totalLevels).fill('F');
            this.levelStars = progressData.levelStars || new Array(this.totalLevels).fill(0);
            this.levelBestTimes = progressData.levelBestTimes || new Array(this.totalLevels).fill(Infinity);
        }
    }

    // Reset all progress
    resetProgress() {
        this.unlockedLevels = 2; // Keep 2 unlocked for testing
        this.levelScores = new Array(this.totalLevels).fill(0);
        this.levelGrades = new Array(this.totalLevels).fill('F');
        this.levelStars = new Array(this.totalLevels).fill(0);
        this.levelBestTimes = new Array(this.totalLevels).fill(Infinity);

        this.saveProgress();
    }

    // Unlock all levels (for testing/debugging)
    unlockAllLevels() {
        console.log('Unlocking all levels for testing');
        this.unlockedLevels = this.totalLevels;
        this.saveProgress();
    }
}