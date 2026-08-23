import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';

import { MealService } from '../../core/services/meal.service';
import { Food, MealEntry } from '../../core/models/food.model';

@Component({
  selector: 'app-meal-log',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './meal-log.component.html',
  styleUrl: './meal-log.component.scss'
})
export class MealLogComponent implements OnInit {
  private mealService = inject(MealService);
  private fb = inject(FormBuilder);

  foods = signal<Food[]>([]);
  entries = signal<MealEntry[]>([]);
  isLoading = signal(true);

  showFoodPicker = signal(false);
  searchTerm = signal('');
  selectedFood = signal<Food | null>(null);

  errorMessage: string | null = null;
  isSubmitting = false;

  gramsForm = this.fb.group({
    grams: [null as number | null, [Validators.required, Validators.min(1), Validators.max(5000)]]
  });

  showCreateFoodForm = signal(false);
  createFoodErrorMessage: string | null = null;
  isCreatingFood = false;

  createFoodForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    caloriesPer100g: [null as number | null, [Validators.required, Validators.min(0), Validators.max(900)]],
    proteinPer100g: [null as number | null, [Validators.required, Validators.min(0), Validators.max(100)]],
    carbsPer100g: [null as number | null, [Validators.required, Validators.min(0), Validators.max(100)]],
    fatPer100g: [null as number | null, [Validators.required, Validators.min(0), Validators.max(100)]],
    saltPer100g: [null as number | null, [Validators.required, Validators.min(0), Validators.max(100)]]
  });

  filteredFoods = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const foods = this.foods();
    return term ? foods.filter(food => food.name.toLowerCase().includes(term)) : foods;
  });

  ngOnInit(): void {
    this.mealService.getFoods().subscribe({
      next: ({ foods }) => this.foods.set(foods)
    });

    this.loadTodaysMeals();
  }

  private loadTodaysMeals(): void {
    this.isLoading.set(true);
    this.mealService.getTodaysMeals().subscribe({
      next: (summary) => {
        this.entries.set(summary.entries);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  openFoodPicker(): void {
    this.showFoodPicker.set(true);
    this.searchTerm.set('');
    this.selectedFood.set(null);
  }

  updateSearch(value: string): void {
    this.searchTerm.set(value);
  }

  closeFoodPicker(): void {
    this.showFoodPicker.set(false);
    this.selectedFood.set(null);
    this.closeCreateFoodForm();
  }

  selectFood(food: Food): void {
    this.selectedFood.set(food);
    this.gramsForm.reset();
    this.errorMessage = null;
  }

  backToSearch(): void {
    this.selectedFood.set(null);
  }

  submit(): void {
    if (this.gramsForm.invalid) {
      this.gramsForm.markAllAsTouched();
      return;
    }

    const food = this.selectedFood();
    if (!food) {
      return;
    }

    this.errorMessage = null;
    this.isSubmitting = true;

    const grams = this.gramsForm.getRawValue().grams!;

    this.mealService.logMeal(food._id, grams).subscribe({
      next: (summary) => {
        this.isSubmitting = false;
        this.entries.set(summary.entries);
        this.closeFoodPicker();
      },
      error: (err) => {
        this.isSubmitting = false;
        this.errorMessage = err?.error?.message ?? 'Logging the meal failed.';
      }
    });
  }

  removeEntry(entryId: string): void {
    this.mealService.deleteMeal(entryId).subscribe({
      next: (summary) => this.entries.set(summary.entries)
    });
  }

  openCreateFoodForm(): void {
    this.showCreateFoodForm.set(true);
    this.createFoodErrorMessage = null;
  }

  closeCreateFoodForm(): void {
    this.showCreateFoodForm.set(false);
    this.createFoodForm.reset();
  }

  submitCreateFood(): void {
    if (this.createFoodForm.invalid) {
      this.createFoodForm.markAllAsTouched();
      return;
    }

    this.createFoodErrorMessage = null;
    this.isCreatingFood = true;

    const raw = this.createFoodForm.getRawValue();

    this.mealService.createFood({
      name: raw.name!,
      caloriesPer100g: raw.caloriesPer100g!,
      proteinPer100g: raw.proteinPer100g!,
      carbsPer100g: raw.carbsPer100g!,
      fatPer100g: raw.fatPer100g!,
      saltPer100g: raw.saltPer100g!
    }).subscribe({
      next: ({ food }) => {
        this.isCreatingFood = false;
        this.foods.update(foods => [...foods, food]);
        this.closeCreateFoodForm();
      },
      error: (err) => {
        this.isCreatingFood = false;
        this.createFoodErrorMessage = err?.error?.message ?? 'Creating the food failed.';
      }
    });
  }
}
