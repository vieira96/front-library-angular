import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, map, of } from 'rxjs';
import { AuthApiService } from './auth-api.service';
import { User } from '@/app/core/user/user.model';
import { AccessTokenStoreService } from './access-token-store.service';
import { SessionRefreshService } from './session-refresh.service';
import { AccessTokenResponse } from './access-token-response.model';

@Injectable({ providedIn: 'root' })
export class AuthStateService {
  private readonly authApi = inject(AuthApiService);
  private readonly router = inject(Router);
  private readonly accessTokenStore = inject(AccessTokenStoreService);
  private readonly sessionRefresh = inject(SessionRefreshService);
  private readonly currentUser = signal<User | null>(null);

  readonly isAuthenticated = computed(() => !!this.accessTokenStore.token());
  readonly user = this.currentUser.asReadonly();

  getAccessToken(): string | null {
    return this.accessTokenStore.token();
  }

  setSession(session: AccessTokenResponse): void {
    this.accessTokenStore.set(session.accessToken);
    this.currentUser.set(session.user);
  }

  restoreSession(): Observable<void> {
    if (this.accessTokenStore.token() && this.currentUser()) {
      return of(void 0);
    }

    return this.sessionRefresh.refresh().pipe(
      map((session) => {
        this.currentUser.set(session.user);
      }),
    );
  }

  logout(): void {
    this.authApi.logout().subscribe({
      next: () => this.clearSession(),
      error: () => this.clearSession(),
    });
  }

  private clearSession(): void {
    this.accessTokenStore.clear();
    this.currentUser.set(null);
    this.router.navigate(['/auth/login']);
  }
}
