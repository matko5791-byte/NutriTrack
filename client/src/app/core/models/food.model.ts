export interface FoodServing {
    _id: string;
    name: string;
    grams: number;
    isCustom: boolean;
}

export interface CreateServingPayload {
    name: string;
    grams: number;
}

export interface Food {
    _id: string;
    name: string;
    caloriesPer100g: number;
    proteinPer100g: number;
    carbsPer100g: number;
    fatPer100g: number;
    saltPer100g: number;
    userId?: string;
    servings?: FoodServing[];
}

export interface CreateFoodPayload {
    name: string;
    caloriesPer100g: number;
    proteinPer100g: number;
    carbsPer100g: number;
    fatPer100g: number;
    saltPer100g: number;
}

export interface MealEntry {
    _id: string;
    foodId: string;
    foodName: string;
    grams: number;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    salt: number;
    loggedAt: string;
}

export interface NutritionTotals {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    salt: number;
}

export interface DailyMealsSummary {
    entries: MealEntry[];
    totals: NutritionTotals;
    dailyCalorieGoal: number | null;
}
