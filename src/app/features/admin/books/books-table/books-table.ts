import { Component, ChangeDetectionStrategy, signal, input, output } from '@angular/core';
import { Book } from '../../../books/book.model';
import { DatePipe, CurrencyPipe } from '@angular/common';
import { LucidePencil, LucideTrash } from '@lucide/angular';
import { DeleteBookModal } from '../delete-book-modal/delete-book-modal';

@Component({
  selector: 'app-books-table',
  standalone: true,
  imports: [DatePipe, CurrencyPipe, LucidePencil, LucideTrash, DeleteBookModal],
  templateUrl: './books-table.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BooksTable {
  readonly books = input.required<Book[]>();
  readonly edit = output<Book>();
  readonly success = output<void>();

  readonly showDeleteModal = signal(false);
  readonly bookToDelete = signal<Book | null>(null);

  openDeleteModal(book: Book): void {
    this.bookToDelete.set(book);
    this.showDeleteModal.set(true);
  }

  closeDeleteModal(): void {
    this.showDeleteModal.set(false);
    this.bookToDelete.set(null);
  }

  onDeleteSuccess(): void {
    this.closeDeleteModal();
    this.success.emit();
  }
}
