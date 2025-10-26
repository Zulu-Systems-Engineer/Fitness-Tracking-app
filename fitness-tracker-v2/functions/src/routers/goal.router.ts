import { Router } from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import {
  GoalSchema,
  CreateGoalSchema,
  UpdateGoalSchema,
  GoalFiltersSchema,
  type Goal,
  type CreateGoal,
  type UpdateGoal,
  type GoalFilters,
} from '../../packages/shared/src/schemas';

const router = Router();
const prisma = new PrismaClient();

// GET /api/goals - Get all goals with optional filtering
router.get('/', authenticateToken, validateRequest(GoalFiltersSchema, 'query'), async (req, res) => {
  try {
    const filters = req.query as GoalFilters;
    const userId = req.user.id;

    const where: any = {
      userId,
    };

    // Apply filters
    if (filters.type) {
      where.type = filters.type;
    }
    if (filters.status) {
      where.status = filters.status;
    }
    if (filters.priority) {
      where.priority = filters.priority;
    }
    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const goals = await prisma.goal.findMany({
      where,
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    res.json({
      success: true,
      data: goals,
      count: goals.length,
    });
  } catch (error) {
    console.error('Error fetching goals:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

// GET /api/goals/:id - Get a specific goal
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const goal = await prisma.goal.findFirst({
      where: {
        id,
        userId,
      },
    });

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
    console.error('Error fetching goal:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

// POST /api/goals - Create a new goal
router.post('/', authenticateToken, validateRequest(CreateGoalSchema), async (req, res) => {
  try {
    const goalData = req.body as CreateGoal;
    const userId = req.user.id;

    const goal = await prisma.goal.create({
      data: {
        ...goalData,
        userId,
      },
    });

    res.status(201).json({
      success: true,
      data: goal,
    });
  } catch (error) {
    console.error('Error creating goal:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

// PUT /api/goals/:id - Update a goal
router.put('/:id', authenticateToken, validateRequest(UpdateGoalSchema), async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body as UpdateGoal;
    const userId = req.user.id;

    const goal = await prisma.goal.update({
      where: {
        id,
        userId,
      },
      data: {
        ...updateData,
        updatedAt: new Date(),
      },
    });

    res.json({
      success: true,
      data: goal,
    });
  } catch (error) {
    console.error('Error updating goal:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

// POST /api/goals/:id/update-progress - Update goal progress
router.post('/:id/update-progress', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { currentValue, notes } = req.body;
    const userId = req.user.id;

    const goal = await prisma.goal.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!goal) {
      return res.status(404).json({
        success: false,
        error: 'Goal not found',
      });
    }

    // Check if goal is completed
    const isCompleted = currentValue >= goal.targetValue;
    const completedAt = isCompleted ? new Date() : null;
    const status = isCompleted ? 'completed' : 'in_progress';

    const updatedGoal = await prisma.goal.update({
      where: {
        id,
      },
      data: {
        currentValue,
        status,
        completedAt,
        notes,
        updatedAt: new Date(),
      },
    });

    res.json({
      success: true,
      data: updatedGoal,
    });
  } catch (error) {
    console.error('Error updating goal progress:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

// DELETE /api/goals/:id - Delete a goal
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    await prisma.goal.delete({
      where: {
        id,
        userId,
      },
    });

    res.json({
      success: true,
      message: 'Goal deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting goal:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

export default router;
