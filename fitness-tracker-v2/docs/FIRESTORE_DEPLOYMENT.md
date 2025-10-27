# Firestore Security Rules Deployment Guide

This document explains the Firestore security rules and how to deploy them to your Firebase project.

## Overview

The Firestore security rules implement **principle of least privilege** - users can only access and modify their own data. All collections are protected with authentication checks and ownership validation.

## Security Features

### 1. Authentication Checks
- All write operations require user authentication
- Read operations are restricted to authenticated users
- Ownership validation ensures users can only access their own data

### 2. Data Validation
- String length validation (prevents excessive data)
- Number validation (ensures positive/non-negative values)
- Enum validation (ensures valid status values)
- Timestamp validation (ensures proper date handling)

### 3. Ownership Protection
- Users cannot transfer ownership of their data
- Users cannot modify records belonging to other users
- All queries are filtered by userId

## Collections and Rules

### 1. Workout Plans (`workoutPlans`)
- **Read**: Authenticated users can read all plans
- **Create**: Users can create plans (must be owner)
- **Update**: Only the creator can update
- **Delete**: Only the creator can delete

**Fields**:
- `createdBy` (user ID)
- `name` (1-100 chars)
- `description` (0-1000 chars)
- `exercises` (array)
- `duration` (positive number)
- `difficulty` (beginner, intermediate, advanced)
- `category` (strength, cardio, flexibility, mixed)
- `isPublic` (boolean)
- `createdAt`, `updatedAt` (timestamps)

### 2. Workouts (`workouts`)
- **Read**: Users can only read their own workouts
- **Create**: Users can create their own workouts
- **Update**: Only the owner can update
- **Delete**: Only the owner can delete

**Fields**:
- `userId` (user ID)
- `name` (1-100 chars)
- `status` (active, completed, cancelled)
- `exercises` (array)
- `startedAt` (timestamp)
- `completedAt` (optional timestamp)
- `createdAt`, `updatedAt` (timestamps)

### 3. Goals (`goals`)
- **Read**: Users can only read their own goals
- **Create**: Users can create their own goals
- **Update**: Only the owner can update
- **Delete**: Only the owner can delete

**Fields**:
- `userId` (user ID)
- `title` (1-100 chars)
- `description` (0-500 chars)
- `type` (weight, strength, endurance, flexibility, custom)
- `targetValue` (positive number)
- `currentValue` (non-negative number)
- `unit` (1-20 chars)
- `status` (active, completed, paused, cancelled)
- `priority` (low, medium, high)
- `isPublic` (boolean)
- `targetDate` (timestamp)
- `createdAt`, `updatedAt` (timestamps)
- `completedAt` (optional timestamp)

### 4. Personal Records (`personalRecords`)
- **Read**: Users can only read their own records
- **Create**: Users can create their own records
- **Update**: Only the owner can update
- **Delete**: Only the owner can delete

**Fields**:
- `userId` (user ID)
- `exerciseId` (1-100 chars)
- `exerciseName` (1-100 chars)
- `recordType` (max_weight, max_reps, max_duration, best_time)
- `value` (positive number)
- `unit` (1-20 chars)
- `dateAchieved` (timestamp)
- `createdAt`, `updatedAt` (timestamps)

### 5. User Profiles (`users`)
- **Read**: Users can only read their own profile
- **Create**: Users can create their own profile
- **Update**: Only the owner can update (email cannot be changed)
- **Delete**: Denied (profiles should not be deleted via client)

## Deployment Instructions

### Prerequisites
1. Firebase CLI installed: `npm install -g firebase-tools`
2. Logged into Firebase: `firebase login`
3. Project initialized: `firebase init firestore`

### Deploy Security Rules

```bash
cd fitness-tracker-v2

# Deploy rules
firebase deploy --only firestore:rules

# Deploy indexes
firebase deploy --only firestore:indexes
```

### Deploy Everything

```bash
# Deploy rules, indexes, and hosting
firebase deploy
```

### Testing Rules Locally

```bash
# Start emulators with rules
firebase emulators:start

# Test rules using the Firebase Rules Testing SDK
npm test
```

## Indexes

The project includes composite indexes to optimize queries:

1. **Workout Plans**:
   - `createdBy` + `createdAt` (DESC)
   - `difficulty` + `category` + `createdAt` (DESC)

2. **Workouts**:
   - `userId` + `status` + `createdAt` (DESC)
   - `userId` + `startedAt` (DESC)

3. **Goals**:
   - `userId` + `status` + `targetDate` (ASC)
   - `userId` + `createdAt` (DESC)

4. **Personal Records**:
   - `userId` + `exerciseId` + `dateAchieved` (DESC)
   - `userId` + `exerciseName` + `dateAchieved` (DESC)

## Troubleshooting

### Permission Denied Errors

**Error**: `Missing or insufficient permissions`

**Solution**: 
1. Verify the user is authenticated
2. Check that the `userId` field matches the authenticated user's UID
3. Ensure timestamps are properly formatted

### Index Errors

**Error**: `The query requires an index`

**Solution**:
1. Click the error link in the browser console
2. Firebase Console will open with the required index
3. Click "Create Index" to build it
4. Wait for the index to be created (this can take a few minutes)

### Validation Errors

**Error**: `Value for argument "document" is not a valid Firestore document`

**Solution**:
1. Check that all required fields are present
2. Verify string lengths are within limits
3. Ensure numbers are positive/non-negative where required
4. Check that enum values match allowed options

## Security Best Practices

1. **Always authenticate** before any data operations
2. **Validate ownership** on every read/write operation
3. **Use timestamps** for all date fields
4. **Validate enums** to prevent invalid status values
5. **Limit string lengths** to prevent DoS attacks
6. **Never trust client data** - always validate on the server

## Next Steps

1. Deploy the rules to your Firebase project
2. Test the rules with different user scenarios
3. Monitor Firebase Console for permission denied errors
4. Adjust rules as needed based on usage patterns

## Additional Resources

- [Firestore Security Rules Documentation](https://firebase.google.com/docs/firestore/security/get-started)
- [Firestore Indexes Documentation](https://firebase.google.com/docs/firestore/query-data/indexing)
- [Firebase Emulator Suite](https://firebase.google.com/docs/emulator-suite)

