import { ChangeDetectionStrategy, Component, input, inject } from '@angular/core';
import { DatePipe, DOCUMENT } from '@angular/common';
import { Router } from '@angular/router';
import { Notification } from '../notification.model';
import { NotificationService } from '../notification.service';

@Component({
  selector: 'app-notification-card',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './notification-card.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificationCard {
  readonly notification = input.required<Notification>();
  readonly variant = input<'compact' | 'full'>('full');
  private readonly notificationService = inject(NotificationService);
  private readonly router = inject(Router);
  private readonly document = inject(DOCUMENT);

  onSelect(): void {
    const { id, read, path, url } = this.notification();
    if (!read) {
      this.notificationService.markAsRead(id);
    }

    if (path) {
      this.router.navigate([path]);
    } else if (url) {
      this.document.defaultView?.open(url, '_blank', 'noopener');
    }
  }
}
