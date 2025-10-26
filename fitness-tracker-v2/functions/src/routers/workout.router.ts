import { Router } from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
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
const prisma = new PrismaClient();

// GET /api/workouts - Get all workouts with optional filtering
router.get('/', authenticateToken, validateRequest(WorkoutFiltersSchema, 'query'), async (req, res) => {
  try {
    const filters = req.query as WorkoutFilters;
    const userId = req.user.id;

    const where: any = {
      userId,
    };

    // Apply filters
    if (filters.status) {
      where.status = filters.status;
    }
    if (filters.planId) {
      where.planId = filters.planId;
    }
    if (filters.dateFrom) {
      where.startedAt = {
        ...where.startedAt,
        gte: new Date(filters.dateFrom),
      };
    }
    if (filters.dateTo) {
      where.startedAt = {
        ...where.startedAt,
        lte: new Date(filters.dateTo),
      };
    }

    const workouts = await prisma.workout.findMany({
      where,
      include: {
        plan: true,
        exercises: {
          include: {
            sets: true,
          },
        },
      },
      orderBy: {
        startedAt: 'desc',
      },
    });

    res.json({
      success: true,
      data: workouts,
      count: workouts.length,
    });
  } catch (error) {
    console.error('Error fetching workouts:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

// GET /api/workouts/:id - Get a specific workout
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const workout = await prisma.workout.findFirst({
      where: {
        id,
        userId,
      },
      include: {
        plan: true,
        exercises: {
          include: {
            sets: true,
          },
        },
      },
    });

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
    console.error('Error fetching workout:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

// POST /api/workouts - Create a new workout
router.post('/', authenticateToken, validateRequest(CreateWorkoutSchema), async (req, res) => {
  try {
    const workoutData = req.body as CreateWorkout;
    const userId = req.user.id;

    const workout = await prisma.workout.create({
      data: {
        ...workoutData,
        userId,
        exercises: {
          create: workoutData.exercises.map(exercise => ({
            ...exercise,
            sets: {
              create: exercise.sets || [],
            },
          })),
        },
      },
      include: {
        plan: true,
        exercises: {
          include: {
            sets: true,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      data: workout,
    });
  } catch (error) {
    console.error('Error creating workout:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

// POST /api/workouts/start-from-plan - Start a workout from a plan
router.post('/start-from-plan', authenticateToken, validateRequest(StartWorkoutFromPlanSchema), async (req, res) => {
  try {
    const { planId } = req.body as StartWorkoutFromPlan;
    const userId = req.user.id;

    // Get the plan
    const plan = await prisma.workoutPlan.findFirst({
      where: {
        id: planId,
        OR: [
          { createdBy: userId },
          { isPublic: true },
        ],
      },
      include: {
        exercises: true,
      },
    });

    if (!plan) {
      return res.status(404).json({
        success: false,
        error: 'Workout plan not found',
      });
    }

    // Create workout from plan
    const workout = await prisma.workout.create({
      data: {
        name: plan.name,
        description: plan.description,
        planId: plan.id,
        userId,
        status: 'in_progress',
        startedAt: new Date(),
        exercises: {
          create: plan.exercises.map(exercise => ({
            name: exercise.name,
            description: exercise.description,
            targetMuscles: exercise.targetMuscles,
            equipment: exercise.equipment,
            instructions: exercise.instructions,
            restTime: exercise.restTime,
            notes: exercise.notes,
          })),
        },
      },
      include: {
        plan: true,
        exercises: {
          include: {
            sets: true,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      data: workout,
    });
  } catch (error) {
    console.error('Error starting workout from plan:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

// POST /api/workouts/:id/log-set - Log a set for an exercise
router.post('/:id/log-set', authenticateToken, validateRequest(LogSetSchema), async (req, res) => {
  try {
    const { id } = req.params;
    const setData = req.body as LogSet;
    const userId = req.user.id;

    // Verify workout ownership
    const workout = await prisma.workout.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!workout) {
      return res.status(404).json({
        success: false,
        error: 'Workout not found',
      });
    }

    // Create the set
    const set = await prisma.workoutSet.create({
      data: {
        ...setData,
        workoutId: id,
      },
    });

    res.status(201).json({
      success: true,
      data: set,
    });
  } catch (error) {
    console.error('Error logging set:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

// POST /api/workouts/:id/complete - Complete a workout
router.post('/:id/complete', authenticateToken, validateRequest(CompleteWorkoutSchema), async (req, res) => {
  try {
    const { id } = req.params;
    const { completedAt, notes } = req.body as CompleteWorkout;
    const userId = req.user.id;

    const workout = await prisma.workout.update({
      where: {
        id,
        userId,
      },
      data: {
        status: 'completed',
        completedAt: completedAt ? new Date(completedAt) : new Date(),
        notes,
        updatedAt: new Date(),
      },
      include: {
        plan: true,
        exercises: {
          include: {
            sets: true,
          },
        },
      },
    });

    res.json({
      success: true,
      data: workout,
    });
  } catch (error) {
    console.error('Error completing workout:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

// PUT /api/workouts/:id - Update a workout
router.put('/:id', authenticateToken, validateRequest(UpdateWorkoutSchema), async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body as UpdateWorkout;
    const userId = req.user.id;

    const workout = await prisma.workout.update({
      where: {
        id,
        userId,
      },
      data: {
        ...updateData,
        updatedAt: new Date(),
      },
      include: {
        plan: true,
        exercises: {
          include: {
            sets: true,
          },
        },
      },
    });

    res.json({
      success: true,
      data: workout,
    });
  } catch (error) {
    console.error('Error updating workout:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

// DELETE /api/workouts/:id - Delete a workout
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    await prisma.workout.delete({
      where: {
        id,
        userId,
      },
    });

    res.json({
      success: true,
      message: 'Workout deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting workout:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

export default router;
