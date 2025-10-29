import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usage, colors } from '../lib/theme';
import { workoutPlanService, WorkoutPlan, Exercise } from '../lib/firebaseServices';
import { useAuth } from '../contexts/AuthContext';
import { voiceNotes } from '../lib/voiceNotes';
import { useToast } from '../components/ui/Toast';

type CreateWorkoutPlan = Omit<WorkoutPlan, 'id' | 'createdAt' | 'updatedAt'>;

export default function PlansPage() {
  const [plans, setPlans] = useState<WorkoutPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingPlan, setEditingPlan] = useState<WorkoutPlan | null>(null);
  const [filters, setFilters] = useState({
    difficulty: '',
    category: '',
    search: '',
  });
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();

  const workoutPlansTheme = usage.workoutPlans;

  // Load workout plans from Firebase (with local storage fallback)
  useEffect(() => {
    const loadPlans = async () => {
      try {
        setLoading(true);
        
        if (user) {
          try {
            // Try Firebase first
            const userPlans = await workoutPlanService.getAll(user.id);
            setPlans(userPlans);
            
            // Sync to local storage for offline access
            localStorage.setItem('workoutPlans', JSON.stringify(userPlans));
          } catch (firebaseError) {
            console.log('Firebase not available, using local storage:', firebaseError);
            
            // Fallback to local storage
            const localPlans = JSON.parse(localStorage.getItem('workoutPlans') || '[]');
            
            if (localPlans.length > 0) {
              // Convert date strings back to Date objects
              const plansWithDates = localPlans.map((plan: any) => ({
                ...plan,
                createdAt: new Date(plan.createdAt),
                updatedAt: new Date(plan.updatedAt),
              }));
              setPlans(plansWithDates);
            } else {
              setPlans([]);
            }
          }
        } else {
          // No user, use local storage only
          const localPlans = JSON.parse(localStorage.getItem('workoutPlans') || '[]');
          
          if (localPlans.length > 0) {
            const plansWithDates = localPlans.map((plan: any) => ({
              ...plan,
              createdAt: new Date(plan.createdAt),
              updatedAt: new Date(plan.updatedAt),
            }));
            setPlans(plansWithDates);
          } else {
            setPlans([]);
          }
        }
      } catch (error) {
        console.error('Error loading workout plans:', error);
        setPlans([]);
      } finally {
        setLoading(false);
      }
    };

    loadPlans();
  }, [user]);

  const filteredPlans = plans.filter(plan => {
    const matchesDifficulty = !filters.difficulty || plan.difficulty === filters.difficulty;
    const matchesCategory = !filters.category || plan.category === filters.category;
    const matchesSearch = !filters.search || 
      plan.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      plan.description?.toLowerCase().includes(filters.search.toLowerCase());
    
    return matchesDifficulty && matchesCategory && matchesSearch;
  });

  const handleDeletePlan = async (planId: string) => {
    if (window.confirm('Are you sure you want to delete this workout plan?')) {
      try {
        if (user) {
          try {
            // Try Firebase first
            await workoutPlanService.delete(planId);
            
            // Update local storage for offline access
            const existingPlans = JSON.parse(localStorage.getItem('workoutPlans') || '[]');
            const updatedPlans = existingPlans.filter((plan: any) => plan.id !== planId);
            localStorage.setItem('workoutPlans', JSON.stringify(updatedPlans));
          } catch (firebaseError) {
            console.log('Firebase not available, using local storage:', firebaseError);
            
            // Fallback to local storage
            const existingPlans = JSON.parse(localStorage.getItem('workoutPlans') || '[]');
            const updatedPlans = existingPlans.filter((plan: any) => plan.id !== planId);
            localStorage.setItem('workoutPlans', JSON.stringify(updatedPlans));
          }
        } else {
          // No user, use local storage only
          const existingPlans = JSON.parse(localStorage.getItem('workoutPlans') || '[]');
          const updatedPlans = existingPlans.filter((plan: any) => plan.id !== planId);
          localStorage.setItem('workoutPlans', JSON.stringify(updatedPlans));
        }

        // Update state
        setPlans(plans.filter(plan => plan.id !== planId));
        showToast('Workout plan deleted successfully!', 'success');
      } catch (error) {
        console.error('Error deleting workout plan:', error);
        showToast('Failed to delete workout plan. Please try again.', 'error');
      }
    }
  };

  const handleStartWorkout = (plan: WorkoutPlan) => {
    // Store the selected plan in localStorage so TrackPage can access it
    localStorage.setItem('selectedPlan', JSON.stringify(plan));
    // Navigate to track page
    navigate('/track');
  };

  const handleCreatePlan = async (planData: CreateWorkoutPlan | Partial<WorkoutPlan>) => {
    try {
      console.log('Creating workout plan:', planData);
      let newPlan: WorkoutPlan;

      // Skip Firebase for now and use localStorage directly since Firebase isn't configured
      newPlan = {
        ...planData,
        id: crypto.randomUUID(),
        createdBy: user?.id || 'anonymous',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as WorkoutPlan;

      console.log('Saving to localStorage:', newPlan);
      
      const existingPlans = JSON.parse(localStorage.getItem('workoutPlans') || '[]');
      const updatedPlans = [newPlan, ...existingPlans];
      localStorage.setItem('workoutPlans', JSON.stringify(updatedPlans));

      console.log('Plan saved to localStorage successfully');

      // Update state
      setPlans([newPlan, ...plans]);
      setShowCreateForm(false);

      // Voice announcement
      voiceNotes.announceWorkoutStart(`Workout plan created successfully! ${planData.name} is now available.`);

      // Show success toast message
      console.log('Calling showToast...');
      showToast('Workout plan created successfully!', 'success');
      console.log('showToast called');
    } catch (error) {
      console.error('Error creating workout plan:', error);
      showToast('Failed to create workout plan. Please try again.', 'error');
    }
  };

  const handleUpdatePlan = async (planData: CreateWorkoutPlan | Partial<WorkoutPlan>) => {
    if (!editingPlan || !editingPlan.id) return;
    
    try {
      const updatedPlan = {
        ...editingPlan,
        ...planData,
        updatedAt: new Date(),
      };

      if (user) {
        try {
          // Try Firebase first
          await workoutPlanService.update(editingPlan.id, planData);
          
          // Update local storage for offline access
          const existingPlans = JSON.parse(localStorage.getItem('workoutPlans') || '[]');
          const updatedPlans = existingPlans.map((plan: any) => 
            plan.id === editingPlan.id ? updatedPlan : plan
          );
          localStorage.setItem('workoutPlans', JSON.stringify(updatedPlans));
        } catch (firebaseError) {
          console.log('Firebase not available, using local storage:', firebaseError);
          
          // Fallback to local storage
          const existingPlans = JSON.parse(localStorage.getItem('workoutPlans') || '[]');
          const updatedPlans = existingPlans.map((plan: any) => 
            plan.id === editingPlan.id ? updatedPlan : plan
          );
          localStorage.setItem('workoutPlans', JSON.stringify(updatedPlans));
        }
      } else {
        // No user, use local storage only
        const existingPlans = JSON.parse(localStorage.getItem('workoutPlans') || '[]');
        const updatedPlans = existingPlans.map((plan: any) => 
          plan.id === editingPlan.id ? updatedPlan : plan
        );
        localStorage.setItem('workoutPlans', JSON.stringify(updatedPlans));
      }
      
      // Update state
      setPlans(plans.map(plan => plan.id === editingPlan.id ? updatedPlan : plan));
      setEditingPlan(null);
      
      // Show success toast
      showToast('Workout plan updated successfully!', 'success');
    } catch (error) {
      console.error('Error updating workout plan:', error);
      showToast('Failed to update workout plan. Please try again.', 'error');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen hero-gradient relative flex items-center justify-center">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div 
            className="absolute -top-40 -right-40 w-80 h-80 rounded-full blur-3xl"
            style={{ backgroundColor: `${colors.secondary[500]}20` }}
          ></div>
          <div 
            className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full blur-3xl"
            style={{ backgroundColor: `${colors.primary[500]}20` }}
          ></div>
          <div 
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-3xl"
            style={{ backgroundColor: `${colors.secondary[500]}10` }}
          ></div>
        </div>
        <div className="text-center relative z-10">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-gray-300">Loading workout plans...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen hero-gradient relative p-6">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div 
          className="absolute -top-40 -right-40 w-80 h-80 rounded-full blur-3xl"
          style={{ backgroundColor: `${colors.secondary[500]}20` }}
        ></div>
        <div 
          className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full blur-3xl"
          style={{ backgroundColor: `${colors.primary[500]}20` }}
        ></div>
        <div 
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-3xl"
          style={{ backgroundColor: `${colors.secondary[500]}10` }}
        ></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
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
              Workout Plans
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="mb-6 md:mb-8" style={{ backgroundColor: workoutPlansTheme.headerBg, color: workoutPlansTheme.headerText }}>
          <div className="p-4 md:p-8 rounded-lg">
            <h1 className="text-2xl md:text-4xl font-bold mb-2 text-primary">Workout Plans</h1>
            <p className="text-secondary text-sm md:text-base">Create and manage your workout routines</p>
          </div>
        </div>

        {/* Filters and Actions */}
        <div className="mb-6 md:mb-8 flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 w-full lg:w-auto">
            <select
              value={filters.difficulty}
              onChange={(e) => setFilters({...filters, difficulty: e.target.value})}
              className="px-3 md:px-4 py-2 glassmorphism rounded-lg style={{ color: 'var(--glassmorphism-text)' }} focus:outline-none focus:ring-2 focus:ring-border-focus text-sm md:text-base"
            >
              <option value="">All Difficulties</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
            
            <select
              value={filters.category}
              onChange={(e) => setFilters({...filters, category: e.target.value})}
              className="px-3 md:px-4 py-2 glassmorphism rounded-lg style={{ color: 'var(--glassmorphism-text)' }} focus:outline-none focus:ring-2 focus:ring-border-focus text-sm md:text-base"
            >
              <option value="">All Categories</option>
              <option value="strength">Strength</option>
              <option value="cardio">Cardio</option>
              <option value="flexibility">Flexibility</option>
              <option value="mixed">Mixed</option>
            </select>
            
            <input
              type="text"
              placeholder="Search plans..."
              value={filters.search}
              onChange={(e) => setFilters({...filters, search: e.target.value})}
              className="px-3 md:px-4 py-2 glassmorphism rounded-lg style={{ color: 'var(--glassmorphism-text)' }} placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-border-focus text-sm md:text-base"
            />
          </div>
          
          <button
            onClick={() => setShowCreateForm(true)}
            className="w-full sm:w-auto bg-btn-primary-bg text-btn-primary-text px-4 md:px-6 py-2 rounded-lg hover:bg-btn-primary-hover focus:outline-none focus:ring-2 focus:ring-border-focus transition-colors text-sm md:text-base"
          >
            Create New Plan
          </button>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {filteredPlans.map((plan) => (
            <div key={plan.id} className="glassmorphism rounded-lg p-6 hover:shadow-lg transition-shadow" style={{ borderLeftColor: workoutPlansTheme.accentBorder, borderLeftWidth: '4px' }}>
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-semibold style={{ color: 'var(--glassmorphism-text)' }}">{plan.name}</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingPlan(plan)}
                    className="style={{ color: 'var(--glassmorphism-text-muted)' }} hover:style={{ color: 'var(--glassmorphism-text)' }} transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => plan.id && handleDeletePlan(plan.id)}
                    className="style={{ color: 'var(--glassmorphism-text-muted)' }} hover:text-red-500 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
              
              {plan.description && (
                <p className="style={{ color: 'var(--glassmorphism-text-secondary)' }} mb-4">{plan.description}</p>
              )}
              
              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span className="style={{ color: 'var(--glassmorphism-text-muted)' }}">Difficulty:</span>
                  <span className={`px-2 py-1 rounded text-sm font-medium ${
                    plan.difficulty === 'beginner' ? 'bg-green-100 text-green-800' :
                    plan.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {plan.difficulty.charAt(0).toUpperCase() + plan.difficulty.slice(1)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="style={{ color: 'var(--glassmorphism-text-muted)' }}">Category:</span>
                  <span className="style={{ color: 'var(--glassmorphism-text)' }} capitalize">{plan.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="style={{ color: 'var(--glassmorphism-text-muted)' }}">Duration:</span>
                  <span className="style={{ color: 'var(--glassmorphism-text)' }}">{plan.duration} min</span>
                </div>
                <div className="flex justify-between">
                  <span className="style={{ color: 'var(--glassmorphism-text-muted)' }}">Exercises:</span>
                  <span className="style={{ color: 'var(--glassmorphism-text)' }}">{plan.exercises.length}</span>
                </div>
              </div>
              
              <div className="flex gap-2">
                <button 
                  onClick={() => handleStartWorkout(plan)}
                  className="flex-1 bg-btn-primary-bg text-btn-primary-text py-2 px-4 rounded-lg hover:bg-btn-primary-hover focus:outline-none focus:ring-2 focus:ring-border-focus transition-colors"
                >
                  Start Workout
                </button>
                <button className="px-4 py-2 border border-card-border style={{ color: 'var(--glassmorphism-text)' }} rounded-lg hover:glassmorphism focus:outline-none focus:ring-2 focus:ring-border-focus transition-colors">
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredPlans.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-4 glassmorphism rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 style={{ color: 'var(--glassmorphism-text-muted)' }}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold style={{ color: 'var(--glassmorphism-text)' }} mb-2">No workout plans found</h3>
            <p className="style={{ color: 'var(--glassmorphism-text-secondary)' }} mb-4">Create your first workout plan to get started</p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-btn-primary-bg text-btn-primary-text px-6 py-2 rounded-lg hover:bg-btn-primary-hover focus:outline-none focus:ring-2 focus:ring-border-focus transition-colors"
            >
              Create New Plan
            </button>
          </div>
        )}
      </div>

      {/* Create/Edit Plan Modal */}
      {(showCreateForm || editingPlan) && (
        <PlanForm
          plan={editingPlan}
          onSave={editingPlan ? handleUpdatePlan : handleCreatePlan}
          onClose={() => {
            setShowCreateForm(false);
            setEditingPlan(null);
          }}
        />
      )}
    </div>
  );
}

// Plan Form Component
interface PlanFormProps {
  plan?: WorkoutPlan | null;
  onSave: (planData: CreateWorkoutPlan | Partial<WorkoutPlan>) => void;
  onClose: () => void;
}

function PlanForm({ plan, onSave, onClose }: PlanFormProps) {
  const [formData, setFormData] = useState({
    name: plan?.name || '',
    description: plan?.description || '',
    difficulty: plan?.difficulty || 'beginner',
    category: plan?.category || 'strength',
    duration: plan?.duration || 30,
    isPublic: plan?.isPublic || false,
  });

  const [exercises, setExercises] = useState(plan?.exercises || [
    { id: crypto.randomUUID(), name: '', sets: 1, reps: 1, weight: 0, restTime: 60, notes: '' }
  ]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      exercises,
    });
  };

  const addExercise = () => {
    setExercises([...exercises, {
      id: crypto.randomUUID(),
      name: '',
      sets: 1,
      reps: 1,
      weight: 0,
      restTime: 60,
      notes: ''
    }]);
  };

  const removeExercise = (id: string) => {
    if (exercises.length > 1) {
      setExercises(exercises.filter(ex => ex.id !== id));
    }
  };

  const updateExercise = (id: string, field: string, value: any) => {
    setExercises(exercises.map((ex: Exercise) => 
      ex.id === id ? { ...ex, [field]: value } : ex
    ));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
      <div className="glassmorphism rounded-lg max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
        <div className="p-4 sm:p-6">
          <div className="flex justify-between items-center mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-bold style={{ color: 'var(--glassmorphism-text)' }}">
              {plan ? 'Edit Workout Plan' : 'Create New Workout Plan'}
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

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium style={{ color: 'var(--glassmorphism-text-secondary)' }} mb-2">
                  Plan Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 bg-input-bg border border-input-border text-input-text rounded-md focus:outline-none focus:ring-2 focus:ring-border-focus"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium style={{ color: 'var(--glassmorphism-text-secondary)' }} mb-2">
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData({...formData, duration: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 bg-input-bg border border-input-border text-input-text rounded-md focus:outline-none focus:ring-2 focus:ring-border-focus"
                  min="1"
                  required
                />
              </div>
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
                  Difficulty
                </label>
                <select
                  value={formData.difficulty}
                  onChange={(e) => setFormData({...formData, difficulty: e.target.value as any})}
                  className="w-full px-3 py-2 bg-input-bg border border-input-border text-input-text rounded-md focus:outline-none focus:ring-2 focus:ring-border-focus"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium style={{ color: 'var(--glassmorphism-text-secondary)' }} mb-2">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value as any})}
                  className="w-full px-3 py-2 bg-input-bg border border-input-border text-input-text rounded-md focus:outline-none focus:ring-2 focus:ring-border-focus"
                >
                  <option value="strength">Strength</option>
                  <option value="cardio">Cardio</option>
                  <option value="flexibility">Flexibility</option>
                  <option value="mixed">Mixed</option>
                </select>
              </div>
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
                Make this plan public
              </label>
            </div>

            {/* Exercises */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold style={{ color: 'var(--glassmorphism-text)' }}">Exercises</h3>
                <button
                  type="button"
                  onClick={addExercise}
                  className="bg-btn-primary-bg text-btn-primary-text px-4 py-2 rounded-md hover:bg-btn-primary-hover focus:outline-none focus:ring-2 focus:ring-border-focus transition-colors"
                >
                  Add Exercise
                </button>
              </div>
              
              <div className="space-y-4">
                {exercises.map((exercise: Exercise, index: number) => (
                  <div key={exercise.id} className="border border-card-border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="text-md font-medium style={{ color: 'var(--glassmorphism-text)' }}">Exercise {index + 1}</h4>
                      {exercises.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeExercise(exercise.id)}
                          className="text-red-500 hover:text-red-700 transition-colors"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-sm font-medium style={{ color: 'var(--glassmorphism-text-secondary)' }} mb-1">
                          Exercise Name
                        </label>
                        <input
                          type="text"
                          value={exercise.name}
                          onChange={(e) => updateExercise(exercise.id, 'name', e.target.value)}
                          className="w-full px-3 py-2 bg-input-bg border border-input-border text-input-text rounded-md focus:outline-none focus:ring-2 focus:ring-border-focus"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium style={{ color: 'var(--glassmorphism-text-secondary)' }} mb-1">
                          Sets
                        </label>
                        <input
                          type="number"
                          value={exercise.sets}
                          onChange={(e) => updateExercise(exercise.id, 'sets', parseInt(e.target.value))}
                          className="w-full px-3 py-2 bg-input-bg border border-input-border text-input-text rounded-md focus:outline-none focus:ring-2 focus:ring-border-focus"
                          min="1"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium style={{ color: 'var(--glassmorphism-text-secondary)' }} mb-1">
                          Reps
                        </label>
                        <input
                          type="number"
                          value={exercise.reps}
                          onChange={(e) => updateExercise(exercise.id, 'reps', parseInt(e.target.value))}
                          className="w-full px-3 py-2 bg-input-bg border border-input-border text-input-text rounded-md focus:outline-none focus:ring-2 focus:ring-border-focus"
                          min="1"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium style={{ color: 'var(--glassmorphism-text-secondary)' }} mb-1">
                          Weight (lbs)
                        </label>
                        <input
                          type="number"
                          value={exercise.weight || 0}
                          onChange={(e) => updateExercise(exercise.id, 'weight', parseFloat(e.target.value))}
                          className="w-full px-3 py-2 bg-input-bg border border-input-border text-input-text rounded-md focus:outline-none focus:ring-2 focus:ring-border-focus"
                          min="0"
                          step="0.5"
                        />
                      </div>
                    </div>
                    
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium style={{ color: 'var(--glassmorphism-text-secondary)' }} mb-1">
                          Rest Time (seconds)
                        </label>
                        <input
                          type="number"
                          value={(exercise as any).restTime || 60}
                          onChange={(e) => updateExercise(exercise.id, 'restTime', parseInt(e.target.value))}
                          className="w-full px-3 py-2 bg-input-bg border border-input-border text-input-text rounded-md focus:outline-none focus:ring-2 focus:ring-border-focus"
                          min="0"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium style={{ color: 'var(--glassmorphism-text-secondary)' }} mb-1">
                          Notes
                        </label>
                        <input
                          type="text"
                          value={(exercise as any).notes || ''}
                          onChange={(e) => updateExercise(exercise.id, 'notes', e.target.value)}
                          className="w-full px-3 py-2 bg-input-bg border border-input-border text-input-text rounded-md focus:outline-none focus:ring-2 focus:ring-border-focus"
                          placeholder="Optional notes..."
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
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
                {plan ? 'Update Plan' : 'Create Plan'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
