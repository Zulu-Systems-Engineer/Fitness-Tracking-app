import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import { WorkoutTimer } from './WorkoutTimer';
import * as voiceNotes from '../../lib/voiceNotes';

// Mock voiceNotes
vi.mock('../../lib/voiceNotes', () => ({
  voiceNotes: {
    speak: vi.fn(),
    announceSetComplete: vi.fn(),
    announceExerciseStart: vi.fn(),
    announceRestTime: vi.fn(),
    announceHalfway: vi.fn(),
    announceEncouragement: vi.fn(),
    announceTimeRemaining: vi.fn(),
    announceWorkoutStart: vi.fn(),
    announceWorkoutComplete: vi.fn(),
    isVoiceEnabled: vi.fn(() => true),
    setEnabled: vi.fn(),
  }
}));

describe('WorkoutTimer - Timer Duration Tests', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should render timer with correct initial time for 30 minute workout', () => {
    const onComplete = vi.fn();
    render(
      <WorkoutTimer
        totalDuration={30}
        isActive={false}
        onComplete={onComplete}
      />
    );

    expect(screen.getByText('30:00')).toBeInTheDocument();
  });

  it('should countdown timer properly for 5 minute workout', async () => {
    const onComplete = vi.fn();
    const onTimeUpdate = vi.fn();

    const { rerender } = render(
      <WorkoutTimer
        totalDuration={5}
        isActive={false}
        onComplete={onComplete}
        onTimeUpdate={onTimeUpdate}
      />
    );

    // Start the timer
    const startButton = screen.getByRole('button', { name: /Start Workout/i });
    act(() => {
      startButton.click();
    });

    rerender(
      <WorkoutTimer
        totalDuration={5}
        isActive={true}
        onComplete={onComplete}
        onTimeUpdate={onTimeUpdate}
      />
    );

    // After 30 seconds
    act(() => {
      vi.advanceTimersByTime(30000);
    });

    rerender(
      <WorkoutTimer
        totalDuration={5}
        isActive={true}
        onComplete={onComplete}
        onTimeUpdate={onTimeUpdate}
      />
    );

    expect(screen.getByText('04:30')).toBeInTheDocument();

    // After 2 minutes 30 seconds
    act(() => {
      vi.advanceTimersByTime(120000);
    });

    rerender(
      <WorkoutTimer
        totalDuration={5}
        isActive={true}
        onComplete={onComplete}
        onTimeUpdate={onTimeUpdate}
      />
    );

    expect(screen.getByText('02:00')).toBeInTheDocument();
  });

  it('should countdown timer properly for 10 minute workout without cutting off', async () => {
    const onComplete = vi.fn();
    const onTimeUpdate = vi.fn();

    const { rerender } = render(
      <WorkoutTimer
        totalDuration={10}
        isActive={false}
        onComplete={onComplete}
        onTimeUpdate={onTimeUpdate}
      />
    );

    // Start the timer
    const startButton = screen.getByRole('button', { name: /Start Workout/i });
    act(() => {
      startButton.click();
    });

    rerender(
      <WorkoutTimer
        totalDuration={10}
        isActive={true}
        onComplete={onComplete}
        onTimeUpdate={onTimeUpdate}
      />
    );

    // Advance 5 minutes
    act(() => {
      vi.advanceTimersByTime(300000);
    });

    rerender(
      <WorkoutTimer
        totalDuration={10}
        isActive={true}
        onComplete={onComplete}
        onTimeUpdate={onTimeUpdate}
      />
    );

    expect(screen.getByText('05:00')).toBeInTheDocument();

    // Advance another 4 minutes
    act(() => {
      vi.advanceTimersByTime(240000);
    });

    rerender(
      <WorkoutTimer
        totalDuration={10}
        isActive={true}
        onComplete={onComplete}
        onTimeUpdate={onTimeUpdate}
      />
    );

    expect(screen.getByText('01:00')).toBeInTheDocument();

    // Advance final minute
    act(() => {
      vi.advanceTimersByTime(60000);
    });

    rerender(
      <WorkoutTimer
        totalDuration={10}
        isActive={true}
        onComplete={onComplete}
        onTimeUpdate={onTimeUpdate}
      />
    );

    await waitFor(() => {
      expect(onComplete).toHaveBeenCalled();
      expect(screen.getByText('00:00')).toBeInTheDocument();
    });
  });

  it('should countdown timer properly for 15 minute workout', async () => {
    const onComplete = vi.fn();

    const { rerender } = render(
      <WorkoutTimer
        totalDuration={15}
        isActive={false}
        onComplete={onComplete}
      />
    );

    const startButton = screen.getByRole('button', { name: /Start Workout/i });
    act(() => {
      startButton.click();
    });

    rerender(
      <WorkoutTimer
        totalDuration={15}
        isActive={true}
        onComplete={onComplete}
      />
    );

    // Advance 7 minutes
    act(() => {
      vi.advanceTimersByTime(420000);
    });

    rerender(
      <WorkoutTimer
        totalDuration={15}
        isActive={true}
        onComplete={onComplete}
      />
    );

    expect(screen.getByText('08:00')).toBeInTheDocument();

    // Advance to 14:30
    act(() => {
      vi.advanceTimersByTime(330000);
    });

    rerender(
      <WorkoutTimer
        totalDuration={15}
        isActive={true}
        onComplete={onComplete}
      />
    );

    expect(screen.getByText('00:30')).toBeInTheDocument();

    // Advance final 30 seconds
    act(() => {
      vi.advanceTimersByTime(30000);
    });

    rerender(
      <WorkoutTimer
        totalDuration={15}
        isActive={true}
        onComplete={onComplete}
      />
    );

    await waitFor(() => {
      expect(onComplete).toHaveBeenCalled();
    });
  });

  it('should countdown timer properly for 50 minute workout', async () => {
    const onComplete = vi.fn();

    const { rerender } = render(
      <WorkoutTimer
        totalDuration={50}
        isActive={false}
        onComplete={onComplete}
      />
    );

    const startButton = screen.getByRole('button', { name: /Start Workout/i });
    act(() => {
      startButton.click();
    });

    rerender(
      <WorkoutTimer
        totalDuration={50}
        isActive={true}
        onComplete={onComplete}
      />
    );

    // Advance 25 minutes
    act(() => {
      vi.advanceTimersByTime(1500000);
    });

    rerender(
      <WorkoutTimer
        totalDuration={50}
        isActive={true}
        onComplete={onComplete}
      />
    );

    expect(screen.getByText('25:00')).toBeInTheDocument();

    // Advance another 24 minutes
    act(() => {
      vi.advanceTimersByTime(1440000);
    });

    rerender(
      <WorkoutTimer
        totalDuration={50}
        isActive={true}
        onComplete={onComplete}
      />
    );

    expect(screen.getByText('01:00')).toBeInTheDocument();

    // Advance final minute
    act(() => {
      vi.advanceTimersByTime(60000);
    });

    rerender(
      <WorkoutTimer
        totalDuration={50}
        isActive={true}
        onComplete={onComplete}
      />
    );

    await waitFor(() => {
      expect(onComplete).toHaveBeenCalled();
    });
  });

  it('should countdown timer properly for 30 minute workout', async () => {
    const onComplete = vi.fn();

    const { rerender } = render(
      <WorkoutTimer
        totalDuration={30}
        isActive={false}
        onComplete={onComplete}
      />
    );

    const startButton = screen.getByRole('button', { name: /Start Workout/i });
    act(() => {
      startButton.click();
    });

    rerender(
      <WorkoutTimer
        totalDuration={30}
        isActive={true}
        onComplete={onComplete}
      />
    );

    // Advance 15 minutes (halfway)
    act(() => {
      vi.advanceTimersByTime(900000);
    });

    rerender(
      <WorkoutTimer
        totalDuration={30}
        isActive={true}
        onComplete={onComplete}
      />
    );

    expect(screen.getByText('15:00')).toBeInTheDocument();

    // Advance another 14 minutes
    act(() => {
      vi.advanceTimersByTime(840000);
    });

    rerender(
      <WorkoutTimer
        totalDuration={30}
        isActive={true}
        onComplete={onComplete}
      />
    );

    expect(screen.getByText('01:00')).toBeInTheDocument();

    // Advance final minute
    act(() => {
      vi.advanceTimersByTime(60000);
    });

    rerender(
      <WorkoutTimer
        totalDuration={30}
        isActive={true}
        onComplete={onComplete}
      />
    );

    await waitFor(() => {
      expect(onComplete).toHaveBeenCalled();
    });
  });

  it('should call onTimeUpdate with remaining time as timer counts down', async () => {
    const onTimeUpdate = vi.fn();

    const { rerender } = render(
      <WorkoutTimer
        totalDuration={5}
        isActive={false}
        onTimeUpdate={onTimeUpdate}
      />
    );

    const startButton = screen.getByRole('button', { name: /Start Workout/i });
    act(() => {
      startButton.click();
    });

    rerender(
      <WorkoutTimer
        totalDuration={5}
        isActive={true}
        onTimeUpdate={onTimeUpdate}
      />
    );

    // Advance 1 second
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    rerender(
      <WorkoutTimer
        totalDuration={5}
        isActive={true}
        onTimeUpdate={onTimeUpdate}
      />
    );

    // onTimeUpdate should be called with 299 seconds remaining
    expect(onTimeUpdate).toHaveBeenCalledWith(299);
  });

  it('should handle pause and resume correctly', async () => {
    const { rerender } = render(
      <WorkoutTimer
        totalDuration={5}
        isActive={false}
      />
    );

    const startButton = screen.getByRole('button', { name: /Start Workout/i });
    act(() => {
      startButton.click();
    });

    rerender(
      <WorkoutTimer
        totalDuration={5}
        isActive={true}
      />
    );

    // Advance 1 minute
    act(() => {
      vi.advanceTimersByTime(60000);
    });

    rerender(
      <WorkoutTimer
        totalDuration={5}
        isActive={true}
      />
    );

    expect(screen.getByText('04:00')).toBeInTheDocument();

    // Pause
    const pauseButton = screen.getByRole('button', { name: /Pause/i });
    act(() => {
      pauseButton.click();
    });

    rerender(
      <WorkoutTimer
        totalDuration={5}
        isActive={true}
      />
    );

    // Advance 1 more minute (while paused, time should not change)
    act(() => {
      vi.advanceTimersByTime(60000);
    });

    rerender(
      <WorkoutTimer
        totalDuration={5}
        isActive={true}
      />
    );

    expect(screen.getByText('04:00')).toBeInTheDocument();
    expect(screen.getByText('Paused')).toBeInTheDocument();

    // Resume
    const resumeButton = screen.getByRole('button', { name: /Resume/i });
    act(() => {
      resumeButton.click();
    });

    rerender(
      <WorkoutTimer
        totalDuration={5}
        isActive={true}
      />
    );

    // Advance 1 more minute (should continue from 04:00)
    act(() => {
      vi.advanceTimersByTime(60000);
    });

    rerender(
      <WorkoutTimer
        totalDuration={5}
        isActive={true}
      />
    );

    expect(screen.getByText('03:00')).toBeInTheDocument();
  });

  it('should announce halfway point at correct time', async () => {
    const onHalfway = vi.fn();

    const { rerender } = render(
      <WorkoutTimer
        totalDuration={10}
        isActive={false}
        onHalfway={onHalfway}
      />
    );

    const startButton = screen.getByRole('button', { name: /Start Workout/i });
    act(() => {
      startButton.click();
    });

    rerender(
      <WorkoutTimer
        totalDuration={10}
        isActive={true}
        onHalfway={onHalfway}
      />
    );

    // Advance past 5 minutes (halfway)
    act(() => {
      vi.advanceTimersByTime(300000);
    });

    rerender(
      <WorkoutTimer
        totalDuration={10}
        isActive={true}
        onHalfway={onHalfway}
      />
    );

    await waitFor(() => {
      expect(onHalfway).toHaveBeenCalled();
    });
  });
});