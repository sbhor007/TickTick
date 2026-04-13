import { Component, inject, OnInit, signal } from '@angular/core';


@Component({
  selector: 'app-c',
  imports: [],
  templateUrl: './c.component.html',
  styleUrl: './c.component.css',
})
export class CComponent implements OnInit {
  // private nodeService = inject(NodeService);
  files = [
      {

        key: '0',
        label: 'Documents',
        data: 'Documents Folder',
        icon: 'pi pi-fw pi-inbox',
        children: [
          {
            key: '0-0',
            label: 'Work',
            data: 'Work Folder',
            icon: 'pi pi-fw pi-cog',
            children: [
              {
                key: '0-0-0',
                label: 'Expenses.doc',
                icon: 'pi pi-fw pi-file',
                data: 'Expenses Document',
              },
              {
                key: '0-0-1',
                label: 'Resume.doc',
                icon: 'pi pi-fw pi-file',
                data: 'Resume Document',
              },
            ],
          },
          {
            key: '0-1',
            label: 'Home',
            data: 'Home Folder',
            icon: 'pi pi-fw pi-home',
            children: [
              {
                key: '0-1-0',
                label: 'Invoices.txt',
                icon: 'pi pi-fw pi-file',
                data: 'Invoices for this month',
              },
            ],
          },
        ],
      },
    ]

  ngOnInit() {
  }
}
