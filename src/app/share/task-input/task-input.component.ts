import {
  Component,
  computed,
  ElementRef,
  HostListener,
  inject,
  Input,
  input,
  OnInit,
  signal,
  ViewChild,
} from '@angular/core';
import { DatePicker } from 'primeng/datepicker';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule, DatePipe } from '@angular/common';
import { DateTimePickerComponent } from '../date-time-picker/date-time-picker.component';
import { DateTimeSelection } from '../../models/date';
import { TaskService } from '../../services/task.service';
import { TaskStatus } from '../../enus/task-status';
import { TaskPriority } from '../../enus/task-priority';
import { EntityType } from '../../enums/entity-type';
import { Task } from '../../models/task';
import { MenuItem } from 'primeng/api';
import { ContextMenuItem } from '../../models/context-menu-item';
import { ContextMenuBarService } from '../../config/context-menu-bar.service';
import { Popover } from 'primeng/popover';
import { Project } from '../../models/project';
import { AttachmentService } from '../../services/attachment.service';
import { FolderService } from '../../services/folder.service';
import { ProjectService } from '../../services/project.service';
import { TagSelectorComponent } from '../tag-selector/tag-selector.component';
import { Tag } from '../../models/tag';
import { TagsService } from '../../config/tags.service';

@Component({
  selector: 'app-task-input',
  imports: [
    DatePicker,
    CommonModule,
    FormsModule,
    DatePipe,
    ReactiveFormsModule,
    DateTimePickerComponent,
    Popover,
    TagSelectorComponent,
  ],
  templateUrl: './task-input.component.html',
  styles: ``,
})
export class TaskInputComponent implements OnInit {
  private taskService = inject(TaskService);
  private folderService = inject(FolderService);
  private projectService = inject(ProjectService);
  private contextMenuService = inject(ContextMenuBarService);
  private attachmentService = inject(AttachmentService);
  private tagService = inject(TagsService);

  /**input suggestions */

  @Input() project!: any;

  projectPlaceHolder: string = this.project?.name;

  taskTitle = '';
  
  taskAttachmentId: string | null = null;
  taskDueDate: Date | string | null = null;
  taskDueDateTime: Date | string | null = null;

  /** Attachment files */
  attachedFiles: File | null = null;
  isExpanded = false;
  isDateTimePikerVisible = false;
  isTagSelectorVisible = false;
  showMoveTo = false;

  /**date time piker */
  initialDate = signal<Date | null>(null);
  initialTime = signal<string | null>(null);
  lastSelection = signal<DateTimeSelection | null>(null);

 

  @ViewChild('contextMenuPopover') contextMenuPopover!: Popover;
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  @ViewChild('dateTimePopover') dateTimePopover!: any;
  contextMenu: MenuItem[] = [];

  // Structured context menu data
  menuSections: ContextMenuItem[] = [];
  menuRegularItems: ContextMenuItem[] = [];

  @ViewChild('inputRef') inputRef!: ElementRef<HTMLInputElement>;

  selectedDateTime: Date | null = null;
  /**move to */
  isVisibleFolderMenu = false;
  hoveredFolderId: string | null = null;
  selectedProject!: Project | null;

  folderProject = computed(() => {
    const folder = this.folderService
      .allFolders$()

      .map((folder) => ({
        ...folder,
        projects: this.projectService
          .projects$()
          .filter((project) => project.folderId == folder.id),
      }));
    const project = this.projectService
      .projects$()
      .filter((project) => project.folderId == null && !project.isSmartView);
    return [...folder, ...project];
  });

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.projectPlaceHolder = this.project?.name;
    console.log('Test Priorities');
    const priority = TaskPriority;
    console.log(priority);
  }

  /**input sugetions */
  
selectedTags: Set<Tag> = new Set();
suggestions: string[] = [];
triggerChar = '';
taskPriority: TaskPriority = TaskPriority.NONE;
tags = computed(() => this.tagService.allTags$());
priorities = Object.values(TaskPriority);

