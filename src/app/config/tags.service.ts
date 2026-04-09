import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, of, tap } from 'rxjs';
import { environment } from '../../environments/environment.development';
import { Tag } from '../models/tag';

@Injectable({
  providedIn: 'root'
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
        console.info("Tag Crated...")
        this.loadAllTags()
      },
      error:(err) => {
        console.error("Error Occurs in :",err); 
      }
    })
  }

   /* update tag */
  updateTag(id: string, changes: Partial<Tag>) {
    const body = { ...changes, updatedAt: new Date().toISOString() };
     this.http.patch<Tag>(`${environment.API}/tags/${id}`, body).subscribe({
      next: (data) =>{
         console.info("Tag updated...")
        this.loadAllTags()
      },
      error:(err) => {
        console.error("Error Occurs in tag update:",err); 
      }
    })
      
  }
}
