import { CommonModule, JsonPipe, SlicePipe } from '@angular/common';
import {
  Component,
  EventEmitter,
  inject,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TaskService } from '../../services/task.service';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { ShortDatePipe } from '../../pipe/short-date.pipe';
import { ContextMenuBarService } from '../../config/context-menu-bar.service';
import { Menu } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { EntityType } from '../../enums/entity-type';
import { TooltipModule } from 'primeng/tooltip';
import { TaskPriority } from '../../enus/task-priority';
import { debounceTime } from 'rxjs';
import { TaskStatus } from '../../enus/task-status';
import { Task } from '../../models/task';
import { Base } from 'primeng/base';

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
    Menu,
  ],
  templateUrl: './task-item.component.html',
  styleUrl: './task-item.component.css',
})
export class TaskItemComponent {
  private taskService = inject(TaskService);

  private contextMenuService = inject(ContextMenuBarService);

  @Input() task!: any;
  @Output() taskEvent = new EventEmitter<TaskEventPayload>();
  @Output() contextMenuEvent = new EventEmitter<ContextMenuI>();

  isCompleted = new FormControl();
  taskTitle = new FormControl('');

  @ViewChild('contextMenuOptions') contextMenuOptions!: Menu;
  contextMenu: MenuItem[] = [];

  // tracks which menu item is currently hovered
  hoveredItemId: string | null = null;

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
        this.taskService.updateTask(this.task.id, {
          ...this.task,
          status: val == true ? TaskStatus.COMPLETED : TaskStatus.PENDING,
        });
      } else if (this.task.entityType === EntityType.SUBTASK) {
        this.taskService.updateSubTask(this.task.parentId, this.task.id, {
          ...this.task,
          status: val == true ? TaskStatus.COMPLETED : TaskStatus.PENDING,
        });
      }
    });
  }

  openFolderMenu(event: MouseEvent, task: Task) {
    event.stopPropagation();
    event.preventDefault();

    const context = this.contextMenuService.getContextMenu(
      task.entityType,
      task.isPinned,
    );

    this.contextMenu = context.map((item): MenuItem => {
      if (item.isDivider) return { separator: true };
      return {
        ...item,
        // mark move-to items so the template can identify them
        // id: item.action === 'shareUnshareTag' ? 'move-to-item' : item.action,
        command: () => this.handleAction(task, item.action),
      };
    });

    this.contextMenuOptions.toggle(event);
  }

  handleAction(task: Task, action: string) {
    console.log('action:', action, 'entityType:', task.entityType);
    this.contextMenuEvent.emit({
      action: action,
      entityType: task.entityType,
      entityId: task.id,
      payload: task
    });
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
}
