import { NatiUiCalendarDay, NatiUiCalendarMonth } from './datepicker.interfaces';

const REFERENCE_MONDAY = new Date(2024, 0, 1); // a known Monday

export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function isSameDay(a: Date | null | undefined, b: Date | null | undefined): boolean {
  if (!a || !b) return false;
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function isBefore(a: Date, b: Date): boolean {
  return startOfDay(a).getTime() < startOfDay(b).getTime();
}

export function isAfter(a: Date, b: Date): boolean {
  return startOfDay(a).getTime() > startOfDay(b).getTime();
}

export function isWithin(date: Date, start: Date, end: Date): boolean {
  const t = startOfDay(date).getTime();
  return t > startOfDay(start).getTime() && t < startOfDay(end).getTime();
}

export function addMonths(date: Date, amount: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}

export function addDays(date: Date, amount: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + amount);
}

export function monthKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth()}`;
}

export function buildMonthGrid(monthDate: Date): NatiUiCalendarDay[] {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstOfMonth = new Date(year, month, 1);
  // Monday-first offset: JS getDay() is 0=Sun..6=Sat, convert to 0=Mon..6=Sun.
  const offset = (firstOfMonth.getDay() + 6) % 7;
  const gridStart = addDays(firstOfMonth, -offset);

  const days: NatiUiCalendarDay[] = [];
  for (let i = 0; i < 42; i++) {
    const date = addDays(gridStart, i);
    days.push({ date, inCurrentMonth: date.getMonth() === month });
  }
  return days;
}

export function weekdayLabels(locale: string): string[] {
  const formatter = new Intl.DateTimeFormat(locale, { weekday: 'short' });
  return Array.from({ length: 7 }, (_, i) => formatter.format(addDays(REFERENCE_MONDAY, i)));
}

export function monthLabel(monthDate: Date, locale: string): string {
  const label = new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }).format(monthDate);
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function formatDate(date: Date, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

export function buildMonths(firstVisibleMonth: Date, count: number, locale: string): NatiUiCalendarMonth[] {
  return Array.from({ length: count }, (_, i) => {
    const monthDate = addMonths(firstVisibleMonth, i);
    return {
      key: monthKey(monthDate),
      label: monthLabel(monthDate, locale),
      days: buildMonthGrid(monthDate),
    };
  });
}
