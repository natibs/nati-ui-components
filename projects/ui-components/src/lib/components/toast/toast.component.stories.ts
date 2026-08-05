import { Component, inject } from '@angular/core';
import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import { NatiUiButtonDirective } from '../../directives/button/button.directive';
import { NatiUiToastComponent } from './toast.component';
import { NatiUiToastService } from './toast.service';

@Component({
  selector: 'toast-demo',
  imports: [NatiUiButtonDirective, NatiUiToastComponent],
  template: `
    <div style="display:flex; gap:8px; flex-wrap:wrap;">
      <button natiUiButton variant="primary" (click)="toastService.success('Booking confirmed for Zermatt.')">
        Success
      </button>
      <button natiUiButton variant="danger" (click)="toastService.danger('Could not save your changes.')">
        Danger
      </button>
      <button natiUiButton variant="secondary" (click)="toastService.warning('Your session expires in 5 minutes.')">
        Warning
      </button>
      <button natiUiButton variant="outline" (click)="toastService.info('New destinations added this week.')">
        Info
      </button>
    </div>
    <nati-ui-toast />
  `,
})
class ToastDemoComponent {
  protected readonly toastService = inject(NatiUiToastService);
}

@Component({
  selector: 'toast-sticky-demo',
  imports: [NatiUiButtonDirective, NatiUiToastComponent],
  template: `
    <button natiUiButton (click)="toastService.show('This stays until you close it.', 'info', 0)">
      Show sticky toast
    </button>
    <nati-ui-toast />
  `,
})
class ToastStickyDemoComponent {
  protected readonly toastService = inject(NatiUiToastService);
}

const meta: Meta<NatiUiToastComponent> = {
  component: NatiUiToastComponent,
  title: 'Components/Toast',
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [NatiUiToastComponent] })],
  parameters: {
    docs: {
      description: {
        component:
          'A toast/snackbar stack driven imperatively through `NatiUiToastService` (`success()`, `danger()`, `warning()`, `info()`, or `show(message, type, duration)`). Mount a single `<nati-ui-toast />` once near the root of your app — it relocates itself to `document.body` on init so it always renders above everything else, then removes itself on destroy. Toasts auto-dismiss after `duration` ms (default 5000); pass `duration: 0` for a sticky toast with a manual close button.',
      },
    },
  },
};
export default meta;

type Story = StoryObj<NatiUiToastComponent>;

export const Default: Story = {
  render: () => ({
    moduleMetadata: { imports: [ToastDemoComponent] },
    template: `<toast-demo />`,
  }),
};

export const Sticky: Story = {
  render: () => ({
    moduleMetadata: { imports: [ToastStickyDemoComponent] },
    template: `<toast-sticky-demo />`,
  }),
};
