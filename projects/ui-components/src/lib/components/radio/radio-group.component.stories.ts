import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import { NatiUiRadioGroupComponent } from './radio-group.component';
import { NatiUiRadioComponent } from './radio.component';

const meta: Meta<NatiUiRadioGroupComponent> = {
  component: NatiUiRadioGroupComponent,
  title: 'Components/Radio',
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({ imports: [NatiUiRadioGroupComponent, NatiUiRadioComponent] }),
  ],
};
export default meta;

type Story = StoryObj<NatiUiRadioGroupComponent>;

export const Default: Story = {
  render: () => ({
    template: `
      <nati-ui-radio-group label="Choose a plan" style="max-width:320px">
        <nati-ui-radio value="free" label="Free" description="Good for trying things out" />
        <nati-ui-radio value="pro" label="Pro" description="For growing teams" />
        <nati-ui-radio value="enterprise" label="Enterprise" description="Custom pricing" />
      </nati-ui-radio-group>
    `,
  }),
};

export const DisabledGroup: Story = {
  render: () => ({
    template: `
      <nati-ui-radio-group label="Choose a plan" [disabled]="true" style="max-width:320px">
        <nati-ui-radio value="free" label="Free" />
        <nati-ui-radio value="pro" label="Pro" />
      </nati-ui-radio-group>
    `,
  }),
};

export const WithError: Story = {
  render: () => ({
    template: `
      <nati-ui-radio-group label="Choose a plan" errorText="Please select a plan to continue." style="max-width:320px">
        <nati-ui-radio value="free" label="Free" />
        <nati-ui-radio value="pro" label="Pro" />
      </nati-ui-radio-group>
    `,
  }),
};
