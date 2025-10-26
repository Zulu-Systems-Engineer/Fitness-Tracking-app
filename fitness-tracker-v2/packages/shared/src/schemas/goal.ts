import { z } from 'zod';

export const GoalSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  title: z.string().min(1, 'Goal title is required'),
  description: z.string().optional(),
  type: z.enum(['weight_loss', 'weight_gain', 'muscle_gain', 'endurance', 'strength', 'flexibility', 'custom']),
  targetValue: z.number().min(0, 'Target value must be non-negative'),
  currentValue: z.number().min(0, 'Current value must be non-negative').default(0),
  unit: z.string().min(1, 'Unit is required'), // e.g., 'kg', 'lbs', 'miles', 'minutes', 'reps'
  targetDate: z.date(),
  status: z.enum(['active', 'completed', 'paused', 'cancelled']).default('active'),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  isPublic: z.boolean().default(false),
  createdAt: z.date(),
  updatedAt: z.date(),
  completedAt: z.date().optional(),
});

export const CreateGoalSchema = GoalSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  completedAt: true,
});

export const UpdateGoalSchema = CreateGoalSchema.partial();

export const UpdateGoalProgressSchema = z.object({
  currentValue: z.number().min(0, 'Current value must be non-negative'),
  notes: z.string().optional(),
});

export const CompleteGoalSchema = z.object({
  notes: z.string().optional(),
});

export const GoalFiltersSchema = z.object({
  type: z.enum(['weight_loss', 'weight_gain', 'muscle_gain', 'endurance', 'strength', 'flexibility', 'custom']).optional(),
  status: z.enum(['active', 'completed', 'paused', 'cancelled']).optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  isPublic: z.boolean().optional(),
  userId: z.string().uuid().optional(),
  dateFrom: z.date().optional(),
  dateTo: z.date().optional(),
  search: z.string().optional(),
});

export type Goal = z.infer<typeof GoalSchema>;
export type CreateGoal = z.infer<typeof CreateGoalSchema>;
export type UpdateGoal = z.infer<typeof UpdateGoalSchema>;
export type UpdateGoalProgress = z.infer<typeof UpdateGoalProgressSchema>;
export type CompleteGoal = z.infer<typeof CompleteGoalSchema>;
export type GoalFilters = z.infer<typeof GoalFiltersSchema>;

