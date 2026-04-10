import {
  Component,
  HostListener,
  inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import { TagInputComponent } from '../../../share/tag-input/tag-input.component';
import { TagsService } from '../../../config/tags.service';
import { Tag } from '../../../models/tag';
import { MenuItem } from 'primeng/api';
import { Menu } from 'primeng/menu';
import { EntityType } from '../../../enums/entity-type';
import { ContextMenuBarService } from '../../../config/context-menu-bar.service';
import { ActivatedRoute } from '@angular/router';
interface TreeNode {
  label: string;
  icon: string;
  level: number;
  expandable: boolean;
}

@Component({
  selector: 'app-tags',
  imports: [TagInputComponent, Menu],
  templateUrl: './tags.component.html',
})
export class TagsComponent implements OnInit {
  private contextMenuService = inject(ContextMenuBarService);
  private tagsService = inject(TagsService);

  isExpanded = true;
  isTagInputOpen = false;
  mode: 'create' | 'update' | 'create_subtag' | 'update_subtag' = 'create';
  selectedTag: any = null;

  // ✅ tracks which tag rows are expanded
  expandedTags = new Set<string>();

  tags = this.tagsService.allTags$;
  /**Context menu*/
  @ViewChild('contextMenuOptions') contextMenuOptions!: Menu;
  contextMenu: MenuItem[] = [];

  constructor() {}

  ngOnInit(): void {
    this.tagsService.loadAllTags();
  }

  toggleExpand(): void {
    this.isExpanded = !this.isExpanded;
  }

  isTagExpanded(tagId: string): boolean {
    return this.expandedTags.has(tagId);
  }

  toggleExpandTag(tagId: string): void {
    if (this.expandedTags.has(tagId)) {
      this.expandedTags.delete(tagId);
    } else {
      this.expandedTags.add(tagId);
    }
  }

  hasChildren(tag: Tag): boolean {
    return Array.isArray(tag.childTag) && tag.childTag.length > 0;
  }

  // ── dialog ────────────────────────────────────────────────
  openCreateDialog(): void {
    this.mode = 'create';
    this.selectedTag = null;
    this.isTagInputOpen = true;
  }

  closeDialog(): void {
    this.isTagInputOpen = false;
    this.selectedTag = null;
  }

  @HostListener('document:keydown.escape')
  handleEsc() {
    this.closeDialog();
  }

  // @HostListener('document:click')
  // onDocumentClick(): void {
  //   this.closeDialog()
  // }

  openContextMenu(event: any, tag: any) {
    event.stopPropagation();
    event.preventDefault();
    const context = this.contextMenuService.getContextMenu(
      tag.entityType,
      tag.isPinned,
    );

    this.contextMenu = context.map((item): MenuItem => {
      if (item.isDivider) return { separator: true };
      return {
        ...item,
        command: () => this.handleAction(tag, item.action, event),
      };
    });

    this.contextMenuOptions.toggle(event);
  }

  /**Handle context menu actions */
  handleAction(tag: any, action: string, event: any) {
    console.log('actions event for tags : ', event);

    if (tag.entityType === EntityType.TAG) {
      // handle tags context menu actions
      switch (action) {
        case 'edit':
          this.mode = 'update';
          this.selectedTag = tag;
          this.isTagInputOpen = true;
          break;
        case 'createSubTag':
          this.mode = 'create_subtag';
          this.selectedTag = tag;
          this.isTagInputOpen = true;
          break;
        case 'pin':
          this.updateTag({ ...tag, isPinned: !tag.isPinned });
          console.log('Tag Pinned....');
          break;
        case 'unpin':
          this.updateTag({ ...tag, isPinned: !tag.isPinned });
          console.log('Tag unpinned....');
          break;
        case 'mergeTags':
          //TODO:han
          break;
        case 'moveToSharedTags':
          break;
        case 'delete':
          this.tagsService.deleteTag(tag.id);
          break;
      }
    } else if (tag.entityType === EntityType.CHILD_TAG) {
      // handle child tags menu actions
      switch (action) {
        case 'edit':
        case 'edit':
          this.mode = 'update';
          this.isTagInputOpen = true;
          break;
        case 'pin':
          this.updateTag({ ...tag, isPinned: !tag.isPinned });
          console.log('Tag Pinned....');

          break;
        case 'mergeTags':
          //TODO:han
          break;
        case 'moveToSharedTags':
          break;
        case 'delete':
          break;
      }
    }
  }
  /**input event handler */
  inputTagsEventHandler(event: any) {
    console.log('Input handler Event : ', event);

    if (event.action == 'close') {
      this.closeDialog();
      return;
    }
    switch (event.action) {
      case 'create':
        this.tagsService.createTags(event.payload);
        this.closeDialog();
        break;
      case 'update':
        console.log('Update Event', event);
        this.updateTag(event.payload);
        this.closeDialog();
        break;
      case 'create_subtag':
        this.tagsService.createTags(event.payload);
        this.closeDialog();
        break;
    }
  }

  /**tags operation */
  updateTag(payload: Tag) {
    this.tagsService.updateTag(payload.id, payload);
  }
}
