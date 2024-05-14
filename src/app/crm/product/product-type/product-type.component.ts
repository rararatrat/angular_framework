import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { IContainerWrapper } from '@library/library.interface';
import { CrmService } from '../../crm.service';
import { Core } from '@eagna-io/core';

@Component({
  selector: 'eg-product-type',
  /* templateUrl: './product-type.component.html',
  styleUrls: ['./product-type.component.scss'], */
  template: `<eg-grid-list [gridListId]="'grid-product-type'"
                [type]="type"
                [showHeader]="true"
                [(config)]="config">
              </eg-grid-list>`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductTypeComponent implements OnInit, OnDestroy {
  public type   : "list" | "grid" | "stats" = "grid";
  public config : IContainerWrapper;

  constructor(private _crm:CrmService){

    this.config = {
      reloaded : true,
      viewtype: this.type,
      params : {},
      apiService : (p, m, n?) => this._crm.product_type(p, m, n),
      title : Core.Localize("product_type"),
      noModalHeight: true,
      withDetailRoute: false
    }
  }

  ngOnInit(): void {

  }

  ngOnDestroy(): void {

  }

}
