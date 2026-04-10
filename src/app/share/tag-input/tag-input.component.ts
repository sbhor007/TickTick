import {
  Component,
  EventEmitter,
  inject,
  Input,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { EntityType } from '../../enums/entity-type';
import { InputTextModule } from 'primeng/inputtext';
import { CommonModule } from '@angular/common';
import { TagsService } from '../../config/tags.service';
export type TagMode = 'create' | 'update' | 'create_subtag' | 'update_subtag' | 'close';
export interface TagEvent {
  action: TagMode;
  entityType?: EntityType;
  payload?: any;
}

@Component({
  selector: 'app-tag-input',
  imports: [ReactiveFormsModule, InputTextModule, CommonModule],
  templateUrl: './tag-input.component.html',
})
export class TagInputComponent implements OnInit {
  private tagService = inject(TagsService);

  @Input() mode: TagMode = 'create';
  @Input() existingTag: any = null;

  @Output() tagsEventHandler = new EventEmitter<TagEvent>();

  parentTags = this.tagService.allTags$();

  tagForm!: FormGroup;
  colors = [
    '#E24B4A',
    '#E8872A',
    '#EFC82A',
    '#639922',
    '#1D9E75',
    '#378ADD',
    '#7F77DD',
    '#D4537E',
  ];
  selectedColor = this.existingTag?.color ?? '';


  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    console.debug('is existing tag null, ', this.existingTag);

    this.buildForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['existingTag'] && !changes['existingTag'].firstChange) {
      this.buildForm();
    }
  }

  private buildForm() {
    this.tagForm = this.fb.group({
      name: [this.existingTag?.name ?? '', Validators.required],
      color: [this.existingTag?.color ?? ''],
      parentId: [this.existingTag?.parentId ?? null],
      entityType: [EntityType.TAG],
    });
  }

  selectColor(color: string) {
  this.selectedColor = color;
  this.tagForm.get('color')?.setValue(color);
}

  //  private loadParentTags(): void {
  //   // read from signal directly
  //   const all = this.tagService.allTags$();
  //   this.parentTags = [
  //     { id: "null", name: 'None' },
  //     ...all.map(t => ({ id: t.id, name: t.name })),
  //   ];
  // }

  get title(): any {
    switch (this.mode) {
      case 'create':
        return 'Add Tag';
      case 'update':
        return 'Update Tag';
      case 'create_subtag':
        return 'Add Sub-tag';
      case 'update_subtag':
        return 'Update Sub-tag';
    }
  }

  get isUpdate(): boolean {
    return this.mode.startsWith('update');
  }

  get saveLabel(): string {
    return this.mode.startsWith('update') ? 'Update' : 'Save';
  }

  onSave(): void {
    if (this.tagForm.invalid) return;
    let payload = {}
    if(this.mode == 'create_subtag' ){
      payload = {
      ...this.tagForm.value,
      
      ...(this.isUpdate && { id: this.existingTag?.id }),
      parentId: this.existingTag?.id ?? null
    };

    }else{
      payload = {
      ...this.existingTag,
      ...this.tagForm.value,
      ...(this.isUpdate && { id: this.existingTag?.id }),
    };
    }
    

    this.tagsEventHandler.emit(
      {
        action: this.mode,
        entityType: EntityType.TAG,
        payload: payload
      }
    );
  }

  onClose() {
    this.tagsEventHandler.emit({
      action: 'close',
    });
  }
}
