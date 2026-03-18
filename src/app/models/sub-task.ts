import { Comment } from "./comment";

export interface SubTask {
    id:string,
    title:string,
    subtasks:SubTask[],
    comment:Comment[]
}
