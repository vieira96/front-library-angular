import { HttpClient } from '@angular/common/http';
import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { catchError, of } from 'rxjs';
import { AuthStateService } from '../../core/auth/auth-state.service';
import { environment } from '../../../environments/environment';
import { Notification } from './notification.model';

interface NotificationResponse {
  id: string;
  title: string;
  message: string;
  read: boolean;
  readAt: string | null;
  createdAt: string;
  url: string | null;
  external: boolean;
}

interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
}

function toNotification(item: NotificationResponse): Notification {
  return {
    id: item.id,
    title: item.title,
    message: item.message,
    read: item.read,
    createdAt: new Date(item.createdAt),
    url: item.url,
    external: item.external,
  };
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly http = inject(HttpClient);
  private readonly authState = inject(AuthStateService);
  private readonly apiUrl = `${environment.notificationsApiBaseUrl}/notifications`;
  private readonly notifications = signal<Notification[]>([]);
  private readonly recent = signal<Notification[]>([]);

  readonly unreadCount = signal(0);
  readonly allNotifications = computed(() => this.notifications());
  readonly recentNotifications = computed(() => this.recent());

  readonly page = signal(1);
  readonly totalPages = signal(1);
  private readonly size = 10;
  private readonly bellSize = 3;

  refresh(): void {
    this.getNotifications(this.page());
    this.refreshUnreadCount();
  }

  loadRecent(): void {
    this.http
      .get<PageResponse<NotificationResponse>>(this.apiUrl, {
        params: { page: 1, size: this.bellSize },
      })
      .pipe(catchError(() => of(null)))
      .subscribe((result) => {
        if (!result) {
          return;
        }
        this.recent.set(result.content.map(toNotification));
      });
    this.refreshUnreadCount();
  }

  getNotifications(page: number): void {
    this.http
      .get<PageResponse<NotificationResponse>>(this.apiUrl, {
        params: { page, size: this.size },
      })
      .pipe(catchError(() => of(null)))
      .subscribe((result) => {
        if (!result) {
          this.notifications.set([]);
          return;
        }
        this.page.set(result.page);
        this.totalPages.set(result.totalPages);
        this.notifications.set(result.content.map(toNotification));
      });
  }

  markAsRead(id: string): void {
    const pagedTarget = this.notifications().find((n) => n.id === id);
    const bellTarget = this.recent().find((n) => n.id === id);
    if ((!pagedTarget || pagedTarget.read) && (!bellTarget || bellTarget.read)) {
      return;
    }
    this.http.patch(`${this.apiUrl}/${id}/read`, {}).subscribe({
      next: () => {
        this.notifications.update((items) =>
          items.map((n) => (n.id === id ? { ...n, read: true } : n))
        );
        this.recent.update((items) =>
          items.map((n) => (n.id === id ? { ...n, read: true } : n))
        );
        this.unreadCount.update((count) => Math.max(0, count - 1));
      },
      error: () => undefined,
    });
  }

  markAllAsRead(): void {
    if (this.unreadCount() === 0) {
      return;
    }
    this.http.patch(`${this.apiUrl}/read-all`, {}).subscribe({
      next: () => {
        this.notifications.update((items) =>
          items.map((n) => ({ ...n, read: true }))
        );
        this.recent.update((items) => items.map((n) => ({ ...n, read: true })));
        this.unreadCount.set(0);
      },
      error: () => undefined,
    });
  }

  refreshUnreadCount(): void {
    this.http
      .get<{ count: number }>(`${this.apiUrl}/unread-count`)
      .pipe(catchError(() => of(null)))
      .subscribe((result) => {
        if (result) {
          this.unreadCount.set(result.count);
        }
      });
  }
}
