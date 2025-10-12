/**
 * Firebase Cleanup Script - Remove Anonymous Leaderboard Entries
 *
 * This script removes all leaderboard entries where username is "Anonymous"
 * from both individual level leaderboards and the global leaderboard.
 *
 * Usage:
 * 1. Make sure Firebase is properly configured in your project
 * 2. Run: node scripts/cleanup-anonymous-scores.js
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { getAuth, signInAnonymously } from 'firebase/auth';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Firebase configuration
const firebaseConfig = {
    apiKey: process.env.VITE_FIREBASE_API_KEY,
    authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.VITE_FIREBASE_APP_ID
};

// Validate configuration
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
    console.error('❌ Firebase configuration is missing!');
    console.error('Please ensure your .env file contains all required VITE_FIREBASE_* variables');
    process.exit(1);
}

console.log('🔧 Connecting to Firebase project:', firebaseConfig.projectId);

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Authenticate before accessing Firestore
async function authenticate() {
    try {
        const userCredential = await signInAnonymously(auth);
        console.log('✅ Authenticated successfully:', userCredential.user.uid);
        return true;
    } catch (error) {
        console.error('❌ Authentication failed:', error.message);
        return false;
    }
}

/**
 * Delete Anonymous entries from a specific leaderboard path
 */
async function cleanupLeaderboard(path, leaderboardName) {
    console.log(`\n🔍 Checking ${leaderboardName}...`);

    try {
        const scoresRef = collection(db, path);
        const querySnapshot = await getDocs(scoresRef);

        let deletedCount = 0;
        let totalCount = 0;
        const deletePromises = [];

        querySnapshot.forEach((document) => {
            totalCount++;
            const data = document.data();

            // Check if username is Anonymous or missing
            if (!data.username || data.username === 'Anonymous') {
                console.log(`  ❌ Deleting: ${document.id} (username: "${data.username || 'undefined'}")`);
                const docRef = doc(db, path, document.id);
                deletePromises.push(deleteDoc(docRef));
                deletedCount++;
            }
        });

        // Execute all deletions
        if (deletePromises.length > 0) {
            await Promise.all(deletePromises);
            console.log(`  ✅ Deleted ${deletedCount} of ${totalCount} entries from ${leaderboardName}`);
        } else {
            console.log(`  ✨ No Anonymous entries found in ${leaderboardName}`);
        }

        return { deleted: deletedCount, total: totalCount };

    } catch (error) {
        console.error(`  ❌ Error cleaning ${leaderboardName}:`, error);
        return { deleted: 0, total: 0 };
    }
}

/**
 * Main cleanup function
 */
async function cleanupAllLeaderboards() {
    console.log('🧹 Starting Firebase Leaderboard Cleanup');
    console.log('========================================');

    let totalDeleted = 0;
    let totalScanned = 0;

    // Clean up all 10 level leaderboards
    for (let level = 1; level <= 10; level++) {
        const path = `leaderboards/level${level}/scores`;
        const result = await cleanupLeaderboard(path, `Level ${level}`);
        totalDeleted += result.deleted;
        totalScanned += result.total;
    }

    // Clean up global leaderboard
    const globalResult = await cleanupLeaderboard('leaderboards/global/scores', 'Global Leaderboard');
    totalDeleted += globalResult.deleted;
    totalScanned += globalResult.total;

    // Final summary
    console.log('\n========================================');
    console.log('📊 Cleanup Summary:');
    console.log(`   Total entries scanned: ${totalScanned}`);
    console.log(`   Anonymous entries deleted: ${totalDeleted}`);
    console.log(`   Clean entries remaining: ${totalScanned - totalDeleted}`);
    console.log('========================================');
    console.log('✅ Cleanup complete!');
}

// Run the cleanup with authentication
async function main() {
    // First authenticate
    const authenticated = await authenticate();
    if (!authenticated) {
        console.error('\n❌ Cannot proceed without authentication');
        process.exit(1);
    }

    // Then run cleanup
    await cleanupAllLeaderboards();
}

main()
    .then(() => {
        console.log('\n👋 Exiting...');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ Fatal error:', error);
        console.error(error.stack);
        process.exit(1);
    });
