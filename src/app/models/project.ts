import { EntityType } from "../enums/entity-type";

export interface Project {
  id: string;
  name: string;
  color: string;
  viewType: string;
  folderId: string | null;
  listType: string;
  smartList: string;
  entityType: EntityType;
  createdAt: string;
  updatedAt: string;
  isPinned: boolean;
  isArchived: boolean;
  isSmartView: boolean;
  icon: string;
  tasks: any[];
}
