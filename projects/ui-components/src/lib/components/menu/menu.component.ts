import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  HostListener,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { NatiUiMenuCloseEvent, NatiUiMenuCloseReason, NatiUiMenuPosition } from './menu.interfaces';

const MOBILE_BREAKPOINT_QUERY = '(max-width: 768px)';
const SWIPE_CLOSE_RATIO = 0.3;

/**
 * A trigger-agnostic slide-over / floating dropdown menu shell.
 *
 * Renders as a floating panel anchored to a corner on wide viewports, and as a
 * full-height slide-over panel with a blurred backdrop on narrow ones (swipeable
 * to dismiss). The trigger button and panel content are entirely up to the
 * consumer — call `open()`/`close()`/`toggle()` via a template reference.
 */
@Component({
  selector: 'nati-ui-menu',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'natiUiMenuHost',
    '[class.natiUiMenuHostLeft]': "position() === 'left'",
    '[class.natiUiMenuHostRight]': "position() === 'right'",
  },
  template: `
    <div
      class="natiUiMenuOverlay"
      [class.natiUiMenuOverlayOpen]="isOpen()"
      (click)="onOverlayClick()"
      aria-hidden="true"
    ></div>

    <div
      #panel
      class="natiUiMenuPanel"
      [class.natiUiMenuPanelOpen]="isOpen()"
      [class.natiUiMenuPanelDragging]="dragging()"
      [style.--nati-ui-menu-panel-width]="panelWidth()"
      [style.--nati-ui-menu-panel-mobile-width]="mobilePanelWidth()"
      [style.--nati-ui-menu-anchor-top]="anchorTop()"
      [style.--nati-ui-menu-anchor-inset]="anchorInset()"
      [style.transform]="panelTransform()"
      [attr.aria-hidden]="!isOpen()"
      (touchstart)="onTouchStart($event)"
      (touchmove)="onTouchMove($event)"
      (touchend)="onTouchEnd()"
    >
      <ng-content></ng-content>
    </div>
  `,
})
export class NatiUiMenuComponent {
  /** Which edge the panel is anchored to (desktop dropdown) and slides in from (mobile). */
  position = input<NatiUiMenuPosition>('right');
  /** Floating panel width on wide viewports. */
  panelWidth = input('300px');
  /** Slide-over panel width on narrow viewports (capped to 85vw). */
  mobilePanelWidth = input('340px');
  /** Distance from the top of the viewport to the floating panel (desktop only). */
  anchorTop = input('72px');
  /** Distance from the side edge to the floating panel (desktop only). */
  anchorInset = input('var(--nati-ui-space-4)');
  /** Whether clicking the overlay or pressing Escape closes the menu. */
  dismissible = input(true, { transform: booleanAttribute });

  closed = output<NatiUiMenuCloseEvent>();

  private readonly panelRef = viewChild<ElementRef<HTMLElement>>('panel');

  protected readonly isOpen = signal(false);
  protected readonly dragging = signal(false);
  protected readonly dragOffset = signal(0);

  private touchStartX = 0;

  protected readonly panelTransform = computed(() => {
    if (!this.isOpen() || this.dragOffset() === 0) return null;
    return `translateX(${this.dragOffset()}px)`;
  });

  @HostListener('document:keydown.escape')
  protected onEscape(): void {
    if (this.isOpen() && this.dismissible()) this.close('escape');
  }

  open(): void {
    this.isOpen.set(true);
  }

  close(reason: NatiUiMenuCloseReason = 'api'): void {
    if (!this.isOpen()) return;
    this.isOpen.set(false);
    this.dragOffset.set(0);
    this.closed.emit({ reason });
  }

  toggle(): void {
    if (this.isOpen()) {
      this.close('api');
    } else {
      this.open();
    }
  }

  protected onOverlayClick(): void {
    if (this.dismissible()) this.close('overlay');
  }

  protected onTouchStart(event: TouchEvent): void {
    if (!window.matchMedia(MOBILE_BREAKPOINT_QUERY).matches) return;
    this.touchStartX = event.touches[0].clientX;
    this.dragging.set(true);
  }

  protected onTouchMove(event: TouchEvent): void {
    if (!this.dragging()) return;
    const raw = event.touches[0].clientX - this.touchStartX;
    const delta = this.position() === 'right' ? Math.max(0, raw) : Math.min(0, raw);
    this.dragOffset.set(delta);
  }

  protected onTouchEnd(): void {
    if (!this.dragging()) return;
    this.dragging.set(false);

    const panelWidth = this.panelRef()?.nativeElement.offsetWidth ?? 320;
    if (Math.abs(this.dragOffset()) > panelWidth * SWIPE_CLOSE_RATIO) {
      this.close('swipe');
    } else {
      this.dragOffset.set(0);
    }
  }
}
