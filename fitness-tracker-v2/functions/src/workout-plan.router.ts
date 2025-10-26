import { Router } from 'express';
import { z } from 'zod';
import {
  WorkoutPlanSchema,
  CreateWorkoutPlanSchema,
  UpdateWorkoutPlanSchema,
  WorkoutPlanFiltersSchema,
  type WorkoutPlan,
  type CreateWorkoutPlan,
  type UpdateWorkoutPlan,
  type WorkoutPlanFilters,
} from '../../packages/shared/src/schemas';

const router = Router();

// In-memory storage for demo purposes
// In production, this would be replaced with a database
const workoutPlans: WorkoutPlan[] = [];

// GET /api/workout-plans - Get all workout plans with optional filtering
router.get('/', (req, res) => {
  try {
    const filters = WorkoutPlanFiltersSchema.parse(req.query);
    let filteredPlans = [...workoutPlans];

    // Apply filters
    if (filters.difficulty) {
      filteredPlans = filteredPlans.filter(plan => plan.difficulty === filters.difficulty);
    }
    if (filters.category) {
      filteredPlans = filteredPlans.filter(plan => plan.category === filters.category);
    }
    if (filters.isPublic !== undefined) {
      filteredPlans = filteredPlans.filter(plan => plan.isPublic === filters.isPublic);
    }
    if (filters.createdBy) {
      filteredPlans = filteredPlans.filter(plan => plan.createdBy === filters.createdBy);
    }
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filteredPlans = filteredPlans.filter(plan => 
        plan.name.toLowerCase().includes(searchTerm) ||
        plan.description?.toLowerCase().includes(searchTerm)
      );
    }

    res.json({
      success: true,
      data: filteredPlans,
      count: filteredPlans.length,
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

// GET /api/workout-plans/:id - Get a specific workout plan
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const plan = workoutPlans.find(p => p.id === id);

    if (!plan) {
      return res.status(404).json({
        success: false,
        error: 'Workout plan not found',
      });
    }

    res.json({
      success: true,
      data: plan,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

// POST /api/workout-plans - Create a new workout plan
router.post('/', (req, res) => {
  try {
    const planData = CreateWorkoutPlanSchema.parse(req.body);
    
    const newPlan: WorkoutPlan = {
      ...planData,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    workoutPlans.push(newPlan);

    res.status(201).json({
      success: true,
      data: newPlan,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Invalid workout plan data',
        details: error.errors,
      });
    }
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

// PUT /api/workout-plans/:id - Update a workout plan
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const updateData = UpdateWorkoutPlanSchema.parse(req.body);
    
    const planIndex = workoutPlans.findIndex(p => p.id === id);
    
    if (planIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Workout plan not found',
      });
    }

    const updatedPlan: WorkoutPlan = {
      ...workoutPlans[planIndex],
      ...updateData,
      updatedAt: new Date(),
    };

    workoutPlans[planIndex] = updatedPlan;

    res.json({
      success: true,
      data: updatedPlan,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Invalid workout plan data',
        details: error.errors,
      });
    }
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

// DELETE /api/workout-plans/:id - Delete a workout plan
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const planIndex = workoutPlans.findIndex(p => p.id === id);
    
    if (planIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Workout plan not found',
      });
    }

    const deletedPlan = workoutPlans.splice(planIndex, 1)[0];

    res.json({
      success: true,
      data: deletedPlan,
      message: 'Workout plan deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

export default router;

