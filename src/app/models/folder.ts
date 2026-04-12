import { Project } from "./project";

export interface Folder {
  id: string;
  userId: string | null;
  name: string;
  isPinned: boolean;
  entityType: string;
  projects: Project[];
  createdAt: string;
  updatedAt: string;
}
