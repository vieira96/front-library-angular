import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { NotificationService } from './notification.service';
import { AuthStateService } from '../../core/auth/auth-state.service';
import { environment } from '../../../environments/environment';

describe('NotificationService', () => {
  let service: NotificationService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.notificationsApiBaseUrl}/notifications`;

  const pageResponse = {
    content: [
      {
        id: '1',
        title: 'Novo livro',
        message: 'Um livro foi adicionado',
        read: false,
        readAt: null,
        createdAt: '2026-01-01T00:00',
        url: null,
        external: false,
      },
    ],
    page: 1,
    size: 10,
    totalElements: 1,
    totalPages: 1,
    hasNext: false,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AuthStateService, useValue: {} },
      ],
    });

    service = TestBed.inject(NotificationService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should load recent once and ignore the second call', () => {
    service.loadRecent();

    const listReq = httpMock.expectOne(`${apiUrl}?page=1&size=3`);
    expect(listReq.request.method).toBe('GET');
    listReq.flush({ ...pageResponse, size: 3 });

    const countReq = httpMock.expectOne(`${apiUrl}/unread-count`);
    countReq.flush({ count: 1 });

    expect(service.recentNotifications().length).toBe(1);
    expect(service.unreadCount()).toBe(1);

    service.loadRecent();
    httpMock.expectNone(`${apiUrl}?page=1&size=3`);
    httpMock.expectNone(`${apiUrl}/unread-count`);
  });

  it('should load the page once and ignore the second call', () => {
    service.ensurePageLoaded();

    const listReq = httpMock.expectOne(`${apiUrl}?page=1&size=10`);
    expect(listReq.request.method).toBe('GET');
    listReq.flush(pageResponse);

    expect(service.allNotifications().length).toBe(1);

    service.ensurePageLoaded();
    httpMock.expectNone(`${apiUrl}?page=1&size=10`);
  });

  it('should mark a notification as read locally and decrement the count', () => {
    service.ensurePageLoaded();
    httpMock.expectOne(`${apiUrl}?page=1&size=10`).flush(pageResponse);
    service.refreshUnreadCount();
    httpMock.expectOne(`${apiUrl}/unread-count`).flush({ count: 1 });

    service.markAsRead('1');
    const req = httpMock.expectOne(`${apiUrl}/1/read`);
    expect(req.request.method).toBe('PATCH');
    req.flush({});

    expect(service.allNotifications()[0].read).toBe(true);
    expect(service.unreadCount()).toBe(0);
  });

  it('should mark all as read locally and zero the count', () => {
    service.ensurePageLoaded();
    httpMock.expectOne(`${apiUrl}?page=1&size=10`).flush(pageResponse);
    service.refreshUnreadCount();
    httpMock.expectOne(`${apiUrl}/unread-count`).flush({ count: 1 });

    service.markAllAsRead();
    const req = httpMock.expectOne(`${apiUrl}/read-all`);
    expect(req.request.method).toBe('PATCH');
    req.flush({});

    expect(service.allNotifications().every((n) => n.read)).toBe(true);
    expect(service.unreadCount()).toBe(0);
  });

  it('should clear the cache', () => {
    service.ensurePageLoaded();
    httpMock.expectOne(`${apiUrl}?page=1&size=10`).flush(pageResponse);
    service.refreshUnreadCount();
    httpMock.expectOne(`${apiUrl}/unread-count`).flush({ count: 1 });

    service.clearCache();

    expect(service.allNotifications()).toEqual([]);
    expect(service.recentNotifications()).toEqual([]);
    expect(service.unreadCount()).toBe(0);
  });
});
