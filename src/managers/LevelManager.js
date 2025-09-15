import SaveManager from './SaveManager.js';

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

    // Get configuration for a specific level
    getLevelConfig(levelNumber) {
        // Base configuration shared by all levels
        const baseConfig = {
            id: levelNumber,
            gravity: 0.3,
            maxFallSpeed: 15,
            startHeight: -200,
            endHeight: 3000,
            backgroundType: 'sky',
            windStrength: 0,
            targetScore: 10000,
            duration: 90,
            obstacleSpacing: 150
        };

        // Level-specific configurations
        const configs = [
            {
                // Level 1: Tutorial Rooftop (Original)
                id: 1,
                name: "Tutorial Rooftop",
                subtitle: "Duke's Last Stand",
                targetScore: 5000,
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
                targetScore: 5000,
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
                targetScore: 7500,
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
        const config = this.getLevelConfig(levelNumber);
        
        if (isIntro) {
            // Intro story before the level starts
            return {
                title: config.storyBeat.title,
                panels: config.storyBeat.panels,
                images: this.getWireframeImages()
            };
        } else {
            // Outro story after completing the level
            if (levelNumber === 1) {
                return {
                    title: "Stage 1 Complete!",
                    panels: [
                        "Great job on your first descent!",
                        "You've mastered the basics.",
                        "Ready for the next challenge?"
                    ],
                    images: this.getWireframeImages()
                };
            } else if (levelNumber === 2) {
                return {
                    title: "Stage 2 Complete!",
                    panels: [
                        "Another successful landing!",
                        "Your skills are improving.",
                        "8 more stages await!"
                    ],
                    images: this.getWireframeImages()
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
                // Generic transition for other levels
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

    // Get wireframe images (placeholder for now)
    getWireframeImages() {
        // Return placeholder image paths
        // These will be replaced with actual story panel images later
        return [
            '/assets/story/panel1.png',
            '/assets/story/panel2.png',
            '/assets/story/panel3.png'
        ];
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