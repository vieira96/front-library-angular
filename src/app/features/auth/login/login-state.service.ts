import { Injectable, signal, inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError, tap } from 'rxjs';
import { LoginApiService } from './login-api.service';
import { LoginRequest } from './login-request.model';
import { AuthStateService } from '../../../core/auth/auth-state.service';

@Injectable({ providedIn: 'root' })
export class LoginStateService {
  private readonly loginApi = inject(LoginApiService);
  private readonly authState = inject(AuthStateService);
  private readonly router = inject(Router);

  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  login(credentials: LoginRequest): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.loginApi.login(credentials).pipe(
      tap((response) => {
        this.authState.setSession(response);
        this.isLoading.set(false);
        this.router.navigate(['/']);
      }),
      catchError((error) => {
        const message = error.error?.message || 'Credenciais inválidas';
        this.errorMessage.set(message);
        this.isLoading.set(false);
        return throwError(() => new Error(message));
      }),
    ).subscribe();
  }
}
