import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
} from '@angular/core';
import { NatiUiRadioGroupComponent } from './radio-group.component';

let nextId = 0;

@Component({
  selector: 'nati-ui-radio',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'natiUiRadioHost' },
  template: `
    <label class="natiUiRadio" [class.natiUiRadioDisabled]="isDisabled()">
      <input
        type="radio"
        class="natiUiRadioInput"
        [name]="group.name"
        [checked]="group.isSelected(value())"
        [disabled]="isDisabled()"
        (change)="group.select(value())"
        (blur)="group.markTouched()"
      />
      <span class="natiUiRadioDot" aria-hidden="true"></span>
      <span class="natiUiRadioText">
        @if (label()) {
          <span class="natiUiRadioLabel">{{ label() }}</span>
        }
        @if (description()) {
          <span class="natiUiRadioDescription">{{ description() }}</span>
        }
      </span>
    </label>
  `,
})
export class NatiUiRadioComponent<T = unknown> {
  protected readonly group = inject<NatiUiRadioGroupComponent<T>>(NatiUiRadioGroupComponent);

  readonly id = `nati-ui-radio-${++nextId}`;

  value = input.required<T>();
  label = input<string | null>(null);
  description = input<string | null>(null);
  disabled = input(false, { transform: booleanAttribute });

  protected isDisabled(): boolean {
    return this.disabled() || this.group.isDisabled();
  }
}
