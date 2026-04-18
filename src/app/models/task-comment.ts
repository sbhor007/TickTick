import { EntityType } from '../enums/entity-type';

export interface TaskComment {
  id: string;
  name: string;
  attachmentId: string | null;
  userId: string | null;
  taskId: string | null;
  entityType: EntityType;
  updatedAt: Date | string ;
  completedAt?: Date | string ;
  attachmentURL?:any
}
