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
