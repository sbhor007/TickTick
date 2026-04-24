import { Component, inject, OnInit } from '@angular/core';
import { RouterLink, RouterOutlet } from "@angular/router";
import { TaskService } from '../../services/task.service';

export interface NavItem {
  name: string;
  iconName: string;
  path: string;
}

@Component({
  selector: 'app-navigation',
  imports: [RouterLink, RouterOutlet],
  templateUrl: './navigation.component.html'
})
export class NavigationComponent implements OnInit {
  private taskService = inject(TaskService)

  constructor(){
    this.taskService.loadAllTasks()
  }

  ngOnInit(): void {
    this.taskService.loadAllTasks()
  }

   navItems: Partial<NavItem[]> = [
  {
    name: 'Dashboard',
    iconName: "pi pi-user",
    path: 'dashboardView'        
  },
  {
    name: 'Tasks',
    iconName: 'pi pi-check-square',
    path: 'task'            
  },
  {
    name: 'Calendar',
    iconName: 'pi pi-calendar',
    path: 'calenderView'
  },
  {
    name: 'Search',
    iconName: 'pi pi-search',
    path: 'coming-soon'
  }
]

}
