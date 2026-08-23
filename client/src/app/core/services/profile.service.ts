import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Profile, ProfilePayload, WeightEntry } from '../models/profile.model';

@Injectable({
    providedIn: 'root'
})
export class ProfileService {
    private readonly profileUrl = '/api/profile';
    private readonly weightUrl = '/api/weight';

    constructor(private http: HttpClient) { }

    getProfile(): Observable<{ profile: Profile | null }> {
        return this.http.get<{ profile: Profile | null }>(`${this.profileUrl}/me`);
    }

    saveProfile(payload: ProfilePayload): Observable<{ message: string; profile: Profile }> {
        return this.http.put<{ message: string; profile: Profile }>(`${this.profileUrl}/me`, payload);
    }

    deleteProfile(): Observable<{ message: string }> {
        return this.http.delete<{ message: string }>(`${this.profileUrl}/me`);
    }

    getWeightHistory(): Observable<{ entries: WeightEntry[] }> {
        return this.http.get<{ entries: WeightEntry[] }>(this.weightUrl);
    }

    addWeightEntry(weightKg: number): Observable<{ message: string; entry: WeightEntry; profile: Profile }> {
        return this.http.post<{ message: string; entry: WeightEntry; profile: Profile }>(this.weightUrl, { weightKg });
    }
}
