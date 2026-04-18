import {
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  Injector,
  OnInit,
  signal,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TaskService } from '../../services/task.service';
import { EntityType } from '../../enums/entity-type';
import { Task } from '../../models/task';
import { JsonPipe, NgClass } from '@angular/common';
import { TaskPriority } from '../../enus/task-priority';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TaskStatus } from '../../enus/task-status';
import { ShortDatePipe } from '../../pipe/short-date.pipe';
import { ContextMenuBarService } from '../../config/context-menu-bar.service';
import { ContextMenuItem } from '../../models/context-menu-item';
import { Popover } from 'primeng/popover';
import { MenuItem } from 'primeng/api';
import { debounceTime, tap } from 'rxjs';
import { TrashService } from '../../services/trash.service';
import { TaskItemComponent } from '../../share/task-item/task-item.component';
import { AttachmentService } from '../../services/attachment.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { DateTimePickerComponent } from '../../share/date-time-picker/date-time-picker.component';
import { DateTimeSelection } from '../../models/date';
import { TagsService } from '../../config/tags.service';
import { Tag } from '../../models/tag';
import { TagSelectorComponent } from '../../share/tag-selector/tag-selector.component';
import { PickerComponent } from '@ctrl/ngx-emoji-mart';
import { CommentService } from '../../services/comment.service';
import { TimeAgoPipe } from '../../pipe/time-ago.pipe';
import { TaskComment } from '../../models/task-comment';

