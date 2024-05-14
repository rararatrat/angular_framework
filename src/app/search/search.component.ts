import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Router, ActivatedRoute, ActivatedRouteSnapshot, Data, Params, NavigationEnd } from '@angular/router';
import { RouteObserverService, SubSink } from '@eagna-io/core';
import { WrapperService } from '@library/service/wrapper.service';
import { CrmService } from '../crm/crm.service';

@Component({
  selector: 'eg-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent extends RouteObserverService implements OnInit, OnDestroy {

  private _subs   : SubSink = new SubSink();
  public data     : any     = null;
  public pages    : any     = null;
  public isLoading  : boolean = true;

  constructor(  private _wr   : WrapperService,
                private _crm  : CrmService,
                private _cdr  : ChangeDetectorRef,
                public _router: Router,
                public _route : ActivatedRoute){
    super(_route, _router)
  }

  onRouteReady(event?: any[]): void {
    console.log(event)
  }
  onRouteReloaded(event?: NavigationEnd): void {}

  ngOnInit(): void {

    this._subs.sink = this._crm.purchasing_bills({limit:10}, "post").subscribe({
      next      : (res) => {
        this.data   = res.content;
        this.pages  = res.content.page
      },
      complete  : ()    => {
        this.isLoading = false;
      },
      error     : (err)  => {

      }
    })

  }

  override ngOnDestroy(): void {
    this._subs.unsubscribe();
  }

}
