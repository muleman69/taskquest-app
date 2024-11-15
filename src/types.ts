export interface Task {
  id: string;
  title: string;
  description: string;
  coinValue: number;
  completed: boolean;
  icon: string;
  assignedTo: string[];
  type: 'daily' | 'one-time';
  lastCompletedAt?: string;
  createdBy: string;
}

export interface Reward {
  id: string;
  parentId: string;
  title: string;
  description: string;
  coinCost: number;
  image?: string;
  createdAt?: string;
}

export interface User {
  uid: string;
  email: string;
  name: string;
  role: 'parent' | 'child';
  coins?: number;
  tasksCompleted?: number;
  dailyStreak?: number;
  parentId?: string;
  createdAt: string;
}

export interface RewardClaim {
  id: string;
  parentId: string;
  childId: string;
  childName: string;
  rewardId: string;
  rewardName: string;
  coinCost: number;
  claimedAt: string;
}

export interface Activity {
  id: string;
  parentId: string;
  childId: string;
  childName: string;
  title: string;
  description: string;
  type: 'task_completion' | 'reward_claim';
  timestamp: Date;
  taskId?: string;
  rewardId?: string;
}
