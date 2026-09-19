import { Component, ChangeDetectionStrategy, signal, input, output, inject, OnInit, OnDestroy, ElementRef } from '@angular/core';
import { debounceTime, Subject, switchMap, takeUntil } from 'rxjs';
import { LucideSearch, LucideChevronDown, LucideX } from '@lucide/angular';
import { FormsModule } from '@angular/forms';
import { CountryService } from './country.service';

@Component({
  selector: 'app-country-input',
  standalone: true,
  imports: [FormsModule, LucideSearch, LucideChevronDown, LucideX],
  templateUrl: './country-input.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CountryInput implements OnInit, OnDestroy {
  private readonly countryService = inject(CountryService);
  private readonly elementRef = inject(ElementRef);
  private readonly search$ = new Subject<string>();
  private readonly destroy$ = new Subject<void>();

  readonly value = input<string>('');
  readonly placeholder = input<string>('Buscar país...');
  readonly label = input<string>('');
  readonly required = input<boolean>(false);
  readonly invalid = input<boolean>(false);

  readonly valueChange = output<string>();

  readonly searchQuery = signal('');
  readonly countries = signal<string[]>([]);
  readonly filteredCountries = signal<string[]>([]);
  readonly isOpen = signal(false);
  readonly isLoading = signal(false);

  private allCountries: string[] = [];

  ngOnInit(): void {
    this.searchQuery.set(this.value());
    this.loadCountries();
    this.setupSearch();
    this.setupClickOutside();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchQuery.set(target.value);
    this.valueChange.emit(target.value);
    this.search$.next(target.value);
  }

  onSelectCountry(country: string): void {
    this.searchQuery.set(country);
    this.valueChange.emit(country);
    this.isOpen.set(false);
  }

  onClear(): void {
    this.searchQuery.set('');
    this.filteredCountries.set(this.allCountries);
    this.valueChange.emit('');
    this.isOpen.set(false);
  }

  toggleDropdown(): void {
    this.isOpen.update(open => !open);
  }

  private loadCountries(): void {
    this.isLoading.set(true);
    this.countryService.getCountries()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (countries) => {
          this.allCountries = countries;
          this.filteredCountries.set(this.allCountries);
          this.isLoading.set(false);
        },
        error: () => {
          this.allCountries = [];
          this.filteredCountries.set([]);
          this.isLoading.set(false);
        },
      });
  }

  private setupSearch(): void {
    this.search$
      .pipe(
        debounceTime(300),
        switchMap((query) => {
          const filtered = this.allCountries.filter(country =>
            country.toLowerCase().includes(query.toLowerCase())
          );
          return [filtered];
        }),
        takeUntil(this.destroy$),
      )
      .subscribe((filtered) => {
        this.filteredCountries.set(filtered);
        this.isOpen.set(filtered.length > 0);
      });
  }

  private setupClickOutside(): void {
    document.addEventListener('click', (event) => {
      if (!this.elementRef.nativeElement.contains(event.target)) {
        this.isOpen.set(false);
      }
    });
  }
}
