import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ListActionComponent } from '../../../components/list-action/list-action.component';
import { SplitterModule } from 'primeng/splitter';

@Component({
  selector: 'app-list-action.page',
  imports: [RouterOutlet,ListActionComponent,SplitterModule],
  templateUrl: './list-action.page.component.html',
  styles: ``
})
export class ListActionPageComponent {

}
