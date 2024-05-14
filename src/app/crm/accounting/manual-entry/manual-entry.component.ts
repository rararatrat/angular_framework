import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { IContainerWrapper } from '@library/library.interface';
import { CrmService } from '../../crm.service';
import { Core } from '@eagna-io/core';
import { Accounting } from '../accounting.static';
import { GridListComponent } from '@library/container-collection/grid-list/grid-list.component';

@Component({
  selector: 'eg-manual-entry',
  template: `<eg-grid-list #gridList [gridListId]="'grid-accounting-manual-entry'"
                [type]="type"
                [showHeader]="true"
                [(config)]="config">
              </eg-grid-list>`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ManualEntryComponent implements OnInit, OnDestroy {
  public type   : "list" | "grid" | "stats" = "grid";
  public config : IContainerWrapper;

  @ViewChild('gridList') gridList: GridListComponent;

  constructor(private _crm:CrmService){
    const _form = Accounting.getManualEntryFormProperties();
    this.config = {
      reloaded : true,
      viewtype: this.type,
      params : {},
      formProperties: _form.formProperties,
      formStructure: _form.formStructure,
      noModalHeight: true,
      apiService : (p, m, n?) => this._crm.manual_entries(p, m, n),
      title : Core.Localize("manual_entry")
    }
  }

  ngOnInit(): void {}

  ngOnDestroy(): void {}
}
