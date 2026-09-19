import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { LucideLoader } from '@lucide/angular';
import { LoginStateService } from './login-state.service';
import { Toast } from '@/app/shared/ui/toast/toast';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, LucideLoader, Toast],
  templateUrl: './login.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Login {
  private readonly formBuilder = inject(FormBuilder);
  private readonly loginState = inject(LoginStateService);
  private readonly router = inject(Router);

  readonly successMessage = signal<string | null>(
    this.router.getCurrentNavigation()?.extras.state?.['successMessage'] ?? null,
  );

  readonly loginForm = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  get isLoading() {
    return this.loginState.isLoading;
  }

  get errorMessage() {
    return this.loginState.errorMessage;
  }

  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }
    this.loginState.login(this.loginForm.getRawValue());
  }

  dismissSuccessMessage(): void {
    this.successMessage.set(null);
  }
}
