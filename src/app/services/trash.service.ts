import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { catchError, Observable, of, retry, switchMap, tap } from 'rxjs';
import { Task } from '../models/task';
import { EntityType } from '../enums/entity-type';
import { TaskService } from './task.service';

@Injectable({
  providedIn: 'root',
})
export class TrashService {
  private taskService = inject(TaskService);
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
      this._allTrash.set(trash);
    });
  }

  addTrash(trashedData: Task) {
    if (trashedData?.subtasks) {
      const updateSubTask = trashedData?.subtasks.map((t: Task) => ({
        ...t,
        entityType: EntityType.TRASHED,
      }));
      trashedData.subtasks = updateSubTask;
    }
    console.log('trashed data::', trashedData);

    this.http.post<any>(`${environment.API}/trash`, trashedData).subscribe({
      next: (taskData) => {
        console.log('task Created...');
        this.loadAllTrash();
      },
      error: (err) => {
        console.error('error occur when task creation:: ', err);
      },
    });
  }


  restoreTask(taskId: string) {
  const task = this.allTrash$().find((t) => t.id === taskId);
  if (!task) return;
  this.deleteTrash(taskId);

  const restoredTask: Task = {
    ...task,
    entityType: EntityType.TASK,
    subtasks:
      task.subtasks?.map((st) => ({
        ...st,
        entityType: EntityType.SUBTASK,
      })) ?? [],
  };

  this.taskService.crateTask(restoredTask.projectId, restoredTask);
}

  removeFromTrash(taskId: string) {
    this.http.delete<void>(`${environment.API}/trash/${taskId}`).subscribe({
      next: () => {
        this.loadAllTrash();
        console.log('Removed from trash');
      },
      error: (err) => {
        this.loadAllTrash();
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
        console.log('Error permanently deleting from trash:', err);
      },
    });
  }

  /**delete all */
  deleteAll(): void {
    this._allTrash().forEach((t) =>
      {
        this.http.delete(`${environment.API}/trash/${t.id}`).subscribe()
      },
    );
    this._allTrash.set([]);
  }
}
