import { Injectable } from '@angular/core';
import { EntityType } from '../enums/entity-type';
import { ContextMenuItem } from '../models/context-menu-item';

@Injectable({
  providedIn: 'root'
})
export class ContextMenuBarService {

  constructor() { }

  readonly CONTEXT_MENU_MAP: Record<EntityType, ContextMenuItem[]> = {
    [EntityType.PROJECT]: [
      { label: 'Edit', icon: 'pi pi-pencil', action: 'edit',},
      { label: 'Duplicate', icon: 'content_copy', action: 'duplicate' },
      { label: 'Share', icon: 'share', action: 'share' },
      // { label: 'Archive', icon: 'archive', action: 'archive' },
      { label: '', icon: '', action: 'divider', isDivider: true },
      { label: 'Delete', icon: 'delete', action: 'delete', isDanger: true },
    ],

    [EntityType.FOLDER]: [
      { label: 'Add List', icon: 'list', action: 'addList' },
      { label: 'Edit', icon: 'edit', action: 'edit' },
      { label: 'Ungroup', icon: 'group_off', action: 'ungroup' },
    ],
    [EntityType.ALL]: [
      { label: 'Hide', icon: 'visibility_off', action: 'hide' },
      { label: 'Show', icon: 'visibility', action: 'show' },
    ],

    [EntityType.TODAY]: [
      { label: 'Show', icon: 'visibility', action: 'show' },
      {
        label: 'Show if Not empty',
        icon: 'visibility',
        action: 'showIfNotEmpty',
      },
      { label: 'Hide', icon: 'visibility_off', action: 'hide' },
    ],

    [EntityType.TOMORROW]: [
      { label: 'Show', icon: 'visibility', action: 'show' },
      {
        label: 'Show if Not empty',
        icon: 'visibility',
        action: 'showIfNotEmpty',
      },
      { label: 'Hide', icon: 'visibility_off', action: 'hide' },
    ],

    [EntityType.NEXT_SEVEN_DAYS]: [
      { label: 'Show', icon: 'visibility', action: 'show' },
      {
        label: 'Show if Not empty',
        icon: 'visibility',
        action: 'showIfNotEmpty',
      },
      { label: 'Hide', icon: 'visibility_off', action: 'hide' },
    ],

    [EntityType.ASSIGNED_TO_ME]: [
      { label: 'Show', icon: 'visibility', action: 'show' },
      {
        label: 'Show if Not empty',
        icon: 'visibility',
        action: 'showIfNotEmpty',
      },
      { label: 'Hide', icon: 'visibility_off', action: 'hide' },
    ],

    [EntityType.INBOX]: [
      { label: 'Edit', icon: 'edit', action: 'edit' },
      { label: 'Show', icon: 'visibility', action: 'show' },
      {
        label: 'Show if Not empty',
        icon: 'visibility',
        action: 'showIfNotEmpty',
      },
      { label: 'Hide', icon: 'visibility_off', action: 'hide' },
    ],

    [EntityType.SUMMARY]: [
      { label: 'Show', icon: 'visibility', action: 'show' },
      { label: 'Hide', icon: 'visibility_off', action: 'hide' },
    ],
    [EntityType.TAG]:[]
  }

  getContextMenu(
  type: EntityType,
  isPinned: boolean = false,
  isArchived: boolean = false
): ContextMenuItem[] {
  const menu = [...(this.CONTEXT_MENU_MAP[type] || [])];

  const insertAfterEdit = (item: ContextMenuItem) => {
    const editIndex = menu.findIndex(i => i.action === 'edit');
    if (editIndex !== -1) {
      menu.splice(editIndex + 1, 0, item);
    } else {
      menu.unshift(item);
    }
  };

  // ✅ Pin / Unpin
  if ([EntityType.PROJECT, EntityType.FOLDER].includes(type)) {
    const pinItem: ContextMenuItem = isPinned
      ? { label: 'Unpin', icon: 'push_pin_off', action: 'unpin' }
      : { label: 'Pin', icon: 'push_pin', action: 'pin' };

    insertAfterEdit(pinItem);
  }

  // ✅ Archive / Unarchive (ONLY for PROJECT)
  if (type === EntityType.PROJECT) {
    const archiveItem: ContextMenuItem = isArchived
      ? { label: 'Unarchive', icon: 'unarchive', action: 'unarchive' }
      : { label: 'Archive', icon: 'archive', action: 'archive' };

    insertAfterEdit(archiveItem);
  }

  return menu;
}

}
