import { Component, ChangeDetectionStrategy, signal, inject, OnInit } from '@angular/core';
import { LucideLoader } from '@lucide/angular';
import { AuthStateService } from '@/app/core/auth/auth-state.service';
import { BooksApiService } from '@/app/features/books/books-api.service';
import { Book } from '@/app/features/books/book.model';
import { Pagination } from '@/app/shared/ui/pagination/pagination';
import { BooksTable } from './books-table/books-table';

@Component({
  selector: 'app-admin-books',
  standalone: true,
  imports: [LucideLoader, Pagination, BooksTable],
  templateUrl: './books.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Books implements OnInit {
  private readonly authState = inject(AuthStateService);
  private readonly booksApi = inject(BooksApiService);

  readonly isLoading = signal(true);
  readonly errorMessage = signal<string | null>(null);
  readonly books = signal<Book[]>([]);
  readonly isBooksLoading = signal(false);
  readonly booksErrorMessage = signal<string | null>(null);
  readonly currentPage = signal(1);
  readonly totalPages = signal(0);

  ngOnInit(): void {
    this.authState.restoreSession().subscribe({
      next: () => {
        this.isLoading.set(false);
        this.loadBooks();
      },
      error: (err: Error) => {
        this.errorMessage.set(err.message);
        this.isLoading.set(false);
        this.authState.logout();
      },
    });
  }

  changePage(page: number): void {
    if (page < 1 || page > this.totalPages() || page === this.currentPage()) {
      return;
    }

    this.loadBooks(page);
  }

  loadBooks(page = this.currentPage()): void {
    this.isBooksLoading.set(true);
    this.booksErrorMessage.set(null);

    this.booksApi.getBooks(page, 10).subscribe({
      next: (response) => {
        this.books.set(response.content);
        this.currentPage.set(response.page);
        this.totalPages.set(response.totalPages);
        this.isBooksLoading.set(false);
      },
      error: () => {
        this.booksErrorMessage.set('Não foi possível carregar os livros.');
        this.isBooksLoading.set(false);
      },
    });
  }
}
