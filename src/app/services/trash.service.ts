import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { catchError, Observable, of } from 'rxjs';
import { Task } from '../models/task';
import { EntityType } from '../enums/entity-type';
import { TaskService } from './task.service';

@Injectable({
  providedIn: 'root',
})
export class TrashService {
  private taskService = inject(TaskService)
  private _allTrash = signal<Task[]>([]);
  readonly allTrash$ = this._allTrash;

  constructor(protected http: HttpClient) {}

  fetchAllTrash(): Observable<any> {
    return this.http.get<Task>(`${environment.API}/trash`).pipe(
      catchError((err) => {
        console.error('Error get all tasks:', err);
        return of();
      }),
    );
  }

  loadAllTrash() {
    this.fetchAllTrash().subscribe((trash) => {
      this.allTrash$.set(trash);
    });
  }

  addTrash(trashedData: Task) {
    if(trashedData?.subtasks){
      const updateSubTask = trashedData?.subtasks.map((t:Task) => ({...t, entityType:EntityType.TRASHED}))
      trashedData.subtasks = updateSubTask
    }
    console.log("trashed data::",trashedData);
    
    this.http.post<any>(`${environment.API}/trash`, trashedData).subscribe({
      next: (taskData) => {
        console.log('task Created...');
        this.loadAllTrash()
      },
      error: (err) => {
        console.error('error occur when task creation:: ', err);
      },
    });
  }

  restoreTask(taskId: string) {
  const task = this.allTrash$().find((t) => t.id === taskId);
  if (!task) return;

  if (task.parentId) {
    // ── Restore SUBTASK ──────────────────────────────────────────
    // Restore subtasks back to its original entityType
    const restoredSubTask: Task = {
      ...task,
      entityType: EntityType.SUBTASK,
    };

    const parentTask = this.taskService.allTasks$().find(
      (t) => t.id === task.parentId
    );

    if (parentTask) {
      // Parent still exists → re-attach subtask
      this.taskService.updateTask(parentTask.id, {
        ...parentTask,
        subtasks: [...(parentTask.subtasks ?? []), restoredSubTask],
        updatedAt: new Date().toISOString(),
      });
    } else {
      // Parent was also deleted → restore as standalone TASK
      const restoredAsTask: Task = {
        ...task,
        parentId: null,
        entityType: EntityType.TASK,
        subtasks: [],
      };
      this.taskService.crateTask(restoredAsTask.projectId, restoredAsTask);
    }
  } else {
    // ── Restore TASK ─────────────────────────────────────────────
    // Restore subtasks entityType back to SUBTASK
    const restoredTask: Task = {
      ...task,
      entityType: EntityType.TASK,
      subtasks: task.subtasks?.map((st) => ({
        ...st,
        entityType: EntityType.SUBTASK,
      })) ?? [],
    };
    this.taskService.crateTask(restoredTask.projectId, restoredTask);
  }

  // Remove from trash after restore
  this.removeFromTrash(taskId);
}

removeFromTrash(taskId: string) {
  this.http.delete<void>(`${environment.API}/trash/${taskId}`).subscribe({
    next: () => {
      this.loadAllTrash();
      console.log('Removed from trash');
    },
    error: (err) => {
      this.loadAllTrash()
      console.error('Error removing from trash:', err);
    },
  });
}

  /**permanently delete from trash */
  deleteTrash(taskId: string) {
    this.http.delete<void>(`${environment.API}/trash/${taskId}`).subscribe({
      next: () => {
        this.loadAllTrash();
        console.log('Permanently deleted from trash');
      },
      error: (err) => {
        this.loadAllTrash();
        console.error('Error permanently deleting from trash:', err);
      },
    });
  }
}
