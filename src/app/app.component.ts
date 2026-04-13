import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ButtonModule } from 'primeng/button'
import { CComponent } from "./components/c/c.component";


@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ButtonModule, CComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'TickTick';
}
