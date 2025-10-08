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
     * Only submits if it's a new personal best
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
                username: scoreData.username || 'Anonymous',
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
                username: scoreData.username || 'Anonymous',
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
                leaderboard.push({
                    rank: rank++,
                    userId: doc.id,
                    username: data.username,
                    totalScore: data.totalScore,
                    levelsCompleted: data.levelsCompleted,
                    totalStars: data.totalStars,
                    timestamp: data.timestamp
                });
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
     * Clear cache (useful for forcing refresh)
     */
    clearCache() {
        this.cache.clear();
        console.log('Leaderboard cache cleared');
    }
}
