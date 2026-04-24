import { CommonModule } from '@angular/common';
import {
  Component,
  computed,
  effect,
  inject,
  input,
  OnInit,
  signal,
} from '@angular/core';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions } from '@fullcalendar/core';
import multiMonthPlugin from '@fullcalendar/multimonth';
import interactionPlugin from '@fullcalendar/interaction';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import { TaskService } from '../../services/task.service';
import listPlugin from '@fullcalendar/list';
import { TaskPriority } from '../../enus/task-priority';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-calendar-view.page',
  imports: [CommonModule, FullCalendarModule, FormsModule],
  templateUrl: './calendar-view.page.component.html',
  styleUrl: './calendar-view.page.component.css',
})
export class CalendarViewPageComponent implements OnInit {
  private taskService = inject(TaskService);

  selectedCalender!: CalendarOptions;

  allTasksDates = computed(() => {
    this.taskService.loadAllTasks();
    const allTasks = this.taskService.allTasks$();
    return Object.groupBy(allTasks, (task) => {
      const dateSource = task.dueDateTime || task.dueDate;
      if (!dateSource) return 'no-date';

      return new Date(dateSource).toISOString().split('T')[0];
    });
  });

  allTasks = () =>
    this.taskService.allTasks$().map((t) => ({
      id: t.id,
      title: t.title ?? '',
      start: t.dueDateTime ?? t.dueDate ?? new Date(),
      end: t.dueDateTime ?? t.dueDate ?? new Date(),
      backgroundColor: this.getPriorityColor(t.priority),
      extendedProps: {
        status: t.status,
        priority: t.priority,
        projectId: t.projectId,
        raw: t,
      },
    }));

  constructor() {
    this.taskService.loadAllTasks();
    effect(() => {
      this.taskService.loadAllTasks();
    });
  }

  ngOnInit(): void {
    this.taskService.loadAllTasks();
  }

  CALENDAR_VIEWS: any[] = [
    { name: 'Year', path: 'year' },
    { name: 'Month', path: 'month' },
    { name: 'Week', path: 'week' },
    { name: 'Day', path: 'day' },
    { name: 'Agenda', path: 'agenda' },
    { name: 'Multi-Day', path: 'multi-day' },
    { name: 'Multi-Weeks', path: 'multi-weeks' },
  ];

  yearlyCalender: CalendarOptions = {
    plugins: [multiMonthPlugin, interactionPlugin],
    initialView: 'multiMonthYear',
    initialDate: new Date(),
    multiMonthMaxColumns: 4,

    dateClick: (arg) => this.handleDateClick(arg),
    events: [
      { title: 'event 1', date: '2019-04-01' },
      { title: 'event 2', date: '2019-04-02' },
    ],

    dayCellClassNames: (arg) => {
      const cellDate = arg.date.toISOString().split('T')[0];
      const grouped = this.allTasksDates();
      const count = grouped[cellDate]?.length ?? 0;

      // console.log("count::",count);

      if (count === 0) return [];
      if (count <= 2) return ['has-tasks-low'];
      if (count <= 5) return ['has-tasks-mid'];
      if (count <= 10) return ['has-tasks-high'];
      return ['has-tasks-max'];
    },

    headerToolbar: {
      right: 'prev,today,next',
    },
  };