onInputChange(event: Event) {
  const val = (event.target as HTMLInputElement).value;
  const match = val.match(/[#!](\w*)$/);

  if (!match) { this.suggestions = []; return; }

  this.triggerChar = match[0][0];
  const list = this.triggerChar === '#' ? this.tags().map(t => t.name) : this.priorities;
  this.suggestions = list.filter(x => x.toLowerCase().startsWith(match[1].toLowerCase()));
}

select(item: string) {
  this.taskTitle = ''

  if (this.triggerChar === '#') {
    const tag = this.tags().find(t => t.name === item);
    if (tag && ![...this.selectedTags].some(t => t.id === tag.id)) {
      this.selectedTags.add(tag);
    }
  } else {
    this.taskPriority = item as TaskPriority;
  }

  this.suggestions = [];
}

removeTag(tag: Tag) {
  this.selectedTags.forEach(t => {
    if (t.name === tag.id) this.selectedTags.delete(t);
  });
}

onBackspace(event: KeyboardEvent) {
  if (event.key !== 'Backspace' || this.taskTitle.length > 0) return;
  if (this.selectedTags.size > 0) {
    const last = [...this.selectedTags].at(-1)!;
    this.selectedTags.delete(last);
  } else if (this.taskPriority !== TaskPriority.NONE) {
    this.taskPriority = TaskPriority.NONE;
  }
}

  /**move to */
  onMouse(event: any) {
    console.log('----', event);
    this.isVisibleFolderMenu = !this.isVisibleFolderMenu;
  }
  onFolderHover(folderId: string) {
    this.hoveredFolderId = folderId;
  }

  onFolderLeave() {
    this.hoveredFolderId = null;
  }
  assignToAnotherProject(project: Project, action: string) {
    this.selectedProject = project;
    this.projectPlaceHolder = this.selectedProject.name;
    this.isVisibleFolderMenu = false;
  }

  /**context menu option */
  openFolderMenu(event: MouseEvent) {
    event.stopPropagation();
    event.preventDefault();

    // this.currentTask = task;

    const context = this.contextMenuService.getContextMenu(
      EntityType.TASK_INPUT,
    );

    // Split into sections (Date/Priority) and regular items
    this.menuSections = context.filter((i) => i.isSectionHeader);
    this.menuRegularItems = context.filter((i) => !i.isSectionHeader);

    this.contextMenuPopover.toggle(event);
  }

  onSectionItemClick(sectionAction: string, itemAction: string) {
    if (this.project) {
      this.handleAction(this.project, itemAction);
    }
    this.contextMenuPopover.hide();
  }

  onRegularItemClick(item: ContextMenuItem) {
    if (item.isDivider) return;
    if (this.project) {
      this.handleAction(this.project, item.action);
    }
    if (!item.hasSubmenu) {
      this.contextMenuPopover.hide();
    }
  }

  handleAction(project: Project, action: string) {
    console.log('action:', action, 'entityType:', project.entityType);
    switch (action) {
      case 'set_priority_high':
        this.taskPriority = TaskPriority.HIGH;
        break;
      case 'set_priority_medium':
        this.taskPriority = TaskPriority.MEDIUM;
        break;
      case 'set_priority_low':
        this.taskPriority = TaskPriority.LOW;
        break;
      case 'set_priority_none':
        this.taskPriority = TaskPriority.NONE;
        break;
      case 'move_to':
        break;
      case 'attachment':
        this.openFileSelector();
        break;
      case 'manage_tags':
        this.isTagSelectorVisible = true;
        break;
      case 'add_from_template':
        break;
      case 'input_box_setting':
        break;
    }
  }

  toggeleDateTimePiker(event: any) {
    event.stopPropagation();
    console.log('Toggele Date time piker...');

    this.isDateTimePikerVisible = !this.isDateTimePikerVisible;
    if (this.isDateTimePikerVisible) {
      setTimeout(() => {
        this.dateTimePopover?.show(event);
      }, 10);
    } else {
      this.dateTimePopover?.hide();
    }
  }

  clearDateTime(): void {
    this.selectedDateTime = null;
  }

  /**for form submition */
  onInputKeydown(event: any): void {
    console.log('event triggered: ', this.taskTitle);

    if (event.key === 'Escape') {
      this.isDateTimePikerVisible = false;
      this.isExpanded = false;
      return;
    }

    if (this.attachedFiles) {
      this.attachmentService.uploadAttachment(this.attachedFiles).subscribe({
        next: (attachmentId) => {
          this.taskAttachmentId = attachmentId;
          this.buildAndCreateTask();
        },
        error: (err) => {
          console.error('Upload failed:', err);
          this.buildAndCreateTask(); // create task without attachment on error
        },
      });
    } else {
      this.buildAndCreateTask();
    }
  }

  private buildAndCreateTask(): void {
    const taskData: Task = {
      id: crypto.randomUUID(),
      userId: null,
      projectId: this.selectedProject?.id ?? this.project.id ?? null,
      title: this.taskTitle,
      description: '',
      status: TaskStatus.PENDING,
      priority: this.taskPriority,
      isPinned: false,
      parentId: null,
      subtasks: [],
      tags: Array.from(this.selectedTags) ?? [],
      comments: [],
      attachmentId: this.taskAttachmentId ?? null, // ✅ now set correctly
      entityType: EntityType.TASK,
      isNote: false,
      reminder: this.lastSelection()?.reminder,
      repeat: this.lastSelection()?.repeat,
      dueDate: this.lastSelection()?.date?.toISOString() ?? null,
      dueDateTime: this.lastSelection()?.time?.toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      completedAt: null,
    };

    console.log('task-Data: ', taskData);
    // this.taskService.crateTask(this.project.id, taskData);
    this.cleanupInputField();
  }

  /**create attachment */

  cleanupInputField() {
    this.taskTitle = '';
    this.taskPriority = TaskPriority.NONE;
    this.taskAttachmentId = null;
    this.attachedFiles = null;
    this.taskDueDate = null;
    this.taskDueDateTime = null;
    this.lastSelection.set(null);
    this.selectedProject = null;
    this.projectPlaceHolder = this.project.name;
    this.selectedTags = new Set();
  }

  selectPriorityOrTag(event: any) {
    console.log('selectPriorityOrTag::', event);
  }
  /**
   * 
   * {
    "date": "2026-04-16T18:30:00.000Z",
    "time": null,
    "repeat": {
        "type": "on-the-day"
    },
    "reminder": {
        "type": "daily"
    }
}
   */

  onConfirmed(selection: DateTimeSelection) {
    console.log('DateTimePiker Event:: ', selection);

    this.lastSelection.set(selection);
    console.log('DAteTimePiker confirmed: ', selection);
    this.isDateTimePikerVisible = false;
  }

  onCleared() {
    this.lastSelection.set(null);
    console.log('DateTimePiker Cleared');
  }

  /** Open the native file picker */
  openFileSelector() {
    this.contextMenuPopover.hide();
    setTimeout(() => {
      this.fileInput?.nativeElement?.click();
    });
  }

  /** Handle files selected from the file input */
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.attachedFiles = input.files[0];
      console.log('Attached files:', this.attachedFiles);
    }
    // Reset input so the same file can be re-selected
    input.value = '';
  }

  /** Remove an attached file by index */
  removeAttachment(index: number) {
    this.attachedFiles = null;
  }

  /** Get a human-readable file size */
  formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  /** Check if a file is an image */
  isImageFile(file: File): boolean {
    return file.type.startsWith('image/');
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: any) {
    this.isExpanded = false;

    // if (this.isDateTimePikerVisible) this.isDateTimePikerVisible = false;
  }

  closeDateTimeHandler(event: any) {
    console.log('EVENT::', event);
  }

  /**tag selector */
  tagsSectorEventHandler(event: any) {
    console.log('tag selector event::', event);
    this.isTagSelectorVisible = false;
    if (event.action == 'cancel') return;
    switch (event.action) {
      case 'add':
        this.selectedTags = event.payload;
        break;
      case 'create':
        this.tagService.createTags({ name: event.payload });
        setTimeout(() => {
          const tag = this.tagService
            .allTags$()
            .find((t) => t.name == event.payload);
          if (tag) {
            this.selectedTags.add(tag);
          }
          console.log('is Tag created', tag);
        }, 100);
        break;
    }
  }
}
