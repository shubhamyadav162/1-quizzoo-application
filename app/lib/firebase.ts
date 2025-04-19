/**
 * DEPRECATED: This file is maintained only for backward compatibility.
 * The app has been migrated to Supabase. This file provides mock implementations
 * to avoid breaking changes during the transition.
 */

// Mock Firebase implementations to prevent errors
const mockUser = {
  uid: '',
  email: '',
  displayName: '',
  emailVerified: false
};

const mockAuth = {
  currentUser: null,
  onAuthStateChanged: (callback) => {
    // Return an unsubscribe function
    return () => {};
  },
  signInWithEmailAndPassword: async () => {
    console.warn('Firebase auth is deprecated. Using Supabase instead.');
    throw new Error('Firebase auth is deprecated. Using Supabase instead.');
  },
  createUserWithEmailAndPassword: async () => {
    console.warn('Firebase auth is deprecated. Using Supabase instead.');
    throw new Error('Firebase auth is deprecated. Using Supabase instead.');
  },
  signOut: async () => {
    console.warn('Firebase auth is deprecated. Using Supabase instead.');
  }
};

// Export mock implementations
export const auth = mockAuth; 