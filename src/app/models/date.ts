export interface DateTimeSelection {
  date: Date | null;
  time: string | null;
  repeat?: RepeatConfig;
  reminder?: ReminderConfig;
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