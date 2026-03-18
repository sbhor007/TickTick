import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TestService } from './services/test.service';
import { FolderService } from './services/folder.service';
import { Folder } from '../app/models/folder';
@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'TickTick';
}
