import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import { NatiUiTypewriterComponent } from './typewriter.component';

const meta: Meta<NatiUiTypewriterComponent> = {
  component: NatiUiTypewriterComponent,
  title: 'Components/Typewriter',
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [NatiUiTypewriterComponent] })],
  parameters: {
    docs: {
      description: {
        component:
          'A typewriter/running-text effect. Pass a single `text` string to type it out once, or a `string[]` to type each one, pause `pauseTime` ms, delete it character by character, and move to the next — looping forever. `color` defaults to `inherit` so it follows the surrounding text color; pass a CSS color to override it.',
      },
    },
  },
};
export default meta;

type Story = StoryObj<NatiUiTypewriterComponent>;

export const SingleText: Story = {
  args: { text: 'Discover Switzerland.' },
  render: (args) => ({
    props: args,
    template: `<nati-ui-typewriter [text]="text" />`,
  }),
};

export const LoopingList: Story = {
  args: {
    text: ['Discover Switzerland.', 'Explore the Alps.', 'Find your next stay.'],
    pauseTime: 1500,
  },
  render: (args) => ({
    props: args,
    template: `<nati-ui-typewriter [text]="text" [pauseTime]="pauseTime" />`,
  }),
};

export const LargeFontSize: Story = {
  args: {
    text: ['Big.', 'Bold.', 'Typewritten.'],
    fontSize: '3rem',
  },
  render: (args) => ({
    props: args,
    template: `<nati-ui-typewriter [text]="text" [fontSize]="fontSize" />`,
  }),
};

export const CustomColor: Story = {
  args: {
    text: ['Discover Switzerland.', 'Explore the Alps.'],
    color: 'var(--nati-ui-color-basic-fill)',
  },
  render: (args) => ({
    props: args,
    template: `<nati-ui-typewriter [text]="text" [color]="color" />`,
  }),
};

export const OnDarkBackground: Story = {
  args: {
    text: 'Discover Switzerland.',
    color: '#fff',
  },
  render: (args) => ({
    props: args,
    template: `
      <div style="background:#0f172a; padding:32px; border-radius:8px;">
        <nati-ui-typewriter [text]="text" [color]="color" />
      </div>
    `,
  }),
};
