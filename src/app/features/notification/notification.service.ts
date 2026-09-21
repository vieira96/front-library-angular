import { Injectable, signal, computed } from '@angular/core';
import { Notification } from './notification.model';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly notifications = signal<Notification[]>([
    {
      id: '1',
      title: 'Livro adicionado',
      message: 'O livro "Dom Casmurro" foi adicionado ao catálogo.',
      read: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 30),
    },
    {
      id: '2',
      title: 'Autor cadastrado',
      message: 'Machado de Assis foi cadastrado no sistema.',
      read: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
    },
    {
      id: '3',
      title: 'Livro removido',
      message: 'O livro "Memórias Póstumas de Brás Cubas" foi removido.',
      read: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
    },
  ]);

  readonly unreadCount = computed(() =>
    this.notifications().filter((n) => !n.read).length
  );

  readonly allNotifications = computed(() => this.notifications());

  markAsRead(id: string): void {
    this.notifications.update((items) =>
      items.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }

  markAllAsRead(): void {
    this.notifications.update((items) =>
      items.map((n) => ({ ...n, read: true }))
    );
  }
}
