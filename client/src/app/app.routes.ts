import { Routes } from '@angular/router';

import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { HomeComponent } from './pages/home/home.component';
import { CompleteProfileComponent } from './pages/complete-profile/complete-profile.component';
import { MealLogComponent } from './pages/meal-log/meal-log.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { authGuard, guestGuard, completeProfileGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'login', component: LoginComponent, canActivate: [guestGuard] },
  { path: 'register', component: RegisterComponent, canActivate: [guestGuard] },
  { path: 'complete-profile', component: CompleteProfileComponent, canActivate: [completeProfileGuard] },
  { path: 'home', component: HomeComponent, canActivate: [authGuard] },
  { path: 'meals', component: MealLogComponent, canActivate: [authGuard] },
  { path: 'profile', component: ProfileComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: 'home' }
];
