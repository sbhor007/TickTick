import { Routes } from '@angular/router';
import { NavigationComponent } from './pages/navigation/navigation.component';
import { ListActionPageComponent } from './pages/tasks/list-action.page/list-action.page.component';

export const routes: Routes = [
  {
    path: '',
    component: NavigationComponent,
    children: [
      {
        path: 'task',
        component: ListActionPageComponent,
      },
    ],
  },
];
