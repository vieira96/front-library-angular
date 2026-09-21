import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { LucideBell, LucideCheckCheck } from '@lucide/angular';
import { Header } from '@/app/layout/header/header';
import { AuthStateService } from '@/app/core/auth/auth-state.service';
import { NotificationService } from './notification.service';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [Header, DatePipe, LucideBell, LucideCheckCheck],
  templateUrl: './notifications.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Notifications {
  private readonly authState = inject(AuthStateService);
  private readonly notificationService = inject(NotificationService);

  readonly notifications = this.notificationService.allNotifications;
  readonly unreadCount = this.notificationService.unreadCount;

  markAsRead(id: string): void {
    this.notificationService.markAsRead(id);
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead();
  }

  logout(): void {
    this.authState.logout();
  }
}
