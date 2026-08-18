import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NatiUiOtpComponent } from './otp.component';

const meta: Meta<NatiUiOtpComponent> = {
  component: NatiUiOtpComponent,
  title: 'Components/Otp',
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [NatiUiOtpComponent, FormsModule, ReactiveFormsModule] })],
  parameters: {
    docs: {
      description: {
        component:
          'A boxed one-time-passcode input — one box per character, auto-advances as you type, backspace moves back, arrow keys navigate, and pasting a full code fills every box at once. `length` sets the number of boxes; `charset` is `numeric` (digits only, the default) or `alphanumeric` (digits + A-Z, auto-uppercased). Emits `complete` once every box is filled.',
      },
    },
  },
};
export default meta;

type Story = StoryObj<NatiUiOtpComponent>;

export const Default: Story = {
  args: { length: 6, label: 'Enter the 6-digit code' },
  render: (args) => ({
    props: { ...args, value: '' },
    template: `<nati-ui-otp [length]="length" [label]="label" [(ngModel)]="value" />`,
  }),
};

export const Alphanumeric: Story = {
  args: { length: 5, charset: 'alphanumeric', label: 'Enter your invite code' },
  render: (args) => ({
    props: { ...args, value: '' },
    template: `<nati-ui-otp [length]="length" [charset]="charset" [label]="label" [(ngModel)]="value" />`,
  }),
};

export const Sizes: Story = {
  render: () => ({
    props: { value: '' },
    template: `
      <div style="display:flex; flex-direction:column; gap:20px;">
        <nati-ui-otp label="Medium (default)" size="md" [(ngModel)]="value" />
        <nati-ui-otp label="Small" size="sm" [(ngModel)]="value" />
      </div>
    `,
  }),
};

export const Disabled: Story = {
  render: () => ({
    props: { value: '123456' },
    template: `<nati-ui-otp label="Disabled" [disabled]="true" [(ngModel)]="value" />`,
  }),
};

export const WithError: Story = {
  render: () => ({
    props: { value: '123' },
    template: `<nati-ui-otp label="Verification code" errorText="That code is incorrect." [(ngModel)]="value" />`,
  }),
};

export const WithReactiveForms: Story = {
  render: () => ({
    props: { codeControl: new FormControl('', [Validators.required, Validators.minLength(6)]) },
    template: `
      <nati-ui-otp label="Verification code" required [formControl]="codeControl" />
      <p style="margin-top: 10px; font-size: 12px; color: #666;">
        Focus and blur without filling every box to see validation errors.
      </p>
    `,
  }),
};
