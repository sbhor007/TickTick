import { List } from './list';

export interface Folder {
  id: string;
  name: string;
  list?: List[];
  createdAt: Date;
  updatedAt?: Date;
}
