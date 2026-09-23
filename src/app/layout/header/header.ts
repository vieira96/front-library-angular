import { Component, ChangeDetectionStrategy, input, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideLogOut, LucideHome } from '@lucide/angular';
import { AuthStateService } from '@/app/core/auth/auth-state.service';
import { isAdmin } from '@/app/core/auth/helper/is-admin';
import { NotificationBell } from '@/app/shared/ui/notification-bell/notification-bell';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, LucideLogOut, LucideHome, NotificationBell],
  templateUrl: './header.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Header {
  private readonly authState = inject(AuthStateService);

  readonly title = input<string>('Library App');

  get isAdmin(): boolean {
    return isAdmin(this.authState.user());
  }

  logout(): void {
    this.authState.logout();
  }
}
