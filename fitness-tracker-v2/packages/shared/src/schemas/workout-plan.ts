import { z } from 'zod';

export const ExerciseSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'Exercise name is required'),
  sets: z.number().int().min(1, 'At least 1 set is required'),
  reps: z.number().int().min(1, 'At least 1 rep is required'),
  weight: z.number().min(0, 'Weight must be non-negative').optional(),
  restTime: z.number().int().min(0, 'Rest time must be non-negative').optional(), // in seconds
  notes: z.string().optional(),
});

export const WorkoutPlanSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'Plan name is required'),
  description: z.string().optional(),
  exercises: z.array(ExerciseSchema).min(1, 'At least one exercise is required'),
  duration: z.number().int().min(1, 'Duration must be at least 1 minute'), // in minutes
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  category: z.enum(['strength', 'cardio', 'flexibility', 'mixed']),
  isPublic: z.boolean().default(false),
  createdBy: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const CreateWorkoutPlanSchema = WorkoutPlanSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const UpdateWorkoutPlanSchema = CreateWorkoutPlanSchema.partial();

export const WorkoutPlanFiltersSchema = z.object({
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  category: z.enum(['strength', 'cardio', 'flexibility', 'mixed']).optional(),
  isPublic: z.boolean().optional(),
  createdBy: z.string().uuid().optional(),
  search: z.string().optional(),
});

export type Exercise = z.infer<typeof ExerciseSchema>;
export type WorkoutPlan = z.infer<typeof WorkoutPlanSchema>;
export type CreateWorkoutPlan = z.infer<typeof CreateWorkoutPlanSchema>;
export type UpdateWorkoutPlan = z.infer<typeof UpdateWorkoutPlanSchema>;
export type WorkoutPlanFilters = z.infer<typeof WorkoutPlanFiltersSchema>;

