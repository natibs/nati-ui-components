import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  input,
  output,
  signal,
  viewChildren,
} from '@angular/core';
import { ControlValueAccessor, NgControl } from '@angular/forms';
import {
  controlHasError,
  controlIsRequired,
  resolveControlErrorMessage,
} from '../../utils/control-error.util';
import { NatiUiControlSize, NatiUiOtpCharset } from './otp.interfaces';

let nextId = 0;

const CHARSET_PATTERNS: Record<NatiUiOtpCharset, RegExp> = {
  numeric: /[0-9]/g,
  alphanumeric: /[a-zA-Z0-9]/g,
};

@Component({
  selector: 'nati-ui-otp',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'natiUiOtpHost' },
  template: `
    <div class="natiUiField">
      @if (label()) {
        <label class="natiUiFieldLabel" [for]="inputIds()[0]">
          {{ label() }}
          @if (isRequired()) {
            <span class="natiUiFieldRequiredMark" aria-hidden="true"> *</span>
          }
        </label>
      }

      <div
        class="natiUiOtp"
        [class.natiUiOtpSm]="size() === 'sm'"
        [class.natiUiOtpError]="hasError()"
        (paste)="onContainerPaste($event)"
      >
        @for (id of inputIds(); track id; let i = $index) {
          <input
            #otpInput
            [id]="id"
            class="natiUiOtpDigit"
            type="text"
            inputmode="text"
            autocomplete="one-time-code"
            [attr.aria-label]="'Character ' + (i + 1) + ' of ' + length()"
            [attr.aria-describedby]="hasError() ? errorId : null"
            [disabled]="isDisabled()"
            [value]="values()[i]"
            (input)="onInput($event, i)"
            (keydown)="onKeyDown($event, i)"
            (focus)="onFocus(i)"
            (blur)="onBlur()"
          />
        }
      </div>

      @if (currentError()) {
        <p class="natiUiFieldError" role="alert" [id]="errorId">{{ currentError() }}</p>
      }
    </div>
  `,
})
export class NatiUiOtpComponent implements ControlValueAccessor {
  private readonly ngControl = inject(NgControl, { optional: true, self: true });
  private readonly inputRefs = viewChildren<ElementRef<HTMLInputElement>>('otpInput');

  private readonly baseId = `nati-ui-otp-${++nextId}`;
  readonly errorId = `${this.baseId}-error`;

  length = input(6);
  charset = input<NatiUiOtpCharset>('numeric');
  label = input<string | null>(null);
  size = input<NatiUiControlSize>('md');
  disabled = input(false, { transform: booleanAttribute });
  required = input(false, { transform: booleanAttribute });
  errorText = input<string | null>(null);
  customErrorMessages = input<Record<string, string>>({});

  valueChange = output<string>();
  complete = output<string>();

  protected readonly values = signal<string[]>([]);
  private readonly refresh = signal(0);
  private disabledState = signal(false);
  private currentFocusIndex = 0;

  protected readonly inputIds = computed(() =>
    Array.from({ length: this.length() }, (_, i) => `${this.baseId}-${i}`),
  );

  protected readonly isDisabled = computed(() => this.disabled() || this.disabledState());
  protected readonly isRequired = computed(() => this.required() || controlIsRequired(this.ngControl));

  protected readonly hasError = computed(() => {
    this.refresh();
    return this.errorText() ? true : controlHasError(this.ngControl);
  });

  protected readonly currentError = computed(() => {
    this.refresh();
    return resolveControlErrorMessage(this.ngControl, {
      explicitError: this.errorText(),
      customMessages: this.customErrorMessages(),
    });
  });

  private onChangeFn: (value: string) => void = () => undefined;
  private onTouchedFn: () => void = () => undefined;

  constructor() {
    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }
    effect(() => {
      const len = this.length();
      if (this.values().length !== len) {
        this.values.set(Array(len).fill(''));
      }
    });
  }

  writeValue(value: string | null): void {
    const chars = this.sanitize(value ?? '').split('').slice(0, this.length());
    this.values.set([...chars, ...Array(this.length() - chars.length).fill('')]);
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChangeFn = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouchedFn = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabledState.set(isDisabled);
  }

  /** Clears every box and returns focus to the first one. */
  clear(): void {
    this.values.set(Array(this.length()).fill(''));
    this.emit();
    this.focusInput(0);
  }

  protected onInput(event: Event, index: number): void {
    const raw = (event.target as HTMLInputElement).value;
    const sanitized = this.sanitize(raw);

    if (sanitized.length <= 1) {
      const next = [...this.values()];
      next[index] = sanitized;
      this.values.set(next);
      this.emit();
      if (sanitized && index < this.length() - 1) this.focusInput(index + 1);
      return;
    }

    this.fillFrom(index, sanitized);
  }

  protected onKeyDown(event: KeyboardEvent, index: number): void {
    if (event.ctrlKey || event.metaKey) return;

    if (event.key === 'Backspace') {
      if (!this.values()[index] && index > 0) {
        this.focusInput(index - 1);
        event.preventDefault();
      }
      return;
    }
    if (event.key === 'ArrowLeft') {
      if (index > 0) this.focusInput(index - 1);
      event.preventDefault();
      return;
    }
    if (event.key === 'ArrowRight') {
      if (index < this.length() - 1) this.focusInput(index + 1);
      event.preventDefault();
      return;
    }
    if (['Tab', 'Delete', 'Home', 'End'].includes(event.key)) return;

    if (event.key.length === 1 && !this.sanitize(event.key)) {
      event.preventDefault();
    }
  }

  protected onContainerPaste(event: ClipboardEvent): void {
    const pasted = event.clipboardData?.getData('text') ?? '';
    if (!pasted) return;
    event.preventDefault();
    this.fillFrom(this.currentFocusIndex, this.sanitize(pasted));
  }

  protected onFocus(index: number): void {
    this.currentFocusIndex = index;
  }

  protected onBlur(): void {
    this.refresh.update((v) => v + 1);
    this.onTouchedFn();
  }

  private fillFrom(index: number, chars: string): void {
    const next = [...this.values()];
    let i = 0;
    for (; i < chars.length && index + i < this.length(); i++) {
      next[index + i] = chars[i];
    }
    this.values.set(next);
    this.emit();
    this.focusInput(Math.min(index + i, this.length() - 1));
  }

  private emit(): void {
    const value = this.values().join('');
    this.onChangeFn(value);
    this.valueChange.emit(value);
    if (value.length === this.length() && !value.includes('')) {
      this.complete.emit(value);
    }
  }

  private sanitize(raw: string): string {
    const matches = raw.match(CHARSET_PATTERNS[this.charset()]) ?? [];
    const joined = matches.join('');
    return this.charset() === 'alphanumeric' ? joined.toUpperCase() : joined;
  }

  private focusInput(index: number): void {
    const el = this.inputRefs()[index]?.nativeElement;
    el?.focus();
    el?.select();
  }
}
