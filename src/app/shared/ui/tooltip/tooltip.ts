import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  computed,
  input,
  signal,
} from '@angular/core';

type TooltipPosition = 'top' | 'right' | 'bottom' | 'left';

const POSITION_CLASSES: Record<TooltipPosition, string> = {
  top: 'bottom-full left-1/2 mb-2 -translate-x-1/2',
  right: 'left-full top-1/2 ml-2 -translate-y-1/2',
  bottom: 'left-1/2 top-full mt-2 -translate-x-1/2',
  left: 'right-full top-1/2 mr-2 -translate-y-1/2',
};

@Component({
  selector: 'app-tooltip',
  standalone: true,
  templateUrl: './tooltip.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Tooltip {
  readonly text = input.required<string>();
  readonly position = input<TooltipPosition>('top');
  readonly enabled = input(true);

  readonly visible = signal(false);
  readonly positionClasses = computed(() => POSITION_CLASSES[this.position()]);

  show(): void {
    if (this.enabled()) {
      this.visible.set(true);
    }
  }

  hide(): void {
    this.visible.set(false);
  }

  showFromClick(event: Event): void {
    if (!this.enabled()) {
      return;
    }

    event.stopPropagation();
    this.visible.set(true);
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    this.hide();
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.hide();
  }
}
