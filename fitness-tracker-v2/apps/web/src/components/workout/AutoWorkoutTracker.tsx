import React, { useState, useEffect, useCallback } from 'react';
import { voiceNotes } from '../../lib/voiceNotes';
import { WorkoutTimer } from './WorkoutTimer';

interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  weight: number;
  restTime?: number;
}

interface WorkoutPlan {
  id: string;
  name: string;
  description: string;
  exercises: Exercise[];
  duration: number;
  difficulty: string;
}

interface AutoWorkoutTrackerProps {
  plan: WorkoutPlan;
  onWorkoutComplete: (workoutData: any) => void;
  onWorkoutProgress: (progress: any) => void;
}

export function AutoWorkoutTracker({ plan, onWorkoutComplete, onWorkoutProgress }: AutoWorkoutTrackerProps) {
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [isActive, setIsActive] = useState(false);
  const [workoutStartTime, setWorkoutStartTime] = useState<Date | null>(null);
  const [completedSets, setCompletedSets] = useState<{[key: string]: number}>({});
  const [workoutProgress, setWorkoutProgress] = useState<any[]>([]);
  const [isRestBreak, setIsRestBreak] = useState(false);
  const [restBreakEndTime, setRestBreakEndTime] = useState<Date | null>(null);
  const [elapsedExerciseTime, setElapsedExerciseTime] = useState(0); // Track exercise time in seconds
  const [restBreakCountdown, setRestBreakCountdown] = useState(60); // Rest break countdown in seconds

  const currentExercise = plan.exercises[currentExerciseIndex];
  const totalSets = plan.exercises.reduce((sum, ex) => sum + ex.sets, 0);
  const completedSetsCount = Object.values(completedSets).reduce((sum, count) => sum + count, 0);
  const progressPercentage = (completedSetsCount / totalSets) * 100;

  const handleWorkoutComplete = useCallback(() => {
    const endTime = new Date();
    const duration = workoutStartTime ? Math.round((endTime.getTime() - workoutStartTime.getTime()) / 60000) : 0;

    const workoutData = {
      planId: plan.id,
      planName: plan.name,
      exercises: plan.exercises.map(ex => ({
        ...ex,
        completedSets: completedSets[ex.id] || 0
      })),
      totalSets: totalSets,
      completedSets: completedSetsCount,
      duration: duration,
      startedAt: workoutStartTime,
      completedAt: endTime,
      progress: workoutProgress,
      status: 'completed'
    };

    // COMPLETION PHASE: Announce workout completion with celebration
    voiceNotes.speak(`Congratulations! You've completed ${plan.name}! You did it in ${duration} minutes. Amazing work!`, 'high');
    setTimeout(() => {
      voiceNotes.announceWorkoutComplete(plan.name, duration);
    }, 1000);
    onWorkoutComplete(workoutData);
    setIsActive(false);
  }, [plan, workoutStartTime, completedSets, totalSets, completedSetsCount, workoutProgress, onWorkoutComplete]);

  const handleSetComplete = useCallback(() => {
    if (!currentExercise) return;

    const exerciseId = currentExercise.id;
    const newCompletedSets = {
      ...completedSets,
      [exerciseId]: (completedSets[exerciseId] || 0) + 1
    };
    setCompletedSets(newCompletedSets);

    // Log the set completion
    const setData = {
      exerciseId: currentExercise.id,
      exerciseName: currentExercise.name,
      setNumber: currentSet,
      reps: currentExercise.reps,
      weight: currentExercise.weight,
      completedAt: new Date(),
      timestamp: Date.now()
    };

    const newProgress = [...workoutProgress, setData];
    setWorkoutProgress(newProgress);

    // Announce set completion
    voiceNotes.announceSetComplete(currentSet, currentExercise.sets);

    // Update progress
    onWorkoutProgress({
      exerciseId: currentExercise.id,
      exerciseName: currentExercise.name,
      setNumber: currentSet,
      totalSets: currentExercise.sets,
      completedSets: newCompletedSets[exerciseId],
      progress: newProgress
    });

    // Check if exercise is complete
    if (currentSet >= currentExercise.sets) {
      // Move to next exercise
      if (currentExerciseIndex < plan.exercises.length - 1) {
        setCurrentExerciseIndex(prev => prev + 1);
        setCurrentSet(1);
        voiceNotes.announceExerciseStart(plan.exercises[currentExerciseIndex + 1].name, plan.exercises[currentExerciseIndex + 1].sets);
      } else {
        // Workout complete
        handleWorkoutComplete();
      }
    } else {
      // Next set of same exercise
      setCurrentSet(prev => prev + 1);
      const restTime = currentExercise.restTime || 60; // Use exercise restTime or default to 60 seconds
      voiceNotes.announceRestTime(restTime);
    }
  }, [currentExercise, currentSet, completedSets, workoutProgress, currentExerciseIndex, plan.exercises, onWorkoutProgress, handleWorkoutComplete]);

  // Track exercise time and trigger periodic rest breaks (every 5 minutes = 300 seconds)
  useEffect(() => {
    if (isActive && !isRestBreak && workoutStartTime) {
      const interval = setInterval(() => {
        setElapsedExerciseTime(prev => {
          const newTime = prev + 1;
          
          // Every 5 minutes (300 seconds), trigger a 1-minute rest break
          if (newTime % 300 === 0 && newTime > 0) {
            setIsRestBreak(true);
            const restEndTime = new Date(Date.now() + 60000); // 1 minute from now
            setRestBreakEndTime(restEndTime);
            setRestBreakCountdown(60);
            // REST PHASE: Loud and clear rest break announcement
            voiceNotes.speak('REST BREAK! Take a 1 minute rest. You\'ve been working hard for 5 minutes. Time to recover!', 'high');
          }
          
          return newTime;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isActive, isRestBreak, workoutStartTime]);

  // Handle rest break completion and countdown
  useEffect(() => {
    if (isRestBreak && restBreakEndTime) {
      // Countdown timer for rest break
      const countdownInterval = setInterval(() => {
        const remaining = Math.ceil((restBreakEndTime.getTime() - Date.now()) / 1000);
        setRestBreakCountdown(remaining);
        
        if (remaining <= 0) {
          setIsRestBreak(false);
          setRestBreakEndTime(null);
          setRestBreakCountdown(60);
          // REST PHASE END: Announce return to exercise
          voiceNotes.speak('Rest break complete! Time to get back to it. Let\'s continue your workout!', 'high');
        }
      }, 1000);

      return () => clearInterval(countdownInterval);
    }
  }, [isRestBreak, restBreakEndTime]);

  // Auto-advance to next set after rest time
  useEffect(() => {
    if (isActive && currentExercise && !isRestBreak) {
      const restTimeInMs = (currentExercise.restTime || 60) * 1000; // Use exercise restTime or default to 60 seconds
      const timer = setTimeout(() => {
        handleSetComplete();
      }, restTimeInMs);

      return () => clearTimeout(timer);
    }
  }, [isActive, currentExercise, handleSetComplete, isRestBreak]);

  const handleStart = () => {
    setIsActive(true);
    setWorkoutStartTime(new Date());
    // START PHASE: Announce workout start with plan details
    voiceNotes.speak(`Starting your workout: ${plan.name}! Let's begin with ${currentExercise.name}. Get ready!`, 'high');
    setTimeout(() => {
      voiceNotes.announceExerciseStart(currentExercise.name, currentExercise.sets);
    }, 3000); // Small delay for better flow
  };

  const handleHalfway = () => {
    voiceNotes.announceHalfway();
  };

  const handleComplete = () => {
    handleWorkoutComplete();
  };

  const handleTimeUpdate = (remaining: number) => {
    // Additional time-based logic can be added here
  };

  return (
    <div className="space-y-6">
      {/* Workout Timer */}
      <WorkoutTimer
        totalDuration={plan.duration}
        isActive={isActive}
        onStart={handleStart}
        onHalfway={handleHalfway}
        onComplete={handleComplete}
        onTimeUpdate={handleTimeUpdate}
      />

      {/* Current Exercise or Rest Break */}
      {isActive && (
        <div className="glassmorphism p-6 rounded-2xl">
          {isRestBreak ? (
            <>
              <h3 className="text-xl font-bold mb-4 text-center" style={{ color: 'var(--glassmorphism-text)' }}>
                🧘 Rest Break
              </h3>
              <div className="text-center mb-6">
                <div className="text-4xl mb-4">⏸️</div>
                <h4 className="text-2xl font-semibold mb-2" style={{ color: 'var(--glassmorphism-text)' }}>
                  Take a 1 minute break
                </h4>
                <p className="text-sm" style={{ color: 'var(--glassmorphism-text-muted)' }}>
                  You've been exercising for {Math.floor(elapsedExerciseTime / 60)} minutes. Rest up!
                </p>
                <div className="mt-4">
                  <div className="text-6xl font-mono font-bold" style={{ color: 'var(--primary)' }}>
                    {restBreakCountdown}
                  </div>
                  <div className="text-sm mt-2" style={{ color: 'var(--glassmorphism-text-muted)' }}>
                    seconds remaining
                  </div>
                </div>
              </div>
            </>
          ) : currentExercise && (
            <>
              <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--glassmorphism-text)' }}>
                Current Exercise
              </h3>
              
              <div className="text-center mb-6">
                <h4 className="text-2xl font-semibold mb-2" style={{ color: 'var(--glassmorphism-text)' }}>
                  {currentExercise.name}
                </h4>
                <div className="text-lg" style={{ color: 'var(--glassmorphism-text-secondary)' }}>
                  Set {currentSet} of {currentExercise.sets}
                </div>
                <div className="text-sm" style={{ color: 'var(--glassmorphism-text-muted)' }}>
                  {currentExercise.reps} reps × {currentExercise.weight} lbs
                </div>
              </div>
            </>
          )}

          {!isRestBreak && currentExercise && (
            <>
              {/* Progress Bar */}
              <div className="mb-6">
                <div className="w-full bg-gray-700 rounded-full h-3 mb-2">
                  <div 
                    className="bg-gradient-to-r from-primary-500 to-secondary-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${(currentSet / currentExercise.sets) * 100}%` }}
                  ></div>
                </div>
                <div className="text-sm text-center" style={{ color: 'var(--glassmorphism-text-muted)' }}>
                  {Math.round((currentSet / currentExercise.sets) * 100)}% Complete
                </div>
              </div>

              {/* Auto-complete button (for manual override) */}
              <div className="text-center">
                <button
                  onClick={handleSetComplete}
                  className="bg-primary-600 text-white px-8 py-3 rounded-xl hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-300 font-semibold"
                >
                  Complete Set
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Overall Progress */}
      <div className="glassmorphism p-6 rounded-2xl">
        <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--glassmorphism-text)' }}>
          Workout Progress
        </h3>
        
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span style={{ color: 'var(--glassmorphism-text-muted)' }}>Overall Progress</span>
            <span style={{ color: 'var(--glassmorphism-text)' }}>{Math.round(progressPercentage)}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-green-500 to-blue-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="text-center">
            <div className="text-2xl font-bold" style={{ color: 'var(--glassmorphism-text)' }}>
              {completedSetsCount}
            </div>
            <div style={{ color: 'var(--glassmorphism-text-muted)' }}>Sets Completed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold" style={{ color: 'var(--glassmorphism-text)' }}>
              {totalSets - completedSetsCount}
            </div>
            <div style={{ color: 'var(--glassmorphism-text-muted)' }}>Sets Remaining</div>
          </div>
        </div>
      </div>

      {/* Exercise List */}
      <div className="glassmorphism p-6 rounded-2xl">
        <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--glassmorphism-text)' }}>
          Exercise Plan
        </h3>
        
        <div className="space-y-3">
          {plan.exercises.map((exercise, index) => {
            const isCurrent = index === currentExerciseIndex;
            const isCompleted = index < currentExerciseIndex;
            const completedSetsForExercise = completedSets[exercise.id] || 0;

            return (
              <div
                key={exercise.id}
                className={`p-4 rounded-lg transition-all duration-300 ${
                  isCurrent ? 'bg-primary-500/20 border-2 border-primary-500' :
                  isCompleted ? 'bg-green-500/20 border-2 border-green-500' :
                  'bg-gray-700/50 border border-gray-600'
                }`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-semibold" style={{ color: 'var(--glassmorphism-text)' }}>
                      {exercise.name}
                    </h4>
                    <p className="text-sm" style={{ color: 'var(--glassmorphism-text-muted)' }}>
                      {exercise.sets} sets × {exercise.reps} reps × {exercise.weight} lbs
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium" style={{ color: 'var(--glassmorphism-text)' }}>
                      {completedSetsForExercise}/{exercise.sets}
                    </div>
                    <div className="text-xs" style={{ color: 'var(--glassmorphism-text-muted)' }}>
                      {isCurrent ? 'Current' : isCompleted ? 'Completed' : 'Pending'}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
