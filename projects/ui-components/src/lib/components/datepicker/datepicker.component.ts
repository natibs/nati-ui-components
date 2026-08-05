import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  input,
  OnDestroy,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { ControlValueAccessor, NgControl } from '@angular/forms';
import {
  controlHasError,
  controlIsRequired,
  resolveControlErrorMessage,
} from '../../utils/control-error.util';
import { NatiUiControlSize } from '../../directives/input/input.interfaces';
import {
  NatiUiCalendarMonth,
  NatiUiDatepickerMode,
  NatiUiDateRange,
  NatiUiDatepickerValue,
} from './datepicker.interfaces';
import {
  addMonths,
  buildMonths,
  formatDate,
  isAfter,
  isBefore,
  isSameDay,
  isWithin,
  startOfDay,
  weekdayLabels,
} from './datepicker.util';

let nextId = 0;

type PopoverElement = HTMLElement & {
  showPopover(): void;
  hidePopover(): void;
  matches(selector: string): boolean;
};

@Component({
  selector: 'nati-ui-datepicker',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'natiUiDatepickerHost' },
  template: `
    <div class="natiUiField" [style.width]="width()">
      @if (label()) {
        <label class="natiUiFieldLabel" [for]="inputId">
          {{ label() }}
          @if (isRequired()) {
            <span class="natiUiFieldRequiredMark" aria-hidden="true"> *</span>
          }
        </label>
      }

      <div
        class="natiUiDatepicker"
        [class.natiUiDatepickerSm]="size() === 'sm'"
        [class.natiUiDatepickerError]="hasError()"
        [class.natiUiDatepickerDisabled]="isDisabled()"
      >
        <div class="natiUiDatepickerTrigger" #triggerWrap>
          <svg class="natiUiDatepickerIcon" viewBox="0 0 20 20" aria-hidden="true">
            <path
              d="M6 2.5v2M14 2.5v2M3 7.5h14M4.5 4.5h11A1.5 1.5 0 0 1 17 6v9.5a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 3 15.5V6a1.5 1.5 0 0 1 1.5-1.5Z"
              fill="none"
              stroke="currentColor"
              stroke-width="1.4"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          <button
            type="button"
            #triggerBtn
            class="natiUiDatepickerTriggerBtn"
            [id]="inputId"
            [disabled]="isDisabled()"
            [attr.aria-expanded]="isOpen()"
            [attr.aria-haspopup]="'dialog'"
            [attr.aria-controls]="panelId"
            [attr.aria-describedby]="hasError() ? errorId : null"
            (click)="toggle()"
          >
            <span
              class="natiUiDatepickerValue"
              [class.natiUiDatepickerPlaceholder]="!displayText()"
              >{{ displayText() || effectivePlaceholder() }}</span
            >
          </button>
          @if (showClear() && hasValue() && !isDisabled() && !readonly()) {
            <button
              type="button"
              class="natiUiDatepickerClear"
              aria-label="Clear date"
              (click)="clear($event)"
            >
              <svg viewBox="0 0 16 16" aria-hidden="true">
                <path
                  d="M4 4l8 8M12 4l-8 8"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.6"
                  stroke-linecap="round"
                />
              </svg>
            </button>
          }
        </div>

        <div
          #panel
          [id]="panelId"
          popover="auto"
          class="natiUiDatepickerPanel"
          (toggle)="onPopoverToggle($event)"
        >
          <div class="natiUiDatepickerMonths">
            @for (month of visibleMonths(); track month.key; let first = $first; let last = $last) {
              <div class="natiUiDatepickerMonth">
                <div class="natiUiDatepickerMonthHeader">
                  @if (first) {
                    <button
                      type="button"
                      class="natiUiDatepickerNav"
                      aria-label="Previous month"
                      (click)="prevMonth()"
                    >
                      <svg viewBox="0 0 20 20" aria-hidden="true">
                        <path
                          d="M12 4.5 6.5 10l5.5 5.5"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="1.6"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                      </svg>
                    </button>
                  } @else {
                    <span class="natiUiDatepickerNavSpacer"></span>
                  }
                  <span class="natiUiDatepickerMonthLabel">{{ month.label }}</span>
                  @if (last) {
                    <button
                      type="button"
                      class="natiUiDatepickerNav"
                      aria-label="Next month"
                      (click)="nextMonth()"
                    >
                      <svg viewBox="0 0 20 20" aria-hidden="true">
                        <path
                          d="m8 4.5 5.5 5.5L8 15.5"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="1.6"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                      </svg>
                    </button>
                  } @else {
                    <span class="natiUiDatepickerNavSpacer"></span>
                  }
                </div>

                <div class="natiUiDatepickerWeekdays">
                  @for (wd of weekdays(); track wd) {
                    <span>{{ wd }}</span>
                  }
                </div>

                <div class="natiUiDatepickerGrid" (mouseleave)="hoverDate.set(null)">
                  @for (day of month.days; track day.date.getTime()) {
                    <span
                      class="natiUiDatepickerDayCell"
                      [class.natiUiDatepickerDayCellInRange]="isInRange(day.date)"
                      [class.natiUiDatepickerDayCellRangeStart]="isRangeStart(day.date)"
                      [class.natiUiDatepickerDayCellRangeEnd]="isRangeEnd(day.date)"
                    >
                      <button
                        type="button"
                        class="natiUiDatepickerDay"
                        [class.natiUiDatepickerDayOutside]="!day.inCurrentMonth"
                        [class.natiUiDatepickerDayToday]="isToday(day.date)"
                        [class.natiUiDatepickerDaySelected]="
                          isSelected(day.date) || isRangeStart(day.date) || isRangeEnd(day.date)
                        "
                        [disabled]="isDisabledDay(day.date)"
                        (click)="selectDay(day.date)"
                        (mouseenter)="hoverDay(day.date)"
                      >
                        {{ day.date.getDate() }}
                      </button>
                    </span>
                  }
                </div>
              </div>
            }
          </div>

          <div class="natiUiDatepickerFooter">
            <button type="button" class="natiUiDatepickerFooterBtn" (click)="clear()">
              Clear
            </button>
            <button
              type="button"
              class="natiUiDatepickerFooterBtn natiUiDatepickerFooterBtnPrimary"
              (click)="close()"
            >
              Done
            </button>
          </div>
        </div>
      </div>

      @if (currentError()) {
        <p class="natiUiFieldError" role="alert" [id]="errorId">{{ currentError() }}</p>
      }
    </div>
  `,
})
export class NatiUiDatepickerComponent implements ControlValueAccessor, OnDestroy {
  private readonly ngControl = inject(NgControl, { optional: true, self: true });

