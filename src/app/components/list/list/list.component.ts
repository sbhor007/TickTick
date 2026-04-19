import {
  Component,
  computed,
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
import { ConfirmationService, MenuItem } from 'primeng/api';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { ContextMenuBarService } from '../../../config/context-menu-bar.service';
import { TaskService } from '../../../services/task.service';
import { Task } from '../../../models/task';

@Component({
  selector: 'app-list',
  imports: [
    CreateProjectComponent,
    RouterLink,
    CommonModule,
    CreateFolderComponent,
    Menu,
    ConfirmDialog,
  ],
  providers: [ConfirmationService],
  templateUrl: './list.component.html',
})
export class ListComponent implements OnInit {
  private folderService = inject(FolderService);
  private projectService = inject(ProjectService);
  private confirmationService = inject(ConfirmationService);
  private contextMenuService = inject(ContextMenuBarService);
  private taskService = inject(TaskService);

  allFolders = computed(() => {
    const data = this.folderService.allFolders$().map((folder) => ({
      ...folder,
      entityType: folder.entityType,
      projects: this.projectService
        .projects$()
        .filter((p) => p.folderId === folder.id),
    }));
    return data;
  });
  allProject = computed(() => this.projectService.projects$());
  allArchives = computed(() =>
    this.projectService.projects$().filter((p) => p.isArchived),
  );
  // folderWithProjects = this.folderWithProjectService.foldersWithProjects$;

  isShowCreateForm = false;
  isFolderDialogOpen = false;
  openFolders = new Set<number>();
  isArchivedExpanded = false;

  /**project creation and update */
  activeFolderId: string | null = null;
  mode: 'create' | 'update' = 'create';
  projectId: string | null = null;

  ngOnInit(): void {
    // this.folderWithProjectService.fetchFolderWithProjects();
    this.folderService.loadAllFolders();
    this.projectService.loadAllProjects();
  }

  /*************Option Menu********************* */

  @ViewChild('contextMenuOptions') contextMenuOptions!: Menu;

  contextMenu: MenuItem[] = [];

  openFolderMenu(
    event: MouseEvent,
    id: string,
    entityType: any,
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
    //   // $&('handle actions::', action);

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
    // $&(entityType + ' : ' + action + ' : ' + id);
  }
  /**************option menu******************* */

  /**************folder event******************* */
  handleFolderEvent(event: any) {
    // $&('folder event', event);
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
    this.confirmationService.confirm({
      message: 'List inside within the folder shows directly inside the folder',
      header: 'Ungroup Folder',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger p-button-sm',
      rejectButtonStyleClass: 'p-button-sm',
      accept: () => {
        this.projectService
          .fetchProjectByFolderId(folderId)
          .subscribe((data) => {
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
                this.reinitializedIds();
              },
              error: () => {
                this.reloaddata();
                this.reinitializedIds();
              },
            });
          });
      },
    });
  }

  updateFolder(folderId: string, updatedName: any) {
    this.folderService.fetchFolderById(folderId).subscribe((folder) => {
      this.folderService
        .updateFolder(folder.id, { ...folder, name: updatedName })
        .subscribe((update) => {
          // $&('Folder Updated....', update);
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
          // $&('Folder Updated....', update);
          this.folderService.loadAllFolders();
          // this.folderWithProjectService.fetchFolderWithProjects();
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

    // $&('Project Form Event Handler::', event);

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
        // $&('project updated');

        this.isShowCreateForm = false;
        this.reloaddata();
        this.reinitializedIds();
      });
  }

  isOpen(index: number): boolean {
    return this.openFolders.has(index);
  }

  // deleteProject(id: string) {
  //   this.projectService.deleteProject(id).subscribe((data) => {
  //     console.info('project Deleted', data);
  //     this.reloaddata();
  //   });
  // }
  deleteProject(id: string) {
    this.deleteTaskInsideProject(id)
    this.projectService.deleteProject(id).subscribe({
      next: () => {
        this.deleteTaskInsideProject(id);
        this.projectService.loadAllProjects();
      },
      error: () => {
        this.deleteTaskInsideProject(id);
        this.projectService.loadAllProjects();
      },
    });
  }

  deleteTaskInsideProject(projectId: string) {
    const taskIds = computed(() =>
      this.taskService
        .allTasks$()
        .filter((t) => t.projectId == projectId)
        .map(t => t.id),
    );

    taskIds().forEach(id =>{
      this.taskService.deleteTask(id)
    })
    console.log("Task ids :: ",taskIds());
    

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
    this.folderService.loadAllFolders();
    // this.folderWithProjectService.fetchFolderWithProjects();
  }
}
