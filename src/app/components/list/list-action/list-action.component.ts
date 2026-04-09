import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ListComponent } from "../list/list.component";
import { PinnedComponent } from "../pinned/pinned.component";

@Component({
  selector: 'app-list-action',
  imports: [RouterLink, ListComponent, PinnedComponent],
  templateUrl: './list-action.component.html'
})
export class ListActionComponent {

}