  private readonly triggerWrapRef = viewChild.required<ElementRef<HTMLElement>>('triggerWrap');
  private readonly panelRef = viewChild.required<ElementRef<HTMLElement>>('panel');

  readonly inputId = `nati-ui-datepicker-${++nextId}`;
  readonly errorId = `${this.inputId}-error`;
  readonly panelId = `${this.inputId}-panel`;

  label = input<string | null>(null);
  placeholder = input<string | null>(null);
  errorText = input<string | null>(null);
  customErrorMessages = input<Record<string, string>>({});
  size = input<NatiUiControlSize>('md');
  width = input<string | null>('100%');
  mode = input<NatiUiDatepickerMode>('single');
  locale = input<string>('de-CH');
  min = input<Date | null>(null);
  max = input<Date | null>(null);
  showClear = input(true, { transform: booleanAttribute });
  disabled = input(false, { transform: booleanAttribute });
  required = input(false, { transform: booleanAttribute });
  readonly = input(false, { transform: booleanAttribute });

  valueChange = output<NatiUiDatepickerValue>();

  protected readonly valueSig = signal<NatiUiDatepickerValue>(null);
  protected readonly isOpen = signal(false);
  protected readonly hoverDate = signal<Date | null>(null);
  protected readonly viewDate = signal<Date>(new Date());

  private readonly refresh = signal(0);
  private readonly today = startOfDay(new Date());
  private disabledState = signal(false);

  protected readonly weekdays = computed(() => weekdayLabels(this.locale()));
  protected readonly monthsToShow = computed(() => (this.mode() === 'range' ? 2 : 1));
  protected readonly visibleMonths = computed<NatiUiCalendarMonth[]>(() =>
    buildMonths(this.viewDate(), this.monthsToShow(), this.locale()),
  );

  protected readonly isDisabled = computed(() => this.disabled() || this.disabledState());

  protected readonly singleValue = computed(() => {
    const v = this.valueSig();
    return v instanceof Date ? v : null;
  });

  protected readonly rangeValue = computed<NatiUiDateRange>(() => {
    const v = this.valueSig();
    if (v && !(v instanceof Date)) return v;
    return { start: null, end: null };
  });

  protected readonly hasValue = computed(() =>
    this.mode() === 'range' ? !!this.rangeValue().start : !!this.singleValue(),
  );

  protected readonly effectivePlaceholder = computed(
    () => this.placeholder() ?? (this.mode() === 'range' ? 'Select dates' : 'Select date'),
  );

  protected readonly displayText = computed(() => {
    const locale = this.locale();
    if (this.mode() === 'range') {
      const { start, end } = this.rangeValue();
      if (start && end) return `${formatDate(start, locale)} – ${formatDate(end, locale)}`;
      if (start) return `${formatDate(start, locale)} – …`;
      return '';
    }
    const d = this.singleValue();
    return d ? formatDate(d, locale) : '';
  });

  protected readonly isRequired = computed(() => this.required() || controlIsRequired(this.ngControl));

  protected readonly hasError = computed(() => {
    this.refresh();
    this.valueSig();
    return this.errorText() ? true : controlHasError(this.ngControl);
  });

  protected readonly currentError = computed(() => {
    this.refresh();
    this.valueSig();
    return resolveControlErrorMessage(this.ngControl, {
      explicitError: this.errorText(),
      customMessages: this.customErrorMessages(),
    });
  });

  private onChangeFn: (value: NatiUiDatepickerValue) => void = () => undefined;
  protected onTouched: () => void = () => undefined;
  private readonly repositionListener = () => this.positionPanel();

