export type NatiUiToastType = 'success' | 'danger' | 'warning' | 'info';

export interface NatiUiToast {
  id: number;
  message: string;
  type: NatiUiToastType;
  duration: number;
  removing?: boolean;
}
