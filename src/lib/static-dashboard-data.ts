import { addDays, subDays } from "date-fns";

export interface Activity {
  id: string;
  userId: string | null;
  type: string;
  name: string;
  description: string | null;
  timestamp: Date;
  duration: number | null;
  completed: boolean;
  moodScore: number | null;
  moodNote: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// Mock data store
let activities: Activity[] = [
  {
    id: "1",
    userId: "default-user",
    type: "meditation",
    name: "Morning Meditation",
    description: "10 minute mindfulness session",
    timestamp: new Date(),
    duration: 10,
    completed: true,
    moodScore: null,
    moodNote: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "2",
    userId: "default-user",
    type: "mood",
    name: "Mood Check-in",
    description: null,
    timestamp: subDays(new Date(), 1),
    duration: null,
    completed: true,
    moodScore: 75,
    moodNote: "Feeling good",
    createdAt: subDays(new Date(), 1),
    updatedAt: subDays(new Date(), 1),
  }
];

export const getUserActivities = async (userId: string): Promise<Activity[]> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500));
  return activities.filter((a) => a.userId === userId || a.userId === null);
};

export const saveMoodData = async (data: {
  userId: string;
  mood: number;
  note: string;
}): Promise<Activity> => {
  await new Promise((resolve) => setTimeout(resolve, 500));
  
  const newActivity: Activity = {
    id: Math.random().toString(36).substr(2, 9),
    userId: data.userId,
    type: "mood",
    name: "Mood Check-in",
    description: null,
    timestamp: new Date(),
    duration: null,
    completed: true,
    moodScore: data.mood,
    moodNote: data.note,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  activities = [newActivity, ...activities];
  return newActivity;
};

export const logActivity = async (data: {
  userId: string;
  type: string;
  name: string;
  description: string;
  duration: number;
}): Promise<Activity> => {
  await new Promise((resolve) => setTimeout(resolve, 500));

  const newActivity: Activity = {
    id: Math.random().toString(36).substr(2, 9),
    userId: data.userId,
    type: data.type,
    name: data.name,
    description: data.description,
    timestamp: new Date(),
    duration: data.duration,
    completed: true,
    moodScore: null,
    moodNote: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  activities = [newActivity, ...activities];
  return newActivity;
};
