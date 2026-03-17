import { Routes } from '@angular/router';
import { NavigationComponent } from './pages/navigation/navigation.component';
import { ComingSoonComponent } from './pages/coming-soon/coming-soon.component';
import { ListActionPageComponent } from './pages/tasks/list-action.page/list-action.page.component';
import { TaskListPageComponent } from './pages/tasks/task-list.page/task-list.page.component';
import { TaskDetailPageComponent } from './pages/tasks/task-detail.page/task-detail.page.component';

export const routes: Routes = [
  {
    path: '',
    component: NavigationComponent,
    children: [
      {
        path: '',
        component: ListActionPageComponent,
        children: [
          {
            path: '',
            component: TaskListPageComponent,
            children: [
              {
                path: '',
                component: TaskDetailPageComponent,
              },
            ],
          },
        ],
      },
      {
        path: 'coming-soon',
        component: ComingSoonComponent,
      },
    ],
  },
];
