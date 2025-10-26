import { Router } from 'express';
import { z } from 'zod';
import {
  WorkoutSchema,
  CreateWorkoutSchema,
  UpdateWorkoutSchema,
  StartWorkoutFromPlanSchema,
  LogSetSchema,
  CompleteWorkoutSchema,
  WorkoutFiltersSchema,
  type Workout,
  type CreateWorkout,
  type UpdateWorkout,
  type StartWorkoutFromPlan,
  type LogSet,
  type CompleteWorkout,
  type WorkoutFilters,
} from '../../packages/shared/src/schemas';

const router = Router();

// In-memory storage for demo purposes
// In production, this would be replaced with a database
const workouts: Workout[] = [];

// GET /api/workouts - Get all workouts with optional filtering
router.get('/', (req, res) => {
  try {
    const filters = WorkoutFiltersSchema.parse(req.query);
    let filteredWorkouts = [...workouts];

    // Apply filters
    if (filters.status) {
      filteredWorkouts = filteredWorkouts.filter(workout => workout.status === filters.status);
    }
    if (filters.planId) {
      filteredWorkouts = filteredWorkouts.filter(workout => workout.planId === filters.planId);
    }
    if (filters.userId) {
      filteredWorkouts = filteredWorkouts.filter(workout => workout.userId === filters.userId);
    }
    if (filters.dateFrom) {
      filteredWorkouts = filteredWorkouts.filter(workout => workout.startedAt >= filters.dateFrom!);
    }
    if (filters.dateTo) {
      filteredWorkouts = filteredWorkouts.filter(workout => workout.startedAt <= filters.dateTo!);
    }

    res.json({
      success: true,
      data: filteredWorkouts,
      count: filteredWorkouts.length,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Invalid query parameters',
        details: error.errors,
      });
    }
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

// GET /api/workouts/:id - Get a specific workout
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const workout = workouts.find(w => w.id === id);

    if (!workout) {
      return res.status(404).json({
        success: false,
        error: 'Workout not found',
      });
    }

    res.json({
      success: true,
      data: workout,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

// POST /api/workouts - Create a new workout
router.post('/', (req, res) => {
  try {
    const workoutData = CreateWorkoutSchema.parse(req.body);
    
    const newWorkout: Workout = {
      ...workoutData,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    workouts.push(newWorkout);

    res.status(201).json({
      success: true,
      data: newWorkout,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Invalid workout data',
        details: error.errors,
      });
    }
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

// POST /api/workouts/start-from-plan - Start a workout from a plan
router.post('/start-from-plan', (req, res) => {
  try {
    const { planId, name } = StartWorkoutFromPlanSchema.parse(req.body);
    
    // In a real app, you would fetch the plan from the database
    // For demo purposes, we'll create a mock plan
    const mockPlan = {
      id: planId,
      name: name || 'Workout from Plan',
      exercises: [
        {
          id: crypto.randomUUID(),
          exerciseId: crypto.randomUUID(),
          exerciseName: 'Push-ups',
          sets: [],
          notes: '',
        },
      ],
    };

    const newWorkout: Workout = {
      id: crypto.randomUUID(),
      userId: req.body.userId || crypto.randomUUID(), // In real app, get from auth
      planId: planId,
      planName: mockPlan.name,
      name: mockPlan.name,
      exercises: mockPlan.exercises,
      status: 'in_progress',
      startedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    workouts.push(newWorkout);

    res.status(201).json({
      success: true,
      data: newWorkout,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request data',
        details: error.errors,
      });
    }
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

// POST /api/workouts/:id/log-set - Log a set for a specific exercise
router.post('/:id/log-set', (req, res) => {
  try {
    const { id } = req.params;
    const setData = LogSetSchema.parse(req.body);
    
    const workout = workouts.find(w => w.id === id);
    
    if (!workout) {
      return res.status(404).json({
        success: false,
        error: 'Workout not found',
      });
    }

    if (workout.status !== 'in_progress') {
      return res.status(400).json({
        success: false,
        error: 'Cannot log sets for completed or cancelled workouts',
      });
    }

    const exercise = workout.exercises.find(e => e.id === setData.exerciseId);
    
    if (!exercise) {
      return res.status(404).json({
        success: false,
        error: 'Exercise not found in workout',
      });
    }

    const newSet = {
      id: crypto.randomUUID(),
      setNumber: setData.setNumber,
      reps: setData.reps,
      weight: setData.weight,
      restTime: setData.restTime,
      completed: true,
      notes: setData.notes,
    };

    exercise.sets.push(newSet);
    workout.updatedAt = new Date();

    res.json({
      success: true,
      data: workout,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Invalid set data',
        details: error.errors,
      });
    }
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

// POST /api/workouts/:id/complete - Complete a workout
router.post('/:id/complete', (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = CompleteWorkoutSchema.parse(req.body);
    
    const workout = workouts.find(w => w.id === id);
    
    if (!workout) {
      return res.status(404).json({
        success: false,
        error: 'Workout not found',
      });
    }

    if (workout.status !== 'in_progress') {
      return res.status(400).json({
        success: false,
        error: 'Workout is not in progress',
      });
    }

    workout.status = 'completed';
    workout.completedAt = new Date();
    workout.duration = Math.floor((workout.completedAt.getTime() - workout.startedAt.getTime()) / (1000 * 60));
    if (notes) {
      workout.notes = notes;
    }
    workout.updatedAt = new Date();

    res.json({
      success: true,
      data: workout,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request data',
        details: error.errors,
      });
    }
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

// PUT /api/workouts/:id - Update a workout
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const updateData = UpdateWorkoutSchema.parse(req.body);
    
    const workoutIndex = workouts.findIndex(w => w.id === id);
    
    if (workoutIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Workout not found',
      });
    }

    const updatedWorkout: Workout = {
      ...workouts[workoutIndex],
      ...updateData,
      updatedAt: new Date(),
    };

    workouts[workoutIndex] = updatedWorkout;

    res.json({
      success: true,
      data: updatedWorkout,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Invalid workout data',
        details: error.errors,
      });
    }
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

// DELETE /api/workouts/:id - Delete a workout
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const workoutIndex = workouts.findIndex(w => w.id === id);
    
    if (workoutIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Workout not found',
      });
    }

    const deletedWorkout = workouts.splice(workoutIndex, 1)[0];

    res.json({
      success: true,
      data: deletedWorkout,
      message: 'Workout deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

export default router;

