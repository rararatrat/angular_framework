import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { IContainerWrapper, IProcessForm } from '@library/library.interface';
import { CrmService } from '../../crm.service';
import { Core } from '@eagna-io/core';
import { QuotesCrudComponent } from './quotes-crud/quotes-crud.component';
import { GridListComponent } from '@library/container-collection/grid-list/grid-list.component';
import { Quotes } from './quotes';

@Component({
  selector: 'eg-quotes',
  template: `<eg-grid-list #gridList [gridListId]="'grid-sales-quotes'"
                [type]="type"
                [showHeader]="true"
                [duplicateApiParams]="duplicateApiParams"
                [(config)]="config">
              </eg-grid-list>`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class QuotesComponent{
  @Input('param') param : any = {};
  @Output('paramChange') paramChange : any = new EventEmitter();
  @ViewChild('gridList') gridList: GridListComponent;

  public type       : "list" | "grid" | "stats" = "grid";
  public config     : IContainerWrapper;
  public process    : IProcessForm[];
  public form       = Quotes.getFormProperties();

  constructor(private _crm:CrmService){}

  ngOnInit(): void {
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
        fields: ['name', 'company', 'contact', 'user', 'project' /*, 'is_valid_from','is_valid_until' */]
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
        fields: ['payment_type', /* RT 'kb_terms_of_payment' */, 'is_valid_from','is_valid_until']
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
        fields: ['delivery_address', 'invoice_address']
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

    this.config = {
      reloaded : true,
      viewtype: this.type,
      params : this.param,
      apiService : (p, m, n?) => this._crm.sales_quotes(p, m, n),
      title : Core.Localize("quote", {count: 2}),
      detailComponent: QuotesCrudComponent,
      /* addEditComponent: QuotesNewComponent, */
      virtualListCols: {visibleCols: ['id', 'name', 'project']},
      modalWidth: "80%",
      statusField: 'status',
      isProcess : true,
      process_form: this.process,
      formProperties  : this.form['formProperties'],
      formStructure   : this.form['formStructure'],
      defaultColumns: {columns: {state: [
        "name",
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
        "mwst_is_net",
        "show_position_taxes",
        "is_valid_from",
        "is_valid_until",
        "total_w_tax",
        "total_wo_tax",
        "show_total",
        "invoice_address",
        "delivery_address",
        "tax",
        "network_link",
        "status",
        "updated_at",
        "template_slug",
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

  ngOnDestroy(): void {}
}
