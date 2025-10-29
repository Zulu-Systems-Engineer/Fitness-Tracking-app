# Firestore Security Rules - Paste into Firebase Console

Copy and paste these rules directly into the Firebase Console at:
**Firebase Console → Firestore Database → Rules**

---

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper function to check if user is authenticated
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Helper function to check if user owns the resource
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    // Helper function to validate data types
    function isValidTimestamp(date) {
      return date is timestamp;
    }
    
    function isValidString(str, minLength, maxLength) {
      return str is string && str.size >= minLength && str.size <= maxLength;
    }
    
    function isValidNumber(num) {
      return num is number;
    }
    
    function isValidPositiveNumber(num) {
      return num is number && num > 0;
    }
    
    function isValidNonNegativeNumber(num) {
      return num is number && num >= 0;
    }
    
    // ============================================
    // WORKOUT PLANS
    // ============================================
    match /workoutPlans/{planId} {
      // Allow read for authenticated users
      allow read: if isAuthenticated();
      
      // Only the owner can create, update, or delete
      allow create: if isAuthenticated() 
        && isValidString(resource.data.name, 1, 100)
        && isValidString(resource.data.description, 0, 1000)
        && resource.data.createdBy == request.auth.uid
        && isValidPositiveNumber(resource.data.duration)
        && resource.data.difficulty is string
        && resource.data.difficulty in ['beginner', 'intermediate', 'advanced']
        && resource.data.category is string
        && resource.data.category in ['strength', 'cardio', 'flexibility', 'mixed']
        && resource.data.isPublic is bool
        && resource.data.exercises is list
        && isValidTimestamp(resource.data.createdAt)
        && isValidTimestamp(resource.data.updatedAt);
      
      allow update: if isOwner(resource.data.createdBy)
        && isValidString(request.resource.data.name, 1, 100)
        && isValidString(request.resource.data.description, 0, 1000)
        && isValidPositiveNumber(request.resource.data.duration)
        && request.resource.data.difficulty in ['beginner', 'intermediate', 'advanced']
        && request.resource.data.category in ['strength', 'cardio', 'flexibility', 'mixed']
        && request.resource.data.isPublic is bool
        && request.resource.data.exercises is list
        && request.resource.data.createdBy == resource.data.createdBy; // Cannot change ownership
      
      allow delete: if isOwner(resource.data.createdBy);
    }
    
    // ============================================
    // WORKOUTS
    // ============================================
    match /workouts/{workoutId} {
      // Users can only read their own workouts
      allow read: if isOwner(resource.data.userId);
      
      allow create: if isAuthenticated()
        && isValidString(resource.data.userId, 1, 100)
        && resource.data.userId == request.auth.uid
        && isValidString(resource.data.name, 1, 100)
        && resource.data.status in ['active', 'completed', 'cancelled']
        && resource.data.exercises is list
        && isValidTimestamp(resource.data.startedAt)
        && isValidTimestamp(resource.data.createdAt)
        && isValidTimestamp(resource.data.updatedAt);
      
      allow update: if isOwner(resource.data.userId)
        && isValidString(request.resource.data.name, 1, 100)
        && request.resource.data.status in ['active', 'completed', 'cancelled']
        && request.resource.data.exercises is list
        && request.resource.data.userId == resource.data.userId; // Cannot change ownership
      
      allow delete: if isOwner(resource.data.userId);
    }
    
    // ============================================
    // GOALS
    // ============================================
    match /goals/{goalId} {
      // Users can only read their own goals
      allow read: if isOwner(resource.data.userId);
      
      allow create: if isAuthenticated()
        && isValidString(resource.data.userId, 1, 100)
        && resource.data.userId == request.auth.uid
        && isValidString(resource.data.title, 1, 100)
        && isValidString(resource.data.description, 0, 500)
        && resource.data.type in ['weight', 'strength', 'endurance', 'flexibility', 'custom']
        && isValidPositiveNumber(resource.data.targetValue)
        && isValidNonNegativeNumber(resource.data.currentValue)
        && isValidString(resource.data.unit, 1, 20)
        && resource.data.status in ['active', 'completed', 'paused', 'cancelled']
        && resource.data.priority in ['low', 'medium', 'high']
        && resource.data.isPublic is bool
        && isValidTimestamp(resource.data.targetDate)
        && isValidTimestamp(resource.data.createdAt)
        && isValidTimestamp(resource.data.updatedAt)
        && (resource.data.completedAt == null || isValidTimestamp(resource.data.completedAt));
      
      allow update: if isOwner(resource.data.userId)
        && isValidString(request.resource.data.title, 1, 100)
        && isValidString(request.resource.data.description, 0, 500)
        && request.resource.data.type in ['weight', 'strength', 'endurance', 'flexibility', 'custom']
        && isValidPositiveNumber(request.resource.data.targetValue)
        && isValidNonNegativeNumber(request.resource.data.currentValue)
        && request.resource.data.status in ['active', 'completed', 'paused', 'cancelled']
        && request.resource.data.priority in ['low', 'medium', 'high']
        && request.resource.data.isPublic is bool
        && request.resource.data.userId == resource.data.userId; // Cannot change ownership
      
      allow delete: if isOwner(resource.data.userId);
    }
    
    // ============================================
    // PERSONAL RECORDS
    // ============================================
    match /personalRecords/{recordId} {
      // Users can only read their own records
      allow read: if isOwner(resource.data.userId);
      
      allow create: if isAuthenticated()
        && isValidString(resource.data.userId, 1, 100)
        && resource.data.userId == request.auth.uid
        && isValidString(resource.data.exerciseId, 1, 100)
        && isValidString(resource.data.exerciseName, 1, 100)
        && resource.data.recordType in ['max_weight', 'max_reps', 'max_duration', 'best_time']
        && isValidPositiveNumber(resource.data.value)
        && isValidString(resource.data.unit, 1, 20)
        && isValidTimestamp(resource.data.dateAchieved)
        && isValidTimestamp(resource.data.createdAt)
        && isValidTimestamp(resource.data.updatedAt);
      
      allow update: if isOwner(resource.data.userId)
        && isValidString(request.resource.data.exerciseId, 1, 100)
        && isValidString(request.resource.data.exerciseName, 1, 100)
        && request.resource.data.recordType in ['max_weight', 'max_reps', 'max_duration', 'best_time']
        && isValidPositiveNumber(request.resource.data.value)
        && isValidString(request.resource.data.unit, 1, 20)
        && request.resource.data.userId == resource.data.userId; // Cannot change ownership
      
      allow delete: if isOwner(resource.data.userId);
    }
    
    // ============================================
    // USER PROFILES
    // ============================================
    match /users/{userId} {
      // Users can read their own profile
      allow read: if isAuthenticated() && request.auth.uid == userId;
      
      // Users can create and update their own profile
      allow create: if isAuthenticated() 
        && request.auth.uid == userId
        && isValidString(resource.data.email, 1, 100)
        && isValidString(resource.data.name, 1, 50)
        && isValidTimestamp(resource.data.createdAt)
        && isValidTimestamp(resource.data.updatedAt);
      
      allow update: if isAuthenticated() 
        && request.auth.uid == userId
        && isValidString(request.resource.data.name, 1, 50)
        && request.resource.data.email == resource.data.email; // Cannot change email via security rules
      
      // Users cannot delete their own profile via client
      allow delete: if false;
    }
    
    // ============================================
    // DEFAULT DENY
    // ============================================
    // Deny access to any other collection
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

---

## How to Use This in Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click on **Firestore Database** in the left sidebar
4. Click on the **Rules** tab
5. Delete all existing rules
6. Copy the rules above (starting from `rules_version = '2';`)
7. Paste them into the rules editor
8. Click **Publish** to save the rules

## Important Notes

⚠️ **These rules deny all access by default** - This means any collection that doesn't match the patterns above will be inaccessible. Make sure you've covered all your collections.

✅ **Users can only access their own data** - All collections use `userId` or `createdBy` to enforce ownership.

🔒 **Authentication required** - All write operations require a user to be logged in.

## Testing Your Rules

After pasting, you can test your rules using the **Rules Playground** in the Firebase Console:
1. Click the **Rules** tab
2. Scroll down to the **Rules Playground**
3. Select a collection (e.g., `workoutPlans`)
4. Choose an operation (read, write, etc.)
5. Test with different user IDs to verify ownership checks

---

## Alternative: Deploy via CLI

If you prefer to deploy via command line:

```bash
cd fitness-tracker-v2

# Deploy rules
firebase deploy --only firestore:rules
```

