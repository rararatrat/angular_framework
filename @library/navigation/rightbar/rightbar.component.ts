import { Component, Input, AfterViewInit, ViewChild, OnInit, ElementRef, OnDestroy, Optional } from '@angular/core';
import { Router } from '@angular/router';
import { ComponentConfig} from '@library/library.interface';
import { Sidebar } from 'primeng/sidebar';
import { RightbarService } from './rightbar.service';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { VirtualScroller } from 'primeng/virtualscroller';
import { SubSink } from 'subsink2';
import { WrapperService } from '@library/service/wrapper.service';
import { FormControl } from '@angular/forms';
import { CrmService } from 'src/app/crm/crm.service';
import { DatePipe } from '@angular/common';
import { Core } from '@eagna-io/core';
import { SettingsService } from 'src/app/settings/settings.service';
const MY_ID = 2;
@Component({
  selector: 'lib-rightbar',
  templateUrl: './rightbar.component.html',
  styleUrls: ['./rightbar.component.scss']
})
export class RightbarComponent implements OnInit, AfterViewInit, OnDestroy {
  constructor(private _rb: RightbarService,
              private _wr: WrapperService,
              private _router: Router,
              private _crm: CrmService,
              public dialogService: DialogService,
              private _datePipe: DatePipe,
              /* private _settings: SettingsService, */
              @Optional() private _dialogRef: DynamicDialogRef,) { }

  @ViewChild('sidenavInfo') sidenavInfo     : Sidebar;
  @ViewChild("sideTitle") public sideTitle  : ElementRef;
  @ViewChild('vs') vs                       : VirtualScroller;
  @Input("rbType")  rbType              : "notification" | "help" | "chat" | "contacts";
  @Input("rbClass") rbClass             : any = "p-sidebar-sm";
  @Input("rbPosition") rbPosition       : any = "right";
  @Input("rbModal") rbModal             : boolean = true;
  @Input("rbfullScreen") rbfullScreen   : boolean = false;
  @Input("rbBlockScroll") rbBlockScroll : boolean = false;

  public isVisible  : boolean = false;
  public cc         : ComponentConfig = null;

  public data       : any = [];
  public list       : any = null;
  public virtualList: any = [];
  public search     : FormControl = new FormControl();

  public itemLoading  : boolean = false;
  public isDisabled   : boolean = false;
  public activeIndex  : number = null;
  public viewDetail   : boolean = false;
  public selectedData : any = [];
  public selectedStructure : any = [];
  public loadingDialog : boolean = true;

  public contactMenu  : any =  [
    {label: Core.Localize("contact"), icon: "fa-solid fa-users", value:"contact"},
    {label: Core.Localize("org"), icon: "fa-solid fa-sitemap",value: "org"}
  ]

  public currContactMenu : {value: any, api:any, params:any; label: any};

  /* getCountry(arg0: any): any {
    if(this._countryData){
      
    }

    return arg0;
  }
 */
  ngOnInit(): void {
    this._initComponent();
  }
  trackByFn(index, item) {
    return item.id; // unique id corresponding to the item
 }

  private _initComponent(){
    this.cc = {
      header        : {show: true, name: "Contact User List"},
      subHeader     : {show: true, name: "List of Contacts"},
      data          : this.data,
      currentType   : "component",
      subs          : new SubSink(),
      isLoading     : true,
      permission    : {
                        create  : true,
                        read    : true,
                        delete  : true,
                        update  : true,
                        role    : "user"
                      }
    }

    /* this.cc.subs.sink = this._settings.getCountryCode().subscribe(res => {
      console.log({res});
      this._countryData = res;
    }); */
  }

  private _fetchData(context:any, nextUrl?, params?:any, isSearch?:boolean){
    params = (params == null)? this.currContactMenu?.params : params;

    this.cc.subs.sink = this._crm[context]?.(params, 'post', nextUrl).subscribe({
      next: (res) => {
        this.list = []
        this.list = res.content;
        if(isSearch){
          this.virtualList = res.content.results;
        }else{
          this.virtualList = this.virtualList.concat(res.content.results);
        }
        this.cc.data = res.content.results;
        this.cc.permission = res.content.permission;
      },
      complete: () => {
        this.cc.isLoading = false;
        this.itemLoading = false;
      },
      error: (err) => {}
    })
  }

  public lazyLoadData(event: any /* LazyLoadEvent */) : void{
    const interval = this.virtualList.length  / this.vs.itemSize;
    const requestPage = event.first / event.rows;
    const nextPage = requestPage > 0 ? requestPage + 1 : 0;

    if (nextPage < requestPage) {
      return;
    }
    if(event.last >= this.virtualList.length - 10 && this.list != null && this.list?.page?.next != null && !this.itemLoading){
      this.itemLoading = true
      this._fetchData(this.currContactMenu.api, this.list.page.next);
      event.forceUpdate();
    }
  }

