import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { catchError, of } from 'rxjs';
import { environment } from '@/environments/environment';
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
  private readonly apiUrl = `${environment.notificationsApiBaseUrl}/notifications`;
  private readonly notifications = signal<Notification[]>([]);

  readonly unreadCount = computed(() =>
    this.notifications().filter((n) => !n.read).length
  );

  readonly allNotifications = computed(() => this.notifications());
  readonly page = signal(1);
  readonly totalPages = signal(1);
  private readonly size = 10;

  refresh(): void {
    this.loadPage(this.page());
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
    this.http.patch(`${this.apiUrl}/${id}/read`, {}).subscribe({
      next: () =>
        this.notifications.update((items) =>
          items.map((n) => (n.id === id ? { ...n, read: true } : n))
        ),
      error: () => undefined,
    });
  }

  markAllAsRead(): void {
    this.http.patch(`${this.apiUrl}/read-all`, {}).subscribe({
      next: () =>
        this.notifications.update((items) =>
          items.map((n) => ({ ...n, read: true }))
        ),
      error: () => undefined,
    });
  }
}
