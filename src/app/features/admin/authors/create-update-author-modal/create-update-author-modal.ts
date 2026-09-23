import { Component, ChangeDetectionStrategy, computed, signal, input, output, inject, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { AuthorsApiService } from '../authors-api.service';
import { Author } from '../author.model';
import { CountryInput } from '../../../../shared/ui/country-input/country-input';

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
  selector: 'app-create-update-author-modal',
  standalone: true,
  imports: [ReactiveFormsModule, CountryInput],
  templateUrl: './create-update-author-modal.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateUpdateAuthorModal implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly authorsApi = inject(AuthorsApiService);

  readonly author = input<Author | null>(null);
  readonly cancel = output<void>();
  readonly success = output<string>();

  readonly isUpdate = computed(() => !!this.author());
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

  ngOnInit(): void {
    const author = this.author();
    if (author) {
      this.form.patchValue({
        name: author.name,
        birthdate: author.birthdate,
        nationality: author.nationality,
      });
    }
  }

  onNationalityChange(value: string): void {
    this.nationality?.setValue(value);
    this.nationality?.markAsTouched();
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const request = this.form.getRawValue();
    const author = this.author();

    const observable = author
      ? this.authorsApi.updateAuthor(author.id, request)
      : this.authorsApi.createAuthor(request);

    observable.subscribe({
      next: (author: Author) => {
        this.isLoading.set(false);
        this.success.emit(author.id);
      },
      error: (err) => {
        this.errorMessage.set(err.error?.message || 'Não foi possível salvar o autor.');
        this.isLoading.set(false);
      },
    });
  }
}
