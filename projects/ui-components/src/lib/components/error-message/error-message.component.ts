import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type NatiUiErrorMessageVariant = 'inline' | 'banner';

@Component({
  selector: 'nati-ui-error-message',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    role: 'alert',
    class: 'natiUiErrorMessage',
    '[class.natiUiErrorMessageBanner]': `variant() === 'banner'`,
  },
  template: `
    @if (variant() === 'banner') {
      <svg viewBox="0 0 20 20" class="natiUiErrorMessageIcon" aria-hidden="true">
        <path
          d="M10 2.5 18 17H2L10 2.5Z"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linejoin="round"
        />
        <path d="M10 8v4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
        <circle cx="10" cy="14.5" r="0.9" fill="currentColor" />
      </svg>
    }
    <span class="natiUiErrorMessageText">
      <ng-content></ng-content>{{ message() }}
    </span>
  `,
})
export class NatiUiErrorMessageComponent {
  message = input<string>('');
  variant = input<NatiUiErrorMessageVariant>('inline');
}
