# Fitness Tracker App

A comprehensive fitness tracking application built with modern web technologies, featuring workout planning, progress tracking, goal setting, and detailed analytics.

## 🚀 Features

### Phase 1: Authentication
- **Glassmorphism Login/Signup** - Beautiful, modern UI with translucent effects
- **Responsive Design** - Works seamlessly on desktop and mobile devices
- **Theme System** - Consistent color scheme with light/dark mode support

### Phase 2: Workout Plans
- **Create & Manage Plans** - Design custom workout routines
- **Exercise Management** - Add exercises with sets, reps, weight, and rest time
- **Difficulty & Category Filtering** - Organize plans by difficulty and type
- **Search Functionality** - Find plans quickly

### Phase 3: Workout Tracking
- **Real-time Tracking** - Log sets, reps, and weights during workouts
- **Start from Plans** - Begin workouts directly from existing plans
- **Progress Monitoring** - Track workout duration and completion
- **Workout History** - View past workout sessions

### Phase 4: Goals & Progress
- **Goal Setting** - Set and track various fitness goals
- **Progress Tracking** - Visual progress bars and statistics
- **Goal Types** - Weight loss, strength, endurance, and custom goals
- **Achievement System** - Mark goals as completed

### Phase 5: Personal Records
- **PR Tracking** - Automatically detect and track personal records
- **Record Types** - Max weight, max reps, max volume, best time
- **Improvement Metrics** - Track progress over time
- **Record History** - View all personal achievements

### Phase 6: Analytics
- **Workout Statistics** - Comprehensive workout metrics
- **Volume Progression** - Track training volume over time
- **Frequency Analysis** - Monitor workout consistency
- **Exercise Analytics** - Detailed exercise performance data

### Phase 7: Polish & Quality
- **Error Handling** - Comprehensive error boundaries and user feedback
- **Loading States** - Smooth loading indicators throughout the app
- **Form Validation** - Real-time validation with helpful error messages
- **Toast Notifications** - User-friendly success/error notifications
- **E2E Testing** - Complete test coverage with Playwright

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern React with hooks and concurrent features
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing

### Backend
- **Node.js** - JavaScript runtime
- **Express** - Web framework
- **Zod** - Schema validation
- **TypeScript** - Type-safe backend development

### Testing
- **Playwright** - End-to-end testing
- **React Testing Library** - Component testing
- **Jest** - Unit testing framework

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Husky** - Git hooks
- **pnpm** - Fast package manager

## 📁 Project Structure

```
fitness-tracker-v2/
├── apps/
│   └── web/                    # Frontend React app
│       ├── src/
│       │   ├── components/     # Reusable UI components
│       │   ├── pages/          # Page components
│       │   ├── hooks/          # Custom React hooks
│       │   └── lib/            # Utilities and theme
│       └── public/             # Static assets
├── functions/                  # Backend API
│   └── src/
│       └── *.router.ts         # API route handlers
├── packages/
│   └── shared/                 # Shared types and schemas
│       └── src/
│           └── schemas/        # Zod validation schemas
├── e2e/                        # End-to-end tests
│   ├── tests/                  # Test files
│   └── playwright.config.ts    # Playwright configuration
└── color-scheme.json           # Centralized color configuration
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- pnpm 8+

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd fitness-tracker-v2
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Start development servers**
   ```bash
   # Start frontend (runs on http://localhost:5173)
   pnpm --filter web dev
   
   # Start backend (runs on http://localhost:3000)
   pnpm --filter functions dev
   ```

### Running Tests

```bash
# Run E2E tests
cd e2e
pnpm install
pnpm test

# Run E2E tests with UI
pnpm test:ui

# Run E2E tests in headed mode
pnpm test:headed
```

## 🎨 Design System

### Color Scheme
The app uses a centralized color scheme defined in `color-scheme.json`:

- **Primary Colors** - Blue palette (#3b82f6)
- **Secondary Colors** - Cyan palette (#0ea5e9)
- **Semantic Colors** - Success, warning, error, info
- **Neutral Colors** - Grayscale palette
- **Usage-Specific Colors** - Custom colors for different sections

### Theme System
- **Light/Dark Mode** - Automatic theme switching
- **CSS Variables** - Dynamic color injection
- **Consistent Styling** - Unified design across all components

### Glassmorphism Design
- **Translucent Containers** - Frosted glass effects
- **Backdrop Blur** - Modern blur effects
- **Gradient Backgrounds** - Beautiful color transitions
- **Consistent Spacing** - Harmonious layout system

## 📱 Responsive Design

The app is fully responsive with breakpoints:
- **Mobile** - 320px - 768px
- **Tablet** - 768px - 1024px
- **Desktop** - 1024px+

### Mobile-First Approach
- Touch-friendly interfaces
- Optimized form layouts
- Collapsible navigation
- Swipe gestures support

## 🧪 Testing Strategy

### E2E Tests (Playwright)
- **Authentication Flow** - Login/signup functionality
- **Navigation** - Page routing and responsiveness
- **Feature Testing** - Core functionality validation
- **Cross-Browser** - Chrome, Firefox, Safari, Mobile

### Component Testing
- **Unit Tests** - Individual component testing
- **Integration Tests** - Component interaction testing
- **Accessibility Tests** - WCAG compliance validation

## 🚀 Deployment

### Frontend (Vercel/Netlify)
```bash
cd apps/web
pnpm build
# Deploy dist/ folder
```

### Backend (Railway/Heroku)
```bash
cd functions
pnpm build
# Deploy with Node.js runtime
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Design Inspiration** - Modern glassmorphism design trends
- **Color Palette** - Tailwind CSS color system
- **Icons** - Heroicons and Lucide React
- **Testing** - Playwright testing framework
- **Community** - Open source contributors and feedback

---

Built with ❤️ using React, TypeScript, and modern web technologies.


