import { CommonModule } from '@angular/common';
import {
  Component,
  computed,
  input,
  OnInit,
  output,
  signal,
} from '@angular/core';
import {
  AccordionSection,
  ActiveTab,
  CalendarDay,
  DateTimeSelection,
  ReminderConfig,
  ReminderType,
  RepeatConfig,
  RepeatType,
} from '../../models/date';

import {
  DEFAULT_REMINDER,
  DEFAULT_REPEAT,
  formatMonthYear,
  generateTimeSlots,
  getCalendarDays,
  getNextMonth,
  getNextWeek,
  getToday,
  getTomorrow,
  isSameDay,
  isTimePast,
} from '../../utils/date.utils';

@Component({
  selector: 'app-date-time-picker',
  imports: [CommonModule],
  templateUrl: './date-time-picker.component.html',
  styles: ``,
})
export class DateTimePickerComponent implements OnInit {
  // ── Inputs ──────────────────────────────────────────────────────────────────
  initialDate = input<Date | null>(null);
  initialTime = input<string | null>(null);

  // ── Outputs ─────────────────────────────────────────────────────────────────
  confirmed = output<DateTimeSelection>();
  cleared = output<void>();
  cancelled = output<void>();

  // ── Core state ───────────────────────────────────────────────────────────────
  activeTab = signal<ActiveTab>('date');
  selectedDate = signal<Date | null>(null);
  selectedTime = signal<string | null>(null);
  repeatConfig = signal<RepeatConfig | null>(null);
  reminderConfig = signal<ReminderConfig | null>(null);
  activeSection = signal<AccordionSection>(null);

  // Calendar nav
  calendarYear = signal<number>(new Date().getFullYear());
  calendarMonth = signal<number>(new Date().getMonth());

  // ── Computed ─────────────────────────────────────────────────────────────────
  calendarDays = computed<CalendarDay[]>(() =>
    getCalendarDays(
      this.calendarYear(),
      this.calendarMonth(),
      this.selectedDate(),
    ),
  );

  monthLabel = computed(() =>
    formatMonthYear(this.calendarYear(), this.calendarMonth()),
  );

  timeSlots = computed(() => generateTimeSlots());

  quickActions = computed(() => {
    const today = getToday();
    const tomorrow = getTomorrow();
    const nextWeek = getNextWeek();
    const nextMonth = getNextMonth();
    const sel = this.selectedDate();
    return [
      {
        label: 'Today',
        date: today,
        icon: 'sun',
        active: sel ? isSameDay(sel, today) : false,
      },
      {
        label: 'Tomorrow',
        date: tomorrow,
        icon: 'sunrise',
        active: sel ? isSameDay(sel, tomorrow) : false,
      },
      {
        label: 'Next Week',
        date: nextWeek,
        icon: 'calendar-plus',
        active: sel ? isSameDay(sel, nextWeek) : false,
      },
      {
        label: 'Next Month',
        date: nextMonth,
        icon: 'moon',
        active: sel ? isSameDay(sel, nextMonth) : false,
      },
    ];
  });

  readonly weekdays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  readonly reminderOptions: { label: string; value: ReminderType }[] = [
    { label: 'Daily', value: 'daily' },
    { label: 'Weekly', value: 'weekly' },
    { label: 'Monthly', value: 'monthly' },
    { label: 'Yearly', value: 'yearly' },
    { label: 'Every Weekend', value: 'every-weekend' },
    { label: 'Custom', value: 'custom' },
  ];

  readonly repeatOptions: { label: string; value: RepeatType }[] = [
    { label: 'On the day', value: 'on-the-day' },
    { label: '1 day before', value: '1-day-before' },
    { label: '2 days before', value: '2-days-before' },
    { label: '3 days before', value: '3-days-before' },
    { label: '1 week before', value: '1-week-before' },
    { label: 'Custom', value: 'custom' },
  ];

  ngOnInit() {
    if (this.initialDate()) this.selectedDate.set(this.initialDate());
    if (this.initialTime()) this.selectedTime.set(this.initialTime());
    const d = this.selectedDate() ?? new Date();
    this.calendarYear.set(d.getFullYear());
    this.calendarMonth.set(d.getMonth());
  }

  // ── Calendar navigation ───────────────────────────────────────────────────────
  prevMonth() {
    const m = this.calendarMonth();
    if (m === 0) {
      this.calendarMonth.set(11);
      this.calendarYear.update((y) => y - 1);
    } else {
      this.calendarMonth.update((m) => m - 1);
    }
  }

  nextMonth() {
    const m = this.calendarMonth();
    if (m === 11) {
      this.calendarMonth.set(0);
      this.calendarYear.update((y) => y + 1);
    } else {
      this.calendarMonth.update((m) => m + 1);
    }
  }

