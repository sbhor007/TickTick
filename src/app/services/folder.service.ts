import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Folder } from '../models/folder';

@Injectable({
  providedIn: 'root'
})
export class FolderService {
  private folderSubject:BehaviorSubject<Folder[]> = new BehaviorSubject<Folder[]>([]);

  constructor() { }

  createFolder(folderData:Folder){
    this.folderSubject.next([...this.folderSubject.value, folderData]);
    console.log(this.folderSubject.value);
    
  }

  getAllFolders(){
    return this.folderSubject.value
  }

  getFolderById(id:string){
    return this.folderSubject.getValue().find(folder => folder.id === id)
  }
}
