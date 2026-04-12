import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterOutlet } from '@angular/router';
import { Splitter } from 'primeng/splitter';
import { TaskListComponent } from '../../../components/context/task-list/task-list.component';
import { combineLatest, distinctUntilChanged, map, switchMap } from 'rxjs';
import { EntityType } from '../../../enums/entity-type';
import { ContextHeaderComponent } from '../../../components/context/context-header/context-header.component';

type RouteInfo = {
  id: string | null;
  entityType: EntityType;
};

@Component({
  selector: 'app-context.page',
  imports: [Splitter, RouterOutlet, TaskListComponent, ContextHeaderComponent],
  templateUrl: './context.page.component.html',
  styles: ``,
})
export class ContextPageComponent implements OnInit {
  private route = inject(ActivatedRoute);
  routeData = signal<RouteInfo>({
    id: null,
    entityType: EntityType.FOLDER,
  });

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

  sortEventHandler(event: any) {
    console.log('Event :: ', event);
    this.sortGroupData.set(event);
  }
}
