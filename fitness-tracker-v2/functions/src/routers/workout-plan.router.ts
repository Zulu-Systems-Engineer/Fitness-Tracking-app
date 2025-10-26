import { Router } from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
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
const prisma = new PrismaClient();

// GET /api/workout-plans - Get all workout plans with optional filtering
router.get('/', authenticateToken, validateRequest(WorkoutPlanFiltersSchema, 'query'), async (req, res) => {
  try {
    const filters = req.query as WorkoutPlanFilters;
    const userId = req.user.id;

    const where: any = {
      OR: [
        { createdBy: userId },
        { isPublic: true },
      ],
    };

    // Apply filters
    if (filters.difficulty) {
      where.difficulty = filters.difficulty;
    }
    if (filters.category) {
      where.category = filters.category;
    }
    if (filters.isPublic !== undefined) {
      where.isPublic = filters.isPublic;
    }
    if (filters.createdBy) {
      where.createdBy = filters.createdBy;
    }
    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const plans = await prisma.workoutPlan.findMany({
      where,
      include: {
        exercises: true,
        _count: {
          select: {
            workouts: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json({
      success: true,
      data: plans,
      count: plans.length,
    });
  } catch (error) {
    console.error('Error fetching workout plans:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

// GET /api/workout-plans/:id - Get a specific workout plan
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const plan = await prisma.workoutPlan.findFirst({
      where: {
        id,
        OR: [
          { createdBy: userId },
          { isPublic: true },
        ],
      },
      include: {
        exercises: true,
        workouts: {
          where: {
            userId,
          },
          select: {
            id: true,
            startedAt: true,
            completedAt: true,
            status: true,
          },
        },
      },
    });

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
    console.error('Error fetching workout plan:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

// POST /api/workout-plans - Create a new workout plan
router.post('/', authenticateToken, validateRequest(CreateWorkoutPlanSchema), async (req, res) => {
  try {
    const planData = req.body as CreateWorkoutPlan;
    const userId = req.user.id;

    const plan = await prisma.workoutPlan.create({
      data: {
        ...planData,
        createdBy: userId,
        exercises: {
          create: planData.exercises.map(exercise => ({
            ...exercise,
          })),
        },
      },
      include: {
        exercises: true,
      },
    });

    res.status(201).json({
      success: true,
      data: plan,
    });
  } catch (error) {
    console.error('Error creating workout plan:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

// PUT /api/workout-plans/:id - Update a workout plan
router.put('/:id', authenticateToken, validateRequest(UpdateWorkoutPlanSchema), async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body as UpdateWorkoutPlan;
    const userId = req.user.id;

    // Verify ownership
    const existingPlan = await prisma.workoutPlan.findFirst({
      where: {
        id,
        createdBy: userId,
      },
    });

    if (!existingPlan) {
      return res.status(404).json({
        success: false,
        error: 'Workout plan not found or access denied',
      });
    }

    const plan = await prisma.workoutPlan.update({
      where: {
        id,
      },
      data: {
        ...updateData,
        updatedAt: new Date(),
      },
      include: {
        exercises: true,
      },
    });

    res.json({
      success: true,
      data: plan,
    });
  } catch (error) {
    console.error('Error updating workout plan:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

// DELETE /api/workout-plans/:id - Delete a workout plan
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Verify ownership
    const existingPlan = await prisma.workoutPlan.findFirst({
      where: {
        id,
        createdBy: userId,
      },
    });

    if (!existingPlan) {
      return res.status(404).json({
        success: false,
        error: 'Workout plan not found or access denied',
      });
    }

    await prisma.workoutPlan.delete({
      where: {
        id,
      },
    });

    res.json({
      success: true,
      message: 'Workout plan deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting workout plan:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

export default router;
