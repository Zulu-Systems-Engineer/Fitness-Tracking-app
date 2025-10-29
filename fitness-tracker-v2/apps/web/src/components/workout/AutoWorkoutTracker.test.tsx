import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AutoWorkoutTracker } from './AutoWorkoutTracker';

// Mock voiceNotes to prevent actual audio announcements during tests
vi.mock('../../lib/voiceNotes', () => ({
  voiceNotes: {
    speak: vi.fn(),
    announceWorkoutStart: vi.fn(),
    announceSetComplete: vi.fn(),
    announceExerciseStart: vi.fn(),
    announceRestTime: vi.fn(),
    announceHalfway: vi.fn(),
    announceWorkoutComplete: vi.fn(),
    announceEncouragement: vi.fn(),
    announceTimeRemaining: vi.fn(),
    setEnabled: vi.fn(),
    isVoiceEnabled: vi.fn(() => true),
  },
}));

// Mock WorkoutTimer to simplify testing
vi.mock('./WorkoutTimer', () => ({
  WorkoutTimer: ({ totalDuration, isActive, onStart }: any) => (
    <div data-testid="workout-timer">
      <div>{totalDuration} min timer</div>
      {!isActive && <button onClick={onStart}>Start Workout</button>}
    </div>
  ),
}));

const mockPlan = {
  id: '1',
  name: 'Test Workout',
  description: 'Test workout plan',
  exercises: [
    {
      id: 'ex1',
      name: 'Push-ups',
      sets: 3,
      reps: 10,
      weight: 0,
      restTime: 60,
    },
    {
      id: 'ex2',
      name: 'Squats',
      sets: 3,
      reps: 15,
      weight: 0,
      restTime: 60,
    },
  ],
  duration: 30,
  difficulty: 'intermediate',
  restBreakDuration: 10, // 10 minute rest break
  restBreakFrequency: 5, // Every 5 minutes
};

