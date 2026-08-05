import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import { NatiUiButtonDirective } from '../../directives/button/button.directive';
import { NatiUiInputDirective } from '../../directives/input/input.directive';
import { NatiUiModalComponent } from './modal.component';

const meta: Meta<NatiUiModalComponent> = {
  component: NatiUiModalComponent,
  title: 'Components/Modal',
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({ imports: [NatiUiModalComponent, NatiUiButtonDirective, NatiUiInputDirective] }),
  ],
  parameters: {
    docs: {
      description: {
        component:
          'Built on the native `<dialog>` element — opens with `showModal()`, closes with `close()`, and supports light-dismiss via the `closedby="any"` attribute. Grab a template reference (`#myModal`) and call `.open()` / `.close()` directly.',
      },
    },
  },
};
export default meta;

type Story = StoryObj<NatiUiModalComponent>;

export const Default: Story = {
  render: () => ({
    template: `
      <button natiUiButton (click)="modal.open()">Open modal</button>
      <nati-ui-modal #modal title="Invite teammates">
        <p>Enter an email address to send an invite.</p>
        <input natiUiInput placeholder="jane@example.com" style="width:100%; margin-top:8px;" />
        <div modal-footer>
          <button natiUiButton variant="ghost" (click)="modal.close()">Cancel</button>
          <button natiUiButton (click)="modal.close({ sent: true })">Send invite</button>
        </div>
      </nati-ui-modal>
    `,
  }),
};

export const NonDismissible: Story = {
  render: () => ({
    template: `
      <button natiUiButton (click)="modal.open()">Open non-dismissible modal</button>
      <nati-ui-modal #modal title="Processing…" [dismissible]="false" [showCloseButton]="false">
        <p>This can't be dismissed by pressing Escape or clicking outside — only the button below closes it.</p>
        <div modal-footer>
          <button natiUiButton (click)="modal.close()">Done</button>
        </div>
      </nati-ui-modal>
    `,
  }),
};

export const Sizes: Story = {
  render: () => ({
    template: `
      <div style="display:flex; gap:12px;">
        <button natiUiButton (click)="sm.open()">Small</button>
        <button natiUiButton (click)="md.open()">Medium</button>
        <button natiUiButton (click)="lg.open()">Large</button>
      </div>
      <nati-ui-modal #sm title="Small modal" size="sm"><p>Compact content.</p></nati-ui-modal>
      <nati-ui-modal #md title="Medium modal" size="md"><p>Default width.</p></nati-ui-modal>
      <nati-ui-modal #lg title="Large modal" size="lg"><p>More room for complex content.</p></nati-ui-modal>
    `,
  }),
};
