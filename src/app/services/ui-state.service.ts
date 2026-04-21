import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UiStateService {
  isListPanelCollapsed = signal(false);

  toggleListPanel() {
    this.isListPanelCollapsed.update(v => !v);
  }
}
