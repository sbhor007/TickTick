import {
  Component,
  ElementRef,
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

@Component({
  selector: 'app-task-input',
  imports: [
    DatePicker,
    CommonModule,
    FormsModule,
    DatePipe,
    ReactiveFormsModule,
    DateTimePickerComponent,
  ],
  templateUrl: './task-input.component.html',
  styles: ``,
})
export class TaskInputComponent implements OnInit {
  private taskService = inject(TaskService);
  @Input() project!: any;

  taskTitle = '';
  taskPriority: TaskPriority = TaskPriority.NONE;
  taskAttachmentId: string | null = null;
  taskDueDate: Date | string | null = null;
  taskDueDateTime: Date | string | null = null;

  isExpanded = false;

  isDateTimePikerVisible = false;

  /**date time piker */
  initialDate = signal<Date | null>(null);
  initialTime = signal<string | null>(null);
  lastSelection = signal<DateTimeSelection | null>(null);

  @ViewChild('inputRef') inputRef!: ElementRef<HTMLInputElement>;

  selectedDateTime: Date | null = null;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    console.log("Test Priorities");
    const priority = TaskPriority
    console.log(priority);
    
    
  }

  toggeleDateTimePiker() {
    this.isDateTimePikerVisible = !this.isDateTimePikerVisible;
  }
 

  clearDateTime(): void {
    this.selectedDateTime = null;
  }

  /**for form submition */
  onInputKeydown(event: any): void {
    console.log('event triggered: ', this.taskTitle);

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
      attachmentId: this.taskAttachmentId,
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

    if (event.key === 'Escape') {
      this.isDateTimePikerVisible = false;
      this.isExpanded = false;
    }
  }

 


  onInputChange(event: Event): void {
    console.log("on-input-change",event);
    
    // handle input change
  }

  selectPriorityOrTag(event:any){
    console.log('selectPriorityOrTag::',event);
    
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
}
