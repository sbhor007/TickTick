import {
  Compiler,
  Component,
  computed,
  effect,
  inject,
  Injector,
  input,
  Input,
  OnInit,
  signal,
} from '@angular/core';
import { FolderService } from '../../../services/folder.service';
import { ProjectService } from '../../../services/project.service';
import { TaskService } from '../../../services/task.service';
import { EntityType } from '../../../enums/entity-type';
import { CommonModule, JsonPipe } from '@angular/common';
import { TaskItemComponent } from '../../../share/task-item/task-item.component';
import { Folder } from '../../../models/folder';
import { TaskStatus } from '../../../enus/task-status';
import { Task } from '../../../models/task';
import { TaskPriority } from '../../../enus/task-priority';
import {
  FormControl,
  FormsModule,
  NgModel,
  ReactiveFormsModule,
} from '@angular/forms';
import { ShortDatePipe } from '../../../pipe/short-date.pipe';
import { TagSelectorComponent } from '../../../share/tag-selector/tag-selector.component';
import { TrashService } from '../../../services/trash.service';
import { ActivatedRoute, Router } from '@angular/router';
import { DateTimePickerComponent } from '../../../share/date-time-picker/date-time-picker.component';
import { DateTimeSelection } from '../../../models/date';

import { Tag } from '../../../models/tag';
import { TagsService } from '../../../config/tags.service';
// import { DropdownModule } from 'primeng/dropdown';
// import { AutoCompleteModule } from 'primeng/autocomplete';
@Component({
  selector: 'app-task-list',
  imports: [
    JsonPipe,
    TaskItemComponent,
    ReactiveFormsModule,
    ShortDatePipe,
    TagSelectorComponent,
    DateTimePickerComponent,
  ],
  templateUrl: './task-list.component.html',
})
export class TaskListComponent implements OnInit {
  private folderService = inject(FolderService);
  private projectService = inject(ProjectService);
  private taskService = inject(TaskService);
  private trashService = inject(TrashService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private tagService = inject(TagsService);
  private injector = inject(Injector);

  x = 0;
  y = 0;

  @Input() routeData!: any;

  isDateTimePikerVisible = false;
  initialDate = signal<Date | null>(null);
  initialTime = signal<string | null>(null);
  lastSelection = signal<DateTimeSelection | null>(null);
  selectedTask: Task | null = null;

  // @Input() sortGroupData: any = { groupBy: 'none', sortBy: 'Title' };

  /**taskId for link to parent */
  private searchTerm = signal<string>('');
  allTasks = computed(() => {
    const tasks = this.taskService.allTasks$();
    const query = this.searchTerm();
    if (query) {
      return tasks.filter((t) =>
        t.title?.toLowerCase()?.includes(query.toLowerCase()),
      );
    }
    return tasks;
  });
  isOpenLinkToParent = false;
  isTagSelectorVisible = false;
  selectedTaskToLink!: Task;
  selectedTags: Tag[] = [];

  private entityData = signal<any | null>(null);
  sortGroupData = input<any>({ groupBy: 'none', sortBy: 'Title' });
  collapsedGroups = signal<Set<string>>(new Set());

  searchQuery = new FormControl('');

  ngOnInit(): void {
    this.trashService.loadAllTrash();
    this.taskService.loadAllTasks();
    this.loadRouteData();

    /**search*/
    this.searchQuery.valueChanges.subscribe((val) => {
      this.searchTerm.set(val ?? '');
    });
  }

  allTaskInsideProject: any;
  /**task as per there entity type */
  groupedTasks = computed(() => {
    const routerData = this.routeData();
    const { groupBy, sortBy } = this.sortGroupData();

    let data: Task[] = this.getTaskData(routerData);

    data = [...data].sort((a, b) => this.sortBy(a, b, sortBy));

    if (groupBy !== 'None') {
      return this.groupByFn(data, groupBy);
    }

    // Helper flags (inline — no need for separate methods)
    const hasPinnedContent = (t: Task) =>
      (t.isPinned || t.subtasks?.some((st) => st.isPinned)) &&
      t.status !== TaskStatus.COMPLETED;

    const isCompleted = (t: Task) =>
      t.status === TaskStatus.COMPLETED ||
      t.subtasks?.every((st) => st.status === TaskStatus.COMPLETED);
    // debugger;
    return [
      {
        key: 'pinned',
        label: 'Pinned',
        // Task itself is pinned OR any subtask is pinned
        tasks: data.filter((t) => hasPinnedContent(t)),
      },
      {
        key: 'unpinned',
        label: 'Tasks',
        // Not pinned (neither task nor subtasks) AND not completed
        tasks: data.filter((t) => !hasPinnedContent(t) && !isCompleted(t)),
      },
      {
        key: 'completed',
        label: 'Completed',
        // Task itself completed OR all subtasks completed
        tasks: data.filter((t) => isCompleted(t)),
      },
    ];
  });

  /**getData */
  getTaskData(routerData: any) {
    if (routerData.entityType === EntityType.FOLDER) {
      // return this.projectService
      //   .projects$()
      //   .filter((p) => p.folderId === routerData.id)
      //   .map((p) => ({
      //     ...p,
      //     tasks: this.taskService
      //       .allTasks$()
      //       .filter((task) => task.projectId === p.id),
      //   }));

      const projectIds = this.projectService.projects$().map((p) => {
        if (p.folderId === routerData.id) {
          return p.id;
        }
      });
      return this.taskService
        .allTasks$()
        .filter((t) => projectIds.includes(t.projectId));
    } else if (routerData.entityType === EntityType.PROJECT) {
      return this.taskService
        .allTasks$()
        .filter((t) => t.projectId === routerData.id);
    } else if (routerData.entityType === EntityType.ALL) {
      return this.taskService.allTasks$();
    } else if (routerData.entityType === EntityType.TODAY) {
      return this.taskService
        .allTasks$()
        .filter((t) => this.isToday(t?.dueDate ?? ''));
    } else if (routerData.entityType === EntityType.TOMORROW) {
      return this.taskService
        .allTasks$()
        .filter((t) => this.isTomorrow(t?.dueDate ?? ''));
    } else if (routerData.entityType === EntityType.NEXT_SEVEN_DAYS) {
      return this.taskService
        .allTasks$()
        .filter((t) => this.isWithinNext7Days(t?.dueDate ?? ''));
    } else if (routerData.entityType === EntityType.INBOX) {
      return this.taskService
        .allTasks$()
        .filter((t) => t.projectId === routerData.id);
    } else if (routerData.entityType === EntityType.TRASHED) {
      const trash = this.trashService.allTrash$();

      console.log('Trashed Data:', trash);
      return trash;
    }
    return [];
  }

  /**compare due date */
  isToday(dueDate: any): boolean {
    if (!dueDate) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    return due.getTime() === today.getTime();
  }

  isTomorrow(dueDate: any): boolean {
    if (!dueDate) return false;
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    return due.getTime() === tomorrow.getTime();
  }

  isWithinNext7Days(dueDate: any): boolean {
    if (!dueDate) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const next7Days = new Date();
    next7Days.setDate(next7Days.getDate() + 7);
    next7Days.setHours(23, 59, 59, 999);
    const due = new Date(dueDate);
    return due >= today && due <= next7Days;
  }
  /**priority color */
  getCheckboxClass(priority: TaskPriority): string {
    switch (priority) {
      case TaskPriority.HIGH:
        return `border-red-500 checked:bg-red-500`;
      case TaskPriority.MEDIUM:
        return `border-yellow-400 checked:bg-yellow-400`;
      case TaskPriority.LOW:
        return `border-blue-400 checked:bg-blue-400`;
      default:
        return `border-gray-500 checked:bg-gray-500`;
    }
  }

  /**due date color */
  getDueDateColor(dueDate: any): string {
    if (!dueDate) return 'text-gray-500';
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    return due < today ? 'text-red-400' : 'text-blue-400';
  }

  /**sort by */
  sortBy(a: any, b: any, sortType: string): number {
    switch (sortType) {
      case 'Title':
        return (a.title ?? '').localeCompare(b.title ?? '');
      case 'Date':
        return (
          new Date(a.dueDate ?? 0).getTime() -
          new Date(b.dueDate ?? 0).getTime()
        );
      case 'Priority':
        const priorityOrder: any = { LOW: 1, MEDIUM: 2, HIGH: 3, URGENT: 4 };
        return (
          (priorityOrder[b.priority] ?? 0) - (priorityOrder[a.priority] ?? 0)
        );
      case 'CreatedDate':
        return (
          new Date(a.createdAt ?? 0).getTime() -
          new Date(b.createdAt ?? 0).getTime()
        );
      case 'UpdatedDate':
        return (
          new Date(a.updatedAt ?? 0).getTime() -
          new Date(b.updatedAt ?? 0).getTime()
        );
      case 'SortOrder':
        return (a.sortOrder ?? 0) - (b.sortOrder ?? 0);
      default:
        return 0;
    }
  }

  /**get pinned task with subtasks */
  getPinnedTasks = (tasks: any[]): any[] => {
    let result: any[] = [];

    for (const task of tasks) {
      // check current task
      if (
        task.isPinned &&
        (task.status !== TaskStatus.COMPLETED ||
          task.status !== TaskStatus.WONT_DO)
      ) {
        result.push(task);
      }

      // recurse into subtasks
      if (task.subtasks && task.subtasks.length > 0) {
        result = result.concat(this.getPinnedTasks(task.subtasks));
      }
    }

    return result;
  };
  /**get Completed tasks */
  getCompletedTasks = (tasks: any[]): any[] => {
    let result: any[] = [];

    for (const task of tasks) {
      // check current task
      if (
        task.status === TaskStatus.COMPLETED ||
        task.status === TaskStatus.WONT_DO
      ) {
        result.push(task);
      }

      // recurse into subtasks
      if (task.subtasks && task.subtasks.length > 0) {
        result = result.concat(this.getCompletedTasks(task.subtasks));
      }
    }

    return result;
  };
  /**task that does not completed and pinned */
  getRestTasks = (tasks: any[]): any[] => {
    let result: any[] = [];

    for (const task of tasks) {
      // condition for "rest"
      if (
        !task.isPinned &&
        (task.status !== TaskStatus.COMPLETED ||
          task.status !== TaskStatus.WONT_DO)
      ) {
        result.push(task);
      }

      // recurse into subtasks
      if (task.subtasks?.length) {
        result = result.concat(this.getRestTasks(task.subtasks));
      }
    }

    return result;
  };

  groupByFn(data: any[], groupBy: string) {
    const groups = new Map<string, any[]>();

    // const pinned = data.filter(
    //   (t) => t.isPinned && t.status !== TaskStatus.COMPLETED,
    // );
    const pinned = this.getPinnedTasks(data);
    // const completed = data.filter((t) => t.status === TaskStatus.COMPLETED);
    const completed = this.getCompletedTasks(data);
    // const rest = data.filter(
    //   (t) => !t.isPinned && t.status !== TaskStatus.COMPLETED,
    // );
    const rest = this.getRestTasks(data);
    // debugger;
    rest.forEach((t) => {
      let key: string;
      switch (groupBy) {
        case 'Priority':
          key = t.priority ?? 'No Priority';
          break;
        case 'Date':
          key = this.getDueDateGroup(t.dueDate);
          break;
        case 'Status':
          key = t.status ?? 'No Status';
          break;
        case 'Assignee':
          key = t.assignee ?? 'Unassigned';
          break;
        default:
          key = 'Other';
      }
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(t);
    });

    const dateOrder = [
      'Overdue',
      'Today',
      'Tomorrow',
      'Next 7 Days',
      'Later',
      'No Due Date',
    ];

    const sortedGroups =
      groupBy === 'Date'
        ? Array.from(groups.entries()).sort(
            ([a], [b]) => dateOrder.indexOf(a) - dateOrder.indexOf(b),
          )
        : Array.from(groups.entries());

    const result = [];

    if (pinned.length > 0) {
      result.push({ key: 'pinned', label: 'Pinned', tasks: pinned });
    }

    result.push(
      ...sortedGroups.map(([key, tasks]) => ({ key, label: key, tasks })),
    );

    if (completed.length > 0) {
      result.push({ key: 'completed', label: 'Completed', tasks: completed });
    }

    return result;
  }

  getDueDateGroup(dueDate: any): string {
    if (!dueDate) return 'No Due Date';

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    const diffDays = Math.round(
      (due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (diffDays < 0) return 'Overdue';
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays <= 7) return 'Next 7 Days';
    return 'Later';
  }

  private loadRouteData(): void {
    const route = this.routeData();
    if (!route) return;

    if (route.entityType === EntityType.FOLDER) {
      this.folderService.fetchFolderById(route.id).subscribe((folder) => {
        if (!route) return;
        this.entityData.set(folder);
      });
    } else if (route.entityType === EntityType.PROJECT) {
      this.projectService.fetchProjectById(route.id).subscribe((project) => {
        this.entityData.set(project);
      });
    }
  }

  loadDataByFolder(folder: Folder) {
    return this.projectService
      .projects$()
      .filter((project) => project.folderId === folder.id)
      .flatMap((project) =>
        this.taskService
          .allTasks$()
          .filter((task) => task.projectId === project.id),
      );
  }

  /**Toggle option */
  toggleGroup(key: string) {
    this.collapsedGroups.update((set) => {
      const next = new Set(set);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  }

  isCollapsed(key: string): boolean {
    return this.collapsedGroups().has(key);
  }

  /**task-item-event-handler */
  taskItemEventHandler(event: any) {
    console.log('Task Item Event Handler::', event);
    const task: Task = event.payload;
    const isSubtask = event.entityType === EntityType.SUBTASK;

    switch (event.action) {
      case 'add_subtask':
        this.createSubTask(event.entityId, task);
        break;
      case 'link_parent':
        this.isOpenLinkToParent = true;
        this.selectedTaskToLink = task;
        break;
      case 'pin':
      case 'unpin':
        this.updateTaskOrSubTask(event, {
          isPinned: !task.isPinned,
        });
        break;

      case 'set_date_today':
        this.updateTaskOrSubTask(event, {
          dueDate: this.getDateISO(0),
        });
        break;
      case 'set_date_tomorrow':
        this.updateTaskOrSubTask(event, {
          dueDate: this.getDateISO(1),
        });
        break;
      case 'set_date_next_week':
        this.updateTaskOrSubTask(event, {
          dueDate: this.getDateISO(7),
        });
        break;
      case 'set_date_custom':
        this.x = event.clientX;
        this.y = event.clientY;
        this.selectedTask = task;
        this.toggleDateTime();
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
        this.updateTaskOrSubTask(event, {
          status: TaskStatus.WONT_DO,
        });
        break;

      case 'move_to':
        if (event.entityType == EntityType.TASK) {
          this.taskService.deleteTask(event.payload.id);
          this.taskService.crateTask(event.entityId, {
            ...event.payload,
            projectId: event.entityId,
          });
        } else if (event.entityType == EntityType.SUBTASK) {
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

      case 'convert_to_note':
        // TODO: implement note conversion
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

      case 'restore':
        console.log('Task Item Event Handler::', event);
        this.trashService.restoreTask(event.entityId);
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
      this.taskService.updateTask(event.entityId, {
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
  // create a sub task
  createSubTask(taskId: string, task: Task) {
    // const task = this.taskService.allTasks$().find(t => t.id == taskId)
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

  /**move to parent */
  linkToParent(selectedTaskId: string) {
    this.isOpenLinkToParent = false;
    if (
      selectedTaskId != null ||
      (selectedTaskId != '' && this.selectedTaskToLink)
    ) {
      this.taskService.linkToParentTask(
        selectedTaskId,
        this.selectedTaskToLink,
      );
    }
  }

  /**navigate to task details */
  navigateToTaskDetails(id: string, entityType: string) {
    this.router.navigate([entityType.toLowerCase(), id], {
      relativeTo: this.route,
    });
  }

  /**dateTimePiker */
  handleDateTimeEvent(selection: any) {
    selection.stopPropagation;
    if (!this.selectedTask) {
      alert();
      this.isDateTimePikerVisible = false;
      return;
    }
    console.log('event handle::', selection);

    if (
      this.selectedTask.entityType === EntityType.SUBTASK &&
      this.selectedTask.parentId
    ) {
      this.taskService.updateSubTask(
        this.selectedTask.parentId,
        this.selectedTask.id,
        {
          ...this.selectedTask,
          dueDate: selection.date,
          dueDateTime: selection.time ?? this.selectedTask.dueDateTime,
          repeat: selection.repeat,
          reminder: selection.reminder,
          updatedAt: new Date().toISOString(),
        },
      );
    } else {
      this.taskService.updateTask(this.selectedTask.id, {
        ...this.selectedTask,
        dueDate: selection.date,
        dueDateTime: selection.time ?? this.selectedTask.dueDateTime,
        repeat: selection.repeat,
        reminder: selection.reminder,
        updatedAt: new Date().toISOString(),
      });
    }
    this.isDateTimePikerVisible = false;
  }

  toggleDateTime() {
    this.isDateTimePikerVisible = !this.isDateTimePikerVisible;
    console.log(this.isDateTimePikerVisible);
  }

  /**tag selector */

  tagsSectorEventHandler(event: any) {
    console.log('tag selector event::', event);
    this.isTagSelectorVisible = false;
    if (event.action == 'cancel') return;
    const t = this.selectedTags
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

        const ref = effect(() => {
          const tag = this.tagService
            .allTags$()
            .find((t) => t.name == event.payload);
            
          if (tag) {
            this.selectedTags = [...t,tag];


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
        }, { injector: this.injector });

        break;
    }
  }
}
