import { Component } from '@angular/core';
import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import { NatiUiTooltipComponent } from './tooltip.component';

@Component({
  selector: 'tooltip-demo',
  imports: [NatiUiTooltipComponent],
  template: `
    <p style="max-width: 340px; line-height: 2.2; font-family: var(--nati-ui-font-family);">
      Hover the highlighted word for a
      <nati-ui-tooltip text="a short pop-up giving extra info">tooltip</nati-ui-tooltip>
      — it also works across a
      <nati-ui-tooltip text="applies as a hint to the whole phrase">multi word phrase</nati-ui-tooltip>
      wrapped the same way. Delay defaults to 1500ms to avoid firing on
      accidental hovers.
    </p>
  `,
})
class TooltipDemoComponent {}

@Component({
  selector: 'tooltip-flip-demo',
  imports: [NatiUiTooltipComponent],
  template: `
    <p style="margin-top: 4px; font-family: var(--nati-ui-font-family);">
      This word is near the top of the viewport, so its tooltip flips to the
      <nati-ui-tooltip text="Flipped below — there's no room above" [delay]="150">bottom</nati-ui-tooltip>
      automatically, the same way a dropdown would.
    </p>
  `,
})
class TooltipFlipDemoComponent {}

const meta: Meta<NatiUiTooltipComponent> = {
  component: NatiUiTooltipComponent,
  title: 'Components/Tooltip',
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [NatiUiTooltipComponent] })],
  parameters: {
    docs: {
      description: {
        component:
          'Wrap any inline content (a word, or several words for a multi-word phrase) in `<nati-ui-tooltip text="...">` to make it hoverable. Shows after `delay` ms (default 1500 — long enough to avoid firing on incidental hovers while reading), stays open if the pointer moves onto the bubble itself, and flips from above to below the trigger when there is not enough room in the viewport. Emits `(shown)` every time the bubble becomes visible.',
      },
    },
  },
};
export default meta;

type Story = StoryObj<NatiUiTooltipComponent>;

export const Default: Story = {
  render: () => ({
    moduleMetadata: { imports: [TooltipDemoComponent] },
    template: `<tooltip-demo />`,
  }),
};

export const FlipsWhenNoRoomAbove: Story = {
  render: () => ({
    moduleMetadata: { imports: [TooltipFlipDemoComponent] },
    template: `<tooltip-flip-demo />`,
  }),
};
