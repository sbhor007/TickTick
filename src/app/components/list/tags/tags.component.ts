import { Component, HostListener, inject, OnInit } from '@angular/core';
import { TagInputComponent } from "../../../share/tag-input/tag-input.component";
import { TagsService } from '../../../config/tags.service';
import { Tag } from '../../../models/tag';
interface TreeNode {
  label: string;
  icon: string;
  level: number;
  expandable: boolean;
}

@Component({
  selector: 'app-tags',
  imports: [TagInputComponent],
  templateUrl: './tags.component.html'
})
export class TagsComponent implements OnInit{

  private tagsService = inject(TagsService);

  isExpanded = true;
  showDialog = false;
  selectedMode: 'create' | 'update' | 'create_subtag' | 'update_subtag' =
    'create';
  selectedTag: any = null;

  // ✅ tracks which tag rows are expanded
  expandedTags = new Set<string>();

  tags = this.tagsService.allTags$;

  ngOnInit(): void {
    this.tagsService.loadAllTags()
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
    this.selectedMode = 'create';
    this.selectedTag = null;
    this.showDialog = true;
  }


  inputTagsEventhandler(event:any){
    debugger
    if(event.action == 'close'){
      this.closeDialog()
    }else if(event.action == 'create'){
      this.tagsService.createTags(event.payload)
      this.closeDialog()
    }
  }

  closeDialog(): void {
    this.showDialog = false;
    this.selectedTag = null;
  }

  @HostListener('document:keydown.escape')
  handleEsc() {
    this.closeDialog()
  }

  // @HostListener('document:click')
  // onDocumentClick(): void {
  //   this.closeDialog()
  // }


}
