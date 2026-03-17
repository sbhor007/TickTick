import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SplitterModule } from 'primeng/splitter';

@Component({
  selector: 'app-task-list.page',
  imports: [RouterOutlet,SplitterModule],
  templateUrl: './task-list.page.component.html',
  styles: ``
})
export class TaskListPageComponent {

}
