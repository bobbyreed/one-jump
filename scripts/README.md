# Cleanup Scripts

## Troubleshooting Journey & Lessons Learned

This section documents the challenges encountered while developing these cleanup scripts, serving as a reference for future Firebase administrative tasks.

### Challenge 1: Invalid Resource Field Value Errors

**Problem:** Initial script attempts resulted in `INVALID_ARGUMENT: Invalid resource field value in the request` errors, and the script reported finding 0 documents despite knowing Anonymous entries existed in the database.

**Root Cause:** Firebase Firestore requires authentication before allowing access to collections, even for read operations. The script was trying to query Firestore without authenticating first.

**Solution:**
- Added Firebase Authentication using `signInAnonymously()`
- Imported `getAuth` and `signInAnonymously` from `firebase/auth`
- Modified script execution flow to authenticate before querying

### Challenge 2: Environment Variables Not Loading

**Problem:** After adding `dotenv.config()`, the script showed `[dotenv@17.2.3] injecting env (0) from .env`, indicating 0 variables were loaded, causing Firebase initialization to fail.

**Root Cause:** The `.env` file didn't exist in the project root. Only `.env.example` existed with the Firebase configuration values.

**Solution:**
- Created `.env` file by copying `.env.example`: `cp .env.example .env`
- This allowed `dotenv` to load the `VITE_FIREBASE_*` environment variables needed for Firebase initialization

### Challenge 3: Permission Denied on Delete Operations

**Problem:** After authentication was working, the script could successfully read and identify Anonymous entries, but deletion operations failed with:
```
7 PERMISSION_DENIED: Missing or insufficient permissions
```

**Root Cause:** Firebase Client SDK (used in the original script) respects Firestore security rules. While the rules allow authenticated users to read leaderboard data, they don't allow deletion of other users' documents (which is correct for client-side security). Anonymous authentication doesn't grant administrative privileges.

**Solution:**
- Switched to **Firebase Admin SDK** (`firebase-admin` package)
- Admin SDK bypasses security rules and is designed for server-side administrative tasks
- Requires a service account key file with elevated permissions
- Created new script: `cleanup-anonymous-scores-admin.js`

### Key Takeaways

1. **Client SDK vs Admin SDK:**
   - **Client SDK** (`firebase`): Respects security rules, meant for browser/app usage
   - **Admin SDK** (`firebase-admin`): Bypasses security rules, meant for trusted server environments and administrative tasks

2. **Authentication is Required:** Even for read operations in Firestore, authentication is typically required based on security rules.

3. **Environment Variables in Node.js:** Scripts need `dotenv` package and a `.env` file to load environment variables that work with `process.env`.

4. **Security Rules are Working:** The permission denial was actually a sign that security rules were properly protecting user data. Administrative operations require elevated permissions via Admin SDK.

---

## cleanup-anonymous-scores-admin.js (RECOMMENDED)

This script removes all "Anonymous" entries from your Firebase leaderboards using the Firebase Admin SDK, which has the necessary permissions to delete documents.

### Prerequisites

- Node.js installed
- Firebase Admin access (to download service account key)

### ⚠️ SECURITY: Temporary Download & Delete Workflow

**Important:** The service account key grants **full administrative access** to your entire Firebase project. To minimize security risk, follow this workflow:

#### Step 1: Download Service Account Key (Temporary)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (`one-jump-cc51f`)
3. Go to **Project Settings** (gear icon) > **Service Accounts** tab
4. Click **"Generate New Private Key"**
5. Confirm by clicking **"Generate Key"**
6. Save the downloaded JSON file as `firebase-service-account.json` in the **project root** (same directory as `package.json`)

#### Step 2: Run the Cleanup Script

```bash
node scripts/cleanup-anonymous-scores-admin.js
```

The script will:
- Connect to Firebase using the service account
- Scan all 10 level leaderboards + global leaderboard
- Delete all entries where username is "Anonymous" or undefined
- Display a summary of deletions

#### Step 3: IMMEDIATELY Delete the Key File

**This is critical!** As soon as the script completes, delete the service account file:

```bash
rm firebase-service-account.json
```

#### Step 4: Verify Deletion

Confirm the file is gone:

```bash
ls firebase-service-account.json
```

You should see: `ls: cannot access 'firebase-service-account.json': No such file or directory`

### Why This Workflow?

- **No permanent credentials:** The key exists on your machine only during cleanup
- **No git risk:** File is deleted before you can accidentally commit it
- **Minimal exposure:** Credentials are only available for a few minutes
- **One-time use:** Perfect for administrative tasks that run rarely

### Expected Output

```
🔧 Connected to Firebase project: one-jump-cc51f
🧹 Starting Firebase Leaderboard Cleanup
========================================

🔍 Checking Level 1...
  ❌ Deleting: abc123 (username: "Anonymous")
  ❌ Deleting: def456 (username: "Anonymous")
  ✅ Deleted 2 of 15 entries from Level 1

🔍 Checking Level 2...
  ✨ No Anonymous entries found in Level 2

... (continues for all levels)

========================================
📊 Cleanup Summary:
   Total entries scanned: 450
   Anonymous entries deleted: 87
   Clean entries remaining: 363
========================================
✅ Cleanup complete!

========================================
⚠️  SECURITY REMINDER
========================================
Please IMMEDIATELY delete the service account key file:

  rm firebase-service-account.json

Then verify it's gone:
  ls firebase-service-account.json

This file grants full admin access to your Firebase project.
========================================

👋 Exiting...
```

**Important:** Follow the security reminder and delete the key file immediately!

### Safety

- The script only deletes entries where username is "Anonymous" or missing
- Named user entries are never touched
- All deletions are logged to the console
- You can review the console output before running the script in production

### Note

After running this script, the LeaderboardManager will automatically prevent new "Anonymous" entries from being saved. Users must set a username before their scores will be submitted to leaderboards.

---

## cleanup-anonymous-scores.js (Legacy - Read Only)

This is the original client SDK version of the cleanup script. It can read and list Anonymous entries but **cannot delete them** due to Firebase security rules (which is correct for client-side security). Use the admin version above for actual cleanup.

This script is kept for reference and can be used to preview what would be deleted without actually making changes.
