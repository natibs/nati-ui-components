import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NatiUiDatepickerComponent } from './datepicker.component';

const meta: Meta<NatiUiDatepickerComponent> = {
  component: NatiUiDatepickerComponent,
  title: 'Components/Datepicker',
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({ imports: [NatiUiDatepickerComponent, FormsModule, ReactiveFormsModule] }),
  ],
  parameters: {
    docs: {
      description: {
        component:
          'A dependency-free datepicker built on the native Popover API for its floating panel (light-dismiss and top-layer stacking come from the browser, not JS). Supports `single` and `range` selection modes and integrates with reactive forms via `ControlValueAccessor`.',
      },
    },
  },
};
export default meta;

type Story = StoryObj<NatiUiDatepickerComponent>;

export const Default: Story = {
  args: { label: 'Travel date', mode: 'single' },
  render: (args) => ({
    props: { ...args, value: null },
    template: `<nati-ui-datepicker [label]="label" [mode]="mode" [(ngModel)]="value" />`,
  }),
};

export const DateRange: Story = {
  args: { label: 'Check-in / check-out', mode: 'range' },
  render: (args) => ({
    props: { ...args, value: null },
    template: `<nati-ui-datepicker [label]="label" [mode]="mode" [(ngModel)]="value" />`,
  }),
};

export const MinMax: Story = {
  render: () => ({
    props: {
      min: new Date(),
      max: new Date(new Date().getFullYear(), new Date().getMonth() + 3, 0),
      value: null,
    },
    template: `
      <nati-ui-datepicker
        label="Vacation dates"
        mode="range"
        placeholder="No dates in the past, max 3 months out"
        [min]="min"
        [max]="max"
        [(ngModel)]="value"
      />
    `,
  }),
};

export const Sizes: Story = {
  render: () => ({
    props: { value: null },
    template: `
      <div style="display:flex; flex-direction:column; gap:16px; max-width:280px;">
        <nati-ui-datepicker label="Medium (default)" size="md" [(ngModel)]="value" />
        <nati-ui-datepicker label="Small" size="sm" [(ngModel)]="value" />
      </div>
    `,
  }),
};

export const Disabled: Story = {
  render: () => ({
    props: { value: new Date() },
    template: `<nati-ui-datepicker label="Disabled" [disabled]="true" [(ngModel)]="value" />`,
  }),
};

export const WithError: Story = {
  render: () => ({
    props: { value: null },
    template: `
      <nati-ui-datepicker
        label="Return date"
        errorText="Please select a valid date"
        [(ngModel)]="value"
      />
    `,
  }),
};

export const WithReactiveForms: Story = {
  render: () => ({
    props: { dateControl: new FormControl<Date | null>(null, [Validators.required]) },
    template: `
      <nati-ui-datepicker label="Departure" required [formControl]="dateControl" />
      <p style="margin-top: 10px; font-size: 12px; color: #666;">
        Open and close the panel without picking a date to see validation errors.
      </p>
    `,
  }),
};
