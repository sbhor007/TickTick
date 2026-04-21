import { Component, Inject, inject, PLATFORM_ID } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ButtonModule } from 'primeng/button'
import { ToastrService } from 'ngx-toastr';
import { NgxSonnerToaster, toast } from 'ngx-sonner';
import { isPlatformBrowser } from '@angular/common';


@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ButtonModule, NgxSonnerToaster],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'TickTick';

  showToast() {
    toast.success('Task created!');
    toast.error('Something went wrong');
    toast.warning('Due date is near');
    toast.info('3 tasks due today');
    toast('Default toast message');

    // With description
    toast.success('Task deleted', {
      description: 'Task has been moved to trash',
    });

    // With action button
    toast.success('Task completed', {
      action: {
        label: 'Undo',
        onClick: () => console.log('Undo clicked'),
      },
    });
  }
}
