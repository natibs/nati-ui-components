import {
  booleanAttribute,
  Directive,
  effect,
  ElementRef,
  HostListener,
  inject,
  input,
  Renderer2,
} from '@angular/core';
import { NatiUiButtonSize, NatiUiButtonVariant } from './button.interfaces';

@Directive({
  selector: 'button[natiUiButton], a[natiUiButton]',
  host: {
    class: 'natiUiBtn',
    '[class]': 'variantClass()',
    '[class.natiUiBtnSm]': `size() === 'sm'`,
    '[class.natiUiBtnLg]': `size() === 'lg'`,
    '[class.natiUiBtnLoading]': 'loading()',
    '[attr.aria-busy]': 'loading() || null',
    '[attr.aria-disabled]': 'disabled() || loading() || null',
  },
})
export class NatiUiButtonDirective {
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private readonly renderer = inject(Renderer2);
  private spinnerEl: HTMLElement | null = null;

  variant = input<NatiUiButtonVariant>('primary');
  size = input<NatiUiButtonSize>('md');
  disabled = input(false, { transform: booleanAttribute });
  loading = input(false, { transform: booleanAttribute });

  protected variantClass = () => `natiUiBtn${capitalize(this.variant())}`;

  constructor() {
    const el = this.elementRef.nativeElement;
    if (el.tagName === 'BUTTON' && !el.hasAttribute('type')) {
      this.renderer.setAttribute(el, 'type', 'button');
    }

    effect(() => {
      const isDisabled = this.disabled() || this.loading();
      if (el.tagName === 'BUTTON') {
        this.renderer.setProperty(el, 'disabled', isDisabled);
      } else if (isDisabled) {
        this.renderer.setAttribute(el, 'tabindex', '-1');
      } else {
        this.renderer.removeAttribute(el, 'tabindex');
      }
    });

    effect(() => {
      if (this.loading() && !this.spinnerEl) {
        this.spinnerEl = this.renderer.createElement('span');
        this.renderer.addClass(this.spinnerEl, 'natiUiBtnSpinner');
        this.renderer.setAttribute(this.spinnerEl, 'aria-hidden', 'true');
        this.renderer.insertBefore(el, this.spinnerEl, el.firstChild);
      } else if (!this.loading() && this.spinnerEl) {
        this.renderer.removeChild(el, this.spinnerEl);
        this.spinnerEl = null;
      }
    });
  }

  @HostListener('click', ['$event'])
  protected onClick(event: Event): void {
    if (this.disabled() || this.loading()) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  }
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
