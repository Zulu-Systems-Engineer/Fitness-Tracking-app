import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usage } from '../lib/theme';
import { voiceNotes } from '../lib/voiceNotes';
import { goalService } from '../lib/firebaseServices';
import { useAuth } from '../contexts/AuthContext';

// Mock types for demo purposes
interface Goal {
  id: string;
  userId: string;
  title: string;
  description?: string;
  type: 'weight_loss' | 'weight_gain' | 'muscle_gain' | 'endurance' | 'strength' | 'flexibility' | 'custom';
  targetValue: number;
  currentValue: number;
  unit: string;
  targetDate: Date;
  status: 'active' | 'completed' | 'paused' | 'cancelled';
  priority: 'low' | 'medium' | 'high';
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

type CreateGoal = Omit<Goal, 'id' | 'createdAt' | 'updatedAt' | 'completedAt'>;

interface UpdateGoalProgress {
  currentValue: number;
  notes?: string;
}

export function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [filters, setFilters] = useState({
    type: '',
    status: '',
    priority: '',
    search: '',
  });
  const navigate = useNavigate();
  const { user } = useAuth();

  const goalsTheme = usage.goals;

  // Load goals from Firebase (with local storage fallback)
  useEffect(() => {
    const loadGoals = async () => {
      try {
        setLoading(true);
        
        if (user) {
          try {
            // Try Firebase first
            const userGoals = await goalService.getAll(user.id);
            setGoals(userGoals);
            
            // Sync to local storage for offline access
            localStorage.setItem('goals', JSON.stringify(userGoals));
          } catch (firebaseError) {
            console.log('Firebase not available, using local storage:', firebaseError);
            
            // Fallback to local storage
            const localGoals = JSON.parse(localStorage.getItem('goals') || '[]');
            
            if (localGoals.length > 0) {
              // Convert date strings back to Date objects
              const goalsWithDates = localGoals.map((goal: any) => ({
                ...goal,
                createdAt: new Date(goal.createdAt),
                updatedAt: new Date(goal.updatedAt),
                targetDate: new Date(goal.targetDate),
                completedAt: goal.completedAt ? new Date(goal.completedAt) : undefined,
              }));
              setGoals(goalsWithDates);
            } else {
              setGoals([]);
            }
          }
        } else {
          // No user, use local storage only
          const localGoals = JSON.parse(localStorage.getItem('goals') || '[]');
          
          if (localGoals.length > 0) {
            const goalsWithDates = localGoals.map((goal: any) => ({
              ...goal,
              createdAt: new Date(goal.createdAt),
              updatedAt: new Date(goal.updatedAt),
              targetDate: new Date(goal.targetDate),
              completedAt: goal.completedAt ? new Date(goal.completedAt) : undefined,
            }));
            setGoals(goalsWithDates);
          } else {
            setGoals([]);
          }
        }
      } catch (error) {
        console.error('Error loading goals:', error);
        setGoals([]);
      } finally {
        setLoading(false);
      }
    };

    loadGoals();
  }, [user]);

  const filteredGoals = goals.filter(goal => {
    const matchesType = !filters.type || goal.type === filters.type;
    const matchesStatus = !filters.status || goal.status === filters.status;
    const matchesPriority = !filters.priority || goal.priority === filters.priority;
    const matchesSearch = !filters.search || 
      goal.title.toLowerCase().includes(filters.search.toLowerCase()) ||
      goal.description?.toLowerCase().includes(filters.search.toLowerCase());
    
    return matchesType && matchesStatus && matchesPriority && matchesSearch;
  });

  const handleDeleteGoal = async (goalId: string) => {
    if (window.confirm('Are you sure you want to delete this goal?')) {
      try {
        if (user) {
          try {
            // Try Firebase first
            await goalService.delete(goalId);
            
            // Update local storage for offline access
            const existingGoals = JSON.parse(localStorage.getItem('goals') || '[]');
            const updatedGoals = existingGoals.filter((goal: any) => goal.id !== goalId);
            localStorage.setItem('goals', JSON.stringify(updatedGoals));
          } catch (firebaseError) {
            console.log('Firebase not available, using local storage:', firebaseError);
            
            // Fallback to local storage
            const existingGoals = JSON.parse(localStorage.getItem('goals') || '[]');
            const updatedGoals = existingGoals.filter((goal: any) => goal.id !== goalId);
            localStorage.setItem('goals', JSON.stringify(updatedGoals));
          }
        } else {
          // No user, use local storage only
          const existingGoals = JSON.parse(localStorage.getItem('goals') || '[]');
          const updatedGoals = existingGoals.filter((goal: any) => goal.id !== goalId);
          localStorage.setItem('goals', JSON.stringify(updatedGoals));
        }

        // Update state
        setGoals(goals.filter(goal => goal.id !== goalId));
      } catch (error) {
        console.error('Error deleting goal:', error);
        alert('Failed to delete goal. Please try again.');
      }
    }
  };

