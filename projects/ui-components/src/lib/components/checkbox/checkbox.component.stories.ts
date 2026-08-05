import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import { NatiUiCheckboxComponent } from './checkbox.component';

const meta: Meta<NatiUiCheckboxComponent> = {
  component: NatiUiCheckboxComponent,
  title: 'Components/Checkbox',
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [NatiUiCheckboxComponent] })],
};
export default meta;

type Story = StoryObj<NatiUiCheckboxComponent>;

export const Default: Story = {
  args: { label: 'Accept terms and conditions', required: false },
  render: (args) => ({ props: args, template: `<nati-ui-checkbox [label]="label" [required]="required" />` }),
};

export const WithDescription: Story = {
  render: () => ({
    template: `<nati-ui-checkbox label="Email notifications" description="Get emailed when someone comments on your post." />`,
  }),
};

export const States: Story = {
  render: () => ({
    template: `
      <div style="display:flex; flex-direction:column; gap:12px;">
        <nati-ui-checkbox label="Unchecked" />
        <nati-ui-checkbox label="Indeterminate" [indeterminate]="true" />
        <nati-ui-checkbox label="Disabled" [disabled]="true" />
        <nati-ui-checkbox label="With error" errorText="You must accept to continue." />
      </div>
    `,
  }),
};
