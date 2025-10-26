import React, { createContext, useContext } from 'react';
import { useFirebaseAuth, AuthUser } from '../hooks/useFirebaseAuth';

interface User {
  id: string;
  email: string;
  name: string;
  profilePicture?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  signup: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>;
  signInWithGoogle: () => Promise<boolean>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const { user: firebaseUser, loading, login: firebaseLogin, logout: firebaseLogout, signup: firebaseSignup, signInWithGoogle: firebaseGoogleSignIn } = useFirebaseAuth();

  // Convert Firebase user to our User interface
  const user: User | null = firebaseUser ? {
    id: firebaseUser.uid,
    email: firebaseUser.email || '',
    name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
    profilePicture: firebaseUser.photoURL || undefined
  } : null;

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      await firebaseLogin(email, password);
      return { success: true };
    } catch (error: any) {
      console.error('Login failed:', error);
      
      // Provide more specific error messages
      let errorMessage = 'Invalid email or password';
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email address.';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password. Please try again.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed attempts. Please try again later.';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Please check your internet connection.';
      }
      
      return { success: false, error: errorMessage };
    }
  };

  const logout = async () => {
    try {
      await firebaseLogout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const signup = async (email: string, password: string, name: string): Promise<{ success: boolean; error?: string }> => {
    try {
      await firebaseSignup(email, password, name);
      return { success: true };
    } catch (error: any) {
      console.error('Signup failed:', error);
      
      // Log specific error details for debugging
      if (error.code) {
        console.error('Firebase Error Code:', error.code);
        console.error('Firebase Error Message:', error.message);
      }
      
      // Provide more specific error messages
      let errorMessage = error.message;
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'This email is already registered. Please try logging in instead.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password should be at least 6 characters long.';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Please check your internet connection.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed attempts. Please try again later.';
      }
      
      return { success: false, error: errorMessage };
    }
  };

  const signInWithGoogle = async (): Promise<boolean> => {
    try {
      await firebaseGoogleSignIn();
      return true;
    } catch (error) {
      console.error('Google sign-in failed:', error);
      return false;
    }
  };

  const value = {
    user,
    login,
    logout,
    signup,
    signInWithGoogle,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
