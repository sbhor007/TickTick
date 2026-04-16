import {
  Component,
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
  ],
  templateUrl: './task-input.component.html',
  styles: ``,
})
export class TaskInputComponent implements OnInit {
  private taskService = inject(TaskService);
  private contextMenuService = inject(ContextMenuBarService);
  private attachmentService = inject(AttachmentService);

  @Input() project!: any;

  taskTitle = '';
  taskPriority: TaskPriority = TaskPriority.NONE;
  taskAttachmentId: string | null = null;
  taskDueDate: Date | string | null = null;
  taskDueDateTime: Date | string | null = null;

  /** Attachment files */
  attachedFiles: File | null = null;

  isExpanded = false;

  isDateTimePikerVisible = false;

  /**date time piker */
  initialDate = signal<Date | null>(null);
  initialTime = signal<string | null>(null);
  lastSelection = signal<DateTimeSelection | null>(null);

  @ViewChild('contextMenuPopover') contextMenuPopover!: Popover;
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  contextMenu: MenuItem[] = [];

  // Structured context menu data
  menuSections: ContextMenuItem[] = [];
  menuRegularItems: ContextMenuItem[] = [];

  @ViewChild('inputRef') inputRef!: ElementRef<HTMLInputElement>;

  selectedDateTime: Date | null = null;

  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
    console.log('Test Priorities');
    const priority = TaskPriority;
    console.log(priority);
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
        break;
      case 'add_from_template':
        break;
      case 'input_box_setting':
        break;
    }
  }

  toggeleDateTimePiker(event:any) {
    event.stopPropagation()
    console.log("Toggele Date time piker...");
    
    this.isDateTimePikerVisible = !this.isDateTimePikerVisible;
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
    projectId: this.project.id ?? null,
    title: this.taskTitle,
    description: '',
    status: TaskStatus.PENDING,
    priority: this.taskPriority,
    isPinned: false,
    parentId: null,
    subtasks: [],
    tags: [],
    comments: [],
    attachmentId: this.taskAttachmentId ?? null,  // ✅ now set correctly
    entityType: EntityType.TASK,
    reminder: this.lastSelection()?.reminder,
    repeat: this.lastSelection()?.repeat,
    dueDate: this.lastSelection()?.date?.toISOString() ?? null,
    dueDateTime: this.lastSelection()?.time?.toString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    completedAt: null,
  };

  console.log('task-Data: ', taskData);
  this.taskService.crateTask(this.project.id, taskData);
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
  }

  onInputChange(event: Event): void {
    console.log('on-input-change', event);

    // handle input change
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

    if (this.isDateTimePikerVisible) this.isDateTimePikerVisible = false;
  }
}
