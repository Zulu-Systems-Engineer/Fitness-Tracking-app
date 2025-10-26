import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  Timestamp,
  DocumentData,
  QueryDocumentSnapshot
} from 'firebase/firestore';
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

// Helper function to convert Firestore data
const convertFirestoreData = (doc: QueryDocumentSnapshot<DocumentData>) => {
  const data = doc.data();
  const id = doc.id;
  
  // Convert Firestore Timestamps to Dates
  const convertTimestamps = (obj: any): any => {
    if (obj && typeof obj === 'object') {
      if (obj.seconds && obj.nanoseconds) {
        return new Date(obj.seconds * 1000);
      }
      if (Array.isArray(obj)) {
        return obj.map(convertTimestamps);
      }
      return Object.fromEntries(
        Object.entries(obj).map(([key, value]) => [key, convertTimestamps(value)])
      );
    }
    return obj;
  };
  
  return { id, ...convertTimestamps(data) };
};

// Workout Plans
export const workoutPlanService = {
  async create(plan: Omit<WorkoutPlan, 'id' | 'createdAt' | 'updatedAt'>): Promise<WorkoutPlan> {
    const now = new Date();
    const planData = {
      ...plan,
      createdAt: Timestamp.fromDate(now),
      updatedAt: Timestamp.fromDate(now)
    };
    
    const docRef = await addDoc(collection(db, 'workoutPlans'), planData);
    return { ...plan, id: docRef.id, createdAt: now, updatedAt: now };
  },

  async getAll(userId?: string): Promise<WorkoutPlan[]> {
    let q = query(collection(db, 'workoutPlans'), orderBy('createdAt', 'desc'));
    
    if (userId) {
      q = query(
        collection(db, 'workoutPlans'),
        where('createdBy', '==', userId),
        orderBy('createdAt', 'desc')
      );
    }
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(convertFirestoreData) as WorkoutPlan[];
  },

  async getById(id: string): Promise<WorkoutPlan | null> {
    const docRef = doc(db, 'workoutPlans', id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return convertFirestoreData(docSnap) as WorkoutPlan;
    }
    return null;
  },

  async update(id: string, updates: Partial<WorkoutPlan>): Promise<void> {
    const docRef = doc(db, 'workoutPlans', id);
    const updateData = {
      ...updates,
      updatedAt: Timestamp.fromDate(new Date())
    };
    await updateDoc(docRef, updateData);
  },

  async delete(id: string): Promise<void> {
    const docRef = doc(db, 'workoutPlans', id);
    await deleteDoc(docRef);
  }
};

