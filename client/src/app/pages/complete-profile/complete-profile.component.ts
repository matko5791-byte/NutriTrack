import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../core/services/auth.service';
import { ProfileService } from '../../core/services/profile.service';

@Component({
  selector: 'app-complete-profile',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './complete-profile.component.html',
  styleUrl: './complete-profile.component.scss'
})
export class CompleteProfileComponent {
  private fb = inject(FormBuilder);
  private profileService = inject(ProfileService);
  private authService = inject(AuthService);
  private router = inject(Router);

  form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    gender: ['', [Validators.required]],
    age: [null as number | null, [Validators.required, Validators.min(10), Validators.max(100)]],
    heightCm: [null as number | null, [Validators.required, Validators.min(100), Validators.max(250)]],
    weightKg: [null as number | null, [Validators.required, Validators.min(30), Validators.max(300)]],
    activityLevel: ['', [Validators.required]],
    goal: ['', [Validators.required]]
  });

  errorMessage: string | null = null;
  isSubmitting = false;

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.errorMessage = null;
    this.isSubmitting = true;

    const raw = this.form.getRawValue();

    this.profileService.saveProfile({
      name: raw.name!,
      gender: raw.gender as 'male' | 'female' | 'other',
      age: raw.age!,
      heightCm: raw.heightCm!,
      weightKg: raw.weightKg!,
      activityLevel: raw.activityLevel as 'sedentary' | 'light' | 'moderate' | 'active',
      goal: raw.goal as 'muscle_gain' | 'weight_loss' | 'maintenance'
    }).subscribe({
      next: ({ profile }) => {
        this.isSubmitting = false;
        this.authService.markProfileCompleted(profile.name);
        this.router.navigate(['/home']);
      },
      error: (err) => {
        this.isSubmitting = false;
        this.errorMessage = err?.error?.message ?? 'Saving your profile failed. Please try again.';
      }
    });
  }
}
