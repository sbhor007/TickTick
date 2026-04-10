import { EntityType } from '../enums/entity-type';

export interface Tag {
  id: string;
  parentId?: string | null;
  name: string;
  color: string;
  entityType: EntityType;
  childTag: Tag[];
  createdAt: string;
  updatedAt: string;
  isPinned: boolean;
  count?: number;
}
