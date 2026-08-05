import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  input,
  output,
  signal,
  ViewChild,
} from '@angular/core';
import { ControlValueAccessor, NgControl } from '@angular/forms';
import {
  controlHasError,
  controlIsRequired,
  resolveControlErrorMessage,
} from '../../utils/control-error.util';

let nextId = 0;

@Component({
  selector: 'nati-ui-checkbox',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'natiUiCheckboxHost' },
  template: `
    <label class="natiUiCheckbox" [class.natiUiCheckboxError]="hasError()">
      <input
        #checkboxInput
        type="checkbox"
        class="natiUiCheckboxInput"
        [id]="inputId"
        [checked]="checked()"
        [indeterminate]="indeterminate()"
        [disabled]="isDisabled()"
        [attr.aria-describedby]="description() ? descriptionId : null"
        (change)="onNativeChange($event)"
        (blur)="onTouched()"
      />
      <span class="natiUiCheckboxBox" aria-hidden="true">
        @if (checked() && !indeterminate()) {
          <svg viewBox="0 0 16 16" class="natiUiCheckboxIcon">
            <path
              d="M3.5 8.5l3 3 6-6"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        }
        @if (indeterminate()) {
          <svg viewBox="0 0 16 16" class="natiUiCheckboxIcon">
            <path
              d="M3.5 8h9"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
            />
          </svg>
        }
      </span>
      <span class="natiUiCheckboxText">
        @if (label()) {
          <span class="natiUiCheckboxLabel">
            {{ label() }}
            @if (isRequired()) {
              <span aria-hidden="true"> *</span>
            }
          </span>
        }
        @if (description()) {
          <span class="natiUiCheckboxDescription" [id]="descriptionId">{{
            description()
          }}</span>
        }
      </span>
    </label>
    @if (currentError()) {
      <p class="natiUiFieldError" role="alert">{{ currentError() }}</p>
    }
  `,
})
export class NatiUiCheckboxComponent implements ControlValueAccessor {
  private readonly ngControl = inject(NgControl, {
    optional: true,
    self: true,
  });

  @ViewChild('checkboxInput') private readonly checkboxInput?: ElementRef<HTMLInputElement>;

  readonly inputId = `nati-ui-checkbox-${++nextId}`;
  readonly descriptionId = `${this.inputId}-description`;

  label = input<string | null>(null);
  description = input<string | null>(null);
  required = input(false, { transform: booleanAttribute });
  indeterminate = input(false, { transform: booleanAttribute });
  disabled = input(false, { transform: booleanAttribute });
  errorText = input<string | null>(null);
  customErrorMessages = input<Record<string, string>>({});

  checkedChange = output<boolean>();

  protected checked = signal(false);
  private disabledState = signal(false);

  protected isDisabled = computed(() => this.disabled() || this.disabledState());
  protected isRequired = computed(
    () => this.required() || controlIsRequired(this.ngControl),
  );
  protected hasError = computed(() =>
    this.errorText() ? true : controlHasError(this.ngControl),
  );
  protected currentError = computed(() =>
    resolveControlErrorMessage(this.ngControl, {
      explicitError: this.errorText(),
      customMessages: this.customErrorMessages(),
    }),
  );

  private onChangeFn: (value: boolean) => void = () => undefined;
  protected onTouched: () => void = () => undefined;

  constructor() {
    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }
  }

  writeValue(value: boolean): void {
    this.checked.set(!!value);
  }

  registerOnChange(fn: (value: boolean) => void): void {
    this.onChangeFn = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabledState.set(isDisabled);
  }

  protected onNativeChange(event: Event): void {
    const value = (event.target as HTMLInputElement).checked;
    this.checked.set(value);
    this.onChangeFn(value);
    this.checkedChange.emit(value);
  }
}
