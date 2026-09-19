import { signal, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { Authors } from './authors';
import { AuthStateService } from '@/app/core/auth/auth-state.service';
import { environment } from '@/environments/environment';
import { of, throwError } from 'rxjs';

describe('Authors', () => {
  let component: Authors;
  let fixture: ComponentFixture<Authors>;
  let httpMock: HttpTestingController;
  let mockAuthState: {
    user: WritableSignal<null>;
    restoreSession: jasmine.Spy;
    logout: jasmine.Spy;
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
    fixture.detectChanges();

    const req = httpMock.expectOne(
      `${environment.apiBaseUrl}/authors?page=1&size=10&include=bookCount`
    );
    req.flush(mockAuthorsResponse);

    expect(component).toBeTruthy();
  });

  it('should load authors on init', () => {
    fixture.detectChanges();

    const req = httpMock.expectOne(
      `${environment.apiBaseUrl}/authors?page=1&size=10&include=bookCount`
    );
    req.flush(mockAuthorsResponse);

    expect(component.authors().length).toBe(1);
    expect(component.authors()[0].name).toBe('Machado de Assis');
  });

  it('should show loading state initially', () => {
    expect(component.isLoading()).toBeTrue();

    fixture.detectChanges();

    const req = httpMock.expectOne(
      `${environment.apiBaseUrl}/authors?page=1&size=10&include=bookCount`
    );
    req.flush(mockAuthorsResponse);

    expect(component.isLoading()).toBeFalse();
  });

  it('should show error message when API fails', () => {
    fixture.detectChanges();

    const req = httpMock.expectOne(
      `${environment.apiBaseUrl}/authors?page=1&size=10&include=bookCount`
    );
    req.flush('Server error', { status: 500, statusText: 'Server Error' });

    expect(component.authorsErrorMessage()).toBe('Não foi possível carregar os autores.');
  });

  it('should log out when session restoration fails', () => {
    mockAuthState.restoreSession.and.returnValue(
      throwError(() => new Error('Sessão expirada.')),
    );

    fixture.detectChanges();

    expect(component.errorMessage()).toBe('Sessão expirada.');
    expect(component.isLoading()).toBeFalse();
    expect(mockAuthState.logout).toHaveBeenCalled();
  });

  it('should set success message and reload after delete', () => {
    fixture.detectChanges();

    const req = httpMock.expectOne(
      `${environment.apiBaseUrl}/authors?page=1&size=10&include=bookCount`
    );
    req.flush(mockAuthorsResponse);

    component.onDeleteSuccess();

    expect(component.successMessage()).toBe('Autor excluído com sucesso.');

    const reloadReq = httpMock.expectOne(
      `${environment.apiBaseUrl}/authors?page=1&size=10&include=bookCount`
    );
    reloadReq.flush(mockAuthorsResponse);
  });
});
