import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { LucideBell, LucideCheckCheck } from '@lucide/angular';
import { NotificationService } from './notification.service';
import { NotificationCard } from './notification-card/notification-card';
import { NotificationConfigButton } from './notification-config-button/notification-config-button';
import { Pagination } from '../../shared/ui/pagination/pagination';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [LucideBell, LucideCheckCheck, NotificationCard, NotificationConfigButton, Pagination],
  templateUrl: './notifications.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Notifications implements OnInit {
  private readonly notificationService = inject(NotificationService);

  readonly notifications = this.notificationService.allNotifications;
  readonly unreadCount = this.notificationService.unreadCount;
  readonly page = this.notificationService.page;
  readonly totalPages = this.notificationService.totalPages;

  ngOnInit(): void {
    this.notificationService.getNotifications(1);
  }

  goToPage(page: number): void {
    this.notificationService.getNotifications(page);
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead();
  }
}
