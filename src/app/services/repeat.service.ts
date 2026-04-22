import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { Repeat } from '../models/repeat';
import { environment } from '../../environments/environment.development';
import { catchError, Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class RepeatService {
  private _allRepeat = signal<Repeat[]>([]);
  readonly allRepeat$ = this._allRepeat;

  constructor(private http: HttpClient) {}

  fetchAll(): Observable<Repeat[]> {
    return this.http.get<Repeat[]>(`${environment.API}/repeats`).pipe(
      catchError((err) => {
        console.error('Error get all tasks:', err);
        return of([]);
      }),
    );
  }

  loadAllRepeats() {
    this.fetchAll().subscribe((repeats) => {
      this._allRepeat.set(repeats);
    });
  }

  create(
    repeat: any,
    taskId: string,
    dueDate: string | null,
  ): Observable<Repeat> {
    const repeatDate = this.calculateRepeatDate(repeat.type, dueDate);
    const payload: Repeat = {
      id: crypto.randomUUID(),
      taskId,
      type: repeat.type,
      repeatDate,
      nextOccurrence: repeatDate,
      lastOccurrence: null,
      isActive: true,
      createdAt: new Date().toISOString(),
    };
    return this.http.post<Repeat>(`${environment.API}/repeats`, payload);
  }

  private calculateNextOccurrence(
    type: string,
    dueDate: string | null,
  ): string | null {
    if (!dueDate) return null;

    const due = new Date(dueDate);

    switch (type) {
      case 'on_the_day':
        return due.toISOString();
      case '1_day_before':
        return new Date(due.setDate(due.getDate() - 1)).toISOString();
      case '2_days_before':
        return new Date(due.setDate(due.getDate() - 2)).toISOString();
      case '3_days_before':
        return new Date(due.setDate(due.getDate() - 3)).toISOString();
      case '1_week_before':
        return new Date(due.setDate(due.getDate() - 7)).toISOString();
      case 'custom':
        return null;
      default:
        return null;
    }
  }

  private calculateRepeatDate(
    type: string,
    dueDate: string | null,
  ): string | null {
    if (!dueDate) return null;

    const due = new Date(dueDate);
    console.log("type of : ", typeof type);
    console.log(type == "3_days_before");
    console.log(type);
    
    
    
    switch (type) {
      case 'on-the-day': {
        return due.toISOString();
      }
      case '1-day-before': {
        const d = new Date(due);
        d.setDate(d.getDate() - 1);
        return d.toISOString();
      }
      case '2-days-before': {
        const d = new Date(due);
        d.setDate(d.getDate() - 2);
        return d.toISOString();
      }
      case '3-days-before': {
        const d = new Date(due);
        d.setDate(d.getDate() - 3);
        return d.toISOString();
      }
      case '1-week-before': {
        const d = new Date(due);
        d.setDate(d.getDate() - 7);
        return d.toISOString();
      }
      case 'custom':
        return null;
      case 'none':
        return null;
      default:
        return null;
    }
  }
}
