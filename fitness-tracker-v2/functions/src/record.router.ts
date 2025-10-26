import { Router } from 'express';
import { z } from 'zod';
import {
  PersonalRecordSchema,
  CreatePersonalRecordSchema,
  UpdatePersonalRecordSchema,
  RecordFiltersSchema,
  RecordStatsSchema,
  type PersonalRecord,
  type CreatePersonalRecord,
  type UpdatePersonalRecord,
  type RecordFilters,
  type RecordStats,
} from '../../packages/shared/src/schemas';

const router = Router();

// In-memory storage for demo purposes
// In production, this would be replaced with a database
const personalRecords: PersonalRecord[] = [];

// Helper function to detect personal records from workout data
const detectPersonalRecords = (workoutData: any): PersonalRecord[] => {
  const records: PersonalRecord[] = [];
  
  // This would analyze workout data and detect new PRs
  // For demo purposes, we'll create some mock records
  return records;
};

// GET /api/records - Get all personal records with optional filtering
router.get('/', (req, res) => {
  try {
    const filters = RecordFiltersSchema.parse(req.query);
    let filteredRecords = [...personalRecords];

    // Apply filters
    if (filters.exerciseId) {
      filteredRecords = filteredRecords.filter(record => record.exerciseId === filters.exerciseId);
    }
    if (filters.recordType) {
      filteredRecords = filteredRecords.filter(record => record.recordType === filters.recordType);
    }
    if (filters.userId) {
      filteredRecords = filteredRecords.filter(record => record.userId === filters.userId);
    }
    if (filters.dateFrom) {
      filteredRecords = filteredRecords.filter(record => record.workoutDate >= filters.dateFrom!);
    }
    if (filters.dateTo) {
      filteredRecords = filteredRecords.filter(record => record.workoutDate <= filters.dateTo!);
    }
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filteredRecords = filteredRecords.filter(record => 
        record.exerciseName.toLowerCase().includes(searchTerm) ||
        record.notes?.toLowerCase().includes(searchTerm)
      );
    }

    // Sort by date (newest first)
    filteredRecords.sort((a, b) => b.workoutDate.getTime() - a.workoutDate.getTime());

    res.json({
      success: true,
      data: filteredRecords,
      count: filteredRecords.length,
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

// GET /api/records/stats - Get personal record statistics
router.get('/stats', (req, res) => {
  try {
    const userId = req.query.userId as string;
    
    let userRecords = personalRecords;
    if (userId) {
      userRecords = personalRecords.filter(record => record.userId === userId);
    }

    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisYear = new Date(now.getFullYear(), 0, 1);

    const recordsThisMonth = userRecords.filter(record => record.workoutDate >= thisMonth).length;
    const recordsThisYear = userRecords.filter(record => record.workoutDate >= thisYear).length;

    // Find most improved exercise
    const exerciseImprovements = userRecords.reduce((acc, record) => {
      if (record.improvement && record.improvement > 0) {
        const key = record.exerciseName;
        if (!acc[key]) {
          acc[key] = { totalImprovement: 0, count: 0 };
        }
        acc[key].totalImprovement += record.improvement;
        acc[key].count += 1;
      }
      return acc;
    }, {} as Record<string, { totalImprovement: number; count: number }>);

    const mostImprovedExercise = Object.entries(exerciseImprovements)
      .map(([exercise, data]) => ({
        exercise,
        averageImprovement: data.totalImprovement / data.count,
      }))
      .sort((a, b) => b.averageImprovement - a.averageImprovement)[0]?.exercise;

    const biggestImprovement = Math.max(...userRecords.map(record => record.improvement || 0));

    const stats: RecordStats = {
      totalRecords: userRecords.length,
      recordsThisMonth,
      recordsThisYear,
      mostImprovedExercise,
      biggestImprovement: biggestImprovement > 0 ? biggestImprovement : undefined,
      recentRecords: userRecords.slice(0, 10),
    };

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

// GET /api/records/exercise/:exerciseId - Get records for a specific exercise
router.get('/exercise/:exerciseId', (req, res) => {
  try {
    const { exerciseId } = req.params;
    const exerciseRecords = personalRecords
      .filter(record => record.exerciseId === exerciseId)
      .sort((a, b) => b.workoutDate.getTime() - a.workoutDate.getTime());

    res.json({
      success: true,
      data: exerciseRecords,
      count: exerciseRecords.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

// GET /api/records/:id - Get a specific personal record
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const record = personalRecords.find(r => r.id === id);

    if (!record) {
      return res.status(404).json({
        success: false,
        error: 'Personal record not found',
      });
    }

    res.json({
      success: true,
      data: record,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

// POST /api/records - Create a new personal record
router.post('/', (req, res) => {
  try {
    const recordData = CreatePersonalRecordSchema.parse(req.body);
    
    const newRecord: PersonalRecord = {
      ...recordData,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    personalRecords.push(newRecord);

    res.status(201).json({
      success: true,
      data: newRecord,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Invalid personal record data',
        details: error.errors,
      });
    }
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

// POST /api/records/detect - Auto-detect personal records from workout
router.post('/detect', (req, res) => {
  try {
    const { workoutId, workoutData } = req.body;
    
    if (!workoutId || !workoutData) {
      return res.status(400).json({
        success: false,
        error: 'Workout ID and workout data are required',
      });
    }

    // Detect new personal records from workout data
    const newRecords = detectPersonalRecords(workoutData);
    
    // Add detected records
    const createdRecords = newRecords.map(recordData => {
      const newRecord: PersonalRecord = {
        ...recordData,
        id: crypto.randomUUID(),
        workoutId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      personalRecords.push(newRecord);
      return newRecord;
    });

    res.status(201).json({
      success: true,
      data: createdRecords,
      count: createdRecords.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

// PUT /api/records/:id - Update a personal record
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const updateData = UpdatePersonalRecordSchema.parse(req.body);
    
    const recordIndex = personalRecords.findIndex(r => r.id === id);
    
    if (recordIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Personal record not found',
      });
    }

    const updatedRecord: PersonalRecord = {
      ...personalRecords[recordIndex],
      ...updateData,
      updatedAt: new Date(),
    };

    personalRecords[recordIndex] = updatedRecord;

    res.json({
      success: true,
      data: updatedRecord,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Invalid personal record data',
        details: error.errors,
      });
    }
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

// DELETE /api/records/:id - Delete a personal record
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const recordIndex = personalRecords.findIndex(r => r.id === id);
    
    if (recordIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Personal record not found',
      });
    }

    const deletedRecord = personalRecords.splice(recordIndex, 1)[0];

    res.json({
      success: true,
      data: deletedRecord,
      message: 'Personal record deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

export default router;

