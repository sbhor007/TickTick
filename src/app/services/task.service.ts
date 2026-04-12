import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { Task } from '../models/task';
import { catchError, Observable, of } from 'rxjs';
import { environment } from '../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private _allTasks = signal<Task[]>([]);
  readonly allTasks$ = this._allTasks;

  constructor(private http: HttpClient) { }

  fetchAllTasks(): Observable<any> {
    return this.http.get<any>(`${environment.API}/tasks`).pipe(
      catchError((err) => {
        console.error('Error get all tasks:', err);
        return of();
      }),
    );
  }

  /**Load All Tasks */
  loadAllTasks(){
    this.fetchAllTasks().subscribe(tasks =>{
      this.allTasks$.set(tasks)
    })
  }
}

