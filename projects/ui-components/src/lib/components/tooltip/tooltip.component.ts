import { ChangeDetectionStrategy, Component, ElementRef, inject, input, output, signal } from '@angular/core';
import { NatiUiTooltipPlacement } from './tooltip.interfaces';

let nextId = 0;

// A short grace period between leaving the trigger and actually hiding, so a
// user moving the mouse from the word toward the bubble (crossing the small
// visual gap between them) doesn't get the tooltip yanked away mid-transit.
const HIDE_GRACE_MS = 150;

@Component({
  selector: 'nati-ui-tooltip',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'natiUiTooltip',
    tabindex: '0',
    '[attr.aria-describedby]': 'visible() ? tooltipId : null',
    '(mouseenter)': 'scheduleShow()',
    '(mouseleave)': 'scheduleHide()',
    '(focus)': 'scheduleShow()',
    '(blur)': 'scheduleHide()',
    // Touch has no hover, so a tap maps to focus — but it shouldn't wait out
    // the hover delay. This fires first and starts a 0-delay timer; the
    // showTimer guard below then makes the focus event that follows the
    // same tap a no-op instead of scheduling a second, delayed show.
    '(touchstart)': 'scheduleShow(true)',
  },
  template: `
    <ng-content />
    @if (visible()) {
      <span
        [id]="tooltipId"
        class="natiUiTooltipBubble"
        [class.natiUiTooltipBubbleBottom]="placement() === 'bottom'"
        [attr.dir]="bubbleDir()"
        role="tooltip"
        (mouseenter)="cancelHide()"
        (mouseleave)="scheduleHide()"
      >
        {{ text() }}
      </span>
    }
  `,
})
export class NatiUiTooltipComponent {
  text = input.required<string>();
  delay = input<number>(1500);
  disabled = input<boolean>(false);
  // Overrides text direction inside the bubble only — useful when the trigger
  // content and the tooltip text are in different scripts (e.g. a Hebrew word
  // with a German-language hint), where the bubble shouldn't just inherit the
  // trigger's inherited direction.
  bubbleDir = input<'ltr' | 'rtl' | undefined>(undefined);

  // Emits every time the bubble actually becomes visible (not just the first
  // time) — callers that only care about "used a hint at all" should debounce
  // that themselves, since this component has no opinion on app-level state.
  shown = output<void>();

  protected readonly visible = signal(false);
  protected readonly placement = signal<NatiUiTooltipPlacement>('top');
  protected readonly tooltipId = `natiUiTooltip${++nextId}`;

  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private showTimer?: ReturnType<typeof setTimeout>;
  private hideTimer?: ReturnType<typeof setTimeout>;

  protected scheduleShow(immediate = false): void {
    if (this.disabled()) return;
    this.cancelHide();
    if (this.visible() || this.showTimer) return;

    this.showTimer = setTimeout(() => {
      this.showTimer = undefined;
      this.placement.set(this.pickPlacement());
      this.visible.set(true);
      this.shown.emit();
    }, immediate ? 0 : this.delay());
  }

  protected scheduleHide(): void {
    if (this.showTimer) {
      clearTimeout(this.showTimer);
      this.showTimer = undefined;
    }
    if (!this.visible() || this.hideTimer) return;

    this.hideTimer = setTimeout(() => {
      this.hideTimer = undefined;
      this.visible.set(false);
    }, HIDE_GRACE_MS);
  }

  protected cancelHide(): void {
    if (this.hideTimer) {
      clearTimeout(this.hideTimer);
      this.hideTimer = undefined;
    }
  }

  // Dropdown-style flip: prefer top, fall back to bottom only if there's
  // genuinely not enough room above in the viewport.
  private pickPlacement(): NatiUiTooltipPlacement {
    const ESTIMATED_BUBBLE_HEIGHT = 48;
    const rect = this.elementRef.nativeElement.getBoundingClientRect();
    return rect.top < ESTIMATED_BUBBLE_HEIGHT ? 'bottom' : 'top';
  }
}
