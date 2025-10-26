import React, { useState, useEffect } from 'react';
import { voiceNotes } from '../../lib/voiceNotes';
import { WorkoutTimer } from './WorkoutTimer';

interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  weight: number;
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

  const currentExercise = plan.exercises[currentExerciseIndex];
  const totalSets = plan.exercises.reduce((sum, ex) => sum + ex.sets, 0);
  const completedSetsCount = Object.values(completedSets).reduce((sum, count) => sum + count, 0);
  const progressPercentage = (completedSetsCount / totalSets) * 100;

  // Auto-advance to next set after a delay
  useEffect(() => {
    if (isActive && currentExercise) {
      const timer = setTimeout(() => {
        // Auto-complete current set
        handleSetComplete();
      }, 30000); // 30 seconds per set (adjust as needed)

      return () => clearTimeout(timer);
    }
  }, [isActive, currentExercise, currentSet]);

  const handleSetComplete = () => {
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
      voiceNotes.announceRestTime(30); // 30 second rest
    }
  };

  const handleWorkoutComplete = () => {
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

    voiceNotes.announceWorkoutComplete(plan.name, duration);
    onWorkoutComplete(workoutData);
    setIsActive(false);
  };

  const handleStart = () => {
    setIsActive(true);
    setWorkoutStartTime(new Date());
    voiceNotes.announceWorkoutStart(plan.name);
    voiceNotes.announceExerciseStart(currentExercise.name, currentExercise.sets);
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

      {/* Current Exercise */}
      {isActive && currentExercise && (
        <div className="glassmorphism p-6 rounded-2xl">
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
