import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { IContainerWrapper, IProcessForm } from '@library/library.interface';
import { CrmService } from '../../crm.service';
import { Core } from '@eagna-io/core';
import { CreditNotesCrudComponent } from './credit-notes-crud/credit-notes-crud.component';
import { CreditNotes } from './credit-notes';

@Component({
  selector: 'eg-credit-notes',
  /* templateUrl: './credit-notes.component.html',
  styleUrls: ['./credit-notes.component.scss'], */
  template: `<eg-grid-list [gridListId]="'grid-sales-credit-notes'"
                [type]="type"
                [showHeader]="true"
                [(config)]="config">
              </eg-grid-list>`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreditNotesComponent implements OnInit, OnDestroy {
  @Input('param') param : any = {};
  @Output('paramChange') paramChange : any = new EventEmitter();

  public type   : "list" | "grid" | "stats" = "grid";
  public config : IContainerWrapper;
  public process      : IProcessForm[];
  public form   = CreditNotes.getFormProperties();

  constructor(private _crm:CrmService){

  }

  ngOnInit(): void {
    this.process = [
      {
        index:0,
        name: "Details",
        description: "More details",
        status: "completed",
        isWip: false,
        isComplete: false,
        isError:false,
        hasForm:true,
        fields: ['name', 'company', 'contact', 'user', 'project']
      },
      {
        index:3,
        name: "Outgoing payments & Invoices",
        description: "More details",
        status: "completed",
        isWip: false,
        isComplete: false,
        isError:false,
        hasForm:true,
        fields:[]
      },
      {
        index:2,
        name: "Items",
        description: "More details",
        status: "completed",
        isWip: false,
        isComplete: false,
        isError:false,
        hasForm:false,
        component:{
          component: 'ItemComponent',
          data: 'creditnotes'
        }
      },
      {
        index:3,
        name: "Address",
        description: "More details",
        status: "completed",
        isWip: false,
        isComplete: false,
        isError:false,
        hasForm:true,
        fields: [/* 'delivery_address', 'invoice_address' */]
      },
      {
        index:4,
        name: "Settings",
        description: "More details",
        status: "completed",
        isWip: false,
        isComplete: false,
        isError:false,
        hasForm:true,
        fields: [/* 'show_position_taxes', 'show_total', 'bank_account', 'currency',
        'mwst_type', 'mwst_is_net' */]

      },
      {
        index:5,
        name: "Template",
        description: "More details",
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
        description: "More details",
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
      viewtype: this.type,
      params : this.param,
      apiService : (p, m, n?) => this._crm.sales_credit_notes(p, m, n),
      title : Core.Localize("credit_note", {count: 2}),
      /* detailComponent: CreditNotesDetailComponent,
      formProperties: Sales.getCreditNotesProperties() */
      /* addEditComponent: CreditNotesCrudComponent, */
      detailComponent: CreditNotesCrudComponent,
      isProcess       : true,
      process_form    : this.process,
      modalWidth      : "80%",
      statusField     : 'status',
      formProperties  : this.form['formProperties'],
      formStructure   : this.form['formStructure']
    }
  }

  ngOnDestroy(): void {

  }

}
