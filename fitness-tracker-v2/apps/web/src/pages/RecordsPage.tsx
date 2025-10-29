import React, { useState, useEffect } from 'react';
import { usage } from '../lib/theme';

// Mock types for demo purposes
interface PersonalRecord {
  id: string;
  userId: string;
  exerciseId: string;
  exerciseName: string;
  recordType: 'max_weight' | 'max_reps' | 'max_volume' | 'max_duration' | 'best_time';
  value: number;
  unit: string;
  previousRecord?: number;
  improvement?: number;
  workoutId: string;
  workoutDate: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface RecordStats {
  totalRecords: number;
  recordsThisMonth: number;
  recordsThisYear: number;
  mostImprovedExercise?: string;
  biggestImprovement?: number;
  recentRecords: PersonalRecord[];
}

export default function RecordsPage() {
  const [records, setRecords] = useState<PersonalRecord[]>([]);
  const [stats, setStats] = useState<RecordStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    exerciseId: '',
    recordType: '',
    search: '',
  });

  const recordsTheme = usage.analytics; // Using analytics theme for records

  // Load records from Firebase
  useEffect(() => {
    const loadRecords = async () => {
      try {
        setLoading(true);
        // TODO: Replace with actual Firebase calls
        // const userRecords = await recordService.getAll(user.id);
        // const userStats = await recordService.getStats(user.id);
        // setRecords(userRecords);
        // setStats(userStats);
        
        // For now, show empty state
        setRecords([]);
        setStats({
          totalRecords: 0,
          recordsThisMonth: 0,
          recordsThisYear: 0,
          recentRecords: [],
        });
      } catch (error) {
        console.error('Error loading records:', error);
      } finally {
        setLoading(false);
      }
    };

    loadRecords();
  }, []);

  const filteredRecords = records.filter(record => {
    const matchesExercise = !filters.exerciseId || record.exerciseId === filters.exerciseId;
    const matchesType = !filters.recordType || record.recordType === filters.recordType;
    const matchesSearch = !filters.search || 
      record.exerciseName.toLowerCase().includes(filters.search.toLowerCase()) ||
      record.notes?.toLowerCase().includes(filters.search.toLowerCase());
    
    return matchesExercise && matchesType && matchesSearch;
  });

  const getRecordTypeLabel = (type: string) => {
    const labels = {
      max_weight: 'Max Weight',
      max_reps: 'Max Reps',
      max_volume: 'Max Volume',
      max_duration: 'Max Duration',
      best_time: 'Best Time',
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getRecordTypeIcon = (type: string) => {
    const icons = {
      max_weight: '🏋️',
      max_reps: '💪',
      max_volume: '📊',
      max_duration: '⏱️',
      best_time: '⚡',
    };
    return icons[type as keyof typeof icons] || '🏆';
  };

  const getImprovementColor = (improvement?: number) => {
    if (!improvement) return 'text-gray-400';
    if (improvement > 20) return 'text-green-600';
    if (improvement > 10) return 'text-green-500';
    if (improvement > 5) return 'text-yellow-500';
    return 'text-orange-500';
  };

  if (loading) {
    return (
      <div className="min-h-screen hero-gradient flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4" style={{ color: 'var(--glassmorphism-text-secondary)' }}>Loading personal records...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen hero-gradient p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8" style={{ backgroundColor: recordsTheme.chartPrimary, color: 'white' }}>
          <div className="p-8 rounded-lg">
            <h1 className="text-4xl font-bold mb-2 text-primary">Personal Records</h1>
            <p className="text-secondary">Track your achievements and celebrate your progress</p>
          </div>
        </div>

        {/* Stats Overview */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="glassmorphism rounded-lg p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold" style={{ color: 'var(--glassmorphism-text)' }}>{stats.totalRecords}</p>
                  <p style={{ color: 'var(--glassmorphism-text-secondary)' }}>Total Records</p>
                </div>
              </div>
            </div>

            <div className="glassmorphism rounded-lg p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold" style={{ color: 'var(--glassmorphism-text)' }}>{stats.recordsThisMonth}</p>
                  <p style={{ color: 'var(--glassmorphism-text-secondary)' }}>This Month</p>
                </div>
              </div>
            </div>

            <div className="glassmorphism rounded-lg p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold" style={{ color: 'var(--glassmorphism-text)' }}>{stats.biggestImprovement || 0}%</p>
                  <p style={{ color: 'var(--glassmorphism-text-secondary)' }}>Biggest Improvement</p>
                </div>
              </div>
            </div>

            <div className="glassmorphism rounded-lg p-6">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold" style={{ color: 'var(--glassmorphism-text)' }}>{stats.mostImprovedExercise || 'N/A'}</p>
                  <p style={{ color: 'var(--glassmorphism-text-secondary)' }}>Most Improved</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="mb-8 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div className="flex flex-wrap gap-4">
            <select
              value={filters.recordType}
              onChange={(e) => setFilters({...filters, recordType: e.target.value})}
              className="px-4 py-2 glassmorphism rounded-lg style={{ color: 'var(--glassmorphism-text)' }} focus:outline-none focus:ring-2 focus:ring-border-focus"
            >
              <option value="">All Record Types</option>
              <option value="max_weight">Max Weight</option>
              <option value="max_reps">Max Reps</option>
              <option value="max_volume">Max Volume</option>
              <option value="max_duration">Max Duration</option>
              <option value="best_time">Best Time</option>
            </select>
            
            <input
              type="text"
              placeholder="Search records..."
              value={filters.search}
              onChange={(e) => setFilters({...filters, search: e.target.value})}
              className="px-4 py-2 glassmorphism rounded-lg style={{ color: 'var(--glassmorphism-text)' }} placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-border-focus"
            />
          </div>
        </div>

        {/* Records List */}
        <div className="space-y-4">
          {filteredRecords.length === 0 ? (
            <div className="glassmorphism rounded-lg p-8 text-center">
              <div className="text-6xl mb-4">🏆</div>
              <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--glassmorphism-text)' }}>
                No Personal Records Yet
              </h3>
              <p style={{ color: 'var(--glassmorphism-text-secondary)' }}>
                Start tracking your workouts to see your personal records here. Records will be automatically tracked when you complete workouts.
              </p>
            </div>
          ) : (
            filteredRecords.map((record) => (
            <div key={record.id} className="glassmorphism rounded-lg p-6 hover:shadow-lg transition-shadow" style={{ borderLeftColor: recordsTheme.chartSecondary, borderLeftWidth: '4px' }}>
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{getRecordTypeIcon(record.recordType)}</span>
                  <div>
                    <h3 className="text-xl font-semibold style={{ color: 'var(--glassmorphism-text)' }}">{record.exerciseName}</h3>
                    <p style={{ color: 'var(--glassmorphism-text-secondary)' }}>{getRecordTypeLabel(record.recordType)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold" style={{ color: 'var(--glassmorphism-text)' }}>
                    {record.value} {record.unit}
                  </p>
                  <p className="text-sm style={{ color: 'var(--glassmorphism-text-muted)' }}">
                    {record.workoutDate.toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              {record.previousRecord && (
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="style={{ color: 'var(--glassmorphism-text-muted)' }}">Previous Record:</span>
                    <span className="style={{ color: 'var(--glassmorphism-text)' }}">{record.previousRecord} {record.unit}</span>
                  </div>
                  {record.improvement && (
                    <div className="flex justify-between items-center">
                      <span className="style={{ color: 'var(--glassmorphism-text-muted)' }}">Improvement:</span>
                      <span className={`font-semibold ${getImprovementColor(record.improvement)}`}>
                        +{record.improvement}%
                      </span>
                    </div>
                  )}
                </div>
              )}
              
              {record.notes && (
                <div className="mt-4 p-3 bg-bg-tertiary rounded-lg">
                  <p className="style={{ color: 'var(--glassmorphism-text-secondary)' }} italic">"{record.notes}"</p>
                </div>
              )}
            </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
