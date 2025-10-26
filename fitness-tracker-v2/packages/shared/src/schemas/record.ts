import { z } from 'zod';

export const PersonalRecordSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  exerciseId: z.string().uuid(),
  exerciseName: z.string().min(1, 'Exercise name is required'),
  recordType: z.enum(['max_weight', 'max_reps', 'max_volume', 'max_duration', 'best_time']),
  value: z.number().min(0, 'Record value must be non-negative'),
  unit: z.string().min(1, 'Unit is required'), // e.g., 'lbs', 'kg', 'reps', 'min', 'sec'
  previousRecord: z.number().min(0).optional(),
  improvement: z.number().optional(), // percentage or absolute improvement
  workoutId: z.string().uuid(),
  workoutDate: z.date(),
  notes: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const CreatePersonalRecordSchema = PersonalRecordSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const UpdatePersonalRecordSchema = PersonalRecordSchema.partial().omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
});

export const RecordFiltersSchema = z.object({
  exerciseId: z.string().uuid().optional(),
  recordType: z.enum(['max_weight', 'max_reps', 'max_volume', 'max_duration', 'best_time']).optional(),
  userId: z.string().uuid().optional(),
  dateFrom: z.date().optional(),
  dateTo: z.date().optional(),
  search: z.string().optional(),
});

export const RecordStatsSchema = z.object({
  totalRecords: z.number().int().min(0),
  recordsThisMonth: z.number().int().min(0),
  recordsThisYear: z.number().int().min(0),
  mostImprovedExercise: z.string().optional(),
  biggestImprovement: z.number().optional(),
  recentRecords: z.array(PersonalRecordSchema).max(10),
});

export type PersonalRecord = z.infer<typeof PersonalRecordSchema>;
export type CreatePersonalRecord = z.infer<typeof CreatePersonalRecordSchema>;
export type UpdatePersonalRecord = z.infer<typeof UpdatePersonalRecordSchema>;
export type RecordFilters = z.infer<typeof RecordFiltersSchema>;
export type RecordStats = z.infer<typeof RecordStatsSchema>;

