import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { IContainerWrapper } from '@library/library.interface';
import { CrmService } from '../../crm.service';
import { Core } from '@eagna-io/core';
import { InventoryArea } from './inventory-area';

@Component({
  selector: 'eg-inventory-area',
  template: `<eg-grid-list [gridListId]="'grid-inventory-area'"
                [type]="type"
                [showHeader]="true"
                [(config)]="config">
              </eg-grid-list>`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InventoryAreaComponent{
  public type   : "list" | "grid" | "stats" = "grid";
  public config : IContainerWrapper;
  public form   : any =  InventoryArea.getFormProperties();
  
  constructor(private _crm:CrmService){
    this.config = {
      reloaded : true,
      viewtype: this.type,
      params : {},
      apiService : (p, m, n?) => this._crm.inventory_area(p, m, n),
      title : Core.Localize("stock_area"),
      formStructure   : this.form['formStructure'],
      withDetailRoute: false
    }
  }
}

