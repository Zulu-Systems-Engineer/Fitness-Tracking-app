import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AnalyticsPage } from './AnalyticsPage'

// Mock the auth context
vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'test-user', email: 'test@example.com' },
    loading: false
  })
}))

// Mock the navigate function
vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn()
}))

// Mock the theme
vi.mock('../lib/theme', () => ({
  usage: {
    analytics: {
      chartPrimary: '#007bff',
      chartSecondary: '#28a745',
      chartTertiary: '#ffc107',
      gridLines: '#e9ecef',
      axisText: '#6c757d'
    }
  },
  colors: {
    primary: { 500: '#007bff' },
    secondary: { 500: '#6c757d' }
  }
}))

// Mock the firebase services
vi.mock('../lib/firebaseServices', () => ({
  workoutService: {
    getAll: vi.fn().mockResolvedValue([])
  },
  goalService: {
    getAll: vi.fn().mockResolvedValue([])
  },
  recordService: {
    getAll: vi.fn().mockResolvedValue([])
  }
}))

// Mock recharts
vi.mock('recharts', () => ({
  LineChart: () => null,
  Line: () => null,
  AreaChart: () => null,
  Area: () => null,
  BarChart: () => null,
  Bar: () => null,
  PieChart: () => null,
  Pie: () => null,
  Cell: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
  Legend: () => null,
  ResponsiveContainer: ({ children }: any) => children
}))

describe('AnalyticsPage', () => {
  it('renders analytics heading', () => {
    render(<AnalyticsPage />)
    expect(screen.getByText(/analytics dashboard/i)).toBeInTheDocument()
  })

  it('shows loading state initially', () => {
    render(<AnalyticsPage />)
    expect(screen.getByText(/loading analytics/i)).toBeInTheDocument()
  })
})
