import { CommonModule, JsonPipe, SlicePipe } from '@angular/common';
import {
  Component,
  computed,
  EventEmitter,
  HostListener,
  inject,
  Input,
  OnChanges,
  Output,
  signal,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TaskService } from '../../services/task.service';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { ShortDatePipe } from '../../pipe/short-date.pipe';
import { ContextMenuBarService } from '../../config/context-menu-bar.service';
import { ContextMenuItem } from '../../models/context-menu-item';
import { Popover } from 'primeng/popover';
import { MenuItem } from 'primeng/api';
import { EntityType } from '../../enums/entity-type';
import { TooltipModule } from 'primeng/tooltip';
import { TaskPriority } from '../../enus/task-priority';
import { combineLatest, debounceTime, fromEvent, map, sequenceEqual } from 'rxjs';
import { TaskStatus } from '../../enus/task-status';
import { Task } from '../../models/task';
import { FolderService } from '../../services/folder.service';
import { ProjectService } from '../../services/project.service';
import { Folder } from '../../models/folder';
import { DateTimePickerComponent } from '../date-time-picker/date-time-picker.component';
import { DateTimeSelection } from '../../models/date';
import { Project } from '../../models/project';
import { TagSelectorComponent } from '../tag-selector/tag-selector.component';
import { MoveToProjectComponent } from "../move-to-project/move-to-project.component";

export type TaskActionType =
  | 'update'
  | 'delete'
  | 'duplicate'
  | 'move'
  | 'create_subtask'
  | 'complete';
export type TaskField =
  | 'title'
  | 'status'
  | 'dueDate'
  | 'dueTime'
  | 'reminder'
  | 'repeat'
  | 'tags'
  | 'all';

export interface TaskEventPayload {
  actionType: TaskActionType;
  entityType: EntityType;
  id: string;
  field: TaskField;
  payload: any;
}

export interface ContextMenuI {
  action: string;
  entityType: EntityType;
  entityId: string;
  payload?: Task;
  originalEvent?:any
}

@Component({
  selector: 'app-task-item',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SlicePipe,
    CheckboxModule,
    FormsModule,
    InputTextModule,
    ShortDatePipe,
    TooltipModule,
    Popover,
    DateTimePickerComponent,
    TagSelectorComponent,
    MoveToProjectComponent
],
  templateUrl: './task-item.component.html',
  styleUrl: './task-item.component.css',
})
export class TaskItemComponent implements OnChanges {
  private taskService = inject(TaskService);
  private folderService = inject(FolderService);
  private projectService = inject(ProjectService);
  private contextMenuService = inject(ContextMenuBarService);

  @Input() task!: any;
  // @Output() taskEvent = new EventEmitter<TaskEventPayload>();
  @Output() contextMenuEvent = new EventEmitter<ContextMenuI>();

  isDateTimePikerVisible = false;
  initialDate = signal<Date | null>(null);
  initialTime = signal<string | null>(null);
  lastSelection = signal<DateTimeSelection | null>(null);
  showMoveTo = false;

  lastContextEvent:any



  /**move to */
  isVisibleFolderMenu = false;
  // folderProject = computed(() => {
  //   const folder = this.folderService
  //     .allFolders$()

  //     .map((folder) => ({
  //       ...folder,
  //       projects: this.projectService
  //         .projects$()
  //         .filter((project) => project.folderId == folder.id),
  //     }))
  //     .filter((folder) => folder.projects.length > 0);
  //   const project = this.projectService
  //     .projects$()
  //     .filter((project) => project.folderId == null && !project.isSmartView);
  //   return [...folder, ...project];
  // });

  isCompleted = new FormControl();
  taskTitle = new FormControl('');

  activeDate: string | null = null;
  activePriority: string | null = null;

  @ViewChild('contextMenuPopover') contextMenuPopover!: Popover;
  @ViewChild('dateTimePopover') dateTimePopover!: any;
  contextMenu: MenuItem[] = [];

