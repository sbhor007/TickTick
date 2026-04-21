import {
  Component,
  computed,
  effect,
  EventEmitter,
  HostListener,
  inject,
  Input,
  input,
  OnInit,
  Output,
  signal,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ViewType } from '../../../enums/view-type';
import { CascadeSelectModule } from 'primeng/cascadeselect';
import { Folder } from '../../../models/folder';
import { FolderService } from '../../../services/folder.service';
import { EntityType } from '../../../enums/entity-type';
import { CreateFolderComponent } from '../../../share/create-folder/create-folder.component';
import { ProjectService } from '../../../services/project.service';
import { FolderProjectService } from '../../../services/folder-project.service';
import { CommonModule } from '@angular/common';

export interface FormHandlerEvent {
  action: 'create' | 'update' | 'delete' | 'close';
  entity?: EntityType;
  entityId?:string | null
  payload?: any;
}

@Component({
  selector: 'app-create-project',
  imports: [ReactiveFormsModule, CascadeSelectModule, CreateFolderComponent,CommonModule],
  templateUrl: './create-project.component.html',
})
export class CreateProjectComponent implements OnInit {
  private folderService = inject(FolderService);
  private projectService = inject(ProjectService);
  private folderWithProjectService = inject(FolderProjectService)

  @Input() folderId: string | null = null;
  @Input() mode: 'create' | 'update' = 'create';
  @Input() projectId: string | null = null;
  @Output() formHandler = new EventEmitter<FormHandlerEvent>();

  isHovered:boolean = false

  colorOptions = [
  '#ef4444', // red
  '#f97316', // orange
  '#eab308', // yellow
  '#22c55e', // green
  '#3b82f6', // blue
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#64748b', // slate
];

  isShowFolderDialog = signal(false);

  allFolders = this.folderService.allFolders$;

  selectFolders: any[] | undefined = [];
  listType = ViewType;

  projectForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.projectForm = this.fb.group({
      name: ['', Validators.required],
      color: [''],
      viewType: [''],
      folderId: [null],
      listType: ['Task List'],
      smartList: ['All Task'],
      entityType: [],
    });

  }
  
  ngOnInit(): void {

    if (this.mode === 'update' && this.projectId) {
      this.projectService
        .fetchProjectById(this.projectId)
        .subscribe((project: any) => {
          const projectData = {
            ...project,
            name: project.name ?? '',
            color: project.color ?? '#8b5cf6',
            viewType: project.viewType ?? ViewType.LIST.toString(),
            folderId: project.folderId ?? null,
            listType: project.listType ?? this.projectForm.value.listType,
            smartList:
              project.smartList ?? this.projectForm.value.smartList,
          }
          this.projectForm.patchValue(projectData);
        });
    } else if (this.folderId) {
      this.projectForm.patchValue({ folderId: this.folderId });
    }

    this.projectForm.get('folderId')?.valueChanges.subscribe((val) => {
      if (val === 'new') {
        this.isShowFolderDialog.set(true);
        this.projectForm.patchValue({ folderId: '' });
      }
    });
  }


 onFolderChange(event: any) {
  
  const selected = event.value;
  if (selected?.command) {
    selected.command();
    this.projectForm.get('folderId')?.setValue(null);
  }
}
  /**create project task */
  onSubmit() {
    if (this.projectForm.invalid) {
      // console.log("invalid",this.projectForm.value);
      
      this.projectForm.markAllAsTouched();
      return;
    }
    
    if (this.mode === 'update' && this.projectId) {


       this.formHandler.emit({
        action:"update",
        entity:EntityType.PROJECT,
        entityId:this.projectId,
        payload: this.projectForm.value
      })
    } else {
      // console.log(this.projectForm.value);
      this.formHandler.emit({
        action:"create",
        entity:EntityType.PROJECT,
        entityId:null,
        payload: this.projectForm.value
      })
    }
  }

  closeForm() {
    this.isShowFolderDialog.set(false)
     this.formHandler.emit({
        action:"close"
      })
  }

  handleFolderEvent(event: any) {
    this.isShowFolderDialog.set(false);
    // console.log(event);
    

    if (event.action === 'cancel'){
      return;
    } 
    this.folderService.loadAllFolders();

    // CREATE
    if (event.action === 'create') {
      // console.log("Folder created...");
      
      this.folderService.loadAllFolders()
      this.projectForm.patchValue({
        folderId: event.folderId,
      });
      
    }
    //  UPDATE
    if (event.action === 'update') {
      // console.log('Folder updated:', event.folderName);
    }
  }


  
}
