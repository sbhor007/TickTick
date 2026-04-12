import { EntityType } from "../enums/entity-type";
import { Task } from "./task";

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
  tasks: Task[];
}
