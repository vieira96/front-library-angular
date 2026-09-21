import {
  Component,
  ChangeDetectionStrategy,
  signal,
  input,
  output,
  inject,
  OnInit,
  OnDestroy,
  ElementRef,
} from '@angular/core';
import { debounceTime, Subject, switchMap, takeUntil, tap } from 'rxjs';
import { LucideSearch, LucideChevronDown, LucideX, LucideLoader } from '@lucide/angular';
import { FormsModule } from '@angular/forms';
import { AuthorsApiService } from '@/app/features/admin/authors/authors-api.service';
import { Author } from '@/app/features/admin/authors/author.model';

@Component({
  selector: 'app-author-select',
  standalone: true,
  imports: [FormsModule, LucideSearch, LucideChevronDown, LucideX, LucideLoader],
  templateUrl: './author-select.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthorSelect implements OnInit, OnDestroy {
  private readonly authorsApi = inject(AuthorsApiService);
  private readonly elementRef = inject(ElementRef);
  private readonly search$ = new Subject<string>();
  private readonly destroy$ = new Subject<void>();
  private readonly loadMore$ = new Subject<void>();

  readonly value = input<string>('');
  readonly name = input<string>('');
  readonly label = input<string>('');
  readonly required = input<boolean>(false);
  readonly invalid = input<boolean>(false);
  readonly disabled = input<boolean>(false);

  readonly valueChange = output<string>();

  readonly searchQuery = signal('');
  readonly authors = signal<Author[]>([]);
  readonly isOpen = signal(false);
  readonly isLoading = signal(false);
  readonly isLoadingMore = signal(false);

  private currentPage = 1;
  private hasNext = true;

  ngOnInit(): void {
    if (this.name()) {
      this.searchQuery.set(this.name());
    }
    this.loadAuthors(1, '');
    this.setupSearch();
    this.setupClickOutside();
    this.setupLoadMore();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchQuery.set(target.value);
    this.isOpen.set(true);
    this.search$.next(target.value);
  }

  onSelectAuthor(author: Author): void {
    this.searchQuery.set(author.name);
    this.valueChange.emit(author.id);
    this.isOpen.set(false);
  }

  onClear(): void {
    this.searchQuery.set('');
    this.valueChange.emit('');
    this.isOpen.set(false);
    this.search$.next('');
  }

  onScroll(event: Event): void {
    const element = event.target as HTMLDivElement;
    if (
      element.scrollTop + element.clientHeight >= element.scrollHeight - 10 &&
      this.hasNext &&
      !this.isLoadingMore() &&
      !this.isLoading()
    ) {
      this.loadMore$.next();
    }
  }

  toggleDropdown(): void {
    this.isOpen.update(open => !open);
  }

  private loadAuthors(page: number, name: string): void {
    if (this.isLoading() || this.isLoadingMore()) {
      return;
    }

    if (page === 1) {
      this.isLoading.set(true);
    } else {
      this.isLoadingMore.set(true);
    }

    this.authorsApi.getAuthors(page, 7, name).subscribe({
      next: (response) => {
        if (page === 1) {
          this.authors.set(response.content);
        } else {
          this.authors.update(current => [...current, ...response.content]);
        }
        this.currentPage = response.page;
        this.hasNext = response.hasNext;
        this.isLoading.set(false);
        this.isLoadingMore.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.isLoadingMore.set(false);
      },
    });
  }

  private setupSearch(): void {
    this.search$
      .pipe(
        debounceTime(300),
        tap(() => {
          this.currentPage = 1;
          this.hasNext = true;
        }),
        switchMap((query) => {
          this.isLoading.set(true);
          return this.authorsApi.getAuthors(1, 7, query);
        }),
        takeUntil(this.destroy$),
      )
      .subscribe({
        next: (response) => {
          this.authors.set(response.content);
          this.currentPage = response.page;
          this.hasNext = response.hasNext;
          this.isLoading.set(false);
          this.isOpen.set(true);
        },
        error: () => {
          this.isLoading.set(false);
        },
      });
  }

  private setupClickOutside(): void {
    document.addEventListener('click', (event) => {
      if (!this.elementRef.nativeElement.contains(event.target)) {
        this.isOpen.set(false);
      }
    });
  }

  private setupLoadMore(): void {
    this.loadMore$
      .pipe(
        debounceTime(100),
        takeUntil(this.destroy$),
      )
      .subscribe(() => {
        const query = this.searchQuery();
        this.loadAuthors(this.currentPage + 1, query);
      });
  }
}
