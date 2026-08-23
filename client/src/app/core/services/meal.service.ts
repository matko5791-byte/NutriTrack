import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { CreateFoodPayload, DailyMealsSummary, Food } from '../models/food.model';

@Injectable({
    providedIn: 'root'
})
export class MealService {
    private readonly foodsUrl = '/api/foods';
    private readonly mealEntriesUrl = '/api/meal-entries';

    constructor(private http: HttpClient) { }

    getFoods(): Observable<{ foods: Food[] }> {
        return this.http.get<{ foods: Food[] }>(this.foodsUrl);
    }

    createFood(payload: CreateFoodPayload): Observable<{ message: string; food: Food }> {
        return this.http.post<{ message: string; food: Food }>(this.foodsUrl, payload);
    }

    getTodaysMeals(): Observable<DailyMealsSummary> {
        return this.http.get<DailyMealsSummary>(this.mealEntriesUrl);
    }

    logMeal(foodId: string, grams: number): Observable<DailyMealsSummary & { message: string }> {
        return this.http.post<DailyMealsSummary & { message: string }>(this.mealEntriesUrl, { foodId, grams });
    }

    deleteMeal(entryId: string): Observable<DailyMealsSummary & { message: string }> {
        return this.http.delete<DailyMealsSummary & { message: string }>(`${this.mealEntriesUrl}/${entryId}`);
    }
}
