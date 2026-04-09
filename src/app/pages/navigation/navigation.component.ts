import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from "@angular/router";

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
export class NavigationComponent {

   navItems: Partial<NavItem[]> = [
  {
    name: 'Dashboard',
    iconName: "pi pi-user",
    path: 'coming-soon'        
  },
  {
    name: 'Tasks',
    iconName: 'pi pi-check-square',
    path: 'task'            
  },
  {
    name: 'Calendar',
    iconName: 'pi pi-calendar',
    path: 'coming-soon'
  },
  {
    name: 'Search',
    iconName: 'pi pi-search',
    path: 'coming-soon'
  }
]

}
