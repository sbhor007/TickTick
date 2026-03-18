import { Folder } from "./folder";
import { Section } from "./section";

export interface List {
    id:string,
    title:string,
    color:string,
    viewType:string,
    folders:Folder[],
    listType:string,
    smartList:string,
    sections:Section[]
}
