import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { Book } from '@/app/features/books/book.model';
import { DatePipe, CurrencyPipe } from '@angular/common';
import { LucidePencil, LucideTrash } from '@lucide/angular';

@Component({
  selector: 'app-books-table',
  standalone: true,
  imports: [DatePipe, CurrencyPipe, LucidePencil, LucideTrash],
  templateUrl: './books-table.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BooksTable {
  readonly books = input.required<Book[]>();
}
