import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { firstValueFrom, of, throwError } from 'rxjs';
import { CountryInput } from './country-input';
import { CountryService } from './country.service';

describe('CountryService - Integration (IBGE API)', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        CountryService,
      ],
    }).compileComponents();
  });

  it('should fetch countries from IBGE API', async () => {
    const service = TestBed.inject(CountryService);
    const countries = await firstValueFrom(service.getCountries());

    expect(countries).toBeDefined();
    expect(countries.length).toBeGreaterThan(0);
    expect(countries).toContain('Brasil');
  });

  it('should return countries as sorted strings', async () => {
    const service = TestBed.inject(CountryService);
    const countries = await firstValueFrom(service.getCountries());

    const sorted = [...countries].sort((a, b) => a.localeCompare(b));
    expect(countries).toEqual(sorted);
  });

  it('should cache countries after first fetch', async () => {
    const service = TestBed.inject(CountryService);

    const first = await firstValueFrom(service.getCountries());
    const second = await firstValueFrom(service.getCountries());

    expect(first).toBe(second);
  });
});

describe('CountryInput', () => {
  let component: CountryInput;
  let fixture: ComponentFixture<CountryInput>;
  let countryService: jasmine.SpyObj<CountryService>;

  const mockCountries = ['Argentina', 'Bolívia', 'Brasil', 'Portugal'];

  beforeEach(async () => {
    countryService = jasmine.createSpyObj('CountryService', ['getCountries']);
    countryService.getCountries.and.returnValue(of(mockCountries));

    await TestBed.configureTestingModule({
      imports: [CountryInput],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: CountryService, useValue: countryService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CountryInput);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should load countries on init', () => {
    fixture.detectChanges();
    expect(component.filteredCountries().length).toBe(4);
    expect(component.isLoading()).toBeFalse();
  });

  it('should sort countries alphabetically', () => {
    fixture.detectChanges();
    expect(component.filteredCountries()[0]).toBe('Argentina');
    expect(component.filteredCountries()[1]).toBe('Bolívia');
    expect(component.filteredCountries()[2]).toBe('Brasil');
    expect(component.filteredCountries()[3]).toBe('Portugal');
  });

  it('should filter countries when typing', fakeAsync(() => {
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector('input');
    input.value = 'Bra';
    input.dispatchEvent(new Event('input'));
    tick(300);
    fixture.detectChanges();

    expect(component.filteredCountries().length).toBe(1);
    expect(component.filteredCountries()[0]).toBe('Brasil');
  }));

  it('should be case insensitive when filtering', fakeAsync(() => {
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector('input');
    input.value = 'bra';
    input.dispatchEvent(new Event('input'));
    tick(300);
    fixture.detectChanges();

    expect(component.filteredCountries().length).toBe(1);
    expect(component.filteredCountries()[0]).toBe('Brasil');
  }));

  it('should emit valueChange when typing', () => {
    fixture.detectChanges();
    spyOn(component.valueChange, 'emit');

    const input = fixture.nativeElement.querySelector('input');
    input.value = 'Brasil';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(component.valueChange.emit).toHaveBeenCalledWith('Brasil');
  });

  it('should select country and emit valueChange', () => {
    fixture.detectChanges();
    spyOn(component.valueChange, 'emit');

    component.onSelectCountry('Brasil');

    expect(component.searchQuery()).toBe('Brasil');
    expect(component.valueChange.emit).toHaveBeenCalledWith('Brasil');
    expect(component.isOpen()).toBeFalse();
  });

  it('should clear input and reset filtered countries', () => {
    fixture.detectChanges();
    spyOn(component.valueChange, 'emit');

    component.onClear();

    expect(component.searchQuery()).toBe('');
    expect(component.filteredCountries().length).toBe(4);
    expect(component.valueChange.emit).toHaveBeenCalledWith('');
    expect(component.isOpen()).toBeFalse();
  });

  it('should toggle dropdown', () => {
    fixture.detectChanges();

    expect(component.isOpen()).toBeFalse();

    component.toggleDropdown();
    expect(component.isOpen()).toBeTrue();

    component.toggleDropdown();
    expect(component.isOpen()).toBeFalse();
  });

  it('should show loading state while fetching countries', () => {
    countryService.getCountries.and.returnValue(of([]));

    fixture.detectChanges();
    expect(component.isLoading()).toBeFalse();
  });

  it('should handle API error gracefully', () => {
    countryService.getCountries.and.returnValue(
      throwError(() => new Error('API Error'))
    );

    fixture.detectChanges();

    expect(component.filteredCountries().length).toBe(0);
    expect(component.isLoading()).toBeFalse();
  });

  it('should set searchQuery from value input', () => {
    fixture.componentRef.setInput('value', 'Brasil');
    fixture.detectChanges();

    expect(component.searchQuery()).toBe('Brasil');
  });

  it('should close dropdown when filter returns empty', fakeAsync(() => {
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector('input');
    input.value = 'ZZZ';
    input.dispatchEvent(new Event('input'));
    tick(300);
    fixture.detectChanges();

    expect(component.filteredCountries().length).toBe(0);
    expect(component.isOpen()).toBeFalse();
  }));

  it('should open dropdown when typing matches countries', fakeAsync(() => {
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector('input');
    input.value = 'Bra';
    input.dispatchEvent(new Event('input'));
    tick(300);
    fixture.detectChanges();

    expect(component.isOpen()).toBeTrue();
  }));
});
