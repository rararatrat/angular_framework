import { FormControl } from '@angular/forms';
import { ComponentConfig, ContainerConfig, IContainerWrapper, StateTabs } from '@library/library.interface';
import { VirtualScroller } from 'primeng/virtualscroller';
import { SubSink } from 'subsink2';
import {MenuItem} from 'primeng/api';
import { WrapperService } from '@library/service/wrapper.service';
import { ApiCallParams, Core, ExtendedGridDefinition, GridComponent, GridResponse, ResponseObj, rowModelType } from '@eagna-io/core';
import { Observable, tap } from 'rxjs';
import { GridReadyEvent } from 'ag-grid-community';
import { ChangeDetectorRef } from '@angular/core';
import { ContainerService } from '@library/service/container.service';
import { ActivatedRoute } from '@angular/router';
import { ContainerComponent } from '@library/container-collection/container/container.component';

export class GridListClass {

  public listTaskItem2        : any;

  public api$       : (param?:any, method?:any, nextUrl?:any) => Observable<any>;
  public context    : any;
  public params     : any;
  public cc         : ComponentConfig = null;
  public container  : IContainerWrapper;

  /* Grid Properties */
  public grid         : GridComponent = null;
  public extGridDefn  : ExtendedGridDefinition;
  public gridParams   ?: GridReadyEvent<any>;
  public apiCallParams: ApiCallParams;

  /* Virtual List Properties */
  public data           : any = [];
  public list           : any = null;
  public listColumns    : any[] = [];
  public virtualList    : any[] = [];
  public itemLoading    : boolean = false;

  public isVisible      : boolean = false;
  public search         : FormControl = new FormControl();


  public isDisabled     : boolean = false;
  public activeIndex    : number = null;
  public viewDetail     : boolean = false;

  public items          : MenuItem[];
  public selected       : any;
  public cols           : any[];

  private _ws           : WrapperService;
  private _cd           : ChangeDetectorRef;
  public viewtype       : "grid" | "list" | "stats" = "grid";
  public hasData        : boolean = false;
  public colIdToSort    : any = 'id';
  public reloaded       : boolean = true;
  public rowModelType   : rowModelType = "serverSide";

  public configuring    : boolean = true;
  public gridId         : any;
  public wrapContainer  : ContainerComponent;
  public _activatedRoute: ActivatedRoute;

  constructor(wr: WrapperService, cd: ChangeDetectorRef){
    this._ws        = wr;
    this._cd        = cd;
    if(this.viewtype == "list" && !this.params.hasOwnProperty('limit')) {
      this.params     = {limit:50, ...this.params};
    } else {
      this.params = this.params
    }
  }

  public checkRenderType(dialog, data){
    /* if(dialog != null && dialog.data != undefined){
      return "dialog";
    }else
      if(data == null){
        return "route";
      }else {
      return "component";
    } */
    return this._ws.libraryService?.getRenderedType(dialog, data);
  }

  public triggerChangeDetection() {
    this._cd.markForCheck(); // Marks the component and its ancestors as dirty
    this._cd.detectChanges(); // Triggers change detection for the component and its descendants
  }

  /* Methods for Grid */

  public _apiService = (p, m?, n?) => {
    return this.api$?.(p, m, n).pipe(tap((res: ResponseObj<GridResponse>) => {
      if(res?.content?.results){
        res.content.results = res?.content?.results.map(r => ({...r}));
        this.cc.isLoading = false;
        //this.triggerChangeDetection();
      }
    }));
  };

