# Firebase Realtime Database Security Rules - Paste into Firebase Console

Copy and paste these rules directly into the Firebase Console at:
**Firebase Console → Realtime Database → Rules**

---

```json
{
  "rules": {
    "workoutPlans": {
      ".read": "auth != null",
      "$planId": {
        ".write": "auth != null && (!data.exists() || data.child('createdBy').val() == auth.uid)",
        ".validate": "newData.hasChild('name') && newData.child('name').isString() && newData.child('name').val().length <= 100 && newData.hasChild('createdBy') && newData.child('createdBy').val() == auth.uid"
      }
    },
    "workouts": {
      ".read": "auth != null",
      "$workoutId": {
        ".write": "auth != null && (data.child('userId').val() == auth.uid || !data.exists())",
        ".validate": "newData.hasChild('userId') && newData.child('userId').val() == auth.uid"
      }
    },
    "goals": {
      ".read": "auth != null",
      "$goalId": {
        ".write": "auth != null && (data.child('userId').val() == auth.uid || !data.exists())",
        ".validate": "newData.hasChild('userId') && newData.child('userId').val() == auth.uid"
      }
    },
    "personalRecords": {
      ".read": "auth != null",
      "$recordId": {
        ".write": "auth != null && (data.child('userId').val() == auth.uid || !data.exists())",
        ".validate": "newData.hasChild('userId') && newData.child('userId').val() == auth.uid"
      }
    },
    "users": {
      "$userId": {
        ".read": "auth != null && $userId == auth.uid",
        ".write": "auth != null && $userId == auth.uid"
      }
    }
  }
}
```

---

## How to Use This in Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click on **Realtime Database** in the left sidebar
4. Click on the **Rules** tab
5. Delete all existing rules
6. Copy the JSON rules above (starting from the opening `{`)
7. Paste them into the rules editor
8. Click **Publish** to save the rules

## Security Features

### Authentication Required
- All collections require authentication (`auth != null`)
- Users must be logged in to read or write data

### Ownership Protection
- **Workout Plans**: Only the creator (`createdBy`) can write/update
- **Workouts**: Users can only access their own workouts (`userId` matches authenticated user)
- **Goals**: Users can only access their own goals (`userId` matches authenticated user)
- **Personal Records**: Users can only access their own records (`userId` matches authenticated user)
- **Users**: Users can only access their own profile (`userId` matches authenticated user)

### Data Validation
- `createdBy` must match authenticated user ID
- `userId` must match authenticated user ID
- String length validation (name max 100 chars)

## Database Structure

```
fitness-tracker-app
├── workoutPlans/
│   └── {planId}/
│       ├── name
│       ├── description
│       ├── exercises
│       ├── duration
│       ├── difficulty
│       ├── category
│       ├── isPublic
│       ├── createdBy
│       ├── createdAt
│       └── updatedAt
├── workouts/
│   └── {workoutId}/
│       ├── userId
│       ├── planId
│       ├── planName
│       ├── name
│       ├── exercises
│       ├── status
│       ├── startedAt
│       ├── completedAt
│       ├── duration
│       ├── notes
│       ├── createdAt
│       └── updatedAt
├── goals/
│   └── {goalId}/
│       ├── userId
│       ├── title
│       ├── description
│       ├── type
│       ├── targetValue
│       ├── currentValue
│       ├── unit
│       ├── targetDate
│       ├── status
│       ├── priority
│       ├── isPublic
│       ├── createdAt
│       ├── updatedAt
│       └── completedAt
├── personalRecords/
│   └── {recordId}/
│       ├── userId
│       ├── exerciseId
│       ├── exerciseName
│       ├── recordType
│       ├── value
│       ├── unit
│       ├── dateAchieved
│       ├── workoutId
│       ├── notes
│       ├── createdAt
│       └── updatedAt
└── users/
    └── {userId}/
        ├── email
        ├── name
        ├── createdAt
        └── updatedAt
```

## Difference from Firestore

### Realtime Database
- Uses JSON structure
- Rules are JSON-based
- Real-time synchronization
- Simpler query syntax
- Better for real-time features
- Requires `.indexOn` for efficient queries

### What Changed
- **Imports**: Changed from `firebase/firestore` to `firebase/database`
- **Methods**: 
  - `addDoc()` → `push()` + `set()`
  - `getDocs()` → `get()` + `snapshotToArray()`
  - `updateDoc()` → `updateDB()`
  - `deleteDoc()` → `remove()`
  - Query with `orderByChild()`, `equalTo()`, etc.

## Indexing

For efficient queries, add these indexes in your Realtime Database:

1. Go to **Realtime Database → Data**
2. Click the **Indexes** tab
3. Add these composite indexes:
   - `workoutPlans.createdBy`
   - `workouts.userId`
   - `workouts.status`
   - `goals.userId`
   - `goals.status`
   - `personalRecords.userId`
   - `personalRecords.exerciseName`

## Testing Your Rules

After pasting, you can test your rules using the **Rules Playground**:
1. Click the **Rules** tab
2. Scroll down to the **Rules Playground**
3. Enter a path (e.g., `/workouts`)
4. Choose authenticated or unauthenticated
5. Test read/write operations
6. Verify the results match your security model

## Troubleshooting

### "Permission denied" errors
- Ensure the user is authenticated
- Verify `userId` matches the authenticated user's UID
- Check that `createdBy` matches the authenticated user's UID

### Data not syncing
- Check internet connection
- Verify Firebase configuration
- Check browser console for errors

### Slow queries
- Add `.indexOn` rules for commonly queried fields
- Create composite indexes for complex queries
- Consider pagination for large datasets

## Next Steps

1. Enable Realtime Database in Firebase Console
2. Copy and paste the rules above
3. Test authentication and data access
4. Monitor usage in the Firebase Console

## Additional Resources

- [Realtime Database Documentation](https://firebase.google.com/docs/database)
- [Realtime Database Security Rules](https://firebase.google.com/docs/database/security)
- [Realtime Database Rules Playground](https://firebase.google.com/docs/database/security/test-security)

