import {
  AfterViewInit,
  booleanAttribute,
  computed,
  Directive,
  effect,
  ElementRef,
  HostListener,
  inject,
  input,
  numberAttribute,
  OnDestroy,
  Renderer2,
  signal,
} from '@angular/core';
import { NgControl } from '@angular/forms';
import {
  ValidateOn,
  controlHasError,
  controlIsRequired,
  resolveControlErrorMessage,
} from '../../utils/control-error.util';
import {
  createErrorElement,
  createLabelElement,
  createWrapper,
  setErrorText,
} from '../../utils/field-dom.util';
import { NatiUiControlSize } from '../input/input.interfaces';

let nextId = 0;

@Directive({
  selector: 'textarea[natiUiTextarea]',
  host: {
    class: 'natiUiTextarea',
    '[class.natiUiTextareaSm]': `size() === 'sm'`,
    '[class.natiUiTextareaError]': 'hasError()',
    '[disabled]': 'disabled() || null',
    '[attr.rows]': 'rows()',
    '[attr.aria-invalid]': 'hasError() || null',
    '[attr.aria-describedby]': 'errorId',
  },
})
export class NatiUiTextareaDirective implements AfterViewInit, OnDestroy {
  private readonly ngControl = inject(NgControl, { optional: true });
  private readonly renderer = inject(Renderer2);
  private readonly elementRef = inject(ElementRef<HTMLTextAreaElement>);

  private wrapper: HTMLElement | null = null;
  private errorEl: HTMLElement | null = null;
  private readonly refresh = signal(0);

  private readonly baseId = `nati-ui-textarea-${++nextId}`;
  readonly errorId = `${this.baseId}-error`;

  label = input<string | null>(null);
  errorText = input<string | null>(null);
  customErrorMessages = input<Record<string, string>>({});
  size = input<NatiUiControlSize>('md');
  width = input<string | null>('100%');
  rows = input(4, { transform: numberAttribute });
  disabled = input(false, { transform: booleanAttribute });
  required = input(false, { transform: booleanAttribute });
  autoResize = input(false, { transform: booleanAttribute });
  validateOn = input<ValidateOn>('change');

  protected hasError = computed(() => {
    this.refresh();
    return controlHasError(this.ngControl, this.validateOn());
  });

  private isRequired = computed(() => {
    this.refresh();
    return this.required() || controlIsRequired(this.ngControl);
  });

  private currentErrorMessage = computed(() => {
    this.refresh();
    return resolveControlErrorMessage(this.ngControl, {
      explicitError: this.errorText(),
      customMessages: this.customErrorMessages(),
      validateOn: this.validateOn(),
    });
  });

  constructor() {
    effect(() => this.syncPresentation());
  }

  @HostListener('blur')
  protected onBlur(): void {
    setTimeout(() => this.refresh.update((v) => v + 1));
  }

  @HostListener('input')
  protected onInput(): void {
    this.refresh.update((v) => v + 1);
    if (this.autoResize()) this.grow();
  }

  ngAfterViewInit(): void {
    const el = this.elementRef.nativeElement;
    if (!el.id) {
      this.renderer.setAttribute(el, 'id', this.baseId);
    }

    if (this.autoResize()) {
      this.renderer.setStyle(el, 'resize', 'none');
      this.renderer.setStyle(el, 'overflow-y', 'hidden');
      requestAnimationFrame(() => this.grow());
    }

    this.wrapper = createWrapper(this.renderer, el, this.width());
    if (!this.wrapper) return;

    const label = this.label();
    if (label) {
      const labelEl = createLabelElement(
        this.renderer,
        label,
        el.id,
        this.isRequired(),
      );
      this.renderer.appendChild(this.wrapper, labelEl);
    }

    this.renderer.appendChild(this.wrapper, el);

    this.errorEl = createErrorElement(this.renderer, this.errorId);
    this.renderer.appendChild(this.wrapper, this.errorEl);

    this.syncPresentation();
  }

  ngOnDestroy(): void {
    if (this.wrapper?.parentNode) {
      this.renderer.removeChild(this.wrapper.parentNode, this.wrapper);
    }
  }

  private grow(): void {
    const el = this.elementRef.nativeElement;
    this.renderer.setStyle(el, 'height', 'auto');
    this.renderer.setStyle(el, 'height', `${el.scrollHeight}px`);
  }

  private syncPresentation(): void {
    if (this.errorEl) {
      setErrorText(this.renderer, this.errorEl, this.currentErrorMessage());
    }
  }
}
