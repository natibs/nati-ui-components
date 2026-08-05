import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import { NatiUiButtonDirective } from './button.directive';

const meta: Meta<NatiUiButtonDirective> = {
  component: NatiUiButtonDirective,
  title: 'Directives/Button',
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [NatiUiButtonDirective] })],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['primary', 'secondary', 'outline', 'danger', 'ghost'],
    },
    size: { control: { type: 'select' }, options: ['sm', 'md', 'lg'] },
  },
};
export default meta;

type Story = StoryObj<NatiUiButtonDirective>;

export const Default: Story = {
  args: { variant: 'primary', size: 'md', disabled: false, loading: false },
  render: (args) => ({
    props: args,
    template: `<button natiUiButton [variant]="variant" [size]="size" [disabled]="disabled" [loading]="loading">Continue</button>`,
  }),
};

export const AllVariants: Story = {
  render: () => ({
    template: `
      <div style="display:flex; flex-wrap:wrap; gap:12px;">
        <button natiUiButton variant="primary">Primary</button>
        <button natiUiButton variant="secondary">Secondary</button>
        <button natiUiButton variant="outline">Outline</button>
        <button natiUiButton variant="danger">Danger</button>
        <button natiUiButton variant="ghost">Ghost</button>
      </div>
    `,
  }),
};

export const Sizes: Story = {
  render: () => ({
    template: `
      <div style="display:flex; align-items:center; gap:12px;">
        <button natiUiButton size="sm">Small</button>
        <button natiUiButton size="md">Medium</button>
        <button natiUiButton size="lg">Large</button>
      </div>
    `,
  }),
};

export const LoadingAndDisabled: Story = {
  render: () => ({
    template: `
      <div style="display:flex; gap:12px;">
        <button natiUiButton [loading]="true">Saving...</button>
        <button natiUiButton variant="outline" [disabled]="true">Disabled</button>
      </div>
    `,
  }),
};

export const AsLink: Story = {
  render: () => ({
    template: `<a natiUiButton variant="ghost" href="#">I'm an anchor tag</a>`,
  }),
};
