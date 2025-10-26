import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { workoutPlanService } from '../lib/firebaseServices';
import { voiceNotes } from '../lib/voiceNotes';

// Form validation schema
const createPlanSchema = z.object({
  name: z.string().min(3, 'Plan name must be at least 3 characters'),
  description: z.string().optional(),
  duration: z.number().min(1, 'Duration must be at least 1 minute').max(480, 'Duration cannot exceed 480 minutes'),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  category: z.string().optional(),
  isPublic: z.boolean().default(false),
  exercises: z.array(z.object({
    name: z.string().min(1, 'Exercise name is required'),
    description: z.string().optional(),
    targetMuscles: z.array(z.string()).min(1, 'At least one target muscle is required'),
    equipment: z.string().optional(),
    instructions: z.array(z.string()).optional(),
    restTime: z.number().optional(),
    notes: z.string().optional(),
  })).min(1, 'At least one exercise is required'),
});

type CreatePlanFormData = z.infer<typeof createPlanSchema>;

interface PlanFormProps {
  plan?: any;
  onSave: (data: CreatePlanFormData) => void;
  onClose: () => void;
}

export function PlanForm({ plan, onSave, onClose }: PlanFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    control,
  } = useForm<CreatePlanFormData>({
    resolver: zodResolver(createPlanSchema),
    defaultValues: plan ? {
      name: plan.name,
      description: plan.description,
      duration: plan.duration,
      difficulty: plan.difficulty,
      category: plan.category,
      isPublic: plan.isPublic,
      exercises: plan.exercises || [],
    } : {
      name: '',
      description: '',
      duration: 30,
      difficulty: 'beginner',
      category: '',
      isPublic: false,
      exercises: [],
    },
  });

  // TanStack Query mutation for creating/updating plans
  const createPlanMutation = useMutation({
    mutationFn: async (data: CreatePlanFormData) => {
      if (plan) {
        return await workoutPlanService.update(plan.id, data);
      } else {
        return await workoutPlanService.create(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workoutPlans'] });
      voiceNotes.speak(plan ? 'Plan updated successfully!' : 'Plan created successfully!');
      onClose();
    },
    onError: (error) => {
      console.error('Error saving plan:', error);
      voiceNotes.speak('Failed to save plan. Please try again.');
    },
  });

  const onSubmit = async (data: CreatePlanFormData) => {
    setIsSubmitting(true);
    try {
      await createPlanMutation.mutateAsync(data);
      onSave(data);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const addExercise = () => {
    const currentExercises = watch('exercises');
    setValue('exercises', [
      ...currentExercises,
      {
        name: '',
        description: '',
        targetMuscles: [],
        equipment: '',
        instructions: [],
        restTime: 60,
        notes: '',
      },
    ]);
  };

  const removeExercise = (index: number) => {
    const currentExercises = watch('exercises');
    setValue('exercises', currentExercises.filter((_, i) => i !== index));
  };

  const addTargetMuscle = (exerciseIndex: number) => {
    const currentExercises = watch('exercises');
    const updatedExercises = [...currentExercises];
    updatedExercises[exerciseIndex].targetMuscles.push('');
    setValue('exercises', updatedExercises);
  };

  const removeTargetMuscle = (exerciseIndex: number, muscleIndex: number) => {
    const currentExercises = watch('exercises');
    const updatedExercises = [...currentExercises];
    updatedExercises[exerciseIndex].targetMuscles.splice(muscleIndex, 1);
    setValue('exercises', updatedExercises);
  };

  const addInstruction = (exerciseIndex: number) => {
    const currentExercises = watch('exercises');
    const updatedExercises = [...currentExercises];
    updatedExercises[exerciseIndex].instructions.push('');
    setValue('exercises', updatedExercises);
  };

  const removeInstruction = (exerciseIndex: number, instructionIndex: number) => {
    const currentExercises = watch('exercises');
    const updatedExercises = [...currentExercises];
    updatedExercises[exerciseIndex].instructions.splice(instructionIndex, 1);
    setValue('exercises', updatedExercises);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {plan ? 'Edit Workout Plan' : 'Create Workout Plan'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Plan Name *
                </label>
                <input
                  {...register('name')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter plan name"
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration (minutes) *
                </label>
                <input
                  {...register('duration', { valueAsNumber: true })}
                  type="number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="1"
                  max="480"
                />
                {errors.duration && (
                  <p className="text-red-500 text-sm mt-1">{errors.duration.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Difficulty *
                </label>
                <select
                  {...register('difficulty')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
                {errors.difficulty && (
                  <p className="text-red-500 text-sm mt-1">{errors.difficulty.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <input
                  {...register('category')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Strength, Cardio, HIIT"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                {...register('description')}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Describe your workout plan"
              />
            </div>

            <div className="flex items-center">
              <input
                {...register('isPublic')}
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-700">
                Make this plan public
              </label>
            </div>

            {/* Exercises */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Exercises</h3>
                <button
                  type="button"
                  onClick={addExercise}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Add Exercise
                </button>
              </div>

              {watch('exercises').map((exercise, exerciseIndex) => (
                <div key={exerciseIndex} className="border border-gray-200 rounded-lg p-4 mb-4">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-md font-medium text-gray-900">
                      Exercise {exerciseIndex + 1}
                    </h4>
                    <button
                      type="button"
                      onClick={() => removeExercise(exerciseIndex)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Exercise Name *
                      </label>
                      <input
                        {...register(`exercises.${exerciseIndex}.name`)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter exercise name"
                      />
                      {errors.exercises?.[exerciseIndex]?.name && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.exercises[exerciseIndex]?.name?.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Equipment
                      </label>
                      <input
                        {...register(`exercises.${exerciseIndex}.equipment`)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., Dumbbells, Barbell, Bodyweight"
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Target Muscles *
                    </label>
                    {exercise.targetMuscles.map((muscle, muscleIndex) => (
                      <div key={muscleIndex} className="flex gap-2 mb-2">
                        <input
                          {...register(`exercises.${exerciseIndex}.targetMuscles.${muscleIndex}`)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter muscle group"
                        />
                        <button
                          type="button"
                          onClick={() => removeTargetMuscle(exerciseIndex, muscleIndex)}
                          className="px-3 py-2 text-red-600 hover:text-red-800"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addTargetMuscle(exerciseIndex)}
                      className="px-3 py-1 text-blue-600 hover:text-blue-800 text-sm"
                    >
                      + Add Muscle Group
                    </button>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Instructions
                    </label>
                    {exercise.instructions?.map((instruction, instructionIndex) => (
                      <div key={instructionIndex} className="flex gap-2 mb-2">
                        <input
                          {...register(`exercises.${exerciseIndex}.instructions.${instructionIndex}`)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter instruction step"
                        />
                        <button
                          type="button"
                          onClick={() => removeInstruction(exerciseIndex, instructionIndex)}
                          className="px-3 py-2 text-red-600 hover:text-red-800"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addInstruction(exerciseIndex)}
                      className="px-3 py-1 text-blue-600 hover:text-blue-800 text-sm"
                    >
                      + Add Instruction
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Rest Time (seconds)
                      </label>
                      <input
                        {...register(`exercises.${exerciseIndex}.restTime`, { valueAsNumber: true })}
                        type="number"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="0"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Notes
                      </label>
                      <input
                        {...register(`exercises.${exerciseIndex}.notes`)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Additional notes"
                      />
                    </div>
                  </div>
                </div>
              ))}

              {errors.exercises && (
                <p className="text-red-500 text-sm mt-1">{errors.exercises.message}</p>
              )}
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-4 pt-6 border-t">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {isSubmitting ? 'Saving...' : (plan ? 'Update Plan' : 'Create Plan')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
