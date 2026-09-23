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

  readonly unreadCount = signal(0);
  readonly allNotifications = computed(() => this.notifications());

  constructor() {
    effect(() => {
      if (this.authState.user()) {
        this.refresh();
      } else {
        this.notifications.set([]);
        this.unreadCount.set(0);
      }
    });
  }
  readonly page = signal(1);
  readonly totalPages = signal(1);
  private readonly size = 10;

  refresh(): void {
    this.loadPage(this.page());
    this.refreshUnreadCount();
  }

  loadPage(page: number): void {
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
    const target = this.notifications().find((n) => n.id === id);
    if (!target || target.read) {
      return;
    }
    this.http.patch(`${this.apiUrl}/${id}/read`, {}).subscribe({
      next: () => {
        this.notifications.update((items) =>
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
