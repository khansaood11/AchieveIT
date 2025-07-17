
export type Goal = {
  id: string;
  title: string;
  description?: string;
  category: 'Personal' | 'Work' | 'Health' | 'Finance' | 'Education';
  priority: 'Low' | 'Medium' | 'High';
  progress: number; // 0-100
  dueDate?: any; // Can be a Date object or a Firestore Timestamp
  isCompleted: boolean;
  createdAt: any; // Can be a Date object or a Firestore Timestamp
};

export type Habit = {
  id: string;
  name: string;
  completedDays: boolean[]; // Array of 7 booleans for the week
};

export type GoalTemplate = {
  title: string;
  description: string;
  category: Goal['category'];
};

export interface HealthMetrics {
  height: number | string;
  weight: number | string;
  bloodPressure: { systolic: number | string; diastolic: number | string };
  stepCount: number;
  heartRate: number | string;
  calories: number | string;
}

export interface ActivityData {
  steps: { name: string; steps: number }[];
  glucose: { name: string; level: number }[];
  bodyFat: { name: string; percent: number }[];
}
