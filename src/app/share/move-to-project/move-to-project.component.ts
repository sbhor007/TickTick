import { Component, computed, EventEmitter, inject, Input, Output } from '@angular/core';
import { FolderService } from '../../services/folder.service';
import { ProjectService } from '../../services/project.service';
import { Task } from '../../models/task';
import { EntityType } from '../../enums/entity-type';
import { TaskService } from '../../services/task.service';

@Component({
  selector: 'app-move-to-project',
  imports: [],
  templateUrl: './move-to-project.component.html',
  styles: ``
})
export class MoveToProjectComponent {
  private folderService = inject(FolderService);
  private projectService = inject(ProjectService);
  private taskService = inject(TaskService);


  @Input() task: Task | null = null;
  @Output() closed = new EventEmitter<void>();
   folderProject = computed(() => {
    const folder = this.folderService
      .allFolders$()

      .map((folder) => ({
        ...folder,
        projects: this.projectService
          .projects$()
          .filter((project) => project.folderId == folder.id),
      }));
    const project = this.projectService
      .projects$()
      .filter((project) => project.folderId == null && !project.isSmartView);
    return [...folder, ...project];
  });
 

  hoveredFolderId: string | null = null;

  onFolderHover(id: string) {
    this.hoveredFolderId = id;
  }

  onFolderLeave() {
    this.hoveredFolderId = null;
  }

  moveTO(entity: any) {
    console.log("test-move to is working ? ");
    
    if (this.task && this.task.entityType == EntityType.TASK) {
              this.taskService.deleteTask(this.task.id);
              this.taskService.crateTask(entity.id, {
                ...this.task,
                projectId: entity.id,
              });
            } else if (this.task?.entityType == EntityType.SUBTASK) {
              this.taskService.deleteSubTask(
                this.task.parentId ?? '',
                this.task.id,
              );
              this.taskService.crateTask(this.task.id, {
                ...this.task,
                projectId: this.task.projectId,
                entityType: EntityType.TASK,
                parentId: null,
              });
    
    this.closed.emit();
  }

}
}
