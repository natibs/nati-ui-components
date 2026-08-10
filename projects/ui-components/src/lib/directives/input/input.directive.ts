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
import { NatiUiControlSize } from './input.interfaces';

let nextId = 0;

@Directive({
  selector: 'input[natiUiInput]',
  host: {
    class: 'natiUiInput',
    '[class.natiUiInputSm]': `size() === 'sm'`,
    '[class.natiUiInputError]': 'hasError()',
    '[disabled]': 'disabled() || null',
    '[attr.aria-invalid]': 'hasError() || null',
    '[attr.aria-describedby]': 'errorId',
  },
})
export class NatiUiInputDirective implements AfterViewInit, OnDestroy {
  private readonly ngControl = inject(NgControl, { optional: true });
  private readonly renderer = inject(Renderer2);
  private readonly elementRef = inject(ElementRef<HTMLInputElement>);

  private wrapper: HTMLElement | null = null;
  private labelEl: HTMLElement | null = null;
  private errorEl: HTMLElement | null = null;
  private readonly refresh = signal(0);

  private readonly baseId = `nati-ui-input-${++nextId}`;
  readonly errorId = `${this.baseId}-error`;

  label = input<string | null>(null);
  errorText = input<string | null>(null);
  customErrorMessages = input<Record<string, string>>({});
  size = input<NatiUiControlSize>('md');
  width = input<string | null>('100%');
  disabled = input(false, { transform: booleanAttribute });
  required = input(false, { transform: booleanAttribute });
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
  @HostListener('input')
  protected onInteraction(): void {
    setTimeout(() => this.refresh.update((v) => v + 1));
  }

  ngAfterViewInit(): void {
    const el = this.elementRef.nativeElement;
    if (!el.id) {
      this.renderer.setAttribute(el, 'id', this.baseId);
    }

    this.wrapper = createWrapper(this.renderer, el, this.width());
    if (!this.wrapper) return;

    const label = this.label();
    if (label) {
      this.labelEl = createLabelElement(
        this.renderer,
        label,
        el.id,
        this.isRequired(),
      );
      this.renderer.appendChild(this.wrapper, this.labelEl);
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

  private syncPresentation(): void {
    const message = this.currentErrorMessage();
    if (this.errorEl) {
      setErrorText(this.renderer, this.errorEl, message);
    }
  }
}
