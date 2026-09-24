import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { PreferencesApiService } from './preferences-api.service';
import { environment } from '../../../../environments/environment';

describe('PreferencesApiService', () => {
  let service: PreferencesApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(PreferencesApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch my preferences', () => {
    const mockResponse = [
      { userId: 'user-1', type: 'APP_NOTIFICATION', enabled: true, updatedAt: '2026-01-01T00:00' },
    ];

    service.getMyPreferences().subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(
      `${environment.notificationsApiBaseUrl}/my-preferences`,
    );
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should update my preference with type and enabled', () => {
    const mockResponse = {
      userId: 'user-1',
      type: 'APP_NOTIFICATION',
      enabled: false,
      updatedAt: '2026-01-01T00:00',
    };

    service.updateMyPreference('APP_NOTIFICATION', false).subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(
      `${environment.notificationsApiBaseUrl}/my-preferences/update-preference`,
    );
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ type: 'APP_NOTIFICATION', enabled: false });
    req.flush(mockResponse);
  });
});
