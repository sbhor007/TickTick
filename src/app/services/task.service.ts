import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { Task } from '../models/task';
import { catchError, Observable, of } from 'rxjs';
import { environment } from '../../environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  private _allTasks = signal<Task[]>([]);
  readonly allTasks$ = this._allTasks;

  constructor(protected http: HttpClient) {}

  fetchAllTasks(): Observable<any> {
    return this.http.get<any>(`${environment.API}/tasks`).pipe(
      catchError((err) => {
        console.error('Error get all tasks:', err);
        return of();
      }),
    );
  }

  /**Load All Tasks */
  loadAllTasks() {
    this.fetchAllTasks().subscribe((tasks) => {
      this.allTasks$.set(tasks);
    });
  }

  /**create task */
  crateTask(projectId: string, task: Task) {
    this.http.post<Task>(`${environment.API}/tasks`, task).subscribe({
      next: (taskData) => {
        console.log('task Created...');
        this.loadAllTasks();
      },
      error: (err) => {
        console.error('error occur when task creation:: ', err);
      },
    });
  }

  /**update task */
  updateTask(taskId: string, updatedTask: Partial<Task>){
    console.log('updateTask called::', taskId, updatedTask);

    return this.http
      .patch<Task>(`${environment.API}/tasks/${taskId}`, {
        ...updatedTask,
        updatedAt: new Date().toISOString(),
      }).subscribe({
        next: (task) =>{
          console.log("task updated");
          this.loadAllTasks()
        },
        error: (err) =>{
          console.error("Error Occur during task update::",err)
        }
      })
  }

  /**Update sub Task */
  updateSubTask(parentId: string, subTaskId: string, updatedSubTask: Task) {
    const parentTask = this.allTasks$().find((t) => t.id === parentId);

    if (!parentTask) return;
    const updatedSubTasks = parentTask.subtasks?.map((st) =>
      st.id === subTaskId
        ? { ...st, ...updatedSubTask, updatedAt: new Date().toISOString() }
        : st,
    );

    this.updateTask(parentId, { ...parentTask, subtasks: updatedSubTasks });
  }


}
