// Define shared types for the application

export interface Category {
  id: string;
  name: string;
  hourlyRate: number;
  tasksCount?: number;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  category: string;
  hourlyRate: number;
  estimatedHours: number;
  completed: boolean;
  createdAt: string;
  priority: "low" | "medium" | "high";
  dueDate?: string;
  completedAt?: string;
  actualTimeSpent?: number;
  timeEntries?: Array<{
    startTime: string;
    endTime: string;
    duration: number;
  }>;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface MentalBankBalance {
  currentBalance: number;
  targetBalance: number;
  progressPercentage: number;
  dailyGrowth: number;
}

export interface JournalEntryType {
  id: string;
  title: string;
  content: string;
  audioUrl?: string;
  transcription?: string;
  createdAt: string;
  userId: string;
}

export type TimeFrame = "weekly" | "monthly" | "biannual" | "annual";

export interface Goal {
  id: string;
  title: string;
  description: string;
  targetValue: number;
  currentValue: number;
  progressPercentage: number;
  startDate: string;
  targetDate: string;
  timeFrame: TimeFrame;
  categoryId?: string;
  isCompleted: boolean;
  isActive: boolean;
  reward?: string;
  createdAt: string;
  updatedAt: string;
  milestones?: GoalMilestone[];
}

export interface GoalMilestone {
  id: string;
  goalId: string;
  title: string;
  description: string;
  targetValue: number;
  isCompleted: boolean;
  completionDate?: string;
  reward?: string;
  createdAt: string;
}
