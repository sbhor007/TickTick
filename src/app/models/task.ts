import { Time } from "@angular/common";
import { SubTask } from "./sub-task";
import { Comment } from "./comment";

export interface Task {
    id:string,
    title:string,
    description:string,
    dueDate:Date,
    dueDateTime:Time,
    status:string
    subTask:SubTask[]
    comments:Comment[]
    createdAt:Date
}
