import { Component, computed, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SplitterModule } from 'primeng/splitter';
import { ListActionComponent } from '../../../components/list/list-action/list-action.component';
import { FolderService } from '../../../services/folder.service';
import { ProjectService } from '../../../services/project.service';
import { FolderProjectService } from '../../../services/folder-project.service';
import { ContextMenuBarService } from '../../../config/context-menu-bar.service';
import { UiStateService } from '../../../services/ui-state.service';

@Component({
  selector: 'app-list-action.page',
  imports: [RouterOutlet,SplitterModule,ListActionComponent],
  templateUrl: './list-action.page.component.html'
})
export class ListActionPageComponent  {
  ui = inject(UiStateService);
  splitterSizes = computed(() =>
  this.ui.detailPanelVisible() ? [25, 75] : [0, 100]
);

// force p-splitter DOM update
splitterKey = computed(() =>
  this.ui.detailPanelVisible() ? 'show' : 'hide'
);

panelSizes = computed(() =>
  this.ui.detailPanelVisible() ? [25, 75] : [0, 100]
);


}
