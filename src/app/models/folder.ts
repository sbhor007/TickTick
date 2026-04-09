export interface Folder {
  id: string;
  userId: string | null;
  name: string;
  isPinned: boolean;
  entityType: string;
  projects: any[];
  createdAt: string;
  updatedAt: string;
}
