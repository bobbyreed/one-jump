import {
    collection,
    doc,
    setDoc,
    getDoc,
    getDocs,
    query,
    where,
    orderBy,
    limit,
    serverTimestamp
} from 'firebase/firestore';

export default class LeaderboardManager {
    constructor(firebaseManager) {
        this.firebaseManager = firebaseManager;
        this.db = firebaseManager.getFirestore();
        this.cache = new Map();
        this.cacheExpiry = 5 * 60 * 1000; // 5 minutes
    }

    /**
     * Submit a score to the leaderboard
     * Only submits if it's a new personal best and user has a valid username
     */
    async submitScore(levelNumber, scoreData) {
        if (!this.firebaseManager.isInitialized()) {
            console.warn('Firebase not initialized, cannot submit score');
            return false;
        }

        const userId = this.firebaseManager.getUserId();
        if (!userId) {
            console.warn('No user ID, cannot submit score');
            return false;
        }

        // Reject submissions from Anonymous users
        const username = scoreData.username || '';
        if (!username || username === 'Anonymous') {
            console.log('Anonymous users cannot submit scores. Please set a username first.');
            return false;
        }

        try {
            const leaderboardPath = `leaderboards/level${levelNumber}/scores`;
            const userDocRef = doc(this.db, leaderboardPath, userId);

            // Check if this is a personal best
            const existingDoc = await getDoc(userDocRef);
            const existingScore = existingDoc.exists() ? existingDoc.data().score : 0;

            if (scoreData.score <= existingScore) {
                console.log('Score not a personal best, not submitting');
                return false;
            }

            // Submit new high score
            const submissionData = {
                username: username,
                score: scoreData.score,
                time: scoreData.time,
                grade: scoreData.grade,
                stars: scoreData.stars || 0,
                maxCombo: scoreData.maxCombo || 0,
                nearMisses: scoreData.nearMisses || 0,
                timestamp: serverTimestamp(),
                userId: userId
            };

            await setDoc(userDocRef, submissionData);
            console.log(`Score submitted for level ${levelNumber}:`, scoreData.score);

            // Invalidate cache for this level
            this.cache.delete(`level${levelNumber}`);
            this.cache.delete('global');

            return true;

        } catch (error) {
            console.error('Error submitting score:', error);
            return false;
        }
    }

    /**
     * Submit total score to global leaderboard
     */
    async submitGlobalScore(scoreData) {
        if (!this.firebaseManager.isInitialized()) {
            console.warn('Firebase not initialized, cannot submit global score');
            return false;
        }

        const userId = this.firebaseManager.getUserId();
        if (!userId) {
            console.warn('No user ID, cannot submit global score');
            return false;
        }

        // Reject submissions from Anonymous users
        const username = scoreData.username || '';
        if (!username || username === 'Anonymous') {
            console.log('Anonymous users cannot submit global scores. Please set a username first.');
            return false;
        }

        try {
            const globalPath = 'leaderboards/global/scores';
            const userDocRef = doc(this.db, globalPath, userId);

            // Check if this is a new high
            const existingDoc = await getDoc(userDocRef);
            const existingScore = existingDoc.exists() ? existingDoc.data().totalScore : 0;

            if (scoreData.totalScore <= existingScore) {
                console.log('Total score not a personal best, not submitting');
                return false;
            }

            // Submit new high score
            const submissionData = {
                username: username,
                totalScore: scoreData.totalScore,
                levelsCompleted: scoreData.levelsCompleted || 0,
                totalStars: scoreData.totalStars || 0,
                timestamp: serverTimestamp(),
                userId: userId
            };

            await setDoc(userDocRef, submissionData);
            console.log('Global score submitted:', scoreData.totalScore);

            // Invalidate cache
            this.cache.delete('global');

            return true;

        } catch (error) {
            console.error('Error submitting global score:', error);
            return false;
        }
    }

