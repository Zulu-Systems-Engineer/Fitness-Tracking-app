# Voice Announcements Timeline

## Overview
Voice notes are heard at three critical phases during a workout: **Start**, **Rest Phase**, and **Completion**.

---

## 🎯 START PHASE

### When Workout Begins (Line 187-190)
**Trigger:** User clicks "Start Workout" button

**Voice Announcements:**
1. **Immediate** (High Priority):
   ```
   "Starting your workout: [Plan Name]! Let's begin with [Exercise Name]. Get ready!"
   ```

2. **After 3 seconds**:
   ```
   "Next exercise: [Exercise Name]. [X] sets to complete."
   ```

**Purpose:** 
- Energizes and prepares the user
- Sets clear expectations
- Announces the first exercise

---

## ⏸️ REST PHASE

### When Rest Break Starts (Line 141)
**Trigger:** Every 5 minutes (300 seconds) of exercise time

**Voice Announcement:**
```
"REST BREAK! Take a 1 minute rest. You've been working hard for 5 minutes. Time to recover!"
```

**Purpose:**
- Clearly signals a mandatory rest period
- Acknowledges the user's effort
- Promotes recovery

---

### When Rest Break Ends (Line 165)
**Trigger:** After 1 minute (60 seconds) of rest

**Voice Announcement:**
```
"Rest break complete! Time to get back to it. Let's continue your workout!"
```

**Purpose:**
- Smoothly transitions back to exercise
- Re-motivates the user
- Maintains workout momentum

---

## 🎉 COMPLETION PHASE

### When Workout Finishes (Line 67-70)
**Trigger:** Workout timer reaches zero or all exercises complete

**Voice Announcements:**
1. **Immediate** (High Priority):
   ```
   "Congratulations! You've completed [Plan Name]! You did it in [X] minutes. Amazing work!"
   ```

2. **After 1 second**:
   ```
   "Congratulations! You've completed [Plan Name] in [X] minutes. Great job!"
   ```

**Purpose:**
- Celebrates the user's achievement
- Provides motivation and closure
- Confirms completion time

---

## 📊 Voice Features

### Priority Levels
- **High Priority**: Cancels any ongoing speech, speaks immediately
  - Start of workout
  - Rest break announcements
  - Completion announcements
  
- **Normal Priority**: Queued with other announcements
  - Exercise transitions
  - Set completions
  - Time updates

### Voice Settings
- **Rate:** 0.9 (slightly slower for clarity)
- **Pitch:** 1.0 (neutral)
- **Volume:** 0.8 (80% of system volume)
- **Voice:** Uses Google or Microsoft's natural-sounding voice if available

---

## 🎯 Complete Announcement Flow Example

### 30-Minute Workout Example:

```
0:00  🔊 "Starting your workout: Strength Training! Let's begin with Bench Press. Get ready!"
0:03  🔊 "Next exercise: Bench Press. 3 sets to complete."
...
5:00  🔊 "REST BREAK! Take a 1 minute rest. You've been working hard for 5 minutes. Time to recover!"
6:00  🔊 "Rest break complete! Time to get back to it. Let's continue your workout!"
...
10:00 🔊 "REST BREAK! Take a 1 minute rest. You've been working hard for 5 minutes. Time to recover!"
11:00 🔊 "Rest break complete! Time to get back to it. Let's continue your workout!"
...
29:00 🔔 "Set 3 complete. Exercise finished!" (if using auto-tracking)
30:00 🔊 "Congratulations! You've completed Strength Training! You did it in 30 minutes. Amazing work!"
30:01 🔊 "Congratulations! You've completed Strength Training in 30 minutes. Great job!"
```

---

## 🔧 Technical Implementation

### Key Functions Used:

1. **`voiceNotes.speak(text, priority)`**
   - Primary method for custom announcements
   - Priority: 'high' or 'normal'

2. **`voiceNotes.announceWorkoutStart(planName)`**
   - Legacy method for workout start
   
3. **`voiceNotes.announceExerciseStart(exerciseName, sets)`**
   - Announces current exercise details

4. **`voiceNotes.announceWorkoutComplete(planName, duration)`**
   - Legacy method for workout completion

### Volume Control
Users can toggle voice announcements on/off using the "Voice Notes: Enabled/Disabled" button in the workout timer UI.

---

## 🎓 Best Practices

1. **Clarity**: All critical announcements use 'high' priority for immediate attention
2. **Timing**: Key announcements have strategic delays to avoid overlapping speech
3. **Encouragement**: All messages use positive, motivational language
4. **Information**: Each announcement provides useful context (plan name, duration, etc.)

---

## 📝 Future Enhancements

- [ ] Add voice countdown during rest breaks ("10 seconds remaining...")
- [ ] Add periodic encouragement during exercises
- [ ] Add voice for set transitions
- [ ] Add voice for halfway point acknowledgment
- [ ] Add configurable announcement frequency
- [ ] Add multiple languages support