  public _setApiCallParams(param?){
    let obj = (param != null)?{...param, ...this.params}: this.params;
    this.apiCallParams = { api: (p, m?) => {
      /* const p2 = {...obj, ...p}
      return this._apiService(p2, m)?.pipe(tap((res: ResponseObj<GridResponse>) => { */
      const param = {...obj, ...p}
      return this._apiService(param, m)?.pipe(tap((res: ResponseObj<GridResponse>) => {
        const noRowData = this._ws.libraryService.checkGridEmptyFirstResult(res);
        //TODO: RT when backend is fixed not returning empty row
        if(noRowData){
          res.content.results?.splice(0, 1);
        }

        this.container.res = res;
        const _remapFields = res.content?.fields?.map(_f => ({..._f, required: _f.required || (this.container?.requiredFields || []).includes(_f.field) } ));
        this.container.gridFields = _remapFields;
        this.container.permission = res.content?.permission;
        this.cc.isLoading = false;
        //this.triggerChangeDetection();
        }));
      }
    }
  }

  public _initExtGridDefn(containerService: ContainerService, _activatedRoute?: ActivatedRoute){
    this._ws.containerService.setContainerConfig(this.container, false, (_p) => {this._searchCallback(_p)});
    this.extGridDefn =  {
      cacheBlockSize: 100,
      ...containerService.getExtendedGridDefn(this.container, _activatedRoute, (_p) => {this._searchCallback(_p)})
    };
  }

  /* Methods for Virtual List View of Data */

  public fetchData(nextUrl?, params?:any, isSearch?: boolean, isFirst?: boolean){
    if(isSearch){
      //TODO
      this.params = params;
    } else if(isFirst){
      this.params = {limit:50, sort:[{colId: (this.colIdToSort || 'id'), sort: 'asc'}], ...this.params, ...params};
    }

    if(this.api$){
      this.cc.subs.sink = this.api$?.(this.params, 'post', nextUrl).subscribe({
      //this.component.subs.sink = this.api$(this.params, 'post', nextUrl).subscribe({
        next: (res) => {
          this.list = []
          this.container.gridFields = res.content?.fields;
          this.container.permission = res.content?.permission;

          let noRowData = this._ws.libraryService.checkGridEmptyFirstResult(res);
          if(noRowData){
            res.content.results.splice(0, 1);
          }

          this.hasData = !noRowData;
          this.list = res.content;
          this.container.res = res;

          if(isSearch){
            this.virtualList = res.content.results;

          }else{
            this.virtualList = this.virtualList.concat(res.content.results);
          }

          const _cols = (this.container.virtualListCols?.cols?.length > 0) ? this.container?.virtualListCols.cols : res.content?.fields?.map( _f => ({field: _f.field, header: "name", colId: _f.field}))
          /* console.log({_cols}); */
          const _visibleCols = this.container?.virtualListCols?.visibleCols;
          if(_visibleCols?.length > 0){
            this.cols = _cols.filter(_c => _visibleCols.includes(_c.colId) );
          } else{
            this.cols = _cols
          }

          //this.hasData        = res.content.results.length > 0 && res.content.results[0].hasOwnProperty('id');
          this.cc.data = res.content.results;
          this.cc.permission = res.content.permission;
        },
        complete: () => {
          this.cc.isLoading = false;
          this.cc.itemLoading = false;
          this.triggerChangeDetection();
        },
        error: (err) => {
          this.cc.isLoading = false;
          this.triggerChangeDetection();
        }
      })
    } else{
      this.cc.isLoading = false;
    }
  }

  public lazyLoadData(event: any) : void{
      this.triggerChangeDetection();

      const scrollGap = this.virtualList.length - 5;
      if(this.cc && event.last >= scrollGap && this.list != null && this.list?.page?.next != null && !this.cc.itemLoading){
        this.cc.itemLoading = true
        this.fetchData(this.list.page.next);

        event.forceUpdate();
      }
  }

  /* Methods to Initialize Containers & Component */

