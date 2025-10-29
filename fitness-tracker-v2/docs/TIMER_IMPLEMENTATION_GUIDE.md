# Workout Timer Implementation Guide

## Overview
The workout timer system in the fitness tracker now properly handles configurable rest break durations of any length (1-50+ minutes) with visual feedback and proper countdown management.

## Components

### AutoWorkoutTracker.tsx
Main component managing the overall workout flow including:
- Exercise tracking
- Set completion
- Rest break triggers and countdowns
- Voice announcements

**Key State Variables:**
```typescript
const [isRestBreak, setIsRestBreak] = useState(false);
const [restBreakEndTime, setRestBreakEndTime] = useState<Date | null>(null);
const [restBreakCountdown, setRestBreakCountdown] = useState(60);
const [elapsedExerciseTime, setElapsedExerciseTime] = useState(0);
```

**Key Memoized Values:**
```typescript
const restBreakDurationSeconds = useMemo(
  () => (plan.restBreakDuration || 1) * 60,
  [plan.restBreakDuration]
);

const restBreakFrequencySeconds = useMemo(
  () => (plan.restBreakFrequency || 5) * 60,
  [plan.restBreakFrequency]
);
```

### WorkoutTimer.tsx
Manages the overall workout timer display and controls:
- Start/pause/resume/stop functionality
- Progress percentage calculation
- Halfway point announcements
- Voice announcements

## How It Works

### 1. Rest Break Triggering
```typescript
// Track elapsed exercise time every second
useEffect(() => {
  if (isActive && !isRestBreak && workoutStartTime) {
    const interval = setInterval(() => {
      setElapsedExerciseTime(prev => {
        const newTime = prev + 1;
        
        // Trigger rest break at configured frequency
        if (newTime % restBreakFrequencySeconds === 0 && newTime > 0) {
          setIsRestBreak(true);
          const restEndTime = new Date(
            Date.now() + restBreakDurationSeconds * 1000
          );
          setRestBreakEndTime(restEndTime);
          setRestBreakCountdown(restBreakDurationSeconds);
        }
        
        return newTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }
}, [isActive, isRestBreak, workoutStartTime, 
    restBreakDurationSeconds, restBreakFrequencySeconds]);
```

### 2. Rest Break Countdown
```typescript
// Handle countdown and completion
useEffect(() => {
  if (isRestBreak && restBreakEndTime) {
    const countdownInterval = setInterval(() => {
      const remaining = Math.ceil(
        (restBreakEndTime.getTime() - Date.now()) / 1000
      );
      setRestBreakCountdown(remaining);
      
      if (remaining <= 0) {
        setIsRestBreak(false);
        setRestBreakEndTime(null);
        setRestBreakCountdown(restBreakDurationSeconds);
        // Announce rest break complete
      }
    }, 1000);

    return () => clearInterval(countdownInterval);
  }
}, [isRestBreak, restBreakEndTime, restBreakDurationSeconds]);
```

### 3. Time Display and Formatting
```typescript
// Format seconds to MM:SS
const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

// Calculate progress
const restBreakProgress = 
  ((restBreakDurationSeconds - restBreakCountdown) / restBreakDurationSeconds) * 100;

// Display
<div className="text-6xl font-mono font-bold">
  {formatTime(Math.max(0, restBreakCountdown))}
</div>
```

## Usage Examples

### Configure a 10-minute Rest Break
```typescript
const workoutPlan = {
  id: 'plan1',
  name: 'Strength Training',
  exercises: [...],
  duration: 60,
  difficulty: 'Hard',
  restBreakDuration: 10,    // 10 minutes
  restBreakFrequency: 5,    // Every 5 minutes of exercise
};
```

### Configure a 15-minute Rest Break
```typescript
const workoutPlan = {
  ...
  restBreakDuration: 15,    // 15 minutes
  restBreakFrequency: 20,   // Every 20 minutes of exercise
};
```

### Configure a 50-minute Rest Break
```typescript
const workoutPlan = {
  ...
  restBreakDuration: 50,    // 50 minutes
  restBreakFrequency: 30,   // Every 30 minutes of exercise
};
```

## Display Output Examples

### Rest Break Starting (10 minutes)
```
🧘 Rest Break
Take a 10 minute break
You've been exercising for 5 minutes. Rest up!

10:00
remaining

[████████░░░░░░░░░░░░░░░░░░░░░░░░] 0% Complete
```

