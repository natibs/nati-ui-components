import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  NgZone,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NgControl } from '@angular/forms';

let nextGroupId = 0;

@Component({
  selector: 'nati-ui-radio-group',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'natiUiRadioGroup', role: 'radiogroup' },
  template: `
    @if (label()) {
      <span class="natiUiRadioGroupLabel">{{ label() }}</span>
    }
    <div class="natiUiRadioGroupItems">
      <ng-content />
    </div>
    @if (errorText()) {
      <p class="natiUiFieldError" role="alert">{{ errorText() }}</p>
    }
  `,
})
export class NatiUiRadioGroupComponent<T = unknown> implements ControlValueAccessor {
  private readonly ngControl = inject(NgControl, {
    optional: true,
    self: true,
  });
  private readonly zone = inject(NgZone);

  readonly name = `nati-ui-radio-group-${++nextGroupId}`;

  label = input<string | null>(null);
  errorText = input<string | null>(null);
  disabled = input(false, { transform: booleanAttribute });

  protected readonly value = signal<T | null>(null);
  protected readonly groupDisabled = signal(false);

  private onChangeFn: (value: T | null) => void = () => undefined;
  private onTouchedFn: () => void = () => undefined;

  constructor() {
    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }
  }

  select(value: T): void {
    if (this.disabled() || this.groupDisabled()) return;
    this.value.set(value);
    this.onChangeFn(value);
    this.onTouchedFn();
  }

  isSelected(value: T): boolean {
    return this.value() === value;
  }

  isDisabled(): boolean {
    return this.disabled() || this.groupDisabled();
  }

  markTouched(): void {
    this.zone.run(() => this.onTouchedFn());
  }

  writeValue(value: T | null): void {
    this.value.set(value);
  }

  registerOnChange(fn: (value: T | null) => void): void {
    this.onChangeFn = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouchedFn = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.groupDisabled.set(isDisabled);
  }
}
