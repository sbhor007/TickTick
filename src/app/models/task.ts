import { Time } from '@angular/common';
import { SubTask } from './sub-task';
import { Comment } from './comment';
import { TaskStatus } from '../enums/task-status';

export interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: Date;
  dueDateTime: Time;
  status: TaskStatus;
  subTask: SubTask[];
  comments: Comment[];
  createdAt: Date;
}
