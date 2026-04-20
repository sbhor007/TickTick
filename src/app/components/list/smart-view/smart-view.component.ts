import { Component, computed, inject, ViewChild } from '@angular/core';
import { ProjectService } from '../../../services/project.service';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Menu } from 'primeng/menu';
import { EntityType } from '../../../enums/entity-type';
import { ContextMenuBarService } from '../../../config/context-menu-bar.service';
import { MenuItem } from 'primeng/api';
import { count } from 'rxjs';
import { TaskService } from '../../../services/task.service';

@Component({
  selector: 'app-smart-view',
  imports: [CommonModule, Menu, RouterLink],
  templateUrl: './smart-view.component.html',
})
export class SmartViewComponent {
  private projectService = inject(ProjectService);
  private contextMenuService = inject(ContextMenuBarService);
  private taskService = inject(TaskService);
  private router = inject(Router);

  @ViewChild('contextMenuOptions') contextMenuOptions!: Menu;
  contextMenu: MenuItem[] = [];

  smartView = computed(() => {
    const allTasks = this.taskService.allTasks$();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const next7DaysEnd = new Date(today);
    next7DaysEnd.setDate(next7DaysEnd.getDate() + 7);

    return this.projectService
      .projects$()
      .filter((p) => p.isSmartView)
      .map((project) => {
        let count = 0;

        switch (project.entityType) {
          case 'ALL':
            count = this.taskService.allTasks$().length
            break
          case 'INBOX':
            count = allTasks.filter(
              (t) => t.projectId === project.id && t.status !== 'COMPLETED',
            ).length;
            break;

          case 'TODAY':
            count = allTasks.filter((t) => {
              if (!t.dueDate) return false;
              const due = new Date(t.dueDate);
              due.setHours(0, 0, 0, 0);
              return due.getTime() === today.getTime();
            }).length;
            break;

          case 'TOMORROW':
            count = allTasks.filter((t) => {
              if (!t.dueDate) return false;
              const due = new Date(t.dueDate);
              due.setHours(0, 0, 0, 0);
              return due.getTime() === tomorrow.getTime();
            }).length;
            break;

          case 'NEXT_7_DAYS':
            const t = allTasks.filter((t) => {
              if (!t.dueDate) return false;
              const due = new Date(t.dueDate);
              due.setHours(0, 0, 0, 0);
              return due > today && due <= next7DaysEnd; 
            })
            count = t.length;
            break;

          default:
            count = 0;
        }

        return { ...project, count };
      });
  });

  ngOnInit(): void {
    this.projectService.loadAllProjects();
  }

  navigate(id: string, routeName: string): void {
    this.router.navigate([
      `${routeName.toLowerCase().replace(/\s+/g, '-')}/tasks`,
      id,
    ]);
  }

  contextMenuAction(
    event: MouseEvent,
    id: string,
    entityType: EntityType,
  ): void {
    event.stopPropagation();
    event.preventDefault();

    const context = this.contextMenuService.getContextMenu(entityType);
    this.contextMenu = context.map((item): MenuItem => {
      if (item.isDivider) return { separator: true };
      return {
        ...item,
        command: () => this.handleAction(entityType, item.action, id),
      };
    });

    this.contextMenuOptions.toggle(event);
  }

  handleAction(entityType: EntityType, action: string, id: string): void {
    console.log("handle action", action);
    
   const project = this.projectService.projects$().find(p => p.id == id)

    switch (action) {

      case 'show':
        this.projectService.updateProject(id, {...project ,hidden: false, showIfNotEmpty: false }).subscribe()
        break;

      case 'hide':
        this.projectService.updateProject(id, {...project ,hidden: true, showIfNotEmpty: false }).subscribe()
        break;

      case 'showIfNotEmpty':
        this.projectService.updateProject(id, {...project ,hidden: false, showIfNotEmpty: true }).subscribe()
        break;



      case 'edit':
        this.router.navigate(['settings', 'smart-views', id]);
        break;

      default:
        console.warn(`[SmartViewComponent] Unhandled action "${action}" for entity "${entityType}"`);
    }
  }
}
