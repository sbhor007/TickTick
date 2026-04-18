import {
  Component,
  computed,
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
import { DialogModule } from 'primeng/dialog';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
interface TreeNode {
  label: string;
  icon: string;
  level: number;
  expandable: boolean;
}

@Component({
  selector: 'app-tags',
  imports: [
    TagInputComponent,
    Menu,
    CommonModule,
    FormsModule,
    DialogModule,
    RouterLink,
  ],
  templateUrl: './tags.component.html',
})
export class TagsComponent implements OnInit {
  private contextMenuService = inject(ContextMenuBarService);
  private tagsService = inject(TagsService);

  isExpanded = true;

  isSharedExpanded = true;

  isTagInputOpen = false;
  mode: 'create' | 'update' | 'create_subtag' | 'update_subtag' = 'create';
  selectedTag: any = null;

  // ✅ tracks which tag rows are expanded
  expandedTags = new Set<string>();

  tags = computed(() => this.tagsService.allTags$());

  notSharedTags = computed(() =>
    this.tagsService.allTags$().filter((t) => !t.isShared),
  );

  sharedTags = computed(() =>
    this.tagsService.allTags$().filter((t) => t.isShared),
  );
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
      false,
      tag.isShared,
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
    // $&('actions event for tags : ', event);

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
          // $&('Tag Pinned....');
          break;
        case 'unpin':
          this.updateTag({ ...tag, isPinned: !tag.isPinned });
          // $&('Tag unpinned....');
          break;

        case 'mergeTags':
          this.isVisibleConfirmPopup = true;
          this.selectedTag = tag;
          break;
        case 'shareUnshareTag':
          this.updateTag({ ...tag, isShared: !tag.isShared });
          // $&('Tag Share to....');
          break;
        case 'delete':
          this.tagsService.deleteTag(tag.id);
          break;
      }
    } else if (tag.entityType === EntityType.CHILD_TAG) {
      // handle child tags menu actions
      switch (action) {
        case 'edit':
          this.mode = 'update_subtag';
          this.selectedTag = tag;
          this.isTagInputOpen = true;

          break;
        case 'pin':
          this.selectedTag = tag;
          if (this.selectedTag?.parentId != null) {
            // $&("----------------");

            this.tagsService.updateSubTag(
              this.selectedTag.parentId,
              this.selectedTag.id,
              { ...this.selectedTag, isPinned: !this.selectedTag.isPinned },
            );
            // $&('Tag Pinned....');
            this.selectedTag = null;
          }
          break;
        case 'unpin':
          this.selectedTag = tag;
          if (this.selectedTag?.parentId != null) {
            // $&("----------------");

            this.tagsService.updateSubTag(
              this.selectedTag.parentId,
              this.selectedTag.id,
              { ...this.selectedTag, isPinned: !this.selectedTag.isPinned },
            );
            // $&('Tag Pinned....');
            this.selectedTag = null;
          }
          break;
        case 'mergeTags':
          //TODO:han
          break;
        case 'moveToSharedTags':
          break;
        case 'delete':
          this.selectedTag = tag;
          this.tagsService.deleteSubTag(
            this.selectedTag.parentId,
            this.selectedTag.id,
          );
          this.selectedTag = null;
          break;
      }
    }
  }
  /**input event handler */
  inputTagsEventHandler(event: any) {
    // $&('Input handler Event : ', event);

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
        // $&('Update Event', event);
        this.updateTag(event.payload);
        this.closeDialog();
        break;
      case 'create_subtag':
        this.tagsService.createTags(event.payload);
        this.closeDialog();
        break;
      case 'update_subtag':
        // $&(this.selectedTag);
        this.updateSubTag(
          event.payload,
          this.selectedTag.parentId,
          this.selectedTag.id,
        );
        this.selectedTag = null;
        this.isTagInputOpen = false;
        break;
    }
  }

  /**tags operation */
  updateTag(payload: Tag) {
    this.tagsService.updateTag(payload.id, payload);
  }

  /**toggle pin for subTag */

  /**update Sub tag */
  updateSubTag(payload: any, parentId: string, childId: string) {
    if (payload.parentId != parentId) {
      this.tagsService.moveSubTag(payload.parentId, payload);
      this.tagsService.deleteSubTag(parentId, childId);
    } else {
      this.tagsService.updateSubTag(parentId, childId, payload);
    }
  }

  /**CONFIRM DIALOGUE FOR MERGE TAGS*/
  isVisibleConfirmPopup: boolean = false;
  selectedTargetTag!: string;

  mergeTags() {
    // $&('selected merging tag id....', this.selectedTargetTag);
    this.tagsService.mergeTags(this.selectedTag.id, this.selectedTargetTag);
    this.selectedTag = null;
    this.isVisibleConfirmPopup = false;
  }

  closeConfirmDialog() {
    this.selectedTag = null;
    this.isVisibleConfirmPopup = false;
  }
}
