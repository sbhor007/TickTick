import { EntityType } from "../enums/entity-type";
import { TaskPriority } from "../enus/task-priority";
import { TaskStatus } from "../enus/task-status";

export interface Task {
  id: string;
  userId: string | null;
  projectId: string ;
  title: string | null | undefined;
  description: string | null |undefined;
  status: TaskStatus;
  priority: TaskPriority;
  sortOrder?: number;
  isPinned?: boolean;
  parentId?: string | null;
  subtasks?: Task[];
  tags?: any[];
  comments?: any[];
  attachmentId?: string | null;
  entityType: EntityType;
  reminder?: any;
  repeat?: any;
  dueDate: Date | string | null;
  dueDateTime?: string |null;
  createdAt?: Date | string | null;
  updatedAt?: Date | string | null;
  completedAt?: Date | string | null;
}

