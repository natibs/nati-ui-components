export type NatiUiModalSize = 'sm' | 'md' | 'lg' | 'fullscreen';

export interface NatiUiModalCloseEvent<T = unknown> {
  reason: 'api' | 'close-button' | 'backdrop' | 'cancel';
  data?: T;
}
