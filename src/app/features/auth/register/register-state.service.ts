import { Injectable, signal, inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError, tap } from 'rxjs';
import { RegisterApiService } from './register-api.service';
import { RegisterRequest } from './register-request.model';

@Injectable({ providedIn: 'root' })
export class RegisterStateService {
  private readonly registerApi = inject(RegisterApiService);
  private readonly router = inject(Router);

  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  register(data: RegisterRequest): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.registerApi.register(data).pipe(
      tap(() => {
        this.isLoading.set(false);
        this.router.navigate(['/auth/login']);
      }),
      catchError((error) => {
        const message = error.error?.message || 'Erro ao criar conta';
        this.errorMessage.set(message);
        this.isLoading.set(false);
        return throwError(() => new Error(message));
      }),
    ).subscribe();
  }
}
