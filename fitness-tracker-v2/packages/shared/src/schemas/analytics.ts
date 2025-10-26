import { z } from 'zod';

export const WorkoutStatsSchema = z.object({
  totalWorkouts: z.number().int().min(0),
  totalDuration: z.number().min(0), // in minutes
  averageDuration: z.number().min(0), // in minutes
  totalVolume: z.number().min(0), // total weight lifted
  averageVolume: z.number().min(0), // average weight per workout
  workoutsThisWeek: z.number().int().min(0),
  workoutsThisMonth: z.number().int().min(0),
  workoutsThisYear: z.number().int().min(0),
  longestStreak: z.number().int().min(0), // in days
  currentStreak: z.number().int().min(0), // in days
  mostFrequentExercise: z.string().optional(),
  favoriteWorkoutPlan: z.string().optional(),
  lastWorkoutDate: z.date().optional(),
  firstWorkoutDate: z.date().optional(),
});

export const VolumeProgressionSchema = z.object({
  date: z.date(),
  totalVolume: z.number().min(0),
  workoutCount: z.number().int().min(0),
  averageVolume: z.number().min(0),
});

export const FrequencyStatsSchema = z.object({
  period: z.enum(['daily', 'weekly', 'monthly']),
  data: z.array(z.object({
    period: z.string(),
    workoutCount: z.number().int().min(0),
    totalDuration: z.number().min(0),
    averageDuration: z.number().min(0),
  })),
});

export const ExerciseAnalyticsSchema = z.object({
  exerciseId: z.string().uuid(),
  exerciseName: z.string(),
  totalSets: z.number().int().min(0),
  totalReps: z.number().int().min(0),
  totalVolume: z.number().min(0),
  averageWeight: z.number().min(0),
  maxWeight: z.number().min(0),
  personalRecords: z.number().int().min(0),
  lastPerformed: z.date().optional(),
  frequency: z.number().min(0), // times per week
  improvement: z.number().optional(), // percentage improvement
});

export const AnalyticsFiltersSchema = z.object({
  userId: z.string().uuid().optional(),
  dateFrom: z.date().optional(),
  dateTo: z.date().optional(),
  exerciseId: z.string().uuid().optional(),
  period: z.enum(['week', 'month', 'quarter', 'year']).optional(),
});

export const DashboardMetricsSchema = z.object({
  workoutStats: WorkoutStatsSchema,
  volumeProgression: z.array(VolumeProgressionSchema),
  frequencyStats: FrequencyStatsSchema,
  topExercises: z.array(ExerciseAnalyticsSchema).max(10),
  recentActivity: z.array(z.object({
    type: z.enum(['workout', 'record', 'goal']),
    description: z.string(),
    date: z.date(),
    value: z.number().optional(),
  })).max(5),
});

export type WorkoutStats = z.infer<typeof WorkoutStatsSchema>;
export type VolumeProgression = z.infer<typeof VolumeProgressionSchema>;
export type FrequencyStats = z.infer<typeof FrequencyStatsSchema>;
export type ExerciseAnalytics = z.infer<typeof ExerciseAnalyticsSchema>;
export type AnalyticsFilters = z.infer<typeof AnalyticsFiltersSchema>;
export type DashboardMetrics = z.infer<typeof DashboardMetricsSchema>;

