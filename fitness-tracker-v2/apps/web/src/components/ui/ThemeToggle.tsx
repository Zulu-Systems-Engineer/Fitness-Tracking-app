import React from 'react';
import { useTheme } from './ThemeProvider';
import { Moon, Sun } from 'lucide-react';

export const ThemeToggle: React.FC = () => {
  const { mode, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg bg-bg-secondary hover:bg-bg-tertiary transition-colors"
      aria-label="Toggle theme"
    >
      {mode === 'light' ? (
        <Moon className="w-5 h-5 text-text-primary" />
      ) : (
        <Sun className="w-5 h-5 text-text-primary" />
      )}
    </button>
  );
};
