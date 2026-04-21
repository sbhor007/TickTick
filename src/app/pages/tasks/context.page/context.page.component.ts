import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterOutlet } from '@angular/router';
import { Splitter } from 'primeng/splitter';
import { TaskListComponent } from '../../../components/context/task-list/task-list.component';
import { combineLatest, distinctUntilChanged, map, switchMap } from 'rxjs';
import { EntityType } from '../../../enums/entity-type';
import { ContextHeaderComponent } from '../../../components/context/context-header/context-header.component';
import { TagInputComponent } from '../../../share/tag-input/tag-input.component';
import { TaskInputComponent } from '../../../share/task-input/task-input.component';
import { ProjectService } from '../../../services/project.service';
import { DateTimePickerComponent } from '../../../share/date-time-picker/date-time-picker.component';
import { TagsService } from '../../../config/tags.service';

type RouteInfo = {
  id: string | null;
  entityType: EntityType;
};

@Component({
  selector: 'app-context.page',
  imports: [
    Splitter,
    RouterOutlet,
    TaskListComponent,
    ContextHeaderComponent,
    TagInputComponent,
    TaskInputComponent,
    DateTimePickerComponent,
  ],
  templateUrl: './context.page.component.html',
  styles: ``,
})
export class ContextPageComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private projectService = inject(ProjectService);
  private tagService = inject(TagsService);

  routeData = signal<RouteInfo>({
    id: null,
    entityType: EntityType.FOLDER,
  });

  entityData = signal<any>(null);

  sortGroupData = signal<any>({ groupBy: 'none', sortBy: 'Title' });

  ngOnInit(): void {
    // this.projectService.loadAllProjects()
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
        this.loadEntityData();
      });
  }

  private loadEntityData(): void {
    const { entityType, id } = this.routeData();

    if (entityType === EntityType.FOLDER) {
      const data = this.projectService
        .projects$()
        .find((p) => p.folderId === id);
      this.entityData.set(data);
    } else if (entityType === EntityType.PROJECT) {
      this.projectService.fetchProjectById(id ?? '').subscribe((data) => {
        console.log('Project data::', data);
        this.entityData.set(data);
      });
    } else if (
      [
        EntityType.ALL,
        EntityType.TODAY,
        EntityType.TOMORROW,
        EntityType.NEXT_SEVEN_DAYS,
        EntityType.INBOX,
      ].includes(entityType)
    ) {
      this.projectService.fetchProjectById('inbox').subscribe((data) => {
        console.log('Project data::', data);
        this.entityData.set(data);
      });
    } else if (EntityType.TAG) {
      const tag = this.tagService.allTags$().find((t) => t.id == id);
      this.entityData.set(tag);
    }
  }

  sortEventHandler(event: any): void {
    console.log('Sort event::', event);
    this.sortGroupData.set(event);
  }
}
