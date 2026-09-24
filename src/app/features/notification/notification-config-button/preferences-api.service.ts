import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface Preference {
  userId: string;
  type: string;
  enabled: boolean;
  updatedAt: string;
}

@Injectable({ providedIn: 'root' })
export class PreferencesApiService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.notificationsApiBaseUrl}/my-preferences`;

  getMyPreferences(): Observable<Preference[]> {
    return this.http.get<Preference[]>(this.apiUrl);
  }

  updateMyPreference(type: string, enabled: boolean): Observable<Preference> {
    return this.http.patch<Preference>(`${this.apiUrl}/update-preference`, { type, enabled });
  }
}
