export interface UserProfile {
  id: string;
  email: string;
  name: string;
  bio?: string;
  profilePicture?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  height?: number; // in cm
  weight?: number; // in kg
  fitnessLevel?: 'beginner' | 'intermediate' | 'advanced';
  primaryGoals?: string[];
  workoutPreferences?: {
    duration?: string;
    frequency?: string;
    timeOfDay?: string;
  };
  availableEquipment?: string[];
  notifications?: {
    email?: boolean;
    push?: boolean;
    workoutReminders?: boolean;
    goalUpdates?: boolean;
  };
  privacy?: {
    profileVisibility?: 'public' | 'friends' | 'private';
    showProgress?: boolean;
    showWorkouts?: boolean;
  };
  createdAt?: Date;
  updatedAt?: Date;
}


