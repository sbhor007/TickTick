import {
  Component,
  EventEmitter,
  HostListener,
  inject,
  Input,
  Output,
} from '@angular/core';
import { Folder } from '../../models/folder';
import { FolderService } from '../../services/folder.service';
import { EntityType } from '../../enums/entity-type';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-create-folder',
  imports: [FormsModule],
  templateUrl: './create-folder.component.html',
})
export class CreateFolderComponent {
  private folderService = inject(FolderService);

  @Input() mode: 'create' | 'update' = 'create';

  // 🔹 Initial values (for edit mode)
  @Input() folderName: string = '';
  @Input() folderId?: string | null;

  localFolderName: string = '';
  folderData!: Folder;
  @Output() folderEvent = new EventEmitter<{
    action: 'create' | 'update' | 'cancel';
    folderName?: string;
    folderId?: string |null;
    // entityType:EntityType;
  }>();

  ngOnInit(): void {
    // Initialize input value
    this.localFolderName = this.folderName || '';
    if (this.folderId) {
      console.log(this.folderId);
      this.folderService.fetchFolderById(this.folderId).subscribe((folder) => {
        console.log(folder);
        this.folderData = folder;
        console.log(this.folderData);
        this.localFolderName = this.folderData.name;
      });
    }
  }

  onClose() {
    console.log("call folder emit");
    
    this.folderEvent.emit({ action: 'cancel' });
  }

  onSave() {
    if (!this.localFolderName.trim()) return;

    if (this.mode === 'create') {
      this.createFolder();
    } else {
      this.updateFolder();
    }
  }

  createFolder() {
    const folderData: Folder = {
      id: crypto.randomUUID(),
      userId: null,
      name: this.localFolderName,
      isPinned: false,
      entityType: EntityType.FOLDER,
      projects: [],
      createdAt: new Date().toLocaleDateString(),
      updatedAt: new Date().toLocaleDateString(),
    };
    this.folderService.createFolder(folderData).subscribe((data) => {
      console.log('Folder Creted',data);
      this.folderService.loadAllFolders()
      this.folderEvent.emit({
        action: 'create',
        folderName: this.localFolderName,
        folderId: folderData.id,
      });
      this.onClose();
    });
    this.onClose();
  }

  updateFolder() {
    this.folderService.loadAllFolders();

    const updatedFolder = {
      ...this.folderData,
      name: this.localFolderName,
    };

    this.folderService
      .updateFolder(this.folderData.id, updatedFolder)
      .subscribe(() => {
        this.folderService.loadAllFolders();
        this.folderEvent.emit({
          action: 'update',
          folderName: this.localFolderName,
          folderId: this.folderId ?? null,
        });
      });
  }

  @HostListener('document:keydown.escape')
  handleEsc() {
    this.onClose();
  }
}
