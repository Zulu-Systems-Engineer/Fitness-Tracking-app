import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { usage } from '../lib/theme';
import { PersonalTab } from '../components/profile/PersonalTab';
import { SecurityTab } from '../components/profile/SecurityTab';
import { UserProfile } from '../types/UserProfile';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'personal' | 'fitness' | 'preferences' | 'privacy' | 'security'>('personal');

  const profileTheme = usage.profile || {
    headerBg: 'var(--bg-tertiary)',
    headerText: 'var(--text-primary)',
    cardBg: 'var(--card-bg)',
    accentBorder: 'var(--border-focus)',
  };

  // Load profile from Firebase
  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        // TODO: Replace with actual Firebase call
        // const userProfile = await profileService.get(user.id);
        // setProfile(userProfile);
        
        // For now, create a basic profile from user data
        const basicProfile: UserProfile = {
          id: user.id,
          email: user.email,
          name: user.name,
          profilePicture: user.profilePicture,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        
        setProfile(basicProfile);
      } catch (error) {
        console.error('Error loading profile:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user]);

  const handleSave = async () => {
    if (!profile) return;
    
    setSaving(true);
    setSaveMessage('');
    try {
      // TODO: Replace with actual Firebase call
      // await profileService.update(profile.id, profile);
      
      console.log('Profile saved:', profile);
      setSaveMessage('Profile saved successfully! (Note: Firebase integration pending)');
      // Clear message after 3 seconds
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      console.error('Error saving profile:', error);
      setSaveMessage('Error saving profile. Please try again.');
      setTimeout(() => setSaveMessage(''), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    if (!profile) return;
    
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setProfile(prev => prev ? {
        ...prev,
        [parent]: {
          ...prev[parent as keyof UserProfile],
          [child]: value,
        }
      } : null);
    } else {
      setProfile(prev => prev ? { ...prev, [field]: value } : null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen hero-gradient flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-primary mx-auto mb-4"></div>
          <p className="text-gray-300">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen hero-gradient flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-300">Profile not found</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="mt-4 bg-btn-primary-bg text-btn-primary-text px-6 py-2 rounded-lg hover:bg-btn-primary-hover transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen hero-gradient p-6">
      <div className="max-w-4xl mx-auto">
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
            <div className="text-sm text-gray-300">
              Profile Settings
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="mb-8" style={{ backgroundColor: profileTheme.headerBg, color: profileTheme.headerText }}>
          <div className="p-8 rounded-lg">
            <div className="flex items-center gap-6">
              <div className="relative">
                {profile.profilePicture ? (
                  <img
                    src={profile.profilePicture}
                    alt="Profile"
                    className="w-24 h-24 rounded-full object-cover border-4 border-white/20"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center border-4 border-white/20">
                    <svg className="w-12 h-12 text-white/70" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
                <button 
                  onClick={() => document.getElementById('header-profile-picture-upload')?.click()}
                  className="absolute bottom-0 right-0 bg-accent-primary text-white rounded-full p-2 hover:bg-accent-primary/80 transition-colors"
                  title="Change profile picture"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
                <input
                  id="header-profile-picture-upload"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      const file = e.target.files[0];
                      if (file.type.startsWith('image/') && file.size <= 5 * 1024 * 1024) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          if (event.target?.result) {
                            handleInputChange('profilePicture', event.target.result as string);
                          }
                        };
                        reader.readAsDataURL(file);
                      }
                    }
                  }}
                  className="hidden"
                />
              </div>
              <div>
                <h1 className="text-4xl font-bold mb-2 text-primary">{profile.name}</h1>
                <p className="text-secondary">{profile.email}</p>
                <p className="text-muted text-sm mt-1">
                  Member since {profile.createdAt?.toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="flex space-x-1 glassmorphism rounded-lg p-1">
            {[
              { id: 'personal', label: 'Personal Info', icon: '👤' },
              { id: 'fitness', label: 'Fitness', icon: '💪' },
              { id: 'preferences', label: 'Preferences', icon: '⚙️' },
              { id: 'privacy', label: 'Privacy', icon: '🔒' },
              { id: 'security', label: 'Security', icon: '🔐' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-md transition-colors ${
                  activeTab === tab.id
                    ? 'bg-accent-primary text-white'
                    : 'text-gray-300 hover:text-white hover:glassmorphism'
                }`}
              >
                <span>{tab.icon}</span>
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="glassmorphism rounded-lg p-6">
          {activeTab === 'personal' && (
            <PersonalTab profile={profile} onChange={handleInputChange} />
          )}
          {activeTab === 'fitness' && (
            <FitnessTab profile={profile} onChange={handleInputChange} />
          )}
          {activeTab === 'preferences' && (
            <PreferencesTab profile={profile} onChange={handleInputChange} />
          )}
          {activeTab === 'privacy' && (
            <PrivacyTab profile={profile} onChange={handleInputChange} />
          )}
          {activeTab === 'security' && (
            <SecurityTab profile={profile} onChange={handleInputChange} />
          )}
        </div>

        {/* Save Message */}
        {saveMessage && (
          <div className={`mt-6 p-3 rounded-lg text-sm ${
            saveMessage.includes('successfully') 
              ? 'bg-green-500/20 border border-green-500/30 text-green-200' 
              : 'bg-red-500/20 border border-red-500/30 text-red-200'
          }`}>
            {saveMessage}
          </div>
        )}

        {/* Save Button */}
        <div className="mt-8 flex justify-end gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="px-6 py-2 border border-card-border text-white rounded-lg hover:glassmorphism transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-btn-primary-bg text-btn-primary-text rounded-lg hover:bg-btn-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

// Personal Info Tab Component
function PersonalInfoTab({ profile, onChange }: { profile: UserProfile; onChange: (field: string, value: any) => void }) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--glassmorphism-text)' }}>Personal Information</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Full Name
          </label>
          <input
            type="text"
            value={profile.name}
            onChange={(e) => onChange('name', e.target.value)}
            className="w-full px-3 py-2 bg-input-bg border border-input-border text-input-text rounded-md focus:outline-none focus:ring-2 focus:ring-border-focus"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Email
          </label>
          <input
            type="email"
            value={profile.email}
            onChange={(e) => onChange('email', e.target.value)}
            className="w-full px-3 py-2 bg-input-bg border border-input-border text-input-text rounded-md focus:outline-none focus:ring-2 focus:ring-border-focus"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Date of Birth
          </label>
          <input
            type="date"
            value={profile.dateOfBirth || ''}
            onChange={(e) => onChange('dateOfBirth', e.target.value)}
            className="w-full px-3 py-2 bg-input-bg border border-input-border text-input-text rounded-md focus:outline-none focus:ring-2 focus:ring-border-focus"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Gender
          </label>
          <select
            value={profile.gender || ''}
            onChange={(e) => onChange('gender', e.target.value)}
            className="w-full px-3 py-2 bg-input-bg border border-input-border text-input-text rounded-md focus:outline-none focus:ring-2 focus:ring-border-focus"
          >
            <option value="">Select gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
            <option value="prefer_not_to_say">Prefer not to say</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Height (cm)
          </label>
          <input
            type="number"
            value={profile.height || ''}
            onChange={(e) => onChange('height', parseInt(e.target.value))}
            className="w-full px-3 py-2 bg-input-bg border border-input-border text-input-text rounded-md focus:outline-none focus:ring-2 focus:ring-border-focus"
            min="100"
            max="250"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Weight (kg)
          </label>
          <input
            type="number"
            value={profile.weight || ''}
            onChange={(e) => onChange('weight', parseFloat(e.target.value))}
            className="w-full px-3 py-2 bg-input-bg border border-input-border text-input-text rounded-md focus:outline-none focus:ring-2 focus:ring-border-focus"
            min="30"
            max="300"
            step="0.1"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium style={{ color: 'var(--glassmorphism-text-secondary)' }} mb-2">
          Bio
        </label>
        <textarea
          value={profile.bio || ''}
          onChange={(e) => onChange('bio', e.target.value)}
          className="w-full px-3 py-2 bg-input-bg border border-input-border text-input-text rounded-md focus:outline-none focus:ring-2 focus:ring-border-focus"
          rows={4}
          placeholder="Tell us about yourself..."
        />
      </div>
    </div>
  );
}

// Fitness Tab Component
function FitnessTab({ profile, onChange }: { profile: UserProfile; onChange: (field: string, value: any) => void }) {
  const fitnessGoals = [
    { id: 'weight_loss', label: 'Weight Loss' },
    { id: 'weight_gain', label: 'Weight Gain' },
    { id: 'muscle_gain', label: 'Muscle Gain' },
    { id: 'strength', label: 'Strength' },
    { id: 'endurance', label: 'Endurance' },
    { id: 'flexibility', label: 'Flexibility' },
    { id: 'general_fitness', label: 'General Fitness' },
  ];

  const equipmentOptions = [
    'dumbbells', 'barbell', 'bench', 'kettlebell', 'resistance_bands',
    'pull_up_bar', 'treadmill', 'bike', 'rower', 'yoga_mat'
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--glassmorphism-text)' }}>Fitness Information</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Fitness Level
          </label>
          <select
            value={profile.fitnessLevel || ''}
            onChange={(e) => onChange('fitnessLevel', e.target.value)}
            className="w-full px-3 py-2 bg-input-bg border border-input-border text-input-text rounded-md focus:outline-none focus:ring-2 focus:ring-border-focus"
          >
            <option value="">Select level</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Preferred Workout Duration (minutes)
          </label>
          <input
            type="number"
            value={profile.workoutPreferences?.duration || ''}
            onChange={(e) => onChange('workoutPreferences.duration', parseInt(e.target.value))}
            className="w-full px-3 py-2 bg-input-bg border border-input-border text-input-text rounded-md focus:outline-none focus:ring-2 focus:ring-border-focus"
            min="15"
            max="180"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Workouts per Week
          </label>
          <input
            type="number"
            value={profile.workoutPreferences?.frequency || ''}
            onChange={(e) => onChange('workoutPreferences.frequency', parseInt(e.target.value))}
            className="w-full px-3 py-2 bg-input-bg border border-input-border text-input-text rounded-md focus:outline-none focus:ring-2 focus:ring-border-focus"
            min="1"
            max="7"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Preferred Time of Day
          </label>
          <select
            value={profile.workoutPreferences?.timeOfDay || ''}
            onChange={(e) => onChange('workoutPreferences.timeOfDay', e.target.value)}
            className="w-full px-3 py-2 bg-input-bg border border-input-border text-input-text rounded-md focus:outline-none focus:ring-2 focus:ring-border-focus"
          >
            <option value="">Select time</option>
            <option value="morning">Morning</option>
            <option value="afternoon">Afternoon</option>
            <option value="evening">Evening</option>
            <option value="any">Any time</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium style={{ color: 'var(--glassmorphism-text-secondary)' }} mb-3">
          Primary Goals
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {fitnessGoals.map((goal) => (
            <label key={goal.id} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={profile.primaryGoals?.includes(goal.id) || false}
                onChange={(e) => {
                  const currentGoals = profile.primaryGoals || [];
                  if (e.target.checked) {
                    onChange('primaryGoals', [...currentGoals, goal.id]);
                  } else {
                    onChange('primaryGoals', currentGoals.filter(g => g !== goal.id));
                  }
                }}
                className="rounded border-input-border text-accent-primary focus:ring-border-focus"
              />
              <span className="text-sm style={{ color: 'var(--glassmorphism-text)' }}">{goal.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium style={{ color: 'var(--glassmorphism-text-secondary)' }} mb-3">
          Available Equipment
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {equipmentOptions.map((equipment) => (
            <label key={equipment} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={profile.workoutPreferences?.equipment?.includes(equipment) || false}
                onChange={(e) => {
                  const currentEquipment = profile.workoutPreferences?.equipment || [];
                  if (e.target.checked) {
                    onChange('workoutPreferences.equipment', [...currentEquipment, equipment]);
                  } else {
                    onChange('workoutPreferences.equipment', currentEquipment.filter(eq => eq !== equipment));
                  }
                }}
                className="rounded border-input-border text-accent-primary focus:ring-border-focus"
              />
              <span className="text-sm style={{ color: 'var(--glassmorphism-text)' }} capitalize">{equipment.replace('_', ' ')}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

// Preferences Tab Component
function PreferencesTab({ profile, onChange }: { profile: UserProfile; onChange: (field: string, value: any) => void }) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--glassmorphism-text)' }}>Notification Preferences</h2>
      
      <div className="space-y-4">
        {[
          { key: 'email', label: 'Email Notifications', description: 'Receive updates via email' },
          { key: 'push', label: 'Push Notifications', description: 'Receive push notifications on your device' },
          { key: 'workoutReminders', label: 'Workout Reminders', description: 'Get reminded about scheduled workouts' },
          { key: 'goalUpdates', label: 'Goal Updates', description: 'Get notified about goal progress' },
        ].map((pref) => (
          <div key={pref.key} className="flex items-center justify-between p-4 glassmorphism rounded-lg border border-card-border">
            <div>
              <h3 className="font-medium style={{ color: 'var(--glassmorphism-text)' }}">{pref.label}</h3>
              <p className="text-sm style={{ color: 'var(--glassmorphism-text-muted)' }}">{pref.description}</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={profile.notifications?.[pref.key as keyof typeof profile.notifications] || false}
                onChange={(e) => onChange(`notifications.${pref.key}`, e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-accent-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent-primary"></div>
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}

// Privacy Tab Component
function PrivacyTab({ profile, onChange }: { profile: UserProfile; onChange: (field: string, value: any) => void }) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--glassmorphism-text)' }}>Privacy Settings</h2>
      
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Profile Visibility
          </label>
          <select
            value={profile.privacy?.profileVisibility || 'public'}
            onChange={(e) => onChange('privacy.profileVisibility', e.target.value)}
            className="w-full px-3 py-2 bg-input-bg border border-input-border text-input-text rounded-md focus:outline-none focus:ring-2 focus:ring-border-focus"
          >
            <option value="public">Public - Anyone can see your profile</option>
            <option value="friends">Friends - Only friends can see your profile</option>
            <option value="private">Private - Only you can see your profile</option>
          </select>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium style={{ color: 'var(--glassmorphism-text)' }}">Data Sharing</h3>
          {[
            { key: 'showProgress', label: 'Show Progress', description: 'Allow others to see your fitness progress' },
            { key: 'showWorkouts', label: 'Show Workouts', description: 'Allow others to see your workout history' },
          ].map((setting) => (
            <div key={setting.key} className="flex items-center justify-between p-4 glassmorphism rounded-lg border border-card-border">
              <div>
                <h4 className="font-medium style={{ color: 'var(--glassmorphism-text)' }}">{setting.label}</h4>
                <p className="text-sm style={{ color: 'var(--glassmorphism-text-muted)' }}">{setting.description}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={profile.privacy?.[setting.key as keyof typeof profile.privacy] || false}
                  onChange={(e) => onChange(`privacy.${setting.key}`, e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-accent-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent-primary"></div>
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