### Rest Break In Progress (5 minutes remaining)
```
🧘 Rest Break
Take a 10 minute break
You've been exercising for 5 minutes. Rest up!

05:00
remaining

[███████████████░░░░░░░░░░░░░░░░░░░░] 50% Complete
```

### Rest Break Nearly Complete
```
🧘 Rest Break
Take a 10 minute break
You've been exercising for 5 minutes. Rest up!

00:30
remaining

[██████████████████████████░░░░░░░░] 95% Complete
```

## Important Implementation Details

### 1. Always Use useMemo for Calculated Values
Prevents unnecessary dependency array updates:
```typescript
// ❌ DON'T do this (recalculated on every render)
const durationSeconds = (plan.duration || 1) * 60;

// ✅ DO this (only recalculated when dependency changes)
const durationSeconds = useMemo(
  () => (plan.duration || 1) * 60,
  [plan.duration]
);
```

### 2. Keep Dependency Arrays Clean
Remove unnecessary dependencies to prevent interval resets:
```typescript
// ❌ DON'T include plan properties directly
}, [isActive, isRestBreak, plan.restBreakDuration, plan.restBreakFrequency]);

// ✅ DO use memoized values only
}, [isActive, isRestBreak, restBreakDurationSeconds, restBreakFrequencySeconds]);
```

### 3. Use Date Objects for Countdown
Prevents timer drift from multiple interval updates:
```typescript
// Calculate remaining time from target end time
const remaining = Math.ceil((restBreakEndTime.getTime() - Date.now()) / 1000);
```

### 4. Safe Math Operations
Always protect against negative or zero values:
```typescript
// ❌ DON'T display negative values
<div>{restBreakCountdown}</div>

// ✅ DO use Math.max to ensure positive values
<div>{formatTime(Math.max(0, restBreakCountdown))}</div>
```

## Testing

### Unit Tests
Located in `AutoWorkoutTracker.test.tsx`:
- Rest break display formatting
- Duration variations (10, 15, 30, 50 minutes)
- Countdown progress updates
- Rest break completion
- Transition back to exercise

### Manual Testing Checklist
- [ ] Start workout with 10-minute rest break every 5 minutes
- [ ] After 5 minutes, rest break triggers showing 10:00
- [ ] Rest break counts down properly (10:00 → 09:59 → 09:58...)
- [ ] After ~1 minute, verify it's still counting (not at 01:00 or less)
- [ ] After full duration, rest break ends and exercise resumes
- [ ] Try different durations: 5, 15, 30, 50 minutes
- [ ] Verify voice announcements work for rest break start/end

## Common Issues and Solutions

### Issue: Timer appears to cut off after 1 minute
**Solution**: Ensure `useMemo` is used for calculated values and dependency arrays only contain memoized values.

### Issue: Countdown doesn't update every second
**Solution**: Check that the interval is not being reset. Verify useEffect dependencies are correct.

### Issue: Rest break doesn't trigger at all
**Solution**: 
1. Verify `restBreakFrequency` is less than total workout duration
2. Check that `isActive` is true
3. Ensure `isRestBreak` is false when not in a break

### Issue: Timer resumes or jumps unexpectedly
**Solution**: Check for multiple rerenders. Use `useMemo` and proper dependency arrays.

## Performance Considerations

- ✓ Memoized values prevent unnecessary recalculations
- ✓ Stable dependency arrays prevent interval resets
- ✓ No memory leaks from proper interval cleanup
- ✓ Efficient countdown using `setInterval` with 1-second precision
- ✓ Voice announcements are debounced

## Future Enhancements

Possible improvements:
1. Add configurable rest break frequency UI in settings
2. Add preset rest break duration buttons
3. Add sound notifications for rest break start/end
4. Add pause/skip buttons during rest break
5. Add statistics on rest break usage
6. Add adaptive rest break duration based on workout intensity

## References

- React Hooks documentation: https://react.dev/reference/react
- useEffect cleanup: https://react.dev/reference/react/useEffect
- useMemo optimization: https://react.dev/reference/react/useMemo
- Testing Library: https://testing-library.com/docs/react-testing-library/intro/
- Vitest: https://vitest.dev/

## Support

For issues or questions about the timer implementation:
1. Check the test files for usage examples
2. Review the summary document (TIMER_FIX_SUMMARY.md)
3. Check console for any error messages
4. Verify workout plan configuration