import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  inject,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideBell } from '@lucide/angular';
import { NotificationService } from '@/app/features/notification/notification.service';
import { NotificationCard } from '@/app/features/notification/notification-card/notification-card';

@Component({
  selector: 'app-notification-bell',
  standalone: true,
  imports: [RouterLink, LucideBell, NotificationCard],
  templateUrl: './notification-bell.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificationBell {
  private readonly notificationService = inject(NotificationService);

  readonly isOpen = signal(false);
  readonly unreadCount = this.notificationService.unreadCount;
  readonly notifications = this.notificationService.allNotifications;

  toggle(): void {
    const opening = !this.isOpen();
    this.isOpen.set(opening);
    if (opening) {
      this.notificationService.refresh();
    }
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
