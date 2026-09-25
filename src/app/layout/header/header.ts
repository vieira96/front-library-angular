import { Component, ChangeDetectionStrategy, input, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideLogOut, LucideHome } from '@lucide/angular';
import { AuthStateService } from '../../core/auth/auth-state.service';
import { isAdmin } from '../../core/auth/helper/is-admin';
import { NotificationService } from '../../features/notification/notification.service';
import { NotificationRealtimeService } from '../../features/notification/notification-realtime.service';
import { NotificationBell } from '../../shared/ui/notification-bell/notification-bell';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, LucideLogOut, LucideHome, NotificationBell],
  templateUrl: './header.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Header {
  private readonly authState = inject(AuthStateService);
  private readonly notificationService = inject(NotificationService);
  private readonly realtime = inject(NotificationRealtimeService);

  readonly title = input<string>('Library App');

  get isAdmin(): boolean {
    return isAdmin(this.authState.user());
  }

  logout(): void {
    this.realtime.disconnect();
    this.notificationService.clearCache();
    this.authState.logout();
  }
}
