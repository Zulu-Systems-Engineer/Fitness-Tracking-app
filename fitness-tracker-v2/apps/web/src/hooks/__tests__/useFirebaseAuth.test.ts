import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useFirebaseAuth } from '../useFirebaseAuth';
import { User } from 'firebase/auth';

// Mock Firebase
vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => ({})),
  onAuthStateChanged: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
  signInWithPopup: vi.fn(),
  signOut: vi.fn(),
  updateProfile: vi.fn(),
}));

vi.mock('../lib/firebase', () => ({
  auth: {},
  googleProvider: {},
}));

describe('useFirebaseAuth', () => {
  it('should initialize with loading state', () => {
    const { result } = renderHook(() => useFirebaseAuth());
    expect(result.current.loading).toBe(true);
    expect(result.current.user).toBe(null);
  });

  it('should handle sign in', async () => {
    const mockUser: User = {
      uid: 'test-uid',
      email: 'test@example.com',
      displayName: 'Test User',
      photoURL: null,
    } as User;

    const { signInWithEmailAndPassword, onAuthStateChanged } = await import('firebase/auth');

    // Mock signInWithEmailAndPassword to resolve with mockUser
    vi.mocked(signInWithEmailAndPassword).mockResolvedValue({
      user: mockUser,
    } as any);

    // Mock onAuthStateChanged to call callback with user
    const mockUnsubscribe = vi.fn();
    vi.mocked(onAuthStateChanged).mockImplementation((auth, callback) => {
      // Simulate auth state change after sign in
      setTimeout(() => callback(mockUser), 0);
      return mockUnsubscribe;
    });

    const { result } = renderHook(() => useFirebaseAuth());

    // Wait for initial loading to complete
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Test sign in logic
    await result.current.login('test@example.com', 'password123');

    // Wait for auth state to update
    await waitFor(() => {
      expect(result.current.user).toEqual({
        uid: 'test-uid',
        email: 'test@example.com',
        displayName: 'Test User',
        photoURL: null,
      });
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it('should handle sign in error', async () => {
    const { signInWithEmailAndPassword } = await import('firebase/auth');

    // Mock signInWithEmailAndPassword to reject
    vi.mocked(signInWithEmailAndPassword).mockRejectedValue(new Error('Invalid credentials'));

    const { result } = renderHook(() => useFirebaseAuth());

    // Wait for initial loading to complete
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Test sign in error
    await expect(result.current.login('test@example.com', 'wrongpassword')).rejects.toThrow('Invalid credentials');

    expect(result.current.error).toBe('Invalid credentials');
    expect(result.current.user).toBe(null);
  });

  it('should handle logout', async () => {
    const mockUser: User = {
      uid: 'test-uid',
      email: 'test@example.com',
      displayName: 'Test User',
      photoURL: null,
    } as User;

    const { onAuthStateChanged, signOut } = await import('firebase/auth');

    // Mock onAuthStateChanged to call callback with user initially
    const mockUnsubscribe = vi.fn();
    vi.mocked(onAuthStateChanged).mockImplementation((auth, callback) => {
      callback(mockUser);
      return mockUnsubscribe;
    });

    // Mock signOut to resolve
    vi.mocked(signOut).mockResolvedValue();

    const { result } = renderHook(() => useFirebaseAuth());

    // Wait for user to be set
    await waitFor(() => {
      expect(result.current.user).toBeTruthy();
    });

    // Test logout
    await result.current.logout();

    // Mock auth state change to null after logout
    vi.mocked(onAuthStateChanged).mockImplementation((auth, callback) => {
      callback(null);
      return mockUnsubscribe;
    });

    // Re-render to trigger new auth state
    const { result: newResult } = renderHook(() => useFirebaseAuth());

    await waitFor(() => {
      expect(newResult.current.user).toBe(null);
    });
  });
});
