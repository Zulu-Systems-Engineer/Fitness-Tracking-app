import { Router } from 'express';
import { z } from 'zod';
import {
  WorkoutStatsSchema,
  VolumeProgressionSchema,
  FrequencyStatsSchema,
  ExerciseAnalyticsSchema,
  AnalyticsFiltersSchema,
  DashboardMetricsSchema,
  type WorkoutStats,
  type VolumeProgression,
  type FrequencyStats,
  type ExerciseAnalytics,
  type AnalyticsFilters,
  type DashboardMetrics,
} from '../../packages/shared/src/schemas';

const router = Router();

// In-memory storage for demo purposes
// In production, this would be replaced with a database
const workouts: any[] = [];
const personalRecords: any[] = [];

// Helper function to calculate workout statistics
const calculateWorkoutStats = (userId?: string): WorkoutStats => {
  let userWorkouts = workouts;
  if (userId) {
    userWorkouts = workouts.filter(w => w.userId === userId);
  }

  const now = new Date();
  const thisWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const thisYear = new Date(now.getFullYear(), 0, 1);

  const totalWorkouts = userWorkouts.length;
  const totalDuration = userWorkouts.reduce((sum, w) => sum + (w.duration || 0), 0);
  const averageDuration = totalWorkouts > 0 ? totalDuration / totalWorkouts : 0;

  // Calculate total volume (sum of all weight * reps)
  const totalVolume = userWorkouts.reduce((sum, workout) => {
    return sum + workout.exercises.reduce((exerciseSum: number, exercise: any) => {
      return exerciseSum + exercise.sets.reduce((setSum: number, set: any) => {
        return setSum + ((set.weight || 0) * (set.reps || 0));
      }, 0);
    }, 0);
  }, 0);

  const averageVolume = totalWorkouts > 0 ? totalVolume / totalWorkouts : 0;

  const workoutsThisWeek = userWorkouts.filter(w => w.startedAt >= thisWeek).length;
  const workoutsThisMonth = userWorkouts.filter(w => w.startedAt >= thisMonth).length;
  const workoutsThisYear = userWorkouts.filter(w => w.startedAt >= thisYear).length;

  // Calculate streaks (simplified)
  const sortedWorkouts = userWorkouts
    .filter(w => w.status === 'completed')
    .sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime());

  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;
  let lastWorkoutDate: Date | null = null;

  for (let i = 0; i < sortedWorkouts.length; i++) {
    const workout = sortedWorkouts[i];
    const workoutDate = new Date(workout.startedAt);
    const dayStart = new Date(workoutDate.getFullYear(), workoutDate.getMonth(), workoutDate.getDate());
    
    if (i === 0) {
      const today = new Date();
      const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const daysDiff = Math.floor((todayStart.getTime() - dayStart.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff <= 1) {
        currentStreak = 1;
        tempStreak = 1;
        lastWorkoutDate = workoutDate;
      }
    } else {
      const prevWorkout = sortedWorkouts[i - 1];
      const prevDate = new Date(prevWorkout.startedAt);
      const prevDayStart = new Date(prevDate.getFullYear(), prevDate.getMonth(), prevDate.getDate());
      const daysDiff = Math.floor((dayStart.getTime() - prevDayStart.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === 1) {
        tempStreak++;
        if (i === 1) currentStreak = tempStreak;
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 1;
      }
    }
  }

  longestStreak = Math.max(longestStreak, tempStreak);

  // Find most frequent exercise
  const exerciseCounts = userWorkouts.reduce((acc, workout) => {
    workout.exercises.forEach((exercise: any) => {
      const key = exercise.exerciseName;
      acc[key] = (acc[key] || 0) + 1;
    });
    return acc;
  }, {} as Record<string, number>);

  const mostFrequentExercise = Object.entries(exerciseCounts)
    .sort(([,a], [,b]) => b - a)[0]?.[0];

  // Find favorite workout plan
  const planCounts = userWorkouts.reduce((acc, workout) => {
    if (workout.planName) {
      acc[workout.planName] = (acc[workout.planName] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const favoriteWorkoutPlan = Object.entries(planCounts)
    .sort(([,a], [,b]) => b - a)[0]?.[0];

  return {
    totalWorkouts,
    totalDuration,
    averageDuration,
    totalVolume,
    averageVolume,
    workoutsThisWeek,
    workoutsThisMonth,
    workoutsThisYear,
    longestStreak,
    currentStreak,
    mostFrequentExercise,
    favoriteWorkoutPlan,
    lastWorkoutDate: sortedWorkouts[0]?.startedAt,
    firstWorkoutDate: sortedWorkouts[sortedWorkouts.length - 1]?.startedAt,
  };
};

// Helper function to calculate volume progression
const calculateVolumeProgression = (userId?: string, period: 'week' | 'month' = 'week'): VolumeProgression[] => {
  let userWorkouts = workouts;
  if (userId) {
    userWorkouts = workouts.filter(w => w.userId === userId);
  }

  const now = new Date();
  const periods = period === 'week' ? 12 : 12; // 12 weeks or 12 months
  const periodMs = period === 'week' ? 7 * 24 * 60 * 60 * 1000 : 30 * 24 * 60 * 60 * 1000;

  const progression: VolumeProgression[] = [];

  for (let i = periods - 1; i >= 0; i--) {
    const periodStart = new Date(now.getTime() - (i + 1) * periodMs);
    const periodEnd = new Date(now.getTime() - i * periodMs);
    
    const periodWorkouts = userWorkouts.filter(w => 
      w.startedAt >= periodStart && w.startedAt < periodEnd && w.status === 'completed'
    );

    const totalVolume = periodWorkouts.reduce((sum, workout) => {
      return sum + workout.exercises.reduce((exerciseSum: number, exercise: any) => {
        return exerciseSum + exercise.sets.reduce((setSum: number, set: any) => {
          return setSum + ((set.weight || 0) * (set.reps || 0));
        }, 0);
      }, 0);
    }, 0);

    const totalDuration = periodWorkouts.reduce((sum, w) => sum + (w.duration || 0), 0);
    const averageVolume = periodWorkouts.length > 0 ? totalVolume / periodWorkouts.length : 0;

    progression.push({
      date: periodStart,
      totalVolume,
      workoutCount: periodWorkouts.length,
      averageVolume,
    });
  }

  return progression;
};

// Helper function to calculate frequency stats
const calculateFrequencyStats = (userId?: string, period: 'daily' | 'weekly' | 'monthly' = 'weekly'): FrequencyStats => {
  let userWorkouts = workouts;
  if (userId) {
    userWorkouts = workouts.filter(w => w.userId === userId);
  }

  const now = new Date();
  const data: FrequencyStats['data'] = [];

  if (period === 'weekly') {
    // Last 12 weeks
    for (let i = 11; i >= 0; i--) {
      const weekStart = new Date(now.getTime() - (i + 1) * 7 * 24 * 60 * 60 * 1000);
      const weekEnd = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);
      
      const weekWorkouts = userWorkouts.filter(w => 
        w.startedAt >= weekStart && w.startedAt < weekEnd && w.status === 'completed'
      );

      const totalDuration = weekWorkouts.reduce((sum, w) => sum + (w.duration || 0), 0);
      const averageDuration = weekWorkouts.length > 0 ? totalDuration / weekWorkouts.length : 0;

      data.push({
        period: `Week ${12 - i}`,
        workoutCount: weekWorkouts.length,
        totalDuration,
        averageDuration,
      });
    }
  } else if (period === 'monthly') {
    // Last 12 months
    for (let i = 11; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      
      const monthWorkouts = userWorkouts.filter(w => 
        w.startedAt >= monthStart && w.startedAt < monthEnd && w.status === 'completed'
      );

      const totalDuration = monthWorkouts.reduce((sum, w) => sum + (w.duration || 0), 0);
      const averageDuration = monthWorkouts.length > 0 ? totalDuration / monthWorkouts.length : 0;

      data.push({
        period: monthStart.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        workoutCount: monthWorkouts.length,
        totalDuration,
        averageDuration,
      });
    }
  }

  return {
    period,
    data,
  };
};

// GET /api/analytics/stats - Get workout statistics
router.get('/stats', (req, res) => {
  try {
    const filters = AnalyticsFiltersSchema.parse(req.query);
    const stats = calculateWorkoutStats(filters.userId);

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Invalid query parameters',
        details: error.errors,
      });
    }
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

// GET /api/analytics/volume-progression - Get volume progression data
router.get('/volume-progression', (req, res) => {
  try {
    const { userId, period = 'week' } = req.query;
    const progression = calculateVolumeProgression(userId as string, period as 'week' | 'month');

    res.json({
      success: true,
      data: progression,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

// GET /api/analytics/frequency - Get frequency statistics
router.get('/frequency', (req, res) => {
  try {
    const { userId, period = 'weekly' } = req.query;
    const frequencyStats = calculateFrequencyStats(userId as string, period as 'daily' | 'weekly' | 'monthly');

    res.json({
      success: true,
      data: frequencyStats,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

// GET /api/analytics/exercises - Get exercise analytics
router.get('/exercises', (req, res) => {
  try {
    const { userId } = req.query;
    let userWorkouts = workouts;
    if (userId) {
      userWorkouts = workouts.filter(w => w.userId === userId);
    }

    const exerciseMap = new Map<string, ExerciseAnalytics>();

    userWorkouts.forEach(workout => {
      workout.exercises.forEach((exercise: any) => {
        const key = exercise.exerciseId;
        if (!exerciseMap.has(key)) {
          exerciseMap.set(key, {
            exerciseId: exercise.exerciseId,
            exerciseName: exercise.exerciseName,
            totalSets: 0,
            totalReps: 0,
            totalVolume: 0,
            averageWeight: 0,
            maxWeight: 0,
            personalRecords: 0,
            lastPerformed: undefined,
            frequency: 0,
            improvement: undefined,
          });
        }

        const analytics = exerciseMap.get(key)!;
        analytics.totalSets += exercise.sets.length;
        
        exercise.sets.forEach((set: any) => {
          analytics.totalReps += set.reps || 0;
          const volume = (set.weight || 0) * (set.reps || 0);
          analytics.totalVolume += volume;
          analytics.maxWeight = Math.max(analytics.maxWeight, set.weight || 0);
        });

        analytics.averageWeight = analytics.totalSets > 0 ? analytics.totalVolume / analytics.totalReps : 0;
        analytics.lastPerformed = workout.startedAt;
      });
    });

    // Calculate frequency (workouts per week)
    const now = new Date();
    const lastMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const recentWorkouts = userWorkouts.filter(w => w.startedAt >= lastMonth);
    
    exerciseMap.forEach(analytics => {
      const exerciseWorkouts = recentWorkouts.filter(w => 
        w.exercises.some((e: any) => e.exerciseId === analytics.exerciseId)
      );
      analytics.frequency = exerciseWorkouts.length / 4; // 4 weeks in a month
    });

    // Count personal records
    const userRecords = personalRecords.filter(r => !userId || r.userId === userId);
    exerciseMap.forEach(analytics => {
      analytics.personalRecords = userRecords.filter(r => r.exerciseId === analytics.exerciseId).length;
    });

    const topExercises = Array.from(exerciseMap.values())
      .sort((a, b) => b.totalVolume - a.totalVolume)
      .slice(0, 10);

    res.json({
      success: true,
      data: topExercises,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

// GET /api/analytics/dashboard - Get dashboard metrics
router.get('/dashboard', (req, res) => {
  try {
    const { userId } = req.query;
    const filters = AnalyticsFiltersSchema.parse(req.query);

    const workoutStats = calculateWorkoutStats(filters.userId);
    const volumeProgression = calculateVolumeProgression(filters.userId, 'week');
    const frequencyStats = calculateFrequencyStats(filters.userId, 'weekly');

    // Get top exercises
    const exerciseMap = new Map<string, ExerciseAnalytics>();
    const userWorkouts = workouts.filter(w => !filters.userId || w.userId === filters.userId);

    userWorkouts.forEach(workout => {
      workout.exercises.forEach((exercise: any) => {
        const key = exercise.exerciseId;
        if (!exerciseMap.has(key)) {
          exerciseMap.set(key, {
            exerciseId: exercise.exerciseId,
            exerciseName: exercise.exerciseName,
            totalSets: 0,
            totalReps: 0,
            totalVolume: 0,
            averageWeight: 0,
            maxWeight: 0,
            personalRecords: 0,
            lastPerformed: undefined,
            frequency: 0,
            improvement: undefined,
          });
        }

        const analytics = exerciseMap.get(key)!;
        analytics.totalSets += exercise.sets.length;
        
        exercise.sets.forEach((set: any) => {
          analytics.totalReps += set.reps || 0;
          const volume = (set.weight || 0) * (set.reps || 0);
          analytics.totalVolume += volume;
          analytics.maxWeight = Math.max(analytics.maxWeight, set.weight || 0);
        });

        analytics.averageWeight = analytics.totalSets > 0 ? analytics.totalVolume / analytics.totalReps : 0;
        analytics.lastPerformed = workout.startedAt;
      });
    });

    const topExercises = Array.from(exerciseMap.values())
      .sort((a, b) => b.totalVolume - a.totalVolume)
      .slice(0, 10);

    // Recent activity
    const recentActivity = [
      ...userWorkouts.slice(0, 3).map(w => ({
        type: 'workout' as const,
        description: `Completed ${w.name}`,
        date: w.startedAt,
        value: w.duration,
      })),
      ...personalRecords.slice(0, 2).map(r => ({
        type: 'record' as const,
        description: `New PR: ${r.exerciseName}`,
        date: r.workoutDate,
        value: r.value,
      })),
    ].sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 5);

    const dashboardMetrics: DashboardMetrics = {
      workoutStats,
      volumeProgression,
      frequencyStats,
      topExercises,
      recentActivity,
    };

    res.json({
      success: true,
      data: dashboardMetrics,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Invalid query parameters',
        details: error.errors,
      });
    }
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

export default router;

