import { ChangeDetectionStrategy, Component, HostListener, OnInit, inject, signal } from '@angular/core';
import { LucideSettings } from '@lucide/angular';
import { Toast } from '../../../shared/ui/toast/toast';
import { PreferencesApiService } from './preferences-api.service';

@Component({
  selector: 'app-notification-config-button',
  standalone: true,
  imports: [LucideSettings, Toast],
  templateUrl: './notification-config-button.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificationConfigButton implements OnInit {
  private readonly preferencesApi = inject(PreferencesApiService);

  readonly isOpen = signal(false);
  readonly appNotification = signal(false);
  readonly updateError = signal<string | null>(null);

  ngOnInit(): void {
    this.preferencesApi.getMyPreferences().subscribe({
      next: (preferences) => {
        const appNotificationPreference = preferences.find((p) => p.type === 'APP_NOTIFICATION');
        this.appNotification.set(appNotificationPreference?.enabled ?? false);
      },
      error: (error) => console.log(error),
    });
  }

  toggle(): void {
    this.isOpen.update((open) => !open);
  }

  close(): void {
    this.isOpen.set(false);
  }

  appNotificationToggle(): void {
    const next = !this.appNotification();
    this.updateError.set(null);
    this.preferencesApi
      .updateMyPreference('APP_NOTIFICATION', next)
      .subscribe({
        next: (preference) => {
          this.appNotification.set(preference.enabled);
          console.log(preference);
        },
        error: (error) => {
          this.updateError.set(
            error?.error?.message ?? 'Não foi possível atualizar a preferência.',
          );
        },
      });
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    this.close();
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.close();
  }
}
