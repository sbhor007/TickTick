export function getToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export function getTomorrow(): Date {
  const d = getToday();
  d.setDate(d.getDate() + 1);
  return d;
}

export function getNextWeek(): Date {
  const d = getToday();
  d.setDate(d.getDate() + 7);
  return d;
}

export function getNextMonth(): Date {
  const d = getToday();
  d.setMonth(d.getMonth() + 1);
  return d;
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function isBeforeToday(d: Date): boolean {
  const today = getToday();
  return d < today;
}

export function getCalendarDays(year: number, month: number, selectedDate: Date | null): import('../models/date').CalendarDay[] {
  const today = getToday();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  const days: import('../models/date').CalendarDay[] = [];

  // Leading days from prev month
  const startDow = firstDay.getDay(); // 0=Sun
  for (let i = startDow - 1; i >= 0; i--) {
    const d = new Date(year, month, -i);
    days.push({
      date: d,
      isCurrentMonth: false,
      isToday: isSameDay(d, today),
      isPast: isBeforeToday(d),
      isSelected: selectedDate ? isSameDay(d, selectedDate) : false,
    });
  }

  // Current month days
  for (let d = 1; d <= lastDay.getDate(); d++) {
    const date = new Date(year, month, d);
    days.push({
      date,
      isCurrentMonth: true,
      isToday: isSameDay(date, today),
      isPast: isBeforeToday(date),
      isSelected: selectedDate ? isSameDay(date, selectedDate) : false,
    });
  }

  // Trailing days to fill 6-row grid (42 cells)
  const remaining = 42 - days.length;
  for (let d = 1; d <= remaining; d++) {
    const date = new Date(year, month + 1, d);
    days.push({
      date,
      isCurrentMonth: false,
      isToday: isSameDay(date, today),
      isPast: isBeforeToday(date),
      isSelected: selectedDate ? isSameDay(date, selectedDate) : false,
    });
  }

  return days;
}

export function formatMonthYear(year: number, month: number): string {
  return new Date(year, month, 1).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });
}

export function generateTimeSlots(): string[] {
  const slots: string[] = [];
  for (let h = 0; h < 24; h++) {
    const hour = h % 12 === 0 ? 12 : h % 12;
    const ampm = h < 12 ? 'AM' : 'PM';
    slots.push(`${hour}:00 ${ampm}`);
    slots.push(`${hour}:30 ${ampm}`);
  }
  return slots;
}

export function isTimePast(timeStr: string, date: Date | null): boolean {
  if (!date) return false;
  const today = getToday();
  if (!isSameDay(date, today)) return false;

  const now = new Date();
  const [timePart, ampm] = timeStr.split(' ');
  const [hStr, mStr] = timePart.split(':');
  let h = parseInt(hStr);
  const m = parseInt(mStr);
  if (ampm === 'PM' && h !== 12) h += 12;
  if (ampm === 'AM' && h === 12) h = 0;

  const slotDate = new Date();
  slotDate.setHours(h, m, 0, 0);
  return slotDate <= now;
}

export function applyRepeatOffset(date: Date, repeatType: string): Date | null {
  if (!date) return null;
  const d = new Date(date);
  switch (repeatType) {
    case 'on-the-day': return d;
    case '1-day-before': d.setDate(d.getDate() - 1); return d;
    case '2-days-before': d.setDate(d.getDate() - 2); return d;
    case '3-days-before': d.setDate(d.getDate() - 3); return d;
    case '1-week-before': d.setDate(d.getDate() - 7); return d;
    default: return d;
  }

  
}

export interface DateTimeSelection {
  date: Date | null;
  time: string | null;
  repeat?: RepeatConfig | null;
  reminder?: ReminderConfig | null;
}

export interface RepeatConfig {
  type: RepeatType;
  offset?: number;
  custom?: string;
}

export interface ReminderConfig {
  type: ReminderType;
  custom?: string;
}

export const DEFAULT_REPEAT: RepeatConfig | null = null;
export const DEFAULT_REMINDER: ReminderConfig | null = null;

export type RepeatType =
  | 'on-the-day'
  | '1-day-before'
  | '2-days-before'
  | '3-days-before'
  | '1-week-before'
  | 'custom';

export type ReminderType =
  | 'daily'
  | 'weekly'
  | 'monthly'
  | 'yearly'
  | 'every-weekend'
  | 'custom';

export type ActiveTab = 'date' | 'duration';
export type AccordionSection = 'time' | 'reminder' | 'repeat' | null;

export interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  isPast: boolean;
  isSelected: boolean;
}