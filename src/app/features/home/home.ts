import { Component, ChangeDetectionStrategy, signal, inject, OnInit } from '@angular/core';
import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';
import { LucideLoader } from '@lucide/angular';
import { AuthStateService } from '@/app/core/auth/auth-state.service';
import { Header } from '@/app/layout/header/header';

dayjs.locale('pt-br');

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [Header, LucideLoader],
  templateUrl: './home.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Home implements OnInit {
  private readonly authState = inject(AuthStateService);

  readonly user = this.authState.user;
  readonly isLoading = signal(true);
  readonly errorMessage = signal<string | null>(null);

  ngOnInit(): void {
    this.authState.restoreSession().subscribe({
      next: () => {
        this.isLoading.set(false);
      },
      error: (err: Error) => {
        this.errorMessage.set(err.message);
        this.isLoading.set(false);
        this.authState.logout();
      },
    });
  }

  logout(): void {
    this.authState.logout();
  }

  formatDate(date: string | undefined): string {
    if (!date) return '-';
    return dayjs(date).format('DD/MM/YYYY HH:mm');
  }
}