    /**
     * Get top scores for a specific level
     */
    async getLevelLeaderboard(levelNumber, limitCount = 50) {
        if (!this.firebaseManager.isInitialized()) {
            console.warn('Firebase not initialized, returning empty leaderboard');
            return [];
        }

        const cacheKey = `level${levelNumber}`;

        // Check cache
        if (this.cache.has(cacheKey)) {
            const cached = this.cache.get(cacheKey);
            if (Date.now() - cached.timestamp < this.cacheExpiry) {
                console.log(`Using cached leaderboard for level ${levelNumber}`);
                return cached.data;
            }
        }

        try {
            const leaderboardPath = `leaderboards/level${levelNumber}/scores`;
            const scoresRef = collection(this.db, leaderboardPath);

            // Query top scores
            const q = query(
                scoresRef,
                orderBy('score', 'desc'),
                limit(limitCount)
            );

            const querySnapshot = await getDocs(q);
            const leaderboard = [];
            let rank = 1;

            querySnapshot.forEach((doc) => {
                const data = doc.data();
                // Skip Anonymous users
                if (data.username && data.username !== 'Anonymous') {
                    leaderboard.push({
                        rank: rank++,
                        userId: doc.id,
                        username: data.username,
                        score: data.score,
                        time: data.time,
                        grade: data.grade,
                        stars: data.stars,
                        maxCombo: data.maxCombo,
                        nearMisses: data.nearMisses,
                        timestamp: data.timestamp
                    });
                }
            });

            // Cache the result
            this.cache.set(cacheKey, {
                data: leaderboard,
                timestamp: Date.now()
            });

            console.log(`Fetched ${leaderboard.length} scores for level ${levelNumber}`);
            return leaderboard;

        } catch (error) {
            console.error('Error fetching level leaderboard:', error);
            return [];
        }
    }

    /**
     * Get global leaderboard (total scores across all levels)
     */
    async getGlobalLeaderboard(limitCount = 100) {
        if (!this.firebaseManager.isInitialized()) {
            console.warn('Firebase not initialized, returning empty leaderboard');
            return [];
        }

        const cacheKey = 'global';

        // Check cache
        if (this.cache.has(cacheKey)) {
            const cached = this.cache.get(cacheKey);
            if (Date.now() - cached.timestamp < this.cacheExpiry) {
                console.log('Using cached global leaderboard');
                return cached.data;
            }
        }

        try {
            const globalPath = 'leaderboards/global/scores';
            const scoresRef = collection(this.db, globalPath);

            // Query top scores
            const q = query(
                scoresRef,
                orderBy('totalScore', 'desc'),
                limit(limitCount)
            );

            const querySnapshot = await getDocs(q);
            const leaderboard = [];
            let rank = 1;

            querySnapshot.forEach((doc) => {
                const data = doc.data();
                // Skip Anonymous users
                if (data.username && data.username !== 'Anonymous') {
                    leaderboard.push({
                        rank: rank++,
                        userId: doc.id,
                        username: data.username,
                        totalScore: data.totalScore,
                        levelsCompleted: data.levelsCompleted,
                        totalStars: data.totalStars,
                        timestamp: data.timestamp
                    });
                }
            });

            // Cache the result
            this.cache.set(cacheKey, {
                data: leaderboard,
                timestamp: Date.now()
            });

            console.log(`Fetched ${leaderboard.length} global scores`);
            return leaderboard;

        } catch (error) {
            console.error('Error fetching global leaderboard:', error);
            return [];
        }
    }

    /**
     * Get user's rank for a specific level
     */
    async getUserRank(levelNumber) {
        if (!this.firebaseManager.isInitialized()) {
            return null;
        }

        const userId = this.firebaseManager.getUserId();
        if (!userId) {
            return null;
        }

        try {
            const leaderboard = await this.getLevelLeaderboard(levelNumber, 1000);
            const userEntry = leaderboard.find(entry => entry.userId === userId);
            return userEntry ? userEntry.rank : null;

        } catch (error) {
            console.error('Error getting user rank:', error);
            return null;
        }
    }

