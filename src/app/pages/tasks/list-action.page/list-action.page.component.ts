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

 uiState = inject(UiStateService);

  // Dynamically adjust panel sizes based on collapsed state
  panelSizes = computed(() =>
    this.uiState.isListPanelCollapsed() ? [0, 100] : [25, 75]
  );

  minSizes = computed(() =>
    this.uiState.isListPanelCollapsed() ? [0, 100] : [15, 50]
  );

   cardClass = computed(() =>
    this.uiState.isListPanelCollapsed()
      ? 'card h-screen w-screen'
      : 'card h-screen w-full'
  );


}
