import { Color } from '../enums/color';
import { ListType } from '../enums/list-type';
import { SmartList } from '../enums/smart-list';
import { ViewType } from '../enums/view-type';
import { Folder } from './folder';
import { Section } from './section';

export interface List {
  id: string;
  title: string;
  color: Color;
  viewType: ViewType;
  folders: Folder[];
  listType: ListType;
  smartList: SmartList;
  sections: Section[];
}
