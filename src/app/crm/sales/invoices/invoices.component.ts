import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { IContainerWrapper, IProcessForm } from '@library/library.interface';
import { CrmService } from '../../crm.service';
import { Core } from '@eagna-io/core';
import { InvoicesCrudComponent } from './invoices-crud/invoices-crud.component';
import { Invoices } from './invoices';

@Component({
  selector: 'eg-invoices',
  /* templateUrl: './invoices.component.html',
  styleUrls: ['./invoices.component.scss'] */
  template: `<eg-grid-list [gridListId]="'grid-sales-invoices'"
                [type]="type"
                [showHeader]="true"
                [(config)]="config">
              </eg-grid-list>`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InvoicesComponent implements OnInit, OnDestroy {
  @Input('param') param : any = {};
  @Output('paramChange') paramChange : any = new EventEmitter();

  public type     : "list" | "grid" | "stats" = "grid";
  public config   : IContainerWrapper;
  public process  : IProcessForm[];
  public form     = Invoices.getFormProperties();

  constructor(private _crm:CrmService){

  }

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
        fields: ['name', 'company', 'contact', 'user', 'project', 'is_valid_from']
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
        fields: [/* 'payment_type', 'kb_terms_of_payment', 'is_valid_from','is_valid_until' */]
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
          data: 'invoices'
        }
      },
      {
        index:3,
        name: "Incoming Payments & Credit Notes",
        description: "",
        status: "completed",
        isWip: false,
        isComplete: false,
        isError:false,
        hasForm:false,
        component:{
          component: 'SalesPositionComponent',
          data: 'invoices'
        }
      },
      {
        index:4,
        name: "Payment Reminders",
        description: "",
        status: "completed",
        isWip: false,
        isComplete: false,
        isError:false,
        hasForm:false,
        component:{
          component: 'SalesPositionComponent',
          data: 'invoices'
        }
      },
      {
        index:5,
        name: "Address",
        description: "",
        status: "completed",
        isWip: false,
        isComplete: false,
        isError:false,
        hasForm:true,
        fields: [/* 'delivery_address', 'invoice_address' */]
      },
      {
        index:6,
        name: "Settings",
        description: "",
        status: "completed",
        isWip: false,
        isComplete: false,
        isError:false,
        hasForm:true,
        fields: [/* 'show_position_taxes', 'show_total', 'bank_account', 'currency',
        'mwst_type', 'mwst_is_net' */]

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
        fields: [/* 'title', 'header', 'footer','language' */]

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

    ];

    this.config = {
      reloaded : true,
      viewtype: this.type,
      params : this.param,
      apiService : (p, m, n?) => this._crm.sales_invoices(p, m, n),
      title : Core.Localize("invoice", {count: 2}),
      detailComponent: InvoicesCrudComponent,
      /* addEditComponent: InvoicesCrudComponent, */
      isProcess: true,
      process_form: this.process,
      modalWidth: "80%",
      statusField: 'status',
      formProperties  : this.form['formProperties'],
      formStructure   : this.form['formStructure'],
      defaultColumns: {columns: {state: [
        "title",
        "company",
        "contact",
        "user",
        "project",
        "payment_type",
        "kb_terms_of_payment",
        "old_terms_of_payment_id",
        "tax",
        "is_valid_from",
        "is_valid_until",
        "mwst_type",
        "mwst_is_net",
        "total_rounding_difference",
        "total_w_tax",
        "total_taxes",
        "total_wo_tax",
        "paid",
        "balance",
        "total_credit_notes",
        "invoice_address",
        "delivery_address",
        "esr_id",
        "qr_invoice_id",
        "status",
        "created_on",
        "updated_at",
        "positions",
        "actions"
      ]}}
    }
  }

  ngOnDestroy(): void {}
}
