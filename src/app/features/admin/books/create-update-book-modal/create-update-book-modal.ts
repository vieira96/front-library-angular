import { Component, ChangeDetectionStrategy, computed, signal, input, output, inject, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { BooksApiService } from '@/app/features/books/books-api.service';
import { Book } from '@/app/features/books/book.model';
import { AuthorSelect } from '@/app/shared/ui/author-select/author-select';
import { CreateUpdateAuthorModal } from '@/app/features/admin/authors/create-update-author-modal/create-update-author-modal';
import { LucideX } from '@lucide/angular';

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
  selector: 'app-create-update-book-modal',
  standalone: true,
  imports: [ReactiveFormsModule, AuthorSelect, CreateUpdateAuthorModal, LucideX],
  templateUrl: './create-update-book-modal.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateUpdateBookModal implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly booksApi: BooksApiService = inject(BooksApiService);

  @ViewChild('authorSelect') authorSelect!: AuthorSelect;

  readonly book = input<Book | null>(null);
  readonly cancel = output<void>();
  readonly success = output<void>();

  readonly isUpdate = computed(() => !!this.book());
  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly isAuthorModalOpen = signal(false);

  readonly form = this.formBuilder.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
    isbn: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(20)]],
    publishDate: ['', [Validators.required, notFutureDate()]],
    gender: ['', [Validators.required]],
    price: [null as number | null, [Validators.required, Validators.min(1)]],
    authorId: ['', [Validators.required]],
  });

  get title() {
    return this.form.get('title');
  }

  get isbn() {
    return this.form.get('isbn');
  }

  get publishDate() {
    return this.form.get('publishDate');
  }

  get gender() {
    return this.form.get('gender');
  }

  get price() {
    return this.form.get('price');
  }

  get authorId() {
    return this.form.get('authorId');
  }

  ngOnInit(): void {
    const book = this.book();
    if (book) {
      this.form.patchValue({
        title: book.title,
        isbn: book.isbn,
        publishDate: book.publishDate,
        gender: book.gender,
        price: book.price,
        authorId: book.author.id,
      });
      this.formatPrice();
    }
  }

  onAuthorChange(value: string): void {
    this.authorId?.setValue(value);
    this.authorId?.markAsTouched();
  }

  onCreateNewAuthor(): void {
    this.isAuthorModalOpen.set(true);
  }

  onAuthorCreated(authorId: string): void {
    this.isAuthorModalOpen.set(false);
    this.authorId?.setValue(authorId);
    this.authorId?.markAsTouched();
    this.authorSelect.reloadAndSelect(authorId);
  }

  onAuthorModalCancel(): void {
    this.isAuthorModalOpen.set(false);
  }

  onPriceInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const digits = input.value.replace(/\D/g, '');
    const cents = parseInt(digits, 10) || 0;
    const value = cents / 100;

    this.price?.setValue(value);
    this.price?.markAsTouched();

    input.value = this.formatCurrency(value);
  }

  formatPrice(): void {
    const value = this.price?.value;
    const input = document.getElementById('price') as HTMLInputElement | null;
    if (input && value != null) {
      input.value = this.formatCurrency(value);
    }
  }

  private formatCurrency(value: number): string {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const request = {
      ...this.form.getRawValue(),
      price: this.form.getRawValue().price!,
    };
    const book = this.book();

    const observable = book
      ? this.booksApi.updateBook(book.id, request)
      : this.booksApi.createBook(request);

    observable.subscribe({
      next: () => {
        this.isLoading.set(false);
        this.success.emit();
      },
      error: (err: any) => {
        this.errorMessage.set(err.error?.message || 'Não foi possível salvar o livro.');
        this.isLoading.set(false);
      },
    });
  }
}
