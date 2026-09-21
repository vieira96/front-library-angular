import { DOCUMENT } from '@angular/common';
import { Component, ChangeDetectionStrategy, effect, HostListener, inject, OnDestroy, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { LucideLayoutDashboard, LucideUsers, LucideBookOpen, LucideMenu, LucideX } from '@lucide/angular';
import { Header } from '@/app/layout/header/header';
import { AuthStateService } from '@/app/core/auth/auth-state.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, Header, LucideLayoutDashboard, LucideUsers, LucideBookOpen, LucideMenu, LucideX],
  templateUrl: './admin-layout.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminLayout implements OnDestroy {
  private readonly authState = inject(AuthStateService);
  private readonly document = inject(DOCUMENT);
  private previousBodyOverflow = '';

  readonly isMenuOpen = signal(false);

  constructor() {
    effect(() => {
      if (this.isMenuOpen()) {
        this.previousBodyOverflow = this.document.body.style.overflow;
        this.document.body.style.overflow = 'hidden';
        return;
      }

      this.document.body.style.overflow = this.previousBodyOverflow;
    });
  }

  @HostListener('window:resize')
  onResize(): void {
    if (window.innerWidth >= 1024) {
      this.closeMenu();
    }
  }

  openMenu(): void {
    this.isMenuOpen.set(true);
  }

  closeMenu(): void {
    this.isMenuOpen.set(false);
  }

  ngOnDestroy(): void {
    this.document.body.style.overflow = this.previousBodyOverflow;
  }

  logout(): void {
    this.authState.logout();
  }
}