// Workouts
export const workoutService = {
  async create(workout: Omit<Workout, 'id' | 'createdAt' | 'updatedAt'>): Promise<Workout> {
    const now = new Date();
    const workoutData = {
      ...workout,
      startedAt: Timestamp.fromDate(workout.startedAt),
      completedAt: workout.completedAt ? Timestamp.fromDate(workout.completedAt) : null,
      createdAt: Timestamp.fromDate(now),
      updatedAt: Timestamp.fromDate(now)
    };
    
    const docRef = await addDoc(collection(db, 'workouts'), workoutData);
    return { ...workout, id: docRef.id, createdAt: now, updatedAt: now };
  },

  async getAll(userId: string): Promise<Workout[]> {
    const q = query(
      collection(db, 'workouts'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(convertFirestoreData) as Workout[];
  },

  async getActive(userId: string): Promise<Workout | null> {
    const q = query(
      collection(db, 'workouts'),
      where('userId', '==', userId),
      where('status', '==', 'active'),
      limit(1)
    );
    
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    
    return convertFirestoreData(snapshot.docs[0]) as Workout;
  },

  async getById(id: string): Promise<Workout | null> {
    const docRef = doc(db, 'workouts', id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return convertFirestoreData(docSnap) as Workout;
    }
    return null;
  },

  async update(id: string, updates: Partial<Workout>): Promise<void> {
    const docRef = doc(db, 'workouts', id);
    const updateData = {
      ...updates,
      completedAt: updates.completedAt ? Timestamp.fromDate(updates.completedAt) : undefined,
      updatedAt: Timestamp.fromDate(new Date())
    };
    await updateDoc(docRef, updateData);
  },

  async delete(id: string): Promise<void> {
    const docRef = doc(db, 'workouts', id);
    await deleteDoc(docRef);
  }
};

// Goals
export const goalService = {
  async create(goal: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>): Promise<Goal> {
    const now = new Date();
    const goalData = {
      ...goal,
      targetDate: Timestamp.fromDate(goal.targetDate),
      completedAt: goal.completedAt ? Timestamp.fromDate(goal.completedAt) : null,
      createdAt: Timestamp.fromDate(now),
      updatedAt: Timestamp.fromDate(now)
    };
    
    const docRef = await addDoc(collection(db, 'goals'), goalData);
    return { ...goal, id: docRef.id, createdAt: now, updatedAt: now };
  },

  async getAll(userId: string): Promise<Goal[]> {
    const q = query(
      collection(db, 'goals'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(convertFirestoreData) as Goal[];
  },

  async getById(id: string): Promise<Goal | null> {
    const docRef = doc(db, 'goals', id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return convertFirestoreData(docSnap) as Goal;
    }
    return null;
  },

  async update(id: string, updates: Partial<Goal>): Promise<void> {
    const docRef = doc(db, 'goals', id);
    const updateData = {
      ...updates,
      targetDate: updates.targetDate ? Timestamp.fromDate(updates.targetDate) : undefined,
      completedAt: updates.completedAt ? Timestamp.fromDate(updates.completedAt) : undefined,
      updatedAt: Timestamp.fromDate(new Date())
    };
    await updateDoc(docRef, updateData);
  },

  async delete(id: string): Promise<void> {
    const docRef = doc(db, 'goals', id);
    await deleteDoc(docRef);
  }
};

// Personal Records
export const recordService = {
  async create(record: Omit<PersonalRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<PersonalRecord> {
    const now = new Date();
    const recordData = {
      ...record,
      dateAchieved: Timestamp.fromDate(record.dateAchieved),
      createdAt: Timestamp.fromDate(now),
      updatedAt: Timestamp.fromDate(now)
    };
    
    const docRef = await addDoc(collection(db, 'personalRecords'), recordData);
    return { ...record, id: docRef.id, createdAt: now, updatedAt: now };
  },

  async getAll(userId: string): Promise<PersonalRecord[]> {
    const q = query(
      collection(db, 'personalRecords'),
      where('userId', '==', userId),
      orderBy('dateAchieved', 'desc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(convertFirestoreData) as PersonalRecord[];
  },

  async getByExercise(userId: string, exerciseName: string): Promise<PersonalRecord[]> {
    const q = query(
      collection(db, 'personalRecords'),
      where('userId', '==', userId),
      where('exerciseName', '==', exerciseName),
      orderBy('dateAchieved', 'desc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(convertFirestoreData) as PersonalRecord[];
  },

  async getById(id: string): Promise<PersonalRecord | null> {
    const docRef = doc(db, 'personalRecords', id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return convertFirestoreData(docSnap) as PersonalRecord;
    }
    return null;
  },

  async update(id: string, updates: Partial<PersonalRecord>): Promise<void> {
    const docRef = doc(db, 'personalRecords', id);
    const updateData = {
      ...updates,
      dateAchieved: updates.dateAchieved ? Timestamp.fromDate(updates.dateAchieved) : undefined,
      updatedAt: Timestamp.fromDate(new Date())
    };
    await updateDoc(docRef, updateData);
  },

  async delete(id: string): Promise<void> {
    const docRef = doc(db, 'personalRecords', id);
    await deleteDoc(docRef);
  }
};
