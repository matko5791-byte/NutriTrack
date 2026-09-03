import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../core/services/auth.service';
import { ProfileService } from '../../core/services/profile.service';
import { ActivityLevel, Goal, Profile } from '../../core/models/profile.model';

@Component({
  selector: 'app-profile',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit {
  private authService = inject(AuthService);
  private profileService = inject(ProfileService);
  private fb = inject(FormBuilder);
  private router = inject(Router);

  profile = signal<Profile | null>(null);
  isLoading = signal(true);

  settingsForm = this.fb.group({
    activityLevel: ['', [Validators.required]],
    goal: ['', [Validators.required]]
  });

  saveErrorMessage: string | null = null;
  isSaving = false;
  saveSuccess = false;

  deleteErrorMessage: string | null = null;
  isDeleting = false;

  ngOnInit(): void {
    this.profileService.getProfile().subscribe({
      next: ({ profile }) => {
        if (!profile) {
          this.router.navigate(['/complete-profile']);
          return;
        }
        this.profile.set(profile);
        this.settingsForm.patchValue({ activityLevel: profile.activityLevel, goal: profile.goal });
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  saveSettings(): void {
    if (this.settingsForm.invalid) {
      this.settingsForm.markAllAsTouched();
      return;
    }

    const currentProfile = this.profile();
    if (!currentProfile) {
      return;
    }

    this.saveErrorMessage = null;
    this.saveSuccess = false;
    this.isSaving = true;

    const { activityLevel, goal } = this.settingsForm.getRawValue();

    this.profileService.saveProfile({
      name: currentProfile.name,
      gender: currentProfile.gender,
      age: currentProfile.age,
      heightCm: currentProfile.heightCm,
      weightKg: currentProfile.weightKg,
      activityLevel: activityLevel as ActivityLevel,
      goal: goal as Goal
    }).subscribe({
      next: ({ profile }) => {
        this.isSaving = false;
        this.saveSuccess = true;
        this.profile.set(profile);
      },
      error: (err) => {
        this.isSaving = false;
        this.saveErrorMessage = err?.error?.message ?? 'Updating your activity level failed.';
      }
    });
  }

  deleteProfile(): void {
    const confirmed = window.confirm('Are you sure you want to delete your profile?');
    if (!confirmed) {
      return;
    }

    this.deleteErrorMessage = null;
    this.isDeleting = true;

    this.profileService.deleteProfile().subscribe({
      next: () => {
        this.isDeleting = false;
        this.authService.clearProfile();
        this.router.navigate(['/complete-profile']);
      },
      error: (err) => {
        this.isDeleting = false;
        this.deleteErrorMessage = err?.error?.message ?? 'Deleting your profile failed.';
      }
    });
  }
}