  /**monthly Calender */
  mothCalender: CalendarOptions = {
    plugins: [dayGridPlugin, interactionPlugin], 

    initialView: 'dayGridMonth',
    initialDate: new Date(),
    displayEventTime: false,
    slotEventOverlap: true,
    eventOverlap: true,

    // testing
    dateClick: (arg) => this.handleDateClick(arg),

    eventDidMount: (arg) => {
      const priority = arg.event.extendedProps['priority'];

      const styles: Record<string, { bg: string; border: string }> = {
        [TaskPriority.HIGH]: { bg: 'rgba(255, 0, 0, 0.1)', border: 'red' },
        [TaskPriority.MEDIUM]: {
          bg: 'rgba(74, 158, 255, 0.1)',
          border: '#4a9eff',
        },
        [TaskPriority.LOW]: {
          bg: 'rgba(246, 255, 74, 0.1)',
          border: '#f6ff4a',
        },
        [TaskPriority.NONE]: {
          bg: 'rgba(255,255,255, 0.05)',
          border: 'transparent',
        },
      };

      const style = styles[priority];
      if (!style) return;

      const eventEl = arg.el as HTMLElement;
      eventEl.style.backgroundColor = style.bg;
      eventEl.style.borderLeft = `3px solid ${style.border}`;
      eventEl.style.borderRadius = '4px';
      eventEl.style.marginBottom = '2px';

      const titleEl = eventEl.querySelector('.fc-event-title') as HTMLElement;
      if (titleEl) {
        titleEl.style.fontWeight = '600';
        titleEl.style.fontSize = '11px';
        titleEl.style.padding = '1px 4px';
      }
    },
    //     dayCellContent: (arg) => {
    //       const cellDate = arg.date.toISOString().split('T')[0];
    //       const grouped = this.allTasksDates();
    //       const tasks = grouped[cellDate] || [];

    //       return {
    //         html: `
    //         <div class="p-2 h-full flex flex-col gap-1">
    //   <div class="text-[11px] font-semibold text-gray-400 mb-1">${arg.dayNumberText}</div>
    //   ${tasks.map((t) => `
    //     <div class="
    //       text-[11px] truncate rounded-md px-2 py-0.5
    //       font-medium text-white cursor-pointer
    //       border-l-2 ${this.getPriorityClass(t.priority)}
    //       ${this.getPriorityClass(t.priority)}
    //     ">
    //       ${t.title}
    //     </div>
    //   `).join('')}
    // </div>
    //       `,
    //       };
    //     },
    events: this.allTasks(),

    headerToolbar: {
      right: 'prev,dayGridMonth,next',
    },
  };

  /**WEEKLY CALENDER */
  weekCalender: CalendarOptions = {
    plugins: [timeGridPlugin, interactionPlugin],
    initialView: 'timeGridWeek',
    initialDate: new Date(),
    contentHeight: 'auto',
    expandRows: true,
    weekends: true,
    slotDuration: '01:00:00',
    slotLabelInterval: '01:00:00',
    allDaySlot: false,
    nowIndicator: true,
    // slotMinTime: '08:00:00',
    // slotMaxTime: '20:00:00',

    events: this.allTasks(),

    headerToolbar: {
      right: 'prev,timeGridWeek,next',
    },
  };

  /**DAY CALENDER */
  dayCalender: CalendarOptions = {
    plugins: [timeGridPlugin, interactionPlugin],
    initialView: 'timeGridDay',
    nowIndicator: true,
    allDaySlot: false,
    initialDate: new Date(),
    slotEventOverlap: true,

    // slotMinTime: '08:00:00',
    // slotMaxTime: '20:00:00',

    events: this.allTasks(),

    // views: {
    //   timeGridFourDay: {
    //     type: 'timeGrid',
    //     duration: { days: 4 },
    //   },
    // },

    headerToolbar: {
      right: 'prev,today,next',
    },
  };

  /**List Tasks */
  listAgendaByDate: CalendarOptions = {
    plugins: [listPlugin],
    initialView: 'listYear',

    // listDayFormat: { weekday: 'narrow' },
    listDayFormat: {
      // month: 'long',
      // year: 'numeric',
      day: 'numeric',
      weekday: 'short',
    },
    //customized default time formate 
    eventTimeFormat: {
      hour: 'numeric',
      minute: '2-digit',
      meridiem: 'short',
    },
    // events: this.allTasks(),
    events: this.allTasks(),
    listDaySideFormat: false,
    noEventsText: 'No tasks',
    eventDidMount: (arg) => {
      arg.el.style.marginBottom = '4px';

      const titleEl = arg.el.querySelector(
        '.fc-list-event-title',
      ) as HTMLElement;
      if (!titleEl) return;

      arg.el.style.backgroundColor = 'transparent';

      const priority = arg.event.extendedProps['priority'];

      const styles: Record<string, { bg: string; border: string }> = {
        [TaskPriority.HIGH]: { bg: 'rgba(255, 0, 0, 0.1)', border: 'red' },
        [TaskPriority.MEDIUM]: {
          bg: 'rgba(74, 158, 255, 0.1)',
          border: '#4a9eff',
        },
        [TaskPriority.LOW]: {
          bg: 'rgba(246, 255, 74, 0.1)',
          border: '#f6ff4a',
        },
        [TaskPriority.NONE]: {
          bg: 'rgba(255,255,255, 0.05)',
          border: 'transparent',
        },
      };

      const style = styles[priority];
      if (style) {
        titleEl.style.backgroundColor = style.bg;
        titleEl.style.borderLeft = `4px solid ${style.border}`;
        titleEl.style.fontWeight = '600';
        titleEl.style.borderRadius = '6px';
        titleEl.style.padding = '8px 12px';
        titleEl.style.display = 'block';
        titleEl.style.marginBottom = '6px';
      }
    },

    eventContent: (arg) => {
      const start = arg.event.start;
      const end = arg.event.end;

      const format = (d: Date) =>
        d?.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        });