    /**
     * Get user's personal best for a level
     */
    async getUserPersonalBest(levelNumber) {
        if (!this.firebaseManager.isInitialized()) {
            return null;
        }

        const userId = this.firebaseManager.getUserId();
        if (!userId) {
            return null;
        }

        try {
            const leaderboardPath = `leaderboards/level${levelNumber}/scores`;
            const userDocRef = doc(this.db, leaderboardPath, userId);
            const docSnap = await getDoc(userDocRef);

            if (docSnap.exists()) {
                return docSnap.data();
            }
            return null;

        } catch (error) {
            console.error('Error getting personal best:', error);
            return null;
        }
    }

    /**
     * Submit max speed to leaderboard
     */
    async submitSpeedScore(levelNumber, speedData) {
        if (!this.firebaseManager.isInitialized()) {
            console.warn('Firebase not initialized, cannot submit speed');
            return false;
        }

        const userId = this.firebaseManager.getUserId();
        if (!userId) return false;

        const username = speedData.username || '';
        if (!username || username === 'Anonymous') {
            return false;
        }

        try {
            const leaderboardPath = `leaderboards/level${levelNumber}/speeds`;
            const userDocRef = doc(this.db, leaderboardPath, userId);

            // Check if this is a personal best
            const existingDoc = await getDoc(userDocRef);
            const existingSpeed = existingDoc.exists() ? existingDoc.data().speed : 0;

            if (speedData.speed <= existingSpeed) {
                return false;
            }

            await setDoc(userDocRef, {
                username: username,
                speed: speedData.speed,
                time: speedData.time,
                grade: speedData.grade,
                timestamp: serverTimestamp(),
                userId: userId
            });

            console.log(`Speed submitted for level ${levelNumber}: ${speedData.speed}`);
            this.cache.delete(`speed_level${levelNumber}`);
            return true;

        } catch (error) {
            console.error('Error submitting speed:', error);
            return false;
        }
    }

    /**
     * Submit longest time to leaderboard
     */
    async submitLongestTimeScore(levelNumber, timeData) {
        if (!this.firebaseManager.isInitialized()) return false;

        const userId = this.firebaseManager.getUserId();
        if (!userId) return false;

        const username = timeData.username || '';
        if (!username || username === 'Anonymous') return false;

        try {
            const leaderboardPath = `leaderboards/level${levelNumber}/longestTimes`;
            const userDocRef = doc(this.db, leaderboardPath, userId);

            const existingDoc = await getDoc(userDocRef);
            const existingTime = existingDoc.exists() ? existingDoc.data().time : 0;

            // For longest time, bigger is better
            if (timeData.time <= existingTime) {
                return false;
            }

            await setDoc(userDocRef, {
                username: username,
                time: timeData.time,
                score: timeData.score,
                grade: timeData.grade,
                timestamp: serverTimestamp(),
                userId: userId
            });

            console.log(`Longest time submitted for level ${levelNumber}: ${timeData.time}`);
            this.cache.delete(`longestTime_level${levelNumber}`);
            return true;

        } catch (error) {
            console.error('Error submitting longest time:', error);
            return false;
        }
    }

