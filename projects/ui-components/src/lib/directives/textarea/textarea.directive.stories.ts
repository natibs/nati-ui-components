import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import { NatiUiTextareaDirective } from './textarea.directive';

const meta: Meta<NatiUiTextareaDirective> = {
  component: NatiUiTextareaDirective,
  title: 'Directives/Textarea',
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [NatiUiTextareaDirective] })],
  argTypes: {
    size: { control: { type: 'select' }, options: ['sm', 'md'] },
  },
};
export default meta;

type Story = StoryObj<NatiUiTextareaDirective>;

export const Default: Story = {
  args: {
    label: 'Message',
    rows: 4,
    disabled: false,
    required: false,
  },
  render: (args) => ({
    props: args,
    template: `<textarea natiUiTextarea [label]="label" [rows]="rows" [disabled]="disabled" [required]="required" placeholder="Write something..." style="max-width:360px"></textarea>`,
  }),
};

export const AutoResize: Story = {
  render: () => ({
    template: `
      <textarea natiUiTextarea label="Grows with content" autoResize placeholder="Start typing a long message and watch this grow..." style="max-width:360px"></textarea>
    `,
  }),
};

export const WithError: Story = {
  render: () => ({
    template: `<textarea natiUiTextarea label="Bio" errorText="Bio must be under 200 characters." style="max-width:360px">This bio is way too long...</textarea>`,
  }),
};
