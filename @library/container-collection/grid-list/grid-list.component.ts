import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Optional, Output, ViewChild } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, } from '@angular/router';
import { GridComponent, SharedService, gridDefaultColumns, rowModelType } from '@eagna-io/core';
import { GridListClass } from '@library/class/grid-list.class';
import { IContainerWrapper } from '@library/library.interface';
import { ContainerService } from '@library/service/container.service';
import { WrapperService } from '@library/service/wrapper.service';
import { ContainerComponent } from '../container/container.component';
import { Location } from '@angular/common';
import { DynamicDialogConfig } from 'primeng/dynamicdialog';
import { deepEqual } from 'ts-deep-equal'
import { filter, pairwise, startWith } from 'rxjs';

@Component({
  selector: 'eg-grid-list',
  templateUrl: './grid-list.component.html',
  styleUrls: ['./grid-list.component.scss'],
  providers: [WrapperService, Location],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GridListComponent extends GridListClass implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('wrapContainer') public override wrapContainer : ContainerComponent;
  @Input('data') override data: any;
  @Input('gridListId') gridListId                     : any;
  @Output('gridListIdChange') gridListIdChange        : any = new EventEmitter();
  @Input('selectionOverride') selectionOverride       : boolean = false;
  @Output('selectionChange') selectionChange          : any = new EventEmitter();
  @Input('type') type                                 : "list" | "grid" | "stats" | "stats" = "grid";
  @Input('showHeader') showHeader                     : boolean = true;
  @Input('config') config                             : IContainerWrapper = null;
  @Input('serverOrClient') serverOrClient             : rowModelType = "serverSide";
  @Input('digitsInfo') digitsInfo                     ?: string;
  @Output('configChange') configChange                : any = new EventEmitter();
  private _loc : Location;
  protected showRouterOutlet: boolean = false;
  public selectedFiles      : any = null;
  public visible            : boolean = false;
  public random             : any = Math.random();
  public vCols              : any[];

  @ViewChild('mainGridList') public override grid!: GridComponent;
  private _afterViewInitDone: boolean;
  private _configFormProperties: any = undefined;
  private _detail: {isClosing?: boolean, callbackTriggered?: boolean} = {};
  public renderedType: string;

  @Input() noContainerHeight = false;

  @Input()
  duplicateApiParams: (data: any) => any;
  
  //defaultColumns: { columns?: { state: ColumnState[]|string[]; groupState?: { groupId: string; open: boolean; }[]; }; hiddenCols?: string[]; };
  /* defaultColumns: gridDefaultColumns; */

  constructor(private _wr:WrapperService,
    private _cdr: ChangeDetectorRef,
    private _containerService: ContainerService,
    private _router: Router,
    private _sharedService: SharedService,
    public override _activatedRoute: ActivatedRoute,
    @Optional() private _dialogConfig?: DynamicDialogConfig){
    super(_wr, _cdr);
  }

  trackByFn(index, item) {
    return item.id; // unique id corresponding to the item
  }

  closeSidebar(){
    //console.log("here")
    //this._wr.helperService.gotoPage({pageName: [this.config.baseUrl], extraParams: {}})
    //console.log({closeSidebar: this._activatedRoute});
    /* RT if(!this._detail?.isClosing){
      this._detail = {isClosing: true};
      this._wr.helperService.gotoPage({pageName: ['..'], extraParams: {relativeTo: this._activatedRoute.firstChild, ...(this._sharedService.globalVars?.gridListChanged ? {queryParams: {onRefresh: true}} : {})}})
    } */
  }

  ngOnInit(): void {
    this.rowModelType = this.serverOrClient;

    this.renderedType = this._wr.libraryService.getRenderedType(this._dialogConfig, this.data);

    const withDetailRoute = (this.renderedType == "route");
    this.config = {
      ...this.config,
      withDetailRoute: (this.config?.withDetailRoute != undefined ? this.config?.withDetailRoute : withDetailRoute),
      gridActionsColumnConfig: (this.config?.gridActionsColumnConfig != undefined ? this.config?.gridActionsColumnConfig : {enable: true}),
      params: {...this.config.params, ...(this.serverOrClient == 'clientSide' && !this.config.params?.limit ? {limit: 999} : {} )},
      defaultColumns: {...this.config.defaultColumns, ...(!this.config?.defaultColumns?.hiddenCols ? {hiddenCols: ['id', 'mig_id']} : {})}
    };

    this.api$       = this.config.apiService;
    this.params     = this.config.params;
    this.reloaded   = this.config.reloaded;
    this.viewtype   = this.config.viewtype;
    this.gridId     = this.gridListId;

    this.__initVirtualListDefinition();

    this.container  = this.initContainer(this.config, true, this.noContainerHeight);
    if(this.container != null){
      this.configuring = false;
    }

    //this.container.modalHeight = (this.config?.modalHeight) ? this.config.modalHeight : "80vh";
    /* if(this.config?.modalHeight){
      this.container.modalHeight = this.config.modalHeight;
    } else if(!this.config.noModalHeight){
      this.container.modalHeight = "80vh";
    } */
    this.container.config.hasHeader = this.showHeader;

    this.container.config.cc = this.initComponent();

    if(this.viewtype == "list"){
      this._initVirtualListData();
      this.triggerChangeDetection();
    }else{
      this._initGrid();
      this.triggerChangeDetection();
    }

    this.cc.subs.id("browserDetection").sink = this._router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      startWith(null),
      pairwise(),
      ).subscribe((e: any[]) => {
        this._checkRoute(true);
        // console.log('queryParams', this._activatedRoute?.snapshot?.queryParams);

        if(this._activatedRoute?.snapshot?.queryParams?.['onRefresh']=='true'){
          if(this.config?.addCallback){
            this.config?.addCallback({isConfirmed: true});
          } else{
            this.grid?.refresh();
          }
        }
    });
  }

  public _initGrid(){


    this.reloaded = false;
    this._setApiCallParams(this.params);
    this._initExtGridDefn(this._wr.containerService, this._activatedRoute);

    this.reloaded = true;
  }

  private __initVirtualListDefinition(){
    /* const cols = [
      {field: 'id', header: "name", colId: "id"},
      {field: 'name', header: "name", colId: "name"},
    ]; */

    //const cols = this.config.gridFields?.map( _f => ({field: _f.field, header: "name", colId: _f.field}));
    const items  = [
      {
        label:'View',
        icon:'fa-solid fa-eye',
        command: (event?: any) => {
          this._containerService.dialogAction("view", this.container, this.selected);
        }
      },
      ...(this.config.isReadonly ? [] : [
        {
          label:'Add',
          icon:'fa-solid fa-plus',
          command: (event?: any) => {
            this._containerService.dialogAction("add", this.container, {...this.selected}); //TODO: here
          }
        },
        {
            label:'Edit',
            icon:'fa-solid fa-pencil',
            command: (event?: any) => {
              this._containerService.dialogAction('edit', this.container, this.selected);
            }
        },
        {
            label:'Delete',
            icon:'fa-solid fa-trash',
            command: (event?: any) => {
              this._containerService.dialogAction("delete", this.container, this.selected);
            }
        }
      ])
    ]
    /* RT: moved to class to get it from fields */
    //this.cols   = (this.config?.virtualListCols)? this.config?.virtualListCols : this.config.gridFields?.map( _f => ({field: _f.field, header: "name", colId: _f.field}));
    this.items  = (this.config?.contextMenuItems)? this.config?.contextMenuItems : items;
  }

  public onSelectionChange($event: any, _selected) {
    this.selected = _selected;
    this.selectionChange.emit({event: $event, selected: _selected});

    if(!this.selectionOverride){
      this._containerService.dialogAction("view", this.container, this.selected);
    }
  }

  private _initVirtualListData(){
    this.getData();
    this.triggerChangeDetection();
  }

  public ngAfterViewInit(): void {
    this.grid = this.grid;
    setTimeout(() => {
      this._afterViewInitDone = true;
    });
  }

  public onFiles(event, data){
    const parser = {
      api$    : this.api$,
      id      : data.id,
      files   : data.files
    }
    this.selectedFiles = parser;
    this.visible = !this.visible;
  }

  /* public selected(event){ //console.log('select action here'); } */

  ngOnDestroy(): void {
    this.cc?.subs?.unsubscribe();
  }

  private _checkRoute(triggerChanges = false){
    if(this._afterViewInitDone){
      if(this.config?.withDetailRoute && this.config.withDetailRoute == true){
        const _activeChild = this._activatedRoute.children.length;
        if (_activeChild!=0) {
          this.showRouterOutlet = true;
          this._detail.callbackTriggered = false;
        } else {
          this.showRouterOutlet = false;
          setTimeout(() => {
            /* if(this.config?.addCallback && !this._detail.callbackTriggered){
              this.config?.addCallback();
              this._detail = {...this._detail, callbackTriggered: true};
            } */
            this._detail = {...this._detail, isClosing: false};
          });
        }
        if(triggerChanges){
          this.triggerChangeDetection();
        }
      }
    }
  }

  ngDoCheck(){
    this._checkRoute();

    //console.log("deepEqual", Object.assign({}, this._configFormProperties), Object.assign({}, this.config.formProperties));
    try {
      if(!deepEqual(this._configFormProperties, this.config.formProperties)){
        this._configFormProperties = Object.assign({}, this.config.formProperties);
        //console.log("changed", this._configFormProperties);
        this.container.formProperties = this._configFormProperties;
      }
    } catch (error) {}
  }
}
