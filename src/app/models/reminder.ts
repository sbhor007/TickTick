import { EntityType } from "../enums/entity-type";

export interface Reminder {
    id: string;            
  taskId: string;        
  type: string;  
  reminderDate: string | null;
  customDate?: string;
  isActive: boolean;     
  lastTriggeredAt: string | null; 
  createdAt: string;     
}
