import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { Notifications } from './notifications';
import { NotificationService } from './notification.service';
import { PreferencesApiService } from './notification-config-button/preferences-api.service';

describe('Notifications', () => {
  let component: Notifications;
  let fixture: ComponentFixture<Notifications>;
  let notificationService: { ensurePageLoaded: jasmine.Spy };

  beforeEach(async () => {
    notificationService = {
      ensurePageLoaded: jasmine.createSpy('ensurePageLoaded'),
    };

    await TestBed.configureTestingModule({
      imports: [Notifications],
      providers: [
        provideRouter([]),
        {
          provide: NotificationService,
          useValue: {
            allNotifications: signal([]),
            unreadCount: signal(0),
            page: signal(1),
            totalPages: signal(1),
            ensurePageLoaded: notificationService.ensurePageLoaded,
            getNotifications: jasmine.createSpy('getNotifications'),
            markAllAsRead: jasmine.createSpy('markAllAsRead'),
          },
        },
        {
          provide: PreferencesApiService,
          useValue: {
            getMyPreferences: () => of([]),
            updateMyPreference: () => of({ type: 'APP_NOTIFICATION', enabled: true }),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Notifications);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load the page once on init instead of refreshing', () => {
    expect(notificationService.ensurePageLoaded).toHaveBeenCalledTimes(1);
  });

  it('should render the config button', () => {
    const configButton = fixture.nativeElement.querySelector(
      'app-notification-config-button',
    );

    expect(configButton).toBeTruthy();
  });
});
