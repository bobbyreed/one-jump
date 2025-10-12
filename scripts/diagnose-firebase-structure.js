/**
 * Firebase Structure Diagnostic Script
 *
 * This script helps diagnose the actual structure of your Firebase leaderboards
 * to understand why the cleanup script isn't finding entries.
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, getDoc } from 'firebase/firestore';
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

async function diagnoseStructure() {
    console.log('🔍 Diagnosing Firebase Structure');
    console.log('================================\n');

    // Try different possible structures
    console.log('Method 1: Checking leaderboards collection...');
    try {
        const leaderboardsRef = collection(db, 'leaderboards');
        const snapshot = await getDocs(leaderboardsRef);
        console.log(`  Found ${snapshot.size} documents in 'leaderboards' collection`);

        snapshot.forEach(doc => {
            console.log(`  Document ID: ${doc.id}`);
            console.log(`  Data:`, doc.data());
        });
    } catch (error) {
        console.log(`  ❌ Error:`, error.message);
    }

    console.log('\nMethod 2: Checking leaderboards/level1/scores...');
    try {
        const scoresRef = collection(db, 'leaderboards/level1/scores');
        const snapshot = await getDocs(scoresRef);
        console.log(`  Found ${snapshot.size} documents in 'leaderboards/level1/scores'`);

        let anonymousCount = 0;
        snapshot.forEach(doc => {
            const data = doc.data();
            console.log(`  - ${doc.id}: username="${data.username}", score=${data.score}`);
            if (!data.username || data.username === 'Anonymous') {
                anonymousCount++;
            }
        });
        console.log(`  Anonymous entries: ${anonymousCount}`);
    } catch (error) {
        console.log(`  ❌ Error:`, error.message);
    }

    console.log('\nMethod 3: Checking level1 collection directly...');
    try {
        const level1Ref = collection(db, 'level1');
        const snapshot = await getDocs(level1Ref);
        console.log(`  Found ${snapshot.size} documents in 'level1' collection`);

        let anonymousCount = 0;
        snapshot.forEach(doc => {
            const data = doc.data();
            console.log(`  - ${doc.id}: username="${data.username}", score=${data.score}`);
            if (!data.username || data.username === 'Anonymous') {
                anonymousCount++;
            }
        });
        console.log(`  Anonymous entries: ${anonymousCount}`);
    } catch (error) {
        console.log(`  ❌ Error:`, error.message);
    }

    console.log('\nMethod 4: Checking scores collection directly...');
    try {
        const scoresRef = collection(db, 'scores');
        const snapshot = await getDocs(scoresRef);
        console.log(`  Found ${snapshot.size} documents in 'scores' collection`);

        let anonymousCount = 0;
        snapshot.forEach(doc => {
            const data = doc.data();
            console.log(`  - ${doc.id}: username="${data.username}", score=${data.score}, level=${data.level || 'N/A'}`);
            if (!data.username || data.username === 'Anonymous') {
                anonymousCount++;
            }
        });
        console.log(`  Anonymous entries: ${anonymousCount}`);
    } catch (error) {
        console.log(`  ❌ Error:`, error.message);
    }

    console.log('\n================================');
    console.log('✅ Diagnosis complete!');
    console.log('\nPlease share the output above so we can determine the correct structure.');
}

// Run the diagnostic with authentication
async function main() {
    // First authenticate
    const authenticated = await authenticate();
    if (!authenticated) {
        console.error('\n❌ Cannot proceed without authentication');
        process.exit(1);
    }

    // Then run diagnosis
    await diagnoseStructure();
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
