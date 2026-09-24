import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { NotificationConfigButton } from './notification-config-button';
import { PreferencesApiService } from './preferences-api.service';

describe('NotificationConfigButton', () => {
  let component: NotificationConfigButton;
  let fixture: ComponentFixture<NotificationConfigButton>;
  let preferencesApi: {
    getMyPreferences: jasmine.Spy;
    updateMyPreference: jasmine.Spy;
  };

  beforeEach(async () => {
    preferencesApi = {
      getMyPreferences: jasmine.createSpy('getMyPreferences').and.returnValue(of([])),
      updateMyPreference: jasmine
        .createSpy('updateMyPreference')
        .and.callFake((type: string, enabled: boolean) =>
          of({ userId: 'user-1', type, enabled, updatedAt: '2026-01-01T00:00' }),
        ),
    };

    await TestBed.configureTestingModule({
      imports: [NotificationConfigButton],
      providers: [{ provide: PreferencesApiService, useValue: preferencesApi }],
    }).compileComponents();

    fixture = TestBed.createComponent(NotificationConfigButton);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load preferences on init', () => {
    expect(preferencesApi.getMyPreferences).toHaveBeenCalledTimes(1);
  });

  it('should default to false when no preference exists', () => {
    expect(component.appNotification()).toBe(false);
  });

  it('should toggle the menu when clicking the config button', () => {
    const button = fixture.nativeElement.querySelector(
      'button[aria-label="Configurações de notificações"]',
    ) as HTMLButtonElement;

    expect(component.isOpen()).toBe(false);

    button.click();
    fixture.detectChanges();
    expect(component.isOpen()).toBe(true);

    button.click();
    fixture.detectChanges();
    expect(component.isOpen()).toBe(false);
  });

  it('should show an error toast when updating the preference fails', () => {
    preferencesApi.updateMyPreference.and.returnValue(
      throwError(() => ({ error: { message: 'Falha ao salvar' } })),
    );
    component.isOpen.set(true);
    fixture.detectChanges();

    const toggle = fixture.nativeElement.querySelector(
      'button[role="switch"]',
    ) as HTMLButtonElement;
    toggle.click();
    fixture.detectChanges();

    expect(component.updateError()).toBe('Falha ao salvar');
    expect(fixture.nativeElement.querySelector('app-toast')).toBeTruthy();
  });

  it('should update the preference when toggling app notifications', () => {
    component.appNotification.set(true);
    component.isOpen.set(true);
    fixture.detectChanges();

    const toggle = fixture.nativeElement.querySelector(
      'button[role="switch"]',
    ) as HTMLButtonElement;
    toggle.click();

    expect(preferencesApi.updateMyPreference).toHaveBeenCalledWith(
      'APP_NOTIFICATION',
      false,
    );
    expect(component.appNotification()).toBe(false);
  });
});
