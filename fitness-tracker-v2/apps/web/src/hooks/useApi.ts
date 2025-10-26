import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { workoutPlanService, workoutService, goalService } from '../lib/firebaseServices';

// Custom hook for workout plans
export const useWorkoutPlans = (filters?: any) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['workoutPlans', user?.id, filters],
    queryFn: () => workoutPlanService.getAll(user?.id || '', filters),
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCreateWorkoutPlan = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: (data: any) => workoutPlanService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workoutPlans'] });
    },
  });
};

export const useUpdateWorkoutPlan = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      workoutPlanService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workoutPlans'] });
    },
  });
};

export const useDeleteWorkoutPlan = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => workoutPlanService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workoutPlans'] });
    },
  });
};

// Custom hook for workouts
export const useWorkouts = (filters?: any) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['workouts', user?.id, filters],
    queryFn: () => workoutService.getAll(user?.id || '', filters),
    enabled: !!user,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useCreateWorkout = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: (data: any) => workoutService.create({ ...data, userId: user?.id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workouts'] });
    },
  });
};

export const useUpdateWorkout = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      workoutService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workouts'] });
    },
  });
};

export const useDeleteWorkout = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => workoutService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workouts'] });
    },
  });
};

export const useLogSet = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ workoutId, exerciseId, setData }: { 
      workoutId: string; 
      exerciseId: string; 
      setData: any 
    }) => workoutService.logSet(workoutId, exerciseId, setData),
    onSuccess: (_, { workoutId }) => {
      queryClient.invalidateQueries({ queryKey: ['workouts', workoutId] });
    },
  });
};

export const useCompleteWorkout = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      workoutService.complete(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workouts'] });
    },
  });
};

// Custom hook for goals
export const useGoals = (filters?: any) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['goals', user?.id, filters],
    queryFn: () => goalService.getAll(user?.id || '', filters),
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCreateGoal = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: (data: any) => goalService.create({ ...data, userId: user?.id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
    },
  });
};

export const useUpdateGoal = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      goalService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
    },
  });
};

export const useDeleteGoal = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => goalService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
    },
  });
};

export const useUpdateGoalProgress = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, progress }: { id: string; progress: any }) => 
      goalService.updateProgress(id, progress),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
    },
  });
};

// Custom hook for dashboard data
export const useDashboardData = () => {
  const { user } = useAuth();
  
  const { data: recentWorkouts, isLoading: workoutsLoading } = useWorkouts({ 
    limit: 5, 
    sortBy: 'startedAt',
    order: 'desc'
  });
  
  const { data: activeGoals, isLoading: goalsLoading } = useGoals({ 
    status: 'in_progress',
    limit: 5
  });
  
  const { data: workoutPlans, isLoading: plansLoading } = useWorkoutPlans({ 
    limit: 5 
  });

  return {
    recentWorkouts: recentWorkouts || [],
    activeGoals: activeGoals || [],
    workoutPlans: workoutPlans || [],
    isLoading: workoutsLoading || goalsLoading || plansLoading,
  };
};

// Custom hook for analytics data
export const useAnalyticsData = (timeRange: 'week' | 'month' | 'year' = 'month') => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['analytics', user?.id, timeRange],
    queryFn: () => {
      // This would call your analytics service
      return Promise.resolve({
        totalWorkouts: 0,
        totalVolume: 0,
        averageWorkoutDuration: 0,
        workoutFrequency: 0,
        progressData: [],
        exerciseStats: [],
      });
    },
    enabled: !!user,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Custom hook for personal records
export const usePersonalRecords = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['personalRecords', user?.id],
    queryFn: () => {
      // This would call your records service
      return Promise.resolve([]);
    },
    enabled: !!user,
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
};

// Custom hook for offline support
export const useOfflineSupport = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  return { isOnline };
};
