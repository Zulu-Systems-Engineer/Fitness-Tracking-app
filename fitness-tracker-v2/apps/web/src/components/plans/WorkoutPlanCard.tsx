import React, { memo, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

interface WorkoutPlanCardProps {
  plan: {
    id: string;
    name: string;
    description?: string;
    duration: number;
    difficulty: string;
    category?: string;
    exerciseCount: number;
    createdAt: Date;
  };
  onStartWorkout?: (planId: string) => void;
  onEdit?: (planId: string) => void;
  onDelete?: (planId: string) => void;
}

export const WorkoutPlanCard = memo<WorkoutPlanCardProps>(({
  plan,
  onStartWorkout,
  onEdit,
  onDelete
}) => {
  const navigate = useNavigate();

  const difficultyColor = useMemo(() => {
    switch (plan.difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }, [plan.difficulty]);

  const handleStartWorkout = useCallback(() => {
    if (onStartWorkout) {
      onStartWorkout(plan.id);
    } else {
      navigate(`/track?plan=${plan.id}`);
    }
  }, [plan.id, onStartWorkout, navigate]);

  const handleEdit = useCallback(() => {
    if (onEdit) {
      onEdit(plan.id);
    }
  }, [plan.id, onEdit]);

  const handleDelete = useCallback(() => {
    if (onDelete) {
      onDelete(plan.id);
    }
  }, [plan.id, onDelete]);

  return (
    <div className="glassmorphism p-6 rounded-xl hover:scale-105 transition-transform duration-200">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-primary mb-2">{plan.name}</h3>
          {plan.description && (
            <p className="text-sm text-secondary mb-3">{plan.description}</p>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleEdit}
            className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
            title="Edit plan"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={handleDelete}
            className="p-2 text-gray-600 hover:text-red-600 transition-colors"
            title="Delete plan"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-4">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${difficultyColor}`}>
          {plan.difficulty}
        </span>
        {plan.category && (
          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
            {plan.category}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between text-sm text-muted mb-4">
        <span>{plan.duration} min</span>
        <span>{plan.exerciseCount} exercises</span>
        <span>{plan.createdAt.toLocaleDateString()}</span>
      </div>

      <button
        onClick={handleStartWorkout}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
      >
        Start Workout
      </button>
    </div>
  );
});

WorkoutPlanCard.displayName = 'WorkoutPlanCard';
