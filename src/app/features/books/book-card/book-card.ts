import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { LucideBookOpen } from '@lucide/angular';
import { Book } from '../book.model';

@Component({
  selector: 'app-book-card',
  standalone: true,
  imports: [CurrencyPipe, LucideBookOpen],
  templateUrl: './book-card.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookCard {
  readonly book = input.required<Book>();
}
