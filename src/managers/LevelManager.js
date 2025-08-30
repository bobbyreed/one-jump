export default class LevelManager {
    constructor(game) {
        this.game = game;
        this.currentLevel = 1;
        this.totalLevels = 10;
        this.levelScores = new Array(10).fill(0);
        this.levelGrades = new Array(10).fill('');
        this.levelBestTimes = new Array(10).fill(Infinity);
        this.unlockedLevels = 1;
        
        // Load saved progress
        this.loadProgress();
    }

    // Level definitions based on Game Design Document
    getLevelConfig(levelNumber) {
        const configs = [
            {
                // Stage 1: The Cosmic Perch
                id: 1,
                name: "The Cosmic Perch",
                subtitle: "Tutorial in the stars",
                altitude: { start: 400, end: 400 },
                duration: 30,
                targetScore: 10000,
                gravity: 200, // Reduced gravity for space
                windSpeed: 0,
                obstacleCount: 20,
                obstacleSpacing: 200,
                obstacleTypes: ['satellite', 'space_junk', 'solar_panel'],
                specialMechanics: {
                    reducedGravity: true,
                    noWind: true,
                    wideNearMissZones: true
                },
                storyBeat: {
                    title: "The Call to Action",
                    panels: [
                        "Starsky adjusting his sunglasses in zero gravity",
                        "Radio: 'Starsky! The freshman orientation is starting!'",
                        "'Better hustle my hooves! Can't let my Stars down!'"
                    ]
                },
                backgroundColor: 0x000428
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
                obstacleTypes: ['meteor', 'heat_wave', 'plasma_burst'],
                specialMechanics: {
                    heatZones: true,
                    meteorTrails: true,
                    screenShake: true
                },
                storyBeat: {
                    title: "Heating Up",
                    panels: [
                        "Starsky's wool slightly singed",
                        "Shooting star passes: 'Hey, that's my cousin!'",
                        "Burns marshmallow on his horn: 'Waste not!'"
                    ]
                },
                backgroundColor: 0x4B0082
            },
            {
                // Stage 3: Mesosphere Mayhem
                id: 3,
                name: "Mesosphere Mayhem",
                subtitle: "Ice and wind",
                altitude: { start: 85, end: 50 },
                duration: 50,
                targetScore: 35000,
                gravity: 400,
                windSpeed: 100,
                obstacleCount: 35,
                obstacleSpacing: 160,
                obstacleTypes: ['ice_crystal', 'wind_tunnel', 'cloud'],
                specialMechanics: {
                    windAffectsMovement: true,
                    iceCreatesplatforms: true,
                    cloudsObscureVision: true
                },
                storyBeat: {
                    title: "Getting Chilly",
                    panels: [
                        "Starsky shivers: 'Should've brought my varsity jacket!'",
                        "Pulls out OCU pennant, uses as cape",
                        "'OCU Stars shine in any weather!'"
                    ]
                },
                backgroundColor: 0x1E3A8A
            },
            {
                // Stage 4: Stratosphere Showdown
                id: 4,
                name: "Stratosphere Showdown",
                subtitle: "Scientific instruments",
                altitude: { start: 50, end: 12 },
                duration: 55,
                targetScore: 50000,
                gravity: 450,
                windSpeed: 80,
                obstacleCount: 40,
                obstacleSpacing: 150,
                obstacleTypes: ['weather_balloon', 'research_equipment', 'ozone_pocket'],
                specialMechanics: {
                    balloonBounce: true,
                    ozoneSlowZones: true,
                    rotatingEquipment: true
                },
                storyBeat: {
                    title: "Going Viral",
                    panels: [
                        "Weather balloon with camera",
                        "Starsky poses: 'Make sure you get my good side!'",
                        "Balloon operator: 'This is going viral!'"
                    ]
                },
                backgroundColor: 0x004e92
            },
            {
                // Stage 5: Jet Stream Jam - MIDPOINT
                id: 5,
                name: "Jet Stream Jam",
                subtitle: "Commercial aviation",
                altitude: { start: 12, end: 10 },
                duration: 60,
                targetScore: 70000,
                gravity: 500,
                windSpeed: 150,
                obstacleCount: 45,
                obstacleSpacing: 140,
                obstacleTypes: ['passenger_plane', 'jet_stream', 'contrail'],
                specialMechanics: {
                    jetStreamLaunch: true,
                    contrailDamage: true,
                    multiplePlaneHitboxes: true
                },
                storyBeat: {
                    title: "Midpoint Madness",
                    panels: [
                        "Pilot does double-take",
                        "Kid in plane: 'Mom! I saw the OCU Ram!'",
                        "Starsky holds sign: 'Hi Mom!'"
                    ]
                },
                midpointCheckpoint: true,
                backgroundColor: 0x87CEEB
            },
            {
                // Stage 6: Cloud Nine Catastrophe
                id: 6,
                name: "Cloud Nine Catastrophe",
                subtitle: "Storm system",
                altitude: { start: 10, end: 5 },
                duration: 65,
                targetScore: 90000,
                gravity: 550,
                windSpeed: 200,
                obstacleCount: 50,
                obstacleSpacing: 130,
                obstacleTypes: ['lightning', 'thunder_cloud', 'rain_column', 'hail'],
                specialMechanics: {
                    lightningWarning: true,
                    cloudBounce: true,
                    rainAcceleration: true,
                    hailTracking: true
                },
                storyBeat: {
                    title: "Bad Hair Day",
                    panels: [
                        "Starsky's wool all frizzed from static",
                        "'Note to self: Wool + Lightning = Bad hair day!'",
                        "Lightning spells 'OCU' in background"
                    ]
                },
                backgroundColor: 0x4A4A4A
            },
            {
                // Stage 7: Turbulence Territory
                id: 7,
                name: "Turbulence Territory",
                subtitle: "Living obstacles",
                altitude: { start: 5, end: 2 },
                duration: 70,
                targetScore: 110000,
                gravity: 580,
                windSpeed: 120,
                obstacleCount: 55,
                obstacleSpacing: 120,
                obstacleTypes: ['bird_flock', 'small_aircraft', 'drone', 'hang_glider'],
                specialMechanics: {
                    birdFormations: true,
                    droneTracking: true,
                    gliderRiding: true
                },
                storyBeat: {
                    title: "Making Friends",
                    panels: [
                        "Flock of geese in V formation",
                        "Lead goose: 'This is a no-ram zone!'",
                        "Starsky creates his own V with confused birds"
                    ]
                },
                backgroundColor: 0x87CEEB
            },
            {
                // Stage 8: Helicopter Heights
                id: 8,
                name: "Helicopter Heights",
                subtitle: "News coverage",
                altitude: { start: 2, end: 0.5 },
                duration: 75,
                targetScore: 135000,
                gravity: 600,
                windSpeed: 100,
                obstacleCount: 60,
                obstacleSpacing: 110,
                obstacleTypes: ['news_helicopter', 'camera_drone', 'hot_air_balloon', 'banner_plane'],
                specialMechanics: {
                    helicopterWash: true,
                    cameraFlash: true,
                    balloonBounce: true,
                    bannerTearing: true
                },
                storyBeat: {
                    title: "Breaking News",
                    panels: [
                        "News reporter: 'This is unprecedented!'",
                        "Starsky: 'I prefer 'confidently skilled'!'",
                        "Breaking News ticker: 'RAM RATES RADICAL'"
                    ]
                },
                backgroundColor: 0x6B8DD6
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
                windSpeed: 50,
                obstacleCount: 65,
                obstacleSpacing: 100,
                obstacleTypes: ['building_edge', 'construction_crane', 'window_washer', 'rooftop_garden'],
                specialMechanics: {
                    buildingThreading: true,
                    craneSwing: true,
                    wallJump: true,
                    gardenSafety: true
                },
                storyBeat: {
                    title: "Urban Navigation",
                    panels: [
                        "Construction workers eating lunch on beam",
                        "Starsky: 'Save me a sandwich!'",
                        "Sign changes to read: 'RAM CONSTRUCTION CO.'"
                    ]
                },
                backgroundColor: 0x4169E1
            },
            {
                // Stage 10: Campus Crashdown - FINALE
                id: 10,
                name: "Campus Crashdown",
                subtitle: "Home sweet home",
                altitude: { start: 0.1, end: 0 },
                duration: 90,
                targetScore: 200000,
                gravity: 600,
                windSpeed: 30,
                obstacleCount: 70,
                obstacleSpacing: 90,
                obstacleTypes: ['flag_pole', 'university_building', 'tree', 'fountain'],
                specialMechanics: {
                    ocuLetterBonus: true,
                    multipleLandingZones: true,
                    studentCheers: true,
                    marchingBandRhythm: true
                },
                storyBeat: {
                    title: "The Hero Returns",
                    panels: [
                        "Perfect landing in fountain",
                        "President: 'Starsky, that was... unprecedented!'",
                        "Starsky: 'Who wants to hear about my space adventure?'"
                    ]
                },
                finalLevel: true,
                backgroundColor: 0x228B22
            }
        ];

        // For now, reuse level 1 config if requesting beyond defined levels
        const levelIndex = Math.min(levelNumber - 1, configs.length - 1);
        return configs[levelIndex];
    }

    // Get story panels for between levels
    getStoryPanels(levelNumber, isIntro = true) {
        const levelConfig = this.getLevelConfig(levelNumber);
        
        if (isIntro) {
            // Opening story for the level
            return {
                title: levelConfig.storyBeat.title,
                panels: levelConfig.storyBeat.panels,
                // For now, reuse opening images until new ones are created
                images: Array.from({ length: 3 }, (_, i) => 
                    `/public/assets/narrativePanels/opening/opening${(i % 5) + 1}.png`)
            };
        } else {
            // Victory/transition story after completing level
            const transitionStories = [
                { title: "Onward!", panels: ["Great job!", "But the journey continues...", "Next challenge awaits!"] },
                { title: "Gaining Speed", panels: ["Picking up momentum!", "The ground approaches...", "Stay focused!"] },
                { title: "Halfway There", panels: ["You're doing great!", "Don't give up now!", "The campus awaits!"] },
                { title: "Almost Home", panels: ["So close!", "One final push!", "Stars forever!"] }
            ];
            
            const storyIndex = Math.floor((levelNumber - 1) / 2.5);
            return {
                ...transitionStories[Math.min(storyIndex, transitionStories.length - 1)],
                images: Array.from({ length: 3 }, (_, i) => 
                    `/public/assets/narrativePanels/opening/opening${(i % 5) + 1}.png`)
            };
        }
    }

    // Progress management
    startLevel(levelNumber) {
        if (levelNumber > this.unlockedLevels || levelNumber < 1 || levelNumber > this.totalLevels) {
            return false;
        }
        
        this.currentLevel = levelNumber;
        return this.getLevelConfig(levelNumber);
    }

    completeLevel(levelNumber, score, grade, time) {
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
        
        // Unlock next level
        if (levelNumber === this.unlockedLevels && levelNumber < this.totalLevels) {
            this.unlockedLevels++;
        }
        
        // Save progress
        this.saveProgress();
        
        // Return next level or completion status
        if (levelNumber < this.totalLevels) {
            return { nextLevel: levelNumber + 1, completed: false };
        } else {
            return { completed: true };
        }
    }

    getGradeValue(grade) {
        const grades = { 'S+': 7, 'S': 6, 'A': 5, 'B': 4, 'C': 3, 'D': 2, 'F': 1, '': 0 };
        return grades[grade] || 0;
    }

    calculateGrade(score, targetScore, noHit = false) {
        const percentage = (score / targetScore) * 100;
        
        if (percentage >= 150 && noHit) return 'S+';
        if (percentage >= 125) return 'S';
        if (percentage >= 100) return 'A';
        if (percentage >= 75) return 'B';
        if (percentage >= 50) return 'C';
        if (percentage >= 25) return 'D';
        return 'F';
    }

    getTotalScore() {
        return this.levelScores.reduce((sum, score) => sum + score, 0);
    }

    getCompletionPercentage() {
        const completedLevels = this.levelGrades.filter(grade => grade && grade !== '').length;
        return Math.floor((completedLevels / this.totalLevels) * 100);
    }

    saveProgress() {
        const progressData = {
            currentLevel: this.currentLevel,
            unlockedLevels: this.unlockedLevels,
            levelScores: this.levelScores,
            levelGrades: this.levelGrades,
            levelBestTimes: this.levelBestTimes
        };
        
        localStorage.setItem('oneJump_levelProgress', JSON.stringify(progressData));
    }

    loadProgress() {
        const saved = localStorage.getItem('oneJump_levelProgress');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                this.currentLevel = data.currentLevel || 1;
                this.unlockedLevels = data.unlockedLevels || 1;
                this.levelScores = data.levelScores || new Array(10).fill(0);
                this.levelGrades = data.levelGrades || new Array(10).fill('');
                this.levelBestTimes = data.levelBestTimes || new Array(10).fill(Infinity);
            } catch (e) {
                console.error('Failed to load level progress:', e);
            }
        }
    }

    resetProgress() {
        this.currentLevel = 1;
        this.unlockedLevels = 1;
        this.levelScores = new Array(10).fill(0);
        this.levelGrades = new Array(10).fill('');
        this.levelBestTimes = new Array(10).fill(Infinity);
        this.saveProgress();
    }
}


