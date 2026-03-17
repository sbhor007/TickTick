
import { Component } from '@angular/core';

@Component({
  selector: 'app-list-action',
  imports: [],
  templateUrl: './list-action.component.html',
  styles: ``
})
export class ListActionComponent {
  currentDay = new Date().getDate();
  smartView = [
    {
      name:"Today",
      path:'',
      icon: 'pi pi-calendar'
    },
    {
      name:"Next 7 Days",
      path:'',
       icon: 'pi pi-calendar'
    },
    {
      name:"Inbox",
      path:'',
       icon: 'pi pi-inbox'
    }
  ]
}
