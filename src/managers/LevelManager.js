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
    getDifficultyConfig(levelNumber) {
        // Progressive difficulty from level 1 (easy) to 10 (very hard)
        const difficulty = levelNumber / 10; // 0.1 to 1.0

        return {
            // Obstacle count: 20 at level 1, 80 at level 10
            obstacleCount: Math.floor(20 + (difficulty * 60)),

            // Obstacle spacing: 250px at level 1, 100px at level 10
            obstacleSpacing: Math.floor(250 - (difficulty * 150)),

            // Fall distance: 5000 at level 1, 10000 at level 10
            fallDistance: Math.floor(5000 + (difficulty * 5000)),

            // Target score scales with difficulty: 1000 at level 1, 3000 at level 10
            // Higher levels have more obstacles = more near-miss opportunities
            targetScore: Math.floor(1000 + (difficulty * 2000)),

            // Available obstacle types unlock progressively
            availableObstacles: this.getAvailableObstacles(levelNumber)
        };
    }

    // Determine which obstacles are available at each level
    getAvailableObstacles(levelNumber) {
        // Level 1-2: Basic obstacles only
        if (levelNumber <= 2) {
            return ['spike', 'platform', 'wall'];
        }
        // Level 3-4: Add movement
        else if (levelNumber <= 4) {
            return ['spike', 'platform', 'wall', 'spinner', 'barrel'];
        }
        // Level 5-6: Add hazards
        else if (levelNumber <= 6) {
            return ['spike', 'platform', 'wall', 'spinner', 'barrel', 'alien', 'laser'];
        }
        // Level 7-8: Add complex patterns
        else if (levelNumber <= 8) {
            return ['spike', 'platform', 'wall', 'spinner', 'barrel', 'alien', 'laser', 'meteor', 'pendulum'];
        }
        // Level 9-10: All obstacles
        else {
            return ['spike', 'platform', 'wall', 'spinner', 'barrel', 'alien', 'laser', 'meteor', 'pendulum', 'orbiter', 'pulsar'];
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

        // Level-specific configurations
        const configs = [
            {
                // Level 1: Tutorial Rooftop (Original)
                id: 1,
                name: "Tutorial Rooftop",
                subtitle: "Duke's Last Stand",
                // targetScore handled by baseConfig (1000 for level 1)
                duration: 60,
                obstaclePatterns: ['single', 'double'],
                obstacleTypes: ['bird', 'plane', 'cloud'],
                powerUpFrequency: 0.2,
                windStrength: 0,
                storyBeat: {
                    title: "The Beginning",
                    panels: [
                        "Duke stands at the edge...",
                        "One final jump to glory!",
                        "Can he make it to OCU?"
                    ]
                }
            },
            {
                // Level 2: TEMPORARY COPY OF LEVEL 1 FOR TESTING
                // Will be replaced with unique content later
                id: 2,
                name: "Test Level 2",
                subtitle: "Testing Transitions",
                // targetScore handled by baseConfig (1200 for level 2)
                duration: 60,
                obstaclePatterns: ['single', 'double'],
                obstacleTypes: ['bird', 'plane', 'cloud'],
                powerUpFrequency: 0.2,
                windStrength: 0,
                storyBeat: {
                    title: "Level 2 Story",
                    panels: [
                        "The journey continues...",
                        "New challenges await!",
                        "Keep falling towards victory!"
                    ]
                }
            },
            {
                // Level 3 and beyond (placeholders for now)
                id: 3,
                name: "City Streets",
                subtitle: "Urban Descent",
                // targetScore handled by baseConfig (1400 for level 3)
                duration: 70,
                obstaclePatterns: ['single', 'double', 'zigzag'],
                obstacleTypes: ['bird', 'plane', 'balloon', 'drone'],
                powerUpFrequency: 0.25,
                windStrength: 0.1,
                storyBeat: {
                    title: "Urban Adventure",
                    panels: [
                        "The city sprawls below...",
                        "Traffic and towers everywhere!",
                        "Navigate the urban jungle!"
                    ]
                }
            }
        ];

        // Return specific config or use level 1 as fallback
        if (levelNumber <= configs.length) {
            return { ...baseConfig, ...configs[levelNumber - 1] };
        } else {
            // For levels 4-10, reuse level 1 config as placeholder
            return { 
                ...baseConfig, 
                ...configs[0], 
                id: levelNumber,
                name: `Stage ${levelNumber}`,
                subtitle: "Coming Soon",
                storyBeat: {
                    title: `Stage ${levelNumber}`,
                    panels: [
                        "This level is coming soon!",
                        "For now, enjoy the classic obstacles.",
                        "More content on the way!"
                    ]
                }
            };
        }
    }

    // Get story panels for transitions
    getStoryPanels(levelNumber, isIntro = true) {
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
                // Final victory ending (10 panels)
                return {
                    title: "Mission Complete!",
                    panelCount: 10,
                    images: ASSETS.NARRATIVE_PANELS.ENDING
                };
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
        
        if (percentage >= 150) return 'S';
        if (percentage >= 120) return 'A';
        if (percentage >= 100) return 'B';
        if (percentage >= 80) return 'C';
        if (percentage >= 60) return 'D';
        return 'F';
    }

    // Get numeric value for grade comparison
    getGradeValue(grade) {
        const values = { 'F': 0, 'D': 1, 'C': 2, 'B': 3, 'A': 4, 'S': 5 };
        return values[grade] || 0;
    }

    // Calculate stars earned
    calculateStars(score, targetScore) {
        const percentage = (score / targetScore) * 100;
        
        if (percentage >= 150) return 3;
        if (percentage >= 100) return 2;
        if (percentage >= 60) return 1;
        return 0;
    }

    // Get total score across all levels
    getTotalScore() {
        return this.levelScores.reduce((sum, score) => sum + score, 0);
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
}