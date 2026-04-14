import { Component, OnInit, signal } from '@angular/core';
import { Splitter } from "primeng/splitter";
import { TaskListComponent } from "../context/task-list/task-list.component";
import { RouterOutlet } from '@angular/router';
import { EntityType } from '../../enums/entity-type';

@Component({
  selector: 'app-trashed',
  imports: [Splitter, TaskListComponent, RouterOutlet],
  templateUrl: './trashed.component.html',
  styles: ``
})
export class TrashedComponent implements OnInit {

  routeData = signal({id:null,entityType:EntityType.TRASHED})

  ngOnInit(): void {
    
  }

}
