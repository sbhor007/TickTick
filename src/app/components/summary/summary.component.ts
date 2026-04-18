import { NgClass } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EditorModule } from 'primeng/editor';

import("quill")

@Component({
  selector: 'app-summary',
  imports: [EditorModule, FormsModule, NgClass],
  templateUrl: './summary.component.html',
  styles: ``
})
export class SummaryComponent {
  text: string | undefined;
}
// EditorModule, FormsModule, NgClass
