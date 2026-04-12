import { Component, computed, inject, OnInit, ViewChild } from '@angular/core';
import { FolderService } from '../../../services/folder.service';
import { ProjectService } from '../../../services/project.service';
import { CommonModule, JsonPipe } from '@angular/common';
import { FolderProjectService } from '../../../services/folder-project.service';
import { RouterLink } from '@angular/router';
import { Menu } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { EntityType } from '../../../enums/entity-type';
import { TagsService } from '../../../config/tags.service';
import { Tag } from '../../../models/tag';
import { Project } from '../../../models/project';
import { Folder } from '../../../models/folder';

@Component({
  selector: 'app-pinned',
  imports: [RouterLink, CommonModule, Menu],
  templateUrl: './pinned.component.html',
})
export class PinnedComponent implements OnInit {
  private folderService = inject(FolderService);
  private projectService = inject(ProjectService);
  private folderWithProjectService = inject(FolderProjectService);
  private tagService = inject(TagsService);

  //  pinnedData = computed(() => {
  //   const projects = this.projectService.projects$().filter(p => p.isPinned);
  //   const folders  = this.folderService.allFolders$().filter(f => f.isPinned);
  //   const tags = this.tagService.allTags$().filter(t => t.isPinned);
  //   const childTags = this.tagService.allTags$().map(t => t.childTag.filter(st => st.isPinned))
  //   return [...projects, ...folders,...tags,...childTags];
  // });

  pinnedData = computed(() => {
    const projects = this.projectService.projects$().filter((p) => p.isPinned);
    const folders = this.folderService.allFolders$().filter((f) => f.isPinned);
    const tags = this.tagService.allTags$().filter((t) => t.isPinned);
    const childTags = this.tagService
      .allTags$()
      .flatMap((t) => t.childTag.filter((st) => st.isPinned));

    return [...projects, ...folders, ...tags, ...childTags];
  });

  @ViewChild('contextMenuOptions') contextMenuOptions!: Menu;
  contextMenu: MenuItem[] = [];

  ngOnInit(): void {
    this.projectService.loadAllProjects();
    this.tagService.loadAllTags();
    // this.projectService.fetchPinnedProjects()
    // this.folderService.loadPinnedFolders()
      // $&('pinned Data::', this.pinnedData());

    this.projectService.projects$().forEach((p) => {
        // $&('--', p);
    });

    // this.projectService.fetchPinnedProjects();
    // this.folderService.loadPinnedFolders();
    // this.pinnedData = computed(() => [...this.folderService.allFolders$(),...this.projectService.projects$()])
  }

  getEntityIcon(entityType: string): string {
    const map: Record<string, string> = {
      PROJECT: 'pi pi-briefcase text-blue-400',
      FOLDER: 'pi pi-folder text-yellow-400',
      TAG: 'pi pi-tag text-purple-400',
      CHILD_TAG: 'pi pi-bookmark text-pink-400',
    };
    return map[entityType] ?? 'pi pi-circle text-white/40';
  }

  openContextMenu(entityType: EntityType, id: string, entity: any, event: any) {
    event.preventDefault();
    this.contextMenu = [
      {
        label: 'unpin',
        icon: 'pi pi-pencil',
        command: () => this.unpin(entityType, id, entity),
      },
    ];
    console.info('open context menu call....', event);
    this.contextMenuOptions.toggle(event);
  }

  unpin(entityType: EntityType, id: string, entity: any) {
    if (entityType === EntityType.FOLDER) {
      this.unpinFolder(id, entity);
    } else if (entityType === EntityType.PROJECT) {
      this.unpinProject(id, entity);
    } else if (entityType === EntityType.TAG) {
      this.unpinTag(id,entity)
    }else if(entityType === EntityType.CHILD_TAG){
      this.unpinSubTag(id,entity)
    }
  }

  /**unpin tags */
  unpinTag(id: string, tag: Tag) {
    this.tagService.updateTag(id, { ...tag, isPinned: !tag.isPinned });
  }
  /**unpin tags */
  unpinSubTag(id: string, subTags: Tag) {
    this.tagService.updateSubTag(subTags.parentId || '', id, {
      ...subTags,
      isPinned: !subTags.isPinned,
    });
  }

  unpinProject(projectId: string, project: Project) {
      // $&('unpin project call');
    this.projectService
      .updateProject(projectId, { ...project, isPinned: !project.isPinned })
      .subscribe(() => {
        // this.projectService.fetchPinnedProjects();

        if (project.folderId) {
          this.folderService.loadAllFolders();
          this.folderWithProjectService.fetchFolderWithProjects();
        } else {
          this.projectService.loadAllProjects();
        }
      });
  }

  unpinFolder(folderId: string, folder: Folder) {
    // const folder = this.folderService.allFolders$().find((f) => f.id === folderId);
    // if(!folder)
    //   return
    this.folderService
      .updateFolder(folderId, { ...folder, isPinned: !folder.isPinned })
      .subscribe(() => {
        // this.projectService.fetchPinnedProjects();
        this.folderService.loadAllFolders()
        this.folderWithProjectService.fetchFolderWithProjects();
      });
  }
}
