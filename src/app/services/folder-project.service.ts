import { inject, Injectable, signal } from '@angular/core';
import { FolderService } from './folder.service';
import { ProjectService } from './project.service';
import { forkJoin } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FolderProjectService {

  private folderService = inject(FolderService);
  private projectService = inject(ProjectService);


  private _foldersWithProjects = signal<any[]>([]);
  readonly foldersWithProjects$ = this._foldersWithProjects.asReadonly();

  constructor() { }

  projectListData(){
    this.folderService.loadAllFolders()
    this.projectService.loadAllProjects()
    let arr = []
    this.folderService.allFolders$().forEach(f =>{
      let data = this.projectService.projects$().filter(p => p.folderId == f.id)
      // f.projects.push(data)
      arr.push(...data)
    })

    let data = this.projectService.projects$().filter(p => p.folderId == null)
    arr.push(...data)

    
  }

  fetchFolderWithProjects(): void {
    forkJoin({
      folders: this.folderService.fetchAllFolders(),
      projects: this.projectService.fetchAllProjects(),
    }).subscribe({
      next: ({ folders, projects }: { folders: any[]; projects: any[] }) => {
        const folderWithProjects = folders.map((folder) => ({
          ...folder,
          projects: projects.filter((project) => project.folderId === folder.id),
        }));
        this._foldersWithProjects.set(folderWithProjects);
      },
    });
  }

}
