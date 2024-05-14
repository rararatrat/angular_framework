import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { IContainerWrapper } from '@library/library.interface';
import { CrmService } from '../../crm.service';
import { Core } from '@eagna-io/core';
import { OpenPositionDetailComponent } from './open-position-detail/open-position-detail.component';
import { Accounting } from '../accounting.static';

@Component({
  selector: 'eg-open-position',
  /* templateUrl: './open-position.component.html',
  styleUrls: ['./open-position.component.scss'] */
  template: `<eg-grid-list [gridListId]="'grid-accounting-open-positions'"
                [type]="type"
                [showHeader]="true"
                [(config)]="config">
              </eg-grid-list>`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OpenPositionComponent implements OnInit, OnDestroy {
  public type   : "list" | "grid" | "stats" = "grid";
  public config : IContainerWrapper;

  constructor(private _crm:CrmService){
    const _form = Accounting.getOpenPositionFormProperties();
    this.config = {
      reloaded : true,
      viewtype: this.type,
      params : {},
      formProperties: _form.formProperties,
      formStructure: _form.formStructure,
      apiService : (p, m, n?) => this._crm.open_positions(p, m, n),
      title : Core.Localize("open_position"),
      noModalHeight: true,
      withDetailRoute: false,
    }
  }

  ngOnInit(): void {}

  ngOnDestroy(): void {}
}
