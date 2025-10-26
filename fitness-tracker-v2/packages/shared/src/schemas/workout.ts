import { z } from 'zod';

export const WorkoutSetSchema = z.object({
  id: z.string().uuid(),
  setNumber: z.number().int().min(1, 'Set number must be at least 1'),
  reps: z.number().int().min(0, 'Reps must be non-negative'),
  weight: z.number().min(0, 'Weight must be non-negative').optional(),
  restTime: z.number().int().min(0, 'Rest time must be non-negative').optional(), // in seconds
  completed: z.boolean().default(false),
  notes: z.string().optional(),
});

export const WorkoutExerciseSchema = z.object({
  id: z.string().uuid(),
  exerciseId: z.string().uuid(),
  exerciseName: z.string().min(1, 'Exercise name is required'),
  sets: z.array(WorkoutSetSchema).min(1, 'At least one set is required'),
  notes: z.string().optional(),
});

export const WorkoutSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  planId: z.string().uuid().optional(), // Optional if created from a plan
  planName: z.string().optional(),
  name: z.string().min(1, 'Workout name is required'),
  exercises: z.array(WorkoutExerciseSchema).min(1, 'At least one exercise is required'),
  status: z.enum(['in_progress', 'completed', 'cancelled']).default('in_progress'),
  startedAt: z.date(),
  completedAt: z.date().optional(),
  duration: z.number().int().min(0, 'Duration must be non-negative').optional(), // in minutes
  notes: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const CreateWorkoutSchema = WorkoutSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const UpdateWorkoutSchema = WorkoutSchema.partial().omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
});

export const StartWorkoutFromPlanSchema = z.object({
  planId: z.string().uuid(),
  name: z.string().optional(), // Optional custom name
});

export const LogSetSchema = z.object({
  exerciseId: z.string().uuid(),
  setNumber: z.number().int().min(1, 'Set number must be at least 1'),
  reps: z.number().int().min(0, 'Reps must be non-negative'),
  weight: z.number().min(0, 'Weight must be non-negative').optional(),
  restTime: z.number().int().min(0, 'Rest time must be non-negative').optional(),
  notes: z.string().optional(),
});

export const CompleteWorkoutSchema = z.object({
  notes: z.string().optional(),
});

export const WorkoutFiltersSchema = z.object({
  status: z.enum(['in_progress', 'completed', 'cancelled']).optional(),
  planId: z.string().uuid().optional(),
  userId: z.string().uuid().optional(),
  dateFrom: z.date().optional(),
  dateTo: z.date().optional(),
});

export type WorkoutSet = z.infer<typeof WorkoutSetSchema>;
export type WorkoutExercise = z.infer<typeof WorkoutExerciseSchema>;
export type Workout = z.infer<typeof WorkoutSchema>;
export type CreateWorkout = z.infer<typeof CreateWorkoutSchema>;
export type UpdateWorkout = z.infer<typeof UpdateWorkoutSchema>;
export type StartWorkoutFromPlan = z.infer<typeof StartWorkoutFromPlanSchema>;
export type LogSet = z.infer<typeof LogSetSchema>;
export type CompleteWorkout = z.infer<typeof CompleteWorkoutSchema>;
export type WorkoutFilters = z.infer<typeof WorkoutFiltersSchema>;

