import {
  Compiler,
  Component,
  computed,
  effect,
  inject,
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
import { TagSelectorComponent } from "../../../share/tag-selector/tag-selector.component";
import { TrashService } from '../../../services/trash.service';

@Component({
  selector: 'app-task-list',
  imports: [JsonPipe, TaskItemComponent, ReactiveFormsModule, ShortDatePipe, TagSelectorComponent],
  templateUrl: './task-list.component.html',
})
export class TaskListComponent implements OnInit {
  private folderService = inject(FolderService);
  private projectService = inject(ProjectService);
  private taskService = inject(TaskService);
  private trashService = inject(TrashService)

  @Input() routeData!: any;
  // @Input() sortGroupData: any = { groupBy: 'none', sortBy: 'Title' };

  /**taskId for link to parent */
  allTasks = this.taskService.allTasks$();
  isOpenLinkToParent = false;
  selectedTaskToLink!: Task;

  private entityData = signal<any | null>(null);
  sortGroupData = input<any>({ groupBy: 'none', sortBy: 'Title' });
  collapsedGroups = signal<Set<string>>(new Set());

  searchQuery = new FormControl('');

  ngOnInit(): void {
    this.trashService.loadAllTrash()
    this.taskService.loadAllTasks();
    this.loadRouteData();

    this.allTasks = this.taskService.allTasks$();

    /**search */
    this.searchQuery.valueChanges.subscribe((val) => {
      console.log(val);
      if (val) {
        this.allTasks = this.taskService
          .allTasks$()
          .filter((t) => t.title?.toLowerCase()?.includes(val.toLowerCase()));
      } else {
        this.allTasks = this.taskService.allTasks$();
      }
    });
  }

  allTaskInsideProject: any;

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
      // data = this.taskService
      // .allTasks$()
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
    } else if(routerData.entityType === EntityType.TOMORROW){
      return this.taskService
        .allTasks$()
        .filter((t) => this.isTomorrow(t?.dueDate ?? ''));
    }else if(routerData.entityType === EntityType.NEXT_SEVEN_DAYS){
      return this.taskService
        .allTasks$()
        .filter((t) => this.isWithinNext7Days(t?.dueDate ?? ''));
    }
    else if (routerData.entityType === EntityType.INBOX) {
      return this.taskService
        .allTasks$()
        .filter((t) => t.projectId === routerData.id);
    }else if(routerData.entityType === EntityType.TRASHED){
      
      const trash = this.trashService.allTrash$()
      
      console.log("Trashed Data:",trash);
      return trash
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

  groupByFn(data: any[], groupBy: string) {
    const groups = new Map<string, any[]>();

    const pinned = data.filter(
      (t) => t.isPinned && t.status !== TaskStatus.COMPLETED,
    );
    const completed = data.filter((t) => t.status === TaskStatus.COMPLETED);
    const rest = data.filter(
      (t) => !t.isPinned && t.status !== TaskStatus.COMPLETED,
    );

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
    switch (event.action) {
      case 'add_subtask':
        this.createSubTask(event.entityId, event.payload);
        break;
      case 'link_parent':
        this.isOpenLinkToParent = true;
        this.selectedTaskToLink = event.payload;
        break;
      case 'pin':
        this.taskService.updateTask(event.entityId, {
          ...event.payload,
          isPinned: !event.payload.isPinned,
        });
        break;
      case 'unpin':
        this.taskService.updateTask(event.entityId, {
          ...event.payload,
          isPinned: !event.payload.isPinned,
        });
        break;
      case 'wont_do':
        break;
      case 'add_tags_to_task':
        break;
      case 'duplicate':
        this.taskService.crateTask(event.payload.projectId, {
          ...event.payload,
          id: crypto.randomUUID(),
          title: event.payload.title + ' copied',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        break;
      case 'copy_link':
        break;
      case 'convert_to_note':
        break;
      case 'delete':
        if(EntityType.TASK === event.entityType){
          this.trashService.addTrash({...event.payload,entityType:EntityType.TRASHED})
          this.taskService.deleteTask(event.entityId)
        }else if(EntityType.SUBTASK  === event.entityType){
          this.trashService.addTrash({...event.payload,entityType:EntityType.TRASHED})
          this.taskService.deleteSubTask(event.payload.parentId, event.entityId)
        }
        break;
    }
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
  // linkToParent(currentTaskId:string){

  // }
}