  // ── Date selection ────────────────────────────────────────────────────────────
  selectDay(day: CalendarDay) {
    this.selectedDate.set(day.date);
    // Navigate calendar to the selected date's month if needed
    this.calendarYear.set(day.date.getFullYear());
    this.calendarMonth.set(day.date.getMonth());
  }

  selectQuickAction(date: Date) {
    this.selectedDate.set(date);
    this.calendarYear.set(date.getFullYear());
    this.calendarMonth.set(date.getMonth());
  }

  // ── Time ──────────────────────────────────────────────────────────────────────
  isTimeSlotPast(slot: string): boolean {
    return isTimePast(slot, this.selectedDate());
  }

  selectTime(slot: string) {
    if (this.isTimeSlotPast(slot)) return;
    if (!this.selectedDate()) {
      this.selectedDate.set(getToday());
    }
    this.selectedTime.set(slot);
  }

  // ── Accordion ─────────────────────────────────────────────────────────────────
  toggleSection(section: AccordionSection) {
    this.activeSection.update((current) =>
      current === section ? null : section,
    );
  }

  isSectionOpen(section: AccordionSection): boolean {
    return this.activeSection() === section;
  }

  // ── Config selections ─────────────────────────────────────────────────────────
  selectReminder(type: ReminderType) {
    this.reminderConfig.set({ type });
  }

  selectRepeat(type: RepeatType) {
    this.repeatConfig.set({ type });
  }

  // ── Footer ────────────────────────────────────────────────────────────────────
  onClear() {
    this.selectedDate.set(null);
    this.selectedTime.set(null);
    this.repeatConfig.set(null);
    this.reminderConfig.set(null);
    this.activeSection.set(null);
    this.cleared.emit();
  }

  onConfirm() {
    this.confirmed.emit({
      date: this.selectedDate(),
      time: this.selectedTime(),
      repeat: this.repeatConfig() ?? undefined,
      reminder: this.reminderConfig() ?? undefined,
    });
  }

  // ── Keyboard navigation ───────────────────────────────────────────────────────
  onCalendarKeydown(event: KeyboardEvent, day: CalendarDay) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.selectDay(day);
    }
  }

  // ── Tailwind class builders ───────────────────────────────────────────────────
  getDayClass(day: CalendarDay): string {
    const base =
      'aspect-square border-none rounded-full text-[12.5px] flex items-center justify-center cursor-pointer transition-all duration-150 active:scale-90 relative';

    if (day.isSelected) {
      return `${base} bg-blue-500 text-white font-semibold shadow-[0_2px_8px_rgba(59,130,246,0.4)] hover:bg-blue-600`;
    }
    if (day.isPast) {
      return `${base} text-[#48484a] cursor-default`;
    }
    if (!day.isCurrentMonth) {
      return `${base} text-[#48484a] hover:bg-[#2c2c2e]`;
    }
    if (day.isToday) {
      return `${base} text-[#f2f2f7] font-semibold underline decoration-blue-400 decoration-2 underline-offset-2 hover:bg-[#2c2c2e]`;
    }
    return `${base} text-[#f2f2f7] hover:bg-[#2c2c2e]`;
  }

  getTimeSlotClass(slot: string): string {
    const base =
      'py-[7px] px-1 rounded-lg border text-[11.5px] text-center cursor-pointer transition-all duration-150';
    if (this.selectedTime() === slot) {
      return `${base} bg-blue-500 border-blue-500 text-white font-semibold`;
    }
    if (this.isTimeSlotPast(slot)) {
      return `${base} bg-[#2c2c2e] border-white/[0.08] text-[#48484a] opacity-30 cursor-not-allowed`;
    }
    return `${base} bg-[#2c2c2e] border-white/[0.08] text-[#f2f2f7] hover:bg-[#3a3a3c] hover:border-white/20`;
  }

  // ── Template helpers ──────────────────────────────────────────────────────────
  get today(): Date {
    return getToday();
  }

  // ── Label helpers ─────────────────────────────────────────────────────────────
  get selectedTimeLabel(): string {
    return this.selectedTime() ?? 'None';
  }

  get selectedReminderLabel(): string {
    if (!this.reminderConfig()) return 'None';
    const opt = this.reminderOptions.find(
      (o) => o.value === this.reminderConfig()!.type,
    );
    return opt?.label ?? 'None';
  }

  get selectedRepeatLabel(): string {
    if (!this.repeatConfig()) return 'None';
    const opt = this.repeatOptions.find(
      (o) => o.value === this.repeatConfig()!.type,
    );
    return opt?.label ?? 'None';
  }
}
