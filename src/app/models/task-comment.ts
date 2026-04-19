import { EntityType } from '../enums/entity-type';
import { Attachment } from './attachment';

export interface TaskComment {
  id: string;
  name: string;
  attachmentId: string | null;
  userId: string | null;
  taskId: string | null;
  entityType: EntityType;
  updatedAt: Date | string ;
  completedAt?: Date | string ;
  attachment?:Attachment |null
}