  // Structured context menu data
  menuSections: ContextMenuItem[] = [];
  menuRegularItems: ContextMenuItem[] = [];
  private currentTask!: Task;

  // tracks which menu item is currently hovered
  hoveredItemId: string | null = null;

  hoveredFolderId: string | null = null;

  

  onFolderHover(folderId: string) {
    this.hoveredFolderId = folderId;
  }

  onFolderLeave() {
    this.hoveredFolderId = null;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['task'] && !changes['task'].firstChange) {
      const t = changes['task'].currentValue;
      this.taskTitle.setValue(t?.title ?? '', { emitEvent: false });
      this.isCompleted.setValue(t?.status === 'COMPLETED', {
        emitEvent: false,
      });
    }
  }

  ngOnInit(): void {
    this.taskTitle.setValue(this.task?.title ?? '');
    this.isCompleted.setValue(this.task?.status === 'COMPLETED');

    /**update title(task and sub task) */
    this.taskTitle.valueChanges.pipe(debounceTime(1000)).subscribe((val) => {
      if (val != null) {
        if (this.task.entityType === EntityType.TASK) {
          this.taskService.updateTask(this.task.id, {
            ...this.task,
            title: val,
          });
        } else if (this.task.entityType === EntityType.SUBTASK) {
          this.taskService.updateSubTask(this.task.parentId, this.task.id, {
            ...this.task,
            title: val,
          });
        }
      }
    });
    /**update task status */
    this.isCompleted.valueChanges.subscribe((val) => {
      console.log('checkBox Value :', this.task.entityType);

      if (this.task.entityType === EntityType.TASK) {
        const updatedSubtasks = val
          ? this.task.subtasks.map((st: Task) => ({
              ...st,
              status: TaskStatus.COMPLETED,
            }))
          : this.task.subtasks.map((st: Task) => ({
              ...st,
              status: TaskStatus.PENDING,
            }));

        this.taskService.updateTask(this.task.id, {
          ...this.task,
          subtasks: updatedSubtasks,
          status: val ? TaskStatus.COMPLETED : TaskStatus.PENDING,
        });
      } else if (this.task.entityType === EntityType.SUBTASK) {
        this.taskService.updateSubTask(this.task.parentId, this.task.id, {
          ...this.task,
          status: val == true ? TaskStatus.COMPLETED : TaskStatus.PENDING,
        });
      }
    });
  }

  optionMenu(event: any, task: Task) {
    event.stopPropagation();
    event.preventDefault();

    this.currentTask = task;

    const context = this.contextMenuService.getContextMenu(
      task.entityType,
      task.isPinned,
      false,
      false,
      task.isNote ?? false,
      task.status == TaskStatus.WONT_DO ? true : false,
    );
    this.lastContextEvent = event;

    // Split into sections (Date/Priority) and regular items
    this.menuSections = context.filter((i) => i.isSectionHeader);
    this.menuRegularItems = context.filter((i) => !i.isSectionHeader);

    this.contextMenuPopover.toggle(event);
  }

  onSectionItemClick(sectionAction: string, itemAction: string) {
    if (this.currentTask) {
      this.handleAction(this.currentTask, itemAction);
    }
    this.contextMenuPopover.hide();
  }

  onRegularItemClick(item: ContextMenuItem) {
    if (item.isDivider) return;
    if (this.currentTask) {
      this.handleAction(this.currentTask, item.action);
    }
    if (!item.hasSubmenu) {
      this.contextMenuPopover.hide();
    }
  }

  onMouse(event: any) {
    console.log('----', event);
    this.isVisibleFolderMenu = !this.isVisibleFolderMenu;
  }

  /*task item handle actions*/
  handleAction(task: Task, action: string) {
    console.log('action:', action, 'entityType:', task.entityType);
    this.contextMenuEvent.emit({
      action: action,
      entityType: task.entityType,
      entityId: task.id,
      payload: task,
      originalEvent:this.lastContextEvent
    });
  }
  moveTO(project: Project, action: string) {
    console.log(
      'action:',
      action,
      'entityType:',
      this.task.entityType,
      'project:',
      project,
    );
    this.contextMenuEvent.emit({
      action: action,
      entityType: this.task.entityType,
      entityId: project.id,
      payload: this.task,
      originalEvent:this.lastContextEvent
    });
  }

  getPrioritySection() {
    return this.contextMenu.find((i) => i['action'] === 'priority_section');
  }

  onMenuAction(action: string) {
    // your existing handleAction logic
  }

  onMoveToEnter(event: MouseEvent, item: MenuItem) {
    this.hoveredItemId = item.id ?? null;
    console.log('mouseenter → move-to item:', item.label, item);
    // your hover logic here, e.g. show a submenu, preview, etc.
  }

  onMoveToLeave(event: MouseEvent, item: MenuItem) {
    this.hoveredItemId = null;
    console.log('mouseleave → move-to item:', item.label);
  }

  onItemEnter(event: MouseEvent, item: MenuItem) {
    if (item.id !== 'move-to-item') return;
    this.hoveredItemId = item.id;
    console.log('mouseenter → move-to:', item.label);
    // your logic here
  }

  onItemLeave(event: MouseEvent, item: MenuItem) {
    if (item.id !== 'move-to-item') return;
    this.hoveredItemId = null;
    console.log('mouseleave → move-to:', item.label);
  }

  /*checkbox*/
  getCheckboxClass(priority: TaskPriority): string {
    const base =
      'w-3.5 h-3.5 rounded-sm appearance-none border-2 cursor-pointer transition-colors';
    switch (priority) {
      case TaskPriority.HIGH:
        return `${base} border-red-500 checked:bg-red-500`;
      case TaskPriority.MEDIUM:
        return `${base} border-yellow-400 checked:bg-yellow-400`;
      case TaskPriority.LOW:
        return `${base} border-blue-400 checked:bg-blue-400`;
      default:
        return `${base} border-gray-500 checked:bg-gray-500`;
    }
  }

  /**due date */
  getDueDateColor(dueDate: any): string {
    if (!dueDate) return 'text-gray-500';
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    return due < today ? 'text-red-400' : 'text-blue-400';
  }

  /**dateTimePiker */
  handleDateTimeEvent(selection: DateTimeSelection) {
    console.log('event handle::', selection);

    if (this.task.entityType === EntityType.SUBTASK && this.task.parentId) {
      this.taskService.updateSubTask(this.task.parentId, this.task.id, {
        ...this.task,
        dueDate: selection.date,
        dueDateTime: selection.time ?? this.task.dueDateTime,
        repeat: selection.repeat,
        reminder: selection.reminder,
        updatedAt: new Date().toISOString(),
      });
    } else {
      this.taskService.updateTask(this.task.id, {
        ...this.task,
        dueDate: selection.date,
        dueDateTime: selection.time ?? this.task.dueDateTime,
        repeat: selection.repeat,
        reminder: selection.reminder,
        updatedAt: new Date().toISOString(),
      });
    }
    this.isDateTimePikerVisible = false;
  }

  toggleDateTime(event: Event) {
    this.isDateTimePikerVisible = !this.isDateTimePikerVisible;
    console.log(this.isDateTimePikerVisible);
    if (this.isDateTimePikerVisible) {
      setTimeout(() => {
        this.dateTimePopover?.show(event);
      }, 10);
    } else {
      this.dateTimePopover?.hide();
    }
  }

  updateTaskOrSubTaskStatus(task: Task) {
    if (task.entityType == EntityType.TASK) {
      this.taskService.updateTask(task.id, {
        ...task,
        status: TaskStatus.PENDING,
        updatedAt: new Date().toISOString(),
      });
    } else if (task.entityType == EntityType.SUBTASK) {
      this.taskService.updateSubTask(task.parentId ?? '', task.id, {
        ...task,
        status: TaskStatus.PENDING,
        updatedAt: new Date().toISOString(),
      });
    }
  }

 
}