      return {
        html: `
      <div class="flex flex-col">
        <div class="text-xs text-gray-400">
          ${format(start ?? new Date())} - ${format(end ?? new Date())}
        </div>
        <div class="font-medium">
          ${arg.event.title}
        </div>
      </div>
    `,
      };
    },
    headerToolbar: {
      right: 'prev,today,next',
    },
  };

  /**Dynamic Days calender */
  selectedDays = 4;
  dynamicDaysCalender: CalendarOptions = {
    plugins: [timeGridPlugin],
    initialView: 'timeGridNDay',

    //button
    customButtons: {
      days: {
        text: 'custom!',
        click: function () {},
      },
    },

    views: {
      timeGridNDay: {
        type: 'timeGrid',
        duration: { days: this.selectedDays },
      },
    },
    events: this.allTasks(),
    headerToolbar: {
      right: 'prev,timeGridNDay,next days',
    },
  };

  /**Dynamic week calender */
  selectedWeeks = 1;
  dynamicWeekCalender: CalendarOptions = {
    plugins: [timeGridPlugin],
    initialView: 'timeGridNWeek', 
    initialDate: new Date(),
    contentHeight: 'auto',
    expandRows: true,
    weekends: true,
    views: {
      timeGridNWeek: {
        type: 'timeGrid',
        duration: { days: this.selectedWeeks * 7 },
      },
    },
    events: this.allTasks(),
    headerToolbar: {
      right: 'prev,timeGridNWeek,next',
    },
  };

  // selectedCalender: CalendarOptions = this.yearlyCalender;

  /**GET PRIORITY STYLE */
  getPriorityClass(priority: string): string {
    switch (priority) {
      case 'HIGH':
        return 'bg-red-500/40';
      case 'MEDIUM':
        return 'bg-yellow-500/40';
      case 'LOW':
        return 'bg-blue-500/40';
      default:
        return 'bg-gray-400/30';
    }
  }
  getPriorityColor(priority: string): string {
    switch (priority) {
      case 'HIGH':
        return `rgba(239, 68,  68,  0.9)`;
      case 'MEDIUM':
        return `rgba(59,  130, 246, 0.9)`;
      case 'LOW':
        return `rgba(250, 204, 21,  0.9)`;
      default:
        return `rgba(156, 163, 175, 0.9)`;
    }
  }

  handleDateClick(arg: any) {
    alert('date click! ' + arg.dateStr);
  }

  activeView = 'year';

  // navigate(path: string) {
  //   this.activeView = path;

  //   switch (path) {
  //     case 'year':
  //       this.selectedCalender = this.yearlyCalender;
  //       break;
  //     case 'month':
  //       this.selectedCalender = this.mothCalender;
  //       break;
  //     case 'week':
  //       this.selectedCalender = this.weekCalender;
  //       break;
  //     case 'day':
  //       this.selectedCalender = this.dayCalender;
  //       break;
  //     case 'agenda':
  //       this.selectedCalender = this.listAgendaByDate;
  //       break;
  //     case 'multi-day':
  //       this.selectedCalender = this.dynamicDaysCalender;
  //       break;
  //     case 'multi-weeks':
  //       this.selectedCalender = this.dynamicWeekCalender;
  //       break;
  //   }
  // }

 
}
