import { Routes } from '@angular/router';
import { NavigationComponent } from './pages/navigation/navigation.component';
import { ListActionPageComponent } from './pages/tasks/list-action.page/list-action.page.component';
import { TaskListComponent } from './components/context/task-list/task-list.component';
import { ContextPageComponent } from './pages/tasks/context.page/context.page.component';
import { EntityType } from './enums/entity-type';

export const routes: Routes = [
  {
    path: '',
    component: NavigationComponent,
    children: [
      {
        path: 'task',
        component: ListActionPageComponent,
        children: [
          {
            path: 'folder/tasks/:id',
            component:ContextPageComponent,
            data: { entityType: EntityType.FOLDER }
          },
          {
            path: 'project/tasks/:id',
            component:ContextPageComponent,
            data: { entityType: EntityType.PROJECT }
          }
        ]
      },
    ],
  },
];
