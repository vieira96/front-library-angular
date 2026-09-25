import { Injectable, inject, signal } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../../environments/environment';
import { AccessTokenStoreService } from '../../core/auth/access-token-store.service';
import { Notification } from './notification.model';
import { NotificationService } from './notification.service';

interface RealtimeNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  path: string | null;
  url: string | null;
  createdAt: string;
  read: boolean;
  readAt: string | null;
}

@Injectable({ providedIn: 'root' })
export class NotificationRealtimeService {
  private readonly tokenStore = inject(AccessTokenStoreService);
  private readonly notifications = inject(NotificationService);
  private socket: Socket | null = null;

  readonly connected = signal(false);

  connect(): void {
    if (this.socket) {
      return;
    }
    const socket: Socket = this.createSocket();
    socket.on('connect', () => this.connected.set(true));
    socket.on('disconnect', () => this.connected.set(false));
    socket.on('notification:new', (item: RealtimeNotification) => {
      const notification: Notification = {
        ...item,
        createdAt: new Date(item.createdAt),
      };
      this.notifications.pushRealtime(notification);
    });
    this.socket = socket;
  }

  disconnect(): void {
    this.socket?.disconnect();
    this.socket = null;
    this.connected.set(false);
  }

  private createSocket(): Socket {
    return io(environment.notificationsApiBaseUrl, {
      auth: (cb) => cb({ token: this.tokenStore.token() ?? undefined }),
    });
  }
}
