import { EntityType } from '../enums/entity-type';

export interface Repeat {
  id: string;
  taskId: string;
  type: string;
  repeatDate: string | null;
  nextOccurrence: string | null;
  lastOccurrence: string | null;
  isActive: boolean;
  createdAt: string;
}
