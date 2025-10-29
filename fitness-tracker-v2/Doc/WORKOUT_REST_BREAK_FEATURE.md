# Workout Rest Break Feature

## Overview
Added automatic periodic rest breaks during workouts to prevent user fatigue. The feature provides 1-minute rest breaks every 5 minutes of exercise time.

## How It Works

### 1. Exercise Time Tracking
- The workout tracks elapsed exercise time in seconds
- Only active exercise time is counted (rest breaks don't count)
- Time resets to 0 when starting a new workout

### 2. Periodic Rest Breaks
- Every **5 minutes (configurable)** of exercise time, a **1-minute rest break (configurable)** is automatically triggered
- Duration and frequency are now configurable via the workout plan:
  - `restBreakDuration`: Duration in minutes (default: 1 minute)
  - `restBreakFrequency`: Frequency in minutes (default: 5 minutes)
- During rest breaks:
  - Exercise time counter is paused
  - No new sets are auto-advanced
  - Users see a rest break screen with a countdown timer
  - Voice announcements notify users of the break

### 3. Rest Break UI
The rest break screen displays:
- 🧘 "Rest Break" heading
- ⏸️ Pause icon
- Message: "Take a 1 minute break"
- How long the user has been exercising
- Live countdown timer (60 → 0 seconds)

### 4. Voice Announcements
- **Start of rest break**: "Take a 1 minute rest break. You've earned it!"
- **End of rest break**: "Rest break complete. Time to get back to it!"

## Technical Implementation

### New State Variables
```typescript
const [isRestBreak, setIsRestBreak] = useState(false);
const [restBreakEndTime, setRestBreakEndTime] = useState<Date | null>(null);
const [elapsedExerciseTime, setElapsedExerciseTime] = useState(0);
const [restBreakCountdown, setRestBreakCountdown] = useState(60);
```

### Key Logic Changes

1. **Exercise Time Tracking** (Lines 127-149)
   - Increments `elapsedExerciseTime` every second while exercising
   - Only runs when `isActive && !isRestBreak`
   - Triggers rest break when time reaches a multiple of 300 seconds

2. **Rest Break Management** (Lines 151-169)
   - Starts a countdown interval when rest break begins
   - Updates countdown every second
   - Auto-completes rest break after 60 seconds
   - Announces completion with voice

3. **Set Auto-advance Prevention** (Lines 172-181)
   - Modified to NOT auto-advance sets during rest breaks
   - Only works when `isActive && currentExercise && !isRestBreak`

### UI Changes

1. **Rest Break Screen** (Lines 208-238)
   - Displays when `isRestBreak === true`
   - Shows countdown timer
   - Shows elapsed exercise time

2. **Exercise Progress Hidden During Rest** (Lines 251-276)
   - Progress bar and "Complete Set" button only show when NOT in a rest break

## User Experience

### Example Workout Flow (30-minute workout):

1. **0:00** - User starts workout
2. **5:00** - ⏸️ 1-minute rest break triggered
   - Voice: "Take a 1 minute rest break. You've earned it!"
   - Screen shows: "🧘 Rest Break - Take a 1 minute break"
3. **6:00** - Rest break ends, exercise resumes
   - Voice: "Rest break complete. Time to get back to it!"
4. **10:00** - ⏸️ Second 1-minute rest break triggered
5. **11:00** - Rest break ends, exercise resumes
6. **15:00** - ⏸️ Third 1-minute rest break triggered
7. ... continues every 5 minutes until workout completes ...

### Benefits
- ✅ Prevents user fatigue during long workouts
- ✅ Provides structured recovery time
- ✅ Visual and voice feedback keeps users informed
- ✅ Automatic - no user action required
- ✅ Respects the overall workout duration set by the timer

## Configuration

Rest break timing is now configurable per workout plan:
- **Rest break duration**: Set via `restBreakDuration` property (in minutes, default: 1)
- **Rest break frequency**: Set via `restBreakFrequency` property (in minutes, default: 5)

### Example Workout Plan Configuration:

```typescript
const workoutPlan = {
  name: "High Intensity Workout",
  duration: 30,
  restBreakDuration: 2, // 2-minute rest breaks
  restBreakFrequency: 10, // Every 10 minutes of exercise
  exercises: [...]
};
```

### Custom Durations:
- **Short rest (30 sec)**: Set `restBreakDuration: 0.5`
- **Standard rest (1 min)**: Set `restBreakDuration: 1` (default)
- **Extended rest (2 min)**: Set `restBreakDuration: 2`
- **Long rest (5 min)**: Set `restBreakDuration: 5`

### Custom Frequencies:
- **Frequent breaks (every 3 min)**: Set `restBreakFrequency: 3`
- **Standard breaks (every 5 min)**: Set `restBreakFrequency: 5` (default)
- **Infrequent breaks (every 10 min)**: Set `restBreakFrequency: 10`

## Testing

To test the feature:
1. Start a workout with a duration ≥ 5 minutes
2. Exercise normally (or let auto-tracking handle it)
3. After 5 minutes of exercise time, you should see the rest break screen
4. Wait for the 1-minute countdown
5. Exercise should automatically resume
6. Repeat every 5 minutes

## Future Enhancements
- Make rest break frequency and duration configurable per workout plan
- Add option to skip rest breaks
- Add different rest break lengths based on workout intensity
- Show historical rest break data in analytics


