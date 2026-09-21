import { Component, ChangeDetectionStrategy, inject, OnInit, signal } from '@angular/core';
import { BookCard } from '@/app/features/books/book-card/book-card';
import { BooksApiService } from '@/app/features/books/books-api.service';
import { Book } from '@/app/features/books/book.model';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [BookCard, RouterLink],
  templateUrl: './dashboard.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminDashboard implements OnInit {
  private readonly booksApi = inject(BooksApiService);

  readonly books = signal<Book[]>([]);
  readonly isLoading = signal(true);
  readonly errorMessage = signal<string | null>(null);
  readonly totalBooks = signal(0);

  ngOnInit(): void {
    this.loadBooks();
  }

  private loadBooks(): void {
    this.isLoading.set(true);
    this.booksApi.getBooks(1, 3).subscribe({
      next: (response) => {
        this.books.set(response.content);
        this.isLoading.set(false);
        this.totalBooks.set(response.totalElements);
      },
      error: () => {
        this.errorMessage.set('Não foi possível carregar os livros.');
        this.isLoading.set(false);
      },
    });
  }
}
