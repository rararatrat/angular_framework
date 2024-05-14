import { AfterViewInit, ChangeDetectionStrategy, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { IContainerWrapper } from '@library/library.interface';
import { CrmService } from '../../crm.service';
import { Core } from '@eagna-io/core';
import { Contacts } from '../contacts';
import { PeopleDetailComponent } from './people-detail/people-detail.component';
import { GridListComponent } from '@library/container-collection/grid-list/grid-list.component';
import { WrapperService } from '@library/service/wrapper.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'eg-people',
  /* templateUrl: './people.component.html',
  styleUrls: ['./people.component.scss'] */
  template: `<eg-grid-list #gridList [gridListId]="'grid-contacts-people'"
              [type]="type"
              [showHeader]="true"
              [(config)]="config">
            </eg-grid-list>`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PeopleComponent implements OnInit, OnDestroy {
  @ViewChild('gridList') private _gridList: GridListComponent;
  public type   : "list" | "grid" | "stats" = "grid";
  public config : IContainerWrapper;
  public form : any;

  constructor(private _crm:CrmService,
    private _ws: WrapperService,
    private _activatedRoute: ActivatedRoute
    ){
      this.form = Contacts.getContactFormProperties()
      this.config = {
        reloaded : true,
        viewtype: this.type,
        params : {},
        apiService : (p, m, n?) => this._crm.contactPeople(p, m, n),
        title : Core.Localize("contact"),
        detailComponent: PeopleDetailComponent,
        formProperties  : this.form['formProperties'],
        includedFields  : this.form['includedFields'],
        formStructure   : this.form['formStructure'],
        baseUrl: "/crm/contacts/people",
        defaultColumns: {columns: {state: [
          "first_name",
          "last_name",
          "language",
          "email",
          "phone",
          "company",
          "contact_partner",
          "actions"
        ]}}
      }
  }

  ngOnInit(): void {
    console.log(this.form)
  }

  ngOnDestroy(): void {}
}
