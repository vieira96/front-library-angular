import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  inject,
  signal,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LucideBell } from '@lucide/angular';
import { NotificationService } from '@/app/features/notification/notification.service';

@Component({
  selector: 'app-notification-bell',
  standalone: true,
  imports: [DatePipe, RouterLink, LucideBell],
  templateUrl: './notification-bell.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificationBell {
  private readonly notificationService = inject(NotificationService);

  readonly isOpen = signal(false);
  readonly unreadCount = this.notificationService.unreadCount;
  readonly notifications = this.notificationService.allNotifications;

  toggle(): void {
    this.isOpen.update((v) => !v);
  }

  close(): void {
    this.isOpen.set(false);
  }

  markAsRead(id: string): void {
    this.notificationService.markAsRead(id);
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
