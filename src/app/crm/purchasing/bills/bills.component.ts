import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { IContainerWrapper, IProcessForm } from '@library/library.interface';
import { CrmService } from '../../crm.service';
import { Core } from '@eagna-io/core';
import { Purchasing } from '../purchasing';
import { GridListComponent } from '@library/container-collection/grid-list/grid-list.component';
import { Quotes } from '../../sales/quotes/quotes';
import { tap } from 'rxjs';

@Component({
  selector: 'eg-bills',
  template: `<eg-grid-list [gridListId]="'grid-purchasing-bills'"
                [type]="type"
                [showHeader]="true"
                [duplicateApiParams]="duplicateApiParams"
                [(config)]="config">
              </eg-grid-list>`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BillsComponent implements OnInit, OnDestroy {
  @Input('param') param : any = {};
  @Output('paramChange') paramChange : any = new EventEmitter();
  @ViewChild('gridList') gridList: GridListComponent;
  
  public type   : "list" | "grid" | "stats" = "grid";
  public config : IContainerWrapper;
  public form       = Quotes.getFormProperties();

  toMap = [/* 
  RT TODO:
  'id', */ /* 'ref', */ /* 'mig_id', 'name', */ /* 'title', */ /* 'vendor_ref', 'vendor', 'vendor_contact' */, /* 'contact_partner', */ /* 'bill_address', *//*  'payment',  */ /* 'purchase' */, /* 'created_at', */ 
    'bill_date', 'due_date', 'is_line_item', 'manual_amount', 'is_net', 'overdue', 'qr_bill_info', 'amount_man', 'amount_calc', 'currency', 'base_currency', 'exchange_rate', 'base_currency_amt', 'total_w_tax', 'total_wo_tax', 'pending_amount', 'paid_amount', 'int_status', 'status', 'process', 'position', 'files'
  ];
  public process    : IProcessForm[] = [
    {
      index:0,
      name: "Details",
      description: "",
      status: "completed",
      isWip: false,
      isComplete: false,
      isError:false,
      hasForm:true,
      fields: ['name', 'contact_partner', 'vendor', 'vendor_contact', 'vendor_ref', 'ref']
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
      fields: ['payment', 'purchase']
    },
    {
      index:2,
      name: "Items",
      description: "",
      status: "completed",
      isWip: false,
      isComplete: false,
      isError:false,
      hasForm:false,
      component:{
        component: 'ItemComponent',
        data: 'quotes'
      }
    },
    {
      index:3,
      name: "Address",
      description: "",
      status: "completed",
      isWip: false,
      isComplete: false,
      isError:false,
      hasForm:true,
      fields: ['bill_address']
    },
    {
      index:4,
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
      index:5,
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
      index:6,
      name: "Review & Send",
      description: "",
      status: "completed",
      isWip: false,
      isComplete: false,
      isError:false,
      hasForm:true,
      fields: ['name', 'company', 'contact', 'user', 'project']
    }
  ];

  constructor(private _crm:CrmService){}

  ngOnInit(): void {
    const _fp = Purchasing.getBillsProperties()

    this.config = {
      reloaded    : true,
      viewtype    : this.type,
      params      : this.param,
      apiService  : (p, m, n?) => this._crm.purchasing_bills(p, m, n)/* .pipe(tap(res => {
        console.log({fields: res.content.fields})
        console.log(res.content.fields?.map(_f => _f.field));
      })) */,
      title       : Core.Localize("bill", {count: 2}),
      virtualListCols: {visibleCols: ['id', 'name', 'project']},
      modalWidth: "80%",
      statusField: 'status',
      isProcess : true,
      process_form: this.process,
      formProperties  : _fp.formProperties,
      formStructure   : _fp.formStructure,
      defaultColumns: {columns: {state: [
        "name",
        "vendor",
        "bill_date",
        "due_date",
        "currency",
        "base_currency_amt",
        "paid_amount",
        "status",
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

  ngOnDestroy(): void {}
}
