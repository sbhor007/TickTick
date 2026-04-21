import { HttpClient } from '@angular/common/http';
import { computed, Injectable, signal } from '@angular/core';
import { Task } from '../models/task';
import { catchError, map, Observable, of, retry } from 'rxjs';
import { environment } from '../../environments/environment.development';
import { EntityType } from '../enums/entity-type';

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  private _allTasks = signal<Task[]>([]);
  readonly allTasks$ = this._allTasks;

  

  constructor(protected http: HttpClient) {}

  totalTasks(){
    
  }

  fetchAllTasks(): Observable<any> {
    return this.http.get<any>(`${environment.API}/tasks`).pipe(
      catchError((err) => {
        console.error('Error get all tasks:', err);
        return of([]);
      }),
    );
  }

  /**Load All Tasks */

  loadAllTasks() {
    this.fetchAllTasks().subscribe((tasks) => {
      this._allTasks.set(tasks);
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

  /**createSubTask */
  createSubTask(parentId: string, subtask: Task) {
    const parentTask = this.allTasks$().find((t) => t.id === parentId);
    if (parentTask) {
      parentTask?.subtasks?.push(subtask);
      this.updateTask(parentId, parentTask);
      console.log('SubTask Created');
    }
  }

  fetchTaskById(taskId:string): Observable<Task>{
    return this.http.get<Task>(`${environment.API}/tasks/${taskId}`).pipe(
      catchError((err) => {
        console.error('Error get task by id:', err);
        return of(null as any);
      }),
    )
  }

  /**Get subtask by parent ID and subtask ID */
  getSubTaskById(parentId: string, subTaskId: string): Observable<Task | undefined> {
    return this.fetchTaskById(parentId).pipe(
      map((parentTask) => {
        return parentTask?.subtasks?.find((st) => st.id === subTaskId);
      }),
      catchError((err) => {
        console.error('Error getting subtask:', err);
        return of(undefined);
      }),
    );
  }

  /**Find a subtask by its ID by searching through all loaded tasks */
  findSubTaskById(subTaskId: string): { subtask: Task; parentTask: Task } | undefined {
    const allTasks = this._allTasks();
    for (const task of allTasks) {
      const subtask = task.subtasks?.find((st) => st.id === subTaskId);
      if (subtask) {
        return { subtask, parentTask: task };
      }
    }
    return undefined;
  }

  
  /**update task */
  updateTask(taskId: string, updatedTask: Partial<Task>) {
    console.log('updateTask called::', taskId, updatedTask);

    return this.http
      .patch<Task>(`${environment.API}/tasks/${taskId}`, {
        ...updatedTask,
        updatedAt: new Date().toISOString(),
      })
      .subscribe({
        next: (task) => {
          console.log('task updated');
          this.loadAllTasks();
        },
        error: (err) => {
          console.error('Error Occur during task update::', err);
        },
      });
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


  /**delete Task */

 deleteTask(taskId: string) {
  this.http.delete<void>(`${environment.API}/tasks/${taskId}`).pipe(
    retry(2)
  ).subscribe({
    next: (data) => {
      console.log('deleted Data', data);
      this.loadAllTasks();
    },
    error: (err) => {
      setTimeout(() =>{
        this.loadAllTasks();
      console.log('Error Occurs in delete task:', err);
      },500)
    },
  });
}

 
  deleteSubTask(parentTaskId: string, taskId: string) {
    if (!parentTaskId) {
      console.warn(
        'deleteSubTask: parentTaskId is missing for subtask',
        taskId,
      );
      return;
    }

    const parentTask = this.allTasks$().find((t) => t.id === parentTaskId);
    if (!parentTask) {
      console.warn('deleteSubTask: parent task not found:', parentTaskId);
      return;
    }

    const updatedSubTasks = parentTask.subtasks?.filter(
      (st) => st.id !== taskId,
    );

    this.updateTask(parentTask.id, {
      ...parentTask,
      subtasks: updatedSubTasks,
      updatedAt: new Date().toISOString(),
    });

    console.log('subtask deleted:', taskId);
  }

  /**link Task to parent Task */
  linkToParentTask(targetedTaskId: String, task: Task) {
    if (task.parentId) {
      // TODO: remove that child task first form another task then add to targeted task
      const parentTask = this.allTasks$().find((t) => task.parentId == t.id);
      if (parentTask) {
        let subTasks = parentTask?.subtasks?.filter((t) => t.id != task.id);
        if (subTasks?.length == 0) {
          this.updateTask(parentTask?.id, {
            ...parentTask,
            subtasks: [],
            updatedAt: new Date().toISOString(),
          });
        } else {
          this.updateTask(parentTask?.id, {
            ...parentTask,
            subtasks: subTasks,
            updatedAt: new Date().toISOString(),
          });
        }
      }
    }
    const targetedTask = this.allTasks$().find((t) => t.id === targetedTaskId);
    if (targetedTask) {
      targetedTask.subtasks?.push({
        ...task,
        parentId: targetedTask.id,
        entityType: EntityType.SUBTASK,
      });
      this.updateTask(targetedTask.id, { ...targetedTask });
      console.log('Linked to parent Task success');
      if (!task.parentId) {
        this.deleteTask(task.id);
      }
    }
  }
}
