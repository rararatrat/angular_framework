import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { IContainerWrapper } from '@library/library.interface';
import { CrmService } from '../../crm.service';
import { Core } from '@eagna-io/core';
import { AccountDetailComponent } from './account-detail/account-detail.component';
import { Accounting } from '../accounting.static';

@Component({
  selector: 'eg-account',
  template: `
  <eg-grid-list [gridListId]="'grid-accounting-account'"
                [type]="type"
                [showHeader]="true"
                [(config)]="config">
              </eg-grid-list>`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AccountComponent implements OnInit, OnDestroy {
  public type   : "list" | "grid" | "stats" = "grid";
  public config : IContainerWrapper;

  images: any[];
  responsiveOptions: any[];
  
  constructor(private _crm:CrmService){
    const _form = Accounting.getStandardFormProperties();
    this.config = {
      reloaded : true,
      viewtype: this.type,
      params : {},
      formProperties: _form.formProperties,
      formStructure: _form.formStructure,
      apiService : (p, m, n?) => this._crm.account_standards(p, m, n),
      title : Core.Localize("account"),
      noModalHeight: true
    }
  }

  ngOnInit(): void {}

  ngOnDestroy(): void {}
}
