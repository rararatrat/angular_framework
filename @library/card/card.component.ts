import { Component, Input, OnInit } from '@angular/core';
import { MenuItem, MessageService } from 'primeng/api';

@Component({
  selector: 'eg-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss']
})
export class CardComponent implements OnInit {
  items: MenuItem[];
  @Input("hasFooter") hasFooter   : boolean     = true;
  @Input("hasContent") hasContent : boolean     = true;
  @Input("hasHeader") hasHeader   : boolean     = true;

  @Input("menuItems") menuItems   : MenuItem[]  = [];
  @Input("isChart")   isChart     : boolean     = false;
  @Input("class")     class       ?: any         = "";
  @Input("btnType")   btnType     ?: "menu" | "button" = "menu";

  public hasPadding             : any;


  constructor( private messageService: MessageService) { }
  trackByFn(index, item) {
    return item.id; // unique id corresponding to the item
 }
  ngOnInit(): void {
    this.hasPadding = this.isChart ? "chartcard":"contentcard";

    this.items = [
      {
          icon: 'pi pi-pencil',
          command: () => {
              this.messageService.add({ severity: 'info', summary: 'Add', detail: 'Data Added' });
          }
      },
      {
          icon: 'pi pi-refresh',
          command: () => {
              this.messageService.add({ severity: 'success', summary: 'Update', detail: 'Data Updated' });
          }
      },
      {
          icon: 'pi pi-trash',
          command: () => {
              this.messageService.add({ severity: 'error', summary: 'Delete', detail: 'Data Deleted' });
          }
      },
      {
          icon: 'pi pi-pencil',
          command: () => {
              this.messageService.add({ severity: 'info', summary: 'Add', detail: 'Data Added' });
          },
      },
      {
          icon: 'pi pi-refresh',
          command: () => {
              this.messageService.add({ severity: 'success', summary: 'Update', detail: 'Data Updated' });
          }
      },
      {
          icon: 'pi pi-trash',
          command: () => {
              this.messageService.add({ severity: 'error', summary: 'Delete', detail: 'Data Deleted' });
          }
      },
  ];
  }

}
