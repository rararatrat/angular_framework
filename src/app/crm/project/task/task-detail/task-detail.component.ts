import { ChangeDetectorRef, Component, Input, OnInit, Optional } from '@angular/core';
import { ConfirmDialogResult, Core, GridResponse, HelperService, ResponseObj, RouteObserverService, SharedService, apiMethod } from '@eagna-io/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { DetailsContainerConfig, IAddComponentData, IContainerWrapper, IStatsChart, InPlaceConfig, objArrayType } from '@library/library.interface';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DetailsConfig } from '@library/class/details-config';
import { ActivatedRoute, ActivatedRouteSnapshot, Data, NavigationEnd, Params, Router } from '@angular/router';
import { WrapperService } from '@library/service/wrapper.service';
import { CrmService } from '../../../crm.service';
import { tap } from 'rxjs';
import { Project } from '../../project.static';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';

@Component({
  selector: 'eg-task-detail',
  templateUrl: './task-detail.component.html',
  styleUrls: ['./task-detail.component.scss']
})
export class TaskDetailComponent extends RouteObserverService implements OnInit {
  @Input() id   : any = null;
  @Input() data : any = null; // input should be the same as GridResponse
  @Input() fields: any;
  @Input() permission: any;

  api = (p?: any, method?: apiMethod, nextUrl?) => this._crmService.project_tasks(p, method, nextUrl);

  private _ref: DynamicDialogRef;
  public isChanged: boolean;
  public objArray: any;
  public editingField: string;
  public formGroup: FormGroup;
  public inPlaceConf: InPlaceConfig;
  rangeDates: Date[];

  public statistics         : IStatsChart[];
  private _addParams: IContainerWrapper;
  private _gridResponse: ResponseObj<GridResponse>;
  /* private _hasChecked       : Boolean = false; */

  constructor(
    private _activatedRoute: ActivatedRoute,
    private _fb     : FormBuilder,
    private _wr     : WrapperService,
    private _router : Router,
    private _crmService: CrmService,
    private _cdr: ChangeDetectorRef,
    private _sharedService: SharedService,
    @Optional() public ref: DynamicDialogRef,
    @Optional() public dialogConfig: DynamicDialogConfig) {
      super(_activatedRoute, _router);
      this._sharedService.globalVars.gridListChanged = false;
    }

  public config             : DetailsContainerConfig = null;
  public detailsConfig      : DetailsConfig;
  /* public isLoading          : boolean = true; */

  override onRouteReady(event?: any[], snapshot?: ActivatedRouteSnapshot, rootData?: Data, rootParams?: Params): void {}

  override onRouteReloaded(event?: NavigationEnd, snapshot?: ActivatedRouteSnapshot, rootData?: Data, rootParams?: Params): void {
    this.initDetailsContainer(this.snapshotParams?.['id']);
  }

  ngOnInit(): void {
    this.snapshotLoaded = true;
    this.initDetailsContainer();
  }

  /* initFormProperty(){
    let temp : IAddComponentData = {
      mode : "view",
      formProperties: {
        creator   : {autoConfig :  {title: 'name',  description: 'email', image:{linkToImage:"picture"}, saveField: "id"}, displayVal: "creator.name"},
        type      : {type: "select", autoConfig :  {title: 'name',  description: 'name', saveField: "id", extraKey:"task_type"}, displayVal: "type.name"},
        status    : {autoConfig :  {title: 'name',  description: 'name', saveField: "id", extraKey:"status"}, displayVal: "status.name"},
        priority  : {type:"select", autoConfig: {title: 'name',  extraKey:"priority", saveField: "id"}, displayVal: "priority.name"},
        resources : {type:"multiselect", autoConfig: {title: 'name',  extraKey:"name", saveField: "id", image:{linkToImage:"picture", avatarGroup:true}}, displayVal: "resources.name"}
        // project: {autoConfig: {title: 'name', formProperty: {}}},
        // type: {autoConfig: {title: 'name', formProperty: {}}},
      }
    }
    return temp;
  } */

  initDetailsContainer(newId?) {
    const _fp = Project.getTaskFormProperties();
    const _addLabel = Core.Localize('add_new', {item: Core.Localize('task')});

    this.config = {
      showNavbar    : false,
      hasHeader     : true,
      header        : Core.Localize('task_detail'),
      subheader     : Core.Localize('task_detail'),
      dialogConfig  : this.dialogConfig,
      detailBarExpanded: true,
      dialogRef     : this.ref,
      /* data          : this.data, */
      itemId        : (newId || this.id || this._activatedRoute?.snapshot?.params?.['id']),
      actionItems   : [
        {
          label: _addLabel,
          icon: "fa-solid fa-square-plus",
          styleClass : "text-lg",
          command: (event) => {
            this._addParams = {
              res: this._gridResponse,
              gridFields: this._gridResponse?.content?.fields,
              permission: this._gridResponse.content?.permission,
              apiService: (p, m?) => this.api(p, m),
              title: _addLabel,
              formProperties: _fp.formProperties, formStructure: _fp.formStructure, lockedFields: _fp.lockedFields,
              initValue: {type: 'Task'},
              modalWidth: '80vw',
              noModalHeight: true
            };
    
            this._wr?.containerService?.addAction(this._addParams, 'add', this._addParams.initValue);
          },
        },
        {
          label: Core.Localize('delete', {item: Core.Localize('item')}),
          icon: "fa-solid fa-trash",
          styleClass : "text-lg",
          command: (event) => {
            console.log({data: this.detailsConfig?.data});
            this._wr.confirmationService.confirm({
              message: Core.Localize('confirmDeleteMessage'),
              header: Core.Localize('deleteConfirmationHeader'),
              icon: 'pi pi-info-circle',
              accept: () => {
                  this.subscription.add(this.api?.({id: this.detailsConfig?.data?.id}, 'delete')?.subscribe(res => {
                    this._wr.messageService?.add({summary: Core.Localize('stateSuccessfully', {state: Core.Localize('deleted')})});
                    this._wr.helperService.gotoPage({pageName: ['..'], extraParams: {relativeTo: this._activatedRoute, queryParams: {onRefresh: true}}})
                  }));
              },
              acceptLabel: Core.Localize('yes'),
              rejectLabel: Core.Localize('no'),
            });
          },
        },
      ],
      params : ['task', 'project'],
      detailsApi$    : (param, method, nextUrl)   => this.api(param, method, nextUrl).pipe(tap((res: ResponseObj<GridResponse>)=> {
        this._gridResponse = res;
        this.data = res.content?.results?.[0];
      })),
      hasUpdates    : true,
      updateApi$    : (param, method, nextUrl)   => {
        return this._crmService.project_updates(param, method, nextUrl);
      },
      hasComments   : true,
      commentsApi$  : (param, method, nextUrl)   => {
        return this._crmService.project_comments(param, method, nextUrl);
      },
      hasLogs       : true,
      logsApi$      : (param, method, nextUrl)   => {
        return this._crmService.project_logs(param, method, nextUrl);
      },
      formProperty   : {
        formProperties: _fp.formProperties,
        formStructure: _fp.formStructure, 
        lockedFields: _fp.lockedFields}
    };

    this.detailsConfig  = new DetailsConfig({config: this.config, fb: this._fb, wr: this._wr, cdr: this._cdr});
  }

  public afterSaved(isChanged){
    this.isChanged = isChanged;
    if(this.dialogConfig?.data){
      this.dialogConfig.data.isChanged = isChanged;
    }
    this._sharedService.globalVars.gridListChanged = isChanged;
  }

  ngAfterViewChecked(){}
}
