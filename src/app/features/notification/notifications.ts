import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { LucideBell, LucideCheckCheck, LucideSettings } from '@lucide/angular';
import { NotificationService } from './notification.service';
import { NotificationCard } from './notification-card/notification-card';
import { Pagination } from '../../shared/ui/pagination/pagination';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [LucideBell, LucideCheckCheck, LucideSettings, NotificationCard, Pagination],
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
    this.notificationService.refresh();
  }

  goToPage(page: number): void {
    this.notificationService.getNotifications(page);
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead();
  }
}
