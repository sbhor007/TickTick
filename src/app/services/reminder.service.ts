import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { Reminder } from '../models/reminder';
import { catchError, Observable, of } from 'rxjs';
import { environment } from '../../environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class ReminderService {
  private _allReminders = signal<Reminder[]>([]);
  readonly allReminders$ = this._allReminders;

  constructor(private http: HttpClient) {}

  fetchAll(): Observable<Reminder[]> {
    return this.http.get<Reminder[]>(`${environment.API}/reminders`).pipe(
      catchError((err) => {
        console.error('Error get all tasks:', err);
        return of([]);
      }),
    );
  }

  loadAllReminders() {
    this.fetchAll().subscribe((reminders) => {
      this._allReminders.set(reminders);
    });
  }

  create(reminder: any, taskId: string,dueDate: string | null): Observable<Reminder> {
    const payload: Reminder = {
      id: crypto.randomUUID(),
      taskId,
      type: reminder.type,
      reminderDate: this.calculateReminderDate(reminder.type, dueDate),
      isActive: true,
      lastTriggeredAt: null,
      createdAt: new Date().toISOString(),
    };
    return this.http.post<Reminder>(`${environment.API}/reminders`, payload);
  }

  private calculateReminderDate(
    type: string,
    dueDate: string | null,
  ): string | null {
    const base = dueDate ? new Date(dueDate) : new Date();

    switch (type) {
      case 'daily': {
        const d = new Date(base);
        d.setDate(d.getDate() + 1);
        return d.toISOString();
      }
      case 'weekly': {
        const d = new Date(base);
        d.setDate(d.getDate() + 7);
        return d.toISOString();
      }
      case 'monthly': {
        const d = new Date(base);
        d.setMonth(d.getMonth() + 1);
        return d.toISOString();
      }
      case 'yearly': {
        const d = new Date(base);
        d.setFullYear(d.getFullYear() + 1);
        return d.toISOString();
      }
      case 'every_weekend': {
        const d = new Date(base);
        const day = d.getDay();
        const daysUntilSaturday = (6 - day + 7) % 7 || 7;
        d.setDate(d.getDate() + daysUntilSaturday);
        return d.toISOString();
      }
      case 'none':
        return null;
      case 'custom':
        return null;
      default:
        return null;
    }
  }
}