describe('AutoWorkoutTracker - Rest Break Timer Fix', () => {
  const mockOnWorkoutComplete = vi.fn();
  const mockOnWorkoutProgress = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Rest Break Duration Display', () => {
    it('formats rest break countdown as MM:SS instead of raw seconds', async () => {
      render(
        <AutoWorkoutTracker
          plan={mockPlan}
          onWorkoutComplete={mockOnWorkoutComplete}
          onWorkoutProgress={mockOnWorkoutProgress}
        />
      );

      // Start the workout
      const startButton = screen.getByRole('button', { name: /start workout/i });
      act(() => {
        fireEvent.click(startButton);
      });

      // Simulate 5 minutes of exercise to trigger rest break
      act(() => {
        vi.advanceTimersByTime(5 * 60 * 1000);
      });

      // Wait for rest break to appear
      await waitFor(() => {
        expect(screen.getByText(/rest break/i)).toBeInTheDocument();
      });

      // Check that time is displayed as MM:SS format (10:00 for 10 minutes)
      const timerDisplay = screen.getByText(/10:00/);
      expect(timerDisplay).toBeInTheDocument();
    });

    it('respects configured rest break duration (not cut off at 1 minute)', async () => {
      render(
        <AutoWorkoutTracker
          plan={mockPlan}
          onWorkoutComplete={mockOnWorkoutComplete}
          onWorkoutProgress={mockOnWorkoutProgress}
        />
      );

      // Start the workout
      const startButton = screen.getByRole('button', { name: /start workout/i });
      act(() => {
        fireEvent.click(startButton);
      });

      // Simulate 5 minutes of exercise to trigger rest break
      act(() => {
        vi.advanceTimersByTime(5 * 60 * 1000);
      });

      await waitFor(() => {
        expect(screen.getByText(/rest break/i)).toBeInTheDocument();
      });

      // Verify it starts at 10:00 (10 minutes configured)
      expect(screen.getByText(/10:00/)).toBeInTheDocument();

      // Advance 1 minute and verify it's still in rest break at 09:00
      act(() => {
        vi.advanceTimersByTime(60 * 1000);
      });

      await waitFor(() => {
        expect(screen.getByText(/09:00/)).toBeInTheDocument();
      });
    });
  });

  describe('Rest Break Countdown Progress', () => {
    it('displays progress bar during rest break', async () => {
      render(
        <AutoWorkoutTracker
          plan={mockPlan}
          onWorkoutComplete={mockOnWorkoutComplete}
          onWorkoutProgress={mockOnWorkoutProgress}
        />
      );

      // Start the workout
      const startButton = screen.getByRole('button', { name: /start workout/i });
      act(() => {
        fireEvent.click(startButton);
      });

      // Simulate 5 minutes of exercise to trigger rest break
      act(() => {
        vi.advanceTimersByTime(5 * 60 * 1000);
      });

      await waitFor(() => {
        expect(screen.getByText(/rest break/i)).toBeInTheDocument();
      });

      // Check for progress display
      expect(screen.getByText(/complete/i)).toBeInTheDocument();
    });

    it('updates countdown every second', async () => {
      render(
        <AutoWorkoutTracker
          plan={mockPlan}
          onWorkoutComplete={mockOnWorkoutComplete}
          onWorkoutProgress={mockOnWorkoutProgress}
        />
      );

      // Start the workout
      const startButton = screen.getByRole('button', { name: /start workout/i });
      act(() => {
        fireEvent.click(startButton);
      });

      // Simulate 5 minutes of exercise to trigger rest break
      act(() => {
        vi.advanceTimersByTime(5 * 60 * 1000);
      });

      await waitFor(() => {
        expect(screen.getByText(/10:00/)).toBeInTheDocument();
      });

      // Advance 5 seconds and check countdown updated
      act(() => {
        vi.advanceTimersByTime(5 * 1000);
      });

      await waitFor(() => {
        expect(screen.getByText(/09:55/)).toBeInTheDocument();
      });
    });
  });

  describe('Rest Break Duration Variations', () => {
    it('handles 15 minute rest break duration', async () => {
      const fifteenMinutePlan = {
        ...mockPlan,
        restBreakDuration: 15,
      };

      render(
        <AutoWorkoutTracker
          plan={fifteenMinutePlan}
          onWorkoutComplete={mockOnWorkoutComplete}
          onWorkoutProgress={mockOnWorkoutProgress}
        />
      );

      // Start the workout
      const startButton = screen.getByRole('button', { name: /start workout/i });
      act(() => {
        fireEvent.click(startButton);
      });

      // Simulate 5 minutes of exercise
      act(() => {
        vi.advanceTimersByTime(5 * 60 * 1000);
      });

      await waitFor(() => {
        expect(screen.getByText(/rest break/i)).toBeInTheDocument();
      });

      // Should display 15:00 for 15 minute rest break
      expect(screen.getByText(/15:00/)).toBeInTheDocument();
    });

    it('handles 30 minute rest break duration', async () => {
      const thirtyMinutePlan = {
        ...mockPlan,
        restBreakDuration: 30,
      };

      render(
        <AutoWorkoutTracker
          plan={thirtyMinutePlan}
          onWorkoutComplete={mockOnWorkoutComplete}
          onWorkoutProgress={mockOnWorkoutProgress}
        />
      );

      // Start the workout
      const startButton = screen.getByRole('button', { name: /start workout/i });
      act(() => {
        fireEvent.click(startButton);
      });

      // Simulate 5 minutes of exercise
      act(() => {
        vi.advanceTimersByTime(5 * 60 * 1000);
      });

      await waitFor(() => {
        expect(screen.getByText(/rest break/i)).toBeInTheDocument();
      });

      // Should display 30:00 for 30 minute rest break
      expect(screen.getByText(/30:00/)).toBeInTheDocument();
    });

    it('handles 50 minute rest break duration', async () => {
      const fiftyMinutePlan = {
        ...mockPlan,
        restBreakDuration: 50,
      };

      render(
        <AutoWorkoutTracker
          plan={fiftyMinutePlan}
          onWorkoutComplete={mockOnWorkoutComplete}
          onWorkoutProgress={mockOnWorkoutProgress}
        />
      );

      // Start the workout
      const startButton = screen.getByRole('button', { name: /start workout/i });
      act(() => {
        fireEvent.click(startButton);
      });

      // Simulate 5 minutes of exercise
      act(() => {
        vi.advanceTimersByTime(5 * 60 * 1000);
      });

      await waitFor(() => {
        expect(screen.getByText(/rest break/i)).toBeInTheDocument();
      });

      // Should display 50:00 for 50 minute rest break
      expect(screen.getByText(/50:00/)).toBeInTheDocument();
    });
  });

  describe('Rest Break Completes and Resumes Exercise', () => {
    it('transitions out of rest break after countdown completes', async () => {
      const oneMinutePlan = {
        ...mockPlan,
        restBreakDuration: 1, // 1 minute for faster testing
        restBreakFrequency: 1, // Every 1 minute
      };

      render(
        <AutoWorkoutTracker
          plan={oneMinutePlan}
          onWorkoutComplete={mockOnWorkoutComplete}
          onWorkoutProgress={mockOnWorkoutProgress}
        />
      );

      // Start the workout
      const startButton = screen.getByRole('button', { name: /start workout/i });
      act(() => {
        fireEvent.click(startButton);
      });

      // Simulate 1 minute of exercise to trigger rest break
      act(() => {
        vi.advanceTimersByTime(1 * 60 * 1000);
      });

      await waitFor(() => {
        expect(screen.getByText(/rest break/i)).toBeInTheDocument();
      });

      // Advance 1 minute (rest break duration) and verify it ends
      act(() => {
        vi.advanceTimersByTime(1 * 60 * 1000 + 1000); // Add 1 second to ensure it completes
      });

      // Rest break should be gone, back to exercise display
      await waitFor(() => {
        expect(screen.queryByText(/rest break/i)).not.toBeInTheDocument();
      });
    });

    it('displays correct exercise info after rest break completes', async () => {
      const oneMinutePlan = {
        ...mockPlan,
        restBreakDuration: 1,
        restBreakFrequency: 1,
      };

      render(
        <AutoWorkoutTracker
          plan={oneMinutePlan}
          onWorkoutComplete={mockOnWorkoutComplete}
          onWorkoutProgress={mockOnWorkoutProgress}
        />
      );

      // Start the workout
      const startButton = screen.getByRole('button', { name: /start workout/i });
      act(() => {
        fireEvent.click(startButton);
      });

      // Trigger rest break
      act(() => {
        vi.advanceTimersByTime(1 * 60 * 1000);
      });

      await waitFor(() => {
        expect(screen.getByText(/rest break/i)).toBeInTheDocument();
      });

      // Wait for rest break to complete
      act(() => {
        vi.advanceTimersByTime(1 * 60 * 1000 + 1000);
      });

      // Should return to exercise display
      await waitFor(() => {
        expect(screen.getByText(/current exercise/i)).toBeInTheDocument();
      });
    });
  });

  describe('Format Time Helper', () => {
    it('formats seconds to MM:SS correctly', async () => {
      // This test verifies the formatting is working by checking display
      const plan = {
        ...mockPlan,
        restBreakDuration: 5,
        restBreakFrequency: 1,
      };

      render(
        <AutoWorkoutTracker
          plan={plan}
          onWorkoutComplete={mockOnWorkoutComplete}
          onWorkoutProgress={mockOnWorkoutProgress}
        />
      );

      const startButton = screen.getByRole('button', { name: /start workout/i });
      act(() => {
        fireEvent.click(startButton);
      });

      // Trigger rest break
      act(() => {
        vi.advanceTimersByTime(1 * 60 * 1000);
      });

      await waitFor(() => {
        expect(screen.getByText(/05:00/)).toBeInTheDocument();
      });

      // Verify it counts down
      act(() => {
        vi.advanceTimersByTime(45 * 1000);
      });

      await waitFor(() => {
        expect(screen.getByText(/04:15/)).toBeInTheDocument();
      });
    });
  });
});