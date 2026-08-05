import { FormsModule, ReactiveFormsModule, FormControl, Validators } from '@angular/forms';
import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import { NatiUiInputDirective } from './input.directive';

const meta: Meta<NatiUiInputDirective> = {
  component: NatiUiInputDirective,
  title: 'Directives/Input',
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({
      imports: [NatiUiInputDirective, FormsModule, ReactiveFormsModule],
    }),
  ],
  argTypes: {
    size: { control: { type: 'select' }, options: ['sm', 'md'] },
    validateOn: { control: { type: 'select' }, options: ['change', 'blur'] },
  },
};
export default meta;

type Story = StoryObj<NatiUiInputDirective>;

export const Default: Story = {
  args: {
    label: 'Email',
    size: 'md',
    disabled: false,
    required: false,
  },
  render: (args) => ({
    props: args,
    template: `<input natiUiInput [label]="label" [size]="size" [disabled]="disabled" [required]="required" placeholder="jane@example.com" type="email" />`,
  }),
};

export const Sizes: Story = {
  render: () => ({
    template: `
      <div style="display:flex; flex-direction:column; gap:16px; max-width: 320px;">
        <input natiUiInput label="Medium (default)" size="md" placeholder="Medium" />
        <input natiUiInput label="Small" size="sm" placeholder="Small" />
      </div>
    `,
  }),
};

export const WithExplicitError: Story = {
  render: () => ({
    template: `<input natiUiInput label="Username" errorText="This username is already taken." value="nati" style="max-width:320px" />`,
  }),
};

export const DisabledAndRequired: Story = {
  render: () => ({
    template: `
      <div style="display:flex; flex-direction:column; gap:16px; max-width: 320px;">
        <input natiUiInput label="Required field" [required]="true" placeholder="Required" />
        <input natiUiInput label="Disabled field" [disabled]="true" value="Can't touch this" />
      </div>
    `,
  }),
};

export const WithReactiveForm: Story = {
  render: () => ({
    props: { email: new FormControl('', [Validators.required, Validators.email]) },
    template: `
      <div style="max-width:320px">
        <input natiUiInput label="Email" [formControl]="email" placeholder="jane@example.com" />
        <p style="font-size:12px;color:#6b7280;margin-top:8px;">
          Type something invalid, then blur the field to see the validation message
          (backed by a real <code>FormControl</code>).
        </p>
      </div>
    `,
  }),
};