  showDetails(cmpt, data, isNavigate=false){
    //let showCmpt = (cmpt == "org")? OrganisationDetail2Component : PersonDetail2Component;
    this.loadingDialog = true;
    let showCmpt = (cmpt == "org")? null:  null;
    switch(cmpt){
      case "org":
        this.selectedStructure = this._rb.getOrgFormStructure();
        this.selectedData = data;

        if(isNavigate){
          this.viewDetail = false;
          this.isVisible = false;
          this._router.navigate(['/crm/contacts/company', data.id]);
        }else{
          this.viewDetail = true;
          this.loadingDialog = false;
        }

        break;

      case "contact":
        this.selectedStructure = this._rb.getContactFormStructure();
        this.selectedData = data;

        if(isNavigate){
          this.viewDetail = false;
          this.isVisible = false;
          this._router.navigate(['/crm/contacts/people', data.id]);
        }else{
          this.viewDetail = true;
          this.loadingDialog = false;
        }

        break;
    }
  }

  goTo(data){

  }

  setRecord(data:any){
    switch(typeof data){
      case 'string':
        const phoneNumberPattern = /^\+(?:[0-9] ?){6,14}[0-9]$/;
        if (new Date(data).toString() !== 'Invalid Date') {
          return this._datePipe.transform(new Date(data), 'mediumDate');
        } else if(data.includes('@')) {
          return `<a href="mailto:${data}">${data}</a>`; // Return string as is
        } else if(data.includes('.com')) {
          return `<a href="${data}" target="_blank">${data}</a>`; // Return string as is
        }else if(phoneNumberPattern.test(data)) {
          return `<a href="tel:${data}" target="_blank">${data}</a>`; // Return string as is
        } else {
          return data;
        }
      case 'undefined':
        return '-';
      case 'object':
        if(data == null) {
          return '-'; // Return string as is
        } else{
          return data.name;
        }


    }

  }

  ngAfterViewInit(): void {
    this._rb.setSidenav(this.sidenavInfo);
    this.cc.isLoading = true;
    this.cc.subs.sink = this._rb.onApp().subscribe(message => {

        this.rbType       = message?.message;
        this.rbClass      = message?.data.rbClass;
        this.rbPosition   = message?.data.rbPosition;
        this.rbModal      = message?.data.rbModal;
        this.rbfullScreen = message?.data.rbfullScreen;
        this.isVisible    = message?.visible;

        this. _toggelSideNav(this.rbType);

    })
  }

  public imageErr(event){
    this._wr.libraryService.noImageUrl(event);
  }

  public toggleContact(param){
    this.list = [];
    this.virtualList = [];
    this.cc.isLoading = true;
    switch (param) {
      case "contact":

        this.currContactMenu = {
          api:"contactPeople",
          params:{limit:100,sort:[{colId: 'first_name', sort: 'asc'}]},
          value:param,
          label: Core.Localize("contact")
        };
        this._fetchData(this.currContactMenu.api, null, this.currContactMenu.params)

        break;
      case "org":
        this.currContactMenu = {
          api:"contactOrg",
          params:{limit:100,sort:[{colId: 'name', sort: 'asc'}]},
          value:param,
          label: Core.Localize("org")
        };
        this._fetchData(this.currContactMenu.api, null, this.currContactMenu.params)

        break;
    }
  }

  private _toggelSideNav(key){
    switch (key) {
      case "contacts":
        this.toggleContact("contact")

          this.search.valueChanges.subscribe(res => {

            if(res != "" || undefined || null){
              this.itemLoading = true;
              setTimeout(() => {
                const params = {query: res, ...this.currContactMenu.params };
                this._fetchData(this.currContactMenu.api, null, params, true);
              }, 1000);
            }else {
              this.itemLoading = true;
              this.virtualList = [];
              this._fetchData(this.currContactMenu.api);
            }
          })
        break;
      case "notification":
        this.cc.isLoading = false;
        /* this.toggleContact("contact") */

        /* this.search.valueChanges.subscribe(res => {

          if(res != "" || undefined || null){
            this.itemLoading = true;
            setTimeout(() => {
              const params = {query: res, ...this.currContactMenu.params };
              this._fetchData(this.currContactMenu.api, null, params, true);
            }, 1000);
          }else {
            this.itemLoading = true;
            this.virtualList = [];
            this._fetchData(this.currContactMenu.api);
          }
        }) */
        break;

      default:
        break;
    }
  }

  applyClose(){
    this._rb.newToggle(null);
  }

  ngOnDestroy() {
    this.isDisabled = true;
    this.cc.subs?.unsubscribe();
  }
}
