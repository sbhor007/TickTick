import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { catchError, Observable, of } from 'rxjs';
import { Task } from '../models/task';
import { EntityType } from '../enums/entity-type';

@Injectable({
  providedIn: 'root',
})
export class TrashService {
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
}
