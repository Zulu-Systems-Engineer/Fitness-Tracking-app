import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { usage, colors } from '../lib/theme';
import { workoutService, workoutPlanService, goalService, recordService } from '../lib/firebaseServices';

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    workoutPlans: 0,
    completedWorkouts: 0,
    personalRecords: 0,
    goalsAchieved: 0,
  });
  const [recentActivities, setRecentActivities] = useState<any[]>([]);

  const dashboardTheme = usage.dashboard || {
    headerBg: 'var(--bg-tertiary)',
    headerText: 'var(--text-primary)',
    cardBg: 'var(--card-bg)',
    accentBorder: 'var(--border-focus)',
  };

  // Load dashboard data from Firebase
  useEffect(() => {
    const loadDashboardData = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        // Load all data in parallel
        const [plans, workouts, goals, records] = await Promise.all([
          workoutPlanService.getAll(user.id),
          workoutService.getAll(user.id),
          goalService.getAll(user.id),
          recordService.getAll(user.id)
        ]);

        // Calculate stats
        const completedWorkouts = workouts.filter(w => w.status === 'completed').length;
        const achievedGoals = goals.filter(g => g.status === 'completed').length;

        setStats({
          workoutPlans: plans.length,
          completedWorkouts,
          personalRecords: records.length,
          goalsAchieved: achievedGoals,
        });

        // Generate recent activities (simplified for now)
        const activities = [];
        
        // Add recent workouts
        const recentWorkouts = workouts
          .filter(w => w.status === 'completed')
          .sort((a, b) => new Date(b.completedAt || b.startedAt).getTime() - new Date(a.completedAt || a.startedAt).getTime())
          .slice(0, 2);
        
        recentWorkouts.forEach(workout => {
          activities.push({
            action: `Completed "${workout.name}" workout`,
            time: getTimeAgo(workout.completedAt || workout.startedAt),
            type: 'workout'
          });
        });

        // Add recent goals
        const recentGoals = goals
          .filter(g => g.status === 'completed')
          .sort((a, b) => new Date(b.completedAt || b.updatedAt).getTime() - new Date(a.completedAt || a.updatedAt).getTime())
          .slice(0, 2);
        
        recentGoals.forEach(goal => {
          activities.push({
            action: `Achieved "${goal.title}" goal`,
            time: getTimeAgo(goal.completedAt || goal.updatedAt),
            type: 'goal'
          });
        });

        setRecentActivities(activities.slice(0, 4));
        
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        // Set default empty values
        setStats({
          workoutPlans: 0,
          completedWorkouts: 0,
          personalRecords: 0,
          goalsAchieved: 0,
        });
        setRecentActivities([]);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [user]);

  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    
    const diffInWeeks = Math.floor(diffInDays / 7);
    return `${diffInWeeks} week${diffInWeeks > 1 ? 's' : ''} ago`;
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
          <p className="mt-4 text-secondary">Loading dashboard...</p>
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
        {/* Header */}
        <div className="mb-8">
          <div className="glassmorphism p-8 rounded-3xl">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-4xl font-bold mb-2 text-primary">Welcome back, {user?.name}!</h1>
                <p className="text-secondary">Track your fitness journey and achieve your goals</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => navigate('/profile')}
                  className="glassmorphism px-6 py-3 rounded-xl hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all duration-300"
                  style={{ color: 'var(--glassmorphism-text)' }}
                >
                  Profile
                </button>
                <button
                  onClick={logout}
                  className="glassmorphism px-6 py-3 rounded-xl hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all duration-300"
                  style={{ color: 'var(--glassmorphism-text)' }}
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div
            className="glassmorphism p-6 rounded-2xl transition-all duration-300 hover:scale-105"
            style={{ 
              borderLeft: `4px solid ${dashboardTheme.accentBorder || 'var(--glassmorphism-border)'}`
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--glassmorphism-text-muted)' }}>Workout Plans</p>
                <p className="text-3xl font-bold mt-2" style={{ color: 'var(--glassmorphism-text)' }}>{stats.workoutPlans}</p>
              </div>
              <div className="text-4xl filter drop-shadow-lg">📋</div>
            </div>
          </div>
          
          <div
            className="glassmorphism p-6 rounded-2xl transition-all duration-300 hover:scale-105"
            style={{ 
              borderLeft: `4px solid ${dashboardTheme.accentBorder || 'var(--glassmorphism-border)'}`
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--glassmorphism-text-muted)' }}>Completed Workouts</p>
                <p className="text-3xl font-bold mt-2" style={{ color: 'var(--glassmorphism-text)' }}>{stats.completedWorkouts}</p>
              </div>
              <div className="text-4xl filter drop-shadow-lg">✅</div>
            </div>
          </div>
          
          <div
            className="glassmorphism p-6 rounded-2xl transition-all duration-300 hover:scale-105"
            style={{ 
              borderLeft: `4px solid ${dashboardTheme.accentBorder || 'var(--glassmorphism-border)'}`
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--glassmorphism-text-muted)' }}>Personal Records</p>
                <p className="text-3xl font-bold mt-2" style={{ color: 'var(--glassmorphism-text)' }}>{stats.personalRecords}</p>
              </div>
              <div className="text-4xl filter drop-shadow-lg">🏆</div>
            </div>
          </div>
          
          <div
            className="glassmorphism p-6 rounded-2xl transition-all duration-300 hover:scale-105"
            style={{ 
              borderLeft: `4px solid ${dashboardTheme.accentBorder || 'var(--glassmorphism-border)'}`
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--glassmorphism-text-muted)' }}>Goals Achieved</p>
                <p className="text-3xl font-bold mt-2" style={{ color: 'var(--glassmorphism-text)' }}>{stats.goalsAchieved}</p>
              </div>
              <div className="text-4xl filter drop-shadow-lg">🎯</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Quick Actions */}
          <div className="glassmorphism p-6 rounded-2xl">
            <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--glassmorphism-text)' }}>Quick Actions</h2>
            <div className="space-y-4">
              <button 
                onClick={() => navigate('/track')}
                className="w-full glassmorphism p-4 rounded-xl hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all duration-300 text-left"
                style={{ color: 'var(--glassmorphism-text)' }}
              >
                <div className="flex items-center">
                  <span className="text-2xl mr-4 filter drop-shadow-lg">🏋️</span>
                  <div>
                    <div className="font-semibold">Start New Workout</div>
                    <div className="text-sm" style={{ color: 'var(--glassmorphism-text-muted)' }}>Begin a workout from your plans</div>
                  </div>
                </div>
              </button>
              <button 
                onClick={() => navigate('/plans')}
                className="w-full glassmorphism p-4 rounded-xl hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all duration-300 text-left"
                style={{ color: 'var(--glassmorphism-text)' }}
              >
                <div className="flex items-center">
                  <span className="text-2xl mr-4 filter drop-shadow-lg">📋</span>
                  <div>
                    <div className="font-semibold">Create Workout Plan</div>
                    <div className="text-sm" style={{ color: 'var(--glassmorphism-text-muted)' }}>Design a new workout routine</div>
                  </div>
                </div>
              </button>
              <button
                onClick={() => navigate('/goals')}
                className="w-full glassmorphism p-4 rounded-xl hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all duration-300 text-left"
                style={{ color: 'var(--glassmorphism-text)' }}
              >
                <div className="flex items-center">
                  <span className="text-2xl mr-4 filter drop-shadow-lg">🎯</span>
                  <div>
                    <div className="font-semibold">Set New Goal</div>
                    <div className="text-sm" style={{ color: 'var(--glassmorphism-text-muted)' }}>Track your fitness objectives</div>
                  </div>
                </div>
              </button>
              <button
                onClick={() => navigate('/analytics')}
                className="w-full glassmorphism p-4 rounded-xl hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all duration-300 text-left"
                style={{ color: 'var(--glassmorphism-text)' }}
              >
                <div className="flex items-center">
                  <span className="text-2xl mr-4 filter drop-shadow-lg">📊</span>
                  <div>
                    <div className="font-semibold">View Analytics</div>
                    <div className="text-sm" style={{ color: 'var(--glassmorphism-text-muted)' }}>Analyze your fitness progress</div>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="glassmorphism p-6 rounded-2xl">
            <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--glassmorphism-text)' }}>Recent Activity</h2>
            <div className="space-y-4">
              {recentActivities.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-3">📈</div>
                  <p className="text-sm" style={{ color: 'var(--glassmorphism-text-secondary)' }}>
                    No recent activity yet. Start working out to see your progress here!
                  </p>
                </div>
              ) : (
                recentActivities.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 rounded-xl glassmorphism hover:scale-105 transition-all duration-300">
                    <div className="w-2 h-2 rounded-full mt-2 flex-shrink-0 shadow-lg" style={{ backgroundColor: 'var(--glassmorphism-border)' }}></div>
                    <div className="flex-1">
                      <p className="text-sm" style={{ color: 'var(--glassmorphism-text)' }}>{activity.action}</p>
                      <p className="text-xs mt-1" style={{ color: 'var(--glassmorphism-text-muted)' }}>{activity.time}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
