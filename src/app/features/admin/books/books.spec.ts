import { signal, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { Books } from './books';
import { AuthStateService } from '@/app/core/auth/auth-state.service';
import { environment } from '@/environments/environment';

describe('Books', () => {
  let component: Books;
  let fixture: ComponentFixture<Books>;
  let httpMock: HttpTestingController;
  let mockAuthState: {
    user: WritableSignal<null>;
    restoreSession: jasmine.Spy;
    logout: jasmine.Spy;
  };

  const mockBooksResponse = {
    content: [
      {
        id: '1',
        title: 'Dom Casmurro',
        isbn: '978-85-359-0277-5',
        publishDate: '1899-01-01',
        gender: 'ROMANCE',
        price: 49.9,
        createdAt: '2026-01-01T00:00',
        updatedAt: '2026-01-01T00:00',
        author: { id: 'author-1', name: 'Machado de Assis' },
      },
    ],
    page: 1,
    size: 10,
    totalElements: 1,
    totalPages: 1,
    hasNext: false,
  };

  beforeEach(async () => {
    // Arrange
    mockAuthState = {
      user: signal(null),
      restoreSession: jasmine.createSpy('restoreSession').and.returnValue(of(void 0)),
      logout: jasmine.createSpy('logout'),
    };

    await TestBed.configureTestingModule({
      imports: [Books],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: AuthStateService, useValue: mockAuthState },
      ],
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(Books);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    // Arrange
    fixture.detectChanges();

    // Act
    const req = httpMock.expectOne(
      `${environment.apiBaseUrl}/books?page=1&size=10`
    );
    req.flush(mockBooksResponse);

    // Assert
    expect(component).toBeTruthy();
  });

  it('should load books on init', () => {
    // Arrange
    fixture.detectChanges();

    // Act
    const req = httpMock.expectOne(
      `${environment.apiBaseUrl}/books?page=1&size=10`
    );
    req.flush(mockBooksResponse);

    // Assert
    expect(component.books().length).toBe(1);
    expect(component.books()[0].title).toBe('Dom Casmurro');
  });

  it('should show loading state initially', () => {
    // Arrange
    expect(component.isLoading()).toBeTrue();

    // Act
    fixture.detectChanges();

    const req = httpMock.expectOne(
      `${environment.apiBaseUrl}/books?page=1&size=10`
    );
    req.flush(mockBooksResponse);

    // Assert
    expect(component.isLoading()).toBeFalse();
  });

  it('should show error message when API fails', () => {
    // Arrange
    fixture.detectChanges();

    // Act
    const req = httpMock.expectOne(
      `${environment.apiBaseUrl}/books?page=1&size=10`
    );
    req.flush('Server error', { status: 500, statusText: 'Server Error' });

    // Assert
    expect(component.booksErrorMessage()).toBe('Não foi possível carregar os livros.');
  });

  it('should log out when session restoration fails', () => {
    // Arrange
    mockAuthState.restoreSession.and.returnValue(
      throwError(() => new Error('Sessão expirada.')),
    );

    // Act
    fixture.detectChanges();

    // Assert
    expect(component.errorMessage()).toBe('Sessão expirada.');
    expect(component.isLoading()).toBeFalse();
    expect(mockAuthState.logout).toHaveBeenCalled();
  });

  it('should set success message and reload after delete', () => {
    // Arrange
    fixture.detectChanges();

    const req = httpMock.expectOne(
      `${environment.apiBaseUrl}/books?page=1&size=10`
    );
    req.flush(mockBooksResponse);

    // Act
    component.onDeleteSuccess();

    // Assert
    expect(component.successMessage()).toBe('Livro excluído com sucesso.');

    const reloadReq = httpMock.expectOne(
      `${environment.apiBaseUrl}/books?page=1&size=10`
    );
    reloadReq.flush(mockBooksResponse);
  });

  it('should not reload when changing to same page', () => {
    // Arrange
    fixture.detectChanges();

    const req = httpMock.expectOne(
      `${environment.apiBaseUrl}/books?page=1&size=10`
    );
    req.flush(mockBooksResponse);

    // Act
    component.changePage(1);

    // Assert
    httpMock.expectNone(`${environment.apiBaseUrl}/books?page=1&size=10`);
  });

  it('should not reload when changing to invalid page', () => {
    // Arrange
    fixture.detectChanges();

    const req = httpMock.expectOne(
      `${environment.apiBaseUrl}/books?page=1&size=10`
    );
    req.flush(mockBooksResponse);

    // Act
    component.changePage(0);
    component.changePage(999);

    // Assert
    httpMock.expectNone(`${environment.apiBaseUrl}/books?page=0&size=10`);
    httpMock.expectNone(`${environment.apiBaseUrl}/books?page=999&size=10`);

    expect(component.currentPage()).toBe(1);
  });

  it('should load different page when changing page', () => {
    // Arrange
    fixture.detectChanges();

    const req = httpMock.expectOne(
      `${environment.apiBaseUrl}/books?page=1&size=10`
    );
    req.flush({ ...mockBooksResponse, totalPages: 2 });

    // Act
    component.changePage(2);

    // Assert
    const pageReq = httpMock.expectOne(
      `${environment.apiBaseUrl}/books?page=2&size=10`
    );
    pageReq.flush({ ...mockBooksResponse, page: 2 });

    expect(component.currentPage()).toBe(2);
  });
});
