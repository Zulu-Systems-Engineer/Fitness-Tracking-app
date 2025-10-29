import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import PlansPage from '../pages/PlansPage';
import { AuthProvider } from '../contexts/AuthContext';
import { ToastProvider } from '../components/ui/Toast';

// Mock the useAuth hook
const mockUser = {
  id: 'user-123',
  email: 'test@example.com',
  name: 'Test User',
  profilePicture: null,
};

vi.mock('../contexts/AuthContext', async () => {
  const actual = await vi.importActual('../contexts/AuthContext');
  return {
    ...actual,
    useAuth: () => ({
      user: mockUser,
      loading: false,
    }),
  };
});

// Mock Firebase services
vi.mock('../lib/firebaseServices', () => ({
  workoutPlanService: {
    getAll: vi.fn().mockResolvedValue([]),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

// Mock voice notes
vi.mock('../lib/voiceNotes', () => ({
  speak: vi.fn(),
}));

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          {component}
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('PlansPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders plans page correctly', async () => {
    renderWithRouter(<PlansPage />);
    
    expect(screen.getByText('Workout Plans')).toBeInTheDocument();
    expect(screen.getByText('Create and manage your workout routines')).toBeInTheDocument();
    expect(screen.getByText('Create New Plan')).toBeInTheDocument();
  });

  it('opens create plan form when button is clicked', async () => {
    renderWithRouter(<PlansPage />);
    
    const createButton = screen.getByText('Create New Plan');
    fireEvent.click(createButton);
    
    await waitFor(() => {
      expect(screen.getByText('Create Workout Plan')).toBeInTheDocument();
    });
  });

  it('displays empty state when no plans exist', async () => {
    renderWithRouter(<PlansPage />);
    
    await waitFor(() => {
      expect(screen.getByText(/no workout plans found/i)).toBeInTheDocument();
    });
  });

  it('filters plans by difficulty', async () => {
    const mockPlans = [
      {
        id: '1',
        name: 'Beginner Plan',
        difficulty: 'beginner',
        duration: 30,
        exercises: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '2',
        name: 'Advanced Plan',
        difficulty: 'advanced',
        duration: 60,
        exercises: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    const { workoutPlanService } = await import('../lib/firebaseServices');
    workoutPlanService.getAll.mockResolvedValue(mockPlans);

    renderWithRouter(<PlansPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Beginner Plan')).toBeInTheDocument();
      expect(screen.getByText('Advanced Plan')).toBeInTheDocument();
    });

    const difficultyFilter = screen.getByDisplayValue('');
    fireEvent.change(difficultyFilter, { target: { value: 'beginner' } });
    
    await waitFor(() => {
      expect(screen.getByText('Beginner Plan')).toBeInTheDocument();
      expect(screen.queryByText('Advanced Plan')).not.toBeInTheDocument();
    });
  });

  it('searches plans by name', async () => {
    const mockPlans = [
      {
        id: '1',
        name: 'Push Day',
        difficulty: 'intermediate',
        duration: 45,
        exercises: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '2',
        name: 'Pull Day',
        difficulty: 'intermediate',
        duration: 45,
        exercises: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    const { workoutPlanService } = await import('../lib/firebaseServices');
    workoutPlanService.getAll.mockResolvedValue(mockPlans);

    renderWithRouter(<PlansPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Push Day')).toBeInTheDocument();
      expect(screen.getByText('Pull Day')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Search plans...');
    fireEvent.change(searchInput, { target: { value: 'Push' } });
    
    await waitFor(() => {
      expect(screen.getByText('Push Day')).toBeInTheDocument();
      expect(screen.queryByText('Pull Day')).not.toBeInTheDocument();
    });
  });

  it('has proper accessibility attributes', () => {
    renderWithRouter(<PlansPage />);
    
    const createButton = screen.getByText('Create New Plan');
    const searchInput = screen.getByPlaceholderText('Search plans...');
    
    expect(createButton).toBeInTheDocument();
    expect(searchInput).toHaveAttribute('type', 'text');
  });
});
