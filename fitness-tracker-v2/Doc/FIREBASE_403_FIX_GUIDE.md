# 🔧 Firebase 403 Errors - Complete Fix Guide

## The Problem
Your Firebase 403 errors are caused by missing environment variables and incorrect database configuration. The project has been migrated from Firestore to Realtime Database, but the setup is incomplete.

## ✅ What I've Fixed

### 1. Updated Firebase Configuration (`apps/web/src/lib/firebase.ts`)
- ✅ Added environment variable validation
- ✅ Added connection testing for Realtime Database
- ✅ Added proper error handling
- ✅ Added fallback objects to prevent app crashes

### 2. Updated Firebase Project Configuration (`firebase.json`)
- ✅ Added Realtime Database rules configuration
- ✅ Maintained existing Firestore and hosting config

### 3. Created Realtime Database Rules (`database.rules.json`)
- ✅ Proper security rules for all collections
- ✅ Authentication required for all operations
- ✅ User ownership validation

## 🚨 What You Need to Do

### Step 1: Create Environment File
Create a file called `.env.local` in `fitness-tracker-v2/apps/web/` with your Firebase config:

```bash
# Copy this to fitness-tracker-v2/apps/web/.env.local
VITE_FIREBASE_API_KEY=your_actual_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://your_project_id.firebaseio.com
VITE_FIREBASE_PROJECT_ID=your_actual_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_actual_sender_id
VITE_FIREBASE_APP_ID=your_actual_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_actual_measurement_id
```

### Step 2: Get Your Firebase Configuration
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (or create one if you don't have one)
3. Go to **Project Settings** (gear icon) → **General**
4. Scroll to **"Your apps"** section
5. Click **"Add app"** → **Web app** (if you don't have one)
6. Copy the configuration values and replace the placeholders in `.env.local`

### Step 3: Enable Firebase Services
1. **Enable Authentication**:
   - Go to **Authentication** → **Sign-in method**
   - Enable **"Email/Password"**
   - Enable **"Google"** (optional)

2. **Enable Realtime Database**:
   - Go to **Realtime Database**
   - Click **"Create database"**
   - Choose **"Start in test mode"** (for development)
   - Select a location for your database
   - **IMPORTANT**: Copy the database URL (it should look like `https://your-project-id.firebaseio.com`)

3. **Set Up Security Rules**:
   - Go to **Realtime Database** → **Rules**
   - Copy the rules from `database.rules.json` (already created)
   - Paste them into the Firebase Console
   - Click **"Publish"**

### Step 4: Deploy Rules (Optional)
If you prefer to deploy via CLI:
```bash
cd fitness-tracker-v2
firebase deploy --only database:rules
```

## 🔍 How to Verify the Fix

### 1. Check Browser Console
After setting up the environment variables, you should see:
```
✅ All Firebase environment variables are set
✅ Firebase initialized successfully
✅ Firebase Realtime Database connected
```

### 2. Test Authentication
- Try creating a new account
- Try logging in
- Both should work without 403 errors

### 3. Test Data Operations
- Create a workout plan
- Start a workout
- Set a goal
- All operations should work without permission errors

## 🚨 Common Issues & Solutions

### Issue: "Missing Firebase environment variables"
**Solution**: Make sure `.env.local` exists and has all required variables

### Issue: "Firebase Realtime Database disconnected"
**Solution**: Check your `VITE_FIREBASE_DATABASE_URL` - it should be `https://your-project-id.firebaseio.com`

### Issue: "Permission denied" errors
**Solution**: 
1. Make sure Realtime Database is enabled
2. Make sure security rules are published
3. Make sure user is authenticated

### Issue: "Failed to create account"
**Solution**: Check that Authentication is enabled and configured properly

## 📁 Files Modified

1. `apps/web/src/lib/firebase.ts` - Added validation and error handling
2. `firebase.json` - Added Realtime Database configuration
3. `database.rules.json` - Created security rules for Realtime Database

## 🎯 Expected Result

After completing these steps:
- ✅ No more 403 errors
- ✅ Authentication works properly
- ✅ Data operations work without permission issues
- ✅ Real-time synchronization works
- ✅ Console shows successful Firebase connection

## 🆘 Still Having Issues?

If you're still getting 403 errors after following this guide:

1. **Check the browser console** for specific error messages
2. **Verify your Firebase project** has all services enabled
3. **Double-check environment variables** are correctly set
4. **Test with a simple Firebase operation** to isolate the issue

The most common cause is missing or incorrect `VITE_FIREBASE_DATABASE_URL` - make sure it matches your Firebase project's Realtime Database URL exactly.
