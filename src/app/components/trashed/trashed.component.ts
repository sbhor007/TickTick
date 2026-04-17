import { Component, inject, OnInit, signal } from '@angular/core';
import { Splitter } from "primeng/splitter";
import { TaskListComponent } from "../context/task-list/task-list.component";
import { RouterOutlet } from '@angular/router';
import { EntityType } from '../../enums/entity-type';
import { TrashService } from '../../services/trash.service';
import { Button } from "primeng/button";
import { Dialog } from "primeng/dialog";
import { ConfirmDialog } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';

@Component({
  selector: 'app-trashed',
  imports: [Splitter, TaskListComponent, RouterOutlet, ConfirmDialog],
  providers: [ConfirmationService],
  templateUrl: './trashed.component.html',
  styles: ``
})
export class TrashedComponent implements OnInit {
  private trashService = inject(TrashService)

  routeData = signal({id:null,entityType:EntityType.TRASHED})
  private confirmationService = inject(ConfirmationService);

  ngOnInit(): void {
    
  }
  


  showDialog() {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete all trash?',
      header: 'Delete All',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger p-button-sm',
      rejectButtonStyleClass: 'p-button-sm',
      accept: () => {
        this.trashService.deleteAll();
      }
    });
  }

}
