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
      id: crypto.randomUUID(),
      parentId: payload.parentId ?? null,
      childTag: [],
      isPinned: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.http.post<Tag>(`${environment.API}/tags`, body).subscribe({
      next: (data) => {
        // console.info('Tag Crated...');
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
      childTag: payload.childTag ?? [],
      isPinned: payload.isPinned ?? false,
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
        // console.info('Tag updated...');
        this.loadAllTags();
      },
      error: (err) => {
        console.error('Error Occurs in tag update:', err);
      },
    });
  }

  /**Merge tags */
  mergeTags(selectedTagId: string, targetId: string) {
    const selectedTag = this.allTags$().find((f) => f.id === selectedTagId);
    const selectedChildTags = selectedTag?.childTag ?? [];
    selectedChildTags.forEach((cTag) => (cTag.parentId = targetId));

    const targetTag = this.allTags$().find((t) => t.id === targetId);
    if (targetTag && selectedChildTags.length) {
      targetTag.childTag.push(...selectedChildTags);
      this.updateTag(targetId, targetTag);
      // console.log('target::', targetTag);
      this.deleteTag(selectedTagId);
    }
  }

  /** DELETE — remove a root tag */
  deleteTag(id: string) {
    this.http.delete<void>(`${environment.API}/tags/${id}`).subscribe({
      next: () => {
        // console.info('Tag deleted...');
        this.loadAllTags();
      },
      error: (err) => {
        this.loadAllTags();
        console.error('Error Occurs in tag update:', err);
      },
    });
  }

  fetchTagById(id: string): Observable<Tag> {
    return this.http.get<Tag>(`${environment.API}/tags/${id}`).pipe(
      catchError((err) => {
        console.error('Error creating project:', err);
        return of();
      }),
    );
  }

  moveSubTag(parentId: string, payload: any) {
    this.fetchTagById(parentId).subscribe((tag) => {
      tag.childTag.push({ ...payload, updatedAt: new Date().toISOString() });
      this.updateTag(parentId, {
        ...tag,
        updatedAt: new Date().toISOString(),
      });
      // this.deleteSubTag(parentId,payload.id)
    });
  }

  /**DELETE - sub tag */
  deleteSubTag(parentId:string, childId:string){
     this.fetchTagById(parentId).subscribe((tag) => {
      const updatedChild = tag.childTag.filter(t => t.id != childId)
      this.updateTag(parentId, {
        ...tag,
        childTag: updatedChild,
        updatedAt: new Date().toISOString(),
      })

     })
  }

  /**UPDATE SUB_TAG */
  updateSubTag(parentId: string, childId: string, payload: Tag) {
    this.http.get<Tag>(`${environment.API}/tags/${parentId}`).subscribe({
      next: (tag: Tag) => {
        /**if parent id change */
        if (payload.parentId != parentId) {
          alert();
          const moveChildTag = tag.childTag.find((t) => t.id == childId);
          return;
        }

        const updatedChildTags = tag.childTag.map((t) =>
          t.id === childId
            ? { ...t, ...payload, updatedAt: new Date().toISOString() }
            : t,
        );
        const updatedTag = {
          ...tag,
          childTag: updatedChildTags,
          updatedAt: new Date().toISOString(),
        };
        this.updateTag(parentId, updatedTag);
      },
      error: (err) => {
        console.error('Error occurs in Updating sub tag::', err);
      },
    });
  }

}
