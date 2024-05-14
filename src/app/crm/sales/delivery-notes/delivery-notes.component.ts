import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { IContainerWrapper } from '@library/library.interface';
import { CrmService } from '../../crm.service';
import { Core } from '@eagna-io/core';
import { DeliveryCrudComponent } from './delivery-crud/delivery-crud.component';

@Component({
  selector: 'eg-delivery-notes',
  /* templateUrl: './delivery-notes.component.html',
  styleUrls: ['./delivery-notes.component.scss'], */
  template: `<eg-grid-list [gridListId]="'grid-delivery-notes'"
                [type]="type"
                [showHeader]="true"
                [(config)]="config">
              </eg-grid-list>`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DeliveryNotesComponent implements OnInit, OnDestroy {
  @Input('param') param : any = {};
  @Output('paramChange') paramChange : any = new EventEmitter();

  public type   : "list" | "grid" | "stats" = "grid";
  public config : IContainerWrapper;

  constructor(private _crm:CrmService){}

  ngOnInit(): void {
    this.config = {
      reloaded : true,
      viewtype: this.type,
      params : this.param,
      apiService : (p, m, n?) => this._crm.sales_delivery_notes(p, m, n),
      title : Core.Localize("delivery_note", {count: 2}),
      virtualListCols: {visibleCols: ['id', 'name', 'project']},
      detailComponent: DeliveryCrudComponent,
      statusField: 'status',

    }

  }

  duplicateApiParams(data: any): any {
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        const element = data[key];
        if(element && typeof element == "object" && element["id"]){
          data[key] = element["id"];
        }
      }
    }

    return data;
  };

  ngOnDestroy(): void {

  }

}
