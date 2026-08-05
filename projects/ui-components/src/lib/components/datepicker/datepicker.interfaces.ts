import { NatiUiControlSize } from '../../directives/input/input.interfaces';

export type NatiUiDatepickerMode = 'single' | 'range';

export interface NatiUiDateRange {
  start: Date | null;
  end: Date | null;
}

export type NatiUiDatepickerValue = Date | NatiUiDateRange | null;

export interface NatiUiCalendarDay {
  date: Date;
  inCurrentMonth: boolean;
}

export interface NatiUiCalendarMonth {
  key: string;
  label: string;
  days: NatiUiCalendarDay[];
}

export type { NatiUiControlSize };