    /**
     * Submit shortest time to leaderboard
     */
    async submitShortestTimeScore(levelNumber, timeData) {
        if (!this.firebaseManager.isInitialized()) return false;

        const userId = this.firebaseManager.getUserId();
        if (!userId) return false;

        const username = timeData.username || '';
        if (!username || username === 'Anonymous') return false;

        try {
            const leaderboardPath = `leaderboards/level${levelNumber}/shortestTimes`;
            const userDocRef = doc(this.db, leaderboardPath, userId);

            const existingDoc = await getDoc(userDocRef);
            const existingTime = existingDoc.exists() ? existingDoc.data().time : Infinity;

            // For shortest time, smaller is better
            if (timeData.time >= existingTime) {
                return false;
            }

            await setDoc(userDocRef, {
                username: username,
                time: timeData.time,
                score: timeData.score,
                grade: timeData.grade,
                timestamp: serverTimestamp(),
                userId: userId
            });

            console.log(`Shortest time submitted for level ${levelNumber}: ${timeData.time}`);
            this.cache.delete(`shortestTime_level${levelNumber}`);
            return true;

        } catch (error) {
            console.error('Error submitting shortest time:', error);
            return false;
        }
    }

    /**
     * Submit lowest score to leaderboard
     */
    async submitLowestScore(levelNumber, scoreData) {
        if (!this.firebaseManager.isInitialized()) return false;

        const userId = this.firebaseManager.getUserId();
        if (!userId) return false;

        const username = scoreData.username || '';
        if (!username || username === 'Anonymous') return false;

        try {
            const leaderboardPath = `leaderboards/level${levelNumber}/lowestScores`;
            const userDocRef = doc(this.db, leaderboardPath, userId);

            const existingDoc = await getDoc(userDocRef);
            const existingScore = existingDoc.exists() ? existingDoc.data().score : Infinity;

            // For lowest score, smaller is better
            if (scoreData.score >= existingScore) {
                return false;
            }

            await setDoc(userDocRef, {
                username: username,
                score: scoreData.score,
                time: scoreData.time,
                grade: scoreData.grade,
                timestamp: serverTimestamp(),
                userId: userId
            });

            console.log(`Lowest score submitted for level ${levelNumber}: ${scoreData.score}`);
            this.cache.delete(`lowestScore_level${levelNumber}`);
            return true;

        } catch (error) {
            console.error('Error submitting lowest score:', error);
            return false;
        }
    }

    /**
     * Get speed leaderboard for a specific level
     */
    async getSpeedLeaderboard(levelNumber, limitCount = 50) {
        if (!this.firebaseManager.isInitialized()) {
            return [];
        }

        const cacheKey = `speed_level${levelNumber}`;

        if (this.cache.has(cacheKey)) {
            const cached = this.cache.get(cacheKey);
            if (Date.now() - cached.timestamp < this.cacheExpiry) {
                return cached.data;
            }
        }

        try {
            const leaderboardPath = `leaderboards/level${levelNumber}/speeds`;
            const scoresRef = collection(this.db, leaderboardPath);

            const q = query(
                scoresRef,
                orderBy('speed', 'desc'),
                limit(limitCount)
            );

            const querySnapshot = await getDocs(q);
            const leaderboard = [];
            let rank = 1;

            querySnapshot.forEach((doc) => {
                const data = doc.data();
                if (data.username && data.username !== 'Anonymous') {
                    leaderboard.push({
                        rank: rank++,
                        userId: doc.id,
                        username: data.username,
                        speed: data.speed,
                        time: data.time,
                        grade: data.grade,
                        timestamp: data.timestamp
                    });
                }
            });

            this.cache.set(cacheKey, {
                data: leaderboard,
                timestamp: Date.now()
            });

            return leaderboard;

        } catch (error) {
            console.error('Error fetching speed leaderboard:', error);
            return [];
        }
    }

