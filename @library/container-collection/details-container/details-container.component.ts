import { Component, ViewEncapsulation, EventEmitter, Input, OnDestroy, OnInit, Optional, Output, ViewChild, ChangeDetectionStrategy, ChangeDetectorRef, DoCheck } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Core, RouteObserverService, UserModel } from '@eagna-io/core';
import { ComponentConfig, DetailsContainerConfig, TrackingConfig } from '@library/library.interface';
import { CommentsComponent } from '@library/tracking/comments/comments.component';
import { LogsComponent } from '@library/tracking/logs/logs.component';
import { UpdatesComponent } from '@library/tracking/updates/updates.component';
import { WrapperService } from '@library/service/wrapper.service';
import { MenuItem } from 'primeng/api';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { deepEqual } from 'ts-deep-equal'

@Component({
  selector: 'eg-details-container',
  templateUrl: './details-container.component.html',
  styleUrls: ['./details-container.component.scss']
})
export class DetailsContainerComponent extends RouteObserverService implements OnInit, OnDestroy, DoCheck {
  @Input('currentType') currentType     : "dialog" | "component" | "route" = null;
  @Input('config')      config          : DetailsContainerConfig = null;
  @Output('configChange') configChange      : any = new EventEmitter();
  @Input('topic')       topic           : any = null;

  @Input('data')        data            : any = null;
  @Output('dataChange') dataChange      : any = new EventEmitter();

  @Input('isLoading')        isLoading            : boolean = true;
  @Output('isLoadingChange') isLoadingChange      : any = new EventEmitter();
  @Input('closeIcon')        closeIcon            : boolean = true;

  @ViewChild("egUpdatesComponent")  egUpdatesComponent  : UpdatesComponent;
  @ViewChild("egCommentsComponent") egCommentsComponent : CommentsComponent;
  @ViewChild("egLogsComponent")     egLogsComponent     : LogsComponent;

  @Input()
  public selectedIndex  : number = null;

  @Output()
  public selectedIndexChange = new EventEmitter<number>();

  public curruser       : UserModel = JSON.parse(this._wr.libraryService.getLocalStorage('user'));
  public cc             : ComponentConfig = null;
  public navbar         : boolean = true;
  public divItems       : any = null;
  public showSubmenu    : boolean = true;
  public tabActiveItem  : MenuItem;
  public actionItems    : any = [];
  private _detailsAction: any = [];
  public hasDetails     : boolean = true;
  public width          : any     = {content:"75%", details:"25%"};
  public loading        : boolean = false;
  public items          : MenuItem[];
  public animateClass   : string = "fadeinright";
  public detailbarExpd  : boolean;
  public navbarExpd     : boolean;

  

  public taAutoresize   : boolean = true;
  //public details        : DetailsContainerConfig;
  public sidebar        : any;

  public actionMenu     : any = [
                                  {label:"Action", icon: "fa-solid fa-comments", value:"action"},
                                  {label:"Updates", icon: "fa-solid fa-comments", value:"updates"},
                                  {label:"Comments", icon: "fa-solid fa-comments", value:"comments"},
                                  {label:"Logs", icon: "fa-solid fa-sitemap",value: "logs"}
                                ];

  public currActionMenu : {value: any, api:any, params:any; label: any};
  public trackingConfig : TrackingConfig = null;

  @ViewChild('commentsElement') commentsElement   : any;

  public comments : any = null;

  public commentsList : any = null;
  public updatesList  : any = null;
  public logsList  : any = null;

  private _isDestroyed  : boolean = false;
  private _afterFirstLoad: boolean;
  private _configActionItems: any;
  private _topicActionItem: any[] = [];

  constructor(private _wr: WrapperService,
              private _router: Router,
              @Optional() private _route         : ActivatedRoute,
              @Optional() public dialogRef       : DynamicDialogRef,
              @Optional() public dialogConfig    : DynamicDialogConfig) {
                super(_route, _router);

      this.currentType = (this.currentType == null) ? this._wr.libraryService.getRenderedType(this.dialogConfig, this.data) : this.currentType;
      this.navbar = this.config?.showNavbar == true;
     }


