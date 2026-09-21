import { Component, ChangeDetectionStrategy, signal, input, output, inject } from '@angular/core';
import { Book } from '@/app/features/books/book.model';
import { BooksApiService } from '@/app/features/books/books-api.service';

@Component({
  selector: 'app-delete-book-modal',
  standalone: true,
  templateUrl: './delete-book-modal.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeleteBookModal {
  private readonly booksApi = inject(BooksApiService);

  readonly book = input.required<Book>();
  readonly cancel = output<void>();
  readonly success = output<void>();

  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  confirm(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.booksApi.deleteBook(this.book().id).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.success.emit();
      },
      error: (err) => {
        this.errorMessage.set(err.error?.message || 'Não foi possível excluir o livro.');
        this.isLoading.set(false);
      },
    });
  }
}
