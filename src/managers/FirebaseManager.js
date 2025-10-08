import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';

export default class FirebaseManager {
    constructor() {
        this.app = null;
        this.auth = null;
        this.db = null;
        this.currentUser = null;
        this.initialized = false;
    }

    async initialize() {
        if (this.initialized) {
            console.warn('Firebase already initialized');
            return;
        }

        try {
            // Get Firebase config from environment variables
            const firebaseConfig = {
                apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
                authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
                projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
                storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
                messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
                appId: import.meta.env.VITE_FIREBASE_APP_ID
            };

            // Validate config
            if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
                console.warn('Firebase config missing. Leaderboard features will be disabled.');
                return false;
            }

            // Initialize Firebase
            this.app = initializeApp(firebaseConfig);
            this.auth = getAuth(this.app);
            this.db = getFirestore(this.app);

            // Enable offline persistence
            try {
                await enableIndexedDbPersistence(this.db);
                console.log('Firebase offline persistence enabled');
            } catch (err) {
                if (err.code === 'failed-precondition') {
                    console.warn('Multiple tabs open, persistence enabled in first tab only');
                } else if (err.code === 'unimplemented') {
                    console.warn('Browser does not support persistence');
                }
            }

            // Set up auth state listener
            onAuthStateChanged(this.auth, (user) => {
                this.currentUser = user;
                if (user) {
                    console.log('User authenticated:', user.uid);
                } else {
                    console.log('User signed out');
                }
            });

            // Sign in anonymously if not signed in
            if (!this.auth.currentUser) {
                await this.signInAnonymously();
            }

            this.initialized = true;
            console.log('Firebase initialized successfully');
            return true;

        } catch (error) {
            console.error('Firebase initialization error:', error);
            return false;
        }
    }

    async signInAnonymously() {
        try {
            const userCredential = await signInAnonymously(this.auth);
            this.currentUser = userCredential.user;
            console.log('Signed in anonymously:', this.currentUser.uid);
            return this.currentUser;
        } catch (error) {
            console.error('Anonymous sign-in error:', error);
            throw error;
        }
    }

    getCurrentUser() {
        return this.currentUser;
    }

    getUserId() {
        return this.currentUser?.uid || null;
    }

    getFirestore() {
        return this.db;
    }

    getAuth() {
        return this.auth;
    }

    isInitialized() {
        return this.initialized;
    }

    // Sign out (useful for testing or if user wants to reset)
    async signOut() {
        try {
            await this.auth.signOut();
            this.currentUser = null;
            console.log('User signed out');
        } catch (error) {
            console.error('Sign out error:', error);
            throw error;
        }
    }
}
