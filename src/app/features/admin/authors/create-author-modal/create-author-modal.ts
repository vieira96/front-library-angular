import { Component, ChangeDetectionStrategy, signal, output, inject } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { AuthorsApiService } from '../authors-api.service';

function notFutureDate(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null;
    }

    const selectedDate = new Date(control.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return selectedDate > today ? { futureDate: true } : null;
  };
}

@Component({
  selector: 'app-create-author-modal',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './create-author-modal.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateAuthorModal {
  private readonly formBuilder = inject(FormBuilder);
  private readonly authorsApi = inject(AuthorsApiService);

  readonly cancel = output<void>();
  readonly success = output<void>();

  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly form = this.formBuilder.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
    birthdate: ['', [Validators.required, notFutureDate()]],
    nationality: ['', [Validators.required, Validators.maxLength(100)]],
  });

  get name() {
    return this.form.get('name');
  }

  get birthdate() {
    return this.form.get('birthdate');
  }

  get nationality() {
    return this.form.get('nationality');
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.authorsApi.createAuthor(this.form.getRawValue()).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.success.emit();
      },
      error: (err) => {
        this.errorMessage.set(err.error?.message || 'Não foi possível criar o autor.');
        this.isLoading.set(false);
      },
    });
  }
}
