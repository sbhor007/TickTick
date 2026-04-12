import { Component } from '@angular/core';
import { DatePicker } from 'primeng/datepicker';
import { Select } from 'primeng/select';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-task-input',
  imports: [DatePicker, Select, FormsModule, DatePipe],
  templateUrl: './task-input.component.html',
  styles: ``
})
export class TaskInputComponent {

  isExpanded = false

dueDate: Date | null = null;
dueTime: Date | null = null;
repeat: string | null = null;
reminder: Date | null = null;

repeatOptions = [
  { label: 'Daily',    value: 'daily' },
  { label: 'Weekly',   value: 'weekly' },
  { label: 'Monthly',  value: 'monthly' },
  { label: 'Yearly',   value: 'yearly' },
];

  onInputKeydown(event:any){

  }

  onInputChange(event:any){}

}
