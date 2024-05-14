import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { IContainerWrapper } from '@library/library.interface';
import { ProfileService } from '../profile.service';
import { Core } from '@eagna-io/core';
import { tap } from 'rxjs';
import { Profile } from '../profile.static';

@Component({
  selector: 'eg-approval-list',
  template: `<eg-grid-list [gridListId]="'profile_approval_list_grid'"
              [type]="type"
              [showHeader]="true"
              [(config)]="config">
            </eg-grid-list>`,

  changeDetection: ChangeDetectionStrategy.OnPush
})
/* templateUrl: './approval-list.component.html',
styleUrls: ['./approval-list.component.scss'], */
export class ApprovalListComponent implements OnInit, OnDestroy {

  public type   : "list" | "grid" | "stats" = "grid";
  public config : IContainerWrapper;

  constructor(private _profile: ProfileService){
    const _fp = Profile.getApprovalHistoryFormProperties();
    this.config = {
      reloaded : true,
      viewtype: "grid",
      params : {},
      apiService : (p, m, n?) => this._profile.approvals(p, m, n),
      title : Core.Localize("approval_history"),
      noModalHeight: true,
      withDetailRoute: false,
      formProperties: _fp.formProperties,
      formStructure: _fp.formStructure
    }
  }


  ngOnInit(): void {

  }

  ngOnDestroy(): void {

  }
}
