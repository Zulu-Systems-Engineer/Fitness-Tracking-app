import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usage, colors } from '../lib/theme';
import { workoutService, workoutPlanService, Workout, WorkoutPlan, WorkoutExercise, WorkoutSet } from '../lib/firebaseServices';
import { useAuth } from '../contexts/AuthContext';
import { AutoWorkoutTracker } from '../components/workout/AutoWorkoutTracker';
import { voiceNotes } from '../lib/voiceNotes';
import { useToast } from '../components/ui/Toast';

// Types are now imported from firebaseServices

interface LogSet {
  exerciseId: string;
  setNumber: number;
  reps: number;
  weight?: number;
  restTime?: number;
  notes?: string;
}

export default function TrackPage() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [plans, setPlans] = useState<WorkoutPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeWorkout, setActiveWorkout] = useState<Workout | null>(null);
  const [showStartWorkout, setShowStartWorkout] = useState(false);
  const [showStartWorkoutModal, setShowStartWorkoutModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<WorkoutPlan | null>(null);
  const [isAutoTracking, setIsAutoTracking] = useState(false);
  const [workoutProgress, setWorkoutProgress] = useState<any>(null);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();

  const trackingTheme = usage.tracking;

  // Load data from Firebase (with local storage fallback)
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        if (user) {
          try {
            // Try Firebase first
            const [userPlans, userWorkouts] = await Promise.all([
              workoutPlanService.getAll(user.id),
              workoutService.getAll(user.id)
            ]);
            
            setPlans(userPlans);
            setWorkouts(userWorkouts);
            
            // Sync to local storage for offline access
            localStorage.setItem('workoutPlans', JSON.stringify(userPlans));
            localStorage.setItem('workouts', JSON.stringify(userWorkouts));
            
            // Check for active workout
            const active = await workoutService.getActive(user.id);
            setActiveWorkout(active);
          } catch (firebaseError) {
            console.log('Firebase not available, using local storage:', firebaseError);
            
            // Fallback to local storage
            const localPlans = JSON.parse(localStorage.getItem('workoutPlans') || '[]');
            const localWorkouts = JSON.parse(localStorage.getItem('workouts') || '[]');
            
            if (localPlans.length > 0) {
              const plansWithDates = localPlans.map((plan: any) => ({
                ...plan,
                createdAt: new Date(plan.createdAt),
                updatedAt: new Date(plan.updatedAt),
              }));
              setPlans(plansWithDates);
            } else {
              setPlans([]);
            }
            
            if (localWorkouts.length > 0) {
              const workoutsWithDates = localWorkouts.map((workout: any) => ({
                ...workout,
                startedAt: new Date(workout.startedAt),
                completedAt: workout.completedAt ? new Date(workout.completedAt) : undefined,
                updatedAt: new Date(workout.updatedAt),
              }));
              setWorkouts(workoutsWithDates);
              
              // Find active workout
              const active = workoutsWithDates.find((w: any) => w.status === 'active');
              setActiveWorkout(active || null);
            } else {
              setWorkouts([]);
              setActiveWorkout(null);
            }
          }
        } else {
          // No user, use local storage only
          const localPlans = JSON.parse(localStorage.getItem('workoutPlans') || '[]');
          const localWorkouts = JSON.parse(localStorage.getItem('workouts') || '[]');
          
          if (localPlans.length > 0) {
            const plansWithDates = localPlans.map((plan: any) => ({
              ...plan,
              createdAt: new Date(plan.createdAt),
              updatedAt: new Date(plan.updatedAt),
            }));
            setPlans(plansWithDates);
          } else {
            setPlans([]);
          }
          
          if (localWorkouts.length > 0) {
            const workoutsWithDates = localWorkouts.map((workout: any) => ({
              ...workout,
              startedAt: new Date(workout.startedAt),
              completedAt: workout.completedAt ? new Date(workout.completedAt) : undefined,
              updatedAt: new Date(workout.updatedAt),
            }));
            setWorkouts(workoutsWithDates);
            
            // Find active workout
            const active = workoutsWithDates.find((w: any) => w.status === 'active');
            setActiveWorkout(active || null);
          } else {
            setWorkouts([]);
            setActiveWorkout(null);
          }
        }
        
      } catch (error) {
        console.error('Error loading data:', error);
        setPlans([]);
        setWorkouts([]);
        setActiveWorkout(null);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  // Check for selected plan from PlansPage and auto-start workout
  useEffect(() => {
    const selectedPlanData = localStorage.getItem('selectedPlan');
    if (selectedPlanData && !activeWorkout) {
      try {
        const selectedPlan: WorkoutPlan = JSON.parse(selectedPlanData);
        // Find the plan in our plans array or use the selected plan directly
        const planToUse = plans.find(p => p.id === selectedPlan.id) || selectedPlan;
        if (planToUse) {
          startWorkoutFromPlan(planToUse);
        }
        // Clear the selected plan from localStorage
        localStorage.removeItem('selectedPlan');
      } catch (error) {
        console.error('Error parsing selected plan:', error);
        localStorage.removeItem('selectedPlan');
      }
    }
  }, [activeWorkout]);

  const startWorkoutFromPlan = async (plan: WorkoutPlan) => {
    if (!user) return;
    
    try {
      const newWorkout = await workoutService.create({
        userId: user.id,
        planId: plan.id,
        planName: plan.name,
        name: plan.name,
        exercises: plan.exercises.map(exercise => ({
          id: crypto.randomUUID(),
          exerciseName: exercise.name,
          sets: [],
          completed: false
        })),
        status: 'active',
        startedAt: new Date()
      });
      
      setWorkouts([newWorkout, ...workouts]);
      setActiveWorkout(newWorkout);
      setSelectedPlan(plan);
      setIsAutoTracking(true);
      setShowStartWorkout(false);
      showToast('Workout started successfully!', 'success');
    } catch (error) {
      console.error('Error starting workout:', error);
      showToast('Failed to start workout. Please try again.', 'error');
    }
  };

  const handleAutoWorkoutComplete = async (workoutData: any) => {
    if (!user) return;

    try {
      // Save the completed workout to Firebase
      const completedWorkout = await workoutService.update(activeWorkout!.id!, {
        ...workoutData,
        status: 'completed',
        completedAt: new Date(),
        duration: workoutData.duration
      });

      // Update local state
      setWorkouts(prev => prev.map(w => w.id === activeWorkout!.id ? completedWorkout : w));
      setActiveWorkout(null);
      setSelectedPlan(null);
      setIsAutoTracking(false);
      setWorkoutProgress(null);

      // Reload workouts to show the completed one
      const userWorkouts = await workoutService.getAll(user.id);
      setWorkouts(userWorkouts);

      voiceNotes.announceWorkoutComplete(workoutData.planName, workoutData.duration);
    } catch (error) {
      console.error('Error completing workout:', error);
    }
  };

  const handleWorkoutProgress = (progress: any) => {
    setWorkoutProgress(progress);
    // Real-time progress updates can be sent to Firebase here
  };

  const logSet = async (exerciseId: string, setData: LogSet) => {
    if (!activeWorkout || !activeWorkout.id) return;

    try {
      const updatedWorkout = {
        ...activeWorkout,
        exercises: activeWorkout.exercises.map(exercise => {
          if (exercise.id === exerciseId) {
            const newSet = {
              id: crypto.randomUUID(),
              setNumber: setData.setNumber,
              reps: setData.reps,
              weight: setData.weight,
              restTime: setData.restTime,
              completed: true,
              notes: setData.notes,
            };
            return {
              ...exercise,
              sets: [...exercise.sets, newSet],
            };
          }
          return exercise;
        }),
        updatedAt: new Date(),
      };

      // Save to Firebase if available
      if (user) {
        try {
          await workoutService.update(activeWorkout.id, {
            exercises: updatedWorkout.exercises,
            updatedAt: updatedWorkout.updatedAt,
          });
        } catch (firebaseError) {
          console.log('Firebase not available, using local storage:', firebaseError);
        }
      }

      // Update local storage for offline access
      const existingWorkouts = JSON.parse(localStorage.getItem('workouts') || '[]');
      const updatedWorkouts = existingWorkouts.map((w: any) => 
        w.id === activeWorkout.id ? updatedWorkout : w
      );
      localStorage.setItem('workouts', JSON.stringify(updatedWorkouts));

      // Update state
      setActiveWorkout(updatedWorkout);
      setWorkouts(workouts.map(w => w.id === activeWorkout.id ? updatedWorkout : w));

      // Voice announcement
      voiceNotes.speak(`Set ${setData.setNumber} logged successfully!`, 'medium');
      showToast('Set logged successfully!', 'success');
    } catch (error) {
      console.error('Error logging set:', error);
      showToast('Failed to log set. Please try again.', 'error');
    }
  };

  const completeWorkout = async () => {
    if (!activeWorkout || !activeWorkout.id) return;

    try {
      const completedWorkout = {
        ...activeWorkout,
        status: 'completed' as const,
        completedAt: new Date(),
        duration: Math.floor((new Date().getTime() - activeWorkout.startedAt.getTime()) / (1000 * 60)),
        updatedAt: new Date(),
      };

      // Save to Firebase if available
      if (user) {
        try {
          await workoutService.update(activeWorkout.id, {
            status: 'completed',
            completedAt: completedWorkout.completedAt,
            duration: completedWorkout.duration,
            updatedAt: completedWorkout.updatedAt,
          });
        } catch (firebaseError) {
          console.log('Firebase not available, using local storage:', firebaseError);
        }
      }

      // Update local storage for offline access
      const existingWorkouts = JSON.parse(localStorage.getItem('workouts') || '[]');
      const updatedWorkouts = existingWorkouts.map((w: any) => 
        w.id === activeWorkout.id ? completedWorkout : w
      );
      localStorage.setItem('workouts', JSON.stringify(updatedWorkouts));

      // Update state
      setWorkouts(workouts.map(w => w.id === activeWorkout.id ? completedWorkout : w));
      setActiveWorkout(null);

      // Voice announcement
      voiceNotes.announceWorkoutComplete(activeWorkout.name, completedWorkout.duration);
      showToast('Workout completed successfully!', 'success');
    } catch (error) {
      console.error('Error completing workout:', error);
      showToast('Failed to complete workout. Please try again.', 'error');
    }
  };

  const deleteWorkout = async (workoutId: string) => {
    if (window.confirm('Are you sure you want to delete this workout?')) {
      try {
        // Save to Firebase if available
        if (user) {
          try {
            await workoutService.delete(workoutId);
          } catch (firebaseError) {
            console.log('Firebase not available, using local storage:', firebaseError);
          }
        }

        // Update local storage for offline access
        const existingWorkouts = JSON.parse(localStorage.getItem('workouts') || '[]');
        const updatedWorkouts = existingWorkouts.filter((w: any) => w.id !== workoutId);
        localStorage.setItem('workouts', JSON.stringify(updatedWorkouts));

        // Update state
        setWorkouts(workouts.filter(w => w.id !== workoutId));
        if (activeWorkout?.id === workoutId) {
          setActiveWorkout(null);
        }
        showToast('Workout deleted successfully!', 'success');
      } catch (error) {
        console.error('Error deleting workout:', error);
        showToast('Failed to delete workout. Please try again.', 'error');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen hero-gradient relative flex items-center justify-center">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div 
            className="absolute -top-40 -right-40 w-80 h-80 rounded-full blur-3xl"
            style={{ backgroundColor: `${colors.secondary[500]}20` }}
          ></div>
          <div 
            className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full blur-3xl"
            style={{ backgroundColor: `${colors.primary[500]}20` }}
          ></div>
          <div 
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-3xl"
            style={{ backgroundColor: `${colors.secondary[500]}10` }}
          ></div>
        </div>
        <div className="text-center relative z-10">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-gray-300">Loading workout data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen hero-gradient relative p-6">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div 
          className="absolute -top-40 -right-40 w-80 h-80 rounded-full blur-3xl"
          style={{ backgroundColor: `${colors.secondary[500]}20` }}
        ></div>
        <div 
          className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full blur-3xl"
          style={{ backgroundColor: `${colors.primary[500]}20` }}
        ></div>
        <div 
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-3xl"
          style={{ backgroundColor: `${colors.secondary[500]}10` }}
        ></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Navigation Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 transition-colors nav-button text-white hover:text-gray-300"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Dashboard
            </button>
            <div className="text-sm text-secondary">
              {activeWorkout ? 'Active Workout' : 'Workout Tracking'}
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 text-primary">Workout Tracking</h1>
          <p className="text-secondary">Track your workouts and monitor your progress</p>
        </div>

        {/* Auto Workout Tracking */}
        {isAutoTracking && selectedPlan && (
          <div className="mb-8">
            <AutoWorkoutTracker
              plan={selectedPlan}
              onWorkoutComplete={handleAutoWorkoutComplete}
              onWorkoutProgress={handleWorkoutProgress}
            />
          </div>
        )}

        {/* Manual Active Workout (fallback) */}
        {activeWorkout && !isAutoTracking && (
          <div className="mb-8 glassmorphism rounded-lg p-6" style={{ backgroundColor: trackingTheme.activeBg }}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold" style={{ color: 'var(--glassmorphism-text)' }}>
                Active Workout: {activeWorkout.name}
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={completeWorkout}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors"
                >
                  Complete Workout
                </button>
                <button
                  onClick={() => setActiveWorkout(null)}
                  className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
                >
                  Pause
                </button>
              </div>
            </div>
            
            <div className="space-y-4">
              {activeWorkout.exercises.map((exercise) => (
                <ExerciseTracker
                  key={exercise.id}
                  exercise={exercise}
                  onLogSet={(setData) => logSet(exercise.id, setData)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Start New Workout */}
        {!activeWorkout && !isAutoTracking && (
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold" style={{ color: 'var(--glassmorphism-text)' }}>Start New Workout</h2>
              <button
                onClick={() => setShowStartWorkout(true)}
                className="bg-btn-primary-bg text-btn-primary-text px-6 py-2 rounded-lg hover:bg-btn-primary-hover focus:outline-none focus:ring-2 focus:ring-border-focus transition-colors"
              >
                Start Workout
              </button>
            </div>
          </div>
        )}

        {/* Workout History */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--glassmorphism-text)' }}>Workout History</h2>
          <div className="space-y-4">
            {workouts.length === 0 ? (
              <div className="glassmorphism rounded-lg p-8 text-center">
                <div className="text-6xl mb-4">📊</div>
                <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--glassmorphism-text)' }}>
                  No Workouts Yet
                </h3>
                <p style={{ color: 'var(--glassmorphism-text-secondary)' }} className="mb-4">
                  Start your first workout to begin tracking your fitness journey and see your progress here.
                </p>
                <button
                  onClick={() => setShowStartWorkout(true)}
                  className="bg-btn-primary-bg text-btn-primary-text px-6 py-2 rounded-lg hover:bg-btn-primary-hover focus:outline-none focus:ring-2 focus:ring-border-focus transition-colors"
                >
                  Start Your First Workout
                </button>
              </div>
            ) : (
              workouts.map((workout) => (
              <div key={workout.id} className="glassmorphism rounded-lg p-4" style={{ backgroundColor: workout.status === 'completed' ? trackingTheme.completedBg : undefined }}>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold" style={{ color: 'var(--glassmorphism-text)' }}>{workout.name}</h3>
                    {workout.planName && (
                      <p style={{ color: 'var(--glassmorphism-text-secondary)' }}>From: {workout.planName}</p>
                    )}
                    <div className="flex gap-4 mt-2 text-sm" style={{ color: 'var(--glassmorphism-text-muted)' }}>
                      <span>Started: {workout.startedAt.toLocaleDateString()}</span>
                      {workout.completedAt && (
                        <span>Completed: {workout.completedAt.toLocaleDateString()}</span>
                      )}
                      {workout.duration && (
                        <span>Duration: {workout.duration} min</span>
                      )}
                      <span className={`px-2 py-1 rounded text-xs ${
                        workout.status === 'completed' ? 'bg-green-100 text-green-800' :
                        workout.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {workout.status.charAt(0).toUpperCase() + workout.status.slice(1)}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setActiveWorkout(workout)}
                      className="text-gray-300 hover:text-white transition-colors"
                      disabled={workout.status === 'completed'}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => deleteWorkout(workout.id)}
                      className="text-gray-300 hover:text-red-500 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
                
                {workout.exercises.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-md font-medium mb-2" style={{ color: 'var(--glassmorphism-text)' }}>Exercises:</h4>
                    <div className="space-y-2">
                      {workout.exercises.map((exercise) => (
                        <div key={exercise.id} className="text-sm" style={{ color: 'var(--glassmorphism-text-secondary)' }}>
                          <span className="font-medium">{exercise.exerciseName}</span>
                          {exercise.sets.length > 0 && (
                            <span className="ml-2">
                              ({exercise.sets.length} sets completed)
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              ))
            )}
          </div>
        </div>

        {/* Start Workout Modal */}
        {showStartWorkout && (
          <StartWorkoutModal
            plans={plans}
            onStartWorkout={startWorkoutFromPlan}
            onClose={() => setShowStartWorkout(false)}
          />
        )}
      </div>
    </div>
  );
}

// Exercise Tracker Component
interface ExerciseTrackerProps {
  exercise: Workout['exercises'][0];
  onLogSet: (setData: LogSet) => void;
}

function ExerciseTracker({ exercise, onLogSet }: ExerciseTrackerProps) {
  const [currentSet, setCurrentSet] = useState({
    reps: 0,
    weight: 0,
    restTime: 60,
    notes: '',
  });

  const nextSetNumber = exercise.sets.length + 1;

  const handleLogSet = () => {
    if (currentSet.reps > 0) {
      onLogSet({
        exerciseId: exercise.id,
        setNumber: nextSetNumber,
        reps: currentSet.reps,
        weight: currentSet.weight,
        restTime: currentSet.restTime,
        notes: currentSet.notes,
      });
      setCurrentSet({ reps: 0, weight: 0, restTime: 60, notes: '' });
    }
  };

  return (
    <div className="border border-card-border rounded-lg p-4">
      <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--glassmorphism-text)' }}>{exercise.exerciseName}</h3>
      
      {/* Completed Sets */}
      {exercise.sets.length > 0 && (
        <div className="mb-4">
          <h4 className="text-md font-medium mb-2" style={{ color: 'var(--glassmorphism-text-secondary)' }}>Completed Sets:</h4>
          <div className="space-y-2">
            {exercise.sets.map((set) => (
              <div key={set.id} className="flex justify-between items-center glassmorphism rounded p-2">
                <span style={{ color: 'var(--glassmorphism-text)' }}>Set {set.setNumber}</span>
                <span style={{ color: 'var(--glassmorphism-text-secondary)' }}>
                  {set.reps} reps {set.weight > 0 && `@ ${set.weight} lbs`}
                </span>
                <span className="text-green-600">✓</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Log Next Set */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium style={{ color: 'var(--glassmorphism-text-secondary)' }} mb-1">
            Reps
          </label>
          <input
            type="number"
            value={currentSet.reps}
            onChange={(e) => setCurrentSet({...currentSet, reps: parseInt(e.target.value) || 0})}
            className="w-full px-3 py-2 bg-input-bg border border-input-border text-input-text rounded-md focus:outline-none focus:ring-2 focus:ring-border-focus"
            min="0"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium style={{ color: 'var(--glassmorphism-text-secondary)' }} mb-1">
            Weight (lbs)
          </label>
          <input
            type="number"
            value={currentSet.weight}
            onChange={(e) => setCurrentSet({...currentSet, weight: parseFloat(e.target.value) || 0})}
            className="w-full px-3 py-2 bg-input-bg border border-input-border text-input-text rounded-md focus:outline-none focus:ring-2 focus:ring-border-focus"
            min="0"
            step="0.5"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium style={{ color: 'var(--glassmorphism-text-secondary)' }} mb-1">
            Rest (sec)
          </label>
          <input
            type="number"
            value={currentSet.restTime}
            onChange={(e) => setCurrentSet({...currentSet, restTime: parseInt(e.target.value) || 60})}
            className="w-full px-3 py-2 bg-input-bg border border-input-border text-input-text rounded-md focus:outline-none focus:ring-2 focus:ring-border-focus"
            min="0"
          />
        </div>
        
        <div className="flex items-end">
          <button
            onClick={handleLogSet}
            disabled={currentSet.reps === 0}
            className="w-full bg-btn-primary-bg text-btn-primary-text py-2 px-4 rounded-md hover:bg-btn-primary-hover focus:outline-none focus:ring-2 focus:ring-border-focus transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Log Set {nextSetNumber}
          </button>
        </div>
      </div>
      
      <div className="mt-4">
        <label className="block text-sm font-medium style={{ color: 'var(--glassmorphism-text-secondary)' }} mb-1">
          Notes
        </label>
        <input
          type="text"
          value={currentSet.notes}
          onChange={(e) => setCurrentSet({...currentSet, notes: e.target.value})}
          className="w-full px-3 py-2 bg-input-bg border border-input-border text-input-text rounded-md focus:outline-none focus:ring-2 focus:ring-border-focus"
          placeholder="Optional notes..."
        />
      </div>
    </div>
  );
}

// Start Workout Modal Component
interface StartWorkoutModalProps {
  plans: WorkoutPlan[];
  onStartWorkout: (plan: WorkoutPlan) => void;
  onClose: () => void;
}

function StartWorkoutModal({ plans, onStartWorkout, onClose }: StartWorkoutModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<WorkoutPlan | null>(null);

  const handleStartWorkout = () => {
    if (selectedPlan) {
      onStartWorkout(selectedPlan);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="glassmorphism rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold" style={{ color: 'var(--glassmorphism-text)' }}>Start New Workout</h2>
            <button
              onClick={onClose}
              className="text-gray-300 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-4">
            {plans.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-6xl mb-4">💪</div>
                <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--glassmorphism-text)' }}>
                  No Workout Plans Available
                </h3>
                <p style={{ color: 'var(--glassmorphism-text-secondary)' }} className="mb-4">
                  Create your first workout plan to get started with tracking workouts.
                </p>
                <button
                  onClick={() => {
                    onClose();
                    // Navigate to plans page
                    window.location.href = '/plans';
                  }}
                  className="bg-btn-primary-bg text-btn-primary-text px-6 py-2 rounded-lg hover:bg-btn-primary-hover focus:outline-none focus:ring-2 focus:ring-border-focus transition-colors"
                >
                  Create Workout Plan
                </button>
              </div>
            ) : (
              plans.map((plan) => (
                <div
                  key={plan.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                    selectedPlan?.id === plan.id
                      ? 'border-btn-primary-bg bg-btn-primary-bg bg-opacity-10'
                      : 'border-card-border hover:border-btn-primary-bg'
                  }`}
                  onClick={() => setSelectedPlan(plan)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold" style={{ color: 'var(--glassmorphism-text)' }}>{plan.name}</h3>
                      {plan.description && (
                        <p className="mt-1" style={{ color: 'var(--glassmorphism-text-secondary)' }}>{plan.description}</p>
                      )}
                      <div className="flex gap-4 mt-2 text-sm" style={{ color: 'var(--glassmorphism-text-muted)' }}>
                        <span>Duration: {plan.duration} min</span>
                        <span>Exercises: {plan.exercises.length}</span>
                        <span className="capitalize">{plan.difficulty}</span>
                      </div>
                    </div>
                    <div className={`w-4 h-4 rounded-full border-2 ${
                      selectedPlan?.id === plan.id
                        ? 'border-btn-primary-bg bg-btn-primary-bg'
                        : 'border-card-border'
                    }`} />
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="flex justify-end gap-4 pt-6 border-t border-card-border">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-card-border text-white rounded-md hover:glassmorphism focus:outline-none focus:ring-2 focus:ring-border-focus transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleStartWorkout}
              disabled={!selectedPlan}
              className="px-6 py-2 bg-btn-primary-bg text-btn-primary-text rounded-md hover:bg-btn-primary-hover focus:outline-none focus:ring-2 focus:ring-border-focus transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Start Workout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
