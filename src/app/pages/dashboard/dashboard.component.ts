import { Component, signal } from '@angular/core';
import { TaskListComponent } from "../../components/context/task-list/task-list.component";
import { EntityType } from '../../enums/entity-type';

@Component({
  selector: 'app-dashboard',
  imports: [TaskListComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
   completedTasks = signal({id:null,entityType:EntityType.COMPLETED})
   pendingTasks = signal({id:null,entityType:EntityType.PENDING})
}
