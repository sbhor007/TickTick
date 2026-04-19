import { Injectable, signal } from '@angular/core';
import { Project } from '../models/project';
import { catchError, map, Observable, of } from 'rxjs';
import { environment } from '../../environments/environment.development';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {

  private _projects = signal<any[]>([]);
  readonly projects$ = this._projects;

  private _pinnedProjects = signal<any[]>([]);
  readonly pinnedProjects$ = this._pinnedProjects;


  constructor(private http:HttpClient) { }

  fetchAllProjects(): Observable<any>{
     return this.http
      .get<Project>(`${environment.API}/projects/`).pipe(
         catchError((err) => {
        console.error('Error creating project:', err);
        return of(null);
      }),
      )
  }

  loadAllProjects(){
    this.fetchAllProjects().subscribe(projects => {
      //  console.log("Project Data::");
      // console.table(projects)
      this._projects.set(projects)
      //  console.log("Project Data signal::");
      // console.table(this.projects$())
    })
  }
/**create new project */
  createProject(project: Project): Observable<any> {
    return this.http.post<Project>(`${environment.API}/projects`, project).pipe(
      catchError((err) => {
        console.error('Error creating project:', err);
        return of(null);
      }),
    );
  }

  /* update project data */
  updateProject(id: string, project: Project): Observable<Project | null> {
    return this.http
      .put<Project>(`${environment.API}/projects/${id}`, project)
      .pipe(
        catchError((err) => {
          console.error('Error fetching filtered projects:', err);
          return of(null); 
        }),
      );
  }

  /**fetch project by id */
  fetchProjectById(projectId: string): Observable<Project> {
    return this.http.get<Project>(`${environment.API}/projects/${projectId}`).pipe(
      catchError((err) => {
          console.error('Error fetching filtered projects:', err);
          this.loadAllProjects();
          return of();
        }),
    )
  }

  /**fetch project with folder id */
  fetchProjectByFolderId(folderId: string): Observable<Project[]> {
    return this.http.get<Project[]>(`${environment.API}/projects?folderId=${folderId}`).pipe(
      catchError((err) => {
          console.error('Error fetching filtered projects:', err);
          this.loadAllProjects();
          return of();
        }),
    )
  }
  /* de-link project to folder project */
  ungroupProjects(folderId: string): Observable<Project[]> {
    return this.http
      .get<Project[]>(`${environment.API}/projects?folderId=${folderId}`)
      
  }

  /* delete project */
  deleteProject(projectId: string): Observable<any> {
    return this.http
      .delete<any>(`${environment.API}/projects/${projectId}`)
      // .pipe(
      //   catchError((err) => {
      //     console.error('Error fetching filtered projects:', err);
      //     this.loadAllProjects();
      //     return of(null);
      //   }),
      // );
  }

  /* getPinnedProjects */
  fetchPinnedProjects() {
    return this.http.get<any[]>(`${environment.API}/projects`).pipe(
      map((projects) => projects.filter((p) => p.isPinned === true)),
      catchError((err) => {
        console.error('Error fetching pinned projects:', err);
        return of([]); // Return an empty array on error
      }),
    ).subscribe(pinnedData => {
      console.info("pinned Data",pinnedData);
      
      this._pinnedProjects.set(pinnedData)
    });
  }
}
