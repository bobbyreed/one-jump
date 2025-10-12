/**
 * Firebase Admin Cleanup Script - Remove Anonymous Leaderboard Entries
 *
 * This script uses Firebase Admin SDK to delete all leaderboard entries
 * where username is "Anonymous". Admin SDK bypasses security rules.
 *
 * ⚠️  SECURITY: TEMPORARY DOWNLOAD & DELETE WORKFLOW
 *
 * To avoid storing sensitive credentials in your repo, follow this workflow:
 *
 * 1. Download the service account key (temporary):
 *    - Go to Firebase Console > Project Settings > Service Accounts
 *    - Click "Generate New Private Key"
 *    - Save as 'firebase-service-account.json' in project root
 *
 * 2. Run the cleanup script:
 *    node scripts/cleanup-anonymous-scores-admin.js
 *
 * 3. IMMEDIATELY delete the key file:
 *    rm firebase-service-account.json
 *
 * 4. Verify deletion:
 *    ls firebase-service-account.json  (should show "No such file")
 *
 * The service account key grants full admin access to your Firebase project.
 * Never commit it to version control or leave it on your machine.
 */

import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize Firebase Admin
try {
    let serviceAccount;

    // Try to load service account from file
    try {
        serviceAccount = JSON.parse(
            readFileSync('./firebase-service-account.json', 'utf8')
        );
        console.log('✅ Loaded service account from firebase-service-account.json');
    } catch (fileError) {
        console.error('❌ Could not load firebase-service-account.json');
        console.error('\nTo use this script, you need to:');
        console.error('1. Go to Firebase Console: https://console.firebase.google.com/');
        console.error('2. Select your project');
        console.error('3. Go to Project Settings > Service Accounts');
        console.error('4. Click "Generate New Private Key"');
        console.error('5. Save the downloaded file as "firebase-service-account.json" in the project root');
        process.exit(1);
    }

    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: serviceAccount.project_id
    });

    console.log('🔧 Connected to Firebase project:', serviceAccount.project_id);
} catch (error) {
    console.error('❌ Failed to initialize Firebase Admin:', error.message);
    process.exit(1);
}

const db = admin.firestore();

/**
 * Delete Anonymous entries from a specific leaderboard path
 */
async function cleanupLeaderboard(path, leaderboardName) {
    console.log(`\n🔍 Checking ${leaderboardName}...`);

    try {
        const scoresRef = db.collection(path);
        const querySnapshot = await scoresRef.get();

        let deletedCount = 0;
        let totalCount = 0;
        const deletePromises = [];

        querySnapshot.forEach((document) => {
            totalCount++;
            const data = document.data();

            // Check if username is Anonymous or missing
            if (!data.username || data.username === 'Anonymous') {
                console.log(`  ❌ Deleting: ${document.id} (username: "${data.username || 'undefined'}")`);
                deletePromises.push(document.ref.delete());
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
        console.error(`  ❌ Error cleaning ${leaderboardName}:`, error.message);
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

// Run the cleanup
cleanupAllLeaderboards()
    .then(() => {
        console.log('\n========================================');
        console.log('⚠️  SECURITY REMINDER');
        console.log('========================================');
        console.log('Please IMMEDIATELY delete the service account key file:');
        console.log('');
        console.log('  rm firebase-service-account.json');
        console.log('');
        console.log('Then verify it\'s gone:');
        console.log('  ls firebase-service-account.json');
        console.log('');
        console.log('This file grants full admin access to your Firebase project.');
        console.log('========================================\n');
        console.log('👋 Exiting...');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ Fatal error:', error);
        console.error(error.stack);
        console.error('\n⚠️  SECURITY REMINDER: Delete firebase-service-account.json');
        process.exit(1);
    });
