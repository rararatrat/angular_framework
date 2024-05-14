import { Component, OnDestroy, OnInit, Optional } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { RouteObserverService } from '@eagna-io/core';
import { DetailsConfig } from '@library/class/details-config';
import { DetailsContainerConfig } from '@library/library.interface';
import { WrapperService } from '@library/service/wrapper.service';
import { DynamicDialogConfig } from 'primeng/dynamicdialog';
import { SettingsService } from '../../settings.service';
import { ConfigStatic } from '../configuration.static';

@Component({
  selector: 'eg-org-details',
  templateUrl: './org-details.component.html',
  styleUrls: ['./org-details.component.scss']
})
export class OrgDetailsComponent  extends RouteObserverService implements OnInit, OnDestroy {
  public detailsConfig        : DetailsConfig;
  public detailsContainer     : DetailsContainerConfig = null;
  public data                 : any;
  public isChanged            : boolean;
  public section              : any = {header:null, content:null};
  public mode                 : "add" | "view" | "edit" = "view";
  public form                 : any = ConfigStatic.getOrgFormProperties();


  constructor(private _settings               : SettingsService,
              private _wr                     : WrapperService,
              private _router                 : Router,
              private _route                  : ActivatedRoute,
              @Optional() public dialogConfig : DynamicDialogConfig,
              @Optional() private _fb         : FormBuilder){

                super(_route, _router)
              }

  onRouteReady(event, snapshot, root, params): void{}
  onRouteReloaded(event, snapshot, root, params): void{}

  ngOnInit(): void {
    this._initDetailsContainer(null);
  }

  trackByFn(index, item) {
    return item.id; // unique id corresponding to the item
  }

  private _initDetailsContainer(data) {
    this.detailsContainer = {
      navbarExpanded: false,
      hasHeader     : false,
      header        : "Manage Details",
      subheader     : "View Your Updates Here",
      dialogConfig  : this.dialogConfig,
      data          : data,
      itemId        : this.snapshotParams['orgId'],
      detailsApi$    : (param, method, nextUrl)   => {
        return this._settings.org_organization(param, method, nextUrl);
      },
      hasUpdates    : false,
      hasComments   : false,
      hasLogs       : false,
      formProperty  : {
        formProperties : this.form.formProperties,
        formStructure : this.form.formStructure
      }
    };
    this.section['header']  = ConfigStatic.OrgHeaders;
    this.section['content'] = ConfigStatic.OrgSections;
    this.detailsConfig      = new DetailsConfig({config: this.detailsContainer, fb: this._fb, wr: this._wr});

  }

  public afterSaved(isChanged){}
  
  override ngOnDestroy(): void {

  }

}
