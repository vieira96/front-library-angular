import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { LucideBell, LucideCheckCheck } from '@lucide/angular';
import { Header } from '../../layout/header/header';
import { NotificationService } from './notification.service';
import { NotificationCard } from './notification-card/notification-card';
import { Pagination } from '../../shared/ui/pagination/pagination';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [Header, LucideBell, LucideCheckCheck, NotificationCard, Pagination],
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
    this.notificationService.loadPage(page);
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead();
  }
}