    /**
     * Get longest time leaderboard for a specific level
     */
    async getLongestTimeLeaderboard(levelNumber, limitCount = 50) {
        if (!this.firebaseManager.isInitialized()) {
            return [];
        }

        const cacheKey = `longestTime_level${levelNumber}`;

        if (this.cache.has(cacheKey)) {
            const cached = this.cache.get(cacheKey);
            if (Date.now() - cached.timestamp < this.cacheExpiry) {
                return cached.data;
            }
        }

        try {
            const leaderboardPath = `leaderboards/level${levelNumber}/longestTimes`;
            const scoresRef = collection(this.db, leaderboardPath);

            const q = query(
                scoresRef,
                orderBy('time', 'desc'),
                limit(limitCount)
            );

            const querySnapshot = await getDocs(q);
            const leaderboard = [];
            let rank = 1;

            querySnapshot.forEach((doc) => {
                const data = doc.data();
                if (data.username && data.username !== 'Anonymous') {
                    leaderboard.push({
                        rank: rank++,
                        userId: doc.id,
                        username: data.username,
                        time: data.time,
                        score: data.score,
                        grade: data.grade,
                        timestamp: data.timestamp
                    });
                }
            });

            this.cache.set(cacheKey, {
                data: leaderboard,
                timestamp: Date.now()
            });

            return leaderboard;

        } catch (error) {
            console.error('Error fetching longest time leaderboard:', error);
            return [];
        }
    }

    /**
     * Get shortest time leaderboard for a specific level
     */
    async getShortestTimeLeaderboard(levelNumber, limitCount = 50) {
        if (!this.firebaseManager.isInitialized()) {
            return [];
        }

        const cacheKey = `shortestTime_level${levelNumber}`;

        if (this.cache.has(cacheKey)) {
            const cached = this.cache.get(cacheKey);
            if (Date.now() - cached.timestamp < this.cacheExpiry) {
                return cached.data;
            }
        }

        try {
            const leaderboardPath = `leaderboards/level${levelNumber}/shortestTimes`;
            const scoresRef = collection(this.db, leaderboardPath);

            const q = query(
                scoresRef,
                orderBy('time', 'asc'),
                limit(limitCount)
            );

            const querySnapshot = await getDocs(q);
            const leaderboard = [];
            let rank = 1;

            querySnapshot.forEach((doc) => {
                const data = doc.data();
                if (data.username && data.username !== 'Anonymous') {
                    leaderboard.push({
                        rank: rank++,
                        userId: doc.id,
                        username: data.username,
                        time: data.time,
                        score: data.score,
                        grade: data.grade,
                        timestamp: data.timestamp
                    });
                }
            });

            this.cache.set(cacheKey, {
                data: leaderboard,
                timestamp: Date.now()
            });

            return leaderboard;

        } catch (error) {
            console.error('Error fetching shortest time leaderboard:', error);
            return [];
        }
    }

    /**
     * Get lowest score leaderboard for a specific level
     */
    async getLowestScoreLeaderboard(levelNumber, limitCount = 50) {
        if (!this.firebaseManager.isInitialized()) {
            return [];
        }

        const cacheKey = `lowestScore_level${levelNumber}`;

        if (this.cache.has(cacheKey)) {
            const cached = this.cache.get(cacheKey);
            if (Date.now() - cached.timestamp < this.cacheExpiry) {
                return cached.data;
            }
        }

        try {
            const leaderboardPath = `leaderboards/level${levelNumber}/lowestScores`;
            const scoresRef = collection(this.db, leaderboardPath);

            const q = query(
                scoresRef,
                orderBy('score', 'asc'),
                limit(limitCount)
            );

            const querySnapshot = await getDocs(q);
            const leaderboard = [];
            let rank = 1;

            querySnapshot.forEach((doc) => {
                const data = doc.data();
                if (data.username && data.username !== 'Anonymous') {
                    leaderboard.push({
                        rank: rank++,
                        userId: doc.id,
                        username: data.username,
                        score: data.score,
                        time: data.time,
                        grade: data.grade,
                        timestamp: data.timestamp
                    });
                }
            });

            this.cache.set(cacheKey, {
                data: leaderboard,
                timestamp: Date.now()
            });

            return leaderboard;

        } catch (error) {
            console.error('Error fetching lowest score leaderboard:', error);
            return [];
        }
    }

    /**
     * Clear cache (useful for forcing refresh)
     */
    clearCache() {
        this.cache.clear();
        console.log('Leaderboard cache cleared');
    }
}
