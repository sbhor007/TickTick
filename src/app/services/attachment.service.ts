import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { catchError, Observable, of } from 'rxjs';
import { environment } from '../../environments/environment.development';
import { Attachment } from '../models/attachment';

@Injectable({
  providedIn: 'root',
})
export class AttachmentService {

  private _allAttachments = signal<Attachment[]>([]);
  readonly allAttachments$ = this._allAttachments;

  constructor(private http: HttpClient) {}

  fetchAllAttachments(){
    return this.http.get<any>(`${environment.API}/attachments`).pipe(
      catchError((err) => {
        console.error('Error get all tasks:', err);
        return of([]);
      }),
    );
  }

  loadAllAllAttachments() {
    this.fetchAllAttachments().subscribe((attachments) => {
      this._allAttachments.set(attachments);
    });
  }

  uploadAttachment(file: File): Observable<string> {
    return new Observable((observer) => {
      const reader = new FileReader();

      reader.onload = () => {
        const attachment = {
          id: crypto.randomUUID(),
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
          fileData: reader.result,
          createdAt: new Date().toISOString(),
        };

        this.http
          .post<any>(`${environment.API}/attachments`, attachment)
          .subscribe({
            next: (res) => {
              observer.next(res.id);
              observer.complete();
            },
            error: (err) => observer.error(err),
          });
      };

      reader.onerror = () =>
        observer.error(new Error(`Failed to read file: ${file.name}`));
      reader.readAsDataURL(file);
    });
  }

  getAttachmentById(attachmentId: string): Observable<any> {
    return this.http
      .get<any>(`${environment.API}/attachments/${attachmentId}`)
      .pipe(
        catchError((err) => {
          console.error('Error get all tasks:', err);
          return of();
        }),
      );
  }
}
