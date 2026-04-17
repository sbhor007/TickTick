import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UiStateService {
  detailPanelVisible = signal(true);

  constructor() { }
}
