import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { ProfileService } from '../../core/services/profile.service';
import { MealService } from '../../core/services/meal.service';
import { Profile, WeightEntry } from '../../core/models/profile.model';
import { NutritionTotals } from '../../core/models/food.model';
import { WeightChartComponent } from '../../shared/weight-chart/weight-chart.component';

@Component({
  selector: 'app-home',
  imports: [CommonModule, ReactiveFormsModule, WeightChartComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  private profileService = inject(ProfileService);
  private mealService = inject(MealService);
  private fb = inject(FormBuilder);
  private router = inject(Router);

  profile = signal<Profile | null>(null);
  weightEntries = signal<WeightEntry[]>([]);
  totals = signal<NutritionTotals>({ calories: 0, protein: 0, carbs: 0, fat: 0, salt: 0 });
  isLoading = signal(true);

  weightForm = this.fb.group({
    weightKg: [null as number | null, [Validators.required, Validators.min(30), Validators.max(300)]]
  });

  weightErrorMessage: string | null = null;
  isLoggingWeight = false;

  currentWeight = computed(() => {
    const entries = this.weightEntries();
    return entries.length > 0 ? entries[entries.length - 1].weightKg : null;
  });

  caloriePercent = computed(() => {
    const goal = this.profile()?.dailyCalorieGoal;
    if (!goal) {
      return 0;
    }
    return Math.min(100, Math.round((this.totals().calories / goal) * 100));
  });

  isOverGoal = computed(() => {
    const goal = this.profile()?.dailyCalorieGoal;
    return !!goal && this.totals().calories > goal;
  });

  ngOnInit(): void {
    this.profileService.getProfile().subscribe({
      next: ({ profile }) => {
        if (!profile) {
          this.router.navigate(['/complete-profile']);
          return;
        }
        this.profile.set(profile);
        this.loadWeightHistory();
        this.loadTodaysTotals();
      },
      error: () => this.isLoading.set(false)
    });
  }

  private loadWeightHistory(): void {
    this.profileService.getWeightHistory().subscribe({
      next: ({ entries }) => {
        this.weightEntries.set(entries);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  private loadTodaysTotals(): void {
    this.mealService.getTodaysMeals().subscribe({
      next: (summary) => this.totals.set(summary.totals)
    });
  }

  logWeight(): void {
    if (this.weightForm.invalid) {
      this.weightForm.markAllAsTouched();
      return;
    }

    this.weightErrorMessage = null;
    this.isLoggingWeight = true;

    const weightKg = this.weightForm.getRawValue().weightKg!;

    this.profileService.addWeightEntry(weightKg).subscribe({
      next: ({ profile }) => {
        this.isLoggingWeight = false;
        this.profile.set(profile);
        this.weightForm.reset();
        this.loadWeightHistory();
      },
      error: (err) => {
        this.isLoggingWeight = false;
        this.weightErrorMessage = err?.error?.message ?? 'Logging your weight failed.';
      }
    });
  }
}
