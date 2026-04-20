import { EntityType } from "../enums/entity-type";

export interface Repeat {
     id: string;
  taskId: string;
  type: EntityType;
  custom?: string | null;
  createdAt?: Date | string | null;
  updatedAt?: Date | string | null;
}
