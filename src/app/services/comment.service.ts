import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { catchError, Observable, of } from 'rxjs';
import { environment } from '../../environments/environment.development';
import { Task } from '../models/task';
import { TaskComment } from '../models/task-comment';

@Injectable({
  providedIn: 'root',
})
export class CommentService {
  private _allComments = signal<TaskComment[]>([]);
  readonly allComments$ = this._allComments;

  constructor(protected http: HttpClient) {}

  fetchAlLComments(): Observable<TaskComment[]> {
    return this.http.get<TaskComment[]>(`${environment.API}/comments`).pipe(
      catchError((err) => {
        console.error('Error get all tasks:', err);
        return of([]);
      }),
    );
  }

  /**Load All Tasks */
  loadAllComments() {
    this.fetchAlLComments().subscribe((comments) => {
      this._allComments.set(comments);
    });
  }

  /**create comment */
  crateComment(comment: TaskComment) {
    this.http.post<TaskComment>(`${environment.API}/comments`, comment).subscribe({
      next: (commentData) => {
        console.log('COMMENT Created...');
        this.loadAllComments();
      },
      error: (err) => {
        console.error('error occur when COMMENT creation:: ', err);
      },
    });
  }

  /**update comment */
  updateComment(commentId: string, comment: TaskComment): void {
    this.http
      .put<TaskComment>(`${environment.API}/comments/${commentId}`, {
        ...comment,
        updatedAt: new Date().toISOString(),
      })
      .subscribe({
        next: (updatedComment) => {
          console.log('Comment updated...', updatedComment);
          this.loadAllComments();
        },
        error: (err) => {
          console.error('Error occurred when updating comment:: ', err);
        },
      });
  }
  /**delete comment */
  deleteComment(commentId: string): void {
    this.http
      .delete<void>(`${environment.API}/comments/${commentId}`)
      .subscribe({
        next: () => {
          console.log('Comment deleted...');
          this.loadAllComments();
        },
        error: (err) => {
          this.loadAllComments();
          console.error('Error occurred when deleting comment:: ', err);
        },
      });
  }
}
