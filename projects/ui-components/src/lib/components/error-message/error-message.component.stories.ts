import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import { NatiUiErrorMessageComponent } from './error-message.component';

const meta: Meta<NatiUiErrorMessageComponent> = {
  component: NatiUiErrorMessageComponent,
  title: 'Components/ErrorMessage',
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [NatiUiErrorMessageComponent] })],
  argTypes: {
    variant: { control: { type: 'select' }, options: ['inline', 'banner'] },
  },
};
export default meta;

type Story = StoryObj<NatiUiErrorMessageComponent>;

export const Inline: Story = {
  args: { variant: 'inline', message: 'Something went wrong. Please try again.' },
  render: (args) => ({
    props: args,
    template: `<nati-ui-error-message [variant]="variant" [message]="message" />`,
  }),
};

export const Banner: Story = {
  render: () => ({
    template: `<nati-ui-error-message variant="banner" message="Could not save your changes. Check your connection and try again." />`,
  }),
};

export const WithProjectedContent: Story = {
  render: () => ({
    template: `<nati-ui-error-message variant="banner">Something <strong>specific</strong> broke here.</nati-ui-error-message>`,
  }),
};
