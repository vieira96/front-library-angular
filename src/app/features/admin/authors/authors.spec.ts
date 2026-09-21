import { signal, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { Authors } from './authors';
import { AuthStateService } from '@/app/core/auth/auth-state.service';
import { CountryService } from '@/app/shared/ui/country-input/country.service';
import { environment } from '@/environments/environment';

describe('Authors', () => {
  let component: Authors;
  let fixture: ComponentFixture<Authors>;
  let httpMock: HttpTestingController;
  let mockAuthState: {
    user: WritableSignal<null>;
    restoreSession: jasmine.Spy;
    logout: jasmine.Spy;
  };

  const mockCountryService = {
    getCountries: () => of(['Argentina', 'Brasil', 'Portugal']),
  };

  const mockAuthorsResponse = {
    content: [
      {
        id: '1',
        name: 'Machado de Assis',
        birthdate: '1839-06-21',
        nationality: 'Brasileira',
        createdAt: '2026-01-01T00:00',
        updatedAt: '2026-01-01T00:00',
        bookCount: 3,
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
      imports: [Authors],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: AuthStateService, useValue: mockAuthState },
        { provide: CountryService, useValue: mockCountryService },
      ],
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(Authors);
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
      `${environment.apiBaseUrl}/authors?page=1&size=10&include=bookCount`
    );
    req.flush(mockAuthorsResponse);

    // Assert
    expect(component).toBeTruthy();
  });

  it('should load authors on init', () => {
    // Arrange
    fixture.detectChanges();

    // Act
    const req = httpMock.expectOne(
      `${environment.apiBaseUrl}/authors?page=1&size=10&include=bookCount`
    );
    req.flush(mockAuthorsResponse);

    // Assert
    expect(component.authors().length).toBe(1);
    expect(component.authors()[0].name).toBe('Machado de Assis');
  });

  it('should show loading state initially', () => {
    // Arrange
    expect(component.isLoading()).toBeTrue();

    // Act
    fixture.detectChanges();

    const req = httpMock.expectOne(
      `${environment.apiBaseUrl}/authors?page=1&size=10&include=bookCount`
    );
    req.flush(mockAuthorsResponse);

    // Assert
    expect(component.isLoading()).toBeFalse();
  });

  it('should show error message when API fails', () => {
    // Arrange
    fixture.detectChanges();

    // Act
    const req = httpMock.expectOne(
      `${environment.apiBaseUrl}/authors?page=1&size=10&include=bookCount`
    );
    req.flush('Server error', { status: 500, statusText: 'Server Error' });

    // Assert
    expect(component.authorsErrorMessage()).toBe('Não foi possível carregar os autores.');
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
      `${environment.apiBaseUrl}/authors?page=1&size=10&include=bookCount`
    );
    req.flush(mockAuthorsResponse);

    // Act
    component.onDeleteSuccess();

    // Assert
    expect(component.successMessage()).toBe('Autor excluído com sucesso.');

    const reloadReq = httpMock.expectOne(
      `${environment.apiBaseUrl}/authors?page=1&size=10&include=bookCount`
    );
    reloadReq.flush(mockAuthorsResponse);
  });

  it('should open create modal when FAB is clicked', () => {
    // Arrange
    fixture.detectChanges();

    const req = httpMock.expectOne(
      `${environment.apiBaseUrl}/authors?page=1&size=10&include=bookCount`
    );
    req.flush(mockAuthorsResponse);

    expect(component.isCreateUpdateModalOpen()).toBeFalse();

    // Act
    const fabButton = fixture.nativeElement.querySelector('button.fixed');
    fabButton.click();

    // Assert
    expect(component.isCreateUpdateModalOpen()).toBeTrue();
  });

  it('should close modal and show toast after successful creation', () => {
    // Arrange
    fixture.detectChanges();

    const req = httpMock.expectOne(
      `${environment.apiBaseUrl}/authors?page=1&size=10&include=bookCount`
    );
    req.flush(mockAuthorsResponse);

    component.isCreateUpdateModalOpen.set(true);
    fixture.detectChanges();

    // Act
    component.onModalSuccess();

    // Assert
    expect(component.isCreateUpdateModalOpen()).toBeFalse();
    expect(component.successMessage()).toBe('Autor cadastrado com sucesso.');

    const reloadReq = httpMock.expectOne(
      `${environment.apiBaseUrl}/authors?page=1&size=10&include=bookCount`
    );
    reloadReq.flush(mockAuthorsResponse);
  });

  it('should open edit modal with author when clicking edit', () => {
    // Arrange
    fixture.detectChanges();

    const req = httpMock.expectOne(
      `${environment.apiBaseUrl}/authors?page=1&size=10&include=bookCount`
    );
    req.flush(mockAuthorsResponse);
    fixture.detectChanges();

    // Act
    const editButton = fixture.nativeElement.querySelector(
      '[data-testid="edit-author-1"]',
    );
    editButton.click();

    // Assert
    expect(component.isCreateUpdateModalOpen()).toBeTrue();
    expect(component.authorToEdit()?.id).toBe('1');
    expect(component.authorToEdit()?.name).toBe('Machado de Assis');
  });

  it('should close modal and show toast after successful update', () => {
    // Arrange
    fixture.detectChanges();

    const req = httpMock.expectOne(
      `${environment.apiBaseUrl}/authors?page=1&size=10&include=bookCount`
    );
    req.flush(mockAuthorsResponse);

    component.openEditModal(mockAuthorsResponse.content[0]);
    fixture.detectChanges();

    // Act
    component.onModalSuccess();

    // Assert
    expect(component.isCreateUpdateModalOpen()).toBeFalse();
    expect(component.authorToEdit()).toBeNull();
    expect(component.successMessage()).toBe('Autor atualizado com sucesso.');

    const reloadReq = httpMock.expectOne(
      `${environment.apiBaseUrl}/authors?page=1&size=10&include=bookCount`
    );
    reloadReq.flush(mockAuthorsResponse);
  });

  it('should clear authorToEdit when closing modal', () => {
    // Arrange
    fixture.detectChanges();

    const req = httpMock.expectOne(
      `${environment.apiBaseUrl}/authors?page=1&size=10&include=bookCount`
    );
    req.flush(mockAuthorsResponse);

    component.openEditModal(mockAuthorsResponse.content[0]);
    expect(component.authorToEdit()).not.toBeNull();

    // Act
    component.closeModal();

    // Assert
    expect(component.isCreateUpdateModalOpen()).toBeFalse();
    expect(component.authorToEdit()).toBeNull();
  });
});
