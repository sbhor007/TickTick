import {
  Component,
  HostListener,
  inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import { CreateProjectComponent } from '../create-project/create-project.component';
import { FolderService } from '../../../services/folder.service';
import { EntityType } from '../../../enums/entity-type';
import { Project } from '../../../models/project';
import { ProjectService } from '../../../services/project.service';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CreateFolderComponent } from '../../../share/create-folder/create-folder.component';
import { FolderProjectService } from '../../../services/folder-project.service';
import { Menu, MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { ContextMenuBarService } from '../../../config/context-menu-bar.service';
import { Folder } from '../../../models/folder';
import { every, tap } from 'rxjs';

@Component({
  selector: 'app-list',
  imports: [
    CreateProjectComponent,
    RouterLink,
    CommonModule,
    CreateFolderComponent,
    Menu,
  ],
  templateUrl: './list.component.html',
})
export class ListComponent implements OnInit {
  private folderService = inject(FolderService);
  private projectService = inject(ProjectService);
  private folderWithProjectService = inject(FolderProjectService);
  private contextMenuService = inject(ContextMenuBarService);

  allFolders = this.folderService.allFolders$;
  allProject = this.projectService.projects$;
  folderWithProjects = this.folderWithProjectService.foldersWithProjects$;

  isShowCreateForm = false;
  isFolderDialogOpen = false;
  openFolders = new Set<number>();

  /**project creation and update */
  activeFolderId: string | null = null;
  mode: 'create' | 'update' = 'create';
  projectId: string | null = null;

  ngOnInit(): void {
    this.folderWithProjectService.fetchFolderWithProjects();
    this.folderService.loadAllFolders();
    this.projectService.loadAllProjects();
  }

  /*************Option Menu********************* */

  @ViewChild('contextMenuOptions') contextMenuOptions!: Menu;

  contextMenu: MenuItem[] = [];
  //
  // folderItems: MenuItem[] = [
  //   {
  //     label: 'Folder',
  //     items: [
  //       { label: 'Rename', icon: 'pi pi-pencil', command: () => console.log("implement latter") },
  //       { label: 'Delete', icon: 'pi pi-trash', command: () => console.log("implement latter") },
  //       { label: 'Pin', icon: 'pi pi-bookmark', command: () => console.log("implement latter") },
  //     ],
  //   }
  // ];

  // projectItems: MenuItem[] = [
  //   {
  //     label: 'Project',
  //     items: [
  //       { label: 'Rename', icon: 'pi pi-pencil', command: () => console.log("implement latter") },
  //       { label: 'Delete', icon: 'pi pi-trash', command: () => console.log("implement latter") },
  //       { label: 'Pin', icon: 'pi pi-bookmark', command: () => console.log("implement latter") },
  //     ],
  //   }
  // ];

  openFolderMenu(
    event: MouseEvent,
    id: string,
    entityType: EntityType,
    isPinned: boolean,
    isArchived: boolean = false,
  ) {
    event.stopPropagation();
    event.preventDefault();
    // this.activeFolderId = folderId;

    const context = this.contextMenuService.getContextMenu(
      entityType,
      isPinned,
      isArchived,
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

  handleAction(entityType: EntityType, action: string, id: string) {
    console.log('handle actions::', action);

    if (entityType === EntityType.FOLDER) {
      switch (action) {
        case 'addList':
          this.activeFolderId = id;
          this.showAddList();
          // this.reinitializedIds()
          break;
        case 'edit':
          this.activeFolderId = id;
          this.mode = 'update';
          this.toggleFolderDialog();
          break;
        case 'ungroup':
          this.ungropFolder(id);
          break;
        case 'pin':
          this.togglePinFolder(id);
          break;
        case 'unpin':
          this.togglePinFolder(id);
          break;
      }
    } else if (entityType == EntityType.PROJECT) {
      let project = this.allProject().find((p) => p.id === id);
      switch (action) {
        case 'edit':
          this.projectId = id;
          this.mode = 'update';
          this.showAddList();
          break;
        case 'duplicate':
          this.createProject({
            ...project,
            id: crypto.randomUUID(),
            name: project.name + ' copy',
          });
          break;
        case 'share':
          break;
        case 'archive':
          this.updateProject(id, {
            ...project,
            isArchived: !project.isArchived,
          });
          break;
        case 'unarchive':
          this.updateProject(id, {
            ...project,
            isArchived: !project.isArchived,
          });
          break;
        case 'pin':
          this.updateProject(id, {
            ...project,
            isPinned: !project.isPinned,
          });
          break;
        case 'unpin':
          this.updateProject(id, {
            ...project,
            isPinned: !project.isPinned,
          });
          break;
        case 'delete':
          this.deleteProject(id);
          break;
      }
    }
    console.log(entityType + ' : ' + action + ' : ' + id);
  }
  /**************option menu******************* */

  /**************folder event******************* */
  handleFolderEvent(event: any) {
    console.log('folder event', event);
    switch (event.action) {
      case 'update':
        this.updateFolder(event.folderId, event.folderName);
        this.isFolderDialogOpen = false;
        break;
      case 'cancel':
        this.isFolderDialogOpen = false;
        this.reinitializedIds();
        break;
    }
  }

  /**ungroup folder */
  ungropFolder(folderId: string) {
    this.projectService.fetchProjectByFolderId(folderId).subscribe((data) => {
      data.forEach((project) => {
        this.projectService
          .updateProject(project.id, {
            ...project,
            folderId: (project.folderId = null),
          })
          .subscribe();
      });
      this.folderService.deleteFolder(folderId).subscribe({
        next: () => {
          this.folderWithProjectService.fetchFolderWithProjects();
          this.reinitializedIds();
        },
        error: () => {
          this.reloaddata();
          this.reinitializedIds();
        },
      });
    });
  }

  updateFolder(folderId: string, updatedName: any) {
    this.folderService.fetchFolderById(folderId).subscribe((folder) => {
      this.folderService
        .updateFolder(folder.id, { ...folder, name: updatedName })
        .subscribe((update) => {
          console.log('Folder Updated....', update);
          this.reloaddata();
          this.reinitializedIds();
        });
    });
  }

  toggleFolder(index: number) {
    if (this.openFolders.has(index)) {
      this.openFolders.delete(index);
    } else {
      this.openFolders.add(index);
    }
  }

  /*show and hide create folder menu*/
  toggleFolderDialog() {
    this.isFolderDialogOpen = !this.isFolderDialogOpen;
  }

  togglePinFolder(folderId: string) {
    this.folderService.fetchFolderById(folderId).subscribe((folder) => {
      this.folderService
        .updateFolder(folder.id, { ...folder, isPinned: !folder.isPinned })
        .subscribe((update) => {
          console.log('Folder Updated....', update);
          this.folderService.loadAllFolders()
          this.folderWithProjectService.fetchFolderWithProjects();
          this.reinitializedIds();
        });
    });
  }
  /**************folder event******************* */

  showAddList() {
    this.isShowCreateForm = !this.isShowCreateForm;
  }
  /**project form event */
  formEventHandler(event: any) {
    if (event.action === 'close') {
      this.isShowCreateForm = false;
      this.reinitializedIds();
      return;
    }

    console.log('Project Form Event Handler::', event);

    if (EntityType.PROJECT === event.entity) {
      const project = this.allProject().find((p) => p.id === event.entityId);
      switch (event.action) {
        case 'create':
          this.createProject(event.payload);
          break;
        case 'update':
          this.mode = 'update';
          this.updateProject(event.entityId, { ...project, ...event.payload });
          break;
      }
    }
  }

  createProject(projectData: any) {
    // const rawFolderId = projectData.folderId;
    // const resolvedFolderId =
    //   !rawFolderId || rawFolderId === '' || rawFolderId === '__new__'
    //     ? null
    //     : rawFolderId;

    const project: Project = {
      ...projectData,
      id: crypto.randomUUID(),
      folderId: projectData.folderId ?? null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isPinned: projectData.isPinned ?? false,
      isArchived: projectData.isArchived ?? false,
      isSmartView: false,
      icon: 'pi pi-cog',
      tasks: [],
      entityType: EntityType.PROJECT,
    };

    this.projectService.createProject(project).subscribe(() => {
      console.info('project created...');
      this.isShowCreateForm = false;
      this.reloaddata();
      this.reinitializedIds();
    });
  }

  updateProject(projectId: string, updatedProject: Project) {
    this.projectService
      .updateProject(projectId, updatedProject)
      .subscribe(() => {
        console.log('project updated');

        this.isShowCreateForm = false;
        this.reloaddata();
        this.reinitializedIds();
      });
  }

  isOpen(index: number): boolean {
    return this.openFolders.has(index);
  }

  deleteProject(id: string) {
    this.projectService.deleteProject(id).subscribe((data) => {
      console.info('project Deleted', data);
      this.reloaddata();
    });
  }

  @HostListener('document:keydown.escape')
  handleEsc() {
    this.isShowCreateForm = false;
    this.isFolderDialogOpen = false;
    this.reinitializedIds();
  }

  reinitializedIds() {
    this.mode = 'create';
    this.projectId = null;
    this.activeFolderId = null;
  }

  reloaddata() {
    this.projectService.loadAllProjects();
    this.folderWithProjectService.fetchFolderWithProjects();
  }
}
