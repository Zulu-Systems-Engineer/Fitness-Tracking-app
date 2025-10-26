import React, { useState, useEffect, useRef } from 'react';
import { voiceNotes } from '../../lib/voiceNotes';

interface WorkoutTimerProps {
  totalDuration: number; // in minutes
  onHalfway?: () => void;
  onComplete?: () => void;
  onTimeUpdate?: (remaining: number) => void;
  isActive: boolean;
  onStart?: () => void;
  onPause?: () => void;
  onResume?: () => void;
}

export function WorkoutTimer({
  totalDuration,
  onHalfway,
  onComplete,
  onTimeUpdate,
  isActive,
  onStart,
  onPause,
  onResume
}: WorkoutTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState(totalDuration * 60); // Convert to seconds
  const [isPaused, setIsPaused] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [hasAnnouncedHalfway, setHasAnnouncedHalfway] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Convert seconds to MM:SS format
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate progress percentage
  const progress = ((totalDuration * 60 - timeRemaining) / (totalDuration * 60)) * 100;

  useEffect(() => {
    if (isActive && !isPaused && hasStarted) {
      intervalRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          const newTime = prev - 1;
          
          // Announce halfway point
          if (!hasAnnouncedHalfway && newTime <= (totalDuration * 60) / 2) {
            setHasAnnouncedHalfway(true);
            voiceNotes.announceHalfway();
            onHalfway?.();
          }

          // Announce time remaining every 5 minutes
          const minutesRemaining = Math.floor(newTime / 60);
          if (minutesRemaining > 0 && minutesRemaining % 5 === 0 && newTime % 60 === 0) {
            voiceNotes.announceTimeRemaining(minutesRemaining);
          }

          // Workout complete
          if (newTime <= 0) {
            voiceNotes.announceWorkoutComplete('Workout', totalDuration);
            onComplete?.();
            return 0;
          }

          onTimeUpdate?.(newTime);
          return newTime;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, isPaused, hasStarted, totalDuration, onHalfway, onComplete, onTimeUpdate, hasAnnouncedHalfway]);

  const handleStart = () => {
    setHasStarted(true);
    setIsPaused(false);
    voiceNotes.announceWorkoutStart('Your Workout');
    onStart?.();
  };

  const handlePause = () => {
    setIsPaused(true);
    voiceNotes.speak('Workout paused.', 'normal');
    onPause?.();
  };

  const handleResume = () => {
    setIsPaused(false);
    voiceNotes.speak('Workout resumed. Let\'s continue!', 'normal');
    onResume?.();
  };

  const handleStop = () => {
    setHasStarted(false);
    setIsPaused(false);
    setTimeRemaining(totalDuration * 60);
    setHasAnnouncedHalfway(false);
    voiceNotes.speak('Workout stopped.', 'normal');
  };

  return (
    <div className="glassmorphism p-6 rounded-2xl">
      <div className="text-center">
        <h3 className="text-2xl font-bold mb-4" style={{ color: 'var(--glassmorphism-text)' }}>
          Workout Timer
        </h3>
        
        {/* Timer Display */}
        <div className="mb-6">
          <div className="text-6xl font-mono font-bold mb-2" style={{ color: 'var(--glassmorphism-text)' }}>
            {formatTime(timeRemaining)}
          </div>
          <div className="text-sm" style={{ color: 'var(--glassmorphism-text-muted)' }}>
            {isPaused ? 'Paused' : hasStarted ? 'In Progress' : 'Ready to Start'}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="w-full bg-gray-700 rounded-full h-3 mb-2">
            <div 
              className="bg-gradient-to-r from-primary-500 to-secondary-500 h-3 rounded-full transition-all duration-1000"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="text-sm" style={{ color: 'var(--glassmorphism-text-muted)' }}>
            {Math.round(progress)}% Complete
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex justify-center gap-4">
          {!hasStarted ? (
            <button
              onClick={handleStart}
              className="bg-green-600 text-white px-8 py-3 rounded-xl hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-300 font-semibold"
            >
              Start Workout
            </button>
          ) : (
            <>
              {isPaused ? (
                <button
                  onClick={handleResume}
                  className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 font-semibold"
                >
                  Resume
                </button>
              ) : (
                <button
                  onClick={handlePause}
                  className="bg-yellow-600 text-white px-6 py-3 rounded-xl hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-all duration-300 font-semibold"
                >
                  Pause
                </button>
              )}
              <button
                onClick={handleStop}
                className="bg-red-600 text-white px-6 py-3 rounded-xl hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all duration-300 font-semibold"
              >
                Stop
              </button>
            </>
          )}
        </div>

        {/* Voice Controls */}
        <div className="mt-4 pt-4 border-t border-gray-600">
          <div className="flex items-center justify-center gap-4">
            <span className="text-sm" style={{ color: 'var(--glassmorphism-text-muted)' }}>
              Voice Notes:
            </span>
            <button
              onClick={() => voiceNotes.setEnabled(!voiceNotes.isVoiceEnabled())}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                voiceNotes.isVoiceEnabled()
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-gray-600 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {voiceNotes.isVoiceEnabled() ? 'Enabled' : 'Disabled'}
            </button>
            <button
              onClick={() => voiceNotes.announceEncouragement()}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 transition-all duration-300"
            >
              Encouragement
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
