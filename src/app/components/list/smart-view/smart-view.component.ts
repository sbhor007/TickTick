import { Component, computed, inject, ViewChild } from '@angular/core';
import { ProjectService } from '../../../services/project.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Menu } from "primeng/menu";
import { EntityType } from '../../../enums/entity-type';
import { ContextMenuBarService } from '../../../config/context-menu-bar.service';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-smart-view',
  imports: [CommonModule, Menu],
  templateUrl: './smart-view.component.html'
})
export class SmartViewComponent {

  private projectService = inject(ProjectService);
  private contextMenuService = inject(ContextMenuBarService);
  private router = inject(Router);

  @ViewChild('contextMenuOptions') contextMenuOptions!: Menu;
  contextMenu: MenuItem[] = [];

  smartView = computed(() =>{
    // TODO: after adding tasks map them and add no of tasks of each smart view project
    return this.projectService.projects$().filter(p => p.isSmartView)
  })


  ngOnInit(): void {
    this.projectService.loadAllProjects()
    // this.projectService.loadSmartViewProjects();
  }

  navigate(id: string, routeName: string): void {
    console.log(`${routeName.toLowerCase().replace(/\s+/g, '-')}/tasks`);
    
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
    console.log('Action: for smart view  ');
    // this.closeMenu(); // ✅ from base class
  }



}
