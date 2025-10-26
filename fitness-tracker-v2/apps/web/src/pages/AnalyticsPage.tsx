import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usage, colors } from '../lib/theme';
import { workoutService, goalService, recordService, Workout, Goal, PersonalRecord } from '../lib/firebaseServices';
import { useAuth } from '../contexts/AuthContext';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

export function AnalyticsPage() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [records, setRecords] = useState<PersonalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const navigate = useNavigate();
  const { user } = useAuth();

  const analyticsTheme = usage.analytics;

  // Load data from Firebase
  useEffect(() => {
    const loadData = async () => {
      if (!user) return;

      try {
        setLoading(true);

        // Load all data in parallel
        const [userWorkouts, userGoals, userRecords] = await Promise.all([
          workoutService.getAll(user.id),
          goalService.getAll(user.id),
          recordService.getAll(user.id)
        ]);

        setWorkouts(userWorkouts);
        setGoals(userGoals);
        setRecords(userRecords);

      } catch (error) {
        console.error('Error loading analytics data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  // Filter data by time range
  const getFilteredData = (data: any[], dateField: string) => {
    const now = new Date();
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 365;

    return data.filter(item => {
      const itemDate = new Date(item[dateField]);
      const diffTime = now.getTime() - itemDate.getTime();
      const diffDays = diffTime / (1000 * 3600 * 24);
      return diffDays <= days;
    });
  };

  // Workout Progress Analytics
  const getWorkoutProgressData = () => {
    const filteredWorkouts = getFilteredData(workouts, 'startedAt');
    const workoutData = filteredWorkouts
      .filter(w => w.status === 'completed')
      .sort((a, b) => a.startedAt.getTime() - b.startedAt.getTime())
      .map(workout => ({
        date: workout.startedAt.toLocaleDateString(),
        duration: workout.duration || 0,
        exercises: workout.exercises.length,
        totalSets: workout.exercises.reduce((sum, ex) => sum + ex.sets.length, 0)
      }));

    return workoutData;
  };

  // Goal Progress Analytics
  const getGoalProgressData = () => {
    const filteredGoals = getFilteredData(goals, 'createdAt');
    const goalStats = {
      total: filteredGoals.length,
      completed: filteredGoals.filter(g => g.status === 'completed').length,
      active: filteredGoals.filter(g => g.status === 'active').length,
      paused: filteredGoals.filter(g => g.status === 'paused').length,
    };

    return [
      { name: 'Completed', value: goalStats.completed, color: analyticsTheme.chartPrimary },
      { name: 'Active', value: goalStats.active, color: analyticsTheme.chartSecondary },
      { name: 'Paused', value: goalStats.paused, color: analyticsTheme.chartTertiary },
    ].filter(item => item.value > 0);
  };

  // Personal Records Analytics
  const getRecordsData = () => {
    const filteredRecords = getFilteredData(records, 'dateAchieved');
    const recordsByType = filteredRecords.reduce((acc, record) => {
      if (!acc[record.recordType]) {
        acc[record.recordType] = [];
      }
      acc[record.recordType].push(record);
      return acc;
    }, {} as Record<string, PersonalRecord[]>);

    return Object.entries(recordsByType).map(([type, records]) => ({
      type: type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      count: records.length,
      latest: records.sort((a, b) => b.dateAchieved.getTime() - a.dateAchieved.getTime())[0]?.dateAchieved.toLocaleDateString()
    }));
  };

  // Weekly Workout Frequency
  const getWeeklyFrequencyData = () => {
    const filteredWorkouts = getFilteredData(workouts, 'startedAt');
    const weeklyData: Record<string, number> = {};

    filteredWorkouts.forEach(workout => {
      const weekStart = new Date(workout.startedAt);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      const weekKey = weekStart.toLocaleDateString();

      weeklyData[weekKey] = (weeklyData[weekKey] || 0) + 1;
    });

    return Object.entries(weeklyData)
      .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
      .map(([week, count]) => ({ week, workouts: count }));
  };

  // Exercise Performance Trends
  const getExerciseTrendsData = () => {
    const filteredWorkouts = getFilteredData(workouts, 'startedAt');
    const exerciseData: Record<string, { totalWeight: number, totalReps: number, sessions: number }> = {};

    filteredWorkouts.forEach(workout => {
      workout.exercises.forEach(exercise => {
        if (!exerciseData[exercise.exerciseName]) {
          exerciseData[exercise.exerciseName] = { totalWeight: 0, totalReps: 0, sessions: 0 };
        }

        exercise.sets.forEach(set => {
          exerciseData[exercise.exerciseName].totalWeight += set.weight || 0;
          exerciseData[exercise.exerciseName].totalReps += set.reps;
        });

        exerciseData[exercise.exerciseName].sessions += 1;
      });
    });

    return Object.entries(exerciseData)
      .map(([exercise, data]) => ({
        exercise,
        avgWeight: Math.round(data.totalWeight / data.sessions),
        totalReps: data.totalReps,
        sessions: data.sessions
      }))
      .sort((a, b) => b.sessions - a.sessions)
      .slice(0, 10); // Top 10 exercises
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
          <p className="mt-4 text-gray-300">Loading analytics...</p>
        </div>
      </div>
    );
  }

  const workoutProgressData = getWorkoutProgressData();
  const goalProgressData = getGoalProgressData();
  const recordsData = getRecordsData();
  const weeklyFrequencyData = getWeeklyFrequencyData();
  const exerciseTrendsData = getExerciseTrendsData();

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
              Analytics & Insights
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 text-primary">Analytics Dashboard</h1>
          <p className="text-secondary">Track your fitness progress and performance insights</p>
        </div>

        {/* Time Range Selector */}
        <div className="mb-8 flex justify-center">
          <div className="glassmorphism rounded-lg p-1">
            {[
              { value: '7d', label: '7 Days' },
              { value: '30d', label: '30 Days' },
              { value: '90d', label: '90 Days' },
              { value: '1y', label: '1 Year' },
            ].map((range) => (
              <button
                key={range.value}
                onClick={() => setTimeRange(range.value as any)}
                className={`px-4 py-2 rounded-md transition-colors ${
                  timeRange === range.value
                    ? 'bg-accent-primary text-white'
                    : 'text-gray-300 hover:text-white hover:glassmorphism'
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="glassmorphism rounded-lg p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold" style={{ color: 'var(--glassmorphism-text)' }}>
                  {workouts.filter(w => w.status === 'completed').length}
                </p>
                <p style={{ color: 'var(--glassmorphism-text-secondary)' }}>Total Workouts</p>
              </div>
            </div>
          </div>

          <div className="glassmorphism rounded-lg p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold" style={{ color: 'var(--glassmorphism-text)' }}>
                  {goals.filter(g => g.status === 'completed').length}
                </p>
                <p style={{ color: 'var(--glassmorphism-text-secondary)' }}>Goals Achieved</p>
              </div>
            </div>
          </div>

          <div className="glassmorphism rounded-lg p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold" style={{ color: 'var(--glassmorphism-text)' }}>
                  {records.length}
                </p>
                <p style={{ color: 'var(--glassmorphism-text-secondary)' }}>Personal Records</p>
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
                <p className="text-2xl font-bold" style={{ color: 'var(--glassmorphism-text)' }}>
                  {Math.round(workouts.filter(w => w.status === 'completed').reduce((sum, w) => sum + (w.duration || 0), 0) / 60)}h
                </p>
                <p style={{ color: 'var(--glassmorphism-text-secondary)' }}>Total Training Time</p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Workout Progress Over Time */}
          <div className="glassmorphism rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4" style={{ color: 'var(--glassmorphism-text)' }}>
              Workout Progress
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={workoutProgressData}>
                <CartesianGrid strokeDasharray="3 3" stroke={analyticsTheme.gridLines} />
                <XAxis
                  dataKey="date"
                  stroke={analyticsTheme.axisText}
                  fontSize={12}
                />
                <YAxis stroke={analyticsTheme.axisText} fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--glassmorphism-bg)',
                    border: '1px solid var(--glassmorphism-border)',
                    borderRadius: '8px'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="duration"
                  stroke={analyticsTheme.chartPrimary}
                  fill={analyticsTheme.chartPrimary}
                  fillOpacity={0.3}
                  name="Duration (min)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Weekly Workout Frequency */}
          <div className="glassmorphism rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4" style={{ color: 'var(--glassmorphism-text)' }}>
              Weekly Workout Frequency
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={weeklyFrequencyData}>
                <CartesianGrid strokeDasharray="3 3" stroke={analyticsTheme.gridLines} />
                <XAxis
                  dataKey="week"
                  stroke={analyticsTheme.axisText}
                  fontSize={12}
                />
                <YAxis stroke={analyticsTheme.axisText} fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--glassmorphism-bg)',
                    border: '1px solid var(--glassmorphism-border)',
                    borderRadius: '8px'
                  }}
                />
                <Bar
                  dataKey="workouts"
                  fill={analyticsTheme.chartSecondary}
                  name="Workouts"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Goal Status Distribution */}
          <div className="glassmorphism rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4" style={{ color: 'var(--glassmorphism-text)' }}>
              Goal Status Distribution
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={goalProgressData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {goalProgressData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Exercise Performance Trends */}
          <div className="glassmorphism rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4" style={{ color: 'var(--glassmorphism-text)' }}>
              Top Exercises by Sessions
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={exerciseTrendsData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" stroke={analyticsTheme.gridLines} />
                <XAxis type="number" stroke={analyticsTheme.axisText} fontSize={12} />
                <YAxis
                  dataKey="exercise"
                  type="category"
                  stroke={analyticsTheme.axisText}
                  fontSize={12}
                  width={100}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--glassmorphism-bg)',
                    border: '1px solid var(--glassmorphism-border)',
                    borderRadius: '8px'
                  }}
                />
                <Bar
                  dataKey="sessions"
                  fill={analyticsTheme.chartTertiary}
                  name="Sessions"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Personal Records Table */}
        <div className="glassmorphism rounded-lg p-6 mb-8">
          <h3 className="text-xl font-semibold mb-4" style={{ color: 'var(--glassmorphism-text)' }}>
            Personal Records Summary
          </h3>
          {recordsData.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--glassmorphism-border)' }}>
                    <th className="text-left py-2" style={{ color: 'var(--glassmorphism-text-secondary)' }}>Record Type</th>
                    <th className="text-left py-2" style={{ color: 'var(--glassmorphism-text-secondary)' }}>Count</th>
                    <th className="text-left py-2" style={{ color: 'var(--glassmorphism-text-secondary)' }}>Latest Achievement</th>
                  </tr>
                </thead>
                <tbody>
                  {recordsData.map((record, index) => (
                    <tr key={index} style={{ borderBottom: '1px solid var(--glassmorphism-border)' }}>
                      <td className="py-3" style={{ color: 'var(--glassmorphism-text)' }}>{record.type}</td>
                      <td className="py-3" style={{ color: 'var(--glassmorphism-text)' }}>{record.count}</td>
                      <td className="py-3" style={{ color: 'var(--glassmorphism-text-secondary)' }}>{record.latest}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p style={{ color: 'var(--glassmorphism-text-secondary)' }}>No personal records yet. Keep training to set your first records!</p>
          )}
        </div>

        {/* Recent Achievements */}
        <div className="glassmorphism rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4" style={{ color: 'var(--glassmorphism-text)' }}>
            Recent Achievements
          </h3>
          <div className="space-y-4">
            {goals.filter(g => g.status === 'completed').slice(0, 5).map((goal) => (
              <div key={goal.id} className="flex items-center justify-between p-3 glassmorphism rounded-lg">
                <div>
                  <h4 className="font-medium" style={{ color: 'var(--glassmorphism-text)' }}>{goal.title}</h4>
                  <p className="text-sm" style={{ color: 'var(--glassmorphism-text-secondary)' }}>
                    Completed on {goal.completedAt?.toLocaleDateString()}
                  </p>
                </div>
                <div className="text-2xl">🏆</div>
              </div>
            ))}
            {goals.filter(g => g.status === 'completed').length === 0 && (
              <p style={{ color: 'var(--glassmorphism-text-secondary)' }}>No completed goals yet. Keep working towards your targets!</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
