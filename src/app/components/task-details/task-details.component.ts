import {
  Component,
  computed,
  effect,
  inject,
  Injector,
  OnInit,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TaskService } from '../../services/task.service';
import { EntityType } from '../../enums/entity-type';
import { Task } from '../../models/task';
import { JsonPipe, NgClass } from '@angular/common';
import { TaskPriority } from '../../enus/task-priority';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TaskStatus } from '../../enus/task-status';
import { ShortDatePipe } from '../../pipe/short-date.pipe';
import { ContextMenuBarService } from '../../config/context-menu-bar.service';
import { ContextMenuItem } from '../../models/context-menu-item';
import { Popover } from 'primeng/popover';
import { MenuItem } from 'primeng/api';
import { debounceTime } from 'rxjs';
import { TaskItemComponent } from '../../share/task-item/task-item.component';

@Component({
  selector: 'app-task-details',
  imports: [
    ReactiveFormsModule,
    ShortDatePipe,
    Popover,
    NgClass,
    TaskItemComponent,
  ],
  templateUrl: './task-details.component.html',
  styles: ``,
})
export class TaskDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private taskService = inject(TaskService);
  private contextMenuService = inject(ContextMenuBarService);
  private injector = inject(Injector);

  entityType!: any;
  entityId!: any;
  task!: Task;
  priorityOptions = Object.values(TaskPriority);

  isCompleted = new FormControl<boolean>(false);
  priority = new FormControl<TaskPriority>(TaskPriority.NONE);
  taskTitle = new FormControl<any>('');
  taskDescription = new FormControl<any>('');

  @ViewChild('priorityMenuPopover') priorityMenuPopover!: Popover;
  contextMenu: MenuItem[] = [];
  priorityMenu: ContextMenuItem[] = [];

  ngOnInit() {
    this.route.params.subscribe(({ entityType, id }) => {
      this.entityId = id;
      this.entityType = entityType;
      console.log('Route param entityType:', entityType);
      console.log('Route param id:', id);
      if (entityType == 'task') {
        console.log('----');

        this.getTaskById(this.entityId);
      }
    });
    /**update task status */
    this.isCompleted.valueChanges.subscribe((val) => {
      if (this.task.entityType == EntityType.TASK) {
        this.taskService.updateTask(this.task.id, {
          ...this.task,
          status: val == true ? TaskStatus.COMPLETED : TaskStatus.PENDING,
        });
      } else if (
        this.task.entityType === EntityType.SUBTASK &&
        this.task.parentId
      ) {
        this.taskService.updateSubTask(this.task?.parentId, this.task.id, {
          ...this.task,
          status: val == true ? TaskStatus.COMPLETED : TaskStatus.PENDING,
        });
      }
    });

    /**update title */
    this.taskTitle.valueChanges.pipe(debounceTime(500)).subscribe((val) => {
      if (this.task.entityType == EntityType.TASK && val) {
        this.taskService.updateTask(this.task.id, {
          ...this.task,
          title: this.taskTitle.value ?? this.task.title,
        });
      } else if (
        this.task.entityType === EntityType.SUBTASK &&
        this.task.parentId &&
        val
      ) {
        this.taskService.updateTask(this.task.id, {
          ...this.task,
          title: this.taskTitle.value ?? this.task.title,
        });
      }
    });

    /**update description */
    this.taskDescription.valueChanges
      .pipe(debounceTime(500))
      .subscribe((val) => {
        if (this.task.entityType == EntityType.TASK) {
          this.taskService.updateTask(this.task.id, {
            ...this.task,
            description: this.taskDescription.value,
          });
        } else if (
          this.task.entityType === EntityType.SUBTASK &&
          this.task.parentId
        ) {
          this.taskService.updateTask(this.task.id, {
            ...this.task,
            description: this.taskDescription.value ?? this.task.description,
          });
        }
      });
  }
  /**priority Menu */
  openPriorityMenu(event: any) {
    event.stopPropagation();
    event.preventDefault();
    const context = this.contextMenuService.getContextMenu(EntityType.PRIORITY);

    this.priorityMenu = context;
    this.priorityMenuPopover.toggle(event);
  }

  onPrioritySelected(action: string) {
    console.log('priority selection : ', action);
    if (this.task.entityType == EntityType.TASK) {
      switch (action) {
        case 'set_priority_high':
          this.taskService.updateTask(this.task.id, {
            ...this.task,
            priority: TaskPriority.HIGH,
          });
          this.getTaskById(this.task.id);
          break;
        case 'set_priority_medium':
          this.taskService.updateTask(this.task.id, {
            ...this.task,
            priority: TaskPriority.MEDIUM,
          });
          this.getTaskById(this.task.id);
          break;
        case 'set_priority_low':
          this.taskService.updateTask(this.task.id, {
            ...this.task,
            priority: TaskPriority.LOW,
          });
          this.getTaskById(this.task.id);
          break;
        case 'set_priority_none':
          this.taskService.updateTask(this.task.id, {
            ...this.task,
            priority: TaskPriority.NONE,
          });
          this.getTaskById(this.task.id);
          break;
      }
    }
  }

  /**get task By id */
  getTaskById(taskId: string) {
  const liveTask = computed(() =>
    this.taskService.allTasks$().find((t) => t.id === taskId)
  );

  effect(() => {
    const task = liveTask();
    if (!task) return;

    this.task = task;

    // ✅ emitEvent: false — prevents valueChanges from firing
    this.isCompleted.setValue(task.status === TaskStatus.COMPLETED, { emitEvent: false });
    this.priority.setValue(task.priority,                           { emitEvent: false });
    this.taskTitle.setValue(task.title,                             { emitEvent: false });
    this.taskDescription.setValue(task.description,                 { emitEvent: false });
  }, { injector: this.injector });
}
  /**update task */

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
