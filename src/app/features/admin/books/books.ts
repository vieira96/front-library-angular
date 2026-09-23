import { DOCUMENT } from '@angular/common';
import { Component, ChangeDetectionStrategy, signal, inject, OnInit, OnDestroy } from '@angular/core';
import { LucideLoader, LucidePlus } from '@lucide/angular';
import { AuthStateService } from '../../../core/auth/auth-state.service';
import { BooksApiService } from '../../books/books-api.service';
import { Book } from '../../books/book.model';
import { Pagination } from '../../../shared/ui/pagination/pagination';
import { BooksTable } from './books-table/books-table';
import { Toast } from '../../../shared/ui/toast/toast';
import { CreateUpdateBookModal } from './create-update-book-modal/create-update-book-modal';

@Component({
  selector: 'app-admin-books',
  standalone: true,
  imports: [LucideLoader, LucidePlus, Pagination, BooksTable, Toast, CreateUpdateBookModal],
  templateUrl: './books.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Books implements OnInit, OnDestroy {
  private readonly authState = inject(AuthStateService);
  private readonly booksApi = inject(BooksApiService);
  private readonly document = inject(DOCUMENT);
  private previousBodyOverflow = '';

  readonly isLoading = signal(true);
  readonly errorMessage = signal<string | null>(null);
  readonly books = signal<Book[]>([]);
  readonly isBooksLoading = signal(false);
  readonly booksErrorMessage = signal<string | null>(null);
  readonly currentPage = signal(1);
  readonly totalPages = signal(0);
  readonly successMessage = signal<string | null>(null);

  readonly isCreateUpdateModalOpen = signal(false);
  readonly bookToEdit = signal<Book | null>(null);

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

  ngOnDestroy(): void {
    this.document.body.style.overflow = this.previousBodyOverflow;
  }

  changePage(page: number): void {
    if (page < 1 || page > this.totalPages() || page === this.currentPage()) {
      return;
    }

    this.loadBooks(page);
  }

  openCreateModal(): void {
    this.bookToEdit.set(null);
    this.isCreateUpdateModalOpen.set(true);
    this.previousBodyOverflow = this.document.body.style.overflow;
    this.document.body.style.overflow = 'hidden';
  }

  openEditModal(book: Book): void {
    this.bookToEdit.set(book);
    this.isCreateUpdateModalOpen.set(true);
    this.previousBodyOverflow = this.document.body.style.overflow;
    this.document.body.style.overflow = 'hidden';
  }

  closeModal(): void {
    this.isCreateUpdateModalOpen.set(false);
    this.bookToEdit.set(null);
    this.document.body.style.overflow = this.previousBodyOverflow;
  }

  onModalSuccess(): void {
    const isUpdate = !!this.bookToEdit();
    this.closeModal();
    this.successMessage.set(isUpdate ? 'Livro atualizado com sucesso.' : 'Livro cadastrado com sucesso.');
    this.loadBooks(this.currentPage());
  }

  onDeleteSuccess(): void {
    this.successMessage.set('Livro excluído com sucesso.');
    this.loadBooks(this.currentPage());
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
