import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getDatabase, ref, onValue, off } from 'firebase/database';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL, // Make sure this is set!
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Validate Firebase configuration
const validateFirebaseConfig = () => {
  const requiredKeys = [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN', 
    'VITE_FIREBASE_DATABASE_URL',
    'VITE_FIREBASE_PROJECT_ID',
    'VITE_FIREBASE_STORAGE_BUCKET',
    'VITE_FIREBASE_MESSAGING_SENDER_ID',
    'VITE_FIREBASE_APP_ID'
  ];

  const missingKeys = requiredKeys.filter(key => !import.meta.env[key]);
  
  if (missingKeys.length > 0) {
    console.error('❌ Missing Firebase environment variables:', missingKeys);
    console.error('Please check your .env.local file and ensure all Firebase config values are set.');
    return false;
  }
  
  console.log('✅ All Firebase environment variables are set');
  return true;
};

// Initialize Firebase with error handling
let app, analytics, auth, db, googleProvider;

try {
  if (!validateFirebaseConfig()) {
    throw new Error('Firebase configuration is incomplete');
  }

  app = initializeApp(firebaseConfig);
  analytics = getAnalytics(app);
  auth = getAuth(app);
  db = getDatabase(app);
  googleProvider = new GoogleAuthProvider();

  console.log('✅ Firebase initialized successfully');

  // Test Realtime Database connection
  const connectedRef = ref(db, '.info/connected');
  onValue(connectedRef, (snapshot) => {
    if (snapshot.val() === true) {
      console.log('✅ Firebase Realtime Database connected');
    } else {
      console.warn('⚠️ Firebase Realtime Database disconnected - Check if Realtime Database is enabled in Firebase Console');
      console.info('📖 See FIREBASE_REALTIME_DATABASE_SETUP.md for setup instructions');
    }
  }, (error) => {
    console.warn('⚠️ Firebase Realtime Database connection failed:', error.message);
    console.info('📖 See FIREBASE_REALTIME_DATABASE_SETUP.md for setup instructions');
  });

} catch (error) {
  console.error('❌ Firebase initialization failed:', error);
  console.error('Please check your Firebase configuration and environment variables.');
  
  // Create fallback objects to prevent app crashes
  app = null;
  analytics = null;
  auth = null;
  db = null;
  googleProvider = null;
}

export { app, analytics, auth, db, googleProvider };
