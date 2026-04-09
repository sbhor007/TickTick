import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ListComponent } from "../list/list.component";
import { PinnedComponent } from "../pinned/pinned.component";
import { SmartViewComponent } from "../smart-view/smart-view.component";
import { TagsComponent } from "../tags/tags.component";

@Component({
  selector: 'app-list-action',
  imports: [RouterLink, ListComponent, PinnedComponent, SmartViewComponent, TagsComponent],
  templateUrl: './list-action.component.html'
})
export class ListActionComponent {

}