  const handleCreateGoal = async (goalData: CreateGoal) => {
    try {
      let newGoal: Goal;

      if (user) {
        try {
          // Try Firebase first
          newGoal = await goalService.create({
            ...goalData,
            userId: user.id,
          });
          
          // Update local storage for offline access
          const existingGoals = JSON.parse(localStorage.getItem('goals') || '[]');
          const updatedGoals = [...existingGoals, newGoal];
          localStorage.setItem('goals', JSON.stringify(updatedGoals));
        } catch (firebaseError) {
          console.log('Firebase not available, using local storage:', firebaseError);
          
          // Fallback to local storage
          newGoal = {
            ...goalData,
            id: crypto.randomUUID(),
            userId: user.id,
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          const existingGoals = JSON.parse(localStorage.getItem('goals') || '[]');
          const updatedGoals = [...existingGoals, newGoal];
          localStorage.setItem('goals', JSON.stringify(updatedGoals));
        }
      } else {
        // No user, use local storage only
        newGoal = {
          ...goalData,
          id: crypto.randomUUID(),
          userId: 'anonymous',
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        const existingGoals = JSON.parse(localStorage.getItem('goals') || '[]');
        const updatedGoals = [...existingGoals, newGoal];
        localStorage.setItem('goals', JSON.stringify(updatedGoals));
      }

      // Update state
      setGoals(prev => [...prev, newGoal]);
      setShowCreateForm(false);

      // Voice announcement
      voiceNotes.speak(`Goal created successfully! ${goalData.title} is now active.`, 'high');

      // Show success message
      alert('Goal created successfully!');
    } catch (error) {
      console.error('Error creating goal:', error);
      alert('Failed to create goal. Please try again.');
    }
  };

  const handleUpdateGoal = async (goalData: Partial<Goal>) => {
    if (!editingGoal) return;
    
    try {
      const updatedGoal = {
        ...editingGoal,
        ...goalData,
        updatedAt: new Date(),
      };

      if (user) {
        try {
          // Try Firebase first
          await goalService.update(editingGoal.id!, goalData);
          
          // Update local storage for offline access
          const existingGoals = JSON.parse(localStorage.getItem('goals') || '[]');
          const updatedGoals = existingGoals.map((goal: any) => 
            goal.id === editingGoal.id ? updatedGoal : goal
          );
          localStorage.setItem('goals', JSON.stringify(updatedGoals));
        } catch (firebaseError) {
          console.log('Firebase not available, using local storage:', firebaseError);
          
          // Fallback to local storage
          const existingGoals = JSON.parse(localStorage.getItem('goals') || '[]');
          const updatedGoals = existingGoals.map((goal: any) => 
            goal.id === editingGoal.id ? updatedGoal : goal
          );
          localStorage.setItem('goals', JSON.stringify(updatedGoals));
        }
      } else {
        // No user, use local storage only
        const existingGoals = JSON.parse(localStorage.getItem('goals') || '[]');
        const updatedGoals = existingGoals.map((goal: any) => 
          goal.id === editingGoal.id ? updatedGoal : goal
        );
        localStorage.setItem('goals', JSON.stringify(updatedGoals));
      }
      
      // Update state
      setGoals(goals.map(goal => goal.id === editingGoal.id ? updatedGoal : goal));
      setEditingGoal(null);
    } catch (error) {
      console.error('Error updating goal:', error);
      alert('Failed to update goal. Please try again.');
    }
  };

  const handleUpdateProgress = async (goalId: string, progressData: UpdateGoalProgress) => {
    const goal = goals.find(g => g.id === goalId);
    if (!goal) return;

    const updatedGoal = {
      ...goal,
      currentValue: progressData.currentValue,
      updatedAt: new Date(),
    };

    // Check if goal is completed
    if (progressData.currentValue >= goal.targetValue && goal.status === 'active') {
      updatedGoal.status = 'completed';
      updatedGoal.completedAt = new Date();
      
      // Voice announcement for goal completion
      voiceNotes.speak(`Congratulations! You've achieved your goal: ${goal.title}!`, 'high');
    }

    try {
      if (user) {
        try {
          // Try Firebase first
          await goalService.update(goalId, {
            currentValue: progressData.currentValue,
            status: updatedGoal.status,
            completedAt: updatedGoal.completedAt,
            updatedAt: updatedGoal.updatedAt,
          });
          
          // Update local storage for offline access
          const existingGoals = JSON.parse(localStorage.getItem('goals') || '[]');
          const updatedGoals = existingGoals.map((g: any) => 
            g.id === goalId ? updatedGoal : g
          );
          localStorage.setItem('goals', JSON.stringify(updatedGoals));
        } catch (firebaseError) {
          console.log('Firebase not available, using local storage:', firebaseError);
          
          // Fallback to local storage
          const existingGoals = JSON.parse(localStorage.getItem('goals') || '[]');
          const updatedGoals = existingGoals.map((g: any) => 
            g.id === goalId ? updatedGoal : g
          );
          localStorage.setItem('goals', JSON.stringify(updatedGoals));
        }
      } else {
        // No user, use local storage only
        const existingGoals = JSON.parse(localStorage.getItem('goals') || '[]');
        const updatedGoals = existingGoals.map((g: any) => 
          g.id === goalId ? updatedGoal : g
        );
        localStorage.setItem('goals', JSON.stringify(updatedGoals));
      }

      // Update state
      setGoals(goals.map(g => g.id === goalId ? updatedGoal : g));
    } catch (error) {
      console.error('Error updating goal progress:', error);
    }
  };

  const handleCompleteGoal = async (goalId: string) => {
    const goal = goals.find(g => g.id === goalId);
    if (!goal) return;

    const updatedGoal = {
      ...goal,
      status: 'completed' as const,
      completedAt: new Date(),
      updatedAt: new Date(),
    };

    // Voice announcement for manual goal completion
    voiceNotes.speak(`Great job! You've completed your goal: ${goal.title}!`, 'high');

    try {
      if (user) {
        try {
          // Try Firebase first
          await goalService.update(goalId, {
            status: 'completed',
            completedAt: updatedGoal.completedAt,
            updatedAt: updatedGoal.updatedAt,
          });
          
          // Update local storage for offline access
          const existingGoals = JSON.parse(localStorage.getItem('goals') || '[]');
          const updatedGoals = existingGoals.map((g: any) => 
            g.id === goalId ? updatedGoal : g
          );
          localStorage.setItem('goals', JSON.stringify(updatedGoals));
        } catch (firebaseError) {
          console.log('Firebase not available, using local storage:', firebaseError);
          
          // Fallback to local storage
          const existingGoals = JSON.parse(localStorage.getItem('goals') || '[]');
          const updatedGoals = existingGoals.map((g: any) => 
            g.id === goalId ? updatedGoal : g
          );
          localStorage.setItem('goals', JSON.stringify(updatedGoals));
        }
      } else {
        // No user, use local storage only
        const existingGoals = JSON.parse(localStorage.getItem('goals') || '[]');
        const updatedGoals = existingGoals.map((g: any) => 
          g.id === goalId ? updatedGoal : g
        );
        localStorage.setItem('goals', JSON.stringify(updatedGoals));
      }

      // Update state
      setGoals(goals.map(g => g.id === goalId ? updatedGoal : g));
    } catch (error) {
      console.error('Error completing goal:', error);
    }
  };

  const getProgressPercentage = (goal: Goal) => {
    return Math.min((goal.currentValue / goal.targetValue) * 100, 100);
  };

  const getDaysRemaining = (targetDate: Date) => {
    const today = new Date();
    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <div className="min-h-screen hero-gradient flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 style={{ color: 'var(--glassmorphism-text-secondary)' }}">Loading goals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen hero-gradient p-6">
      <div className="max-w-7xl mx-auto">
        {/* Navigation Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 transition-colors nav-button text-white hover:text-gray-300"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Dashboard
            </button>
            <div className="text-sm text-secondary">
              Goals
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 text-primary">Goals</h1>
          <p className="text-secondary">Set and track your fitness goals</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="glassmorphism rounded-lg p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold style={{ color: 'var(--glassmorphism-text)' }}">
                  {goals.filter(g => g.status === 'completed').length}
                </p>
                <p className="style={{ color: 'var(--glassmorphism-text-secondary)' }}">Completed</p>
              </div>
            </div>
          </div>

          <div className="glassmorphism rounded-lg p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold style={{ color: 'var(--glassmorphism-text)' }}">
                  {goals.filter(g => g.status === 'active').length}
                </p>
                <p className="style={{ color: 'var(--glassmorphism-text-secondary)' }}">Active</p>
              </div>
            </div>
          </div>

          <div className="glassmorphism rounded-lg p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold style={{ color: 'var(--glassmorphism-text)' }}">
                  {goals.filter(g => g.status === 'active' && getDaysRemaining(g.targetDate) < 30).length}
                </p>
                <p className="style={{ color: 'var(--glassmorphism-text-secondary)' }}">Due Soon</p>
              </div>
            </div>
          </div>

          <div className="glassmorphism rounded-lg p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold style={{ color: 'var(--glassmorphism-text)' }}">
                  {Math.round(goals.filter(g => g.status === 'completed').length / goals.length * 100) || 0}%
                </p>
                <p className="style={{ color: 'var(--glassmorphism-text-secondary)' }}">Success Rate</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Actions */}
        <div className="mb-8 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div className="flex flex-wrap gap-4">
            <select
              value={filters.type}
              onChange={(e) => setFilters({...filters, type: e.target.value})}
              className="px-4 py-2 glassmorphism rounded-lg style={{ color: 'var(--glassmorphism-text)' }} focus:outline-none focus:ring-2 focus:ring-border-focus"
            >
              <option value="">All Types</option>
              <option value="weight_loss">Weight Loss</option>
              <option value="weight_gain">Weight Gain</option>
              <option value="muscle_gain">Muscle Gain</option>
              <option value="endurance">Endurance</option>
              <option value="strength">Strength</option>
              <option value="flexibility">Flexibility</option>
              <option value="custom">Custom</option>
            </select>
            
            <select
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
              className="px-4 py-2 glassmorphism rounded-lg style={{ color: 'var(--glassmorphism-text)' }} focus:outline-none focus:ring-2 focus:ring-border-focus"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="paused">Paused</option>
              <option value="cancelled">Cancelled</option>
            </select>
            
            <select
              value={filters.priority}
              onChange={(e) => setFilters({...filters, priority: e.target.value})}
              className="px-4 py-2 glassmorphism rounded-lg style={{ color: 'var(--glassmorphism-text)' }} focus:outline-none focus:ring-2 focus:ring-border-focus"
            >
              <option value="">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
            
            <input
              type="text"
              placeholder="Search goals..."
              value={filters.search}
              onChange={(e) => setFilters({...filters, search: e.target.value})}
              className="px-4 py-2 glassmorphism rounded-lg style={{ color: 'var(--glassmorphism-text)' }} placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-border-focus"
            />
          </div>
          
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-btn-primary-bg text-btn-primary-text px-6 py-2 rounded-lg hover:bg-btn-primary-hover focus:outline-none focus:ring-2 focus:ring-border-focus transition-colors"
          >
            Create New Goal
          </button>
        </div>

        {/* Goals Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGoals.length === 0 ? (
            <div className="col-span-full glassmorphism rounded-lg p-8 text-center">
              <div className="text-6xl mb-4">🎯</div>
              <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--glassmorphism-text)' }}>
                No Goals Set Yet
              </h3>
              <p style={{ color: 'var(--glassmorphism-text-secondary)' }} className="mb-4">
                Set your first fitness goal to start tracking your progress and stay motivated on your fitness journey.
              </p>
              <button
                onClick={() => setShowCreateForm(true)}
                className="bg-btn-primary-bg text-btn-primary-text px-6 py-2 rounded-lg hover:bg-btn-primary-hover focus:outline-none focus:ring-2 focus:ring-border-focus transition-colors"
              >
                Create Your First Goal
              </button>
            </div>
          ) : (
            filteredGoals.map((goal) => (
            <div key={goal.id} className="glassmorphism rounded-lg p-6 hover:shadow-lg transition-shadow" style={{ backgroundColor: goalsTheme.cardBg }}>
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-semibold style={{ color: 'var(--glassmorphism-text)' }}">{goal.title}</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingGoal(goal)}
                    className="style={{ color: 'var(--glassmorphism-text-muted)' }} hover:style={{ color: 'var(--glassmorphism-text)' }} transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDeleteGoal(goal.id)}
                    className="style={{ color: 'var(--glassmorphism-text-muted)' }} hover:text-red-500 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
              
              {goal.description && (
                <p className="style={{ color: 'var(--glassmorphism-text-secondary)' }} mb-4">{goal.description}</p>
              )}
              
              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium style={{ color: 'var(--glassmorphism-text-secondary)' }}">Progress</span>
                  <span className="text-sm font-medium style={{ color: 'var(--glassmorphism-text)' }}">
                    {goal.currentValue} / {goal.targetValue} {goal.unit}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${getProgressPercentage(goal)}%`,
                    backgroundColor: goal.status === 'completed' ? goalsTheme.completedIcon : goalsTheme.progressFill
                  }}
                ></div>
                </div>
                <div className="text-right mt-1">
                  <span className="text-sm style={{ color: 'var(--glassmorphism-text-muted)' }}">
                    {Math.round(getProgressPercentage(goal))}%
                  </span>
                </div>
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span className="style={{ color: 'var(--glassmorphism-text-muted)' }}">Type:</span>
                  <span className="style={{ color: 'var(--glassmorphism-text)' }} capitalize">{goal.type.replace('_', ' ')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="style={{ color: 'var(--glassmorphism-text-muted)' }}">Priority:</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    goal.priority === 'high' ? 'bg-red-100 text-red-800' :
                    goal.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {goal.priority.charAt(0).toUpperCase() + goal.priority.slice(1)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="style={{ color: 'var(--glassmorphism-text-muted)' }}">Target Date:</span>
                  <span className="style={{ color: 'var(--glassmorphism-text)' }}">{goal.targetDate.toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="style={{ color: 'var(--glassmorphism-text-muted)' }}">Days Remaining:</span>
                  <span className={`text-sm font-medium ${
                    getDaysRemaining(goal.targetDate) < 0 ? 'text-red-500' :
                    getDaysRemaining(goal.targetDate) < 30 ? 'text-yellow-500' :
                    'text-green-500'
                  }`}>
                    {getDaysRemaining(goal.targetDate) < 0 ? 'Overdue' : `${getDaysRemaining(goal.targetDate)} days`}
                  </span>
                </div>
              </div>
              
              <div className="flex gap-2">
                {goal.status === 'active' && (
                  <>
                    <button
                      onClick={() => {
                        const newValue = prompt(`Enter new progress value (current: ${goal.currentValue} ${goal.unit}):`);
                        if (newValue !== null && !isNaN(parseFloat(newValue))) {
                          handleUpdateProgress(goal.id, { currentValue: parseFloat(newValue) });
                        }
                      }}
                      className="flex-1 bg-btn-primary-bg text-btn-primary-text py-2 px-4 rounded-lg hover:bg-btn-primary-hover focus:outline-none focus:ring-2 focus:ring-border-focus transition-colors"
                    >
                      Update Progress
                    </button>
                    <button
                      onClick={() => handleCompleteGoal(goal.id)}
                      className="px-4 py-2 border border-green-500 text-green-500 rounded-lg hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors"
                    >
                      Complete
                    </button>
                  </>
                )}
                {goal.status === 'completed' && (
                  <div className="flex-1 text-center py-2 px-4 rounded-lg font-medium" style={{ backgroundColor: goalsTheme.completedIcon + '20', color: goalsTheme.completedIcon }}>
                    ✓ Completed
                  </div>
                )}
              </div>
            </div>
            ))
          )}
        </div>
      </div>

      {/* Create/Edit Goal Modal */}
      {(showCreateForm || editingGoal) && (
        <GoalForm
          goal={editingGoal}
          onSave={editingGoal ? handleUpdateGoal : handleCreateGoal}
          onClose={() => {
            setShowCreateForm(false);
            setEditingGoal(null);
          }}
        />
      )}
    </div>
  );
}

// Goal Form Component
interface GoalFormProps {
  goal?: Goal | null;
  onSave: (goalData: CreateGoal | Partial<Goal>) => void;
  onClose: () => void;
}

function GoalForm({ goal, onSave, onClose }: GoalFormProps) {
  const [formData, setFormData] = useState({
    title: goal?.title || '',
    description: goal?.description || '',
    type: goal?.type || 'custom',
    targetValue: goal?.targetValue || 0,
    currentValue: goal?.currentValue || 0,
    unit: goal?.unit || '',
    targetDate: goal?.targetDate ? goal.targetDate.toISOString().split('T')[0] : '',
    priority: goal?.priority || 'medium',
    isPublic: goal?.isPublic || false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      targetDate: new Date(formData.targetDate),
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="glassmorphism rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold style={{ color: 'var(--glassmorphism-text)' }}">
              {goal ? 'Edit Goal' : 'Create New Goal'}
            </h2>
            <button
              onClick={onClose}
              className="style={{ color: 'var(--glassmorphism-text-muted)' }} hover:style={{ color: 'var(--glassmorphism-text)' }} transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium style={{ color: 'var(--glassmorphism-text-secondary)' }} mb-2">
                Goal Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full px-3 py-2 bg-input-bg border border-input-border text-input-text rounded-md focus:outline-none focus:ring-2 focus:ring-border-focus"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium style={{ color: 'var(--glassmorphism-text-secondary)' }} mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full px-3 py-2 bg-input-bg border border-input-border text-input-text rounded-md focus:outline-none focus:ring-2 focus:ring-border-focus"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium style={{ color: 'var(--glassmorphism-text-secondary)' }} mb-2">
                  Goal Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value as any})}
                  className="w-full px-3 py-2 bg-input-bg border border-input-border text-input-text rounded-md focus:outline-none focus:ring-2 focus:ring-border-focus"
                >
                  <option value="weight_loss">Weight Loss</option>
                  <option value="weight_gain">Weight Gain</option>
                  <option value="muscle_gain">Muscle Gain</option>
                  <option value="endurance">Endurance</option>
                  <option value="strength">Strength</option>
                  <option value="flexibility">Flexibility</option>
                  <option value="custom">Custom</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium style={{ color: 'var(--glassmorphism-text-secondary)' }} mb-2">
                  Priority
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({...formData, priority: e.target.value as any})}
                  className="w-full px-3 py-2 bg-input-bg border border-input-border text-input-text rounded-md focus:outline-none focus:ring-2 focus:ring-border-focus"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium style={{ color: 'var(--glassmorphism-text-secondary)' }} mb-2">
                  Target Value
                </label>
                <input
                  type="number"
                  value={formData.targetValue}
                  onChange={(e) => setFormData({...formData, targetValue: parseFloat(e.target.value) || 0})}
                  className="w-full px-3 py-2 bg-input-bg border border-input-border text-input-text rounded-md focus:outline-none focus:ring-2 focus:ring-border-focus"
                  min="0"
                  step="0.1"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium style={{ color: 'var(--glassmorphism-text-secondary)' }} mb-2">
                  Current Value
                </label>
                <input
                  type="number"
                  value={formData.currentValue}
                  onChange={(e) => setFormData({...formData, currentValue: parseFloat(e.target.value) || 0})}
                  className="w-full px-3 py-2 bg-input-bg border border-input-border text-input-text rounded-md focus:outline-none focus:ring-2 focus:ring-border-focus"
                  min="0"
                  step="0.1"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium style={{ color: 'var(--glassmorphism-text-secondary)' }} mb-2">
                  Unit
                </label>
                <input
                  type="text"
                  value={formData.unit}
                  onChange={(e) => setFormData({...formData, unit: e.target.value})}
                  className="w-full px-3 py-2 bg-input-bg border border-input-border text-input-text rounded-md focus:outline-none focus:ring-2 focus:ring-border-focus"
                  placeholder="e.g., lbs, kg, miles"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium style={{ color: 'var(--glassmorphism-text-secondary)' }} mb-2">
                Target Date
              </label>
              <input
                type="date"
                value={formData.targetDate}
                onChange={(e) => setFormData({...formData, targetDate: e.target.value})}
                className="w-full px-3 py-2 bg-input-bg border border-input-border text-input-text rounded-md focus:outline-none focus:ring-2 focus:ring-border-focus"
                required
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isPublic"
                checked={formData.isPublic}
                onChange={(e) => setFormData({...formData, isPublic: e.target.checked})}
                className="mr-2"
              />
              <label htmlFor="isPublic" className="style={{ color: 'var(--glassmorphism-text-secondary)' }}">
                Make this goal public
              </label>
            </div>

            <div className="flex justify-end gap-4 pt-6 border-t border-card-border">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 border border-card-border style={{ color: 'var(--glassmorphism-text)' }} rounded-md hover:glassmorphism focus:outline-none focus:ring-2 focus:ring-border-focus transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-btn-primary-bg text-btn-primary-text rounded-md hover:bg-btn-primary-hover focus:outline-none focus:ring-2 focus:ring-border-focus transition-colors"
              >
                {goal ? 'Update Goal' : 'Create Goal'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
