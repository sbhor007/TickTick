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
import { JsonPipe } from '@angular/common';
import { TaskItemComponent } from '../../../share/task-item/task-item.component';
import { Folder } from '../../../models/folder';
import { TaskStatus } from '../../../enus/task-status';

@Component({
  selector: 'app-task-list',
  imports: [JsonPipe, TaskItemComponent],
  templateUrl: './task-list.component.html',
})
export class TaskListComponent implements OnInit {
  private folderService = inject(FolderService);
  private projectService = inject(ProjectService);
  private taskService = inject(TaskService);

  @Input() routeData!: any;
  // @Input() sortGroupData: any = { groupBy: 'none', sortBy: 'Title' };

  sortGroupData = input<any>({ groupBy: 'none', sortBy: 'Title' });
  private entityData = signal<any | null>(null);
  collapsedGroups = signal<Set<string>>(new Set());

  ngOnInit(): void {
    this.taskService.loadAllTasks();
    this.loadRouteData();
  }

  groupedTasks = computed(() => {
    const routerData = this.routeData();
    const { groupBy, sortBy } = this.sortGroupData();
    console.log(groupBy, sortBy);

    let data =
      routerData.entityType === EntityType.PROJECT
        ? this.taskService
            .allTasks$()
            .filter((t) => t.projectId === routerData.id)
        : [];
    data = [...data].sort((a, b) => this.sortBy(a, b, sortBy));
    return [
      {
        key: 'pinned',
        label: 'Pinned',
        tasks: data.filter(
          (t) => t.isPinned && t.status !== TaskStatus.COMPLETED,
        ),
      },
      {
        key: 'unpinned',
        label: 'Tasks',
        tasks: data.filter(
          (t) => !t.isPinned && t.status !== TaskStatus.COMPLETED,
        ),
      },
      {
        key: 'completed',
        label: 'Completed',
        tasks: data.filter((t) => t.status === TaskStatus.COMPLETED),
      },
    ];
  });

  /**sort by */
  sortBy(a: any, b: any, sortType: string): number {
  switch (sortType) {
    case 'Title':
      return (a.title ?? '').localeCompare(b.title ?? '');
    case 'DueDate':
      return new Date(a.dueDate ?? 0).getTime() - new Date(b.dueDate ?? 0).getTime();
    case 'Priority':
      const priorityOrder: any = { LOW: 1, MEDIUM: 2, HIGH: 3, URGENT: 4 };
      return (priorityOrder[b.priority] ?? 0) - (priorityOrder[a.priority] ?? 0);
    case 'CreatedDate':
      return new Date(a.createdAt ?? 0).getTime() - new Date(b.createdAt ?? 0).getTime();
    case 'UpdatedDate':
      return new Date(a.updatedAt ?? 0).getTime() - new Date(b.updatedAt ?? 0).getTime();
    case 'SortOrder':
      return (a.sortOrder ?? 0) - (b.sortOrder ?? 0);
    default:
      return 0;
  }
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
}
