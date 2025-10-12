export default class SaveManager {
    constructor() {
        this.saveKey = 'oneJumpSaveData';
        this.data = this.getDefaultData();
    }

    getDefaultData() {
        return {
            version: '1.0.0',
            username: 'Anonymous',
            highScore: 0,
            totalDistance: 0,
            totalFalls: 0,
            gamesPlayed: 0,
            achievements: [],
            settings: {
                sfxVolume: 100,
                musicVolume: 100,
                particlesEnabled: true,
                skipStory: false
            },
            statistics: {
                perfectLandings: 0,
                greatLandings: 0,
                goodLandings: 0,
                crashes: 0,
                nearMisses: 0,
                maxCombo: 0
            },
            stageProgress: {
                currentStage: 1,
                stagesUnlocked: 1,
                stageScores: Array(10).fill(0),
                stageGrades: Array(10).fill(''),
                stageTimes: Array(10).fill(0),
                stageMaxSpeeds: Array(10).fill(0),
                stageLongestTimes: Array(10).fill(0),
                stageLowestScores: Array(10).fill(Infinity)
            }
        };
    }

    load() {
        try {
            const savedData = localStorage.getItem(this.saveKey);
            if (savedData) {
                const parsed = JSON.parse(savedData);
                // Merge with default data to ensure all fields exist
                this.data = { ...this.getDefaultData(), ...parsed };
                console.log('Save data loaded:', this.data);
            } else {
                console.log('No save data found, using defaults');
            }
        } catch (error) {
            console.error('Failed to load save data:', error);
            this.data = this.getDefaultData();
        }
    }

    save() {
        try {
            localStorage.setItem(this.saveKey, JSON.stringify(this.data));
            console.log('Game saved successfully');
        } catch (error) {
            console.error('Failed to save game:', error);
        }
    }

    // Convenience methods
    updateHighScore(score) {
        if (score > this.data.highScore) {
            this.data.highScore = score;
            this.save();
            return true;
        }
        return false;
    }

    incrementStat(statName, amount = 1) {
        if (this.data.statistics[statName] !== undefined) {
            this.data.statistics[statName] += amount;
        }
    }

    unlockAchievement(achievementId) {
        if (!this.data.achievements.includes(achievementId)) {
            this.data.achievements.push(achievementId);
            this.save();
            return true;
        }
        return false;
    }

    getStageScore(stageIndex) {
        return this.data.stageProgress.stageScores[stageIndex] || 0;
    }

    setStageScore(stageIndex, score) {
        if (score > this.data.stageProgress.stageScores[stageIndex]) {
            this.data.stageProgress.stageScores[stageIndex] = score;
            this.save();
            return true;
        }
        return false;
    }

    setStageMaxSpeed(stageIndex, speed) {
        if (!this.data.stageProgress.stageMaxSpeeds) {
            this.data.stageProgress.stageMaxSpeeds = Array(10).fill(0);
        }
        if (speed > this.data.stageProgress.stageMaxSpeeds[stageIndex]) {
            this.data.stageProgress.stageMaxSpeeds[stageIndex] = speed;
            this.save();
            return true;
        }
        return false;
    }

    setStageLongestTime(stageIndex, time) {
        if (!this.data.stageProgress.stageLongestTimes) {
            this.data.stageProgress.stageLongestTimes = Array(10).fill(0);
        }
        if (time > this.data.stageProgress.stageLongestTimes[stageIndex]) {
            this.data.stageProgress.stageLongestTimes[stageIndex] = time;
            this.save();
            return true;
        }
        return false;
    }

    setStageLowestScore(stageIndex, score) {
        if (!this.data.stageProgress.stageLowestScores) {
            this.data.stageProgress.stageLowestScores = Array(10).fill(Infinity);
        }
        if (score < this.data.stageProgress.stageLowestScores[stageIndex]) {
            this.data.stageProgress.stageLowestScores[stageIndex] = score;
            this.save();
            return true;
        }
        return false;
    }

    reset() {
        this.data = this.getDefaultData();
        this.save();
    }

    clearSave() {
        localStorage.removeItem(this.saveKey);
        this.data = this.getDefaultData();
    }
}