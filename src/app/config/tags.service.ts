import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, of, tap } from 'rxjs';
import { environment } from '../../environments/environment.development';
import { Tag } from '../models/tag';
import { EntityType } from '../enums/entity-type';

@Injectable({
  providedIn: 'root',
})
export class TagsService {
  private _allTags$ = signal<Tag[]>([]);
  readonly allTags$ = this._allTags$;

  constructor(private http: HttpClient) {}

  /* fetch all tags */
  fetchAllTags(): Observable<any> {
    return this.http.get(`${environment.API}/tags`).pipe(
      catchError((err) => {
        console.error('Error fetching Tags:', err);
        return of([]);
      }),
    );
  }

  loadAllTags() {
    this.fetchAllTags().subscribe((data) => {
      console.log('ALL_TAGS_DATA::', data);
      this._allTags$.set(data);
    });
  }

  /* createTag */
  createTags(payload: Partial<Tag>) {
    if (payload.parentId != null) {
      this.createSubTag(payload);
      return;
    }
    const body: Partial<Tag> = {
      ...payload,
      parentId: payload.parentId ?? null,
      childTag: [],
      isPinned: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.http.post<Tag>(`${environment.API}/tags`, body).subscribe({
      next: (data) => {
        console.info('Tag Crated...');
        this.loadAllTags();
      },
      error: (err) => {
        console.error('Error Occurs in :', err);
      },
    });
  }

  /**create SubTag */
  createSubTag(payload: any) {
    const child = {
      ...payload,
      id: payload.id ?? crypto.randomUUID(),
      parentId: payload.parentId ?? null,
      entityType: EntityType.CHILD_TAG,
      childTag: [],
      isPinned: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const tag = this._allTags$().find((f) => f.id == payload.parentId);
    this.updateTag(payload.parentId, {
      ...tag,
      childTag: [...(tag?.childTag || []), child],
      
    });
  }
  /* update tag */
  updateTag(id: string, changes: Partial<Tag>) {
    const body = { ...changes, updatedAt: new Date().toISOString() };
    this.http.patch<Tag>(`${environment.API}/tags/${id}`, body).subscribe({
      next: (data) => {
        console.info('Tag updated...');
        this.loadAllTags();
      },
      error: (err) => {
        console.error('Error Occurs in tag update:', err);
      },
    });
  }

  /** DELETE — remove a root tag */
  deleteTag(id: string){
     this.http.delete<void>(`${environment.API}/tags/${id}`).subscribe({
      next: () =>{
        console.info('Tag deleted...');
        this.loadAllTags()
      },
      error: (err) =>{
        this.loadAllTags()
        console.error('Error Occurs in tag update:', err);
      }
    })
  }
}
