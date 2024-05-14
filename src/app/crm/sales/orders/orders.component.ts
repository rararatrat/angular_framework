import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { IContainerWrapper, IProcessForm } from '@library/library.interface';
import { CrmService } from '../../crm.service';
import { Core } from '@eagna-io/core';
import { OrdersCrudComponent } from './orders-crud/orders-crud.component';
import { Orders } from './orders';
import { GridListComponent } from '@library/container-collection/grid-list/grid-list.component';

@Component({
  selector: 'eg-orders',
  /* templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.scss'] */
  template: `<eg-grid-list
                #gridList
                [gridListId]="'grid-sales-orders'"
                [type]="type"
                [showHeader]="true"
                [duplicateApiParams]="duplicateApiParams"
                [(config)]="config">
              </eg-grid-list>`,
changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrdersComponent implements OnInit, OnDestroy {
  @ViewChild('gridList')gridList : GridListComponent

  @Input('param') param : any = {};
  @Output('paramChange') paramChange : any = new EventEmitter();

  public type   : "list" | "grid" | "stats" | "stats" = "grid";
  public config : IContainerWrapper;
  public process      : IProcessForm[];
  public form   = Orders.getFormProperties();

  constructor(private _crm:CrmService){}

  ngOnInit(): void {
    //const _fp = Sales.getOrderFormProperties();
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
        name: "Conditions",
        description: "",
        status: "completed",
        isWip: false,
        isComplete: false,
        isError:false,
        hasForm:true,
        fields: ['payment_type', /* 'kb_terms_of_payment', */ 'is_valid_from','is_valid_until']
      },
      {
        index:2,
        name: "Recurring Order",
        description: "",
        status: "completed",
        isWip: false,
        isComplete: false,
        isError:false,
        hasForm:true,
        fields: ['is_recurring_order', 'recurrence_type', 'repeat_every_time','repeat_every_time_unit', 'starts_on', 'ends_on', 'is_infinite_period']
      },
      {
        index:3,
        name: "Items",
        description: "",
        status: "completed",
        isWip: false,
        isComplete: false,
        isError:false,
        hasForm:false,
        component:{
          component: 'ItemComponent',
          data: 'orders'
        }
      },
      {
        index:4,
        name: "Address",
        description: "",
        status: "completed",
        isWip: false,
        isComplete: false,
        isError:false,
        hasForm:true,
        fields: ['delivery_address', 'invoice_address']
      },
      {
        index:5,
        name: "Settings",
        description: "",
        status: "completed",
        isWip: false,
        isComplete: false,
        isError:false,
        hasForm:true,
        fields: ['show_position_taxes', 'show_total', 'bank_account', 'currency',
        'mwst_type', 'mwst_is_net']

      },
      {
        index:6,
        name: "Partial Invoice",
        description: "",
        status: "completed",
        isWip: false,
        isComplete: false,
        isError:false,
        hasForm:true,
        fields: ['is_partial_invoice', 'partial_invoice_type']
      },
      {
        index:7,
        name: "Template",
        description: "",
        status: "completed",
        isWip: false,
        isComplete: false,
        isError:false,
        hasForm:true,
        fields: ['title', 'header', 'footer','language']

      },
      {
        index:8,
        name: "Review & Send",
        description: "",
        status: "completed",
        isWip: false,
        isComplete: false,
        isError:false,
        hasForm:true,
        fields: [/* 'name', 'company', 'contact', 'user', 'project' */]
      }

    ]

    this.config = {
      reloaded : true,
      viewtype:this.type,
      params: this.param,
      apiService : (p, m, n?) => this._crm.sales_orders(p, m, n),
      title : Core.Localize("order", {count: 2}),
      /* formProperties: _fp.formProperties,
      formStructure: _fp.formStructure */
      detailComponent: OrdersCrudComponent,
      /* addEditComponent: OrdersCrudComponent, */
      isProcess : true,
      process_form: this.process,
      modalWidth: "60%",
      statusField: 'status',
      formProperties  : this.form['formProperties'],
      formStructure   : this.form['formStructure'],
      /* addCallback     : (p) => {
        this.gridList.grid.refresh();
      }, */
      defaultColumns: {columns: {state: [
          "title",
          "company",
          "contact",
          "user",
          "project",
          "language",
          "bank_account",
          "currency",
          "payment_type",
          "mwst_type",
          "is_valid_from",
          "is_valid_until",
          "total_w_tax",
          "total_wo_tax",
          "show_total",
          "invoice_address",
          "delivery_address",
          "is_recurring_order",
          "recurrence_type",
          "repeat_every_time",
          "repeat_every_time_unit",
          "starts_on",
          "ends_on",
          "is_infinite_period",
          "is_partial_invoice",
          "partial_invoice_type",
          "status",
          "process",
          "header",
          "footer",
          "api_reference",
          "template_slug",
          "updated_at",
          "viewed_by_client_at",
          "created_on",
          "positions",
          "files",
          "actions"
      ]}}
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