  onRouteReady(){
    if(!this._isDestroyed){
      this._setSidebarItemsActive();
    }
    window.onhashchange = function() {
      this._wr.helperService.gotoPage({pageName:['..'], extraParams:{relativeTo:this._route}});
    }
    if(this.config){
      this._wr.libraryService.pageTitle(this.config.header);
    }
  }

  onRouteReloaded(): void {}

  trackByFn(index, item) {
    return item.id; // unique id corresponding to the item
  }

  public toggleSidenav(){
    this.navbar = !this.navbar;
  }

  onClose($event?: MouseEvent) {
    if(this.currentType == "dialog"){
      this.dialogRef.close();
    }else if(this.currentType == "route"){
      this._wr.helperService.gotoPage({pageName:['..'], extraParams:{relativeTo:this._route, ...(this.data?.isChanged ? {queryParams: {onRefresh: true}} : {}) }}); //, state: {sample: 'test'}
      /* RT console.log({actRoute: this._route});
      let _parentPath = [];
      this._route.snapshot.parent.pathFromRoot.forEach((a) => { _parentPath = _parentPath.concat(a.url.map(_u => _u.path)) });
      console.log({_parentPath: _parentPath.join('/')});
      this._router.navigate( [_parentPath.join('/')], {...(this.data?.isChanged ? {queryParams: {onRefresh: true}} : {})}); */
    }
  }

  private _formatParams(){
    let paramObj = {};

    if(this.config.params != null && this.config.params.length > 0){
      this.config.params.forEach(el => {
        paramObj[el] = (el == this.topic) ? this.data?.id : getId(this.data?.[el])
      });
      return paramObj
    }else {
      return {[this.topic]: this.data?.id}
    }

    function getId(p){
      if (typeof(p) == "object"){
        return p['id'];
      }else{
        return p;
      }

    }
  }

  public toggleAction(param){
    this.currActionMenu = param;
    let sort : any = null;

    let params : any = {...this._formatParams()};

    switch(param.value){
      case "updates":
        sort = {sort: [{sort: "desc", colId: "date_updated"}]};
        this.trackingConfig = {
          display : "list",
          params : {...params, ...sort},
          api$ : this.config.updateApi$
        }
        this._formatParams();
        break;

      case "comments":
        sort = {sort: [{sort: "desc", colId: (['project', 'task'].includes(this.topic) ? "date_commented": "date")}]};
        this.trackingConfig = {
          display : "list",
          params : {...params, ...sort},
          api$ : this.config.commentsApi$
        }

        break;

      case "logs":
        sort = {sort: [{sort: "desc", colId: "date_logged"}]};
        this.trackingConfig = {
          display : "list",
          params : {...params, ...sort},
          api$ : this.config.logsApi$
        }
        break;
    }
  }

  public showElement(param, index, isFirst = false){
    this.showSubmenu    = false;
    this.selectedIndex  = index;

    this.selectedIndexChange.emit(this.selectedIndex);

    this._topicActionItem = [];

    if(param){
      this.divItems = param;

      if(param.hasOwnProperty('items') && param.items.length > 0){
        this._topicActionItem = param.items;
      }
      this.actionItems = this._detailsAction.concat(this._topicActionItem)

      this.divItems.header = param.label;
    }

    if(isFirst || !this.tabActiveItem /* && this.config.containerType == "twocolumn" */){
      if(param?.items?.[0]) {
        this.tabActiveItem = param.items[0];
      }
    }

    /* if(param.value == 'updates'){
      console.log(this.topic, this.data);
    } */

    setTimeout(() => {
      this.showSubmenu = true;
    });

    if(param != undefined && param.onClick){
      param.onClick(param, index);
    }

    setTimeout(() => {
      this._afterFirstLoad = true;
    })
  }

