import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import { NatiUiHeadingDirective } from './heading.directive';

const meta: Meta<NatiUiHeadingDirective> = {
  component: NatiUiHeadingDirective,
  title: 'Directives/Heading',
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [NatiUiHeadingDirective] })],
};
export default meta;

type Story = StoryObj<NatiUiHeadingDirective>;

export const Default: Story = {
  render: () => ({
    template: `<h1 natiUiHeading>Page title (h1)</h1>`,
  }),
};

export const AllLevels: Story = {
  render: () => ({
    template: `
      <div style="display:flex; flex-direction:column; gap:8px;">
        <h1 natiUiHeading>Heading level 1</h1>
        <h2 natiUiHeading>Heading level 2</h2>
        <h3 natiUiHeading>Heading level 3</h3>
        <h4 natiUiHeading>Heading level 4</h4>
        <h5 natiUiHeading>Heading level 5</h5>
        <h6 natiUiHeading>Heading level 6</h6>
      </div>
    `,
  }),
};

export const SizeOverride: Story = {
  render: () => ({
    template: `<h2 natiUiHeading size="h1">This is an &lt;h2&gt; that looks like an h1</h2>`,
  }),
};
