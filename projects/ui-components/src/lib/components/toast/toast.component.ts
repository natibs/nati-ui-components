import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  Renderer2,
  inject,
} from '@angular/core';
import { NatiUiToastService } from './toast.service';

@Component({
  selector: 'nati-ui-toast',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'natiUiToastHost' },
  template: `
    @for (toast of toastService.toasts(); track toast.id) {
      <div
        class="natiUiToast"
        [class.natiUiToastSuccess]="toast.type === 'success'"
        [class.natiUiToastDanger]="toast.type === 'danger'"
        [class.natiUiToastWarning]="toast.type === 'warning'"
        [class.natiUiToastInfo]="toast.type === 'info'"
        [class.natiUiToastLeaving]="toast.removing"
        role="status"
        aria-live="polite"
      >
        <svg class="natiUiToastIcon" viewBox="0 0 20 20" aria-hidden="true">
          @switch (toast.type) {
            @case ('success') {
              <path
                d="M4 10.5l3.5 3.5 8-8"
                fill="none"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            }
            @case ('danger') {
              <circle cx="10" cy="10" r="7.25" fill="none" stroke="currentColor" stroke-width="1.6" />
              <path d="M10 6.5v4M10 13.25h.01" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
            }
            @case ('warning') {
              <path
                d="M10 3.5 17.5 16h-15L10 3.5Z"
                fill="none"
                stroke="currentColor"
                stroke-width="1.6"
                stroke-linejoin="round"
              />
              <path d="M10 8.25v3.5M10 14.25h.01" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
            }
            @default {
              <circle cx="10" cy="10" r="7.25" fill="none" stroke="currentColor" stroke-width="1.6" />
              <path d="M10 9v4.25M10 6.25h.01" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
            }
          }
        </svg>
        <span class="natiUiToastMessage">{{ toast.message }}</span>
        @if (toast.duration === 0) {
          <button
            type="button"
            class="natiUiToastClose"
            aria-label="Dismiss notification"
            (click)="toastService.dismiss(toast.id)"
          >
            <svg viewBox="0 0 16 16" aria-hidden="true">
              <path
                d="M4 4l8 8M12 4l-8 8"
                fill="none"
                stroke="currentColor"
                stroke-width="1.6"
                stroke-linecap="round"
              />
            </svg>
          </button>
        }
      </div>
    }
  `,
})
export class NatiUiToastComponent implements OnInit, OnDestroy {
  protected readonly toastService = inject(NatiUiToastService);
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private readonly renderer = inject(Renderer2);
  private readonly document = inject(DOCUMENT);

  ngOnInit(): void {
    this.renderer.appendChild(this.document.body, this.elementRef.nativeElement);
  }

  ngOnDestroy(): void {
    const el = this.elementRef.nativeElement;
    if (el.parentNode === this.document.body) {
      this.renderer.removeChild(this.document.body, el);
    }
  }
}
