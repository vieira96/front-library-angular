import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { AuthorSelect } from './author-select';
import { environment } from '@/environments/environment';

describe('AuthorSelect', () => {
  let component: AuthorSelect;
  let fixture: ComponentFixture<AuthorSelect>;
  let httpMock: HttpTestingController;

  const mockAuthorsPage1 = {
    content: [
      { id: '1', name: 'Machado de Assis', birthdate: '1839-06-21', nationality: 'Brasileira', createdAt: '2026-01-01T00:00', updatedAt: '2026-01-01T00:00', bookCount: 3 },
      { id: '2', name: 'Clarice Lispector', birthdate: '1920-12-10', nationality: 'Brasileira', createdAt: '2026-01-01T00:00', updatedAt: '2026-01-01T00:00', bookCount: 0 },
    ],
    page: 1,
    size: 7,
    totalElements: 7,
    totalPages: 2,
    hasNext: true,
  };

  const mockAuthorsPage2 = {
    content: [
      { id: '3', name: 'João Guimarães Rosa', birthdate: '1908-06-27', nationality: 'Brasileira', createdAt: '2026-01-01T00:00', updatedAt: '2026-01-01T00:00', bookCount: 1 },
    ],
    page: 2,
    size: 7,
    totalElements: 7,
    totalPages: 2,
    hasNext: false,
  };

  beforeEach(async () => {
    // Arrange
    await TestBed.configureTestingModule({
      imports: [AuthorSelect],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(AuthorSelect);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    // Act
    fixture.detectChanges();

    // Assert
    const req = httpMock.expectOne(
      `${environment.apiBaseUrl}/authors?page=1&size=7&include=bookCount`
    );
    req.flush(mockAuthorsPage1);

    expect(component).toBeTruthy();
  });

  it('should load authors on init', () => {
    // Act
    fixture.detectChanges();

    // Assert
    const req = httpMock.expectOne(
      `${environment.apiBaseUrl}/authors?page=1&size=7&include=bookCount`
    );
    req.flush(mockAuthorsPage1);

    expect(component.authors().length).toBe(2);
    expect(component.authors()[0].name).toBe('Machado de Assis');
  });

  it('should display label when provided', () => {
    // Arrange
    fixture.componentRef.setInput('label', 'Autor');

    // Act
    fixture.detectChanges();

    // Assert
    const req = httpMock.expectOne(
      `${environment.apiBaseUrl}/authors?page=1&size=7&include=bookCount`
    );
    req.flush(mockAuthorsPage1);

    expect(fixture.nativeElement.textContent).toContain('Autor');
  });

  it('should show required indicator when required is true', () => {
    // Arrange
    fixture.componentRef.setInput('required', true);
    fixture.componentRef.setInput('label', 'Autor');

    // Act
    fixture.detectChanges();

    // Assert
    const req = httpMock.expectOne(
      `${environment.apiBaseUrl}/authors?page=1&size=7&include=bookCount`
    );
    req.flush(mockAuthorsPage1);

    expect(fixture.nativeElement.textContent).toContain('*');
  });

  it('should open dropdown on input focus', fakeAsync(() => {
    // Arrange
    fixture.detectChanges();

    const req = httpMock.expectOne(
      `${environment.apiBaseUrl}/authors?page=1&size=7&include=bookCount`
    );
    req.flush(mockAuthorsPage1);

    // Act
    const input = fixture.nativeElement.querySelector('input');
    input.focus();
    tick();

    // Assert
    expect(component.isOpen()).toBeTrue();
  }));

  it('should emit valueChange when selecting an author', fakeAsync(() => {
    // Arrange
    spyOn(component.valueChange, 'emit');
    fixture.detectChanges();

    const req = httpMock.expectOne(
      `${environment.apiBaseUrl}/authors?page=1&size=7&include=bookCount`
    );
    req.flush(mockAuthorsPage1);
    tick();

    component.isOpen.set(true);
    fixture.detectChanges();

    // Act
    const firstItem = fixture.nativeElement.querySelectorAll('li')[0];
    firstItem.click();
    tick();

    // Assert
    expect(component.valueChange.emit).toHaveBeenCalledWith('1');
    expect(component.searchQuery()).toBe('Machado de Assis');
    expect(component.isOpen()).toBeFalse();
  }));

  it('should emit empty string when clearing selection', fakeAsync(() => {
    // Arrange
    spyOn(component.valueChange, 'emit');
    fixture.detectChanges();

    const req = httpMock.expectOne(
      `${environment.apiBaseUrl}/authors?page=1&size=7&include=bookCount`
    );
    req.flush(mockAuthorsPage1);
    tick();

    // Act
    component.searchQuery.set('Machado');
    fixture.detectChanges();

    const clearButton = fixture.nativeElement.querySelector('button[type="button"]');
    clearButton.click();
    tick(300);

    // Assert - flush the reload request triggered by search$ in onClear
    const reloadReq = httpMock.expectOne(
      (req) => req.url === `${environment.apiBaseUrl}/authors`
        && req.params.get('page') === '1'
        && req.params.get('size') === '7'
        && req.params.get('include') === 'bookCount'
    );
    reloadReq.flush(mockAuthorsPage1);

    expect(component.valueChange.emit).toHaveBeenCalledWith('');
    expect(component.searchQuery()).toBe('');
  }));

  it('should search authors with debounce', fakeAsync(() => {
    // Arrange
    fixture.detectChanges();

    const initialReq = httpMock.expectOne(
      `${environment.apiBaseUrl}/authors?page=1&size=7&include=bookCount`
    );
    initialReq.flush(mockAuthorsPage1);

    // Act
    const input = fixture.nativeElement.querySelector('input');
    input.value = 'Machado';
    input.dispatchEvent(new Event('input'));
    tick(300);

    // Assert
    const searchReq = httpMock.expectOne(
      (req) => req.url === `${environment.apiBaseUrl}/authors`
        && req.params.get('page') === '1'
        && req.params.get('size') === '7'
        && req.params.get('name') === 'Machado'
        && req.params.get('include') === 'bookCount'
    );
    searchReq.flush(mockAuthorsPage1);
  }));

  it('should load more authors on scroll to bottom', fakeAsync(() => {
    // Arrange
    fixture.detectChanges();

    const req = httpMock.expectOne(
      `${environment.apiBaseUrl}/authors?page=1&size=7&include=bookCount`
    );
    req.flush(mockAuthorsPage1);
    tick();

    component.isOpen.set(true);
    fixture.detectChanges();

    // Act
    const scrollContainer = fixture.nativeElement.querySelector('.max-h-60');
    if (scrollContainer) {
      Object.defineProperty(scrollContainer, 'scrollTop', { value: 200 });
      Object.defineProperty(scrollContainer, 'clientHeight', { value: 100 });
      Object.defineProperty(scrollContainer, 'scrollHeight', { value: 200 });
      scrollContainer.dispatchEvent(new Event('scroll'));
      tick(100);
    }

    // Assert
    const page2Req = httpMock.expectOne(
      `${environment.apiBaseUrl}/authors?page=2&size=7&include=bookCount`
    );
    page2Req.flush(mockAuthorsPage2);

    expect(component.authors().length).toBe(3);
  }));

  it('should toggle dropdown on chevron click', fakeAsync(() => {
    // Arrange
    fixture.detectChanges();

    const req = httpMock.expectOne(
      `${environment.apiBaseUrl}/authors?page=1&size=7&include=bookCount`
    );
    req.flush(mockAuthorsPage1);
    tick();

    // Act
    const buttons = fixture.nativeElement.querySelectorAll('button[type="button"]');
    const chevronButton = buttons[buttons.length - 1];
    chevronButton.click();
    tick();

    // Assert
    expect(component.isOpen()).toBeTrue();

    chevronButton.click();
    tick();

    expect(component.isOpen()).toBeFalse();
  }));

  it('should show loading state while fetching', () => {
    // Act
    fixture.detectChanges();

    // Assert
    expect(component.isLoading()).toBeTrue();

    const req = httpMock.expectOne(
      `${environment.apiBaseUrl}/authors?page=1&size=7&include=bookCount`
    );
    req.flush(mockAuthorsPage1);

    expect(component.isLoading()).toBeFalse();
  });

  it('should show empty message when no authors found', fakeAsync(() => {
    // Arrange
    fixture.detectChanges();

    const req = httpMock.expectOne(
      `${environment.apiBaseUrl}/authors?page=1&size=7&include=bookCount`
    );
    req.flush({ ...mockAuthorsPage1, content: [] });
    tick();

    // Act
    component.isOpen.set(true);
    fixture.detectChanges();

    // Assert
    expect(fixture.nativeElement.textContent).toContain('Nenhum autor encontrado');
  }));

  it('should display pre-filled name', fakeAsync(() => {
    // Arrange
    fixture.componentRef.setInput('name', 'Machado de Assis');
    fixture.detectChanges();

    const req = httpMock.expectOne(
      `${environment.apiBaseUrl}/authors?page=1&size=7&include=bookCount`
    );
    req.flush(mockAuthorsPage1);
    tick();

    // Assert
    expect(component.searchQuery()).toBe('Machado de Assis');
  }));
});
