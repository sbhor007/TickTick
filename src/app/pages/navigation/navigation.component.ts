import { Component } from '@angular/core';
import { NavItem } from '../../models/nav-item';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-navigation',
  imports: [RouterOutlet, RouterLinkActive,RouterLink],
  templateUrl: './navigation.component.html',
  styles: ``
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
    path: ''            
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
