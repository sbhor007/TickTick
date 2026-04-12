import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterOutlet } from '@angular/router';
import { Splitter } from 'primeng/splitter';
import { TaskListComponent } from '../../../components/context/task-list/task-list.component';
import { combineLatest, distinctUntilChanged, map, switchMap } from 'rxjs';
import { EntityType } from '../../../enums/entity-type';
import { ContextHeaderComponent } from '../../../components/context/context-header/context-header.component';
import { TagInputComponent } from "../../../share/tag-input/tag-input.component";
import { TaskInputComponent } from "../../../share/task-input/task-input.component";
import { ProjectService } from '../../../services/project.service';

type RouteInfo = {
  id: string | null;
  entityType: EntityType;
};

@Component({
  selector: 'app-context.page',
  imports: [Splitter, RouterOutlet, TaskListComponent, ContextHeaderComponent, TagInputComponent, TaskInputComponent],
  templateUrl: './context.page.component.html',
  styles: ``,
})
export class ContextPageComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private projectService = inject(ProjectService)
  routeData = signal<RouteInfo>({
    id: null,
    entityType: EntityType.FOLDER,
  });

  entity:any

 sortGroupData = signal<any>({ groupBy: 'none', sortBy: 'Title' });



  //   ngOnInit(): void {
  //     // this.route.paramMap
  //     //   .pipe(
  //     //     map((param) => ({
  //     //       id: param.get('id'),
  //     //       entityType: this.route.snapshot.data['entityType'],
  //     //     })),
  //     //   )
  //     //   .subscribe((values) => {
  //     //     this.routeData.set(values)
  //     //   });

  //     combineLatest([
  //   this.route.paramMap,
  //   this.route.data
  // ])
  //   .pipe(
  //     map(([params, data]) => ({
  //       id: params.get('id'),
  //       entityType: data['entityType'],
  //     }))
  //   )
  //   .subscribe((values) => {
  //     console.log("before::",values);
  //     this.routeData.set(values);
  //     console.log("after::",values);
  //   });
  //   }
  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        switchMap((params) =>
          this.route.data.pipe(
            map((data) => ({
              id: params.get('id'),
              entityType: data['entityType'] as EntityType,
            })),
          ),
        ),
        distinctUntilChanged((prev, curr) => prev.id === curr.id),
      )
      .subscribe((values) => {
        console.log('routeData updated:', values);
        this.routeData.set(values);
      });
  }

  loadEntityData(){
    if(this.routeData().entityType == EntityType.FOLDER){

    }else if(this.routeData().entityType == EntityType.PROJECT){
      this.projectService.fetchProjectById(this.routeData().id || '').subscribe(data => {
        this.entity = data
      })
    }
  }

  sortEventHandler(event: any) {
    console.log('Event :: ', event);
    this.sortGroupData.set(event);
  }
}
