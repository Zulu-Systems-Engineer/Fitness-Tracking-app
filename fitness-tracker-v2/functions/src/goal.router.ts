import { Router } from 'express';
import { z } from 'zod';
import {
  GoalSchema,
  CreateGoalSchema,
  UpdateGoalSchema,
  UpdateGoalProgressSchema,
  CompleteGoalSchema,
  GoalFiltersSchema,
  type Goal,
  type CreateGoal,
  type UpdateGoal,
  type UpdateGoalProgress,
  type CompleteGoal,
  type GoalFilters,
} from '../../packages/shared/src/schemas';

const router = Router();

// In-memory storage for demo purposes
// In production, this would be replaced with a database
const goals: Goal[] = [];

// GET /api/goals - Get all goals with optional filtering
router.get('/', (req, res) => {
  try {
    const filters = GoalFiltersSchema.parse(req.query);
    let filteredGoals = [...goals];

    // Apply filters
    if (filters.type) {
      filteredGoals = filteredGoals.filter(goal => goal.type === filters.type);
    }
    if (filters.status) {
      filteredGoals = filteredGoals.filter(goal => goal.status === filters.status);
    }
    if (filters.priority) {
      filteredGoals = filteredGoals.filter(goal => goal.priority === filters.priority);
    }
    if (filters.isPublic !== undefined) {
      filteredGoals = filteredGoals.filter(goal => goal.isPublic === filters.isPublic);
    }
    if (filters.userId) {
      filteredGoals = filteredGoals.filter(goal => goal.userId === filters.userId);
    }
    if (filters.dateFrom) {
      filteredGoals = filteredGoals.filter(goal => goal.createdAt >= filters.dateFrom!);
    }
    if (filters.dateTo) {
      filteredGoals = filteredGoals.filter(goal => goal.createdAt <= filters.dateTo!);
    }
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filteredGoals = filteredGoals.filter(goal => 
        goal.title.toLowerCase().includes(searchTerm) ||
        goal.description?.toLowerCase().includes(searchTerm)
      );
    }

    res.json({
      success: true,
      data: filteredGoals,
      count: filteredGoals.length,
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

// GET /api/goals/:id - Get a specific goal
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const goal = goals.find(g => g.id === id);

    if (!goal) {
      return res.status(404).json({
        success: false,
        error: 'Goal not found',
      });
    }

    res.json({
      success: true,
      data: goal,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

// POST /api/goals - Create a new goal
router.post('/', (req, res) => {
  try {
    const goalData = CreateGoalSchema.parse(req.body);
    
    const newGoal: Goal = {
      ...goalData,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    goals.push(newGoal);

    res.status(201).json({
      success: true,
      data: newGoal,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Invalid goal data',
        details: error.errors,
      });
    }
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

// PUT /api/goals/:id - Update a goal
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const updateData = UpdateGoalSchema.parse(req.body);
    
    const goalIndex = goals.findIndex(g => g.id === id);
    
    if (goalIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Goal not found',
      });
    }

    const updatedGoal: Goal = {
      ...goals[goalIndex],
      ...updateData,
      updatedAt: new Date(),
    };

    goals[goalIndex] = updatedGoal;

    res.json({
      success: true,
      data: updatedGoal,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Invalid goal data',
        details: error.errors,
      });
    }
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

// POST /api/goals/:id/progress - Update goal progress
router.post('/:id/progress', (req, res) => {
  try {
    const { id } = req.params;
    const { currentValue, notes } = UpdateGoalProgressSchema.parse(req.body);
    
    const goal = goals.find(g => g.id === id);
    
    if (!goal) {
      return res.status(404).json({
        success: false,
        error: 'Goal not found',
      });
    }

    if (goal.status !== 'active') {
      return res.status(400).json({
        success: false,
        error: 'Cannot update progress for inactive goals',
      });
    }

    goal.currentValue = currentValue;
    goal.updatedAt = new Date();

    // Check if goal is completed
    if (currentValue >= goal.targetValue && goal.status === 'active') {
      goal.status = 'completed';
      goal.completedAt = new Date();
    }

    res.json({
      success: true,
      data: goal,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Invalid progress data',
        details: error.errors,
      });
    }
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

// POST /api/goals/:id/complete - Mark goal as completed
router.post('/:id/complete', (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = CompleteGoalSchema.parse(req.body);
    
    const goal = goals.find(g => g.id === id);
    
    if (!goal) {
      return res.status(404).json({
        success: false,
        error: 'Goal not found',
      });
    }

    if (goal.status === 'completed') {
      return res.status(400).json({
        success: false,
        error: 'Goal is already completed',
      });
    }

    goal.status = 'completed';
    goal.completedAt = new Date();
    goal.updatedAt = new Date();
    
    if (notes) {
      goal.description = goal.description ? `${goal.description}\n\nCompletion notes: ${notes}` : `Completion notes: ${notes}`;
    }

    res.json({
      success: true,
      data: goal,
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

// DELETE /api/goals/:id - Delete a goal
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const goalIndex = goals.findIndex(g => g.id === id);
    
    if (goalIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Goal not found',
      });
    }

    const deletedGoal = goals.splice(goalIndex, 1)[0];

    res.json({
      success: true,
      data: deletedGoal,
      message: 'Goal deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

export default router;

