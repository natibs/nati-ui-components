import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  input,
  output,
  viewChild,
} from '@angular/core';
import { NatiUiModalCloseEvent, NatiUiModalSize } from './modal.interfaces';

@Component({
  selector: 'nati-ui-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- eslint-disable @angular-eslint/template/click-events-have-key-events, @angular-eslint/template/interactive-supports-focus -->
    <dialog
      #dialogEl
      class="natiUiModal"
      [class]="sizeClass()"
      [attr.closedby]="dismissible() ? 'any' : 'none'"
      (close)="handleNativeClose()"
      (cancel)="handleCancel($event)"
      (click)="handleBackdropClick($event)"
    >
      <div class="natiUiModalPanel" (click)="$event.stopPropagation()">
        @if (title() || showCloseButton()) {
          <header class="natiUiModalHeader">
            @if (title()) {
              <h2 class="natiUiModalTitle">{{ title() }}</h2>
            }
            @if (showCloseButton()) {
              <button
                type="button"
                class="natiUiModalClose"
                aria-label="Close dialog"
                (click)="close(undefined, 'close-button')"
              >
                <svg viewBox="0 0 20 20" aria-hidden="true">
                  <path
                    d="M5 5l10 10M15 5 5 15"
                    stroke="currentColor"
                    stroke-width="1.6"
                    stroke-linecap="round"
                  />
                </svg>
              </button>
            }
          </header>
        }
        <div class="natiUiModalBody">
          <ng-content></ng-content>
        </div>
        <ng-content select="[modal-footer]"></ng-content>
      </div>
    </dialog>
    <!-- eslint-enable @angular-eslint/template/click-events-have-key-events, @angular-eslint/template/interactive-supports-focus -->
  `,
})
export class NatiUiModalComponent<T = unknown> {
  private readonly dialogRef =
    viewChild.required<ElementRef<HTMLDialogElement>>('dialogEl');

  title = input<string | null>(null);
  size = input<NatiUiModalSize>('md');
  showCloseButton = input(true, { transform: booleanAttribute });
  dismissible = input(true, { transform: booleanAttribute });

  closed = output<NatiUiModalCloseEvent<T>>();

  protected sizeClass = () => `natiUiModal${capitalize(this.size())}`;

  private pendingClose: NatiUiModalCloseEvent<T> | null = null;

  open(): void {
    const dialog = this.dialogRef().nativeElement;
    if (!dialog.open) dialog.showModal();
  }

  close(data?: T, reason: NatiUiModalCloseEvent<T>['reason'] = 'api'): void {
    const dialog = this.dialogRef().nativeElement;
    if (!dialog.open) return;
    this.pendingClose = { reason, data };
    dialog.close();
  }

  protected handleNativeClose(): void {
    const event = this.pendingClose ?? { reason: 'cancel' as const };
    this.pendingClose = null;
    this.closed.emit(event);
  }

  protected handleCancel(event: Event): void {
    if (!this.dismissible()) {
      event.preventDefault();
    }
  }

  protected handleBackdropClick(event: MouseEvent): void {
    if (!this.dismissible()) return;
    if (event.target === this.dialogRef().nativeElement) {
      this.close(undefined, 'backdrop');
    }
  }
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
