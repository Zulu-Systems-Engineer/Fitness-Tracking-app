# Firebase Setup for Fitness Tracker

This project has been configured to use Firebase for data persistence. All mock data has been removed and replaced with Firebase services.

## What's Been Implemented

✅ **Firebase Configuration**
- Firebase app initialization
- Firestore database setup
- Authentication service
- Storage service

✅ **Data Services**
- `workoutPlanService` - CRUD operations for workout plans
- `workoutService` - CRUD operations for workouts
- `goalService` - CRUD operations for goals
- `recordService` - CRUD operations for personal records

✅ **Authentication**
- Firebase Auth integration
- User registration and login
- Persistent sessions
- User context management

✅ **Data Persistence**
- All data is now saved to Firestore
- Data persists across page refreshes
- Real-time updates when data changes

## Setup Instructions

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or select existing project
3. Follow the setup wizard

### 2. Enable Authentication

1. In Firebase Console, go to "Authentication" > "Sign-in method"
2. Enable "Email/Password" provider
3. Enable "Google" provider
4. Configure Google provider:
   - Add your project's support email
   - Add authorized domains (e.g., localhost for development, your domain for production)
5. Save changes

### 3. Enable Firestore Database

1. In Firebase Console, go to "Firestore Database"
2. Click "Create database"
3. Choose "Start in test mode" (for development)
4. Select a location for your database

### 4. Configure Security Rules

In Firestore > Rules, replace the default rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /workoutPlans/{document} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.createdBy;
    }
    match /workouts/{document} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
    match /goals/{document} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
    match /personalRecords/{document} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
  }
}
```

### 5. Get Firebase Config

1. In Firebase Console, go to Project Settings > General
2. Scroll down to "Your apps" section
3. Click the web icon (`</>`) to add a web app
4. Register your app with a nickname
5. Copy the Firebase configuration object

### 6. Set Environment Variables

1. Copy `firebase-config-example.txt` to `.env.local`
2. Replace the placeholder values with your actual Firebase config:

```env
VITE_FIREBASE_API_KEY=your_actual_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_actual_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_actual_sender_id
VITE_FIREBASE_APP_ID=your_actual_app_id
```

### 7. Start the Development Server

```bash
cd apps/web
pnpm run dev
```

## Features Now Available

### ✅ Data Persistence
- All workout plans, workouts, goals, and records are saved to Firestore
- Data persists across browser refreshes and sessions
- No more mock data - everything is real!

### ✅ User Authentication
- Real user registration and login
- Secure user sessions
- User-specific data isolation

### ✅ Real-time Updates
- Changes are immediately saved to the database
- Data syncs across different browser tabs
- Offline support (with Firebase offline persistence)

### ✅ CRUD Operations
- **Create**: Add new workout plans, start workouts, set goals
- **Read**: View all your data with proper loading states
- **Update**: Edit plans, log workout sets, update goals
- **Delete**: Remove plans, workouts, and goals

## Data Structure

The app uses the following Firestore collections:

- `workoutPlans` - User-created workout plans
- `workouts` - Individual workout sessions
- `goals` - User fitness goals
- `personalRecords` - Personal best records

All data is automatically associated with the authenticated user and secured with Firestore security rules.

## Testing Data Persistence

1. Create a new workout plan
2. Start a workout from that plan
3. Log some sets
4. Refresh the page
5. Your data should still be there! 🎉

## Troubleshooting

### Common Issues

1. **"Firebase config not found"** - Make sure `.env.local` exists with correct values
2. **"Permission denied"** - Check Firestore security rules
3. **"User not authenticated"** - Ensure user is logged in before accessing data
4. **"Network error"** - Check Firebase project configuration

### Development vs Production

- **Development**: Uses test mode Firestore rules (anyone can read/write)
- **Production**: Uses secure rules (users can only access their own data)

For production deployment, make sure to:
1. Update Firestore security rules
2. Configure proper Firebase project settings
3. Set up proper environment variables
4. Test all functionality thoroughly

## Next Steps

The app is now fully functional with Firebase! You can:

1. **Deploy to production** using Vercel, Netlify, or similar
2. **Add more features** like real-time collaboration
3. **Implement push notifications** for workout reminders
4. **Add data analytics** and insights
5. **Create mobile apps** using the same Firebase backend

Happy coding! 🚀
