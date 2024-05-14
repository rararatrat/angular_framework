import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { IContainerWrapper } from '@library/library.interface';
import { ProfileService } from '../profile.service';
import { Core } from '@eagna-io/core';

@Component({
  selector: 'eg-groups',
  template: `<eg-grid-list [gridListId]="'profile_groups_grid'"
              [type]="type"
              [showHeader]="true"
              [(config)]="config">
            </eg-grid-list>`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
/*   templateUrl: './groups.component.html',
  styleUrls: ['./groups.component.scss'] */
export class GroupsComponent  implements OnInit, OnDestroy {

  public type   : "list" | "grid" | "stats" = "grid";
  public config : IContainerWrapper;

  constructor(private _profile: ProfileService){

    this.config = {
      reloaded : true,
      viewtype: "grid",
      params : {},
      apiService : (p, m, n?) => this._profile.groups(p, m, n),
      title : Core.Localize("my_group", {count: 2}),
      /* modalHeight: "95vh", */
      withDetailRoute: false
    }
  }


  ngOnInit(): void {

  }

  ngOnDestroy(): void {

  }
}
