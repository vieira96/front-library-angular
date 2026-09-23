import { Injectable, inject } from '@angular/core';
import { HttpBackend, HttpClient } from '@angular/common/http';
import { Observable, catchError, finalize, shareReplay, tap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AccessTokenResponse } from './access-token-response.model';
import { AccessTokenStoreService } from './access-token-store.service';

@Injectable({ providedIn: 'root' })
export class SessionRefreshService {
  private readonly http = new HttpClient(inject(HttpBackend));
  private readonly accessTokenStore = inject(AccessTokenStoreService);
  private readonly refreshUrl = `${environment.apiBaseUrl}/auth/refresh`;

  private refreshRequest$: Observable<AccessTokenResponse> | null = null;

  refresh(): Observable<AccessTokenResponse> {
    if (!this.refreshRequest$) {
      this.refreshRequest$ = this.http.post<AccessTokenResponse>(this.refreshUrl, {}, {
        withCredentials: true,
      }).pipe(
        tap((response) => this.accessTokenStore.set(response.accessToken)),
        catchError((error) => {
          this.accessTokenStore.clear();
          return throwError(() => error);
        }),
        finalize(() => {
          this.refreshRequest$ = null;
        }),
        shareReplay({ bufferSize: 1, refCount: false }),
      );
    }

    return this.refreshRequest$;
  }
}