@Component({
  selector: 'app-task-details',
  imports: [
    ReactiveFormsModule,
    ShortDatePipe,
    Popover,
    NgClass,
    TaskItemComponent,
    JsonPipe,
    RouterLink,
    DateTimePickerComponent,
    FormsModule,
    TagSelectorComponent,
    PickerComponent,
    TimeAgoPipe,
  ],
  templateUrl: './task-details.component.html',
  styles: [`
    ::ng-deep emoji-mart .emoji-mart {
      width: 100% !important;
      height: 380px !important;
    }

    ::ng-deep emoji-mart .emoji-mart-bar:first-child {
      display: none !important;
    }

    ::ng-deep emoji-mart .emoji-mart-scroll {
      height: calc(380px - 90px) !important;
      overflow-y: auto !important;
      overflow-x: hidden !important;
    }

    ::ng-deep emoji-mart .emoji-mart-search {
      padding: 8px !important;
    }
  `]
})
export class TaskDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private taskService = inject(TaskService);
  private contextMenuService = inject(ContextMenuBarService);
  private attachmentService = inject(AttachmentService);
  private sanitizer = inject(DomSanitizer);
  private trashService = inject(TrashService);
  private tagService = inject(TagsService);
  private injector = inject(Injector);
  private commentsService = inject(CommentService);

  entityType!: any;
  entityId!: any;
  task!: Task;
  parentTask!: any;
  attachment: any = null;
  imageUrl: SafeUrl | null = null;

  isDateTimePikerVisible = false;
  initialDate = signal<Date | null>(null);
  initialTime = signal<string | null>(null);
  lastSelection = signal<DateTimeSelection | null>(null);

  @ViewChild('dateTimePopover') dateTimePopover!: any;

  isTagSelectorVisible = false;
  selectedTask: Task | null = null;
  selectedTags: Tag[] = [];

  priorityOptions = Object.values(TaskPriority);

  /**comments */
  //  allComments = signal<TaskComment[]>([])

  constructor() {
    effect(() => {
      const allTasks = this.taskService.allTasks$();
      if (!this.entityId) return;

      if (this.entityType === 'task') {
        const updated = allTasks.find((t) => t.id === this.entityId);
        if (updated) {
          this.task = updated;
          this.taskTitle.setValue(updated.title, { emitEvent: false });
          this.taskDescription.setValue(updated.description, {
            emitEvent: false,
          });
          this.isCompleted.setValue(updated.status === TaskStatus.COMPLETED, {
            emitEvent: false,
          });
          this.priority.setValue(updated.priority, { emitEvent: false });
          /* get comment data*/
          const filtered = this.commentsService
            .allComments$()
            .filter((c) => c.taskId === this.task.id);
          console.log(filtered);

          this.allComments.update(() => filtered ?? []);
        }
      } else if (this.entityType === 'subtask') {
        const result = this.taskService.findSubTaskById(this.entityId);
        if (result) {
          this.task = result.subtask;
          this.parentTask = result.parentTask;
          this.taskTitle.setValue(result.subtask.title, { emitEvent: false });
          this.taskDescription.setValue(result.subtask.description, {
            emitEvent: false,
          });
          this.isCompleted.setValue(
            result.subtask.status === TaskStatus.COMPLETED,
            { emitEvent: false },
          );
          this.priority.setValue(result.subtask.priority, { emitEvent: false });
          /**get comment data */
          const filtered = this.commentsService
            .allComments$()
            .filter((c) => c.taskId === this.entityId);
          this.allComments.update(() => filtered ?? []);
        }
      }
    });

    // /**load comments */
    // effect(() => {
    //   const filtered = this.commentsService
    //     .allComments$()
    //     .filter((c) => c.taskId === this.task.id);

    //   this.allComments.update(() => filtered ?? []);
    // });
  }

  isCompleted = new FormControl<boolean>(false);
  priority = new FormControl<TaskPriority>(TaskPriority.NONE);
  taskTitle = new FormControl<any | null | undefined>(null);
  taskDescription = new FormControl<any>('');

  @ViewChild('priorityMenuPopover') priorityMenuPopover!: Popover;
  contextMenu: MenuItem[] = [];
  priorityMenu: ContextMenuItem[] = [];

  ngOnInit() {
    this.commentsService.loadAllComments();
    /**routing data */
    this.route.params.subscribe(({ entityType, id }) => {
      this.parentTask = null;
      this.entityId = id;
      this.entityType = entityType;
      console.log('Route param entityType:', entityType);
      console.log('Route param id:', id);
      this.taskService.loadAllTasks();
      if (entityType == 'task') {
        this.taskService.loadAllTasks();
        this.getTaskById(this.entityId);
      } else if (entityType == 'subtask') {
        this.getSubTaskById(id);
      }
    });

    // this.taskService.loadAllTasks();
    /**update task status */
    this.isCompleted.valueChanges.subscribe((val) => {
      if (this.task.entityType == EntityType.TASK) {
        if (this.task.subtasks) {
          const updatedSubtasks = val
            ? this.task.subtasks.map((st: Task) => ({
                ...st,
                status: TaskStatus.COMPLETED,
              }))
            : this.task.subtasks;

          this.taskService.updateTask(this.task.id, {
            ...this.task,
            subtasks: updatedSubtasks,
            status: val ? TaskStatus.COMPLETED : TaskStatus.PENDING,
          });
        } else {
          this.taskService.updateTask(this.task.id, {
            ...this.task,
            status: val == true ? TaskStatus.COMPLETED : TaskStatus.PENDING,
          });
        }
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
        this.taskService.updateSubTask(this.task.parentId, this.task.id, {
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
          this.taskService.updateSubTask(this.task.parentId, this.task.id, {
            ...this.task,
            description: this.taskDescription.value,
          });
        }
      });
  }

  /**get subtask buy id */

  /**priority Menu */
  openPriorityMenu(event: any) {
    event.stopPropagation();
    event.preventDefault();
    const context = this.contextMenuService.getContextMenu(EntityType.PRIORITY);

    this.priorityMenu = context;
    this.priorityMenuPopover.toggle(event);
  }

  /**Add Subtask */
  addSubtask() {
    const subTask: Task = {
      id: crypto.randomUUID(),
      userId: null,
      projectId: this.task?.projectId ?? null,
      parentId: this.task.id,
      title: '',
      description: '',
      status: TaskStatus.PENDING,
      priority: TaskPriority.NONE,
      isPinned: false,
      subtasks: [],
      tags: [],
      comments: [],
      attachmentId: null,
      entityType: EntityType.SUBTASK,
      reminder: null,
      repeat: null,
      dueDate: null,
      dueDateTime: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      completedAt: null,
    };

    this.taskService.createSubTask(this.task.id, subTask);
  }

  onPrioritySelected(action: string) {
    console.log('priority selection : ', action);

    const priorityMap: Record<string, TaskPriority> = {
      set_priority_high: TaskPriority.HIGH,
      set_priority_medium: TaskPriority.MEDIUM,
      set_priority_low: TaskPriority.LOW,
      set_priority_none: TaskPriority.NONE,
    };

    const newPriority = priorityMap[action];
    if (newPriority === undefined) return;

    if (this.task.entityType === EntityType.TASK) {
      this.taskService.updateTask(this.task.id, {
        ...this.task,
        priority: newPriority,
      });
    } else if (
      this.task.entityType === EntityType.SUBTASK &&
      this.task.parentId
    ) {
      this.taskService.updateSubTask(this.task.parentId, this.task.id, {
        ...this.task,
        priority: newPriority,
      });
    }
    // No manual getTaskById needed — the effect() auto-syncs when the signal updates
  }

  /**get task By id */
  getTaskById(taskId: string) {
    this.taskService.fetchTaskById(taskId).subscribe((task) => {
      console.log(task);
      this.task = task;

      this.isCompleted.setValue(task.status === TaskStatus.COMPLETED, {
        emitEvent: false,
      });
      this.priority.setValue(task.priority, { emitEvent: false });
      this.taskTitle.setValue(task.title, { emitEvent: false });
      this.taskDescription.setValue(task.description, { emitEvent: false });
      if (task.attachmentId) {
        this.getAttachmentById(task.attachmentId);
      }
      const due = this.task.dueDate;
      this.initialDate.set(
        typeof due === 'string' ? new Date(due) : (due ?? null),
      );
      this.initialTime.set(task.dueDateTime ?? null);
    });
  }

  /**get attachment and show image */
  getAttachmentById(attachmentId: string) {
    this.attachmentService
      .getAttachmentById(attachmentId)
      .subscribe((attachment) => {
        console.log('Attachment response:', attachment);
        this.attachment = attachment;
        this.showImage();
      });
  }

  /**show image */
  showImage() {
    if (this.attachment && this.attachment.fileData) {
      // fileData is already a base64 data URL (e.g. "data:image/png;base64,...")
      this.imageUrl = this.sanitizer.bypassSecurityTrustUrl(
        this.attachment.fileData,
      );
    }
  }
  /**get sub task */
  getSubTaskById(subtaskId: string) {
    const result = this.taskService.findSubTaskById(subtaskId);
    if (result) {
      console.log(
        'Subtask found:',
        result.subtask,
        'Parent task:',
        result.parentTask.id,
      );
      this.task = result.subtask;
      this.isCompleted.setValue(
        result.subtask.status === TaskStatus.COMPLETED,
        { emitEvent: false },
      );
      this.priority.setValue(result.subtask.priority, { emitEvent: false });
      this.taskTitle.setValue(result.subtask.title, { emitEvent: false });
      this.taskDescription.setValue(result.subtask.description, {
        emitEvent: false,
      });
      const due = this.task.dueDate;
      this.initialDate.set(
        typeof due === 'string' ? new Date(due) : (due ?? null),
      );
      this.initialTime.set(result.subtask?.dueDateTime ?? null);
    } else {
      this.taskService.fetchAllTasks().subscribe((tasks) => {
        this.taskService.allTasks$.set(tasks);
        const retryResult = this.taskService.findSubTaskById(subtaskId);
        if (retryResult) {
          console.log('Subtask found after reload:', retryResult.subtask);
          this.task = retryResult.subtask;
          this.isCompleted.setValue(
            retryResult.subtask.status === TaskStatus.COMPLETED,
            { emitEvent: false },
          );
          this.priority.setValue(retryResult.subtask.priority, {
            emitEvent: false,
          });
          this.taskTitle.setValue(retryResult.subtask.title, {
            emitEvent: false,
          });
          this.taskDescription.setValue(retryResult.subtask.description, {
            emitEvent: false,
          });
          this.parentTask = this.taskService
            .allTasks$()
            .find((t) => t.parentId === this.task.parentId);
        } else {
          console.warn('Subtask not found for subtaskId:', subtaskId);
        }
        const due = this.task.dueDate;
        this.initialDate.set(
          typeof due === 'string' ? new Date(due) : (due ?? null),
        );
        this.initialTime.set(retryResult?.subtask?.dueDateTime ?? null);
      });
    }
    if (result) {
      this.taskService
        .fetchTaskById(this.task?.parentId ?? '')
        .subscribe((parentTask) => {
          this.parentTask = parentTask;
        });
    }
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
  /*flag classes*/
  getFlagClass(priority: TaskPriority): string {
    switch (priority) {
      case TaskPriority.HIGH:
        return 'pi pi-flag text-red-500';
      case TaskPriority.MEDIUM:
        return 'pi pi-flag text-yellow-400';
      case TaskPriority.LOW:
        return 'pi pi-flag text-blue-400';
      default:
        return 'pi pi-flag text-gray-500';
    }
  }

  /**task-item-event-handler — handles context menu events from subtask items */
  taskItemEventHandler(event: any) {
    console.log('Task Details Event Handler::', event);
    const task: Task = event.payload;
    const isSubtask = event.entityType === EntityType.SUBTASK;

    switch (event.action) {
      case 'add_subtask':
        this.createSubTaskFromEvent(event.entityId, task);
        break;

      case 'pin':
      case 'unpin':
        this.updateTaskOrSubTask(event, { isPinned: !task.isPinned });
        break;

      case 'set_date_today':
        this.updateTaskOrSubTask(event, { dueDate: this.getDateISO(0) });
        break;
      case 'set_date_tomorrow':
        this.updateTaskOrSubTask(event, { dueDate: this.getDateISO(1) });
        break;
      case 'set_date_next_week':
        this.updateTaskOrSubTask(event, { dueDate: this.getDateISO(7) });
        break;

      case 'set_priority_high':
        this.updateTaskOrSubTask(event, { priority: TaskPriority.HIGH });
        break;
      case 'set_priority_medium':
        this.updateTaskOrSubTask(event, { priority: TaskPriority.MEDIUM });
        break;
      case 'set_priority_low':
        this.updateTaskOrSubTask(event, { priority: TaskPriority.LOW });
        break;
      case 'set_priority_none':
        this.updateTaskOrSubTask(event, { priority: TaskPriority.NONE });
        break;

      case 'wont_do':
        this.updateTaskOrSubTask(event, { status: TaskStatus.WONT_DO });
        break;
      case 'move_to':
        if (event.entityType == EntityType.SUBTASK) {
          this.taskService.deleteSubTask(
            event.payload.parentId,
            event.payload.id,
          );
          this.taskService.crateTask(event.entityId, {
            ...event.payload,
            projectId: event.entityId,
            entityType: EntityType.TASK,
            parentId: null,
          });
        }
        break;
      case 'add_tags_to_task':
        this.isTagSelectorVisible = true;
        this.selectedTags = event.payload.tags;
        this.selectedTask = event.payload;
        break;

      case 'duplicate':
        if (isSubtask) {
          this.taskService.createSubTask(task.parentId!, {
            ...task,
            id: crypto.randomUUID(),
            title: task.title + ' copied',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        } else {
          this.taskService.crateTask(task.projectId!, {
            ...task,
            id: crypto.randomUUID(),
            title: task.title + ' copied',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        }
        break;

      case 'copy_link':
        const url = `${window.location.origin}/${task.entityType.toLowerCase()}/${task.id}`;
        navigator.clipboard.writeText(url).then(() => {
          console.log('Link copied to clipboard:', url);
        });
        break;

      case 'delete':
        this.trashService.addTrash({
          ...task,
          entityType: EntityType.TRASHED,
        });
        if (isSubtask) {
          this.taskService.deleteSubTask(task.parentId!, event.entityId);
        } else {
          this.taskService.deleteTask(event.entityId);
        }
        break;

      case 'delete_forever':
        this.trashService.deleteTrash(event.entityId);
        break;
    }
  }

  /** Helper: update task or subtask based on entity type */
  private updateTaskOrSubTask(event: any, updates: Partial<Task>) {
    const task: Task = event.payload;
    if (event.entityType === EntityType.SUBTASK && task.parentId) {
      this.taskService.updateSubTask(task.parentId, task.id, {
        ...task,
        ...updates,
        updatedAt: new Date().toISOString(),
      });
    } else {
      this.taskService.updateTask(event.entityId || task.id, {
        ...task,
        ...updates,
        updatedAt: new Date().toISOString(),
      });
    }
  }

  /** Helper: get ISO date string offset by N days from today */
  private getDateISO(daysFromToday: number): string {
    const date = new Date();
    date.setDate(date.getDate() + daysFromToday);
    date.setHours(0, 0, 0, 0);
    return date.toISOString();
  }

  /** Helper: create subtask from context menu event */
  private createSubTaskFromEvent(taskId: string, task: Task) {
    const subTask: Task = {
      id: crypto.randomUUID(),
      userId: null,
      projectId: task?.projectId ?? null,
      parentId: task.id,
      title: '',
      description: '',
      status: TaskStatus.PENDING,
      priority: TaskPriority.NONE,
      isPinned: false,
      subtasks: [],
      tags: [],
      comments: [],
      attachmentId: null,
      entityType: EntityType.SUBTASK,
      reminder: null,
      repeat: null,
      dueDate: null,
      dueDateTime: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      completedAt: null,
    };
    this.taskService.createSubTask(taskId, subTask);
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

  /**navigate to */
  navigateTo(entityType: string, id: string) {
    this.router.navigate([entityType.toString().toLowerCase(), id], {
      relativeTo: this.route.parent,
    });
  }

  /**dateTimePiker */
  handleDateTimeEvent(selection: DateTimeSelection) {
    const event = {
      entityType: this.task.entityType,
      payload: this.task,
    };
    console.log('DateTimePiker Event:: ', selection);
    this.updateTaskOrSubTask(event, {
      ...this.task,
      dueDate: selection.date,
      dueDateTime: selection.time ?? this.task.dueDateTime,
      repeat: selection.repeat,
      reminder: selection.reminder,
    });
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

  /**tags */
  // ── Tag state ─────────────────────────────────────────────────
  showTagInput = false;
  tagQuery = signal('');

  filteredTags = computed(() => {
    const q = this.tagQuery().toLowerCase().trim();
    const taskTagNames = new Set(
      this.task?.tags?.map((t: Tag) => t.name) ?? [],
    );

    return this.tagService
      .allTags$()
      .filter(
        (t) => t.name.toLowerCase().includes(q) && !taskTagNames.has(t.name),
      );
  });

  showCreateOption = computed(() => {
    const q = this.tagQuery().trim();
    return (
      !!q &&
      !this.tagService
        .allTags$()
        .some((t) => t.name.toLowerCase() === q.toLowerCase())
    );
  });

  tagDropdownItems = computed(() => [
    ...this.filteredTags(),
    ...(this.showCreateOption() ? [{ name: '__create__' }] : []),
  ]);

  onTagKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      this.showTagInput = false;
      this.tagQuery.set('');
    }
    if (e.key === 'Enter') {
      const match = this.filteredTags()[0];
      match ? this.selectTag(match.name) : this.createAndSelectTag();
    }
  }

  onTagInputBlur() {
    setTimeout(() => {
      this.showTagInput = false;
      this.tagQuery.set('');
    }, 150);
  }

  selectTag(name: string) {
    const already = this.task?.tags?.some((t: Tag) => t.name === name);
    if (already) return;
    if (!this.task.tags) this.task.tags = [];
    this.task.tags.push({ name });
    this.saveTagsToTask();
    this.tagQuery.set('');
    this.showTagInput = false;
  }

  createAndSelectTag() {
    const name = this.tagQuery().trim();
    if (!name) return;

    this.tagService.createTags({ name });

    const ref = effect(
      () => {
        const tag = this.tagService.allTags$().find((t) => t.name === name);
        if (!tag) return; // not yet loaded — wait for next signal update

        const updatedTags = this.task.tags ? [...this.task.tags, tag] : [tag];

        if (this.task.entityType === EntityType.TASK) {
          this.taskService.updateTask(this.task.id, {
            ...this.task,
            tags: updatedTags,
          });
        } else if (this.task.entityType === EntityType.SUBTASK) {
          this.taskService.updateSubTask(
            this.task.parentId ?? '',
            this.task.id,
            {
              ...this.task,
              tags: updatedTags,
            },
          );
        }

        ref.destroy();
      },
      { injector: this.injector },
    );

    this.selectTag(name);
  }

  removeTag(index: number) {
    this.task.tags?.splice(index, 1);
    this.saveTagsToTask();
  }

  private saveTagsToTask() {
    if (this.task.entityType === EntityType.TASK) {
      this.taskService.updateTask(this.task.id, { ...this.task });
    } else if (
      this.task.entityType === EntityType.SUBTASK &&
      this.task.parentId
    ) {
      this.taskService.updateSubTask(this.task.parentId, this.task.id, {
        ...this.task,
      });
    }
  }

  /**tag selector for sub tasks */
  tagsSectorEventHandler(event: any) {
    console.log('tag selector event::', event);
    this.isTagSelectorVisible = false;
    if (event.action == 'cancel') return;
    const t = this.selectedTags;
    this.selectedTags = event.payload;
    switch (event.action) {
      case 'add':
        if (this.selectedTask?.entityType == EntityType.TASK) {
          this.selectedTask.tags = this.selectedTags;
          this.taskService.updateTask(this.selectedTask.id, this.selectedTask);
        } else if (this.selectedTask?.entityType == EntityType.SUBTASK) {
          this.selectedTask.tags = this.selectedTags;
          this.taskService.updateSubTask(
            this.selectedTask.parentId ?? '',
            this.selectedTask.id,
            this.selectedTask,
          );
        }

        break;
      case 'create':
        this.tagService.createTags({ name: event.payload });

        const ref = effect(
          () => {
            const tag = this.tagService
              .allTags$()
              .find((t) => t.name == event.payload);

            if (tag) {
              this.selectedTags = [...t, tag];

              if (this.selectedTask?.entityType == EntityType.TASK) {
                this.selectedTask.tags = this.selectedTags;
                this.taskService.updateTask(
                  this.selectedTask.id,
                  this.selectedTask,
                );
              } else if (this.selectedTask?.entityType == EntityType.SUBTASK) {
                this.selectedTask.tags = this.selectedTags;
                this.taskService.updateSubTask(
                  this.selectedTask.parentId ?? '',
                  this.selectedTask.id,
                  this.selectedTask,
                );
              }
            }
          },
          { injector: this.injector },
        );

        break;
    }
  }

  @ViewChild('textarea') textareaRef!: ElementRef<HTMLTextAreaElement>;
  @ViewChild('op') op!: Popover;

  commentText = signal<string>(' ');
  

  attachedFile = signal<{ name: string; file: File } | null>(null);
  commentAttachmentId: string | null = null;
  allComments = signal<TaskComment[]>([]);
  editingCommentId: string | null = null;

  addEmoji(event: { emoji: { native: string } }) {
    const ta = this.textareaRef.nativeElement;
    const start = ta.selectionStart ?? 0;
    const end = ta.selectionEnd ?? 0;
    const currentText = this.commentText();
    const newText =
      currentText.slice(0, start) + event.emoji.native + currentText.slice(end);
    this.commentText.set(newText);

    setTimeout(() => {
      ta.selectionStart = ta.selectionEnd = start + event.emoji.native.length;
      ta.focus();
      this.op.hide();
    }, 10);
  }

  onEnterPress(event: any) {
    if (event.shiftKey) return;
    event.preventDefault();
    this.submitComment();
  }

  onFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.attachedFile.set({ name: file.name, file });
  }

  removeFile() {
    this.attachedFile.set(null);
  }

  submitComment() {
    const text = this.commentText().trim();

    if (!text && !this.attachedFile()) return;

    const file = this.attachedFile()?.file;
    if (file) {
      this.attachmentService.uploadAttachment(file).subscribe({
        next: (attachmentId) => {
          this.commentAttachmentId = attachmentId;

          this.createComment();
        },
        error: (err) => {
          console.error('Upload failed:', err);
          this.createComment();
        },
      });
    } else {
      this.createComment();
    }

    console.log('✅ Comment Submitted');
    console.log('Text:', text);
    console.log('File:', this.attachedFile());

    this.commentText.set('');
    this.attachedFile.set(null);
  }

  createComment() {
    if (this.commentAttachmentId) {
      const url = this.attachmentService
        .getAttachmentById(this.commentAttachmentId)
        .pipe(tap((data) => console.log(data)))
        .subscribe((data) => data.url);
      console.log('URL:', url);
    }
    const comment = {
      id: crypto.randomUUID(),
      name: this.commentText().trim(),
      attachmentId: this.commentAttachmentId,
      userId: null,
      taskId: this.task.id,
      entityType: EntityType.COMMENT,
      updatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    this.commentsService.crateComment(comment);
  }

  wrapSelection(openChr: string, closeChr: string) {
    const ta = this.textareaRef.nativeElement;
    const start = ta.selectionStart ?? 0;
    const end = ta.selectionEnd ?? 0;
    const current = this.commentText();
    const selected = current.slice(start, end);

    const before = current.slice(start - openChr.length, start);
    const after = current.slice(end, end + closeChr.length);
    if (before === openChr && after === closeChr) {
      const unwrapped =
        current.slice(0, start - openChr.length) +
        selected +
        current.slice(end + closeChr.length);
      this.commentText.set(unwrapped);
      setTimeout(() => {
        ta.selectionStart = start - openChr.length;
        ta.selectionEnd = end - openChr.length;
        ta.focus();
      }, 0);
      return;
    }

    const wrapped =
      current.slice(0, start) +
      openChr +
      selected +
      closeChr +
      current.slice(end);
    this.commentText.set(wrapped);

    setTimeout(() => {
      ta.selectionStart = start + openChr.length;
      ta.selectionEnd = end + openChr.length;
      ta.focus();
    }, 0);
  }

  updateComment(event: any, c: TaskComment) {
    const input = event.target as HTMLInputElement;
    const newName = input.value.trim();

    console.log('comment: ', newName);

    const updated: TaskComment = { ...c, name: newName };
    this.commentsService.updateComment(c.id, updated);
    this.editingCommentId = null;
  }

  deleteComment(commentID: string) {
    this.commentsService.deleteComment(commentID);
  }
}
