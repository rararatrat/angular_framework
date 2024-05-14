import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { IContainerWrapper, IProcessForm } from '@library/library.interface';
import { CrmService } from '../../crm.service';
import { Core } from '@eagna-io/core';
import { GridListComponent } from '@library/container-collection/grid-list/grid-list.component';
import { PurchaseOrderCrudComponent } from './purchase-order-crud/purchase-order-crud.component';
import { PurchaseOrder } from './purchase-order';
@Component({
  selector: 'eg-purchase-order',
  template: `<eg-grid-list [gridListId]="'grid-purchasing-order'"
                [type]="type"
                [showHeader]="true"
                [(config)]="config">
              </eg-grid-list>`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PurchaseOrderComponent {
  @Input('param') param : any = {};
  @Output('paramChange') paramChange : any = new EventEmitter();
  @ViewChild('gridList') gridList: GridListComponent;

  public type         : "list" | "grid" | "stats" = "grid";
  public config       : IContainerWrapper;
  public process      : IProcessForm[];
  public form         = PurchaseOrder.getFormProperties();

  constructor(private _crm:CrmService, private _cdr: ChangeDetectorRef){}

  ngOnInit(): void {
    this._initProcess();

    this.config = {
      reloaded : true,
      viewtype: this.type,
      params : this.param,
      apiService : (p, m, n?) => this._crm.purchase_orders(p, m, n),
      title : Core.Localize("purchase_order"),
      detailComponent: PurchaseOrderCrudComponent,
      /* addEditComponent: PurchaseOrderCrudComponent, */
      isProcess : true,
      process_form: this.process,
      modalWidth: "60%",
      statusField: 'status',
      formProperties  : this.form['formProperties'],
      formStructure   : this.form['formStructure']
    }
  }

  private _initProcess(){
    this.process = [
      {
        index:0,
        name: "Details",
        description: "",
        status: "completed",
        isWip: false,
        isComplete: false,
        isError:false,
        hasForm:true,
        fields: ['name', 'company', 'contact', 'user', 'project']
      },
      {
        index:1,
        name: "Items",
        description: "",
        status: "completed",
        isWip: false,
        isComplete: false,
        isError:false,
        hasForm:false,
        component:{
          component: 'ItemComponent',
          data: 'purchaseorder'
        }
      },
      {
        index:2,
        name: "Address",
        description: "",
        status: "completed",
        isWip: false,
        isComplete: false,
        isError:false,
        hasForm:true,
        fields: ['invoice_address']
      },
      {
        index:3,
        name: "Settings",
        description: "",
        status: "completed",
        isWip: false,
        isComplete: false,
        isError:false,
        hasForm:true,
        fields: ['currency', 'bank_account', 'user', 'mwst_type', 'mwst_is_net']
      }
    ]
  }


  /* duplicateApiParams(data: any): any {
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        const element = data[key];
        if(element && typeof element == "object" && element["id"]){
          data[key] = element["id"];
        }
      }
    }
    return data;
  }; */

  ngOnDestroy(): void {}
}
