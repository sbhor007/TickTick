import {
  Component,
  computed,
  inject,
  OnInit,
  signal,
  ViewChild,
} from '@angular/core';
import { TaskListComponent } from '../../components/context/task-list/task-list.component';
import { EntityType } from '../../enums/entity-type';
import { SmartViewComponent } from '../../components/list/smart-view/smart-view.component';
import { ProjectService } from '../../services/project.service';
import { CommonModule, JsonPipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Menu } from 'primeng/menu';
import { ContextMenuBarService } from '../../config/context-menu-bar.service';
import { MenuItem } from 'primeng/api';
import { Project } from '../../models/project';

@Component({
  selector: 'app-dashboard',
  imports: [TaskListComponent, CommonModule, RouterLink, Menu],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements OnInit {
  private projectService = inject(ProjectService);
  private contextMenuService = inject(ContextMenuBarService);
  private router = inject(Router);

  completedTasks = signal({ id: null, entityType: EntityType.COMPLETED });
  pendingTasks = signal({ id: null, entityType: EntityType.PENDING });

  @ViewChild('contextMenuOptions') contextMenuOptions!: Menu;
  contextMenu: MenuItem[] = [];

  smartView = computed(() => {
    return this.projectService
      .projects$()
      .filter((p) => p.isSmartView && (p.hidden || p.showIfNotEmpty));
  });

  ngOnInit(): void {
    this.projectService.loadAllProjects();
  }

  contextMenuAction(
    event: MouseEvent,
    project: Project,
    entityType: EntityType,
  ): void {
    event.stopPropagation();
    event.preventDefault();

    const context = this.contextMenuService.getContextMenu(
      entityType,
      false,
      false,
      false,
      false,
      false,
      project.hidden,
    );
    this.contextMenu = context.map((item): MenuItem => {
      if (item.isDivider) return { separator: true };
      return {
        ...item,
        command: () => this.handleAction(entityType, item.action, project.id),
      };
    });

    this.contextMenuOptions.toggle(event);
  }

  handleAction(entityType: EntityType, action: string, id: string): void {
    console.log('handle action', action);

    const project = this.projectService.projects$().find((p) => p.id == id);

    switch (action) {
      case 'show':
        this.projectService
          .updateProject(id, {
            ...project,
            hidden: false,
            showIfNotEmpty: false,
          })
          .subscribe(() => this.projectService.loadAllProjects());
        break;

      case 'hide':
        this.projectService
          .updateProject(id, {
            ...project,
            hidden: true,
            showIfNotEmpty: false,
          })
          .subscribe(() => this.projectService.loadAllProjects());
        break;

      case 'showIfNotEmpty':
        this.projectService
          .updateProject(id, {
            ...project,
            hidden: false,
            showIfNotEmpty: true,
          })
          .subscribe(() => this.projectService.loadAllProjects());
        break;

      case 'edit':
        this.router.navigate(['settings', 'smart-views', id]);
        break;

      default:
        console.warn(
          `[SmartViewComponent] Unhandled action "${action}" for entity "${entityType}"`,
        );
    }
  }
}
