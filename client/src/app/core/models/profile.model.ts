export type Gender = 'male' | 'female' | 'other';

export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active';

export type Goal = 'muscle_gain' | 'weight_loss' | 'maintenance';

export interface Profile {
    name: string;
    gender: Gender;
    age: number;
    heightCm: number;
    weightKg: number;
    activityLevel: ActivityLevel;
    goal: Goal;
    bmr: number;
    tdee: number;
    dailyCalorieGoal: number;
    updatedAt: string;
}

export interface ProfilePayload {
    name: string;
    gender: Gender;
    age: number;
    heightCm: number;
    weightKg: number;
    activityLevel: ActivityLevel;
    goal: Goal;
}

export interface WeightEntry {
    _id: string;
    userId: string;
    weightKg: number;
    date: string;
    createdAt: string;
}
