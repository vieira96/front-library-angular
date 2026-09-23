import { ChangeDetectionStrategy, Component, input, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
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

  onSelect(): void {
    if (!this.notification().read) {
      this.notificationService.markAsRead(this.notification().id);
    }

    // fazer redirecionamento para a pagina do livro depois
  }
}