  private _setSidebarItemsActive(){
    this._topicActionItem = [];
    let _selected;

    if(this.config){
      if(this.config.sidebar && this.config.sidebar.items?.[0]?.hasOwnProperty("routerLink")){
        this.selectedIndex = null;
        this.selectedIndexChange.emit(this.selectedIndex);
      }else {
        /* this.selectedIndex = 0;
        this._renderOnInit(this.config.sidebar.items); */
        const param = this.config.sidebar?.items;
        if(param != undefined){
          const isSelected = param.findIndex(f => f.selected);
          if(isSelected >= 0){
            this.selectedIndex = isSelected;
            this.selectedIndexChange.emit(this.selectedIndex);
            _selected = param[isSelected];
            /* param[isSelected].onClick(param[isSelected], isSelected); */
            _selected?.onClick?.(_selected, isSelected);

            //console.log({param});
          }else{
            _selected = param[0];
            this.selectedIndex = 0;
            //param[0].onClick(param[0], 0); TODO: RT commented
            this.selectedIndexChange.emit(this.selectedIndex);
          }

          if(_selected?.items?.length > 0){
            this._topicActionItem = _selected.items;
          }

          this.actionItems = this._detailsAction.concat(this._topicActionItem);
        }

      }
    }
  }

  ngOnInit(): void {

    this.currActionMenu = {
      api     :null,
      params  :{limit:100},
      value   :"action",
      label   : "action"
    };

    this._wr.libraryService.pageTitle(this.config.header);

    if(!this.config.hasOwnProperty('showDetailbar') && this.config.showDetailbar == null )
    {
      this.config.showDetailbar = true;
    }

    if(this.config.hasOwnProperty('actionItems') && this.config.actionItems.length > 0){
      this._detailsAction = this.config.actionItems;
      this.actionItems    = this.actionItems.concat(this._detailsAction)
    }
    this.navbar     = (this.config.navbarExpanded == undefined)?this.navbar:this.config.navbarExpanded;
    this.hasDetails = (this.config.detailBarExpanded == undefined)?this.navbar:this.config.detailBarExpanded;

    this._setSidebarItemsActive();

    this.actionMenu = [
      {label: Core.Localize('action'), icon: "fa-solid fa-comments", value:"action", isVisible: true},
      {label: Core.Localize('update', {count: 2}), icon: "fa-solid fa-comments", value:"updates", isVisible: this.config?.hasUpdates},
      {label: Core.Localize('comment', {count: 2}), icon: "fa-solid fa-comments", value:"comments", isVisible: this.config?.hasComments},
      {label: Core.Localize('log', {count: 2}), icon: "fa-solid fa-sitemap",value: "logs", isVisible: this.config?.hasLogs}
    ];
  }

  public toggle(){
    this.hasDetails = !this.hasDetails
  }

  public handleResize(param){
    if(this.commentsElement != null || this.commentsElement != undefined) {
      let textareaHeight = this.commentsElement.nativeElement.clientHeight;

      this.taAutoresize = (textareaHeight >= 141) ? false : true;
      if(!this.taAutoresize){
        this.commentsElement.nativeElement.style.overflowY = "scroll"
      }
    }

  }

  public willRemove(method, param){
    let temp = this._formatParams();
    let req = {
      user: this.curruser.id,
      name: param,
      ...temp
    }

    this.trackingConfig.api$(req, 'put').subscribe(res =>{

      if(this.currActionMenu.value == "updates"){
        this.egUpdatesComponent.virtualList.unshift(res.content.results[0])
        this.egUpdatesComponent.vs.forceUpdate()
      }
    })
  }

  public update(param){
    let req = {
      user: this.curruser.id,
      name: param,
      ...this._formatParams()
    }

    switch(this.currActionMenu.value){
      case "updates":
        this.egUpdatesComponent.update(req, "put");
        break;

      case "comments":
        this.egCommentsComponent.update(req, "put");
        break;

      case "logs":
        //this.egCommentsComponent.update(param, "put");
        break;
    }
  }

  public ngDoCheck(): void {
    if(this._afterFirstLoad && !deepEqual(this.config.actionItems, this._configActionItems)){
      this._configActionItems = this.config.actionItems.slice();
      this.actionItems = this.config.actionItems.concat(this._topicActionItem);
    }
    /* console.log({actionItems: this.actionItems}); */
  }

  override ngOnDestroy(): void {
    this._isDestroyed = true;
  }

}
