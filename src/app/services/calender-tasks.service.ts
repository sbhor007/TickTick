import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { catchError, Observable, of } from 'rxjs';
import { environment } from '../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class CalenderTasksService {

  private _allCalenderTasks = signal<any[]>([]);
  readonly allCalenderTasks$ = this._allCalenderTasks;

  constructor(protected http: HttpClient) {}

  fetchCalenderAllTasks(): Observable<any> {
      return this.http.get<any>(`${environment.API}/calender`).pipe(
        catchError((err) => {
          console.error('Error get all tasks:', err);
          return of([]);
        }),
      );
    }

    /**Load All Tasks */

  loadAllCalenderTasks() {
    this.fetchCalenderAllTasks().subscribe((tasks) => {
      this._allCalenderTasks.set(tasks);
    });
  }

}
