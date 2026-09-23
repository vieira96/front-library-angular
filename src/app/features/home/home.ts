import { Component, ChangeDetectionStrategy, signal, inject, OnInit } from '@angular/core';
import { LucideLoader } from '@lucide/angular';
import { AuthStateService } from '@/app/core/auth/auth-state.service';
import { Header } from '@/app/layout/header/header';
import { BooksApiService } from '@/app/features/books/books-api.service';
import { Book } from '@/app/features/books/book.model';
import { BookCard } from '@/app/features/books/book-card/book-card';
import { Pagination } from '@/app/shared/ui/pagination/pagination';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [BookCard, Header, LucideLoader, Pagination],
  templateUrl: './home.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Home implements OnInit {
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

  private loadBooks(page = this.currentPage()): void {
    this.isBooksLoading.set(true);
    this.booksErrorMessage.set(null);

    this.booksApi.getBooks(page).subscribe({
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
