import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { LucideLogOut } from '@lucide/angular';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [LucideLogOut],
  templateUrl: './header.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Header {
  readonly title = input<string>('Library App');
  readonly userName = input<string>('');
  readonly logoutClick = output<void>();
}