  public initContainer(container?: any, showToggleList = true, noContainerHeight=false){
    const page_title = (container?.title != null) ? container?.title : "Eagna";
    this._ws.libraryService.pageTitle(page_title);

    const _toggleListMenu = {
      label: (Core.Localize(this.viewtype) || this.viewtype),
      icon: 'pi pi-arrow-right-arrow-left',
      command: () => {
        this.viewtype = this.viewtype == "grid" ? "list" : "grid";
        this.container.viewtype = this.viewtype;
        _toggleListMenu.label = (Core.Localize(this.viewtype) || this.viewtype)
        if(this.cc){
          this.cc.isLoading = true;
        }
        this._toggleView(this.viewtype);
      },
    };

    this.container = {
      gridParams      : this.gridParams,
      config : {
        hasHeader     : true,
        header        : (container?.containerConfig?.header ||  Core.Localize('header_list', {header: container?.title})),
        noContainerHeight: (noContainerHeight === true),
        subheader     : null,
        containerType : "onecolumn",
        hasSearch     : true,
        items         : [...(showToggleList ? [_toggleListMenu] : [])],
        onSearch      : (param?, event?) => {
            this.cc.itemLoading = true;
            if(this.viewtype == 'list'){
              this.fetchData(null, {query: param, limit:50, sort:[{colId: (this.colIdToSort || 'id'), sort: 'asc'}] }, true); //RT: TODO
            } else if(this.grid){
              this.grid.searchQuery = {value: param};
            }
          },
        },
      statusField     : (<IContainerWrapper>container)?.statusField,
      title           : ((<IContainerWrapper>container)?.title || ''),
      apiService      : this._apiService,
      ...(!container?.addCallback ? {addCallback: (p) => {
        this.grid?.refresh();
      }} : {}),
      formProperties  : (<IContainerWrapper>container)?.formProperties,
      /* formStructure  : (<IContainerWrapper>container)?.formStructure, */
      /* formChanged: (p) => (<IContainerWrapper>container)?.formChanged?.(p), */
      detailComponent : (<IContainerWrapper>container)?.detailComponent,
      //override predefined container config
      /* ...container */
      listFilterCallback: (p) => {
        this.getData();
      },
      ...(!container?.deleteCallback ? {deleteCallback: (p) => {
        this.grid?.refresh();
      }} : {})
      /* ...(container.stateTabs ? {stateTabs: container.stateTabs} : {}) */
    }

    this._setContainerStateTabs(container, showToggleList, this);

    this.cc = this.container.config.cc;

    return this.container;
  }

  private _searchCallback(param){
    this.cc.itemLoading = true;
    if(this.viewtype == 'list'){
      this.fetchData(null, {query: param, limit:50, sort:[{colId: (this.colIdToSort || 'id'), sort: 'asc'}] }, true); //RT: TODO
    } else if(this.grid){
      this.grid.searchQuery = {value: param};
    }
  }

