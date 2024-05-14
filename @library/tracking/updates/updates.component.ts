import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild, Optional, AfterViewInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { GridComponent, GridResponse, ResponseObj, UserModel } from '@eagna-io/core';

import { DetailsConfig } from '@library/class/details-config';
import { ComponentConfig, DetailsContainerConfig, IAddComponentData, IContainerWrapper, INoDataFound, InPlaceConfig, TrackingConfig } from '@library/library.interface';
import { WrapperService } from '@library/service/wrapper.service';
import { DynamicDialogConfig } from 'primeng/dynamicdialog';
import { TrackingClass } from '../tracking';
import { GridListClass } from '@library/class/grid-list.class';
import { SubSink } from 'subsink2';
@Component({
  selector: 'eg-updates',
  templateUrl: './updates.component.html',
  styleUrls: ['./updates.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UpdatesComponent extends GridListClass implements OnInit, AfterViewInit, OnDestroy {
  @Input('config') config : TrackingConfig
  @Output('configChange') configChange : any = new EventEmitter();

  @ViewChild('commentsListGrid') private _grid!: GridComponent;
  @ViewChild('op') public op : any;

  @ViewChild('vs') public vs : any;


  //public cc             : ComponentConfig;
  //public container      : IContainerWrapper;
  public selectedFiles  : any = null;

  public filesDialogVisible   : boolean = false;
  public detailsConfig        : DetailsConfig;
  public detailsContainer     : DetailsContainerConfig = null;


  /* App Specific */
  //public cols           : any[];
  //public reloaded       : boolean;
  public renderType     : any;

  public localStorage   : UserModel = JSON.parse(this._wr.libraryService.getLocalStorage('user'));
  public formGroup      : FormGroup;
  public inPlaceConf    : InPlaceConfig;
  public isChanged      : boolean;
  public selectedData   : any;
  public selectedType   : any;
  public noDataConfig   : INoDataFound;

  private _subs : SubSink = new SubSink();

  /* constructor(public _wr: WrapperService, private _fb : FormBuilder, @Optional() public dialogConfig: DynamicDialogConfig){} */
  constructor(private _wr:WrapperService, private _cdr: ChangeDetectorRef,  @Optional() public dialogConfig: DynamicDialogConfig, private _fb : FormBuilder){
    super(_wr, _cdr)
  }

  ngOnInit(): void {

    //this.dg         = new DataListGrid(this.config?.api$, this.config.params, this.cc, this.container, this._wr, 'list');
    this.api$       = this.config?.api$;
    this.params     = this.config?.params;
    this.viewtype   = "list";
    this.container  = this.initContainer(this.container);
    this.cc         = this.initComponent();

    this.renderType = this.checkRenderType(this.dialogConfig, null);

    if(this.config.display == "list"){
      this._initVirtualList();
    }else{
      this._initGrid();
    }


     this.noDataConfig = {
      action: "Add",
      message: "No Updates Available",
      hasCallback : false,
      icon:"fa-solid fa-comment-slash"
    }

  }

  trackByFn(index, item) {
    return item.id; // unique id corresponding to the item
 }

  private _initGrid(){
    this._setApiCallParams();
    this._initExtGridDefn(this._wr.containerService);
    this.reloaded = true;
  }

  private _initVirtualList(){
    this.cols = ['image', 'content']
    this.getData();

  }

  private _initFormProperty(){
    let temp : IAddComponentData = {
      mode : "view",
      formProperties: TrackingClass.getFormProperties(),
      formStructure : ['name', 'user', 'priority', 'status', 'project', 'files']
    }
    return temp;
  }

  public ngAfterViewInit(): void {
    this.grid = this._grid;
  }

  public delete(req){
    this.manageData(req, "delete")
  }

  public update(req, method){
    this.manageData(req, method);
  }

  public edit(data, type){
    console.log(data);

    const temp : IContainerWrapper = {
      apiService : (p, m, n) => {
        return this.config.api$(p, m, n);
      },
      title: "Updates",
      params :{id:data.id},
      formProperties : this._initFormProperty()['formProperties'],
      formStructure : this._initFormProperty()['formStructure'],

    }
    this._addNewItem(temp, "view", data);

  }

  public afterSaved(isChanged){
    if(isChanged){
      this.getData();
    }
  }

  public _addNewItem(p: IContainerWrapper, mode: "view" | "add" | "edit" | "delete", data ){
    //const subApi = api$(param, method, nextUrl);
    console.log(p.params)
    this._subs.sink = (p.apiService({}, 'post').subscribe((res: ResponseObj<GridResponse>) => {
      const iContainerWrapper: IContainerWrapper = {
        apiService: p.apiService,
        permission: res.content?.permission,
        gridFields: res.content?.fields,
        title: data?.id + ' - update',
        params: (p?.params || {}),
        noModalHeight: p.noModalHeight == true,

        addCallback: (p2) => {
          /* console.log(p2) */
          if(p2?.isConfirmed){

          }
        },
        ...(p.formProperties ? {formProperties: p.formProperties} : {}),
        ...(p.formStructure ? {formStructure: p.formStructure} : {}),
        ...(p.detailComponent ? {detailComponent: p.detailComponent} : {}),
      };
      this._wr.containerService.dialogAction(mode, iContainerWrapper, data);
    }));
  }

  ngOnDestroy(): void {
    this.destroy();
  }

}
