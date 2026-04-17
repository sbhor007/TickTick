import { CommonModule } from '@angular/common';
import {
  Component,
  effect,
  EventEmitter,
  HostListener,
  inject,
  Input,
  OnInit,
  Output,
  Signal,
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { FolderService } from '../../../services/folder.service';
import { EntityType } from '../../../enums/entity-type';
import { ProjectService } from '../../../services/project.service';
import { debounceTime } from 'rxjs';
import { UiStateService } from '../../../services/ui-state.service';

export type GroupByOption = 'Date' | 'Tag' | 'Priority' | 'None';
export type SortByOption = 'Date' | 'Title' | 'Tag' | 'Priority';
export type SubMenuType = 'group' | 'sort' | null;

@Component({
  selector: 'app-context-header',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './context-header.component.html',
  styles: [`
    ::ng-deep .hidden-input .p-datepicker-input {
      display: none;
    }
  `],
})
export class ContextHeaderComponent implements OnInit {
  private folderService = inject(FolderService);
  private projectService = inject(ProjectService);
  private ui = inject(UiStateService);

  @Input() routeData!: Signal<any>;
  

  groupOptions: GroupByOption[] = ['Date', 'Tag', 'Priority', 'None'];
  sortOptions: SortByOption[] = ['Date', 'Title', 'Tag', 'Priority'];

  groupBy: GroupByOption = 'None';
  sortBy: SortByOption = 'Title';
  // @Output() updateTitle = new EventEmitter<any>();
  @Output() sortGroupChange = new EventEmitter<any>();
  data: any;

  showSortMenu = false;
  activeSub: SubMenuType = null;
  titleControl = new FormControl({ value: '', disabled: false });

  constructor() {
    effect(() => {
      const route = this.routeData?.();
      if (route) {
        this.loadRoutData();
      }
    });
  }

  ngOnInit() {
    this.loadRoutData();

    this.titleControl.valueChanges
      .pipe(debounceTime(500))
      .subscribe((value) => {
        console.log(value);
        if (value !== null) {
          this.updateTitle(value);
        }
      });

    console.log('RouteData:', this.routeData);
  }

  /**toggele */
  togglePanel() {
  this.ui.detailPanelVisible.update(v => !v);
}
  /**load route data */
  loadRoutData() {
    const route = this.routeData?.();
    if (!route) return;

    if (route.entityType === EntityType.FOLDER) {
      this.folderService
        .fetchFolderById(route.id)
        .subscribe((folder) => {
          console.table(folder);
          this.data = folder;
          this.titleControl.setValue(folder.name);
        });
    } else if (route.entityType === EntityType.PROJECT) {
      this.projectService
        .fetchProjectById(route.id)
        .subscribe((project) => {
          console.table(project);
          this.data = project;
          this.titleControl.setValue(project.name);
        });
    } else {
      // For non-editable views (ALL, TODAY, TOMORROW, INBOX, etc.)
      const nameMap: Record<string, string> = {
        [EntityType.ALL]: 'All',
        [EntityType.TODAY]: 'Today',
        [EntityType.TOMORROW]: 'Tomorrow',
        [EntityType.NEXT_SEVEN_DAYS]: 'Next 7 Days',
        [EntityType.INBOX]: 'Inbox',
        [EntityType.ASSIGNED_TO_ME]: 'Assigned to Me',
        [EntityType.SUMMARY]: 'Summary',
        [EntityType.TRASHED]: 'Trash',
      };
      this.data = {
        entityType: route.entityType,
        name: nameMap[route.entityType] ?? route.entityType,
      };
      this.titleControl.setValue(this.data.name);
    }
  }
  /**update title for only project and folder */
  updateTitle(value: string) {
    if (this.data.entityType === EntityType.FOLDER) {
      this.folderService
        .updateFolder(this.data.id, { ...this.data, name: value })
        .subscribe(() => {
          this.folderService.loadAllFolders();
        });
    } else if (this.data.entityType === EntityType.PROJECT) {
      this.projectService
        .updateProject(this.data.id, { ...this.data, name: value })
        .subscribe((updateProject) => {
          this.projectService.loadAllProjects();
        });
    }
  }

  toggleSortMenu(event: MouseEvent): void {
    event.stopPropagation();
    this.showSortMenu = !this.showSortMenu;
    if (!this.showSortMenu) {
      this.activeSub = null;
    }
  }

  openSub(sub: SubMenuType, event: MouseEvent): void {
    event.stopPropagation();
    this.activeSub = this.activeSub === sub ? null : sub;
  }

  setGroupBy(opt: GroupByOption, event: MouseEvent): void {
    event.stopPropagation();
    this.groupBy = opt;
    this.activeSub = null;
    this.sortGroupChange.emit({ groupBy: this.groupBy, sortBy: this.sortBy });
  }

  setSortBy(opt: SortByOption, event: MouseEvent): void {
    event.stopPropagation();
    this.sortBy = opt;
    this.activeSub = null; this.sortGroupChange.emit({ groupBy: this.groupBy, sortBy: this.sortBy });
   
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    if (this.showSortMenu) {
      this.showSortMenu = false;
      this.activeSub = null;
    }
  }
}
