import { Component, computed, inject, ViewChild } from '@angular/core';
import { ProjectService } from '../../../services/project.service';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Menu } from "primeng/menu";
import { EntityType } from '../../../enums/entity-type';
import { ContextMenuBarService } from '../../../config/context-menu-bar.service';
import { MenuItem } from 'primeng/api';
import { count } from 'rxjs';
import { TaskService } from '../../../services/task.service';

@Component({
  selector: 'app-smart-view',
  imports: [CommonModule, Menu, RouterLink],
  templateUrl: './smart-view.component.html'
})
export class SmartViewComponent {

  private projectService = inject(ProjectService);
  private contextMenuService = inject(ContextMenuBarService);
  private taskService = inject(TaskService)
  private router = inject(Router);

  @ViewChild('contextMenuOptions') contextMenuOptions!: Menu;
  contextMenu: MenuItem[] = [];

  smartView = computed(() =>{

    this.projectService.projects$().map(project => {
      let count = 0
      const today = new Date();
      switch(project.entityType){
        case 'ALL':
          count = this.taskService.allTasks$().filter(t => t.dueDate === today).length
          break;

        case 'TODAY':
          break;

        case 'TOMORROW':
          break;

        case 'NEXT_7_DAYS':
          break;

        default:
          count = 0;
      }

      return {project}

      
    })
    // TODO: after adding tasks map them and add no of tasks of each smart view project
    return this.projectService.projects$().filter(p => p.isSmartView)
  })


  ngOnInit(): void {
    this.projectService.loadAllProjects()
    // this.projectService.loadSmartViewProjects();
  }

  navigate(id: string, routeName: string): void {
      // $&(`${routeName.toLowerCase().replace(/\s+/g, '-')}/tasks`);
    
    this.router.navigate([`${routeName.toLowerCase().replace(/\s+/g, '-')}/tasks`, id]);
}

contextMenuAction(
    event: MouseEvent,
    id: string,
    entityType: EntityType,
    
  ) {
    event.stopPropagation();
    event.preventDefault();
    // this.activeFolderId = folderId;

    const context = this.contextMenuService.getContextMenu(
      entityType
    );

    this.contextMenu = context.map((item): MenuItem => {
      if (item.isDivider) return { separator: true };
      return {
        ...item,
        command: () => this.handleAction(entityType, item.action, id),
      };
    });

    this.contextMenuOptions.toggle(event);
  }


  handleAction(
    entityType: EntityType,
    action:any,
    id: string,

  ): void {
      // $&('Action: for smart view  ');
    // this.closeMenu(); // ✅ from base class
  }



}
