import { Component, computed, EventEmitter, inject, Input, OnInit, Output, signal } from '@angular/core';
import { Tag } from '../../models/tag';
import { FormsModule } from '@angular/forms';
import { TagsService } from '../../config/tags.service';
import { NgTemplateOutlet } from '@angular/common';
export interface TagPickerOutput {
  action: 'add' | 'create' | 'cancel';
  payload?: Tag[] | string;
}

@Component({
  selector: 'app-tag-selector',
  imports: [FormsModule,NgTemplateOutlet],
  templateUrl: './tag-selector.component.html',
  styles: ``
})
export class TagSelectorComponent  implements OnInit {
   private tagsService = inject(TagsService);

  tags = computed(() => this.tagsService.allTags$());

  @Input() selectedTags: Tag[] = [];              // ← only new addition

  @Output() result = new EventEmitter<TagPickerOutput>();

  searchQuery = signal('');
  private expanded = signal(new Set<any>());
  private selected = signal(new Set<any>());

  ngOnInit() {
    // Pre-select from input
    const sel = new Set<any>();
    const collectIds = (nodes: Tag[]) => nodes.forEach(n => {
      if (this.selectedTags.some(t => t.id === n.id)) sel.add(n.id);
      if (n.childTag) collectIds(n.childTag);
    });
    collectIds(this.tags());
    this.selected.set(sel);

    // Expand parents (existing logic)
    const exp = new Set<any>();
    this.tags()
      .filter(t => t.childTag?.length)
      .forEach(t => exp.add(t.id));
    this.expanded.set(exp);
  }

  filteredTags = computed(() => {
    const q = this.searchQuery().toLowerCase();
    if (!q) return this.tags();
    return this.tags().filter(t =>
      t.name.toLowerCase().includes(q) ||
      t.childTag?.some(c => c.name.toLowerCase().includes(q))
    );
  });

  hasNoResults = computed(() =>
    this.searchQuery().trim().length > 0 && this.filteredTags().length === 0
  );

  isExpanded(id: any) { return this.expanded().has(id); }
  isSelected(id: any) { return this.selected().has(id); }

  toggleExpand(id: any) {
    const s = new Set(this.expanded());
    s.has(id) ? s.delete(id) : s.add(id);
    this.expanded.set(s);
  }

  toggleSelect(id: any) {
    const s = new Set(this.selected());
    s.has(id) ? s.delete(id) : s.add(id);
    this.selected.set(s);
  }

  createTag() {
    this.result.emit({ action: 'create', payload: this.searchQuery().trim() });
    this.searchQuery.set('');
    this.selected.set(new Set());
  }

  confirm() {
    const result: Tag[] = [];
    if (this.selected().size == 0) {
      this.cancel();
    }
    const collect = (nodes: Tag[]) => nodes.forEach(n => {
      if (this.selected().has(n.id)) result.push(n);
      if (n.childTag) collect(n.childTag);
    });
    collect(this.tags());
    this.result.emit({ action: 'add', payload: result });
    this.selected.set(new Set());
  }

  cancel() {
    this.result.emit({ action: 'cancel' });
  }
}