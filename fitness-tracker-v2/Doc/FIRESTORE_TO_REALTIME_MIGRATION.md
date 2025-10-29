# Migrated from Firestore to Realtime Database

This document explains what changed when migrating from Firestore to Firebase Realtime Database.

## Files Changed

### 1. `apps/web/src/lib/firebase.ts`
**Before (Firestore):**
```typescript
import { getFirestore } from 'firebase/firestore';
const db = getFirestore(app);
```

**After (Realtime Database):**
```typescript
import { getDatabase } from 'firebase/database';
const db = getDatabase(app);
```

### 2. `apps/web/src/lib/firebaseServices.ts`
Completely rewritten to use Realtime Database APIs instead of Firestore APIs.

**Key Changes:**

#### Imports
- **Removed**: `collection`, `doc`, `addDoc`, `updateDoc`, `deleteDoc`, `getDocs`, `getDoc`, `query`, `where`, `orderBy`, `limit`, `Timestamp`, `DocumentData`, `QueryDocumentSnapshot`
- **Added**: `ref`, `push`, `set`, `get`, `update`, `remove`, `query`, `orderByChild`, `equalTo`, `limitToFirst`, `startAt`, `endAt`, `DataSnapshot`

#### Operations

**Create:**
```typescript
// Before (Firestore)
const docRef = await addDoc(collection(db, 'workoutPlans'), planData);

// After (Realtime Database)
const planRef = ref(db, 'workoutPlans');
const newPlanRef = push(planRef);
await set(newPlanRef, planData);
```

**Read All:**
```typescript
// Before (Firestore)
const q = query(collection(db, 'workouts'), where('userId', '==', userId));
const snapshot = await getDocs(q);
return snapshot.docs.map(convertData);

// After (Realtime Database)
const workoutRef = ref(db, 'workouts');
const queryRef = query(workoutRef, orderByChild('userId'), equalTo(userId));
const snapshot = await get(queryRef);
return snapshotToArray(snapshot);
```

**Update:**
```typescript
// Before (Firestore)
await updateDoc(docRef, updateData);

// After (Realtime Database)
await updateDB(workoutRef, updateData);
```

**Delete:**
```typescript
// Before (Firestore)
await deleteDoc(docRef);

// After (Realtime Database)
await remove(workoutRef);
```

### 3. Helper Functions

Added three new helper functions:

1. **`snapshotToArray(snapshot)`** - Converts Realtime Database snapshot to array format
2. **`convertDates(obj)`** - Converts ISO date strings back to Date objects
3. **`datesToStrings(obj)`** - Converts Date objects to ISO strings for storage

## Database Structure

### Firestore Structure (Before)
```
collections/
  - workoutPlans (documents)
  - workouts (documents)
  - goals (documents)
  - personalRecords (documents)
```

### Realtime Database Structure (After)
```
{
  workoutPlans: {
    {planId}: { ...data }
  },
  workouts: {
    {workoutId}: { ...data }
  },
  goals: {
    {goalId}: { ...data }
  },
  personalRecords: {
    {recordId}: { ...data }
  }
}
```

## Security Rules

### Firestore Rules (Old)
- Written in a declarative language
- Rules file: `firestore.rules`
- Deployed via: `firebase deploy --only firestore:rules`

### Realtime Database Rules (New)
- Written in JSON format
- Paste directly into Firebase Console
- Guide: `REALTIME_DATABASE_RULES.md`

## How Data is Stored

### Dates
- Firestore: Stored as `Timestamp` objects
- Realtime Database: Stored as ISO strings (`2025-10-27T12:00:00.000Z`)
- Automatic conversion via helper functions

### IDs
- Firestore: Auto-generated document IDs
- Realtime Database: Auto-generated keys from `push()`
- Both use the same service methods, so the interface doesn't change

### Nested Objects
- Both handle nested objects the same way
- Arrays are preserved in both

## Testing the Migration

1. **Check Authentication**
   - Log in to your app
   - Verify Firebase Auth still works

2. **Test CRUD Operations**
   - Create a workout plan
   - Read all workouts
   - Update a goal
   - Delete a personal record

3. **Check Data Persistence**
   - Create data in the app
   - Refresh the page
   - Verify data persists

4. **Verify Security**
   - Try to access another user's data (should fail)
   - Try to modify data you don't own (should fail)

## Benefits of Realtime Database

1. **Real-time Sync**: Changes reflect immediately across all clients
2. **Offline Support**: Automatic offline persistence
3. **Simple Queries**: Easier to query and filter data
4. **Lower Latency**: Faster for read/write operations
5. **Live Data**: Perfect for real-time features like workout tracking

## Important Notes

⚠️ **Data Migration Required**
- If you have existing Firestore data, you'll need to export and migrate it
- Follow Firebase documentation for data migration

⚠️ **Rules Are Different**
- Realtime Database uses JSON-based rules
- Rules are simpler but less flexible than Firestore rules
- See `REALTIME_DATABASE_RULES.md` for setup

✅ **API Compatibility**
- The service interfaces (`workoutPlanService`, `workoutService`, etc.) remain unchanged
- Your existing components don't need to change
- Only the underlying implementation changed

## Next Steps

1. **Deploy the Changes**
   ```bash
   cd fitness-tracker-v2/apps/web
   npm run build
   ```

2. **Set Up Realtime Database Rules**
   - Go to Firebase Console
   - Enable Realtime Database
   - Paste rules from `REALTIME_DATABASE_RULES.md`

3. **Test Everything**
   - Create a new workout plan
   - Track a workout
   - Set a goal
   - Verify data syncs across tabs

4. **Monitor Usage**
   - Check Firebase Console for data
   - Monitor read/write operations
   - Adjust rules if needed

## Troubleshooting

### "Permission denied" errors
- Ensure Realtime Database is enabled in Firebase Console
- Verify security rules are deployed
- Check that user is authenticated

### Data not showing
- Check browser console for errors
- Verify `databaseURL` in `.env` file
- Ensure data is being written to the database

### Slow performance
- Add indexes for commonly queried fields
- Use `limitToFirst()` to paginate results
- Consider caching strategies

## Need Help?

- Check `REALTIME_DATABASE_RULES.md` for security rules setup
- Review Firebase Realtime Database docs: https://firebase.google.com/docs/database
- Check browser console for specific error messages

