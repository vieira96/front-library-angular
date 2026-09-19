import { Component, ChangeDetectionStrategy, input, output, signal, OnInit, OnChanges, OnDestroy } from '@angular/core';
import { LucideCircleCheck, LucideCircleX, LucideX } from '@lucide/angular';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [LucideCircleCheck, LucideCircleX, LucideX],
  templateUrl: './toast.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Toast implements OnInit, OnChanges, OnDestroy {
  readonly message = input.required<string>();
  readonly type = input<'success' | 'error'>('success');

  readonly dismissed = output<void>();

  readonly visible = signal(false);

  private timeoutId: ReturnType<typeof setTimeout> | null = null;
  private readonly dismissDelay = 3000;

  ngOnInit(): void {
    this.show();
  }

  ngOnChanges(): void {
    this.show();
  }

  ngOnDestroy(): void {
    this.clearTimeout();
  }

  onMouseEnter(): void {
    this.clearTimeout();
  }

  onMouseLeave(): void {
    this.startTimer();
  }

  close(): void {
    this.clearTimeout();
    this.visible.set(false);
    this.dismissed.emit();
  }

  private show(): void {
    this.clearTimeout();
    this.visible.set(true);
    this.startTimer();
  }

  private startTimer(): void {
    this.timeoutId = setTimeout(() => {
      this.visible.set(false);
      this.dismissed.emit();
    }, this.dismissDelay);
  }

  private clearTimeout(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }
}
