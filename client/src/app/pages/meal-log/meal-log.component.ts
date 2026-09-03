import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';

import { MealService } from '../../core/services/meal.service';
import { ProfileService } from '../../core/services/profile.service';
import { Food, FoodServing, MealEntry } from '../../core/models/food.model';
import { Goal } from '../../core/models/profile.model';

interface UnitOption {
  id: string;
  label: string;
  grams: number;
  isCustom: boolean;
}

@Component({
  selector: 'app-meal-log',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './meal-log.component.html',
  styleUrl: './meal-log.component.scss'
})
export class MealLogComponent implements OnInit {
  private mealService = inject(MealService);
  private profileService = inject(ProfileService);
  private fb = inject(FormBuilder);

  foods = signal<Food[]>([]);
  entries = signal<MealEntry[]>([]);
  isLoading = signal(true);
  goal = signal<Goal | null>(null);

  showFoodPicker = signal(false);
  searchTerm = signal('');
  selectedFood = signal<Food | null>(null);

  errorMessage: string | null = null;
  isSubmitting = false;

  selectedUnitId = signal<string>('grams');
  quantity = signal<number | null>(null);
  quantityTouched = signal(false);

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

  showAddServingForm = signal(false);
  addServingErrorMessage: string | null = null;
  isAddingServing = false;

  addServingForm = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(40)]],
    grams: [null as number | null, [Validators.required, Validators.min(1), Validators.max(2000)]]
  });

  filteredFoods = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const foods = this.foods();
    return term ? foods.filter(food => food.name.toLowerCase().includes(term)) : foods;
  });

  recommendedFoods = computed<Food[]>(() => {
    const foods = this.foods();
    const goal = this.goal();
    if (!goal || foods.length === 0) {
      return [];
    }

    const sorted = [...foods];
    if (goal === 'muscle_gain') {
      sorted.sort((a, b) => b.proteinPer100g - a.proteinPer100g);
    } else if (goal === 'weight_loss') {
      sorted.sort((a, b) => a.caloriesPer100g - b.caloriesPer100g);
    } else {
      sorted.sort((a, b) => (b.proteinPer100g / (b.caloriesPer100g || 1)) - (a.proteinPer100g / (a.caloriesPer100g || 1)));
    }
    return sorted.slice(0, 6);
  });

  recommendationLabel = computed<string>(() => {
    switch (this.goal()) {
      case 'muscle_gain': return 'High-protein picks for building muscle';
      case 'weight_loss': return 'Low-calorie picks for weight loss';
      case 'maintenance': return 'Balanced picks for maintaining weight';
      default: return '';
    }
  });

  availableUnits = computed<UnitOption[]>(() => {
    const food = this.selectedFood();
    const units: UnitOption[] = [{ id: 'grams', label: 'Grams (g)', grams: 1, isCustom: false }];
    for (const serving of food?.servings ?? []) {
      units.push({ id: serving._id, label: serving.name, grams: serving.grams, isCustom: serving.isCustom });
    }
    return units;
  });

  selectedUnit = computed<UnitOption>(() => {
    return this.availableUnits().find(unit => unit.id === this.selectedUnitId()) ?? this.availableUnits()[0];
  });

  computedGrams = computed<number | null>(() => {
    const qty = this.quantity();
    if (qty === null || qty === undefined) {
      return null;
    }
    return Math.round(qty * this.selectedUnit().grams);
  });

  isQuantityValid = computed<boolean>(() => {
    const grams = this.computedGrams();
    return grams !== null && grams >= 1 && grams <= 5000;
  });

  quantityError = computed<string | null>(() => {
    if (!this.quantityTouched()) {
      return null;
    }
    return this.isQuantityValid() ? null : 'Total amount must be between 1 and 5000 g.';
  });

  customServings = computed<FoodServing[]>(() => (this.selectedFood()?.servings ?? []).filter(serving => serving.isCustom));

  ngOnInit(): void {
    this.mealService.getFoods().subscribe({
      next: ({ foods }) => this.foods.set(foods)
    });

    this.profileService.getProfile().subscribe({
      next: ({ profile }) => this.goal.set(profile?.goal ?? null)
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
    const firstServing = food.servings?.[0];
    this.selectedUnitId.set(firstServing ? firstServing._id : 'grams');
    this.quantity.set(firstServing ? 1 : null);
    this.quantityTouched.set(false);
    this.errorMessage = null;
    this.closeAddServingForm();
  }

  backToSearch(): void {
    this.selectedFood.set(null);
  }

  selectUnit(unitId: string): void {
    this.selectedUnitId.set(unitId);
    const unit = this.availableUnits().find(candidate => candidate.id === unitId);
    this.quantity.set(unit && unit.id !== 'grams' ? 1 : null);
    this.quantityTouched.set(false);
  }

  updateQuantity(value: string): void {
    const parsed = value === '' ? null : Number(value);
    this.quantity.set(parsed !== null && Number.isFinite(parsed) ? parsed : null);
  }

  submit(): void {
    this.quantityTouched.set(true);

    const grams = this.computedGrams();
    if (!this.isQuantityValid() || grams === null) {
      return;
    }

    const food = this.selectedFood();
    if (!food) {
      return;
    }

    this.errorMessage = null;
    this.isSubmitting = true;

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

  openAddServingForm(): void {
    this.showAddServingForm.set(true);
    this.addServingErrorMessage = null;
  }

  closeAddServingForm(): void {
    this.showAddServingForm.set(false);
    this.addServingForm.reset();
  }

  submitAddServing(): void {
    if (this.addServingForm.invalid) {
      this.addServingForm.markAllAsTouched();
      return;
    }

    const food = this.selectedFood();
    if (!food) {
      return;
    }

    this.addServingErrorMessage = null;
    this.isAddingServing = true;

    const raw = this.addServingForm.getRawValue();

    this.mealService.addServing(food._id, { name: raw.name!, grams: raw.grams! }).subscribe({
      next: ({ serving }) => {
        this.isAddingServing = false;
        const updatedFood = { ...food, servings: [...(food.servings ?? []), serving] };
        this.selectedFood.set(updatedFood);
        this.foods.update(foods => foods.map(existing => existing._id === food._id ? updatedFood : existing));
        this.selectUnit(serving._id);
        this.closeAddServingForm();
      },
      error: (err) => {
        this.isAddingServing = false;
        this.addServingErrorMessage = err?.error?.message ?? 'Adding the serving failed.';
      }
    });
  }

  removeServing(servingId: string): void {
    const food = this.selectedFood();
    if (!food) {
      return;
    }

    const confirmed = window.confirm('Remove this custom serving?');
    if (!confirmed) {
      return;
    }

    this.mealService.deleteServing(food._id, servingId).subscribe({
      next: () => {
        const updatedFood = { ...food, servings: (food.servings ?? []).filter(serving => serving._id !== servingId) };
        this.selectedFood.set(updatedFood);
        this.foods.update(foods => foods.map(existing => existing._id === food._id ? updatedFood : existing));
        if (this.selectedUnitId() === servingId) {
          this.selectUnit('grams');
        }
      }
    });
  }
}

