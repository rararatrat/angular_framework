import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { IContainerWrapper } from '@library/library.interface';
import { CrmService } from '../../crm.service';
import { Core, GridResponse, ResponseObj } from '@eagna-io/core';
import { Contacts } from '../contacts';
import { CompanyDetailComponent } from './company-detail/company-detail.component';
import { WrapperService } from '@library/service/wrapper.service';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';

@Component({
  selector: 'eg-company',
/*   templateUrl: './company.component.html',
  styleUrls: ['./company.component.scss']
  */
  template: `<eg-grid-list [gridListId]="'grid-contacts-company'"
                [type]="type"
                [showHeader]="true"
                [(config)]="config">
              </eg-grid-list>`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CompanyComponent implements OnInit, OnDestroy {
  public type   : "list" | "grid" | "stats" = "grid";
  public config : IContainerWrapper;
  public form : any =  Contacts.getOrgFormProperties();

  constructor(private _crm:CrmService,
    private _wr: WrapperService,
    private _activatedRoute: ActivatedRoute
    ){

  }

  ngOnInit(): void {
    this.config = {
      reloaded : true,
      viewtype: this.type,
      params : {},
      apiService : (p, m, n?) => this._crm.contactOrg(p, m, n)/* .pipe((map((res: ResponseObj<GridResponse>) => {
        let _i = 1;
        let _j = 1;
        res.content.results = res.content.results.map(d => {
          const _d = {...d, position: (((_i++ % 2) == 0) ? (_j++ + (0.1)) : _j )};
          console.log({_d});
          return _d;
        });
        return res;
      }))) */,
      title : Core.Localize("company"),
      detailComponent: CompanyDetailComponent,
      baseUrl: "/crm/contacts/company",
      modalWidth: "80%",
      modalHeight: "90%",
      formProperties  : this.form['formProperties'],
      includedFields  : this.form['includedFields'],
      formStructure   : this.form['formStructure'],
      defaultColumns: {columns: {state: [
        "name",
        "contact_partner",
        "email",
        "phone",
        "website",
        "actions"
      ]}}
    }
  }
  ngOnDestroy(): void {

  };

}
