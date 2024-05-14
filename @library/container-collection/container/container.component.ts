import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, QueryList, SimpleChanges, ViewChild, ViewChildren } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RouteObserverService } from '@eagna-io/core';
import { ContainerConfig } from '@library/library.interface';
import { deepEqual } from 'ts-deep-equal'
import { MenuItem } from 'primeng/api';
import { debounceTime, distinctUntilChanged, filter, fromEvent, Subscription, tap } from 'rxjs';

@Component({
  selector    : 'eg-container',
  templateUrl : './container.component.html',
  styleUrls   : ['./container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContainerComponent extends RouteObserverService implements OnInit, OnChanges, OnDestroy {
  @Input('config') config               : ContainerConfig;
  @Output('configChange') configChange  : any = new EventEmitter();
  @ViewChild('menu') menu               : any;

  @ViewChild("inputSearch",{static:false}) inputSearch: ElementRef | undefined;
  @ViewChildren("inputSearch") inputSearches          : QueryList<ElementRef> | undefined;

  public searchString         : string;
  public menuItems            : MenuItem;
  public divItems             : any = null;
  public selectedIndex        : number = 0;
  public tabActiveItem        : MenuItem;
  public navbar               : boolean = true;
  public showSearch           : boolean = false;
  public showSubmenu          : boolean = true;
  private _firstTabLoaded     : boolean = false;
  private _subscription       : Subscription = new Subscription();
  public sidemenuItems : any;
  public topmenuItems : any;

  constructor(private _router: Router, private _route : ActivatedRoute, private _cd: ChangeDetectorRef) {
    super(_route, _router);
  }

  public triggerChangeDetection() {
    this._cd.markForCheck(); // Marks the component and its ancestors as dirty
    this._cd.detectChanges(); // Triggers change detection for the component and its descendants
  }

  ngOnInit(): void {
    this.tabActiveItem = this.config?.items?.[0];
    this.showElement(this.tabActiveItem, 0, true)

    if(this.config?.containerType == "twocolumn"){
      this.sidemenuItems = this.config?.items;
      this.topmenuItems =  this.tabActiveItem.items;
    }
    if(this.config?.containerType == "onecolumn"){
      this.topmenuItems = this.config?.items;
    }
    this.snapshotLoaded = true;
    //this.triggerChangeDetection();
  }

  onRouteReady(event, snapshot, root, params): void {
    /* this.triggerChangeDetection(); */
  }

  onRouteReloaded(event, snapshot, root, params): void {
    /* this.triggerChangeDetection(); */
  }

  trackByFn(index, item) {
    return item.id; // unique id corresponding to the item
  }

  public toggleSidenav(){
    this.navbar = !this.navbar;
  }

  public menuFunctions(event, data){
    if(data.hasOwnProperty("items")){
      this.menu.toggle(event)
      this.menuItems = data.items;
    }
  }

  public showElement(param, index, isFirst = false){
    this.showSubmenu    = false;
    this.selectedIndex  = index;

    if(param){
      this.divItems             = param;
      this.divItems.menuType    = this.config?.menuType;
      this.divItems.menuDisplay = this.config?.menuDisplay;
      this.divItems.hasHeader   = this.config?.hasHeader;
      this.divItems.header      = param.label;
      this.divItems.hasSearch   = this.config?.hasHeader;

    }

    //if(isFirst || !this.tabActiveItem ){/* && this.config?.containerType == "twocolumn" */
    //  if(param?.items?.[0]) {
    //    this.tabActiveItem = param.items[0];
    //  }
    //}

    setTimeout(() => {
      this.showSubmenu = true;

      setTimeout(() => {
        this._initSearch();
      })
    });

    if(param != undefined && param.onClick){

      param.onClick(param, index);
    }
  }

  private _initSearch(){
    let _inputSearch;

    if(this.inputSearch){
      _inputSearch = this.inputSearch;
    } else if(this.inputSearches){
      _inputSearch = this.inputSearches.first;
    }

    if (_inputSearch) {
      this._subscription.add(
        fromEvent(_inputSearch.nativeElement, "keyup")
        .pipe(
            filter(Boolean),
            debounceTime(1000),
            //distinctUntilChanged((p: KeyboardEvent, c: KeyboardEvent) => { return true; }),
            tap(() => {
              this.config?.onSearch?.(_inputSearch.nativeElement.value.trim())
            })
        ).subscribe());
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    for (const key in changes) {
      if (Object.prototype.hasOwnProperty.call(changes, key)) {
        const element = changes[key];
        if(!element.firstChange){
          //if(!equal.deepEqual(element.currentValue, element.previousValue)){
          if((!deepEqual(element.currentValue?.containerType, element.previousValue?.containerType) || !deepEqual(element.currentValue?.items, element.previousValue?.items))){
            if(key == 'config'){ /*  && this.config?.menuType == 'tab' */
              if(this.menuItems == undefined && element.currentValue != undefined &&  this.config?.containerType == "twocolumn"){
                  if(!this._firstTabLoaded){
                    this.showElement(this.config?.items?.[0], 0, true);
                    this._firstTabLoaded = true;
                  }
              }
              if((this.config?.items || []).length > 0 && this.config?.containerType == "twocolumn"){
                this.sidemenuItems = this.config?.items;
              }
            }
          }
        } else {
          if(this.config?.items && (this.config?.menuType != "menubar" || this.config?.containerType == "twocolumn")){
            ////console.log("showElement 2")
            this.showElement(this.config?.items, 0, true)
          }
        }
      }
    }
  }

  override ngOnDestroy(): void {
    this._subscription.unsubscribe();
  }
}
