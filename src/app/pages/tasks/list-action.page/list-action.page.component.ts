import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SplitterModule } from 'primeng/splitter';
import { ListActionComponent } from '../../../components/list/list-action/list-action.component';
import { FolderService } from '../../../services/folder.service';
import { ProjectService } from '../../../services/project.service';
import { FolderProjectService } from '../../../services/folder-project.service';
import { ContextMenuBarService } from '../../../config/context-menu-bar.service';

@Component({
  selector: 'app-list-action.page',
  imports: [RouterOutlet,SplitterModule,ListActionComponent],
  templateUrl: './list-action.page.component.html'
})
export class ListActionPageComponent  {
  // private folderService = inject(FolderService);
  // private projectService = inject(ProjectService);
  // private folderWithProjectService = inject(FolderProjectService);
  // private contextMenuService = inject(ContextMenuBarService);

  // ngOnInit(): void {
    
  // }

}
