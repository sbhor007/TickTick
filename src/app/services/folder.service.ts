import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { Folder } from '../models/folder';
import { catchError, map, Observable, of } from 'rxjs';
import { environment } from '../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class FolderService {

  private _allFolders = signal<Folder[]>([])
  readonly allFolders$ = this._allFolders

  private _pinnedFolders = signal<any[]>([])
  readonly pinnedFolders$ = this._pinnedFolders

  constructor(private http:HttpClient) { }


  fetchAllFolders(): Observable<Folder[]>{
    return this.http.get<any[]>(`${environment.API}/folders`).pipe(
      catchError((err) => {
        console.error('Error creating Folder:', err);
        return of([]);
      }),
    )
  }

  loadAllFolders(){
    this.fetchAllFolders().subscribe(folders => {
      // console.log("Folder Data::");
      // console.table(folders)
      this._allFolders.set(folders)
      // console.table(this.allFolders$())
    })
  }

  /* create folder */
createFolder(folderData: Folder): Observable<any> {
   return this.http.post<any>(`${environment.API}/folders`, folderData).pipe(
      catchError((err) => {
        console.error('Error creating Folder:', err);
        return of(null);
      }),
    )
  }

  /* fetch folder by id */
  fetchFolderById(folderId:string):Observable<Folder>{
    return  this.http.get<any>(`${environment.API}/folders/${folderId}`).pipe(
      catchError((err) => {
        console.error('Error creating Folder:', err);
        return of();
      }),
    );
  }

  /*update Folder*/
  updateFolder(id: string, updatedFolder: Folder): Observable<any> {
    return this.http.put(`${environment.API}/folders/${id}`, updatedFolder).pipe(
      catchError((err) => {
        console.error('Error creating Folder:', err);
        return of();
      }),
    );
  }

  /* Delete folder */
  deleteFolder(folderId: string): Observable<any> {
   return this.http.delete<any>(`${environment.API}/folders/${folderId}`).pipe(
      catchError((err) => {
        console.error('Error delete Folder:', err);
        return of(null);
      }),
    )
  }

  /* fetched pinned folders */
loadPinnedFolders(){
  this.fetchAllFolders().pipe(
    map(folders => folders.filter((f) => f.isPinned === true)),
    catchError((err) =>{
      console.error('Error fetching pinned folders:', err);
        return of([]);
    })
  ).subscribe(data =>{
    this._pinnedFolders.set(data)
    // console.log('pinned folders:', data);
  })
}
}
