import React from 'react';

export const DebugInfo: React.FC = () => {
  const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
  };

  const isConfigured = Object.values(firebaseConfig).every(value => value && value !== 'demo-key' && !value.includes('123456789'));

  // Show debug info only in development
  if (process.env.NODE_ENV === 'production') {
    return null; // Don't show debug info in production
  }

  return (
    <div className="fixed bottom-4 right-4 bg-red-900/95 text-white p-4 rounded-lg text-xs max-w-sm z-50 border-2 border-red-500 shadow-lg">
      <h3 className="font-bold mb-2 text-red-200">🚨 Firebase Debug Info</h3>
      <div className="space-y-1">
        <div>API Key: {firebaseConfig.apiKey ? '✅ Set' : '❌ Missing'}</div>
        <div>Auth Domain: {firebaseConfig.authDomain || '❌ Missing'}</div>
        <div>Project ID: {firebaseConfig.projectId || '❌ Missing'}</div>
        <div>Storage Bucket: {firebaseConfig.storageBucket || '❌ Missing'}</div>
        <div>Sender ID: {firebaseConfig.messagingSenderId ? '✅ Set' : '❌ Missing'}</div>
        <div>App ID: {firebaseConfig.appId ? '✅ Set' : '❌ Missing'}</div>
        <div className="mt-2 font-bold text-red-300">
          Status: {isConfigured ? '✅ Configured' : '❌ Not Configured'}
        </div>
        {!isConfigured && (
          <div className="mt-2 text-yellow-300 text-xs">
            ⚠️ Set environment variables and redeploy to fix account creation
          </div>
        )}
      </div>
    </div>
  );
};
