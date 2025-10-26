# 🔧 Troubleshooting Guide

## "Failed to create account. Please try again." Error

This error can occur for several reasons. Follow these steps to diagnose and fix the issue:

### 🔍 **Step 1: Check Browser Console**

1. Open your deployed app
2. Press `F12` to open Developer Tools
3. Go to the **Console** tab
4. Try to create an account
5. Look for error messages that start with:
   - `Firebase Config:`
   - `Signup error details:`
   - `Firebase Error Code:`

### 🛠️ **Step 2: Verify Firebase Configuration**

Check if your environment variables are properly set:

**Expected Console Output:**
```
Firebase Config: {
  apiKey: "Set",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "Set",
  appId: "Set"
}
```

**If you see "Missing" or "demo-key":**
- Your environment variables are not set
- See **Step 3** below

### 🔧 **Step 3: Set Environment Variables**

#### For Vercel Deployment:
1. Go to your Vercel dashboard
2. Select your project
3. Go to **Settings** > **Environment Variables**
4. Add these variables:
   ```
   VITE_FIREBASE_API_KEY=your_actual_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_actual_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_actual_sender_id
   VITE_FIREBASE_APP_ID=your_actual_app_id
   ```
5. **Redeploy** your project

#### For Netlify Deployment:
1. Go to your Netlify dashboard
2. Select your site
3. Go to **Site settings** > **Environment variables**
4. Add the same variables as above
5. **Redeploy** your site

#### For Firebase Hosting:
1. Create a `.env.production` file in your project root
2. Add the environment variables
3. Update your build process to include the file

### 🔐 **Step 4: Verify Firebase Authentication Setup**

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Authentication** > **Sign-in method**
4. Ensure **Email/Password** is enabled
5. Check **Authorized domains**:
   - Add your production domain
   - Add `localhost` for testing

### 🚨 **Step 5: Common Error Codes & Solutions**

#### `auth/email-already-in-use`
- **Solution**: User already exists, try logging in instead

#### `auth/invalid-email`
- **Solution**: Check email format

#### `auth/weak-password`
- **Solution**: Password must be at least 6 characters

#### `auth/network-request-failed`
- **Solution**: Check internet connection and Firebase project status

#### `auth/too-many-requests`
- **Solution**: Wait a few minutes before trying again

#### `auth/operation-not-allowed`
- **Solution**: Email/Password authentication is not enabled in Firebase Console

#### `auth/invalid-api-key`
- **Solution**: Check your Firebase API key in environment variables

### 🔍 **Step 6: Debug Mode**

The app now includes detailed logging. Check the console for:

1. **Firebase Configuration Status**
2. **Signup Process Steps**
3. **Specific Error Details**

### 📱 **Step 7: Test Different Scenarios**

1. **Test with a new email** (never used before)
2. **Test with a strong password** (8+ characters)
3. **Test Google sign-in** (if configured)
4. **Test on different browsers**

### 🆘 **Step 8: Still Having Issues?**

If the problem persists:

1. **Check Firebase Console**:
   - Go to Authentication > Users
   - See if users are being created despite the error

2. **Check Network Tab**:
   - Look for failed API requests
   - Check if Firebase endpoints are reachable

3. **Verify Project ID**:
   - Make sure you're using the correct Firebase project
   - Check if the project is active and not suspended

4. **Check Billing**:
   - Ensure your Firebase project has billing enabled
   - Free tier has some limitations

### 🎯 **Quick Fix Checklist**

- [ ] Environment variables are set correctly
- [ ] Firebase project is active
- [ ] Email/Password authentication is enabled
- [ ] Authorized domains include your production URL
- [ ] Password is at least 6 characters
- [ ] Email format is valid
- [ ] No typos in Firebase configuration
- [ ] Project has been redeployed after config changes

### 📞 **Need More Help?**

If you're still stuck, please share:
1. The console error messages
2. Your deployment platform (Vercel, Netlify, etc.)
3. Your Firebase project ID (without sensitive details)
4. The specific error code from the console

This will help provide more targeted assistance!
