import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  inject,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideBell } from '@lucide/angular';
import { NotificationService } from '../../../features/notification/notification.service';
import { NotificationRealtimeService } from '../../../features/notification/notification-realtime.service';
import { NotificationCard } from '../../../features/notification/notification-card/notification-card';

@Component({
  selector: 'app-notification-bell',
  standalone: true,
  imports: [RouterLink, LucideBell, NotificationCard],
  templateUrl: './notification-bell.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificationBell {
  private readonly notificationService = inject(NotificationService);
  private readonly realtime = inject(NotificationRealtimeService);

  readonly isOpen = signal(false);
  readonly unreadCount = this.notificationService.unreadCount;
  readonly notifications = this.notificationService.recentNotifications;

  ngOnInit(): void {
    this.notificationService.loadRecent();
    this.realtime.connect();
  }

  toggle(): void {
    this.isOpen.update((open) => !open);
  }

  close(): void {
    this.isOpen.set(false);
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
