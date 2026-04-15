import { Injectable } from '@angular/core';
import { EntityType } from '../enums/entity-type';
import { ContextMenuItem } from '../models/context-menu-item';

@Injectable({
  providedIn: 'root',
})
export class ContextMenuBarService {
  constructor() {}

  readonly CONTEXT_MENU_MAP: Record<EntityType, ContextMenuItem[]> = {
    [EntityType.PROJECT]: [
      { label: 'Edit', icon: 'pi pi-pencil', action: 'edit' },
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
    [EntityType.TAG]: [
      { label: 'Edit', icon: '', action: 'edit' },
      // { label: 'Pin', icon: 'pi pi-pin', action: 'pin' },
      { label: 'Merge Tags', icon: '', action: 'mergeTags' },
      { label: 'Create Sub Tag', icon: '', action: 'createSubTag' },
      { label: '', icon: '', action: 'divider', isDivider: true },
      {
        label: 'Delete',
        icon: '',
        action: 'delete',
        isDanger: true,
      },
    ],
    [EntityType.CHILD_TAG]: [
      { label: 'Edit', icon: '', action: 'edit' },
      // { label: 'Pin', icon: 'pin', action: 'pin' },
      { label: 'Merge Tags', icon: '', action: 'mergeTags' },

      { label: '', icon: '', action: 'divider', isDivider: true },
      { label: 'Delete', icon: '', action: 'delete' },
    ],
    [EntityType.TASK]: [
      {
        label: 'Date',
        icon: '',
        isSectionHeader: true,
        action: 'date_section',
        renderType: 'icon-grid',
        items: [
          { label: 'Today', icon: 'pi pi-sun', action: 'set_date_today' },
          {
            label: 'Tomorrow',
            icon: 'pi pi-cloud-sun',
            action: 'set_date_tomorrow',
          },
          {
            label: 'Next Week',
            icon: 'pi pi-calendar',
            action: 'set_date_next_week',
          },
          {
            label: 'Custom',
            icon: 'pi pi-calendar-clock',
            action: 'set_date_custom',
          },
        ],
      },
      {
        label: 'Priority',
        icon: '',
        isSectionHeader: true,
        action: 'priority_section',
        renderType: 'icon-grid',
        items: [
          {
            label: 'High',
            icon: 'pi pi-flag-fill',
            action: 'set_priority_high',
            color: '#ef4444',
          },
          {
            label: 'Medium',
            icon: 'pi pi-flag-fill',
            action: 'set_priority_medium',
            color: '#eab308',
          },
          {
            label: 'Low',
            icon: 'pi pi-flag-fill',
            action: 'set_priority_low',
            color: '#3b82f6',
          },
          {
            label: 'None',
            icon: 'pi pi-flag-fill',
            action: 'set_priority_none',
            color: '#6b7280',
          },
        ],
      },
      { label: '', icon: '', action: 'divider', isDivider: true },

      { label: 'Add Subtask', icon: 'add_task', action: 'add_subtask' },
      {
        label: 'Link Parent Task',
        icon: 'account_tree',
        action: 'link_parent',
      },
      // { label: 'Pin', icon: 'push_pin', action: 'pin' },
      { label: "Won't Do", icon: 'block', action: 'wont_do' },
      {
        label: 'Move to',
        icon: 'folder_open',
        action: 'move_to',
        hasSubmenu: true,
      },
      { label: 'Tags', icon: 'label', action: 'add_tags_to_task' },

      { label: '', icon: '', action: 'divider', isDivider: true },

      { label: 'Duplicate', icon: 'content_copy', action: 'duplicate' },
      { label: 'Copy Link', icon: 'link', action: 'copy_link' },
      { label: 'Convert to Note', icon: 'note_alt', action: 'convert_to_note' },

      { label: '', icon: '', action: 'divider', isDivider: true },

      { label: 'Delete', icon: 'delete', action: 'delete', isDanger: true },
    ],
    [EntityType.SUBTASK]: [
      {
        label: 'Date',
        icon: '',
        isSectionHeader: true,
        action: 'date_section',
        renderType: 'icon-grid',
        items: [
          { label: 'Today', icon: 'pi pi-sun', action: 'set_date_today' },
          {
            label: 'Tomorrow',
            icon: 'pi pi-cloud-sun',
            action: 'set_date_tomorrow',
          },
          {
            label: 'Next Week',
            icon: 'pi pi-calendar',
            action: 'set_date_next_week',
          },
          {
            label: 'Custom',
            icon: 'pi pi-calendar-clock',
            action: 'set_date_custom',
          },
        ],
      },
      {
        label: 'Priority',
        icon: '',
        isSectionHeader: true,
        action: 'priority_section',
        renderType: 'icon-grid',
        items: [
          {
            label: 'High',
            icon: 'pi pi-flag-fill',
            action: 'set_priority_high',
            color: '#ef4444',
          },
          {
            label: 'Medium',
            icon: 'pi pi-flag-fill',
            action: 'set_priority_medium',
            color: '#eab308',
          },
          {
            label: 'Low',
            icon: 'pi pi-flag-fill',
            action: 'set_priority_low',
            color: '#3b82f6',
          },
          {
            label: 'None',
            icon: 'pi pi-flag-fill',
            action: 'set_priority_none',
            color: '#6b7280',
          },
        ],
      },
      { label: '', icon: '', action: 'divider', isDivider: true },

      // { label: 'Add Subtask', icon: 'add_task', action: 'add_subtask' },
      {
        label: 'Link Parent Task',
        icon: 'account_tree',
        action: 'link_parent',
      },
      // { label: 'Pin', icon: 'push_pin', action: 'pin' },
      { label: "Won't Do", icon: 'block', action: 'wont_do' },
      {
        label: 'Move to',
        icon: 'folder_open',
        action: 'move_to',
        hasSubmenu: true,
      },
      { label: 'Tags', icon: 'label', action: 'manage_tags' },

      { label: '', icon: '', action: 'divider', isDivider: true },

      { label: 'Duplicate', icon: 'content_copy', action: 'duplicate' },
      { label: 'Copy Link', icon: 'link', action: 'copy_link' },
      { label: 'Convert to Note', icon: 'note_alt', action: 'convert_to_note' },

      { label: '', icon: '', action: 'divider', isDivider: true },

      { label: 'Delete', icon: 'delete', action: 'delete', isDanger: true },
    ],
    [EntityType.TRASHED]: [
      { label: 'Restore', icon: 'pi pi-replay', action: 'restore' },
      // { label: 'Pin', icon: 'pin', action: 'pin' },
      {
        label: 'Delete forever',
        icon: 'pi pi-trash',
        action: 'delete_forever',
      },
    ],
    [EntityType.TASK_INPUT]: [
      {
        label: 'Priority',
        icon: '',
        isSectionHeader: true,
        action: 'priority_section',
        renderType: 'icon-grid',
        items: [
          {
            label: 'High',
            icon: 'pi pi-flag-fill',
            action: 'set_priority_high',
            color: '#ef4444',
          },
          {
            label: 'Medium',
            icon: 'pi pi-flag-fill',
            action: 'set_priority_medium',
            color: '#eab308',
          },
          {
            label: 'Low',
            icon: 'pi pi-flag-fill',
            action: 'set_priority_low',
            color: '#3b82f6',
          },
          {
            label: 'None',
            icon: 'pi pi-flag-fill',
            action: 'set_priority_none',
            color: '#6b7280',
          },
        ],
      },
      {
        label: 'Move to',
        icon: 'folder_open',
        action: 'move_to',
        hasSubmenu: true,
      },
      { label: 'Tags', icon: 'label', action: 'manage_tags' },
      { label: 'Attachment', icon: 'label', action: 'attachment' },
      {
        label: 'Add From Template',
        icon: 'label',
        action: 'add_from_template',
      },
      { label: '', icon: '', action: 'divider', isDivider: true },

      { label: 'Input Box Setting', icon: '', action: 'input_box_setting' },
    ],
    [EntityType.PRIORITY]: [
      {
        label: 'High',
        icon: 'pi pi-flag-fill',
        action: 'set_priority_high',
        color: '#ef4444',
      },
      {
        label: 'Medium',
        icon: 'pi pi-flag-fill',
        action: 'set_priority_medium',
        color: '#eab308',
      },
      {
        label: 'Low',
        icon: 'pi pi-flag-fill',
        action: 'set_priority_low',
        color: '#3b82f6',
      },
      {
        label: 'None',
        icon: 'pi pi-flag-fill',
        action: 'set_priority_none',
        color: '#6b7280',
      },
    ],
  };
  getContextMenu(
    type: EntityType,
    isPinned: boolean = false,
    isArchived: boolean = false,
    isShared: boolean = false,
  ): ContextMenuItem[] {
    const menu = [...(this.CONTEXT_MENU_MAP[type] || [])];

    const insertAfterEdit = (item: ContextMenuItem) => {
      const editIndex = menu.findIndex((i) => i.action === 'edit');
      if (editIndex !== -1) {
        menu.splice(editIndex + 1, 0, item);
      } else {
        menu.unshift(item);
      }
    };

    // ✅ Pin / Unpin
    if (
      [
        EntityType.PROJECT,
        EntityType.FOLDER,
        EntityType.TAG,
        EntityType.CHILD_TAG,
        EntityType.TASK,
        EntityType.SUBTASK,
      ].includes(type)
    ) {
      const pinItem: ContextMenuItem = isPinned
        ? { label: 'Unpin', icon: 'push_pin', action: 'unpin' }
        : { label: 'Pin', icon: 'push_pin', action: 'pin' };

      insertAfterEdit(pinItem);
    }

    //share and unshare tag
    if ([EntityType.TAG, EntityType.CHILD_TAG].includes(type)) {
      const sharedItem: ContextMenuItem = isShared
        ? {
            label: 'Move to Personal Tags',
            icon: '',
            action: 'shareUnshareTag',
          }
        : { label: 'Move to Shared Tags', icon: '', action: 'shareUnshareTag' };
      insertAfterEdit(sharedItem);
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
