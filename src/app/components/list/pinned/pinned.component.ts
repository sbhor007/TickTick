import { Component, computed, inject, OnInit, ViewChild } from '@angular/core';
import { FolderService } from '../../../services/folder.service';
import { ProjectService } from '../../../services/project.service';
import { CommonModule, JsonPipe } from '@angular/common';
import { FolderProjectService } from '../../../services/folder-project.service';
import { RouterLink } from '@angular/router';
import { Menu } from "primeng/menu";
import { MenuItem } from 'primeng/api';
import { EntityType } from '../../../enums/entity-type';

@Component({
  selector: 'app-pinned',
  imports: [RouterLink, CommonModule, Menu],
  templateUrl: './pinned.component.html',
})
export class PinnedComponent implements OnInit {
  private folderService = inject(FolderService);
  private projectService = inject(ProjectService);
  private folderWithProjectService = inject(FolderProjectService);


 pinnedData = computed(() => {
  const projects = this.projectService.projects$().filter(p => p.isPinned);
  const folders  = this.folderService.allFolders$().filter(f => f.isPinned);
  return [...projects, ...folders];
});


  @ViewChild('contextMenuOptions') contextMenuOptions!: Menu;
  contextMenu: MenuItem[] = [
    
  ];
  


  ngOnInit(): void {

    this.projectService.loadAllProjects()
    // this.projectService.fetchPinnedProjects()
    // this.folderService.loadPinnedFolders()
    console.log("pinned Data::",this.pinnedData());

    this.projectService.projects$().forEach(p => {
    console.log("--",p);
    
   })
    
    // this.projectService.fetchPinnedProjects();
    // this.folderService.loadPinnedFolders();
    // this.pinnedData = computed(() => [...this.folderService.allFolders$(),...this.projectService.projects$()])
  }

  openContextMenu(entityType: EntityType, id: string,event:any){
    event.preventDefault()
    this.contextMenu = [
      { 
        label: 'unpin', icon: 'pi pi-pencil', 
        command: () => this.unpin(entityType,id)
      }
    ]
    console.info("open context menu call....",event);
    this.contextMenuOptions.toggle(event);
    
  }

  unpin(entityType: EntityType, id: string){
    if(entityType === EntityType.FOLDER){
      this.unpinFolder(id)
    }else if(entityType === EntityType.PROJECT){
      this.unpinProject(id)
    }
  }
  unpinProject(projectId: string) {
    console.log('unpin project call');
    const project = this.projectService.projects$().find((p) => p.id === projectId);
    this.projectService
      .updateProject(projectId, { ...project, isPinned: !project.isPinned })
      .subscribe(() => {
        this.projectService.fetchPinnedProjects();

        if (project.folderId) {
          this.folderService.loadAllFolders();
          this.folderWithProjectService.fetchFolderWithProjects();
        } else {
          this.projectService.loadAllProjects();
        }
      });
  }

  unpinFolder(folderId: string) {
    const folder = this.folderService.allFolders$().find((f) => f.id === folderId);
    if(!folder)
      return
    this.folderService
      .updateFolder(folderId, { ...folder, isPinned: !folder.isPinned })
      .subscribe(() => {
        this.projectService.fetchPinnedProjects();
        this.folderWithProjectService.fetchFolderWithProjects();
      });
  }
}
