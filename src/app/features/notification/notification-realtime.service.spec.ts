import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { AccessTokenStoreService } from '../../core/auth/access-token-store.service';
import { NotificationRealtimeService } from './notification-realtime.service';
import { NotificationService } from './notification.service';

describe('NotificationRealtimeService', () => {
  let service: NotificationRealtimeService;
  let notifications: { pushRealtime: jasmine.Spy };
  let handlers: Record<string, (payload?: unknown) => void>;
  let fakeSocket: { on: jasmine.Spy; disconnect: jasmine.Spy };

  beforeEach(() => {
    notifications = { pushRealtime: jasmine.createSpy('pushRealtime') };
    handlers = {};
    fakeSocket = {
      on: jasmine
        .createSpy('on')
        .and.callFake((event: string, cb: (payload?: unknown) => void) => {
          handlers[event] = cb;
        }),
      disconnect: jasmine.createSpy('disconnect'),
    };

    TestBed.configureTestingModule({
      providers: [
        {
          provide: AccessTokenStoreService,
          useValue: { token: signal('token-1').asReadonly() },
        },
        { provide: NotificationService, useValue: notifications },
      ],
    });

    service = TestBed.inject(NotificationRealtimeService);
    spyOn(
      service as unknown as { createSocket: () => unknown },
      'createSocket',
    ).and.returnValue(fakeSocket);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should connect once and subscribe to notification:new', () => {
    service.connect();
    service.connect();

    expect(fakeSocket.on).toHaveBeenCalledWith('connect', jasmine.any(Function));
    expect(fakeSocket.on).toHaveBeenCalledWith('disconnect', jasmine.any(Function));
    expect(fakeSocket.on).toHaveBeenCalledWith('notification:new', jasmine.any(Function));
    expect(service.connected()).toBe(false);
  });

  it('should push incoming notifications to the store', () => {
    service.connect();

    handlers['notification:new']?.({
      id: 'n1',
      type: 'BOOK_CREATED',
      title: 'Novo livro',
      message: 'msg',
      path: '/book/1',
      url: null,
      createdAt: '2026-01-01T00:00',
      read: false,
      readAt: null,
    });

    expect(notifications.pushRealtime).toHaveBeenCalledTimes(1);
    const pushed = notifications.pushRealtime.calls.mostRecent().args[0];
    expect(pushed.id).toBe('n1');
    expect(pushed.createdAt instanceof Date).toBe(true);
  });

  it('should disconnect and clear the socket', () => {
    service.connect();
    service.disconnect();

    expect(fakeSocket.disconnect).toHaveBeenCalledTimes(1);
    expect(service.connected()).toBe(false);
  });
});
