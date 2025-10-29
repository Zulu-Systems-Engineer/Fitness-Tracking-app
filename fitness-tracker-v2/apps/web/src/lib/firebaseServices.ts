import { 
  ref, 
  push, 
  set, 
  get, 
  update as updateDB, 
  remove,
  query, 
  orderByChild,
  equalTo,
  limitToFirst,
  startAt,
  endAt,
  DataSnapshot
} from 'firebase/database';
import { db } from './firebase';

// Types
export interface WorkoutPlan {
  id?: string;
  name: string;
  description: string;
  exercises: Exercise[];
  duration: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: 'strength' | 'cardio' | 'flexibility' | 'mixed';
  isPublic: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  weight: number;
  restTime?: number;
  notes?: string;
}

export interface Workout {
  id?: string;
  userId: string;
  planId?: string;
  planName?: string;
  name: string;
  exercises: WorkoutExercise[];
  status: 'active' | 'completed' | 'cancelled';
  startedAt: Date;
  completedAt?: Date;
  duration?: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkoutExercise {
  id: string;
  exerciseName: string;
  sets: WorkoutSet[];
  completed: boolean;
}

export interface WorkoutSet {
  id: string;
  setNumber: number;
  reps: number;
  weight: number;
  completed: boolean;
}

export interface Goal {
  id?: string;
  userId: string;
  title: string;
  description: string;
  type: 'weight' | 'strength' | 'endurance' | 'flexibility' | 'custom';
  targetValue: number;
  currentValue: number;
  unit: string;
  targetDate: Date;
  status: 'active' | 'completed' | 'paused' | 'cancelled';
  priority: 'low' | 'medium' | 'high';
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

export interface PersonalRecord {
  id?: string;
  userId: string;
  exerciseId: string;
  exerciseName: string;
  recordType: 'max_weight' | 'max_reps' | 'max_duration' | 'best_time';
  value: number;
  unit: string;
  dateAchieved: Date;
  workoutId?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Helper function to convert Realtime Database snapshot to array
const snapshotToArray = (snapshot: DataSnapshot) => {
  if (!snapshot.exists()) return [];
  const data = snapshot.val();
  return Object.keys(data).map(key => ({
    id: key,
    ...data[key]
  }));
};

// Helper to convert timestamp strings back to Date objects
const convertDates = (obj: any): any => {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(convertDates);
  
  const converted: any = {};
  for (const [key, value] of Object.entries(obj)) {
    if (key.includes('At') || key.includes('Date')) {
      converted[key] = value ? new Date(value as string) : undefined;
    } else if (typeof value === 'object') {
      converted[key] = convertDates(value);
    } else {
      converted[key] = value;
    }
  }
  return converted;
};

// Helper to convert Date objects to ISO strings for storage
const datesToStrings = (obj: any): any => {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(datesToStrings);
  
  const converted: any = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value instanceof Date) {
      converted[key] = value.toISOString();
    } else if (typeof value === 'object') {
      converted[key] = datesToStrings(value);
    } else {
      converted[key] = value;
    }
  }
  return converted;
};

// Workout Plans
export const workoutPlanService = {
  async create(plan: Omit<WorkoutPlan, 'id' | 'createdAt' | 'updatedAt'>): Promise<WorkoutPlan> {
    const now = new Date();
    const planData = {
      ...datesToStrings(plan),
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    };
    
    const planRef = ref(db, 'workoutPlans');
    const newPlanRef = push(planRef);
    await set(newPlanRef, planData);
    
    return { ...plan, id: newPlanRef.key!, createdAt: now, updatedAt: now };
  },

  async getAll(userId?: string): Promise<WorkoutPlan[]> {
    const planRef = ref(db, 'workoutPlans');
    let queryRef = query(planRef, orderByChild('createdAt'));
    
    if (userId) {
      queryRef = query(planRef, orderByChild('createdBy'), equalTo(userId));
    }
    
    const snapshot = await get(queryRef);
    const plans = snapshotToArray(snapshot);
    return (plans as any[]).map(convertDates).reverse() as WorkoutPlan[];
  },

  async getById(id: string): Promise<WorkoutPlan | null> {
    const planRef = ref(db, `workoutPlans/${id}`);
    const snapshot = await get(planRef);
    
    if (snapshot.exists()) {
      const data = snapshot.val();
      return { id: snapshot.key!, ...convertDates(data) } as WorkoutPlan;
    }
    return null;
  },

  async update(id: string, updates: Partial<WorkoutPlan>): Promise<void> {
    const planRef = ref(db, `workoutPlans/${id}`);
    const updateData = {
      ...datesToStrings(updates),
      updatedAt: new Date().toISOString()
    };
    await updateDB(planRef, updateData);
  },

  async delete(id: string): Promise<void> {
    const planRef = ref(db, `workoutPlans/${id}`);
    await remove(planRef);
  }
};

// Workouts
export const workoutService = {
  async create(workout: Omit<Workout, 'id' | 'createdAt' | 'updatedAt'>): Promise<Workout> {
    const now = new Date();
    const workoutData = {
      ...datesToStrings(workout),
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    };
    
    const workoutRef = ref(db, 'workouts');
    const newWorkoutRef = push(workoutRef);
    await set(newWorkoutRef, workoutData);
    
    return { ...workout, id: newWorkoutRef.key!, createdAt: now, updatedAt: now };
  },

  async getAll(userId: string): Promise<Workout[]> {
    const workoutRef = ref(db, 'workouts');
    const queryRef = query(
      workoutRef,
      orderByChild('userId'),
      equalTo(userId)
    );
    
    const snapshot = await get(queryRef);
    const workouts = snapshotToArray(snapshot);
    return (workouts as any[]).map(convertDates).reverse() as Workout[];
  },

  async getActive(userId: string): Promise<Workout | null> {
    const workoutRef = ref(db, 'workouts');
    const queryRef = query(
      workoutRef,
      orderByChild('userId'),
      equalTo(userId),
      limitToFirst(50)
    );
    
    const snapshot = await get(queryRef);
    const workouts = snapshotToArray(snapshot) as any[];
    const active = workouts.find(w => w.status === 'active');
    return active ? convertDates(active) as Workout : null;
  },

  async getById(id: string): Promise<Workout | null> {
    const workoutRef = ref(db, `workouts/${id}`);
    const snapshot = await get(workoutRef);
    
    if (snapshot.exists()) {
      const data = snapshot.val();
      return { id: snapshot.key!, ...convertDates(data) } as Workout;
    }
    return null;
  },

  async update(id: string, updates: Partial<Workout>): Promise<void> {
    const workoutRef = ref(db, `workouts/${id}`);
    const updateData = {
      ...datesToStrings(updates),
      updatedAt: new Date().toISOString()
    };
    await updateDB(workoutRef, updateData);
  },

  async delete(id: string): Promise<void> {
    const workoutRef = ref(db, `workouts/${id}`);
    await remove(workoutRef);
  }
};

// Goals
export const goalService = {
  async create(goal: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>): Promise<Goal> {
    const now = new Date();
    const goalData = {
      ...datesToStrings(goal),
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    };
    
    const goalRef = ref(db, 'goals');
    const newGoalRef = push(goalRef);
    await set(newGoalRef, goalData);
    
    return { ...goal, id: newGoalRef.key!, createdAt: now, updatedAt: now };
  },

  async getAll(userId: string): Promise<Goal[]> {
    const goalRef = ref(db, 'goals');
    const queryRef = query(
      goalRef,
      orderByChild('userId'),
      equalTo(userId)
    );
    
    const snapshot = await get(queryRef);
    const goals = snapshotToArray(snapshot);
    return (goals as any[]).map(convertDates).reverse() as Goal[];
  },

  async getById(id: string): Promise<Goal | null> {
    const goalRef = ref(db, `goals/${id}`);
    const snapshot = await get(goalRef);
    
    if (snapshot.exists()) {
      const data = snapshot.val();
      return { id: snapshot.key!, ...convertDates(data) } as Goal;
    }
    return null;
  },

  async update(id: string, updates: Partial<Goal>): Promise<void> {
    const goalRef = ref(db, `goals/${id}`);
    const updateData = {
      ...datesToStrings(updates),
      updatedAt: new Date().toISOString()
    };
    await updateDB(goalRef, updateData);
  },

  async delete(id: string): Promise<void> {
    const goalRef = ref(db, `goals/${id}`);
    await remove(goalRef);
  }
};

// Personal Records
export const recordService = {
  async create(record: Omit<PersonalRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<PersonalRecord> {
    const now = new Date();
    const recordData = {
      ...datesToStrings(record),
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    };
    
    const recordRef = ref(db, 'personalRecords');
    const newRecordRef = push(recordRef);
    await set(newRecordRef, recordData);
    
    return { ...record, id: newRecordRef.key!, createdAt: now, updatedAt: now };
  },

  async getAll(userId: string): Promise<PersonalRecord[]> {
    const recordRef = ref(db, 'personalRecords');
    const queryRef = query(
      recordRef,
      orderByChild('userId'),
      equalTo(userId)
    );
    
    const snapshot = await get(queryRef);
    const records = snapshotToArray(snapshot);
    return (records as any[]).map(convertDates).reverse() as PersonalRecord[];
  },

  async getByExercise(userId: string, exerciseName: string): Promise<PersonalRecord[]> {
    const recordRef = ref(db, 'personalRecords');
    const queryRef = query(
      recordRef,
      orderByChild('userId'),
      equalTo(userId)
    );
    
    const snapshot = await get(queryRef);
    const allRecords = snapshotToArray(snapshot) as any[];
    const filtered = allRecords.filter(r => r.exerciseName === exerciseName);
    return filtered.map(convertDates) as PersonalRecord[];
  },

  async getById(id: string): Promise<PersonalRecord | null> {
    const recordRef = ref(db, `personalRecords/${id}`);
    const snapshot = await get(recordRef);
    
    if (snapshot.exists()) {
      const data = snapshot.val();
      return { id: snapshot.key!, ...convertDates(data) } as PersonalRecord;
    }
    return null;
  },

  async update(id: string, updates: Partial<PersonalRecord>): Promise<void> {
    const recordRef = ref(db, `personalRecords/${id}`);
    const updateData = {
      ...datesToStrings(updates),
      updatedAt: new Date().toISOString()
    };
    await updateDB(recordRef, updateData);
  },

  async delete(id: string): Promise<void> {
    const recordRef = ref(db, `personalRecords/${id}`);
    await remove(recordRef);
  }
};