  private _setContainerStateTabs(container, showToggleList, _this ){
    const _toggleListMenu = {
      label: (Core.Localize(this.viewtype) || this.viewtype),
      icon: 'pi pi-arrow-right-arrow-left',
      command(){
        _this.viewtype = _this.viewtype == "grid" ? "list" : "grid";
        _this.container.viewtype = _this.viewtype;
        _toggleListMenu.label = (Core.Localize(_this.viewtype) || _this.viewtype)
        if(_this.cc){
          _this.cc.isLoading = true;
        }
        _this._toggleView(_this.viewtype);
      },
    };

    if(container?.stateTabs && container.stateTabs != null || undefined){
      container.stateTabs.forEach((e: StateTabs) => {
        e['hasSearch'] = true,
        e['items'] =  [...(showToggleList ? [_toggleListMenu] : [])];

        e.onSearch = (param?, event?) => {
          this._searchCallback(param);
        };

        if(!e.hasOwnProperty('onClick')){
          e.onClick = (item?: any, parentIndex?, event?) => {
            this._apiService  = e.api$;
            this.api$         = e.api$;
            if(this.viewtype == "grid" && this.grid && this.grid != undefined){
              this.container.title = e.label;
              this.reloaded = false;
              this.gridId = e.gridId
              this.grid.gridId = e.gridId;
              this.grid.searchQuery = {value : undefined};
              this.wrapContainer.searchString = null;
              this.wrapContainer.showSearch = false;

              /* if(container.tabClickCallback){
                container = container.tabClickCallback(container);
              } */
              this.container.isReadonly = e?.isReadonly === true;

              if(e.hasOwnProperty('defaultColumns') && e.defaultColumns != null){
                this.container.defaultColumns = e.defaultColumns;
              }else{
                this.container.defaultColumns = null;
              }

              if(this.grid){
                this.grid.isReadonly = e?.isReadonly === true;

                if(e.hasOwnProperty('defaultColumns') && e.defaultColumns != null){
                  this.grid.defaultColumns = e.defaultColumns;
                }else{
                  this.grid.defaultColumns = null;
                }
              }

              this.reInitApi();

              setTimeout(() => {
                this.reloaded  = true;

                this.triggerChangeDetection();
              }/* , 10 */);
            }else if(this.viewtype == "list") {
              this.wrapContainer.searchString = null;
              this.wrapContainer.showSearch = false;
              this.getData();

              /* if(container.tabClickCallback){
                container = container.tabClickCallback(container);
              } */

              this.triggerChangeDetection();
            }

            /* Setting Form Structure */
            if(e.hasOwnProperty('formStructure') && e.formStructure != null){
              this.container.formStructure = e.formStructure;
            }else{
              this.container.formStructure = null;
            }

            /* Setting Form Properties */
            if(e.hasOwnProperty('formProperties') && e.formProperties != null){
              this.container.formProperties = e.formProperties;
            }else{
              this.container.formProperties = null;
            }
          }

        }



      })
    }
    this.container = {...this.container, ...container}
  }

  private _toggleView(viewtype){
    if(viewtype == "list"){
      this.getData();
    } else{
      //this._ws.containerService.filterStatus(this.container)
      this._ws.containerService.isFiltering = true;
    }
  }

  public reInitApi(){
    if(this._apiService != null)
    {

      this.container.apiService   = this._apiService;
      this.api$                   = this._apiService;
      this._setApiCallParams();
      this._initExtGridDefn(this._ws.containerService, this._activatedRoute);
      this.triggerChangeDetection();
    }
  }

  public initComponent(){
    this.cc = {
      header        : {show: true, name: null},
      subHeader     : {show: true, name: null},
      data          : this.data,
      currentType   : "component",
      subs          : new SubSink(),
      isLoading     : true,
      itemLoading   : true,
      permission    : null
    }
    return this.cc;
  }

  public imageErr(event){
    this._ws.libraryService.noImageUrl(event);
  }

  public getData(){
    this._ws.containerService.setContainerConfigForList(this.container);
    this.virtualList = [];
    this.fetchData(null, {...this.params, ...this.container.params}, null, true);
  }

  public manageData(param, method){
    let return_val : any = null;
    this.cc.isLoading = true;

    this.cc.subs.sink = this.api$(param, method, null).subscribe({
        next: (res) => {
          return_val = (res)?res.content.results[0] : [];
          this.cc.data = return_val;
          this.cc.permission = (res)?res.content.permission:  this.cc.permission;
          this.hasData = res.content.results.length > 0 && return_val.hasOwnProperty('id');
        },
        complete: () => {
          if(this.viewtype == "list"){
            this._updateVirtualList(method, param, return_val);

          }
          this.cc.isLoading = false;
          this.cc.itemLoading = false;
          this.triggerChangeDetection();
        },
        error: (err) => {

        }
    })
  }

  private _updateVirtualList(method, param, data){
    switch(method){
      case "put":
        this.virtualList.unshift(data);
        this.triggerChangeDetection();
        break;

      case "delete":
        this._ws.libraryService.deleteObjectFromArray(this.virtualList, param.id);
        this.triggerChangeDetection();
        break;
    }
  }

  public destroy(){
    if(this.viewtype == "grid"){
      this.grid?.gridParams?.api.destroy();
    }

    this.cc.subs.unsubscribe();
  }

}

