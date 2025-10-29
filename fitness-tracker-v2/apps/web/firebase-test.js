// Firebase Connection Test Script
// Run this in your browser console to test Firebase connection

console.log('🧪 Testing Firebase Connection...');

// Check if Firebase is initialized
if (typeof window !== 'undefined' && window.firebase) {
  console.log('✅ Firebase SDK loaded');
} else {
  console.log('❌ Firebase SDK not loaded');
}

// Check environment variables
const requiredEnvVars = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_DATABASE_URL',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID'
];

console.log('🔍 Checking environment variables...');
requiredEnvVars.forEach(varName => {
  const value = import.meta.env[varName];
  if (value && value !== 'your_api_key_here' && !value.includes('your_')) {
    console.log(`✅ ${varName}: Set`);
  } else {
    console.log(`❌ ${varName}: Missing or placeholder`);
  }
});

// Test database connection
console.log('🔗 Testing Realtime Database connection...');
if (window.db) {
  const connectedRef = window.db.ref('.info/connected');
  connectedRef.on('value', (snapshot) => {
    if (snapshot.val() === true) {
      console.log('✅ Realtime Database connected');
    } else {
      console.log('❌ Realtime Database disconnected');
    }
  });
} else {
  console.log('❌ Database reference not available');
}

// Test authentication
console.log('🔐 Testing authentication...');
if (window.auth) {
  console.log('✅ Auth service available');
  console.log('Current user:', window.auth.currentUser ? 'Logged in' : 'Not logged in');
} else {
  console.log('❌ Auth service not available');
}

console.log('🏁 Firebase connection test complete!');
