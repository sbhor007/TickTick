import { Routes } from '@angular/router';
import { NavigationComponent } from './pages/navigation/navigation.component';
import { ListActionPageComponent } from './pages/tasks/list-action.page/list-action.page.component';
import { TaskListComponent } from './components/context/task-list/task-list.component';
import { ContextPageComponent } from './pages/tasks/context.page/context.page.component';
import { EntityType } from './enums/entity-type';
import { TrashedComponent } from './components/trashed/trashed.component';
import { TaskDetailsComponent } from './components/task-details/task-details.component';
import { SummaryComponent } from './components/summary/summary.component';
import { CalendarViewPageComponent } from './pages/calendar-view.page/calendar-view.page.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'task',
    pathMatch: 'full',
  },
  {
    path: '',
    component: NavigationComponent,
    children: [
      {
        path: 'task',
        component: ListActionPageComponent,
        children: [
         
          {
            path: 'folder/:id',
            component: ContextPageComponent,
            data: { entityType: EntityType.FOLDER },
          },
          {
            path: 'project/:id',
            component: ContextPageComponent,
            data: { entityType: EntityType.PROJECT },
          },
          {
            path: 'ALL/:id',
            component: ContextPageComponent,
            data: { entityType: EntityType.ALL },
          },
          {
            path: 'TODAY/:id',
            component: ContextPageComponent,
            data: { entityType: EntityType.TODAY },
          },
          {
            path: 'INBOX/:id',
            component: ContextPageComponent,
            data: { entityType: EntityType.INBOX },
          },
          {
            path: 'TOMORROW/:id',
            component: ContextPageComponent,
            data: { entityType: EntityType.TOMORROW },
          },
          {
            path: 'NEXT_SEVEN_DAYS/:id',
            component: ContextPageComponent,
            data: { entityType: EntityType.NEXT_SEVEN_DAYS },
          },
          {
            path: 'completed/:id',
            component: ContextPageComponent,
            data: { entityType: EntityType.COMPLETED },
          },
          {
            path: 'tags/:id',
            component: ContextPageComponent,
            data: { entityType: EntityType.TAG_VIEW },
          },
          {
            path: 'SUMMARY/:id',
            component: SummaryComponent,
          },
          {
            path: 'trashed',
            component: TrashedComponent,
            data: { entityType: EntityType.TRASHED },
            children: [
              {
                path: ':entityType/:id',
                component: TaskDetailsComponent,
              },
            ],
          },
        ],
      },
      {
      path: 'calenderView',
      component: CalendarViewPageComponent
      },
      {
        path:'dashboardView',
        component:DashboardComponent
      },
    ],
  },

];
