# Firebase Realtime Database Setup Guide

## Issue: Realtime Database Disconnected

The error `❌ Firebase Realtime Database disconnected` occurs because Realtime Database is not enabled in your Firebase project.

## Quick Fix Steps:

### 1. Enable Realtime Database in Firebase Console
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. In the left sidebar, click **"Realtime Database"**
4. Click **"Create Database"**
5. Choose **"Start in test mode"** (for development)
6. Select a location (choose closest to your users)
7. Click **"Done"**

### 2. Get Your Database URL
1. After creating the database, you'll see a URL like:
   `https://your-project-id-default-rtdb.firebaseio.com/`
2. Copy this URL

### 3. Update Your Environment Variables
Add this to your `.env.local` file:
```
VITE_FIREBASE_DATABASE_URL=https://your-project-id-default-rtdb.firebaseio.com/
```

### 4. Set Up Security Rules (Important!)
1. In Firebase Console → Realtime Database → Rules
2. Replace the default rules with:

```json
{
  "rules": {
    "workoutPlans": {
      ".read": "auth != null",
      ".write": "auth != null",
      "$planId": {
        ".validate": "newData.hasChildren(['name', 'difficulty', 'exercises']) && newData.child('createdBy').val() == auth.uid"
      }
    },
    "workouts": {
      ".read": "auth != null",
      ".write": "auth != null",
      "$workoutId": {
        ".validate": "newData.child('userId').val() == auth.uid"
      }
    },
    "goals": {
      ".read": "auth != null",
      ".write": "auth != null",
      "$goalId": {
        ".validate": "newData.child('userId').val() == auth.uid"
      }
    },
    "personalRecords": {
      ".read": "auth != null",
      ".write": "auth != null",
      "$recordId": {
        ".validate": "newData.child('userId').val() == auth.uid"
      }
    },
    "users": {
      "$userId": {
        ".read": "auth != null && auth.uid == $userId",
        ".write": "auth != null && auth.uid == $userId"
      }
    }
  }
}
```

### 5. Restart Your Development Server
```bash
# Stop the current server (Ctrl+C)
# Then restart:
pnpm dev
```

## Alternative: Disable Realtime Database Check

If you don't need Realtime Database right now, you can disable the connection check by commenting out lines 60-67 in `firebase.ts`.

## Verification

After setup, you should see:
```
✅ Firebase initialized successfully
✅ Firebase Realtime Database connected
```

Instead of:
```
✅ Firebase initialized successfully
❌ Firebase Realtime Database disconnected
```
