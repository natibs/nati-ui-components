export type NatiUiMenuPosition = 'left' | 'right';

export type NatiUiMenuCloseReason = 'overlay' | 'escape' | 'swipe' | 'api';

export interface NatiUiMenuCloseEvent {
  reason: NatiUiMenuCloseReason;
}
