import React, { memo, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

interface GoalCardProps {
  goal: {
    id: string;
    title: string;
    description?: string;
    type: string;
    targetValue: number;
    currentValue: number;
    unit?: string;
    priority: string;
    status: string;
    targetDate?: Date;
    createdAt: Date;
  };
  onUpdateProgress?: (goalId: string, progress: number) => void;
  onEdit?: (goalId: string) => void;
  onDelete?: (goalId: string) => void;
}

export const GoalCard = memo<GoalCardProps>(({
  goal,
  onUpdateProgress,
  onEdit,
  onDelete
}) => {
  const navigate = useNavigate();

  const progressPercentage = useMemo(() => {
    return Math.min((goal.currentValue / goal.targetValue) * 100, 100);
  }, [goal.currentValue, goal.targetValue]);

  const priorityColor = useMemo(() => {
    switch (goal.priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }, [goal.priority]);

  const statusColor = useMemo(() => {
    switch (goal.status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }, [goal.status]);

  const handleUpdateProgress = useCallback(() => {
    if (onUpdateProgress) {
      const newProgress = prompt(`Enter new progress (current: ${goal.currentValue}):`);
      if (newProgress && !isNaN(Number(newProgress))) {
        onUpdateProgress(goal.id, Number(newProgress));
      }
    }
  }, [goal.id, goal.currentValue, onUpdateProgress]);

  const handleEdit = useCallback(() => {
    if (onEdit) {
      onEdit(goal.id);
    }
  }, [goal.id, onEdit]);

  const handleDelete = useCallback(() => {
    if (onDelete) {
      onDelete(goal.id);
    }
  }, [goal.id, onDelete]);

  const isCompleted = goal.status === 'completed';
  const isOverdue = goal.targetDate && new Date() > goal.targetDate && !isCompleted;

  return (
    <div className={`glassmorphism p-6 rounded-xl hover:scale-105 transition-transform duration-200 ${
      isOverdue ? 'border-l-4 border-red-500' : ''
    }`}>
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-primary mb-2">{goal.title}</h3>
          {goal.description && (
            <p className="text-sm text-secondary mb-3">{goal.description}</p>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleEdit}
            className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
            title="Edit goal"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={handleDelete}
            className="p-2 text-gray-600 hover:text-red-600 transition-colors"
            title="Delete goal"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityColor}`}>
          {goal.priority}
        </span>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor}`}>
          {goal.status}
        </span>
        {isOverdue && (
          <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
            Overdue
          </span>
        )}
      </div>

      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-secondary">Progress</span>
          <span className="text-sm text-primary font-medium">
            {goal.currentValue} / {goal.targetValue} {goal.unit || ''}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${
              isCompleted ? 'bg-green-500' : 'bg-blue-500'
            }`}
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <div className="text-xs text-muted mt-1">
          {progressPercentage.toFixed(1)}% complete
        </div>
      </div>

      {goal.targetDate && (
        <div className="text-sm text-muted mb-4">
          Target Date: {goal.targetDate.toLocaleDateString()}
        </div>
      )}

      {!isCompleted && (
        <button
          onClick={handleUpdateProgress}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          Update Progress
        </button>
      )}
    </div>
  );
});

GoalCard.displayName = 'GoalCard';