  constructor() {
    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }
  }

  ngOnDestroy(): void {
    this.detachReposition();
  }

  writeValue(value: NatiUiDatepickerValue): void {
    this.valueSig.set(value ?? null);
  }

  registerOnChange(fn: (value: NatiUiDatepickerValue) => void): void {
    this.onChangeFn = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabledState.set(isDisabled);
  }

  protected toggle(): void {
    if (this.isDisabled() || this.readonly()) return;
    const panel = this.panelEl();
    if (this.isOpen()) {
      panel.hidePopover();
      return;
    }
    const anchor = this.mode() === 'range' ? this.rangeValue().start : this.singleValue();
    this.viewDate.set(addMonths(anchor ?? new Date(), 0));
    panel.showPopover();
  }

  protected close(): void {
    if (this.isOpen()) this.panelEl().hidePopover();
  }

  protected onPopoverToggle(event: Event): void {
    const newState = (event as Event & { newState?: string }).newState;
    const isOpenNow = newState === 'open';
    this.isOpen.set(isOpenNow);
    if (isOpenNow) {
      this.positionPanel();
      this.attachReposition();
    } else {
      this.detachReposition();
      this.refresh.update((v) => v + 1);
      this.onTouched();
    }
  }

  protected prevMonth(): void {
    this.viewDate.update((d) => addMonths(d, -1));
  }

  protected nextMonth(): void {
    this.viewDate.update((d) => addMonths(d, 1));
  }

  protected selectDay(date: Date): void {
    if (this.isDisabledDay(date) || this.readonly()) return;

    if (this.mode() === 'single') {
      this.commit(date);
      this.close();
      return;
    }

    const { start, end } = this.rangeValue();
    if (!start || end) {
      this.hoverDate.set(null);
      this.commit({ start: date, end: null });
      return;
    }

    const next: NatiUiDateRange = isBefore(date, start)
      ? { start: date, end: start }
      : { start, end: date };
    this.commit(next);
    this.close();
  }

  protected hoverDay(date: Date): void {
    if (this.mode() !== 'range') return;
    const { start, end } = this.rangeValue();
    if (start && !end) this.hoverDate.set(date);
  }

  protected clear(event?: Event): void {
    event?.stopPropagation();
    if (this.isDisabled() || this.readonly()) return;
    this.hoverDate.set(null);
    this.commit(this.mode() === 'range' ? { start: null, end: null } : null);
  }

  protected isToday(date: Date): boolean {
    return isSameDay(date, this.today);
  }

  protected isSelected(date: Date): boolean {
    return this.mode() === 'single' && isSameDay(date, this.singleValue());
  }

  protected isDisabledDay(date: Date): boolean {
    const min = this.min();
    const max = this.max();
    if (min && isBefore(date, min)) return true;
    if (max && isAfter(date, max)) return true;
    return false;
  }

  private previewPair(): [Date, Date] | null {
    if (this.mode() !== 'range') return null;
    const { start, end } = this.rangeValue();
    if (start && end) return [start, end];
    if (start && this.hoverDate()) {
      const hover = this.hoverDate()!;
      return isBefore(hover, start) ? [hover, start] : [start, hover];
    }
    return null;
  }

  protected isRangeStart(date: Date): boolean {
    const pair = this.previewPair();
    return !!pair && isSameDay(date, pair[0]);
  }

  protected isRangeEnd(date: Date): boolean {
    const pair = this.previewPair();
    return !!pair && isSameDay(date, pair[1]);
  }

  protected isInRange(date: Date): boolean {
    const pair = this.previewPair();
    return !!pair && isWithin(date, pair[0], pair[1]);
  }

  private commit(value: NatiUiDatepickerValue): void {
    this.valueSig.set(value);
    this.onChangeFn(value);
    this.valueChange.emit(value);
  }

  private panelEl(): PopoverElement {
    return this.panelRef().nativeElement as PopoverElement;
  }

  private positionPanel(): void {
    const trigger = this.triggerWrapRef().nativeElement;
    const panel = this.panelRef().nativeElement;
    const rect = trigger.getBoundingClientRect();
    const margin = 8;
    const panelWidth = panel.offsetWidth;
    const panelHeight = panel.offsetHeight;

    let left = rect.left;
    if (left + panelWidth > window.innerWidth - margin) {
      left = Math.max(margin, rect.right - panelWidth);
    }
    left = Math.max(margin, left);

    let top = rect.bottom + 6;
    if (top + panelHeight > window.innerHeight - margin) {
      const spaceAbove = rect.top - margin;
      if (spaceAbove > panelHeight) top = rect.top - panelHeight - 6;
    }

    panel.style.top = `${top}px`;
    panel.style.left = `${left}px`;
  }

  private attachReposition(): void {
    window.addEventListener('resize', this.repositionListener);
    window.addEventListener('scroll', this.repositionListener, true);
  }

  private detachReposition(): void {
    window.removeEventListener('resize', this.repositionListener);
    window.removeEventListener('scroll', this.repositionListener, true);
  }
}
